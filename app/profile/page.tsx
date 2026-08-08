'use client';

import React, { ChangeEvent, useEffect, useMemo, useRef, useState } from 'react';
import { BookOpen, CalendarDays, CheckCircle2, Clock3, Pencil } from 'lucide-react';
import { getGlobalGraphNodes } from '@/lib/graph';
import { hydrateDocumentProgress, readDocumentProgress, StudyActivity } from '@/components/mdx/TaskCheckbox';
import { requireLogin } from '@/lib/client/require-auth';

interface UserProfile {
  nickname: string;
  avatar?: string;
}

type DayActivity = { key: string; month: string; count: number; minutes: number };

const CELL_SIZE = 12;
const CELL_GAP = 2.5;

function getLocalDateKey(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function buildActivityWeeks(activity: StudyActivity, duration: StudyActivity) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const start = new Date(today);
  start.setDate(start.getDate() - 364 - ((start.getDay() + 6) % 7));
  const weeks: DayActivity[][] = [];
  for (let weekIndex = 0; weekIndex < 53; weekIndex += 1) {
    const week: DayActivity[] = [];
    for (let dayIndex = 0; dayIndex < 7; dayIndex += 1) {
      const date = new Date(start);
      date.setDate(start.getDate() + weekIndex * 7 + dayIndex);
      const key = getLocalDateKey(date);
      week.push({ key, month: `${date.getMonth() + 1}月`, count: activity[key] || 0, minutes: duration[key] || 0 });
    }
    weeks.push(week);
  }
  return weeks;
}

function activityClass(count: number) {
  if (count === 0) return 'border-slate-300 bg-slate-200 dark:border-slate-700 dark:bg-slate-800';
  if (count === 1) return 'border-emerald-300 bg-emerald-200';
  if (count === 2) return 'border-emerald-500 bg-emerald-400';
  if (count === 3) return 'border-emerald-700 bg-emerald-600';
  return 'border-emerald-900 bg-emerald-800';
}

export default function ProfilePage() {
  const documentNodes = useMemo(() => getGlobalGraphNodes().filter((node) => node.route.startsWith('/learn/')), []);
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const [revision, setRevision] = useState(0);
  const [activity, setActivity] = useState<StudyActivity>({});
  const [duration, setDuration] = useState<StudyActivity>({});
  const [profile, setProfile] = useState<UserProfile>({ nickname: '学习者' });
  const [draftNickname, setDraftNickname] = useState('学习者');
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    const refresh = () => setRevision((value) => value + 1);
    void fetch('/api/profile', { credentials: 'include' }).then((response) => response.ok ? response.json() : null).then((data) => { if (data?.user) { setProfile(data.user); setDraftNickname(data.user.nickname); } });
    void fetch('/api/activity', { credentials: 'include' }).then((response) => response.ok ? response.json() : null).then((data) => { const nextActivity: StudyActivity = {}; const nextDuration: StudyActivity = {}; for (const row of data?.activity || []) { nextActivity[row.activity_date] = row.activity_count; nextDuration[row.activity_date] = row.duration_minutes; } setActivity(nextActivity); setDuration(nextDuration); });
    void fetch('/api/progress', { credentials: 'include' }).then((response) => response.ok ? response.json() : null).then((data) => { hydrateDocumentProgress(data?.progress || []); refresh(); });
    refresh();
    window.addEventListener('ai-learning:document-progress', refresh);
    window.addEventListener('ai-learning:study-activity', refresh);
    return () => {
      window.removeEventListener('ai-learning:document-progress', refresh);
      window.removeEventListener('ai-learning:study-activity', refresh);
    };
  }, []);

  const saveProfile = (nextProfile: UserProfile) => {
    if (!requireLogin()) return;
    const normalized = { ...nextProfile, nickname: nextProfile.nickname.trim() || '学习者' };
    setProfile(normalized);
    setDraftNickname(normalized.nickname);
    void fetch('/api/profile', { method: 'PUT', credentials: 'include', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(normalized) });
    window.dispatchEvent(new CustomEvent('ai-learning:user-profile'));
  };

  const handleAvatarChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !file.type.startsWith('image/') || file.size > 2 * 1024 * 1024) return;
    const reader = new FileReader();
    reader.onload = () => saveProfile({ ...profile, avatar: typeof reader.result === 'string' ? reader.result : undefined });
    reader.readAsDataURL(file);
    event.target.value = '';
  };

  const stats = useMemo(() => {
    void revision;
    let started = 0;
    let completed = 0;
    const minutes = Object.values(duration).reduce((sum, value) => sum + value, 0);
    for (const node of documentNodes) {
      const progress = readDocumentProgress(node.route);
      const total = progress.taskTotal || 0;
      const checked = Object.values(progress.tasks).filter(Boolean).length;
      const percent = progress.completed ? 100 : total > 0 ? Math.round((checked / total) * 100) : 0;
      if (percent > 0) started += 1;
      if (percent === 100) completed += 1;
    }
    return { started, completed, minutes: Math.round(minutes) };
  }, [documentNodes, duration, revision]);

  const weeks = useMemo(() => buildActivityWeeks(activity, duration), [activity, duration]);
  const totalActivities = Object.values(activity).reduce((sum, count) => sum + count, 0);
  const gridTemplateColumns = `repeat(${weeks.length}, ${CELL_SIZE}px)`;
  const gridStyle = { gridTemplateColumns, columnGap: `${CELL_GAP}px` };

  return (
    <div className="mx-auto grid max-w-[1120px] grid-cols-1 gap-8 py-4 lg:grid-cols-[260px_minmax(0,1fr)]">
      <aside className="space-y-4">
        <div className="flex flex-col gap-4">
          <div className="relative h-36 w-36 shrink-0">
            {profile.avatar ? <img src={profile.avatar} alt={`${profile.nickname} 的头像`} className="h-full w-full rounded-full border border-slate-200 object-cover dark:border-slate-700" /> : <div className="flex h-full w-full items-center justify-center rounded-full bg-slate-800 text-5xl font-black text-white">{profile.nickname.slice(0, 1).toUpperCase()}</div>}
            <button type="button" onClick={() => avatarInputRef.current?.click()} title="设置头像" aria-label="设置头像" className="absolute -bottom-1 -right-1 flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500 shadow-sm hover:text-teal-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"><Pencil className="h-4 w-4" /></button>
            <input ref={avatarInputRef} type="file" accept="image/*" onChange={handleAvatarChange} className="hidden" />
          </div>
          <div className="min-w-0">
            {isEditing ? <div className="space-y-2"><label className="text-xs font-bold text-slate-600 dark:text-slate-300">昵称<input value={draftNickname} onChange={(event) => setDraftNickname(event.target.value)} className="mt-1.5 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 outline-none focus:border-teal-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white" /></label><div className="flex gap-2"><button type="button" onClick={() => { saveProfile({ ...profile, nickname: draftNickname }); setIsEditing(false); }} className="rounded-md bg-teal-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-teal-700">保存</button><button type="button" onClick={() => { setDraftNickname(profile.nickname); setIsEditing(false); }} className="rounded-md border border-slate-200 px-3 py-1.5 text-xs font-bold text-slate-600 dark:border-slate-700 dark:text-slate-300">取消</button></div></div> : <><h1 className="truncate whitespace-nowrap text-2xl font-extrabold text-slate-900 dark:text-white">{profile.nickname}</h1><button type="button" onClick={() => setIsEditing(true)} className="mt-2 flex items-center gap-2 whitespace-nowrap text-sm font-semibold text-slate-500 hover:text-teal-700 dark:text-slate-400"><Pencil className="h-3.5 w-3.5" />修改昵称</button></>}
          </div>
        </div>
      </aside>

      <main className="min-w-0 space-y-7">
        <section className="border-b border-slate-200 pb-5 dark:border-slate-700"><h2 className="text-base font-extrabold text-slate-900 dark:text-white">学习概览</h2><div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3"><div className="rounded-lg border border-slate-200 bg-slate-50 p-4 shadow-sm dark:border-slate-700 dark:bg-slate-900"><div className="flex items-center gap-2 text-xs font-bold text-slate-500"><BookOpen className="h-4 w-4 text-teal-600" />已学习章节</div><div className="mt-2 text-2xl font-black text-slate-900 dark:text-white">{stats.started}<span className="ml-1 text-sm text-slate-400">/ {documentNodes.length}</span></div></div><div className="rounded-lg border border-slate-200 bg-slate-50 p-4 shadow-sm dark:border-slate-700 dark:bg-slate-900"><div className="flex items-center gap-2 text-xs font-bold text-slate-500"><Clock3 className="h-4 w-4 text-amber-500" />学习时长</div><div className="mt-2 text-2xl font-black text-slate-900 dark:text-white">{stats.minutes}<span className="ml-1 text-sm text-slate-400">分钟</span></div></div><div className="rounded-lg border border-slate-200 bg-slate-50 p-4 shadow-sm dark:border-slate-700 dark:bg-slate-900"><div className="flex items-center gap-2 text-xs font-bold text-slate-500"><CheckCircle2 className="h-4 w-4 text-emerald-500" />完成章节</div><div className="mt-2 text-2xl font-black text-slate-900 dark:text-white">{stats.completed}<span className="ml-1 text-sm text-slate-400">篇</span></div></div></div></section>

        <section className="rounded-lg border border-slate-200 p-5 dark:border-slate-700">
          <div className="mb-4 flex items-start justify-between gap-4"><div><h2 className="flex items-center gap-2 text-base font-extrabold text-slate-900 dark:text-white"><CalendarDays className="h-4 w-4 text-teal-600" />学习记录</h2><p className="mt-1 text-xs text-slate-500 dark:text-slate-400">最近 52 周共 {totalActivities} 次真实学习操作</p></div><div className="flex items-center gap-1 text-[10px] text-slate-400"><span>少</span>{[0, 1, 2, 3, 4].map((level) => <span key={level} className={`h-3 w-3 rounded-[2px] border ${activityClass(level)}`} />)}<span>多</span></div></div>
          <div className="pb-1"><div style={{ width: `${weeks.length * (CELL_SIZE + CELL_GAP) - CELL_GAP}px` }}><div className="mb-[3px] grid text-[10px] leading-none text-slate-400" style={gridStyle}>{weeks.map((week, index) => <span key={week[0].key}>{index === 0 || week[0].month !== weeks[index - 1][0].month ? week[0].month : ''}</span>)}</div><div className="grid grid-flow-col grid-rows-7" style={{ ...gridStyle, rowGap: `${CELL_GAP}px` }}>{weeks.flatMap((week) => week.map((day) => <span key={day.key} title={`${day.key}：${day.count} 次学习操作，约 ${day.minutes} 分钟`} className={`h-3 w-3 rounded-[2px] border ${activityClass(day.count)}`} />))}</div></div></div>
        </section>
      </main>
    </div>
  );
}
