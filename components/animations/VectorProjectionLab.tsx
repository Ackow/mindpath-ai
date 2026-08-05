'use client';

import React, { useMemo, useState } from 'react';
import { Compass, RotateCcw } from 'lucide-react';

const clamp = (value: number) => Math.max(-4, Math.min(4, value));

export function VectorProjectionLab() {
  const [x1, setX1] = useState(3);
  const [x2, setX2] = useState(2);
  const [v1, setV1] = useState(3);
  const [v2, setV2] = useState(1);

  const result = useMemo(() => {
    const normSquared = v1 ** 2 + v2 ** 2;
    if (normSquared === 0) return null;
    const coefficient = (x1 * v1 + x2 * v2) / normSquared;
    const projection = { x: coefficient * v1, y: coefficient * v2 };
    return {
      coefficient,
      projection,
      residual: { x: x1 - projection.x, y: x2 - projection.y },
      dot: v1 * (x1 - projection.x) + v2 * (x2 - projection.y),
    };
  }, [v1, v2, x1, x2]);

  const handleReset = () => {
    setX1(3);
    setX2(2);
    setV1(3);
    setV2(1);
  };

  const toSvg = (x: number, y: number) => ({ x: 160 + x * 28, y: 160 - y * 28 });
  const pointX = toSvg(x1, x2);
  const pointV = toSvg(v1, v2);
  const pointProjection = result ? toSvg(result.projection.x, result.projection.y) : toSvg(0, 0);

  const controls = [
    { label: '向量 x1', value: x1, set: setX1 },
    { label: '向量 x2', value: x2, set: setX2 },
    { label: '投影轴 v1', value: v1, set: setV1 },
    { label: '投影轴 v2', value: v2, set: setV2 },
  ];

  return (
    <div className="my-7 rounded-2xl border border-slate-200/80 bg-white p-5 space-y-5 shadow-card">
      {/* 顶栏控制栏：与 Python 章节交互组件完全统一 */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-teal-50 text-teal-700 border border-teal-200/60">
            <Compass className="w-3.5 h-3.5" />
            几何直觉互动演练
          </span>
          <h4 className="text-sm font-bold text-slate-800">二维正交投影实验室</h4>
        </div>
        <button
          onClick={handleReset}
          className="flex items-center gap-1 text-slate-500 hover:text-slate-800 text-xs px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 border border-slate-200 transition-colors cursor-pointer"
        >
          <RotateCcw className="w-3 h-3" />
          重置参数
        </button>
      </div>

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_260px]">
        {/* SVG 画布 */}
        <div className="min-w-0 rounded-xl border border-slate-200/80 bg-slate-50/60 p-3 flex flex-col items-center justify-center">
          <svg viewBox="0 0 320 320" className="h-auto w-full max-w-[340px]" role="img" aria-label="向量投影交互图">
            <defs>
              {/* 精巧缩小的向量箭头 Marker (优化尺寸) */}
              <marker id="projection-arrow" markerWidth="4" markerHeight="4" refX="3" refY="2" orient="auto">
                <path d="M0,0.5 L0,3.5 L3.5,2 z" fill="currentColor" />
              </marker>
            </defs>

            {/* 背景网格线 */}
            {Array.from({ length: 9 }, (_, index) => index - 4).map((value) => {
              const vertical = toSvg(value, 0).x;
              const horizontal = toSvg(0, value).y;
              return (
                <g key={value}>
                  <line x1={vertical} y1="48" x2={vertical} y2="272" stroke="#e2e8f0" strokeWidth="1" />
                  <line x1="48" y1={horizontal} x2="272" y2={horizontal} stroke="#e2e8f0" strokeWidth="1" />
                </g>
              );
            })}

            {/* 坐标轴 */}
            <line x1="48" y1="160" x2="272" y2="160" stroke="#64748b" strokeWidth="1.5" />
            <line x1="160" y1="272" x2="160" y2="48" stroke="#64748b" strokeWidth="1.5" />

            {/* 残差虚线 */}
            {result && (
              <line
                x1={pointX.x}
                y1={pointX.y}
                x2={pointProjection.x}
                y2={pointProjection.y}
                stroke="#64748b"
                strokeDasharray="4 3"
                strokeWidth="1.5"
              />
            )}

            {/* 向量 v */}
            <line
              x1="160"
              y1="160"
              x2={pointV.x}
              y2={pointV.y}
              stroke="#2563eb"
              strokeWidth="2.5"
              markerEnd="url(#projection-arrow)"
              className="text-blue-600"
            />

            {/* 向量 x */}
            <line
              x1="160"
              y1="160"
              x2={pointX.x}
              y2={pointX.y}
              stroke="#0f766e"
              strokeWidth="2.5"
              markerEnd="url(#projection-arrow)"
              className="text-teal-700"
            />

            {/* 投影向量 proj_v(x) */}
            {result && (
              <line
                x1="160"
                y1="160"
                x2={pointProjection.x}
                y2={pointProjection.y}
                stroke="#ea580c"
                strokeWidth="3"
                markerEnd="url(#projection-arrow)"
                className="text-orange-600"
              />
            )}

            {/* 文字标签 */}
            <text x={pointV.x + 6} y={pointV.y - 6} fill="#1d4ed8" fontSize="13" fontWeight="bold">v</text>
            <text x={pointX.x + 6} y={pointX.y - 6} fill="#0f766e" fontSize="13" fontWeight="bold">x</text>
            {result && (
              <text x={pointProjection.x + 6} y={pointProjection.y + 16} fill="#c2410c" fontSize="11" fontWeight="bold">
                projᵥ(x)
              </text>
            )}
          </svg>
        </div>

        {/* 右侧滑块控制与计算面板 */}
        <div className="space-y-4 flex flex-col justify-between">
          <div className="bg-slate-50/80 rounded-xl p-4 border border-slate-200/60 space-y-3">
            {controls.map(({ label, value, set }) => (
              <div key={label} className="space-y-1">
                <div className="flex justify-between items-center text-xs font-semibold text-slate-700">
                  <span>{label}</span>
                  <span className="px-1.5 py-0.5 rounded bg-slate-200/80 text-slate-800 font-mono font-bold text-[11px]">
                    {value}
                  </span>
                </div>
                <input
                  className="w-full accent-teal-600 h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer"
                  type="range"
                  min="-4"
                  max="4"
                  step="1"
                  value={value}
                  onChange={(event) => set(clamp(Number(event.target.value)))}
                />
              </div>
            ))}
          </div>

          {/* 正交残差面板 */}
          {result ? (
            <div className="rounded-xl border border-teal-200/80 bg-teal-50/60 p-3.5 font-mono text-xs leading-relaxed text-teal-950 shadow-xs space-y-1">
              <div className="font-bold text-teal-900 border-b border-teal-200/60 pb-1 mb-1">正交残差计算结果:</div>
              <div>proj_v(x) = ({result.projection.x.toFixed(2)}, {result.projection.y.toFixed(2)})</div>
              <div>残差 r = ({result.residual.x.toFixed(2)}, {result.residual.y.toFixed(2)})</div>
              <div className="text-emerald-700 font-bold">v^T @ r = {Math.abs(result.dot) < 1e-6 ? '0.00000000 (完全正交)' : result.dot.toFixed(8)}</div>
            </div>
          ) : (
            <div className="rounded-xl border border-amber-200 bg-amber-50 p-3.5 text-xs text-amber-900 font-medium">
              v 不能是零向量，请调大 v1 或 v2。
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
