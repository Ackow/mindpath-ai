'use client';

import React, { useState } from 'react';
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
  Filter,
  Network
} from 'lucide-react';

export default function MindMapPage() {
  const allNodes = getGlobalGraphNodes();
  const moduleTree = getHierarchicalModuleTree();

  const [selectedNodeId, setSelectedNodeId] = useState('py-environment');
  const [expandedModules, setExpandedModules] = useState<string[]>(['foundations', 'sub-python']);

  const selectedNode = getNodeById(selectedNodeId) || allNodes[0];

  const toggleModule = (id: string) => {
    setExpandedModules((prev) =>
      prev.includes(id) ? prev.filter((m) => m !== id) : [...prev, id]
    );
  };

  return (
    <div className="h-[calc(100vh-120px)] flex flex-col md:flex-row gap-4 overflow-hidden">
      {/* Left Sidebar: Dynamic Hierarchical Module Tree & Filters */}
      <div className="w-full md:w-80 bg-white rounded-2xl border border-slate-200/80 p-5 sm:p-6 flex flex-col justify-between overflow-y-auto">
        <div className="space-y-4">
          <h2 className="font-bold text-slate-800 text-base flex items-center gap-2">
            <Network className="w-4 h-4 text-teal-600" />
            模块树与知识结构
          </h2>

          <div className="space-y-1.5 text-sm">
            <div className="font-bold text-slate-800 py-1.5 px-2 flex items-center gap-1.5 bg-slate-50 rounded-lg">
              <ChevronDown className="w-4 h-4 text-slate-400" />
              <span>人工智能知识全景路线</span>
            </div>

            <div className="pl-2 space-y-1 mt-1">
              {moduleTree.map((mod) => {
                const isExpanded = expandedModules.includes(mod.id);
                return (
                  <div key={mod.id} className="space-y-1">
                    {/* Top Stage Module */}
                    <button
                      onClick={() => toggleModule(mod.id)}
                      className="w-full flex items-center justify-between py-1.5 px-2 rounded-lg hover:bg-slate-100 text-slate-800 font-bold transition-colors text-left text-xs sm:text-sm"
                    >
                      <div className="flex items-center gap-1.5 truncate">
                        {mod.submodules.length > 0 ? (
                          isExpanded ? (
                            <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
                          ) : (
                            <ChevronRight className="w-4 h-4 text-slate-400 shrink-0" />
                          )
                        ) : (
                          <div className="w-4 h-4 shrink-0" />
                        )}
                        <span className="truncate">{mod.title}</span>
                      </div>
                    </button>

                    {/* Submodules Level */}
                    {isExpanded && mod.submodules.length > 0 && (
                      <div className="pl-4 space-y-1 border-l-2 border-slate-200 ml-3">
                        {mod.submodules.map((sub) => {
                          const isSubExpanded = expandedModules.includes(sub.id);
                          return (
                            <div key={sub.id} className="space-y-0.5">
                              <button
                                onClick={() => toggleModule(sub.id)}
                                className="w-full flex items-center gap-1.5 py-1 px-2 rounded-md hover:bg-slate-50 text-slate-700 font-semibold text-xs sm:text-xs transition-colors text-left"
                              >
                                {sub.children.length > 0 ? (
                                  isSubExpanded ? (
                                    <ChevronDown className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                                  ) : (
                                    <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                                  )
                                ) : (
                                  <div className="w-3.5 h-3.5 shrink-0" />
                                )}
                                <span className="truncate">{sub.title}</span>
                              </button>

                              {/* Chapter Nodes */}
                              {isSubExpanded && sub.children.length > 0 && (
                                <div className="pl-4 space-y-1 border-l border-teal-200 ml-2">
                                  {sub.children.map((child) => (
                                    <button
                                      key={child.id}
                                      onClick={() => setSelectedNodeId(child.id)}
                                      className={`w-full flex items-center gap-2 py-1.5 px-2 rounded-lg text-left text-xs transition-all ${
                                        selectedNodeId === child.id
                                          ? 'bg-amber-50 text-amber-800 font-extrabold border border-amber-300 shadow-sm'
                                          : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900 font-medium'
                                      }`}
                                    >
                                      <span
                                        className={`w-2 h-2 rounded-full shrink-0 ${
                                          child.status === 'completed'
                                            ? 'bg-emerald-500'
                                            : child.status === 'in_progress'
                                            ? 'bg-amber-500'
                                            : 'bg-slate-300'
                                        }`}
                                      />
                                      <span className="truncate">{child.title}</span>
                                    </button>
                                  ))}
                                </div>
                              )}
                            </div>
                          );
                        })}
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
              视图筛选
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

      {/* Center Canvas: Interactive Mind Map with Bezier Curves and Zoom Control */}
      <div className="flex-1 bg-white rounded-2xl border border-slate-200/80 relative flex flex-col overflow-hidden">
        {/* Header Title */}
        <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <div>
            <h1 className="text-base font-bold text-slate-800">
              {selectedNode.submodule === 'python'
                ? '🐍 Python 与科学计算 (全景导图)'
                : selectedNode.submodule === 'math'
                ? '📐 线性代数与微积分图谱'
                : '全局学习地图'}
            </h1>
            <p className="text-xs text-slate-400">支持拖拽移动、按键缩放、曲线分支分支连线与节点高亮联动</p>
          </div>
        </div>

        {/* Dynamic MindMap Component */}
        <InteractiveMindMap
          nodes={allNodes}
          selectedNodeId={selectedNodeId}
          onSelectNode={setSelectedNodeId}
        />
      </div>

      {/* Right Drawer: Dynamic Node Detail */}
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
            <div className="w-12 h-12 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-600 font-extrabold text-sm flex items-center justify-center shrink-0">
              {selectedNode.progressPercent || 100}%
            </div>
            <div>
              <h3 className="font-extrabold text-slate-900 text-base">{selectedNode.title}</h3>
              <div className="flex gap-2 mt-1">
                <DifficultyBadge difficulty={selectedNode.difficulty} />
                <span className="inline-flex items-center gap-1 text-[11px] text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
                  <Clock className="w-3 h-3" /> {selectedNode.estimatedMinutes} 分钟
                </span>
              </div>
            </div>
          </div>

          <p className="text-xs text-slate-600 leading-relaxed">
            {selectedNode.summary || '掌握当前知识节点的核心概念、原理推导与代码实践。'}
          </p>

          {/* Prerequisites */}
          <div className="space-y-2">
            <h4 className="font-bold text-slate-800 text-xs">前置知识</h4>
            <div className="space-y-1.5">
              {selectedNode.prerequisites.length > 0 ? (
                selectedNode.prerequisites.map((preId) => {
                  const preNode = getNodeById(preId);
                  return (
                    <div key={preId} className="flex items-center justify-between p-2 bg-slate-50 rounded-xl text-xs">
                      <div className="flex items-center gap-2 text-slate-700">
                        <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                        <span>{preNode?.title || preId}</span>
                      </div>
                      <span className="text-[10px] text-emerald-600 font-bold">已完成</span>
                    </div>
                  );
                })
              ) : (
                <div className="text-[11px] text-slate-400 p-2 bg-slate-50 rounded-xl">无前置知识，建议作为起始入门阶段</div>
              )}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="pt-4 border-t border-slate-100 space-y-2">
          <Link
            href={selectedNode.route}
            className="w-full flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-600 text-white font-bold text-sm py-2.5 rounded-xl shadow-md transition-all"
          >
            <Play className="w-4 h-4 fill-white" />
            进入笔记学习
          </Link>
          <Link
            href={selectedNode.route}
            className="w-full flex items-center justify-center gap-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 text-xs font-semibold py-2.5 rounded-xl transition-all"
          >
            <BookOpen className="w-3.5 h-3.5" />
            查看详细内容
          </Link>
        </div>
      </div>
    </div>
  );
}
