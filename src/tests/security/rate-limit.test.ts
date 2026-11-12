// @vitest-environment node
import { describe, it, expect } from 'vitest';
import { createRateLimiter, getClientIp } from '@/lib/rate-limit';

function clock(start = 1_000_000) {
  let t = start;
  return { now: () => t, advance: (ms: number) => { t += ms; } };
}

describe('createRateLimiter', () => {
  it('allows up to the limit, then blocks with Retry-After', () => {
    const c = clock();
    const rl = createRateLimiter({ limit: 3, windowMs: 60_000, now: c.now });
    expect(rl.hit('k')).toMatchObject({ allowed: true, remaining: 2 });
    rl.hit('k');
    expect(rl.hit('k')).toMatchObject({ allowed: true, remaining: 0 });
    const blocked = rl.hit('k');
    expect(blocked.allowed).toBe(false);
    expect(blocked.retryAfterSeconds).toBe(60);
    expect(rl.check('k').allowed).toBe(false);
  });

  it('slides: frees capacity as old hits leave the window', () => {
    const c = clock();
    const rl = createRateLimiter({ limit: 2, windowMs: 10_000, now: c.now });
    rl.hit('k');
    c.advance(4_000);
    rl.hit('k');
    expect(rl.check('k').allowed).toBe(false);
    expect(rl.check('k').retryAfterSeconds).toBe(6);
    c.advance(6_000);
    expect(rl.check('k').allowed).toBe(true);
    expect(rl.hit('k').allowed).toBe(true);
    expect(rl.hit('k').allowed).toBe(false);
  });

  it('blocked hits are not recorded (no self-extending lockout)', () => {
    const c = clock();
    const rl = createRateLimiter({ limit: 1, windowMs: 1_000, now: c.now });
    rl.hit('k');
    for (let i = 0; i < 5; i++) rl.hit('k');
    c.advance(1_000);
    expect(rl.hit('k').allowed).toBe(true);
  });

  it('check does not consume and reset clears a key', () => {
    const rl = createRateLimiter({ limit: 1, windowMs: 1_000 });
    rl.check('k');
    rl.check('k');
    expect(rl.hit('k').allowed).toBe(true);
    expect(rl.check('k').allowed).toBe(false);
    rl.reset('k');
    expect(rl.check('k').allowed).toBe(true);
  });

  it('keys are independent', () => {
    const rl = createRateLimiter({ limit: 1, windowMs: 1_000 });
    rl.hit('a');
    expect(rl.check('a').allowed).toBe(false);
    expect(rl.check('b').allowed).toBe(true);
  });

  it('bounds the number of tracked keys, evicting expired then oldest', () => {
    const c = clock();
    const rl = createRateLimiter({ limit: 5, windowMs: 1_000, maxKeys: 3, now: c.now });
    rl.hit('old');
    c.advance(2_000);
    rl.hit('a');
    rl.hit('b');
    rl.hit('c');
    expect(rl.size()).toBe(3);
    rl.hit('d');
    expect(rl.size()).toBe(3);
    expect(rl.check('a').remaining).toBe(5); // least recently used was evicted
    expect(rl.check('d').remaining).toBe(4);
  });
});

describe('getClientIp', () => {
  it('uses the first x-forwarded-for hop', () => {
    expect(getClientIp(new Headers({ 'x-forwarded-for': ' 203.0.113.7 , 10.0.0.1' }))).toBe('203.0.113.7');
  });
  it('falls back to x-real-ip, then "unknown"', () => {
    expect(getClientIp(new Headers({ 'x-real-ip': '198.51.100.2' }))).toBe('198.51.100.2');
    expect(getClientIp(new Headers())).toBe('unknown');
  });
});
