'use client';

import React, { useState } from 'react';
import { Layers, ArrowDown, Play, RotateCcw, CheckCircle2, Code2, MessageSquare, Check, Clock } from 'lucide-react';

export const ClassInheritanceAnimation: React.FC = () => {
  const [step, setStep] = useState<number>(0);
  const [log, setLog] = useState<string>('点击“执行下一步”演练类的构造与 super() 初始化过程');

  const stepsData = [
    { title: '1. 定义基类 BaseDataset', desc: '声明父类 __init__ 构造函数' },
    { title: '2. 子类 ImageDataset 继承', desc: '声明 class ImageDataset(BaseDataset)' },
    { title: '3. 触发 super().__init__()', desc: '子类调用 super() 初始化父类属性' },
    { title: '4. 实例化完成', desc: '子类成功集成父类与子类的全部属性' },
  ];

  // 代码行数据 (已精简注释，彻底杜绝溢出)
  const codeLines = [
    { line: 1, text: '# 1. 定义父类 BaseDataset', stepActive: 0 },
    { line: 2, text: 'class BaseDataset:', stepActive: 0 },
    { line: 3, text: '    def __init__(self, name: str):', stepActive: 0 },
    { line: 4, text: '        self.name = name  # 父类属性', stepActive: 0 },
    { line: 5, text: '', stepActive: -1 },
    { line: 6, text: '# 2. 子类继承与 super() 调用', stepActive: 1 },
    { line: 7, text: 'class ImageDataset(BaseDataset):', stepActive: 1 },
    { line: 8, text: '    def __init__(self, name: str, samples: int):', stepActive: 1 },
    { line: 9, text: '        super().__init__(name=name) # 3. 触发 super()', stepActive: 2 },
    { line: 10, text: '        self.samples = samples      # 4. 子类属性', stepActive: 3 },
  ];

  const handleNext = () => {
    if (step < 3) {
      const nextStep = step + 1;
      setStep(nextStep);
      if (nextStep === 1) setLog('继承基类 BaseDataset 完成');
      if (nextStep === 2) setLog('执行 super().__init__(name): 父类属性 self.name = "MNIST" 初始化成功');
      if (nextStep === 3) setLog('执行 self.samples = 60000: 子类扩展属性赋值完成');
    }
  };

  const handleReset = () => {
    setStep(0);
    setLog('已重置，点击“执行下一步”重新演练');
  };

  return (
    <div className="my-8 rounded-2xl border-2 border-slate-200 bg-white p-5 shadow-sm text-slate-800 font-sans">
      {/* 头部 */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-3 mb-4">
        <div className="flex items-center space-x-2">
          <Layers className="w-5 h-5 text-teal-600" />
          <h3 className="text-base font-bold text-slate-900">类继承与 super() 属性传递演练</h3>
        </div>
        <span className="text-xs font-semibold bg-teal-50 text-teal-700 border border-teal-200 px-2.5 py-0.5 rounded-full">
          代码与内存同步
        </span>
      </div>

      {/* 4 步进度卡片 */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 mb-6">
        {stepsData.map((s, idx) => {
          const isActive = step === idx;
          const isDone = step > idx;
          return (
            <div
              key={idx}
              className={`p-3 rounded-xl border-2 transition-all ${
                isActive
                  ? 'bg-teal-50 border-teal-500 shadow-xs'
                  : isDone
                  ? 'bg-emerald-50/70 border-emerald-300'
                  : 'bg-slate-50 border-slate-200 opacity-60'
              }`}
            >
              <div className="text-xs font-bold text-slate-800 mb-1 flex items-center justify-between">
                <span>{s.title}</span>
                {isDone && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />}
              </div>
              <p className="text-[11px] text-slate-600 leading-relaxed">{s.desc}</p>
            </div>
          );
        })}
      </div>

      {/* 代码面板 + 内存结构对照 (支持严丝合缝不溢出) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        {/* 左侧：Python 源码步进高亮 */}
        <div className="bg-slate-900 p-3.5 rounded-xl border border-slate-800 font-mono text-xs text-slate-200 overflow-hidden">
          <div className="text-[11px] font-sans font-bold text-teal-400 mb-2.5 flex items-center">
            <Code2 className="w-3.5 h-3.5 mr-1" /> 对应 Python 源码步进高亮:
          </div>
          <div className="space-y-1 overflow-x-auto max-w-full">
            {codeLines.map((item) => {
              const isHighlight = step === item.stepActive || (step >= item.stepActive && item.stepActive !== -1 && item.stepActive !== 0);
              const isCurrentStepLine = step === item.stepActive;

              return (
                <div
                  key={item.line}
                  className={`px-2 py-0.5 rounded transition-all flex items-center whitespace-pre ${
                    isCurrentStepLine
                      ? 'bg-teal-600 text-white font-bold'
                      : isHighlight
                      ? 'bg-slate-800 text-teal-300'
                      : 'text-slate-400'
                  }`}
                >
                  <span className="w-5 text-slate-500 text-[10px] shrink-0">{item.line}</span>
                  <span className="truncate">{item.text || ' '}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* 右侧：内存属性变动 */}
        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex flex-col justify-between">
          <div className="text-xs font-bold text-slate-800 mb-2">内存对象属性变动 (Object Stack):</div>
          
          <div className="space-y-3">
            {/* 父类属性块 */}
            <div className={`p-3 rounded-lg border-2 transition-all ${
              step >= 2 ? 'bg-teal-50 border-teal-500 shadow-xs' : 'bg-white border-slate-200 opacity-60'
            }`}>
              <div className="text-xs font-bold text-teal-900 mb-1">父类内存区域 (BaseDataset)</div>
              <div className="font-mono text-xs text-teal-700">
                self.name = {step >= 2 ? '"MNIST" (已由 super() 初始化)' : '未分配'}
              </div>
            </div>

            <div className="flex justify-center">
              <ArrowDown className={`w-4 h-4 transition-colors ${step >= 2 ? 'text-teal-600' : 'text-slate-300'}`} />
            </div>

            {/* 子类属性块 */}
            <div className={`p-3 rounded-lg border-2 transition-all ${
              step >= 3 ? 'bg-teal-50 border-teal-500 shadow-xs' : 'bg-white border-slate-200 opacity-60'
            }`}>
              <div className="text-xs font-bold text-teal-900 mb-1">子类实例对象 (ImageDataset)</div>
              <div className="font-mono text-xs space-y-1 text-teal-800">
                <div>self.name = {step >= 2 ? '"MNIST"' : '未继承'}</div>
                <div>self.samples = {step >= 3 ? '60000' : '未分配'}</div>
              </div>
            </div>
          </div>

          <div className="mt-3 text-[11px] text-slate-600 font-mono bg-white p-2 rounded border border-slate-200 flex items-center space-x-1.5">
            {step === 3 ? <Check className="w-3.5 h-3.5 text-teal-600" /> : <Clock className="w-3.5 h-3.5 text-slate-400" />}
            <span>实例状态: {step === 3 ? '兼具父类与子类的全部属性' : '正在构造中...'}</span>
          </div>
        </div>
      </div>

      {/* 状态输出日志 */}
      <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 mb-4 font-mono text-xs text-slate-700 flex items-center space-x-2">
        <MessageSquare className="w-4 h-4 text-teal-600 shrink-0" />
        <span>{log}</span>
      </div>

      {/* 按钮控制 */}
      <div className="flex space-x-3">
        <button
          onClick={handleNext}
          disabled={step >= 3}
          className="flex items-center space-x-1.5 bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs px-4 py-2 rounded-xl transition-all shadow-xs disabled:opacity-50"
        >
          <Play className="w-3.5 h-3.5" />
          <span>{step >= 3 ? '演练已完成' : '执行下一步'}</span>
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
