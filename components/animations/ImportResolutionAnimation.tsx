'use client';

import React, { useState } from 'react';
import { Search, AlertTriangle, CheckCircle2, ArrowRight, Play, RotateCcw, FileText } from 'lucide-react';

export const ImportResolutionAnimation: React.FC = () => {
  const [selectedModule, setSelectedModule] = useState<'math' | 'random' | 'custom_dataset'>('random');
  const [hasLocalOverride, setHasLocalOverride] = useState<boolean>(true);
  const [activeStep, setActiveStep] = useState<number>(-1);
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [logText, setLogText] = useState<string>('请点击“模拟 import 检索”体验 sys.path 检索过程');

  const steps = [
    { id: 0, title: '1. 当前运行目录 (.)', desc: '检查运行脚本同级目录' },
    { id: 1, title: '2. PYTHONPATH 环境变量', desc: '检查自定义环境变量路径' },
    { id: 2, title: '3. 标准库与 site-packages', desc: '检查 Python 内置库与 pip 安装包' },
  ];

  const handleRun = () => {
    setIsSearching(true);
    setActiveStep(0);
    setLogText(`正在尝试 import ${selectedModule} ... 优先检索【1. 当前运行目录】`);

    setTimeout(() => {
      if (hasLocalOverride) {
        setActiveStep(0);
        setIsSearching(false);
        setLogText(`告警：在【当前运行目录】找到本地 ./${selectedModule}.py，加载本地同名文件屏蔽了标准库`);
      } else {
        setLogText(`【当前运行目录】未找到 ${selectedModule}.py，继续检索【2. PYTHONPATH】...`);
        setActiveStep(1);

        setTimeout(() => {
          setLogText(`【PYTHONPATH】未找到 ${selectedModule}.py，继续检索【3. 标准库与 site-packages】...`);
          setActiveStep(2);

          setTimeout(() => {
            setIsSearching(false);
            setLogText(`成功在【3. 标准库与 site-packages】找到官方 ${selectedModule} 模块并成功载入`);
          }, 800);
        }, 800);
      }
    }, 800);
  };

  const handleReset = () => {
    setActiveStep(-1);
    setIsSearching(false);
    setLogText('已重置，请点击“模拟 import 检索”');
  };

  return (
    <div className="my-8 rounded-2xl border-2 border-slate-200 bg-white p-5 shadow-sm text-slate-800 font-sans">
      <div className="flex items-center justify-between border-b border-slate-200 pb-3 mb-4">
        <div className="flex items-center space-x-2">
          <Search className="w-5 h-5 text-teal-600" />
          <h3 className="text-base font-bold text-slate-900">sys.path 模块导入与同名屏蔽模拟</h3>
        </div>
        <span className="text-xs font-semibold bg-teal-50 text-teal-700 border border-teal-200 px-2.5 py-0.5 rounded-full">
          动态演练
        </span>
      </div>

      {/* 控制面板 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6 bg-slate-50 p-3.5 rounded-xl border border-slate-200">
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5">选择尝试导入的模块:</label>
          <div className="flex space-x-2">
            {(['random', 'math', 'custom_dataset'] as const).map((mod) => (
              <button
                key={mod}
                onClick={() => { setSelectedModule(mod); handleReset(); }}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-all ${
                  selectedModule === mod
                    ? 'bg-teal-600 text-white font-bold shadow-xs'
                    : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
                }`}
              >
                {mod}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5">模拟本地文件状态:</label>
          <label className="flex items-center space-x-2 cursor-pointer mt-1">
            <input
              type="checkbox"
              checked={hasLocalOverride}
              onChange={(e) => { setHasLocalOverride(e.target.checked); handleReset(); }}
              className="w-4 h-4 rounded text-teal-600 focus:ring-teal-500 bg-white border-slate-300"
            />
            <span className="text-xs text-amber-700 font-medium flex items-center space-x-1">
              <FileText className="w-3.5 h-3.5 text-amber-600 shrink-0" />
              <span>是否存在本地同名文件 <code className="bg-slate-200 px-1 py-0.5 rounded text-amber-900 font-bold">./{selectedModule}.py</code></span>
            </span>
          </label>
        </div>
      </div>

      {/* 动画流程 Step 展示 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-6">
        {steps.map((step) => {
          const isActive = activeStep === step.id;
          const isWarning = isActive && step.id === 0 && hasLocalOverride && !isSearching;
          const isSuccess = isActive && step.id === 2 && !hasLocalOverride && !isSearching;

          return (
            <div
              key={step.id}
              className={`p-4 rounded-xl border-2 transition-all duration-300 relative ${
                isWarning
                  ? 'bg-amber-50 border-amber-400 shadow-xs'
                  : isSuccess
                  ? 'bg-emerald-50 border-emerald-400 shadow-xs'
                  : isActive
                  ? 'bg-teal-50 border-teal-400 scale-[1.02]'
                  : 'bg-slate-50 border-slate-200 opacity-60'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold font-mono text-slate-800">{step.title}</span>
                {isWarning && <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />}
                {isSuccess && <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />}
              </div>
              <p className="text-xs text-slate-600">{step.desc}</p>
              {step.id === 0 && hasLocalOverride && (
                <div className="mt-2 text-[11px] bg-amber-100 text-amber-800 p-1.5 rounded border border-amber-300 font-semibold flex items-center space-x-1">
                  <FileText className="w-3 h-3 text-amber-700 shrink-0" />
                  <span>包含本地 ./{selectedModule}.py</span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* 实时状态输出日志 */}
      <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 mb-4 font-mono text-xs text-slate-800 flex items-center space-x-2">
        <ArrowRight className="w-4 h-4 text-teal-600 shrink-0" />
        <span className={hasLocalOverride && activeStep === 0 && !isSearching ? 'text-amber-800 font-bold' : ''}>
          {logText}
        </span>
      </div>

      {/* 按钮区域 */}
      <div className="flex space-x-3">
        <button
          onClick={handleRun}
          disabled={isSearching}
          className="flex items-center space-x-1.5 bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs px-4 py-2 rounded-xl transition-all shadow-xs disabled:opacity-50"
        >
          <Play className="w-3.5 h-3.5" />
          <span>模拟 import {selectedModule} 检索</span>
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
