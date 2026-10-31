/**
 * Assemble the Bundle folder. HTML files are written by prerender; this adds the Next static
 * assets, the shim and the _data snapshot. Later tasks extend it through AssembleContext.
 */

import fs from 'fs';
import path from 'path';
import type { ApiSnapshot, RenderResult } from './prerender';
import type { Equivalents } from './equivalents';
import { renderHtaccess, renderReadme, renderRootIndex, type ReadmeInfo } from './hosting';

export interface AssembleContext {
  bundleDir: string;
  /** Next distDir of the export build. */
  exportDist: string;
  results: RenderResult[];
  snapshot: ApiSnapshot;
}

export interface AssembleOptions {
  exportDist?: string;
  results: RenderResult[];
  snapshot: ApiSnapshot;
}

export type { Equivalents };

const SHIM_SOURCE = path.join('export-template', 'static-shim.js');

function copyDir(from: string, to: string): void {
  fs.mkdirSync(path.dirname(to), { recursive: true });
  fs.cpSync(from, to, { recursive: true });
}

export function copyNextStatic(ctx: AssembleContext): void {
  const from = path.resolve(ctx.exportDist, 'static');
  if (!fs.existsSync(from)) throw new Error(`${from} not found; run the export build first.`);
  copyDir(from, path.join(ctx.bundleDir, '_next', 'static'));
}

export function copyShim(ctx: AssembleContext): void {
  fs.copyFileSync(path.resolve(SHIM_SOURCE), path.join(ctx.bundleDir, 'static-shim.js'));
}

export function writeEquivalents(ctx: AssembleContext, equivalents: Equivalents): void {
  const dir = path.join(ctx.bundleDir, '_data');
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, 'equivalents.json'), JSON.stringify(equivalents, null, 2), 'utf8');
}

export function assembleMinimal(bundleDir: string, opts: AssembleOptions): AssembleContext {
  const ctx: AssembleContext = {
    bundleDir: path.resolve(bundleDir),
    exportDist: opts.exportDist ?? '.next-export',
    results: opts.results,
    snapshot: opts.snapshot,
  };
  fs.mkdirSync(ctx.bundleDir, { recursive: true });
  copyNextStatic(ctx);
  copyShim(ctx);
  ctx.snapshot.writeSnapshot(ctx.bundleDir);
  // The real table (bySlug/byGroup from Prisma) arrives with Task 11.
  writeEquivalents(ctx, {
    routes: ctx.results.filter((r) => r.ok).map((r) => r.route.path),
    bySlug: {},
    byGroup: {},
  });
  return ctx;
}

const PHP_TEMPLATE_DIR = path.join('export-template', 'php');
/** Allow-list of PHP files shipped in the Bundle (tests/ and anything else stay out). */
const PHP_FILES: Array<{ from: string; to: string }> = [
  { from: 'send.php', to: 'send.php' },
  { from: 'lib.php', to: 'lib.php' },
  { from: 'config.sample.php', to: 'config.php' },
  { from: 'vendor/phpmailer/PHPMailer.php', to: 'vendor/phpmailer/PHPMailer.php' },
  { from: 'vendor/phpmailer/SMTP.php', to: 'vendor/phpmailer/SMTP.php' },
  { from: 'vendor/phpmailer/Exception.php', to: 'vendor/phpmailer/Exception.php' },
  { from: 'vendor/phpmailer/LICENSE', to: 'vendor/phpmailer/LICENSE' },
  { from: 'vendor/phpmailer/VERSION.txt', to: 'vendor/phpmailer/VERSION.txt' },
];

export function copyPhp(bundleDir: string): void {
  for (const { from, to } of PHP_FILES) {
    const dest = path.join(bundleDir, to);
    fs.mkdirSync(path.dirname(dest), { recursive: true });
    fs.copyFileSync(path.resolve(PHP_TEMPLATE_DIR, from), dest);
  }
}

export interface FullAssembleOptions extends AssembleOptions {
  equivalents: Equivalents;
  defaultLang: string;
  baseUrl?: string;
  /** Rendered not-found page (shim already injected). */
  notFoundHtml: string;
}

/** Everything except media rewriting, sitemap/robots and README, which need the final file set. */
export function assembleFull(bundleDir: string, opts: FullAssembleOptions): AssembleContext {
  const ctx: AssembleContext = {
    bundleDir: path.resolve(bundleDir),
    exportDist: opts.exportDist ?? '.next-export',
    results: opts.results,
    snapshot: opts.snapshot,
  };
  fs.mkdirSync(ctx.bundleDir, { recursive: true });
  copyNextStatic(ctx);
  copyShim(ctx);
  ctx.snapshot.writeSnapshot(ctx.bundleDir);
  writeEquivalents(ctx, opts.equivalents);
  fs.writeFileSync(path.join(ctx.bundleDir, 'index.html'), renderRootIndex(opts.defaultLang, opts.baseUrl), 'utf8');
  fs.writeFileSync(path.join(ctx.bundleDir, '.htaccess'), renderHtaccess(opts.defaultLang), 'utf8');
  fs.writeFileSync(path.join(ctx.bundleDir, '404.html'), opts.notFoundHtml, 'utf8');
  copyPhp(ctx.bundleDir);
  return ctx;
}

export function writeReadme(bundleDir: string, info: ReadmeInfo): void {
  fs.writeFileSync(path.join(bundleDir, 'README-DEPLOY.txt'), renderReadme(info), 'utf8');
}

const byCodePoint = (a: string, b: string): number => (a < b ? -1 : a > b ? 1 : 0);

/** All files under dir as sorted forward-slash relative paths (dotfiles included). */
export function listBundleFiles(dir: string): string[] {
  const out: string[] = [];
  const walk = (abs: string, rel: string): void => {
    for (const entry of fs.readdirSync(abs, { withFileTypes: true }).sort((a, b) => byCodePoint(a.name, b.name))) {
      const childRel = rel ? `${rel}/${entry.name}` : entry.name;
      if (entry.isDirectory()) walk(path.join(abs, entry.name), childRel);
      else if (entry.isFile()) out.push(childRel);
    }
  };
  walk(path.resolve(dir), '');
  return out.sort(byCodePoint);
}

const FORBIDDEN_SEGMENT = /^(\.env.*|node_modules|backups)$/i;
const FORBIDDEN_FILE = /^(database-.*\.json|ADMIN_CREDENTIALS\.md)$/i;

/** Req 13.3: relative paths in the Bundle that must never ship. */
export function findForbiddenFiles(dir: string): string[] {
  return listBundleFiles(dir).filter((rel) => {
    const parts = rel.split('/');
    return parts.some((p) => FORBIDDEN_SEGMENT.test(p)) || FORBIDDEN_FILE.test(parts[parts.length - 1]);
  });
}

export function bundleStats(dir: string): { files: number; bytes: number } {
  const root = path.resolve(dir);
  const files = listBundleFiles(root);
  const bytes = files.reduce((sum, rel) => sum + fs.statSync(path.join(root, rel)).size, 0);
  return { files: files.length, bytes };
}

/** Zip the Bundle folder contents (entries at the zip root, forward slashes, sorted order). */
export async function createZip(bundleDir: string, zipPath: string, date: Date = new Date()): Promise<number> {
  const root = path.resolve(bundleDir);
  const forbidden = findForbiddenFiles(root);
  if (forbidden.length > 0) {
    throw new Error(`Refusing to zip: forbidden file(s) in the Bundle: ${forbidden.slice(0, 5).join(', ')}`);
  }
  const { ZipArchive } = await import('archiver');
  fs.mkdirSync(path.dirname(path.resolve(zipPath)), { recursive: true });
  const output = fs.createWriteStream(zipPath);
  const archive = new ZipArchive({ zlib: { level: 9 } });
  const done = new Promise<void>((resolve, reject) => {
    output.once('close', resolve);
    output.once('error', reject);
    archive.once('error', reject);
  });
  archive.pipe(output);
  for (const rel of listBundleFiles(root)) {
    // append (not file) keeps the queue order, so entries stay sorted
    archive.append(fs.createReadStream(path.join(root, rel)), { name: rel, date });
  }
  await archive.finalize();
  await done;
  return fs.statSync(zipPath).size;
}
