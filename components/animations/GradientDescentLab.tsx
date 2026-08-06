'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Play, RotateCcw, Pause, Sparkles } from 'lucide-react';

type OptimizerType = 'SGD' | 'Momentum' | 'RMSProp' | 'Adam';

export function GradientDescentLab() {
  const [optimizer, setOptimizer] = useState<OptimizerType>('Momentum');
  const [learningRate, setLearningRate] = useState<number>(0.05);
  const [isScaled, setIsScaled] = useState<boolean>(true);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [step, setStep] = useState<number>(0);

  // 轨迹坐标点历史
  const [history, setHistory] = useState<Array<{ x: number; y: number; loss: number }>>([]);
  const animRef = useRef<number | null>(null);

  // 损失函数与梯度定义: f(x, y) = scale_x * x^2 + scale_y * y^2
  const scaleX = isScaled ? 1.0 : 1.0;
  const scaleY = isScaled ? 1.5 : 12.0; // 未标准化时为 1:12 极其狭长病态椭圆

  const computeLoss = (x: number, y: number) => scaleX * x * x + scaleY * y * y;
  const computeGrad = (x: number, y: number) => ({ gx: 2 * scaleX * x, gy: 2 * scaleY * y });

  // 重置动画
  const handleReset = () => {
    setIsPlaying(false);
    if (animRef.current) cancelAnimationFrame(animRef.current);
    const startX = 3.5;
    const startY = 3.0;
    setStep(0);
    setHistory([{ x: startX, y: startY, loss: computeLoss(startX, startY) }]);
  };

  useEffect(() => {
    handleReset();
  }, [optimizer, isScaled]);

  // 单步迭代
  const stepForward = () => {
    setHistory((prevHistory) => {
      if (prevHistory.length === 0) return prevHistory;
      if (prevHistory.length >= 60) {
        setIsPlaying(false);
        return prevHistory;
      }

      const current = prevHistory[prevHistory.length - 1];
      const { gx, gy } = computeGrad(current.x, current.y);
      let nextX = current.x;
      let nextY = current.y;

      if (optimizer === 'SGD') {
        nextX -= learningRate * gx;
        nextY -= learningRate * gy;
      } else if (optimizer === 'Momentum') {
        const beta = 0.85;
        // 计算积累动量
        const prevDx = prevHistory.length > 1 ? current.x - prevHistory[prevHistory.length - 2].x : 0;
        const prevDy = prevHistory.length > 1 ? current.y - prevHistory[prevHistory.length - 2].y : 0;
        const vx = beta * prevDx - learningRate * gx;
        const vy = beta * prevDy - learningRate * gy;
        nextX += vx;
        nextY += vy;
      } else if (optimizer === 'RMSProp') {
        const eps = 1e-6;
        const sqGx = gx * gx + eps;
        const sqGy = gy * gy + eps;
        nextX -= (learningRate / Math.sqrt(sqGx)) * (gx / Math.abs(gx || 1)) * 0.4;
        nextY -= (learningRate / Math.sqrt(sqGy)) * (gy / Math.abs(gy || 1)) * 0.4;
      } else if (optimizer === 'Adam') {
        const beta = 0.7;
        const prevDx = prevHistory.length > 1 ? current.x - prevHistory[prevHistory.length - 2].x : 0;
        const prevDy = prevHistory.length > 1 ? current.y - prevHistory[prevHistory.length - 2].y : 0;
        nextX += beta * prevDx - learningRate * gx * 0.5;
        nextY += beta * prevDy - learningRate * gy * 0.3;
      }

      const newLoss = computeLoss(nextX, nextY);
      return [...prevHistory, { x: nextX, y: nextY, loss: newLoss }];
    });
    setStep((s) => s + 1);
  };

  useEffect(() => {
    if (isPlaying) {
      const timer = setTimeout(() => {
        stepForward();
      }, 80);
      return () => clearTimeout(timer);
    }
  }, [isPlaying, history]);

  const currentPoint = history[history.length - 1] || { x: 3.5, y: 3.0, loss: 10 };

  return (
    <div className="my-8 rounded-2xl border border-slate-700/60 bg-slate-900/90 p-6 shadow-2xl backdrop-blur-md">
      {/* 标题说明 */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div className="flex items-center gap-3">
          <div className="rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 p-2.5 shadow-lg shadow-cyan-500/20">
            <Sparkles className="h-5 w-5 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">梯度下降与优化器交互实验室</h3>
            <p className="text-xs text-slate-400">实时调控学习率、特征标准化与优化器，观察参数在损失面上的下滑轨迹</p>
          </div>
        </div>

        {/* 播放控制 */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className={`flex items-center gap-1.5 rounded-lg px-4 py-2 text-xs font-semibold shadow-md transition-all ${
              isPlaying
                ? 'bg-amber-500 text-slate-950 hover:bg-amber-400'
                : 'bg-cyan-500 text-slate-950 hover:bg-cyan-400 shadow-cyan-500/20'
            }`}
          >
            {isPlaying ? <Pause className="h-4 w-4 fill-current" /> : <Play className="h-4 w-4 fill-current" />}
            {isPlaying ? '暂停动画' : '播放轨迹'}
          </button>

          <button
            onClick={handleReset}
            className="flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800/80 px-3 py-2 text-xs font-medium text-slate-300 transition-colors hover:bg-slate-700 hover:text-white"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            重置
          </button>
        </div>
      </div>

      {/* 控制面板 */}
      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        {/* 选择优化器 */}
        <div className="rounded-xl bg-slate-800/50 p-3 border border-slate-700/40">
          <label className="mb-1.5 block text-xs font-semibold text-slate-300">优化器算法</label>
          <div className="grid grid-cols-2 gap-1.5">
            {(['SGD', 'Momentum', 'RMSProp', 'Adam'] as OptimizerType[]).map((opt) => (
              <button
                key={opt}
                onClick={() => setOptimizer(opt)}
                className={`rounded-lg py-1.5 text-xs font-medium transition-all ${
                  optimizer === opt
                    ? 'bg-cyan-500 text-slate-950 font-bold shadow'
                    : 'bg-slate-900/60 text-slate-400 hover:text-slate-200'
                }`}
              >
                {opt}
              </button>
            ))}
          </div>
        </div>

        {/* 学习率滑块 */}
        <div className="rounded-xl bg-slate-800/50 p-3 border border-slate-700/40">
          <div className="mb-1.5 flex justify-between text-xs font-semibold">
            <span className="text-slate-300">学习率 η</span>
            <span className="font-mono text-cyan-400">{learningRate.toFixed(3)}</span>
          </div>
          <input
            type="range"
            min="0.005"
            max="0.2"
            step="0.005"
            value={learningRate}
            onChange={(e) => setLearningRate(parseFloat(e.target.value))}
            className="h-2 w-full cursor-pointer appearance-none rounded-lg bg-slate-700 accent-cyan-400"
          />
          <div className="mt-2 flex justify-between text-[10px] text-slate-500">
            <span>极微 (0.005)</span>
            <span>较大 (0.20)</span>
          </div>
        </div>

        {/* 特征标准化开关 */}
        <div className="rounded-xl bg-slate-800/50 p-3 border border-slate-700/40 flex flex-col justify-between">
          <label className="block text-xs font-semibold text-slate-300">特征尺寸形状</label>
          <button
            onClick={() => setIsScaled(!isScaled)}
            className={`w-full rounded-lg py-2 text-xs font-bold transition-all ${
              isScaled
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                : 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
            }`}
          >
            {isScaled ? '✅ Z-score 标准化 (正圆等高线)' : '⚠️ 未标准化 (病态峡谷椭圆)'}
          </button>
        </div>
      </div>

      {/* SVG 动画可视化视口 */}
      <div className="relative grid grid-cols-1 gap-6 md:grid-cols-3">
        {/* 左侧 2D 等高线与轨迹视口 (占 2 列) */}
        <div className="relative aspect-[4/3] w-full overflow-hidden rounded-xl border border-slate-700/60 bg-slate-950 md:col-span-2">
          <svg className="h-full w-full" viewBox="-5 -5 10 10">
            {/* 网格线 */}
            {[-4, -2, 0, 2, 4].map((v) => (
              <g key={v}>
                <line x1={v} y1="-5" x2={v} y2="5" stroke="#1e293b" strokeWidth="0.05" />
                <line x1="-5" y1={v} x2="5" y2={v} stroke="#1e293b" strokeWidth="0.05" />
              </g>
            ))}
            {/* 坐标轴 */}
            <line x1="-5" y1="0" x2="5" y2="0" stroke="#334155" strokeWidth="0.08" />
            <line x1="0" y1="-5" x2="0" y2="5" stroke="#334155" strokeWidth="0.08" />

            {/* 椭圆等高线 */}
            {[0.5, 1.5, 3.5, 7.0, 13.0, 22.0].map((r, i) => {
              const rx = Math.sqrt(r / scaleX);
              const ry = Math.sqrt(r / scaleY);
              return (
                <ellipse
                  key={i}
                  cx="0"
                  cy="0"
                  rx={rx}
                  ry={ry}
                  fill="none"
                  stroke="#38bdf8"
                  strokeOpacity={0.15 + i * 0.08}
                  strokeWidth="0.06"
                  strokeDasharray={i % 2 === 1 ? '0.2, 0.2' : undefined}
                />
              );
            })}

            {/* 最低极小值点 */}
            <circle cx="0" cy="0" r="0.2" fill="#10b981" className="animate-pulse" />
            <text x="0.3" y="0.4" fill="#10b981" fontSize="0.4" fontWeight="bold">
              (0,0) Min
            </text>

            {/* 历史轨迹连线 */}
            {history.length > 1 && (
              <polyline
                points={history.map((p) => `${p.x},${p.y}`).join(' ')}
                fill="none"
                stroke="#f43f5e"
                strokeWidth="0.1"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            )}

            {/* 历史节点圆点 */}
            {history.map((p, idx) => (
              <circle
                key={idx}
                cx={p.x}
                cy={p.y}
                r={idx === history.length - 1 ? 0.25 : 0.08}
                fill={idx === history.length - 1 ? '#06b6d4' : '#f43f5e'}
                stroke="#ffffff"
                strokeWidth="0.04"
              />
            ))}
          </svg>

          {/* 状态悬浮浮条 */}
          <div className="absolute top-3 left-3 rounded-lg bg-slate-900/80 px-3 py-1.5 text-[11px] font-mono text-slate-300 border border-slate-700/50 backdrop-blur-sm">
            步数: <span className="text-cyan-400 font-bold">{history.length - 1}</span> / 60
          </div>
        </div>

        {/* 右侧数据面板 (占 1 列) */}
        <div className="flex flex-col justify-between gap-4 rounded-xl border border-slate-700/60 bg-slate-950 p-4">
          <div>
            <h4 className="mb-3 text-xs font-bold text-slate-300 uppercase tracking-wider">当前坐标与 Loss 监控</h4>
            <div className="space-y-2 font-mono text-xs">
              <div className="flex justify-between rounded-lg bg-slate-900 p-2.5 border border-slate-800">
                <span className="text-slate-400">坐标 X</span>
                <span className="text-cyan-300 font-bold">{currentPoint.x.toFixed(4)}</span>
              </div>
              <div className="flex justify-between rounded-lg bg-slate-900 p-2.5 border border-slate-800">
                <span className="text-slate-400">坐标 Y</span>
                <span className="text-cyan-300 font-bold">{currentPoint.y.toFixed(4)}</span>
              </div>
              <div className="flex justify-between rounded-lg bg-slate-900 p-2.5 border border-slate-800">
                <span className="text-slate-400">当前 Loss</span>
                <span className="text-emerald-400 font-bold">{currentPoint.loss.toFixed(6)}</span>
              </div>
            </div>
          </div>

          {/* 现象诊断卡片 */}
          <div className="rounded-xl border border-cyan-500/30 bg-cyan-950/20 p-3 text-[11px] text-cyan-200/90 leading-relaxed">
            💡 <strong className="text-cyan-300">实验观察指南：</strong>
            <br />
            1. 切换为 <strong>未标准化</strong>，观察原生 SGD 怎么在南北峭壁间剧烈碰撞震荡；
            <br />
            2. 切换为 <strong>Momentum / Adam</strong>，看动量雪球如何积攒惯性直接冲过震荡！
          </div>
        </div>
      </div>
    </div>
  );
}
