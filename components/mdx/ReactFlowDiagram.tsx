'use client';

import React, { useMemo } from 'react';
import {
  ReactFlow,
  Controls,
  Background,
  BackgroundVariant,
  Node,
  Edge,
  MarkerType,
  Position,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { Network } from 'lucide-react';

interface ReactFlowDiagramProps {
  chart: string;
}

// 提取并解析 Mermaid / Diagram 为 DAG 拓扑层级的 React Flow 节点与边
function parseMermaidToFlow(chartText: string): { initialNodes: Node[]; initialEdges: Edge[]; maxLevels: number; isHorizontal: boolean } {
  const lines = chartText.split('\n').map((l) => l.trim()).filter(Boolean);
  const nodesMap = new Map<string, { label: string }>();
  const rawEdges: { source: string; target: string; label?: string }[] = [];

  // 1. 自动识别图表方向: LR (横向左右) vs TD/TB (纵向上下)
  const isHorizontal = /flowchart\s+LR|graph\s+LR/i.test(chartText);

  const cleanLabelText = (text: string) => {
    return text.replace(/<br\s*\/?>/gi, '\n').trim();
  };

  const parseNodePart = (part: string): { id: string; label: string } | null => {
    const trimmed = part.trim();
    if (!trimmed) return null;

    // 1. 匹配标准带引号节点: ID["文本"] 或 ID['文本'] 或 ID("文本")
    const quotedMatch = trimmed.match(/^([A-Za-z0-9_.-]+)\s*(?:\[|\()\s*["'](.*?)["']\s*(?:\]|\))$/s);
    if (quotedMatch) {
      const id = quotedMatch[1];
      const label = cleanLabelText(quotedMatch[2]);
      return { id, label };
    }

    // 2. 匹配 Mermaid 各种包围形状: ID[文本], ID(文本), ID([文本]), ID[(文本)], ID{{文本}}
    const shapeMatch = trimmed.match(/^([A-Za-z0-9_.-]+)\s*(?:\[\[|\[\(|\[\(\(|\[|\["|\(\(|\(\[|\(|\{\{|\{)(.*?)(?:\)\)|\]\)|\]\)\)|\]|"\]|\)\)|\]\)|"|\)|\}\}|\})$/s);
    if (shapeMatch) {
      const id = shapeMatch[1];
      let rawLabel = shapeMatch[2].trim();
      if ((rawLabel.startsWith('"') && rawLabel.endsWith('"')) || (rawLabel.startsWith("'") && rawLabel.endsWith("'"))) {
        rawLabel = rawLabel.slice(1, -1);
      }
      return { id, label: cleanLabelText(rawLabel) };
    }

    // 3. 纯 ID 无描述
    const bareMatch = trimmed.match(/^([A-Za-z0-9_.-]+)$/);
    if (bareMatch) {
      return { id: bareMatch[1], label: bareMatch[1] };
    }

    return null;
  };

  for (const line of lines) {
    if (
      line.startsWith('flowchart') ||
      line.startsWith('graph') ||
      line.startsWith('classDiagram') ||
      line.startsWith('style')
    ) {
      continue;
    }

    // 0. 支持多节点链式箭头: A --> B --> C --> D
    const chainSegments = line.split(/\s*-->\s*/);
    if (chainSegments.length > 2) {
      for (let i = 0; i < chainSegments.length - 1; i++) {
        const sourcePart = chainSegments[i].trim();
        const targetPart = chainSegments[i + 1].trim();

        const sourceObj = parseNodePart(sourcePart);
        const targetObj = parseNodePart(targetPart);

        if (sourceObj) {
          if (!nodesMap.has(sourceObj.id)) nodesMap.set(sourceObj.id, { label: sourceObj.label });
        }
        if (targetObj) {
          if (!nodesMap.has(targetObj.id)) nodesMap.set(targetObj.id, { label: targetObj.label });
        }

        if (sourceObj && targetObj) {
          rawEdges.push({ source: sourceObj.id, target: targetObj.id });
        }
      }
      continue;
    }

    let leftPart = '';
    let rightPart = '';
    let edgeLabel: string | undefined = undefined;

    // 1. 优先匹配带竖线标签的箭头: A -->|"label"| B 或 A -->|label| B
    const pipeLabelMatch = line.match(/(.+?)\s*-->\s*\|"?([^"|]+)"?\|\s*(.+)/);
    if (pipeLabelMatch) {
      leftPart = pipeLabelMatch[1].trim();
      edgeLabel = cleanLabelText(pipeLabelMatch[2]);
      rightPart = pipeLabelMatch[3].trim();
    } else {
      // 2. 匹配标准箭头: A --> B, A -- label --> B, A --- B
      const stdMatch = line.match(/(.+?)\s*(?:-->|---|--\s*(.*?)\s*-->|--\s*(.*?)\s*---)\s*(.+)/);
      if (stdMatch) {
        leftPart = stdMatch[1].trim();
        edgeLabel = (stdMatch[2] || stdMatch[3]) ? cleanLabelText(stdMatch[2] || stdMatch[3]) : undefined;
        rightPart = stdMatch[4].trim();
      }
    }

    if (leftPart && rightPart) {
      const sourceObj = parseNodePart(leftPart);
      const targetObj = parseNodePart(rightPart);

      if (sourceObj) {
        if (!nodesMap.has(sourceObj.id)) nodesMap.set(sourceObj.id, { label: sourceObj.label });
      }
      if (targetObj) {
        if (!nodesMap.has(targetObj.id)) nodesMap.set(targetObj.id, { label: targetObj.label });
      }

      if (sourceObj && targetObj) {
        rawEdges.push({ source: sourceObj.id, target: targetObj.id, label: edgeLabel });
      }
    }
  }

  // 计算拓扑层级 (Topological Levels)
  const inDegree = new Map<string, number>();
  const adjList = new Map<string, string[]>();

  nodesMap.forEach((_, id) => {
    inDegree.set(id, 0);
    adjList.set(id, []);
  });

  rawEdges.forEach(({ source, target }) => {
    if (inDegree.has(target)) {
      inDegree.set(target, (inDegree.get(target) || 0) + 1);
    }
    if (adjList.has(source)) {
      adjList.get(source)!.push(target);
    }
  });

  // 计算节点 Depth / Level
  const levels = new Map<string, number>();
  const queue: { id: string; level: number }[] = [];

  inDegree.forEach((degree, id) => {
    if (degree === 0) {
      queue.push({ id, level: 0 });
      levels.set(id, 0);
    }
  });

  // BFS 层级定高
  while (queue.length > 0) {
    const { id, level } = queue.shift()!;
    const neighbors = adjList.get(id) || [];
    for (const nextId of neighbors) {
      const currentLevel = levels.get(nextId) ?? -1;
      if (level + 1 > currentLevel) {
        levels.set(nextId, level + 1);
        queue.push({ id: nextId, level: level + 1 });
      }
    }
  }

  // 补全兜底 level 0
  nodesMap.forEach((_, id) => {
    if (!levels.has(id)) levels.set(id, 0);
  });

  // 按 level 分组节点
  const levelGroups = new Map<number, string[]>();
  levels.forEach((level, id) => {
    if (!levelGroups.has(level)) levelGroups.set(level, []);
    levelGroups.get(level)!.push(id);
  });

  const initialNodes: Node[] = [];

  // 统一固定节点宽度，确保 Source/Target Handle 中心完全水平/垂直对齐，彻底消除锯齿弯折连线
  const NODE_WIDTH_PX = 220;

  if (isHorizontal) {
    // 横向 (LR): X 轴按 level 递增，Y 轴按同层节点索引递增
    const LEVEL_WIDTH = 280;
    const ROW_SPACING = 110;

    levelGroups.forEach((nodeIdsInLevel, level) => {
      const totalCount = nodeIdsInLevel.length;
      const startY = -((totalCount - 1) * ROW_SPACING) / 2;

      nodeIdsInLevel.forEach((id, index) => {
        const info = nodesMap.get(id)!;
        const isError = id.toLowerCase().includes('error') || info.label.includes('异常') || info.label.includes('抛出');
        const isSuccess = info.label.includes('成功') || info.label.includes('加载') || info.label.includes('直接加载');
        const isDecision = info.label.includes('?') || info.label.includes('是否');

        initialNodes.push({
          id,
          data: { label: info.label },
          position: {
            x: level * LEVEL_WIDTH,
            y: startY + index * ROW_SPACING,
          },
          targetPosition: Position.Left,  // 左进
          sourcePosition: Position.Right, // 右出
          style: {
            background: isError ? '#FEF2F2' : isSuccess ? '#ECFDF5' : isDecision ? '#F8FAFC' : '#FFFFFF',
            color: isError ? '#991B1B' : isSuccess ? '#065F46' : isDecision ? '#0F172A' : '#1E293B',
            border: `2px solid ${isError ? '#FCA5A5' : isSuccess ? '#34D399' : isDecision ? '#94A3B8' : '#CBD5E1'}`,
            borderRadius: isDecision ? '14px' : '10px',
            padding: '10px 14px',
            fontSize: '12px',
            fontWeight: '600',
            textAlign: 'center',
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-word',
            boxShadow: '0 2px 4px -1px rgba(0, 0, 0, 0.05)',
            width: `${NODE_WIDTH_PX}px`,
          },
        });
      });
    });
  } else {
    // 纵向 (TD/TB): Y 轴按 level 递增，X 轴按同层节点索引递增
    const LEVEL_HEIGHT = 140;
    const COLUMN_SPACING = 260;

    levelGroups.forEach((nodeIdsInLevel, level) => {
      const totalCount = nodeIdsInLevel.length;
      const startX = -((totalCount - 1) * COLUMN_SPACING) / 2;

      nodeIdsInLevel.forEach((id, index) => {
        const info = nodesMap.get(id)!;
        const isError = id.toLowerCase().includes('error') || info.label.includes('异常') || info.label.includes('抛出');
        const isSuccess = info.label.includes('成功') || info.label.includes('加载') || info.label.includes('直接加载');
        const isDecision = info.label.includes('?') || info.label.includes('是否');

        initialNodes.push({
          id,
          data: { label: info.label },
          position: {
            x: startX + index * COLUMN_SPACING - NODE_WIDTH_PX / 2,
            y: level * LEVEL_HEIGHT,
          },
          targetPosition: Position.Top,   // 上进
          sourcePosition: Position.Bottom, // 下出
          style: {
            background: isError ? '#FEF2F2' : isSuccess ? '#ECFDF5' : isDecision ? '#F8FAFC' : '#FFFFFF',
            color: isError ? '#991B1B' : isSuccess ? '#065F46' : isDecision ? '#0F172A' : '#1E293B',
            border: `2px solid ${isError ? '#FCA5A5' : isSuccess ? '#34D399' : isDecision ? '#94A3B8' : '#CBD5E1'}`,
            borderRadius: isDecision ? '14px' : '10px',
            padding: '10px 14px',
            fontSize: '12px',
            fontWeight: '600',
            textAlign: 'center',
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-word',
            boxShadow: '0 2px 4px -1px rgba(0, 0, 0, 0.05)',
            width: `${NODE_WIDTH_PX}px`,
          },
        });
      });
    });
  }

  // 构造边 (使用 smoothstep + 优雅圆角，保证 100% 物理直线箭头)
  const initialEdges: Edge[] = rawEdges.map((edge, idx) => {
    let formattedLabel = edge.label;
    if (formattedLabel && formattedLabel.length > 10 && formattedLabel.includes(' / ')) {
      const parts = formattedLabel.split(' / ');
      const mid = Math.ceil(parts.length / 2);
      formattedLabel = parts.slice(0, mid).join(' / ') + '\n' + parts.slice(mid).join(' / ');
    }

    return {
      id: `e-${edge.source}-${edge.target}-${idx}`,
      source: edge.source,
      target: edge.target,
      label: formattedLabel,
      type: 'smoothstep',
      pathOptions: { borderRadius: 12 },
      animated: true,
      labelStyle: { fill: '#0D9488', fontWeight: 700, fontSize: 10, textAlign: 'center', whiteSpace: 'pre-wrap' },
      labelBgStyle: { fill: '#F0FDFA', rx: 6, ry: 6, stroke: '#99F6E4', strokeWidth: 1 },
      labelBgPadding: [6, 4] as [number, number],
      style: { stroke: '#0D9488', strokeWidth: 2 },
      markerEnd: {
        type: MarkerType.ArrowClosed,
        color: '#0D9488',
      },
    };
  });

  return { initialNodes, initialEdges, maxLevels: levelGroups.size, isHorizontal };
}

export const ReactFlowDiagram: React.FC<ReactFlowDiagramProps> = ({ chart }) => {
  const { initialNodes, initialEdges, maxLevels, isHorizontal } = useMemo(() => parseMermaidToFlow(chart), [chart]);

  // 根据层级数量与布局方向自适应动态容器高度
  const containerHeightClass = useMemo(() => {
    if (isHorizontal) return 'h-[280px] min-h-[240px]';
    if (maxLevels <= 1) return 'h-[240px]';
    if (maxLevels <= 2) return 'h-[320px]';
    return 'min-h-[420px] h-[50vh] max-h-[600px]';
  }, [maxLevels, isHorizontal]);

  return (
    <div className="my-7 rounded-2xl overflow-hidden border border-slate-200 shadow-card bg-white font-sans">
      {/* 头部标题栏 - 浅色风 */}
      <div className="px-4 py-2.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Network className="w-4 h-4 text-teal-600" />
          <span className="text-xs font-bold text-slate-800">React Flow 拓扑流程图</span>
        </div>
        <span className="text-[11px] font-semibold bg-teal-50 text-teal-700 border border-teal-200 px-2.5 py-0.5 rounded-full">
          自适应框体与缩放 🔍
        </span>
      </div>

      {/* React Flow 画布 */}
      <div className={`w-full bg-slate-50/50 relative ${containerHeightClass}`}>
        <ReactFlow
          nodes={initialNodes}
          edges={initialEdges}
          fitView
          fitViewOptions={{ padding: 0.2, includeHiddenNodes: true }}
          attributionPosition="bottom-right"
          proOptions={{ hideAttribution: true }}
        >
          <Background variant={BackgroundVariant.Dots} gap={16} size={1} color="#CBD5E1" />
        </ReactFlow>
      </div>
    </div>
  );
};
