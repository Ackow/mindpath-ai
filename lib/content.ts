import { promises as fs } from 'fs';
import path from 'path';
import matter from 'gray-matter';
import globalGraph from '../maps/global.json';

const contentDirectory = path.join(process.cwd(), 'content');

export type ContentFrontmatter = {
  id: string;
  title: string;
  module: string;
  order: number;
  difficulty: string;
  prerequisites: string[];
  estimatedMinutes: number;
  tags: string[];
  summary: string;
};

export type ContentIndexEntry = ContentFrontmatter & {
  slug: string[];
  route: string;
};

export async function getAllContentSlugs(): Promise<string[][]> {
  return globalGraph.nodes
    .filter((node) => node.route.startsWith('/learn/'))
    .map((node) => node.route.replace('/learn/', '').split('/'));
}

export async function getContentSource(slug: string[]): Promise<string | null> {
  if (slug.length === 0 || slug.some((part) => !/^[a-z0-9-]+$/i.test(part))) {
    return null;
  }

  const sourcePath = path.join(contentDirectory, ...slug) + '.mdx';
  const normalizedPath = path.normalize(sourcePath);

  if (!normalizedPath.startsWith(contentDirectory)) return null;

  try {
    if (typeof fs !== 'undefined' && fs.readFile) {
      return await fs.readFile(normalizedPath, 'utf8');
    }
  } catch {
    return null;
  }
  return null;
}

export async function getContentIndex(): Promise<ContentIndexEntry[]> {
  return globalGraph.nodes
    .filter((node) => node.route.startsWith('/learn/'))
    .map((node) => ({
      id: node.id,
      title: node.title,
      module: node.module,
      order: 1,
      difficulty: node.difficulty || 'beginner',
      prerequisites: node.prerequisites || [],
      estimatedMinutes: node.estimatedMinutes || 20,
      tags: node.tags || [],
      summary: node.summary || '',
      slug: node.route.replace('/learn/', '').split('/'),
      route: node.route,
    }))
    .sort((left, right) => left.route.localeCompare(right.route));
}
