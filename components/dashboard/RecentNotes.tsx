'use client';

import React from 'react';
import Link from 'next/link';
import { Bookmark } from 'lucide-react';
import { Card } from '@/components/ui/Card';

const RECENT_KEY = 'ai-learning:recent-notes';

type Note = {
  title?: string;
  module?: string;
  estimatedMinutes?: number;
  summary?: string;
  route: string;
};

export function RecentNotes({ notes }: { notes: Note[] }) {
  const [recent, setRecent] = React.useState(notes.slice(-3).reverse());

  React.useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(RECENT_KEY) || '{}') as Record<string, number>;
      const ordered = [...notes].sort((a, b) => (saved[b.route] || 0) - (saved[a.route] || 0));
      const visited = ordered.filter((note) => saved[note.route]);
      setRecent((visited.length ? visited : notes.slice(-3).reverse()).slice(0, 3));
    } catch {
      setRecent(notes.slice(-3).reverse());
    }
  }, [notes]);

  return (
    <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
      {recent.map((note) => (
        <Card key={note.route} hoverable className="flex flex-col justify-between">
          <Link href={note.route} className="block space-y-3">
            <div className="flex items-start justify-between gap-2">
              <h3 className="line-clamp-1 text-sm font-bold text-slate-800 transition-colors hover:text-teal-600">{note.title}</h3>
              <Bookmark className="h-4 w-4 shrink-0 text-slate-300" />
            </div>
            <div className="flex items-center gap-2">
              <span className="rounded bg-teal-50 px-2 py-0.5 text-[10px] font-semibold text-teal-700">{note.module}</span>
              <span className="text-[11px] text-slate-400">{note.estimatedMinutes || 25} 分钟阅读</span>
            </div>
            <p className="line-clamp-2 text-xs leading-relaxed text-slate-500">{note.summary}</p>
          </Link>
        </Card>
      ))}
    </div>
  );
}
