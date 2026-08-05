'use client';

import React, { useState } from 'react';
import { Terminal, Play, RotateCcw, Bug, MessageSquare } from 'lucide-react';

export const PdbDebuggerAnimation: React.FC = () => {
  const [currentLine, setCurrentLine] = useState<number>(0);
  const [variables, setVariables] = useState<{ batch_data: number[]; idx: number; val: number; total_loss: number }>({
    batch_data: [1.5, 0.0, 2.5],
    idx: 0,
    val: 1.5,
    total_loss: 0.0,
  });
  const [terminalLogs, setTerminalLogs] = useState<string[]>([
    '(pdb) 调试器在 breakpoint() 处暂停，等待命令输入...',
  ]);

  const codeLines = [
    { line: 1, text: 'def train_epoch(batch_data):' },
    { line: 2, text: '    total_loss = 0.0' },
    { line: 3, text: '    for idx, val in enumerate(batch_data):' },
    { line: 4, text: '        if val == 0.0: breakpoint() # 断点触发' },
    { line: 5, text: '        total_loss += 1.0 / val' },
    { line: 6, text: '    return total_loss' },
  ];

  const handleNext = () => {
    if (currentLine === 0) {
      setCurrentLine(4);
      setTerminalLogs((prev) => [...prev, '(pdb) n', '> 触发 breakpoint()! 暂停在 Line 4: if val == 0.0']);
    } else if (currentLine === 4) {
      setCurrentLine(5);
      setVariables((prev) => ({ ...prev, idx: 1, val: 0.0 }));
      setTerminalLogs((prev) => [...prev, '(pdb) p val', '0.0 (警告：即将发生 ZeroDivisionError!)']);
    } else if (currentLine === 5) {
      setCurrentLine(6);
      setVariables((prev) => ({ ...prev, idx: 2, val: 2.5, total_loss: 0.666 }));
      setTerminalLogs((prev) => [...prev, '(pdb) n', '> 单步推进至 Line 6: return total_loss']);
    }
  };

  const handleReset = () => {
    setCurrentLine(0);
    setVariables({
      batch_data: [1.5, 0.0, 2.5],
      idx: 0,
      val: 1.5,
      total_loss: 0.0,
    });
    setTerminalLogs(['(pdb) 调试器已重置，点击单步推进按钮重新调试']);
  };

  return (
    <div className="my-8 rounded-2xl border-2 border-slate-200 bg-white p-5 shadow-sm text-slate-800 font-sans">
      <div className="flex items-center justify-between border-b border-slate-200 pb-3 mb-4">
        <div className="flex items-center space-x-2">
          <Bug className="w-5 h-5 text-teal-600" />
          <h3 className="text-base font-bold text-slate-900">pdb 交互式步进调试器演练</h3>
        </div>
        <span className="text-xs font-semibold bg-teal-50 text-teal-700 border border-teal-200 px-2.5 py-0.5 rounded-full">
          pdb 调试模拟器
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        {/* 代码行与指针 */}
        <div className="bg-slate-900 p-3.5 rounded-xl border border-slate-800 font-mono text-xs leading-relaxed space-y-1 overflow-x-auto">
          <div className="text-[11px] font-sans font-bold text-teal-400 mb-2 flex items-center">
            <Terminal className="w-3.5 h-3.5 mr-1" /> 代码运行指针位置:
          </div>
          {codeLines.map((item) => {
            const isCurrent = currentLine === item.line || (currentLine === 0 && item.line === 4);
            return (
              <div
                key={item.line}
                className={`px-2 py-1 rounded flex items-center transition-all whitespace-pre ${
                  isCurrent ? 'bg-teal-600 text-white font-bold' : 'text-slate-400'
                }`}
              >
                <span className="w-6 text-slate-500 text-[10px] shrink-0">{item.line}</span>
                <span>{item.text}</span>
              </div>
            );
          })}
        </div>

        {/* 内存堆栈变量 */}
        <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 text-xs font-mono flex flex-col justify-between">
          <div className="text-[11px] font-sans font-bold text-slate-700 mb-2">内存变量堆栈 (Stack Variables):</div>
          <div className="space-y-2 bg-white p-3 rounded-lg border border-slate-200">
            <div className="flex justify-between border-b border-slate-100 pb-1">
              <span className="text-slate-500">batch_data:</span>
              <span className="font-bold text-slate-800">{JSON.stringify(variables.batch_data)}</span>
            </div>
            <div className="flex justify-between border-b border-slate-100 pb-1">
              <span className="text-slate-500">当前索引 idx:</span>
              <span className="font-bold text-teal-700">{variables.idx}</span>
            </div>
            <div className="flex justify-between border-b border-slate-100 pb-1">
              <span className="text-slate-500">当前数值 val:</span>
              <span className={`font-bold ${variables.val === 0 ? 'text-rose-600' : 'text-slate-800'}`}>
                {variables.val} {variables.val === 0 ? '(异常0值)' : ''}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">累计 loss:</span>
              <span className="font-bold text-teal-700">{variables.total_loss.toFixed(3)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* pdb 模拟控制台终端 */}
      <div className="bg-slate-900 p-3.5 rounded-xl border border-slate-800 text-xs font-mono text-slate-200 mb-4 h-24 overflow-y-auto space-y-1">
        <div className="text-[10px] text-teal-400 flex items-center font-sans mb-1">
          <MessageSquare className="w-3.5 h-3.5 mr-1" /> pdb 交互式终端输出
        </div>
        {terminalLogs.map((logItem, idx) => (
          <div key={idx} className="leading-relaxed text-slate-300">
            {logItem}
          </div>
        ))}
      </div>

      {/* 按钮控制 */}
      <div className="flex space-x-3">
        <button
          onClick={handleNext}
          disabled={currentLine === 6}
          className="flex items-center space-x-1.5 bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs px-4 py-2 rounded-xl transition-all shadow-xs disabled:opacity-50"
        >
          <Play className="w-3.5 h-3.5" />
          <span>单步推进 (n / next)</span>
        </button>
        <button
          onClick={handleReset}
          className="flex items-center space-x-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs px-3.5 py-2 rounded-xl border border-slate-200 font-medium transition-colors"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>重置</span>
        </button>
      </div>
    </div>
  );
};
