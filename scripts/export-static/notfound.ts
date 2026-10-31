/**
 * Renders the app's not-found UI for 404.html (Task 14.3) by requesting a path that cannot exist
 * on the Export_Server, the same way prerender renders real pages.
 */

import { chromium } from 'playwright';
import { languages } from '../../src/lib/i18n/config';
import { injectShim } from './prerender';

export async function renderNotFoundPage(baseUrl: string, lang: string): Promise<string> {
  const dir = languages[lang]?.dir ?? 'ltr';
  const browser = await chromium.launch();
  try {
    const page = await (await browser.newContext()).newPage();
    await page.goto(`${baseUrl}/${lang}/__not-found__`, { waitUntil: 'domcontentloaded', timeout: 60_000 });
    await page.waitForLoadState('networkidle', { timeout: 8_000 }).catch(() => undefined);
    await page.waitForFunction(
      () => {
        const main = document.querySelector('main');
        return !!main && main.children.length > 0 && !main.querySelector('.animate-spin');
      },
      undefined,
      { timeout: 20_000, polling: 100 },
    );
    await page.waitForTimeout(300);
    const mainText = await page.evaluate(
      ({ lang, dir }: { lang: string; dir: string }) => {
        document.documentElement.setAttribute('lang', lang);
        document.documentElement.setAttribute('dir', dir);
        return (document.querySelector('main') as HTMLElement | null)?.innerText ?? '';
      },
      { lang, dir },
    );
    if (!/404|not found/i.test(mainText)) {
      throw new Error('the not-found page did not render the not-found UI');
    }
    return injectShim(await page.content());
  } finally {
    await browser.close().catch(() => undefined);
  }
}
