'use client';

import React from 'react';
import Link from 'next/link';
import { Card } from '@/components/ui/Card';
import { ProgressRing } from '@/components/ui/ProgressRing';
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

export default function DashboardPage() {
  const currentRoute = [
    { title: '线性代数', status: 'completed' },
    { title: '线性回归', status: 'completed' },
    { title: '神经元', status: 'in_progress', active: true },
    { title: '梯度下降', status: 'not_started' },
  ];

  const modules = [
    {
      id: 'foundations',
      title: '准备知识',
      desc: '数学基础、概率统计、编程基础等 AI 学习所需的预备知识。',
      icon: BookOpen,
      iconBg: 'bg-blue-50 text-blue-500 border-blue-100',
      progressBg: 'bg-blue-500',
      percent: 45,
      notesCount: 12,
    },
    {
      id: 'machine-learning',
      title: '机器学习',
      desc: '经典机器学习算法与模型，掌握从数据到模型的核心流程。',
      icon: TrendingUp,
      iconBg: 'bg-emerald-50 text-emerald-500 border-emerald-100',
      progressBg: 'bg-emerald-500',
      percent: 48,
      notesCount: 18,
    },
    {
      id: 'deep-learning',
      title: '深度学习',
      desc: '神经网络基础与进阶，理解深度学习的原理与实践。',
      icon: Cpu,
      iconBg: 'bg-amber-50 text-amber-500 border-amber-100',
      progressBg: 'bg-amber-500',
      percent: 36,
      notesCount: 15,
    },
    {
      id: 'vision',
      title: '计算机视觉',
      desc: '图像处理、目标检测、分割与视觉理解等核心技术。',
      icon: ImageIcon,
      iconBg: 'bg-sky-50 text-sky-500 border-sky-100',
      progressBg: 'bg-sky-500',
      percent: 28,
      notesCount: 10,
    },
    {
      id: 'llm',
      title: 'Transformer 与 LLM',
      desc: 'Transformer 架构与大模型原理，掌握预训练与微调方法。',
      icon: Layers,
      iconBg: 'bg-purple-50 text-purple-500 border-purple-100',
      progressBg: 'bg-purple-500',
      percent: 31,
      notesCount: 14,
    },
    {
      id: 'rag',
      title: 'RAG 与 Agent',
      desc: '检索增强生成与智能体应用，构建更强大的 AI 系统。',
      icon: MessageSquare,
      iconBg: 'bg-teal-50 text-teal-500 border-teal-100',
      progressBg: 'bg-teal-500',
      percent: 24,
      notesCount: 9,
    },
  ];

  const recentNotes = [
    {
      title: '偏导数与链式法则',
      module: '数学基础',
      badgeClass: 'bg-blue-50 text-blue-600',
      time: '今天 20:45',
      summary: '系统梳理偏导数的定义与计算方法，结合多变量函数的链式法则，理解复合函数的求导过程。',
      slug: 'foundations/calculus',
    },
    {
      title: '多层感知机中的激活函数',
      module: '深度学习',
      badgeClass: 'bg-amber-50 text-amber-600',
      time: '今天 19:30',
      summary: '对比常见激活函数 (ReLU、Sigmoid、Tanh、GELU) 的特点与适用场景，理解非线性表达能力。',
      slug: 'deep-learning/activation',
    },
    {
      title: 'RAG 检索增强生成流程拆解',
      module: 'RAG',
      badgeClass: 'bg-teal-50 text-teal-600',
      time: '昨天 22:10',
      summary: '从索引构建、检索到生成的完整流程拆解，分析关键模块与优化思路，提升回答质量。',
      slug: 'rag/overview',
    },
  ];

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
            <Link
              href="/learn/deep-learning/neuron"
              className="inline-flex items-center gap-2 bg-teal-600 hover:bg-teal-700 text-white text-sm font-semibold px-5 py-2.5 rounded-xl shadow-md transition-all"
            >
              <Play className="w-4 h-4 fill-white" />
              继续学习
            </Link>
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
            <h2 className="font-bold text-slate-800 text-base">当前学习路线</h2>
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
                      : item.status === 'completed'
                      ? 'bg-white text-emerald-500 border-emerald-300'
                      : 'bg-white text-slate-300 border-slate-200'
                  }`}
                >
                  {item.status === 'completed' ? (
                    <CheckCircle2 className="w-6 h-6" />
                  ) : item.active ? (
                    <Cpu className="w-6 h-6 animate-pulse" />
                  ) : (
                    <div className="w-3 h-3 rounded-full bg-slate-300" />
                  )}
                </div>
                <span className={`text-xs font-semibold mt-2.5 ${item.active ? 'text-teal-600 font-bold' : 'text-slate-700'}`}>
                  {item.title}
                </span>
                <span className="text-[10px] text-slate-400 mt-0.5">
                  {item.status === 'completed' ? '已完成' : item.active ? '进行中' : '未开始'}
                </span>
              </div>
            ))}
          </div>
        </Card>

        {/* Right Progress Card */}
        <Card className="lg:col-span-3 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <h2 className="font-bold text-slate-800 text-base">学习进度</h2>
          </div>

          <div className="flex items-center gap-6 py-2">
            <ProgressRing percent={32} size={100} strokeWidth={9} />
            <div className="space-y-2.5 text-xs">
              <div className="flex items-center gap-2 text-slate-600">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                <div>
                  <div className="text-[10px] text-slate-400">最近学习</div>
                  <div className="font-semibold text-slate-800">今天 21:10</div>
                </div>
              </div>
              <div className="flex items-center gap-2 text-slate-600">
                <BarChart2 className="w-3.5 h-3.5 text-slate-400" />
                <div>
                  <div className="text-[10px] text-slate-400">本周累计</div>
                  <div className="font-semibold text-teal-600">6.5 小时</div>
                </div>
              </div>
              <div className="flex items-center gap-2 text-slate-600">
                <Flame className="w-3.5 h-3.5 text-orange-500" />
                <div>
                  <div className="text-[10px] text-slate-400">连续学习</div>
                  <div className="font-semibold text-orange-600">4 天</div>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-100 flex justify-end">
            <button className="text-xs font-medium text-slate-400 hover:text-teal-600 flex items-center gap-1 transition-colors">
              查看学习统计 &rarr;
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
                    <div
                      className={`h-full rounded-full ${mod.progressBg}`}
                      style={{ width: `${mod.percent}%` }}
                    />
                  </div>
                  <span>完成 {mod.percent}%</span>
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
          <Link href="/learn/deep-learning/neuron" className="text-xs font-medium text-slate-400 hover:text-teal-600 flex items-center gap-1 transition-colors">
            查看全部 &rarr;
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
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
