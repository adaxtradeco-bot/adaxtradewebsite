# Static site export

**خلاصه (فارسی):** این ابزار کل سایت را به صورت یک بسته استاتیک (پوشه `bundle` و فایل ZIP) خروجی می‌گیرد که روی هر هاست Apache (مثل cPanel) بدون Node.js و بدون پایگاه داده اجرا می‌شود. فرم‌ها با `send.php` و تنظیمات SMTP در `config.php` کار می‌کنند. پیش‌نیاز: `DATABASE_URL` در `.env` و اجرای `npx playwright install chromium`. دستور: `npm run export:static`. برای تست محلی `--serve` را اضافه کنید. اگر اجرا خطا داشته باشد ZIP با پسوند `-WITH-ERRORS` ساخته می‌شود و نباید روی هاست اصلی آپلود شود. هشدارهای hydration (React #418) طبیعی هستند.

The export builds the app in static-export mode, renders every route in headless Chromium, snapshots the API
responses the pages need, copies/downloads media, and packs everything into a folder plus a ZIP that runs on plain
Apache hosting (no Node.js, no database).

## Prerequisites

- `DATABASE_URL` in `.env` (the pages are read from the database).
- `npx playwright install chromium` (once per machine).
- Dependencies installed (`npm install`). A full run needs free ports 3999 (export server), 4000 (`--serve`) and 4100 (verification).

## Command

```bash
npm run export:static -- [flags]
# or: npx tsx scripts/export-static/index.ts [flags]
```

| Flag | Default | Meaning |
|---|---|---|
| `--langs=fa,en,ar` | `fa,en,ar` | Languages to export. |
| `--out=<dir>` | `dist-static` | Output directory. The bundle is `<out>/bundle`, the zip and `report.json` are in `<out>`. |
| `--skip-build` | off | Reuse the existing `.next-export` build instead of running `STATIC_EXPORT=1 next build`. |
| `--no-media-download` | off | Do not download Vercel Blob media; references stay remote. |
| `--allow-missing-media` | off | Broken media references do not fail the run. |
| `--base-url=<url>` | none | Public site URL; enables `sitemap.xml`, `robots.txt` Sitemap line and canonical links. |
| `--concurrency=<n>` | 4 | Parallel browser pages for rendering and verification. |
| `--verbose` | off | Log every route. |
| `--serve` | off | After the export, serve the bundle at `http://localhost:4000` until Ctrl+C. |

Exit code is 0 only when no route failed to render, no media is broken (unless `--allow-missing-media`) and verification
has no errors. Warnings never change the exit code.

## Output

- `<out>/bundle/`: the site (`<lang>/**/index.html`, `index.html` redirecting to the default language, `404.html`,
  `_next/static`, `media/`, `_data/` API snapshot and language equivalents, `static-shim.js`, `.htaccess`, `send.php`,
  `lib.php`, `config.php`, `vendor/phpmailer`, `README-DEPLOY.txt`, optional `sitemap.xml`/`robots.txt`).
- `<out>/site-<YYYYMMDD-HHmm>.zip`: the bundle contents at the zip root. When the run would exit non-zero the name ends
  in `-WITH-ERRORS.zip`; inspect `report.json` before using it. No zip is created if the forbidden-file guard trips
  (`.env*`, `node_modules`, `backups`, database dumps, credential files).
- `<out>/report.json`: per-language counts, skipped and failed routes, pages not exported, media (including
  `knownMissing`), warnings, verification results, bundle and zip sizes.

Skip reasons: `http-404`, `not-found-ui`, `by-slug-404` (route does not exist), `identical-to-<lang>` (language
fallback of another language), `empty-page` (database page with zero sections; reported as a warning).

## Deploy and test

1. Locally: `npm run export:static -- --skip-build --serve`, then open the printed URL (`http://localhost:4000`).
2. On the host: upload the zip to the domain root (`public_html`), extract it, make sure `index.html` and `.htaccess`
   sit directly in the root (enable "Show Hidden Files"). Apache with `mod_rewrite` is required; PHP 7.4+ only for forms.
3. Re-run the export and re-upload whenever content changes.

## Form mail (config.php)

Edit `config.php` on the host: `transport` (`smtp` recommended or `mail`), `smtp.host`, `smtp.port`/`smtp.secure`
(587 + `tls`, or 465 + `ssl`), `smtp.user`, `smtp.pass`, `from_email`, `from_name`, and the recipient. Never commit a real
`config.php`. Without PHP the site displays normally but forms show the existing error message.

## Limitations

- Content changes require a new export and upload.
- External media (for example Cloudinary) stays remote; only Vercel Blob and `public/` media are copied.
- `fa` has no database pages, so `/fa` shows the fallback homepage and most other `fa` routes are skipped.
- Custom CSS saved in `localStorage` (admin convenience) is not exported.
- English-only hard-coded routes are exported only for `en`.
- Absolute links to the former production origin inside builder content are not rewritten.
- Pages are prerendered from the live DOM, so React hydration warnings (minified error #418) appear in verification as
  warnings; they are expected and do not affect the exit code.
- Assets that the app references but that are missing even on the live site (for example `/grid.svg`,
  `/placeholder-dashboard.jpg`) are reported under `media.knownMissing` and as warnings.

## Troubleshooting

| Symptom | Fix |
|---|---|
| Preflight: database not reachable / `DATABASE_URL` missing | Set `DATABASE_URL` in `.env` and check the database is up. |
| Chromium not found | `npx playwright install chromium`. |
| Port 3999/4000/4100 in use | Stop the process using it, then re-run. |
| `--skip-build` fails with missing `.next-export` | Run once without `--skip-build`. |
| Zip named `...-WITH-ERRORS.zip` | Read `report.json` / the summary: failed routes, broken media or verify errors. Fix and re-run. |
| Broken media references | Fix the source URL, or pass `--allow-missing-media` if acceptable. |
| Page shows an empty body after settling | The page has sections whose content is empty; check it in the admin builder. |
| Forms do not send on the host | Check PHP is enabled and `config.php` SMTP values. |
| Blank site after upload | `index.html` and `.htaccess` must be in the domain root, not a subfolder. |
