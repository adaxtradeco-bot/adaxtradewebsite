/**
 * Build and serve the STATIC_EXPORT variant of the app (distDir `.next-export`).
 * Uses `npx next build` directly: `npm run build` would run database migrations.
 */

import fs from 'fs';
import path from 'path';
import { ChildProcess } from 'child_process';
import type { ExportOptions } from './cli';
import { spawnTracked, killTreeSync } from './child';

const BUILD_DIR = '.next-export';
// Read at spawn time, not import time: loadEnv() (preflight) must have run so the child sees the
// chosen site's DATABASE_URL instead of falling back to the default .env.
const exportEnv = (): NodeJS.ProcessEnv => ({ ...process.env, STATIC_EXPORT: '1' });

export interface ExportServer {
  baseUrl: string;
  stop(): Promise<void>;
}

export async function buildExport(opts: ExportOptions): Promise<void> {
  const buildId = path.join(process.cwd(), BUILD_DIR, 'BUILD_ID');

  if (opts.skipBuild) {
    if (!fs.existsSync(buildId)) {
      throw new Error(`--skip-build was given but ${BUILD_DIR}/BUILD_ID is missing. Run once without --skip-build.`);
    }
    return;
  }

  const child = spawnTracked('npx', ['next', 'build'], {
    env: exportEnv(),
    stdio: ['ignore', 'pipe', 'pipe'],
  });

  // Always collect a tail so a failed build can show the Next error even without --verbose.
  let tail = '';
  const onData = (chunk: Buffer) => {
    const text = chunk.toString();
    if (opts.verbose) process.stdout.write(text);
    tail = (tail + text).slice(-4000);
  };
  child.stdout?.on('data', onData);
  child.stderr?.on('data', onData);

  const code = await new Promise<number | null>((resolve, reject) => {
    child.once('error', reject);
    child.once('exit', resolve);
  });

  if (code !== 0) {
    throw new Error(`next build failed (exit ${code}).\n${opts.verbose ? '' : tail}`);
  }
  if (!fs.existsSync(buildId)) {
    throw new Error(`next build finished but ${BUILD_DIR}/BUILD_ID was not created.`);
  }
}

export async function startExportServer(port = 3999, opts?: Pick<ExportOptions, 'verbose'>): Promise<ExportServer> {
  const baseUrl = `http://localhost:${port}`;
  const child: ChildProcess = spawnTracked('npx', ['next', 'start', '-p', String(port)], {
    env: exportEnv(),
    stdio: ['ignore', 'pipe', 'pipe'],
  });

  let exited = false;
  let tail = '';
  const onData = (chunk: Buffer) => {
    const text = chunk.toString();
    if (opts?.verbose) process.stdout.write(text);
    tail = (tail + text).slice(-2000);
  };
  child.stdout?.on('data', onData);
  child.stderr?.on('data', onData);
  child.once('exit', () => {
    exited = true;
  });

  const stop = async (): Promise<void> => {
    if (exited) return;
    const done = new Promise<void>((resolve) => child.once('exit', () => resolve()));
    killTreeSync(child);
    await Promise.race([done, new Promise<void>((r) => setTimeout(r, 5000))]);
  };

  const deadline = Date.now() + 60_000;
  while (Date.now() < deadline) {
    if (exited) throw new Error(`next start exited before becoming ready.\n${tail}`);
    try {
      const res = await fetch(`${baseUrl}/en`, { signal: AbortSignal.timeout(5000) });
      if (res.status > 0) return { baseUrl, stop };
    } catch {
      // not up yet
    }
    await new Promise((r) => setTimeout(r, 500));
  }

  await stop();
  throw new Error(`Timed out after 60s waiting for ${baseUrl}/en.\n${tail}`);
}
