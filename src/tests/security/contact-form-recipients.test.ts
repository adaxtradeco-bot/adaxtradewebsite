// @vitest-environment node
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

const db = vi.hoisted(() => ({
  page: { findMany: vi.fn() },
  post: { findMany: vi.fn() },
}));
const send = vi.hoisted(() => vi.fn());

vi.mock('@/lib/prisma', () => ({ prisma: db }));
vi.mock('resend', () => ({
  Resend: class {
    emails = { send };
  },
}));

import {
  extractContactFormRecipients,
  recipientsFromStoredJson,
  parseRecipientList,
  isAllowedRecipient,
  clearRecipientCache,
} from '@/lib/contact-form-recipients';
import { POST } from '@/app/api/contact-form/route';

const pageJson = JSON.stringify([
  { id: 's1', type: 'hero', data: { destinationEmail: 'not-a-form@example.com' } },
  { id: 's2', type: 'contact-form', data: { formType: 'contact', destinationEmail: ' Owner@Example.com ' } },
]);
const nestedJson = JSON.stringify({
  sections: [{ type: 'columns', children: [{ type: 'contact-form', data: { destinationEmail: 'nested@example.com' } }] }],
});

describe('recipient extraction', () => {
  it('only takes destinationEmail of contact-form sections, normalised, at any depth', () => {
    expect(Array.from(recipientsFromStoredJson([pageJson, nestedJson, null, '{bad json contact-form'])).sort()).toEqual([
      'nested@example.com',
      'owner@example.com',
    ]);
  });

  it('ignores non-string and empty values', () => {
    const out = extractContactFormRecipients([
      { type: 'contact-form', data: { destinationEmail: 42 } },
      { type: 'contact-form', data: { destinationEmail: '' } },
      { type: 'contact-form' },
    ]);
    expect(out.size).toBe(0);
  });

  it('parses the env allowlist', () => {
    expect(Array.from(parseRecipientList(' A@x.com, ,b@y.com '))).toEqual(['a@x.com', 'b@y.com']);
    expect(parseRecipientList(undefined).size).toBe(0);
  });
});

describe('isAllowedRecipient', () => {
  beforeEach(() => {
    clearRecipientCache();
    db.page.findMany.mockReset().mockResolvedValue([{ builderData: pageJson, sections: null }]);
    db.post.findMany.mockReset().mockResolvedValue([{ builderData: nestedJson }]);
  });
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('accepts addresses configured in stored pages/posts (case-insensitive)', async () => {
    expect(await isAllowedRecipient('owner@example.com')).toBe(true);
    expect(await isAllowedRecipient('OWNER@example.COM')).toBe(true);
    expect(await isAllowedRecipient('nested@example.com')).toBe(true);
  });

  it('only reads admin-authored posts', async () => {
    await isAllowedRecipient('owner@example.com');
    expect(db.post.findMany).toHaveBeenCalledWith(expect.objectContaining({ where: { source: 'admin' } }));
  });

  it('rejects anything else', async () => {
    expect(await isAllowedRecipient('victim@example.org')).toBe(false);
    expect(await isAllowedRecipient('not-a-form@example.com')).toBe(false);
    expect(await isAllowedRecipient('')).toBe(false);
  });

  it('accepts env-allowlisted addresses without a DB hit', async () => {
    vi.stubEnv('CONTACT_FORM_ALLOWED_RECIPIENTS', 'sales@example.com, other@example.com');
    expect(await isAllowedRecipient('Sales@example.com')).toBe(true);
    expect(db.page.findMany).not.toHaveBeenCalled();
  });

  it('caches the allowed set', async () => {
    await isAllowedRecipient('owner@example.com');
    await isAllowedRecipient('owner@example.com');
    await isAllowedRecipient('victim@example.org');
    expect(db.page.findMany).toHaveBeenCalledTimes(1);
  });

  it('does not cache a failed lookup', async () => {
    db.page.findMany.mockRejectedValueOnce(new Error('db down'));
    await expect(isAllowedRecipient('owner@example.com')).rejects.toThrow('db down');
    expect(await isAllowedRecipient('owner@example.com')).toBe(true);
  });
});

describe('POST /api/contact-form', () => {
  let ipCounter = 0;
  const request = (body: unknown, ip = `192.0.2.${++ipCounter}`) =>
    new Request('http://localhost/api/contact-form', {
      method: 'POST',
      headers: { 'content-type': 'application/json', 'x-forwarded-for': ip },
      body: JSON.stringify(body),
    }) as any;
  const valid = (destinationEmail: string, extra: Record<string, unknown> = {}) => ({
    formType: 'contact',
    destinationEmail,
    fields: { name: 'Jo', email: 'jo@example.net', message: 'Hi' },
    ...extra,
  });

  beforeEach(() => {
    clearRecipientCache();
    db.page.findMany.mockReset().mockResolvedValue([{ builderData: pageJson, sections: null }]);
    db.post.findMany.mockReset().mockResolvedValue([]);
    send.mockReset().mockResolvedValue({ error: null });
    vi.stubEnv('RESEND_API_KEY', 'test-key');
    vi.spyOn(console, 'warn').mockImplementation(() => {});
  });
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.restoreAllMocks();
  });

  it('sends to a configured recipient', async () => {
    const res = await POST(request(valid('owner@example.com')));
    expect(res.status).toBe(200);
    expect(send).toHaveBeenCalledWith(expect.objectContaining({ to: 'owner@example.com' }));
  });

  it('refuses an arbitrary recipient (no open relay)', async () => {
    const res = await POST(request(valid('victim@example.org')));
    expect(res.status).toBe(400);
    expect((await res.json()).error).toBe('invalid_destination');
    expect(send).not.toHaveBeenCalled();
  });

  it('silently drops honeypot submissions', async () => {
    const res = await POST(request(valid('owner@example.com', { hp: 'http://spam' })));
    expect(res.status).toBe(200);
    expect(send).not.toHaveBeenCalled();
  });

  it('rate limits 5 submissions per IP', async () => {
    const ip = '198.51.100.99';
    for (let i = 0; i < 5; i++) {
      expect((await POST(request(valid('owner@example.com'), ip))).status).toBe(200);
    }
    const res = await POST(request(valid('owner@example.com'), ip));
    expect(res.status).toBe(429);
    expect(Number(res.headers.get('Retry-After'))).toBeGreaterThan(0);
    expect(send).toHaveBeenCalledTimes(5);
  });
});
