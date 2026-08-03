import React from 'react';

export default function Loading() {
  return (
    <div className="w-full max-w-[1850px] mx-auto p-4 animate-pulse space-y-6">
      <div className="flex gap-6 items-start">
        {/* Left Sidebar Skeleton */}
        <div className="hidden md:block w-72 h-[680px] bg-slate-200/70 rounded-2xl shrink-0" />
        
        {/* Main Content Skeleton */}
        <div className="flex-1 space-y-4">
          <div className="h-8 bg-slate-200/70 rounded-xl w-3/4" />
          <div className="h-4 bg-slate-200/60 rounded-lg w-1/2" />
          <div className="h-96 bg-slate-200/50 rounded-2xl mt-6" />
        </div>

        {/* Right Sidebar Skeleton */}
        <div className="hidden lg:block w-64 h-[500px] bg-slate-200/70 rounded-2xl shrink-0" />
      </div>
    </div>
  );
}
