'use client';

import React, { useState, useMemo } from 'react';
import { PieChart, ShieldAlert, Sparkles, Mail, RefreshCw } from 'lucide-react';

export const NaiveBayesLab: React.FC = () => {
  // 先验概率 P(Spam)
  const [priorSpam, setPriorSpam] = useState<number>(30); // 30% 垃圾邮件先验
  // 似然概率 1: P("免费" | Spam)
  const [likeFreeSpam, setLikeFreeSpam] = useState<number>(80); // 80% 垃圾邮件含"免费"
  // 似然概率 2: P("免费" | Ham)
  const [likeFreeHam, setLikeFreeHam] = useState<number>(10); // 10% 正常邮件含"免费"
  // 似然概率 3: P("中奖" | Spam)
  const [likeWinSpam, setLikeWinSpam] = useState<number>(60); // 60% 垃圾邮件含"中奖"
  // 似然概率 4: P("中奖" | Ham)
  const [likeWinHam, setLikeWinHam] = useState<number>(5); // 5% 正常邮件含"中奖"
  // 测试邮件类型：单词 "免费" vs 组合词 "免费" + "中奖"
  const [mailScenario, setMailScenario] = useState<'single' | 'combo'>('combo');

  // 100% 严格与左侧滑块完全一致的精确概率计算
  const calcResults = useMemo(() => {
    const pSpam = priorSpam / 100;
    const pHam = (100 - priorSpam) / 100;

    const pFree_Spam = likeFreeSpam / 100;
    const pFree_Ham = likeFreeHam / 100;

    const pWin_Spam = likeWinSpam / 100;
    const pWin_Ham = likeWinHam / 100;

    const isCombo = mailScenario === 'combo';

    // 似然连乘积
    const likeSpamProd = isCombo ? pFree_Spam * pWin_Spam : pFree_Spam;
    const likeHamProd = isCombo ? pFree_Ham * pWin_Ham : pFree_Ham;

    // 分子得分 (先验 × 似然积)
    const scoreSpam = pSpam * likeSpamProd;
    const scoreHam = pHam * likeHamProd;

    // 分母总证据 (分子得分之和)
    const totalEvidence = scoreSpam + scoreHam;

    // 归一化后验概率
    const postSpam = (scoreSpam / (totalEvidence || 1)) * 100;
    const postHam = (scoreHam / (totalEvidence || 1)) * 100;

    return {
      pSpam,
      pHam,
      pFree_Spam,
      pFree_Ham,
      pWin_Spam,
      pWin_Ham,
      likeSpamProd,
      likeHamProd,
      scoreSpam,
      scoreHam,
      totalEvidence,
      postSpam,
      postHam,
    };
  }, [priorSpam, likeFreeSpam, likeFreeHam, likeWinSpam, likeWinHam, mailScenario]);

  // 重置滑块数值
  const handleReset = () => {
    setPriorSpam(30);
    setLikeFreeSpam(80);
    setLikeFreeHam(10);
    setLikeWinSpam(60);
    setLikeWinHam(5);
    setMailScenario('combo');
  };

  return (
    <div className="my-8 rounded-2xl overflow-hidden border border-slate-200 shadow-card bg-white font-sans">
      {/* 头部标题 */}
      <div className="px-5 py-3.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
        <div className="flex items-center space-x-2.5">
          <div className="w-7 h-7 rounded-lg bg-indigo-100 border border-indigo-200 flex items-center justify-center text-indigo-700">
            <PieChart className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-slate-800 m-0">贝叶斯多词概率连乘直觉实验室</h4>
            <p className="text-[11px] text-slate-500 m-0">体验垃圾邮件过滤器如何通过多词概率相乘，精准判定可疑邮件</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleReset}
            className="p-1.5 text-slate-500 hover:text-slate-800 bg-white border border-slate-200 rounded-lg shadow-sm transition-all"
            title="重置滑块数值"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
          <span className="text-xs font-bold text-indigo-700 bg-indigo-50 border border-indigo-200 px-2.5 py-1 rounded-full">
            条件独立假设直觉
          </span>
        </div>
      </div>

      {/* 场景选择按钮 */}
      <div className="px-5 py-3 bg-indigo-50/60 border-b border-indigo-100 flex flex-wrap items-center justify-between gap-3">
        <span className="text-xs font-bold text-indigo-900 flex items-center gap-1.5">
          <Mail className="w-4 h-4 text-indigo-600" />
          选择发来的新邮件内容场景:
        </span>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setMailScenario('single')}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg border transition-all ${
              mailScenario === 'single'
                ? 'bg-indigo-600 border-indigo-700 text-white shadow-sm'
                : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
            }`}
          >
            场景 1: 邮件只包含 1 个词 [“免费”]
          </button>
          <button
            onClick={() => setMailScenario('combo')}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg border transition-all ${
              mailScenario === 'combo'
                ? 'bg-indigo-600 border-indigo-700 text-white shadow-sm'
                : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
            }`}
          >
            场景 2: 邮件同时包含 2 个词 [“免费” + “中奖”]
          </button>
        </div>
      </div>

      {/* 交互核心网格 - 左右两侧彻底完美对齐 */}
      <div className="p-5 grid grid-cols-1 lg:grid-cols-12 gap-6 bg-slate-50/50 items-stretch">
        {/* 左侧 控制面板 */}
        <div className="lg:col-span-6 flex flex-col justify-between space-y-3.5">
          {/* 1. 先验概率 */}
          <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-sm space-y-2.5">
            <div className="flex justify-between items-center">
              <label className="text-xs font-bold text-slate-700">全局先验概率 P(垃圾邮件 Spam):</label>
              <span className="text-xs font-mono font-extrabold text-indigo-600 bg-indigo-50 px-2.5 py-0.5 rounded border border-indigo-200">
                {priorSpam}% ({calcResults.pSpam.toFixed(2)})
              </span>
            </div>
            <input
              type="range"
              min={5}
              max={95}
              value={priorSpam}
              onChange={(e) => setPriorSpam(Number(e.target.value))}
              className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
            />
            <div className="flex justify-between text-[10px] text-slate-400">
              <span>垃圾邮件 P(Spam) = {calcResults.pSpam.toFixed(2)}</span>
              <span>正常邮件 P(Ham) = {calcResults.pHam.toFixed(2)}</span>
            </div>
          </div>

          {/* 2. 关键词 1 "免费" 的似然概率 */}
          <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-sm space-y-3">
            <span className="text-xs font-bold text-slate-800 block border-b border-slate-100 pb-1.5">
              词汇 1: “免费” (Free) 在各类别中出现的概率
            </span>
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-600">垃圾邮件包含“免费”概率 P(“免费” | Spam):</span>
                <span className="font-mono font-bold text-rose-600">{likeFreeSpam}% ({calcResults.pFree_Spam.toFixed(2)})</span>
              </div>
              <input
                type="range"
                min={10}
                max={99}
                value={likeFreeSpam}
                onChange={(e) => setLikeFreeSpam(Number(e.target.value))}
                className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-rose-500"
              />
            </div>
            <div className="space-y-2 pt-1">
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-600">正常邮件包含“免费”概率 P(“免费” | Ham):</span>
                <span className="font-mono font-bold text-teal-600">{likeFreeHam}% ({calcResults.pFree_Ham.toFixed(2)})</span>
              </div>
              <input
                type="range"
                min={1}
                max={50}
                value={likeFreeHam}
                onChange={(e) => setLikeFreeHam(Number(e.target.value))}
                className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-teal-500"
              />
            </div>
          </div>

          {/* 3. 关键词 2 "中奖" 似然概率 */}
          <div className={`p-4 rounded-xl border transition-all space-y-3 ${
            mailScenario === 'combo' ? 'bg-indigo-50/30 border-indigo-200 shadow-sm opacity-100' : 'bg-slate-100/50 border-slate-200 opacity-40 pointer-events-none'
          }`}>
            <span className="text-xs font-bold text-slate-800 block border-b border-slate-200/60 pb-1.5">
              词汇 2: “中奖” (Win) 在各类别中出现的概率 {mailScenario === 'single' ? '(未启用)' : ''}
            </span>
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-600">垃圾邮件包含“中奖”概率 P(“中奖” | Spam):</span>
                <span className="font-mono font-bold text-rose-600">{likeWinSpam}% ({calcResults.pWin_Spam.toFixed(2)})</span>
              </div>
              <input
                type="range"
                min={10}
                max={99}
                value={likeWinSpam}
                onChange={(e) => setLikeWinSpam(Number(e.target.value))}
                className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-rose-500"
              />
            </div>
            <div className="space-y-2 pt-1">
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-600">正常邮件包含“中奖”概率 P(“中奖” | Ham):</span>
                <span className="font-mono font-bold text-teal-600">{likeWinHam}% ({calcResults.pWin_Ham.toFixed(2)})</span>
              </div>
              <input
                type="range"
                min={1}
                max={40}
                value={likeWinHam}
                onChange={(e) => setLikeWinHam(Number(e.target.value))}
                className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-teal-500"
              />
            </div>
          </div>
        </div>

        {/* 右侧 贝叶斯推导步骤与结果 */}
        <div className="lg:col-span-6 flex flex-col justify-between space-y-3.5">
          {/* 核心结论卡片 */}
          <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-sm space-y-2.5">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <ShieldAlert className="w-4 h-4 text-rose-500" />
                当前邮件后验诊断结果
              </span>
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-extrabold ${
                calcResults.postSpam > 50 ? 'bg-rose-50 text-rose-700 border border-rose-200' : 'bg-teal-50 text-teal-700 border border-teal-200'
              }`}>
                {calcResults.postSpam > 50 ? '判定为 垃圾邮件 (Spam)' : '判定为 正常邮件 (Ham)'}
              </span>
            </div>

            {/* 后验概率占比柱 */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs font-bold">
                <span className="text-rose-600">垃圾邮件概率 P(Spam | X): {calcResults.postSpam.toFixed(1)}%</span>
                <span className="text-teal-600">正常邮件概率 P(Ham | X): {calcResults.postHam.toFixed(1)}%</span>
              </div>
              <div className="w-full h-2.5 bg-teal-100 rounded-full overflow-hidden flex">
                <div
                  className="h-full bg-rose-500 transition-all duration-300"
                  style={{ width: `${calcResults.postSpam}%` }}
                />
              </div>
            </div>
          </div>

          {/* 每一项全展开的贝叶斯推算 (100% 对齐滑块) */}
          <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-sm space-y-2.5 text-xs font-mono">
            <h5 className="font-bold text-slate-800 m-0 border-b border-slate-100 pb-1.5 font-sans flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              贝叶斯全公式具体数值展开推导 (Step-by-Step)
            </h5>

            {/* 第一步：基础先验 */}
            <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-100 space-y-0.5">
              <span className="font-bold text-slate-700 block font-sans">1. 基础先验概率 (Prior):</span>
              <div>P(Spam) = {calcResults.pSpam.toFixed(2)} , P(Ham) = {calcResults.pHam.toFixed(2)}</div>
            </div>

            {/* 第二步：分子得分 */}
            <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-100 space-y-1">
              <span className="font-bold text-slate-700 block font-sans">2. 分子得分 (先验 P(y) × 似然积 ∏P(x_j|y)):</span>
              {mailScenario === 'single' ? (
                <>
                  <div>垃圾得分 = P(Spam) × P(“免费”|Spam)</div>
                  <div className="pl-3 text-[11px] text-slate-600">= {calcResults.pSpam.toFixed(2)} × {calcResults.pFree_Spam.toFixed(2)} = <strong className="text-rose-600 text-xs">{calcResults.scoreSpam.toFixed(4)}</strong></div>
                  <div>正常得分 = P(Ham) × P(“免费”|Ham)</div>
                  <div className="pl-3 text-[11px] text-slate-600">= {calcResults.pHam.toFixed(2)} × {calcResults.pFree_Ham.toFixed(2)} = <strong className="text-teal-600 text-xs">{calcResults.scoreHam.toFixed(4)}</strong></div>
                </>
              ) : (
                <>
                  <div>垃圾得分 = P(Spam) × P(“免费”|Spam) × P(“中奖”|Spam)</div>
                  <div className="pl-3 text-[11px] text-slate-600">= {calcResults.pSpam.toFixed(2)} × {calcResults.pFree_Spam.toFixed(2)} × {calcResults.pWin_Spam.toFixed(2)} = <strong className="text-rose-600 text-xs">{calcResults.scoreSpam.toFixed(4)}</strong></div>
                  <div>正常得分 = P(Ham) × P(“免费”|Ham) × P(“中奖”|Ham)</div>
                  <div className="pl-3 text-[11px] text-slate-600">= {calcResults.pHam.toFixed(2)} × {calcResults.pFree_Ham.toFixed(2)} × {calcResults.pWin_Ham.toFixed(2)} = <strong className="text-teal-600 text-xs">{calcResults.scoreHam.toFixed(4)}</strong></div>
                </>
              )}
            </div>

            {/* 第三步：分母总证据 */}
            <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-100 space-y-0.5">
              <span className="font-bold text-slate-700 block font-sans">3. 分母总概率 P(X) = 垃圾得分 + 正常得分:</span>
              <div>P(X) = {calcResults.scoreSpam.toFixed(4)} + {calcResults.scoreHam.toFixed(4)} = <strong className="text-indigo-700">{calcResults.totalEvidence.toFixed(4)}</strong></div>
            </div>

            {/* 第四步：后验概率 */}
            <div className="p-2.5 bg-indigo-50 rounded-lg border border-indigo-100 space-y-0.5">
              <span className="font-bold text-indigo-900 block font-sans">4. 最终后验概率 P(Spam|X) = 垃圾得分 / P(X):</span>
              <div className="text-indigo-950 font-bold">
                P(Spam|X) = {calcResults.scoreSpam.toFixed(4)} / {calcResults.totalEvidence.toFixed(4)} = <strong className="text-rose-600 font-extrabold text-sm">{calcResults.postSpam.toFixed(1)}%</strong>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
