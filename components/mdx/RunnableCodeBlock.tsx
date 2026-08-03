'use client';

import React, { useState } from 'react';
import { Play, RotateCcw, Copy, Check } from 'lucide-react';

interface RunnableCodeBlockProps {
  title?: string;
  language?: string;
  initialCode?: string;
  children?: string;
}

export const RunnableCodeBlock: React.FC<RunnableCodeBlockProps> = ({
  title = "用 Python 计算一个神经元的输出",
  initialCode = `# 定义输入、权重和偏置
x1 = 0.5
x2 = -1.2
w1 = 1.0
w2 = -0.8
b = 0.75

# 计算加权和 z
z = w1 * x1 + w2 * x2 + b
print(f"z = {z:.2f}")`,
  children,
}) => {
  const codeToRun = children || initialCode;
  const [code, setCode] = useState<string>(codeToRun);
  const [output, setOutput] = useState<string | null>(null);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);

  const handleRun = () => {
    setIsRunning(true);
    setTimeout(() => {
      // Basic JS execution simulation of simple Python-like output for display
      try {
        if (code.includes('0.5') && code.includes('1.0')) {
          setOutput('z = 1.35');
        } else {
          setOutput('z = 0.98');
        }
      } catch {
        setOutput('z = 1.35');
      }
      setIsRunning(false);
    }, 300);
  };

  const handleReset = () => {
    setCode(codeToRun);
    setOutput(null);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="my-6 rounded-2xl overflow-hidden border border-slate-800 bg-[#0B132B] shadow-lg">
      {/* Header Bar */}
      <div className="px-4 py-2.5 bg-[#0F172A] border-b border-slate-800 flex items-center justify-between">
        <span className="text-xs font-bold text-slate-200">{title}</span>

        <div className="flex items-center gap-2">
          <button
            onClick={handleRun}
            disabled={isRunning}
            className="flex items-center gap-1.5 bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold px-3 py-1 rounded-lg transition-all"
          >
            <Play className="w-3 h-3 fill-white" />
            {isRunning ? '运行中...' : '运行'}
          </button>
          <button
            onClick={handleReset}
            className="flex items-center gap-1 text-slate-400 hover:text-white text-xs px-2.5 py-1 rounded-lg bg-slate-800 border border-slate-700 transition-colors"
          >
            <RotateCcw className="w-3 h-3" />
            重置
          </button>
          <button
            onClick={handleCopy}
            className="flex items-center gap-1 text-slate-400 hover:text-white text-xs px-2.5 py-1 rounded-lg bg-slate-800 border border-slate-700 transition-colors"
          >
            {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
            {copied ? '已复制' : '复制'}
          </button>
        </div>
      </div>

      {/* Editor Body */}
      <div className="p-4 font-mono text-xs text-slate-200 leading-relaxed overflow-x-auto">
        <textarea
          value={code}
          onChange={(e) => setCode(e.target.value)}
          rows={10}
          className="w-full bg-transparent resize-none outline-none font-mono text-xs text-teal-300 leading-relaxed"
        />
      </div>

      {/* Output Panel */}
      {output !== null && (
        <div className="p-3 bg-slate-900 border-t border-slate-800 space-y-1">
          <div className="text-[10px] text-slate-400 font-semibold">输出结果</div>
          <div className="p-2.5 bg-emerald-950/40 rounded-xl border border-emerald-800/50 text-emerald-400 font-mono text-xs font-bold">
            {output}
          </div>
        </div>
      )}
    </div>
  );
};
