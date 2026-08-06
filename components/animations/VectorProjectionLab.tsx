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

  const toSvg = (x: number, y: number) => ({ x: 160 + x * 36, y: 160 - y * 36 });
  const pointX = toSvg(x1, x2);
  const pointV = toSvg(v1, v2);
  const pointProjection = result ? toSvg(result.projection.x, result.projection.y) : toSvg(0, 0);

  const controls = [
    { label: '向量 x1', desc: '目标向量 x 的水平坐标', value: x1, set: setX1, color: 'text-teal-700 font-bold', bg: 'bg-teal-50 text-teal-700 border-teal-200' },
    { label: '向量 x2', desc: '目标向量 x 的垂直坐标', value: x2, set: setX2, color: 'text-teal-700 font-bold', bg: 'bg-teal-50 text-teal-700 border-teal-200' },
    { label: '投影轴 v1', desc: '基准轴 v 的水平坐标', value: v1, set: setV1, color: 'text-blue-600 font-bold', bg: 'bg-blue-50 text-blue-700 border-blue-200' },
    { label: '投影轴 v2', desc: '基准轴 v 的垂直坐标', value: v2, set: setV2, color: 'text-blue-600 font-bold', bg: 'bg-blue-50 text-blue-700 border-blue-200' },
  ];

  return (
    <div className="my-7 rounded-2xl border border-slate-200/80 bg-white p-5 space-y-5 shadow-card">
      {/* 顶栏控制栏：与 Python 章节交互组件完全统一 */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-teal-50 text-teal-700 border border-teal-200/60">
            <Compass className="w-4 h-4" />
            几何直觉互动演练
          </span>
          <h4 className="text-base font-bold text-slate-800">二维正交投影实验室</h4>
        </div>
        <button
          onClick={handleReset}
          className="flex items-center gap-1 text-slate-600 hover:text-slate-900 text-xs font-semibold px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 border border-slate-200 transition-colors cursor-pointer"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          重置参数
        </button>
      </div>

      {/* 实验室目的与原理说明卡片 */}
      <div className="rounded-xl border border-sky-200/70 bg-sky-50/50 p-4 text-xs text-slate-700 space-y-2">
        <div className="flex items-center gap-2 font-bold text-sky-900 text-sm">
          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-sky-200/80 text-sky-800 text-xs">💡</span>
          <span>目的：</span>
        </div>
        <p className="leading-relaxed text-slate-600">
          本实验室用于直观演示<strong className="text-slate-800">向量的正交投影（Orthogonal Projection）</strong>及其几何意义：
        </p>
        <ul className="grid gap-1.5 sm:grid-cols-3 pt-1 text-xs">
          <li className="flex items-start gap-1.5 rounded-lg bg-white/80 p-2 border border-sky-100">
            <span className="font-bold text-teal-700">1. 目标向量 x (绿)</span>
            <span className="text-slate-500">待投影的原向量，可调整其方向与长度。</span>
          </li>
          <li className="flex items-start gap-1.5 rounded-lg bg-white/80 p-2 border border-sky-100">
            <span className="font-bold text-blue-600">2. 投影轴 v (蓝)</span>
            <span className="text-slate-500">投影的基准方向轴。</span>
          </li>
          <li className="flex items-start gap-1.5 rounded-lg bg-white/80 p-2 border border-sky-100">
            <span className="font-bold text-orange-600">3. 投影向量 (橙)</span>
            <span className="text-slate-500">x 垂直“照射”在 v 轴上的影子，残差虚线永远与 v 轴成 90° 正交！</span>
          </li>
        </ul>
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
        {/* SVG 坐标画布（放大坐标轴） */}
        <div className="min-w-0 rounded-xl border border-slate-200/80 bg-slate-50/60 p-3 flex flex-col items-center justify-center">
          <svg viewBox="0 0 320 320" className="w-full h-auto max-h-[460px] aspect-square" role="img" aria-label="向量投影交互图">
            <defs>
              {/* 精巧缩小的向量箭头 Marker (优化尺寸) */}
              <marker id="projection-arrow" markerWidth="5" markerHeight="5" refX="4" refY="2.5" orient="auto">
                <path d="M0,0.5 L0,4.5 L4.5,2.5 z" fill="currentColor" />
              </marker>
            </defs>

            {/* 背景网格线 */}
            {Array.from({ length: 9 }, (_, index) => index - 4).map((value) => {
              const vertical = toSvg(value, 0).x;
              const horizontal = toSvg(0, value).y;
              return (
                <g key={value}>
                  <line x1={vertical} y1="20" x2={vertical} y2="300" stroke="#e2e8f0" strokeWidth="1" />
                  <line x1="20" y1={horizontal} x2="300" y2={horizontal} stroke="#e2e8f0" strokeWidth="1" />
                </g>
              );
            })}

            {/* 坐标轴 */}
            <line x1="20" y1="160" x2="300" y2="160" stroke="#475569" strokeWidth="1.5" />
            <line x1="160" y1="300" x2="160" y2="20" stroke="#475569" strokeWidth="1.5" />

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

            {/* 文字标签（增大字体） */}
            <text x={pointV.x + 6} y={pointV.y - 6} fill="#1d4ed8" fontSize="15" fontWeight="bold">v</text>
            <text x={pointX.x + 6} y={pointX.y - 6} fill="#0f766e" fontSize="15" fontWeight="bold">x</text>
            {result && (
              <text x={pointProjection.x + 6} y={pointProjection.y + 18} fill="#c2410c" fontSize="13" fontWeight="bold">
                projᵥ(x)
              </text>
            )}
          </svg>
        </div>

        {/* 右侧控制参数与解析面板（加宽 340px + 字体放大） */}
        <div className="space-y-4 flex flex-col justify-between">
          <div className="bg-slate-50/80 rounded-xl p-4 border border-slate-200/60 space-y-3.5">
            <div className="text-sm font-bold text-slate-800 border-b border-slate-200/60 pb-2 flex items-center justify-between">
              <span>参数调节与功能说明</span>
              <span className="text-xs text-slate-500 font-normal">拖动控制分量</span>
            </div>
            {controls.map(({ label, desc, value, set, color, bg }) => (
              <div key={label} className="space-y-1.5">
                <div className="flex justify-between items-center text-xs">
                  <div>
                    <span className={`text-sm ${color}`}>{label}</span>
                    <span className="text-xs text-slate-500 ml-1.5 font-normal">({desc})</span>
                  </div>
                  <span className={`px-2 py-0.5 rounded font-mono font-bold text-xs border ${bg}`}>
                    {value > 0 ? `+${value}` : value}
                  </span>
                </div>
                <input
                  className="w-full accent-teal-600 h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer"
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

          {/* 正交残差面板（字体调大） */}
          {result ? (
            <div className="rounded-xl border border-teal-200/80 bg-teal-50/60 p-4 font-mono text-xs leading-relaxed text-teal-950 shadow-xs space-y-2">
              <div className="font-bold text-sm text-teal-900 border-b border-teal-200/60 pb-1.5 flex justify-between items-center font-sans">
                <span>实时推导结果说明</span>
                <span className="text-xs text-teal-700 font-medium">正交条件验证</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-600 font-sans text-xs">正交投影向量:</span>
                <span className="font-bold text-xs text-orange-700 font-mono">({result.projection.x.toFixed(2)}, {result.projection.y.toFixed(2)})</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-600 font-sans text-xs">垂直残差向量 r:</span>
                <span className="font-bold text-xs text-slate-700 font-mono">({result.residual.x.toFixed(2)}, {result.residual.y.toFixed(2)})</span>
              </div>
              <div className="pt-1.5 border-t border-teal-200/60 flex justify-between items-center">
                <span className="text-slate-600 font-sans text-xs font-medium">残差正交验证 (vᵀ r):</span>
                <span className="text-emerald-800 font-bold bg-emerald-100/90 px-2 py-0.5 rounded text-xs">
                  {Math.abs(result.dot) < 1e-6 ? '0 (完全正交 90°)' : result.dot.toFixed(4)}
                </span>
              </div>
            </div>
          ) : (
            <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-xs text-amber-900 font-medium">
              v 不能是零向量，请调大 v1 或 v2。
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
