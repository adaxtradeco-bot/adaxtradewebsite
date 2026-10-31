import fs from 'fs';
import os from 'os';
import path from 'path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { parseArgs } from '../cli';
import { applySiteProfile } from '../sites';

describe('applySiteProfile', () => {
  let dir: string;
  beforeEach(() => {
    dir = fs.mkdtempSync(path.join(os.tmpdir(), 'sites-'));
    fs.writeFileSync(
      path.join(dir, 'export-sites.json'),
      JSON.stringify({ adax: { envFile: '.env.adax.local', baseUrl: 'https://adaxtrade.com/', langs: ['EN', 'ar'] } }),
    );
  });
  afterEach(() => fs.rmSync(dir, { recursive: true, force: true }));

  const apply = (argv: string[]) => applySiteProfile(parseArgs(argv), argv, dir);

  it('fills env file, address, langs and a per-site output folder', () => {
    const o = apply(['--site=adax']);
    expect(o.envFile).toBe('.env.adax.local');
    expect(o.baseUrl).toBe('https://adaxtrade.com');
    expect(o.langs).toEqual(['en', 'ar']);
    expect(o.out).toBe(path.join('dist-static', 'adax'));
  });

  it('lets command-line flags win over the profile', () => {
    const o = apply(['--site=adax', '--langs=fa', '--out=x', '--base-url=https://other.com', '--env-file=.env.other']);
    expect(o).toMatchObject({ langs: ['fa'], out: 'x', baseUrl: 'https://other.com', envFile: '.env.other' });
  });

  it('rejects an unknown site and lists the known ones', () => {
    expect(() => apply(['--site=nope'])).toThrow(/Unknown site "nope".*adax/);
  });

  it('does nothing without --site', () => {
    expect(apply(['--skip-build']).envFile).toBeUndefined();
  });
});
