import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { verifyToken } from './auth';

export async function requireAuth() {
  const cookieStore = await cookies();
  const token = cookieStore.get('auth-token')?.value;

  console.log('[requireAuth] Token exists:', !!token);

  if (!token) {
    console.log('[requireAuth] No token, redirecting to login');
    redirect('/admin/login');
  }

  const user = verifyToken(token);
  console.log('[requireAuth] User verified:', !!user);
  
  if (!user) {
    console.log('[requireAuth] Invalid token, redirecting to login');
    redirect('/admin/login');
  }

  return user;
}

export async function getAuthUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get('auth-token')?.value;

  if (!token) {
    return null;
  }

  return verifyToken(token);
}
