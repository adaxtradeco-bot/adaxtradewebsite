// Copy of docs/ai-custom-html-prompt.md for the admin UI. Change both together; a test compares them.
export const AI_CUSTOM_HTML_PROMPT_FILENAME = 'ai-custom-html-prompt.md';

export const AI_CUSTOM_HTML_PROMPT = `You are going to build website sections that will be imported into a page builder through an "Import HTML" tool. The tool turns your HTML into a section whose texts, links, images and colours a non-technical editor can change. Follow every rule below. Read them, reply only with "Ready", and wait: my next message describes the section type and design I want.

If something I ask for cannot be done within these rules, say so in one or two sentences and use the closest design that can.

# 1. Output

- Reply with exactly one complete HTML file in one code block, then at most three short notes.
- Structure: \`<!doctype html>\`, \`<html>\`, \`<head>\` with one \`<style>\`, \`<body>\` with the section, and at most one \`<script>\` per section at the end of \`<body>\`.
- Wrap each section in one \`<section>\` with a unique, descriptive id and class (for example \`id="pricing-plans" class="pp"\`). Prefix all other class names and all \`@keyframes\` names with that short prefix (\`pp-card\`, \`pp-fade\`).
- Under 300 KB. No build step, no external files of your own.

# 2. Technology

- Use semantic HTML5, plain CSS (custom properties, flexbox, grid, \`clamp()\`) and vanilla JavaScript.
- Do not use React, Vue, Angular, Alpine, jQuery, any other framework or library, \`type="module"\`, \`import\`, or JSON/templates rendered by script.
- Use Tailwind only if I ask for it: load \`https://cdn.tailwindcss.com\`, write full class names in the HTML (never build them from strings), allow only \`theme.extend\` with literal values in \`tailwind.config\`, and no plugins or \`@apply\`.
- Fonts: system fonts, or a Google Fonts \`<link rel="stylesheet">\`.

# 3. Content

- All text, links and images are written directly in the HTML. Never create or load content with JavaScript.
- Every piece of text sits in its own element (\`h1\`–\`h6\`, \`p\`, \`a\`, \`button\`, \`li\`, \`span\`). Never place loose text next to block elements such as \`div\`.
- Inside a text, use only \`strong b em i u s br span small mark code sub sup\`. These may have a \`class\`, but no \`id\`, \`style\` or \`data-*\`.
- \`<a>\` and \`<button>\` contain plain text only. Draw arrows or small icons beside them with CSS \`::before\` / \`::after\`. Use \`<a href>\` for navigation and \`<button type="button">\` for actions.
- Icons: one inline \`<svg>\` alone inside its own wrapper element, without \`<text>\` inside the SVG.
- Images: \`<img>\` with \`src\`, \`alt\`, \`width\` and \`height\`. Use \`https://placehold.co/...\` placeholders if I give no URL.
- Video: \`<video>\` with \`<source>\` and \`poster\`. Embeds: only YouTube, Vimeo player or Google Maps embed URLs in an \`<iframe>\`.
- No \`<form>\` submission: this tool has no form backend. For a call to action, link to a page such as \`/contact\`.

# 4. Editing markers

Mark everything an editor should be able to change. Once one element is marked, only marked elements become editable, so do not skip any.

- \`data-edit="key"\`: unique key using letters, digits, \`-\` or \`_\`. Put it on each text element, link, button, image, video, iframe and icon wrapper.
- \`data-edit-label="Hero title"\`: the field name the editor sees.
- \`data-edit-group="Hero"\`: groups related fields.
- \`data-edit-repeat="key"\`: put it on the container of every list (cards, plans, questions, logos, steps, tabs).

Rules for repeated lists, which editors can add to, remove from and reorder:

- The container holds only the items, as direct children.
- Every item has exactly the same tags, classes, attributes and \`data-edit\` keys. Only the editable content differs.
- Style a special item with \`:nth-child()\`, not with an extra class or attribute.
- Inside items use no \`id\` and no \`on...\` attributes.
- No list inside another list. If each card needs bullet points, use one text element with \`<br>\` between lines.

# 5. CSS

- Define theme colours as custom properties on \`:root\`, with plain colour values (hex, \`rgb()\`, \`hsl()\`) and descriptive names (\`--pp-accent\`, \`--pp-card-bg\`). Each one becomes an editable colour field.
- Support dark mode by overriding those properties under \`.dark\` (the site toggles that class on \`<html>\`). Do not rely only on \`prefers-color-scheme\`.
- Do not rely on default browser styles: the host site resets them. Set margins, font sizes, line heights, list styles and button styles yourself.
- Responsive from 360 px to 1440 px, with no horizontal scrolling.
- Support right-to-left languages: use logical properties (\`margin-inline-start\`, \`padding-inline\`, \`text-align: start\`).
- The section sits between the site's own header and footer. Do not add a site header, navigation or footer unless I ask, avoid \`position: fixed\`, and avoid \`100vh\` heights.

# 6. JavaScript

- Add a script only when the design needs interaction. Prefer CSS or \`<details>\`.
- Wrap it in an IIFE. Find elements only inside your section, starting with \`document.querySelector('.pp')\` and querying from that element.
- Attach one listener to the section and use \`event.target.closest(...)\`, so items an editor adds also work. Never hard-code the number of items.
- Use \`addEventListener\`, not \`onclick\` attributes.
- Change text with \`textContent\`. Never use \`innerHTML\`, \`insertAdjacentHTML\`, \`outerHTML\`, \`document.write\` or \`eval\`.
- Do not use \`document.body\` or \`document.documentElement\` to find or change content, and create no global variables. The same section may appear twice on one page.
- All content must be visible without JavaScript (the builder does not run scripts). For reveal animations, the script adds a class that enables the hidden start state.

# 7. Full pages (only when I ask for a whole page)

- Each block is its own \`<section>\` and a direct child of \`<body>\`, with its own id, class prefix and CSS rules.
- Each block that needs interaction has its own \`<script>\` that touches only that block. No script is shared between blocks.

# 8. Example of the expected structure

\`\`\`html
<!doctype html>
<html lang="en">
<head>
<style>
  :root { --pp-bg: #f8fafc; --pp-text: #0f172a; --pp-card-bg: #ffffff; --pp-accent: #2563eb; }
  .dark { --pp-bg: #0f172a; --pp-text: #f1f5f9; --pp-card-bg: #1e293b; }
  .pp { background: var(--pp-bg); color: var(--pp-text); padding: clamp(2rem, 6vw, 5rem) 1.5rem; font-family: system-ui, sans-serif; }
  .pp-title { margin: 0 0 2rem; font-size: clamp(1.75rem, 4vw, 2.5rem); text-align: center; }
  .pp-title span { color: var(--pp-accent); }
  .pp-grid { display: grid; gap: 1rem; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); max-width: 960px; margin: 0 auto; }
  .pp-card { background: var(--pp-card-bg); border-radius: 12px; padding: 1.5rem; }
  .pp-name { margin: 0 0 .5rem; font-size: 1.25rem; }
  .pp-text { margin: 0 0 1rem; line-height: 1.6; }
  .pp-more { display: none; }
  .pp-card.is-open .pp-more { display: block; }
  .pp-toggle { border: 0; border-radius: 8px; padding: .5rem 1rem; background: var(--pp-accent); color: #fff; cursor: pointer; }
</style>
</head>
<body>
<section id="pricing-plans" class="pp">
  <h2 class="pp-title" data-edit="title" data-edit-label="Title" data-edit-group="Header">Simple <span>pricing</span></h2>
  <div class="pp-grid" data-edit-repeat="plans" data-edit-label="Plans">
    <article class="pp-card">
      <h3 class="pp-name" data-edit="name" data-edit-label="Plan name">Starter</h3>
      <p class="pp-text" data-edit="summary" data-edit-label="Summary">For small teams.</p>
      <p class="pp-text pp-more" data-edit="details" data-edit-label="Details">Includes five users and email support.</p>
      <button type="button" class="pp-toggle" data-edit="toggle" data-edit-label="Button text">Details</button>
    </article>
    <article class="pp-card">
      <h3 class="pp-name" data-edit="name" data-edit-label="Plan name">Business</h3>
      <p class="pp-text" data-edit="summary" data-edit-label="Summary">For growing companies.</p>
      <p class="pp-text pp-more" data-edit="details" data-edit-label="Details">Includes fifty users and priority support.</p>
      <button type="button" class="pp-toggle" data-edit="toggle" data-edit-label="Button text">Details</button>
    </article>
  </div>
</section>
<script>
(function () {
  var section = document.querySelector('.pp');
  if (!section) return;
  section.addEventListener('click', function (event) {
    var button = event.target.closest('.pp-toggle');
    if (button) button.closest('.pp-card').classList.toggle('is-open');
  });
})();
</script>
</body>
</html>
\`\`\`

# 9. Check before you answer

1. Every visible text, link, image and icon has \`data-edit\`, or is inside a \`data-edit\` element.
2. Every list uses \`data-edit-repeat\` and its items are structurally identical.
3. No framework, no \`innerHTML\`, no loose text, no \`id\` inside list items.
4. Colours are custom properties, dark mode and mobile work, and the content is visible with scripts turned off.
`;
