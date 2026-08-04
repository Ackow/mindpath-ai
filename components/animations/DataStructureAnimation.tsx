'use client';

import React, { useMemo, useState } from 'react';
import { motion } from 'framer-motion';

type Mode = 'list' | 'tuple' | 'dict' | 'set';
const modes: Array<{ id: Mode; label: string; hint: string }> = [
  { id: 'list', label: 'list', hint: '有序、可修改、允许重复' },
  { id: 'tuple', label: 'tuple', hint: '有序、不可修改' },
  { id: 'dict', label: 'dict', hint: '通过键查找值' },
  { id: 'set', label: 'set', hint: '去重和成员判断' },
];

export const DataStructureAnimation: React.FC = () => {
  const [mode, setMode] = useState<Mode>('list');
  const [items, setItems] = useState(['cat', 'dog', 'cat']);
  const [newItem, setNewItem] = useState('bird');
  const uniqueItems = useMemo(() => [...new Set(items)], [items]);
  const current = modes.find((item) => item.id === mode)!;

  return (
    <section className="my-8 rounded-2xl border border-slate-200 bg-white p-5 shadow-card" aria-label="Python 数据结构交互演示">
      <div className="mb-4"><p className="text-xs font-bold uppercase tracking-wide text-teal-700">Data Structure Lab</p><h3 className="text-base font-bold text-slate-900">选择容器，观察它如何保存数据</h3></div>
      <div className="mb-4 flex flex-wrap gap-2" role="tablist" aria-label="数据结构类型">
        {modes.map((item) => <button key={item.id} type="button" onClick={() => setMode(item.id)} className={`rounded-lg px-3 py-2 text-xs font-bold transition-colors ${mode === item.id ? 'bg-teal-600 text-white' : 'border border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100'}`} role="tab" aria-selected={mode === item.id}>{item.label}</button>)}
      </div>
      <div className="grid gap-4 lg:grid-cols-[1fr_1.35fr]">
        <div className="rounded-xl bg-slate-50 p-4"><p className="text-xs font-semibold text-teal-700">{current.hint}</p><p className="mt-2 text-sm leading-relaxed text-slate-600">{mode === 'list' && '列表保留顺序和重复项，可以通过索引修改。'}{mode === 'tuple' && '元组适合表示固定结构，例如图像的高、宽和通道数。'}{mode === 'dict' && '字典通过键找到值，适合保存配置、指标和样本字段。'}{mode === 'set' && '集合不提供索引，但能快速判断成员并自动去重。'}</p></div>
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          {mode === 'list' && <div><div className="mb-3 flex flex-wrap gap-2">{items.map((item, index) => <motion.span layout key={`${item}-${index}`} className="rounded-lg bg-teal-50 px-3 py-2 font-mono text-xs text-teal-800">[{index}] {item}</motion.span>)}</div><div className="flex gap-2"><input value={newItem} onChange={(event) => setNewItem(event.target.value)} className="min-w-0 flex-1 rounded-lg border border-slate-200 px-3 py-2 text-xs" aria-label="要追加的列表元素" /><button type="button" onClick={() => { if (newItem.trim()) setItems((currentItems) => [...currentItems, newItem.trim()]); }} className="rounded-lg bg-teal-600 px-3 py-2 text-xs font-bold text-white">追加</button></div></div>}
          {mode === 'tuple' && <div className="flex flex-wrap gap-2">{['224', '224', '3'].map((item, index) => <span key={`${item}-${index}`} className="rounded-lg bg-amber-50 px-3 py-2 font-mono text-xs text-amber-800">({index}) {item}<span className="ml-2 text-amber-500">锁定</span></span>)}</div>}
          {mode === 'dict' && <div className="space-y-2">{[['learning_rate', '0.01'], ['batch_size', '32'], ['device', 'cpu']].map(([key, value]) => <div key={key} className="flex items-center justify-between rounded-lg bg-sky-50 px-3 py-2 font-mono text-xs"><span className="text-sky-700">{key}</span><span className="text-slate-700">→ {value}</span></div>)}</div>}
          {mode === 'set' && <div><div className="mb-3 flex flex-wrap gap-2">{uniqueItems.map((item) => <motion.span layout key={item} className="rounded-full bg-violet-50 px-3 py-2 text-xs text-violet-800">{item}</motion.span>)}</div><p className="text-xs text-slate-500">原始列表：{items.join(', ')} → 去重集合：{uniqueItems.join(', ')}</p></div>}
        </div>
      </div>
    </section>
  );
};
