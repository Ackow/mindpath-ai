'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import katex from 'katex';
import 'katex/dist/katex.min.css';
import { Card } from '@/components/ui/Card';
import { ConceptCard } from '@/components/mdx/ConceptCard';
import { RunnableCodeBlock } from '@/components/mdx/RunnableCodeBlock';
import { DocumentTaskProgress, readDocumentProgress, writeDocumentProgress } from '@/components/mdx/TaskCheckbox';
import { getNodeById, getGlobalGraphNodes, getCurriculumModules, getHierarchicalModuleTree } from '@/lib/graph';
import {
  ChevronRight,
  ChevronRightIcon,
  ChevronDown,
  Clock,
  Check,
  CheckSquare,
  Bookmark,
  BookOpen
} from 'lucide-react';

function MathSymbolItem({ symbol }: { symbol: string }) {
  const cleanSymbol = symbol.trim().replace(/^\$+|\$+$/g, '');
  const isLatex = /[\\[\]{}^_=\in\lVert\mathbb\sigma\lambda\theta]/.test(symbol) || symbol.startsWith('$');

  if (isLatex) {
    try {
      const html = katex.renderToString(cleanSymbol, { throwOnError: false });
      return (
        <span
          className="text-teal-700 text-xs shrink-0 max-w-[45%] break-words inline-flex items-center [&_.katex]:text-xs [&_.katex]:font-semibold font-mono"
          dangerouslySetInnerHTML={{ __html: html }}
        />
      );
    } catch {
      // fallback to plain text if parse fails
    }
  }

  return (
    <span className="font-mono font-bold text-teal-700 text-xs shrink-0 max-w-[45%] break-words bg-teal-50/80 px-1.5 py-0.5 rounded border border-teal-200/60">
      {symbol}
    </span>
  );
}

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
  const currentModule = getCurriculumModules().find((module) => module.id === currentNode.module);
  // The reader tree is mounted by app/learn/layout.tsx; retain these values for the
  // legacy hidden markup until the old server-rendered block is removed.
  const hiddenModuleGroup = getHierarchicalModuleTree().find((module) => module.id === currentNode.module) || getHierarchicalModuleTree()[0];
  const hiddenModuleNodes = allNodes.filter((node) => node.module === currentNode.module && node.route.startsWith('/learn/'));
  const hiddenModuleTotal = hiddenModuleNodes.length;
  const hiddenModuleCompleted = 0;
  const hiddenModulePercent = 0;

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

  useEffect(() => {
    let frameId = 0;
    const updateActiveHeading = () => {
      const headingStates = toc.map((item) => {
        const element = document.getElementById(`heading-${item.title}`);
        return element ? { id: item.id, top: element.getBoundingClientRect().top } : null;
      }).filter(Boolean) as { id: string; top: number }[];

      if (headingStates.length === 0) return;
      const anchor = 128;
      const passed = headingStates.filter((heading) => heading.top <= anchor);
      const current = passed[passed.length - 1] || headingStates[0];
      setActiveTocId((previous) => (previous === current.id ? previous : current.id));
    };

    const handleScroll = () => {
      cancelAnimationFrame(frameId);
      frameId = requestAnimationFrame(updateActiveHeading);
    };

    updateActiveHeading();
    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', handleScroll, { passive: true });
    return () => {
      cancelAnimationFrame(frameId);
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleScroll);
    };
  }, [toc]);
  const taskTotal = useMemo(
    () => (rawContent.match(/^\s*[-*+]\s+\[[ xX]\]\s+/gm) || []).length,
    [rawContent],
  );
  const [documentProgress, setDocumentProgress] = useState<DocumentTaskProgress>({ tasks: {}, completed: false });

  useEffect(() => {
    try {
      void window.navigator.storage?.persist?.();
      const key = 'ai-learning:recent-notes';
      const saved = JSON.parse(window.localStorage.getItem(key) || '{}');
      const history = saved && typeof saved === 'object' ? saved : {};
      window.localStorage.setItem(key, JSON.stringify({ ...history, [currentRoute]: Date.now() }));
    } catch {
      // Recent-note history is an optional local enhancement.
    }
  }, [currentRoute]);

  useEffect(() => {
    const updateProgress = () => setDocumentProgress(readDocumentProgress(currentRoute));
    const handleProgressUpdate = (event: Event) => {
      const detail = (event as CustomEvent<{ pathname?: string; progress?: DocumentTaskProgress }>).detail;
      if (detail?.pathname === currentRoute && detail.progress) setDocumentProgress(detail.progress);
    };

    updateProgress();
    const currentProgress = readDocumentProgress(currentRoute);
    if (currentProgress.taskTotal !== taskTotal) {
      writeDocumentProgress(currentRoute, { ...currentProgress, taskTotal });
    }
    window.addEventListener('ai-learning:document-progress', handleProgressUpdate);
    return () => window.removeEventListener('ai-learning:document-progress', handleProgressUpdate);
  }, [currentRoute]);

  const checkedTaskCount = Object.values(documentProgress.tasks).filter(Boolean).length;
  const documentPercent = documentProgress.completed
    ? 100
    : taskTotal > 0
    ? Math.round((checkedTaskCount / taskTotal) * 100)
    : 0;

  useEffect(() => {
    if (taskTotal > 0 && checkedTaskCount === taskTotal && !documentProgress.completed) {
      const nextProgress = { ...documentProgress, completed: true };
      writeDocumentProgress(currentRoute, nextProgress, true, currentNode.estimatedMinutes || 25);
      setDocumentProgress(nextProgress);
    }
  }, [checkedTaskCount, currentNode.estimatedMinutes, currentRoute, documentProgress, taskTotal]);

  const markDocumentCompleted = () => {
    if (!documentProgress.completed && !window.confirm('确认将本篇文档标记为已完成？')) return;
    const nextProgress = { ...documentProgress, completed: !documentProgress.completed };
    writeDocumentProgress(currentRoute, nextProgress, true, currentNode.estimatedMinutes || 25);
    setDocumentProgress(nextProgress);
  };

  // Smooth Scroll Navigation to Heading on TOC Click
  const handleTocClick = (item: { id: string; title: string }) => {
    setActiveTocId(item.id);
    let target = document.getElementById(`heading-${item.title}`) || document.getElementById(item.id);
    if (!target) {
      const headings = Array.from(document.querySelectorAll<HTMLElement>('h2, h3'));
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

  // 3. Dynamic Related Notes (Filtering out root & foundations module parent cards)
  const getRelatedNotes = () => {
    if (Array.isArray(frontmatter?.relatedNotes) && frontmatter.relatedNotes.length > 0) {
      const explicitNodes = frontmatter.relatedNotes
        .map((id: string) => getNodeById(id))
        .filter(Boolean);
      if (explicitNodes.length > 0) return explicitNodes;
    }

    return allNodes
      .filter(
        (n) =>
          n.id !== currentNode.id &&
          n.id !== 'root' &&
          n.id !== 'foundations' &&
          n.route.startsWith('/learn/') &&
          (n.submodule === currentNode.submodule || n.module === currentNode.module)
      )
      .slice(0, 3);
  };

  const realRelatedNotes = getRelatedNotes().map((n: any) => ({
    id: n.id,
    title: n.title,
    route: n.route,
    badge: n.tags?.[0] || (n.difficulty === 'beginner' ? '入门基础' : '核心概念'),
    badgeColor:
      n.difficulty === 'beginner'
        ? 'bg-emerald-50 text-emerald-600 border-emerald-200'
        : 'bg-sky-50 text-sky-600 border-sky-200',
    time: `${n.estimatedMinutes || 25} 分钟`,
  }));

  return (
    <div className="flex flex-col md:flex-row gap-6 w-full items-start">
      {/* Left Sidebar: Sticky Collapsible Module Chapter Index */}
      <div className="hidden">
        <Card className="p-4 space-y-4 border border-slate-200/80 shadow-sm">
          <h2 className="font-extrabold text-slate-800 text-sm border-b border-slate-100 pb-3 flex items-center justify-between">
            <span className="truncate">{hiddenModuleGroup.title}</span>
            <span className="text-[10px] bg-slate-100 text-slate-500 font-bold px-2 py-0.5 rounded-full shrink-0">
              {hiddenModuleTotal} 章节
            </span>
          </h2>

          {/* Module Chapter Tree */}
          <div className="space-y-3 text-xs max-h-[72vh] overflow-y-auto pr-1">
            {hiddenModuleGroup.submodules.length > 0 ? (
              hiddenModuleGroup.submodules.map((sub) => (
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
                {hiddenModuleNodes.map((n) => {
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
              <span className="text-xl font-black text-teal-600">{hiddenModulePercent}%</span>
            </div>
            <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
              <div
                className="bg-teal-500 h-full transition-all duration-500"
                style={{ width: `${hiddenModulePercent}%` }}
              />
            </div>
            <div className="text-[11px] text-slate-400 font-medium">
              已完成 {hiddenModuleCompleted} / {hiddenModuleTotal} 个章节
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
        <Card className="p-4 sm:p-6 md:p-8 space-y-5 sm:space-y-6 border border-slate-200/80 shadow-sm">
          {/* Breadcrumbs & Metadata Bar with Explicit "笔记库" & "返回知识地图" */}
          <div className="space-y-3">
            <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2 text-xs text-slate-500 font-medium truncate">
                <Link href="/learn/foundations/python/01-py-environment" className="flex items-center gap-1 text-teal-700 font-extrabold hover:underline shrink-0">
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>笔记库</span>
                </Link>
                <span>/</span>
                <Link href="/map" className="hover:text-teal-600 font-bold truncate">
                  {currentModule?.title || currentNode.module}
                </Link>
                <span>/</span>
                <span className="text-slate-800 font-bold truncate">{title}</span>
              </div>

              <Link
                href="/map"
                className="shrink-0 flex items-center gap-1 text-xs text-slate-600 hover:text-teal-600 bg-slate-50 hover:bg-teal-50 border border-slate-200 px-3 py-1 rounded-lg font-bold transition-all shadow-2xs"
              >
                <span>← 返回知识地图</span>
              </Link>
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
                  <Check className="w-4 h-4" /> 学习进度 {documentPercent}%
                </span>
              </div>

              <button onClick={markDocumentCompleted} className="flex items-center gap-1.5 bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold px-4 py-2 rounded-xl shadow-md transition-all">
                <CheckSquare className="w-4 h-4" />
                {documentProgress.completed ? '取消完成标记' : '标记为已完成'}
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
              const isActive = activeTocId === item.id;
              const isSubHeading = item.level === 3;
              return (
                <div
                  key={item.id}
                  onClick={() => handleTocClick(item)}
                  className={`py-1.5 rounded-lg cursor-pointer transition-all duration-300 flex items-center gap-2 text-xs font-normal ${
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
            <div className="space-y-1.5 text-xs max-h-60 overflow-y-auto pr-1">
              {symbols.map((item, idx) => (
                <div key={idx} className="flex items-baseline justify-between gap-2.5 py-1.5 border-b border-slate-100/80 last:border-0">
                  <MathSymbolItem symbol={item.symbol} />
                  <span className="text-slate-600 text-xs font-medium text-right leading-relaxed break-words flex-1">{item.mean}</span>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* 关联推荐笔记 */}
        {realRelatedNotes.length > 0 && (
          <Card className="p-4 space-y-3 border border-slate-200/80 shadow-sm">
            <div className="flex justify-between items-center border-b border-slate-100 pb-2">
              <h3 className="font-extrabold text-slate-800 text-xs">关联推荐笔记</h3>
              <Link href="/map" className="text-[11px] text-teal-600 hover:underline font-bold">查看全部</Link>
            </div>
            <div className="space-y-2.5 text-xs">
              {realRelatedNotes.map((note: any) => (
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
        )}
      </div>
    </div>
  );
};
