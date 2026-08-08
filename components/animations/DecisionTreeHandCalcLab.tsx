'use client';

import React, { useState } from 'react';
import { ArrowRight, ArrowLeft, Calculator, HelpCircle, Trophy, CheckCircle2 } from 'lucide-react';
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

function RenderMixedText({ text, className = '' }: { text: string; className?: string }) {
  const parts = text.split(/(\$[^\$]+\$)/g);
  return (
    <span className={className}>
      {parts.map((part, idx) => {
        if (part.startsWith('$') && part.endsWith('$')) {
          const formula = part.slice(1, -1);
          return <RenderMath key={idx} math={formula} />;
        }
        return <span key={idx}>{part}</span>;
      })}
    </span>
  );
}

interface MathStep {
  label: string;
  formula: string;
}

interface StepInfo {
  step: number;
  title: string;
  subtitle: string;
  splitFeature: string;
  mathSteps: MathStep[];
  description: string;
  groups: { name: string; items: { id: number; name: string; income: string; credit: string; age: string; label: 0 | 1 }[] }[];
  metrics: { giniBefore: string; giniAfter: string; giniGain: string };
}

const HAND_STEPS: StepInfo[] = [
  {
    step: 1,
    title: "根节点初始状态 (未切分)",
    subtitle: "测量 10 位客户样本的初始混合混乱程度",
    splitFeature: "未切分 (原始数据集 $D$)",
    mathSteps: [
      { label: "1. 统计各类占比", formula: "p_1 = 0.3, \\quad p_0 = 0.7" },
      { label: "2. 初始基尼指数", formula: "\\text{Gini}(D) = 1 - (0.3^2 + 0.7^2) = 0.4200" },
      { label: "3. 初始信息熵", formula: "H(D) = -(0.3 \\log_2 0.3 + 0.7 \\log_2 0.7) = 0.8813" }
    ],
    description: "10 位客户混杂在一起（3 批准，7 拒绝）。初始基尼指数 0.4200 表明混乱度较高，算法将遍历候选特征尝试切分。",
    groups: [
      {
        name: "全量根节点样本 (10 人: 3 批准 7 拒绝)",
        items: [
          { id: 1, name: "客户 1", income: "高", credit: "不良", age: "青年", label: 0 },
          { id: 2, name: "客户 2", income: "高", credit: "不良", age: "青年", label: 0 },
          { id: 3, name: "客户 3", income: "低", credit: "不良", age: "中年", label: 0 },
          { id: 4, name: "客户 4", income: "低", credit: "不良", age: "中年", label: 0 },
          { id: 5, name: "客户 5", income: "高", credit: "良好", age: "青年", label: 0 },
          { id: 6, name: "客户 6", income: "高", credit: "良好", age: "中年", label: 1 },
          { id: 7, name: "客户 7", income: "中", credit: "良好", age: "青年", label: 0 },
          { id: 8, name: "客户 8", income: "中", credit: "良好", age: "中年", label: 1 },
          { id: 9, name: "客户 9", income: "低", credit: "良好", age: "青年", label: 0 },
          { id: 10, name: "客户 10", income: "低", credit: "良好", age: "中年", label: 1 },
        ]
      }
    ],
    metrics: { giniBefore: "0.4200", giniAfter: "0.4200", giniGain: "0.0000" }
  },
  {
    step: 2,
    title: "第 1 层切分：按“信用记录”切分",
    subtitle: "左分支已纯净为叶节点，右分支仍混乱需二次切分",
    splitFeature: "第 1 层切分: 信用记录 ($x_2$)",
    mathSteps: [
      { label: "1. 信用不良(4人)", formula: "\\text{Gini}_{\\text{不良}} = 1 - (0^2 + 1^2) = 0.0000" },
      { label: "2. 信用良好(6人)", formula: "\\text{Gini}_{\\text{良好}} = 1 - (0.5^2 + 0.5^2) = 0.5000" },
      { label: "3. 加权基尼指数", formula: "\\text{Gini}_{\\text{split}} = 0.4(0) + 0.6(0.5) = 0.3000" },
      { label: "4. 基尼下降幅度", formula: "\\Delta\\text{Gini} = 0.4200 - 0.3000 = 0.1200" }
    ],
    description: "左分支 4 人全部拒绝（Gini=0，成为纯净叶节点 A）；右分支 6 人 3 批准 3 拒绝（Gini=0.5，仍混乱），需继续递归切分！",
    groups: [
      {
        name: "左分支: 信用记录 = 不良 (4人, 纯度100% 叶节点A)",
        items: [
          { id: 1, name: "客户 1", income: "高", credit: "不良", age: "青年", label: 0 },
          { id: 2, name: "客户 2", income: "高", credit: "不良", age: "青年", label: 0 },
          { id: 3, name: "客户 3", income: "低", credit: "不良", age: "中年", label: 0 },
          { id: 4, name: "客户 4", income: "低", credit: "不良", age: "中年", label: 0 },
        ]
      },
      {
        name: "右分支: 信用记录 = 良好 (6人: 3批准 3拒绝 待二次切分)",
        items: [
          { id: 5, name: "客户 5", income: "高", credit: "良好", age: "青年", label: 0 },
          { id: 6, name: "客户 6", income: "高", credit: "良好", age: "中年", label: 1 },
          { id: 7, name: "客户 7", income: "中", credit: "良好", age: "青年", label: 0 },
          { id: 8, name: "客户 8", income: "中", credit: "良好", age: "中年", label: 1 },
          { id: 9, name: "客户 9", income: "低", credit: "良好", age: "青年", label: 0 },
          { id: 10, name: "客户 10", income: "低", credit: "良好", age: "中年", label: 1 },
        ]
      }
    ],
    metrics: { giniBefore: "0.4200", giniAfter: "0.3000", giniGain: "0.1200 (选为根节点)" }
  },
  {
    step: 3,
    title: "第 2 层右节点竞标：年收入 vs 年龄",
    subtitle: "在“信用良好”6 人子集中对比剩余特征的切分降幅",
    splitFeature: "第 2 层竞标: 比较剩余特征 ($x_1$ vs $x_3$)",
    mathSteps: [
      { label: "1. 候选 A (年收入)", formula: "\\text{Gini}_{\\text{split}} = 0.5000 \\implies \\Delta\\text{Gini} = 0.0000" },
      { label: "2. 候选 B (年龄)", formula: "\\text{Gini}_{\\text{split}} = 0.0000 \\implies \\Delta\\text{Gini} = 0.5000" },
      { label: "3. 竞标结论", formula: "\\Delta\\text{Gini}(\\text{年龄}) = 0.5000 \\gg 0 \\implies \\text{选年龄}" }
    ],
    description: "在右节点 6 人中：按‘年收入’切分各组仍是 1 批准 1 拒绝（降幅为 0）；按‘年龄’切分能完美分为‘青年’(全拒绝) 与 ‘中年’(全批准)，年龄大胜！",
    groups: [
      {
        name: "竞标候选: 按年龄(x3)切分 (完美分割 6 人)",
        items: [
          { id: 5, name: "客户 5", income: "高", credit: "良好", age: "青年", label: 0 },
          { id: 7, name: "客户 7", income: "中", credit: "良好", age: "青年", label: 0 },
          { id: 9, name: "客户 9", income: "低", credit: "良好", age: "青年", label: 0 },
          { id: 6, name: "客户 6", income: "高", credit: "良好", age: "中年", label: 1 },
          { id: 8, name: "客户 8", income: "中", credit: "良好", age: "中年", label: 1 },
          { id: 10, name: "客户 10", income: "低", credit: "良好", age: "中年", label: 1 },
        ]
      }
    ],
    metrics: { giniBefore: "0.5000", giniAfter: "0.0000", giniGain: "0.5000 (年龄胜出)" }
  },
  {
    step: 4,
    title: "第 2 层二次切分：按“年龄”展开细分",
    subtitle: "右子树分裂为青年与中年两个纯净叶节点",
    splitFeature: "第 2 层切分: 年龄 ($x_3$)",
    mathSteps: [
      { label: "1. 青年分支(3人)", formula: "\\text{Gini}_{\\text{青年}} = 1 - (0^2 + 1^2) = 0.0000 \\quad (\\text{叶节点B})" },
      { label: "2. 中年分支(3人)", formula: "\\text{Gini}_{\\text{中年}} = 1 - (1^2 + 0^2) = 0.0000 \\quad (\\text{叶节点C})" },
      { label: "3. 加权基尼指数", formula: "\\text{Gini}_{\\text{split}} = 0.5(0) + 0.5(0) = 0.0000" },
      { label: "4. 基尼下降幅度", formula: "\\Delta\\text{Gini} = 0.5000 - 0.0000 = 0.5000" }
    ],
    description: "二次切分后：青年组 3 人全部拒绝（叶节点 B），中年组 3 人全部批准（叶节点 C）。整棵决策树所有叶节点 Gini 均为 0，完美生长完成！",
    groups: [
      {
        name: "分支 1: 信用良好 + 青年 (3人: 纯度100% 叶节点B)",
        items: [
          { id: 5, name: "客户 5", income: "高", credit: "良好", age: "青年", label: 0 },
          { id: 7, name: "客户 7", income: "中", credit: "良好", age: "青年", label: 0 },
          { id: 9, name: "客户 9", income: "低", credit: "良好", age: "青年", label: 0 },
        ]
      },
      {
        name: "分支 2: 信用良好 + 中年 (3人: 纯度100% 叶节点C)",
        items: [
          { id: 6, name: "客户 6", income: "高", credit: "良好", age: "中年", label: 1 },
          { id: 8, name: "客户 8", income: "中", credit: "良好", age: "中年", label: 1 },
          { id: 10, name: "客户 10", income: "低", credit: "良好", age: "中年", label: 1 },
        ]
      }
    ],
    metrics: { giniBefore: "0.5000", giniAfter: "0.0000", giniGain: "0.5000 (全树纯净)" }
  },
  {
    step: 5,
    title: "决胜时刻：生成 2 层完整决策树",
    subtitle: "包含 1 根节点、1 二级节点、3 叶节点的完整决策树",
    splitFeature: "最终建树: 2 层 3 叶完整决策树",
    mathSteps: [
      { label: "1. 决策树深度", formula: "\\text{Depth} = 2 \\text{ 层}" },
      { label: "2. 纯净叶节点数", formula: "\\text{Leaf Count} = 3 \\text{ 个}" },
      { label: "3. 全树总基尼降幅", formula: "\\Delta\\text{Gini}_{\\text{Total}} = 0.4200 - 0.0000 = 0.4200" }
    ],
    description: "通过两轮递归切分：第 1 层用‘信用记录’切出叶节点 A；第 2 层用‘年龄’切出叶节点 B 和 C。生成的 2 层决策树规则清晰，全树纯净！",
    groups: [
      {
        name: "建树完成 (10人分归 3 个纯净叶节点)",
        items: [
          { id: 1, name: "客户 1", income: "高", credit: "不良", age: "青年", label: 0 },
          { id: 5, name: "客户 5", income: "高", credit: "良好", age: "青年", label: 0 },
          { id: 6, name: "客户 6", income: "高", credit: "良好", age: "中年", label: 1 },
        ]
      }
    ],
    metrics: { giniBefore: "0.4200", giniAfter: "0.0000", giniGain: "0.4200 (全树纯净)" }
  }
];

export function DecisionTreeHandCalcLab() {
  const [currentStep, setCurrentStep] = useState<number>(0);
  const stepData = HAND_STEPS[currentStep];

  const handleNext = () => {
    if (currentStep < HAND_STEPS.length - 1) setCurrentStep((prev) => prev + 1);
  };

  const handlePrev = () => {
    if (currentStep > 0) setCurrentStep((prev) => prev - 1);
  };

  return (
    <div className="my-8 rounded-2xl border border-teal-200/80 bg-white p-5 shadow-sm sm:p-7 select-none">
      {/* 顶部标题栏与 Stepper 进度条 */}
      <div className="flex flex-col gap-4 border-b border-slate-100 pb-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-600 text-white shadow-xs">
              <Calculator className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-lg sm:text-xl font-extrabold text-slate-800">10 样本 2 层决策树递归切分可视化实验室</h3>
              <p className="text-xs sm:text-sm text-slate-500 font-medium pt-0.5">从根节点选“信用记录”到右子树选“年龄”的 2 层深入递归建树全流程</p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 text-xs sm:text-sm font-bold text-teal-800 bg-teal-50 px-3.5 py-1.5 rounded-full border border-teal-200">
            <span>步骤 {currentStep + 1} / 5</span>
          </div>
        </div>

        {/* 5 步 Stepper 按钮栏 */}
        <div className="grid grid-cols-5 gap-2 pt-1">
          {HAND_STEPS.map((s, idx) => (
            <button
              key={s.step}
              type="button"
              onClick={() => setCurrentStep(idx)}
              className={`h-2.5 rounded-full transition-all cursor-pointer ${
                idx <= currentStep ? 'bg-teal-600' : 'bg-slate-200 hover:bg-slate-300'
              }`}
              title={s.title}
            />
          ))}
        </div>
      </div>

      {/* 原理提示说明卡片 */}
      <div className="mt-4 rounded-xl bg-teal-50/70 p-3.5 border border-teal-200/80 flex items-start gap-2.5">
        <HelpCircle className="h-4.5 w-4.5 text-teal-600 shrink-0 mt-0.5" />
        <div className="text-xs sm:text-sm text-slate-700 leading-relaxed">
          <span className="font-bold text-teal-900">为什么要进行多层递归切分？</span>{' '}
          如果第 1 层切分后某个子节点内部依然不纯（如包含 3 批准 3 拒绝），决策树就会<strong>在该子节点处继续递归挑选剩余特征（如年龄）进行二次切分</strong>，直到所有叶节点纯净！
        </div>
      </div>

      {/* 主双栏布局 */}
      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* 左侧：数据分组卡片 或 决胜树图 */}
        <div className="lg:col-span-6 flex flex-col justify-between space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2 text-xs sm:text-sm">
            <RenderMixedText text={stepData.splitFeature} className="font-extrabold text-slate-800" />
            <span className="text-slate-500 font-mono font-semibold">共 10 位客户样本</span>
          </div>

          {/* 动态展示区域 */}
          {currentStep === 4 ? (
            /* Step 5: SVG 决胜决策树图 */
            <div className="rounded-xl border border-teal-200 bg-teal-50/50 p-4 flex flex-col items-center justify-center space-y-3 min-h-[360px]">
              <div className="flex items-center gap-1.5 text-xs font-extrabold text-teal-900 bg-white border border-teal-300 px-3 py-1 rounded-full shadow-2xs">
                <Trophy className="h-3.5 w-3.5 text-amber-500" />
                <span>生成最终 2 层 3 叶决策树结构</span>
              </div>

              {/* 树图 HTML/SVG 自适应结构 */}
              <div className="w-full flex flex-col items-center space-y-1.5 pt-1 max-w-md">
                {/* 1. 根节点 */}
                <div className="rounded-lg bg-teal-800 text-white font-extrabold text-xs px-3.5 py-2 shadow-sm border border-teal-900 text-center">
                  <div>[第1层 根节点] 信用记录 ($x_2$)?</div>
                  <div className="text-[10px] font-mono text-teal-200">基尼降幅: <RenderMath math="\Delta\text{Gini} = 0.1200" /></div>
                </div>

                {/* 分支连线 SVG 1 */}
                <svg className="w-64 h-8 overflow-visible" viewBox="0 0 240 30">
                  <line x1="120" y1="0" x2="50" y2="25" stroke="#0F766E" strokeWidth="2" />
                  <line x1="120" y1="0" x2="190" y2="25" stroke="#0F766E" strokeWidth="2" />
                  <rect x="20" y="5" width="60" height="15" rx="3" fill="#FFFFFF" stroke="#C2410C" strokeWidth="1" />
                  <text x="50" y="16" textAnchor="middle" fontSize="9" fill="#C2410C" fontWeight="bold">信用 = 不良</text>
                  <rect x="160" y="5" width="60" height="15" rx="3" fill="#FFFFFF" stroke="#0D9488" strokeWidth="1" />
                  <text x="190" y="16" textAnchor="middle" fontSize="9" fill="#0D9488" fontWeight="bold">信用 = 良好</text>
                </svg>

                {/* 中间层：左叶节点 A + 右二级节点 */}
                <div className="grid grid-cols-2 gap-4 w-full">
                  <div className="rounded-lg bg-orange-600 text-white p-2 text-center shadow-2xs border border-orange-700 space-y-0.5">
                    <div className="font-extrabold text-xs">叶节点 A: 拒绝 (y=0)</div>
                    <div className="text-[10px] font-mono text-orange-100">4 人 (客户 1,2,3,4)</div>
                    <div className="text-[10px] font-mono font-bold bg-orange-700/80 rounded py-0.5">Gini = 0.0000</div>
                  </div>

                  <div className="rounded-lg bg-teal-700 text-white p-2 text-center shadow-2xs border border-teal-800 space-y-0.5">
                    <div className="font-extrabold text-xs">[第2层 节点] 年龄 ($x_3$)?</div>
                    <div className="text-[10px] font-mono text-teal-100">6 人 (3批准 3拒绝)</div>
                    <div className="text-[10px] font-mono font-bold bg-teal-800/80 rounded py-0.5">降幅: <RenderMath math="\Delta\text{Gini}=0.5000" /></div>
                  </div>
                </div>

                {/* 分支连线 SVG 2 */}
                <svg className="w-40 h-7 overflow-visible ml-32" viewBox="0 0 160 25">
                  <line x1="80" y1="0" x2="30" y2="20" stroke="#0F766E" strokeWidth="2" />
                  <line x1="80" y1="0" x2="130" y2="20" stroke="#0F766E" strokeWidth="2" />
                  <rect x="10" y="3" width="40" height="13" rx="3" fill="#FFFFFF" stroke="#C2410C" strokeWidth="1" />
                  <text x="30" y="12" textAnchor="middle" fontSize="8" fill="#C2410C" fontWeight="bold">青年</text>
                  <rect x="110" y="3" width="40" height="13" rx="3" fill="#FFFFFF" stroke="#0D9488" strokeWidth="1" />
                  <text x="130" y="12" textAnchor="middle" fontSize="8" fill="#0D9488" fontWeight="bold">中年</text>
                </svg>

                {/* 底部叶节点 B & C */}
                <div className="grid grid-cols-2 gap-3 w-full max-w-[280px] ml-32">
                  <div className="rounded-lg bg-orange-600 text-white p-2 text-center shadow-2xs border border-orange-700 space-y-0.5">
                    <div className="font-extrabold text-xs">叶节点 B: 拒绝</div>
                    <div className="text-[10px] font-mono text-orange-100">3 人 (客户 5,7,9)</div>
                    <div className="text-[10px] font-mono font-bold bg-orange-700/80 rounded py-0.5">Gini = 0.0000</div>
                  </div>

                  <div className="rounded-lg bg-teal-600 text-white p-2 text-center shadow-2xs border border-teal-700 space-y-0.5">
                    <div className="font-extrabold text-xs">叶节点 C: 批准</div>
                    <div className="text-[10px] font-mono text-teal-100">3 人 (客户 6,8,10)</div>
                    <div className="text-[10px] font-mono font-bold bg-teal-700/80 rounded py-0.5">Gini = 0.0000</div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* Step 1-4: 数据卡片分组展示 */
            <div className="space-y-3 min-h-[360px] flex flex-col justify-center">
              {stepData.groups.map((group, gIdx) => (
                <div key={gIdx} className="rounded-xl border border-slate-200 bg-slate-50/70 p-3 space-y-2">
                  <div className="flex items-center justify-between text-xs font-extrabold text-slate-800">
                    <span>{group.name}</span>
                    <span className="font-mono text-slate-500">{group.items.length} 人</span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                    {group.items.map((item) => {
                      const isApproved = item.label === 1;
                      return (
                        <div
                          key={item.id}
                          className={`rounded-lg p-2 border flex flex-col justify-between transition-all ${
                            isApproved
                              ? 'bg-teal-50 border-teal-200 text-teal-900 shadow-2xs'
                              : 'bg-orange-50 border-orange-200 text-orange-900 shadow-2xs'
                          }`}
                        >
                          <div className="flex items-center justify-between font-extrabold text-[11px]">
                            <span>{item.name}</span>
                            <span className={`px-1 py-0.2 rounded text-[10px] font-bold ${isApproved ? 'bg-teal-600 text-white' : 'bg-orange-600 text-white'}`}>
                              {isApproved ? '批准' : '拒绝'}
                            </span>
                          </div>
                          <div className="text-[10px] text-slate-600 pt-1 space-y-0.5 font-medium">
                            <div>收入: <span className="font-bold">{item.income}</span></div>
                            <div>信用: <span className="font-bold">{item.credit}</span></div>
                            <div>年龄: <span className="font-bold">{item.age}</span></div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 右侧：计算步骤面板与导航控制 (完全解决重叠与公式冗长) */}
        <div className="lg:col-span-6 flex flex-col justify-between space-y-4">
          <div className="space-y-3">
            {/* 步骤标题 */}
            <div className="flex items-center gap-2.5">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-teal-600 text-xs font-extrabold text-white shrink-0">
                {stepData.step}
              </span>
              <h4 className="text-sm sm:text-base font-extrabold text-slate-800">{stepData.title}</h4>
            </div>

            <p className="text-xs text-slate-500 font-semibold">{stepData.subtitle}</p>

            {/* 清爽、短公式、不溢出的深色计算步骤盒 */}
            <div className="rounded-xl bg-slate-900 p-3.5 text-teal-300 shadow-inner space-y-2.5">
              {stepData.mathSteps.map((st, idx) => (
                <div key={idx} className="flex flex-col space-y-0.5 border-b border-slate-800/80 pb-1.5 last:border-b-0 last:pb-0">
                  <span className="text-[11px] font-bold text-slate-400 font-sans">{st.label}:</span>
                  <div className="overflow-x-auto whitespace-nowrap pt-0.5">
                    <RenderMath math={st.formula} className="text-xs font-mono font-bold" />
                  </div>
                </div>
              ))}
            </div>

            {/* 文字说明 */}
            <p className="text-xs leading-relaxed text-slate-700 font-medium bg-slate-50 p-3 rounded-xl border border-slate-200/80">
              {stepData.description}
            </p>

            {/* 3 卡片简洁指标面板 */}
            <div className="grid grid-cols-3 gap-2 text-xs">
              <div className="rounded-lg bg-slate-50 p-2.5 border border-slate-200 text-center">
                <div className="text-slate-500 text-[10px] font-medium">切分前 Gini</div>
                <div className="font-mono font-bold text-amber-700 text-xs pt-0.5">{stepData.metrics.giniBefore}</div>
              </div>

              <div className="rounded-lg bg-slate-50 p-2.5 border border-slate-200 text-center">
                <div className="text-slate-500 text-[10px] font-medium">切分后 Gini</div>
                <div className="font-mono font-bold text-slate-800 text-xs pt-0.5">{stepData.metrics.giniAfter}</div>
              </div>

              <div className="rounded-lg bg-teal-50 p-2.5 border border-teal-200 text-center">
                <div className="text-teal-800 font-bold text-[10px] flex items-center justify-center gap-1">
                  <span>基尼降幅</span>
                  <RenderMath math="\Delta\text{Gini}" />
                </div>
                <div className="font-mono font-extrabold text-teal-700 text-xs pt-0.5">{stepData.metrics.giniGain}</div>
              </div>
            </div>
          </div>

          {/* 独立导航控制按钮 (与指标卡片天然隔离，绝不重叠) */}
          <div className="flex items-center justify-between border-t border-slate-100 pt-3 mt-2">
            <button
              type="button"
              onClick={handlePrev}
              disabled={currentStep === 0}
              className={`flex items-center gap-1 rounded-xl border border-slate-200 px-4 py-2 text-xs font-bold transition-all cursor-pointer ${
                currentStep === 0
                  ? 'opacity-40 cursor-not-allowed text-slate-400 bg-slate-50'
                  : 'text-slate-700 hover:bg-slate-100'
              }`}
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              上一步
            </button>

            <button
              type="button"
              onClick={handleNext}
              disabled={currentStep === HAND_STEPS.length - 1}
              className={`flex items-center gap-1 rounded-xl px-4 py-2 text-xs font-extrabold text-white shadow-xs transition-all cursor-pointer ${
                currentStep === HAND_STEPS.length - 1
                  ? 'bg-teal-400 cursor-not-allowed opacity-60'
                  : 'bg-teal-600 hover:bg-teal-700 shadow-teal-600/20'
              }`}
            >
              下一步 (递归切分)
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
