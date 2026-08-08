import { setAuthUser } from '@/lib/client/require-auth';

export type AuthUser = { id: string; email: string; nickname: string; avatar?: string | null };

export async function getCurrentUser(): Promise<AuthUser | null> {
  const response = await fetch('/api/auth/me', { credentials: 'include' });
  if (!response.ok) return null;
  const data = await response.json() as { user?: AuthUser | null };
  return data.user || null;
}

export async function authRequest(path: string, body: Record<string, unknown>) {
  const response = await fetch(path, { method: 'POST', credentials: 'include', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(typeof data.error === 'string' ? data.error : '请求失败');
  if (data.user) setAuthUser(data.user);
  return data as { user: AuthUser };
}
