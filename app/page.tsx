import React from 'react';
import Link from 'next/link';
import { Card } from '@/components/ui/Card';
import {
  Play,
  ArrowRight,
  CheckCircle2,
  Clock,
  BarChart2,
  Flame,
  BookOpen,
  TrendingUp,
  Cpu,
  Image as ImageIcon,
  Layers,
  MessageSquare,
  Bookmark,
  MoreHorizontal
} from 'lucide-react';
import { getContentIndex } from '@/lib/content';
import { getCurriculumModules, getGlobalGraphNodes } from '@/lib/graph';
import { LearningProgressBar, LearningProgressSummary, LearningProgressValue } from '@/components/progress/LearningProgress';
import { RecentNotes } from '@/components/dashboard/RecentNotes';
import { ContinueLearningLink } from '@/components/dashboard/ContinueLearningLink';

export default async function DashboardPage() {
  const [entries, curriculum, graphNodes] = await Promise.all([
    getContentIndex(),
    Promise.resolve(getCurriculumModules()),
    Promise.resolve(getGlobalGraphNodes()),
  ]);
  const notesByRoute = new Map(entries.map((entry) => [entry.route, entry]));
  const moduleOrder = new Map(curriculum.map((module, index) => [module.id, index]));
  const iconByModule = {
    foundations: BookOpen,
    'machine-learning': TrendingUp,
    'deep-learning': Cpu,
    vision: ImageIcon,
    llm: Layers,
    rag: MessageSquare,
  } as const;
  const modules = curriculum
    .map((module) => {
      const notes = entries.filter((entry) => entry.module === module.id);
      return {
        id: module.id,
        title: module.title,
        desc: module.description,
        icon: iconByModule[module.id as keyof typeof iconByModule] || BookOpen,
        iconBg: 'bg-teal-50 text-teal-600 border-teal-100',
        progressBg: 'bg-teal-500',
        percent: module.totalNotes > 0 ? Math.round((notes.length / module.totalNotes) * 100) : 0,
        notesCount: notes.length,
        nodes: graphNodes.filter((node) => node.module === module.id && node.route.startsWith('/learn/')),
      };
    })
    .filter((module) => module.notesCount > 0);
  const learningOrder = graphNodes
    .filter((node) => notesByRoute.has(node.route))
    .sort((left, right) => {
      const leftEntry = notesByRoute.get(left.route);
      const rightEntry = notesByRoute.get(right.route);
      const moduleDifference = (moduleOrder.get(left.module) || 0) - (moduleOrder.get(right.module) || 0);
      if (moduleDifference !== 0) return moduleDifference;
      const orderDifference = Number(leftEntry?.order || 0) - Number(rightEntry?.order || 0);
      if (orderDifference !== 0) return orderDifference;
      return left.route.localeCompare(right.route);
    })
  const currentRoute = learningOrder
    .slice(0, 4)
    .map((node, index) => ({ title: node.title, route: node.route, active: index === 0 }));
  const recentNotes = entries.slice(-3).reverse().map((entry) => ({
    title: entry.title,
    module: entry.module,
    badgeClass: 'bg-teal-50 text-teal-700',
    time: `${entry.estimatedMinutes || 25} minutes`,
    summary: entry.summary,
    slug: entry.slug.join('/'),
  }));
  const progressNodes = graphNodes.filter((node) => notesByRoute.has(node.route));

  return (
    <div className="space-y-8">
      {/* Top Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* Left Welcome */}
        <div className="lg:col-span-4 flex flex-col justify-center pr-2">
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight leading-tight mb-3">
            继续构建你的 <br />
            <span className="text-teal-600">AI 知识体系</span>
          </h1>
          <p className="text-slate-500 text-sm leading-relaxed mb-6">
            从数学基础到大模型，按清晰学习路线稳步前进，逐步建立完整的 AI 知识结构。
          </p>
          <div className="flex items-center gap-3">
            <ContinueLearningLink candidates={learningOrder} />
            <Link
              href="/map"
              className="inline-flex items-center gap-1.5 text-slate-600 hover:text-teal-600 text-sm font-medium px-4 py-2.5 rounded-xl transition-colors"
            >
              查看学习地图 <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>

        {/* Center Route Card */}
        <Card className="lg:col-span-5 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-slate-800 text-base">推荐学习路线</h2>
            <Link href="/map" className="text-xs text-slate-400 hover:text-teal-600 transition-colors flex items-center gap-0.5">
              查看路线图 &gt;
            </Link>
          </div>

          <div className="flex items-center justify-between my-auto py-4 px-2 relative">
            {/* Connecting line */}
            <div className="absolute top-1/2 left-10 right-10 h-0.5 bg-slate-200 -translate-y-4 -z-0" />

            {currentRoute.map((item, idx) => (
              <div key={idx} className="relative z-10 flex flex-col items-center text-center">
                <div
                  className={`w-14 h-14 rounded-full flex items-center justify-center border-2 transition-all ${
                    item.active
                      ? 'bg-teal-500 text-white border-teal-400 shadow-glow scale-110'
                      : 'bg-white text-slate-400 border-slate-200'
                  }`}
                >
                  {item.active ? (
                    <Cpu className="w-6 h-6 animate-pulse" />
                  ) : (
                    <BookOpen className="w-5 h-5" />
                  )}
                </div>
                <span className={`text-xs font-semibold mt-2.5 ${item.active ? 'text-teal-600 font-bold' : 'text-slate-700'}`}>
                  {item.title}
                </span>
                <span className="text-[10px] text-slate-400 mt-0.5">
                  {item.active ? '从这里开始' : '后续章节'}
                </span>
              </div>
            ))}
          </div>
        </Card>

        {/* Right Library Card */}
        <Card className="lg:col-span-3 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <h2 className="font-bold text-slate-800 text-base">知识库概览</h2>
          </div>

          <LearningProgressSummary nodes={progressNodes} />

          <div className="pt-2 border-t border-slate-100 flex justify-end">
            <button className="text-xs font-medium text-slate-400 hover:text-teal-600 flex items-center gap-1 transition-colors">
              查看全部笔记 &rarr;
            </button>
          </div>
        </Card>
      </div>

      {/* Middle Section: Module Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {modules.map((mod) => {
          const Icon = mod.icon;
          return (
            <Card key={mod.id} hoverable className="group">
              <Link href={`/map/${mod.id}`} className="block space-y-3">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl border flex items-center justify-center ${mod.iconBg}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-800 text-base group-hover:text-teal-600 transition-colors">
                      {mod.title}
                    </h3>
                  </div>
                </div>
                <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                  {mod.desc}
                </p>
                <div className="pt-2 flex items-center justify-between text-xs text-slate-400">
                  <div className="w-36 bg-slate-100 rounded-full h-1.5 overflow-hidden">
                    <LearningProgressBar nodes={mod.nodes} />
                  </div>
                  <LearningProgressValue nodes={mod.nodes} />
                  <span>{mod.notesCount} 篇笔记 &gt;</span>
                </div>
              </Link>
            </Card>
          );
        })}
      </div>

      {/* Bottom Section: Recent Notes */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-bold text-slate-800 text-lg">最近学习的笔记</h2>
          <Link href="/map" className="text-xs font-medium text-slate-400 hover:text-teal-600 flex items-center gap-1 transition-colors">
            查看全部 &rarr;
          </Link>
        </div>

        <RecentNotes notes={entries} />
        <div className="hidden">
          {recentNotes.map((note, idx) => (
            <Card key={idx} hoverable className="flex flex-col justify-between">
              <Link href={`/learn/${note.slug}`} className="space-y-3 block">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-bold text-slate-800 text-sm hover:text-teal-600 transition-colors line-clamp-1">
                    {note.title}
                  </h3>
                  <button aria-label="书签" className="text-slate-300 hover:text-slate-500">
                    <Bookmark className="w-4 h-4" />
                  </button>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${note.badgeClass}`}>
                    {note.module}
                  </span>
                  <span className="text-[11px] text-slate-400">{note.time}</span>
                </div>
                <p className="text-xs text-slate-500 leading-relaxed line-clamp-2">
                  {note.summary}
                </p>
              </Link>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
