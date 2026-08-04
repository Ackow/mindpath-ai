'use client';

import React, { useEffect, useState } from 'react';
import { Moon, Sun } from 'lucide-react';

const THEME_KEY = 'ai-learning:theme';

export const ThemeToggle: React.FC<{ compact?: boolean }> = ({ compact = false }) => {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem(THEME_KEY);
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const nextIsDark = saved ? saved === 'dark' : prefersDark;
    setIsDark(nextIsDark);
    document.documentElement.classList.toggle('dark', nextIsDark);
  }, []);

  const toggleTheme = () => {
    const nextIsDark = !isDark;
    setIsDark(nextIsDark);
    localStorage.setItem(THEME_KEY, nextIsDark ? 'dark' : 'light');
    document.documentElement.classList.toggle('dark', nextIsDark);
  };

  if (compact) {
    return (
      <button
        type="button"
        onClick={toggleTheme}
        aria-label={isDark ? '切换到明亮主题' : '切换到暗色主题'}
        title={isDark ? '明亮主题' : '暗色主题'}
        className="flex h-8 w-8 items-center justify-center rounded-xl border border-slate-200/60 text-slate-500 transition-colors hover:bg-slate-100 hover:text-teal-700 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
      >
        {isDark ? <Moon className="h-4 w-4 text-indigo-300" /> : <Sun className="h-4 w-4 text-amber-500" />}
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={isDark ? '切换到明亮主题' : '切换到暗色主题'}
      title={isDark ? '明亮主题' : '暗色主题'}
      className="flex w-full items-center justify-between rounded-xl border border-slate-200/80 bg-white px-3 py-2.5 text-xs font-semibold text-slate-600 transition-colors hover:border-teal-300 hover:text-teal-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
    >
      <span className="flex items-center gap-2">
        {isDark ? <Moon className="h-4 w-4 text-indigo-300" /> : <Sun className="h-4 w-4 text-amber-500" />}
        {isDark ? '暗色主题' : '明亮主题'}
      </span>
      <span className="text-[10px] text-slate-400">切换</span>
    </button>
  );
};
