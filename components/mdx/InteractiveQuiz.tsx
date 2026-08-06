'use client';

import React, { useState } from 'react';
import { CheckCircle2, XCircle, HelpCircle, Code2, Sparkles, RefreshCw, Trophy, ArrowRight, ChevronDown, ChevronUp } from 'lucide-react';

export interface QuestionItem {
  id: string;
  type?: 'single' | 'multiple' | 'tf' | 'code-output';
  question: string;
  codeSnippet?: string;
  options: string[];
  answer: number | number[]; // 0-indexed 选项索引或数组
  explanation: string;
}

export interface InteractiveQuizProps {
  title?: string;
  questions: QuestionItem[];
}

export const InteractiveQuiz: React.FC<InteractiveQuizProps> = ({
  title = '🎯 课后互动自测与概念验证',
  questions = [],
}) => {
  const [userAnswers, setUserAnswers] = useState<Record<string, number | number[]>>({});
  const [submittedStatus, setSubmittedStatus] = useState<Record<string, boolean>>({});
  const [showExplanation, setShowExplanation] = useState<Record<string, boolean>>({});
  const [isCompleted, setIsCompleted] = useState(false);

  if (!questions || questions.length === 0) return null;

  // 校验单题答案是否正确
  const isQuestionCorrect = (q: QuestionItem): boolean => {
    const userAns = userAnswers[q.id];
    if (userAns === undefined) return false;

    if (Array.isArray(q.answer)) {
      if (!Array.isArray(userAns)) return false;
      const sortedCorrect = [...q.answer].sort();
      const sortedUser = [...userAns].sort();
      return (
        sortedCorrect.length === sortedUser.length &&
        sortedCorrect.every((val, idx) => val === sortedUser[idx])
      );
    }

    return userAns === q.answer;
  };

  // 选择选项
  const handleSelectOption = (qId: string, optionIdx: number, isMulti: boolean) => {
    if (submittedStatus[qId]) return; // 已提交不可更改

    if (isMulti) {
      const current = (userAnswers[qId] as number[]) || [];
      const updated = current.includes(optionIdx)
        ? current.filter((i) => i !== optionIdx)
        : [...current, optionIdx];
      setUserAnswers((prev) => ({ ...prev, [qId]: updated }));
    } else {
      setUserAnswers((prev) => ({ ...prev, [qId]: optionIdx }));
    }
  };

  // 提交单题
  const handleSubmitQuestion = (qId: string) => {
    if (userAnswers[qId] === undefined) return;
    setSubmittedStatus((prev) => ({ ...prev, [qId]: true }));
    setShowExplanation((prev) => ({ ...prev, [qId]: true }));

    // 检查是否全量题已完成
    const nextSubmitted = { ...submittedStatus, [qId]: true };
    if (questions.every((q) => nextSubmitted[q.id])) {
      setIsCompleted(true);
    }
  };

  // 重新开始自测
  const handleResetQuiz = () => {
    setUserAnswers({});
    setSubmittedStatus({});
    setShowExplanation({});
    setIsCompleted(false);
  };

  // 计算得分
  const correctCount = questions.filter((q) => submittedStatus[q.id] && isQuestionCorrect(q)).length;
  const scorePercent = Math.round((correctCount / questions.length) * 100);

  return (
    <div className="my-10 rounded-2xl border-2 border-teal-200/80 bg-gradient-to-b from-teal-50/40 via-white to-slate-50 p-6 sm:p-8 shadow-md">
      {/* 头部标题与进度 */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-teal-100">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-teal-600 text-white shadow-sm">
            <Sparkles className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900 m-0 leading-tight">{title}</h3>
            <p className="text-xs text-slate-500 mt-1 mb-0 font-medium">
              共 {questions.length} 道检测题 · 即时反馈与考点解析
            </p>
          </div>
        </div>

        {/* 顶部进度统计 */}
        <div className="flex items-center gap-2 self-start sm:self-auto bg-white px-3.5 py-1.5 rounded-full border border-teal-200/60 shadow-xs">
          <span className="text-xs font-semibold text-slate-600">答题进度:</span>
          <span className="text-xs font-extrabold text-teal-700">
            {Object.keys(submittedStatus).length} / {questions.length}
          </span>
        </div>
      </div>

      {/* 题目列表 */}
      <div className="mt-8 space-y-8">
        {questions.map((q, qIndex) => {
          const isSubmitted = !!submittedStatus[q.id];
          const isCorrect = isSubmitted && isQuestionCorrect(q);
          const isMulti = q.type === 'multiple' || Array.isArray(q.answer);
          const userAns = userAnswers[q.id];

          return (
            <div
              key={q.id}
              className={`rounded-xl border transition-all p-5 sm:p-6 bg-white shadow-xs ${
                isSubmitted
                  ? isCorrect
                    ? 'border-emerald-300 bg-emerald-50/20'
                    : 'border-rose-300 bg-rose-50/20'
                  : 'border-slate-200 hover:border-teal-300'
              }`}
            >
              {/* 题号、类型 Tag 与题干 */}
              <div className="flex items-start gap-3">
                <span className="flex-shrink-0 flex items-center justify-center w-7 h-7 rounded-lg bg-teal-100 text-teal-800 text-xs font-extrabold">
                  {qIndex + 1}
                </span>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
                      {q.type === 'code-output' ? (
                        <>
                          <Code2 className="w-3 h-3 mr-1 text-teal-600" /> 代码预测题
                        </>
                      ) : isMulti ? (
                        '多选题'
                      ) : (
                        '单选题'
                      )}
                    </span>
                  </div>

                  <h4 className="text-base font-bold text-slate-900 leading-snug m-0">{q.question}</h4>
                </div>
              </div>

              {/* 代码片段展示（若有） */}
              {q.codeSnippet && (
                <div className="mt-4 my-3 rounded-xl overflow-hidden border border-slate-800 bg-[#0d1117]">
                  <div className="px-3.5 py-1.5 bg-[#161b22] border-b border-slate-800 text-[11px] font-mono text-teal-400 font-bold flex items-center gap-1.5">
                    <Code2 className="w-3.5 h-3.5" /> Python Code Snippet
                  </div>
                  <pre className="p-4 font-mono text-xs text-slate-200 leading-relaxed overflow-x-auto m-0 bg-transparent">
                    <code>{q.codeSnippet}</code>
                  </pre>
                </div>
              )}

              {/* 选项卡片 */}
              <div className="mt-4 space-y-2.5">
                {q.options.map((opt, optIdx) => {
                  const isSelected = isMulti
                    ? Array.isArray(userAns) && userAns.includes(optIdx)
                    : userAns === optIdx;

                  let optStyle = 'border-slate-200 bg-white hover:border-teal-400 hover:bg-teal-50/40 text-slate-700';

                  if (isSubmitted) {
                    const isTargetCorrect = Array.isArray(q.answer)
                      ? q.answer.includes(optIdx)
                      : q.answer === optIdx;

                    if (isTargetCorrect) {
                      optStyle = 'border-emerald-500 bg-emerald-50 text-emerald-900 font-semibold ring-1 ring-emerald-500';
                    } else if (isSelected && !isTargetCorrect) {
                      optStyle = 'border-rose-400 bg-rose-50 text-rose-900 font-semibold line-through opacity-90';
                    } else {
                      optStyle = 'border-slate-200 bg-slate-50 text-slate-400 opacity-60';
                    }
                  } else if (isSelected) {
                    optStyle = 'border-teal-600 bg-teal-50/80 text-teal-900 font-semibold ring-2 ring-teal-500/20';
                  }

                  return (
                    <button
                      key={optIdx}
                      type="button"
                      disabled={isSubmitted}
                      onClick={() => handleSelectOption(q.id, optIdx, isMulti)}
                      className={`w-full text-left p-3.5 rounded-xl border text-xs sm:text-sm transition-all flex items-start gap-3 cursor-pointer disabled:cursor-default ${optStyle}`}
                    >
                      <span className="flex-shrink-0 font-bold font-mono text-xs opacity-75 mt-0.5">
                        {String.fromCharCode(65 + optIdx)}.
                      </span>
                      <span className="leading-relaxed flex-1">{opt}</span>
                    </button>
                  );
                })}
              </div>

              {/* 提交按钮与状态反馈 */}
              <div className="mt-5 flex items-center justify-between">
                {!isSubmitted ? (
                  <button
                    type="button"
                    disabled={userAns === undefined}
                    onClick={() => handleSubmitQuestion(q.id)}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-teal-600 text-white text-xs font-bold hover:bg-teal-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-xs"
                  >
                    提交校验答案 <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                ) : (
                  <div className="flex items-center gap-2">
                    {isCorrect ? (
                      <div className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 bg-emerald-100/80 px-3 py-1.5 rounded-lg">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" /> 回答正确！
                      </div>
                    ) : (
                      <div className="inline-flex items-center gap-1.5 text-xs font-bold text-rose-700 bg-rose-100/80 px-3 py-1.5 rounded-lg">
                        <XCircle className="w-4 h-4 text-rose-600" /> 回答错误
                      </div>
                    )}

                    <button
                      type="button"
                      onClick={() =>
                        setShowExplanation((prev) => ({ ...prev, [q.id]: !prev[q.id] }))
                      }
                      className="inline-flex items-center gap-1 text-xs font-bold text-teal-700 hover:text-teal-900 bg-teal-50 px-2.5 py-1.5 rounded-lg transition-colors border border-teal-200/60"
                    >
                      <HelpCircle className="w-3.5 h-3.5 text-teal-600" />
                      {showExplanation[q.id] ? '收起解析' : '查看考点解析'}
                      {showExplanation[q.id] ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                    </button>
                  </div>
                )}
              </div>

              {/* 考点解析展开面板 */}
              {isSubmitted && showExplanation[q.id] && (
                <div className="mt-4 p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700 leading-relaxed animate-fade-in">
                  <div className="font-bold text-slate-900 flex items-center gap-1.5 mb-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-amber-500" /> 考点精讲与解析：
                  </div>
                  <p className="m-0 text-slate-700">{q.explanation}</p>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* 结算成绩大卡片（当全部完成时展现） */}
      {isCompleted && (
        <div className="mt-10 p-6 rounded-2xl bg-gradient-to-r from-teal-900 to-slate-900 text-white shadow-xl flex flex-col sm:flex-row items-center justify-between gap-6 animate-scale-in">
          <div className="flex items-center gap-4">
            <div className="p-3.5 rounded-2xl bg-teal-500/20 border border-teal-400/30 text-teal-300">
              <Trophy className="w-8 h-8 text-amber-400" />
            </div>
            <div>
              <h4 className="text-lg font-bold text-white m-0">恭喜完成课后概念自测！</h4>
              <p className="text-xs text-teal-200/80 mt-1 mb-0">
                答对 <span className="text-amber-400 font-extrabold">{correctCount}</span> / {questions.length} 题
                （正确率 {scorePercent}%）
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleResetQuiz}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-teal-500 text-slate-950 font-bold text-xs hover:bg-teal-400 transition-all shadow-md cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" /> 重新挑战自测
          </button>
        </div>
      )}
    </div>
  );
};
