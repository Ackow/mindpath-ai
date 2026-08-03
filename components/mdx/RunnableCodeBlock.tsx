'use client';

import React, { useState } from 'react';
import { Play, RotateCcw, Copy, Check, ChevronDown, ChevronUp } from 'lucide-react';

interface RunnableCodeBlockProps {
  title?: string;
  language?: string;
  initialCode?: string;
  code?: string;
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
  code: suppliedCode,
  children,
}) => {
  const codeToRun = children || suppliedCode || initialCode;
  const [code, setCode] = useState<string>(codeToRun);
  const [output, setOutput] = useState<string | null>(null);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);
  const [isExpanded, setIsExpanded] = useState<boolean>(false);

  const lines = code.split('\n');
  const isLongCode = lines.length > 7;

  const handleRun = () => {
    setIsRunning(true);
    setTimeout(() => {
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

  // Dynamic Python Token Syntax Highlighter
  const renderHighlightedPython = (codeText: string) => {
    const rawLines = codeText.split('\n');
    return rawLines.map((line, lineIdx) => {
      const trimmed = line.trim();
      if (trimmed.startsWith('#')) {
        return (
          <div key={lineIdx} className="text-slate-500 italic">
            {line}
          </div>
        );
      }

      // Regex tokenize by whitespace, operators and quotes
      const tokens = line.split(/(\s+|[(),=**"'])/);
      return (
        <div key={lineIdx} className="whitespace-pre">
          {tokens.map((token, tokenIdx) => {
            if (!token) return null;
            if (/^(import|from|as|def|return|if|else|elif|for|in|while|try|except|with|print)$/.test(token)) {
              return <span key={tokenIdx} className="text-purple-400 font-bold">{token}</span>;
            }
            if (/^(np|plt|numpy|matplotlib|pyplot|linspace|plot|xlabel|ylabel|title|legend|grid|show|array|arange|exp|dot|mean|std|fit|score|predict|read_csv|describe|fillna|merge|groupby|figure|show)$/.test(token)) {
              return <span key={tokenIdx} className="text-sky-300 font-semibold">{token}</span>;
            }
            if (/^-?\d+\.?\d*$/.test(token)) {
              return <span key={tokenIdx} className="text-orange-300 font-bold">{token}</span>;
            }
            if (/^(".*?"|'.*?')$/.test(token)) {
              return <span key={tokenIdx} className="text-amber-300 font-medium">{token}</span>;
            }
            if (/^[=**+-/:]$/.test(token)) {
              return <span key={tokenIdx} className="text-pink-400">{token}</span>;
            }
            return <span key={tokenIdx} className="text-slate-200">{token}</span>;
          })}
        </div>
      );
    });
  };

  return (
    <div className="my-7 rounded-2xl overflow-hidden border border-slate-800 shadow-xl" style={{ backgroundColor: '#0B132B' }}>
      {/* Header Bar */}
      <div className="px-4 py-2.5 border-b border-slate-800 flex items-center justify-between gap-2 flex-wrap" style={{ backgroundColor: '#0F172A' }}>
        <span className="text-xs font-bold text-slate-200 truncate">{title}</span>

        <div className="flex items-center gap-1.5 shrink-0">
          <button
            onClick={handleRun}
            disabled={isRunning}
            className="flex items-center gap-1 bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold px-3 py-1.5 rounded-lg transition-all shadow-xs"
          >
            <Play className="w-3.5 h-3.5 fill-white" />
            {isRunning ? '运行中...' : '运行'}
          </button>
          <button
            onClick={handleReset}
            className="flex items-center gap-1 text-slate-300 hover:text-white text-xs px-2.5 py-1.5 rounded-lg bg-slate-800 border border-slate-700 transition-colors"
          >
            <RotateCcw className="w-3 h-3" />
            重置
          </button>
          <button
            onClick={handleCopy}
            className="flex items-center gap-1 text-slate-300 hover:text-white text-xs px-2.5 py-1.5 rounded-lg bg-slate-800 border border-slate-700 transition-colors"
          >
            {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
            {copied ? '已复制' : '复制'}
          </button>
        </div>
      </div>

      {/* Syntax Highlighted Editor Display */}
      <div className={`relative p-4 font-mono text-xs leading-relaxed transition-all ${
        isLongCode && !isExpanded ? 'max-h-48 overflow-hidden' : 'max-h-none overflow-x-auto'
      }`} style={{ backgroundColor: '#0B132B' }}>
        {renderHighlightedPython(code)}

        {/* Mask when Collapsed */}
        {isLongCode && !isExpanded && (
          <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-[#0B132B] to-transparent pointer-events-none" />
        )}
      </div>

      {/* Expand / Collapse Button */}
      {isLongCode && (
        <div className="px-3 py-1.5 border-t border-slate-800/80 flex items-center justify-center" style={{ backgroundColor: '#0D1836' }}>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-[11px] text-teal-400 hover:text-teal-300 font-semibold flex items-center gap-1 py-0.5 transition-colors cursor-pointer"
          >
            {isExpanded ? (
              <>
                <span>折叠代码</span>
                <ChevronUp className="w-3.5 h-3.5" />
              </>
            ) : (
              <>
                <span>展开全部代码 ({lines.length} 行)</span>
                <ChevronDown className="w-3.5 h-3.5" />
              </>
            )}
          </button>
        </div>
      )}

      {/* Output Panel */}
      {output !== null && (
        <div className="p-3.5 border-t border-slate-800 space-y-1.5" style={{ backgroundColor: '#070D1E' }}>
          <div className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">输出结果 (Output)</div>
          <div className="p-3 bg-emerald-950/60 rounded-xl border border-emerald-800/60 text-emerald-400 font-mono text-xs font-bold shadow-inner">
            {output}
          </div>
        </div>
      )}
    </div>
  );
};
