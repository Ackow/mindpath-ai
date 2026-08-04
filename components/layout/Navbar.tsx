'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Network, BookOpen, Beaker, Search } from 'lucide-react';
import { ThemeToggle } from '@/components/layout/ThemeToggle';

export const Navbar: React.FC = () => {
  const pathname = usePathname();
  const [avatar, setAvatar] = useState<string | undefined>();

  useEffect(() => {
    const refreshAvatar = () => {
      try {
        const saved = localStorage.getItem('ai-learning:user-profile');
        const parsed = saved ? JSON.parse(saved) : null;
        setAvatar(typeof parsed?.avatar === 'string' ? parsed.avatar : undefined);
      } catch {
        setAvatar(undefined);
      }
    };
    refreshAvatar();
    window.addEventListener('ai-learning:user-profile', refreshAvatar);
    return () => window.removeEventListener('ai-learning:user-profile', refreshAvatar);
  }, []);

  const navItems = [
    { label: '首页', href: '/', icon: Home },
    { label: '学习地图', href: '/map', icon: Network },
    { label: '笔记库', href: '/learn/foundations/python/01-py-environment', icon: BookOpen },
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
            const isActive =
              item.label === '笔记库'
                ? pathname.startsWith('/learn/')
                : item.href === '/'
                ? pathname === '/'
                : pathname.startsWith(item.href);

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

        {/* Right: Theme, Profile */}
        <div className="flex items-center gap-3">
          <ThemeToggle compact />
          <Link href="/profile" aria-label="打开用户页" className="flex h-8 w-8 items-center justify-center overflow-hidden rounded-full bg-slate-700 text-xs font-bold text-white shadow-sm transition-all hover:ring-2 hover:ring-teal-200">
            {avatar ? <img src={avatar} alt="用户头像" className="h-full w-full object-cover" /> : 'H'}
          </Link>
        </div>
      </div>
    </header>
  );
};
