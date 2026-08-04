'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { Background, Controls, MarkerType, Position, ReactFlow, type Edge, type Node } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { Pause, Play, RotateCcw, SkipBack, SkipForward } from 'lucide-react';

type LoopNodeId = 'start' | 'condition' | 'body' | 'update' | 'end';

const info: Record<LoopNodeId, { title: string; code: string; detail: string }> = {
  start: { title: '初始化', code: 'i = 0', detail: '循环开始前，先准备初始状态。' },
  condition: { title: '循环条件', code: 'i < limit', detail: '每轮开始先判断条件；为假时自然结束循环。' },
  body: { title: '循环体', code: 'process(items[i])', detail: '处理当前项。continue 会直接进入更新步骤；break 会直接退出。' },
  update: { title: '更新状态', code: 'i += 1', detail: '更新 i，随后回到条件节点开始下一轮。' },
  end: { title: '循环结束', code: 'print("done")', detail: '条件不成立或触发 break 后，继续执行循环后的代码。' },
};

const positions: Record<LoopNodeId, { x: number; y: number }> = {
  start: { x: 290, y: 0 }, condition: { x: 290, y: 130 }, body: { x: 290, y: 270 }, update: { x: 290, y: 410 }, end: { x: 590, y: 270 },
};

const edgesSpec: Array<[LoopNodeId, LoopNodeId, string]> = [
  ['start', 'condition', '进入循环'], ['condition', 'body', '是'], ['condition', 'end', '否'], ['body', 'update', '处理完'], ['body', 'end', 'break'], ['update', 'condition', '下一轮'],
];

export const LoopFlowAnimation: React.FC = () => {
  const [limit, setLimit] = useState(3);
  const [step, setStep] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);
  const path: LoopNodeId[] = ['start', 'condition', 'body', 'update', 'condition', 'end'];
  const activeId = path[step];
  const previousId = step > 0 ? path[step - 1] : null;

  useEffect(() => {
    if (!playing) return;
    const timer = window.setInterval(() => setStep((value) => {
      if (value >= path.length - 1) { setPlaying(false); return value; }
      return value + 1;
    }), 1500 / speed);
    return () => window.clearInterval(timer);
  }, [playing, speed]);

  const nodes = useMemo<Node[]>(() => (Object.keys(positions) as LoopNodeId[]).map((id) => {
    const current = id === activeId;
    const node = info[id];
    return { id, position: positions[id], sourcePosition: Position.Bottom, targetPosition: Position.Top, style: { background: 'transparent', border: 'none', padding: 0, opacity: path.includes(id) ? 1 : 0.55 }, data: { label: <div className={`min-w-[150px] rounded-xl border p-3 ${current ? 'border-sky-500 bg-sky-50 shadow-lg shadow-sky-100' : 'border-slate-200 bg-white'}`}><div className={`text-[10px] font-bold ${current ? 'text-sky-700' : 'text-slate-400'}`}>{path.indexOf(id) >= 0 ? path.indexOf(id) + 1 : '-'}</div><div className="mt-1 text-xs font-bold text-slate-900">{node.title}</div><code className="mt-1 block text-[10px] text-slate-500">{id === 'condition' ? `i < ${limit}` : node.code}</code></div> } };
  }), [activeId, limit]);

  const edges = useMemo<Edge[]>(() => edgesSpec.map(([source, target, label]) => {
    const active = previousId === source && activeId === target;
    return { id: `${source}-${target}`, source, target, label, animated: active, markerEnd: { type: MarkerType.ArrowClosed, color: active ? '#0369a1' : '#94a3b8' }, style: { stroke: active ? '#0369a1' : '#cbd5e1', strokeWidth: active ? 3 : 2 }, labelStyle: { fill: '#64748b', fontSize: 11 }, labelBgStyle: { fill: '#f8fafc' } };
  }), [activeId, previousId]);

  const reset = () => { setStep(0); setPlaying(false); setLimit(3); };
  return <section className="my-8 rounded-2xl border border-slate-200 bg-white p-5 shadow-card" aria-label="循环逻辑流程图动画">
    <div className="mb-4 flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3"><div><p className="text-xs font-bold uppercase tracking-wide text-sky-700">Loop Flow Animation</p><h3 className="text-base font-bold text-slate-900">for 循环如何回到下一轮？</h3><p className="mt-1 text-xs text-slate-500">滚轮可缩放画布；当前执行边会在步骤切换时流动。</p></div><div className="flex items-center gap-1"><button onClick={() => setStep((value) => Math.max(0, value - 1))} className="rounded-lg p-2 text-slate-600 hover:bg-slate-100" aria-label="上一步"><SkipBack className="h-4 w-4" /></button><button onClick={() => setPlaying((value) => !value)} className="rounded-lg bg-sky-600 p-2 text-white hover:bg-sky-700" aria-label={playing ? '暂停' : '播放'}>{playing ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}</button><button onClick={() => setStep((value) => Math.min(path.length - 1, value + 1))} className="rounded-lg p-2 text-slate-600 hover:bg-slate-100" aria-label="下一步"><SkipForward className="h-4 w-4" /></button><button onClick={reset} className="rounded-lg p-2 text-slate-600 hover:bg-slate-100" aria-label="重置"><RotateCcw className="h-4 w-4" /></button><select value={speed} onChange={(event) => setSpeed(Number(event.target.value))} className="ml-2 rounded-lg border border-slate-200 px-2 py-1 text-xs text-slate-700" aria-label="播放速度"><option value={0.5}>0.5x</option><option value={1}>1x</option><option value={2}>2x</option></select></div></div>
    <label className="mb-4 block max-w-xs text-xs font-semibold text-slate-700">循环次数上限<input type="number" min="1" max="10" value={limit} onChange={(event) => { setLimit(Number(event.target.value)); setPlaying(false); setStep(0); }} className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 font-mono text-sm" /></label>
    <div className="rounded-xl border border-slate-200 bg-slate-50 p-3"><div className="h-[570px] w-full rounded-lg bg-white"><ReactFlow nodes={nodes} edges={edges} fitView fitViewOptions={{ padding: 0.25 }} nodesDraggable={false} nodesConnectable={false} zoomOnScroll minZoom={0.7} maxZoom={1.6} onNodeClick={(_, node) => { const index = path.indexOf(node.id as LoopNodeId); if (index >= 0) { setPlaying(false); setStep(index); } }}><Background color="#e2e8f0" gap={24} /><Controls showInteractive={false} /></ReactFlow></div><div className="mt-3 rounded-lg border border-slate-200 bg-white p-3"><div className="text-xs font-semibold text-sky-700">当前模块：{info[activeId].title}</div><div className="mt-1 font-mono text-sm text-slate-900">&gt;&gt;&gt; {activeId === 'condition' ? `i < ${limit}` : info[activeId].code}</div><p className="mt-2 text-xs leading-relaxed text-slate-500">{info[activeId].detail}</p></div></div>
  </section>;
};
