import React from 'react';
import { ReaderSidebar } from '@/components/reader/ReaderSidebar';

export default function LearnLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex w-full items-start gap-6">
      <ReaderSidebar />
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
}
