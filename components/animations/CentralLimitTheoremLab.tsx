'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Play, RotateCcw, BarChart2, CheckCircle2 } from 'lucide-react';
import katex from 'katex';
import 'katex/dist/katex.min.css';

function MathSpan({ math, sizeClass = 'text-xs sm:text-sm font-bold' }: { math: string; sizeClass?: string }) {
  const html = useMemo(() => {
    try {
      return katex.renderToString(math, { displayMode: false, throwOnError: false });
    } catch {
      return math;
    }
  }, [math]);

  return <span className={`inline-inline ${sizeClass}`} dangerouslySetInnerHTML={{ __html: html }} />;
}

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
    <div className="my-7 rounded-2xl border border-slate-200 bg-white p-5 space-y-5 shadow-card font-sans">
      {/* 标题栏 - 与项目通用 Light Theme 保持一致 */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-teal-50 text-teal-700 border border-teal-200">
            <BarChart2 className="w-4 h-4" />
            中心极限定理 (CLT) 实验室
          </span>
          <h4 className="text-base sm:text-lg font-bold text-slate-800">总体分布到样本均值正态收敛演练</h4>
        </div>

        {/* 播放控制 */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              if (!isSampling) runBatchSampling(500);
              setIsSampling(!isSampling);
            }}
            className={`flex items-center gap-1.5 rounded-lg px-4 py-1.5 text-xs sm:text-sm font-bold shadow-sm transition-all cursor-pointer ${
              isSampling
                ? 'bg-amber-500 text-white hover:bg-amber-600'
                : 'bg-teal-600 text-white hover:bg-teal-700 shadow-teal-600/20'
            }`}
          >
            <Play className="h-3.5 w-3.5 fill-current" />
            {isSampling ? '暂停连续抽样' : '连续抽样 (500次/秒)'}
          </button>

          <button
            onClick={handleReset}
            className="flex items-center gap-1 text-slate-600 hover:text-slate-900 text-xs sm:text-sm font-semibold px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 border border-slate-200 transition-colors cursor-pointer"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            重置
          </button>
        </div>
      </div>

      {/* 控制参数区 */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {/* 总体分布类型 */}
        <div className="rounded-xl bg-slate-50 p-3.5 border border-slate-200 space-y-2">
          <label className="block text-xs sm:text-sm font-bold text-slate-800">原始总体分布形态</label>
          <div className="grid grid-cols-3 gap-1.5">
            {[
              { id: 'Exponential', name: '偏斜 (指数)' },
              { id: 'Uniform', name: '平坦 (均匀)' },
              { id: 'Bimodal', name: '双峰 (混合)' },
            ].map((d) => (
              <button
                key={d.id}
                onClick={() => setDistType(d.id as DistType)}
                className={`rounded-lg py-1.5 text-xs font-bold transition-all cursor-pointer ${
                  distType === d.id
                    ? 'bg-teal-600 text-white shadow-sm'
                    : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
                }`}
              >
                {d.name}
              </button>
            ))}
          </div>
        </div>

        {/* 每次抽样样本量 N */}
        <div className="rounded-xl bg-slate-50 p-3.5 border border-slate-200 space-y-2">
          <div className="flex justify-between text-xs sm:text-sm font-bold">
            <span className="text-slate-800">每次抽样的样本量 <MathSpan math="N" sizeClass="text-sm font-bold text-teal-800" /></span>
            <span className="font-mono text-teal-700 font-bold">{sampleSize}</span>
          </div>
          <div className="flex gap-1.5">
            {[1, 2, 5, 15, 30, 100].map((n) => (
              <button
                key={n}
                onClick={() => setSampleSize(n)}
                className={`flex-1 rounded-lg py-1 text-xs font-mono font-bold transition-all cursor-pointer ${
                  sampleSize === n
                    ? 'bg-teal-600 text-white shadow-sm'
                    : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
                }`}
              >
                {n}
              </button>
            ))}
          </div>
          <div className="text-[11px] text-slate-500 font-semibold flex justify-between pt-0.5">
            <span>N=1 (原始数据形态)</span>
            <span>N≥30 (满足大样本 CLT)</span>
          </div>
        </div>
      </div>

      {/* 视觉直方图与数据监测 */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {/* 直方图 SVG 视图 (占 2 列) */}
        <div className="relative aspect-[16/9] w-full overflow-hidden rounded-xl border border-slate-200 bg-slate-50 p-4 md:col-span-2 shadow-sm">
          <div className="h-full w-full flex items-end justify-between gap-1 pt-7 pb-5 px-2">
            {bins.map((count, i) => {
              const heightPct = (count / maxBinCount) * 100;
              return (
                <div key={i} className="group relative flex-1 h-full flex items-end">
                  <div
                    style={{ height: `${heightPct}%` }}
                    className="w-full rounded-t bg-gradient-to-t from-teal-600 to-sky-500 transition-all duration-150 group-hover:brightness-110"
                  />
                </div>
              );
            })}
          </div>

          {/* 底部坐标标尺 */}
          <div className="absolute bottom-1.5 left-4 right-4 flex justify-between font-mono text-xs text-slate-600 font-bold">
            <span>0.0</span>
            <span>1.0</span>
            <span>2.0 (均值)</span>
            <span>3.0</span>
            <span>4.0</span>
          </div>

          {/* 实时状态悬浮条 */}
          <div className="absolute top-3 left-3 rounded-lg bg-white/90 px-3 py-1 text-xs font-mono text-slate-700 border border-slate-200 shadow-sm backdrop-blur-sm">
            积累均值抽样数: <span className="text-teal-700 font-bold">{means.length}</span>
          </div>
        </div>

        {/* 右侧统计特征面板 (占 1 列) */}
        <div className="flex flex-col justify-between gap-4 rounded-xl border border-slate-200 bg-slate-50 p-4 font-sans">
          <div>
            <h4 className="mb-3 text-xs font-bold text-slate-800 uppercase tracking-wider">均值抽样统计特征</h4>
            <div className="space-y-2.5 font-mono text-xs sm:text-sm">
              <div className="flex justify-between items-center rounded-lg bg-white p-2.5 border border-slate-200 shadow-sm">
                <span className="text-slate-600 font-semibold">样本均值 <MathSpan math="\bar{x}" sizeClass="text-sm font-bold" /></span>
                <span className="text-teal-700 font-bold">{overallMean.toFixed(4)}</span>
              </div>
              <div className="flex justify-between items-center rounded-lg bg-white p-2.5 border border-slate-200 shadow-sm">
                <span className="text-slate-600 font-semibold">标准误 <MathSpan math="SE" sizeClass="text-sm font-bold" /></span>
                <span className="text-sky-700 font-bold">{overallStd.toFixed(4)}</span>
              </div>
            </div>
          </div>

          {/* CLT 观察直觉 */}
          <div className="rounded-xl border border-teal-200 bg-teal-50/80 p-3 text-xs text-teal-950 leading-relaxed font-semibold">
            <div className="font-bold flex items-center gap-1 mb-1 text-teal-900">
              <CheckCircle2 className="w-4 h-4 text-teal-600" />
              CLT 现象观察要点：
            </div>
            1. 当 <MathSpan math="N = 1" sizeClass="text-xs font-bold" /> 时，直方图反映的是倾斜的原始总体分布形态；
            <br />
            2. 随着 <MathSpan math="N" sizeClass="text-xs font-bold" /> 增大至 <strong>30</strong>，直方图瞬间自动重构为**完美的对称正态钟形**！且标准误 <MathSpan math="SE" sizeClass="text-xs font-bold" /> 显著缩小！
          </div>
        </div>
      </div>
    </div>
  );
}
