import { describe, it, expect, vi, beforeEach } from 'vitest';

const mocks = vi.hoisted(() => ({ put: vi.fn(), lookup: vi.fn() }));
vi.mock('@vercel/blob', () => ({ put: mocks.put }));
vi.mock('dns/promises', () => ({ lookup: mocks.lookup, default: { lookup: mocks.lookup } }));

import { importCover } from '@/lib/blog/cover-import';

const fetchMock = vi.fn();
const image = (type = 'image/png', body = new Uint8Array([1, 2, 3])) =>
  new Response(body, { status: 200, headers: { 'content-type': type } });

beforeEach(() => {
  vi.clearAllMocks();
  vi.stubGlobal('fetch', fetchMock);
  mocks.lookup.mockResolvedValue([{ address: '93.184.216.34', family: 4 }]);
  mocks.put.mockResolvedValue({ url: 'https://blob.example/media/1-cover.png' });
});

describe('importCover', () => {
  it('uploads a public https image', async () => {
    fetchMock.mockResolvedValue(image());
    expect(await importCover('https://cdn.example.com/cover.png')).toEqual({ url: 'https://blob.example/media/1-cover.png' });
    expect(mocks.put.mock.calls[0][0]).toMatch(/^media\/\d+-cover\.png$/);
  });

  it('rejects http, private hosts and hosts resolving to private IPs', async () => {
    for (const url of ['http://cdn.example.com/a.png', 'https://localhost/a.png', 'https://127.0.0.1/a.png', 'https://169.254.169.254/a.png', 'https://[::1]/a.png']) {
      expect(await importCover(url)).toHaveProperty('error');
    }
    mocks.lookup.mockResolvedValue([{ address: '10.0.0.5', family: 4 }]);
    expect(await importCover('https://internal.example.com/a.png')).toHaveProperty('error');
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('rejects non-images and oversized images', async () => {
    fetchMock.mockResolvedValueOnce(image('text/html'));
    expect(await importCover('https://cdn.example.com/page')).toEqual({ error: 'cover is not an image' });

    fetchMock.mockResolvedValueOnce(new Response('x', { headers: { 'content-type': 'image/png', 'content-length': String(9 * 1024 * 1024) } }));
    expect(await importCover('https://cdn.example.com/big.png')).toHaveProperty('error');
    expect(mocks.put).not.toHaveBeenCalled();
  });

  it('never throws', async () => {
    fetchMock.mockRejectedValue(new Error('boom'));
    expect(await importCover('https://cdn.example.com/a.png')).toHaveProperty('error');
    expect(await importCover('not a url')).toHaveProperty('error');
  });
});
