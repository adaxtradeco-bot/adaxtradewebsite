import { NextRequest, NextResponse } from 'next/server';
import { verifyToken, AuthUser } from '@/lib/auth';
import { getPermissions } from '@/lib/permissions';

type AuthResult =
  | { ok: true; user: AuthUser }
  | { ok: false; response: NextResponse };

function unauthorized(): AuthResult {
  return { ok: false, response: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) };
}
function forbidden(): AuthResult {
  return { ok: false, response: NextResponse.json({ error: 'Forbidden' }, { status: 403 }) };
}

export function authenticateRequest(request: NextRequest): AuthResult {
  const authHeader = request.headers.get('authorization');
  const token = authHeader?.replace('Bearer ', '');
  const user = token ? verifyToken(token) : null;
  return user ? { ok: true, user } : unauthorized();
}

export function authorizeDelete(request: NextRequest): AuthResult {
  const auth = authenticateRequest(request);
  if (!auth.ok) return auth;
  return getPermissions(auth.user.role).canDelete ? auth : forbidden();
}

export function authorizeUserManagement(request: NextRequest): AuthResult {
  const auth = authenticateRequest(request);
  if (!auth.ok) return auth;
  return getPermissions(auth.user.role).canManageUsers ? auth : forbidden();
}

export function authorizeSettings(request: NextRequest): AuthResult {
  const auth = authenticateRequest(request);
  if (!auth.ok) return auth;
  return getPermissions(auth.user.role).canManageSettings ? auth : forbidden();
}
