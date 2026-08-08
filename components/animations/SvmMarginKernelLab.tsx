'use client';

import React, { useState, useMemo } from 'react';
import { Sliders, RotateCcw, ShieldCheck, Activity, Layers, Info } from 'lucide-react';
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

interface Point2D {
  id: number;
  x1: number;
  x2: number;
  y: 1 | -1;
}

// 模拟支持向量机两类数据集
const SVM_POINTS: Point2D[] = [
  // 正类 (y = +1, 蓝色/青色)
  { id: 1, x1: 1.5, x2: 4.5, y: 1 },
  { id: 2, x1: 2.2, x2: 4.8, y: 1 },
  { id: 3, x1: 3.0, x2: 5.2, y: 1 },
  { id: 4, x1: 2.8, x2: 3.8, y: 1 },
  { id: 5, x1: 4.0, x2: 4.6, y: 1 },
  { id: 6, x1: 2.0, x2: 3.2, y: 1 }, // 接近边界支持向量
  // 负类 (y = -1, 橙色)
  { id: 7, x1: 4.5, x2: 1.8, y: -1 },
  { id: 8, x1: 5.2, x2: 2.4, y: -1 },
  { id: 9, x1: 3.8, x2: 1.2, y: -1 },
  { id: 10, x1: 5.8, x2: 1.5, y: -1 },
  { id: 11, x1: 4.2, x2: 2.8, y: -1 },
  { id: 12, x1: 3.2, x2: 2.2, y: -1 }, // 接近边界支持向量
];

export function SvmMarginKernelLab() {
  const [kernelType, setKernelType] = useState<'linear' | 'rbf'>('linear');
  const [paramC, setParamC] = useState<number>(1.0);
  const [paramGamma, setParamGamma] = useState<number>(1.0);

  // 线性基础法向量与偏置
  const baseW1 = -0.8;
  const baseW2 = 0.9;
  const baseB = -0.2;
  const baseNorm = Math.sqrt(baseW1 * baseW1 + baseW2 * baseW2);

  // C 驱动的动态模长与间隔倍率 (小 C -> 宽 Margin; 大 C -> 窄 Margin)
  const marginScale = Math.sqrt(paramC);
  const effectiveNormW = baseNorm * marginScale;
  const marginWidth = (2 / effectiveNormW).toFixed(2);

  // 动态计算数据点得分、Hinge Loss 与支持向量标记
  const processedPoints = useMemo(() => {
    return SVM_POINTS.map((pt) => {
      let functionalMargin = 0;

      if (kernelType === 'linear') {
        const rawScore = baseW1 * pt.x1 + baseW2 * pt.x2 + baseB;
        functionalMargin = pt.y * rawScore * marginScale;
      } else {
        // RBF 高斯核简化打分公式
        const distToPos = Math.hypot(pt.x1 - 2.5, pt.x2 - 4.2);
        const distToNeg = Math.hypot(pt.x1 - 4.5, pt.x2 - 2.0);
        const rbfVal = Math.exp(-paramGamma * 0.15 * distToPos * distToPos) - Math.exp(-paramGamma * 0.15 * distToNeg * distToNeg);
        functionalMargin = pt.y * rbfVal * (1.8 * marginScale);
      }

      // Hinge Loss: max(0, 1 - y * f(x))
      const hingeLoss = Math.max(0, 1.0 - functionalMargin);
      // 支持向量定义：落在间隔内或穿过间隔的样本 (y * f(x) <= 1.05)
      const isSupportVector = functionalMargin <= 1.05;

      return {
        ...pt,
        functionalMargin,
        hingeLoss,
        isSupportVector,
      };
    });
  }, [kernelType, paramC, paramGamma, marginScale]);

  // 汇总统计项
  const stats = useMemo(() => {
    const svCount = processedPoints.filter((p) => p.isSupportVector).length;
    const totalHingeLoss = processedPoints.reduce((acc, p) => acc + p.hingeLoss, 0);
    const penaltyValue = paramC * totalHingeLoss;
    const normValue = 0.5 * effectiveNormW * effectiveNormW;
    const totalObjective = normValue + penaltyValue;

    return {
      svCount,
      totalHingeLoss: totalHingeLoss.toFixed(2),
      penaltyValue: penaltyValue.toFixed(2),
      normValue: normValue.toFixed(2),
      totalObjective: totalObjective.toFixed(2),
    };
  }, [processedPoints, paramC, effectiveNormW]);

  const handleReset = () => {
    setKernelType('linear');
    setParamC(1.0);
    setParamGamma(1.0);
  };

  // 动态 SVG 渲染几何坐标计算
  const linearMarginOffset = 30 / marginScale;
  const rbfMarginOffset = 32 / marginScale;
  const rbfAmp = 28 * Math.sqrt(paramGamma);

  return (
    <div className="my-8 rounded-2xl border border-teal-200/80 bg-white p-4 shadow-sm sm:p-6 select-none">
      {/* 顶部标题与模式切换 */}
      <div className="flex flex-col gap-3 border-b border-slate-100 pb-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-teal-600 text-white shadow-xs">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-base font-extrabold text-slate-800">SVM 间隔最大化与核技巧实验室</h3>
            <p className="text-xs text-slate-500">动态调节惩罚参数 C 与高斯核 gamma，观察支持向量与决策边界演变</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex rounded-xl bg-slate-100 p-1 text-xs font-bold">
            <button
              type="button"
              onClick={() => setKernelType('linear')}
              className={`rounded-lg px-3 py-1.5 transition-all ${
                kernelType === 'linear'
                  ? 'bg-white text-teal-800 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              线性核 (Linear)
            </button>
            <button
              type="button"
              onClick={() => setKernelType('rbf')}
              className={`rounded-lg px-3 py-1.5 transition-all ${
                kernelType === 'rbf'
                  ? 'bg-white text-teal-800 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              高斯核 (RBF)
            </button>
          </div>

          <button
            type="button"
            onClick={handleReset}
            title="重置实验室"
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 hover:text-slate-800 transition-colors"
          >
            <RotateCcw className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* 主控制面板与双栏布局 */}
      <div className="mt-5 grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* 左侧：动态 Canvas 决策边界可视化区 */}
        <div className="lg:col-span-7 flex flex-col justify-between space-y-4">
          <div className="relative aspect-[4/3] w-full overflow-hidden rounded-xl border border-slate-200/80 bg-slate-50/50 p-2">
            <svg viewBox="0 0 400 300" className="h-full w-full">
              {/* 背景网格 */}
              <defs>
                <pattern id="svm-grid" width="20" height="20" patternUnits="userSpaceOnUse">
                  <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#E2E8F0" strokeWidth="0.8" />
                </pattern>
              </defs>
              <rect width="400" height="300" fill="url(#svm-grid)" />

              {kernelType === 'linear' ? (
                <>
                  {/* 决策超平面中线 w^T x + b = 0 */}
                  <line x1="20" y1="280" x2="380" y2="40" stroke="#0F766E" strokeWidth="3" />

                  {/* 上间隔边界线 w^T x + b = +1 (受 C 驱动缩放) */}
                  <line
                    x1="20"
                    y1={280 - linearMarginOffset}
                    x2="380"
                    y2={40 - linearMarginOffset}
                    stroke="#14B8A6"
                    strokeWidth="1.5"
                    strokeDasharray="5 4"
                  />

                  {/* 下间隔边界线 w^T x + b = -1 */}
                  <line
                    x1="20"
                    y1={280 + linearMarginOffset}
                    x2="380"
                    y2={40 + linearMarginOffset}
                    stroke="#14B8A6"
                    strokeWidth="1.5"
                    strokeDasharray="5 4"
                  />

                  {/* 间隔带淡色遮罩 */}
                  <polygon
                    points={`20,${280 - linearMarginOffset} 380,${40 - linearMarginOffset} 380,${
                      40 + linearMarginOffset
                    } 20,${280 + linearMarginOffset}`}
                    fill="#14B8A6"
                    fillOpacity="0.08"
                  />
                </>
              ) : (
                <>
                  {/* RBF 高斯核非线性边界中线 f(x) = 0 (受 gamma 曲线幅度与 C 间隔缩放双重驱动) */}
                  <path
                    d={`M 40 150 Q 120 ${150 - rbfAmp} 200 150 T 360 150`}
                    fill="none"
                    stroke="#0F766E"
                    strokeWidth="3"
                  />

                  {/* RBF 上间隔轮廓线 f(x) = +1 (受 C 驱动收缩/扩宽) */}
                  <path
                    d={`M 40 ${150 - rbfMarginOffset} Q 120 ${150 - rbfAmp - rbfMarginOffset} 200 ${
                      150 - rbfMarginOffset
                    } T 360 ${150 - rbfMarginOffset}`}
                    fill="none"
                    stroke="#14B8A6"
                    strokeWidth="1.5"
                    strokeDasharray="4 4"
                  />

                  {/* RBF 下间隔轮廓线 f(x) = -1 (受 C 驱动收缩/扩宽) */}
                  <path
                    d={`M 40 ${150 + rbfMarginOffset} Q 120 ${150 - rbfAmp + rbfMarginOffset} 200 ${
                      150 + rbfMarginOffset
                    } T 360 ${150 + rbfMarginOffset}`}
                    fill="none"
                    stroke="#14B8A6"
                    strokeWidth="1.5"
                    strokeDasharray="4 4"
                  />
                </>
              )}

              {/* 绘制数据点与支持向量光圈 */}
              {processedPoints.map((pt) => {
                const cx = pt.x1 * 55 + 30;
                const cy = 300 - (pt.x2 * 45 + 30);
                const isPositive = pt.y === 1;

                return (
                  <g key={pt.id}>
                    {/* 若为支持向量，绘制高亮琥珀金外衬环 */}
                    {pt.isSupportVector && (
                      <circle
                        cx={cx}
                        cy={cy}
                        r="11"
                        fill="none"
                        stroke="#F59E0B"
                        strokeWidth="2.5"
                        className="animate-pulse"
                      />
                    )}
                    {/* 基础数据点 */}
                    <circle
                      cx={cx}
                      cy={cy}
                      r="6.5"
                      fill={isPositive ? '#0D9488' : '#F97316'}
                      stroke="#FFFFFF"
                      strokeWidth="2"
                    />
                  </g>
                );
              })}
            </svg>

            {/* 图像说明 */}
            <div className="absolute bottom-3 left-3 rounded-lg bg-white/90 px-2.5 py-1 text-[11px] font-semibold text-slate-600 shadow-2xs backdrop-blur-xs">
              黄色虚线光环点 = 支持向量 (Support Vector)
            </div>
          </div>

          {/* 交互滑块区 */}
          <div className="rounded-xl border border-slate-200/80 bg-slate-50 p-4 space-y-4">
            {/* C 参数滑块 (无论 Linear 还是 RBF 均 100% 实时响应联动！) */}
            <div>
              <div className="flex items-center justify-between text-xs font-bold text-slate-800">
                <span className="flex items-center gap-1.5">
                  <Sliders className="h-3.5 w-3.5 text-teal-600" />
                  惩罚参数 C (Penalty Parameter):
                </span>
                <span className="font-mono text-teal-700 bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
                  C = {paramC.toFixed(1)}
                </span>
              </div>
              <input
                type="range"
                min="0.1"
                max="10.0"
                step="0.1"
                value={paramC}
                onChange={(e) => setParamC(parseFloat(e.target.value))}
                className="mt-2 w-full accent-teal-600 cursor-pointer"
              />
              <div className="mt-1 flex justify-between text-[10px] text-slate-400 font-medium">
                <span>较小 C (抗噪容错大，间隔带变宽)</span>
                <span>较大 C (严惩错分，间隔带收紧)</span>
              </div>
            </div>

            {/* Gamma 参数滑块 (仅在 RBF 模式下展示) */}
            {kernelType === 'rbf' && (
              <div>
                <div className="flex items-center justify-between text-xs font-bold text-slate-800">
                  <span className="flex items-center gap-1.5">
                    <Layers className="h-3.5 w-3.5 text-teal-600" />
                    高斯核参数 gamma (<MathSpan math="\gamma" />):
                  </span>
                  <span className="font-mono text-teal-700 bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
                    gamma = {paramGamma.toFixed(1)}
                  </span>
                </div>
                <input
                  type="range"
                  min="0.1"
                  max="5.0"
                  step="0.1"
                  value={paramGamma}
                  onChange={(e) => setParamGamma(parseFloat(e.target.value))}
                  className="mt-2 w-full accent-teal-600 cursor-pointer"
                />
                <div className="mt-1 flex justify-between text-[10px] text-slate-400 font-medium">
                  <span>较小 gamma (平滑超平面)</span>
                  <span>较大 gamma (陡峭孤岛过拟合)</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 右侧：实时数学计算与指标拆解区 */}
        <div className="lg:col-span-5 space-y-4 flex flex-col justify-between">
          <div className="rounded-xl border border-slate-200/80 bg-slate-50/60 p-4 space-y-3.5">
            <h4 className="text-xs font-bold text-slate-800 flex items-center gap-1.5 border-b border-slate-200 pb-2">
              <Activity className="h-4 w-4 text-teal-600" />
              数值计算与目标函数拆解
            </h4>

            {/* 指标 1：支持向量数量 */}
            <div className="flex items-center justify-between rounded-lg bg-white p-2.5 border border-slate-100 text-xs">
              <span className="font-semibold text-slate-600">支持向量数量 (SV Count):</span>
              <span className="font-mono font-extrabold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">
                {stats.svCount} 个
              </span>
            </div>

            {/* 指标 2：几何间隔宽度 */}
            <div className="flex items-center justify-between rounded-lg bg-white p-2.5 border border-slate-100 text-xs">
              <span className="font-semibold text-slate-600">
                分隔管道宽度 (<MathSpan math="\frac{2}{\|w\|}" />):
              </span>
              <span className="font-mono font-extrabold text-teal-700 bg-teal-50 border border-teal-200 px-2 py-0.5 rounded-full">
                {marginWidth}
              </span>
            </div>

            {/* 指标 3：Hinge Loss 损失总和 */}
            <div className="flex items-center justify-between rounded-lg bg-white p-2.5 border border-slate-100 text-xs">
              <span className="font-semibold text-slate-600">
                铰链损失得分 (<MathSpan math="\sum \xi_i" />):
              </span>
              <span className="font-mono font-extrabold text-rose-700 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded-full">
                {stats.totalHingeLoss}
              </span>
            </div>

            {/* 指标 4：总优化目标得分 */}
            <div className="rounded-lg bg-teal-50/80 border border-teal-200 p-3 space-y-1 text-xs">
              <div className="flex items-center justify-between font-bold text-teal-900">
                <span>总优化目标值 Loss:</span>
                <span className="font-mono text-sm">{stats.totalObjective}</span>
              </div>
              <div className="text-[10px] text-teal-700 font-mono">
                Loss = 0.5||w||² ({stats.normValue}) + C*∑ξ ({stats.penaltyValue})
              </div>
            </div>
          </div>

          {/* 概念解释卡片 */}
          <div className="rounded-xl border border-amber-200/80 bg-amber-50/50 p-3.5 text-xs space-y-1.5">
            <div className="font-bold text-amber-900 flex items-center gap-1.5">
              <Info className="h-4 w-4 text-amber-600 shrink-0" />
              直觉导引：双参数联动联动机制
            </div>
            <p className="text-slate-600 leading-relaxed text-[11px]">
              滑动 <strong>C 参数</strong>：在高斯核模式下，拖动 C 会直接改变分隔管道的软收紧度（虚线间隔带随 C 增加而快速收紧，Hinge Loss 发生变化）；配合 <strong>gamma 参数</strong> 可直观观察模型在非线性分布下的偏差/方差权衡！
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
