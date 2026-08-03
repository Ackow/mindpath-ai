'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { MindMapNodeData } from '@/lib/types';
import { getCurriculumModules } from '@/lib/graph';
import { ZoomIn, ZoomOut, Maximize2, Share2, Code, Calculator, Binary, Plus, Minus } from 'lucide-react';

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

  // 1. Persistent Zoom Level in LocalStorage
  const [zoomLevel, setZoomLevel] = useState<number>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('mindmap_zoom_level');
        if (saved) return parseFloat(saved);
      } catch (e) {}
    }
    return 0.75;
  });

  // 2. Persistent Pan Offset (X, Y Position) in LocalStorage
  const [panOffset, setPanOffset] = useState<{ x: number; y: number }>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('mindmap_pan_offset');
        if (saved) return JSON.parse(saved);
      } catch (e) {}
    }
    return { x: -20, y: -40 };
  });

  // 3. Persistent Collapsed Nodes in LocalStorage (Default collapsed)
  const [collapsedNodes, setCollapsedNodes] = useState<string[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('mindmap_collapsed_nodes');
        if (saved) return JSON.parse(saved);
      } catch (e) {}
    }
    return ['foundations', 'sub-python', 'sub-math', 'sub-prob'];
  });

  // Save to LocalStorage on change
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('mindmap_collapsed_nodes', JSON.stringify(collapsedNodes));
    }
  }, [collapsedNodes]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('mindmap_zoom_level', zoomLevel.toString());
    }
  }, [zoomLevel]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('mindmap_pan_offset', JSON.stringify(panOffset));
    }
  }, [panOffset]);

  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [showDependencies, setShowDependencies] = useState<boolean>(true);

  const containerRef = useRef<HTMLDivElement>(null);
  const rafId = useRef<number | null>(null);

  const toggleCollapse = (id: string) => {
    setCollapsedNodes((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

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

  // Smooth 60fps Mouse drag pan handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    if (target.closest('.node-card')) return;

    setIsDragging(true);
    setDragStart({ x: e.clientX - panOffset.x, y: e.clientY - panOffset.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    e.preventDefault();

    const clientX = e.clientX;
    const clientY = e.clientY;

    if (rafId.current) cancelAnimationFrame(rafId.current);
    rafId.current = requestAnimationFrame(() => {
      setPanOffset({
        x: clientX - dragStart.x,
        y: clientY - dragStart.y,
      });
    });
  };

  const handleMouseUp = () => setIsDragging(false);

  // Dynamically load curriculum modules from curriculum.json
  const curriculumModules = getCurriculumModules();

  // Filter Submodule Nodes dynamically from global graph
  const pythonNodes = nodes.filter((n) => n.submodule === 'python');
  const mathNodes = nodes.filter((n) => n.submodule === 'math');
  const probNodes = nodes.filter((n) => n.submodule === 'probability');

  const isFoundationsCollapsed = collapsedNodes.includes('foundations');

  // --- DYNAMIC MULTI-LEVEL LAYOUT CALCULATION ENGINE ---
  // Calculate dynamic bounding heights for each level 2 submodule based on whether it is collapsed or expanded
  const isPythonCollapsed = collapsedNodes.includes('sub-python');
  const isMathCollapsed = collapsedNodes.includes('sub-math');
  const isProbCollapsed = collapsedNodes.includes('sub-prob');

  const cardGap = 62;

  // Python submodule dynamic Y & Height
  const pythonTopY = 40;
  const pythonHeight = isPythonCollapsed ? 44 : pythonNodes.length * cardGap;
  const pythonCenterY = isPythonCollapsed ? pythonTopY + 22 : pythonTopY + pythonHeight / 2;

  // Math submodule dynamic Y & Height (Positioned dynamically relative to Python!)
  const mathTopY = pythonTopY + pythonHeight + (isPythonCollapsed ? 40 : 60);
  const mathHeight = isMathCollapsed ? 44 : mathNodes.length * cardGap;
  const mathCenterY = isMathCollapsed ? mathTopY + 22 : mathTopY + mathHeight / 2;

  // Probability submodule dynamic Y & Height (Positioned dynamically relative to Math!)
  const probTopY = mathTopY + mathHeight + (isMathCollapsed ? 40 : 60);
  const probHeight = isProbCollapsed ? 44 : probNodes.length * cardGap;
  const probCenterY = isProbCollapsed ? probTopY + 22 : probTopY + probHeight / 2;

  // Total dynamic Foundations subtree height & center Y
  const foundationsTreeHeight = probTopY + probHeight - pythonTopY;
  const foundationsCenterY = isFoundationsCollapsed ? 400 : pythonTopY + foundationsTreeHeight / 2;

  const canvasCenterY = isFoundationsCollapsed ? 400 : Math.max(550, foundationsCenterY);
  const rootRightX = 160;

  // Level 1 Stage Modules Dynamic Positions
  const level1Modules = curriculumModules.map((mod, idx) => {
    let topY = 0;
    if (isFoundationsCollapsed) {
      topY = canvasCenterY - 180 + idx * 75;
    } else {
      if (idx === 0) {
        topY = foundationsCenterY - 22;
      } else {
        const bottomOfFoundations = probTopY + probHeight + 80;
        topY = bottomOfFoundations + (idx - 1) * 85;
      }
    }

    return {
      id: mod.id,
      title: mod.title,
      percent: mod.id === 'foundations' ? 100 : mod.progressPercent || 40,
      top: topY,
      centerY: topY + 22,
    };
  });

  // Level 2 Submodules Parent Nodes (Dynamically positioned at mathCenterY, probCenterY, etc.)
  const foundationsMod = curriculumModules.find((m) => m.id === 'foundations');
  const foundationsSubmodules = [
    {
      id: 'sub-python',
      title: foundationsMod?.submodules?.[0]?.title || 'Python 与科学计算',
      subtitle: `${pythonNodes.length} 篇 Python 核心笔记`,
      icon: Code,
      topY: pythonTopY,
      parentCenterY: pythonCenterY,
      nodes: pythonNodes,
      leftIn: { x: 480, y: pythonCenterY },
      rightOut: { x: 720, y: pythonCenterY },
      cardGap: cardGap,
      isCollapsed: isPythonCollapsed,
    },
    {
      id: 'sub-math',
      title: foundationsMod?.submodules?.[1]?.title || '线性代数与微积分',
      subtitle: `${mathNodes.length} 篇数学核心笔记`,
      icon: Calculator,
      topY: mathTopY,
      parentCenterY: mathCenterY,
      nodes: mathNodes,
      leftIn: { x: 480, y: mathCenterY },
      rightOut: { x: 720, y: mathCenterY },
      cardGap: cardGap,
      isCollapsed: isMathCollapsed,
    },
    {
      id: 'sub-prob',
      title: foundationsMod?.submodules?.[2]?.title || '概率与统计',
      subtitle: `${probNodes.length} 篇概率与 MLE 笔记`,
      icon: Binary,
      topY: probTopY,
      parentCenterY: probCenterY,
      nodes: probNodes,
      leftIn: { x: 480, y: probCenterY },
      rightOut: { x: 720, y: probCenterY },
      cardGap: cardGap,
      isCollapsed: isProbCollapsed,
    },
  ];

  const leafLeft = 780;

  return (
    <div
      ref={containerRef}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      className={`relative w-full h-full bg-[#F8FAFC] overflow-hidden select-none ${
        isDragging ? 'cursor-grabbing' : 'cursor-grab'
      }`}
    >
      {/* Background grid lines */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#e2e8f015_1px,transparent_1px),linear-gradient(to_bottom,#e2e8f015_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />

      {/* Main Canvas */}
      <div
        className={`absolute inset-0 flex items-center justify-center pointer-events-none ${
          isDragging ? '' : 'transition-all duration-300 ease-out'
        }`}
        style={{
          transform: `translate(${panOffset.x}px, ${panOffset.y}px) scale(${zoomLevel})`,
          transformOrigin: 'center center',
        }}
      >
        <div className="relative w-[1500px] h-[1600px] pointer-events-auto">
          {/* SVG Connecting Bezier Lines */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none z-0">
            {/* 1. Root (X=160, Y=canvasCenterY) -> Level 1 Stage Modules */}
            {level1Modules.map((mod) => {
              const startX = rootRightX; // 160
              const startY = foundationsCenterY;
              const endX = 240;
              const endY = mod.centerY;
              const ctrlX1 = startX + (endX - startX) * 0.5;
              const ctrlX2 = startX + (endX - startX) * 0.5;

              const isFoundations = mod.id === 'foundations';

              return (
                <path
                  key={mod.id}
                  d={`M ${startX} ${startY} C ${ctrlX1} ${startY}, ${ctrlX2} ${endY}, ${endX} ${endY}`}
                  fill="none"
                  stroke={isFoundations ? '#F97316' : '#94A3B8'}
                  strokeWidth={isFoundations ? '2.5' : '2'}
                  className="transition-all duration-300"
                />
              );
            })}

            {/* 2. Foundations Stage Module -> 3 Submodules (Only if NOT collapsed) */}
            {!isFoundationsCollapsed &&
              foundationsSubmodules.map((sub) => {
                const startX = 440; // Right edge of foundations
                const startY = foundationsCenterY;
                const endX = sub.leftIn.x; // 480
                const endY = sub.leftIn.y;
                const ctrlX1 = startX + (endX - startX) * 0.5;
                const ctrlX2 = startX + (endX - startX) * 0.5;

                return (
                  <path
                    key={sub.id}
                    d={`M ${startX} ${startY} C ${ctrlX1} ${startY}, ${ctrlX2} ${endY}, ${endX} ${endY}`}
                    fill="none"
                    stroke="#F59E0B"
                    strokeWidth="2.5"
                    className="transition-all duration-300"
                  />
                );
              })}

            {/* 3. Level 2 Submodules -> Level 3 Leaf Cards (Only if NOT collapsed) */}
            {!isFoundationsCollapsed &&
              foundationsSubmodules.map((sub) => {
                if (sub.isCollapsed) return null;

                const startX = sub.rightOut.x; // 720
                const startY = sub.rightOut.y;

                return sub.nodes.map((node, idx) => {
                  const cardTop = sub.topY + idx * sub.cardGap;
                  const endX = leafLeft; // 780
                  const endY = cardTop + 22;
                  const ctrlX1 = startX + (endX - startX) * 0.45;
                  const ctrlX2 = startX + (endX - startX) * 0.55;
                  const isSelected = selectedNodeId === node.id;

                  return (
                    <path
                      key={node.id}
                      d={`M ${startX} ${startY} C ${ctrlX1} ${startY}, ${ctrlX2} ${endY}, ${endX} ${endY}`}
                      fill="none"
                      stroke={isSelected ? '#F97316' : '#94A3B8'}
                      strokeWidth={isSelected ? '3' : '1.8'}
                      className="transition-all duration-300"
                    />
                  );
                });
              })}
          </svg>

          {/* Foreground SVG for Dashed Dependency Curve */}
          {showDependencies && !isFoundationsCollapsed && !isPythonCollapsed && (
            <svg className="absolute inset-0 w-full h-full pointer-events-none z-20 overflow-visible">
              <path
                d="M 1060 62 C 1115 62, 1115 186, 1060 186"
                fill="none"
                stroke="#F59E0B"
                strokeWidth="2.5"
                strokeDasharray="5 5"
                className="transition-all duration-300"
              />
            </svg>
          )}

          {/* Level 0: Root Node */}
          <div
            style={{ left: '20px', top: `${foundationsCenterY - 22}px` }}
            className="node-card absolute w-[140px] py-2.5 px-3 bg-white rounded-full border-2 border-teal-500 shadow-md flex items-center justify-between z-10 cursor-pointer hover:scale-105 transition-all duration-300"
          >
            <div className="w-7 h-7 rounded-full bg-teal-50 text-teal-600 text-[10px] font-extrabold flex items-center justify-center border border-teal-200 shrink-0">
              78%
            </div>
            <span className="font-extrabold text-slate-800 text-xs whitespace-nowrap">人工智能</span>
          </div>

          {/* Level 1: Dynamic Stage Modules */}
          {level1Modules.map((mod) => {
            const isFoundations = mod.id === 'foundations';
            return (
              <div
                key={mod.id}
                style={{ left: '240px', top: `${mod.top}px` }}
                className={`node-card absolute w-[200px] py-2.5 px-3.5 rounded-full bg-white border shadow-sm flex items-center justify-between z-10 cursor-pointer hover:scale-105 transition-all duration-300 ${
                  isFoundations ? 'border-orange-500 ring-2 ring-orange-100 shadow-glow' : 'border-slate-200'
                }`}
              >
                <div className="flex items-center gap-2 min-w-0 flex-1">
                  <div
                    className={`w-6 h-6 rounded-full text-[9px] font-extrabold flex items-center justify-center shrink-0 ${
                      mod.percent === 100
                        ? 'bg-emerald-50 text-emerald-600 border border-emerald-200'
                        : 'bg-amber-50 text-amber-600 border border-amber-200'
                    }`}
                  >
                    {mod.percent}%
                  </div>
                  <span className="font-extrabold text-slate-800 text-xs whitespace-nowrap">{mod.title}</span>
                </div>

                {/* Interactive Collapse/Expand Toggle Button on Foundations Card */}
                {isFoundations && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleCollapse('foundations');
                    }}
                    title={isFoundationsCollapsed ? '点击展开预备知识子模块分支' : '点击收起预备知识子模块分支'}
                    className="w-5 h-5 rounded-full bg-orange-500 hover:bg-orange-600 text-white flex items-center justify-center text-xs font-bold shrink-0 shadow-2xs transition-transform hover:scale-110 ml-1"
                  >
                    {isFoundationsCollapsed ? <Plus className="w-3 h-3 text-white" /> : <Minus className="w-3 h-3 text-white" />}
                  </button>
                )}
              </div>
            );
          })}

          {/* Level 2: Submodules Parent Nodes (Dynamically positioned at pythonCenterY, mathCenterY, probCenterY) */}
          {!isFoundationsCollapsed &&
            foundationsSubmodules.map((sub) => {
              const Icon = sub.icon;
              const parentTop = sub.parentCenterY - 22;

              return (
                <div
                  key={sub.id}
                  style={{ left: '480px', top: `${parentTop}px` }}
                  className="node-card absolute w-[240px] py-2.5 px-3.5 rounded-2xl bg-emerald-50/95 border-2 border-emerald-500 shadow-glow flex items-center justify-between gap-2 z-10 cursor-pointer hover:scale-105 transition-all duration-300"
                >
                  <div className="flex items-center gap-2.5 min-w-0 flex-1">
                    <div className="w-8 h-8 rounded-full bg-emerald-600 text-white text-[10px] font-extrabold flex items-center justify-center shadow-sm shrink-0">
                      100%
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-xs font-extrabold text-slate-900 flex items-center gap-1 whitespace-nowrap">
                        <Icon className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span className="whitespace-nowrap">{sub.title}</span>
                      </div>
                      <div className="text-[10px] text-emerald-700 font-medium whitespace-nowrap">{sub.subtitle}</div>
                    </div>
                  </div>

                  {/* Interactive Collapse/Expand Toggle Button on Submodule Card */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleCollapse(sub.id);
                    }}
                    title={sub.isCollapsed ? '点击展开章节笔记卡片' : '点击收起章节笔记卡片'}
                    className="w-5 h-5 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white flex items-center justify-center text-xs font-bold shrink-0 shadow-2xs transition-transform hover:scale-110 ml-1"
                  >
                    {sub.isCollapsed ? <Plus className="w-3 h-3 text-white" /> : <Minus className="w-3 h-3 text-white" />}
                  </button>
                </div>
              );
            })}

          {/* Level 3: Leaf Cards under Each Submodule */}
          {!isFoundationsCollapsed &&
            foundationsSubmodules.map((sub) => {
              if (sub.isCollapsed) return null;

              return sub.nodes.map((node, idx) => {
                const cardTop = sub.topY + idx * sub.cardGap;
                const isSelected = selectedNodeId === node.id;
                const percent = node.progressPercent || (node.status === 'completed' ? 100 : 60);
                const is100Percent = percent === 100;

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
                    className={`node-card absolute w-[280px] py-2 px-3.5 rounded-2xl bg-white border flex items-center gap-2.5 z-10 cursor-pointer transition-all duration-300 ${
                      isSelected
                        ? 'border-2 border-orange-500 shadow-glow bg-amber-50/50 scale-105'
                        : 'border-slate-200/90 shadow-sm hover:border-slate-300'
                    }`}
                  >
                    <div
                      className={`w-6.5 h-6.5 rounded-full text-[9px] font-extrabold flex items-center justify-center shrink-0 ${
                        is100Percent
                          ? 'bg-emerald-50 border border-emerald-300 text-emerald-600'
                          : 'bg-amber-50 border border-amber-300 text-amber-600'
                      }`}
                    >
                      {percent}%
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-xs font-extrabold text-slate-800 whitespace-nowrap overflow-hidden text-ellipsis">{node.title}</div>
                      <div className="text-[10px] text-slate-400 whitespace-nowrap overflow-hidden text-ellipsis">{node.summary}</div>
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
          title="点击切换是否在导图画布中显示跨节点/跨模块的橙色虚线依赖流动关系"
          className={`flex items-center gap-2 transition-colors whitespace-nowrap ${
            showDependencies ? 'text-amber-600 font-bold' : 'text-slate-500 hover:text-teal-600'
          }`}
        >
          <Share2 className="w-4 h-4 shrink-0" />
          <span className="whitespace-nowrap">
            {showDependencies ? '隐藏依赖虚线' : '显示依赖关系'}
          </span>
        </button>
      </div>
    </div>
  );
};
