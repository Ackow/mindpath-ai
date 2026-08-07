'use client';

import React, { useState, useMemo } from 'react';
import { Compass, RotateCcw, ArrowRight, AlertTriangle, CheckCircle2 } from 'lucide-react';
import katex from 'katex';
import 'katex/dist/katex.min.css';

function MathSpan({ math, sizeClass = 'text-sm sm:text-base' }: { math: string; sizeClass?: string }) {
  const html = useMemo(() => {
    try {
      return katex.renderToString(math, { displayMode: false, throwOnError: false });
    } catch {
      return math;
    }
  }, [math]);

  return <span className={`inline-inline ${sizeClass}`} dangerouslySetInnerHTML={{ __html: html }} />;
}

export function CalculusIntuitionLab() {
  const [x, setX] = useState<number>(3.0);
  const [learningRate, setLearningRate] = useState<number>(0.3);

  // 目标损失函数: f(x) = x^2 + 1.0，导数 f'(x) = 2.0 * x
  // 当 f'(x) = 2x 时:
  // - alpha in [0.05, 0.45]: 正常平稳收敛
  // - alpha in [0.55, 0.95]: 产生跨越谷底的震荡 (Overshooting Oscillation: 1 - 2*alpha < 0)
  // - alpha >= 1.05: 极值发散飞出山谷 (Divergence: |1 - 2*alpha| > 1)
  const f = (val: number) => val * val + 1.0;
  const df = (val: number) => 2.0 * val;

  const currentY = f(x);
  const slope = df(x);

  // 沿反梯度方向迈出“下山一步”
  const handleStep = () => {
    setX((prevX) => {
      const nextX = prevX - learningRate * df(prevX);
      // 限制坐标范围在 [-8, 8] 之间以便展示震荡与发散
      if (nextX > 8) return 8;
      if (nextX < -8) return -8;
      return Number(nextX.toFixed(3));
    });
  };

  const handleReset = () => {
    setX(3.0);
    setLearningRate(0.3);
  };

  // 状态判定与警告
  const isDiverging = useMemo(() => learningRate >= 1.0, [learningRate]);
  const isOscillating = useMemo(() => learningRate >= 0.55 && learningRate < 1.0, [learningRate]);

  // SVG 坐标映射：画布 340x240，x 从 [-4.5, 4.5] 映射，y 从 [0, 16] 映射
  const toSvgX = (val: number) => 170 + val * 32;
  const toSvgY = (val: number) => 210 - val * 11;

  // 生成二次函数抛物线采样点
  const curvePoints: string = Array.from({ length: 91 }, (_, i) => {
    const vx = -4.5 + i * 0.1;
    const vy = f(vx);
    return `${toSvgX(vx)},${toSvgY(vy)}`;
  }).join(' ');

  // 切线两端点 (x - 1.2, x + 1.2)
  const tangentX1 = x - 1.2;
  const tangentY1 = currentY - 1.2 * slope;
  const tangentX2 = x + 1.2;
  const tangentY2 = currentY + 1.2 * slope;

  // 状态判定文本
  let slopeText = '斜率 > 0 (正斜率，向右在爬坡)';
  let slopeBadge = 'bg-amber-50 text-amber-800 border-amber-300';
  if (Math.abs(slope) < 0.1) {
    slopeText = '斜率 ≈ 0 (到达谷底极小值点！)';
    slopeBadge = 'bg-emerald-50 text-emerald-800 border-emerald-300';
  } else if (slope < 0) {
    slopeText = '斜率 < 0 (负斜率，向右在下坡)';
    slopeBadge = 'bg-teal-50 text-teal-800 border-teal-300';
  }

  return (
    <div className="my-7 rounded-2xl border border-slate-200 bg-white p-5 space-y-5 shadow-card font-sans">
      {/* 顶栏控制 */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-teal-50 text-teal-700 border border-teal-200">
            <Compass className="w-4 h-4" />
            微积分切线与梯度下山演练
          </span>
          <h4 className="text-base sm:text-lg font-bold text-slate-800">导数与梯度下降步幅交互实验室</h4>
        </div>

        <button
          onClick={handleReset}
          className="flex items-center gap-1 text-slate-600 hover:text-slate-900 text-xs sm:text-sm font-semibold px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 border border-slate-200 transition-colors cursor-pointer"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          重置参数
        </button>
      </div>

      {/* 参数控制区 */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {/* 拖动调节位置 x */}
        <div className="rounded-xl bg-slate-50 p-3.5 border border-slate-200 space-y-2">
          <div className="flex justify-between text-xs sm:text-sm font-bold">
            <span className="text-slate-700">当前位置 <MathSpan math="x" sizeClass="text-base font-bold text-teal-800" /></span>
            <span className="font-mono text-teal-700 font-bold text-sm sm:text-base">{x.toFixed(2)}</span>
          </div>
          <input
            type="range"
            min="-4.0"
            max="4.0"
            step="0.1"
            value={x}
            onChange={(e) => setX(parseFloat(e.target.value))}
            className="h-2 w-full cursor-pointer appearance-none rounded-lg bg-slate-200 accent-teal-600"
          />
          <div className="flex justify-between text-[11px] text-slate-500 font-semibold">
            <span>左侧坡 (-4.0)</span>
            <span>谷底 (0.0)</span>
            <span>右侧坡 (+4.0)</span>
          </div>
        </div>

        {/* 调节步幅 (学习率 alpha) */}
        <div className="rounded-xl bg-slate-50 p-3.5 border border-slate-200 space-y-2">
          <div className="flex justify-between text-xs sm:text-sm font-bold">
            <span className="text-slate-700">学习率 <MathSpan math="\alpha" sizeClass="text-base font-bold text-purple-800" /></span>
            <span className={`font-mono font-bold text-sm sm:text-base ${isDiverging ? 'text-rose-600' : isOscillating ? 'text-amber-600' : 'text-teal-700'}`}>
              {learningRate.toFixed(2)}
            </span>
          </div>
          <input
            type="range"
            min="0.05"
            max="1.15"
            step="0.05"
            value={learningRate}
            onChange={(e) => setLearningRate(parseFloat(e.target.value))}
            className="h-2 w-full cursor-pointer appearance-none rounded-lg bg-slate-200 accent-teal-600"
          />
          <div className="flex justify-between text-[11px] font-semibold">
            <span className="text-slate-500">平稳 (0.05)</span>
            <span className="text-amber-600">震荡 (0.70)</span>
            <span className="text-rose-600">发散 (1.10)</span>
          </div>
        </div>

        {/* 迈出下山一步按钮 */}
        <div className="rounded-xl bg-slate-50 p-3.5 border border-slate-200 flex flex-col justify-between">
          <label className="block text-xs sm:text-sm font-bold text-slate-800">梯度下降单步迭代</label>
          <button
            onClick={handleStep}
            className="w-full flex items-center justify-center gap-1.5 rounded-lg bg-teal-600 hover:bg-teal-700 active:scale-95 text-white py-2 text-xs sm:text-sm font-bold shadow-sm transition-all cursor-pointer"
          >
            迈出“下山一步” (<MathSpan math="x - \alpha f'(x)" sizeClass="text-xs font-bold" />)
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 警告 Banner */}
      {isOscillating && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs sm:text-sm text-amber-900 flex items-center gap-2 shadow-sm font-sans">
          <AlertTriangle className="w-4.5 h-4.5 text-amber-600 shrink-0" />
          <div>
            <span className="font-bold">⚠️ 学习率过大 warning：</span><MathSpan math="\alpha = 0.70" sizeClass="text-sm font-bold text-amber-800" /> 时，一步迈出的跨度直接超过了山谷宽度！点会在山谷两侧来回震荡跳跃，无法完美平稳到达谷底。
          </div>
        </div>
      )}

      {isDiverging && (
        <div className="bg-rose-50 border border-rose-200 rounded-xl p-3 text-xs sm:text-sm text-rose-900 flex items-center gap-2 shadow-sm font-sans">
          <AlertTriangle className="w-4.5 h-4.5 text-rose-600 shrink-0 animate-bounce" />
          <div>
            <span className="font-bold">💥 学习率极高爆炸 warning：</span><MathSpan math="\alpha \ge 1.0" sizeClass="text-sm font-bold text-rose-800" /> 时，每一步不仅没靠近谷底，反而越跳越远、飞出山谷导致 Loss 变成极大的数值乃至崩溃！
          </div>
        </div>
      )}

      {/* SVG 几何视口与数据监测 */}
      <div className="grid gap-6 md:grid-cols-[minmax(0,1fr)_280px]">
        {/* SVG 函数曲线与切线绘制 */}
        <div className="min-w-0 rounded-xl border border-slate-200 bg-slate-50 p-3.5 flex flex-col items-center justify-center relative">
          <svg viewBox="0 0 340 240" className="w-full h-auto max-h-[320px]">
            {/* 网格线 */}
            {[-4, -3, -2, -1, 0, 1, 2, 3, 4].map((vx) => (
              <line key={`v-${vx}`} x1={toSvgX(vx)} y1="10" x2={toSvgX(vx)} y2="230" stroke="#E2E8F0" strokeWidth="1" strokeDasharray="3,3" />
            ))}
            {[0, 2, 4, 6, 8, 10, 12, 14, 16].map((vy) => (
              <line key={`h-${vy}`} x1="10" y1={toSvgY(vy)} x2="330" y2={toSvgY(vy)} stroke="#E2E8F0" strokeWidth="1" strokeDasharray="3,3" />
            ))}

            {/* 坐标轴 */}
            <line x1="10" y1={toSvgY(0)} x2="330" y2={toSvgY(0)} stroke="#64748B" strokeWidth="2" />
            <line x1={toSvgX(0)} y1="10" x2={toSvgX(0)} y2="230" stroke="#64748B" strokeWidth="2" />

            {/* 极小值谷底标志 */}
            <circle cx={toSvgX(0)} cy={toSvgY(1)} r="6" fill="#10B981" />

            {/* 抛物线 f(x) = x^2 + 1 */}
            <polyline points={curvePoints} fill="none" stroke="#0284C7" strokeWidth="3" />

            {/* 当前切线 (红色) */}
            <line
              x1={toSvgX(tangentX1)}
              y1={toSvgY(tangentY1)}
              x2={toSvgX(tangentX2)}
              y2={toSvgY(tangentY2)}
              stroke="#EF4444"
              strokeWidth="2.5"
              strokeDasharray="4 3"
            />

            {/* 当前位置点 */}
            <circle cx={toSvgX(x)} cy={toSvgY(currentY)} r="7" fill={isDiverging ? '#DC2626' : isOscillating ? '#D97706' : '#0D9488'} stroke="#FFFFFF" strokeWidth="2" />
          </svg>

          {/* 图例说明 */}
          <div className="mt-2 flex flex-wrap items-center justify-center gap-4 text-xs font-semibold text-slate-700">
            <span className="flex items-center gap-1.5"><span className="w-3.5 h-1 bg-sky-600 inline-block rounded"></span> 曲线 <MathSpan math="f(x) = x^2 + 1" sizeClass="text-xs font-bold" /></span>
            <span className="flex items-center gap-1.5"><span className="w-3.5 h-1 bg-red-500 border-dashed border-t-2 border-red-500 inline-block"></span> 当前点切线斜率</span>
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block"></span> 谷底最小值点 (0, 1)</span>
          </div>
        </div>

        {/* 右侧数据监测与诊断卡片 */}
        <div className="flex flex-col justify-between gap-4 rounded-xl border border-slate-200 bg-slate-50 p-4 font-sans">
          <div>
            <h4 className="mb-3 text-xs font-bold text-slate-800 uppercase tracking-wider">实时导数与状态监控</h4>

            <div className="space-y-2.5 font-mono text-xs sm:text-sm mb-4">
              <div className="flex justify-between items-center rounded-lg bg-white p-2.5 border border-slate-200 shadow-sm">
                <span className="text-slate-600 font-semibold">位置 <MathSpan math="x" sizeClass="text-sm font-bold" /></span>
                <span className="text-teal-700 font-bold">{x.toFixed(3)}</span>
              </div>
              <div className="flex justify-between items-center rounded-lg bg-white p-2.5 border border-slate-200 shadow-sm">
                <span className="text-slate-600 font-semibold">函数值 <MathSpan math="f(x)" sizeClass="text-sm font-bold" /></span>
                <span className="text-sky-700 font-bold">{currentY.toFixed(3)}</span>
              </div>
              <div className="flex justify-between items-center rounded-lg bg-white p-2.5 border border-slate-200 shadow-sm">
                <span className="text-slate-600 font-semibold">切线斜率 (导数)</span>
                <span className="text-rose-600 font-bold">{slope.toFixed(3)}</span>
              </div>
            </div>

            {/* 状态徽章 */}
            <div className={`p-2.5 rounded-lg border text-xs sm:text-sm font-bold text-center shadow-sm ${slopeBadge}`}>
              {slopeText}
            </div>
          </div>

          {/* 观察指导 */}
          <div className="rounded-xl border border-teal-200 bg-teal-50/80 p-3 text-xs text-teal-950 leading-relaxed font-semibold">
            <div className="font-bold flex items-center gap-1 mb-1 text-teal-900">
              <CheckCircle2 className="w-4 h-4 text-teal-600" />
              实验观察要点：
            </div>
            1. 调整学习率 <MathSpan math="\alpha = 0.2" sizeClass="text-xs font-bold" />，连续点击下山，观察平稳收敛；
            <br />
            2. 将 <MathSpan math="\alpha" sizeClass="text-xs font-bold" /> 调大至 <span className="text-amber-800 font-bold">0.70</span>，点击下山，观察点在左右山坡来回震荡跳跃；
            <br />
            3. 将 <MathSpan math="\alpha" sizeClass="text-xs font-bold" /> 调大至 <span className="text-rose-800 font-bold">1.10</span>，点击下山，体验 Loss 越跳越大飞出山谷的现象！
          </div>
        </div>
      </div>
    </div>
  );
}
