import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';

const rootDir = process.cwd();
const contentDir = path.join(rootDir, 'content');
const curriculumPath = path.join(contentDir, '_meta', 'curriculum.json');
const overridesPath = path.join(rootDir, 'maps', 'overrides.json');
const outputPath = path.join(rootDir, 'maps', 'global.json');

function findMdxFiles(directory) {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const entryPath = path.join(directory, entry.name);
    if (entry.isDirectory()) return entry.name.startsWith('_') ? [] : findMdxFiles(entryPath);
    return entry.isFile() && entry.name.endsWith('.mdx') ? [entryPath] : [];
  });
}

function readOverrides() {
  if (!fs.existsSync(overridesPath)) return { nodes: {} };
  return JSON.parse(fs.readFileSync(overridesPath, 'utf8'));
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function routeFromFile(filePath) {
  return `/learn/${path.relative(contentDir, filePath).replace(/\\/g, '/').replace(/\.mdx$/, '')}`;
}

function getDefaultPosition(node, curriculum) {
  const moduleIndex = curriculum.modules.findIndex((module) => module.id === node.module);
  const module = curriculum.modules[moduleIndex];
  const submoduleIndex = module?.submodules?.findIndex((submodule) => submodule.id === node.submodule) ?? 0;
  const orderOffset = Math.max(0, (node.order || 1) - 1);
  return {
    x: 460 + Math.max(0, submoduleIndex) * 260 + (orderOffset % 4) * 200,
    y: 40 + Math.max(0, moduleIndex) * 220 + Math.floor(orderOffset / 4) * 55,
  };
}

function main() {
  const curriculum = JSON.parse(fs.readFileSync(curriculumPath, 'utf8'));
  const overrides = readOverrides();
  const files = findMdxFiles(contentDir);
  const documents = files.map((filePath) => {
    const { data } = matter(fs.readFileSync(filePath, 'utf8'));
    const required = ['id', 'title', 'module', 'order', 'difficulty', 'estimatedMinutes', 'tags', 'summary'];
    for (const key of required) assert(data[key] !== undefined, `${path.relative(rootDir, filePath)} 缺少 frontmatter 字段: ${key}`);
    return { ...data, route: routeFromFile(filePath), filePath };
  });

  const byId = new Map();
  for (const document of documents) {
    assert(!byId.has(document.id), `重复文档 ID: ${document.id}`);
    assert(curriculum.modules.some((module) => module.id === document.module), `${document.id} 引用了不存在的 module: ${document.module}`);
    byId.set(document.id, document);
  }

  for (const document of documents) {
    for (const relationKey of ['prerequisites', 'relatedNotes', 'nextNotes']) {
      for (const targetId of document[relationKey] || []) {
        assert(targetId !== document.id, `${document.id} 不能在 ${relationKey} 中引用自身`);
        assert(byId.has(targetId), `${document.id} 的 ${relationKey} 引用了不存在的文档: ${targetId}`);
      }
    }
  }

  const documentNodes = documents.map((document) => {
    const nodeOverride = overrides.nodes?.[document.id] || {};
    return {
      id: document.id,
      title: document.title,
      module: document.module,
      ...(document.submodule ? { submodule: document.submodule } : {}),
      route: document.route,
      difficulty: document.difficulty,
      estimatedMinutes: document.estimatedMinutes,
      prerequisites: document.prerequisites || [],
      // `next` is the curated reading sequence from frontmatter. Prerequisite
      // edges are generated separately and must not change the next-step list.
      next: document.nextNotes || [],
      relatedNotes: document.relatedNotes || [],
      tags: document.tags || [],
      summary: document.summary,
      position: nodeOverride.position || document.map?.position || getDefaultPosition(document, curriculum),
      ...(document.map?.hidden || nodeOverride.hidden ? { hidden: true } : {}),
      ...(document.map?.layoutGroup ? { layoutGroup: document.map.layoutGroup } : {}),
    };
  });

  const moduleNodes = curriculum.modules.map((module, index) => ({
    id: module.id,
    title: module.title,
    module: module.id,
    route: `/map/${module.id}`,
    difficulty: 'beginner',
    estimatedMinutes: documentNodes.filter((node) => node.module === module.id).reduce((total, node) => total + node.estimatedMinutes, 0),
    prerequisites: ['root'],
    next: [],
    tags: [module.title],
    summary: module.description,
    position: { x: 260, y: 80 + index * 90 },
  }));
  const nodes = [{
    id: 'root',
    title: '人工智能',
    module: 'root',
    route: '/map',
    difficulty: 'intermediate',
    estimatedMinutes: 0,
    prerequisites: [],
    next: moduleNodes.map((node) => node.id),
    tags: ['AI'],
    position: { x: 50, y: 300 },
  }, ...moduleNodes, ...documentNodes];

  const edges = [];
  const edgeKeys = new Set();
  const addEdge = (source, target, kind = 'depends') => {
    const key = `${source}->${target}`;
    if (edgeKeys.has(key)) return;
    edgeKeys.add(key);
    edges.push({ id: `e-${kind}-${source}-${target}`, source, target });
  };
  for (const moduleNode of moduleNodes) addEdge('root', moduleNode.id);
  for (const node of documentNodes) {
    const sources = node.prerequisites.length > 0 ? node.prerequisites : [node.module];
    for (const source of sources) {
      addEdge(source, node.id);
    }
    for (const nextId of documents.find((document) => document.id === node.id)?.nextNotes || []) {
      if (!node.next.includes(nextId)) node.next.push(nextId);
      addEdge(node.id, nextId, 'next');
    }
  }

  const graph = { nodes, edges };
  fs.writeFileSync(outputPath, `${JSON.stringify(graph, null, 2)}\n`, 'utf8');
  console.log(`Generated ${path.relative(rootDir, outputPath)} with ${nodes.length} nodes and ${edges.length} edges.`);
}

try {
  main();
} catch (error) {
  console.error(`Graph generation failed: ${error.message}`);
  process.exit(1);
}
