'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Card } from '@/components/ui/Card';
import { StatusBadge, DifficultyBadge } from '@/components/ui/Badge';
import {
  ChevronDown,
  ChevronRight,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Share2,
  CheckCircle2,
  Clock,
  Play,
  BookOpen,
  Star,
  X,
  Filter,
  Network
} from 'lucide-react';

export default function MindMapPage() {
  const [selectedNodeId, setSelectedNodeId] = useState('dl-neuron');
  const [expandedModules, setExpandedModules] = useState<string[]>(['deep-learning']);

  const toggleModule = (id: string) => {
    setExpandedModules((prev) =>
      prev.includes(id) ? prev.filter((m) => m !== id) : [...prev, id]
    );
  };

  const moduleTree = [
    {
      id: 'foundations',
      title: '数学基础',
      children: [
        { id: 'math-vector', title: '线性代数', status: 'completed' },
        { id: 'math-prob', title: '概率论与统计', status: 'completed' },
        { id: 'math-calculus', title: '微积分', status: 'completed' },
      ],
    },
    {
      id: 'machine-learning',
      title: '机器学习',
      children: [
        { id: 'ml-supervised', title: '监督学习', status: 'completed' },
        { id: 'ml-unsupervised', title: '无监督学习', status: 'in_progress' },
        { id: 'ml-eval', title: '模型评估', status: 'in_progress' },
      ],
    },
    {
      id: 'deep-learning',
      title: '深度学习',
      children: [
        { id: 'dl-neuron', title: '人工神经元', status: 'in_progress', active: true },
        { id: 'dl-activation', title: '激活函数', status: 'in_progress' },
        { id: 'dl-backprop', title: '反向传播', status: 'not_started' },
        { id: 'dl-optimizer', title: '优化器', status: 'not_started' },
      ],
    },
    { id: 'vision', title: '计算机视觉', children: [] },
    { id: 'nlp', title: '自然语言处理', children: [] },
    { id: 'transformer', title: 'Transformer', children: [] },
    { id: 'rag', title: 'RAG', children: [] },
  ];

  return (
    <div className="h-[calc(100vh-120px)] flex flex-col md:flex-row gap-4 overflow-hidden">
      {/* Left Sidebar: Module Tree & Filters */}
      <div className="w-full md:w-64 bg-white rounded-2xl border border-slate-200/80 p-4 flex flex-col justify-between overflow-y-auto">
        <div className="space-y-4">
          <h2 className="font-bold text-slate-800 text-sm flex items-center gap-2">
            <Network className="w-4 h-4 text-teal-600" />
            模块树
          </h2>

          <div className="space-y-1 text-xs">
            <div className="font-medium text-slate-700 py-1.5 px-2 flex items-center gap-1.5">
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              <span>人工智能</span>
            </div>

            <div className="pl-4 space-y-1">
              {moduleTree.map((mod) => {
                const isExpanded = expandedModules.includes(mod.id);
                return (
                  <div key={mod.id} className="space-y-1">
                    <button
                      onClick={() => toggleModule(mod.id)}
                      className="w-full flex items-center gap-1.5 py-1 px-2 rounded-lg hover:bg-slate-100 text-slate-600 transition-colors text-left"
                    >
                      {mod.children.length > 0 ? (
                        isExpanded ? (
                          <ChevronDown className="w-3 h-3 text-slate-400" />
                        ) : (
                          <ChevronRight className="w-3 h-3 text-slate-400" />
                        )
                      ) : (
                        <div className="w-3 h-3" />
                      )}
                      <span>{mod.title}</span>
                    </button>

                    {isExpanded && mod.children.length > 0 && (
                      <div className="pl-6 space-y-0.5 border-l border-slate-200 ml-2">
                        {mod.children.map((child) => (
                          <button
                            key={child.id}
                            onClick={() => setSelectedNodeId(child.id)}
                            className={`w-full flex items-center gap-2 py-1 px-2 rounded-lg text-left text-[11px] transition-all ${
                              selectedNodeId === child.id
                                ? 'bg-amber-50 text-amber-700 font-semibold border border-amber-200'
                                : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'
                            }`}
                          >
                            <span
                              className={`w-1.5 h-1.5 rounded-full ${
                                child.status === 'completed'
                                  ? 'bg-emerald-500'
                                  : child.status === 'in_progress'
                                  ? 'bg-amber-500'
                                  : 'bg-slate-300'
                              }`}
                            />
                            <span>{child.title}</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 space-y-2">
            <h3 className="font-bold text-slate-800 text-xs flex items-center gap-1.5">
              <Filter className="w-3.5 h-3.5 text-slate-400" />
              筛选器
            </h3>
            <label className="flex items-center gap-2 text-xs text-slate-600 cursor-pointer">
              <input type="checkbox" defaultChecked className="rounded border-slate-300 text-teal-600 focus:ring-teal-500" />
              仅显示进行中
            </label>
            <label className="flex items-center gap-2 text-xs text-slate-600 cursor-pointer">
              <input type="checkbox" defaultChecked className="rounded border-slate-300 text-teal-600 focus:ring-teal-500" />
              显示已完成
            </label>
          </div>
        </div>
      </div>

      {/* Center Canvas */}
      <div className="flex-1 bg-white rounded-2xl border border-slate-200/80 relative flex flex-col overflow-hidden">
        {/* Header Title */}
        <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <div>
            <h1 className="text-base font-bold text-slate-800">全局学习地图</h1>
            <p className="text-xs text-slate-400">从基础到前沿，建立完整 AI 知识网络</p>
          </div>
        </div>

        {/* Visual Graph View Simulation */}
        <div className="flex-1 bg-[#F8FAFC] relative overflow-hidden flex items-center justify-center p-8">
          {/* Background grid lines */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#e2e8f015_1px,transparent_1px),linear-gradient(to_bottom,#e2e8f015_1px,transparent_1px)] bg-[size:24px_24px]" />

          {/* Canvas Nodes Simulation */}
          <div className="relative w-full max-w-3xl h-96 flex items-center justify-between">
            {/* Root Node */}
            <div className="w-36 p-3 bg-white rounded-2xl border-2 border-teal-500 shadow-lg text-center space-y-1 relative z-10">
              <span className="text-[10px] font-bold px-1.5 py-0.5 bg-teal-50 text-teal-600 rounded-full">78%</span>
              <h3 className="font-bold text-slate-800 text-sm">人工智能</h3>
            </div>

            {/* Middle Branch Nodes */}
            <div className="space-y-6 relative z-10">
              <div className="w-32 p-2.5 bg-white rounded-xl border border-emerald-300 shadow-sm text-center">
                <span className="text-[9px] px-1 bg-emerald-50 text-emerald-600 rounded">100%</span>
                <div className="text-xs font-semibold text-slate-700">数学基础</div>
              </div>
              <div className="w-32 p-2.5 bg-white rounded-xl border border-emerald-300 shadow-sm text-center">
                <span className="text-[9px] px-1 bg-emerald-50 text-emerald-600 rounded">85%</span>
                <div className="text-xs font-semibold text-slate-700">机器学习</div>
              </div>
              <div className="w-32 p-2.5 bg-white rounded-xl border-2 border-amber-400 shadow-md text-center bg-amber-50/30">
                <span className="text-[9px] px-1 bg-amber-100 text-amber-700 rounded font-bold">60%</span>
                <div className="text-xs font-bold text-slate-800">深度学习</div>
              </div>
              <div className="w-32 p-2.5 bg-white rounded-xl border border-slate-200 shadow-sm text-center">
                <span className="text-[9px] px-1 bg-slate-100 text-slate-500 rounded">40%</span>
                <div className="text-xs font-semibold text-slate-600">Transformer</div>
              </div>
            </div>

            {/* Right Leaf Nodes */}
            <div className="space-y-3 relative z-10">
              <div className="w-36 p-2 bg-white rounded-lg border border-slate-200 text-xs font-medium text-slate-600 flex items-center justify-between">
                <span>线性代数</span>
                <span className="text-[9px] text-emerald-600 font-bold">100%</span>
              </div>
              <div className="w-36 p-2 bg-white rounded-lg border border-slate-200 text-xs font-medium text-slate-600 flex items-center justify-between">
                <span>线性回归</span>
                <span className="text-[9px] text-emerald-600 font-bold">80%</span>
              </div>
              <div className="w-36 p-2.5 bg-amber-50 rounded-xl border-2 border-orange-500 shadow-glow text-xs font-bold text-slate-900 flex items-center justify-between">
                <span>人工神经元</span>
                <span className="text-[10px] text-orange-600 font-extrabold">60%</span>
              </div>
              <div className="w-36 p-2 bg-white rounded-lg border border-slate-200 text-xs font-medium text-slate-600 flex items-center justify-between">
                <span>激活函数</span>
                <span className="text-[9px] text-amber-600 font-bold">50%</span>
              </div>
              <div className="w-36 p-2 bg-white rounded-lg border border-slate-200 text-xs font-medium text-slate-600 flex items-center justify-between">
                <span>反向传播</span>
                <span className="text-[9px] text-slate-400">30%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Canvas Toolbar */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-white/90 backdrop-blur-md px-4 py-2 rounded-full border border-slate-200 shadow-md flex items-center gap-4 text-xs font-medium text-slate-600">
          <button className="flex items-center gap-1 hover:text-teal-600">
            <ZoomIn className="w-3.5 h-3.5" /> 放大
          </button>
          <button className="flex items-center gap-1 hover:text-teal-600">
            <ZoomOut className="w-3.5 h-3.5" /> 缩小
          </button>
          <button className="flex items-center gap-1 hover:text-teal-600">
            <Maximize2 className="w-3.5 h-3.5" /> 居中
          </button>
          <button className="flex items-center gap-1 hover:text-teal-600">
            <Share2 className="w-3.5 h-3.5" /> 显示依赖关系
          </button>
        </div>
      </div>

      {/* Right Drawer: Node Detail */}
      <div className="w-full md:w-80 bg-white rounded-2xl border border-slate-200/80 p-5 flex flex-col justify-between overflow-y-auto">
        <div className="space-y-5">
          <div className="flex items-center justify-between">
            <h2 className="font-bold text-slate-800 text-sm">节点详情</h2>
            <button aria-label="关闭" className="text-slate-400 hover:text-slate-600">
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Node Title & Percent */}
          <div className="flex items-start gap-3">
            <div className="w-12 h-12 rounded-full bg-amber-50 border border-amber-200 text-amber-600 font-extrabold text-sm flex items-center justify-center">
              60%
            </div>
            <div>
              <h3 className="font-extrabold text-slate-900 text-lg">人工神经元</h3>
              <div className="flex gap-2 mt-1">
                <DifficultyBadge difficulty="intermediate" />
                <span className="inline-flex items-center gap-1 text-[11px] text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
                  <Clock className="w-3 h-3" /> 25 分钟
                </span>
              </div>
            </div>
          </div>

          <p className="text-xs text-slate-600 leading-relaxed">
            理解神经网络的基本计算单元，包括输入、权重、偏置、激活与输出之间的关系。
          </p>

          {/* Prerequisites */}
          <div className="space-y-2">
            <h4 className="font-bold text-slate-800 text-xs">前置知识</h4>
            <div className="space-y-1.5">
              <div className="flex items-center justify-between p-2 bg-slate-50 rounded-xl text-xs">
                <div className="flex items-center gap-2 text-slate-700">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  <span>线性代数</span>
                </div>
                <span className="text-[10px] text-emerald-600 font-bold">已完成</span>
              </div>
              <div className="flex items-center justify-between p-2 bg-slate-50 rounded-xl text-xs">
                <div className="flex items-center gap-2 text-slate-700">
                  <div className="w-4 h-4 rounded-full border-2 border-amber-500 flex items-center justify-center">
                    <div className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                  </div>
                  <span>线性回归</span>
                </div>
                <span className="text-[10px] text-amber-600 font-bold">进行中</span>
              </div>
            </div>
          </div>

          {/* Next Steps */}
          <div className="space-y-2">
            <h4 className="font-bold text-slate-800 text-xs">下一步知识</h4>
            <div className="space-y-1.5 text-xs">
              <div className="flex items-center justify-between p-2 hover:bg-slate-50 rounded-xl cursor-pointer text-slate-700">
                <span>激活函数</span>
                <span className="text-[10px] text-amber-600 font-semibold">进行中 &gt;</span>
              </div>
              <div className="flex items-center justify-between p-2 hover:bg-slate-50 rounded-xl cursor-pointer text-slate-700">
                <span>反向传播</span>
                <span className="text-[10px] text-slate-400">未开始 &gt;</span>
              </div>
              <div className="flex items-center justify-between p-2 hover:bg-slate-50 rounded-xl cursor-pointer text-slate-700 border-t border-slate-100 pt-2">
                <span className="flex items-center gap-1.5">
                  <BookOpen className="w-3.5 h-3.5 text-slate-400" /> 相关笔记
                </span>
                <span className="text-xs font-bold text-slate-600">3 篇 &gt;</span>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="pt-4 border-t border-slate-100 space-y-2">
          <Link
            href="/learn/deep-learning/neuron"
            className="w-full flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-600 text-white font-bold text-sm py-2.5 rounded-xl shadow-md transition-all"
          >
            <Play className="w-4 h-4 fill-white" />
            继续学习
          </Link>
          <Link
            href="/learn/deep-learning/neuron"
            className="w-full flex items-center justify-center gap-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 text-xs font-semibold py-2.5 rounded-xl transition-all"
          >
            <BookOpen className="w-3.5 h-3.5" />
            查看相关笔记
          </Link>
          <button className="w-full flex items-center justify-center gap-1 text-slate-400 hover:text-slate-600 text-xs py-1">
            <Star className="w-3.5 h-3.5" /> 收藏节点
          </button>
        </div>
      </div>
    </div>
  );
}
