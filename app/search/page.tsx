'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Card } from '@/components/ui/Card';
import { Search, Tag, BookOpen, Clock, ArrowRight } from 'lucide-react';

export default function SearchPage() {
  const [query, setQuery] = useState('');
  const [activeTag, setActiveTag] = useState<string | null>(null);

  const tags = ['全部', '神经网络', '前向传播', '梯度下降', '激活函数', '线性代数', 'Python', 'Transformer'];

  const results = [
    {
      title: '单个人工神经元',
      module: '深度学习',
      slug: 'deep-learning/neuron',
      summary: '神经网络的基本计算单元，包括输入、权重、偏置、激活与输出之间的关系与实现。',
      tags: ['神经网络', '前向传播'],
      time: '25 分钟',
    },
    {
      title: '偏导数与链式法则',
      module: '数学基础',
      slug: 'foundations/calculus',
      summary: '偏导数的定义与计算方法，结合多变量函数的链式法则，理解反向传播的核心数学基础。',
      tags: ['线性代数', '梯度下降'],
      time: '30 分钟',
    },
    {
      title: '多层感知机中的激活函数',
      module: '深度学习',
      slug: 'deep-learning/activation',
      summary: '对比常见激活函数 (ReLU、Sigmoid、Tanh、GELU) 的特点与适用场景，理解非线性表达能力。',
      tags: ['激活函数', '神经网络'],
      time: '20 分钟',
    },
  ];

  const filtered = results.filter((item) => {
    const matchQuery = item.title.includes(query) || item.summary.includes(query);
    const matchTag = !activeTag || activeTag === '全部' || item.tags.includes(activeTag);
    return matchQuery && matchTag;
  });

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header & Search Bar */}
      <div className="space-y-4 text-center py-4">
        <h1 className="text-2xl font-extrabold text-slate-900">站内知识检索</h1>
        <p className="text-xs text-slate-400">快速精确定位笔记、概念、定理、公式与实验室组件</p>

        <div className="relative max-w-xl mx-auto">
          <Search className="absolute left-4 top-3.5 w-5 h-5 text-slate-400" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="输入关键字、算法或公式 (例如: 神经元, 链式法则)..."
            className="w-full pl-12 pr-4 py-3 bg-white rounded-2xl border border-slate-200 shadow-card outline-none text-slate-800 text-sm focus:border-teal-500 focus:ring-2 focus:ring-teal-100 transition-all"
          />
        </div>
      </div>

      {/* Tags Filter */}
      <div className="flex flex-wrap items-center justify-center gap-2 text-xs">
        {tags.map((tag) => (
          <button
            key={tag}
            onClick={() => setActiveTag(tag)}
            className={`px-3 py-1.5 rounded-xl transition-all border ${
              (activeTag === tag || (!activeTag && tag === '全部'))
                ? 'bg-teal-600 text-white border-teal-600 font-bold shadow-sm'
                : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
            }`}
          >
            {tag}
          </button>
        ))}
      </div>

      {/* Results List */}
      <div className="space-y-4 pt-2">
        <div className="text-xs text-slate-400 font-medium">找到 {filtered.length} 条相关结果</div>

        {filtered.map((item, idx) => (
          <Card key={idx} hoverable className="p-5">
            <Link href={`/learn/${item.slug}`} className="block space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-teal-600 bg-teal-50 px-2.5 py-0.5 rounded-full border border-teal-200">
                  {item.module}
                </span>
                <span className="text-[11px] text-slate-400 flex items-center gap-1">
                  <Clock className="w-3 h-3" /> {item.time}
                </span>
              </div>
              <h3 className="text-base font-bold text-slate-800 hover:text-teal-600 transition-colors">
                {item.title}
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">{item.summary}</p>
              <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                <div className="flex items-center gap-2">
                  {item.tags.map((t) => (
                    <span key={t} className="text-[10px] text-slate-400 bg-slate-100 px-2 py-0.5 rounded">
                      #{t}
                    </span>
                  ))}
                </div>
                <span className="text-xs text-teal-600 font-medium flex items-center gap-1">
                  阅读笔记 <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </Link>
          </Card>
        ))}
      </div>
    </div>
  );
}
