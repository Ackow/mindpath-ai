import { BookOpen, GitBranch, Heart, Share2 } from 'lucide-react';
import { Card } from '@/components/ui/Card';

const REPOSITORY_URL = 'https://github.com/Ackow/mindpath-ai';

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-4xl space-y-6 py-4">
      <Card className="space-y-6 p-8">
        <div className="border-b border-slate-100 pb-6 text-center">
          <h1 className="text-2xl font-extrabold text-slate-900">关于 MindPath AI</h1>
          <p className="mt-2 text-sm text-slate-500">记录 AI 学习笔记，整理学习路径，并向同样在学习的人公开分享。</p>
        </div>

        <div className="grid grid-cols-1 gap-5 text-sm leading-relaxed text-slate-600 md:grid-cols-2">
          <section className="space-y-2 rounded-lg border border-slate-200 bg-slate-50 p-5">
            <h2 className="flex items-center gap-2 font-bold text-slate-800"><BookOpen className="h-4 w-4 text-teal-600" />项目用途</h2>
            <p>这是一个持续更新的个人 AI 学习笔记库。每篇 MDX 文档记录概念、代码、任务清单和前置关系，帮助将零散学习内容组织成可回顾的知识路径。</p>
          </section>
          <section className="space-y-2 rounded-lg border border-slate-200 bg-slate-50 p-5">
            <h2 className="flex items-center gap-2 font-bold text-slate-800"><Share2 className="h-4 w-4 text-teal-600" />公开分享</h2>
            <p>课程笔记、关系配置与实现代码均在公开仓库维护。欢迎阅读、引用学习资料、提交问题或建议，一起完善这条学习路线。</p>
          </section>
        </div>

        <section className="space-y-3 rounded-lg border border-teal-100 bg-teal-50/50 p-5">
          <div className="flex items-center gap-2 text-slate-800"><Heart className="h-4 w-4 text-rose-500" /><h2 className="font-bold">作者与维护</h2></div>
          <p className="text-sm text-slate-600">由 <strong>IceColaaa.</strong>（GitHub: <a href="https://github.com/Ackow" target="_blank" rel="noreferrer" className="font-semibold text-teal-700 hover:underline">@Ackow</a>）持续维护。</p>
          <a href={REPOSITORY_URL} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 text-sm font-bold text-teal-700 hover:underline"><GitBranch className="h-4 w-4" />查看公开仓库</a>
        </section>
      </Card>
    </div>
  );
}
