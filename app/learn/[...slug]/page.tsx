'use client';

import React from 'react';
import Link from 'next/link';
import { Card } from '@/components/ui/Card';
import { ConceptCard } from '@/components/mdx/ConceptCard';
import { RunnableCodeBlock } from '@/components/mdx/RunnableCodeBlock';
import { NeuronLab } from '@/components/animations/NeuronLab';
import {
  ChevronRight,
  ChevronDown,
  Clock,
  CheckCircle2,
  Bookmark,
  BookOpen,
  Check,
  CheckSquare
} from 'lucide-react';

export default function NoteReaderPage() {
  const toc = [
    { title: '概念引入', id: 'intro' },
    { title: '线性组合', id: 'linear', active: true },
    { title: '偏置项', id: 'bias' },
    { title: '激活函数', id: 'activation' },
    { title: 'Python 示例', id: 'python' },
    { title: '小结', id: 'summary' },
  ];

  const symbols = [
    { symbol: 'x', mean: '输入特征' },
    { symbol: 'w', mean: '权重' },
    { symbol: 'b', mean: '偏置' },
    { symbol: 'z', mean: '加权和' },
    { symbol: 'a', mean: '激活后的输出' },
  ];

  const relatedNotes = [
    { title: '线性回归中的加权求和', badge: '公式推导', time: '18 分钟' },
    { title: 'Sigmoid 与 ReLU 对比', badge: '激活函数', time: '12 分钟' },
    { title: '从感知机到神经网络', badge: '基础概念', time: '22 分钟' },
  ];

  return (
    <div className="flex flex-col lg:flex-row gap-6">
      {/* Left Sidebar: Module Chapter Index */}
      <div className="w-full lg:w-64 space-y-4">
        <Card className="p-4 space-y-3">
          <h2 className="font-bold text-slate-800 text-sm border-b border-slate-100 pb-2">
            深度学习模块
          </h2>

          <div className="space-y-1 text-xs">
            <div className="font-medium text-slate-700 py-1 flex items-center gap-1">
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              <span>神经网络基础</span>
            </div>
            <div className="pl-4 space-y-1 text-slate-500">
              <div className="py-0.5 hover:text-slate-800 cursor-pointer">什么是神经网络</div>
              <div className="py-0.5 hover:text-slate-800 cursor-pointer">网络结构概览</div>
            </div>

            <div className="font-medium text-slate-700 py-1 flex items-center gap-1 pt-2">
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              <span className="text-teal-700 font-bold">神经元与激活函数</span>
            </div>
            <div className="pl-4 space-y-1">
              <div className="py-1 px-2 rounded-lg bg-teal-50 text-teal-700 font-bold border border-teal-200/60 flex items-center justify-between">
                <span>单个人工神经元</span>
                <span className="w-1.5 h-1.5 rounded-full bg-teal-600" />
              </div>
              <div className="py-0.5 pl-2 text-slate-500 hover:text-slate-800 cursor-pointer">常见激活函数</div>
              <div className="py-0.5 pl-2 text-slate-500 hover:text-slate-800 cursor-pointer">非线性与表达能力</div>
            </div>

            <div className="font-medium text-slate-500 py-1 flex items-center gap-1 pt-2 hover:text-slate-800 cursor-pointer">
              <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
              <span>反向传播</span>
            </div>
            <div className="font-medium text-slate-500 py-1 flex items-center gap-1 hover:text-slate-800 cursor-pointer">
              <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
              <span>梯度下降</span>
            </div>
            <div className="font-medium text-slate-500 py-1 flex items-center gap-1 hover:text-slate-800 cursor-pointer">
              <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
              <span>卷积网络</span>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 space-y-2">
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-500 font-medium">本模块进度</span>
              <span className="text-teal-600 font-bold">42%</span>
            </div>
            <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
              <div className="bg-teal-500 h-full w-[42%]" />
            </div>
            <div className="text-[10px] text-slate-400">已完成 5 / 12 个章节</div>
          </div>
        </Card>
      </div>

      {/* Center Main MDX Content */}
      <div className="flex-1 space-y-6">
        <Card className="p-6 md:p-8 space-y-6">
          {/* Breadcrumbs & Metadata */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <Link href="/map" className="hover:text-teal-600">知识库</Link>
              <span>/</span>
              <Link href="/map/deep-learning" className="hover:text-teal-600">深度学习</Link>
              <span>/</span>
              <span className="text-slate-600 font-medium">神经元与激活函数</span>
            </div>

            <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">
              单个人工神经元
            </h1>

            <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
              <div className="flex items-center gap-2 text-xs">
                <span className="px-2.5 py-0.5 rounded-full bg-teal-50 text-teal-700 font-bold border border-teal-200">
                  难度: 入门
                </span>
                <span className="flex items-center gap-1 text-slate-500 px-2 py-0.5 bg-slate-100 rounded-full">
                  <Clock className="w-3 h-3" /> 预计阅读 25 分钟
                </span>
                <span className="text-teal-600 flex items-center gap-1">
                  <Check className="w-3.5 h-3.5" /> 已加入学习路线
                </span>
              </div>

              <button className="flex items-center gap-1.5 bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold px-4 py-2 rounded-xl shadow-sm transition-all">
                <CheckSquare className="w-4 h-4" />
                完成学习
              </button>
            </div>
          </div>

          <hr className="border-slate-100" />

          {/* Article Main Text */}
          <div className="space-y-4 text-sm text-slate-700 leading-relaxed">
            <p>
              单个人工神经元（也称为感知机的推广形式）是神经网络中的基本计算单元。它接收一组输入信号，对这些输入进行加权求和并加上偏置项，然后通过激活函数得到最终输出。
            </p>

            {/* Neuron Diagram */}
            <div className="my-6 p-6 bg-slate-50 rounded-2xl border border-slate-200/80 flex flex-col items-center justify-center">
              <svg width="320" height="140" viewBox="0 0 320 140" className="max-w-full">
                <circle cx="50" cy="30" r="16" fill="#F1F5F9" stroke="#94A3B8" strokeWidth="2" />
                <text x="50" y="34" fontSize="12" textAnchor="middle" fill="#334155">x₁</text>

                <circle cx="50" cy="70" r="16" fill="#F1F5F9" stroke="#94A3B8" strokeWidth="2" />
                <text x="50" y="74" fontSize="12" textAnchor="middle" fill="#334155">x₂</text>

                <circle cx="50" cy="110" r="16" fill="#F1F5F9" stroke="#94A3B8" strokeWidth="2" />
                <text x="50" y="114" fontSize="12" textAnchor="middle" fill="#334155">xₙ</text>

                <line x1="66" y1="30" x2="170" y2="70" stroke="#0D9488" strokeWidth="2" />
                <text x="110" y="42" fontSize="11" fill="#0D9488">w₁</text>

                <line x1="66" y1="70" x2="170" y2="70" stroke="#0D9488" strokeWidth="2" />
                <text x="110" y="65" fontSize="11" fill="#0D9488">w₂</text>

                <line x1="66" y1="110" x2="170" y2="70" stroke="#0D9488" strokeWidth="2" />
                <text x="110" y="105" fontSize="11" fill="#0D9488">wₙ</text>

                <circle cx="190" cy="70" r="22" fill="#FFFFFF" stroke="#0D9488" strokeWidth="3" />
                <text x="190" y="75" fontSize="16" fontWeight="bold" textAnchor="middle" fill="#0F172A">z</text>

                <line x1="190" y1="120" x2="190" y2="92" stroke="#64748B" strokeWidth="2" markerEnd="url(#arrow)" />
                <text x="190" y="134" fontSize="11" textAnchor="middle" fill="#64748B">偏置 b</text>

                <line x1="212" y1="70" x2="270" y2="70" stroke="#0D9488" strokeWidth="2" />
                <text x="285" y="74" fontSize="14" fontWeight="bold" fill="#0D9488">a</text>
              </svg>
              <span className="text-xs text-slate-400 mt-2 font-medium">单个神经元结构示意图</span>
            </div>

            <h2 className="text-lg font-bold text-slate-900 border-l-4 border-teal-600 pl-3 pt-2">
              线性组合
            </h2>
            <p>
              神经元首先对输入进行线性组合，计算加权和 z：
            </p>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
              <div className="md:col-span-7 bg-slate-50 p-4 rounded-xl border border-slate-200/60 text-center font-mono text-base font-bold text-slate-800">
                z = w₁x₁ + w₂x₂ + b
              </div>
              <div className="md:col-span-5">
                <ConceptCard title="核心定义" type="intuition">
                  单个人工神经元是神经网络中的基本计算单元，它将输入与权重相乘求和，加上偏置，并交给激活函数得到输出。
                </ConceptCard>
              </div>
            </div>

            <h2 className="text-lg font-bold text-slate-900 border-l-4 border-teal-600 pl-3 pt-2">
              偏置与激活函数
            </h2>
            <p>
              偏置项 b 使神经元具有更强的表达能力，相当于为激活函数的输入提供了一个可学习的平移。然后，z 会经过一个非线性激活函数 ϕ，得到输出 a：
            </p>

            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/60 text-center font-mono text-base font-bold text-slate-800 my-3">
              a = ϕ(z)
            </div>

            {/* Embedded Interactive Code Block */}
            <RunnableCodeBlock title="用 Python 计算一个神经元的输出" />

            {/* Embedded Live Neuron Lab */}
            <div className="pt-6">
              <h2 className="text-lg font-bold text-slate-900 mb-3">
                神经元交互实验室
              </h2>
              <NeuronLab />
            </div>
          </div>
        </Card>
      </div>

      {/* Right Column: TOC, Symbols, Related Notes */}
      <div className="w-full lg:w-64 space-y-4">
        {/* TOC */}
        <Card className="p-4 space-y-3">
          <h3 className="font-bold text-slate-800 text-xs border-b border-slate-100 pb-2">
            本页目录
          </h3>
          <div className="space-y-1.5 text-xs">
            {toc.map((item) => (
              <div
                key={item.id}
                className={`py-1 px-2 rounded-lg cursor-pointer transition-colors flex items-center justify-between ${
                  item.active
                    ? 'bg-teal-50 text-teal-700 font-bold border-l-2 border-teal-600'
                    : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                <span>{item.title}</span>
              </div>
            ))}
          </div>
        </Card>

        {/* Symbol Dictionary */}
        <Card className="p-4 space-y-3">
          <h3 className="font-bold text-slate-800 text-xs border-b border-slate-100 pb-2">
            符号表
          </h3>
          <div className="space-y-1.5 text-xs">
            <div className="grid grid-cols-2 text-[11px] font-bold text-slate-400 border-b border-slate-100 pb-1">
              <span>符号</span>
              <span>含义</span>
            </div>
            {symbols.map((item, idx) => (
              <div key={idx} className="grid grid-cols-2 text-xs py-1 border-b border-slate-50 last:border-0">
                <span className="font-mono font-bold text-teal-700">{item.symbol}</span>
                <span className="text-slate-600">{item.mean}</span>
              </div>
            ))}
          </div>
        </Card>

        {/* Linked Notes */}
        <Card className="p-4 space-y-3">
          <div className="flex justify-between items-center border-b border-slate-100 pb-2">
            <h3 className="font-bold text-slate-800 text-xs">关联笔记</h3>
            <span className="text-[11px] text-teal-600 hover:underline cursor-pointer">查看全部</span>
          </div>
          <div className="space-y-2 text-xs">
            {relatedNotes.map((note, idx) => (
              <div key={idx} className="p-2.5 rounded-xl border border-slate-100 hover:border-slate-300 transition-all cursor-pointer space-y-1">
                <div className="font-bold text-slate-800 hover:text-teal-600">{note.title}</div>
                <div className="flex items-center justify-between text-[10px] text-slate-400">
                  <span className="px-1.5 py-0.5 rounded bg-teal-50 text-teal-600">{note.badge}</span>
                  <span>{note.time}</span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
