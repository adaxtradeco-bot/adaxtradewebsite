import { describe, it, expect } from 'vitest';
import { parseArgs } from '../cli';

describe('parseArgs', () => {
  it('returns defaults with no args', () => {
    expect(parseArgs([])).toEqual({
      langs: ['fa', 'en', 'ar'],
      out: 'dist-static',
      skipBuild: false,
      noMediaDownload: false,
      verbose: false,
      concurrency: 4,
      baseUrl: undefined,
      allowMissingMedia: false,
      serve: false,
    });
  });

  it('parses value flags', () => {
    const o = parseArgs(['--langs=en,fa', '--out=build/site', '--concurrency=8', '--base-url=https://example.com/']);
    expect(o.langs).toEqual(['en', 'fa']);
    expect(o.out).toBe('build/site');
    expect(o.concurrency).toBe(8);
    expect(o.baseUrl).toBe('https://example.com');
  });

  it('parses boolean flags', () => {
    const o = parseArgs(['--skip-build', '--no-media-download', '--verbose', '--allow-missing-media', '--serve']);
    expect(o.skipBuild && o.noMediaDownload && o.verbose && o.allowMissingMedia && o.serve).toBe(true);
  });

  it('rejects unknown flags', () => {
    expect(() => parseArgs(['--bogus'])).toThrow(/Unknown option: --bogus/);
  });

  it('rejects bad values', () => {
    expect(() => parseArgs(['--concurrency=0'])).toThrow(/positive integer/);
    expect(() => parseArgs(['--concurrency=abc'])).toThrow(/positive integer/);
    expect(() => parseArgs(['--out'])).toThrow(/requires a value/);
    expect(() => parseArgs(['--base-url=nope'])).toThrow(/absolute URL/);
    expect(() => parseArgs(['--verbose=1'])).toThrow(/does not take a value/);
  });
});
