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
  const visualByModule = {
    foundations: { icon: 'bg-blue-50 text-blue-600 border-blue-100', progress: 'bg-blue-500' },
    'machine-learning': { icon: 'bg-emerald-50 text-emerald-600 border-emerald-100', progress: 'bg-emerald-500' },
    'deep-learning': { icon: 'bg-orange-50 text-orange-600 border-orange-100', progress: 'bg-orange-500' },
    vision: { icon: 'bg-sky-50 text-sky-600 border-sky-100', progress: 'bg-sky-500' },
    llm: { icon: 'bg-violet-50 text-violet-600 border-violet-100', progress: 'bg-violet-500' },
    rag: { icon: 'bg-teal-50 text-teal-600 border-teal-100', progress: 'bg-teal-500' },
  } as const;
  const modules = curriculum
    .map((module) => {
      const notes = entries.filter((entry) => entry.module === module.id);
      return {
        id: module.id,
        title: module.title,
        desc: module.description,
        icon: iconByModule[module.id as keyof typeof iconByModule] || BookOpen,
        iconBg: visualByModule[module.id as keyof typeof visualByModule]?.icon || 'bg-slate-50 text-slate-600 border-slate-100',
        progressBg: visualByModule[module.id as keyof typeof visualByModule]?.progress || 'bg-slate-500',
        percent: module.totalNotes > 0 ? Math.round((notes.length / module.totalNotes) * 100) : 0,
        notesCount: notes.length,
        nodes: graphNodes.filter((node) => node.module === module.id && node.route.startsWith('/learn/')),
      };
    });
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
    <div className="space-y-9 py-3">
      {/* Top Section */}
      <div className="grid grid-cols-1 items-stretch gap-6 lg:grid-cols-12">
        {/* Left Welcome */}
        <div className="flex flex-col justify-center pr-2 lg:col-span-4">
          <h1 className="mb-4 text-4xl font-extrabold leading-tight tracking-normal text-slate-900">
            继续构建你的 <br />
            <span className="text-teal-600">AI 知识体系</span>
          </h1>
          <p className="mb-7 max-w-sm text-sm leading-7 text-slate-500">
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
        <Card className="flex min-h-[320px] flex-col justify-between p-7 lg:col-span-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-slate-800 text-base">推荐学习路线</h2>
            <Link href="/map" className="text-xs text-slate-400 hover:text-teal-600 transition-colors flex items-center gap-0.5">
              查看路线图 &gt;
            </Link>
          </div>

          <div className="relative my-auto flex items-start justify-between px-2 py-7">
            {/* Connecting line */}
            <div className="absolute left-12 right-12 top-[54px] -z-0 h-px bg-slate-200" />

            {currentRoute.map((item, idx) => (
              <div key={idx} className="relative z-10 flex flex-col items-center text-center">
                <div
                  className={`w-14 h-14 rounded-full flex items-center justify-center border-2 transition-all ${
                    item.active
                  ? 'scale-110 border-4 border-teal-200 bg-teal-500 text-white shadow-glow'
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
        <Card className="flex min-h-[320px] flex-col justify-between p-7 lg:col-span-3">
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
      <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
        {modules.map((mod) => {
          const Icon = mod.icon;
          return (
            <Card key={mod.id} hoverable className="group min-h-[164px] p-6">
              <Link href="/map" className="block space-y-4">
                <div className="flex items-center gap-3">
                  <div className={`flex h-12 w-12 items-center justify-center rounded-2xl border ${mod.iconBg}`}>
                    <Icon className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-800 text-base group-hover:text-teal-600 transition-colors">
                      {mod.title}
                    </h3>
                  </div>
                </div>
                <p className="line-clamp-2 text-xs leading-relaxed text-slate-500">
                  {mod.desc}
                </p>
                <div className="flex items-center justify-between pt-2 text-xs text-slate-400">
                  <div className="h-1.5 w-36 overflow-hidden rounded-full bg-slate-100">
                    <LearningProgressBar nodes={mod.nodes} colorClassName={mod.progressBg} />
                  </div>
                  <LearningProgressValue nodes={mod.nodes} />
                  <span>{mod.notesCount} 篇笔记 &gt;</span>
                </div>
              </Link>
            </Card>
          );
        })}
      </div>

      {/* Bottom Section: Recent Notes (Renders only when valid learning history exists) */}
      <RecentNotes notes={entries} />
    </div>
  );
}
