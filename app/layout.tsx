import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Navbar } from "@/components/layout/Navbar";

export const metadata: Metadata = {
  title: "AI 学习知识库 | 个人 AI 学习路线与知识地图",
  description: "将零散 AI 学习内容组织为可追溯、可交互、可复习的闭环知识路径。",
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-CN">
      <body className="bg-[#F4F7FA] text-slate-800 antialiased min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 max-w-[1850px] w-full mx-auto px-4 sm:px-6 py-4">
          {children}
        </main>
        <footer className="bg-white border-t border-slate-200 py-4 text-center text-xs text-slate-400">
          <div className="max-w-[1850px] mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
            <span>© 2026 AI 学习知识库 · 基于静态 React/Next.js 构建</span>
            <div className="flex gap-4">
              <a href="https://github.com/Ackow/mindpath-ai" target="_blank" rel="noreferrer" className="hover:text-slate-600 transition-colors">
                GitHub 仓库
              </a>
              <a href="/about" className="hover:text-slate-600 transition-colors">
                关于本项目
              </a>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
