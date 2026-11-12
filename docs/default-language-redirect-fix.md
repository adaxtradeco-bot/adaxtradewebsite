# Bug: "/" ignores the default language set in Site Settings

**Reported:** 2026-11-12 (adaxtrade.com)
**Status:** Fixed

## Symptom
Admin → Site Settings → Default language set to **English**, but opening
`adaxtrade.com` still redirected to `adaxtrade.com/fa`. Same for any other language.

## Root cause
1. `src/app/page.tsx` (the `/` → `/{lang}` redirect) read the language from the
   database but had no dynamic API usage, so Next.js **prerendered it at build time**.
   The redirect target was frozen to whatever the database held during the build
   (or `fa` if the DB was unreachable). Changing the setting afterwards had no effect
   until a redeploy.
2. The root-level `middleware.ts` (cookie-based redirect, fallback `fa`) was **never
   compiled**: the app uses `src/app`, so Next.js only loads `src/middleware.ts`
   (`.next/server/middleware-manifest.json` was empty). Even if it had run, it relied on
   a `defaultLanguage` cookie that only admin browsers ever receive, so visitors
   would always fall back to `fa`.

## Fix
- `src/lib/i18n/default-language.ts`: single resolver for the default language
  (saved value → first enabled supported language → config default `en`).
- `src/app/page.tsx`: `export const dynamic = 'force-dynamic'`, so the redirect is
  resolved per request from the current settings.
- `src/app/api/settings/default-language/route.ts`: uses the same resolver, marked dynamic.
- Removed the dead root `middleware.ts`.
- Tests: `src/tests/default-language.test.ts`.

## Note
The static export (`scripts/export-static/hosting.ts`) reads the setting at export time
and still falls back to `fa` if none is saved; re-export after changing the default language.
