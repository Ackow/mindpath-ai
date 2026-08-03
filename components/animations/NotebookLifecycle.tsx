'use client';

import React, { useState } from 'react';
import { Play, RotateCcw, AlertCircle, CheckCircle } from 'lucide-react';

export const NotebookLifecycle: React.FC = () => {
  const [cell1Val, setCell1Val] = useState<number>(10);
  const [cell2Executed, setCell2Executed] = useState<boolean>(false);
  const [inSeq, setInSeq] = useState<number>(1);

  const handleRunCell1 = () => {
    setCell1Val(20);
    setInSeq(inSeq + 1);
  };

  const handleRunCell2 = () => {
    setCell2Executed(true);
    setInSeq(inSeq + 1);
  };

  const handleReset = () => {
    setCell1Val(10);
    setCell2Executed(false);
    setInSeq(1);
  };

  return (
    <div className="my-6 p-5 rounded-2xl bg-white border border-slate-200 shadow-card space-y-4">
      <div className="flex justify-between items-center border-b border-slate-100 pb-3">
        <span className="font-bold text-xs text-slate-800 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-amber-500" />
          Jupyter 隐式状态演进演示 (Notebook Lifecycle)
        </span>
        <button
          onClick={handleReset}
          className="text-xs text-slate-400 hover:text-slate-600 flex items-center gap-1"
        >
          <RotateCcw className="w-3.5 h-3.5" /> 重置内核
        </button>
      </div>

      <div className="space-y-3">
        {/* Cell 1 */}
        <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 flex items-center justify-between text-xs">
          <div className="font-mono text-slate-700">
            <span className="text-teal-600 font-bold">In [{inSeq - 1 > 0 ? inSeq - 1 : ' '}]:</span> x = {cell1Val}
          </div>
          <button
            onClick={handleRunCell1}
            className="flex items-center gap-1 bg-teal-600 hover:bg-teal-700 text-white text-[11px] px-2.5 py-1 rounded-lg transition-all"
          >
            <Play className="w-3 h-3 fill-white" /> 重新赋值 x = 20
          </button>
        </div>

        {/* Cell 2 */}
        <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 flex items-center justify-between text-xs">
          <div className="font-mono text-slate-700">
            <span className="text-teal-600 font-bold">In [{cell2Executed ? inSeq : ' '}]:</span> print(f&quot;x² = &#123;x**2&#125;&quot;)
          </div>
          <button
            onClick={handleRunCell2}
            className="flex items-center gap-1 bg-teal-600 hover:bg-teal-700 text-white text-[11px] px-2.5 py-1 rounded-lg transition-all"
          >
            <Play className="w-3 h-3 fill-white" /> 运行单元格
          </button>
        </div>
      </div>

      <div className="p-3 bg-slate-900 rounded-xl text-white font-mono text-xs flex items-center justify-between">
        <span>当前内核变量 x = <strong className="text-teal-300">{cell1Val}</strong></span>
        {cell2Executed && (
          <span className="text-emerald-400 font-bold flex items-center gap-1">
            <CheckCircle className="w-3.5 h-3.5" /> 输出: x² = {cell1Val ** 2}
          </span>
        )}
      </div>
    </div>
  );
};
