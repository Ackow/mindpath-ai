'use client';

import React, { useEffect, useState } from 'react';
import { readDocumentProgress } from '@/components/mdx/TaskCheckbox';

export interface ProgressNode {
  id: string;
  route: string;
  module: string;
  estimatedMinutes?: number;
}

function getProgress(nodes: ProgressNode[]) {
  const values = nodes.map((node) => {
    const progress = readDocumentProgress(node.route);
    if (progress.completed) return 100;
    const total = progress.taskTotal || 0;
    const checked = Object.values(progress.tasks).filter(Boolean).length;
    return total > 0 ? Math.round((checked / total) * 100) : 0;
  });
  return values.length ? Math.round(values.reduce((sum, value) => sum + value, 0) / values.length) : 0;
}

export const LearningProgressSummary: React.FC<{ nodes: ProgressNode[] }> = ({ nodes }) => {
  const [percent, setPercent] = useState(0);
  const [completed, setCompleted] = useState(0);

  useEffect(() => {
    const refresh = () => {
      setPercent(getProgress(nodes));
      setCompleted(nodes.filter((node) => readDocumentProgress(node.route).completed).length);
    };
    refresh();
    window.addEventListener('ai-learning:document-progress', refresh);
    return () => window.removeEventListener('ai-learning:document-progress', refresh);
  }, [nodes]);

  return (
    <div className="flex items-center gap-5 py-2">
      <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-full p-2" style={{ background: `conic-gradient(#14b8a6 ${percent}%, #e7eef3 ${percent}% 100%)` }}>
        <div className="flex h-full w-full flex-col items-center justify-center rounded-full bg-white text-teal-700">
          <span className="text-2xl font-black">{percent}%</span>
          <span className="text-[10px] font-bold">总体进度</span>
        </div>
      </div>
      <div className="min-w-0 flex-1 space-y-2 text-xs">
        <div className="flex items-center justify-between border-b border-slate-100 pb-2 text-slate-500"><span>已完成章节</span><strong className="text-slate-800">{completed} / {nodes.length}</strong></div>
        <div className="flex items-center justify-between text-slate-500"><span>学习状态</span><strong className="text-teal-700">实时同步</strong></div>
        <div className="text-[11px] leading-relaxed text-slate-400">任务清单与章节完成标记会自动更新进度。</div>
      </div>
    </div>
  );
};

export const LearningProgressBar: React.FC<{ nodes: ProgressNode[]; colorClassName?: string }> = ({ nodes, colorClassName = 'bg-teal-500' }) => {
  const [percent, setPercent] = useState(0);
  useEffect(() => {
    const refresh = () => setPercent(getProgress(nodes));
    refresh();
    window.addEventListener('ai-learning:document-progress', refresh);
    return () => window.removeEventListener('ai-learning:document-progress', refresh);
  }, [nodes]);
  return <div className={`h-full rounded-full transition-all ${colorClassName}`} style={{ width: `${percent}%` }} aria-label={`学习进度 ${percent}%`} />;
};

export const LearningProgressValue: React.FC<{ nodes: ProgressNode[] }> = ({ nodes }) => {
  const [percent, setPercent] = useState(0);
  useEffect(() => {
    const refresh = () => setPercent(getProgress(nodes));
    refresh();
    window.addEventListener('ai-learning:document-progress', refresh);
    return () => window.removeEventListener('ai-learning:document-progress', refresh);
  }, [nodes]);
  return <span className="font-semibold text-slate-500">{percent}%</span>;
};
