'use client';

import React, { useState, useMemo } from 'react';
import { Target, RotateCcw, Sliders, CheckCircle2, Zap } from 'lucide-react';
import katex from 'katex';
import 'katex/dist/katex.min.css';

function MathSpan({ math, sizeClass = 'text-xs sm:text-sm font-bold' }: { math: string; sizeClass?: string }) {
  const html = useMemo(() => {
    try {
      return katex.renderToString(math, { displayMode: false, throwOnError: false });
    } catch {
      return math;
    }
  }, [math]);

  return <span className={`inline-inline ${sizeClass}`} dangerouslySetInnerHTML={{ __html: html }} />;
}

interface DataPoint {
  x1: number;
  x2: number;
  y: 0 | 1;
}

// 5 组固定两类二维点集 (Class 0 蓝色, Class 1 紫色)
const DEFAULT_POINTS: DataPoint[] = [
  { x1: 1.0, x2: 1.5, y: 0 },
  { x1: 1.5, x2: 2.5, y: 0 },
  { x1: 2.0, x2: 1.0, y: 0 },
  { x1: 2.5, x2: 3.0, y: 0 },
  { x1: 3.0, x2: 1.8, y: 0 },
  { x1: 3.5, x2: 4.2, y: 1 },
  { x1: 4.0, x2: 3.5, y: 1 },
  { x1: 4.5, x2: 4.8, y: 1 },
  { x1: 5.0, x2: 3.8, y: 1 },
  { x1: 5.5, x2: 5.0, y: 1 },
];

export function LogisticRegressionLab() {
  const [w1, setW1] = useState<number>(1.2);
  const [w2, setW2] = useState<number>(1.0);
  const [b, setB] = useState<number>(-5.5);
  const [threshold, setThreshold] = useState<number>(0.5);

  const sigmoid = (z: number) => 1.0 / (1.0 + Math.exp(-z));

  // 计算混淆矩阵、Log-Loss、准确率
  const metrics = useMemo(() => {
    let tp = 0;
    let fp = 0;
    let tn = 0;
    let fn = 0;
    let totalLoss = 0;

    DEFAULT_POINTS.forEach((pt) => {
      const z = w1 * pt.x1 + w2 * pt.x2 + b;
      const prob = sigmoid(z);
      const pred = prob >= threshold ? 1 : 0;

      // 交叉熵损失 (防止 log(0) 溢出)
      const eps = 1e-7;
      const safeProb = Math.max(eps, Math.min(1 - eps, prob));
      const loss = -(pt.y * Math.log(safeProb) + (1 - pt.y) * Math.log(1 - safeProb));
      totalLoss += loss;

      if (pt.y === 1 && pred === 1) tp++;
      if (pt.y === 0 && pred === 1) fp++;
      if (pt.y === 0 && pred === 0) tn++;
      if (pt.y === 1 && pred === 0) fn++;
    });

    const acc = (tp + tn) / DEFAULT_POINTS.length;
    const precision = tp + fp > 0 ? tp / (tp + fp) : 0;
    const recall = tp + fn > 0 ? tp / (tp + fn) : 0;
    const avgLoss = totalLoss / DEFAULT_POINTS.length;

    return { tp, fp, tn, fn, acc, precision, recall, avgLoss };
  }, [w1, w2, b, threshold]);

  // 自动求解接近最优决策边界参数
  const handleAutoSolve = () => {
    setW1(1.8);
    setW2(1.5);
    setB(-10.2);
    setThreshold(0.5);
  };

  const handleReset = () => {
    setW1(1.2);
    setW2(1.0);
    setB(-5.5);
    setThreshold(0.5);
  };

  // SVG 视口映射: x1 从 [0, 6], x2 从 [0, 6]
  const svgW = 340;
  const svgH = 260;
  const mapX = (val: number) => 35 + (val / 6.0) * (svgW - 55);
  const mapY = (val: number) => (svgH - 35) - (val / 6.0) * (svgH - 55);

  // 决策边界直线方程式: w1 * x1 + w2 * x2 + b = 0 => x2 = (-b - w1 * x1) / w2
  const calcBoundaryX2 = (valX1: number) => {
    if (Math.abs(w2) < 1e-4) return 3.0;
    return (-b - w1 * valX1) / w2;
  };

  const lineX1Start = 0.2;
  const lineX2Start = calcBoundaryX2(lineX1Start);
  const lineX1End = 5.8;
  const lineX2End = calcBoundaryX2(lineX1End);

  return (
    <div className="my-7 rounded-2xl border border-slate-200 bg-white p-5 space-y-5 shadow-card font-sans">
      {/* 标题栏 */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-teal-50 text-teal-700 border border-teal-200">
            <Target className="w-4 h-4" />
            二分类分类器实验室
          </span>
          <h4 className="text-base sm:text-lg font-bold text-slate-800">逻辑回归 Sigmoid 概率与决策边界演练</h4>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleAutoSolve}
            className="flex items-center gap-1 bg-teal-600 hover:bg-teal-700 text-white text-xs sm:text-sm font-bold px-3 py-1.5 rounded-lg shadow-sm transition-all cursor-pointer"
          >
            <Zap className="w-4 h-4 fill-current" />
            自动优化参数
          </button>
          <button
            onClick={handleReset}
            className="flex items-center gap-1 text-slate-600 hover:text-slate-900 text-xs sm:text-sm font-semibold px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 border border-slate-200 transition-colors cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
            重置
          </button>
        </div>
      </div>

      {/* 参数调优控制区 */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
        {/* SVG 平面图与决策边界 (7 cols) */}
        <div className="lg:col-span-7 bg-slate-50 rounded-xl p-4 shadow-sm border border-slate-200 flex flex-col items-center">
          <svg viewBox={`0 0 ${svgW} ${svgH}`} className="w-full h-auto max-h-[300px]">
            {/* 网格线 */}
            {[1, 2, 3, 4, 5].map((v) => (
              <React.Fragment key={`grid-${v}`}>
                <line x1={mapX(v)} y1={20} x2={mapX(v)} y2={svgH - 30} stroke="#E2E8F0" strokeWidth="1" strokeDasharray="3 3" />
                <line x1={30} y1={mapY(v)} x2={svgW - 20} y2={mapY(v)} stroke="#E2E8F0" strokeWidth="1" strokeDasharray="3 3" />
              </React.Fragment>
            ))}

            {/* 坐标轴 */}
            <line x1={30} y1={svgH - 30} x2={svgW - 15} y2={svgH - 30} stroke="#64748B" strokeWidth="2" />
            <line x1={30} y1={20} x2={30} y2={svgH - 30} stroke="#64748B" strokeWidth="2" />

            <text x={svgW - 10} y={svgH - 12} fill="#475569" fontSize="12" fontWeight="800" textAnchor="end">x1</text>
            <text x={18} y={25} fill="#475569" fontSize="12" fontWeight="800" textAnchor="start">x2</text>

            {/* 决策边界直线 (w1*x1 + w2*x2 + b = 0) */}
            <line
              x1={mapX(lineX1Start)}
              y1={mapY(lineX2Start)}
              x2={mapX(lineX1End)}
              y2={mapY(lineX2End)}
              stroke="#0D9488"
              strokeWidth="3"
            />

            {/* 数据散点 */}
            {DEFAULT_POINTS.map((pt, idx) => {
              const z = w1 * pt.x1 + w2 * pt.x2 + b;
              const prob = sigmoid(z);
              const isClass1 = pt.y === 1;
              const isCorrect = (prob >= threshold && isClass1) || (prob < threshold && !isClass1);

              return (
                <g key={`pt-${idx}`}>
                  <circle
                    cx={mapX(pt.x1)}
                    cy={mapY(pt.x2)}
                    r="7"
                    fill={isClass1 ? '#9333EA' : '#0284C7'}
                    stroke={isCorrect ? '#FFFFFF' : '#EF4444'}
                    strokeWidth={isCorrect ? '2' : '3'}
                  />
                  <text
                    x={mapX(pt.x1) + 9}
                    y={mapY(pt.x2) + 4}
                    fill="#475569"
                    fontSize="10"
                    fontWeight="700"
                    fontFamily="monospace"
                  >
                    {prob.toFixed(2)}
                  </text>
                </g>
              );
            })}
          </svg>

          {/* 图例 */}
          <div className="mt-2 flex flex-wrap items-center justify-center gap-4 text-xs font-semibold text-slate-700">
            <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-sky-600 inline-block"></span> 类别 0 (负例)</span>
            <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-purple-600 inline-block"></span> 类别 1 (正例)</span>
            <span className="flex items-center gap-1.5"><span className="w-4 h-1 bg-teal-600 inline-block rounded"></span> 决策边界 <MathSpan math="z=0" sizeClass="text-xs font-bold" /></span>
          </div>
        </div>

        {/* 右侧控制滑块 (5 cols) */}
        <div className="lg:col-span-5 flex flex-col gap-3 font-sans">
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 space-y-3">
            <div className="flex items-center gap-1.5 text-xs sm:text-sm font-bold text-slate-800 border-b border-slate-200 pb-2">
              <Sliders className="w-4 h-4 text-teal-600" />
              权重与概率决策阈值设置
            </div>

            <div>
              <div className="flex justify-between text-xs font-bold text-slate-700 mb-1">
                <span>权重 <MathSpan math="w_1" sizeClass="text-xs font-bold" />:</span>
                <span className="font-mono text-teal-700 font-bold">{w1.toFixed(2)}</span>
              </div>
              <input
                type="range"
                min="-3.0"
                max="3.0"
                step="0.1"
                value={w1}
                onChange={(e) => setW1(parseFloat(e.target.value))}
                className="w-full accent-teal-600 cursor-pointer h-2 bg-slate-200 rounded-lg"
              />
            </div>

            <div>
              <div className="flex justify-between text-xs font-bold text-slate-700 mb-1">
                <span>权重 <MathSpan math="w_2" sizeClass="text-xs font-bold" />:</span>
                <span className="font-mono text-teal-700 font-bold">{w2.toFixed(2)}</span>
              </div>
              <input
                type="range"
                min="-3.0"
                max="3.0"
                step="0.1"
                value={w2}
                onChange={(e) => setW2(parseFloat(e.target.value))}
                className="w-full accent-teal-600 cursor-pointer h-2 bg-slate-200 rounded-lg"
              />
            </div>

            <div>
              <div className="flex justify-between text-xs font-bold text-slate-700 mb-1">
                <span>偏置 <MathSpan math="b" sizeClass="text-xs font-bold" />:</span>
                <span className="font-mono text-teal-700 font-bold">{b.toFixed(2)}</span>
              </div>
              <input
                type="range"
                min="-12.0"
                max="2.0"
                step="0.2"
                value={b}
                onChange={(e) => setB(parseFloat(e.target.value))}
                className="w-full accent-teal-600 cursor-pointer h-2 bg-slate-200 rounded-lg"
              />
            </div>

            <div>
              <div className="flex justify-between text-xs font-bold text-slate-700 mb-1">
                <span>决策阈值 Threshold:</span>
                <span className="font-mono text-purple-700 font-bold">{threshold.toFixed(2)}</span>
              </div>
              <input
                type="range"
                min="0.1"
                max="0.9"
                step="0.05"
                value={threshold}
                onChange={(e) => setThreshold(parseFloat(e.target.value))}
                className="w-full accent-purple-600 cursor-pointer h-2 bg-slate-200 rounded-lg"
              />
            </div>
          </div>
        </div>
      </div>

      {/* 实时评估指标与混淆矩阵面板 */}
      <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-xs sm:text-sm text-slate-800 grid grid-cols-1 md:grid-cols-3 gap-4 font-sans shadow-sm">
        {/* 指标项 1 */}
        <div className="bg-white border border-slate-200 rounded-lg p-3 space-y-1.5 shadow-sm">
          <div className="font-bold text-slate-700 flex justify-between">
            <span>交叉熵损失 (Log-Loss):</span>
            <span className="font-mono font-extrabold text-teal-700">{metrics.avgLoss.toFixed(4)}</span>
          </div>
          <div className="font-bold text-slate-700 flex justify-between">
            <span>准确率 (Accuracy):</span>
            <span className="font-mono font-extrabold text-emerald-600">{(metrics.acc * 100).toFixed(0)}%</span>
          </div>
        </div>

        {/* 指标项 2 */}
        <div className="bg-white border border-slate-200 rounded-lg p-3 space-y-1.5 shadow-sm">
          <div className="font-bold text-slate-700 flex justify-between">
            <span>精确率 (Precision):</span>
            <span className="font-mono font-extrabold text-purple-700">{(metrics.precision * 100).toFixed(0)}%</span>
          </div>
          <div className="font-bold text-slate-700 flex justify-between">
            <span>召回率 (Recall):</span>
            <span className="font-mono font-extrabold text-purple-700">{(metrics.recall * 100).toFixed(0)}%</span>
          </div>
        </div>

        {/* 混淆矩阵小块 */}
        <div className="bg-white border border-slate-200 rounded-lg p-2.5 text-xs font-mono font-bold space-y-1 shadow-sm">
          <div className="text-slate-500 text-[10px] text-center">混淆矩阵 (Confusion Matrix)</div>
          <div className="grid grid-cols-2 gap-1 text-center">
            <div className="bg-emerald-50 border border-emerald-200 p-1 rounded text-emerald-800">TP: {metrics.tp}</div>
            <div className="bg-rose-50 border border-rose-200 p-1 rounded text-rose-800">FP: {metrics.fp}</div>
            <div className="bg-rose-50 border border-rose-200 p-1 rounded text-rose-800">FN: {metrics.fn}</div>
            <div className="bg-emerald-50 border border-emerald-200 p-1 rounded text-emerald-800">TN: {metrics.tn}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
