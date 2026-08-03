'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Card } from '@/components/ui/Card';
import { ConceptCard } from '@/components/mdx/ConceptCard';
import { RunnableCodeBlock } from '@/components/mdx/RunnableCodeBlock';
import { getNodeById, getGlobalGraphNodes, getHierarchicalModuleTree } from '@/lib/graph';
import {
  ChevronRight,
  ChevronDown,
  Clock,
  Check,
  CheckSquare,
  Bookmark,
  ChevronRightIcon
} from 'lucide-react';

interface NoteReaderClientProps {
  slug: string[];
  frontmatter?: any;
  rawContent?: string;
  children?: React.ReactNode;
}

export const NoteReaderClient: React.FC<NoteReaderClientProps> = ({
  slug,
  frontmatter,
  rawContent = '',
  children,
}) => {
  const currentRoute = `/learn/${slug.join('/')}`;
  const allNodes = getGlobalGraphNodes();
  const currentNode = allNodes.find((n) => n.route === currentRoute) || allNodes[0];

  const title = frontmatter?.title || currentNode.title;
  const summary = frontmatter?.summary || currentNode.summary;

  // 1. Dynamic Hierarchical Table of Contents (TOC) with H2/H3 levels
  const parsedToc = rawContent
    .split('\n')
    .filter((line) => line.startsWith('## ') || line.startsWith('### '))
    .map((line, idx) => ({
      id: `heading-${idx}`,
      title: line.replace(/^#{2,3}\s+/, '').trim(),
      level: line.startsWith('### ') ? 3 : 2,
    }));

  const toc = parsedToc.length > 0 ? parsedToc : [
    { id: 'sec-1', title: '章节导读', level: 2 },
    { id: 'sec-2', title: '核心推导与实现', level: 2 },
    { id: 'sec-3', title: '实验与延伸', level: 2 },
  ];

  const [activeTocId, setActiveTocId] = useState(toc[0]?.id || 'sec-1');

  // Exact Pixel-Offset Smooth Scroll to Heading (Guaranteeing Title is 100% Visible Below Fixed Header)
  const handleTocClick = (item: { id: string; title: string }) => {
    setActiveTocId(item.id);
    let target = document.getElementById(`heading-${item.title}`) || document.getElementById(item.id);
    if (!target) {
      const headings = Array.from(document.querySelectorAll('h2, h3'));
      target = headings.find((h) => h.textContent?.trim().includes(item.title)) || null;
    }
    if (target) {
      const navbarOffset = 100; // 100px safe gap below fixed navbar
      const elementTop = target.getBoundingClientRect().top;
      const offsetPosition = elementTop + window.scrollY - navbarOffset;

      window.scrollTo({
        top: Math.max(0, offsetPosition),
        behavior: 'smooth',
      });
    }
  };

  // 2. Frontmatter-driven Symbols/Terms Array (Explicitly specified by author in MDX Header)
  const symbols: { symbol: string; mean: string }[] = frontmatter?.symbols || [];
  const hasMathSymbols = symbols.some((s) => s.symbol.length === 1 || s.symbol.startsWith('$'));

  // 3. Dynamic Related Notes loaded from real nodes in graph
  const realRelatedNotes = allNodes
    .filter((n) => n.id !== currentNode.id && (n.module === currentNode.module || currentNode.prerequisites.includes(n.id) || currentNode.next.includes(n.id)))
    .slice(0, 3)
    .map((n) => ({
      id: n.id,
      title: n.title,
      route: n.route,
      badge: n.tags[0] || (n.difficulty === 'beginner' ? '入门基础' : '核心概念'),
      badgeColor: n.difficulty === 'beginner' ? 'bg-emerald-50 text-emerald-600 border-emerald-200' : 'bg-sky-50 text-sky-600 border-sky-200',
      time: `${n.estimatedMinutes || 25} 分钟`,
    }));

  // 4. Real Module Chapters & Real Completion Progress
  const moduleTree = getHierarchicalModuleTree();
  const currentModuleGroup = moduleTree.find((m) => m.id === currentNode.module) || moduleTree[0];
  const moduleNodes = allNodes.filter((n) => n.module === currentNode.module);

  const moduleTotal = moduleNodes.length;
  const moduleCompleted = moduleNodes.filter((n) => n.status === 'completed' || n.progressPercent === 100).length;
  const modulePercent = moduleTotal > 0 ? Math.round((moduleCompleted / moduleTotal) * 100) : 100;

  return (
    <div className="flex flex-col md:flex-row gap-6 w-full items-start">
      {/* Left Sidebar: Sticky Collapsible Module Chapter Index */}
      <div className="w-full md:w-64 xl:w-72 shrink-0 space-y-4 sticky top-20 self-start">
        <Card className="p-4 space-y-4 border border-slate-200/80 shadow-sm">
          <h2 className="font-extrabold text-slate-800 text-sm border-b border-slate-100 pb-3 flex items-center justify-between">
            <span className="truncate">{currentModuleGroup.title}</span>
            <span className="text-[10px] bg-slate-100 text-slate-500 font-bold px-2 py-0.5 rounded-full shrink-0">
              {moduleTotal} 章节
            </span>
          </h2>

          {/* Module Chapter Tree */}
          <div className="space-y-3 text-xs max-h-[72vh] overflow-y-auto pr-1">
            {currentModuleGroup.submodules.length > 0 ? (
              currentModuleGroup.submodules.map((sub) => (
                <div key={sub.id} className="space-y-1">
                  <div className="font-bold text-slate-700 py-1 flex items-center gap-1.5 cursor-pointer">
                    <ChevronDown className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                    <span className="text-slate-800 font-extrabold">{sub.title}</span>
                  </div>
                  <div className="pl-3 space-y-1">
                    {sub.children.map((n) => {
                      const isActive = n.id === currentNode.id;
                      return (
                        <Link
                          key={n.id}
                          href={n.route}
                          className={`py-1.5 px-2.5 rounded-xl flex items-center justify-between text-xs transition-all ${
                            isActive
                              ? 'bg-teal-50 text-teal-700 font-extrabold border border-teal-200/80 shadow-sm'
                              : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900 font-medium'
                          }`}
                        >
                          <span className="truncate">{n.title}</span>
                          <span
                            className={`w-2 h-2 rounded-full shrink-0 ${
                              isActive ? 'bg-teal-600 shadow-sm' : 'bg-slate-300'
                            }`}
                          />
                        </Link>
                      );
                    })}
                  </div>
                </div>
              ))
            ) : (
              <div className="space-y-1">
                {moduleNodes.map((n) => {
                  const isActive = n.id === currentNode.id;
                  return (
                    <Link
                      key={n.id}
                      href={n.route}
                      className={`py-1.5 px-2.5 rounded-xl flex items-center justify-between text-xs transition-all ${
                        isActive
                          ? 'bg-teal-50 text-teal-700 font-extrabold border border-teal-200/80 shadow-sm'
                          : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900 font-medium'
                      }`}
                    >
                      <span className="truncate">{n.title}</span>
                      <span
                        className={`w-2 h-2 rounded-full shrink-0 ${
                          isActive ? 'bg-teal-600 shadow-sm' : 'bg-slate-300'
                        }`}
                      />
                    </Link>
                  );
                })}
              </div>
            )}
          </div>

          {/* Module Progress Card */}
          <div className="pt-4 border-t border-slate-100 space-y-3">
            <div className="flex justify-between items-baseline">
              <span className="text-xs text-slate-500 font-bold">本模块进度</span>
              <span className="text-xl font-black text-teal-600">{modulePercent}%</span>
            </div>
            <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
              <div
                className="bg-teal-500 h-full transition-all duration-500"
                style={{ width: `${modulePercent}%` }}
              />
            </div>
            <div className="text-[11px] text-slate-400 font-medium">
              已完成 {moduleCompleted} / {moduleTotal} 个章节
            </div>

            <Link
              href="/map"
              className="w-full mt-2 border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold py-2 rounded-xl flex items-center justify-center gap-1 transition-all shadow-2xs"
            >
              <span>查看知识全景图</span>
              <ChevronRightIcon className="w-3.5 h-3.5 text-slate-400" />
            </Link>
          </div>
        </Card>
      </div>

      {/* Center Main MDX Content */}
      <div className="flex-1 space-y-6 min-w-0">
        <Card className="p-6 md:p-8 space-y-6 border border-slate-200/80 shadow-sm">
          {/* Breadcrumbs & Metadata */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <Link href="/map" className="hover:text-teal-600">知识库</Link>
              <span>/</span>
              <span className="hover:text-teal-600 cursor-pointer">{currentModuleGroup.title}</span>
              <span>/</span>
              <span className="text-slate-700 font-bold">{title}</span>
            </div>

            <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">
              {title}
            </h1>

            <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
              <div className="flex items-center gap-2 text-xs">
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-extrabold border border-emerald-200">
                  难度: {currentNode.difficulty === 'beginner' ? '入门' : '中等'}
                </span>
                <span className="flex items-center gap-1 text-slate-500 px-2.5 py-0.5 bg-slate-100 rounded-full font-medium">
                  <Clock className="w-3.5 h-3.5" /> 预计阅读 {currentNode.estimatedMinutes || 25} 分钟
                </span>
                <span className="text-teal-600 flex items-center gap-1 font-bold">
                  <Check className="w-4 h-4" /> 已加入学习路线
                </span>
              </div>

              <button className="flex items-center gap-1.5 bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold px-4 py-2 rounded-xl shadow-md transition-all">
                <CheckSquare className="w-4 h-4" />
                标记为已完成
              </button>
            </div>
          </div>

          <hr className="border-slate-100" />

          {/* Render Server-Compiled MDX Content Streamed via Children Slot */}
          <div className="space-y-5 text-sm text-slate-700 leading-relaxed">
            {summary && (
              <ConceptCard title="核心导读" type="intuition">
                {summary}
              </ConceptCard>
            )}

            <div className="prose max-w-none text-slate-700">
              {children || (
                <div className="space-y-3">
                  <p>{currentNode.summary}</p>
                  <RunnableCodeBlock title={`用 Python 运行 ${title}`} />
                </div>
              )}
            </div>
          </div>
        </Card>
      </div>

      {/* Right Sidebar: Hierarchical Smooth-Scroll TOC with Normal Font Weight */}
      <div className="w-full md:w-56 xl:w-64 shrink-0 space-y-4 sticky top-20 self-start">
        {/* 本页目录 */}
        <Card className="p-4 space-y-3 border border-slate-200/80 shadow-sm">
          <h3 className="font-extrabold text-slate-800 text-xs border-b border-slate-100 pb-2">
            本页目录
          </h3>
          <div className="space-y-1 text-xs max-h-[35vh] overflow-y-auto pr-1">
            {toc.map((item, idx) => {
              const isActive = activeTocId === item.id || idx === 0;
              const isSubHeading = item.level === 3;
              return (
                <div
                  key={item.id}
                  onClick={() => handleTocClick(item)}
                  className={`py-1.5 rounded-lg cursor-pointer transition-all flex items-center gap-2 text-xs font-normal ${
                    isSubHeading ? 'pl-6 text-slate-500' : 'pl-2 text-slate-700'
                  } ${
                    isActive
                      ? 'bg-teal-50 text-teal-700 font-semibold border-l-4 border-teal-600 shadow-2xs'
                      : 'hover:bg-slate-50'
                  }`}
                >
                  <Bookmark className={`shrink-0 ${
                    isSubHeading ? 'w-3 h-3 text-slate-300' : (isActive ? 'w-3.5 h-3.5 text-teal-600 fill-teal-100' : 'w-3.5 h-3.5 text-slate-400')
                  }`} />
                  <span className="truncate">{item.title}</span>
                </div>
              );
            })}
          </div>
        </Card>

        {/* 仅在 Frontmatter 显式配置了 symbols 时渲染术语/符号表 */}
        {symbols.length > 0 && (
          <Card className="p-4 space-y-3 border border-slate-200/80 shadow-sm">
            <h3 className="font-extrabold text-slate-800 text-xs border-b border-slate-100 pb-2">
              {hasMathSymbols ? '核心公式符号表' : '核心概念术语表'}
            </h3>
            <div className="space-y-1.5 text-xs max-h-48 overflow-y-auto pr-1">
              <div className="grid grid-cols-2 text-[11px] font-bold text-slate-400 bg-slate-50 p-1.5 rounded-lg border border-slate-100">
                <span>{hasMathSymbols ? '符号' : '术语'}</span>
                <span>含义</span>
              </div>
              {symbols.map((item, idx) => (
                <div key={idx} className="grid grid-cols-2 text-xs py-1.5 px-1 border-b border-slate-50 last:border-0 items-center">
                  <span className="font-mono font-bold text-teal-700 truncate">{item.symbol}</span>
                  <span className="text-slate-600 font-medium truncate">{item.mean}</span>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* 关联笔记 */}
        <Card className="p-4 space-y-3 border border-slate-200/80 shadow-sm">
          <div className="flex justify-between items-center border-b border-slate-100 pb-2">
            <h3 className="font-extrabold text-slate-800 text-xs">关联推荐笔记</h3>
            <Link href="/map" className="text-[11px] text-teal-600 hover:underline font-bold">查看全部</Link>
          </div>
          <div className="space-y-2.5 text-xs">
            {realRelatedNotes.map((note) => (
              <Link
                key={note.id}
                href={note.route}
                className="block p-3 rounded-xl border border-slate-100 hover:border-slate-300 hover:shadow-xs transition-all cursor-pointer space-y-1.5 bg-white"
              >
                <div className="font-bold text-slate-800 hover:text-teal-600 leading-snug truncate">{note.title}</div>
                <div className="flex items-center justify-between text-[10px] text-slate-400 pt-0.5">
                  <span className={`px-2 py-0.5 rounded-md font-bold border ${note.badgeColor}`}>{note.badge}</span>
                  <span className="flex items-center gap-1 font-medium"><Clock className="w-3 h-3" /> {note.time}</span>
                </div>
              </Link>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
};
