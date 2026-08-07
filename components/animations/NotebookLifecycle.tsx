'use client';

import React, { useState } from 'react';
import { Play, RotateCcw, Plus, Circle, CheckCircle2, Loader2, FileCode, Layers } from 'lucide-react';

interface CellItem {
  id: number;
  type: 'code' | 'markdown';
  content: string;
  executionCount: number | null;
  output: string | null;
  isExecuting?: boolean;
}

export const NotebookLifecycle: React.FC = () => {
  const [activeCellId, setActiveCellId] = useState<number>(1);
  const [executionSeq, setExecutionSeq] = useState<number>(1);
  const [kernelMemory, setKernelMemory] = useState<Record<string, any>>({});

  const [cells, setCells] = useState<CellItem[]>([
    {
      id: 1,
      type: 'code',
      content: 'x = 10\nprint("变量 x 已成功存入内存:", x)',
      executionCount: null,
      output: null,
    },
    {
      id: 2,
      type: 'code',
      content: 'user_name = "Python 爱好者"\nprint(f"欢迎 {user_name}！")',
      executionCount: null,
      output: null,
    },
    {
      id: 3,
      type: 'code',
      content: 'result = x * 5\nprint("计算 x * 5 的结果 =", result)',
      executionCount: null,
      output: null,
    },
  ]);

  const [kernelBusy, setKernelBusy] = useState<boolean>(false);

  // 运行指定 Cell
  const runCell = (cellId: number) => {
    const targetCell = cells.find((c) => c.id === cellId);
    if (!targetCell || kernelBusy) return;

    setKernelBusy(true);

    // 标记当前 Cell 为正在执行 [*]
    setCells((prev) =>
      prev.map((c) => (c.id === cellId ? { ...c, isExecuting: true } : c))
    );

    setTimeout(() => {
      let cellOutput = '';
      let newMemory = { ...kernelMemory };

      // 模拟代码解释执行与内存更新
      if (cellId === 1) {
        newMemory['x'] = 10;
        cellOutput = '变量 x 已成功存入内存: 10';
      } else if (cellId === 2) {
        newMemory['user_name'] = 'Python 爱好者';
        cellOutput = '欢迎 Python 爱好者！';
      } else if (cellId === 3) {
        const valX = newMemory['x'] ?? 10;
        const res = valX * 5;
        newMemory['result'] = res;
        cellOutput = `计算 x * 5 的结果 = ${res}`;
      }

      setKernelMemory(newMemory);
      const currentSeq = executionSeq;

      setCells((prev) =>
        prev.map((c) =>
          c.id === cellId
            ? {
                ...c,
                executionCount: currentSeq,
                output: cellOutput,
                isExecuting: false,
              }
            : c
        )
      );

      setExecutionSeq(currentSeq + 1);
      setKernelBusy(false);
    }, 350);
  };

  // 重置内核
  const resetKernel = () => {
    setKernelMemory({});
    setExecutionSeq(1);
    setCells([
      {
        id: 1,
        type: 'code',
        content: 'x = 10\nprint("变量 x 已成功存入内存:", x)',
        executionCount: null,
        output: null,
      },
      {
        id: 2,
        type: 'code',
        content: 'user_name = "Python 爱好者"\nprint(f"欢迎 {user_name}！")',
        executionCount: null,
        output: null,
      },
      {
        id: 3,
        type: 'code',
        content: 'result = x * 5\nprint("计算 x * 5 的结果 =", result)',
        executionCount: null,
        output: null,
      },
    ]);
  };

  // 添加新单元格
  const addCell = () => {
    const newId = cells.length + 1;
    setCells((prev) => [
      ...prev,
      {
        id: newId,
        type: 'code',
        content: `print("新增单元格 #${newId}")`,
        executionCount: null,
        output: null,
      },
    ]);
  };

  return (
    <div className="my-8 rounded-2xl border border-slate-200 bg-white text-slate-800 shadow-card overflow-hidden font-sans">
      {/* 顶部拟真浅色 Jupyter Notebook 菜单栏 */}
      <div className="bg-slate-100/90 border-b border-slate-200 px-4 py-3 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 bg-orange-50 border border-orange-200 text-orange-600 px-2.5 py-1 rounded-lg text-xs font-extrabold shadow-2xs">
            <FileCode className="w-3.5 h-3.5" />
            Jupyter Notebook 仿真编辑器
          </div>
          <span className="text-xs text-slate-500 font-mono hidden sm:inline">demo.ipynb</span>
        </div>

        {/* 内核状态标识 */}
        <div className="flex items-center gap-4 text-xs">
          <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-lg border border-slate-200 shadow-2xs">
            <Circle
              className={`w-2.5 h-2.5 fill-current ${
                kernelBusy ? 'text-amber-500 animate-ping' : 'text-emerald-500'
              }`}
            />
            <span className="text-slate-600 font-medium">
              Python 3 (ipykernel):{' '}
              <strong className={kernelBusy ? 'text-amber-600' : 'text-emerald-600'}>
                {kernelBusy ? 'Busy (计算中...)' : 'Idle (就绪)'}
              </strong>
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => runCell(activeCellId)}
              disabled={kernelBusy}
              className="flex items-center gap-1 bg-teal-600 hover:bg-teal-700 disabled:opacity-50 text-white text-xs px-3 py-1.5 rounded-lg font-bold transition-all shadow-2xs cursor-pointer"
            >
              <Play className="w-3 h-3 fill-white" /> 运行当前单元格 (Shift+Enter)
            </button>
            <button
              onClick={addCell}
              className="p-1.5 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-lg transition-all cursor-pointer shadow-2xs"
              title="下方插入单元格"
            >
              <Plus className="w-4 h-4" />
            </button>
            <button
              onClick={resetKernel}
              className="p-1.5 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-lg transition-all cursor-pointer shadow-2xs"
              title="重置内核"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* 主体区域：左侧 Notebook 单元格列表 + 右侧内核内存查看器 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-0">
        {/* Notebook Cells 列表 */}
        <div className="lg:col-span-2 p-4 space-y-4 border-r border-slate-200 bg-slate-50/50">
          {cells.map((cell) => {
            const isActive = cell.id === activeCellId;
            return (
              <div
                key={cell.id}
                onClick={() => setActiveCellId(cell.id)}
                className={`rounded-xl border transition-all cursor-pointer overflow-hidden ${
                  isActive
                    ? 'border-teal-500 bg-white shadow-md ring-2 ring-teal-500/20'
                    : 'border-slate-200 bg-white hover:border-slate-300 shadow-2xs'
                }`}
              >
                {/* Cell 头部栏 */}
                <div className="flex items-center justify-between px-3 py-1.5 bg-slate-100/70 border-b border-slate-200 text-xs">
                  <div className="flex items-center gap-2 font-mono">
                    <span
                      className={`font-bold ${
                        cell.isExecuting
                          ? 'text-amber-600'
                          : cell.executionCount !== null
                          ? 'text-teal-700'
                          : 'text-slate-400'
                      }`}
                    >
                      {cell.isExecuting ? (
                        <span className="flex items-center gap-1">
                          In [<Loader2 className="w-3 h-3 animate-spin text-amber-600" />]:
                        </span>
                      ) : (
                        `In [${cell.executionCount ?? ' '}]:`
                      )}
                    </span>
                    <span className="text-slate-500 text-[11px]">单元格 #{cell.id}</span>
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      runCell(cell.id);
                    }}
                    className="flex items-center gap-1 text-[11px] text-teal-700 hover:text-teal-800 font-bold px-2 py-0.5 rounded bg-teal-50 hover:bg-teal-100 border border-teal-200/80 transition-all"
                  >
                    <Play className="w-2.5 h-2.5 fill-current" /> 运行
                  </button>
                </div>

                {/* Code 内容框 */}
                <div className="p-3 font-mono text-xs text-slate-800 bg-slate-900/5 leading-relaxed overflow-x-auto whitespace-pre">
                  {cell.content}
                </div>

                {/* 控制台输出框 Output */}
                {cell.output && (
                  <div className="border-t border-slate-200 bg-slate-50 p-3 font-mono text-xs text-slate-800 flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <div>
                      <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-0.5">
                        Console Output
                      </div>
                      <div className="text-emerald-700 font-semibold leading-relaxed">{cell.output}</div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* 右侧：状态与内核变量状态查看器 */}
        <div className="p-4 bg-white space-y-4">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-800 border-b border-slate-100 pb-2">
            <Layers className="w-4 h-4 text-teal-600" />
            Python 内核变量状态监视器 (Kernel State)
          </div>

          <p className="text-xs text-slate-500 leading-relaxed">
            在 Jupyter Notebook 中，单元格可以按任意顺序运行，内存中保存的变量由最后一次执行的单元格决定。
          </p>

          <div className="space-y-2">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              当前全局变量表 (Globals):
            </span>
            {Object.keys(kernelMemory).length === 0 ? (
              <div className="p-4 rounded-xl border border-dashed border-slate-200 text-center text-slate-400 text-xs bg-slate-50">
                尚未运行任何单元格，内存为空
              </div>
            ) : (
              <div className="space-y-2 font-mono text-xs">
                {Object.entries(kernelMemory).map(([varName, varVal]) => (
                  <div
                    key={varName}
                    className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between shadow-2xs"
                  >
                    <span className="text-teal-700 font-bold">{varName}</span>
                    <span className="text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200/80 font-bold">
                      {JSON.stringify(varVal)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="p-3 rounded-xl bg-teal-50 border border-teal-200/80 text-teal-900 text-xs leading-relaxed space-y-1">
            <div className="font-bold flex items-center gap-1 text-teal-700">💡 提示：</div>
            <div>
              点击任意单元格后按 <kbd className="px-1.5 py-0.5 bg-white rounded font-mono text-[10px] text-slate-700 border border-slate-300 shadow-2xs font-bold">Shift + Enter</kbd> 体验真实运行！
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
