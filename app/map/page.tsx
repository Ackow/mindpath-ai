'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { DifficultyBadge } from '@/components/ui/Badge';
import { getGlobalGraphNodes, getNodeById, getHierarchicalModuleTree } from '@/lib/graph';
import { InteractiveMindMap } from '@/components/mindmap/InteractiveMindMap';
import {
  ChevronDown,
  ChevronRight,
  CheckCircle2,
  Clock,
  Play,
  BookOpen,
  X,
  SlidersHorizontal,
  Network,
  Star,
  BarChart2,
  Share2
} from 'lucide-react';

export default function MindMapPage() {
  const allNodes = getGlobalGraphNodes();
  const moduleTree = getHierarchicalModuleTree();

  const [selectedNodeId, setSelectedNodeId] = useState('py-environment');

  // Persistent Expanded Left Catalog Modules in LocalStorage
  const [expandedModules, setExpandedModules] = useState<string[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('map_expanded_modules');
        if (saved) return JSON.parse(saved);
      } catch (e) {}
    }
    return ['foundations', 'sub-python'];
  });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('map_expanded_modules', JSON.stringify(expandedModules));
    }
  }, [expandedModules]);

  const [isRelatedExpanded, setIsRelatedExpanded] = useState<boolean>(false);

  const selectedNode = getNodeById(selectedNodeId) || allNodes[0];

  const toggleModule = (id: string) => {
    setExpandedModules((prev) =>
      prev.includes(id) ? prev.filter((m) => m !== id) : [...prev, id]
    );
  };

  // Find Next Knowledge Nodes
  const nextNodes = (selectedNode.next || [])
    .map((nextId) => getNodeById(nextId))
    .filter(Boolean);

  // Related Notes list & count
  const relatedNoteNodes = allNodes.filter(
    (n) => n.id !== selectedNode.id && n.submodule === selectedNode.submodule && n.route.startsWith('/learn/')
  );

  return (
    <div className="animate-page-fade h-[calc(100vh-120px)] flex flex-col md:flex-row gap-4 overflow-hidden">
      {/* Left Sidebar: Dynamic Hierarchical Module Tree with Silky Expansion Animation */}
      <div className="w-full md:w-80 bg-white rounded-2xl border border-slate-200/80 p-5 flex flex-col justify-between overflow-y-auto select-none">
        <div className="space-y-4">
          <h2 className="font-bold text-slate-800 text-sm flex items-center gap-2">
            <Network className="w-4 h-4 text-teal-600" />
            模块树
          </h2>

          <div className="space-y-1.5 text-xs">
            <div className="font-bold text-slate-800 py-1.5 px-2 flex items-center gap-1.5 bg-slate-50 rounded-lg">
              <ChevronDown className="w-4 h-4 text-teal-600 shrink-0" />
              <span>人工智能</span>
            </div>

            <div className="pl-2 space-y-1 mt-1">
              {moduleTree.map((mod) => {
                const isExpanded = expandedModules.includes(mod.id);
                return (
                  <div key={mod.id} className="space-y-1">
                    {/* Level 1 Stage Module Toggle Button */}
                    <button
                      onClick={() => toggleModule(mod.id)}
                      className="w-full flex items-center justify-between py-1.5 px-2 rounded-lg hover:bg-slate-50 text-slate-800 font-bold transition-colors text-left text-xs group"
                    >
                      <div className="flex items-center gap-1.5 truncate">
                        {mod.submodules.length > 0 ? (
                          <ChevronRight
                            className={`w-3.5 h-3.5 text-slate-400 shrink-0 transition-transform duration-300 ${
                              isExpanded ? 'rotate-90 text-teal-600' : 'rotate-0'
                            }`}
                          />
                        ) : (
                          <div className="w-3.5 h-3.5 shrink-0" />
                        )}
                        <span className="truncate group-hover:text-teal-600 transition-colors">{mod.title}</span>
                      </div>
                    </button>

                    {/* Level 1 Smooth Grid Fraction Expand Container */}
                    <div
                      className={`grid transition-all duration-300 ease-in-out ${
                        isExpanded && mod.submodules.length > 0
                          ? 'grid-rows-[1fr] opacity-100'
                          : 'grid-rows-[0fr] opacity-0 pointer-events-none'
                      }`}
                    >
                      <div className="overflow-hidden pl-3 space-y-1 border-l border-slate-200 ml-3">
                        {mod.submodules.map((sub) => {
                          const isSubExpanded = expandedModules.includes(sub.id);
                          return (
                            <div key={sub.id} className="space-y-0.5">
                              {/* Level 2 Submodule Toggle Button */}
                              <button
                                onClick={() => toggleModule(sub.id)}
                                className="w-full flex items-center gap-1.5 py-1 px-2 rounded-md hover:bg-slate-50 text-slate-700 font-semibold text-xs transition-colors text-left group"
                              >
                                {sub.children.length > 0 ? (
                                  <ChevronRight
                                    className={`w-3 h-3 text-slate-400 shrink-0 transition-transform duration-300 ${
                                      isSubExpanded ? 'rotate-90 text-teal-600' : 'rotate-0'
                                    }`}
                                  />
                                ) : (
                                  <div className="w-3 h-3 shrink-0" />
                                )}
                                <span className="truncate group-hover:text-teal-600 transition-colors">{sub.title}</span>
                              </button>

                              {/* Level 2 Smooth Grid Fraction Expand Container for Chapter Nodes */}
                              <div
                                className={`grid transition-all duration-300 ease-in-out ${
                                  isSubExpanded && sub.children.length > 0
                                    ? 'grid-rows-[1fr] opacity-100'
                                    : 'grid-rows-[0fr] opacity-0 pointer-events-none'
                                }`}
                              >
                                <div className="overflow-hidden pl-3 space-y-1 border-l border-teal-200 ml-2 py-0.5">
                                  {sub.children.map((child) => {
                                    const isCompleted = child.status === 'completed';
                                    const isSelected = selectedNodeId === child.id;

                                    return (
                                      <button
                                        key={child.id}
                                        onClick={() => setSelectedNodeId(child.id)}
                                        className={`w-full flex items-center gap-2 py-1.5 px-2 rounded-xl text-left text-xs transition-all ${
                                          isSelected
                                            ? 'bg-amber-50 text-amber-900 font-extrabold border border-amber-300 shadow-2xs'
                                            : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900 font-medium'
                                        }`}
                                      >
                                        {isCompleted ? (
                                          <span className="w-4 h-4 rounded-full bg-emerald-50 border border-emerald-500 text-emerald-600 flex items-center justify-center text-[10px] font-bold shrink-0">
                                            ✓
                                          </span>
                                        ) : (
                                          <span className="w-4 h-4 rounded-full border-2 border-orange-500 flex items-center justify-center shrink-0">
                                            <span className="w-1.5 h-1.5 rounded-full bg-orange-500" />
                                          </span>
                                        )}
                                        <span className="truncate">{child.title}</span>
                                      </button>
                                    );
                                  })}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Reference-Matched Filters Section */}
          <div className="pt-4 border-t border-slate-100 space-y-2.5">
            <h3 className="font-bold text-slate-800 text-xs flex items-center gap-1.5">
              <SlidersHorizontal className="w-3.5 h-3.5 text-slate-400" />
              筛选器
            </h3>

            <label className="flex items-center gap-2 text-xs text-slate-600 cursor-pointer">
              <input
                type="checkbox"
                className="w-4 h-4 rounded border-amber-400 text-amber-500 focus:ring-amber-400"
              />
              <span>仅显示进行中</span>
            </label>

            <label className="flex items-center gap-2 text-xs text-slate-600 cursor-pointer">
              <input
                type="checkbox"
                defaultChecked
                className="w-4 h-4 rounded bg-teal-600 border-teal-600 text-white focus:ring-teal-500"
              />
              <span>显示已完成</span>
            </label>

            <div className="flex items-center justify-between pt-1 text-xs text-slate-600 cursor-pointer hover:text-slate-900">
              <div className="flex items-center gap-1.5">
                <BarChart2 className="w-3.5 h-3.5 text-slate-400" />
                <span>按难度</span>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </div>

            <div className="flex items-center justify-between text-xs text-slate-600 cursor-pointer hover:text-slate-900">
              <div className="flex items-center gap-1.5">
                <Share2 className="w-3.5 h-3.5 text-slate-400" />
                <span>显示依赖关系</span>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Center Canvas: Interactive Mind Map */}
      <div className="flex-1 bg-white rounded-2xl border border-slate-200/80 relative flex flex-col overflow-hidden">
        {/* Header Title */}
        <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <div>
            <h1 className="text-base font-bold text-slate-800">
              全局学习地图
            </h1>
            <p className="text-xs text-slate-400">从基础到前沿，建立完整 AI 知识网络</p>
          </div>
        </div>

        {/* Dynamic MindMap Component */}
        <InteractiveMindMap
          nodes={allNodes}
          selectedNodeId={selectedNodeId}
          onSelectNode={setSelectedNodeId}
        />
      </div>

      {/* Right Drawer: Expanded Width (380px) & Reference-Matched Exact Cards */}
      <div className="w-full md:w-[380px] xl:w-[410px] bg-white rounded-2xl border border-slate-200/80 p-6 flex flex-col justify-between overflow-y-auto shrink-0 select-none">
        <div className="space-y-5">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h2 className="font-bold text-slate-800 text-sm">节点详情</h2>
            <button aria-label="关闭" className="text-slate-400 hover:text-slate-600">
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Node Progress Circle & Title */}
          <div className="flex items-start gap-3.5">
            <div className={`w-12 h-12 rounded-full border-2 text-sm font-extrabold flex items-center justify-center shrink-0 shadow-2xs ${
              (selectedNode.progressPercent || 100) === 100
                ? 'bg-emerald-50 border-emerald-500 text-emerald-600'
                : 'bg-amber-50 border-orange-400 text-orange-600'
            }`}>
              {selectedNode.progressPercent || 60}%
            </div>
            <div>
              <h3 className="font-extrabold text-slate-900 text-base leading-snug">{selectedNode.title}</h3>
              <div className="flex items-center gap-2 mt-1.5">
                <DifficultyBadge difficulty={selectedNode.difficulty} />
                <span className="inline-flex items-center gap-1 text-[11px] text-slate-500 bg-slate-100 px-2.5 py-0.5 rounded-full font-medium">
                  <Clock className="w-3 h-3 text-slate-400" /> {selectedNode.estimatedMinutes || 25} 分钟
                </span>
              </div>
            </div>
          </div>

          <p className="text-xs text-slate-600 leading-relaxed">
            {selectedNode.summary || '掌握当前知识节点的核心概念、原理推导与代码实践。'}
          </p>

          {/* 1. 前置知识 (Prerequisites) */}
          <div className="space-y-2">
            <h4 className="font-bold text-slate-800 text-xs">前置知识</h4>
            <div className="space-y-2">
              {selectedNode.prerequisites.length > 0 ? (
                selectedNode.prerequisites.map((preId, idx) => {
                  const preNode = getNodeById(preId);
                  const isFinished = idx === 0 || preNode?.status === 'completed';

                  return (
                    <div key={preId} className="flex items-center justify-between p-3 bg-[#F8FAFC] rounded-xl text-xs border border-slate-100">
                      <div className="flex items-center gap-2.5 font-medium text-slate-700">
                        {isFinished ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                        ) : (
                          <span className="w-4 h-4 rounded-full border-2 border-orange-500 flex items-center justify-center shrink-0">
                            <span className="w-1.5 h-1.5 rounded-full bg-orange-500" />
                          </span>
                        )}
                        <span className="font-semibold text-slate-800">{preNode?.title || '线性代数'}</span>
                      </div>
                      <span className={`font-extrabold text-[11px] ${isFinished ? 'text-emerald-600' : 'text-orange-500'}`}>
                        {isFinished ? '已完成' : '进行中'}
                      </span>
                    </div>
                  );
                })
              ) : (
                <div className="flex items-center justify-between p-3 bg-[#F8FAFC] rounded-xl text-xs border border-slate-100">
                  <div className="flex items-center gap-2.5 font-medium text-slate-700">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span className="font-semibold text-slate-800">Python 基础环境</span>
                  </div>
                  <span className="font-extrabold text-[11px] text-emerald-600">已完成</span>
                </div>
              )}
            </div>
          </div>

          {/* 2. 下一步知识 (Next Knowledge) */}
          <div className="space-y-2">
            <h4 className="font-bold text-slate-800 text-xs">下一步知识</h4>
            <div className="space-y-2">
              {nextNodes.length > 0 ? (
                nextNodes.map((nextNode: any, idx: number) => {
                  const isNextInProgress = idx === 0;

                  return (
                    <div
                      key={nextNode.id}
                      onClick={() => setSelectedNodeId(nextNode.id)}
                      className="flex items-center justify-between p-3 bg-[#F8FAFC] hover:bg-slate-100 rounded-xl text-xs cursor-pointer transition-colors border border-slate-100"
                    >
                      <div className="flex items-center gap-2.5 font-medium text-slate-700 truncate">
                        {isNextInProgress ? (
                          <span className="w-4 h-4 rounded-full border-2 border-orange-500 flex items-center justify-center shrink-0">
                            <span className="w-1.5 h-1.5 rounded-full bg-orange-500" />
                          </span>
                        ) : (
                          <span className="w-4 h-4 rounded-full border-2 border-slate-300 shrink-0" />
                        )}
                        <span className="font-semibold text-slate-800 truncate">{nextNode.title}</span>
                      </div>

                      <div className="flex items-center gap-1 shrink-0">
                        <span className={`font-bold text-[11px] ${isNextInProgress ? 'text-orange-500' : 'text-slate-400'}`}>
                          {isNextInProgress ? '进行中' : '未开始'}
                        </span>
                        <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="flex items-center justify-between p-3 bg-[#F8FAFC] rounded-xl text-xs border border-slate-100">
                  <div className="flex items-center gap-2.5 font-medium text-slate-700">
                    <span className="w-4 h-4 rounded-full border-2 border-orange-500 flex items-center justify-center shrink-0">
                      <span className="w-1.5 h-1.5 rounded-full bg-orange-500" />
                    </span>
                    <span className="font-semibold text-slate-800">激活函数与模型评估</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="font-bold text-[11px] text-orange-500">进行中</span>
                    <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* 3. 相关笔记 (With Silky Smooth Grid Fraction Expand/Collapse Animation) */}
          <div className="space-y-1">
            <div
              onClick={() => setIsRelatedExpanded(!isRelatedExpanded)}
              className="flex items-center justify-between p-3.5 bg-[#F8FAFC] hover:bg-slate-100 rounded-xl text-xs border border-slate-200/80 transition-all cursor-pointer select-none"
            >
              <div className="flex items-center gap-2.5 text-slate-700">
                <BookOpen className="w-4 h-4 text-slate-500" />
                <span className="font-extrabold text-slate-800">相关笔记</span>
              </div>
              <div className="flex items-center gap-1.5 text-slate-500 font-bold">
                <span>{relatedNoteNodes.length || 3}</span>
                <ChevronRight className={`w-4 h-4 text-slate-400 transition-transform duration-300 ${
                  isRelatedExpanded ? 'rotate-90 text-teal-600' : 'rotate-0'
                }`} />
              </div>
            </div>

            {/* Silky Smooth Animated Expand Container using CSS Grid template rows */}
            <div
              className={`grid transition-all duration-300 ease-in-out ${
                isRelatedExpanded
                  ? 'grid-rows-[1fr] opacity-100 pt-2'
                  : 'grid-rows-[0fr] opacity-0 pt-0 pointer-events-none'
              }`}
            >
              <div className="overflow-hidden space-y-2 px-1">
                {relatedNoteNodes.slice(0, 3).map((n) => (
                  <Link
                    key={n.id}
                    href={n.route}
                    className="flex items-center justify-between p-3 bg-white border border-slate-200 hover:border-teal-400 hover:shadow-xs rounded-xl text-xs transition-all shadow-2xs group"
                  >
                    <span className="font-semibold text-slate-800 group-hover:text-teal-600 truncate">{n.title}</span>
                    <BookOpen className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Action Buttons */}
        <div className="pt-4 border-t border-slate-100 space-y-2">
          <Link
            href={selectedNode.route}
            className="w-full flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-600 text-white font-bold text-sm py-3 rounded-xl shadow-md transition-all"
          >
            <Play className="w-4 h-4 fill-white" />
            继续学习
          </Link>
          <button className="w-full flex items-center justify-center gap-1.5 text-slate-500 hover:text-slate-800 text-xs font-medium py-1.5 transition-colors">
            <Star className="w-3.5 h-3.5 text-slate-400" />
            <span>收藏节点</span>
          </button>
        </div>
      </div>
    </div>
  );
}
