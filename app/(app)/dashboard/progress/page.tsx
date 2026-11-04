"use client";

import Link from "next/link";
import { CheckCircle2, Circle } from "lucide-react";
import { courseSlug } from "@/lib/data";
import { useContent } from "@/lib/content";
import { useProgress } from "@/lib/progress";
import { courseProgress } from "@/lib/stats";

export default function ProgressPage() {
  const { courses: COURSES } = useContent();
  const { enrolled, completed } = useProgress();
  const mine = COURSES.filter((c) => enrolled.includes(c.code));
  const total = mine.reduce((a, c) => a + c.modules.reduce((x, m) => x + m.lessons.length, 0), 0);
  const done = mine.reduce((a, c) => a + c.modules.reduce((x, m) => x + m.lessons.filter((l) => completed.includes(l.id)).length, 0), 0);

  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-extrabold">Learning Progress</h1><p className="mt-1 text-sm text-slate-500">{done} of {total} lessons completed across {mine.length} course{mine.length === 1 ? "" : "s"}.</p></div>
      {mine.length === 0 && <div className="card p-12 text-center"><p className="font-bold">Nothing to track yet</p><Link href="/dashboard/explore" className="btn-primary mt-5">Explore courses</Link></div>}
      {mine.map((c) => {
        const p = courseProgress(c, completed);
        return (
          <div key={c.code} className="card p-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div><p className="text-xs font-semibold text-brand-600">{c.code}</p><h2 className="font-bold">{c.title}</h2></div>
              <div className="flex items-center gap-3"><span className="text-2xl font-extrabold text-brand-600">{p}%</span><Link href={`/dashboard/learn/${courseSlug(c.code)}`} className="btn-outline px-4 py-2 text-xs">{p ? "Continue" : "Start"}</Link></div>
            </div>
            <div className="mt-3 h-2.5 overflow-hidden rounded-full bg-slate-100"><div className="h-full rounded-full bg-gradient-to-r from-brand-500 to-accent-500 transition-all" style={{ width: `${p}%` }} /></div>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              {c.modules.map((m) => (
                <div key={m.id} className="rounded-xl bg-slate-50 p-4">
                  <p className="text-sm font-semibold">{m.title}</p>
                  <ul className="mt-2 space-y-1.5">{m.lessons.map((l) => <li key={l.id} className="flex items-center gap-2 text-xs text-slate-600">{completed.includes(l.id) ? <CheckCircle2 size={14} className="text-emerald-500" /> : <Circle size={14} className="text-slate-300" />}{l.title}</li>)}</ul>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
