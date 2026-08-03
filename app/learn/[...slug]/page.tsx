import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getAllContentSlugs } from '@/lib/content';
import { getMdxNoteBySlug } from '@/lib/mdx';
import { NoteReaderClient } from '@/components/reader/NoteReaderClient';

type PageProps = {
  params: { slug: string[] };
};

export const dynamicParams = false;

export async function generateStaticParams() {
  const slugs = await getAllContentSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const mdxData = await getMdxNoteBySlug(params.slug);
  if (!mdxData) return {};

  return {
    title: `${mdxData.frontmatter.title || '笔记阅读'} | MindPath AI`,
    description: mdxData.frontmatter.summary,
  };
}

export default async function NoteReaderPage({ params }: PageProps) {
  const mdxData = await getMdxNoteBySlug(params.slug);
  if (!mdxData) notFound();

  return (
    <NoteReaderClient
      slug={params.slug}
      frontmatter={mdxData.frontmatter}
      rawContent={mdxData.rawContent}
    >
      {mdxData.contentNode}
    </NoteReaderClient>
  );
}
