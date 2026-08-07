'use client';

import React, { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import {
  CheckCircle2,
  XCircle,
  HelpCircle,
  Code2,
  Sparkles,
  RefreshCw,
  Trophy,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  RotateCcw,
} from 'lucide-react';
import { recordStudyActivity } from '@/components/mdx/TaskCheckbox';

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

/** Python 代码词法 Token */
interface CodeToken {
  type: 'keyword' | 'builtin' | 'string' | 'number' | 'comment' | 'text';
  value: string;
}

/** 词法分析器：将一行 Python 代码解析为安全的 Token 数组 */
function tokenizePythonLine(line: string): CodeToken[] {
  const tokens: CodeToken[] = [];
  let i = 0;

  const keywords = new Set([
    'import', 'from', 'as', 'def', 'return', 'if', 'else', 'elif',
    'for', 'in', 'while', 'with', 'try', 'except', 'True', 'False',
    'None', 'not', 'and', 'or', 'lambda', 'is', 'pass', 'break', 'continue'
  ]);

  const builtins = new Set([
    'len', 'print', 'range', 'str', 'int', 'float', 'list', 'dict',
    'set', 'tuple', 'type', 'pd', 'np', 'plt', 'DataFrame', 'to_datetime',
    'read_csv', 'fit', 'predict', 'concat', 'merge'
  ]);

  while (i < line.length) {
    // 1. 注释：# 到行尾
    if (line[i] === '#') {
      tokens.push({ type: 'comment', value: line.slice(i) });
      break;
    }

    // 2. 字符串字面量: '...' 或 "..."
    if (line[i] === "'" || line[i] === '"') {
      const quote = line[i];
      let strVal = quote;
      i++;
      while (i < line.length) {
        strVal += line[i];
        if (line[i] === quote && line[i - 1] !== '\\') {
          i++;
          break;
        }
        i++;
      }
      tokens.push({ type: 'string', value: strVal });
      continue;
    }

    // 3. 数字字面量
    if (/\d/.test(line[i])) {
      let numVal = '';
      while (i < line.length && /[\d\.]/.test(line[i])) {
        numVal += line[i];
        i++;
      }
      tokens.push({ type: 'number', value: numVal });
      continue;
    }

    // 4. 标识符 / 关键字 / 内置库函数
    if (/[a-zA-Z_]/.test(line[i])) {
      let wordVal = '';
      while (i < line.length && /[a-zA-Z0-9_]/.test(line[i])) {
        wordVal += line[i];
        i++;
      }
      if (keywords.has(wordVal)) {
        tokens.push({ type: 'keyword', value: wordVal });
      } else if (builtins.has(wordVal)) {
        tokens.push({ type: 'builtin', value: wordVal });
      } else {
        tokens.push({ type: 'text', value: wordVal });
      }
      continue;
    }

    // 5. 其他符号或空格
    tokens.push({ type: 'text', value: line[i] });
    i++;
  }

  return tokens;
}

/** 基于 AST / Token 渲染的高亮代码块组件 */
const HighlightedCodeSnippet: React.FC<{ code: string }> = ({ code }) => {
  const lines = code.split('\n');

  return (
    <div className="table w-full font-mono text-xs text-slate-200 border-collapse">
      {lines.map((line, lIdx) => {
        const tokens = tokenizePythonLine(line);

        return (
          <div key={lIdx} className="table-row">
            <span className="table-cell select-none pr-4 text-slate-600 text-right font-mono text-[11px] opacity-60 w-8 align-top py-0.5">
              {lIdx + 1}
            </span>
            <span className="table-cell leading-relaxed whitespace-pre align-top py-0.5">
              {tokens.map((token, tIdx) => {
                if (token.type === 'keyword') {
                  return (
                    <span key={tIdx} className="text-rose-400 font-bold">
                      {token.value}
                    </span>
                  );
                }
                if (token.type === 'builtin') {
                  return (
                    <span key={tIdx} className="text-cyan-300 font-semibold">
                      {token.value}
                    </span>
                  );
                }
                if (token.type === 'string') {
                  return (
                    <span key={tIdx} className="text-emerald-300 font-medium">
                      {token.value}
                    </span>
                  );
                }
                if (token.type === 'number') {
                  return (
                    <span key={tIdx} className="text-amber-300 font-semibold">
                      {token.value}
                    </span>
                  );
                }
                if (token.type === 'comment') {
                  return (
                    <span key={tIdx} className="text-slate-500 italic">
                      {token.value}
                    </span>
                  );
                }
                return <span key={tIdx}>{token.value}</span>;
              })}
            </span>
          </div>
        );
      })}
    </div>
  );
};

interface SavedQuizData {
  userAnswers: Record<string, number | number[]>;
  submittedStatus: Record<string, boolean>;
  showExplanation: Record<string, boolean>;
  currentIndex: number;
}

const getQuizStorageKey = (pathname: string, quizTitle: string, firstQId: string) => {
  const safeTitle = quizTitle.replace(/[^a-zA-Z0-9\u4e00-\u9fa5]/g, '-');
  return `ai-learning:quiz-progress:${pathname}:${safeTitle}:${firstQId}`;
};

export const InteractiveQuiz: React.FC<InteractiveQuizProps> = ({
  title = '🎯 课后互动自测与概念验证',
  questions = [],
}) => {
  const pathname = usePathname() || '';
  const firstQId = questions[0]?.id || 'q1';
  const storageKey = getQuizStorageKey(pathname, title, firstQId);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<Record<string, number | number[]>>({});
  const [submittedStatus, setSubmittedStatus] = useState<Record<string, boolean>>({});
  const [showExplanation, setShowExplanation] = useState<Record<string, boolean>>({});
  const [isLoaded, setIsLoaded] = useState(false);

  // 客户端挂载时读取 localStorage 持久化进度
  useEffect(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        const data: SavedQuizData = JSON.parse(saved);
        if (data.userAnswers) setUserAnswers(data.userAnswers);
        if (data.submittedStatus) setSubmittedStatus(data.submittedStatus);
        if (data.showExplanation) setShowExplanation(data.showExplanation);
        if (typeof data.currentIndex === 'number' && data.currentIndex >= 0 && data.currentIndex < questions.length) {
          setCurrentIndex(data.currentIndex);
        }
      }
    } catch (e) {
      console.warn('Failed to read quiz progress from localStorage:', e);
    } finally {
      setIsLoaded(true);
    }
  }, [storageKey, questions.length]);

  // 状态更新时保存至 localStorage
  const saveProgress = (
    nextUserAns: Record<string, number | number[]>,
    nextSubmitted: Record<string, boolean>,
    nextExp: Record<string, boolean>,
    nextIdx: number
  ) => {
    try {
      const data: SavedQuizData = {
        userAnswers: nextUserAns,
        submittedStatus: nextSubmitted,
        showExplanation: nextExp,
        currentIndex: nextIdx,
      };
      localStorage.setItem(storageKey, JSON.stringify(data));
    } catch (e) {
      console.warn('Failed to save quiz progress to localStorage:', e);
    }
  };

  if (!questions || questions.length === 0) return null;

  const currentQ = questions[currentIndex];

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
    if (submittedStatus[qId]) return;

    let updatedAns: number | number[];
    if (isMulti) {
      const current = (userAnswers[qId] as number[]) || [];
      updatedAns = current.includes(optionIdx)
        ? current.filter((i) => i !== optionIdx)
        : [...current, optionIdx];
    } else {
      updatedAns = optionIdx;
    }

    const nextUserAns = { ...userAnswers, [qId]: updatedAns };
    setUserAnswers(nextUserAns);
    saveProgress(nextUserAns, submittedStatus, showExplanation, currentIndex);
  };

  // 提交单题
  const handleSubmitQuestion = (qId: string) => {
    if (userAnswers[qId] === undefined) return;

    const nextSubmitted = { ...submittedStatus, [qId]: true };
    const nextExp = { ...showExplanation, [qId]: true };

    setSubmittedStatus(nextSubmitted);
    setShowExplanation(nextExp);
    saveProgress(userAnswers, nextSubmitted, nextExp, currentIndex);

    // 检查是否全量题完成，记录学习活跃度
    if (questions.every((q) => nextSubmitted[q.id])) {
      try {
        recordStudyActivity();
      } catch (e) {
        // ignore
      }
    }
  };

  // 重新答题（完全清空历史记录）
  const handleResetQuiz = () => {
    setUserAnswers({});
    setSubmittedStatus({});
    setShowExplanation({});
    setCurrentIndex(0);
    try {
      localStorage.removeItem(storageKey);
    } catch (e) {
      console.warn('Failed to clear quiz storage:', e);
    }
  };

  // 切换题目
  const handleNavigate = (idx: number) => {
    const targetIdx = Math.max(0, Math.min(questions.length - 1, idx));
    setCurrentIndex(targetIdx);
    saveProgress(userAnswers, submittedStatus, showExplanation, targetIdx);
  };

  // 计数与进度
  const submittedCount = Object.keys(submittedStatus).length;
  const hasUserActivity = submittedCount > 0 || Object.keys(userAnswers).length > 0;
  const isAllSubmitted = questions.every((q) => submittedStatus[q.id]);
  const correctCount = questions.filter((q) => submittedStatus[q.id] && isQuestionCorrect(q)).length;
  const scorePercent = Math.round((correctCount / questions.length) * 100);

  const isCurrentSubmitted = !!submittedStatus[currentQ.id];
  const isCurrentCorrect = isCurrentSubmitted && isQuestionCorrect(currentQ);
  const isMulti = currentQ.type === 'multiple' || Array.isArray(currentQ.answer);
  const currentUserAns = userAnswers[currentQ.id];

  return (
    <div className="my-10 rounded-2xl border-2 border-teal-200/80 bg-gradient-to-b from-teal-50/40 via-white to-slate-50 p-5 sm:p-7 shadow-md">
      {/* 头部标题与答题进度栏 */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-teal-100">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-teal-600 text-white shadow-xs">
            <Sparkles className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900 m-0 leading-tight">{title}</h3>
            <p className="text-xs text-slate-500 mt-1 mb-0 font-medium">
              共 {questions.length} 道精选测试题 · 答题进度已自动保存
            </p>
          </div>
        </div>

        {/* 答题完成计数与重新答题按钮 */}
        <div className="flex items-center gap-2.5 self-start sm:self-auto">
          <div className="flex items-center gap-2 bg-white px-3.5 py-1.5 rounded-full border border-teal-200/60 shadow-2xs">
            <span className="text-xs font-semibold text-slate-600">已完成:</span>
            <span className="text-xs font-extrabold text-teal-700">
              {submittedCount} / {questions.length}
            </span>
          </div>

          {hasUserActivity && (
            <button
              type="button"
              onClick={handleResetQuiz}
              className="inline-flex items-center gap-1 text-xs font-bold text-slate-600 hover:text-rose-600 bg-white hover:bg-rose-50 border border-slate-200 hover:border-rose-200 px-3 py-1.5 rounded-full transition-all shadow-2xs cursor-pointer"
              title="清空答题记录并重新测试"
            >
              <RotateCcw className="w-3.5 h-3.5" /> 重新答题
            </button>
          )}
        </div>
      </div>

      {/* 题目导航条 (题号 Tab 快速切换，p-2 保证 ring-2 边框不被剪裁) */}
      <div className="mt-5 flex items-center gap-2.5 overflow-x-auto p-2 scrollbar-thin">
        {questions.map((q, idx) => {
          const submitted = !!submittedStatus[q.id];
          const correct = submitted && isQuestionCorrect(q);
          const active = idx === currentIndex;

          let tabStyle = 'border-slate-200 bg-white text-slate-600 hover:border-teal-300 hover:bg-teal-50/40';
          if (submitted) {
            tabStyle = correct
              ? 'border-emerald-400 bg-emerald-50 text-emerald-700 font-bold'
              : 'border-rose-400 bg-rose-50 text-rose-700 font-bold';
          }
          if (active) {
            tabStyle += ' border-2 border-teal-600 bg-teal-50/90 text-teal-900 font-extrabold ring-2 ring-teal-500/30 shadow-xs';
          }

          return (
            <button
              key={q.id}
              type="button"
              onClick={() => handleNavigate(idx)}
              className={`flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-lg border text-xs transition-all cursor-pointer ${tabStyle}`}
              title={`第 ${idx + 1} 题`}
            >
              {submitted ? (
                correct ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                ) : (
                  <XCircle className="w-4 h-4 text-rose-500" />
                )
              ) : (
                idx + 1
              )}
            </button>
          );
        })}
      </div>

      {/* 当前题目主卡片 */}
      <div
        key={currentQ.id}
        className={`mt-4 rounded-xl border transition-all p-5 sm:p-6 bg-white shadow-xs ${
          isCurrentSubmitted
            ? isCurrentCorrect
              ? 'border-emerald-300 bg-emerald-50/20'
              : 'border-rose-300 bg-rose-50/20'
            : 'border-slate-200 hover:border-teal-300'
        }`}
      >
        {/* 题号、类型 Tag 与题干 */}
        <div className="flex items-start gap-3">
          <span className="flex-shrink-0 flex items-center justify-center w-7 h-7 rounded-lg bg-teal-100 text-teal-800 text-xs font-extrabold">
            {currentIndex + 1} / {questions.length}
          </span>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
                {currentQ.type === 'code-output' ? (
                  <>
                    <Code2 className="w-3 h-3 mr-1 text-teal-600" /> 代码预测题
                  </>
                ) : currentQ.type === 'tf' ? (
                  '判断题'
                ) : isMulti ? (
                  '多选题'
                ) : (
                  '单选题'
                )}
              </span>
            </div>

            <h4 className="text-base font-bold text-slate-900 leading-snug m-0">
              {currentQ.question}
            </h4>
          </div>
        </div>

        {/* 带 AST 词法高亮的代码片段 */}
        {currentQ.codeSnippet && (
          <div className="mt-4 my-3 rounded-xl overflow-hidden border border-slate-800 bg-[#0d1117] shadow-inner">
            <div className="px-3.5 py-1.5 bg-[#161b22] border-b border-slate-800 text-[11px] font-mono text-teal-400 font-bold flex items-center gap-1.5">
              <Code2 className="w-3.5 h-3.5" /> Python Code Snippet
            </div>
            <div className="p-4 overflow-x-auto bg-transparent">
              <HighlightedCodeSnippet code={currentQ.codeSnippet} />
            </div>
          </div>
        )}

        {/* 选项列表 */}
        <div className="mt-4 space-y-2.5">
          {currentQ.options.map((opt, optIdx) => {
            const isSelected = isMulti
              ? Array.isArray(currentUserAns) && currentUserAns.includes(optIdx)
              : currentUserAns === optIdx;

            // 自动过滤掉文本中原有的 "A. ", "B. ", "A、", "A: " 等重复字母前缀
            const displayOptText = opt.replace(/^[A-Z][.、:\s]\s*/i, '');

            let optStyle =
              'border-slate-200 bg-white hover:border-teal-400 hover:bg-teal-50/40 text-slate-700';

            if (isCurrentSubmitted) {
              const isTargetCorrect = Array.isArray(currentQ.answer)
                ? currentQ.answer.includes(optIdx)
                : currentQ.answer === optIdx;

              if (isTargetCorrect) {
                optStyle =
                  'border-emerald-500 bg-emerald-50 text-emerald-900 font-semibold ring-1 ring-emerald-500';
              } else if (isSelected && !isTargetCorrect) {
                optStyle =
                  'border-rose-400 bg-rose-50 text-rose-900 font-semibold line-through opacity-90';
              } else {
                optStyle = 'border-slate-200 bg-slate-50 text-slate-400 opacity-60';
              }
            } else if (isSelected) {
              optStyle =
                'border-teal-600 bg-teal-50/80 text-teal-900 font-semibold ring-2 ring-teal-500/20';
            }

            return (
              <button
                key={optIdx}
                type="button"
                disabled={isCurrentSubmitted}
                onClick={() => handleSelectOption(currentQ.id, optIdx, isMulti)}
                className={`w-full text-left p-3.5 rounded-xl border text-xs sm:text-sm transition-all flex items-start gap-3 cursor-pointer disabled:cursor-default ${optStyle}`}
              >
                <span className="flex-shrink-0 font-bold font-mono text-xs opacity-75 mt-0.5">
                  {String.fromCharCode(65 + optIdx)}.
                </span>
                <span className="leading-relaxed flex-1">{displayOptText}</span>
              </button>
            );
          })}
        </div>

        {/* 提交校验与解析展开 */}
        <div className="mt-5 flex items-center justify-between">
          {!isCurrentSubmitted ? (
            <button
              type="button"
              disabled={currentUserAns === undefined}
              onClick={() => handleSubmitQuestion(currentQ.id)}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-teal-600 text-white text-xs font-bold hover:bg-teal-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-xs cursor-pointer"
            >
              提交校验答案 <ArrowRight className="w-3.5 h-3.5" />
            </button>
          ) : (
            <div className="flex items-center gap-2">
              {isCurrentCorrect ? (
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
                onClick={() => {
                  const nextExp = { ...showExplanation, [currentQ.id]: !showExplanation[currentQ.id] };
                  setShowExplanation(nextExp);
                  saveProgress(userAnswers, submittedStatus, nextExp, currentIndex);
                }}
                className="inline-flex items-center gap-1 text-xs font-bold text-teal-700 hover:text-teal-900 bg-teal-50 px-2.5 py-1.5 rounded-lg transition-colors border border-teal-200/60 cursor-pointer"
              >
                <HelpCircle className="w-3.5 h-3.5 text-teal-600" />
                {showExplanation[currentQ.id] ? '收起解析' : '查看解析'}
                {showExplanation[currentQ.id] ? (
                  <ChevronUp className="w-3 h-3" />
                ) : (
                  <ChevronDown className="w-3 h-3" />
                )}
              </button>
            </div>
          )}
        </div>

        {/* 考点解析扩展面板 */}
        {isCurrentSubmitted && showExplanation[currentQ.id] && (
          <div className="mt-4 p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700 leading-relaxed">
            <div className="font-bold text-slate-900 flex items-center gap-1.5 mb-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" /> 考点精讲与解析：
            </div>
            <p className="m-0 text-slate-700">{currentQ.explanation}</p>
          </div>
        )}
      </div>

      {/* 左右翻页控制器 */}
      <div className="mt-5 flex items-center justify-between pt-4 border-t border-slate-200/80">
        <button
          type="button"
          disabled={currentIndex === 0}
          onClick={() => handleNavigate(currentIndex - 1)}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg border border-slate-200 text-slate-700 bg-white text-xs font-bold hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer"
        >
          <ChevronLeft className="w-4 h-4" /> 上一题
        </button>

        <span className="text-xs font-bold text-slate-500">
          {currentIndex + 1} / {questions.length}
        </span>

        <button
          type="button"
          disabled={currentIndex === questions.length - 1}
          onClick={() => handleNavigate(currentIndex + 1)}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-teal-600 text-white text-xs font-bold hover:bg-teal-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-xs cursor-pointer"
        >
          下一题 <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* 全部完成时的成绩总结大卡片 */}
      {isAllSubmitted && (
        <div className="mt-8 p-6 rounded-2xl bg-gradient-to-r from-teal-900 to-slate-900 text-white shadow-xl flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="p-3.5 rounded-2xl bg-teal-500/20 border border-teal-400/30 text-teal-300">
              <Trophy className="w-8 h-8 text-amber-400" />
            </div>
            <div>
              <h4 className="text-lg font-bold text-white m-0">恭喜完成全部检测题！</h4>
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
