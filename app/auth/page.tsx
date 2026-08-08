'use client';

import { FormEvent, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { authRequest, getCurrentUser } from '@/lib/client/auth';

export default function AuthPage() {
  const router = useRouter();
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [identifier, setIdentifier] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => { void getCurrentUser().then((user) => { if (user) router.replace('/profile'); }); }, [router]);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setMessage('');
    if (mode === 'register' && password !== confirmPassword) { setMessage('两次输入的密码不一致'); return; }
    setLoading(true);
    try {
      await authRequest(mode === 'login' ? '/api/auth/login' : '/api/auth/register', mode === 'login' ? { identifier, password } : { username, email, password });
      window.dispatchEvent(new CustomEvent('ai-learning:auth-changed'));
      router.replace('/profile');
      router.refresh();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : '操作失败');
    } finally {
      setLoading(false);
    }
  };

  const fieldClass = 'mt-1.5 w-full rounded-lg border border-slate-200 px-3 py-2.5 outline-none focus:border-teal-500 dark:border-slate-700 dark:bg-slate-800';

  return (
    <main className="mx-auto flex min-h-[70vh] max-w-md items-center justify-center py-10">
      <section className="w-full rounded-2xl border border-slate-200 bg-white p-7 shadow-sm dark:border-slate-700 dark:bg-slate-900">
        <h1 className="text-2xl font-black text-slate-900 dark:text-white">{mode === 'login' ? '登录 AI 学习知识库' : '创建学习账号'}</h1>
        <p className="mt-2 text-sm text-slate-500">登录后可在不同设备同步学习进度。</p>
        <form onSubmit={submit} className="mt-6 space-y-4">
          {mode === 'login' ? (
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200">用户名或邮箱<input required value={identifier} onChange={(event) => setIdentifier(event.target.value)} className={fieldClass} /></label>
          ) : (
            <>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200">用户名<input required value={username} onChange={(event) => setUsername(event.target.value)} className={fieldClass} placeholder="2-32 位，可用中英文、数字、_ 或 -" /></label>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200">邮箱 <span className="font-normal text-slate-400">（选填）</span><input type="email" value={email} onChange={(event) => setEmail(event.target.value)} className={fieldClass} /></label>
            </>
          )}
          <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200">密码<input required minLength={8} type="password" value={password} onChange={(event) => setPassword(event.target.value)} className={fieldClass} /><span className="mt-1 block text-xs font-normal text-slate-400">至少 8 位</span></label>
          {mode === 'register' && <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200">确认密码<input required minLength={8} type="password" value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} className={fieldClass} /></label>}
          {message && <p className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700">{message}</p>}
          <button disabled={loading} className="w-full rounded-lg bg-teal-600 px-4 py-3 text-sm font-bold text-white hover:bg-teal-700 disabled:opacity-50">{loading ? '处理中…' : mode === 'login' ? '登录' : '注册并登录'}</button>
        </form>
        <button type="button" onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); setMessage(''); }} className="mt-5 w-full text-center text-sm font-semibold text-teal-700">{mode === 'login' ? '还没有账号？立即注册' : '已有账号？返回登录'}</button>
        <Link href="/" className="mt-4 block text-center text-xs text-slate-400 hover:text-teal-600">暂时返回首页</Link>
      </section>
    </main>
  );
}