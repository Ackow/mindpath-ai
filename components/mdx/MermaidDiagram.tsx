'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Network, RefreshCw } from 'lucide-react';

interface MermaidDiagramProps {
  chart: string;
}

export const MermaidDiagram: React.FC<MermaidDiagramProps> = ({ chart }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [svgContent, setSvgContent] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const idRef = useRef(`mermaid-${Math.random().toString(36).substring(2, 9)}`);

  useEffect(() => {
    let isMounted = true;

    const renderDiagram = async () => {
      try {
        setLoading(true);
        setError(null);

        // 动态引入 CDN 上的 mermaid 模块，兼容 Edge 与 SSR
        const mermaidModule = await import(/* webpackIgnore: true */ 'https://cdn.jsdelivr.net/npm/mermaid@10/dist/mermaid.esm.min.mjs');
        const mermaid = mermaidModule.default || mermaidModule;

        mermaid.initialize({
          startOnLoad: false,
          theme: 'dark',
          securityLevel: 'loose',
          fontFamily: 'ui-sans-serif, system-ui, sans-serif',
          themeVariables: {
            darkMode: true,
            background: '#0d1117',
            primaryColor: '#14b8a6',
            primaryTextColor: '#f8fafc',
            primaryBorderColor: '#0d9488',
            lineColor: '#2dd4bf',
            secondaryColor: '#6366f1',
            tertiaryColor: '#1e293b',
          },
        });

        const cleanChart = chart.trim();
        const { svg } = await mermaid.render(idRef.current, cleanChart);

        if (isMounted) {
          setSvgContent(svg);
          setLoading(false);
        }
      } catch (err: any) {
        console.error('Mermaid render error:', err);
        if (isMounted) {
          setError(err?.message || 'Mermaid 流程图解析失败');
          setLoading(false);
        }
      }
    };

    renderDiagram();

    return () => {
      isMounted = false;
    };
  }, [chart]);

  return (
    <div className="my-8 rounded-2xl overflow-hidden border border-slate-800 shadow-xl bg-slate-950 font-sans">
      {/* 头部标题栏 */}
      <div className="px-4 py-2.5 bg-slate-900 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Network className="w-4 h-4 text-teal-400" />
          <span className="text-xs font-bold text-slate-200">Mermaid 流程示意图</span>
        </div>
        <span className="text-[10px] font-mono bg-teal-950 text-teal-300 border border-teal-800/80 px-2 py-0.5 rounded-full">
          可视化渲染
        </span>
      </div>

      {/* 图表展示容器 */}
      <div className="p-6 overflow-x-auto flex justify-center items-center min-h-[160px] bg-[#0d1117]">
        {loading && (
          <div className="flex items-center space-x-2 text-xs text-teal-400 font-mono">
            <RefreshCw className="w-4 h-4 animate-spin" />
            <span>正在渲染 Mermaid 流程图...</span>
          </div>
        )}

        {error && (
          <div className="p-4 bg-rose-950/60 border border-rose-800/60 rounded-xl text-rose-300 text-xs font-mono w-full">
            <div className="font-bold mb-1">⚠️ 流程图语法格式提示:</div>
            <pre className="whitespace-pre-wrap text-[11px] text-slate-300 bg-slate-950 p-2 rounded">{chart}</pre>
          </div>
        )}

        {!loading && !error && svgContent && (
          <div
            ref={containerRef}
            className="mermaid-svg-container w-full flex justify-center [&_svg]:max-w-full [&_svg]:h-auto"
            dangerouslySetInnerHTML={{ __html: svgContent }}
          />
        )}
      </div>
    </div>
  );
};
