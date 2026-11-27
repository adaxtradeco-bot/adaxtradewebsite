# Spec — Custom HTML Section (auto-detected editable fields)

Status: v2 (after independent review) · Date: 2026-11-26

## 1. Goal

An admin pastes or uploads HTML (one section or a whole AI-generated page). The builder:

1. Separates HTML / CSS / JS.
2. Detects the editable parts (texts, links, images, background images, videos, embeds, icons, repeated items, colours).
3. Stores the code as a **template** and the editable parts as **fields + values**.
4. Generates a settings form from the fields so a non-technical editor can change content without touching HTML.

### Decisions (confirmed by owner)

| # | Decision |
|---|---|
| D1 | Each placed section stores **its own copy** of the template. A library of saved templates lets the same section be reused on other pages; once placed, copies change **independently**. |
| D2 | JS is fully supported (trusted code, admin-authored). |
| D3 | Only **admins** may create or change template code (HTML/CSS/JS/field definitions). Editors may only change values. Enforced on the server. |
| D4 | All three phases are built, one after another. |

### Non-goals

- Runtime JS frameworks from CDN (React/Vue/Alpine), `type="module"` scripts — not supported (warning at import).
- Text produced by JS at runtime is not detected.
- Visual drag-and-drop editing of the HTML layout itself.
- Moving the admin token from `localStorage` to an httpOnly cookie — recommended separate project (see §8.4).

## 2. Two layers

| Layer | Content | Who edits | Trust |
|---|---|---|---|
| Template | tokenized HTML, CSS (raw + scoped), JS, field definitions | admin (`canEditCode`) | trusted code |
| Values | text, URLs, media, colours, repeater items | admin + editor | **untrusted** — escaped/sanitized at render |

## 3. Data model

New section type `custom-html` inside the existing `Page.builderData` JSON (no DB migration).

```ts
// src/lib/custom-html/types.ts
export const CUSTOM_HTML_TYPE = 'custom-html';

export type FieldType =
  | 'text' | 'textarea' | 'richtext'
  | 'link'     // { text, href, target }
  | 'image'    // { src, alt }
  | 'bgImage'  // { src }
  | 'video'    // { src, poster }
  | 'embed'    // { src }
  | 'icon'     // { svg }
  | 'color'    // { value }        (phase 2)
  | 'repeater';// item[]            (phase 2)

export interface FieldDef {
  id: string;            // [a-zA-Z0-9_.-]+ ; "f12" or a data-edit key
  type: FieldType;
  label: string;
  group?: string;
  hidden?: boolean;
  default: FieldValue;
  children?: FieldDef[]; // repeater only
  min?: number; max?: number;
}

export type FieldValue =
  | string
  | { text?: string; href?: string; target?: '_self' | '_blank' }
  | { src?: string; alt?: string; poster?: string }
  | { svg?: string }
  | { value?: string }
  | Array<Record<string, FieldValue>>;

export interface CustomHtmlTemplate {
  html: string;              // tokenized HTML, contains data-cf markers (§5)
  css: string;               // raw author CSS — admin re-edit only, STRIPPED from public API responses
  cssScoped: string;         // scoped CSS (may contain bgImage/color tokens)
  js: string;                // compiled runtime-ready JS body (§7.3), incl. rewritten inline handlers
  jsSource: string;          // raw author JS — admin re-edit only, STRIPPED from public API responses
  externalScripts: string[];
  externalStylesheets: string[];
  tailwind?: { enabled: boolean; config?: Record<string, unknown> };
  dir?: 'auto' | 'ltr' | 'rtl'; // default 'ltr' (layout authored LTR); 'auto' = follow page language
  scope: string;             // 10-hex; root selector [data-chs="<scope>"]
}

export interface CustomHtmlData {
  schemaVersion: 1;
  name: string;
  libraryId?: string;
  template: CustomHtmlTemplate;
  fields: FieldDef[];
  values: Record<string, FieldValue>;
  runInBuilder?: boolean;    // default false
}
```

- **Template hash** (`hash.ts`): `sha256(canonicalJson({ template, fields }))`, canonical = key-sorted JSON, no whitespace. It is **never stored**; the server always recomputes it. Because `scope`, `tailwind`, `dir`, `css`, `jsSource` are inside `template`, every template key is covered.
- Re-edit reconstructs the source HTML by rendering `html` with field defaults (data-cf markers kept) — no separate `source.html`.
- Strict zod schema `CustomHtmlDataSchema` (`.strict()` at every level) is used by the guard; unknown keys are rejected.
- Limits: `html` ≤ 400 KB, `cssScoped` ≤ 400 KB, `css` ≤ 400 KB, `js`/`jsSource` ≤ 200 KB each, fields ≤ 600 (incl. children), repeater items ≤ 100, external URLs ≤ 10 each.
- Add `'custom-html'` to the type enum in [section-schemas.ts](../src/lib/page-builder/section-schemas.ts) and `CUSTOM: 'Custom HTML'` to `SECTION_CATEGORIES` in [section-registry.types.ts](../src/lib/page-builder/section-registry.types.ts).

## 4. Module layout

```
src/lib/custom-html/
  types.ts, schema.ts (zod), hash.ts (canonicalJson + sha256 [node:crypto / WebCrypto] + djb2 sync hash)
  escape.ts          // escapeText, escapeAttr, safeUrl, safeCssUrl, safeColor, safeEmbedUrl
  render.ts          // pure string renderer (template, fields, values, opts) -> { html, css }
  extract.ts         // document/fragment -> { html, css, js blocks, links, scripts, tailwind, warnings }   (DOMParser)
  detect.ts          // DOM -> FieldDef[] + data-cf markers                                                (DOMParser)
  tokenize.ts        // annotated DOM + fields -> tokenized html; cssScoped url()/vars -> tokens
  handlers.ts        // rewrite on*="…" attributes into data-chs-h + generated JS (§7.3)
  runtime.ts         // client executor with document/window shims and disposal
  css-scope.ts       // server: postcss + postcss-selector-parser (+ tailwind, phase 2)
  guard.ts           // server enforcement (§8)
  sync.ts            // mergeForLanguageSync (§9)
  public-strip.ts    // removes template.css / template.jsSource for public responses
  split-page.ts      // phase 3
src/components/builder-sections/CustomHtmlSection.tsx
src/components/admin/PageBuilder/custom-html/
  CustomHtmlPropertyPanel.tsx, FieldEditors.tsx, ImportWizard.tsx, MappingPreview.tsx, LibraryPicker.tsx (phase 2)
src/app/api/admin/custom-html/compile/route.ts           // admin; runtime = 'nodejs'
src/app/api/admin/custom-html/library/route.ts           // GET (auth) / POST (admin)
src/app/api/admin/custom-html/library/[id]/route.ts      // GET (auth) / PUT, DELETE (admin)
```

New direct dependencies: `postcss-selector-parser` (dependency), `jsdom` (devDependency). `next.config.js`: `experimental.serverComponentsExternalPackages: ['tailwindcss', 'postcss']`; `vercel.json`: `maxDuration: 30` for the compile route.

## 5. Tokenized template and rendering

Token form `{{cf:<path>}}`. Before tokenizing, literal `{{cf:` in the source becomes `{{cf:__lit}}`, rendered back as the literal text.

| Field type | Placement |
|---|---|
| text / textarea / richtext | element content: `<h1 data-cf="f1">{{cf:f1}}</h1>` |
| link | `<a href="{{cf:f2.href}}" data-cf="f2">{{cf:f2.text}}</a>`; `target`/`rel` emitted by the renderer from the value |
| image | `<img src="{{cf:f3.src}}" alt="{{cf:f3.alt}}" data-cf="f3">`; also `data-src`/`data-lazy-src` if present in source. `srcset`, `sizes` and `<picture><source>` siblings are kept only while the value equals the default |
| bgImage (inline style) | `style="…background-image:url('{{cf:f4.src}}')…"` |
| bgImage (CSS) / color | inside `cssScoped`: `url('{{cf:f5.src}}')`, `--primary:{{cf:f6.value}}` |
| video | `<video poster="{{cf:f7.poster}}" data-cf="f7"><source src="{{cf:f7.src}}"></video>`; `type` on `<source>` kept only while value equals default |
| embed | `<iframe src="{{cf:f8.src}}" data-cf="f8">` |
| icon | wrapper content `{{cf:f9.svg}}` |
| repeater | `<!--cf:rep:r1-->ITEM<!--/cf:rep:r1-->`, item tokens `{{cf:r1.$.title}}` |

### Render rules (`render.ts`)

- **Single pass**: one regex `replace` over the template; substituted values are never re-scanned.
- Lookup with `Object.hasOwn` only (`values['constructor']` must not resolve); fallback `field.default`.
- text → `escapeText`; textarea → `escapeText` + `\n`→`<br>`; richtext → `sanitizeRichText` ([src/lib/sanitize.ts](../src/lib/sanitize.ts)); icon → `sanitizeSvg`.
- Every attribute value → context function then `escapeAttr`.
- `href`/`src`/`poster`/`data-src` → `safeUrl` (allow `http:`, `https:`, `mailto:`, `tel:`, relative, `#…`; strips control chars/whitespace before the scheme check; otherwise `#` for href, empty for src).
- `target` → `_self` | `_blank` (adds `rel="noopener noreferrer"`).
- Inline-style bgImage → `safeCssUrl` (scheme rules + percent-encode `"'()\\`, whitespace, `<>`) then `escapeAttr`, always in single quotes.
- CSS-context values → `safeCssUrl` / `safeColor` (hex, rgb[a], hsl[a], named, `transparent`, `currentColor`; else default). CSS output passed through `safeStyleText`.
- embed → `safeEmbedUrl`: https; hosts `youtube.com`, `www.youtube.com`, `youtube-nocookie.com`, `www.youtube-nocookie.com`, `player.vimeo.com`, `www.google.com` (path `/maps`).
- Repeater: item template per item; empty array → nothing.
- Unknown token → empty. Never throws (catch → render defaults + `console.warn`).
- `opts.builder === false` strips `data-cf` attributes from the output (smaller public DOM).
- Attribute tokens are default-deny: only `alt`, `title`, `placeholder`, `aria-*`, `href`, `src`, `poster`, `data-src`, `data-lazy-src`, `style` and `target` receive values; anything else renders empty. URL tokens are dropped on `script`, `link` and `base`.
- richtext values keep only the class names that appear in that field's default.

## 6. Detection (`detect.ts`)

Runs in the admin browser (DOMParser; jsdom in tests).

### 6.1 Explicit hints (precede heuristics)

`data-edit="key"`, `data-edit-type`, `data-edit-label`, `data-edit-group`, `data-edit-ignore`, `data-edit-repeat="key"` (container). If any hint exists, the wizard defaults to "hints only". Hint attributes are removed from the stored template (replaced by `data-cf`).

### 6.2 Heuristics

Skip `script, style, noscript, template`, inside `svg` (except icon rule), `[data-edit-ignore]`.

| Match | Type |
|---|---|
| `img` | image |
| `video` / first `source[src]`, `poster` | video |
| `iframe` with src passing `safeEmbedUrl` | embed |
| inline `style` with `url(...)` | bgImage |
| `a[href]` | link (text part only when the link's content is text/phrasing; if it wraps an image, link href only + inner fields) |
| `button` | text |
| inline `svg` alone inside a wrapper or directly in a link/button | icon |
| element whose children are only text + phrasing (`strong b em i u s br span small mark code sub sup`) with non-blank text | text / richtext (has phrasing) / textarea (`p`,`blockquote`,`li` with `\n`) |
| `input[placeholder]`, `textarea[placeholder]` | text → `placeholder` |

A text match stops descent. **Mixed content** (text runs beside block children) is *not* auto-detected; the admin can click it in the mapping preview, which wraps that run in `<span data-cf>` with a warning that sibling selectors may be affected.

### 6.3 CSS-sourced fields

`url(...)` in rule declarations (not `@font-face`) → bgImage, label from selector. Phase 2: colour custom properties declared on `:root`/`html`/`body`/wrapper → color fields.

### 6.4 Labels and groups

Label `<Group> › <Role> <n>` (Role from tag: h1 Title, h2–h6 Heading, p Text, a Link, button Button, img Image, video Video…). Group = text of the nearest heading inside the nearest ancestor `section/header/footer/article/[class*=card]`, else "Section". Max 48 chars.

### 6.5 Repeaters (phase 2)

A container with ≥ 2 element children sharing a structural signature (tag + sorted classes + child-tag sequence, depth 3) covering ≥ 80 % of its element children. First item = item template; all items → default array. Only the outermost level. Editors: add / duplicate / remove / reorder.

### 6.6 Re-import

Rendering the stored html with defaults reproduces the source with `data-cf` markers; re-detection reuses those ids, so values survive. Removed fields are listed before confirm.

## 7. Extraction, CSS, JS

### 7.1 `extract.ts`

Input pasted text or `.html` upload (≤ 2 MB). Full document (`<html`/`<body`) or fragment:

- `<style>` → css (ordered). `<link rel=stylesheet href>` (http/https) → `externalStylesheets`.
- Classic `<script>` (no `src`, no type or JS type) → JS blocks (ordered). `<script src>` → `externalScripts` except `cdn.tailwindcss.com` (→ `tailwind.enabled`). `type="module"` → dropped with warning.
- `tailwind.config = {...}` script: parsed **statically** with `acorn` (object/array/string/number/boolean/null literals only; anything else → warning, ignored). Never `new Function`/eval. Removed from JS.
- Each JS block is syntax-checked with `acorn.parse` (no execution); a syntax error blocks import with the message.
- Body inner HTML → html. `<title>`, `<meta>`, `<base>` dropped.

### 7.2 CSS scoping (`css-scope.ts`, server)

`POST /api/admin/custom-html/compile` (admin, `runtime='nodejs'`) `{ html, css, js, tailwind? } → { cssScoped, scope, warnings[] }`.

- `scope` = first 10 hex of sha256(html + css). `R = [data-chs="<scope>"]`.
- Selector rewriting via `postcss-selector-parser` per compound selector list:
  - leading `html`, `body`, `:root` compound → replaced by `R` (keeping pseudo-classes/attributes on it);
  - leading `.dark` (or `html.dark`) compound → `.dark R` (site uses class dark mode on `<html>`);
  - everything else → `R <selector>`; a lone `*`, `*::before`, `*::after` → `R`-prefixed descendants **and** `R` itself (`R, R *`, `R::before, R *::before`, …).
- `@media/@supports/@container/@layer` recurse. `@keyframes` names **kept global** (no rename — JS may reference them). `@font-face`, `@import url(http/https)` kept global; `@charset` dropped.
- Phase 2 Tailwind: `tailwindcss` v3 programmatic, `content: [{ raw: html + js, extension: 'html' }]`, `corePlugins.preflight = false`, `darkMode: 'class'`, `theme.extend` from config; output prepended to author CSS before scoping (its `.dark .dark\:x` selectors become `.dark R .dark\:x` by the rule above).
- Value tokens are inserted after scoping by `tokenize.ts`.

Tailwind as implemented:
- The compile request also takes `content` (untokenized html + handler JS) so classes in richtext, icons, repeater items and handlers are scanned. The scope hash covers theme and scanned content too.
- Only allow-listed `theme.extend` keys reach Tailwind; `plugins`, `presets`, `content`, `safelist`, theme overrides and `@apply` are not supported.
- A zero-specificity `:where(R, R *)` base (box sizing, border defaults, `--tw-*` variables) and a scoped `.container` reset are added.
- On Tailwind pages `extract.ts` moves `<body>` class/style onto a `<div data-chs-body>` wrapper. Re-editing keeps `template.tailwind`.
- `dark:` follows the site's class toggle; single-class author rules beat utilities.

### 7.3 JS runtime (`handlers.ts`, `runtime.ts`)

Goal: AI scripts run as on their own page, work when the same section appears twice, and are disposed on unmount.

**Inline handlers** (`handlers.ts`, at import): every `on<event>="code"` attribute is removed and replaced with `data-chs-h="<event>:<n>"`; JS gets appended:
```js
const __h = []; __h[n] = function (event) { <code> };
root.querySelectorAll('[data-chs-h]').forEach(el => el.getAttribute('data-chs-h').split(' ').forEach(p => {
  const [ev, i] = p.split(':'); el.addEventListener(ev, function (e) { if (__h[i].call(this, e) === false) e.preventDefault(); });
}));
```
Handlers therefore close over the section's local functions. `href="javascript:code"` is converted the same way (`click` + `preventDefault`), href set to `#`.

**Wrapper** (compiled into `template.js` at import):
```js
(function (root, document, window, setTimeout, setInterval, requestAnimationFrame) {
  "use strict"?  // NOT added (author code may be sloppy-mode)
  /* author js blocks, in order */
  /* generated handler binding */
})
```
Executed by `runtime.ts` as `fn(root, docShim, winShim, …trackedTimers)` via a `<script>` element appended to `document.head` and **removed immediately** after it runs (inline scripts execute synchronously on insertion), with the function body registered on `window.__chsRun[instanceId]`. Errors are caught and logged with the section id.

**Shims** — explicit traps, never a bare Proxy:
- `docShim`: `querySelector`, `querySelectorAll`, `getElementById`, `getElementsByClassName`, `getElementsByTagName` → scoped to `root` (getElementById → `root.querySelector('#'+CSS.escape(id))`); `addEventListener/removeEventListener` → tracked; for `DOMContentLoaded`/`readystatechange` when already loaded → run via `queueMicrotask`. All other props: `get` = `Reflect.get(document, p, document)`, functions bound to `document`; `set` = `Reflect.set(document, p, v, document)`. `body`, `head`, `documentElement`, `createElement` etc. pass through.
- `winShim`: `addEventListener/removeEventListener` tracked (`load` already fired → microtask); `document` → `docShim`; other props via `Reflect.get/set(window, p, …, window)`, functions bound to `window`. Assigning `window.foo = …` writes the real window.
- Tracked `setTimeout`, `setInterval`, `requestAnimationFrame`.
- `dispose()` removes tracked listeners, clears timers/frames. Called on unmount and before every re-run.

**When it runs**
- Public pages: once after mount; disposed on unmount (SPA navigation).
- Builder canvas: only if `runInBuilder` (default **false**); then re-run on rendered-html change, debounced 600 ms, remount key = `djb2(renderedHtml)`.
- Mapping preview: never.
- Static export prerender: skipped when `window.__CHS_PRERENDER__` is true. [prerender.ts](../scripts/export-static/prerender.ts) sets it via `context.addInitScript`. The snapshot therefore holds pristine HTML and scripts run once at load on the exported site.
- External scripts load first, sequentially, once per page (deduplicated by `src`, `data-chs-ext`).

## 8. Security

### 8.1 Permissions
`canEditCode` in [permissions.ts](../src/lib/permissions.ts) (admin true, editor false); `authorizeCode(request)` in [api-auth.ts](../src/lib/api-auth.ts).

### 8.2 Guard (`guard.ts`)
`checkCustomHtmlWrite({ role, prevSections, nextSections, libraryHashes }) → { ok: true } | { ok: false, status, sectionId, reason }`

1. Normalise both inputs from any stored shape (`array`, `{sections}`, single object).
2. For every section in `nextSections` with `type === 'custom-html'`: validate `data` with the strict zod schema and limits (all roles).
3. Admin → ok.
4. Non-admin: recompute `hash(template, fields)`; must be in `{ hashes of all custom-html sections in prevSections (any id) } ∪ libraryHashes`. Values are not checked (escaped at render).
5. Non-admin: a section whose `type` changed to or from `custom-html` relative to the same id in prev is also checked (covered by 2–4 since type is evaluated on next).
6. Parsing must be lossless (stored data equals validated data), and `__proto__`/`constructor`/`prototype` keys are rejected in `tailwind.config` (400).
7. Non-admin: `runInBuilder: true` is allowed only if a stored previous section with the same template hash already had it (403). Library entries do not grant it.

Blog posts never accept or render `custom-html` (schemas, sanitizer, translation copy, renderers).

### 8.3 Where the guard / restrictions apply

| Route | Action |
|---|---|
| `PUT pages/[id]/builder` | guard (prev = stored page) |
| `POST pages` | guard (prev = empty) |
| `POST import-export` type `page` | guard (prev = empty) |
| `POST import-export` type `section` | `custom-html` → require `canEditCode` + schema validation; fix lookup to `type + name` so multiple custom templates import |
| `PUT pages/[id]` (legacy `sections`) | reject payloads containing `custom-html`; builder GET fallback to `page.sections` drops `custom-html` entries |
| `POST pages/[id]/sync-structure` | source data is server-stored; for a `custom-html` source the target section is rebuilt with `mergeForLanguageSync` (§9) — target `data` is never combined with a source type |
| blog `posts/[id]/builder` | explicitly reject `custom-html` (400); category hidden in blog builder |
| library `POST/PUT/DELETE` | `authorizeCode` + schema validation |
| `duplicate`, `add-translation`, server-generated routes (`convert`, `migrate-app-builder`, `seed-process-steps`, `convert-workflow-orchestrator`) | no change (copy server data / no custom-html) |

### 8.4 Residual risk (documented)
Template JS runs on the public origin; admin token is in `localStorage` ([admin/layout.tsx](../src/app/admin/layout.tsx)). Template JS that copies element text into `innerHTML` turns an editor value into script. Mitigations in scope: admin-only code, AI prompt rule "never assign field content via innerHTML; use textContent", import-time warning when JS contains `innerHTML`/`insertAdjacentHTML`/`outerHTML`/`document.write`. Recommended separate project: httpOnly cookie auth.

### 8.5 Public payload
`public-strip.ts` removes `template.css` and `template.jsSource` in `/api/pages/by-slug` and `/api/pages/homepage` responses.

## 9. Multilingual sync

`mergeForLanguageSync(source, target)` (source is `custom-html`):
```
{ ...source, data: { ...source.data,
   values: for each field in source.data.fields:
     target is custom-html && hasOwn(target.data.values, id) && sameShape → target value
     else → source value } }
```
`dir`: `template.dir` (default `ltr`); `auto` → `rtl` for `ar`/`fa` pages.

## 10. Rendering component

`CustomHtmlSection` (`'use client'`) props `{ data, style, isBuilder, sectionId }`:
```tsx
<div data-chs={scope} data-chs-instance={instanceId} dir={dir}>
  <style>{css}</style>
  <div ref={root} dangerouslySetInnerHTML={{ __html: html }} />
</div>
```
Schema-invalid data → builder shows an inline notice; public renders nothing. Registered in [section-renderer.tsx](../src/lib/page-builder/section-renderer.tsx) (with section id). Also remove the per-render `console.log` of whole sections in that file (lines ~173, ~1270).

Builder canvas click: clicking an element with `[data-cf]` inside a selected custom section selects that field in the property panel (scroll + focus) — phase 1.

## 11. Builder UI

### 11.1 Library entry
[SectionLibrary.tsx](../src/components/admin/PageBuilder/SectionLibrary.tsx): "Custom HTML" category — "Import HTML…" (admin only); phase 2: saved templates. `PageBuilder` gets `handleInsertSection(section)` beside `handleAddSection`.

### 11.2 Import wizard (admin)
1. **Source** — HTML / CSS / JS tabs, paste or upload `.html`; extraction summary and warnings. Phase 3: "One section" / "Split into sections".
2. **Fields** — `MappingPreview` = `iframe srcdoc` with `sandbox="allow-same-origin"` and **without** `allow-scripts` (author scripts and handlers cannot run; the parent reads `contentDocument` to draw field outlines and attach click listeners), author CSS + external stylesheets injected. Field list on the right: label, type, visible, delete; click element ↔ select row; "Re-detect"; "Hints only".
3. **Details** — name, text direction, "Save to library" (phase 2), warnings.
4. **Insert** — compile endpoint → assemble `CustomHtmlData` → insert. Edit mode keeps matching values (§6.6).

### 11.3 Property panel
`CustomHtmlPropertyPanel` (routed from [PropertyPanel.tsx](../src/components/admin/PageBuilder/PropertyPanel.tsx)):
- Header: name; admin: "Edit code", "Save to library" (phase 2), "Run scripts in builder" toggle; all: "Reset all".
- Collapsible groups; editors per type: text input; textarea; richtext (textarea + allowed-tags note); link (text, URL, new tab); image/bgImage (existing `openMediaBrowser` event + upload as in [ImageUploader.tsx](../src/components/admin/PageBuilder/ImageUploader.tsx)), alt; video (media picker video/* + poster); embed URL with validation; icon SVG textarea + preview; color (phase 2); repeater (phase 2).
- Per-field reset. Hidden fields only visible to admins.

## 12. Library (phase 2)

Prisma `SectionTemplate` (no migration): `type='custom-html'`, `category='Custom HTML'`, `defaultData = JSON(CustomHtmlData with values {})`.
- `GET /api/admin/custom-html/library` (auth) list; `GET …/[id]` full.
- `POST`, `PUT /[id]`, `DELETE /[id]` (admin, schema-validated).
- Inserting copies data into the page (`libraryId`, `usageCount++`). Editing a library item never changes placed sections.
- `libraryHashes` computed from all custom-html rows at guard time.

## 13. Phase 3 — full page import, AI prompt

- `split-page.ts`: candidates = element children of `body` (or single `main`) — `section, header, footer, nav, article, div` with ≥ 1 field or ≥ 200 chars text; tiny neighbours merge into the previous. The wizard shows the split; the admin can merge / split / drop.
- CSS per section: **full CSS by default** (safe); optional "Remove unused CSS" applies conservative pruning (strip pseudos, `querySelector` test; always keep `:root/html/body/*` rules, `@font-face`, `@keyframes`, unparseable selectors).
- JS: each `<script>` block is listed; the admin assigns it to a section (default: the section whose ids/classes the block references, else the first). Warning that cross-section scripts must be put into one section.
- Update [ai-section-prompt-template.md](./ai-section-prompt-template.md): `data-edit*` hints, content in HTML, query only inside the section, `textContent` not `innerHTML` for content, no CDN frameworks / module scripts.

## 14. Tests (vitest + jsdom, `src/tests/custom-html/`)

- escape: obfuscated schemes (`java\tscript:`, `JaVaScRiPt:`, entities), attribute breakout, CSS breakout, colours, embed hosts.
- render: defaults reproduce fixtures (normalized DOM); XSS payloads in every field type; `{{cf:` in values not re-substituted; `constructor`/`__proto__` keys; repeaters; unknown tokens; data-cf stripped when not builder.
- detect / extract / handlers: each rule; hints; acorn config parse; module script warning; syntax error; handler rewrite.
- css-scope: html/body/:root, `.dark`, `*`/pseudo elements, media nesting, font-face, keyframes untouched, tokens survive.
- runtime: DOMContentLoaded/load shims; scoped queries; same section twice with tab toggles works independently; dispose clears listeners/timers; accessor props (`document.body`, `readyState`, `window.innerWidth`, `window.onscroll = …`) work; error contained.
- guard: admin ok; editor value change ok; editor template change → 403; forged/unknown keys → 400; duplicate section (new id) ok; library insert ok; shapes normalised; limits.
- routes: blog rejects; legacy PUT rejects; import-export section requires admin; sync merge.
- UI: property panel fields + role gating; section renders.
- Fixtures: trimmed sections from `sample pages/` (onclick tabs, Tailwind CDN, bg-image + video).

## 15. Acceptance criteria

1. Admin imports a section of `sample pages/ivaflow-partner-showcase.html` → preview matches; texts, links, images listed with readable labels.
2. Editor changes a title and an image → public page updates; editor sees no code UI; forged template PUT → 403.
3. `onclick` tabs work on the public page, also with the section placed twice.
4. Section CSS does not affect other sections or the site header/footer.
5. EN→AR structure sync keeps AR values and adds new fields.
6. (P2) Tailwind-CDN sample renders without the CDN; repeater items add/remove; a library template placed on two pages and edited independently.
7. (P3) A full sample page splits into sections; scripts work.
8. `npm test` and `npm run build` pass; static export output contains the rendered sections and their scripts run once.

## 16. Work packages

| Phase | Packages |
|---|---|
| 1 | P1.1 types/schema/hash/escape/render · P1.2 extract/detect/tokenize/handlers · P1.3 css-scope + compile route · P1.4 runtime + CustomHtmlSection + registration + prerender flag · P1.5 permissions/guard/route changes/sync/public-strip · P1.6 property panel + editors + canvas click-to-field · P1.7 import wizard + library entry · P1.8 tests/build/e2e |
| 2 | P2.1 repeaters · P2.2 colour fields · P2.3 Tailwind compile · P2.4 library API + picker + guard hashes · P2.5 canvas hover highlight |
| 3 | P3.1 split-page + optional CSS pruning + script assignment · P3.2 AI prompt doc · P3.3 e2e on sample pages |

## 17. Review resolutions (v1 → v2)

Sync-structure type/data mixing; import-export library write; blog route; duplicate-instance JS (scoped shims + handler rewrite, `jsExports` removed); Proxy receiver errors (explicit Reflect traps); teardown + builder default off + sync djb2 key; no `new Function` for tailwind config (acorn); Tailwind `content` includes JS, `.dark` scoping, `*::before`, keyframes not renamed, nodejs runtime; `source` removed, raw css/js stripped publicly; single-pass render, `hasOwn`, quoted style urls, `<source type>`, lazy attrs; jsdom/postcss-selector-parser direct deps; prerender flag; mixed-content not auto-wrapped; `dir` per template; module scripts/syntax check; category + console.log cleanup; canvas click-to-field moved to phase 1; JSON islands and dark-mode media rewrite cut; split-page simplified (full CSS default, manual script assignment).
