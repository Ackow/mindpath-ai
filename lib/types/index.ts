export type NodeStatus = 'not_started' | 'in_progress' | 'completed';
export type NodeDifficulty = 'beginner' | 'intermediate' | 'advanced';

export interface CurriculumModule {
  id: string;
  title: string;
  description: string;
  icon: string;
  color: string;
  totalNotes: number;
  completedNotes: number;
  progressPercent: number;
}

export interface MindMapNodeData {
  id: string;
  title: string;
  module: string;
  route: string;
  difficulty: NodeDifficulty;
  estimatedMinutes: number;
  prerequisites: string[];
  next: string[];
  tags: string[];
  status?: NodeStatus;
  summary?: string;
  progressPercent?: number;
  position?: { x: number; y: number };
}

export interface MDXFrontmatter {
  id: string;
  title: string;
  module: string;
  order: number;
  difficulty: NodeDifficulty;
  prerequisites: string[];
  estimatedMinutes: number;
  tags: string[];
  summary?: string;
}

export interface LearningProgress {
  completedNodeIds: string[];
  inProgressNodeIds: string[];
  currentNodeId: string;
  lastStudiedAt: string;
  totalMinutes: number;
  streakDays: number;
}
