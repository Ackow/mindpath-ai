'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { Background, Controls, MarkerType, Position, ReactFlow, type Edge, type Node } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { Pause, Play, RotateCcw, SkipBack, SkipForward } from 'lucide-react';

type NodeId = 'input' | 'if' | 'elif' | 'excellent' | 'passed' | 'review' | 'end';

const nodeInfo: Record<NodeId, { title: string; code: string; detail: string }> = {
  input: { title: '读取输入', code: 'score = 72', detail: '取得分数，准备进入第一个条件判断。' },
  if: { title: 'if 判断', code: 'score >= 90', detail: '条件为真走“优秀”；条件为假继续检查 elif。' },
  elif: { title: 'elif 判断', code: 'score >= threshold', detail: '只有 if 为假时才会来到这里。' },
  excellent: { title: '优秀分支', code: 'result = "优秀"', detail: 'if 条件成立，执行这一分支后直接结束选择。' },
  passed: { title: '及格分支', code: 'result = "及格"', detail: 'elif 条件成立，执行这一分支后直接结束选择。' },
  review: { title: 'else 分支', code: 'result = "需要复习"', detail: '前面的条件都不成立时，执行兜底分支。' },
  end: { title: '输出结果', code: 'print(result)', detail: '分支选择结束，输出最终结果。' },
};

const basePositions: Record<NodeId, { x: number; y: number }> = {
  input: { x: 300, y: 0 },
  if: { x: 300, y: 130 },
  elif: { x: 70, y: 280 },
  excellent: { x: 530, y: 280 },
  passed: { x: 300, y: 430 },
  review: { x: 70, y: 430 },
  end: { x: 300, y: 580 },
};

const edgeSpecs: Array<[NodeId, NodeId, string]> = [
  ['input', 'if', '进入判断'], ['if', 'excellent', '是'], ['if', 'elif', '否'],
  ['elif', 'passed', '是'], ['elif', 'review', '否'], ['excellent', 'end', '输出'],
  ['passed', 'end', '输出'], ['review', 'end', '输出'],
];

export const FlowControlAnimation: React.FC = () => {
  const [score, setScore] = useState(72);
  const [threshold, setThreshold] = useState(60);
  const [step, setStep] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);

  const branch = score >= 90 ? '优秀' : score >= threshold ? '及格' : '需要复习';
  const path = useMemo<NodeId[]>(() => score >= 90 ? ['input', 'if', 'excellent', 'end'] : score >= threshold ? ['input', 'if', 'elif', 'passed', 'end'] : ['input', 'if', 'elif', 'review', 'end'], [score, threshold]);
  const activeId = path[Math.min(step, path.length - 1)];
  const previousId = step > 0 ? path[step - 1] : null;

  useEffect(() => {
    if (!playing) return;
    const timer = window.setInterval(() => setStep((current) => {
      if (current >= path.length - 1) { setPlaying(false); return current; }
      return current + 1;
    }), 1600 / speed);
    return () => window.clearInterval(timer);
  }, [path, playing, speed]);

  const nodes = useMemo<Node[]>(() => (Object.keys(basePositions) as NodeId[]).map((id) => {
    const info = nodeInfo[id];
    const active = id === activeId;
    const visited = path.includes(id);
    return {
      id,
      position: basePositions[id],
      data: { label: <div className={`min-w-[148px] rounded-xl border p-3 ${active ? 'border-teal-500 bg-teal-50 shadow-lg shadow-teal-100' : 'border-slate-200 bg-white'}`}><div className={`text-[10px] font-bold ${active ? 'text-teal-700' : 'text-slate-400'}`}>{visited ? path.indexOf(id) + 1 : '-'}</div><div className="mt-1 text-xs font-bold text-slate-900">{info.title}</div><code className="mt-1 block text-[10px] text-slate-500">{id === 'input' ? `score = ${score}` : id === 'elif' ? `score >= ${threshold}` : id === 'excellent' ? 'result = "优秀"' : id === 'passed' ? 'result = "及格"' : id === 'review' ? 'result = "需要复习"' : info.code}</code></div> },
      style: { background: 'transparent', border: 'none', padding: 0, opacity: visited ? 1 : 0.55 },
      sourcePosition: Position.Bottom,
      targetPosition: Position.Top,
    };
  }), [activeId, path, score, threshold]);

  const edges = useMemo<Edge[]>(() => edgeSpecs.map(([source, target, label]) => {
    const isActive = previousId === source && activeId === target;
    return { id: `${source}-${target}`, source, target, label, animated: isActive, markerEnd: { type: MarkerType.ArrowClosed, color: isActive ? '#0f766e' : '#94a3b8' }, style: { stroke: isActive ? '#0f766e' : '#cbd5e1', strokeWidth: isActive ? 3 : 2 }, labelStyle: { fill: '#64748b', fontSize: 11 }, labelBgStyle: { fill: '#f8fafc' } };
  }), [activeId, previousId]);

  const reset = () => { setPlaying(false); setStep(0); setScore(72); setThreshold(60); };
  const updateInput = (setter: (value: number) => void, value: string) => { setter(Number(value)); setPlaying(false); setStep(0); };

  return (
    <section className="my-8 rounded-2xl border border-slate-200 bg-white p-5 shadow-card" aria-label="条件分支流程图动画">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3"><div><p className="text-xs font-bold uppercase tracking-wide text-teal-700">React Flow Animation</p><h3 className="text-base font-bold text-slate-900">if / elif / else 执行流程</h3><p className="mt-1 text-xs text-slate-500">React Flow 管理节点与连线；切换下一步时，当前连线会流动。</p></div><div className="flex items-center gap-1"><button onClick={() => setStep((value) => Math.max(0, value - 1))} className="rounded-lg p-2 text-slate-600 hover:bg-slate-100" aria-label="上一步"><SkipBack className="h-4 w-4" /></button><button onClick={() => setPlaying((value) => !value)} className="rounded-lg bg-teal-600 p-2 text-white hover:bg-teal-700" aria-label={playing ? '暂停' : '播放'}>{playing ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}</button><button onClick={() => setStep((value) => Math.min(path.length - 1, value + 1))} className="rounded-lg p-2 text-slate-600 hover:bg-slate-100" aria-label="下一步"><SkipForward className="h-4 w-4" /></button><button onClick={reset} className="rounded-lg p-2 text-slate-600 hover:bg-slate-100" aria-label="重置"><RotateCcw className="h-4 w-4" /></button><select value={speed} onChange={(event) => setSpeed(Number(event.target.value))} className="ml-2 rounded-lg border border-slate-200 px-2 py-1 text-xs text-slate-700" aria-label="播放速度"><option value={0.5}>0.5x</option><option value={1}>1x</option><option value={1.5}>1.5x</option><option value={2}>2x</option></select></div></div>
      <div className="mb-4 grid gap-3 rounded-xl bg-slate-50 p-3 sm:grid-cols-2"><label className="text-xs font-semibold text-slate-700">输入分数<input type="number" min="0" max="100" value={score} onChange={(event) => updateInput(setScore, event.target.value)} className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 font-mono text-sm" /></label><label className="text-xs font-semibold text-slate-700">及格阈值<input type="number" min="0" max="100" value={threshold} onChange={(event) => updateInput(setThreshold, event.target.value)} className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 font-mono text-sm" /></label></div>
      <div className="rounded-xl border border-slate-200 bg-slate-50 p-3"><div className="mb-2 flex flex-wrap items-center justify-between gap-2 text-xs"><span className="font-semibold text-teal-700">当前路径：{path.map((id) => nodeInfo[id].title).join(' → ')}</span><span className="rounded-full border border-slate-200 bg-white px-2 py-1 text-slate-600">结果：{branch}</span></div><div className="h-[650px] w-full rounded-lg bg-white"><ReactFlow nodes={nodes} edges={edges} fitView fitViewOptions={{ padding: 0.2 }} nodesDraggable={false} nodesConnectable={false} zoomOnScroll minZoom={0.7} maxZoom={1.6} onNodeClick={(_, node) => { const index = path.indexOf(node.id as NodeId); if (index >= 0) { setPlaying(false); setStep(index); } }}><Background color="#e2e8f0" gap={24} /><Controls showInteractive={false} /></ReactFlow></div><div className="mt-3 rounded-lg border border-slate-200 bg-white p-3"><div className="text-xs font-semibold text-teal-700">当前模块：{nodeInfo[activeId].title}</div><div className="mt-1 font-mono text-sm text-slate-900">&gt;&gt;&gt; {activeId === 'input' ? `score = ${score}` : activeId === 'elif' ? `score >= ${threshold}` : nodeInfo[activeId].code}</div><p className="mt-2 text-xs leading-relaxed text-slate-500">{nodeInfo[activeId].detail}</p></div></div>
    </section>
  );
};
