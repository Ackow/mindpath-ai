export type Env = { DB: any };
type SessionUser = { id: string; email: string; nickname: string; avatar?: string | null };
const encoder = new TextEncoder();
function bytesToBase64(bytes: Uint8Array) { let binary = ''; bytes.forEach((byte) => { binary += String.fromCharCode(byte); }); return btoa(binary); }
function base64ToBytes(value: string) {
  const normalized = value.replace(/-/g, '+').replace(/_/g, '/').padEnd(Math.ceil(value.length / 4) * 4, '=');
  const binary = atob(normalized);
  return Uint8Array.from(binary, (char) => char.charCodeAt(0));
}
export function randomToken(size = 32) { const bytes = crypto.getRandomValues(new Uint8Array(size)); return bytesToBase64(bytes).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, ''); }
export async function hashValue(value: string) { const digest = await crypto.subtle.digest('SHA-256', encoder.encode(value)); return bytesToBase64(new Uint8Array(digest)); }
export async function hashPassword(password: string, salt = randomToken(16)) {
  const saltBytes = base64ToBytes(salt);
  const key = await crypto.subtle.importKey('raw', encoder.encode(password), { name: 'PBKDF2' }, false, ['deriveBits']);
  const bits = await crypto.subtle.deriveBits({ name: 'PBKDF2', salt: saltBytes, iterations: 120000, hash: 'SHA-256' }, key, 256);
  return { salt, hash: bytesToBase64(new Uint8Array(bits)) };
}
export async function verifyPassword(password: string, salt: string, expectedHash: string) { return (await hashPassword(password, salt)).hash === expectedHash; }
export function json(data: unknown, init: ResponseInit = {}) { return new Response(JSON.stringify(data), { ...init, headers: { 'Content-Type': 'application/json; charset=utf-8', ...(init.headers || {}) } }); }
export function readJson(request: Request) { return request.json() as Promise<Record<string, unknown>>; }
export async function getSessionUser(request: Request, env: Env): Promise<SessionUser | null> { const token = request.headers.get('Cookie')?.match(/(?:^|;\s*)session=([^;]+)/)?.[1]; if (!token) return null; const row = await env.DB.prepare("SELECT u.id, u.email, u.nickname, u.avatar FROM sessions s JOIN users u ON u.id = s.user_id WHERE s.token_hash = ? AND s.expires_at > datetime('now')").bind(await hashValue(token)).first(); return row ? row as SessionUser : null; }
export async function createSession(userId: string, env: Env) { const token = randomToken(32); await env.DB.prepare("INSERT INTO sessions (id, user_id, token_hash, expires_at) VALUES (?, ?, ?, datetime('now', '+30 days'))").bind(randomToken(16), userId, await hashValue(token)).run(); return token; }
export function sessionCookie(token: string) { return `session=${token}; Path=/; Max-Age=2592000; HttpOnly; Secure; SameSite=Lax`; }
export function clearSessionCookie() { return 'session=; Path=/; Max-Age=0; HttpOnly; Secure; SameSite=Lax'; }
export function validatePassword(password: unknown) { return typeof password === 'string' && password.length >= 8; }
export function validateEmail(email: unknown) { return typeof email === 'string' && (!email || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)); }
export function validateUsername(username: unknown) { return typeof username === 'string' && /^[\p{L}\p{N}_-]{2,32}$/u.test(username); }
