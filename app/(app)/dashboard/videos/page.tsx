"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { CheckCircle2, Lock, PlayCircle } from "lucide-react";
import { COURSES, courseSlug, flatLessons, fmtDuration } from "@/lib/data";
import { useProgress } from "@/lib/progress";
import { SceneThumb } from "@/components/LessonScene";

export default function Videos() {
  const { enrolled, completed, positions, paid } = useProgress();
  const [scope, setScope] = useState<"enrolled" | "all">("enrolled");
  const list = useMemo(
    () =>
      COURSES.filter((c) => scope === "all" || enrolled.includes(c.code)).flatMap((c) =>
        flatLessons(c).map((l) => ({ ...l, course: c }))
      ),
    [scope, enrolled]
  );
  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div><h1 className="text-2xl font-extrabold">Video Lessons</h1><p className="mt-1 text-sm text-slate-500">Every animated lesson in one place.</p></div>
        <div className="flex rounded-xl bg-white p-1 ring-1 ring-slate-200">
          {(["enrolled", "all"] as const).map((s) => (
            <button key={s} onClick={() => setScope(s)} className={`rounded-lg px-4 py-2 text-sm font-semibold ${scope === s ? "bg-brand-600 text-white" : "text-slate-600"}`}>{s === "enrolled" ? "My courses" : "All courses"}</button>
          ))}
        </div>
      </div>
      {list.length === 0 ? (
        <div className="card mt-8 p-12 text-center"><p className="font-bold">No videos yet</p><p className="mt-1 text-sm text-slate-500">Enrol in a course to see its lessons here.</p><Link href="/dashboard/explore" className="btn-primary mt-5">Explore courses</Link></div>
      ) : (
        <div className="mt-6 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {list.map((l) => {
            const locked = l.course.premium && !paid.includes(l.course.code);
            const pos = positions[l.id] ?? 0;
            return (
              <Link key={l.id} href={locked ? `/courses/${courseSlug(l.course.code)}` : `/dashboard/learn/${courseSlug(l.course.code)}?lesson=${l.id}`} className="card group overflow-hidden transition hover:-translate-y-1 hover:shadow-glow">
                <div className="relative">
                  <SceneThumb scene={l.scene} />
                  <span className="absolute inset-0 flex items-center justify-center bg-navy-900/0 transition group-hover:bg-navy-900/30">{locked ? <Lock className="text-white" /> : <PlayCircle className="text-white opacity-0 transition group-hover:opacity-100" size={44} />}</span>
                  <span className="badge absolute bottom-2 right-2 bg-black/70 text-white">{fmtDuration(l.duration)}</span>
                  {pos > 0 && !completed.includes(l.id) && <div className="absolute inset-x-0 bottom-0 h-1 bg-white/30"><div className="h-full bg-brand-500" style={{ width: `${Math.min(100, (pos / l.duration) * 100)}%` }} /></div>}
                </div>
                <div className="p-4">
                  <p className="text-xs font-semibold text-brand-600">{l.course.code}</p>
                  <p className="mt-0.5 flex items-start justify-between gap-2 text-sm font-bold">{l.title}{completed.includes(l.id) && <CheckCircle2 size={18} className="shrink-0 text-emerald-500" />}</p>
                  <p className="mt-1 line-clamp-2 text-xs text-slate-500">{l.summary}</p>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
