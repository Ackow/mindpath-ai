'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';

type CopyMode = 'alias' | 'shallow' | 'deep';
const labels: Record<CopyMode, string> = { alias: '直接赋值', shallow: '浅拷贝 copy()', deep: '深拷贝 deepcopy()' };
const explanations: Record<CopyMode, string> = {
  alias: '两个变量指向同一个对象，修改任意一方都会影响另一方。',
  shallow: '最外层被复制，但嵌套列表仍然共享；修改内层数据会互相影响。',
  deep: '每一层嵌套对象都被复制，修改副本不会影响原对象。',
};

export const CopyRelationshipAnimation: React.FC = () => {
  const [mode, setMode] = useState<CopyMode>('alias');
  const shared = mode !== 'deep';
  return <section className="my-8 rounded-2xl border border-amber-200 bg-white p-5 shadow-card" aria-label="浅拷贝和深拷贝交互演示">
    <div className="mb-4"><p className="text-xs font-bold uppercase tracking-wide text-amber-700">Copy Lab</p><h3 className="text-base font-bold text-slate-900">浅拷贝与深拷贝：内层数据是否共享？</h3></div>
    <div className="flex flex-wrap gap-2">{(Object.keys(labels) as CopyMode[]).map((item) => <button key={item} type="button" onClick={() => setMode(item)} className={`rounded-lg px-3 py-2 text-xs font-bold ${mode === item ? 'bg-amber-600 text-white' : 'border border-slate-200 bg-slate-50 text-slate-600'}`}>{labels[item]}</button>)}</div>
    <div className="mt-5 grid gap-3 md:grid-cols-[1fr_auto_1fr] md:items-center">
      <div className="rounded-xl border border-sky-200 bg-sky-50 p-4 text-center"><code className="text-sm text-sky-900">original = [[1, 2]]</code><p className="mt-2 text-xs text-sky-700">原对象</p></div>
      <motion.div key={mode} initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} className="text-center text-2xl text-amber-600">{shared ? '↔' : '⇢'}</motion.div>
      <div className={`rounded-xl border p-4 text-center ${shared ? 'border-rose-200 bg-rose-50' : 'border-emerald-200 bg-emerald-50'}`}><code className="text-sm text-slate-900">副本 = [[1, 2]]</code><p className="mt-2 text-xs">{shared ? '内层对象共享' : '完全独立副本'}</p></div>
    </div>
    <motion.p key={mode} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-4 rounded-lg bg-slate-50 p-3 text-sm leading-relaxed text-slate-700">{explanations[mode]}</motion.p>
  </section>;
};
