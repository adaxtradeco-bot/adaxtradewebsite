/**
 * Preflight checks: env, database access, Chromium. Returns problems; the caller prints and stops.
 * Never prints DATABASE_URL or other secrets.
 */

import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';
import { chromium } from 'playwright';
import type { ExportOptions } from './cli';

export interface PreflightProblem {
  problem: string;
  fix: string;
}

/**
 * Loads .env, then .env.production. .env.local is deliberately skipped: it is the dev override
 * (a local SQLite file) while the real site data lives in the .env database, which is also the
 * only file the Prisma CLI reads. dotenv never overrides already-set variables, so a real
 * process env value beats all files, and the export server child inherits the chosen value
 * (Next does not override variables that are already set).
 */
export function loadEnv(cwd = process.cwd(), envFile?: string): void {
  // An explicit env file is the only source: falling back to .env could silently export another site.
  const files = envFile ? [envFile] : ['.env', '.env.production'];
  for (const file of files) {
    const p = path.join(cwd, file);
    // Importing @prisma/client already put .env's DATABASE_URL into process.env, so an explicitly
    // chosen file must override it; the default files keep dotenv's no-override behaviour.
    if (fs.existsSync(p)) dotenv.config({ path: p, override: Boolean(envFile) });
  }
}

/** Remove anything that could leak credentials/hosts from an error message. */
export function maskSecrets(text: string): string {
  let out = text.replace(/[a-z][a-z0-9+.-]*:\/\/[^\s'"]+/gi, '<url-masked>');
  const url = process.env.DATABASE_URL;
  if (url) {
    out = out.split(url).join('<DATABASE_URL>');
    try {
      const u = new URL(url);
      for (const s of [u.password, decodeURIComponent(u.password), u.hostname]) {
        if (s) out = out.split(s).join('***');
      }
    } catch {
      // unparsable URL: the generic masking above is all we can do
    }
  }
  return out;
}

export async function runPreflight(opts?: ExportOptions): Promise<PreflightProblem[]> {
  const problems: PreflightProblem[] = [];
  const envFile = opts?.envFile;
  if (envFile && !fs.existsSync(path.resolve(envFile))) {
    problems.push({
      problem: `Env file not found: ${envFile}`,
      fix: `Create ${envFile} with a DATABASE_URL line, or fix the path in export-sites.json / --env-file.`,
    });
    return problems;
  }
  loadEnv(process.cwd(), envFile);

  // Importing @prisma/client may have filled DATABASE_URL from .env, so a chosen file that does not
  // define it must fail here instead of silently exporting another site.
  if (envFile && !dotenv.parse(fs.readFileSync(path.resolve(envFile))).DATABASE_URL) {
    problems.push({
      problem: `${envFile} has no DATABASE_URL line.`,
      fix: `Add DATABASE_URL="..." (this site's database) to ${envFile} and re-run.`,
    });
    return problems;
  }

  if (!process.env.DATABASE_URL) {
    problems.push({
      problem: 'DATABASE_URL is not set.',
      fix: `Add DATABASE_URL to ${envFile ?? '.env'} (the production database) and re-run.`,
    });
  } else {
    const prisma = new PrismaClient();
    try {
      await prisma.page.count();
    } catch (err) {
      const msg = maskSecrets(err instanceof Error ? err.message : String(err));
      const firstLine = msg.split('\n').map((l) => l.trim()).filter(Boolean).pop() ?? 'unknown error';
      problems.push({
        problem: `Database check failed: ${firstLine}`,
        fix: 'Make sure the database is running and reachable, then run `npx prisma generate` if the client is outdated.',
      });
    } finally {
      await prisma.$disconnect().catch(() => undefined);
    }
  }

  let chromiumPath = '';
  try {
    chromiumPath = chromium.executablePath();
  } catch {
    // fall through to the missing-browser problem
  }
  if (!chromiumPath || !fs.existsSync(chromiumPath)) {
    problems.push({
      problem: 'Playwright Chromium is not installed.',
      fix: 'Run: npx playwright install chromium',
    });
  }

  return problems;
}
