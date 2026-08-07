'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Play, RotateCcw, Pause, Sparkles } from 'lucide-react';

type OptimizerType = 'SGD' | 'Momentum' | 'RMSProp' | 'Adam';

export function GradientDescentLab() {
  const [optimizer, setOptimizer] = useState<OptimizerType>('Momentum');
  const [learningRate, setLearningRate] = useState<number>(0.05);
  const [isScaled, setIsScaled] = useState<boolean>(true);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);

  // 轨迹坐标点历史
  const [history, setHistory] = useState<Array<{ x: number; y: number; loss: number }>>([
    { x: 3.5, y: 3.0, loss: 15.0 }
  ]);

  // 损失函数与梯度定义: f(x, y) = scale_x * x^2 + scale_y * y^2
  const scaleX = 1.0;
  const scaleY = isScaled ? 1.5 : 10.0; // 未标准化时为狭长长椭圆

  const computeLoss = (x: number, y: number) => scaleX * x * x + scaleY * y * y;
  const computeGrad = (x: number, y: number) => ({ gx: 2 * scaleX * x, gy: 2 * scaleY * y });

  // 重置轨迹
  const handleReset = () => {
    setIsPlaying(false);
    const startX = 3.5;
    const startY = 3.0;
    setHistory([{ x: startX, y: startY, loss: computeLoss(startX, startY) }]);
  };

  useEffect(() => {
    handleReset();
  }, [optimizer, isScaled]);

  // 定时器自动执行梯度下降步进（无无缝无限渲染死循环）
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isPlaying) {
      interval = setInterval(() => {
        setHistory((prevHistory) => {
          if (prevHistory.length === 0 || prevHistory.length >= 60) {
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
            nextX -= (learningRate / Math.sqrt(sqGx)) * (gx / (Math.abs(gx) || 1)) * 0.4;
            nextY -= (learningRate / Math.sqrt(sqGy)) * (gy / (Math.abs(gy) || 1)) * 0.4;
          } else if (optimizer === 'Adam') {
            const beta = 0.7;
            const prevDx = prevHistory.length > 1 ? current.x - prevHistory[prevHistory.length - 2].x : 0;
            const prevDy = prevHistory.length > 1 ? current.y - prevHistory[prevHistory.length - 2].y : 0;
            nextX += beta * prevDx - learningRate * gx * 0.5;
            nextY += beta * prevDy - learningRate * gy * 0.3;
          }

          // 数值合法性与边界防护
          if (!Number.isFinite(nextX) || Math.abs(nextX) > 8) nextX = Math.sign(nextX || 1) * 4;
          if (!Number.isFinite(nextY) || Math.abs(nextY) > 8) nextY = Math.sign(nextY || 1) * 4;

          const newLoss = computeLoss(nextX, nextY);
          return [...prevHistory, { x: nextX, y: nextY, loss: newLoss }];
        });
      }, 90);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isPlaying, optimizer, learningRate, isScaled]);

  const currentPoint = history[history.length - 1] || { x: 3.5, y: 3.0, loss: 15.0 };

  return (
    <div className="my-7 rounded-2xl border border-slate-200 bg-white p-5 space-y-5 shadow-card">
      {/* 标题栏 */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-cyan-50 text-cyan-700 border border-cyan-200">
            <Sparkles className="w-4 h-4 text-cyan-600" />
            微积分与优化器演练
          </span>
          <h4 className="text-base font-bold text-slate-800">梯度下降与优化器交互实验室</h4>
        </div>

        {/* 播放与重置控制 */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className={`flex items-center gap-1.5 rounded-lg px-4 py-1.5 text-xs font-bold transition-all cursor-pointer ${
              isPlaying
                ? 'bg-amber-500 text-white hover:bg-amber-600 shadow'
                : 'bg-cyan-600 text-white hover:bg-cyan-700 shadow-cyan-600/20'
            }`}
          >
            {isPlaying ? <Pause className="h-3.5 w-3.5 fill-current" /> : <Play className="h-3.5 w-3.5 fill-current" />}
            {isPlaying ? '暂停动画' : '播放轨迹'}
          </button>

          <button
            onClick={handleReset}
            className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-200 cursor-pointer"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            重置
          </button>
        </div>
      </div>

      {/* 控制参数区 */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {/* 选择优化器 */}
        <div className="rounded-xl bg-slate-50 p-3 border border-slate-200">
          <label className="mb-1.5 block text-xs font-bold text-slate-700">优化器算法</label>
          <div className="grid grid-cols-2 gap-1.5">
            {(['SGD', 'Momentum', 'RMSProp', 'Adam'] as OptimizerType[]).map((opt) => (
              <button
                key={opt}
                onClick={() => setOptimizer(opt)}
                className={`rounded-lg py-1.5 text-xs font-bold transition-all cursor-pointer ${
                  optimizer === opt
                    ? 'bg-cyan-600 text-white shadow-sm'
                    : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                }`}
              >
                {opt}
              </button>
            ))}
          </div>
        </div>

        {/* 学习率滑块 */}
        <div className="rounded-xl bg-slate-50 p-3 border border-slate-200">
          <div className="mb-1.5 flex justify-between text-xs font-bold">
            <span className="text-slate-700">学习率 η</span>
            <span className="font-mono text-cyan-700">{learningRate.toFixed(3)}</span>
          </div>
          <input
            type="range"
            min="0.005"
            max="0.2"
            step="0.005"
            value={learningRate}
            onChange={(e) => setLearningRate(parseFloat(e.target.value))}
            className="h-2 w-full cursor-pointer appearance-none rounded-lg bg-slate-200 accent-cyan-600"
          />
          <div className="mt-2 flex justify-between text-[10px] text-slate-500 font-medium">
            <span>极微 (0.005)</span>
            <span>较大 (0.20)</span>
          </div>
        </div>

        {/* 特征标准化开关 */}
        <div className="rounded-xl bg-slate-50 p-3 border border-slate-200 flex flex-col justify-between">
          <label className="block text-xs font-bold text-slate-700">特征尺寸形状</label>
          <button
            onClick={() => setIsScaled(!isScaled)}
            className={`w-full rounded-lg py-2 text-xs font-bold transition-all cursor-pointer ${
              isScaled
                ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                : 'bg-rose-100 text-rose-800 border border-rose-300'
            }`}
          >
            {isScaled ? '✅ Z-score 标准化 (正圆等高线)' : '⚠️ 未标准化 (病态峡谷椭圆)'}
          </button>
        </div>
      </div>

      {/* 可视化画布与状态 */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {/* 左侧 2D 等高线视口 */}
        <div className="relative aspect-[4/3] w-full overflow-hidden rounded-xl border border-slate-200 bg-slate-900 md:col-span-2">
          <svg className="h-full w-full" viewBox="-5 -5 10 10">
            {/* 网格线 */}
            {[-4, -2, 0, 2, 4].map((v) => (
              <g key={v}>
                <line x1={v} y1="-5" x2={v} y2="5" stroke="#334155" strokeWidth="0.04" />
                <line x1="-5" y1={v} x2="5" y2={v} stroke="#334155" strokeWidth="0.04" />
              </g>
            ))}
            {/* 坐标轴 */}
            <line x1="-5" y1="0" x2="5" y2="0" stroke="#475569" strokeWidth="0.07" />
            <line x1="0" y1="-5" x2="0" y2="5" stroke="#475569" strokeWidth="0.07" />

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
                  strokeOpacity={0.25 + i * 0.1}
                  strokeWidth="0.06"
                  strokeDasharray={i % 2 === 1 ? '0.2, 0.2' : undefined}
                />
              );
            })}

            {/* 极小值谷底点 */}
            <circle cx="0" cy="0" r="0.2" fill="#10b981" />
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

            {/* 历史轨迹点 */}
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

          {/* 悬浮步数标记 */}
          <div className="absolute top-3 left-3 rounded-lg bg-slate-900/80 px-3 py-1 text-xs font-mono text-slate-300 border border-slate-700/60 backdrop-blur-sm">
            迭代步数: <span className="text-cyan-400 font-bold">{history.length - 1}</span> / 60
          </div>
        </div>

        {/* 右侧数据监测 */}
        <div className="flex flex-col justify-between gap-4 rounded-xl border border-slate-200 bg-slate-50 p-4">
          <div>
            <h4 className="mb-3 text-xs font-bold text-slate-700 uppercase tracking-wider">实时坐标与 Loss 监控</h4>
            <div className="space-y-2 font-mono text-xs">
              <div className="flex justify-between rounded-lg bg-white p-2.5 border border-slate-200">
                <span className="text-slate-500 font-medium">参数 X</span>
                <span className="text-cyan-700 font-bold">{currentPoint.x.toFixed(4)}</span>
              </div>
              <div className="flex justify-between rounded-lg bg-white p-2.5 border border-slate-200">
                <span className="text-slate-500 font-medium">参数 Y</span>
                <span className="text-cyan-700 font-bold">{currentPoint.y.toFixed(4)}</span>
              </div>
              <div className="flex justify-between rounded-lg bg-white p-2.5 border border-slate-200">
                <span className="text-slate-500 font-medium">当前 Loss</span>
                <span className="text-emerald-700 font-bold">{currentPoint.loss.toFixed(6)}</span>
              </div>
            </div>
          </div>

          {/* 说明卡片 */}
          <div className="rounded-xl border border-sky-200 bg-sky-50/70 p-3 text-[11px] text-sky-900 leading-relaxed font-medium">
            💡 <strong>观察重点：</strong>
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
