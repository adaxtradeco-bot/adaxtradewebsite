import fs from 'fs';
import os from 'os';
import path from 'path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { bundleStats, copyPhp, createZip, findForbiddenFiles, listBundleFiles } from '../assemble';

let dir: string;
const write = (rel: string, content = 'x'): void => {
  const file = path.join(dir, rel);
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, content);
};

beforeEach(() => {
  dir = fs.mkdtempSync(path.join(os.tmpdir(), 'export-bundle-'));
});
afterEach(() => {
  fs.rmSync(dir, { recursive: true, force: true });
});

describe('listBundleFiles / bundleStats', () => {
  it('lists dotfiles with forward slashes in sorted order', () => {
    write('b/index.html', 'bb');
    write('.htaccess', 'a');
    write('a.txt', 'c');
    expect(listBundleFiles(dir)).toEqual(['.htaccess', 'a.txt', 'b/index.html']);
    expect(bundleStats(dir)).toEqual({ files: 3, bytes: 4 });
  });
});

describe('findForbiddenFiles', () => {
  it('flags env files, node_modules, backups, database dumps and admin credentials', () => {
    write('en/index.html');
    write('.env.local');
    write('node_modules/x/index.js');
    write('backups/a.json');
    write('database-2024.json');
    write('ADMIN_CREDENTIALS.md');
    write('data/database-notes.txt');
    expect(findForbiddenFiles(dir)).toEqual([
      '.env.local',
      'ADMIN_CREDENTIALS.md',
      'backups/a.json',
      'database-2024.json',
      'node_modules/x/index.js',
    ]);
  });
  it('accepts a clean bundle', () => {
    write('en/index.html');
    write('_next/static/chunks/a.js');
    expect(findForbiddenFiles(dir)).toEqual([]);
  });
});

describe('copyPhp', () => {
  it('copies the allow-list only and ships the sample config as config.php', () => {
    copyPhp(dir);
    const files = listBundleFiles(dir);
    expect(files).toContain('send.php');
    expect(files).toContain('config.php');
    expect(files).toContain('vendor/phpmailer/LICENSE');
    expect(files).not.toContain('config.sample.php');
    expect(files.some((f) => f.includes('tests'))).toBe(false);
    expect(fs.readFileSync(path.join(dir, 'config.php'), 'utf8')).toContain('CHANGE_ME');
  });
});

describe('createZip', () => {
  it('writes sorted forward-slash entries including dotfiles', async () => {
    write('en/index.html', '<html></html>');
    write('.htaccess', 'Options -Indexes');
    write('_next/static/a.js', 'a');
    const zipPath = path.join(os.tmpdir(), `export-test-${process.pid}.zip`);
    try {
      const bytes = await createZip(dir, zipPath, new Date('2026-01-01T00:00:00Z'));
      expect(bytes).toBeGreaterThan(0);
      const names = readZipNames(fs.readFileSync(zipPath));
      expect(names).toEqual(['.htaccess', '_next/static/a.js', 'en/index.html']);
      expect(names.some((n) => n.includes('\\'))).toBe(false);
    } finally {
      fs.rmSync(zipPath, { force: true });
    }
  });

  it('refuses to zip a bundle with forbidden files', async () => {
    write('en/index.html');
    write('.env');
    const zipPath = path.join(os.tmpdir(), `export-test-forbidden-${process.pid}.zip`);
    await expect(createZip(dir, zipPath)).rejects.toThrow(/forbidden/i);
    expect(fs.existsSync(zipPath)).toBe(false);
  });
});

/** Reads entry names from the central directory of a zip buffer. */
function readZipNames(buf: Buffer): string[] {
  let eocd = buf.length - 22;
  while (eocd >= 0 && buf.readUInt32LE(eocd) !== 0x06054b50) eocd--;
  const count = buf.readUInt16LE(eocd + 10);
  let offset = buf.readUInt32LE(eocd + 16);
  const names: string[] = [];
  for (let i = 0; i < count; i++) {
    const nameLen = buf.readUInt16LE(offset + 28);
    const extraLen = buf.readUInt16LE(offset + 30);
    const commentLen = buf.readUInt16LE(offset + 32);
    names.push(buf.toString('utf8', offset + 46, offset + 46 + nameLen));
    offset += 46 + nameLen + extraLen + commentLen;
  }
  return names;
}
