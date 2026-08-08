'use client';

import React, { useState, useMemo } from 'react';
import { GitBranch, Sliders, RotateCcw, Activity, Info, CheckCircle2, AlertTriangle } from 'lucide-react';
import katex from 'katex';
import 'katex/dist/katex.min.css';

function RenderMath({ math, className = '' }: { math: string; className?: string }) {
  const html = useMemo(() => {
    try {
      return katex.renderToString(math, { displayMode: false, throwOnError: false });
    } catch {
      return math;
    }
  }, [math]);

  return <span className={className} dangerouslySetInnerHTML={{ __html: html }} />;
}

interface Point {
  id: number;
  income: number; // x1: 1 ~ 6 (年收入, 万)
  age: number;    // x2: 1 ~ 6 (年龄区间)
  label: 0 | 1;   // 0: 拒绝, 1: 批准
}

// 模拟 12 个打分客户点
const POINTS: Point[] = [
  { id: 1, income: 1.5, age: 1.8, label: 0 },
  { id: 2, income: 2.0, age: 3.2, label: 0 },
  { id: 3, income: 2.2, age: 4.8, label: 0 },
  { id: 4, income: 1.8, age: 5.5, label: 0 },
  { id: 5, income: 2.8, age: 4.2, label: 0 },
  { id: 6, income: 3.2, age: 1.5, label: 0 },
  { id: 7, income: 3.5, age: 2.5, label: 1 },
  { id: 8, income: 4.2, age: 4.0, label: 1 },
  { id: 9, income: 4.8, age: 2.0, label: 1 },
  { id: 10, income: 5.2, age: 5.2, label: 1 },
  { id: 11, income: 5.5, age: 1.8, label: 1 },
  { id: 12, income: 3.8, age: 5.0, label: 1 },
];

export function DecisionTreeLab() {
  const [maxDepth, setMaxDepth] = useState<number>(2);
  const [splitCriterion, setSplitCriterion] = useState<'gini' | 'entropy'>('gini');

  // 计算单个集合的不纯度 (Gini / Entropy)
  const calcImpurity = (p1: number, p0: number) => {
    const total = p1 + p0;
    if (total === 0) return 0;
    const ratio1 = p1 / total;
    const ratio0 = p0 / total;

    if (splitCriterion === 'gini') {
      return 1.0 - (ratio1 * ratio1 + ratio0 * ratio0);
    } else {
      if (ratio1 === 0 || ratio0 === 0) return 0;
      return -(ratio1 * Math.log2(ratio1) + ratio0 * Math.log2(ratio0));
    }
  };

  // 根据当前 maxDepth 动态计算数结构与分割统计
  const treeData = useMemo(() => {
    const totalCount = POINTS.length;
    const rootP1 = POINTS.filter((p) => p.label === 1).length;
    const rootP0 = POINTS.filter((p) => p.label === 0).length;
    const rootImpurity = calcImpurity(rootP1, rootP0);

    // 切分 1: 收入 x1 >= 3.0
    const left1 = POINTS.filter((p) => p.income < 3.0);   // 5 人: 0 批准, 5 拒绝 (纯度 100%)
    const right1 = POINTS.filter((p) => p.income >= 3.0); // 7 人: 6 批准, 1 拒绝

    const l1P1 = left1.filter((p) => p.label === 1).length;
    const l1P0 = left1.filter((p) => p.label === 0).length;
    const r1P1 = right1.filter((p) => p.label === 1).length;
    const r1P0 = right1.filter((p) => p.label === 0).length;

    const l1Impurity = calcImpurity(l1P1, l1P0);
    const r1Impurity = calcImpurity(r1P1, r1P0);
    const gain1 = rootImpurity - ((left1.length / totalCount) * l1Impurity + (right1.length / totalCount) * r1Impurity);

    // 切分 2 (Depth >= 2): 年龄 x2 >= 2.0 (在 right1 中切分)
    const right2Top = right1.filter((p) => p.age < 2.0);    // 2 人: 1 批准, 1 拒绝
    const right2Bottom = right1.filter((p) => p.age >= 2.0); // 5 人: 5 批准, 0 拒绝 (纯度 100%)

    const r2TopImpurity = calcImpurity(
      right2Top.filter((p) => p.label === 1).length,
      right2Top.filter((p) => p.label === 0).length
    );
    const r2BottomImpurity = calcImpurity(
      right2Bottom.filter((p) => p.label === 1).length,
      right2Bottom.filter((p) => p.label === 0).length
    );

    // 切分 3 (Depth >= 3): 收入 x1 >= 4.0 (在 right2Top 中进一步精细切分)
    const r3Leaf1 = right2Top.filter((p) => p.income < 4.0);  // 1 人: 拒绝
    const r3Leaf2 = right2Top.filter((p) => p.income >= 4.0); // 1 人: 批准

    // 计算当前树全局加权平均不纯度
    let weightedImpurity = 0;
    if (maxDepth === 1) {
      weightedImpurity = (left1.length / totalCount) * l1Impurity + (right1.length / totalCount) * r1Impurity;
    } else if (maxDepth === 2) {
      weightedImpurity =
        (left1.length / totalCount) * l1Impurity +
        (right2Top.length / totalCount) * r2TopImpurity +
        (right2Bottom.length / totalCount) * r2BottomImpurity;
    } else {
      weightedImpurity = 0; // 深度 >= 3 时所有叶子节点纯度达到 100% (不纯度 = 0)
    }

    return {
      rootImpurity: rootImpurity.toFixed(3),
      gain1: Math.max(0, gain1).toFixed(3),
      l1Impurity: l1Impurity.toFixed(3),
      r1Impurity: r1Impurity.toFixed(3),
      r2TopImpurity: r2TopImpurity.toFixed(3),
      r2BottomImpurity: r2BottomImpurity.toFixed(3),
      weightedImpurity: weightedImpurity.toFixed(3),
      left1Count: left1.length,
      right1Count: right1.length,
      r2TopCount: right2Top.length,
      r2BottomCount: right2Bottom.length,
      r3Leaf1Count: r3Leaf1.length,
      r3Leaf2Count: r3Leaf2.length,
    };
  }, [maxDepth, splitCriterion]);

  const handleReset = () => {
    setMaxDepth(2);
    setSplitCriterion('gini');
  };

  return (
    <div className="my-8 rounded-2xl border border-teal-200/80 bg-white p-4 shadow-sm sm:p-6 select-none">
      {/* 顶部控制栏 */}
      <div className="flex flex-col gap-3 border-b border-slate-100 pb-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-teal-600 text-white shadow-xs">
            <GitBranch className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-base font-extrabold text-slate-800">决策树正交特征空间切分实验室</h3>
            <p className="text-xs text-slate-500">拖动深度滑块，观察决策树如何通过轴对齐直线分割平面并降低不纯度</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex rounded-xl bg-slate-100 p-1 text-xs font-bold">
            <button
              type="button"
              onClick={() => setSplitCriterion('gini')}
              className={`rounded-lg px-3 py-1.5 transition-all ${
                splitCriterion === 'gini'
                  ? 'bg-white text-teal-800 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              基尼指数 (Gini)
            </button>
            <button
              type="button"
              onClick={() => setSplitCriterion('entropy')}
              className={`rounded-lg px-3 py-1.5 transition-all ${
                splitCriterion === 'entropy'
                  ? 'bg-white text-teal-800 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              信息熵 (Entropy)
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

      {/* 主面板：双栏布局 */}
      <div className="mt-5 grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* 左侧：二维特征平面切分 Canvas */}
        <div className="lg:col-span-6 flex flex-col justify-between space-y-4">
          <div className="relative aspect-square w-full overflow-hidden rounded-xl border border-slate-200/80 bg-slate-50/50 p-2">
            <svg viewBox="0 0 6 6" className="h-full w-full">
              {/* 网格线 */}
              <defs>
                <pattern id="dt-grid-svg" width="1" height="1" patternUnits="userSpaceOnUse">
                  <path d="M 1 0 L 0 0 0 1" fill="none" stroke="#E2E8F0" strokeWidth="0.03" />
                </pattern>
              </defs>
              <rect width="6" height="6" fill="url(#dt-grid-svg)" />

              {/* 切分 1 (Depth >= 1): 收入 x1 = 3.0 (第一条竖线) */}
              <rect x="0" y="0" width="3.0" height="6" fill="#F97316" fillOpacity="0.08" />
              <line x1="3.0" y1="0" x2="3.0" y2="6" stroke="#0F766E" strokeWidth="0.08" />
              <text x="0.2" y="0.4" fontSize="0.22" fill="#C2410C" fontWeight="bold">区域 A (拒绝)</text>

              {/* 切分 2 (Depth >= 2): 年龄 x2 = 2.0 (第二条横线) */}
              {maxDepth >= 2 && (
                <>
                  <rect x="3.0" y="0" width="3.0" height="4.0" fill="#0D9488" fillOpacity="0.12" />
                  <rect x="3.0" y="4.0" width="3.0" height="2.0" fill="#0D9488" fillOpacity="0.25" />
                  <line x1="3.0" y1="4.0" x2="6" y2="4.0" stroke="#0D9488" strokeWidth="0.06" strokeDasharray="0.1 0.08" />
                  <text x="3.2" y="5.7" fontSize="0.22" fill="#0F766E" fontWeight="bold">区域 B (批准)</text>
                </>
              )}

              {/* 切分 3 (Depth >= 3): 收入 x1 = 4.5 (第三条精细竖线) */}
              {maxDepth >= 3 && (
                <>
                  <rect x="3.0" y="0" width="1.5" height="4.0" fill="#F97316" fillOpacity="0.15" />
                  <rect x="4.5" y="0" width="1.5" height="4.0" fill="#0D9488" fillOpacity="0.2" />
                  <line x1="4.5" y1="0" x2="4.5" y2="4.0" stroke="#F59E0B" strokeWidth="0.06" strokeDasharray="0.08 0.06" />
                  <text x="3.1" y="0.4" fontSize="0.2" fill="#C2410C" fontWeight="bold">C1(拒绝)</text>
                  <text x="4.6" y="0.4" fontSize="0.2" fill="#0F766E" fontWeight="bold">C2(批准)</text>
                </>
              )}

              {/* 切分 4 (Depth >= 4): 过拟合微观切分线 */}
              {maxDepth >= 4 && (
                <line x1="0" y1="2.5" x2="3.0" y2="2.5" stroke="#EF4444" strokeWidth="0.05" strokeDasharray="0.05 0.05" />
              )}

              {/* 绘制 12 个数据点 */}
              {POINTS.map((pt) => {
                const isApproved = pt.label === 1;
                return (
                  <g key={pt.id}>
                    <circle
                      cx={pt.income}
                      cy={6 - pt.age}
                      r="0.22"
                      fill={isApproved ? '#0D9488' : '#F97316'}
                      stroke="#FFFFFF"
                      strokeWidth="0.05"
                    />
                  </g>
                );
              })}
            </svg>

            {/* 图例说明 */}
            <div className="absolute bottom-3 left-3 rounded-lg bg-white/90 px-2.5 py-1 text-[11px] font-semibold text-slate-600 shadow-2xs backdrop-blur-xs">
              青色点 = 批准贷款 ($y=1$), 橙色点 = 拒绝贷款 ($y=0$)
            </div>
          </div>

          {/* 交互滑块控制区 */}
          <div className="rounded-xl border border-slate-200/80 bg-slate-50 p-4 space-y-3">
            <div className="flex items-center justify-between text-xs font-bold text-slate-800">
              <span className="flex items-center gap-1.5">
                <Sliders className="h-3.5 w-3.5 text-teal-600" />
                树的最大深度 (Max Depth):
              </span>
              <span className="font-mono text-teal-700 bg-teal-50 px-2.5 py-0.5 rounded border border-teal-200">
                Depth = {maxDepth}
              </span>
            </div>
            <input
              type="range"
              min="1"
              max="4"
              step="1"
              value={maxDepth}
              onChange={(e) => setMaxDepth(parseInt(e.target.value, 10))}
              className="w-full accent-teal-600 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-500 font-medium">
              <span className={maxDepth === 1 ? 'font-bold text-teal-700' : ''}>Depth=1 (树桩/欠拟合)</span>
              <span className={maxDepth === 2 ? 'font-bold text-teal-700' : ''}>Depth=2 (适度切分)</span>
              <span className={maxDepth === 3 ? 'font-bold text-teal-700' : ''}>Depth=3 (完全纯净)</span>
              <span className={maxDepth === 4 ? 'font-bold text-rose-600' : ''}>Depth=4 (过度切分/过拟合)</span>
            </div>
          </div>
        </div>

        {/* 右侧：树拓扑结构与实时计算面板 */}
        <div className="lg:col-span-6 space-y-4 flex flex-col justify-between">
          <div className="rounded-xl border border-slate-200/80 bg-slate-50/60 p-4 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-200 pb-2">
              <h4 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <Activity className="h-4 w-4 text-teal-600" />
                决策树不纯度 (Impurity) 动态度量
              </h4>
              <span className="text-[11px] font-mono font-bold text-teal-700 bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
                {splitCriterion === 'gini' ? 'Gini Index' : 'Entropy'}
              </span>
            </div>

            {/* 核心度量卡片 1：根节点与加权平均不纯度 */}
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="rounded-lg bg-white p-2.5 border border-slate-200 space-y-0.5">
                <div className="text-[11px] text-slate-500 font-medium">根节点初始不纯度:</div>
                <div className="font-mono font-extrabold text-amber-700 text-sm">
                  {treeData.rootImpurity}
                </div>
              </div>
              <div className="rounded-lg bg-white p-2.5 border border-slate-200 space-y-0.5">
                <div className="text-[11px] text-slate-500 font-medium">树全局平均不纯度:</div>
                <div className={`font-mono font-extrabold text-sm ${maxDepth >= 3 ? 'text-teal-600' : 'text-slate-800'}`}>
                  {treeData.weightedImpurity} {maxDepth >= 3 && '(纯度 100%)'}
                </div>
              </div>
            </div>

            {/* 决策树分级拓扑节点展示 */}
            <div className="space-y-2 pt-1">
              <div className="text-[11px] font-bold text-slate-700">当前树的划分层级拓扑:</div>

              {/* 层级 1: 根节点切分 */}
              <div className="rounded-lg bg-white p-2.5 border border-slate-200 space-y-1 text-xs">
                <div className="flex items-center justify-between font-bold text-slate-800">
                  <span>[层级 1] 收入 x1 &ge; 3.0?</span>
                  <span className="text-teal-700 font-mono text-[11px]">增益: +{treeData.gain1}</span>
                </div>
                <div className="flex justify-between text-[11px] text-slate-500 pt-0.5">
                  <span className="text-orange-700 font-medium">左叶(收入&lt;3.0): {treeData.left1Count}点 [不纯度 {treeData.l1Impurity}]</span>
                  <span className="text-teal-700 font-medium">右分支(收入&ge;3.0): {treeData.right1Count}点 [不纯度 {treeData.r1Impurity}]</span>
                </div>
              </div>

              {/* 层级 2 (Depth >= 2) */}
              {maxDepth >= 2 && (
                <div className="rounded-lg bg-teal-50/80 border border-teal-200 p-2.5 space-y-1 text-xs">
                  <div className="flex items-center justify-between font-bold text-teal-900">
                    <span>[层级 2] 年龄 x2 &ge; 2.0?</span>
                    <span className="text-teal-700 font-mono text-[11px]">进一步划分</span>
                  </div>
                  <div className="flex justify-between text-[11px] text-teal-800 pt-0.5">
                    <span>上节点: {treeData.r2TopCount}点 [不纯度 {treeData.r2TopImpurity}]</span>
                    <span className="font-bold text-teal-700">下叶(纯洁): {treeData.r2BottomCount}点 [不纯度 0.000]</span>
                  </div>
                </div>
              )}

              {/* 层级 3 (Depth >= 3) */}
              {maxDepth >= 3 && (
                <div className="rounded-lg bg-amber-50/80 border border-amber-200 p-2.5 text-xs flex items-center justify-between text-amber-900 font-semibold">
                  <span className="flex items-center gap-1">
                    <CheckCircle2 className="h-3.5 w-3.5 text-teal-600" />
                    [层级 3] 收入 x1 &ge; 4.5 精细细分完成
                  </span>
                  <span className="font-mono text-teal-700 font-bold">所有叶子节点不纯度 = 0.000</span>
                </div>
              )}

              {/* 层级 4 (Depth >= 4): 过拟合警告 */}
              {maxDepth >= 4 && (
                <div className="rounded-lg bg-rose-50 border border-rose-200 p-2.5 text-xs flex items-center gap-1.5 text-rose-900 font-bold">
                  <AlertTriangle className="h-4 w-4 text-rose-600 shrink-0" />
                  <span>过拟合警告: 树深度过大 (Depth=4)，切分过于死板，极易陷入噪音过拟合！</span>
                </div>
              )}
            </div>
          </div>

          {/* 直觉解析说明 */}
          <div className="rounded-xl border border-teal-200/80 bg-teal-50/50 p-3.5 text-xs space-y-1">
            <div className="font-bold text-teal-900 flex items-center gap-1.5">
              <Info className="h-4 w-4 text-teal-600 shrink-0" />
              决策树切分总结
            </div>
            <p className="text-slate-600 leading-relaxed text-[11px]">
              随着 Depth 增加，决策树不断在平面上画出轴对齐的分界线。Depth=3 时全局不纯度降至 0；增加到 Depth=4 则会引发**过拟合**。
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
