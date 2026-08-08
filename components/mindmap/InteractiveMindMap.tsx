'use client';

import React, { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion, Transition } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { Maximize2, Minus, Plus, ZoomIn, ZoomOut } from 'lucide-react';
import { getCurriculumModules } from '@/lib/graph';
import { MindMapNodeData } from '@/lib/types';
import { LearningProgressValue } from '@/components/progress/LearningProgress';

interface InteractiveMindMapProps {
  nodes: MindMapNodeData[];
  selectedNodeId: string;
  onSelectNode: (id: string) => void;
}

interface MapGroup {
  id: string;
  title: string;
  moduleId: string;
  nodes: MindMapNodeData[];
  top: number;
  centerY: number;
  isCollapsed: boolean;
}

const DEFAULT_ZOOM = 0.75;
const DEFAULT_PAN = { x: -20, y: -40 };
const CARD_HEIGHT = 44;
const LEAF_GAP = 62;
const MODULE_GAP = 64;
const LAYOUT_TRANSITION: Transition = {
  duration: 0.42,
  ease: [0.22, 1, 0.36, 1],
};

export const InteractiveMindMap: React.FC<InteractiveMindMapProps> = ({ nodes, selectedNodeId, onSelectNode }) => {
  const router = useRouter();
  const containerRef = useRef<HTMLDivElement>(null);
  const rafId = useRef<number | null>(null);
  const touchPinchDist = useRef<number | null>(null);

  const curriculumModules = getCurriculumModules();
  // 默认展开前两大基础阶段 (Python与基础数据)，后进进阶模块收起
  const defaultCollapsed = curriculumModules
    .filter((m) => m.id !== 'foundations')
    .flatMap((m) => [m.id, ...(m.submodules?.map((s) => `sub-${s.id}`) || [])]);

  const [isHydrated, setIsHydrated] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(DEFAULT_ZOOM);
  const [panOffset, setPanOffset] = useState(DEFAULT_PAN);
  const [collapsedNodes, setCollapsedNodes] = useState<string[]>(defaultCollapsed);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  // 初始化响应式 Viewport
  useEffect(() => {
    try {
      const isMobile = window.innerWidth < 768;
      if (isMobile) {
        setZoomLevel(0.55);
        setPanOffset({ x: -120, y: -10 });
      }

      const storedZoom = Number.parseFloat(localStorage.getItem('mindmap_zoom_level') || '');
      if (Number.isFinite(storedZoom)) setZoomLevel(Math.min(2.5, Math.max(0.3, storedZoom)));

      const storedPan = localStorage.getItem('mindmap_pan_offset');
      if (storedPan) {
        const parsed = JSON.parse(storedPan);
        if (Number.isFinite(parsed?.x) && Number.isFinite(parsed?.y)) setPanOffset({ x: parsed.x, y: parsed.y });
      }

      const storedCollapsed = localStorage.getItem('mindmap_collapsed_nodes');
      if (storedCollapsed) {
        const parsed = JSON.parse(storedCollapsed);
        if (Array.isArray(parsed) && parsed.every((item) => typeof item === 'string')) setCollapsedNodes(parsed);
      }
    } catch {
      // 保持默认状态
    } finally {
      setIsHydrated(true);
    }
  }, []);

  useEffect(() => {
    if (!isHydrated) return;
    localStorage.setItem('mindmap_zoom_level', String(zoomLevel));
  }, [isHydrated, zoomLevel]);

  useEffect(() => {
    if (!isHydrated) return;
    localStorage.setItem('mindmap_pan_offset', JSON.stringify(panOffset));
  }, [isHydrated, panOffset]);

  useEffect(() => {
    if (!isHydrated) return;
    localStorage.setItem('mindmap_collapsed_nodes', JSON.stringify(collapsedNodes));
  }, [collapsedNodes, isHydrated]);

  // 以鼠标指针位置为中心的精确缩放 (Cursor-Centered Zooming)
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const onWheel = (event: WheelEvent) => {
      event.preventDefault();
      const rect = container.getBoundingClientRect();
      // 鼠标相对于容器中心的偏移量
      const mouseX = event.clientX - rect.left - rect.width / 2;
      const mouseY = event.clientY - rect.top - rect.height / 2;

      const zoomFactor = event.deltaY < 0 ? 1.12 : 1 / 1.12;

      setZoomLevel((oldZoom) => {
        const newZoom = Math.min(2.5, Math.max(0.3, oldZoom * zoomFactor));
        const scaleRatio = newZoom / oldZoom;

        // 调整 panOffset，确保鼠标下的点在缩放后相对位置保持静止
        setPanOffset((oldPan) => ({
          x: mouseX - (mouseX - oldPan.x) * scaleRatio,
          y: mouseY - (mouseY - oldPan.y) * scaleRatio,
        }));

        return newZoom;
      });
    };

    container.addEventListener('wheel', onWheel, { passive: false });
    return () => container.removeEventListener('wheel', onWheel);
  }, []);

  useEffect(() => () => {
    if (rafId.current) cancelAnimationFrame(rafId.current);
  }, []);

  const documentNodes = nodes.filter((node) => node.route.startsWith('/learn/') && !node.hidden);

  // Keep the selected chapter visible when it was picked from the map sidebar.
  useEffect(() => {
    const selectedNode = nodes.find((node) => node.id === selectedNodeId);
    if (!selectedNode?.route.startsWith('/learn/')) return;

    const groupId = `sub-${selectedNode.submodule || selectedNode.module}`;
    setCollapsedNodes((current) => {
      const next = current.filter((id) => id !== selectedNode.module && id !== groupId);
      return next.length === current.length ? current : next;
    });
  }, [nodes, selectedNodeId]);

  const modules = curriculumModules.map((module) => ({
    ...module,
    nodes: documentNodes.filter((node) => node.module === module.id),
  }));

  let nextTop = 60;
  const moduleLayouts = modules.map((module) => {
    const isCollapsed = collapsedNodes.includes(module.id);
    const configuredGroups = module.submodules?.map((submodule) => ({
      id: `sub-${submodule.id}`,
      title: submodule.title,
      nodes: module.nodes.filter((node) => node.submodule === submodule.id),
    })) || [];
    const groups = configuredGroups.length > 0
      ? configuredGroups
      : [{ id: `sub-${module.id}`, title: module.title, nodes: module.nodes }];

    const groupLayouts: MapGroup[] = [];
    let groupTop = nextTop;
    for (const group of groups) {
      const groupCollapsed = isCollapsed || collapsedNodes.includes(group.id);
      const height = groupCollapsed ? CARD_HEIGHT : Math.max(CARD_HEIGHT, group.nodes.length * LEAF_GAP);
      groupLayouts.push({
        ...group,
        moduleId: module.id,
        top: groupTop,
        centerY: groupTop + height / 2,
        isCollapsed: groupCollapsed,
      });
      groupTop += height + 36;
    }

    const bottom = Math.max(nextTop + CARD_HEIGHT, groupTop - 36);
    const layout = {
      ...module,
      top: nextTop + Math.max(0, (bottom - nextTop - CARD_HEIGHT) / 2),
      centerY: nextTop + (bottom - nextTop) / 2,
      isCollapsed,
      groups: groupLayouts,
    };
    nextTop = bottom + (isCollapsed ? 44 : MODULE_GAP);
    return layout;
  });

  const canvasHeight = Math.max(720, nextTop + 100);
  const rootCenterY = canvasHeight / 2;

  const toggleCollapse = (id: string) => {
    setCollapsedNodes((current) => current.includes(id) ? current.filter((item) => item !== id) : [...current, id]);
  };

  const handleMouseDown = (event: React.MouseEvent) => {
    if ((event.target as HTMLElement).closest('.node-card, button')) return;
    setIsDragging(true);
    setDragStart({ x: event.clientX - panOffset.x, y: event.clientY - panOffset.y });
  };

  const handleMouseMove = (event: React.MouseEvent) => {
    if (!isDragging) return;
    event.preventDefault();
    const { clientX, clientY } = event;
    if (rafId.current) cancelAnimationFrame(rafId.current);
    rafId.current = requestAnimationFrame(() => setPanOffset({ x: clientX - dragStart.x, y: clientY - dragStart.y }));
  };

  // 手机端触摸平移与双指捏合以触摸中心缩放 (Touch Events Support)
  const handleTouchStart = (event: React.TouchEvent) => {
    if (event.touches.length === 1) {
      if ((event.target as HTMLElement).closest('.node-card, button')) return;
      const touch = event.touches[0];
      setIsDragging(true);
      setDragStart({ x: touch.clientX - panOffset.x, y: touch.clientY - panOffset.y });
    } else if (event.touches.length === 2) {
      const dist = Math.hypot(
        event.touches[0].clientX - event.touches[1].clientX,
        event.touches[0].clientY - event.touches[1].clientY
      );
      touchPinchDist.current = dist;
    }
  };

  const handleTouchMove = (event: React.TouchEvent) => {
    if (event.touches.length === 2 && touchPinchDist.current !== null) {
      // 双指捏合缩放
      const dist = Math.hypot(
        event.touches[0].clientX - event.touches[1].clientX,
        event.touches[0].clientY - event.touches[1].clientY
      );
      const delta = (dist - touchPinchDist.current) * 0.005;
      touchPinchDist.current = dist;
      setZoomLevel((val) => Math.min(2.5, Math.max(0.3, val + delta)));
    } else if (event.touches.length === 1 && isDragging) {
      // 单指平移
      const touch = event.touches[0];
      if (rafId.current) cancelAnimationFrame(rafId.current);
      rafId.current = requestAnimationFrame(() => setPanOffset({ x: touch.clientX - dragStart.x, y: touch.clientY - dragStart.y }));
    }
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
    touchPinchDist.current = null;
  };

  return (
    <div
      ref={containerRef}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={() => setIsDragging(false)}
      onMouseLeave={() => setIsDragging(false)}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      className={`relative min-h-[420px] sm:min-h-[500px] md:h-full w-full overflow-hidden select-none bg-[#F8FAFC] touch-none ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}`}
    >
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,#e2e8f015_1px,transparent_1px),linear-gradient(to_bottom,#e2e8f015_1px,transparent_1px)] bg-[size:24px_24px]" />
      <div
        className="pointer-events-none absolute inset-0 flex items-center justify-center"
        style={{ transform: `translate(${panOffset.x}px, ${panOffset.y}px) scale(${zoomLevel})`, transformOrigin: 'center center' }}
      >
        <motion.div className="pointer-events-auto relative w-[1180px]" initial={false} animate={{ height: canvasHeight }} transition={LAYOUT_TRANSITION}>
          {/* 思维导图主结构树线条 (高对比度深色，极简纯净清晰) */}
          <svg className="pointer-events-none absolute inset-0 h-full w-full z-0" aria-hidden="true">
            {moduleLayouts.map((module) => (
              <motion.path
                key={`root-${module.id}`}
                initial={false}
                animate={{ d: `M 160 ${rootCenterY} C 200 ${rootCenterY}, 200 ${module.centerY}, 240 ${module.centerY}` }}
                transition={LAYOUT_TRANSITION}
                fill="none"
                stroke="#475569"
                strokeWidth="3"
              />
            ))}

            {moduleLayouts.flatMap((module) => (
              module.groups.map((group) => (
                <motion.path
                  key={`module-${group.id}`}
                  initial={false}
                  animate={{
                    d: module.isCollapsed
                      ? `M 440 ${module.centerY} C 475 ${module.centerY}, 475 ${module.centerY}, 510 ${module.centerY}`
                      : `M 440 ${module.centerY} C 475 ${module.centerY}, 475 ${group.centerY}, 510 ${group.centerY}`,
                    opacity: module.isCollapsed ? 0 : 1,
                  }}
                  transition={LAYOUT_TRANSITION}
                  fill="none"
                  stroke="#475569"
                  strokeWidth="2.5"
                />
              ))
            ))}

            {moduleLayouts.flatMap((module) => (
              module.groups.flatMap((group) => (
                group.nodes.map((node, index) => {
                  const targetY = group.top + index * LEAF_GAP + CARD_HEIGHT / 2;
                  const isHidden = module.isCollapsed || group.isCollapsed;
                  return (
                    <motion.path
                      key={`group-${group.id}-${node.id}`}
                      initial={false}
                      animate={{
                        d: isHidden
                          ? `M 740 ${group.centerY} C 770 ${group.centerY}, 770 ${group.centerY}, 800 ${group.centerY}`
                          : `M 740 ${group.centerY} C 770 ${group.centerY}, 770 ${targetY}, 800 ${targetY}`,
                        opacity: isHidden ? 0 : 1,
                      }}
                      transition={LAYOUT_TRANSITION}
                      fill="none"
                      stroke="#64748B"
                      strokeWidth="2"
                    />
                  );
                })
              ))
            ))}
          </svg>

          {/* 节点卡片图层 (z-10) */}
          <motion.div initial={false} animate={{ top: rootCenterY - CARD_HEIGHT / 2 }} transition={LAYOUT_TRANSITION} style={{ left: '20px' }} className="node-card absolute z-10 flex w-[140px] items-center justify-between rounded-full border-2 border-teal-500 bg-white px-3 py-2.5 shadow-md">
            <div className="learning-progress-circle"><LearningProgressValue nodes={documentNodes} /></div>
            <span className="whitespace-nowrap text-xs font-extrabold text-slate-800">人工智能</span>
          </motion.div>

          {moduleLayouts.map((module) => (
            <React.Fragment key={module.id}>
              <motion.div initial={false} animate={{ top: module.top }} transition={LAYOUT_TRANSITION} style={{ left: '240px' }} className="node-card absolute z-10 flex w-[200px] items-center justify-between rounded-full border border-slate-200 bg-white px-3.5 py-2.5 shadow-sm">
                <div className="flex min-w-0 items-center gap-2">
                  <div className="learning-progress-circle"><LearningProgressValue nodes={module.nodes} /></div>
                  <span className="truncate whitespace-nowrap text-xs font-extrabold text-slate-800">{module.title}</span>
                </div>
                <button type="button" onClick={() => toggleCollapse(module.id)} title={module.isCollapsed ? '展开模块' : '收起模块'} className="ml-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-teal-600 text-white hover:bg-teal-700">
                  {module.isCollapsed ? <Plus className="h-3 w-3" /> : <Minus className="h-3 w-3" />}
                </button>
              </motion.div>

              <AnimatePresence initial={false}>
              {!module.isCollapsed && module.groups.map((group) => (
                <React.Fragment key={group.id}>
                  <motion.div initial={{ opacity: 0, x: -270, scale: 0.96, top: module.centerY - CARD_HEIGHT / 2 }} animate={{ opacity: 1, x: 0, scale: 1, top: group.centerY - CARD_HEIGHT / 2 }} exit={{ opacity: 0, x: -270, scale: 0.96, top: module.centerY - CARD_HEIGHT / 2 }} transition={LAYOUT_TRANSITION} style={{ left: '510px' }} className="node-card absolute z-10 flex w-[230px] items-center justify-between rounded-xl border border-emerald-300 bg-emerald-50 px-3.5 py-2.5 shadow-sm">
                    <div className="flex min-w-0 items-center gap-2">
                      <div className="learning-progress-circle"><LearningProgressValue nodes={group.nodes} /></div>
                      <div className="min-w-0">
                        <div className="truncate whitespace-nowrap text-xs font-extrabold text-slate-900">{group.title}</div>
                        <div className="text-[10px] font-medium text-emerald-700">{group.nodes.length} 篇文档</div>
                      </div>
                    </div>
                    <button type="button" onClick={() => toggleCollapse(group.id)} title={group.isCollapsed ? '展开文档' : '收起文档'} className="ml-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-600 text-white hover:bg-emerald-700">
                      {group.isCollapsed ? <Plus className="h-3 w-3" /> : <Minus className="h-3 w-3" />}
                    </button>
                  </motion.div>

                  <AnimatePresence initial={false}>
                  {!group.isCollapsed && group.nodes.map((node, index) => {
                    const top = group.top + index * LEAF_GAP;
                    const selected = selectedNodeId === node.id;
                    return (
                      <motion.button key={node.id} type="button" initial={{ opacity: 0, x: -290, scale: 0.97, top: group.centerY - CARD_HEIGHT / 2 }} animate={{ opacity: 1, x: 0, scale: 1, top }} exit={{ opacity: 0, x: -290, scale: 0.97, top: group.centerY - CARD_HEIGHT / 2, transition: { ...LAYOUT_TRANSITION, delay: 0 } }} transition={{ ...LAYOUT_TRANSITION, delay: Math.min(index * 0.035, 0.21) }} onClick={() => onSelectNode(node.id)} onDoubleClick={() => router.push(node.route)} style={{ left: '800px' }} title="单击查看详情，双击打开文档" className={`node-card absolute z-10 flex w-[280px] items-center gap-2.5 rounded-xl border px-3.5 py-2 text-left transition-colors ${selected ? 'border-2 border-orange-500 bg-amber-50 shadow-md' : 'border-slate-200 bg-white shadow-sm hover:border-teal-400'}`}>
                        <div className="learning-progress-circle"><LearningProgressValue nodes={[node]} /></div>
                        <div className="min-w-0 flex-1">
                          <div className="truncate whitespace-nowrap text-xs font-extrabold text-slate-800">{node.title}</div>
                          <div className="truncate whitespace-nowrap text-[10px] text-slate-400">{node.summary}</div>
                        </div>
                      </motion.button>
                    );
                  })}
                  </AnimatePresence>
                </React.Fragment>
              ))}
              </AnimatePresence>
            </React.Fragment>
          ))}
        </motion.div>
      </div>

      {/* 底部悬浮操控条 (极简高清) */}
      <div className="absolute bottom-4 left-1/2 z-30 flex -translate-x-1/2 items-center gap-3 sm:gap-4 whitespace-nowrap rounded-full border border-slate-200 bg-white/95 px-4 sm:px-5 py-2 text-xs font-semibold text-slate-700 shadow-lg backdrop-blur-md max-w-[92vw] overflow-x-auto">
        <button type="button" onClick={() => setZoomLevel((value) => Math.min(2.5, value + 0.15))} title="放大" className="hover:text-teal-700 shrink-0"><ZoomIn className="h-4 w-4" /></button>
        <button type="button" onClick={() => setZoomLevel((value) => Math.max(0.3, value - 0.15))} title="缩小" className="hover:text-teal-700 shrink-0"><ZoomOut className="h-4 w-4" /></button>
        <button type="button" onClick={() => { setZoomLevel(DEFAULT_ZOOM); setPanOffset(DEFAULT_PAN); setCollapsedNodes(defaultCollapsed); }} title="重置视图" className="flex items-center gap-1 hover:text-teal-700 shrink-0"><Maximize2 className="h-3.5 w-3.5" /><span>重置 ({Math.round(zoomLevel * 100)}%)</span></button>
        <span className="h-4 w-px bg-slate-200 shrink-0" />
        <button type="button" onClick={() => setCollapsedNodes((curr) => curr.length > 0 ? [] : defaultCollapsed)} className="flex items-center gap-1 hover:text-teal-700 shrink-0"><span>{collapsedNodes.length > 0 ? '全量展开' : '折叠分支'}</span></button>
      </div>
    </div>
  );
};
