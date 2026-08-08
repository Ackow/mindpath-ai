import { createSession, Env, json, readJson, sessionCookie, validatePassword, verifyPassword } from '../../_shared/auth';

export async function onRequestPost({ request, env }: { request: Request; env: Env }) {
  const body = await readJson(request);
  const identifier = typeof body.identifier === 'string' ? body.identifier.trim() : '';
  const password = body.password;
  if (!identifier || !validatePassword(password)) return json({ error: '请输入用户名（或邮箱）和密码' }, { status: 400 });
  const user = await env.DB.prepare('SELECT id, email, username, nickname, avatar, password_hash, password_salt FROM users WHERE username = ? OR email = ?').bind(identifier, identifier.toLowerCase()).first();
  if (!user || !(await verifyPassword(password as string, user.password_salt, user.password_hash))) return json({ error: '用户名或密码错误' }, { status: 401 });
  return json({ user: { id: user.id, username: user.username, nickname: user.nickname, avatar: user.avatar } }, { headers: { 'Set-Cookie': sessionCookie(await createSession(user.id, env)) } });
}