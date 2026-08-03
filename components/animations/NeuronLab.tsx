'use client';

import React, { useState } from 'react';
import { Play, Pause, SkipBack, SkipForward, RotateCcw, Copy, Check } from 'lucide-react';

export const NeuronLab: React.FC = () => {
  const [x1, setX1] = useState<number>(0.8);
  const [x2, setX2] = useState<number>(-0.4);
  const [w1, setW1] = useState<number>(1.2);
  const [w2, setW2] = useState<number>(0.7);
  const [b, setB] = useState<number>(0.3);

  const [currentStep, setCurrentStep] = useState<number>(2);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [speed, setSpeed] = useState<number>(1);
  const [copied, setCopied] = useState<boolean>(false);

  // Live Math Calculations
  const mult1 = x1 * w1;
  const mult2 = x2 * w2;
  const z = mult1 + mult2 + b;
  const a = Math.max(0, z);

  const handleReset = () => {
    setX1(0.8);
    setX2(-0.4);
    setW1(1.2);
    setW2(0.7);
    setB(0.3);
    setCurrentStep(1);
  };

  const handleRandom = () => {
    setX1(Number((Math.random() * 4 - 2).toFixed(1)));
    setX2(Number((Math.random() * 4 - 2).toFixed(1)));
    setW1(Number((Math.random() * 4 - 2).toFixed(1)));
    setW2(Number((Math.random() * 4 - 2).toFixed(1)));
    setB(Number((Math.random() * 2 - 1).toFixed(1)));
  };

  const handleCopyCode = () => {
    const code = `# 神经元计算示例
x1, x2 = ${x1}, ${x2}
w1, w2 = ${w1}, ${w2}
b = ${b}

z = x1 * w1 + x2 * w2 + b
a = max(0, z) # ReLU
result = {'z': z, 'a': a}
print(result)`;
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 p-5 space-y-5 shadow-card">
      {/* Top Header Control Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
        <div className="flex items-center gap-2">
          <span className="text-sm font-bold text-slate-800">交互实验室</span>
          <span className="text-slate-300">/</span>
          <span className="text-xs text-slate-500 font-medium">神经元计算过程</span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="flex items-center gap-1.5 bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold px-3 py-1.5 rounded-xl transition-all shadow-sm"
          >
            {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 fill-white" />}
            {isPlaying ? '暂停' : '播放'}
          </button>
          <button
            onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
            className="p-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-medium flex items-center gap-1 transition-colors"
          >
            <SkipBack className="w-3.5 h-3.5" /> 上一步
          </button>
          <button
            onClick={() => setCurrentStep(Math.min(4, currentStep + 1))}
            className="p-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-medium flex items-center gap-1 transition-colors"
          >
            下一步 <SkipForward className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={handleReset}
            className="p-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-medium flex items-center gap-1 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" /> 重置
          </button>
          <div className="h-4 w-px bg-slate-200 mx-1" />
          <div className="flex bg-slate-100 p-0.5 rounded-xl text-[11px] font-bold text-slate-600">
            <button
              onClick={() => setSpeed(1)}
              className={`px-2 py-0.5 rounded-lg ${speed === 1 ? 'bg-teal-600 text-white' : ''}`}
            >
              1x
            </button>
            <button
              onClick={() => setSpeed(2)}
              className={`px-2 py-0.5 rounded-lg ${speed === 2 ? 'bg-teal-600 text-white' : ''}`}
            >
              2x
            </button>
          </div>
        </div>
      </div>

      {/* Middle Interactive Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left Parameters Sliders */}
        <div className="lg:col-span-3 space-y-4 bg-slate-50/70 p-4 rounded-xl border border-slate-200/60">
          <div>
            <h3 className="font-bold text-slate-800 text-xs mb-1">参数设置</h3>
            <p className="text-[11px] text-slate-400">拖动参数，观察神经元输出变化</p>
          </div>

          {/* Slider x1 */}
          <div className="space-y-1">
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-700 font-medium">输入 x₁</span>
              <input
                type="number"
                value={x1}
                onChange={(e) => setX1(Number(e.target.value))}
                className="w-14 text-right px-1.5 py-0.5 border rounded border-slate-200 text-slate-800 font-bold bg-white text-xs"
              />
            </div>
            <input
              type="range"
              min="-2"
              max="2"
              step="0.1"
              value={x1}
              onChange={(e) => setX1(Number(e.target.value))}
              className="w-full accent-teal-600 h-1.5 bg-slate-200 rounded-lg cursor-pointer"
            />
          </div>

          {/* Slider x2 */}
          <div className="space-y-1">
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-700 font-medium">输入 x₂</span>
              <input
                type="number"
                value={x2}
                onChange={(e) => setX2(Number(e.target.value))}
                className="w-14 text-right px-1.5 py-0.5 border rounded border-slate-200 text-slate-800 font-bold bg-white text-xs"
              />
            </div>
            <input
              type="range"
              min="-2"
              max="2"
              step="0.1"
              value={x2}
              onChange={(e) => setX2(Number(e.target.value))}
              className="w-full accent-teal-600 h-1.5 bg-slate-200 rounded-lg cursor-pointer"
            />
          </div>

          {/* Slider w1 */}
          <div className="space-y-1">
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-700 font-medium">权重 w₁</span>
              <input
                type="number"
                value={w1}
                onChange={(e) => setW1(Number(e.target.value))}
                className="w-14 text-right px-1.5 py-0.5 border rounded border-slate-200 text-slate-800 font-bold bg-white text-xs"
              />
            </div>
            <input
              type="range"
              min="-2"
              max="2"
              step="0.1"
              value={w1}
              onChange={(e) => setW1(Number(e.target.value))}
              className="w-full accent-teal-600 h-1.5 bg-slate-200 rounded-lg cursor-pointer"
            />
          </div>

          {/* Slider w2 */}
          <div className="space-y-1">
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-700 font-medium">权重 w₂</span>
              <input
                type="number"
                value={w2}
                onChange={(e) => setW2(Number(e.target.value))}
                className="w-14 text-right px-1.5 py-0.5 border rounded border-slate-200 text-slate-800 font-bold bg-white text-xs"
              />
            </div>
            <input
              type="range"
              min="-2"
              max="2"
              step="0.1"
              value={w2}
              onChange={(e) => setW2(Number(e.target.value))}
              className="w-full accent-teal-600 h-1.5 bg-slate-200 rounded-lg cursor-pointer"
            />
          </div>

          {/* Slider b */}
          <div className="space-y-1">
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-700 font-medium">偏置 b</span>
              <input
                type="number"
                value={b}
                onChange={(e) => setB(Number(e.target.value))}
                className="w-14 text-right px-1.5 py-0.5 border rounded border-slate-200 text-slate-800 font-bold bg-white text-xs"
              />
            </div>
            <input
              type="range"
              min="-2"
              max="2"
              step="0.1"
              value={b}
              onChange={(e) => setB(Number(e.target.value))}
              className="w-full accent-teal-600 h-1.5 bg-slate-200 rounded-lg cursor-pointer"
            />
          </div>

          <div className="pt-2 flex gap-2">
            <button
              onClick={handleRandom}
              className="flex-1 py-1.5 bg-white border border-slate-200 hover:bg-slate-100 rounded-xl text-xs font-semibold text-slate-600 transition-colors"
            >
              随机示例
            </button>
            <button
              onClick={handleReset}
              className="flex-1 py-1.5 bg-white border border-slate-200 hover:bg-slate-100 rounded-xl text-xs font-semibold text-slate-600 transition-colors"
            >
              恢复默认
            </button>
          </div>
        </div>

        {/* Center Glowing Dark Canvas */}
        <div className="lg:col-span-6 bg-[#0B132B] rounded-xl p-5 relative overflow-hidden flex flex-col justify-between min-h-[340px] text-white">
          <div className="flex justify-between items-center text-xs text-slate-400 font-medium">
            <span>计算可视化</span>
          </div>

          {/* SVG Glow Network Diagram */}
          <div className="relative my-auto py-6 flex items-center justify-between">
            {/* Input Nodes */}
            <div className="space-y-8 z-10">
              <div className="w-14 h-14 rounded-full border-2 border-teal-400 bg-[#0F223D] flex flex-col items-center justify-center shadow-[0_0_15px_rgba(20,184,166,0.3)]">
                <span className="text-xs font-bold text-teal-300">x₁</span>
                <span className="text-[10px] text-teal-100">{x1}</span>
              </div>
              <div className="w-14 h-14 rounded-full border-2 border-teal-400 bg-[#0F223D] flex flex-col items-center justify-center shadow-[0_0_15px_rgba(20,184,166,0.3)]">
                <span className="text-xs font-bold text-teal-300">x₂</span>
                <span className="text-[10px] text-teal-100">{x2}</span>
              </div>
              <div className="w-14 h-14 rounded-full border-2 border-teal-400 bg-[#0F223D] flex flex-col items-center justify-center shadow-[0_0_15px_rgba(20,184,166,0.3)]">
                <span className="text-xs font-bold text-teal-300">bias</span>
                <span className="text-[10px] text-teal-100">{b}</span>
              </div>
            </div>

            {/* Sum Node */}
            <div className="z-10 flex flex-col items-center">
              <div className="w-16 h-16 rounded-full border-2 border-cyan-400 bg-[#0E2A47] flex flex-col items-center justify-center shadow-[0_0_20px_rgba(6,182,212,0.4)]">
                <span className="text-xl font-extrabold text-cyan-200">Σ</span>
              </div>
              <span className="mt-2 text-[11px] font-mono px-2 py-0.5 bg-cyan-950/80 text-cyan-300 rounded border border-cyan-700/50">
                z = {z.toFixed(2)}
              </span>
            </div>

            {/* Activation Function Node */}
            <div className="z-10 flex flex-col items-center">
              <div className="w-16 h-20 rounded-xl border-2 border-sky-400 bg-[#0D2E54] flex flex-col items-center justify-center p-1 shadow-[0_0_20px_rgba(56,189,248,0.4)]">
                <span className="text-xs font-bold text-sky-200">ReLU</span>
                {/* SVG Curve */}
                <svg width="40" height="24" viewBox="0 0 40 24" className="my-1">
                  <line x1="0" y1="20" x2="20" y2="20" stroke="#38BDF8" strokeWidth="2" />
                  <line x1="20" y1="20" x2="38" y2="4" stroke="#38BDF8" strokeWidth="2" />
                </svg>
              </div>
              <span className="mt-2 text-[11px] font-mono px-2 py-0.5 bg-sky-950/80 text-sky-300 rounded border border-sky-700/50">
                z = {z.toFixed(2)}
              </span>
            </div>

            {/* Output Node */}
            <div className="z-10">
              <div className="w-14 h-14 rounded-full border-2 border-emerald-400 bg-[#0F352E] flex flex-col items-center justify-center shadow-[0_0_20px_rgba(16,185,129,0.4)]">
                <span className="text-sm font-bold text-emerald-300">a</span>
                <span className="text-[10px] font-mono text-emerald-100">a = {a.toFixed(2)}</span>
              </div>
            </div>
          </div>

          <div className="bg-slate-900/80 px-3 py-2 rounded-lg border border-slate-700/50 text-[11px] text-slate-300 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-teal-400 animate-ping" />
            <span>当前状态: 正在演示第 {currentStep} 步 / 信号流动中</span>
          </div>
        </div>

        {/* Right Computation Steps */}
        <div className="lg:col-span-3 space-y-3">
          <h3 className="font-bold text-slate-800 text-xs">计算步骤</h3>

          <div className="space-y-2 text-xs">
            <div
              className={`p-3 rounded-xl border transition-all ${
                currentStep === 1
                  ? 'bg-amber-50 border-amber-300 text-amber-900 shadow-sm'
                  : 'bg-slate-50 border-slate-200/60 text-slate-600'
              }`}
            >
              <div className="font-bold flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-teal-600 text-white text-[10px] flex items-center justify-center">
                  1
                </span>
                加权相乘
              </div>
              <p className="text-[11px] text-slate-500 mt-1 pl-7">将每个输入乘以对应的权重</p>
            </div>

            <div
              className={`p-3 rounded-xl border transition-all ${
                currentStep === 2
                  ? 'bg-amber-50 border-amber-300 text-amber-900 shadow-sm font-semibold'
                  : 'bg-slate-50 border-slate-200/60 text-slate-600'
              }`}
            >
              <div className="font-bold flex items-center gap-2 text-amber-700">
                <span className="w-5 h-5 rounded-full bg-amber-500 text-white text-[10px] flex items-center justify-center">
                  2
                </span>
                求和
              </div>
              <p className="text-[11px] text-slate-600 mt-1 pl-7">将 x₁×w₁ 与 x₂×w₂ 相加</p>
            </div>

            <div
              className={`p-3 rounded-xl border transition-all ${
                currentStep === 3
                  ? 'bg-amber-50 border-amber-300 text-amber-900 shadow-sm'
                  : 'bg-slate-50 border-slate-200/60 text-slate-600'
              }`}
            >
              <div className="font-bold flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-slate-400 text-white text-[10px] flex items-center justify-center">
                  3
                </span>
                加偏置
              </div>
              <p className="text-[11px] text-slate-500 mt-1 pl-7">将偏置 b 加到求和结果上</p>
            </div>

            <div
              className={`p-3 rounded-xl border transition-all ${
                currentStep === 4
                  ? 'bg-amber-50 border-amber-300 text-amber-900 shadow-sm'
                  : 'bg-slate-50 border-slate-200/60 text-slate-600'
              }`}
            >
              <div className="font-bold flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-slate-400 text-white text-[10px] flex items-center justify-center">
                  4
                </span>
                激活函数
              </div>
              <p className="text-[11px] text-slate-500 mt-1 pl-7">通过 ReLU 计算最终输出</p>
            </div>
          </div>

          {/* Current Live Output Box */}
          <div className="pt-2 border-t border-slate-100 flex items-center justify-around bg-slate-50 p-3 rounded-xl">
            <div className="text-center">
              <div className="text-[10px] text-slate-400">加权和 z</div>
              <div className="text-base font-extrabold text-teal-600 font-mono">{z.toFixed(2)}</div>
            </div>
            <div className="w-px h-8 bg-slate-200" />
            <div className="text-center">
              <div className="text-[10px] text-slate-400">激活输出 a</div>
              <div className="text-base font-extrabold text-teal-600 font-mono">{a.toFixed(2)}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Math Deduction & Python Code Block */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-3 border-t border-slate-100">
        {/* Math deduction */}
        <div className="bg-slate-50/80 rounded-xl p-4 border border-slate-200/60 space-y-2">
          <h4 className="font-bold text-slate-800 text-xs">公式推导</h4>
          <div className="font-mono text-xs text-slate-700 space-y-1">
            <div>z = x₁·w₁ + x₂·w₂ + b</div>
            <div>a = ReLU(z) = max(0, z)</div>
          </div>
          <div className="pt-2 text-xs font-mono text-teal-700 border-t border-slate-200/50">
            <div>z = {x1} × {w1} + ({x2}) × {w2} + {b} = <span className="font-bold">{z.toFixed(2)}</span></div>
            <div>a = max(0, {z.toFixed(2)}) = <span className="font-bold text-emerald-600">{a.toFixed(2)}</span></div>
          </div>
        </div>

        {/* Python Code Example Box */}
        <div className="bg-[#0B132B] rounded-xl p-4 border border-slate-800 text-white space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-xs font-bold text-slate-300">Python 示例</span>
            <div className="flex gap-2">
              <button
                onClick={handleCopyCode}
                className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-white px-2 py-0.5 rounded bg-slate-800 border border-slate-700"
              >
                {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                {copied ? '已复制' : '复制'}
              </button>
            </div>
          </div>

          <pre className="font-mono text-[11px] text-teal-300 leading-relaxed overflow-x-auto">
            {`# 神经元计算示例
x1, x2 = ${x1}, ${x2}
w1, w2 = ${w1}, ${w2}
b = ${b}

z = x1 * w1 + x2 * w2 + b
a = max(0, z) # ReLU`}
          </pre>

          <div className="pt-2 border-t border-slate-800 text-[11px] font-mono text-slate-300 flex items-center justify-between">
            <span className="text-slate-400">运行结果:</span>
            <span className="text-emerald-400 font-bold bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
              z = {z.toFixed(2)}, a = {a.toFixed(2)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
