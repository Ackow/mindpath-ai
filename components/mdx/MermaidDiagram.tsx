'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Network, RefreshCw, ZoomIn } from 'lucide-react';

interface MermaidDiagramProps {
  chart: string;
}

// 单例全局缓存 Mermaid 模块加载，防并发与多次网络开销
let mermaidPromise: Promise<any> | null = null;

function loadMermaid() {
  if (!mermaidPromise) {
    mermaidPromise = new Promise(async (resolve, reject) => {
      try {
        const timeout = setTimeout(() => reject(new Error('Mermaid CDN 加载超时')), 5000);
        // @ts-ignore
        const module: any = await import(/* webpackIgnore: true */ 'https://cdn.jsdelivr.net/npm/mermaid@10/dist/mermaid.esm.min.mjs');
        clearTimeout(timeout);
        const mermaid = module.default || module;
        mermaid.initialize({
          startOnLoad: false,
          theme: 'dark',
          securityLevel: 'loose',
          fontFamily: 'ui-sans-serif, system-ui, sans-serif',
          fontSize: 14,
          themeVariables: {
            darkMode: true,
            background: '#0d1117',
            primaryColor: '#0f766e',
            primaryTextColor: '#f8fafc',
            primaryBorderColor: '#14b8a6',
            lineColor: '#2dd4bf',
            secondaryColor: '#334155',
            tertiaryColor: '#1e293b',
            fontSize: '14px',
          },
        });
        resolve(mermaid);
      } catch (err) {
        reject(err);
      }
    });
  }
  return mermaidPromise;
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

        const mermaid = await loadMermaid();
        const cleanChart = chart.trim();

        const { svg } = await mermaid.render(idRef.current, cleanChart);

        if (isMounted) {
          setSvgContent(svg);
          setLoading(false);
        }
      } catch (err: any) {
        console.warn('Mermaid render warning:', err);
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
    <div className="my-7 rounded-2xl overflow-hidden border border-slate-800 shadow-xl bg-slate-950 font-sans">
      {/* 头部标题栏 */}
      <div className="px-4 py-2.5 bg-slate-900 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Network className="w-4 h-4 text-teal-400" />
          <span className="text-xs font-bold text-slate-200">Mermaid 流程示意图</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-[10px] font-mono bg-teal-950 text-teal-300 border border-teal-800/80 px-2 py-0.5 rounded-full flex items-center gap-1">
            <ZoomIn className="w-3 h-3" /> 矢量响应视图
          </span>
        </div>
      </div>

      {/* 图表展示容器 */}
      <div className="p-4 sm:p-6 overflow-x-auto flex justify-center items-center min-h-[120px] bg-[#0d1117] scrollbar-thin">
        {loading && (
          <div className="flex items-center space-x-2 text-xs text-teal-400 font-mono py-6">
            <RefreshCw className="w-4 h-4 animate-spin" />
            <span>正在渲染 Mermaid 流程图...</span>
          </div>
        )}

        {error && (
          <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl text-slate-300 text-xs font-mono w-full">
            <div className="font-bold mb-2 text-teal-400">流程结构视图:</div>
            <pre className="whitespace-pre-wrap text-[12px] leading-relaxed text-slate-300 bg-slate-950 p-3 rounded-lg border border-slate-800/80">{chart}</pre>
          </div>
        )}

        {!loading && !error && svgContent && (
          <div
            ref={containerRef}
            className="mermaid-svg-container w-full flex justify-center py-2 [&_svg]:max-w-full [&_svg]:h-auto [&_svg]:mx-auto [&_svg_text]:!text-xs sm:[&_svg_text]:!text-sm"
            dangerouslySetInnerHTML={{ __html: svgContent }}
          />
        )}
      </div>
    </div>
  );
};
