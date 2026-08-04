'use client';

import React, { useEffect, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';

interface TaskCheckboxProps extends React.InputHTMLAttributes<HTMLInputElement> {
  checked?: boolean;
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
    const storageKey = `ai-learning:task:${pathname}:${stableKey(label)}`;
    const saved = window.localStorage.getItem(storageKey);
    if (saved !== null) setIsChecked(saved === '1');
    inputRef.current?.setAttribute('data-storage-key', storageKey);
  }, [pathname]);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const nextValue = event.target.checked;
    setIsChecked(nextValue);
    const storageKey = inputRef.current?.getAttribute('data-storage-key');
    if (storageKey) window.localStorage.setItem(storageKey, nextValue ? '1' : '0');
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
