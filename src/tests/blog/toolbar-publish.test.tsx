import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Toolbar } from '@/components/admin/PageBuilder/Toolbar';

const props = {
  onSave: vi.fn(),
  isSaving: false,
  isPreviewMode: false,
  onTogglePreview: vi.fn(),
  previewMode: 'desktop' as const,
  onPreviewModeChange: vi.fn(),
  pageId: 'p1',
  pageStatus: 'draft',
};

const fetchMock = vi.fn();

beforeEach(() => {
  vi.clearAllMocks();
  fetchMock.mockResolvedValue({ ok: true, json: async () => ({ success: true }) });
  vi.stubGlobal('fetch', fetchMock);
  vi.stubGlobal('alert', vi.fn());
  Object.defineProperty(window, 'location', { value: { reload: vi.fn() }, writable: true });
});

const clickPublish = () => fireEvent.click(screen.getByRole('button', { name: /publish$/i }));

describe('Toolbar publish', () => {
  it('publishes a page through the pages API by default', async () => {
    render(<Toolbar {...props} />);
    clickPublish();
    await waitFor(() => expect(fetchMock).toHaveBeenCalled());
    expect(fetchMock.mock.calls[0][0]).toBe('/api/admin/pages/p1');
  });

  it('uses publishUrl when given, so a blog post is not sent to the pages API', async () => {
    render(<Toolbar {...props} publishUrl="/api/admin/blog/posts/p1" />);
    clickPublish();
    await waitFor(() => expect(fetchMock).toHaveBeenCalled());
    expect(fetchMock.mock.calls[0][0]).toBe('/api/admin/blog/posts/p1');
    expect(fetchMock.mock.calls[0][1].method).toBe('PUT');
  });
});
