import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

const KEYS = [
  'NEXT_PUBLIC_SITE_NAME',
  'NEXT_PUBLIC_SITE_SHORT_NAME',
  'NEXT_PUBLIC_SITE_URL',
  'NEXT_PUBLIC_CONTACT_EMAIL',
  'NEXT_PUBLIC_SITE_DESCRIPTION',
] as const;

async function load() {
  vi.resetModules();
  return (await import('@/config/brand')).brand;
}

describe('brand config', () => {
  const saved: Record<string, string | undefined> = {};
  beforeEach(() => {
    KEYS.forEach((k) => {
      saved[k] = process.env[k];
      delete process.env[k];
    });
  });
  afterEach(() => {
    KEYS.forEach((k) => {
      if (saved[k] === undefined) delete process.env[k];
      else process.env[k] = saved[k];
    });
  });

  it('uses neutral defaults', async () => {
    const brand = await load();
    expect(brand.name).toBe('Website');
    expect(brand.shortName).toBe('Website');
    expect(brand.url).toBe('http://localhost:3000');
    expect(brand.contactEmail).toBe('contact@example.com');
    expect(JSON.stringify(brand).toLowerCase()).not.toMatch(/ivaflow|adax/);
  });

  it('resolves values from env and trims trailing slashes', async () => {
    process.env.NEXT_PUBLIC_SITE_NAME = 'Acme';
    process.env.NEXT_PUBLIC_SITE_URL = 'https://acme.test//';
    process.env.NEXT_PUBLIC_CONTACT_EMAIL = 'hi@acme.test';
    process.env.NEXT_PUBLIC_SITE_DESCRIPTION = 'Acme things';
    const brand = await load();
    expect(brand).toMatchObject({
      name: 'Acme',
      shortName: 'Acme',
      url: 'https://acme.test',
      contactEmail: 'hi@acme.test',
      description: 'Acme things',
    });
  });

  it('ignores blank values', async () => {
    process.env.NEXT_PUBLIC_SITE_NAME = '   ';
    expect((await load()).name).toBe('Website');
  });
});
