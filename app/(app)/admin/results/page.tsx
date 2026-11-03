"use client";

import { Empty, PageHeader, useRows } from "@/lib/admin";

interface A { id: string; score: number; total: number; percent: number; taken_at: string; profiles: { full_name: string; level: number } | null; exams: { title: string; courses: { code: string } | null } | null }
interface Prog { user_id: string; completed: boolean }

export default function Results() {
  const att = useRows<A>("exam_attempts", "id, score, total, percent, taken_at, profiles(full_name, level), exams(title, courses(code))", { col: "taken_at" });
  const prog = useRows<Prog>("lesson_progress", "user_id, completed");
  const done = prog.rows.filter((p) => p.completed).length;
  const learners = new Set(prog.rows.map((p) => p.user_id)).size;
  const avg = att.rows.length ? Math.round(att.rows.reduce((a, r) => a + r.percent, 0) / att.rows.length) : 0;

  return (
    <>
      <PageHeader title="Results & student progress" subtitle="Examination results and learning activity across all students." />
      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        {[["Active learners", learners], ["Lessons completed", done], ["Average exam score", `${avg}%`]].map(([l, v]) => <div key={l as string} className="card p-5"><p className="text-2xl font-extrabold text-brand-600">{v}</p><p className="text-xs text-slate-500">{l}</p></div>)}
      </div>
      <div className="card overflow-x-auto">
        {att.loading ? <Empty text="Loading…" /> : att.rows.length === 0 ? <Empty text="No exam attempts yet." /> : (
          <table className="w-full min-w-[560px] text-sm"><thead><tr className="border-b border-slate-100 text-left text-xs uppercase text-slate-500"><th className="p-4">Student</th><th className="p-4">Course</th><th className="p-4">Exam</th><th className="p-4">Score</th><th className="p-4">Date</th></tr></thead>
            <tbody>{att.rows.map((a) => <tr key={a.id} className="border-b border-slate-50 last:border-0"><td className="p-4">{a.profiles?.full_name}</td><td className="p-4">{a.exams?.courses?.code}</td><td className="p-4">{a.exams?.title}</td><td className="p-4">{a.score}/{a.total} ({a.percent}%)</td><td className="p-4 text-slate-500">{new Date(a.taken_at).toLocaleDateString()}</td></tr>)}</tbody></table>
        )}
      </div>
    </>
  );
}
