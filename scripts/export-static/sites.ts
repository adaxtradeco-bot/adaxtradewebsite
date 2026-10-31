/**
 * Named site profiles: `--site=<name>` picks one entry from export-sites.json at the project root.
 * A profile holds no secrets; the database lives in the env file it points to
 * (e.g. .env.adaxtrade.local, which .gitignore already covers via `.env.*.local`).
 */

import fs from 'fs';
import path from 'path';
import type { ExportOptions } from './cli';

export interface SiteProfile {
  /** Env file holding DATABASE_URL for this site, relative to the project root. */
  envFile?: string;
  /** Public address of the deployed static site (canonical, sitemap, robots). */
  baseUrl?: string;
  langs?: string[];
}

export const SITES_FILE = 'export-sites.json';

export function loadSiteProfiles(cwd = process.cwd()): Record<string, SiteProfile> {
  const file = path.join(cwd, SITES_FILE);
  if (!fs.existsSync(file)) return {};
  try {
    const data = JSON.parse(fs.readFileSync(file, 'utf8'));
    if (data === null || typeof data !== 'object' || Array.isArray(data)) throw new Error('top level must be an object');
    return data as Record<string, SiteProfile>;
  } catch (err) {
    throw new Error(`${SITES_FILE} is not valid JSON: ${err instanceof Error ? err.message : String(err)}`);
  }
}

/** Fill options from the chosen profile. Flags typed on the command line always win. */
export function applySiteProfile(opts: ExportOptions, argv: string[], cwd = process.cwd()): ExportOptions {
  if (!opts.site) return opts;
  const profiles = loadSiteProfiles(cwd);
  const profile = profiles[opts.site];
  if (!profile) {
    const known = Object.keys(profiles);
    throw new Error(
      `Unknown site "${opts.site}". ` +
        (known.length > 0 ? `Sites in ${SITES_FILE}: ${known.join(', ')}.` : `Create ${SITES_FILE} first (see docs/static-export.md).`),
    );
  }
  const given = (flag: string): boolean => argv.some((a) => a === flag || a.startsWith(`${flag}=`));
  const next = { ...opts };
  if (!given('--env-file') && profile.envFile) next.envFile = profile.envFile;
  if (!given('--base-url') && profile.baseUrl) next.baseUrl = profile.baseUrl.replace(/\/+$/, '');
  if (!given('--langs') && profile.langs && profile.langs.length > 0) next.langs = profile.langs.map((l) => l.toLowerCase());
  if (!given('--out')) next.out = path.join(opts.out, opts.site);
  return next;
}
