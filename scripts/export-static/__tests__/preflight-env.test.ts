import fs from 'fs';
import os from 'os';
import path from 'path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { loadEnv } from '../preflight';

describe('loadEnv', () => {
  let dir: string;
  let saved: string | undefined;
  beforeEach(() => {
    dir = fs.mkdtempSync(path.join(os.tmpdir(), 'envtest-'));
    saved = process.env.DATABASE_URL;
    fs.writeFileSync(path.join(dir, '.env'), 'DATABASE_URL=default-site\n');
    fs.writeFileSync(path.join(dir, '.env.other.local'), 'DATABASE_URL=other-site\n');
    process.env.DATABASE_URL = 'already-set-by-prisma-import';
  });
  afterEach(() => {
    if (saved === undefined) delete process.env.DATABASE_URL;
    else process.env.DATABASE_URL = saved;
    fs.rmSync(dir, { recursive: true, force: true });
  });

  it('an explicit env file overrides a value that is already set', () => {
    loadEnv(dir, '.env.other.local');
    expect(process.env.DATABASE_URL).toBe('other-site');
  });

  it('an explicit env file never reads .env', () => {
    fs.appendFileSync(path.join(dir, '.env'), 'ONLY_IN_DEFAULT=1\n');
    delete process.env.ONLY_IN_DEFAULT;
    loadEnv(dir, '.env.other.local');
    expect(process.env.ONLY_IN_DEFAULT).toBeUndefined();
  });

  it('default files keep the no-override behaviour', () => {
    loadEnv(dir);
    expect(process.env.DATABASE_URL).toBe('already-set-by-prisma-import');
  });
});
