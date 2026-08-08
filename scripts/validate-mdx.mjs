import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import katex from 'katex';
import { compile } from '@mdx-js/mdx';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import { visit } from 'unist-util-visit';

const rootDir = process.cwd();
const contentDir = path.join(rootDir, 'content');

function findMdxFiles(directory) {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const entryPath = path.join(directory, entry.name);
    if (entry.isDirectory()) return entry.name.startsWith('_') ? [] : findMdxFiles(entryPath);
    return entry.isFile() && entry.name.endsWith('.mdx') ? [entryPath] : [];
  });
}

function validateMath() {
  return (tree, file) => {
    visit(tree, ['inlineMath', 'math'], (node) => {
      try {
        katex.renderToString(node.value, {
          displayMode: node.type === 'math',
          throwOnError: true,
          strict: 'error',
        });
      } catch (error) {
        const message = file.message('Invalid formula: ' + error.message, node);
        message.fatal = true;
      }
    });
  };
}

function findUnclosedDisplayDelimiters(source, filePath) {
  const errors = [];
  const lines = source.split(/\r?\n/);
  let inFence = false;
  let openLine = 0;

  lines.forEach((line, index) => {
    if (/^\s*(\x60\x60\x60|~~~)/.test(line)) {
      inFence = !inFence;
      return;
    }
    if (inFence) return;

    const delimiters = line.match(/(?<!\\)\$\$/g) || [];
    if (delimiters.length % 2 === 1) openLine = openLine ? 0 : index + 1;
  });

  if (openLine) errors.push(path.relative(rootDir, filePath) + ':' + openLine + ': Unclosed $$ display-math delimiter');
  return errors;
}

let hasErrors = false;
const files = findMdxFiles(contentDir);

for (const filePath of files) {
  const source = fs.readFileSync(filePath, 'utf8');
  const relativePath = path.relative(rootDir, filePath);
  let content;

  try {
    content = matter(source).content;
  } catch (error) {
    console.error(relativePath + ': Invalid frontmatter: ' + error.message);
    hasErrors = true;
    continue;
  }

  for (const error of findUnclosedDisplayDelimiters(content, filePath)) {
    console.error(error);
    hasErrors = true;
  }

  try {
    const compiled = await compile({ path: relativePath, value: content }, {
      remarkPlugins: [remarkMath, validateMath],
      rehypePlugins: [[rehypeKatex, { throwOnError: false }]],
    });

    for (const message of compiled.messages) {
      if (!message.fatal) continue;
      const location = message.location?.start;
      const position = location ? ':' + location.line + ':' + location.column : '';
      console.error(relativePath + position + ': ' + message.reason);
      hasErrors = true;
    }
  } catch (error) {
    const location = error?.line ? ':' + error.line + ':' + (error.column || 1) : '';
    console.error(relativePath + location + ': MDX compilation failed: ' + error.message);
    hasErrors = true;
  }
}

if (hasErrors) process.exit(1);
console.log('MDX validation passed: ' + files.length + ' documents.');
