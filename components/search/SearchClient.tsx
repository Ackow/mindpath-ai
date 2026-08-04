'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ArrowRight, BookOpen, Clock, Search, Tag } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import type { ContentIndexEntry } from '@/lib/content';

interface SearchClientProps {
  entries: ContentIndexEntry[];
}

export const SearchClient: React.FC<SearchClientProps> = ({ entries }) => {
  const [query, setQuery] = useState('');
  const filtered = entries.filter((entry) => {
    const searchable = `${entry.title} ${entry.summary || ''} ${(entry.tags || []).join(' ')}`.toLowerCase();
    return searchable.includes(query.trim().toLowerCase());
  });

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="space-y-4 text-center py-4">
        <h1 className="text-2xl font-extrabold text-slate-900">站内知识检索</h1>
        <p className="text-xs text-slate-400">检索当前知识库中实际存在的 {entries.length} 篇笔记</p>
        <div className="relative max-w-xl mx-auto">
          <Search className="absolute left-4 top-3.5 w-5 h-5 text-slate-400" />
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="输入关键字、算法或公式..."
            className="w-full pl-12 pr-4 py-3 bg-white rounded-xl border border-slate-200 shadow-card outline-none text-slate-800 text-sm focus:border-teal-500 focus:ring-2 focus:ring-teal-100 transition-all"
          />
        </div>
      </div>

      <div className="space-y-4 pt-2">
        <div className="text-xs text-slate-400 font-medium">找到 {filtered.length} 篇实际笔记</div>
        {filtered.map((entry) => (
          <Card key={entry.route} hoverable className="p-5">
            <Link href={entry.route} className="block space-y-2">
              <div className="flex items-center justify-between gap-3">
                <span className="inline-flex items-center gap-1 text-xs font-bold text-teal-700 bg-teal-50 px-2.5 py-0.5 rounded-full border border-teal-200"><BookOpen className="w-3 h-3" />{entry.module}</span>
                <span className="text-[11px] text-slate-400 flex items-center gap-1 shrink-0"><Clock className="w-3 h-3" />{entry.estimatedMinutes} 分钟</span>
              </div>
              <h2 className="text-base font-bold text-slate-800 hover:text-teal-600 transition-colors">{entry.title}</h2>
              {entry.summary && <p className="text-xs text-slate-500 leading-relaxed">{entry.summary}</p>}
              <div className="flex items-center justify-between gap-3 pt-2 border-t border-slate-100">
                <div className="flex flex-wrap gap-1.5">{(entry.tags || []).map((tag) => <span key={tag} className="inline-flex items-center gap-1 text-[10px] text-slate-500 bg-slate-100 px-2 py-0.5 rounded"><Tag className="w-2.5 h-2.5" />{tag}</span>)}</div>
                <span className="text-xs text-teal-600 font-medium flex items-center gap-1 shrink-0">阅读笔记 <ArrowRight className="w-3.5 h-3.5" /></span>
              </div>
            </Link>
          </Card>
        ))}
      </div>
    </div>
  );
};
