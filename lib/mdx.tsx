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
import { NeuronLab } from '@/components/animations/NeuronLab';
import { CodeCopyButton } from '@/components/mdx/CodeCopyButton';

function remarkSimpleTable() {
  return (tree: any) => {
    visit(tree, 'paragraph', (node: any, index: any, parent: any) => {
      if (!node.children || node.children.length === 0) return;

      const extractText = (n: any): string => {
        if (!n) return '';
        if (typeof n.value === 'string') return n.value;
        if (Array.isArray(n.children)) return n.children.map(extractText).join('');
        return '';
      };

      const text = extractText(node);
      const lines = text.split('\n').map((l: string) => l.trim()).filter(Boolean);

      if (lines.length >= 2 && lines[0].startsWith('|') && lines[0].endsWith('|')) {
        const rows = lines.filter((l: string) => !l.match(/^\|?\s*:?-+:?\s*(\|?\s*:?-+:?\s*)*\|?$/));

        if (rows.length > 0) {
          const tableNode = {
            type: 'table',
            children: rows.map((rowStr: string) => ({
              type: 'tableRow',
              children: rowStr
                .split('|')
                .slice(1, -1)
                .map((cellStr: string) => ({
                  type: 'tableCell',
                  children: [{ type: 'text', value: cellStr.trim() }],
                })),
            })),
          };

          parent.children.splice(index, 1, tableNode);
        }
      }
    });
  };
}

export const mdxComponents = {
  ConceptCard,
  RunnableCodeBlock,
  NotebookLifecycle,
  NeuronLab,
  a: (props: any) => (
    <a
      className="text-teal-700 font-extrabold underline underline-offset-4 hover:text-teal-900 hover:bg-teal-50 px-1 py-0.5 rounded transition-all"
      target="_blank"
      rel="noreferrer"
      {...props}
    />
  ),
  h1: (props: any) => <h1 className="text-2xl font-extrabold text-slate-900 mt-8 mb-4 scroll-mt-20" {...props} />,

  // H2 Heading with scroll-mt-20 for exact top offset alignment
  h2: (props: any) => {
    const titleText = typeof props.children === 'string' ? props.children.trim() : '';
    return (
      <h2
        id={titleText ? `heading-${titleText}` : undefined}
        className="text-xl font-bold text-slate-900 border-l-4 border-teal-600 pl-4 mt-9 mb-4 scroll-mt-20"
        {...props}
      />
    );
  },

  // H3 Heading with scroll-mt-20 for exact top offset alignment
  h3: (props: any) => {
    const titleText = typeof props.children === 'string' ? props.children.trim() : '';
    return (
      <h3
        id={titleText ? `heading-${titleText}` : undefined}
        className="text-lg font-bold text-slate-800 mt-7 mb-3 scroll-mt-20"
        {...props}
      />
    );
  },

  p: (props: any) => <p className="text-slate-700 leading-relaxed my-4 text-base" {...props} />,

  // Unordered & Ordered Lists with Explicit Bullet & Number Styling
  ul: (props: any) => (
    <ul
      className="pl-6 space-y-2.5 my-5 text-slate-700 text-base"
      style={{ listStyleType: 'disc' }}
      {...props}
    />
  ),
  ol: (props: any) => (
    <ol
      className="pl-6 space-y-2.5 my-5 text-slate-700 text-base font-semibold"
      style={{ listStyleType: 'decimal' }}
      {...props}
    />
  ),
  li: (props: any) => <li className="text-slate-700 leading-relaxed font-normal pl-1" {...props} />,

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

  // 100% Dark Background Code Block Box
  pre: (props: any) => {
    const rawCode = props.children?.props?.children;
    const codeString = typeof rawCode === 'string' ? rawCode.trim() : '';

    const rawClassName = props.children?.props?.className || '';
    const langMatch = rawClassName.match(/language-(\w+)/);
    const lang = langMatch ? langMatch[1] : (rawClassName.replace('hljs', '').trim() || 'code');

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

  blockquote: (props: any) => (
    <blockquote className="border-l-4 border-amber-400 bg-amber-50/60 p-4 rounded-r-xl my-5 text-slate-700 italic" {...props} />
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
    const filePath = path.join(process.cwd(), 'content', ...slugArray) + '.mdx';
    if (fs.existsSync(filePath)) {
      const fileContent = fs.readFileSync(filePath, 'utf8');
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
        console.error('MDX compile error for:', filePath, e);
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
