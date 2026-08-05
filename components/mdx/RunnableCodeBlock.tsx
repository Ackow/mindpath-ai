'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Play, RotateCcw, Copy, Check, ChevronDown, ChevronUp } from 'lucide-react';

interface RunnableCodeBlockProps {
  title?: string;
  language?: string;
  initialCode?: string;
  code?: string;
  children?: string;
}

type WorkerMessage = {
  type: 'status' | 'stdout' | 'stderr' | 'images' | 'result';
  runId: number;
  status?: 'loading' | 'running';
  text?: string;
  ok?: boolean;
  error?: string;
  images?: string[];
};

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
  const rawCode = (typeof children === 'string' && children.trim())
    ? children
    : (typeof suppliedCode === 'string' && suppliedCode.trim() ? suppliedCode : initialCode);

  const [code, setCode] = useState<string>(rawCode);
  const [output, setOutput] = useState<string | null>(null);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [images, setImages] = useState<string[]>([]);
  const [copied, setCopied] = useState<boolean>(false);
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const workerRef = useRef<Worker | null>(null);
  const runIdRef = useRef(0);

  useEffect(() => {
    return () => workerRef.current?.terminate();
  }, []);

  const safeCode = typeof code === 'string' ? code : String(code || '');
  const lines = safeCode.split('\n');
  const isLongCode = lines.length > 7;

  const handleRun = () => {
    const runId = runIdRef.current + 1;
    runIdRef.current = runId;
    const worker = workerRef.current ?? new Worker('/pyodide-worker.js', { type: 'module' });
    workerRef.current = worker;
    setIsRunning(true);
    setImages([]);
    setOutput('正在加载浏览器 Python 运行时...');

    worker.onmessage = ({ data }: MessageEvent<WorkerMessage>) => {
      if (data.runId !== runId) return;
      if (data.type === 'status') {
        setOutput(data.status === 'loading' ? '正在加载 Python 依赖...' : '');
      } else if (data.type === 'stdout' || data.type === 'stderr') {
        setOutput((previous) => {
          const chunk = data.text ?? '';
          if (!chunk) return previous;
          return `${previous ?? ''}${chunk}${chunk.endsWith('\n') ? '' : '\n'}`;
        });
      } else if (data.type === 'images') {
        setImages(data.images ?? []);
      } else if (data.type === 'result') {
        setIsRunning(false);
        if (!data.ok) setOutput((previous) => `${previous ? `${previous}\n` : ''}${data.error ?? 'Python 执行失败'}`);
        else setOutput((previous) => previous || '程序运行完成（无输出）');
      }
    };
    worker.onerror = (error) => {
      setIsRunning(false);
      setOutput(`运行时加载失败：${error.message}`);
    };
    worker.postMessage({ type: 'run', runId, code });
  };

  const handleReset = () => {
    setCode(rawCode);
    setOutput(null);
    setImages([]);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Dynamic Python Token Syntax Highlighter (Restored Original Rainbow Highlighting)
  const renderHighlightedPython = (codeText: string) => {
    const safeText = typeof codeText === 'string' ? codeText : String(codeText || '');
    const rawLines = safeText.split('\n');
    return rawLines.map((line, lineIdx) => {
      const trimmed = line.trim();
      const lineClassName = 'min-h-[1.5em] whitespace-pre font-mono';
      if (trimmed.startsWith('#')) {
        return (
          <div key={lineIdx} className={`${lineClassName} text-slate-500 italic`}>
            {line || ' '}
          </div>
        );
      }

      // Safe Tokenization preserving indentation and spacing
      const tokens = line.split(/(\s+|[(),=**"':.])/);
      return (
        <div key={lineIdx} className={lineClassName}>
          {line ? tokens.map((token, tokenIdx) => {
            if (!token) return null;
            if (/^(import|from|as|def|class|return|if|else|elif|for|in|while|try|except|finally|with|print|raise)$/.test(token)) {
              return <span key={tokenIdx} className="text-purple-400 font-bold">{token}</span>;
            }
            if (/^(dataclass|field|asdict|parse_args|add_argument|ArgumentParser|Path|exists|mkdir|write_text|read_text|dumps|loads|dump|load)$/.test(token)) {
              return <span key={tokenIdx} className="text-sky-300 font-semibold">{token}</span>;
            }
            if (/^-?\d+\.?\d*$/.test(token)) {
              return <span key={tokenIdx} className="text-orange-300 font-bold">{token}</span>;
            }
            if (/^(".*?"|'.*?')$/.test(token)) {
              return <span key={tokenIdx} className="text-amber-300 font-medium">{token}</span>;
            }
            if (/^[=**+\-/:.@]$/.test(token)) {
              return <span key={tokenIdx} className="text-pink-400 font-bold">{token}</span>;
            }
            return <span key={tokenIdx} className="text-slate-200">{token}</span>;
          }) : ' '}
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
            className="flex items-center gap-1 bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold px-3 py-1.5 rounded-lg transition-all shadow-xs cursor-pointer"
          >
            <Play className="w-3.5 h-3.5 fill-white" />
            {isRunning ? '运行中...' : '运行'}
          </button>
          <button
            onClick={handleReset}
            className="flex items-center gap-1 text-slate-300 hover:text-white text-xs px-2.5 py-1.5 rounded-lg bg-slate-800 border border-slate-700 transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3 h-3" />
            重置
          </button>
          <button
            onClick={handleCopy}
            className="flex items-center gap-1 text-slate-300 hover:text-white text-xs px-2.5 py-1.5 rounded-lg bg-slate-800 border border-slate-700 transition-colors cursor-pointer"
          >
            {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
            {copied ? '已复制' : '复制'}
          </button>
        </div>
      </div>

      {/* Syntax Highlighted Editable Editor Display */}
      <div className={`relative p-4 font-mono text-xs leading-relaxed transition-all ${
        isLongCode && !isExpanded ? 'max-h-48 overflow-hidden' : 'max-h-none overflow-x-auto'
      }`} style={{ backgroundColor: '#0B132B' }}>
        {/* Real-time Syntax Highlight Layer */}
        <div className="pointer-events-none select-none min-h-[4em]">
          {renderHighlightedPython(code)}
        </div>

        {/* Transparent Interactive Editable Layer */}
        <textarea
          value={code}
          onChange={(e) => setCode(e.target.value)}
          spellCheck={false}
          className="absolute inset-0 w-full h-full p-4 font-mono text-xs leading-relaxed bg-transparent text-transparent caret-teal-300 resize-none outline-none whitespace-pre overflow-hidden z-10 selection:bg-teal-900/60 selection:text-transparent"
        />

        {/* Mask when Collapsed */}
        {isLongCode && !isExpanded && (
          <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-[#0B132B] to-transparent pointer-events-none z-20" />
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
          <div className="p-3 bg-emerald-950/60 rounded-xl border border-emerald-800/60 text-emerald-400 font-mono text-xs font-bold shadow-inner whitespace-pre-wrap break-words">
            {output}
          </div>
          {images.length > 0 && (
            <div className="space-y-3 pt-1">
              {images.map((image, index) => (
                <img
                  key={`${runIdRef.current}-${index}`}
                  src={`data:image/png;base64,${image}`}
                  alt={`Python 图像输出 ${index + 1}`}
                  className="max-w-full rounded-lg border border-slate-700 bg-white"
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
