'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Layers, RefreshCw, HelpCircle, ShieldCheck, Zap } from 'lucide-react';
import katex from 'katex';
import 'katex/dist/katex.min.css';

function RenderMath({ math, className = '' }: { math: string; className?: string }) {
  try {
    const html = katex.renderToString(math, { displayMode: false, throwOnError: false });
    return <span className={className} dangerouslySetInnerHTML={{ __html: html }} />;
  } catch {
    return <span className={className}>{math}</span>;
  }
}

interface Point {
  x: number;
  y: number;
  label: 0 | 1;
}

export function RandomForestLab() {
  const [numTrees, setNumTrees] = useState<number>(15);
  const [maxFeaturesMode, setMaxFeaturesMode] = useState<'sqrt' | 'all'>('sqrt');
  const [noiseLevel, setNoiseLevel] = useState<number>(15);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // 生成两类 2D 圈状/月牙状数据点
  const [points, setPoints] = useState<Point[]>([]);

  useEffect(() => {
    const newPoints: Point[] = [];
    const n = 60;
    // 类别 0 (蓝色圆环/聚类)
    for (let i = 0; i < n / 2; i++) {
      const angle = (i / (n / 2)) * Math.PI * 2;
      const r = 0.35 + (Math.random() - 0.5) * 0.15;
      let x = 0.5 + r * Math.cos(angle);
      let y = 0.5 + r * Math.sin(angle);

      // 加入噪声点
      if (Math.random() < noiseLevel / 100) {
        x += (Math.random() - 0.5) * 0.3;
        y += (Math.random() - 0.5) * 0.3;
      }
      newPoints.push({ x: Math.max(0.05, Math.min(0.95, x)), y: Math.max(0.05, Math.min(0.95, y)), label: 0 });
    }
    // 类别 1 (红色内圈聚类)
    for (let i = 0; i < n / 2; i++) {
      const r = (Math.random() * 0.2);
      const angle = Math.random() * Math.PI * 2;
      let x = 0.5 + r * Math.cos(angle);
      let y = 0.5 + r * Math.sin(angle);

      if (Math.random() < noiseLevel / 100) {
        x += (Math.random() - 0.5) * 0.3;
        y += (Math.random() - 0.5) * 0.3;
      }
      newPoints.push({ x: Math.max(0.05, Math.min(0.95, x)), y: Math.max(0.05, Math.min(0.95, y)), label: 1 });
    }
    setPoints(newPoints);
  }, [noiseLevel]);

  // 绘制决策边界与数据点
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;

    // 清空画布
    ctx.clearRect(0, 0, width, height);

    // 伪随机生成 numTrees 棵树的决策边界加权叠加
    const gridSize = 40;
    const cellW = width / gridSize;
    const cellH = height / gridSize;

    for (let gx = 0; gx < gridSize; gx++) {
      for (let gy = 0; gy < gridSize; gy++) {
        const px = (gx + 0.5) / gridSize;
        const py = (gy + 0.5) / gridSize;

        // 计算该网格点到中心距离与多树决策概率
        const distToCenter = Math.sqrt((px - 0.5) ** 2 + (py - 0.5) ** 2);
        let votesForClass1 = 0;

        for (let t = 0; t < numTrees; t++) {
          // 单树加入随机偏移 (模拟双重随机性 Bootstrapping + Feature randomness)
          const offsetRadius = maxFeaturesMode === 'sqrt' ? (t % 5) * 0.02 - 0.04 : (t % 2) * 0.01 - 0.01;
          const noiseOffset = Math.sin(px * 10 + t) * 0.03 + Math.cos(py * 10 + t) * 0.03;
          const threshold = 0.28 + offsetRadius + noiseOffset;

          if (distToCenter < threshold) {
            votesForClass1++;
          }
        }

        const probClass1 = votesForClass1 / numTrees;

        // 设置网格填充背景色 (蓝/红渐变)
        if (probClass1 > 0.5) {
          const alpha = 0.15 + (probClass1 - 0.5) * 0.5;
          ctx.fillStyle = `rgba(239, 68, 68, ${alpha})`; // 红色
        } else {
          const alpha = 0.15 + (0.5 - probClass1) * 0.5;
          ctx.fillStyle = `rgba(13, 148, 136, ${alpha})`; // 青蓝色
        }

        ctx.fillRect(gx * cellW, gy * cellH, cellW + 0.5, cellH + 0.5);
      }
    }

    // 绘制数据点
    points.forEach((pt) => {
      ctx.beginPath();
      ctx.arc(pt.x * width, pt.y * height, 5, 0, Math.PI * 2);
      if (pt.label === 1) {
        ctx.fillStyle = '#EF4444';
        ctx.strokeStyle = '#FFFFFF';
      } else {
        ctx.fillStyle = '#0D9488';
        ctx.strokeStyle = '#FFFFFF';
      }
      ctx.lineWidth = 1.5;
      ctx.fill();
      ctx.stroke();
    });
  }, [points, numTrees, maxFeaturesMode]);

  // 计算估算指标
  const oobAccuracy = Math.min(98.5, 75 + Math.log2(numTrees + 1) * 4.5 + (maxFeaturesMode === 'sqrt' ? 3 : 0) - noiseLevel * 0.25).toFixed(1);
  const varianceValue = Math.max(0.05, 0.45 / Math.sqrt(numTrees) + (maxFeaturesMode === 'all' ? 0.15 : 0)).toFixed(2);

  return (
    <div className="my-8 rounded-2xl border border-teal-200 bg-white p-5 sm:p-7 shadow-sm select-none">
      {/* 标题栏 */}
      <div className="flex flex-col gap-4 border-b border-slate-100 pb-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-600 text-white shadow-xs">
              <Layers className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-lg sm:text-xl font-extrabold text-slate-800">随机森林 (Random Forest) 决策边界交互实验室</h3>
              <p className="text-xs sm:text-sm text-slate-500 font-medium pt-0.5">调节树的数量 $B$ 与随机特征数 $m$，观察方差降低与平滑平稳决策边界的演变过程</p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setNoiseLevel((prev) => (prev === 15 ? 25 : 15))}
            className="flex items-center gap-1.5 text-xs font-bold text-teal-800 bg-teal-50 hover:bg-teal-100 px-3 py-1.5 rounded-full border border-teal-200 transition-all cursor-pointer"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            切换数据分布
          </button>
        </div>
      </div>

      {/* 原理提示 */}
      <div className="mt-4 rounded-xl bg-teal-50/70 p-3.5 border border-teal-200/80 flex items-start gap-2.5">
        <HelpCircle className="h-4.5 w-4.5 text-teal-600 shrink-0 mt-0.5" />
        <div className="text-xs sm:text-sm text-slate-700 leading-relaxed">
          <span className="font-bold text-teal-900">核心原理：</span> 单棵决策树容易产生高方差的‘锯齿状’过拟合边界；而随机森林通过<strong>Bootstrap 重采样 + 随机特征选择 (m = √p)</strong> 训练多棵树，并以投票平滑掉单树过拟合噪声！
        </div>
      </div>

      {/* 双栏布局 */}
      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* 左侧：2D 画布决策边界 */}
        <div className="lg:col-span-6 flex flex-col justify-between space-y-3">
          <div className="flex items-center justify-between text-xs sm:text-sm font-bold text-slate-700">
            <span>2D 决策边界拟合图 (青色: 类别0 / 红色: 类别1)</span>
            <span className="text-slate-500 font-mono">树数量 B = {numTrees}</span>
          </div>

          <div className="relative rounded-xl border border-slate-200 bg-slate-900 p-2 flex justify-center items-center shadow-inner overflow-hidden">
            <canvas ref={canvasRef} width={360} height={300} className="rounded-lg w-full max-w-[360px] h-[300px] block" />

            <div className="absolute top-4 left-4 bg-slate-900/90 text-white text-[11px] px-2.5 py-1 rounded-md border border-slate-700 font-mono">
              {numTrees === 1 ? '⚠️ 单棵决策树 (高方差/过拟合)' : `🌲 ${numTrees} 棵树投票集成 (平滑高泛化)`}
            </div>
          </div>
        </div>

        {/* 右侧：交互控制参数与实时指标 */}
        <div className="lg:col-span-6 flex flex-col justify-between space-y-4">
          <div className="space-y-4">
            {/* 参数控制 1: 树的数量 B */}
            <div className="space-y-2 rounded-xl bg-slate-50 p-3.5 border border-slate-200">
              <div className="flex items-center justify-between text-xs sm:text-sm font-extrabold text-slate-800">
                <label htmlFor="num-trees-slider" className="flex items-center gap-1.5 cursor-pointer">
                  <Zap className="h-4 w-4 text-amber-500" />
                  集成树的数量 $B$ (Tree Count)
                </label>
                <span className="font-mono text-teal-700 text-sm">{numTrees} 棵</span>
              </div>
              <input
                id="num-trees-slider"
                type="range"
                min={1}
                max={50}
                value={numTrees}
                onChange={(e) => setNumTrees(Number(e.target.value))}
                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-teal-600"
              />
              <div className="flex justify-between text-[11px] text-slate-400 font-mono">
                <span>1 (单树/锯齿)</span>
                <span>25 (平滑)</span>
                <span>50 (极稳定)</span>
              </div>
            </div>

            {/* 参数控制 2: 随机特征选择模式 m */}
            <div className="space-y-2 rounded-xl bg-slate-50 p-3.5 border border-slate-200">
              <div className="flex items-center justify-between text-xs sm:text-sm font-extrabold text-slate-800">
                <label className="flex items-center gap-1.5">
                  <ShieldCheck className="h-4 w-4 text-teal-600" />
                  随机子特征挑选数 $m$ (Feature Subsets)
                </label>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setMaxFeaturesMode('sqrt')}
                  className={`py-2 px-3 rounded-lg text-xs font-extrabold border transition-all cursor-pointer ${
                    maxFeaturesMode === 'sqrt'
                      ? 'bg-teal-600 text-white border-teal-600 shadow-xs'
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  m = √p (标准随机森林)
                </button>

                <button
                  type="button"
                  onClick={() => setMaxFeaturesMode('all')}
                  className={`py-2 px-3 rounded-lg text-xs font-extrabold border transition-all cursor-pointer ${
                    maxFeaturesMode === 'all'
                      ? 'bg-amber-600 text-white border-amber-600 shadow-xs'
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  m = p (普通 Bagging)
                </button>
              </div>
            </div>

            {/* 实时性能评估指标 */}
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="rounded-xl bg-teal-50 p-3 border border-teal-200 flex flex-col justify-between">
                <span className="text-teal-900 font-bold text-[11px]">OOB 留包估计准确率</span>
                <span className="font-mono font-extrabold text-teal-700 text-base pt-1">{oobAccuracy}%</span>
              </div>

              <div className="rounded-xl bg-slate-50 p-3 border border-slate-200 flex flex-col justify-between">
                <span className="text-slate-600 font-bold text-[11px]">模型预测方差 (Variance)</span>
                <span className="font-mono font-bold text-amber-700 text-base pt-1">{varianceValue}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
