'use client';

import React, { useMemo, useState } from 'react';
import { Layers, RotateCcw } from 'lucide-react';

const singularValues = [8, 4, 1.5, 0.5];

export function SvdRankLab() {
  const [rank, setRank] = useState(2);
  const { retainedEnergy, error } = useMemo(() => {
    const total = singularValues.reduce((sum, value) => sum + value ** 2, 0);
    const retained = singularValues.slice(0, rank).reduce((sum, value) => sum + value ** 2, 0);
    return { retainedEnergy: retained / total, error: Math.sqrt(total - retained) };
  }, [rank]);

  const handleReset = () => setRank(2);

  return (
    <div className="my-7 rounded-2xl border border-slate-200/80 bg-white p-5 space-y-5 shadow-card">
      {/* 顶栏控制栏：与 Python 章节交互组件完全统一 */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-teal-50 text-teal-700 border border-teal-200/60">
            <Layers className="w-3.5 h-3.5" />
            低秩近似互动演练
          </span>
          <h4 className="text-sm font-bold text-slate-800">截断 SVD 阶数 (Rank k) 评估实验室</h4>
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
        {/* 奇异值柱状图柱体视图 */}
        <div className="flex min-h-44 items-end gap-4 rounded-xl border border-slate-200/80 bg-slate-50/60 px-5 pb-8 pt-5 justify-around">
          {singularValues.map((value, index) => (
            <div key={value} className="flex flex-1 flex-col items-center gap-2 max-w-[50px]">
              <div
                className={`w-full rounded-t-lg transition-all duration-300 ${
                  index < rank
                    ? 'bg-gradient-to-t from-teal-600 to-teal-400 shadow-xs'
                    : 'bg-slate-300/80'
                }`}
                style={{ height: `${value * 14}px` }}
              />
              <span className={`text-xs font-mono font-bold ${index < rank ? 'text-teal-800' : 'text-slate-500'}`}>
                σ{index + 1}={value}
              </span>
            </div>
          ))}
        </div>

        {/* 右侧滑块控制与能量/误差评估面板 */}
        <div className="space-y-4 flex flex-col justify-between">
          <div className="bg-slate-50/80 rounded-xl p-4 border border-slate-200/60 space-y-2">
            <div className="flex justify-between items-center text-xs font-semibold text-slate-700">
              <span>保留截断阶数 k</span>
              <span className="px-2 py-0.5 rounded bg-teal-100 text-teal-800 font-mono font-bold text-xs">
                k = {rank}
              </span>
            </div>
            <input
              className="w-full accent-teal-600 h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer"
              type="range"
              min="1"
              max={singularValues.length}
              step="1"
              value={rank}
              onChange={(event) => setRank(Number(event.target.value))}
            />
          </div>

          <div className="rounded-xl border border-teal-200/80 bg-teal-50/60 p-3.5 text-xs text-teal-950 leading-relaxed shadow-xs space-y-1.5 font-mono">
            <div>保留能量比 (Energy): <strong className="text-teal-700 font-bold">{(retainedEnergy * 100).toFixed(1)}%</strong></div>
            <div>重建误差 ||A - A_k||_F: <strong className="text-amber-700 font-bold">{error.toFixed(3)}</strong></div>
            <div className="pt-1 text-[11px] text-slate-500 font-sans border-t border-teal-200/60">
              💡 理论提示：Frobenius 范数重建误差的平方等于所有被抛弃奇异值平方之和。
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
