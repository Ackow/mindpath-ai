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

export const getDocumentProgressKey = (pathname: string) => `ai-learning:document-progress:${pathname}`;
export function readDocumentProgress(pathname: string): DocumentTaskProgress {
  const fallback = { tasks: {}, completed: false };
  try {
    const saved = window.localStorage.getItem(getDocumentProgressKey(pathname));
    if (!saved) return fallback;
    const parsed = JSON.parse(saved);
    return {
      tasks: typeof parsed.tasks === 'object' && parsed.tasks ? parsed.tasks : {},
      completed: parsed.completed === true,
      taskTotal: Number.isFinite(parsed.taskTotal) ? parsed.taskTotal : undefined,
    };
  } catch {
    return fallback;
  }
}

export function writeDocumentProgress(pathname: string, progress: DocumentTaskProgress) {
  if (!requireLogin()) return;
  window.localStorage.setItem(getDocumentProgressKey(pathname), JSON.stringify(progress));
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
