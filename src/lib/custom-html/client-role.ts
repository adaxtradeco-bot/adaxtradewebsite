/**
 * Client-side role hint for hiding code-editing UI. The server is authoritative
 * (canEditCode in src/lib/permissions.ts); this only decides what to show.
 */
export function canEditCodeClient(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    const raw = window.localStorage.getItem('adminUser');
    if (!raw) return false;
    const user = JSON.parse(raw) as { role?: unknown };
    return user?.role === 'admin';
  } catch {
    return false;
  }
}

type PendingField = { sectionId: string; fieldId: string; at: number };
let pendingField: PendingField | null = null;

/**
 * Dispatches CHS_EVENTS.selectField and remembers it briefly, so a property panel that
 * mounts right after the click (section was not selected yet) can still pick it up.
 */
export function selectCustomHtmlField(sectionId: string, fieldId: string): void {
  pendingField = { sectionId, fieldId, at: Date.now() };
  window.dispatchEvent(new CustomEvent(CHS_EVENTS.selectField, { detail: { sectionId, fieldId } }));
}

/** Returns and clears a field selected for this section within the last 2 s. */
export function takePendingField(sectionId: string): string | null {
  const p = pendingField;
  if (!p || p.sectionId !== sectionId || Date.now() - p.at > 2000) return null;
  pendingField = null;
  return p.fieldId;
}

/** Window events used between the canvas, the property panel and the import wizard. */
export const CHS_EVENTS = {
  /** detail: { sectionId: string; fieldId: string } — canvas click on a [data-cf] element (builder only) */
  selectField: 'chs:select-field',
  /** detail: { sectionId: string } — property panel "Edit code" → open the import wizard in edit mode */
  editCode: 'chs:edit-code',
  /** detail: { sectionId: string; fieldId: string | null } — property panel hover → canvas outline (phase 2) */
  highlightField: 'chs:highlight-field',
} as const;
