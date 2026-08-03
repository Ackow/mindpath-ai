import fs from 'fs';
import path from 'path';

const rootDir = process.cwd();
const globalGraphPath = path.join(rootDir, 'maps', 'global.json');
const curriculumPath = path.join(rootDir, 'content', '_meta', 'curriculum.json');

console.log('🔍 开始内容与 Schema 校验...');

if (!fs.existsSync(globalGraphPath)) {
  console.error('❌ 错误: 找不到 maps/global.json!');
  process.exit(1);
}

if (!fs.existsSync(curriculumPath)) {
  console.error('❌ 错误: 找不到 content/_meta/curriculum.json!');
  process.exit(1);
}

const graphData = JSON.parse(fs.readFileSync(globalGraphPath, 'utf8'));
const curriculumData = JSON.parse(fs.readFileSync(curriculumPath, 'utf8'));

const nodeIds = new Set(graphData.nodes.map(n => n.id));
let hasError = false;

// 1. 检查节点 ID 唯一性与前置链接完整性
for (const node of graphData.nodes) {
  for (const pre of node.prerequisites || []) {
    if (!nodeIds.has(pre)) {
      console.error(`❌ 错误: 节点 "${node.id}" 引用的前置节点 "${pre}" 不存在!`);
      hasError = true;
    }
  }
}

// 2. 校验模块存在性
const moduleIds = new Set(curriculumData.modules.map(m => m.id));
moduleIds.add('root');

for (const node of graphData.nodes) {
  if (!moduleIds.has(node.module)) {
    console.error(`❌ 错误: 节点 "${node.id}" 的模块 "${node.module}" 未在 curriculum.json 中定义!`);
    hasError = true;
  }
}

if (hasError) {
  console.error('❌ 校验未通过，请修复数据后再构建。');
  process.exit(1);
} else {
  console.log(`✅ 校验通过! 共计 ${graphData.nodes.length} 个节点, ${graphData.edges.length} 条依赖连线。`);
}
