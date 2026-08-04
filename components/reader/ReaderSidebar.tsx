'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Card } from '@/components/ui/Card';
import { ChevronDown, ChevronRightIcon, CheckCircle2 } from 'lucide-react';
import { getGlobalGraphNodes, getHierarchicalModuleTree } from '@/lib/graph';
import { readDocumentProgress } from '@/components/mdx/TaskCheckbox';

export const ReaderSidebar: React.FC = () => {
  const pathname = usePathname();
  const allNodes = getGlobalGraphNodes();
  const currentNode = allNodes.find((node) => node.route === pathname) || allNodes.find((node) => node.route.startsWith('/learn/')) || allNodes[0];
  const moduleTree = getHierarchicalModuleTree();
  const currentModuleGroup = moduleTree.find((module) => module.id === currentNode.module) || moduleTree[0];
  const moduleNodes = useMemo(() => allNodes.filter((node) => node.module === currentNode.module && node.route.startsWith('/learn/')), [allNodes, currentNode.module]);
  const [revision, setRevision] = useState(0);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    const refresh = () => setRevision((value) => value + 1);
    setIsHydrated(true);
    window.addEventListener('ai-learning:document-progress', refresh);
    return () => window.removeEventListener('ai-learning:document-progress', refresh);
  }, []);

  const progressFor = (route: string) => {
    void revision;
    if (!isHydrated) return 0;
    const progress = readDocumentProgress(route);
    if (progress.completed) return 100;
    const total = progress.taskTotal || 0;
    const checked = Object.values(progress.tasks).filter(Boolean).length;
    return total > 0 ? Math.round((checked / total) * 100) : 0;
  };
  const moduleCompleted = moduleNodes.filter((node) => progressFor(node.route) === 100).length;
  const modulePercent = moduleNodes.length > 0 ? Math.round((moduleCompleted / moduleNodes.length) * 100) : 0;

  return (
    <div className="w-full shrink-0 space-y-4 md:sticky md:top-20 md:self-start md:w-64 xl:w-72">
      <Card className="space-y-4 border border-slate-200/80 p-4 shadow-sm">
        <h2 className="flex items-center justify-between border-b border-slate-100 pb-3 text-sm font-extrabold text-slate-800">
          <span className="truncate">{currentModuleGroup.title}</span>
          <span className="shrink-0 rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-500">{moduleNodes.length} 章节</span>
        </h2>
        <div className="max-h-[72vh] space-y-3 overflow-y-auto pr-1 text-xs">
          {currentModuleGroup.submodules.length > 0 ? currentModuleGroup.submodules.map((sub) => (
            <div key={sub.id} className="space-y-1">
              <div className="flex items-center gap-1.5 py-1 font-bold text-slate-700"><ChevronDown className="h-3.5 w-3.5 shrink-0 text-teal-600" /><span className="font-extrabold text-slate-800">{sub.title}</span></div>
              <div className="space-y-1 pl-3">
                {sub.children.map((node) => <ReaderChapterLink key={node.id} node={node} active={node.id === currentNode.id} percent={progressFor(node.route)} />)}
              </div>
            </div>
          )) : moduleNodes.map((node) => <ReaderChapterLink key={node.id} node={node} active={node.id === currentNode.id} percent={progressFor(node.route)} />)}
        </div>
        <div className="space-y-3 border-t border-slate-100 pt-4">
          <div className="flex items-baseline justify-between"><span className="text-xs font-bold text-slate-500">本模块进度</span><span className="text-xl font-black text-teal-600">{modulePercent}%</span></div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100"><div className="h-full bg-teal-500 transition-all duration-500" style={{ width: `${modulePercent}%` }} /></div>
          <div className="text-[11px] font-medium text-slate-400">已完成 {moduleCompleted} / {moduleNodes.length} 个章节</div>
          <Link href="/map" className="mt-2 flex w-full items-center justify-center gap-1 rounded-xl border border-slate-200 bg-white py-2 text-xs font-bold text-slate-700 shadow-2xs transition-all hover:bg-slate-50"><span>查看知识全景图</span><ChevronRightIcon className="h-3.5 w-3.5 text-slate-400" /></Link>
        </div>
      </Card>
    </div>
  );
};

function ReaderChapterLink({ node, active, percent }: { node: ReturnType<typeof getGlobalGraphNodes>[number]; active: boolean; percent: number }) {
  return (
    <Link href={node.route} className={`flex items-center justify-between rounded-xl px-2.5 py-1.5 text-xs transition-all ${active ? 'border border-teal-200/80 bg-teal-50 font-extrabold text-teal-700 shadow-sm' : 'font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-900'}`}>
      <span className="truncate">{node.title}</span>
      {percent === 100 ? <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-500" /> : percent > 0 ? <span className="shrink-0 text-[10px] font-bold text-amber-600">{percent}%</span> : <span className="h-2 w-2 shrink-0 rounded-full bg-slate-300" />}
    </Link>
  );
}
