'use client';

import React, { useState, useMemo } from 'react';
import { Activity, RotateCcw, Sliders, Target, CheckCircle2 } from 'lucide-react';
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

export function RegularizationGeometryLab() {
  const [lambdaVal, setLambdaVal] = useState<number>(1.5);
  const [regType, setRegType] = useState<'l1' | 'l2'>('l1');

  // Unconstrained OLS Solution w* = (2.2, 2.0)
  const olsW1 = 2.2;
  const olsW2 = 2.0;

  // Compute Regularized Solution w_reg for L1 and L2
  const { w1, w2, isSparse } = useMemo(() => {
    if (regType === 'l2') {
      // Ridge L2 shrinkage: w_l2 = w_ols / (1 + lambda)
      const factor = 1 / (1 + lambdaVal * 0.4);
      const resW1 = olsW1 * factor;
      const resW2 = olsW2 * factor;
      return { w1: resW1, w2: resW2, isSparse: false };
    } else {
      // Lasso L1 soft-thresholding: w_l1 = sign(w) * max(0, |w| - lambda)
      const thresh = lambdaVal * 0.85;
      const val1 = Math.max(0, olsW1 - thresh);
      const val2 = Math.max(0, olsW2 - thresh * 0.5);

      const resW1 = val1;
      const resW2 = val2;
      return { w1: resW1, w2: resW2, isSparse: resW1 === 0 };
    }
  }, [lambdaVal, regType]);

  const handleReset = () => {
    setLambdaVal(1.5);
    setRegType('l1');
  };

  // SVG Canvas Settings
  const svgW = 540;
  const svgH = 340;
  const originX = 270;
  const originY = 190;
  const scale = 65; // pixels per unit weight

  const mapW1 = (val: number) => originX + val * scale;
  const mapW2 = (val: number) => originY - val * scale;

  // L1 Diamond Vertices radius t
  const radiusT = regType === 'l1' ? Math.abs(w1) + Math.abs(w2) : Math.sqrt(w1 * w1 + w2 * w2);

  return (
    <div className="my-7 rounded-2xl border border-slate-200 bg-white p-5 space-y-5 shadow-card font-sans">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-teal-50 text-teal-700 border border-teal-200">
            <Target className="w-4 h-4" />
            正则化几何等高线实验室
          </span>
          <h4 className="text-base sm:text-lg font-bold text-slate-800">L1 (Lasso 菱形) vs L2 (Ridge 圆形) 约束切点分析</h4>
        </div>

        <button
          onClick={handleReset}
          className="flex items-center gap-1 text-slate-600 hover:text-slate-900 text-xs sm:text-sm font-semibold px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 border border-slate-200 transition-colors cursor-pointer"
        >
          <RotateCcw className="w-4 h-4" />
          重置
        </button>
      </div>

      {/* Control Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
        {/* SVG Plot (7 cols) */}
        <div className="lg:col-span-7 bg-slate-50 rounded-xl p-4 shadow-sm border border-slate-200 flex flex-col items-center justify-center">
          <svg viewBox={`0 0 ${svgW} ${svgH}`} className="w-full h-auto max-h-[350px]">
            {/* Grid Lines */}
            {[-2, -1, 1, 2, 3].map(v => (
              <React.Fragment key={`grid-${v}`}>
                <line x1={mapW1(v)} y1={20} x2={mapW1(v)} y2={svgH - 20} stroke="#E2E8F0" strokeWidth="1" strokeDasharray="3 3" />
                <line x1={20} y1={mapW2(v)} x2={svgW - 20} y2={mapW2(v)} stroke="#E2E8F0" strokeWidth="1" strokeDasharray="3 3" />
              </React.Fragment>
            ))}

            {/* Axes W1 & W2 */}
            <line x1={30} y1={originY} x2={svgW - 30} y2={originY} stroke="#64748B" strokeWidth="2.5" />
            <line x1={originX} y1={20} x2={originX} y2={svgH - 20} stroke="#64748B" strokeWidth="2.5" />

            <text x={svgW - 25} y={originY + 18} fill="#475569" fontSize="13" fontWeight="800" textAnchor="end">w1</text>
            <text x={originX + 10} y={30} fill="#475569" fontSize="13" fontWeight="800" textAnchor="start">w2</text>

            {/* MSE Loss Ellipse Contours centered at (2.2, 2.0) */}
            {[0.4, 0.9, 1.5, 2.2].map((r, i) => (
              <ellipse
                key={`ellipse-${i}`}
                cx={mapW1(olsW1)}
                cy={mapW2(olsW2)}
                rx={r * scale * 1.1}
                ry={r * scale * 0.7}
                fill="none"
                stroke="#0D9488"
                strokeWidth="1.5"
                strokeDasharray="4 4"
                transform={`rotate(-25, ${mapW1(olsW1)}, ${mapW2(olsW2)})`}
              />
            ))}

            {/* OLS Unconstrained Solution Dot w* */}
            <circle cx={mapW1(olsW1)} cy={mapW2(olsW2)} r="6" fill="#0D9488" />
            <text x={mapW1(olsW1) + 10} y={mapW2(olsW2) - 8} fill="#0F766E" fontSize="12" fontWeight="800">
              w* (OLS 最优解)
            </text>

            {/* Regularization Boundary Geometry */}
            {regType === 'l1' ? (
              /* Lasso L1 Diamond */
              <polygon
                points={`
                  ${mapW1(0)},${mapW2(radiusT)}
                  ${mapW1(radiusT)},${mapW2(0)}
                  ${mapW1(0)},${mapW2(-radiusT)}
                  ${mapW1(-radiusT)},${mapW2(0)}
                `}
                fill="rgba(147, 51, 234, 0.15)"
                stroke="#9333EA"
                strokeWidth="2.5"
              />
            ) : (
              /* Ridge L2 Circle */
              <circle
                cx={mapW1(0)}
                cy={mapW2(0)}
                r={radiusT * scale}
                fill="rgba(2, 132, 199, 0.15)"
                stroke="#0284C7"
                strokeWidth="2.5"
              />
            )}

            {/* Tangency Intersection Point (Sol: w_reg) */}
            <line x1={mapW1(olsW1)} y1={mapW2(olsW2)} x2={mapW1(w1)} y2={mapW2(w2)} stroke="#EF4444" strokeWidth="2" strokeDasharray="3 3" />
            <circle cx={mapW1(w1)} cy={mapW2(w2)} r="7" fill={isSparse ? '#DC2626' : '#9333EA'} stroke="#FFFFFF" strokeWidth="2" />
            <text x={mapW1(w1) + 10} y={mapW2(w2) + 15} fill="#0F172A" fontSize="12" fontWeight="800">
              切点 w_reg
            </text>
          </svg>
        </div>

        {/* Controls (5 cols) */}
        <div className="lg:col-span-5 flex flex-col gap-4">
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-4">
            <div className="flex items-center gap-1.5 text-xs sm:text-sm font-bold text-slate-800 border-b border-slate-200 pb-2">
              <Sliders className="w-4 h-4 text-teal-600" />
              正则化类型与惩罚强度 <MathSpan math="\lambda" sizeClass="text-base font-bold text-purple-800" />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setRegType('l1')}
                className={`py-2 px-3 text-xs sm:text-sm rounded-lg font-bold border transition-all cursor-pointer ${
                  regType === 'l1'
                    ? 'bg-purple-600 text-white border-purple-600 shadow-sm'
                    : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                L1 Lasso (菱形)
              </button>
              <button
                onClick={() => setRegType('l2')}
                className={`py-2 px-3 text-xs sm:text-sm rounded-lg font-bold border transition-all cursor-pointer ${
                  regType === 'l2'
                    ? 'bg-sky-600 text-white border-sky-600 shadow-sm'
                    : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                L2 Ridge (圆形)
              </button>
            </div>

            <div>
              <div className="flex justify-between text-xs sm:text-sm font-semibold text-slate-700 mb-1">
                <span>惩罚强度 <MathSpan math="\lambda" sizeClass="text-base font-bold text-purple-800" />:</span>
                <span className="text-purple-700 font-mono font-bold text-sm sm:text-base">{lambdaVal.toFixed(1)}</span>
              </div>
              <input
                type="range"
                min="0.1"
                max="4.0"
                step="0.1"
                value={lambdaVal}
                onChange={(e) => setLambdaVal(parseFloat(e.target.value))}
                className="w-full accent-purple-600 cursor-pointer h-2 bg-slate-200 rounded-lg"
              />
            </div>
          </div>

          {/* Sparsity & Geometry Conclusion Box - 大字号清晰可读 */}
          <div className={`border rounded-xl p-4 space-y-2.5 font-sans text-sm sm:text-base shadow-sm ${
            isSparse ? 'bg-amber-50 border-amber-200 text-amber-900' : 'bg-slate-50 border-slate-200 text-slate-800'
          }`}>
            <div className="flex items-center gap-1.5 font-bold text-base">
              <CheckCircle2 className={`w-5 h-5 ${isSparse ? 'text-amber-600' : 'text-teal-600'}`} />
              解空间几何切点结论:
            </div>
            <div className="font-mono text-xs sm:text-sm font-bold flex items-center gap-2">
              <span>当前解:</span>
              <MathSpan math={`w_{\\text{reg}} = [${w1.toFixed(2)}, ${w2.toFixed(2)}]^T`} sizeClass="text-base font-extrabold text-purple-800" />
            </div>
            <div className="text-xs sm:text-sm leading-relaxed">
              {regType === 'l1' ? (
                isSparse ? (
                  <span className="font-bold text-amber-800">
                    L1 菱形的尖锐顶点正好位于坐标轴上！等高线切于顶点，使权重 <MathSpan math="w_1 = 0.00" sizeClass="text-sm font-extrabold text-amber-900" />，实现了绝对稀疏与自动特征选择！
                  </span>
                ) : (
                  <span>增大 <MathSpan math="\lambda" sizeClass="text-sm font-bold" />，等高线切点将直接撞击在菱形顶点，强行将权重压缩至 0。</span>
                )
              ) : (
                <span>L2 圆形边界各处光滑，等高线切点使权重平滑缩小，但不会精准切在坐标轴上，参数保持非零。</span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
