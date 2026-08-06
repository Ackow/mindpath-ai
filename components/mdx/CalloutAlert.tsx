'use client';

import React from 'react';
import { AlertTriangle, Info, Lightbulb, Flame, AlertCircle } from 'lucide-react';

interface CalloutAlertProps {
  type?: 'warning' | 'note' | 'tip' | 'important' | 'caution';
  title?: string;
  children?: React.ReactNode;
}

export function CalloutAlert({ type = 'warning', title, children }: CalloutAlertProps) {
  const normalizedType = (type || 'warning').toLowerCase();

  const configs = {
    warning: {
      icon: AlertTriangle,
      defaultTitle: 'Warning',
      containerClass: 'border-amber-500 bg-amber-50/80 text-amber-950 border-l-4 shadow-sm',
      iconClass: 'text-amber-600',
      titleClass: 'text-amber-700 font-bold text-base tracking-wide',
    },
    note: {
      icon: Info,
      defaultTitle: 'Note',
      containerClass: 'border-blue-500 bg-blue-50/80 text-blue-950 border-l-4 shadow-sm',
      iconClass: 'text-blue-600',
      titleClass: 'text-blue-700 font-bold text-base tracking-wide',
    },
    tip: {
      icon: Lightbulb,
      defaultTitle: 'Tip',
      containerClass: 'border-emerald-500 bg-emerald-50/80 text-emerald-950 border-l-4 shadow-sm',
      iconClass: 'text-emerald-600',
      titleClass: 'text-emerald-700 font-bold text-base tracking-wide',
    },
    important: {
      icon: Flame,
      defaultTitle: 'Important',
      containerClass: 'border-purple-500 bg-purple-50/80 text-purple-950 border-l-4 shadow-sm',
      iconClass: 'text-purple-600',
      titleClass: 'text-purple-700 font-bold text-base tracking-wide',
    },
    caution: {
      icon: AlertCircle,
      defaultTitle: 'Caution',
      containerClass: 'border-rose-500 bg-rose-50/80 text-rose-950 border-l-4 shadow-sm',
      iconClass: 'text-rose-600',
      titleClass: 'text-rose-700 font-bold text-base tracking-wide',
    },
  };

  const currentConfig = configs[normalizedType as keyof typeof configs] || configs.warning;
  const IconComponent = currentConfig.icon;
  const displayTitle = title || currentConfig.defaultTitle;

  return (
    <div
      className={`my-6 rounded-r-xl p-5 px-6 transition-all leading-relaxed ${currentConfig.containerClass}`}
      style={{ padding: '1.25rem 1.5rem' }}
    >
      <div className="flex items-center gap-3 mb-3">
        <IconComponent className={`h-5 w-5 flex-shrink-0 ${currentConfig.iconClass}`} />
        <span className={currentConfig.titleClass}>{displayTitle}</span>
      </div>
      <div className="text-xs sm:text-sm font-normal text-slate-800 space-y-2.5 leading-relaxed">
        {children}
      </div>
    </div>
  );
}
