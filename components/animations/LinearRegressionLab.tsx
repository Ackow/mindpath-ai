'use client';

import React, { useState, useMemo } from 'react';
import { Activity, RotateCcw, Wand2, Sliders, Calculator, ChevronDown, ChevronUp } from 'lucide-react';
import katex from 'katex';
import 'katex/dist/katex.min.css';

interface Point {
  x: number;
  y: number;
}

const DEFAULT_POINTS: Point[] = [
  { x: 1, y: 2.2 },
  { x: 2, y: 3.8 },
  { x: 3, y: 6.1 },
  { x: 4, y: 8.5 },
  { x: 5, y: 9.9 },
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

export function LinearRegressionLab() {
  const [w, setW] = useState<number>(1.5);
  const [b, setB] = useState<number>(0.5);
  const [regType, setRegType] = useState<'none' | 'l2' | 'l1'>('none');
  const [lambdaVal, setLambdaVal] = useState<number>(1.0);
  const [showTable, setShowTable] = useState<boolean>(true);

  // Compute real-time MSE, Total Loss, Residuals and Gradients
  const { mse, penalty, totalLoss, details, gradW, gradB } = useMemo(() => {
    let sumSqErr = 0;
    let sumEx = 0;
    let sumE = 0;

    const rowDetails = DEFAULT_POINTS.map((pt, idx) => {
      const yPred = w * pt.x + b;
      const err = yPred - pt.y; // e_i = \hat{y}_i - y_i
      const sqErr = err * err;
      const ex = err * pt.x;

      sumSqErr += sqErr;
      sumE += err;
      sumEx += ex;

      return {
        id: idx + 1,
        x: pt.x,
        y: pt.y,
        yPred,
        err,
        sqErr,
        ex,
      };
    });

    const N = DEFAULT_POINTS.length;
    const currentMse = sumSqErr / N;
    const gW = (2 / N) * sumEx;
    const gB = (2 / N) * sumE;

    let pen = 0;
    if (regType === 'l2') {
      pen = lambdaVal * w * w;
    } else if (regType === 'l1') {
      pen = lambdaVal * Math.abs(w);
    }

    return {
      mse: currentMse,
      penalty: pen,
      totalLoss: currentMse + pen,
      details: rowDetails,
      gradW: gW,
      gradB: gB,
    };
  }, [w, b, regType, lambdaVal]);

  // Compute Least Squares Optimal w and b
  const handleAutoFit = () => {
    const N = DEFAULT_POINTS.length;
    let sumX = 0, sumY = 0, sumXY = 0, sumXX = 0;

    DEFAULT_POINTS.forEach((pt) => {
      sumX += pt.x;
      sumY += pt.y;
      sumXY += pt.x * pt.y;
      sumXX += pt.x * pt.x;
    });

    const meanX = sumX / N;
    const meanY = sumY / N;

    // Normal OLS slope without regularization
    let optW = (sumXY - N * meanX * meanY) / (sumXX - N * meanX * meanX);

    // Apply Ridge/Lasso shrinkage
    if (regType === 'l2') {
      optW = optW / (1 + lambdaVal * 0.1);
    } else if (regType === 'l1') {
      const sign = Math.sign(optW);
      const val = Math.abs(optW) - lambdaVal * 0.15;
      optW = val > 0 ? sign * val : 0;
    }

    const optB = meanY - optW * meanX;

    setW(Number(optW.toFixed(2)));
    setB(Number(optB.toFixed(2)));
  };

  const handleReset = () => {
    setW(1.5);
    setB(0.5);
    setRegType('none');
    setLambdaVal(1.0);
  };

  // SVG coordinate transformation (Higher height: 380px)
  const svgWidth = 520;
  const svgHeight = 380;
  const margin = { top: 25, right: 30, bottom: 45, left: 55 };

  const innerW = svgWidth - margin.left - margin.right;
  const innerH = svgHeight - margin.top - margin.bottom;

  const mapX = (xVal: number) => margin.left + (xVal / 6) * innerW;
  const mapY = (yVal: number) => margin.top + innerH - (yVal / 12) * innerH;

  // Fitting line endpoints at x = 0 and x = 6
  const lineY0 = w * 0 + b;
  const lineY6 = w * 6 + b;

  return (
    <div className="my-7 rounded-2xl border border-slate-200 bg-white p-5 space-y-5 shadow-card font-sans">
      {/* 顶栏标题控制 */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-teal-50 text-teal-700 border border-teal-200">
            <Activity className="w-4 h-4" />
            回归算法拟合与正则化实验室
          </span>
          <h4 className="text-base sm:text-lg font-bold text-slate-800">线性回归与正则化交互分析</h4>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleAutoFit}
            className="flex items-center gap-1 px-3.5 py-1.5 bg-teal-600 hover:bg-teal-700 active:scale-95 text-white font-semibold text-xs sm:text-sm rounded-lg shadow-sm transition-all cursor-pointer"
          >
            <Wand2 className="w-4 h-4" />
            一键拟合最优解
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

      {/* 画布与控制主网格 */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
        {/* SVG Canvas (7 cols) - 浅色背景与调高画布 */}
        <div className="lg:col-span-7 bg-slate-50 rounded-xl p-4 shadow-sm border border-slate-200 flex flex-col items-center justify-center">
          <svg viewBox={`0 0 ${svgWidth} ${svgHeight}`} className="w-full h-auto max-h-[400px]">
            {/* Grid Lines */}
            {[0, 2, 4, 6, 8, 10, 12].map((val) => (
              <line
                key={`grid-y-${val}`}
                x1={margin.left}
                y1={mapY(val)}
                x2={svgWidth - margin.right}
                y2={mapY(val)}
                stroke="#E2E8F0"
                strokeDasharray="3 3"
                strokeWidth="1"
              />
            ))}
            {[0, 1, 2, 3, 4, 5, 6].map((val) => (
              <line
                key={`grid-x-${val}`}
                x1={mapX(val)}
                y1={margin.top}
                x2={mapX(val)}
                y2={svgHeight - margin.bottom}
                stroke="#E2E8F0"
                strokeDasharray="3 3"
                strokeWidth="1"
              />
            ))}

            {/* Axes */}
            <line
              x1={margin.left}
              y1={svgHeight - margin.bottom}
              x2={svgWidth - margin.right}
              y2={svgHeight - margin.bottom}
              stroke="#64748B"
              strokeWidth="2"
            />
            <line
              x1={margin.left}
              y1={margin.top}
              x2={margin.left}
              y2={svgHeight - margin.bottom}
              stroke="#64748B"
              strokeWidth="2"
            />

            {/* Axis Labels */}
            <text x={svgWidth - margin.right} y={svgHeight - 12} fill="#475569" fontSize="13" fontWeight="600" textAnchor="end">
              特征 x (面积)
            </text>
            <text x={18} y={margin.top + 5} fill="#475569" fontSize="13" fontWeight="600" textAnchor="start">
              目标 y (房价)
            </text>

            {/* Axis Ticks Text */}
            {[0, 2, 4, 6, 8, 10, 12].map((val) => (
              <text key={`tick-y-${val}`} x={margin.left - 8} y={mapY(val) + 4} fill="#64748B" fontSize="12" textAnchor="end">
                {val}
              </text>
            ))}
            {[0, 1, 2, 3, 4, 5, 6].map((val) => (
              <text key={`tick-x-${val}`} x={mapX(val)} y={svgHeight - margin.bottom + 18} fill="#64748B" fontSize="12" textAnchor="middle">
                {val}
              </text>
            ))}

            {/* Residual Dashed Lines */}
            {DEFAULT_POINTS.map((pt, idx) => {
              const yPred = w * pt.x + b;
              return (
                <line
                  key={`res-${idx}`}
                  x1={mapX(pt.x)}
                  y1={mapY(pt.y)}
                  x2={mapX(pt.x)}
                  y2={mapY(yPred)}
                  stroke="#EF4444"
                  strokeWidth="2"
                  strokeDasharray="4 4"
                />
              );
            })}

            {/* Fitting Line */}
            <line
              x1={mapX(0)}
              y1={mapY(lineY0)}
              x2={mapX(6)}
              y2={mapY(lineY6)}
              stroke="#0D9488"
              strokeWidth="3.5"
            />

            {/* Data Points */}
            {DEFAULT_POINTS.map((pt, idx) => (
              <circle
                key={`pt-${idx}`}
                cx={mapX(pt.x)}
                cy={mapY(pt.y)}
                r="6.5"
                fill="#0284C7"
                stroke="#0369A1"
                strokeWidth="2"
              />
            ))}
          </svg>
        </div>

        {/* Control Panel & Readout (5 cols) */}
        <div className="lg:col-span-5 flex flex-col gap-4">
          {/* Sliders Box */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex flex-col gap-3">
            <div className="flex items-center gap-1.5 text-xs sm:text-sm font-bold text-slate-800 border-b border-slate-200 pb-2">
              <Sliders className="w-4 h-4 text-teal-600" />
              模型参数调节
            </div>

            <div>
              <div className="flex justify-between text-xs sm:text-sm font-semibold text-slate-700 mb-1">
                <span>斜率 <MathSpan math="w" sizeClass="text-base" /> (Weight):</span>
                <span className="text-teal-700 font-mono font-bold text-sm sm:text-base">{w.toFixed(2)}</span>
              </div>
              <input
                type="range"
                min="-2.0"
                max="4.0"
                step="0.05"
                value={w}
                onChange={(e) => setW(parseFloat(e.target.value))}
                className="w-full accent-teal-600 cursor-pointer h-2 bg-slate-200 rounded-lg"
              />
            </div>

            <div>
              <div className="flex justify-between text-xs sm:text-sm font-semibold text-slate-700 mb-1">
                <span>截距 <MathSpan math="b" sizeClass="text-base" /> (Bias):</span>
                <span className="text-teal-700 font-mono font-bold text-sm sm:text-base">{b.toFixed(2)}</span>
              </div>
              <input
                type="range"
                min="-3.0"
                max="8.0"
                step="0.1"
                value={b}
                onChange={(e) => setB(parseFloat(e.target.value))}
                className="w-full accent-teal-600 cursor-pointer h-2 bg-slate-200 rounded-lg"
              />
            </div>
          </div>

          {/* Regularization Options */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex flex-col gap-3">
            <span className="text-xs sm:text-sm font-bold text-slate-800">正则化惩罚项配置:</span>
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => setRegType('none')}
                className={`py-1.5 px-2 text-xs sm:text-sm rounded-lg font-semibold border transition-all cursor-pointer ${
                  regType === 'none'
                    ? 'bg-teal-600 text-white border-teal-600 shadow-sm'
                    : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                无 (None)
              </button>
              <button
                onClick={() => setRegType('l2')}
                className={`py-1.5 px-2 text-xs sm:text-sm rounded-lg font-semibold border transition-all cursor-pointer ${
                  regType === 'l2'
                    ? 'bg-teal-600 text-white border-teal-600 shadow-sm'
                    : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                Ridge (L2)
              </button>
              <button
                onClick={() => setRegType('l1')}
                className={`py-1.5 px-2 text-xs sm:text-sm rounded-lg font-semibold border transition-all cursor-pointer ${
                  regType === 'l1'
                    ? 'bg-teal-600 text-white border-teal-600 shadow-sm'
                    : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                Lasso (L1)
              </button>
            </div>

            {regType !== 'none' && (
              <div className="mt-1 pt-2 border-t border-slate-200">
                <div className="flex justify-between text-xs sm:text-sm font-semibold text-slate-700 mb-1">
                  <span>惩罚强度 <MathSpan math="\lambda" sizeClass="text-base" /> (Lambda):</span>
                  <span className="text-purple-600 font-mono font-bold text-sm sm:text-base">{lambdaVal.toFixed(1)}</span>
                </div>
                <input
                  type="range"
                  min="0.1"
                  max="5.0"
                  step="0.1"
                  value={lambdaVal}
                  onChange={(e) => setLambdaVal(parseFloat(e.target.value))}
                  className="w-full accent-purple-600 cursor-pointer h-2 bg-slate-200 rounded-lg"
                />
              </div>
            )}
          </div>

          {/* Loss Metrics Readout */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex flex-col gap-2.5 font-sans text-xs sm:text-sm shadow-sm text-slate-800">
            <div className="flex justify-between items-center">
              <span className="text-slate-700 font-semibold">均方误差 <MathSpan math="\text{MSE}" sizeClass="text-base font-bold" />:</span>
              <span className="text-amber-700 font-mono font-bold text-sm sm:text-base">{mse.toFixed(4)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-700 font-semibold">正则惩罚项 <MathSpan math="R(w)" sizeClass="text-base font-bold" />:</span>
              <span className="text-purple-700 font-mono font-bold text-sm sm:text-base">{penalty.toFixed(4)}</span>
            </div>
            <div className="border-t border-slate-200 pt-2 flex justify-between items-center text-sm sm:text-base">
              <span className="text-teal-800 font-bold">总损失 <MathSpan math="J(w)" sizeClass="text-lg font-bold text-teal-800" />:</span>
              <span className="text-teal-700 font-mono font-extrabold text-base sm:text-lg">{totalLoss.toFixed(4)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* 实时手算核对展开折叠区 (全量 KaTeX LaTeX 加大字号清晰渲染) */}
      <div className="border-t border-slate-200 pt-4">
        <button
          onClick={() => setShowTable(!showTable)}
          className="flex items-center gap-1.5 text-xs sm:text-sm font-bold text-teal-700 hover:text-teal-900 transition-colors cursor-pointer"
        >
          <Calculator className="w-4 h-4 text-teal-600" />
          <span>{showTable ? '收起' : '展开'} 实时手算逐项明细与 KaTeX 梯度核对表</span>
          {showTable ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>

        {showTable && (
          <div className="mt-3 space-y-4">
            <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
              <table className="w-full text-xs sm:text-sm text-left font-sans border-collapse">
                <thead>
                  <tr className="bg-slate-100 text-slate-900 font-bold border-b border-slate-200">
                    <th className="p-3 border-r border-slate-200 whitespace-nowrap">样本 <MathSpan math="i" sizeClass="text-base" /></th>
                    <th className="p-3 border-r border-slate-200 whitespace-nowrap"><MathSpan math="x_i" sizeClass="text-base font-bold" /></th>
                    <th className="p-3 border-r border-slate-200 whitespace-nowrap">真实 <MathSpan math="y_i" sizeClass="text-base font-bold" /></th>
                    <th className="p-3 border-r border-slate-200 whitespace-nowrap">预测 <MathSpan math="\hat{y}_i" sizeClass="text-base font-bold" /></th>
                    <th className="p-3 border-r border-slate-200 whitespace-nowrap text-amber-900">残差 <MathSpan math="e_i = \hat{y}_i - y_i" sizeClass="text-base font-bold" /></th>
                    <th className="p-3 border-r border-slate-200 whitespace-nowrap text-amber-900">平方残差 <MathSpan math="e_i^2" sizeClass="text-base font-bold" /></th>
                    <th className="p-3 whitespace-nowrap text-purple-900">梯度积 <MathSpan math="e_i \cdot x_i" sizeClass="text-base font-bold" /></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-mono text-xs sm:text-sm">
                  {details.map((row) => (
                    <tr key={row.id} className="hover:bg-slate-50">
                      <td className="p-3 border-r border-slate-100 font-sans font-semibold text-slate-800">样本 {row.id}</td>
                      <td className="p-3 border-r border-slate-100">{row.x.toFixed(1)}</td>
                      <td className="p-3 border-r border-slate-100">{row.y.toFixed(1)}</td>
                      <td className="p-3 border-r border-slate-100 font-bold text-teal-700">{row.yPred.toFixed(2)}</td>
                      <td className={`p-3 border-r border-slate-100 font-bold ${row.err < 0 ? 'text-amber-700' : 'text-blue-700'}`}>
                        {row.err > 0 ? `+${row.err.toFixed(2)}` : row.err.toFixed(2)}
                      </td>
                      <td className="p-3 border-r border-slate-100 font-bold text-amber-700">{row.sqErr.toFixed(4)}</td>
                      <td className={`p-3 font-bold ${row.ex < 0 ? 'text-purple-700' : 'text-emerald-700'}`}>
                        {row.ex > 0 ? `+${row.ex.toFixed(2)}` : row.ex.toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* 实效求导公式与当前数值推导小卡片 (KaTeX 大字号舒适排版) */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-xs sm:text-sm text-slate-800 grid grid-cols-1 md:grid-cols-2 gap-4 font-sans shadow-sm">
              <div className="space-y-2 border-r-0 md:border-r border-slate-200 pr-0 md:pr-4 leading-relaxed">
                <div className="font-bold text-slate-900 flex items-center gap-1.5">
                  均方误差 <MathSpan math="\text{MSE}" sizeClass="text-base font-bold text-teal-800" /> 实时推导算式:
                </div>
                <div className="text-amber-950 font-mono leading-relaxed">
                  <MathSpan math="\text{MSE} = \frac{1}{N} \sum e_i^2" sizeClass="text-base font-bold" /> = <MathSpan math="\frac{1}{5}" sizeClass="text-base font-bold" /> ({details.map(d => d.sqErr.toFixed(2)).join(' + ')})
                </div>
                <div className="font-bold text-amber-800 font-mono text-sm sm:text-base pt-1">
                  = <MathSpan math="\frac{1}{5}" sizeClass="text-lg font-bold" /> ({details.reduce((a, b) => a + b.sqErr, 0).toFixed(2)}) = <span className="text-amber-700 font-extrabold">{mse.toFixed(4)}</span>
                </div>
              </div>

              <div className="space-y-2 leading-relaxed">
                <div className="font-bold text-slate-900">
                  梯度数值 <MathSpan math="\frac{\partial L}{\partial w}" sizeClass="text-base font-bold text-purple-800" /> 与 <MathSpan math="\frac{\partial L}{\partial b}" sizeClass="text-base font-bold text-purple-800" /> 实时推导算式:
                </div>
                <div className="text-purple-950 font-mono leading-relaxed">
                  <MathSpan math="\frac{\partial L}{\partial w} = \frac{2}{5} \sum (e_i \cdot x_i)" sizeClass="text-base font-bold" /> = <MathSpan math="\frac{2}{5}" sizeClass="text-base font-bold" /> ({details.map(d => d.ex.toFixed(2)).join(' + ')}) = <span className="font-extrabold text-purple-700 text-sm sm:text-base">{gradW.toFixed(4)}</span>
                </div>
                <div className="text-purple-950 font-mono leading-relaxed">
                  <MathSpan math="\frac{\partial L}{\partial b} = \frac{2}{5} \sum e_i" sizeClass="text-base font-bold" /> = <MathSpan math="\frac{2}{5}" sizeClass="text-base font-bold" /> ({details.map(d => d.err.toFixed(2)).join(' + ')}) = <span className="font-extrabold text-purple-700 text-sm sm:text-base">{gradB.toFixed(4)}</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
