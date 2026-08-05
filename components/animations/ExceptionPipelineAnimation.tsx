'use client';

import React, { useState } from 'react';
import { ShieldCheck, ShieldAlert, CheckCircle2, Lock, Unlock, Play, RotateCcw, AlertTriangle, XCircle, MessageSquare } from 'lucide-react';

export const ExceptionPipelineAnimation: React.FC = () => {
  const [dataMode, setDataMode] = useState<'normal' | 'captured_error' | 'uncaught_error'>('normal');
  const [stage, setStage] = useState<'idle' | 'try' | 'except' | 'else' | 'finally' | 'done'>('idle');
  const [handleLocked, setHandleLocked] = useState<boolean>(false);
  const [logText, setLogText] = useState<string>('请选择样本模式并点击“启动数据 Pipeline”运行');

  const handleStart = () => {
    setStage('try');
    setHandleLocked(true);
    setLogText('1. 正在 try 块中尝试读取数据文件并锁定资源句柄...');

    setTimeout(() => {
      if (dataMode === 'normal') {
        setStage('else');
        setLogText('2. 无任何报错，进入 else 块执行正常数据提取...');
        
        setTimeout(() => {
          setStage('finally');
          setHandleLocked(false);
          setLogText('3. 进入 finally 块：自动释放文件句柄并出厂...');

          setTimeout(() => {
            setStage('done');
            setLogText('Pipeline 运行成功，样本正常入库');
          }, 800);
        }, 1000);
      } else if (dataMode === 'captured_error') {
        setStage('except');
        setLogText('2. 捕获到已知异常 FileNotFoundError，被 except 块精准截获...');

        setTimeout(() => {
          setStage('finally');
          setHandleLocked(false);
          setLogText('3. 进入 finally 块：自动关闭损坏文件的残留句柄...');

          setTimeout(() => {
            setStage('done');
            setLogText('异常拦截成功，已跳过损坏样本，系统持续稳定运行');
          }, 800);
        }, 1000);
      } else {
        setStage('except');
        setLogText('2. 发生未捕获的致命错误，except 块未能拦截，准备向上层抛出崩溃异常...');

        setTimeout(() => {
          setStage('finally');
          setHandleLocked(false);
          setLogText('3. 进入 finally 块：程序虽然崩溃，但依然强制关闭了文件句柄保障资源安全...');

          setTimeout(() => {
            setStage('done');
            setLogText('程序中断，但文件句柄在 finally 中已成功安全释放');
          }, 800);
        }, 1000);
      }
    }, 1000);
  };

  const handleReset = () => {
    setStage('idle');
    setHandleLocked(false);
    setLogText('已重置，请点击“启动数据 Pipeline”');
  };

  return (
    <div className="my-8 rounded-2xl border-2 border-slate-200 bg-white p-5 shadow-sm text-slate-800 font-sans">
      {/* 头部标题栏 - 统一 Teal 风格 */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-3 mb-4">
        <div className="flex items-center space-x-2">
          <ShieldCheck className="w-5 h-5 text-teal-600" />
          <h3 className="text-base font-bold text-slate-900">try-except-else-finally 异常拦截防护管道</h3>
        </div>
        <div className="flex items-center space-x-1.5 text-xs bg-slate-50 px-2.5 py-1 rounded-full border border-slate-200">
          <span className="text-slate-600">句柄状态:</span>
          {handleLocked ? (
            <span className="text-amber-700 flex items-center font-mono font-bold"><Lock className="w-3 h-3 mr-1" /> 已锁定</span>
          ) : (
            <span className="text-teal-700 flex items-center font-mono font-bold"><Unlock className="w-3 h-3 mr-1" /> 已安全释放</span>
          )}
        </div>
      </div>

      {/* 模式选择 - 禁用 Emoji，统一用 SVG 按钮形态 */}
      <div className="mb-6 bg-slate-50 p-3.5 rounded-xl border border-slate-200">
        <label className="block text-xs font-semibold text-slate-700 mb-2">选择送入 Pipeline 的样本状态:</label>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          <button
            onClick={() => { setDataMode('normal'); handleReset(); }}
            className={`px-3 py-2 rounded-xl text-xs font-medium flex items-center space-x-2 transition-all ${
              dataMode === 'normal'
                ? 'bg-teal-600 text-white font-bold shadow-xs'
                : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
            }`}
          >
            <CheckCircle2 className={`w-4 h-4 ${dataMode === 'normal' ? 'text-white' : 'text-teal-600'}`} />
            <span>正常样本数据 (Normal)</span>
          </button>
          <button
            onClick={() => { setDataMode('captured_error'); handleReset(); }}
            className={`px-3 py-2 rounded-xl text-xs font-medium flex items-center space-x-2 transition-all ${
              dataMode === 'captured_error'
                ? 'bg-amber-600 text-white font-bold shadow-xs'
                : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
            }`}
          >
            <AlertTriangle className={`w-4 h-4 ${dataMode === 'captured_error' ? 'text-white' : 'text-amber-600'}`} />
            <span>缺失/损坏文件 (Captured)</span>
          </button>
          <button
            onClick={() => { setDataMode('uncaught_error'); handleReset(); }}
            className={`px-3 py-2 rounded-xl text-xs font-medium flex items-center space-x-2 transition-all ${
              dataMode === 'uncaught_error'
                ? 'bg-rose-600 text-white font-bold shadow-xs'
                : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
            }`}
          >
            <XCircle className={`w-4 h-4 ${dataMode === 'uncaught_error' ? 'text-white' : 'text-rose-600'}`} />
            <span>未捕获致命错误 (Uncaught)</span>
          </button>
        </div>
      </div>

      {/* 管道节点图示 - 统一节点样式 */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 mb-6">
        {/* Try */}
        <div className={`p-3.5 rounded-xl border-2 transition-all ${
          stage === 'try' ? 'bg-teal-50 border-teal-500 scale-[1.02] shadow-xs' : 'bg-slate-50 border-slate-200 opacity-60'
        }`}>
          <div className="text-xs font-bold text-teal-900 mb-1">1. try 块</div>
          <p className="text-[11px] text-slate-600 leading-relaxed">包裹易出错的代码，尝试执行</p>
        </div>

        {/* Except */}
        <div className={`p-3.5 rounded-xl border-2 transition-all ${
          stage === 'except'
            ? dataMode === 'uncaught_error'
              ? 'bg-rose-50 border-rose-500 scale-[1.02] shadow-xs'
              : 'bg-amber-50 border-amber-500 scale-[1.02] shadow-xs'
            : 'bg-slate-50 border-slate-200 opacity-60'
        }`}>
          <div className="text-xs font-bold text-slate-900 mb-1 flex items-center justify-between">
            <span>2. except 块</span>
            {stage === 'except' && dataMode === 'uncaught_error' && <XCircle className="w-3.5 h-3.5 text-rose-600 shrink-0" />}
          </div>
          <p className="text-[11px] text-slate-600 leading-relaxed">拦截并处理特定异常</p>
        </div>

        {/* Else */}
        <div className={`p-3.5 rounded-xl border-2 transition-all ${
          stage === 'else' ? 'bg-emerald-50 border-emerald-500 scale-[1.02] shadow-xs' : 'bg-slate-50 border-slate-200 opacity-60'
        }`}>
          <div className="text-xs font-bold text-emerald-900 mb-1">3. else 块</div>
          <p className="text-[11px] text-slate-600 leading-relaxed">仅在无任何报错时触发</p>
        </div>

        {/* Finally */}
        <div className={`p-3.5 rounded-xl border-2 transition-all ${
          stage === 'finally' ? 'bg-teal-50 border-teal-500 scale-[1.02] shadow-xs' : 'bg-slate-50 border-slate-200 opacity-60'
        }`}>
          <div className="text-xs font-bold text-teal-900 mb-1 flex items-center justify-between">
            <span>4. finally 块</span>
            <Unlock className="w-3.5 h-3.5 text-teal-600 shrink-0" />
          </div>
          <p className="text-[11px] text-slate-600 leading-relaxed">无论是否报错必执行 (释放资源)</p>
        </div>
      </div>

      {/* 实时状态输出日志 - 统一格式 */}
      <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 mb-4 font-mono text-xs text-slate-700 flex items-center space-x-2">
        {stage === 'done' ? (
          <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0" />
        ) : (
          <MessageSquare className="w-4 h-4 text-teal-600 shrink-0" />
        )}
        <span>{logText}</span>
      </div>

      {/* 按钮控制 - 统一按钮设计 */}
      <div className="flex space-x-3">
        <button
          onClick={handleStart}
          disabled={stage !== 'idle' && stage !== 'done'}
          className="flex items-center space-x-1.5 bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs px-4 py-2 rounded-xl transition-all shadow-xs disabled:opacity-50"
        >
          <Play className="w-3.5 h-3.5" />
          <span>启动数据 Pipeline</span>
        </button>
        <button
          onClick={handleReset}
          className="flex items-center space-x-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs px-3.5 py-2 rounded-xl border border-slate-200 font-medium transition-colors"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>重置管道</span>
        </button>
      </div>
    </div>
  );
};
