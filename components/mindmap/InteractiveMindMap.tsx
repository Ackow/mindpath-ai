'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { MindMapNodeData } from '@/lib/types';
import { ZoomIn, ZoomOut, Maximize2, Share2, Code, Calculator, Binary } from 'lucide-react';

interface InteractiveMindMapProps {
  nodes: MindMapNodeData[];
  selectedNodeId: string;
  onSelectNode: (id: string) => void;
}

export const InteractiveMindMap: React.FC<InteractiveMindMapProps> = ({
  nodes,
  selectedNodeId,
  onSelectNode,
}) => {
  const router = useRouter();
  const [zoomLevel, setZoomLevel] = useState<number>(0.75);
  const [panOffset, setPanOffset] = useState<{ x: number; y: number }>({ x: -20, y: -40 });
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [showDependencies, setShowDependencies] = useState<boolean>(true);

  const containerRef = useRef<HTMLDivElement>(null);

  // Zoom handlers
  const handleZoomIn = () => setZoomLevel((prev) => Math.min(2.5, prev + 0.15));
  const handleZoomOut = () => setZoomLevel((prev) => Math.max(0.3, prev - 0.15));
  const handleResetZoom = () => {
    setZoomLevel(0.75);
    setPanOffset({ x: -20, y: -40 });
  };

  // Mouse wheel zoom listener
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      const delta = e.deltaY < 0 ? 0.08 : -0.08;
      setZoomLevel((prev) => Math.min(2.5, Math.max(0.3, prev + delta)));
    };

    container.addEventListener('wheel', handleWheel, { passive: false });
    return () => {
      container.removeEventListener('wheel', handleWheel);
    };
  }, []);

  // Mouse drag pan handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    if (target.closest('.node-card')) return;

    setIsDragging(true);
    setDragStart({ x: e.clientX - panOffset.x, y: e.clientY - panOffset.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    e.preventDefault();
    setPanOffset({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    });
  };

  const handleMouseUp = () => setIsDragging(false);

  // Strictly Filter Submodule Nodes
  const pythonNodes = nodes.filter((n) => n.submodule === 'python');
  const mathNodes = nodes.filter((n) => n.submodule === 'math');
  const probNodes = nodes.filter((n) => n.submodule === 'probability');

  // Exact Pixel Layout Anchors
  const rootAnchor = { x: 160, y: 550 };

  const level1Modules = [
    { id: 'm-foundations', title: '阶段 0: 准备知识', percent: 100, top: 40 },
    { id: 'm-ml', title: '阶段 1-4: 机器学习', percent: 85, top: 680 },
    { id: 'm-dl', title: '阶段 5: 深度学习', percent: 60, top: 860 },
    { id: 'm-nlp', title: 'Transformer 与 LLM', percent: 70, top: 1040 },
    { id: 'm-rag', title: 'RAG 与 Agent', percent: 30, top: 1200 },
  ];

  // Level 2 Submodules Parent Nodes (under Foundations)
  const foundationsSubmodules = [
    {
      id: 'sub-python',
      title: 'Python 与科学计算',
      subtitle: '12 篇 Python 核心笔记',
      icon: Code,
      top: 40,
      parentCenterY: 420,
      nodes: pythonNodes,
      leftIn: { x: 440, y: 420 },
      rightOut: { x: 640, y: 420 },
    },
    {
      id: 'sub-math',
      title: '线性代数与微积分',
      subtitle: '4 篇数学核心笔记',
      icon: Calculator,
      top: 840,
      parentCenterY: 936,
      nodes: mathNodes,
      leftIn: { x: 440, y: 936 },
      rightOut: { x: 640, y: 936 },
    },
    {
      id: 'sub-prob',
      title: '概率论与统计',
      subtitle: '2 篇概率与 MLE 笔记',
      icon: Binary,
      top: 1140,
      parentCenterY: 1172,
      nodes: probNodes,
      leftIn: { x: 440, y: 1172 },
      rightOut: { x: 640, y: 1172 },
    },
  ];

  const leafLeft = 720;

  return (
    <div
      ref={containerRef}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      className={`relative w-full h-full bg-[#F8FAFC] overflow-hidden select-none cursor-grab ${
        isDragging ? 'cursor-grabbing' : ''
      }`}
    >
      {/* Background grid lines */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#e2e8f015_1px,transparent_1px),linear-gradient(to_bottom,#e2e8f015_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />

      {/* Main Canvas with Transform */}
      <div
        className="absolute inset-0 transition-transform duration-75 ease-out flex items-center justify-center pointer-events-none"
        style={{
          transform: `translate(${panOffset.x}px, ${panOffset.y}px) scale(${zoomLevel})`,
          transformOrigin: 'center center',
        }}
      >
        <div className="relative w-[1300px] h-[1350px] pointer-events-auto">
          {/* SVG Connecting Bezier Lines */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none z-0">
            <defs>
              <linearGradient id="lineGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#94A3B8" stopOpacity="0.6" />
                <stop offset="100%" stopColor="#0D9488" stopOpacity="0.9" />
              </linearGradient>
              <linearGradient id="activeGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#F97316" stopOpacity="0.9" />
                <stop offset="100%" stopColor="#F59E0B" stopOpacity="1" />
              </linearGradient>
              <linearGradient id="subGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#F59E0B" stopOpacity="0.8" />
                <stop offset="100%" stopColor="#10B981" stopOpacity="0.9" />
              </linearGradient>
            </defs>

            {/* 1. Root (160, 550) -> Level 1 Stage Modules (230, top + 22) */}
            {level1Modules.map((mod) => {
              const startX = rootAnchor.x;
              const startY = rootAnchor.y;
              const endX = 230;
              const endY = mod.top + 22;
              const ctrlX1 = startX + (endX - startX) * 0.5;
              const ctrlX2 = startX + (endX - startX) * 0.5;

              return (
                <path
                  key={mod.id}
                  d={`M ${startX} ${startY} C ${ctrlX1} ${startY}, ${ctrlX2} ${endY}, ${endX} ${endY}`}
                  fill="none"
                  stroke={mod.id === 'm-foundations' ? 'url(#activeGrad)' : 'url(#lineGrad)'}
                  strokeWidth={mod.id === 'm-foundations' ? '3' : '2'}
                />
              );
            })}

            {/* 2. Foundations Stage Module (380, 62) -> 3 Submodule Parent Nodes (440, Y) */}
            {foundationsSubmodules.map((sub) => {
              const startX = 380;
              const startY = 62;
              const endX = sub.leftIn.x;
              const endY = sub.leftIn.y;
              const ctrlX1 = startX + (endX - startX) * 0.5;
              const ctrlX2 = startX + (endX - startX) * 0.5;

              return (
                <path
                  key={sub.id}
                  d={`M ${startX} ${startY} C ${ctrlX1} ${startY}, ${ctrlX2} ${endY}, ${endX} ${endY}`}
                  fill="none"
                  stroke="url(#subGrad)"
                  strokeWidth="2.5"
                />
              );
            })}

            {/* 3. Submodule Parent Nodes (640, Y) -> Leaf Cards */}
            {foundationsSubmodules.map((sub) => {
              const startX = sub.rightOut.x;
              const startY = sub.rightOut.y;

              return sub.nodes.map((node, idx) => {
                const cardTop = sub.top + idx * 64;
                const endX = leafLeft;
                const endY = cardTop + 27;
                const ctrlX1 = startX + (endX - startX) * 0.4;
                const ctrlX2 = startX + (endX - startX) * 0.6;
                const isSelected = selectedNodeId === node.id;

                return (
                  <path
                    key={node.id}
                    d={`M ${startX} ${startY} C ${ctrlX1} ${startY}, ${ctrlX2} ${endY}, ${endX} ${endY}`}
                    fill="none"
                    stroke={isSelected ? 'url(#activeGrad)' : '#94A3B8'}
                    strokeWidth={isSelected ? '3' : '1.8'}
                  />
                );
              });
            })}

            {/* Prerequisite Flow Arrows */}
            {showDependencies && (
              <path
                d="M 960 37 C 1010 37, 1010 165, 960 165"
                fill="none"
                stroke="#F59E0B"
                strokeWidth="1.8"
                strokeDasharray="4 4"
              />
            )}
          </svg>

          {/* Level 0: Root Node */}
          <div
            style={{ left: '30px', top: '530px' }}
            className="node-card absolute w-32 py-2.5 px-3 bg-white rounded-full border-2 border-teal-500 shadow-md flex items-center gap-2 z-10 cursor-pointer hover:scale-105 transition-transform"
          >
            <div className="w-7 h-7 rounded-full bg-teal-50 text-teal-600 text-[10px] font-extrabold flex items-center justify-center border border-teal-200 shrink-0">
              78%
            </div>
            <span className="font-extrabold text-slate-800 text-xs">人工智能</span>
          </div>

          {/* Level 1: Stage Modules */}
          {level1Modules.map((mod) => {
            const isFoundations = mod.id === 'm-foundations';
            return (
              <div
                key={mod.id}
                style={{ left: '230px', top: `${mod.top}px` }}
                className={`node-card absolute w-[150px] py-2.5 px-3 rounded-full bg-white border shadow-sm flex items-center gap-2 z-10 cursor-pointer hover:scale-105 transition-transform ${
                  isFoundations ? 'border-orange-500 ring-2 ring-orange-100 shadow-glow' : 'border-slate-200'
                }`}
              >
                <div
                  className={`w-6 h-6 rounded-full text-[9px] font-extrabold flex items-center justify-center shrink-0 ${
                    mod.percent === 100
                      ? 'bg-emerald-50 text-emerald-600 border border-emerald-200'
                      : 'bg-amber-50 text-amber-600 border border-amber-200'
                  }`}
                >
                  {mod.percent}%
                </div>
                <span className="font-bold text-slate-800 text-xs truncate">{mod.title}</span>
              </div>
            );
          })}

          {/* Level 2: Submodules Parent Nodes */}
          {foundationsSubmodules.map((sub) => {
            const Icon = sub.icon;
            const parentTop = sub.parentCenterY - 24;
            return (
              <div
                key={sub.id}
                style={{ left: '440px', top: `${parentTop}px` }}
                className="node-card absolute w-[200px] py-2.5 px-3.5 rounded-2xl bg-emerald-50/95 border-2 border-emerald-500 shadow-glow flex items-center gap-2.5 z-20 cursor-pointer hover:scale-105 transition-transform"
              >
                <div className="w-8 h-8 rounded-full bg-emerald-600 text-white text-[10px] font-extrabold flex items-center justify-center shadow-sm shrink-0">
                  100%
                </div>
                <div className="truncate">
                  <div className="text-xs font-extrabold text-slate-900 flex items-center gap-1">
                    <Icon className="w-3.5 h-3.5 text-emerald-600" /> {sub.title}
                  </div>
                  <div className="text-[10px] text-emerald-700 font-medium">{sub.subtitle}</div>
                </div>
              </div>
            );
          })}

          {/* Level 3: Leaf Cards under Each Submodule */}
          {foundationsSubmodules.map((sub) => {
            return sub.nodes.map((node, idx) => {
              const cardTop = sub.top + idx * 64;
              const isSelected = selectedNodeId === node.id;

              return (
                <div
                  key={node.id}
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelectNode(node.id);
                  }}
                  onDoubleClick={(e) => {
                    e.stopPropagation();
                    router.push(node.route);
                  }}
                  style={{ left: `${leafLeft}px`, top: `${cardTop}px` }}
                  title="单击选中节点，双击直接进入详细 MDX 笔记"
                  className={`node-card absolute w-64 py-2 px-3 rounded-2xl bg-white border flex items-center gap-2.5 z-10 cursor-pointer transition-all ${
                    isSelected
                      ? 'border-2 border-orange-500 shadow-glow bg-amber-50/50 scale-105'
                      : 'border-slate-200/90 shadow-sm hover:border-slate-300'
                  }`}
                >
                  <div className="w-7 h-7 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-600 text-[10px] font-extrabold flex items-center justify-center shrink-0">
                    100%
                  </div>
                  <div className="truncate flex-1">
                    <div className="text-xs font-bold text-slate-800 truncate">{node.title}</div>
                    <div className="text-[10px] text-slate-400 truncate">{node.summary}</div>
                  </div>
                </div>
              );
            });
          })}
        </div>
      </div>

      {/* Floating Canvas Toolbar Controls */}
      <div className="absolute bottom-5 left-1/2 -translate-x-1/2 bg-white/95 backdrop-blur-md px-6 py-3 rounded-full border border-slate-200 shadow-lg flex items-center gap-6 text-xs font-semibold text-slate-700 z-30 whitespace-nowrap">
        <button
          onClick={handleZoomIn}
          className="flex items-center gap-2 hover:text-teal-600 transition-colors whitespace-nowrap"
        >
          <ZoomIn className="w-4 h-4 text-slate-500 shrink-0" />
          <span className="whitespace-nowrap">放大</span>
        </button>
        <div className="w-px h-4 bg-slate-200 shrink-0" />

        <button
          onClick={handleZoomOut}
          className="flex items-center gap-2 hover:text-teal-600 transition-colors whitespace-nowrap"
        >
          <ZoomOut className="w-4 h-4 text-slate-500 shrink-0" />
          <span className="whitespace-nowrap">缩小</span>
        </button>
        <div className="w-px h-4 bg-slate-200 shrink-0" />

        <button
          onClick={handleResetZoom}
          className="flex items-center gap-2 hover:text-teal-600 transition-colors whitespace-nowrap"
        >
          <Maximize2 className="w-4 h-4 text-slate-500 shrink-0" />
          <span className="whitespace-nowrap">居中 ({Math.round(zoomLevel * 100)}%)</span>
        </button>
        <div className="w-px h-4 bg-slate-200 shrink-0" />

        <button
          onClick={() => setShowDependencies(!showDependencies)}
          className={`flex items-center gap-2 transition-colors whitespace-nowrap ${
            showDependencies ? 'text-amber-600 font-bold' : 'hover:text-teal-600'
          }`}
        >
          <Share2 className="w-4 h-4 shrink-0" />
          <span className="whitespace-nowrap">显示依赖关系</span>
        </button>
      </div>
    </div>
  );
};
