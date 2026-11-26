/**
 * Custom HTML section — CSS compile endpoint (admin only).
 * Spec: docs/custom-html-section-spec.md §7.2
 */
import { NextRequest, NextResponse } from 'next/server';
import { authorizeCode } from '@/lib/api-auth';
import { compileCss } from '@/lib/custom-html/css-scope';
import { CUSTOM_HTML_LIMITS } from '@/lib/custom-html/types';

export const runtime = 'nodejs';

function bad(error: string) {
  return NextResponse.json({ success: false, error }, { status: 400 });
}

export async function POST(request: NextRequest) {
  const auth = authorizeCode(request);
  if (!auth.ok) {
    return NextResponse.json({ success: false, error: 'Forbidden' }, { status: auth.response.status });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return bad('Invalid JSON body');
  }
  if (!body || typeof body !== 'object') return bad('Invalid body');
  const { html, css, js, tailwind } = body as Record<string, unknown>;

  if (typeof html !== 'string' || typeof css !== 'string') return bad('html and css must be strings');
  if (js !== undefined && typeof js !== 'string') return bad('js must be a string');
  if (html.length > CUSTOM_HTML_LIMITS.html) return bad('html is too large');
  if (css.length > CUSTOM_HTML_LIMITS.css) return bad('css is too large');
  if (typeof js === 'string' && js.length > CUSTOM_HTML_LIMITS.js) return bad('js is too large');

  let tw: { enabled: boolean; config?: Record<string, unknown> } | undefined;
  if (tailwind !== undefined && tailwind !== null) {
    if (typeof tailwind !== 'object' || Array.isArray(tailwind)) return bad('tailwind must be an object');
    const t = tailwind as { enabled?: unknown; config?: unknown };
    if (t.config !== undefined && (typeof t.config !== 'object' || t.config === null || Array.isArray(t.config))) {
      return bad('tailwind.config must be an object');
    }
    tw = { enabled: t.enabled === true, config: t.config as Record<string, unknown> | undefined };
  }

  const result = await compileCss({ html, css, js: js as string | undefined, tailwind: tw });
  return NextResponse.json({ success: true, ...result });
}
