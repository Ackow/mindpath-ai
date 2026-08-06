'use client';

import React, { useState, useEffect } from 'react';
import { Play, RotateCcw, BarChart2 } from 'lucide-react';

type DistType = 'Exponential' | 'Uniform' | 'Bimodal';

export function CentralLimitTheoremLab() {
  const [distType, setDistType] = useState<DistType>('Exponential');
  const [sampleSize, setSampleSize] = useState<number>(5);
  const [means, setMeans] = useState<number[]>([]);
  const [isSampling, setIsSampling] = useState<boolean>(false);

  // 重置
  const handleReset = () => {
    setMeans([]);
    setIsSampling(false);
  };

  useEffect(() => {
    handleReset();
  }, [distType, sampleSize]);

  // 从总体分布中抽取单次样本并计算均值
  const drawSampleMean = (n: number, type: DistType): number => {
    let sum = 0;
    for (let i = 0; i < n; i++) {
      if (type === 'Exponential') {
        // 极度右偏指数分布 Exp(scale=2)
        sum += -2.0 * Math.log(1.0 - Math.random());
      } else if (type === 'Uniform') {
        // 均匀分布 [0, 4]
        sum += Math.random() * 4.0;
      } else if (type === 'Bimodal') {
        // 双峰分布 (50% N(0.8, 0.3) + 50% N(3.2, 0.3))
        if (Math.random() < 0.5) {
          sum += 0.8 + (Math.random() + Math.random() - 1) * 0.5;
        } else {
          sum += 3.2 + (Math.random() + Math.random() - 1) * 0.5;
        }
      }
    }
    return sum / n;
  };

  // 批量抽样
  const runBatchSampling = (count: number = 200) => {
    const newMeans: number[] = [];
    for (let i = 0; i < count; i++) {
      newMeans.push(drawSampleMean(sampleSize, distType));
    }
    setMeans((prev) => [...prev, ...newMeans].slice(-3000));
  };

  useEffect(() => {
    if (isSampling) {
      const timer = setInterval(() => {
        runBatchSampling(50);
      }, 50);
      return () => clearInterval(timer);
    }
  }, [isSampling, sampleSize, distType]);

  // 构建直方图 Bin 频数统计 (取 0 到 4 范围 30 个 Bins)
  const numBins = 30;
  const minX = 0;
  const maxX = 4;
  const binWidth = (maxX - minX) / numBins;
  const bins = new Array(numBins).fill(0);

  means.forEach((m) => {
    const idx = Math.floor((m - minX) / binWidth);
    if (idx >= 0 && idx < numBins) {
      bins[idx]++;
    }
  });

  const maxBinCount = Math.max(...bins, 1);

  // 计算样本均值的总体均值与标准差
  const overallMean = means.length > 0 ? means.reduce((a, b) => a + b, 0) / means.length : 0;
  const overallStd =
    means.length > 1
      ? Math.sqrt(means.reduce((a, b) => a + Math.pow(b - overallMean, 2), 0) / means.length)
      : 0;

  return (
    <div className="my-8 rounded-2xl border border-slate-700/60 bg-slate-900/90 p-6 shadow-2xl backdrop-blur-md">
      {/* 标题 */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div className="flex items-center gap-3">
          <div className="rounded-xl bg-gradient-to-tr from-purple-500 to-indigo-600 p-2.5 shadow-lg shadow-purple-500/20">
            <BarChart2 className="h-5 w-5 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">中心极限定理 (CLT) 动态收敛实验室</h3>
            <p className="text-xs text-slate-400">调整样本量 N，观察均值抽样分布如何从偏斜分布收敛为完美正态钟形曲线</p>
          </div>
        </div>

        {/* 播放控制 */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              if (!isSampling) runBatchSampling(500);
              setIsSampling(!isSampling);
            }}
            className={`flex items-center gap-1.5 rounded-lg px-4 py-2 text-xs font-semibold shadow-md transition-all ${
              isSampling
                ? 'bg-amber-500 text-slate-950 hover:bg-amber-400'
                : 'bg-purple-500 text-white hover:bg-purple-400 shadow-purple-500/20'
            }`}
          >
            <Play className="h-4 w-4 fill-current" />
            {isSampling ? '暂停连续抽样' : '连续抽样 (500次/秒)'}
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
      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
        {/* 总体分布类型 */}
        <div className="rounded-xl bg-slate-800/50 p-3 border border-slate-700/40">
          <label className="mb-1.5 block text-xs font-semibold text-slate-300">原始总体分布形态</label>
          <div className="grid grid-cols-3 gap-1.5">
            {[
              { id: 'Exponential', name: '偏斜 (指数)' },
              { id: 'Uniform', name: '平坦 (均匀)' },
              { id: 'Bimodal', name: '双峰 (混合)' },
            ].map((d) => (
              <button
                key={d.id}
                onClick={() => setDistType(d.id as DistType)}
                className={`rounded-lg py-1.5 text-xs font-medium transition-all ${
                  distType === d.id
                    ? 'bg-purple-500 text-white font-bold shadow'
                    : 'bg-slate-900/60 text-slate-400 hover:text-slate-200'
                }`}
              >
                {d.name}
              </button>
            ))}
          </div>
        </div>

        {/* 每次抽样样本量 N */}
        <div className="rounded-xl bg-slate-800/50 p-3 border border-slate-700/40">
          <div className="mb-1.5 flex justify-between text-xs font-semibold">
            <span className="text-slate-300">每次抽样的样本量 N</span>
            <span className="font-mono text-purple-400 font-bold">{sampleSize}</span>
          </div>
          <div className="flex gap-2">
            {[1, 2, 5, 15, 30, 100].map((n) => (
              <button
                key={n}
                onClick={() => setSampleSize(n)}
                className={`flex-1 rounded-lg py-1 text-xs font-mono font-bold transition-all ${
                  sampleSize === n
                    ? 'bg-indigo-500 text-white shadow'
                    : 'bg-slate-900/60 text-slate-400 hover:text-slate-200'
                }`}
              >
                {n}
              </button>
            ))}
          </div>
          <div className="mt-2 text-[10px] text-slate-500 flex justify-between">
            <span>N=1 (数据原始分布)</span>
            <span>N≥30 (满足大样本 CLT)</span>
          </div>
        </div>
      </div>

      {/* 直方图视口 */}
      <div className="relative grid grid-cols-1 gap-6 md:grid-cols-3">
        {/* 直方图 SVG (占 2 列) */}
        <div className="relative aspect-[16/9] w-full overflow-hidden rounded-xl border border-slate-700/60 bg-slate-950 p-4 md:col-span-2">
          <div className="h-full w-full flex items-end justify-between gap-1 pt-6 pb-4 px-2">
            {bins.map((count, i) => {
              const heightPct = (count / maxBinCount) * 100;
              return (
                <div key={i} className="group relative flex-1 h-full flex items-end">
                  <div
                    style={{ height: `${heightPct}%` }}
                    className="w-full rounded-t bg-gradient-to-t from-indigo-600 to-purple-400 transition-all duration-150 group-hover:brightness-125"
                  />
                </div>
              );
            })}
          </div>

          {/* 底部坐标标尺 */}
          <div className="absolute bottom-1 left-4 right-4 flex justify-between font-mono text-[10px] text-slate-500">
            <span>0.0</span>
            <span>1.0</span>
            <span>2.0 (均值)</span>
            <span>3.0</span>
            <span>4.0</span>
          </div>

          {/* 实时状态悬浮条 */}
          <div className="absolute top-3 left-3 rounded-lg bg-slate-900/80 px-3 py-1.5 text-[11px] font-mono text-slate-300 border border-slate-700/50 backdrop-blur-sm">
            已积累均值抽样数: <span className="text-purple-400 font-bold">{means.length}</span>
          </div>
        </div>

        {/* 右侧统计信息 (占 1 列) */}
        <div className="flex flex-col justify-between gap-4 rounded-xl border border-slate-700/60 bg-slate-950 p-4">
          <div>
            <h4 className="mb-3 text-xs font-bold text-slate-300 uppercase tracking-wider">均值抽样统计特征</h4>
            <div className="space-y-2 font-mono text-xs">
              <div className="flex justify-between rounded-lg bg-slate-900 p-2.5 border border-slate-800">
                <span className="text-slate-400">样本均值 x̄</span>
                <span className="text-purple-300 font-bold">{overallMean.toFixed(4)}</span>
              </div>
              <div className="flex justify-between rounded-lg bg-slate-900 p-2.5 border border-slate-800">
                <span className="text-slate-400">标准误 SE (标准差)</span>
                <span className="text-indigo-300 font-bold">{overallStd.toFixed(4)}</span>
              </div>
            </div>
          </div>

          {/* CLT 观察直觉 */}
          <div className="rounded-xl border border-purple-500/30 bg-purple-950/20 p-3 text-[11px] text-purple-200/90 leading-relaxed">
            💡 <strong className="text-purple-300">现象观察：</strong>
            <br />
            1. 当 <strong>N = 1</strong> 时，直方图反映的是极度倾斜的原始分布形态；
            <br />
            2. 随着 <strong>N 增大到 30</strong>，直方图瞬间重构为**完美的对称正态钟形**！且标准误 SE 随样本量 N 的增大而快速缩小！
          </div>
        </div>
      </div>
    </div>
  );
}
