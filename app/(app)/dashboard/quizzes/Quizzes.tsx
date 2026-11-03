"use client";

import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { Clock, HelpCircle, Timer } from "lucide-react";
import QuizRunner from "@/components/QuizRunner";
import { COURSES, Course, QuizQuestion, courseSlug } from "@/lib/data";
import { useProgress } from "@/lib/progress";

interface Session { title: string; questions: QuizQuestion[]; mode: "practice" | "exam"; limit?: number; course: Course }

export default function Quizzes() {
  const sp = useSearchParams();
  const { addResult, paid } = useProgress();
  const [session, setSession] = useState<Session | null>(null);
  const focus = sp.get("course");
  const courses = COURSES.filter((c) => c.modules.some((m) => m.quiz.length) && (!focus || courseSlug(c.code) === focus));

  if (session)
    return (
      <div className="mx-auto max-w-3xl">
        <button className="btn-ghost mb-4" onClick={() => setSession(null)}>← Back to quizzes</button>
        <QuizRunner
          title={session.title} questions={session.questions} mode={session.mode} timeLimitSec={session.limit}
          onFinish={(o) => addResult({ courseCode: session.course.code, title: session.title, score: o.score, total: o.total, percent: o.percent, durationSec: o.durationSec })}
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
        {courses.map((c) => {
          const all = c.modules.flatMap((m) => m.quiz);
          const locked = c.premium && !paid.includes(c.code);
          return (
            <div key={c.code} className="card p-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div><p className="text-xs font-semibold text-brand-600">{c.code} · {c.level} Level</p><h2 className="font-bold">{c.title}</h2></div>
                <button disabled={locked} className="btn-primary" onClick={() => setSession({ title: `${c.code} Examination`, questions: all, mode: "exam", limit: Math.max(60, all.length * 90), course: c })}>
                  <Timer size={16} /> {locked ? "Premium — locked" : `Take timed exam (${Math.round(Math.max(60, all.length * 90) / 60)} min)`}
                </button>
              </div>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                {c.modules.map((m) => (
                  <button key={m.id} disabled={locked || !m.quiz.length} onClick={() => setSession({ title: `${m.title} quiz`, questions: m.quiz, mode: "practice", course: c })}
                    className="flex items-center gap-3 rounded-xl border border-slate-200 p-3.5 text-left text-sm transition hover:border-brand-400 disabled:opacity-50">
                    <HelpCircle size={18} className="text-brand-600" />
                    <span className="flex-1"><span className="block font-semibold">{m.title}</span><span className="text-xs text-slate-500">Practice · {m.quiz.length} questions</span></span>
                    <Clock size={14} className="text-slate-300" />
                  </button>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
