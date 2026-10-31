/**
 * CLI argument parsing for the static export (no external arg library).
 */

export interface ExportOptions {
  langs: string[];
  out: string;
  skipBuild: boolean;
  noMediaDownload: boolean;
  verbose: boolean;
  concurrency: number;
  baseUrl?: string;
  allowMissingMedia: boolean;
  serve: boolean;
  /** Name of a profile in export-sites.json. */
  site?: string;
  /** Env file with DATABASE_URL; when set it replaces .env / .env.production. */
  envFile?: string;
}

export const DEFAULT_LANGS = ['fa', 'en', 'ar'];

export function defaultOptions(): ExportOptions {
  return {
    langs: [...DEFAULT_LANGS],
    out: 'dist-static',
    skipBuild: false,
    noMediaDownload: false,
    verbose: false,
    concurrency: 4,
    baseUrl: undefined,
    allowMissingMedia: false,
    serve: false,
  };
}

const BOOLEAN_FLAGS: Record<string, keyof ExportOptions> = {
  '--skip-build': 'skipBuild',
  '--no-media-download': 'noMediaDownload',
  '--verbose': 'verbose',
  '--allow-missing-media': 'allowMissingMedia',
  '--serve': 'serve',
};

/** Parse argv (without node/script entries). Throws Error with a clear message on bad input. */
export function parseArgs(argv: string[]): ExportOptions {
  const opts = defaultOptions();

  for (const arg of argv) {
    const eq = arg.indexOf('=');
    const name = eq === -1 ? arg : arg.slice(0, eq);
    const value = eq === -1 ? undefined : arg.slice(eq + 1);

    const boolKey = BOOLEAN_FLAGS[name];
    if (boolKey) {
      if (value !== undefined) throw new Error(`Flag ${name} does not take a value`);
      (opts[boolKey] as boolean) = true;
      continue;
    }

    switch (name) {
      case '--langs': {
        const langs = requireValue(name, value)
          .split(',')
          .map((l) => l.trim().toLowerCase())
          .filter(Boolean);
        if (langs.length === 0) throw new Error('--langs needs at least one language code');
        opts.langs = Array.from(new Set(langs));
        break;
      }
      case '--out':
        opts.out = requireValue(name, value);
        break;
      case '--site':
        opts.site = requireValue(name, value);
        break;
      case '--env-file':
        opts.envFile = requireValue(name, value);
        break;
      case '--concurrency': {
        const n = Number(requireValue(name, value));
        if (!Number.isInteger(n) || n < 1) {
          throw new Error(`--concurrency must be a positive integer (got "${value}")`);
        }
        opts.concurrency = n;
        break;
      }
      case '--base-url': {
        const url = requireValue(name, value);
        try {
          new URL(url);
        } catch {
          throw new Error(`--base-url must be an absolute URL (got "${url}")`);
        }
        opts.baseUrl = url.replace(/\/+$/, '');
        break;
      }
      default:
        throw new Error(`Unknown option: ${arg}`);
    }
  }

  return opts;
}

function requireValue(name: string, value: string | undefined): string {
  if (value === undefined || value === '') throw new Error(`${name} requires a value (${name}=...)`);
  return value;
}
