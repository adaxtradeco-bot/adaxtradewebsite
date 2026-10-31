/**
 * Child-process helpers with guaranteed teardown of the whole process tree.
 */

import { spawn, spawnSync, ChildProcess, SpawnOptions } from 'child_process';

const isWindows = process.platform === 'win32';
const tracked = new Set<ChildProcess>();
let handlersRegistered = false;

/** Spawn through the shell so `npx` resolves on Windows (npx.cmd). */
export function spawnTracked(command: string, args: string[], options: SpawnOptions = {}): ChildProcess {
  registerCleanup();
  const child = spawn(command, args, { shell: isWindows, ...options });
  tracked.add(child);
  child.once('exit', () => tracked.delete(child));
  return child;
}

/** Synchronously kill a child and its descendants. */
export function killTreeSync(child: ChildProcess): void {
  if (!child.pid || child.exitCode !== null || child.killed) return;
  try {
    if (isWindows) {
      spawnSync('taskkill', ['/pid', String(child.pid), '/T', '/F'], { stdio: 'ignore' });
    } else {
      child.kill('SIGTERM');
    }
  } catch {
    // already gone
  }
}

export function killAllTracked(): void {
  for (const child of tracked) killTreeSync(child);
  tracked.clear();
}

function registerCleanup(): void {
  if (handlersRegistered) return;
  handlersRegistered = true;
  process.on('exit', killAllTracked);
  for (const sig of ['SIGINT', 'SIGTERM'] as const) {
    process.on(sig, () => {
      killAllTracked();
      process.exit(sig === 'SIGINT' ? 130 : 143);
    });
  }
}
