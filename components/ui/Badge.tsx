import React from 'react';
import { NodeDifficulty, NodeStatus } from '@/lib/types';

interface StatusBadgeProps {
  status: NodeStatus;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  if (status === 'completed') {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-600 border border-emerald-200">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
        已完成
      </span>
    );
  }
  if (status === 'in_progress') {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-50 text-amber-600 border border-amber-200">
        <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
        进行中
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-500 border border-slate-200">
      <span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span>
      未开始
    </span>
  );
};

interface DifficultyBadgeProps {
  difficulty: NodeDifficulty;
}

export const DifficultyBadge: React.FC<DifficultyBadgeProps> = ({ difficulty }) => {
  const map = {
    beginner: { text: '难度: 入门', class: 'bg-teal-50 text-teal-700 border-teal-200' },
    intermediate: { text: '难度: 中等', class: 'bg-amber-50 text-amber-700 border-amber-200' },
    advanced: { text: '难度: 进阶', class: 'bg-rose-50 text-rose-700 border-rose-200' },
  };
  const item = map[difficulty] || map.beginner;

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${item.class}`}>
      {item.text}
    </span>
  );
};
