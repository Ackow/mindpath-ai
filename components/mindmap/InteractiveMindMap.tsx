'use client';

import React, { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion, Transition } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { BookOpen, Maximize2, Minus, Plus, Share2, ZoomIn, ZoomOut } from 'lucide-react';
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
  const [isHydrated, setIsHydrated] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(DEFAULT_ZOOM);
  const [panOffset, setPanOffset] = useState(DEFAULT_PAN);
  const [collapsedNodes, setCollapsedNodes] = useState<string[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [showDependencies, setShowDependencies] = useState(true);

  // Preferences are restored only after hydration so SVG geometry matches the server markup.
  useEffect(() => {
    try {
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
      // Keep deterministic defaults when browser storage is unavailable or malformed.
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

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const onWheel = (event: WheelEvent) => {
      event.preventDefault();
      const change = event.deltaY < 0 ? 0.08 : -0.08;
      setZoomLevel((value) => Math.min(2.5, Math.max(0.3, value + change)));
    };
    container.addEventListener('wheel', onWheel, { passive: false });
    return () => container.removeEventListener('wheel', onWheel);
  }, []);

  useEffect(() => () => {
    if (rafId.current) cancelAnimationFrame(rafId.current);
  }, []);

  const curriculumModules = getCurriculumModules();
  const documentNodes = nodes.filter((node) => node.route.startsWith('/learn/') && !node.hidden);
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
      // Dynamically shrink height when group is collapsed so sibling nodes reflow up
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
  const visibleGroups = moduleLayouts.flatMap((module) => module.groups.filter((group) => !module.isCollapsed));
  const leafPositions = new Map<string, { x: number; y: number }>();
  for (const group of visibleGroups) {
    if (group.isCollapsed) continue;
    group.nodes.forEach((node, index) => leafPositions.set(node.id, { x: 800, y: group.top + index * LEAF_GAP + CARD_HEIGHT / 2 }));
  }

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

  return (
    <div
      ref={containerRef}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={() => setIsDragging(false)}
      onMouseLeave={() => setIsDragging(false)}
      className={`relative h-full w-full overflow-hidden select-none bg-[#F8FAFC] ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}`}
    >
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,#e2e8f015_1px,transparent_1px),linear-gradient(to_bottom,#e2e8f015_1px,transparent_1px)] bg-[size:24px_24px]" />
      <div
        className="pointer-events-none absolute inset-0 flex items-center justify-center"
        style={{ transform: `translate(${panOffset.x}px, ${panOffset.y}px) scale(${zoomLevel})`, transformOrigin: 'center center' }}
      >
        <motion.div className="pointer-events-auto relative w-[1180px]" initial={false} animate={{ height: canvasHeight }} transition={LAYOUT_TRANSITION}>
          <svg className="pointer-events-none absolute inset-0 h-full w-full" aria-hidden="true">
            {moduleLayouts.map((module) => (
              <motion.path
                key={`root-${module.id}`}
                initial={false}
                animate={{ d: `M 160 ${rootCenterY} C 200 ${rootCenterY}, 200 ${module.centerY}, 240 ${module.centerY}` }}
                transition={LAYOUT_TRANSITION}
                fill="none"
                stroke={module.nodes.length > 0 ? '#0F766E' : '#CBD5E1'}
                strokeWidth={module.nodes.length > 0 ? '2.5' : '2'}
              />
            ))}
            {moduleLayouts.flatMap((module) => module.isCollapsed ? [] : module.groups.map((group) => (
              <motion.path
                key={`module-${group.id}`}
                initial={false}
                animate={{ d: `M 440 ${module.centerY} C 475 ${module.centerY}, 475 ${group.centerY}, 510 ${group.centerY}` }}
                transition={LAYOUT_TRANSITION}
                fill="none"
                stroke="#14B8A6"
                strokeWidth="2"
              />
            )))}
            {visibleGroups.flatMap((group) => group.isCollapsed ? [] : group.nodes.map((node, index) => {
              const endY = group.top + index * LEAF_GAP + CARD_HEIGHT / 2;
              return <motion.path key={`group-${node.id}`} initial={false} animate={{ d: `M 730 ${group.centerY} C 765 ${group.centerY}, 765 ${endY}, 800 ${endY}` }} transition={LAYOUT_TRANSITION} fill="none" stroke={selectedNodeId === node.id ? '#F97316' : '#94A3B8'} strokeWidth={selectedNodeId === node.id ? '3' : '1.6'} />;
            }))}
            {showDependencies && Array.from(leafPositions.entries()).flatMap(([targetId, target]) => {
              const node = documentNodes.find((item) => item.id === targetId);
              return (node?.prerequisites || []).flatMap((sourceId) => {
                const source = leafPositions.get(sourceId);
                if (!source) return [];
                return <motion.path key={`dependency-${sourceId}-${targetId}`} initial={false} animate={{ d: `M 1080 ${source.y} C 1120 ${source.y}, 1120 ${target.y}, 1080 ${target.y}` }} transition={LAYOUT_TRANSITION} fill="none" stroke="#F59E0B" strokeWidth="1.5" strokeDasharray="5 5" opacity="0.8" />;
              });
            })}
          </svg>

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
                  <motion.div initial={{ opacity: 0, x: -270, scale: 0.96, top: module.centerY - CARD_HEIGHT / 2 }} animate={{ opacity: 1, x: 0, scale: 1, top: group.centerY - CARD_HEIGHT / 2 }} exit={{ opacity: 0, x: -270, scale: 0.96, top: module.centerY - CARD_HEIGHT / 2 }} transition={LAYOUT_TRANSITION} style={{ left: '510px' }} className="node-card absolute z-10 flex w-[220px] items-center justify-between rounded-xl border border-emerald-300 bg-emerald-50 px-3.5 py-2.5 shadow-sm">
                    <div className="flex min-w-0 items-center gap-2">
                      <BookOpen className="h-3.5 w-3.5 shrink-0 text-emerald-700" />
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

      <div className="absolute bottom-5 left-1/2 z-30 flex -translate-x-1/2 items-center gap-4 whitespace-nowrap rounded-full border border-slate-200 bg-white/95 px-5 py-2.5 text-xs font-semibold text-slate-700 shadow-lg backdrop-blur-md">
        <button type="button" onClick={() => setZoomLevel((value) => Math.min(2.5, value + 0.15))} title="放大" className="hover:text-teal-700"><ZoomIn className="h-4 w-4" /></button>
        <button type="button" onClick={() => setZoomLevel((value) => Math.max(0.3, value - 0.15))} title="缩小" className="hover:text-teal-700"><ZoomOut className="h-4 w-4" /></button>
        <button type="button" onClick={() => { setZoomLevel(DEFAULT_ZOOM); setPanOffset(DEFAULT_PAN); setCollapsedNodes([]); }} title="重置视图与全展开" className="flex items-center gap-1.5 hover:text-teal-700"><Maximize2 className="h-4 w-4" /><span>重置 ({Math.round(zoomLevel * 100)}%)</span></button>
        <span className="h-4 w-px bg-slate-200" />
        <button type="button" onClick={() => setCollapsedNodes((curr) => curr.length > 0 ? [] : moduleLayouts.flatMap(m => [m.id, ...m.groups.map(g => g.id)]))} className="flex items-center gap-1.5 hover:text-teal-700"><span>{collapsedNodes.length > 0 ? '全量展开' : '折叠分支'}</span></button>
        <span className="h-4 w-px bg-slate-200" />
        <button type="button" onClick={() => setShowDependencies((value) => !value)} className={showDependencies ? 'flex items-center gap-1.5 text-amber-700' : 'flex items-center gap-1.5 text-slate-500'}><Share2 className="h-4 w-4" /><span>{showDependencies ? '隐藏依赖关系' : '显示依赖关系'}</span></button>
      </div>
    </div>
  );
};
