import { promises as fs } from 'fs';
import path from 'path';

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

async function findMdxFiles(directory: string): Promise<string[]> {
  const entries = await fs.readdir(directory, { withFileTypes: true });
  const nestedFiles = await Promise.all(
    entries.map(async (entry) => {
      const entryPath = path.join(directory, entry.name);

      if (entry.isDirectory()) {
        if (entry.name.startsWith('_')) return [];
        return findMdxFiles(entryPath);
      }

      return entry.isFile() && entry.name.endsWith('.mdx') ? [entryPath] : [];
    }),
  );

  return nestedFiles.flat();
}

export async function getAllContentSlugs(): Promise<string[][]> {
  const files = await findMdxFiles(contentDirectory);

  return files.map((file) =>
    path
      .relative(contentDirectory, file)
      .replace(/\.mdx$/, '')
      .split(path.sep),
  );
}

export async function getContentSource(slug: string[]): Promise<string | null> {
  if (slug.length === 0 || slug.some((part) => !/^[a-z0-9-]+$/i.test(part))) {
    return null;
  }

  const sourcePath = path.join(contentDirectory, ...slug) + '.mdx';
  const normalizedPath = path.normalize(sourcePath);

  if (!normalizedPath.startsWith(contentDirectory)) return null;

  try {
    return await fs.readFile(normalizedPath, 'utf8');
  } catch {
    return null;
  }
}
