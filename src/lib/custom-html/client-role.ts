/**
 * Client-side role hint for hiding code-editing UI. The server is authoritative
 * (canEditCode in src/lib/permissions.ts); this only decides what to show.
 */
export function canEditCodeClient(): boolean {
  if (typeof window === 'undefined') return false;
  return clientRole() === 'admin';
}

/** Role from localStorage.adminUser, falling back to the (unverified) JWT payload of adminToken. */
function clientRole(): string | null {
  try {
    const raw = window.localStorage.getItem('adminUser');
    if (raw) {
      const role = (JSON.parse(raw) as { role?: unknown })?.role;
      if (typeof role === 'string' && role) return role.toLowerCase();
    }
  } catch {
    /* fall through to the token */
  }
  try {
    const token = window.localStorage.getItem('adminToken');
    const payload = token?.split('.')[1];
    if (!payload) return null;
    const json = JSON.parse(atob(payload.replace(/-/g, '+').replace(/_/g, '/'))) as { role?: unknown };
    return typeof json.role === 'string' ? json.role.toLowerCase() : null;
  } catch {
    return null;
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

/** Property panel row hover → outline the field on the canvas (null clears). */
export function highlightCustomHtmlField(sectionId: string, fieldId: string | null): void {
  window.dispatchEvent(new CustomEvent(CHS_EVENTS.highlightField, { detail: { sectionId, fieldId } }));
}

/** Canvas [data-cf] hover → highlight the property panel row (null clears). */
export function hoverCustomHtmlField(sectionId: string, fieldId: string | null): void {
  window.dispatchEvent(new CustomEvent(CHS_EVENTS.hoverField, { detail: { sectionId, fieldId } }));
}

/** Window events used between the canvas, the property panel, the library and the import wizard. */
export const CHS_EVENTS = {
  /** detail: { sectionId: string; fieldId: string } — canvas click on a [data-cf] element (builder only) */
  selectField: 'chs:select-field',
  /** detail: { sectionId: string } — property panel "Edit code" → open the import wizard in edit mode */
  editCode: 'chs:edit-code',
  /** detail: { sectionId: string; fieldId: string | null } — property panel hover → canvas outline (phase 2) */
  highlightField: 'chs:highlight-field',
  /** detail: { sectionId: string; fieldId: string | null } — canvas hover → property panel row highlight */
  hoverField: 'chs:hover-field',
  /** no detail — a library item was saved, renamed or deleted */
  libraryChanged: 'chs:library-changed',
} as const;
