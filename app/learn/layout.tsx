import React from 'react';
import { ReaderSidebar } from '@/components/reader/ReaderSidebar';

export default function LearnLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col md:flex-row w-full items-start gap-4 md:gap-6">
      <ReaderSidebar />
      <div className="min-w-0 flex-1 w-full">{children}</div>
    </div>
  );
}
