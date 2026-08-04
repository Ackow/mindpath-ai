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
  if (values.length === 0) return 0;
  return Math.round(values.reduce((sum, value) => sum + value, 0) / values.length);
}

export const LearningProgressSummary: React.FC<{ nodes: ProgressNode[] }> = ({ nodes }) => {
  const [percent, setPercent] = useState(0);
  const refresh = () => setPercent(getProgress(nodes));

  useEffect(() => {
    refresh();
    window.addEventListener('ai-learning:document-progress', refresh);
    return () => window.removeEventListener('ai-learning:document-progress', refresh);
  }, [nodes]);

  return (
    <div className="flex items-center gap-4 py-2">
      <div className="w-20 h-20 rounded-full bg-teal-50 border border-teal-100 text-teal-700 flex flex-col items-center justify-center shrink-0">
        <span className="text-2xl font-black">{percent}%</span>
        <span className="text-[10px] font-bold">整体进度</span>
      </div>
      <div className="space-y-2.5 text-xs">
        <div className="text-slate-500">已纳入进度的文档</div>
        <div className="font-semibold text-slate-800">{nodes.length} 篇</div>
        <div className="text-slate-500">勾选任务或确认完成后自动更新</div>
      </div>
    </div>
  );
};

export const LearningProgressBar: React.FC<{ nodes: ProgressNode[] }> = ({ nodes }) => {
  const [percent, setPercent] = useState(0);
  useEffect(() => {
    const refresh = () => setPercent(getProgress(nodes));
    refresh();
    window.addEventListener('ai-learning:document-progress', refresh);
    return () => window.removeEventListener('ai-learning:document-progress', refresh);
  }, [nodes]);

  return <div className="h-full rounded-full bg-teal-500 transition-all" style={{ width: `${percent}%` }} aria-label={`学习进度 ${percent}%`} />;
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
