'use client';

import React, { useState, useMemo } from 'react';
import { Activity, RotateCcw, Wand2, Sliders, Calculator, ChevronDown, ChevronUp, Layers } from 'lucide-react';
import katex from 'katex';
import 'katex/dist/katex.min.css';

interface MultiPoint {
  x1: number;
  x2: number;
  y: number;
}

const DEFAULT_MULTI_POINTS: MultiPoint[] = [
  { x1: 1.0, x2: 1.0, y: 3.2 },
  { x1: 2.0, x2: 1.0, y: 5.1 },
  { x1: 2.0, x2: 2.0, y: 7.8 },
  { x1: 3.0, x2: 2.0, y: 9.5 },
  { x1: 4.0, x2: 3.0, y: 13.9 },
];

function MathSpan({ math, sizeClass = 'text-sm sm:text-base' }: { math: string; sizeClass?: string }) {
  const html = useMemo(() => {
    try {
      return katex.renderToString(math, { displayMode: false, throwOnError: false });
    } catch {
      return math;
    }
  }, [math]);

  return <span className={`inline-inline font-normal ${sizeClass}`} dangerouslySetInnerHTML={{ __html: html }} />;
}

export function MultivariateRegressionLab() {
  const [w1, setW1] = useState<number>(2.0);
  const [w2, setW2] = useState<number>(2.5);
  const [b, setB] = useState<number>(1.0);
  const [showTable, setShowTable] = useState<boolean>(true);

  // Compute real-time predictions, MSE, and Matrix Gradient \nabla_w L
  const { mse, details, gradW1, gradW2, gradB } = useMemo(() => {
    let sumSqErr = 0;
    let sumEx1 = 0;
    let sumEx2 = 0;
    let sumE = 0;

    const rowDetails = DEFAULT_MULTI_POINTS.map((pt, idx) => {
      const yPred = w1 * pt.x1 + w2 * pt.x2 + b;
      const err = yPred - pt.y; // e_i = \hat{y}_i - y_i
      const sqErr = err * err;
      const ex1 = err * pt.x1;
      const ex2 = err * pt.x2;

      sumSqErr += sqErr;
      sumE += err;
      sumEx1 += ex1;
      sumEx2 += ex2;

      return {
        id: idx + 1,
        x1: pt.x1,
        x2: pt.x2,
        y: pt.y,
        yPred,
        err,
        sqErr,
        ex1,
        ex2,
      };
    });

    const N = DEFAULT_MULTI_POINTS.length;
    const currentMse = sumSqErr / N;
    const gW1 = (2 / N) * sumEx1;
    const gW2 = (2 / N) * sumEx2;
    const gB = (2 / N) * sumE;

    return {
      mse: currentMse,
      details: rowDetails,
      gradW1: gW1,
      gradW2: gW2,
      gradB: gB,
    };
  }, [w1, w2, b]);

  // Solve Normal Equation w* = (X^T X)^-1 X^T Y for 2 features
  const handleSolveNormalEquation = () => {
    const N = DEFAULT_MULTI_POINTS.length;
    // Build augmented design matrix X_aug with ones
    // Sum terms
    let s_x1 = 0, s_x2 = 0, s_y = 0;
    let s_x1x1 = 0, s_x1x2 = 0, s_x1y = 0;
    let s_x2x2 = 0, s_x2y = 0;

    DEFAULT_MULTI_POINTS.forEach(p => {
      s_x1 += p.x1;
      s_x2 += p.x2;
      s_y += p.y;
      s_x1x1 += p.x1 * p.x1;
      s_x1x2 += p.x1 * p.x2;
      s_x1y += p.x1 * p.y;
      s_x2x2 += p.x2 * p.x2;
      s_x2y += p.x2 * p.y;
    });

    // 3x3 System A * [w1, w2, b]^T = C
    const A = [
      [s_x1x1, s_x1x2, s_x1],
      [s_x1x2, s_x2x2, s_x2],
      [s_x1, s_x2, N]
    ];
    const C = [s_x1y, s_x2y, s_y];

    // Cramer's rule for 3x3 matrix
    const det = (M: number[][]) =>
      M[0][0] * (M[1][1] * M[2][2] - M[1][2] * M[2][1]) -
      M[0][1] * (M[1][0] * M[2][2] - M[1][2] * M[2][0]) +
      M[0][2] * (M[1][0] * M[2][1] - M[1][1] * M[2][0]);

    const D0 = det(A);
    if (Math.abs(D0) < 1e-7) return;

    const A_w1 = A.map((row, i) => [C[i], row[1], row[2]]);
    const A_w2 = A.map((row, i) => [row[0], C[i], row[2]]);
    const A_b  = A.map((row, i) => [row[0], row[1], C[i]]);

    const optW1 = det(A_w1) / D0;
    const optW2 = det(A_w2) / D0;
    const optB  = det(A_b) / D0;

    setW1(Number(optW1.toFixed(2)));
    setW2(Number(optW2.toFixed(2)));
    setB(Number(optB.toFixed(2)));
  };

  const handleReset = () => {
    setW1(2.0);
    setW2(2.5);
    setB(1.0);
  };

  // 3D Isometric Projection Transformation for Visualization
  // Canvas width: 520, height: 380
  const svgW = 520;
  const svgH = 380;

  // Projection matrix (Isometric angle)
  const project3D = (x1: number, x2: number, yVal: number) => {
    // Center origin at (240, 260)
    const originX = 230;
    const originY = 270;

    const scaleX1 = 55; // Angle ~30 deg right
    const scaleX2 = -45; // Angle ~150 deg left
    const scaleY = -15;  // Upward

    const screenX = originX + x1 * scaleX1 + x2 * scaleX2;
    const screenY = originY + x1 * 12 + x2 * 12 + yVal * scaleY;

    return { x: screenX, y: screenY };
  };

  // 3D Plane Mesh (Corners at (0,0), (5,0), (5,4), (0,4))
  const corner00 = project3D(0, 0, w1 * 0 + w2 * 0 + b);
  const corner50 = project3D(4.5, 0, w1 * 4.5 + w2 * 0 + b);
  const corner54 = project3D(4.5, 3.5, w1 * 4.5 + w2 * 3.5 + b);
  const corner04 = project3D(0, 3.5, w1 * 0 + w2 * 3.5 + b);

  const planePath = `M ${corner00.x} ${corner00.y} L ${corner50.x} ${corner50.y} L ${corner54.x} ${corner54.y} L ${corner04.x} ${corner04.y} Z`;

  return (
    <div className="my-7 rounded-2xl border border-slate-200 bg-white p-5 space-y-5 shadow-card font-sans">
      {/* 顶栏标题控制 */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-teal-50 text-teal-700 border border-teal-200">
            <Layers className="w-4 h-4" />
            多元回归与 3D 超平面拟合实验室
          </span>
          <h4 className="text-base sm:text-lg font-bold text-slate-800">多元线性回归与设计矩阵分析</h4>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleSolveNormalEquation}
            className="flex items-center gap-1 px-3.5 py-1.5 bg-teal-600 hover:bg-teal-700 active:scale-95 text-white font-semibold text-xs sm:text-sm rounded-lg shadow-sm transition-all cursor-pointer"
          >
            <Wand2 className="w-4 h-4" />
            解多元正规方程
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

      {/* 3D 拟合平面与控制 Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
        {/* 3D Isometric View (7 cols) */}
        <div className="lg:col-span-7 bg-slate-50 rounded-xl p-4 shadow-sm border border-slate-200 flex flex-col items-center justify-center relative overflow-hidden">
          <svg viewBox={`0 0 ${svgW} ${svgH}`} className="w-full h-auto max-h-[400px]">
            {/* 3D Coordinate Grid Base */}
            {Array.from({ length: 6 }).map((_, i) => {
              const pStart = project3D(i, 0, 0);
              const pEnd = project3D(i, 3.5, 0);
              return <line key={`g-x1-${i}`} x1={pStart.x} y1={pStart.y} x2={pEnd.x} y2={pEnd.y} stroke="#E2E8F0" strokeWidth="1" strokeDasharray="3 3" />;
            })}
            {Array.from({ length: 5 }).map((_, j) => {
              const pStart = project3D(0, j, 0);
              const pEnd = project3D(4.5, j, 0);
              return <line key={`g-x2-${j}`} x1={pStart.x} y1={pStart.y} x2={pEnd.x} y2={pEnd.y} stroke="#E2E8F0" strokeWidth="1" strokeDasharray="3 3" />;
            })}

            {/* 3D Axis Lines */}
            {/* Axis X1 */}
            <line x1={project3D(0, 0, 0).x} y1={project3D(0, 0, 0).y} x2={project3D(5, 0, 0).x} y2={project3D(5, 0, 0).y} stroke="#64748B" strokeWidth="2" />
            <text x={project3D(5.2, 0, 0).x} y={project3D(5.2, 0, 0).y + 5} fill="#475569" fontSize="12" fontWeight="600">特征 x1 (面积)</text>

            {/* Axis X2 */}
            <line x1={project3D(0, 0, 0).x} y1={project3D(0, 0, 0).y} x2={project3D(0, 4, 0).x} y2={project3D(0, 4, 0).y} stroke="#64748B" strokeWidth="2" />
            <text x={project3D(0, 4.3, 0).x - 40} y={project3D(0, 4.3, 0).y + 10} fill="#475569" fontSize="12" fontWeight="600">特征 x2 (房间数)</text>

            {/* Axis Y */}
            <line x1={project3D(0, 0, 0).x} y1={project3D(0, 0, 0).y} x2={project3D(0, 0, 16).x} y2={project3D(0, 0, 16).y} stroke="#64748B" strokeWidth="2" />
            <text x={project3D(0, 0, 17).x - 15} y={project3D(0, 0, 17).y - 5} fill="#475569" fontSize="12" fontWeight="600">目标 y (房价)</text>

            {/* 3D Fitting Translucent Plane */}
            <path d={planePath} fill="rgba(13, 148, 136, 0.25)" stroke="#0D9488" strokeWidth="2.5" />

            {/* 3D Vertical Residual Lines & Point Shadows */}
            {DEFAULT_MULTI_POINTS.map((pt, idx) => {
              const yPred = w1 * pt.x1 + w2 * pt.x2 + b;
              const pActual = project3D(pt.x1, pt.x2, pt.y);
              const pPred = project3D(pt.x1, pt.x2, yPred);
              const pGround = project3D(pt.x1, pt.x2, 0);

              return (
                <g key={`pt3d-${idx}`}>
                  {/* Ground Shadow Circle */}
                  <ellipse cx={pGround.x} cy={pGround.y} rx="4" ry="2" fill="#CBD5E1" />
                  {/* Vertical Ground Pillar */}
                  <line x1={pGround.x} y1={pGround.y} x2={pActual.x} y2={pActual.y} stroke="#94A3B8" strokeWidth="1" strokeDasharray="2 2" />
                  {/* Vertical Red Residual Line */}
                  <line x1={pActual.x} y1={pActual.y} x2={pPred.x} y2={pPred.y} stroke="#EF4444" strokeWidth="2" strokeDasharray="3 3" />
                  {/* Actual 3D Point */}
                  <circle cx={pActual.x} cy={pActual.y} r="6" fill="#0284C7" stroke="#0369A1" strokeWidth="2" />
                </g>
              );
            })}
          </svg>
        </div>

        {/* Control Sliders (5 cols) */}
        <div className="lg:col-span-5 flex flex-col gap-4">
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex flex-col gap-3">
            <div className="flex items-center gap-1.5 text-xs sm:text-sm font-bold text-slate-800 border-b border-slate-200 pb-2">
              <Sliders className="w-4 h-4 text-teal-600" />
              多元回归参数调节 (2 个特征 + 偏置)
            </div>

            <div>
              <div className="flex justify-between text-xs sm:text-sm font-semibold text-slate-700 mb-1">
                <span>特征 1 权重 <MathSpan math="w_1" sizeClass="text-base" /> (面积):</span>
                <span className="text-teal-700 font-mono font-bold text-sm sm:text-base">{w1.toFixed(2)}</span>
              </div>
              <input
                type="range"
                min="-1.0"
                max="4.0"
                step="0.05"
                value={w1}
                onChange={(e) => setW1(parseFloat(e.target.value))}
                className="w-full accent-teal-600 cursor-pointer h-2 bg-slate-200 rounded-lg"
              />
            </div>

            <div>
              <div className="flex justify-between text-xs sm:text-sm font-semibold text-slate-700 mb-1">
                <span>特征 2 权重 <MathSpan math="w_2" sizeClass="text-base" /> (房间数):</span>
                <span className="text-teal-700 font-mono font-bold text-sm sm:text-base">{w2.toFixed(2)}</span>
              </div>
              <input
                type="range"
                min="-1.0"
                max="5.0"
                step="0.05"
                value={w2}
                onChange={(e) => setW2(parseFloat(e.target.value))}
                className="w-full accent-teal-600 cursor-pointer h-2 bg-slate-200 rounded-lg"
              />
            </div>

            <div>
              <div className="flex justify-between text-xs sm:text-sm font-semibold text-slate-700 mb-1">
                <span>偏置 <MathSpan math="b" sizeClass="text-base" /> (Intercept):</span>
                <span className="text-teal-700 font-mono font-bold text-sm sm:text-base">{b.toFixed(2)}</span>
              </div>
              <input
                type="range"
                min="-2.0"
                max="6.0"
                step="0.1"
                value={b}
                onChange={(e) => setB(parseFloat(e.target.value))}
                className="w-full accent-teal-600 cursor-pointer h-2 bg-slate-200 rounded-lg"
              />
            </div>
          </div>

          {/* Loss Metrics Readout */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex flex-col gap-2.5 font-sans text-xs sm:text-sm shadow-sm text-slate-800">
            <div className="flex justify-between items-center">
              <span className="text-slate-700 font-semibold">当前方程:</span>
              <span className="text-teal-800 font-mono font-bold">
                <MathSpan math={`\\hat{y} = ${w1.toFixed(2)} x_1 + ${w2.toFixed(2)} x_2 + ${b.toFixed(2)}`} sizeClass="text-xs sm:text-sm" />
              </span>
            </div>
            <div className="border-t border-slate-200 pt-2 flex justify-between items-center text-sm sm:text-base">
              <span className="text-teal-800 font-bold">多元均方误差 <MathSpan math="\text{MSE}" sizeClass="text-base font-bold text-amber-800" />:</span>
              <span className="text-amber-700 font-mono font-extrabold text-base sm:text-lg">{mse.toFixed(4)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* 实时多元矩阵与 KaTeX 手算明细表 */}
      <div className="border-t border-slate-200 pt-4">
        <button
          onClick={() => setShowTable(!showTable)}
          className="flex items-center gap-1.5 text-xs sm:text-sm font-bold text-teal-700 hover:text-teal-900 transition-colors cursor-pointer"
        >
          <Calculator className="w-4 h-4 text-teal-600" />
          <span>{showTable ? '收起' : '展开'} 实时多元矩阵 <MathSpan math="Y = Xw + b" sizeClass="text-sm font-bold" /> 与梯度向量 <MathSpan math="\nabla_w L" sizeClass="text-sm font-bold" /> 核对明细表</span>
          {showTable ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>

        {showTable && (
          <div className="mt-3 space-y-4">
            {/* 多元样本明细表 */}
            <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
              <table className="w-full text-xs sm:text-sm text-left font-sans border-collapse">
                <thead>
                  <tr className="bg-slate-100 text-slate-900 font-bold border-b border-slate-200">
                    <th className="p-3 border-r border-slate-200 whitespace-nowrap">样本 <MathSpan math="i" sizeClass="text-base" /></th>
                    <th className="p-3 border-r border-slate-200 whitespace-nowrap">特征 <MathSpan math="x_{i1}" sizeClass="text-base font-bold" /></th>
                    <th className="p-3 border-r border-slate-200 whitespace-nowrap">特征 <MathSpan math="x_{i2}" sizeClass="text-base font-bold" /></th>
                    <th className="p-3 border-r border-slate-200 whitespace-nowrap">真实 <MathSpan math="y_i" sizeClass="text-base font-bold" /></th>
                    <th className="p-3 border-r border-slate-200 whitespace-nowrap">预测 <MathSpan math="\hat{y}_i" sizeClass="text-base font-bold" /></th>
                    <th className="p-3 border-r border-slate-200 whitespace-nowrap text-amber-900">残差 <MathSpan math="e_i = \hat{y}_i - y_i" sizeClass="text-base font-bold" /></th>
                    <th className="p-3 border-r border-slate-200 whitespace-nowrap text-purple-900"><MathSpan math="e_i \cdot x_{i1}" sizeClass="text-base font-bold" /></th>
                    <th className="p-3 whitespace-nowrap text-purple-900"><MathSpan math="e_i \cdot x_{i2}" sizeClass="text-base font-bold" /></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-mono text-xs sm:text-sm">
                  {details.map((row) => (
                    <tr key={row.id} className="hover:bg-slate-50">
                      <td className="p-3 border-r border-slate-100 font-sans font-semibold text-slate-800">样本 {row.id}</td>
                      <td className="p-3 border-r border-slate-100">{row.x1.toFixed(1)}</td>
                      <td className="p-3 border-r border-slate-100">{row.x2.toFixed(1)}</td>
                      <td className="p-3 border-r border-slate-100">{row.y.toFixed(1)}</td>
                      <td className="p-3 border-r border-slate-100 font-bold text-teal-700">{row.yPred.toFixed(2)}</td>
                      <td className={`p-3 border-r border-slate-100 font-bold ${row.err < 0 ? 'text-amber-700' : 'text-blue-700'}`}>
                        {row.err > 0 ? `+${row.err.toFixed(2)}` : row.err.toFixed(2)}
                      </td>
                      <td className={`p-3 border-r border-slate-100 font-bold ${row.ex1 < 0 ? 'text-purple-700' : 'text-emerald-700'}`}>
                        {row.ex1 > 0 ? `+${row.ex1.toFixed(2)}` : row.ex1.toFixed(2)}
                      </td>
                      <td className={`p-3 font-bold ${row.ex2 < 0 ? 'text-purple-700' : 'text-emerald-700'}`}>
                        {row.ex2 > 0 ? `+${row.ex2.toFixed(2)}` : row.ex2.toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* 矩阵梯度向量 \nabla_w L 公式推导卡片 */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-xs sm:text-sm text-slate-800 grid grid-cols-1 md:grid-cols-2 gap-4 font-sans shadow-sm">
              <div className="space-y-2 border-r-0 md:border-r border-slate-200 pr-0 md:pr-4 leading-relaxed">
                <div className="font-bold text-slate-900 flex items-center gap-1.5">
                  设计矩阵 <MathSpan math="X" sizeClass="text-base font-bold text-teal-800" /> 与标签向量 <MathSpan math="Y" sizeClass="text-base font-bold text-teal-800" /> 维度:
                </div>
                <div className="text-slate-700 font-mono leading-relaxed">
                  <MathSpan math="X \in \mathbb{R}^{5 \times 2}, \quad w \in \mathbb{R}^{2 \times 1}, \quad Y \in \mathbb{R}^{5 \times 1}" sizeClass="text-xs sm:text-sm font-bold" />
                </div>
                <div className="font-bold text-amber-800 font-mono pt-1">
                  多元 MSE = <MathSpan math="\frac{1}{5} \|Xw + b - Y\|_2^2" sizeClass="text-base font-bold" /> = <span className="text-amber-700 font-extrabold">{mse.toFixed(4)}</span>
                </div>
              </div>

              <div className="space-y-2 leading-relaxed">
                <div className="font-bold text-slate-900">
                  矩阵梯度向量 <MathSpan math="\nabla_w L = \frac{2}{N} X^T (\hat{Y} - Y)" sizeClass="text-base font-bold text-purple-800" /> 实时解:
                </div>
                <div className="text-purple-950 font-mono leading-relaxed">
                  <MathSpan math="\frac{\partial L}{\partial w_1}" sizeClass="text-base font-bold" /> = <MathSpan math="\frac{2}{5} \sum (e_i \cdot x_{i1})" sizeClass="text-base font-bold" /> = <span className="font-extrabold text-purple-700 text-sm sm:text-base">{gradW1.toFixed(4)}</span>
                </div>
                <div className="text-purple-950 font-mono leading-relaxed">
                  <MathSpan math="\frac{\partial L}{\partial w_2}" sizeClass="text-base font-bold" /> = <MathSpan math="\frac{2}{5} \sum (e_i \cdot x_{i2})" sizeClass="text-base font-bold" /> = <span className="font-extrabold text-purple-700 text-sm sm:text-base">{gradW2.toFixed(4)}</span>
                </div>
                <div className="text-purple-950 font-mono leading-relaxed">
                  <MathSpan math="\frac{\partial L}{\partial b}" sizeClass="text-base font-bold" /> = <MathSpan math="\frac{2}{5} \sum e_i" sizeClass="text-base font-bold" /> = <span className="font-extrabold text-purple-700 text-sm sm:text-base">{gradB.toFixed(4)}</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
