'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Network, BookOpen, Beaker, Search, Bell } from 'lucide-react';

export const Navbar: React.FC = () => {
  const pathname = usePathname();

  const navItems = [
    { label: '首页', href: '/', icon: Home },
    { label: '学习地图', href: '/map', icon: Network },
    { label: '笔记库', href: '/learn/deep-learning/neuron', icon: BookOpen },
    { label: '实验室', href: '/playground', icon: Beaker },
    { label: '搜索', href: '/search', icon: Search },
  ];

  return (
    <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-slate-200/80 px-6 py-3">
      <div className="max-w-[1850px] mx-auto flex items-center justify-between">
        {/* Left: Brand Logo */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-xl bg-teal-50 border border-teal-200/80 flex items-center justify-center text-teal-600 group-hover:bg-teal-100 transition-colors">
            <Network className="w-5 h-5" />
          </div>
          <div>
            <h1 className="font-bold text-slate-800 text-base leading-tight group-hover:text-teal-600 transition-colors">
              AI 学习知识库
            </h1>
            <p className="text-[10px] text-slate-400 font-medium tracking-wide uppercase">
              Knowledge Base & Mindmap
            </p>
          </div>
        </Link>

        {/* Center: Navigation Links */}
        <nav className="flex items-center gap-1 md:gap-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`relative flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? 'text-teal-600 font-semibold bg-teal-50/80'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-teal-600' : 'text-slate-400'}`} />
                <span>{item.label}</span>
                {isActive && (
                  <span className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-8 h-0.5 bg-teal-600 rounded-full" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Right: Search, Notifications, Profile */}
        <div className="flex items-center gap-3">
          <Link
            href="/search"
            className="hidden sm:flex items-center gap-2 bg-slate-100 hover:bg-slate-200/70 text-slate-400 text-xs px-3.5 py-2 rounded-xl border border-slate-200/60 w-48 lg:w-64 transition-all"
          >
            <Search className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-slate-400 flex-1 truncate">搜索笔记、课程、主题...</span>
            <kbd className="hidden lg:inline-block bg-white px-1.5 py-0.5 text-[10px] text-slate-400 rounded border border-slate-200">
              ⌘K
            </kbd>
          </Link>

          <button
            aria-label="通知中心"
            className="relative p-2 rounded-xl text-slate-500 hover:bg-slate-100 border border-slate-200/60 transition-colors"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-orange-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center border-2 border-white">
              3
            </span>
          </button>

          <div className="w-8 h-8 rounded-full bg-slate-700 text-white text-xs font-bold flex items-center justify-center shadow-sm">
            H
          </div>
        </div>
      </div>
    </header>
  );
};
