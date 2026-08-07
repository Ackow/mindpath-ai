'use client';

import React, { useState, useMemo } from 'react';
import { Activity, RotateCcw, AlertTriangle } from 'lucide-react';
import katex from 'katex';
import 'katex/dist/katex.min.css';

function MathSpan({ math, sizeClass = 'text-base sm:text-lg font-bold' }: { math: string; sizeClass?: string }) {
  const html = useMemo(() => {
    try {
      return katex.renderToString(math, { displayMode: false, throwOnError: false });
    } catch {
      return math;
    }
  }, [math]);

  return <span className={`inline-inline ${sizeClass}`} dangerouslySetInnerHTML={{ __html: html }} />;
}

export function FeatureScalingLab() {
  const [outlierVal, setOutlierVal] = useState<number>(150);
  const [mode, setMode] = useState<'both' | 'minmax' | 'zscore'>('both');

  // Base normal points: 50, 100, plus the 3rd point which can become an outlier
  const rawPoints = useMemo(() => [50, 100, outlierVal], [outlierVal]);

  // Compute Statistics
  const { mean, std, minVal, maxVal, zscorePoints, minmaxPoints } = useMemo(() => {
    const N = rawPoints.length;
    const m = rawPoints.reduce((a, b) => a + b, 0) / N;
    const variance = rawPoints.reduce((a, b) => a + Math.pow(b - m, 2), 0) / N;
    const s = Math.sqrt(variance) || 1e-5;

    const minV = Math.min(...rawPoints);
    const maxV = Math.max(...rawPoints);
    const rangeV = maxV - minV || 1e-5;

    const zPts = rawPoints.map(x => (x - m) / s);
    const mmPts = rawPoints.map(x => (x - minV) / rangeV);

    return {
      mean: m,
      std: s,
      minVal: minV,
      maxVal: maxV,
      zscorePoints: zPts,
      minmaxPoints: mmPts,
    };
  }, [rawPoints]);

  const handleReset = () => {
    setOutlierVal(150);
    setMode('both');
  };

  // SVG Canvas configuration with generous height to prevent any text overlaps
  const svgW = 540;
  const svgH = mode === 'both' ? 280 : 160;

  return (
    <div className="my-7 rounded-2xl border border-slate-200 bg-white p-5 space-y-5 shadow-card font-sans">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-teal-50 text-teal-700 border border-teal-200">
            <Activity className="w-4 h-4" />
            特征工程缩放实验室
          </span>
          <h4 className="text-base sm:text-lg font-bold text-slate-800">Z-Score 标准化 vs Min-Max 归一化</h4>
        </div>

        <button
          onClick={handleReset}
          className="flex items-center gap-1 text-slate-600 hover:text-slate-900 text-xs sm:text-sm font-semibold px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 border border-slate-200 transition-colors cursor-pointer"
        >
          <RotateCcw className="w-4 h-4" />
          重置样本
        </button>
      </div>

      {/* Control sliders & Outlier simulator */}
      <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs sm:text-sm font-bold text-slate-800">
            <AlertTriangle className={`w-4 h-4 ${outlierVal > 250 ? 'text-amber-600 animate-pulse' : 'text-slate-500'}`} />
            <span>模拟离群异常值 (Outlier Simulator):</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-600">视图模式:</span>
            <button
              onClick={() => setMode('both')}
              className={`px-2.5 py-1 text-xs rounded-md font-semibold border transition-all cursor-pointer ${
                mode === 'both' ? 'bg-teal-600 text-white border-teal-600' : 'bg-white text-slate-700 border-slate-200'
              }`}
            >
              对比模式
            </button>
            <button
              onClick={() => setMode('minmax')}
              className={`px-2.5 py-1 text-xs rounded-md font-semibold border transition-all cursor-pointer ${
                mode === 'minmax' ? 'bg-teal-600 text-white border-teal-600' : 'bg-white text-slate-700 border-slate-200'
              }`}
            >
              仅 Min-Max
            </button>
            <button
              onClick={() => setMode('zscore')}
              className={`px-2.5 py-1 text-xs rounded-md font-semibold border transition-all cursor-pointer ${
                mode === 'zscore' ? 'bg-teal-600 text-white border-teal-600' : 'bg-white text-slate-700 border-slate-200'
              }`}
            >
              仅 Z-Score
            </button>
          </div>
        </div>

        <div>
          <div className="flex justify-between text-xs sm:text-sm font-semibold text-slate-700 mb-1">
            <span>第 3 个样本的原始观测值 <MathSpan math="x_3" sizeClass="text-base font-bold text-teal-800" />:</span>
            <span className={`font-mono font-bold text-sm sm:text-base ${outlierVal > 250 ? 'text-amber-700' : 'text-teal-700'}`}>
              {outlierVal} {outlierVal > 250 && '(极值异常点)'}
            </span>
          </div>
          <input
            type="range"
            min="150"
            max="1000"
            step="10"
            value={outlierVal}
            onChange={(e) => setOutlierVal(parseFloat(e.target.value))}
            className="w-full accent-teal-600 cursor-pointer h-2 bg-slate-200 rounded-lg"
          />
        </div>
      </div>

      {/* Outlier Warning Banner (Clean HTML banner, zero text overlapping) */}
      {outlierVal > 250 && (mode === 'both' || mode === 'minmax') && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs sm:text-sm text-amber-900 flex items-center gap-2 shadow-sm font-sans">
          <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
          <div>
            <span className="font-bold">异常值预警：</span>由于存在极值 <MathSpan math={`x_3=${outlierVal}`} sizeClass="text-sm font-bold text-amber-800" />，Min-Max 将正常样本分布强制压缩在极狭窄的 <span className="font-mono font-bold">[{minmaxPoints[0].toFixed(2)}, {minmaxPoints[1].toFixed(2)}]</span> 区间内！
          </div>
        </div>
      )}

      {/* SVG 1D Number Line Visualizations */}
      <div className="bg-slate-50 rounded-xl p-4 shadow-sm border border-slate-200 flex flex-col items-center">
        <svg viewBox={`0 0 ${svgW} ${svgH}`} className="w-full h-auto">
          {/* Section 1: Min-Max Number Line (Top) */}
          {(mode === 'both' || mode === 'minmax') && (
            <g transform="translate(0, 10)">
              <text x={20} y={20} fill="#0F172A" fontSize="13" fontWeight="700">
                Min-Max 归一化 [0, 1] 响应点阵:
              </text>
              {/* Number Line axis */}
              <line x1={80} y1={65} x2={svgW - 40} y2={65} stroke="#64748B" strokeWidth="2.5" />
              <line x1={80} y1={58} x2={80} y2={72} stroke="#64748B" strokeWidth="2.5" />
              <line x1={svgW - 40} y1={58} x2={svgW - 40} y2={72} stroke="#64748B" strokeWidth="2.5" />
              <text x={80} y={90} fill="#475569" fontSize="12" textAnchor="middle" fontWeight="700">0.0</text>
              <text x={svgW - 40} y={90} fill="#475569" fontSize="12" textAnchor="middle" fontWeight="700">1.0</text>

              {/* Compressed zone highlight if outlier > 250 */}
              {outlierVal > 250 && (
                <rect
                  x={80}
                  y={48}
                  width={Math.max(18, (minmaxPoints[1] - minmaxPoints[0]) * (svgW - 120))}
                  height={34}
                  fill="rgba(245, 158, 11, 0.2)"
                  stroke="#F59E0B"
                  strokeWidth="2"
                  rx="6"
                />
              )}

              {/* Data Dots */}
              {minmaxPoints.map((val, idx) => {
                const cx = 80 + val * (svgW - 120);
                return (
                  <g key={`mm-dot-${idx}`}>
                    <circle cx={cx} cy={65} r="8" fill={idx === 2 && outlierVal > 250 ? '#D97706' : '#0284C7'} stroke="#FFFFFF" strokeWidth="2" />
                    <text x={cx} y={42} fill="#0F172A" fontSize="12" fontWeight="800" textAnchor="middle">
                      {val.toFixed(3)}
                    </text>
                  </g>
                );
              })}
            </g>
          )}

          {/* Section 2: Z-Score Number Line (Bottom) */}
          {(mode === 'both' || mode === 'zscore') && (
            <g transform={`translate(0, ${mode === 'both' ? 145 : 10})`}>
              <text x={20} y={20} fill="#0F172A" fontSize="13" fontWeight="700">
                Z-Score 标准化 (均值 μ=0, 标准差 σ=1) 点阵:
              </text>
              {/* Number Line axis */}
              <line x1={80} y1={65} x2={svgW - 40} y2={65} stroke="#64748B" strokeWidth="2.5" />
              {/* Mean marker line at center */}
              <line x1={(80 + svgW - 40) / 2} y1={52} x2={(80 + svgW - 40) / 2} y2={78} stroke="#0D9488" strokeWidth="2.5" strokeDasharray="3 3" />
              <text x={(80 + svgW - 40) / 2} y={96} fill="#0D9488" fontSize="12" textAnchor="middle" fontWeight="800">均值 μ=0</text>

              {/* Data Dots mapped from [-2.2, +2.2] */}
              {zscorePoints.map((val, idx) => {
                const clamped = Math.max(-2.2, Math.min(2.2, val));
                const normRatio = (clamped + 2.2) / 4.4;
                const cx = 80 + normRatio * (svgW - 120);

                return (
                  <g key={`zs-dot-${idx}`}>
                    <circle cx={cx} cy={65} r="8" fill={idx === 2 && outlierVal > 250 ? '#9333EA' : '#0D9488'} stroke="#FFFFFF" strokeWidth="2" />
                    <text x={cx} y={42} fill="#0F172A" fontSize="12" fontWeight="800" textAnchor="middle">
                      {val > 0 ? `+${val.toFixed(2)}` : val.toFixed(2)}
                    </text>
                  </g>
                );
              })}
            </g>
          )}
        </svg>
      </div>

      {/* KaTeX Hand-Calc Breakdown Readout - 大字号高清晰显示 */}
      <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-sm sm:text-base text-slate-800 grid grid-cols-1 md:grid-cols-2 gap-5 font-sans shadow-sm">
        <div className="space-y-3 border-r-0 md:border-r border-slate-200 pr-0 md:pr-5 leading-relaxed">
          <div className="font-bold text-slate-900 flex flex-wrap items-center gap-1.5">
            Min-Max 实时推导算式:
          </div>
          <div className="py-1">
            <MathSpan math="x_{\text{scaled}} = \frac{x - x_{\min}}{x_{\max} - x_{\min}}" sizeClass="text-base sm:text-xl font-bold text-teal-800" />
          </div>
          <div className="text-slate-800 font-mono text-xs sm:text-sm space-y-1.5 pt-1">
            <div className="flex justify-between border-b border-slate-200 pb-1">
              <span><MathSpan math="x_1 = 50" sizeClass="text-sm font-bold" /></span>
              <span className="font-bold text-teal-700">{minmaxPoints[0].toFixed(4)}</span>
            </div>
            <div className="flex justify-between border-b border-slate-200 pb-1">
              <span><MathSpan math="x_2 = 100" sizeClass="text-sm font-bold" /></span>
              <span className="font-bold text-teal-700">{minmaxPoints[1].toFixed(4)}</span>
            </div>
            <div className="flex justify-between">
              <span><MathSpan math={`x_3 = ${outlierVal}`} sizeClass="text-sm font-bold" /></span>
              <span className="font-extrabold text-amber-700">{minmaxPoints[2].toFixed(4)}</span>
            </div>
          </div>
        </div>

        <div className="space-y-3 leading-relaxed">
          <div className="font-bold text-slate-900 flex flex-wrap items-center gap-1.5">
            Z-Score 实时推导算式:
          </div>
          <div className="py-1">
            <MathSpan math="x_{\text{scaled}} = \frac{x - \mu}{\sigma}" sizeClass="text-base sm:text-xl font-bold text-purple-800" />
          </div>
          <div className="text-slate-700 text-xs sm:text-sm font-bold">
            均值 <MathSpan math="\mu" sizeClass="text-base font-bold text-purple-800" /> = {mean.toFixed(2)}, 标准差 <MathSpan math="\sigma" sizeClass="text-base font-bold text-purple-800" /> = {std.toFixed(2)}
          </div>
          <div className="text-slate-800 font-mono text-xs sm:text-sm space-y-1.5 pt-1">
            <div className="flex justify-between border-b border-slate-200 pb-1">
              <span><MathSpan math="x_1 = 50" sizeClass="text-sm font-bold" /></span>
              <span className="font-bold text-purple-700">{zscorePoints[0].toFixed(2)}</span>
            </div>
            <div className="flex justify-between border-b border-slate-200 pb-1">
              <span><MathSpan math="x_2 = 100" sizeClass="text-sm font-bold" /></span>
              <span className="font-bold text-purple-700">{zscorePoints[1].toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span><MathSpan math={`x_3 = ${outlierVal}`} sizeClass="text-sm font-bold" /></span>
              <span className="font-extrabold text-purple-800">{zscorePoints[2].toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
