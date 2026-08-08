import { Env, getSessionUser, json } from '../../_shared/auth';
export async function onRequestGet({ request, env }: { request: Request; env: Env }) { return json({ user: await getSessionUser(request, env) }); }
