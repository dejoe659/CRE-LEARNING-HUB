"use client";

import { useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";
import { Clock, HelpCircle, Timer } from "lucide-react";
import QuizRunner from "@/components/QuizRunner";
import { ExamItem, courseSlug } from "@/lib/data";
import { useContent } from "@/lib/content";
import { useExams } from "@/lib/exams";
import { useProgress } from "@/lib/progress";

export default function Quizzes() {
  const sp = useSearchParams();
  const { addResult, paid } = useProgress();
  const { courses } = useContent();
  const { exams, loading } = useExams();
  const [session, setSession] = useState<ExamItem | null>(null);
  const focus = sp.get("course");

  const groups = useMemo(() => {
    const by = new Map<string, ExamItem[]>();
    for (const e of exams) {
      if (focus && courseSlug(e.courseCode) !== focus) continue;
      by.set(e.courseCode, [...(by.get(e.courseCode) ?? []), e]);
    }
    return [...by.entries()].map(([code, items]) => ({ code, items, course: courses.find((c) => c.code === code) }));
  }, [exams, courses, focus]);

  if (session)
    return (
      <div className="mx-auto max-w-3xl">
        <button className="btn-ghost mb-4" onClick={() => setSession(null)}>← Back to quizzes</button>
        <QuizRunner
          title={session.title}
          questions={session.questions}
          mode={session.timeLimitSec ? "exam" : "practice"}
          timeLimitSec={session.timeLimitSec}
          remoteExamId={session.remote ? session.id : undefined}
          onFinish={(o) => addResult({ courseCode: session.courseCode, title: session.title, score: o.score, total: o.total, percent: o.percent, durationSec: o.durationSec })}
          onClose={() => setSession(null)}
        />
      </div>
    );

  return (
    <div>
      <h1 className="text-2xl font-extrabold">Quizzes &amp; Examinations</h1>
      <p className="mt-1 text-sm text-slate-500">Practice quizzes give instant feedback. Examinations are timed and marked automatically on submission.</p>
      {focus && <a href="/dashboard/quizzes" className="mt-3 inline-block text-sm font-semibold text-brand-600 hover:underline">Show all courses</a>}
      <div className="mt-6 space-y-5">
        {groups.length === 0 && (
          <div className="card p-12 text-center text-sm text-slate-500">{loading ? "Loading…" : "No quizzes or examinations are available yet."}</div>
        )}
        {groups.map(({ code, items, course }) => {
          const locked = !!course?.premium && !paid.includes(code);
          const timed = items.filter((e) => e.timeLimitSec);
          const practice = items.filter((e) => !e.timeLimitSec);
          return (
            <div key={code} className="card p-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div><p className="text-xs font-semibold text-brand-600">{code}{course ? ` · ${course.level} Level` : ""}</p><h2 className="font-bold">{items[0].courseTitle}</h2></div>
                <div className="flex flex-wrap gap-2">
                  {timed.map((e) => (
                    <button key={e.id} disabled={locked} className="btn-primary" onClick={() => setSession(e)}>
                      <Timer size={16} /> {locked ? "Premium — locked" : `${e.title} (${Math.round((e.timeLimitSec ?? 0) / 60)} min)`}
                    </button>
                  ))}
                </div>
              </div>
              {practice.length > 0 && (
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  {practice.map((e) => (
                    <button key={e.id} disabled={locked} onClick={() => setSession(e)}
                      className="flex items-center gap-3 rounded-xl border border-slate-200 p-3.5 text-left text-sm transition hover:border-brand-400 disabled:opacity-50">
                      <HelpCircle size={18} className="text-brand-600" />
                      <span className="flex-1"><span className="block font-semibold">{e.title}</span><span className="text-xs text-slate-500">Practice · {e.questions.length} questions</span></span>
                      <Clock size={14} className="text-slate-300" />
                    </button>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
