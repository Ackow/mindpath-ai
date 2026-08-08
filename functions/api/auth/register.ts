import { createSession, Env, hashPassword, json, readJson, sessionCookie, validateEmail, validatePassword, validateUsername } from '../../_shared/auth';

export async function onRequestPost({ request, env }: { request: Request; env: Env }) {
  const body = await readJson(request);
  const username = typeof body.username === 'string' ? body.username.trim() : '';
  const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : '';
  const password = body.password;
  if (!validateUsername(username) || !validateEmail(email) || !validatePassword(password)) {
    return json({ error: '用户名为 2-32 位字符；邮箱可选；密码至少 8 位' }, { status: 400 });
  }
  const existing = await env.DB.prepare('SELECT id FROM users WHERE username = ? OR (email = ? AND ? <> \'\')').bind(username, email, email).first();
  if (existing) return json({ error: '用户名或邮箱已被使用' }, { status: 409 });
  const { salt, hash } = await hashPassword(password as string);
  const userId = crypto.randomUUID();
  const storedEmail = email || `${userId}@local.invalid`;
  await env.DB.prepare('INSERT INTO users (id, email, username, password_hash, password_salt, nickname) VALUES (?, ?, ?, ?, ?, ?)')
    .bind(userId, storedEmail, username, hash, salt, username).run();
  return json({ user: { id: userId, username, nickname: username } }, { headers: { 'Set-Cookie': sessionCookie(await createSession(userId, env)) } });
}