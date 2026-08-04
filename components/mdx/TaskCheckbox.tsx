'use client';

import React, { useEffect, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';

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
const STUDY_ACTIVITY_KEY = 'ai-learning:study-activity';
const STUDY_DURATION_KEY = 'ai-learning:study-duration';

function localDateKey(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function readStudyActivity(): StudyActivity {
  try {
    const saved = window.localStorage.getItem(STUDY_ACTIVITY_KEY);
    const parsed = saved ? JSON.parse(saved) : {};
    if (!parsed || typeof parsed !== 'object') return {};
    return Object.fromEntries(Object.entries(parsed).filter(([, value]) => Number.isFinite(value) && Number(value) > 0).map(([key, value]) => [key, Number(value)]));
  } catch {
    return {};
  }
}

export function recordStudyActivity() {
  const activity = readStudyActivity();
  const date = localDateKey();
  const nextActivity = { ...activity, [date]: (activity[date] || 0) + 1 };
  window.localStorage.setItem(STUDY_ACTIVITY_KEY, JSON.stringify(nextActivity));
  window.dispatchEvent(new CustomEvent('ai-learning:study-activity', { detail: { date } }));
}

export function readStudyDuration(): StudyActivity {
  try {
    const saved = window.localStorage.getItem(STUDY_DURATION_KEY);
    const parsed = saved ? JSON.parse(saved) : {};
    if (!parsed || typeof parsed !== 'object') return {};
    return Object.fromEntries(Object.entries(parsed).filter(([, value]) => Number.isFinite(value) && Number(value) > 0).map(([key, value]) => [key, Number(value)]));
  } catch {
    return {};
  }
}

function recordStudyDuration(minutes: number) {
  const duration = readStudyDuration();
  const date = localDateKey();
  window.localStorage.setItem(STUDY_DURATION_KEY, JSON.stringify({ ...duration, [date]: (duration[date] || 0) + Math.max(1, minutes) }));
}

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

export function writeDocumentProgress(pathname: string, progress: DocumentTaskProgress, recordActivity = false, activityMinutes = 5) {
  window.localStorage.setItem(getDocumentProgressKey(pathname), JSON.stringify(progress));
  if (recordActivity) {
    recordStudyDuration(activityMinutes);
    recordStudyActivity();
  }
  window.dispatchEvent(new CustomEvent('ai-learning:document-progress', { detail: { pathname, progress } }));
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
      writeDocumentProgress(pathname, { ...progress, tasks: { ...progress.tasks, [taskId]: nextValue } }, true);
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
      aria-label="标记任务完成"
    />
  );
};
