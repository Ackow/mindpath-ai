'use client';

import React, { useState, useEffect } from 'react';
import { Play, Pause, SkipForward, RotateCcw, Code2, Layers, CheckCircle2, ArrowRight } from 'lucide-react';

interface ExecutionStep {
  lineIndex: number;
  vars: Record<string, any>;
  output?: string;
  explanation: string;
  isCompleted?: boolean;
}

interface Scenario {
  id: string;
  title: string;
  description: string;
  codeLines: string[];
  steps: ExecutionStep[];
}

const scenarios: Scenario[] = [
  {
    id: 'for-range',
    title: '1. for 循环与 range(1, 6) 累加和',
    description: '演示 for 循环遍历 range(1, 6) 序列，计算 1 到 5 累加和的整个过程。',
    codeLines: [
      'total_sum = 0',
      'for i in range(1, 6):',
      '    total_sum += i',
      'print(f"最终累加和: {total_sum}")',
    ],
    steps: [
      { lineIndex: 0, vars: { total_sum: 0 }, explanation: '初始化变量 total_sum = 0' },
      { lineIndex: 1, vars: { total_sum: 0, i: 1 }, explanation: '进入 for 循环：range(1, 6) 取出第 1 个值 i = 1' },
      { lineIndex: 2, vars: { total_sum: 1, i: 1 }, explanation: '执行 total_sum += 1，当前累加和变为 1' },
      { lineIndex: 1, vars: { total_sum: 1, i: 2 }, explanation: '下一轮循环：i = 2' },
      { lineIndex: 2, vars: { total_sum: 3, i: 2 }, explanation: '执行 total_sum += 2，当前累加和变为 3' },
      { lineIndex: 1, vars: { total_sum: 3, i: 3 }, explanation: '下一轮循环：i = 3' },
      { lineIndex: 2, vars: { total_sum: 6, i: 3 }, explanation: '执行 total_sum += 3，当前累加和变为 6' },
      { lineIndex: 1, vars: { total_sum: 6, i: 4 }, explanation: '下一轮循环：i = 4' },
      { lineIndex: 2, vars: { total_sum: 10, i: 4 }, explanation: '执行 total_sum += 4，当前累加和变为 10' },
      { lineIndex: 1, vars: { total_sum: 10, i: 5 }, explanation: '下一轮循环：i = 5（包头不包尾，这是最后一个元素）' },
      { lineIndex: 2, vars: { total_sum: 15, i: 5 }, explanation: '执行 total_sum += 5，当前累加和变为 15' },
      { lineIndex: 3, vars: { total_sum: 15 }, output: '最终累加和: 15', explanation: '循环正常结束，执行 print 输出最终结果 15', isCompleted: true },
    ],
  },
  {
    id: 'while-countdown',
    title: '2. while 倒计时循环',
    description: '演示 while count > 0 随着计数器递减，直到条件变为 False 退出循环。',
    codeLines: [
      'count = 3',
      'while count > 0:',
      '    print(f"倒计时: {count}")',
      '    count -= 1',
      'print("发射！")',
    ],
    steps: [
      { lineIndex: 0, vars: { count: 3 }, explanation: '初始化倒计时计数器 count = 3' },
      { lineIndex: 1, vars: { count: 3 }, explanation: '判断条件：count (3) > 0 结果为 True，进入循环体' },
      { lineIndex: 2, vars: { count: 3 }, output: '倒计时: 3', explanation: '打印当前倒计时数值: 3' },
      { lineIndex: 3, vars: { count: 2 }, explanation: '更新变量：count -= 1，count 变为 2' },
      { lineIndex: 1, vars: { count: 2 }, explanation: '再次判断：count (2) > 0 仍为 True，继续循环' },
      { lineIndex: 2, vars: { count: 2 }, output: '倒计时: 2', explanation: '打印当前倒计时数值: 2' },
      { lineIndex: 3, vars: { count: 1 }, explanation: '更新变量：count -= 1，count 变为 1' },
      { lineIndex: 1, vars: { count: 1 }, explanation: '再次判断：count (1) > 0 仍为 True，继续循环' },
      { lineIndex: 2, vars: { count: 1 }, output: '倒计时: 1', explanation: '打印当前倒计时数值: 1' },
      { lineIndex: 3, vars: { count: 0 }, explanation: '更新变量：count -= 1，count 变为 0' },
      { lineIndex: 1, vars: { count: 0 }, explanation: '判断条件：count (0) > 0 为 False！终止并跳出 while 循环' },
      { lineIndex: 4, vars: { count: 0 }, output: '发射！', explanation: '跳出循环，执行后续代码，输出发射！', isCompleted: true },
    ],
  },
  {
    id: 'break-continue',
    title: '3. break 中断 vs continue 跳过',
    description: '演示当 i == 3 时触发 break，强制中断整个循环的过程。',
    codeLines: [
      'for i in range(1, 6):',
      '    if i == 3:',
      '        break  # 遇到 3 直接退出整个循环',
      '    print(f"输出: {i}")',
      'print("循环结束")',
    ],
    steps: [
      { lineIndex: 0, vars: { i: 1 }, explanation: '循环开始：i = 1' },
      { lineIndex: 1, vars: { i: 1 }, explanation: '判断条件：i == 3 为 False，不触发 break' },
      { lineIndex: 3, vars: { i: 1 }, output: '输出: 1', explanation: '打印 输出: 1' },
      { lineIndex: 0, vars: { i: 2 }, explanation: '下一轮循环：i = 2' },
      { lineIndex: 1, vars: { i: 2 }, explanation: '判断条件：i == 3 为 False，不触发 break' },
      { lineIndex: 3, vars: { i: 2 }, output: '输出: 2', explanation: '打印 输出: 2' },
      { lineIndex: 0, vars: { i: 3 }, explanation: '下一轮循环：i = 3' },
      { lineIndex: 1, vars: { i: 3 }, explanation: '判断条件：i == 3 为 True！进入 if 分支' },
      { lineIndex: 2, vars: { i: 3 }, explanation: '触发 break 关键字！立刻强制终止并彻底跳出整个 for 循环' },
      { lineIndex: 4, vars: { i: 3 }, output: '循环结束', explanation: '跳出循环，直接执行后方代码输出 "循环结束"', isCompleted: true },
    ],
  },
];

export const LoopFlowAnimation: React.FC = () => {
  const [activeScenarioId, setActiveScenarioId] = useState<string>('for-range');
  const [stepIndex, setStepIndex] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [speed, setSpeed] = useState<number>(1);

  const currentScenario = scenarios.find((s) => s.id === activeScenarioId) || scenarios[0];
  const currentStep = currentScenario.steps[stepIndex] || currentScenario.steps[0];

  // 收集截至当前步骤的所有控制台输出日志
  const logs = currentScenario.steps
    .slice(0, stepIndex + 1)
    .filter((s) => s.output)
    .map((s) => s.output);

  // 自动播放逻辑
  useEffect(() => {
    let timer: NodeJS.Timeout | null = null;
    if (isPlaying) {
      const intervalMs = Math.round(1200 / speed);
      timer = setInterval(() => {
        setStepIndex((prev) => {
          if (prev >= currentScenario.steps.length - 1) {
            setIsPlaying(false);
            return prev;
          }
          return prev + 1;
        });
      }, intervalMs);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isPlaying, speed, currentScenario]);

  const handleScenarioChange = (id: string) => {
    setActiveScenarioId(id);
    setStepIndex(0);
    setIsPlaying(false);
  };

  const nextStep = () => {
    if (stepIndex < currentScenario.steps.length - 1) {
      setStepIndex((prev) => prev + 1);
    }
  };

  const reset = () => {
    setStepIndex(0);
    setIsPlaying(false);
  };

  return (
    <div className="my-8 rounded-2xl border border-slate-200 bg-white p-5 shadow-card space-y-4 font-sans">
      {/* 顶部场景选择 Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3">
        <div className="flex items-center gap-2">
          <Code2 className="w-5 h-5 text-teal-600" />
          <h3 className="font-extrabold text-slate-800 text-sm">
            控制流与循环执行单步跟踪动画 (Loop Flow Simulator)
          </h3>
        </div>

        {/* 交互控制按钮 */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="flex items-center gap-1.5 bg-teal-600 hover:bg-teal-700 text-white text-xs px-3 py-1.5 rounded-lg font-bold transition-all shadow-sm cursor-pointer"
          >
            {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
            {isPlaying ? '暂停' : '自动播放'}
          </button>

          {/* 播放调速下拉框 */}
          <div className="flex items-center gap-1 bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 text-xs text-slate-600 font-bold">
            <span>倍速:</span>
            <select
              value={speed}
              onChange={(e) => setSpeed(Number(e.target.value))}
              className="bg-transparent font-bold text-teal-700 focus:outline-none cursor-pointer"
            >
              <option value={0.5}>0.5x (慢速)</option>
              <option value={1}>1.0x (常速)</option>
              <option value={1.5}>1.5x (快速)</option>
              <option value={2}>2.0x (极速)</option>
            </select>
          </div>

          <button
            onClick={nextStep}
            disabled={stepIndex >= currentScenario.steps.length - 1 || isPlaying}
            className="flex items-center gap-1 bg-slate-100 hover:bg-slate-200 text-slate-700 disabled:opacity-50 text-xs px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer"
          >
            单步执行 <SkipForward className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={reset}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg transition-all cursor-pointer"
            title="重置步骤"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 场景切换按钮 */}
      <div className="flex flex-wrap gap-2">
        {scenarios.map((sc) => (
          <button
            key={sc.id}
            onClick={() => handleScenarioChange(sc.id)}
            className={`text-xs px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer ${
              activeScenarioId === sc.id
                ? 'bg-teal-50 text-teal-700 border border-teal-200/80 shadow-2xs'
                : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-transparent'
            }`}
          >
            {sc.title}
          </button>
        ))}
      </div>

      <p className="text-xs text-slate-500">{currentScenario.description}</p>

      {/* 主面板：左侧代码编辑器与行高亮 + 右侧变量与输出面板 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* 代码编辑器面板 */}
        <div className="rounded-xl bg-slate-900 border border-slate-800 p-4 font-mono text-xs text-slate-200 space-y-1">
          <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-2 flex items-center justify-between border-b border-slate-800 pb-1">
            <span>Python Source Code</span>
            <span>
              步骤 {stepIndex + 1} / {currentScenario.steps.length}
            </span>
          </div>

          {currentScenario.codeLines.map((line, idx) => {
            const isCurrent = idx === currentStep.lineIndex;
            return (
              <div
                key={idx}
                className={`px-2 py-1 rounded flex items-center justify-between transition-all ${
                  isCurrent
                    ? 'bg-teal-500/20 border-l-4 border-teal-400 text-teal-200 font-bold'
                    : 'text-slate-400 opacity-80'
                }`}
              >
                <div className="flex items-center gap-3 font-mono">
                  <span className="text-slate-600 text-[10px] select-none w-4">{idx + 1}</span>
                  <span className="whitespace-pre">{line}</span>
                </div>
                {isCurrent && <ArrowRight className="w-3.5 h-3.5 text-teal-400 animate-pulse" />}
              </div>
            );
          })}
        </div>

        {/* 变量与控制台输出面板 */}
        <div className="space-y-3">
          {/* 当前步骤解释卡片 */}
          <div className="p-3 rounded-xl bg-teal-50 border border-teal-200/80 text-xs space-y-1">
            <div className="font-extrabold text-teal-800 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-teal-600" />
              当前执行解释:
            </div>
            <div className="text-slate-700 font-medium leading-relaxed">
              {currentStep.explanation}
            </div>
          </div>

          {/* 变量监视器 */}
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
            <div className="text-xs font-extrabold text-slate-700 flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-teal-600" />
              变量监视器 (Variable Inspector)
            </div>

            <div className="flex flex-wrap gap-2 font-mono text-xs">
              {Object.entries(currentStep.vars).map(([k, v]) => (
                <div
                  key={k}
                  className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 shadow-2xs flex items-center gap-2"
                >
                  <span className="text-slate-500 font-bold">{k}:</span>
                  <span className="text-teal-600 font-extrabold">{String(v)}</span>
                </div>
              ))}
            </div>
          </div>

          {/* 实时控制台输出 Console Output */}
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 font-mono text-xs space-y-1">
            <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">
              Console Output
            </div>
            <div className="min-h-[40px] text-emerald-700 font-semibold space-y-0.5">
              {logs.length === 0 ? (
                <span className="text-slate-400 italic font-sans text-xs">暂无输出...</span>
              ) : (
                logs.map((logStr, i) => <div key={i}>&gt;&gt;&gt; {logStr}</div>)
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
