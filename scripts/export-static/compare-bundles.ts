/**
 * Idempotence check for the static export: compares two Bundle folders.
 * Usage: npx tsx scripts/export-static/compare-bundles.ts <dirA> <dirB>
 *
 * Non-HTML files must be byte-identical (README-DEPLOY.txt timestamps and sitemap <lastmod> are masked).
 * HTML files are compared by their normalized <main> text hash and <title> only, because the serialized
 * DOM carries run-specific noise. Exit code is non-zero for non-HTML or main-text/title differences.
 */

import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import { listBundleFiles } from './assemble';

export interface BundleDifference {
  file: string;
  kind: 'only-in-a' | 'only-in-b' | 'content' | 'main-text' | 'title';
  detail?: string;
}

export interface BundleComparison {
  filesA: number;
  filesB: number;
  htmlCompared: number;
  differences: BundleDifference[];
}

const sha1 = (data: string | Buffer): string => crypto.createHash('sha1').update(data).digest('hex');

const ISO_TIMESTAMP = /\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?Z/g;

/** Bytes to compare for a non-HTML file, with the known run-specific values masked. */
function comparableBytes(rel: string, data: Buffer): Buffer | string {
  if (rel === 'README-DEPLOY.txt') return data.toString('utf8').replace(ISO_TIMESTAMP, '<timestamp>');
  if (rel === 'sitemap.xml') return data.toString('utf8').replace(/<lastmod>[^<]*<\/lastmod>/g, '<lastmod/>');
  return data;
}

function decodeEntities(text: string): string {
  return text
    .replace(/&nbsp;/g, ' ')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#0*39;|&apos;/g, "'")
    .replace(/&amp;/g, '&');
}

/** Normalized visible text of <main> and the <title> of an HTML document. */
export function summarizeHtml(html: string): { title: string; mainText: string } {
  const title = decodeEntities(/<title[^>]*>([\s\S]*?)<\/title>/i.exec(html)?.[1] ?? '')
    .replace(/\s+/g, ' ')
    .trim();
  const start = html.search(/<main[\s>]/i);
  const end = html.toLowerCase().lastIndexOf('</main>');
  const inner = start >= 0 && end > start ? html.slice(start, end) : '';
  const mainText = decodeEntities(
    inner
      .replace(/<(script|style|noscript)[\s\S]*?<\/\1>/gi, ' ')
      .replace(/<[^>]*>/g, ' '),
  )
    .replace(/\s+/g, ' ')
    .trim();
  return { title, mainText };
}

export function compareBundles(dirA: string, dirB: string): BundleComparison {
  const rootA = path.resolve(dirA);
  const rootB = path.resolve(dirB);
  const filesA = listBundleFiles(rootA);
  const filesB = listBundleFiles(rootB);
  const setA = new Set(filesA);
  const setB = new Set(filesB);
  const differences: BundleDifference[] = [];
  let htmlCompared = 0;

  for (const file of filesA) if (!setB.has(file)) differences.push({ file, kind: 'only-in-a' });
  for (const file of filesB) if (!setA.has(file)) differences.push({ file, kind: 'only-in-b' });

  for (const file of filesA) {
    if (!setB.has(file)) continue;
    const a = fs.readFileSync(path.join(rootA, file));
    const b = fs.readFileSync(path.join(rootB, file));
    if (file.endsWith('.html')) {
      htmlCompared++;
      const sa = summarizeHtml(a.toString('utf8'));
      const sb = summarizeHtml(b.toString('utf8'));
      if (sa.title !== sb.title) differences.push({ file, kind: 'title', detail: `"${sa.title}" vs "${sb.title}"` });
      if (sha1(sa.mainText) !== sha1(sb.mainText)) {
        differences.push({ file, kind: 'main-text', detail: `${sa.mainText.length} vs ${sb.mainText.length} chars` });
      }
    } else if (sha1(comparableBytes(file, a)) !== sha1(comparableBytes(file, b))) {
      differences.push({ file, kind: 'content', detail: `${a.length} vs ${b.length} bytes` });
    }
  }

  return { filesA: filesA.length, filesB: filesB.length, htmlCompared, differences };
}

export function formatComparison(result: BundleComparison): string {
  const lines = [
    `Compared ${result.filesA} files (A) with ${result.filesB} files (B); ${result.htmlCompared} HTML pages compared by <main> text and <title>.`,
  ];
  if (result.differences.length === 0) lines.push('No differences.');
  else {
    lines.push(`${result.differences.length} difference(s):`);
    for (const d of result.differences) lines.push(`  ${d.kind.padEnd(10)} ${d.file}${d.detail ? `  (${d.detail})` : ''}`);
  }
  return lines.join('\n');
}

function main(): number {
  const [dirA, dirB] = process.argv.slice(2);
  if (!dirA || !dirB) {
    console.error('Usage: npx tsx scripts/export-static/compare-bundles.ts <dirA> <dirB>');
    return 2;
  }
  for (const dir of [dirA, dirB]) {
    if (!fs.existsSync(dir) || !fs.statSync(dir).isDirectory()) {
      console.error(`Not a directory: ${dir}`);
      return 2;
    }
  }
  const result = compareBundles(dirA, dirB);
  console.log(formatComparison(result));
  return result.differences.length > 0 ? 1 : 0;
}

if (process.argv[1] && /compare-bundles\.[cm]?[jt]s$/.test(process.argv[1])) process.exit(main());
