import React from 'react';
import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { compileMDX } from 'next-mdx-remote/rsc';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import rehypeHighlight from 'rehype-highlight';
import { visit } from 'unist-util-visit';
import { ConceptCard } from '@/components/mdx/ConceptCard';
import { RunnableCodeBlock } from '@/components/mdx/RunnableCodeBlock';
import { NotebookLifecycle } from '@/components/animations/NotebookLifecycle';
import { FlowControlAnimation } from '@/components/animations/FlowControlAnimation';
import { LoopFlowAnimation } from '@/components/animations/LoopFlowAnimation';
import { DataStructureAnimation } from '@/components/animations/DataStructureAnimation';
import { CopyRelationshipAnimation } from '@/components/animations/CopyRelationshipAnimation';
import { NeuronLab } from '@/components/animations/NeuronLab';
import { ImportResolutionAnimation } from '@/components/animations/ImportResolutionAnimation';
import { ExceptionPipelineAnimation } from '@/components/animations/ExceptionPipelineAnimation';
import { ClassInheritanceAnimation } from '@/components/animations/ClassInheritanceAnimation';
import { PdbDebuggerAnimation } from '@/components/animations/PdbDebuggerAnimation';
import { VectorProjectionLab } from '@/components/animations/VectorProjectionLab';
import { SvdRankLab } from '@/components/animations/SvdRankLab';
import { ReactFlowDiagram } from '@/components/mdx/ReactFlowDiagram';
import { MermaidDiagram } from '@/components/mdx/MermaidDiagram';
import { CodeCopyButton } from '@/components/mdx/CodeCopyButton';
import { TaskCheckbox } from '@/components/mdx/TaskCheckbox';
import { ZoomableImage } from '@/components/mdx/ZoomableImage';
import contentStore from '../maps/content-store.json';

function remarkSimpleTable() {
  return (tree: any) => {
    visit(tree, 'paragraph', (node: any, index: number | null, parent: any) => {
      if (!parent || index === null) return;
      const text = node.children
        ?.map((child: any) => (typeof child.value === 'string' ? child.value : ''))
        .join('');
      const lines = text?.split('\n').map((line: string) => line.trim()).filter(Boolean) || [];
      if (lines.length < 2 || !lines[0].startsWith('|') || !lines[0].endsWith('|')) return;

      const rows = lines.filter((line: string) => !/^\|?\s*:?-+:?\s*(\|?\s*:?-+:?\s*)*\|?$/.test(line));
      if (rows.length === 0) return;

      const element = (name: string, children: any[]) => ({
        type: 'mdxJsxFlowElement',
        name,
        attributes: [],
        children,
      });
      const cells = (row: string, cellName: 'th' | 'td') => row
        .split('|')
        .slice(1, -1)
        .map((cell: string) => element(cellName, [{ type: 'text', value: cell.trim() }]));
      const header = element('thead', [element('tr', cells(rows[0], 'th'))]);
      const body = element('tbody', rows.slice(1).map((row: string) => element('tr', cells(row, 'td'))));

      parent.children.splice(index, 1, element('table', [header, body]));
    });
  };
}

export const mdxComponents = {
  ConceptCard,
  RunnableCodeBlock,
  NotebookLifecycle,
  FlowControlAnimation,
  LoopFlowAnimation,
  DataStructureAnimation,
  CopyRelationshipAnimation,
  NeuronLab,
  ImportResolutionAnimation,
  ExceptionPipelineAnimation,
  ClassInheritanceAnimation,
  PdbDebuggerAnimation,
  VectorProjectionLab,
  SvdRankLab,
  ReactFlowDiagram,
  MermaidDiagram,
  img: (props: any) => <ZoomableImage {...props} />,
  // 增加分割线上下充裕边距，彻底切断 margin 塌陷
  hr: (props: any) => (
    <div className="py-12 my-6 clear-both">
      <hr className="border-t-2 border-slate-200 my-0" {...props} />
    </div>
  ),
  a: (props: any) => (
    <a
      className="text-teal-700 font-extrabold underline underline-offset-4 hover:text-teal-900 hover:bg-teal-50 px-1 py-0.5 rounded transition-all"
      target="_blank"
      rel="noreferrer"
      {...props}
    />
  ),
  h1: (props: any) => <h1 className="text-2xl font-extrabold text-slate-900 mt-14 mb-6 scroll-mt-24" {...props} />,

  // H2 Heading with exact line-height border matching and comfortable padding
  h2: (props: any) => {
    const titleText = typeof props.children === 'string' ? props.children.trim() : '';
    return (
      <h2
        id={titleText ? `heading-${titleText}` : undefined}
        className="text-xl font-bold text-slate-900 border-l-4 border-teal-600 pl-3.5 mt-14 mb-6 leading-snug scroll-mt-24 clear-both"
        {...props}
      />
    );
  },

  // H3 Heading with scroll-mt-24 and breathing margin
  h3: (props: any) => {
    const titleText = typeof props.children === 'string' ? props.children.trim() : '';
    return (
      <h3
        id={titleText ? `heading-${titleText}` : undefined}
        className="text-lg font-bold text-slate-800 mt-12 mb-5 pt-3 scroll-mt-24 clear-both"
        {...props}
      />
    );
  },

  p: (props: any) => <p className="text-slate-700 leading-relaxed my-4 text-base" {...props} />,

  // Unordered & Ordered Lists with Explicit Bullet & Number Styling
  ul: (props: any) => (
    <ul
      className="pl-6 space-y-3.5 my-8 text-slate-700 text-base"
      style={{ listStyleType: 'disc' }}
      {...props}
    />
  ),
  ol: (props: any) => (
    <ol
      className="pl-6 space-y-3.5 my-8 text-slate-700 text-base font-semibold"
      style={{ listStyleType: 'decimal' }}
      {...props}
    />
  ),
  li: (props: any) => {
    const children = React.Children.toArray(props.children);
    const firstChild = children[0];
    const taskMatch = typeof firstChild === 'string' ? firstChild.match(/^\[([ xX])\]\s+/) : null;
    if (!taskMatch) return <li className="text-slate-700 leading-relaxed font-normal pl-1" {...props} />;

    const { children: _children, ...liProps } = props;
    const taskText = typeof firstChild === 'string' ? firstChild.slice(taskMatch[0].length) : '';
    return (
      <li className="text-slate-700 leading-relaxed font-normal pl-1 list-none -ml-6" {...liProps}>
        <TaskCheckbox checked={taskMatch[1].toLowerCase() === 'x'} />
        {taskText}
        {children.slice(1)}
      </li>
    );
  },

  // High-Contrast Grid Table with Explicit Cell Borders
  table: (props: any) => (
    <div className="overflow-x-auto my-7 rounded-2xl border-2 border-slate-300 shadow-sm w-full" style={{ backgroundColor: '#ffffff' }}>
      <table className="w-full text-left text-xs sm:text-sm min-w-full" style={{ borderCollapse: 'collapse' }} {...props} />
    </div>
  ),
  thead: (props: any) => <thead className="text-slate-900 font-extrabold" style={{ backgroundColor: '#F1F5F9' }} {...props} />,
  tbody: (props: any) => <tbody style={{ backgroundColor: '#ffffff' }} {...props} />,
  tr: (props: any) => <tr className="hover:bg-slate-50 transition-colors" {...props} />,
  th: (props: any) => (
    <th
      className="px-4 py-3 font-extrabold text-slate-900 text-xs sm:text-sm whitespace-nowrap"
      style={{ borderBottom: '2px solid #CBD5E1', borderRight: '1px solid #CBD5E1', backgroundColor: '#F1F5F9' }}
      {...props}
    />
  ),
  td: (props: any) => (
    <td
      className="px-4 py-3 text-slate-800 text-xs sm:text-sm leading-relaxed font-medium break-words whitespace-normal"
      style={{ borderBottom: '1px solid #E2E8F0', borderRight: '1px solid #E2E8F0' }}
      {...props}
    />
  ),

  code: (props: any) => {
    return <code className="bg-slate-100 text-teal-700 px-1.5 py-0.5 rounded font-mono text-xs border border-slate-200" {...props} />;
  },

  // Code Block Box with React Flow Diagram Auto-Detection
  pre: (props: any) => {
    const rawCode = props.children?.props?.children;
    const codeString = typeof rawCode === 'string' ? rawCode.trim() : (typeof rawCode === 'object' ? String(rawCode) : '');

    const rawClassName = props.children?.props?.className || '';
    const langMatch = rawClassName.match(/language-(\w+)/);
    const lang = langMatch ? langMatch[1] : (rawClassName.replace('hljs', '').trim() || 'code');

    // 智能分流检测:
    // 如果包含 subgraph (结构对比框) 或 classDiagram，交由 MermaidDiagram 原生渲染完美保留分组子容器
    // 普通流程图交由 ReactFlowDiagram 渲染享受拖拽与滚轮缩放
    if (lang === 'mermaid') {
      const isStructureSubgraph = codeString.includes('subgraph') || codeString.includes('classDiagram');
      if (isStructureSubgraph) {
        return <MermaidDiagram chart={codeString} />;
      }
      return <ReactFlowDiagram chart={codeString} />;
    }

    return (
      <div className="my-6 rounded-2xl overflow-hidden border border-slate-800 shadow-md" style={{ backgroundColor: '#0d1117' }}>
        <div className="px-4 py-2.5 border-b border-slate-800 flex items-center justify-between text-xs font-mono text-slate-300" style={{ backgroundColor: '#161b22' }}>
          <span className="font-bold text-teal-400 font-mono">{lang}</span>
          <CodeCopyButton codeText={codeString} />
        </div>
        <div className="p-4 overflow-x-auto" style={{ backgroundColor: '#0d1117' }}>
          <pre className="font-mono text-xs leading-relaxed text-slate-200" style={{ backgroundColor: 'transparent', padding: 0, margin: 0, border: 'none' }} {...props} />
        </div>
      </div>
    );
  },

  // 加大 blockquote 提示框底部的内补与外边距，切断与下级标题的紧挨现象
  blockquote: (props: any) => (
    <blockquote className="border-l-4 border-amber-400 bg-amber-50/60 p-4 rounded-r-xl my-8 mb-12 text-slate-700 italic block clear-both" {...props} />
  ),
};

export interface MdxNoteData {
  frontmatter: {
    id?: string;
    title?: string;
    module?: string;
    submodule?: string;
    order?: number;
    difficulty?: string;
    prerequisites?: string[];
    estimatedMinutes?: number;
    tags?: string[];
    summary?: string;
    symbols?: { symbol: string; mean: string }[];
  };
  contentNode?: React.ReactNode;
  rawContent: string;
}

export async function getMdxNoteBySlug(slugArray: string[]): Promise<MdxNoteData | null> {
  try {
    const slugKey = slugArray.join('/');
    let fileContent: string | null = null;

    // 开发模式 (npm run dev) 下优先读取磁盘真实 MDX 文件，实现 HMR 秒级实时热重载
    if (process.env.NODE_ENV === 'development') {
      try {
        const filePath = path.join(process.cwd(), 'content', ...slugArray) + '.mdx';
        if (typeof fs !== 'undefined' && fs.existsSync && fs.existsSync(filePath)) {
          fileContent = fs.readFileSync(filePath, 'utf8');
        }
      } catch {
        fileContent = null;
      }
    }

    // 生产/Cloudflare Edge 模式下自动从编译打包好的 contentStore 离线存储中读取
    if (!fileContent) {
      fileContent = (contentStore as Record<string, string>)[slugKey] || null;
    }

    if (fileContent) {
      const { data, content } = matter(fileContent);

      let contentNode: React.ReactNode = null;
      try {
        const compiled = await compileMDX({
          source: fileContent,
          options: {
            parseFrontmatter: true,
            mdxOptions: {
              remarkPlugins: [remarkSimpleTable as any, remarkMath as any],
              rehypePlugins: [rehypeHighlight as any, rehypeKatex as any],
            },
          },
          components: mdxComponents,
        });
        contentNode = compiled.content;
      } catch (e) {
        console.error('MDX compile error for:', slugKey, e);
      }

      return {
        frontmatter: data,
        contentNode,
        rawContent: content,
      };
    }
  } catch (err) {
    console.error('Error reading MDX note:', err);
  }
  return null;
}
