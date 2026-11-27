/**
 * Custom HTML section library — admin API client (Authorization: Bearer <localStorage adminToken>).
 * Writes dispatch CHS_EVENTS.libraryChanged so an open library list reloads.
 */
import { CHS_EVENTS } from './client-role';
import type { CustomHtmlData } from './types';

export interface LibraryItemSummary {
  id: string;
  name: string;
  description: string;
  usageCount: number;
}

export interface LibraryItem extends LibraryItemSummary {
  data: CustomHtmlData;
}

const BASE = '/api/admin/custom-html/library';

async function call<T>(url: string, method: 'GET' | 'POST' | 'PUT' | 'DELETE', body?: unknown): Promise<T> {
  let token = '';
  try {
    token = window.localStorage.getItem('adminToken') ?? '';
  } catch {
    /* ignore */
  }
  const res = await fetch(url, {
    method,
    cache: 'no-store',
    headers: {
      ...(body !== undefined ? { 'Content-Type': 'application/json' } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
  });
  let json: { success?: boolean; error?: string } = {};
  try {
    json = await res.json();
  } catch {
    /* non-JSON response */
  }
  if (!res.ok || json.success !== true) throw new Error(json.error || `Library request failed (HTTP ${res.status})`);
  return json as T;
}

function changed(): void {
  window.dispatchEvent(new CustomEvent(CHS_EVENTS.libraryChanged));
}

const itemUrl = (id: string) => `${BASE}/${encodeURIComponent(id)}`;

export async function listLibrary(): Promise<LibraryItemSummary[]> {
  const res = await call<{ items?: LibraryItemSummary[] }>(BASE, 'GET');
  return Array.isArray(res.items) ? res.items : [];
}

/** Fetches a copy to place on a page (counts as one use). */
export async function fetchLibraryItemForInsert(id: string): Promise<LibraryItem> {
  const res = await call<{ item: LibraryItem }>(`${itemUrl(id)}?insert=1`, 'GET');
  return res.item;
}

export async function createLibraryItem(input: { name: string; description?: string; data: CustomHtmlData }): Promise<LibraryItemSummary> {
  const res = await call<{ item: LibraryItemSummary }>(BASE, 'POST', input);
  changed();
  return res.item;
}

export async function updateLibraryItem(id: string, patch: { name?: string; description?: string }): Promise<void> {
  await call(itemUrl(id), 'PUT', patch);
  changed();
}

export async function deleteLibraryItem(id: string): Promise<void> {
  await call(itemUrl(id), 'DELETE');
  changed();
}
