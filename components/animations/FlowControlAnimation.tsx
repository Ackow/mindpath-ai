'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { Pause, Play, RotateCcw, SkipBack, SkipForward } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';

type FlowStep = {
  title: string;
  code: string;
  detail: string;
  values: number[];
};

const steps: FlowStep[] = [
  { title: '读取输入', code: 'score = 72', detail: '先取得当前样本，准备进入条件分支。', values: [72] },
  { title: '判断 if', code: 'score >= 90', detail: '72 不满足第一个条件，继续检查下一个分支。', values: [72, 90] },
  { title: '判断 elif', code: 'score >= 60', detail: '72 满足条件，执行 elif 对应的代码块。', values: [72, 60] },
  { title: '执行分支', code: 'result = "及格"', detail: '命中的分支执行后，跳过其余分支。', values: [72, 60, 1] },
  { title: '循环处理', code: 'for item in [1, 2, 3]', detail: '循环逐项取值；每轮结束后回到循环头。', values: [1, 2, 3] },
];

export const FlowControlAnimation: React.FC = () => {
  const [step, setStep] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);

  useEffect(() => {
    if (!playing) return;
    const timer = window.setInterval(() => {
      setStep((current) => {
        if (current >= steps.length - 1) {
          setPlaying(false);
          return current;
        }
        return current + 1;
      });
    }, 1800 / speed);
    return () => window.clearInterval(timer);
  }, [playing, speed]);

  const current = steps[step];
  const tokenX = useMemo(() => `${Math.min(88, 12 + step * 19)}%`, [step]);

  const reset = () => {
    setPlaying(false);
    setStep(0);
  };

  return (
    <section className="my-8 rounded-2xl border border-slate-200 bg-white p-5 shadow-card" aria-label="流程控制步骤动画">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3">
        <div>
          <p className="text-xs font-bold uppercase tracking-wide text-teal-700">StepAnimation</p>
          <h3 className="text-base font-bold text-slate-900">条件分支与循环的执行路径</h3>
        </div>
        <div className="flex items-center gap-1">
          <button onClick={() => setStep((s) => Math.max(0, s - 1))} className="rounded-lg p-2 text-slate-600 hover:bg-slate-100" aria-label="上一步"><SkipBack className="h-4 w-4" /></button>
          <button onClick={() => setPlaying((value) => !value)} className="rounded-lg bg-teal-600 p-2 text-white hover:bg-teal-700" aria-label={playing ? '暂停' : '播放'}>{playing ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}</button>
          <button onClick={() => setStep((s) => Math.min(steps.length - 1, s + 1))} className="rounded-lg p-2 text-slate-600 hover:bg-slate-100" aria-label="下一步"><SkipForward className="h-4 w-4" /></button>
          <button onClick={reset} className="rounded-lg p-2 text-slate-600 hover:bg-slate-100" aria-label="重置"><RotateCcw className="h-4 w-4" /></button>
          <select value={speed} onChange={(event) => setSpeed(Number(event.target.value))} className="ml-2 rounded-lg border border-slate-200 px-2 py-1 text-xs text-slate-700" aria-label="播放速度">
            <option value={0.5}>0.5x</option><option value={1}>1x</option><option value={1.5}>1.5x</option><option value={2}>2x</option>
          </select>
        </div>
      </div>
      <div className="relative mb-4 h-20 overflow-hidden rounded-xl bg-slate-900 px-4 py-3">
        <div className="absolute left-[10%] right-[10%] top-1/2 h-1 -translate-y-1/2 rounded bg-slate-700" />
        <motion.div animate={{ left: tokenX }} transition={{ type: 'spring', stiffness: 180, damping: 18 }} className="absolute top-1/2 z-10 h-5 w-5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-teal-300 shadow-[0_0_16px_rgba(94,234,212,0.8)]" />
        <div className="absolute bottom-2 left-4 right-4 flex justify-between text-[10px] text-slate-400"><span>输入</span><span>if</span><span>elif</span><span>分支</span><span>循环</span></div>
      </div>
      <AnimatePresence mode="wait"><motion.div key={step} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} className="grid gap-3 sm:grid-cols-[1fr_1.2fr]">
        <div className="rounded-xl bg-slate-50 p-4"><p className="text-xs font-semibold text-teal-700">步骤 {step + 1} / {steps.length}</p><p className="mt-1 text-lg font-bold text-slate-900">{current.title}</p><p className="mt-2 text-sm leading-relaxed text-slate-600">{current.detail}</p></div>
        <div className="rounded-xl bg-slate-950 p-4 font-mono text-sm text-slate-100"><span className="text-teal-300">&gt;&gt;&gt;</span> {current.code}<div className="mt-3 flex flex-wrap gap-2 text-xs text-slate-400">{current.values.map((value, index) => <span key={`${value}-${index}`} className="rounded bg-slate-800 px-2 py-1">值 {value}</span>)}</div></div>
      </motion.div></AnimatePresence>
    </section>
  );
};

