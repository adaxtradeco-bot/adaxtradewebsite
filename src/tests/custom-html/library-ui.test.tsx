/**
 * P2.4 — library picker, "Save to library" (panel + wizard) and the library sidebar category.
 */
import React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { act, cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
// SectionLibrary's preview modal pulls in the whole section renderer (and prisma); not needed here.
vi.mock('@/components/section-preview/SectionPreviewModal', () => ({ SectionPreviewModal: () => null }));
vi.mock('@/lib/section-preview-data', () => ({ getSectionPreviewData: () => null }));

import { LibraryPicker } from '@/components/admin/PageBuilder/custom-html/LibraryPicker';
import { CustomHtmlPropertyPanel } from '@/components/admin/PageBuilder/custom-html/CustomHtmlPropertyPanel';
import { ImportWizard } from '@/components/admin/PageBuilder/custom-html/ImportWizard';
import { SectionLibrary } from '@/components/admin/PageBuilder/SectionLibrary';
import { createLibraryItem } from '@/lib/custom-html/library-client';
import type { SectionConfig } from '@/lib/page-builder/section-schemas';
import type { CompileRequest, CompileResult } from '@/lib/custom-html/types';
import { makeFixture } from './fixtures';

const summary = { id: 'lib1', name: 'Promo', description: 'A promo banner', usageCount: 2 };
let items = [summary];
const fetchMock = vi.fn();

const json = (body: unknown, status = 200) => ({ ok: status < 400, status, json: async () => body }) as Response;

beforeEach(() => {
  items = [summary];
  fetchMock.mockReset();
  fetchMock.mockImplementation(async (url: string, init: RequestInit) => {
    if (init.method === 'GET' && url.endsWith('/library')) return json({ success: true, items });
    if (init.method === 'GET') {
      return json({ success: true, item: { ...summary, usageCount: 3, data: makeFixture() } });
    }
    return json({ success: true, item: summary });
  });
  vi.stubGlobal('fetch', fetchMock);
  localStorage.setItem('adminToken', 'tok');
});
afterEach(() => {
  cleanup();
  localStorage.clear();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

const setRole = (role: string) => localStorage.setItem('adminUser', JSON.stringify({ role }));
const calls = (method: string) => fetchMock.mock.calls.filter((c) => (c[1] as RequestInit).method === method);

describe('LibraryPicker', () => {
  it('lets an editor insert a copy, without admin controls', async () => {
    setRole('editor');
    const onInsert = vi.fn();
    render(<LibraryPicker onInsert={onInsert} />);
    fireEvent.click(await screen.findByRole('button', { name: 'Insert Promo' }));
    await waitFor(() => expect(onInsert).toHaveBeenCalledTimes(1));
    const section = onInsert.mock.calls[0][0] as any;
    expect(section.type).toBe('custom-html');
    expect(section.id).toMatch(/^section-\d+$/);
    expect(section.data).toMatchObject({ libraryId: 'lib1', values: {} });
    expect(section.data).not.toHaveProperty('runInBuilder');
    expect(calls('GET').at(-1)![0]).toBe('/api/admin/custom-html/library/lib1?insert=1');
    expect((calls('GET')[0][1] as any).headers.Authorization).toBe('Bearer tok');
    expect(await screen.findByText('Used 3 times')).toBeTruthy();
    expect(screen.queryByRole('button', { name: 'Rename Promo' })).toBeNull();
    expect(screen.queryByRole('button', { name: 'Delete Promo' })).toBeNull();
  });

  it('inserts once on a double click', async () => {
    const onInsert = vi.fn();
    render(<LibraryPicker onInsert={onInsert} />);
    const button = await screen.findByRole('button', { name: 'Insert Promo' });
    fireEvent.click(button);
    fireEvent.click(button);
    await waitFor(() => expect(onInsert).toHaveBeenCalled());
    expect(onInsert).toHaveBeenCalledTimes(1);
  });

  it('lets an admin rename and reloads the list', async () => {
    setRole('admin');
    render(<LibraryPicker onInsert={vi.fn()} />);
    fireEvent.click(await screen.findByRole('button', { name: 'Rename Promo' }));
    fireEvent.change(screen.getByLabelText('New name for Promo'), { target: { value: ' Spring ' } });
    items = [{ ...summary, name: 'Spring' }];
    fireEvent.click(screen.getByRole('button', { name: 'Save' }));
    expect(await screen.findByRole('button', { name: 'Insert Spring' })).toBeTruthy();
    const [url, init] = calls('PUT')[0];
    expect(url).toBe('/api/admin/custom-html/library/lib1');
    expect(JSON.parse((init as any).body)).toEqual({ name: 'Spring' });
  });

  it('deletes only after confirmation', async () => {
    setRole('admin');
    const confirm = vi.spyOn(window, 'confirm').mockReturnValue(false);
    render(<LibraryPicker onInsert={vi.fn()} />);
    const remove = await screen.findByRole('button', { name: 'Delete Promo' });
    fireEvent.click(remove);
    expect(calls('DELETE')).toHaveLength(0);
    confirm.mockReturnValue(true);
    items = [];
    fireEvent.click(remove);
    expect(await screen.findByText('No saved sections yet')).toBeTruthy();
    expect(calls('DELETE')).toHaveLength(1);
  });

  it('filters by the search term and shows load errors', async () => {
    const view = render(<LibraryPicker search="zzz" onInsert={vi.fn()} />);
    expect(await screen.findByText('No sections found')).toBeTruthy();
    view.rerender(<LibraryPicker search="banner" onInsert={vi.fn()} />);
    expect(screen.getByRole('button', { name: 'Insert Promo' })).toBeTruthy();
    view.unmount();
    fetchMock.mockImplementation(async () => json({ success: false, error: 'boom' }, 500));
    render(<LibraryPicker onInsert={vi.fn()} />);
    expect((await screen.findByRole('alert')).textContent).toContain('boom');
  });

  it('reloads after a save elsewhere and stops listening after unmount', async () => {
    const view = render(<LibraryPicker onInsert={vi.fn()} />);
    await screen.findByRole('button', { name: 'Insert Promo' });
    items = [summary, { ...summary, id: 'lib2', name: 'Second' }];
    await act(async () => {
      await createLibraryItem({ name: 'Second', data: makeFixture() });
    });
    expect(await screen.findByRole('button', { name: 'Insert Second' })).toBeTruthy();
    view.unmount();
    const before = calls('GET').length;
    await createLibraryItem({ name: 'Third', data: makeFixture() });
    expect(calls('GET')).toHaveLength(before);
  });
});

describe('SectionLibrary Custom HTML category', () => {
  /** The category header only: some static template cards also mention "custom HTML". */
  const header = { name: /^Custom HTML\s*▶$/ };

  it('lists saved templates when inserting is allowed, fetching only once expanded', async () => {
    render(<SectionLibrary onAddSection={vi.fn()} onInsertSection={vi.fn()} />);
    expect(fetchMock).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole('button', header));
    expect(await screen.findByRole('button', { name: 'Insert Promo' })).toBeTruthy();
  });

  it('is hidden where custom HTML is not allowed (blog builder)', () => {
    render(<SectionLibrary onAddSection={vi.fn()} />);
    expect(screen.queryByRole('button', header)).toBeNull();
  });
});

describe('property panel "Save to library"', () => {
  const section = (data: unknown) => ({ id: 'sec1', type: 'custom-html', order: 0, data }) as unknown as SectionConfig;

  it('is hidden for editors', () => {
    setRole('editor');
    render(<CustomHtmlPropertyPanel section={section(makeFixture())} onUpdate={vi.fn()} />);
    expect(screen.queryByRole('button', { name: 'Save to library' })).toBeNull();
  });

  it('posts the name, description and section data', async () => {
    setRole('admin');
    const onUpdate = vi.fn();
    render(<CustomHtmlPropertyPanel section={section(makeFixture())} onUpdate={onUpdate} />);
    fireEvent.click(screen.getByRole('button', { name: 'Save to library' }));
    expect((screen.getByLabelText('Library name') as HTMLInputElement).value).toBe('Promo banner');
    fireEvent.change(screen.getByLabelText('Library name'), { target: { value: 'Reusable' } });
    fireEvent.change(screen.getByLabelText('Description (optional)'), { target: { value: 'Blue' } });
    fireEvent.click(screen.getByRole('button', { name: 'Save' }));
    expect(await screen.findByText('Saved to library.')).toBeTruthy();
    const [url, init] = calls('POST')[0];
    expect(url).toBe('/api/admin/custom-html/library');
    expect(JSON.parse((init as any).body)).toMatchObject({ name: 'Reusable', description: 'Blue', data: { name: 'Promo banner' } });
    expect(onUpdate).not.toHaveBeenCalled();
  });

  it('shows the server error', async () => {
    setRole('admin');
    fetchMock.mockImplementation(async () => json({ success: false, error: 'Forbidden' }, 403));
    render(<CustomHtmlPropertyPanel section={section(makeFixture())} onUpdate={vi.fn()} />);
    fireEvent.click(screen.getByRole('button', { name: 'Save to library' }));
    fireEvent.click(screen.getByRole('button', { name: 'Save' }));
    expect((await screen.findByRole('alert')).textContent).toBe('Forbidden');
  });
});

describe('import wizard "Save to library"', () => {
  const compile = async (r: CompileRequest): Promise<CompileResult> => ({ cssScoped: r.css, scope: 'abcdef0123', warnings: [] });

  function toDetails() {
    fireEvent.change(screen.getByLabelText('HTML source'), { target: { value: '<section><h1>Title</h1></section>' } });
    fireEvent.click(screen.getByRole('button', { name: 'Analyze' }));
    fireEvent.click(screen.getByRole('button', { name: /Next: map fields/ }));
    fireEvent.click(screen.getByRole('button', { name: /Next: details/ }));
    fireEvent.change(screen.getByLabelText(/Section name/), { target: { value: 'Hero' } });
  }

  it('does not save unless ticked', async () => {
    setRole('admin');
    const save = vi.fn();
    const onInsert = vi.fn();
    render(<ImportWizard isOpen onClose={vi.fn()} onInsert={onInsert} compile={compile} saveToLibrary={save} />);
    toDetails();
    fireEvent.click(screen.getByRole('button', { name: 'Insert section' }));
    await waitFor(() => expect(onInsert).toHaveBeenCalled());
    expect(save).not.toHaveBeenCalled();
  });

  it('saves the assembled data when ticked, then inserts', async () => {
    setRole('admin');
    const save = vi.fn(async () => undefined);
    const onInsert = vi.fn();
    render(<ImportWizard isOpen onClose={vi.fn()} onInsert={onInsert} compile={compile} saveToLibrary={save} />);
    toDetails();
    fireEvent.click(screen.getByRole('checkbox', { name: /Save to library/ }));
    fireEvent.click(screen.getByRole('button', { name: 'Insert section' }));
    await waitFor(() => expect(onInsert).toHaveBeenCalled());
    expect(save).toHaveBeenCalledWith({ name: 'Hero', data: (onInsert.mock.calls[0][0] as any).data });
  });

  it('stays open and inserts nothing when saving fails', async () => {
    setRole('admin');
    const save = vi.fn(async () => {
      throw new Error('offline');
    });
    const onInsert = vi.fn();
    const onClose = vi.fn();
    render(<ImportWizard isOpen onClose={onClose} onInsert={onInsert} compile={compile} saveToLibrary={save} />);
    toDetails();
    fireEvent.click(screen.getByRole('checkbox', { name: /Save to library/ }));
    fireEvent.click(screen.getByRole('button', { name: 'Insert section' }));
    expect((await screen.findByTestId('wizard-errors')).textContent).toContain('offline');
    expect(onInsert).not.toHaveBeenCalled();
    expect(onClose).not.toHaveBeenCalled();
  });
});
