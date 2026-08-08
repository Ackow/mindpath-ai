'use client';

import React from 'react';
import Link from 'next/link';
import { Bookmark } from 'lucide-react';
import { Card } from '@/components/ui/Card';

type Note = {
  title?: string;
  module?: string;
  estimatedMinutes?: number;
  summary?: string;
  route: string;
};

export function RecentNotes({ notes }: { notes: Note[] }) {
  const [recent, setRecent] = React.useState<Note[]>([]);
  const [isLoaded, setIsLoaded] = React.useState(false);

  React.useEffect(() => {
    void fetch('/api/progress', { credentials: 'include' })
      .then((response) => response.ok ? response.json() : null)
      .then((data) => {
        const timestamps = new Map<string, number>((data?.progress || []).map((item: { document_id: string; updated_at: string }) => [item.document_id, Date.parse(item.updated_at) || 0]));
        const visited = [...notes].filter((note) => timestamps.has(note.route)).sort((a, b) => (timestamps.get(b.route) || 0) - (timestamps.get(a.route) || 0));
        setRecent(visited.slice(0, 3));
      })
      .catch(() => setRecent([]))
      .finally(() => setIsLoaded(true));
  }, [notes]);

  if (!isLoaded || recent.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4 pt-2">
      <div className="flex items-center justify-between">
        <h2 className="font-bold text-slate-800 text-lg">最近学习的笔记</h2>
        <Link href="/map" className="text-xs font-medium text-slate-400 hover:text-teal-600 flex items-center gap-1 transition-colors">
          查看全部 &rarr;
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
        {recent.map((note) => (
          <Card key={note.route} hoverable className="flex flex-col justify-between p-5">
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
    </div>
  );
}
