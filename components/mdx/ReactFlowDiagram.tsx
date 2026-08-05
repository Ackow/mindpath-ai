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
function parseMermaidToFlow(chartText: string): { initialNodes: Node[]; initialEdges: Edge[] } {
  const lines = chartText.split('\n').map((l) => l.trim()).filter(Boolean);
  const nodesMap = new Map<string, { label: string }>();
  const rawEdges: { source: string; target: string; label?: string }[] = [];

  const cleanLabel = (text: string) => {
    return text
      .replace(/<br\s*\/?>/gi, '\n') // 替换 <br/> 为换行符
      .replace(/^["'\[\({]+|["'\]\)}]+$/g, '')
      .trim();
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

    // 正则匹配箭号连接: A["Label"] -- 标签 --> B["Label"] 或 A --> B
    const arrowMatch = line.match(/(.+?)\s*(?:-->|---|--\s*(.*?)\s*-->|--\s*(.*?)\s*---)\s*(.+)/);
    if (arrowMatch) {
      const leftPart = arrowMatch[1].trim();
      const edgeLabel = (arrowMatch[2] || arrowMatch[3]) ? cleanLabel(arrowMatch[2] || arrowMatch[3]) : undefined;
      const rightPart = arrowMatch[4].trim();

      const parseNodePart = (part: string) => {
        const match = part.match(/^([A-Za-z0-9_-]+)(?:\[|\["|\("|"|\()?(.*?)(?:\]|"\]|"\)|\))?$/);
        if (match && match[2]) {
          const id = match[1];
          const label = cleanLabel(match[2]) || id;
          nodesMap.set(id, { label });
          return id;
        } else {
          const id = part.replace(/[^A-Za-z0-9_-]/g, '');
          if (id) {
            if (!nodesMap.has(id)) nodesMap.set(id, { label: cleanLabel(part) || id });
            return id;
          }
        }
        return null;
      };

      const sourceId = parseNodePart(leftPart);
      const targetId = parseNodePart(rightPart);

      if (sourceId && targetId) {
        rawEdges.push({ source: sourceId, target: targetId, label: edgeLabel });
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

  // 计算平面坐标 (X, Y)
  const initialNodes: Node[] = [];
  const LEVEL_HEIGHT = 140; // 垂直层间距
  const NODE_WIDTH = 260;   // 水平节点卡片宽度

  levelGroups.forEach((nodeIdsInLevel, level) => {
    const totalCount = nodeIdsInLevel.length;
    const startX = -((totalCount - 1) * NODE_WIDTH) / 2;

    nodeIdsInLevel.forEach((id, index) => {
      const info = nodesMap.get(id)!;
      const isError = id.toLowerCase().includes('error') || info.label.includes('异常') || info.label.includes('抛出');
      const isSuccess = info.label.includes('成功') || info.label.includes('加载') || info.label.includes('直接加载');
      const isDecision = info.label.includes('?') || info.label.includes('是否');

      initialNodes.push({
        id,
        data: { label: info.label },
        position: {
          x: startX + index * NODE_WIDTH,
          y: level * LEVEL_HEIGHT,
        },
        targetPosition: Position.Top,   // 上进
        sourcePosition: Position.Bottom, // 下出
        style: {
          background: isError ? '#FEF2F2' : isSuccess ? '#ECFDF5' : isDecision ? '#F8FAFC' : '#FFFFFF',
          color: isError ? '#991B1B' : isSuccess ? '#065F46' : isDecision ? '#0F172A' : '#1E293B',
          border: `2px solid ${isError ? '#FCA5A5' : isSuccess ? '#34D399' : isDecision ? '#94A3B8' : '#CBD5E1'}`,
          borderRadius: isDecision ? '16px' : '12px',
          padding: '10px 16px',
          fontSize: '12px',
          fontWeight: '600',
          textAlign: 'center',
          whiteSpace: 'pre-wrap',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
          minWidth: '180px',
        },
      });
    });
  });

  // 构造边 (平滑折线 smoothstep)
  const initialEdges: Edge[] = rawEdges.map((edge, idx) => ({
    id: `e-${edge.source}-${edge.target}-${idx}`,
    source: edge.source,
    target: edge.target,
    label: edge.label,
    type: 'smoothstep', // 平滑折线体现清晰的前后前后流动
    animated: true,
    labelStyle: { fill: '#0D9488', fontWeight: 700, fontSize: 11 },
    labelBgStyle: { fill: '#F0FDFA', rx: 6, ry: 6 },
    style: { stroke: '#0D9488', strokeWidth: 2 },
    markerEnd: {
      type: MarkerType.ArrowClosed,
      color: '#0D9488',
    },
  }));

  return { initialNodes, initialEdges };
}

export const ReactFlowDiagram: React.FC<ReactFlowDiagramProps> = ({ chart }) => {
  const { initialNodes, initialEdges } = useMemo(() => parseMermaidToFlow(chart), [chart]);

  return (
    <div className="my-8 rounded-2xl overflow-hidden border-2 border-slate-200 shadow-md bg-white font-sans">
      {/* 头部标题栏 - 浅色风 */}
      <div className="px-4 py-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Network className="w-4.5 h-4.5 text-teal-600" />
          <span className="text-sm font-bold text-slate-800">React Flow 拓扑流程图</span>
        </div>
        <span className="text-xs font-semibold bg-teal-50 text-teal-700 border border-teal-200 px-2.5 py-0.5 rounded-full">
          支持拖拽与滚轮缩放 🔍
        </span>
      </div>

      {/* React Flow 画布 */}
      <div className="min-h-[560px] h-[65vh] max-h-[720px] w-full bg-slate-50/50 relative">
        <ReactFlow
          nodes={initialNodes}
          edges={initialEdges}
          fitView
          fitViewOptions={{ padding: 0.25 }}
          attributionPosition="bottom-right"
        >
          <Controls className="bg-white border border-slate-200 shadow-sm rounded-lg text-slate-700" />
          <Background variant={BackgroundVariant.Dots} gap={16} size={1} color="#CBD5E1" />
        </ReactFlow>
      </div>
    </div>
  );
};
