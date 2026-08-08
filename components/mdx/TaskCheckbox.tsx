'use client';

import React, { useEffect, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';
import { syncProgress } from '@/lib/client/sync';
import { requireLogin } from '@/lib/client/require-auth';

interface TaskCheckboxProps extends React.InputHTMLAttributes<HTMLInputElement> {
  checked?: boolean;
}

export interface DocumentTaskProgress {
  tasks: Record<string, boolean>;
  completed: boolean;
  taskTotal?: number;
}

export type StudyActivity = Record<string, number>;

const progressStore = new Map<string, DocumentTaskProgress>();

export function readDocumentProgress(pathname: string): DocumentTaskProgress {
  const fallback = { tasks: {}, completed: false };
  return progressStore.get(pathname) || fallback;
}

function parseProgress(payload: unknown): DocumentTaskProgress {
  const parsed = typeof payload === 'string' ? JSON.parse(payload) : payload;
  const value = parsed && typeof parsed === 'object' ? parsed as Partial<DocumentTaskProgress> : {};
  return {
    tasks: typeof value.tasks === 'object' && value.tasks ? value.tasks as Record<string, boolean> : {},
    completed: value.completed === true,
    taskTotal: Number.isFinite(value.taskTotal) ? value.taskTotal : undefined,
  };
}

export function hydrateDocumentProgress(rows: Array<{ document_id: string; payload: unknown }>) {
  for (const row of rows) {
    try { progressStore.set(row.document_id, parseProgress(row.payload)); } catch { /* ignore malformed cloud rows */ }
  }
}

export async function loadCloudProgress(documentId?: string) {
  const response = await fetch('/api/progress', { credentials: 'include' });
  if (!response.ok) return null;
  const data = await response.json() as { progress?: Array<{ document_id: string; payload: unknown }> };
  hydrateDocumentProgress(data.progress || []);
  return documentId ? readDocumentProgress(documentId) : null;
}

export function writeDocumentProgress(pathname: string, progress: DocumentTaskProgress) {
  if (!requireLogin()) return;
  progressStore.set(pathname, progress);
  window.dispatchEvent(new CustomEvent('ai-learning:document-progress', { detail: { pathname, progress } }));
  void syncProgress(pathname, progress);
}

function stableKey(value: string) {
  let hash = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return (hash >>> 0).toString(36);
}

export const TaskCheckbox: React.FC<TaskCheckboxProps> = ({ checked = false, ...props }) => {
  const pathname = usePathname() || '/';
  const inputRef = useRef<HTMLInputElement>(null);
  const [isChecked, setIsChecked] = useState(Boolean(checked));

  useEffect(() => {
    const item = inputRef.current?.closest('li');
    const label = item?.textContent?.replace(/\s+/g, ' ').trim() || 'task';
    const taskId = stableKey(label);
    const progress = readDocumentProgress(pathname);
    setIsChecked(progress.tasks[taskId] ?? Boolean(checked));
    inputRef.current?.setAttribute('data-task-id', taskId);
  }, [pathname]);

  useEffect(() => {
    const refresh = (event: Event) => {
      const detail = (event as CustomEvent<{ pathname?: string; progress?: DocumentTaskProgress }>).detail;
      if (detail?.pathname !== pathname || !detail.progress) return;
      const taskId = inputRef.current?.getAttribute('data-task-id');
      if (taskId) setIsChecked(detail.progress.tasks[taskId] ?? false);
    };
    window.addEventListener('ai-learning:document-progress', refresh);
    return () => window.removeEventListener('ai-learning:document-progress', refresh);
  }, [pathname]);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const nextValue = event.target.checked;
    setIsChecked(nextValue);
    const taskId = inputRef.current?.getAttribute('data-task-id');
    if (taskId) {
      const progress = readDocumentProgress(pathname);
      writeDocumentProgress(pathname, { ...progress, tasks: { ...progress.tasks, [taskId]: nextValue } });
    }
    props.onChange?.(event);
  };

  return (
    <input
      {...props}
      ref={inputRef}
      type="checkbox"
      checked={isChecked}
      disabled={false}
      onChange={handleChange}
      className="mr-2 h-4 w-4 accent-teal-600 align-[-2px] cursor-pointer disabled:cursor-pointer"
      aria-label="鏍囪浠诲姟瀹屾垚"
    />
  );
};
