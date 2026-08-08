import { Env, getSessionUser, json, readJson } from '../_shared/auth';

export async function onRequestGet({ request, env }: { request: Request; env: Env }) {
  const user = await getSessionUser(request, env);
  if (!user) return json({ error: 'Login required' }, { status: 401 });
  const url = new URL(request.url);
  const documentId = url.searchParams.get('documentId');
  const quizKey = url.searchParams.get('quizKey');
  if (!documentId || !quizKey) return json({ error: 'Missing quiz identifier' }, { status: 400 });
  const quiz = await env.DB.prepare('SELECT payload FROM quiz_progress WHERE user_id = ? AND document_id = ? AND quiz_key = ?').bind(user.id, documentId, quizKey).first();
  return json({ quiz });
}

export async function onRequestPut({ request, env }: { request: Request; env: Env }) {
  const user = await getSessionUser(request, env);
  if (!user) return json({ error: 'Login required' }, { status: 401 });
  const body = await readJson(request);
  const documentId = typeof body.documentId === 'string' ? body.documentId.slice(0, 500) : '';
  const quizKey = typeof body.quizKey === 'string' ? body.quizKey.slice(0, 500) : '';
  if (!documentId || !quizKey || !body.payload || typeof body.payload !== 'object') return json({ error: 'Invalid quiz progress' }, { status: 400 });
  await env.DB.prepare("INSERT INTO quiz_progress (user_id, document_id, quiz_key, payload, updated_at) VALUES (?, ?, ?, ?, datetime('now')) ON CONFLICT(user_id, document_id, quiz_key) DO UPDATE SET payload = excluded.payload, updated_at = excluded.updated_at")
    .bind(user.id, documentId, quizKey, JSON.stringify(body.payload)).run();
  return json({ ok: true });
}
