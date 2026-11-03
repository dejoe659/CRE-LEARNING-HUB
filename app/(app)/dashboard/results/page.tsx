"use client";

import Link from "next/link";
import { useMemo } from "react";
import { Award, Printer } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { useProgress } from "@/lib/progress";

export default function Results() {
  const { user } = useAuth();
  const { results } = useProgress();

  const byCourse = useMemo(() => {
    const m = new Map<string, { n: number; sum: number; best: number }>();
    results.forEach((r) => {
      const e = m.get(r.courseCode) ?? { n: 0, sum: 0, best: 0 };
      e.n++; e.sum += r.percent; e.best = Math.max(e.best, r.percent);
      m.set(r.courseCode, e);
    });
    return [...m.entries()].map(([code, e]) => ({ code, attempts: e.n, avg: Math.round(e.sum / e.n), best: e.best }));
  }, [results]);

  const overall = results.length ? Math.round(results.reduce((a, r) => a + r.percent, 0) / results.length) : 0;
  const grade = (p: number) => (p >= 70 ? "A" : p >= 60 ? "B" : p >= 50 ? "C" : p >= 45 ? "D" : "F");

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3 print:hidden">
        <div><h1 className="text-2xl font-extrabold">My Results</h1><p className="mt-1 text-sm text-slate-500">Examination history and your performance report.</p></div>
        <button className="btn-outline" onClick={() => window.print()}><Printer size={16} /> Print report</button>
      </div>

      {results.length === 0 ? (
        <div className="card p-12 text-center"><Award className="mx-auto text-slate-300" size={44} /><p className="mt-3 font-bold">No results yet</p><p className="text-sm text-slate-500">Take a quiz or examination to see your scores here.</p><Link href="/dashboard/quizzes" className="btn-primary mt-5">Go to quizzes</Link></div>
      ) : (
        <>
          <div className="card p-6">
            <h2 className="font-bold">Performance report — {user?.fullName}</h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-3">
              <div className="rounded-2xl bg-brand-50 p-4"><p className="text-2xl font-extrabold text-brand-700">{overall}%</p><p className="text-xs text-slate-500">Overall average · grade {grade(overall)}</p></div>
              <div className="rounded-2xl bg-emerald-50 p-4"><p className="text-2xl font-extrabold text-emerald-700">{results.length}</p><p className="text-xs text-slate-500">Attempts</p></div>
              <div className="rounded-2xl bg-amber-50 p-4"><p className="text-2xl font-extrabold text-amber-700">{Math.max(...results.map((r) => r.percent))}%</p><p className="text-xs text-slate-500">Best score</p></div>
            </div>
            <div className="mt-6 space-y-3">
              {byCourse.map((c) => (
                <div key={c.code}>
                  <div className="flex justify-between text-sm"><span className="font-semibold">{c.code}</span><span className="text-slate-500">avg {c.avg}% · best {c.best}% · {c.attempts} attempt{c.attempts > 1 ? "s" : ""}</span></div>
                  <div className="mt-1 h-2.5 overflow-hidden rounded-full bg-slate-100"><div className={`h-full rounded-full ${c.avg >= 50 ? "bg-brand-600" : "bg-rose-500"}`} style={{ width: `${c.avg}%` }} /></div>
                </div>
              ))}
            </div>
          </div>

          <div className="card overflow-x-auto">
            <table className="w-full min-w-[520px] text-sm">
              <thead><tr className="border-b border-slate-100 text-left text-xs uppercase tracking-wide text-slate-500"><th className="p-4">Assessment</th><th className="p-4">Course</th><th className="p-4">Score</th><th className="p-4">Result</th><th className="p-4">Date</th></tr></thead>
              <tbody>
                {results.map((r) => (
                  <tr key={r.id} className="border-b border-slate-50 last:border-0">
                    <td className="p-4 font-medium">{r.title}</td><td className="p-4">{r.courseCode}</td>
                    <td className="p-4">{r.score}/{r.total} ({r.percent}%)</td>
                    <td className="p-4"><span className={`badge ${r.percent >= 50 ? "bg-emerald-50 text-emerald-700" : "bg-rose-50 text-rose-700"}`}>{r.percent >= 50 ? "Pass" : "Fail"}</span></td>
                    <td className="p-4 text-slate-500">{new Date(r.takenAt).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
