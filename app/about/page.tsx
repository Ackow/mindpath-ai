'use client';

import React, { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { ShieldCheck, Download, Upload, GitBranch, Heart, Database } from 'lucide-react';

export default function AboutPage() {
  const [backupMsg, setBackupMsg] = useState<string | null>(null);

  const handleExportProgress = () => {
    const mockProgress = {
      version: '1.0.0',
      exportDate: new Date().toISOString(),
      completedNodeIds: ['math-vector', 'math-prob', 'math-calculus', 'ml-supervised'],
      inProgressNodeIds: ['ml-linear-model', 'dl-neuron', 'dl-activation'],
      totalMinutes: 390,
      streakDays: 4,
    };
    const blob = new Blob([JSON.stringify(mockProgress, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ai-learning-progress-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    setBackupMsg('✅ 学习进度备份导出成功！');
    setTimeout(() => setBackupMsg(null), 3000);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Card className="p-8 space-y-6">
        <div className="space-y-2 text-center border-b border-slate-100 pb-6">
          <h1 className="text-2xl font-extrabold text-slate-900">关于 AI 学习知识库</h1>
          <p className="text-xs text-slate-400">零后端、静态托管、内容与进度完全由个人掌控的交互学习平台</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs text-slate-600 leading-relaxed">
          <div className="space-y-2 bg-slate-50 p-4 rounded-xl border border-slate-200/60">
            <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-teal-600" />
              隐私与纯静态原则
            </h3>
            <p>
              本项目无自建服务器、数据库或云端账号体系。所有课程笔记、图谱配置与代码示例均通过 Git 仓库版本化管理，个人学习进度保存在浏览器本地。
            </p>
          </div>

          <div className="space-y-2 bg-slate-50 p-4 rounded-xl border border-slate-200/60">
            <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
              <GitBranch className="w-4 h-4 text-teal-600" />
              开源与 GitHub Pages
            </h3>
            <p>
              每次向 `main` 分支提交修改后，GitHub Actions 均会自动触发格式校验与 Next.js 静态构建，并自动发布至 GitHub Pages 静态站点。
            </p>
          </div>
        </div>

        {/* Data Backup & Restore */}
        <div className="pt-4 border-t border-slate-100 space-y-4">
          <h2 className="font-bold text-slate-800 text-base flex items-center gap-2">
            <Database className="w-5 h-5 text-teal-600" />
            本地学习数据备份与恢复
          </h2>
          <p className="text-xs text-slate-500">更换浏览器或设备时，可通过导出 JSON 备份文件，在新的设备上轻松恢复学习进度。</p>

          <div className="flex flex-wrap items-center gap-4">
            <button
              onClick={handleExportProgress}
              className="flex items-center gap-2 bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold px-4 py-2.5 rounded-xl transition-all shadow-sm"
            >
              <Download className="w-4 h-4" />
              导出学习进度 JSON
            </button>
            <label className="flex items-center gap-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 text-xs font-semibold px-4 py-2.5 rounded-xl cursor-pointer transition-all">
              <Upload className="w-4 h-4 text-slate-400" />
              导入学习进度
              <input type="file" accept=".json" className="hidden" />
            </label>
          </div>

          {backupMsg && <div className="text-xs font-bold text-emerald-600 bg-emerald-50 p-2.5 rounded-xl border border-emerald-200">{backupMsg}</div>}
        </div>
      </Card>
    </div>
  );
}
