'use client';

import React, { useState, useMemo } from 'react';
import { ArrowRight, ArrowLeft, Calculator, Compass } from 'lucide-react';
import katex from 'katex';
import 'katex/dist/katex.min.css';

// 渲染大行 KaTeX 数学公式
function MathDisplay({ math, sizeClass = 'text-xs sm:text-sm font-bold' }: { math: string; sizeClass?: string }) {
  const html = useMemo(() => {
    try {
      return katex.renderToString(math, { displayMode: true, throwOnError: false });
    } catch {
      return math;
    }
  }, [math]);

  return <div className={`overflow-x-auto text-center py-1 ${sizeClass}`} dangerouslySetInnerHTML={{ __html: html }} />;
}

// 自动把文本中的 $...$ 转化为 KaTeX 行内公式 DOM 节点
function RenderMathText({ text, className = '' }: { text: string; className?: string }) {
  const parts = useMemo(() => {
    if (!text) return null;

    const partsArr: (string | React.ReactNode)[] = [];
    let lastIdx = 0;
    const regex = /\$([^\$]+)\$/g;
    let match;

    while ((match = regex.exec(text)) !== null) {
      if (match.index > lastIdx) {
        partsArr.push(text.substring(lastIdx, match.index));
      }
      try {
        const html = katex.renderToString(match[1], { displayMode: false, throwOnError: false });
        partsArr.push(
          <span
            key={match.index}
            className="inline-block px-0.5"
            dangerouslySetInnerHTML={{ __html: html }}
          />
        );
      } catch {
        partsArr.push(match[1]);
      }
      lastIdx = regex.lastIndex;
    }

    if (lastIdx < text.length) {
      partsArr.push(text.substring(lastIdx));
    }

    return partsArr.length > 0 ? partsArr : text;
  }, [text]);

  return <span className={className}>{parts}</span>;
}

interface StepInfo {
  step: number;
  title: string;
  subtitle: string;
  mathEq: string;
  description: string;
  detailCards: { label: string; val: string }[];
}

const STEPS: StepInfo[] = [
  {
    step: 1,
    title: "1. 标注三点坐标并锁定支持向量",
    subtitle: "直观观察寻找距离边界最近的两类临界点",
    mathEq: "x_1=(1,1)^T (y_1=+1), \\quad x_2=(2,3)^T (y_2=+1), \\quad x_3=(2,0)^T (y_3=-1)",
    description: "在二维直角坐标系中画出三个样本。可以清晰看到 $x_1(1,1)$ 与 $x_3(2,0)$ 是距离最靠近彼此的两类边缘点（即支持向量 Support Vectors）；而 $x_2(2,3)$ 远离分界线，属于远端非支持向量样本，不影响决策超平面。",
    detailCards: [
      { label: "正类样本 x1", val: "$x_1=(1,1), y_1=+1$ [支持向量]" },
      { label: "正类样本 x2", val: "$x_2=(2,3), y_2=+1$ [远端非支持向量]" },
      { label: "负类样本 x3", val: "$x_3=(2,0), y_3=-1$ [支持向量]" },
    ]
  },
  {
    step: 2,
    title: "2. 根据支持向量列出临界方程组",
    subtitle: "支持向量必定精确落在 w^T x + b = ±1 边界线上",
    mathEq: "\\begin{cases} w_1(1) + w_2(1) + b = +1 \\quad \\text{(对应点 } x_1) \\\\ w_1(2) + w_2(0) + b = -1 \\quad \\text{(对应点 } x_3) \\end{cases}",
    description: "因为 $x_1$ 和 $x_3$ 是支持向量，根据 SVM 规范约束，它们必须刚好满足方程 $y_i(w^T x_i + b) = 1$。因此可以直接代入两点坐标，得到两个线性二元方程。",
    detailCards: [
      { label: "方程 (1)", val: "$w_1 + w_2 + b = 1$" },
      { label: "方程 (2)", val: "$2w_1 + b = -1$" },
    ]
  },
  {
    step: 3,
    title: "3. 求解权重 w 与偏置 b 的精确代数解",
    subtitle: "通过消元法求解二次规划的最佳切面参数",
    mathEq: "w_1 = 1, \\quad w_2 = 1, \\quad b = -1",
    description: "由方程 (2) 可得 $b = -1 - 2w_1$。代入方程 (1) 并结合远端样本 $x_2(2,3)$ 的约束条件 $2w_1 + 3w_2 + b \\ge 1$，解得 $w_1 = 1, w_2 = 1, b = -1$。",
    detailCards: [
      { label: "法向量 w", val: "$w = [1, 1]^T$" },
      { label: "偏置 b", val: "$b = -1$" },
      { label: "验证 x2 远端样本", val: "$1*2 + 1*3 - 1 = 4 \\ge 1$ [远端约束成立]" }
    ]
  },
  {
    step: 4,
    title: "4. 绘制分隔超平面与边界干道",
    subtitle: "分隔超平面中线为 x1 + x2 - 1 = 0",
    mathEq: "f(x_1, x_2) = x_1 + x_2 - 1 = 0",
    description: "将解出的 $w$ 和 $b$ 带回，得到超平面方程 $x_1 + x_2 - 1 = 0$。上边界线为 $x_1 + x_2 - 1 = +1 \\implies x_1 + x_2 = 2$；下边界线为 $x_1 + x_2 - 1 = -1 \\implies x_1 + x_2 = 0$。",
    detailCards: [
      { label: "分隔中线", val: "$x_1 + x_2 = 1$" },
      { label: "上边界线 (y=+1)", val: "$x_1 + x_2 = 2$" },
      { label: "下边界线 (y=-1)", val: "$x_1 + x_2 = 0$" }
    ]
  },
  {
    step: 5,
    title: "5. 计算最大几何间隔管道宽度 Margin",
    subtitle: "计算 Margin = 2 / ||w||",
    mathEq: "\\|w\\| = \\sqrt{1^2 + 1^2} = \\sqrt{2}, \\quad \\text{Margin} = \\frac{2}{\\sqrt{2}} = \\sqrt{2} \\approx 1.414",
    description: "法向量 $w = [1, 1]^T$ 的欧氏模长 $\|w\| = \\sqrt{1^2 + 1^2} = \\sqrt{2}$。因此支持向量管道的几何总宽度为 $\\frac{2}{\|w\|} = \\sqrt{2} \\approx 1.414$。",
    detailCards: [
      { label: "法向量模长 ||w||", val: "$\\sqrt{2} \\approx 1.414$" },
      { label: "几何间隔 Margin", val: "$\\frac{2}{\\sqrt{2}} = \\sqrt{2} \\approx 1.414$" },
      { label: "最终结论", val: "这是在保证两类完全不误判前提下的最宽中央安全隔离带" }
    ]
  }
];

export function SvmHandCalculationLab() {
  const [currentStep, setCurrentStep] = useState<number>(0);

  const stepData = STEPS[currentStep];

  const handleNext = () => {
    if (currentStep < STEPS.length - 1) setCurrentStep((prev) => prev + 1);
  };

  const handlePrev = () => {
    if (currentStep > 0) setCurrentStep((prev) => prev - 1);
  };

  return (
    <div className="my-8 rounded-2xl border border-teal-200/80 bg-white p-4 shadow-sm sm:p-6 select-none">
      {/* 顶部标题栏与进度步骤条 */}
      <div className="flex flex-col gap-4 border-b border-slate-100 pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-teal-600 text-white shadow-xs">
              <Calculator className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-slate-800">二维数据手算 SVM 支持向量全解推导演示</h3>
              <p className="text-xs text-slate-500">一步一步分步拆解手算几何超平面、支持向量与间隔宽度的全过程</p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 text-xs font-bold text-teal-800 bg-teal-50 px-3 py-1 rounded-full border border-teal-200">
            <span>步骤 {currentStep + 1} / 5</span>
          </div>
        </div>

        {/* 步骤条 */}
        <div className="grid grid-cols-5 gap-1.5 pt-1">
          {STEPS.map((s, idx) => (
            <button
              key={s.step}
              type="button"
              onClick={() => setCurrentStep(idx)}
              className={`h-2 rounded-full transition-all ${
                idx <= currentStep ? 'bg-teal-600' : 'bg-slate-200 hover:bg-slate-300'
              }`}
              title={s.title}
            />
          ))}
        </div>
      </div>

      {/* 主面板：双栏布局 (左侧 SVG 交互坐标系，右侧代数推导与分步详解) */}
      <div className="mt-5 grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* 左侧：二维直角坐标系动画 */}
        <div className="lg:col-span-6 flex flex-col justify-between space-y-3">
          <div className="relative aspect-square w-full overflow-hidden rounded-xl border border-slate-200/80 bg-slate-50/50 p-2">
            <svg viewBox="-0.5 -0.5 4.5 4.5" className="h-full w-full">
              {/* 背景网格线 */}
              <defs>
                <pattern id="coord-grid" width="0.5" height="0.5" patternUnits="userSpaceOnUse">
                  <path d="M 0.5 0 L 0 0 0 0.5" fill="none" stroke="#E2E8F0" strokeWidth="0.02" />
                </pattern>
              </defs>
              <rect x="-0.5" y="-0.5" width="5" height="5" fill="url(#coord-grid)" />

              {/* 坐标轴 X1 (水平) 与 X2 (垂直) */}
              <line x1="-0.5" y1="0" x2="4.2" y2="0" stroke="#94A3B8" strokeWidth="0.03" />
              <line x1="0" y1="-0.5" x2="0" y2="4.2" stroke="#94A3B8" strokeWidth="0.03" />

              {/* 步骤 4 及以后：绘制超平面与上/下间隔边界线 */}
              {currentStep >= 3 && (
                <>
                  {/* 分隔中线 x1 + x2 = 1 */}
                  <line x1="-0.2" y1="1.2" x2="1.2" y2="-0.2" stroke="#0F766E" strokeWidth="0.06" />

                  {/* 上边界线 x1 + x2 = 2 (y = +1) */}
                  <line x1="-0.2" y1="2.2" x2="2.2" y2="-0.2" stroke="#14B8A6" strokeWidth="0.03" strokeDasharray="0.1 0.08" />

                  {/* 下边界线 x1 + x2 = 0 (y = -1) */}
                  <line x1="-0.2" y1="0.2" x2="0.2" y2="-0.2" stroke="#14B8A6" strokeWidth="0.03" strokeDasharray="0.1 0.08" />

                  {/* 间隔阴影带 */}
                  <polygon points="-0.2,2.2 2.2,-0.2 0.2,-0.2 -0.2,0.2" fill="#14B8A6" fillOpacity="0.1" />
                </>
              )}

              {/* 步骤 5：高亮间隔宽度双箭头指示 */}
              {currentStep === 4 && (
                <g>
                  <line x1="0.5" y1="0.5" x2="1.0" y2="1.0" stroke="#F59E0B" strokeWidth="0.05" />
                  <circle cx="0.5" cy="0.5" r="0.08" fill="#F59E0B" />
                  <circle cx="1.0" cy="1.0" r="0.08" fill="#F59E0B" />
                  <text x="0.8" y="0.6" fontSize="0.25" fill="#D97706" fontWeight="bold">Margin = √2</text>
                </g>
              )}

              {/* 样本点 1: x1 = (1, 1), y1 = +1 (正类，支持向量) */}
              <g>
                {(currentStep === 0 || currentStep >= 1) && (
                  <circle cx="1" cy="1" r="0.22" fill="none" stroke="#F59E0B" strokeWidth="0.05" className="animate-pulse" />
                )}
                <circle cx="1" cy="1" r="0.14" fill="#0D9488" stroke="#FFFFFF" strokeWidth="0.03" />
                <text x="1.25" y="0.95" fontSize="0.22" fill="#0F766E" fontWeight="bold">x1 (1, 1)</text>
              </g>

              {/* 样本点 2: x2 = (2, 3), y2 = +1 (正类，非支持向量) */}
              <g>
                <circle cx="2" cy="3" r="0.14" fill="#0D9488" stroke="#FFFFFF" strokeWidth="0.03" opacity={currentStep >= 1 ? 0.4 : 1.0} />
                <text x="2.2" y="2.9" fontSize="0.22" fill="#64748B" fontWeight="bold">x2 (2, 3)</text>
              </g>

              {/* 样本点 3: x3 = (2, 0), y3 = -1 (负类，支持向量) */}
              <g>
                {(currentStep === 0 || currentStep >= 1) && (
                  <circle cx="2" cy="0" r="0.22" fill="none" stroke="#F59E0B" strokeWidth="0.05" className="animate-pulse" />
                )}
                <circle cx="2" cy="0" r="0.14" fill="#F97316" stroke="#FFFFFF" strokeWidth="0.03" />
                <text x="2.25" y="-0.05" fontSize="0.22" fill="#C2410C" fontWeight="bold">x3 (2, 0)</text>
              </g>
            </svg>
          </div>

          <div className="rounded-lg bg-amber-50 p-2.5 text-xs text-amber-900 border border-amber-200 flex items-center gap-2">
            <Compass className="h-4 w-4 text-amber-600 shrink-0" />
            <span>黄色光环节点 = 锁定为支持向量 (Support Vectors)</span>
          </div>
        </div>

        {/* 右侧：分步代数推导与详解卡片 */}
        <div className="lg:col-span-6 space-y-4 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-teal-600 text-xs font-bold text-white">
                {stepData.step}
              </span>
              <h4 className="text-sm font-bold text-slate-800">{stepData.title}</h4>
            </div>

            <p className="text-xs text-slate-500 font-medium">{stepData.subtitle}</p>

            {/* 数学核心公式 (使用 displayMode: true 的 KaTeX 渲染) */}
            <div className="rounded-xl bg-slate-900 p-3.5 text-teal-300 shadow-inner">
              <MathDisplay math={stepData.mathEq} />
            </div>

            {/* 文字通俗解释 (使用 RenderMathText 把 $...$ 自动渲染为 KaTeX) */}
            <div className="text-xs leading-relaxed text-slate-700">
              <RenderMathText text={stepData.description} />
            </div>

            {/* 细节数值拆解卡片 (使用 RenderMathText 自动转 KaTeX) */}
            <div className="space-y-1.5 pt-1">
              {stepData.detailCards.map((card, cIdx) => (
                <div key={cIdx} className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2 border border-slate-200/70 text-xs">
                  <span className="font-semibold text-slate-600">{card.label}:</span>
                  <RenderMathText text={card.val} className="font-mono font-bold text-teal-800" />
                </div>
              ))}
            </div>
          </div>

          {/* 下一步与上一步按钮 */}
          <div className="flex items-center justify-between border-t border-slate-100 pt-3">
            <button
              type="button"
              onClick={handlePrev}
              disabled={currentStep === 0}
              className={`flex items-center gap-1.5 rounded-lg border border-slate-200 px-3.5 py-1.5 text-xs font-bold transition-all ${
                currentStep === 0
                  ? 'opacity-40 cursor-not-allowed text-slate-400 bg-slate-50'
                  : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              上一步
            </button>

            <button
              type="button"
              onClick={handleNext}
              disabled={currentStep === STEPS.length - 1}
              className={`flex items-center gap-1.5 rounded-lg px-4 py-1.5 text-xs font-bold text-white shadow-xs transition-all ${
                currentStep === STEPS.length - 1
                  ? 'bg-teal-400 cursor-not-allowed opacity-60'
                  : 'bg-teal-600 hover:bg-teal-700 shadow-teal-600/20'
              }`}
            >
              下一步 (推导)
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
