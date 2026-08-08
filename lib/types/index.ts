export type NodeStatus = 'not_started' | 'in_progress' | 'completed';
export type NodeDifficulty = 'beginner' | 'intermediate' | 'advanced';

export interface CurriculumModule {
  id: string;
  title: string;
  description: string;
  icon: string;
  color: string;
  totalNotes: number;
  submodules?: {
    id: string;
    title: string;
    notesCount: number;
    completedCount: number;
  }[];
}

export interface MindMapNodeData {
  id: string;
  title: string;
  module: string;
  submodule?: string;
  route: string;
  order?: number;
  difficulty: NodeDifficulty;
  estimatedMinutes: number;
  prerequisites: string[];
  next: string[];
  relatedNotes?: string[];
  tags: string[];
  elective?: boolean;
  studyNote?: string;
  status?: NodeStatus;
  summary?: string;
  progressPercent?: number;
  position?: { x: number; y: number };
  hidden?: boolean;
  layoutGroup?: string;
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
  elective?: boolean;
  studyNote?: string;
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
