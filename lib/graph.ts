import globalGraph from '@/maps/global.json';
import curriculumData from '@/content/_meta/curriculum.json';
import { MindMapNodeData, CurriculumModule } from '@/lib/types';

export function getGlobalGraphNodes(): MindMapNodeData[] {
  return globalGraph.nodes as MindMapNodeData[];
}

export function getGlobalGraphEdges() {
  return globalGraph.edges;
}

export function getCurriculumModules(): CurriculumModule[] {
  return curriculumData.modules as CurriculumModule[];
}

export function getNodeById(id: string): MindMapNodeData | undefined {
  return (globalGraph.nodes as MindMapNodeData[]).find((n) => n.id === id);
}

export function getNodesByModule(moduleId: string): MindMapNodeData[] {
  return (globalGraph.nodes as MindMapNodeData[]).filter((n) => n.module === moduleId);
}

export function getAllNoteSlugs(): { slug: string[] }[] {
  const nodes = getGlobalGraphNodes();
  return nodes
    .filter((n) => n.route && n.route.startsWith('/learn/'))
    .map((n) => {
      const pathPart = n.route.replace(/^\/learn\//, '');
      return {
        slug: pathPart.split('/'),
      };
    });
}

export interface ModuleTreeNode {
  id: string;
  title: string;
  submodules: {
    id: string;
    title: string;
    children: MindMapNodeData[];
  }[];
}

/**
 * 动态从 curriculum.json 与 global.json 中读取并生成层级模块树
 */
export function getHierarchicalModuleTree(): ModuleTreeNode[] {
  const modules = getCurriculumModules();
  const allNodes = getGlobalGraphNodes();

  return modules.map((mod: any) => {
    if (mod.submodules && mod.submodules.length > 0) {
      return {
        id: mod.id,
        title: mod.title,
        submodules: mod.submodules.map((sub: any) => ({
          id: `sub-${sub.id}`,
          title: sub.title,
          children: allNodes.filter((n) => n.module === mod.id && n.submodule === sub.id),
        })),
      };
    } else {
      const children = allNodes.filter((n) => n.module === mod.id);
      return {
        id: mod.id,
        title: mod.title,
        submodules: children.length > 0 ? [
          {
            id: `sub-${mod.id}`,
            title: mod.title,
            children: children,
          }
        ] : [],
      };
    }
  });
}
