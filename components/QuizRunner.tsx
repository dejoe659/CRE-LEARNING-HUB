"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { CheckCircle2, ChevronRight, Clock, RotateCcw, Trophy, XCircle } from "lucide-react";
import type { QuizQuestion } from "@/lib/data";

export interface QuizOutcome {
  score: number;
  total: number;
  percent: number;
  durationSec: number;
}

/** Marks one answer. Short answers accept any of the `|`-separated keywords (case-insensitive). */
export function markAnswer(q: QuizQuestion, given: string): boolean {
  const g = given.trim().toLowerCase();
  if (!g) return false;
  if (q.type === "short") return q.answer.split("|").some((k) => g === k.trim().toLowerCase() || g.includes(k.trim().toLowerCase()));
  return g === q.answer.trim().toLowerCase();
}

const fmt = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;

export default function QuizRunner({
  title, questions, mode = "practice", timeLimitSec, onFinish, onClose,
}: {
  title: string;
  questions: QuizQuestion[];
  mode?: "practice" | "exam";
  timeLimitSec?: number;
  onFinish?: (o: QuizOutcome) => void;
  onClose?: () => void;
}) {
  const [idx, setIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [revealed, setRevealed] = useState<Record<string, boolean>>({});
  const [finished, setFinished] = useState(false);
  const [remaining, setRemaining] = useState(timeLimitSec ?? 0);
  const start = useRef(Date.now());
  const outcomeRef = useRef<QuizOutcome | null>(null);

  const q = questions[idx];
  const exam = mode === "exam";

  const finish = useCallback(() => {
    if (outcomeRef.current) return;
    const score = questions.filter((x) => markAnswer(x, answers[x.id] ?? "")).length;
    const o = { score, total: questions.length, percent: Math.round((score / questions.length) * 100), durationSec: Math.round((Date.now() - start.current) / 1000) };
    outcomeRef.current = o;
    setFinished(true);
    onFinish?.(o);
  }, [answers, questions, onFinish]);

  useEffect(() => {
    if (!timeLimitSec || finished) return;
    const t = setInterval(() => setRemaining((r) => r - 1), 1000);
    return () => clearInterval(t);
  }, [timeLimitSec, finished]);

  useEffect(() => {
    if (timeLimitSec && remaining <= 0 && !finished) finish();
  }, [remaining, timeLimitSec, finished, finish]);

  const outcome = outcomeRef.current;
  const correctNow = useMemo(() => (q ? markAnswer(q, answers[q.id] ?? "") : false), [q, answers]);

  if (!questions.length) return <div className="card p-8 text-center text-sm text-slate-500">No questions have been added yet.</div>;

  if (finished && outcome) {
    const pass = outcome.percent >= 50;
    return (
      <div className="card p-6 sm:p-8">
        <div className="text-center">
          <Trophy className={pass ? "mx-auto text-amber-500" : "mx-auto text-slate-400"} size={48} />
          <h3 className="mt-3 text-2xl font-extrabold">{outcome.percent}%</h3>
          <p className="text-sm text-slate-500">{outcome.score} of {outcome.total} correct · {fmt(outcome.durationSec)}</p>
          <p className={`mt-2 text-sm font-semibold ${pass ? "text-emerald-600" : "text-rose-600"}`}>{pass ? "Well done — you passed!" : "Keep practising — review the lessons and try again."}</p>
        </div>
        <ol className="mt-6 space-y-3">
          {questions.map((x, i) => {
            const ok = markAnswer(x, answers[x.id] ?? "");
            return (
              <li key={x.id} className={`rounded-xl border p-4 text-sm ${ok ? "border-emerald-200 bg-emerald-50" : "border-rose-200 bg-rose-50"}`}>
                <p className="flex items-start gap-2 font-semibold">{ok ? <CheckCircle2 size={18} className="mt-0.5 shrink-0 text-emerald-600" /> : <XCircle size={18} className="mt-0.5 shrink-0 text-rose-600" />}{i + 1}. {x.question}</p>
                <p className="mt-1 pl-7 text-slate-600">Your answer: <em>{answers[x.id] || "—"}</em>{!ok && <> · Correct: <strong>{x.answer.split("|")[0]}</strong></>}</p>
                <p className="mt-1 pl-7 text-xs text-slate-500">{x.explanation}</p>
              </li>
            );
          })}
        </ol>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <button className="btn-outline" onClick={() => { outcomeRef.current = null; start.current = Date.now(); setAnswers({}); setRevealed({}); setIdx(0); setFinished(false); setRemaining(timeLimitSec ?? 0); }}><RotateCcw size={16} /> Retake</button>
          {onClose && <button className="btn-primary" onClick={onClose}>Done</button>}
        </div>
      </div>
    );
  }

  const given = answers[q.id] ?? "";
  const isRevealed = !exam && revealed[q.id];
  const options = q.type === "tf" ? ["True", "False"] : q.options ?? [];
  const last = idx === questions.length - 1;

  return (
    <div className="card p-6 sm:p-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-brand-600">{exam ? "Examination" : "Practice quiz"}</p>
          <h3 className="text-lg font-bold">{title}</h3>
        </div>
        {timeLimitSec ? (
          <span className={`badge gap-1.5 px-3 py-1.5 text-sm ${remaining < 30 ? "bg-rose-100 text-rose-700" : "bg-brand-50 text-brand-700"}`}><Clock size={14} /> {fmt(Math.max(0, remaining))}</span>
        ) : null}
      </div>

      <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-slate-100"><div className="h-full rounded-full bg-brand-600 transition-all" style={{ width: `${((idx + 1) / questions.length) * 100}%` }} /></div>
      <p className="mt-2 text-xs text-slate-500">Question {idx + 1} of {questions.length} · {q.type === "mcq" ? "Multiple choice" : q.type === "tf" ? "True / False" : "Short answer"}</p>

      <p className="mt-4 text-base font-semibold leading-relaxed">{q.question}</p>

      <div className="mt-4 space-y-2.5">
        {q.type === "short" ? (
          <input className="input" placeholder="Type your answer…" value={given} disabled={isRevealed} onChange={(e) => setAnswers({ ...answers, [q.id]: e.target.value })} aria-label="Your answer" />
        ) : (
          options.map((o) => {
            const picked = given === o;
            const showOk = isRevealed && o.toLowerCase() === q.answer.toLowerCase();
            const showBad = isRevealed && picked && !showOk;
            return (
              <button key={o} disabled={isRevealed} onClick={() => setAnswers({ ...answers, [q.id]: o })}
                className={`flex w-full items-center gap-3 rounded-xl border p-3.5 text-left text-sm transition ${showOk ? "border-emerald-500 bg-emerald-50" : showBad ? "border-rose-500 bg-rose-50" : picked ? "border-brand-600 bg-brand-50 ring-2 ring-brand-100" : "border-slate-200 hover:border-brand-400"}`}>
                <span className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 ${picked ? "border-brand-600 bg-brand-600" : "border-slate-300"}`}>{picked && <span className="h-1.5 w-1.5 rounded-full bg-white" />}</span>
                {o}
              </button>
            );
          })
        )}
      </div>

      {isRevealed && (
        <div className={`mt-4 rounded-xl p-4 text-sm ${correctNow ? "bg-emerald-50 text-emerald-900" : "bg-rose-50 text-rose-900"}`} role="status">
          <p className="font-semibold">{correctNow ? "Correct!" : `Not quite — answer: ${q.answer.split("|")[0]}`}</p>
          <p className="mt-1 text-xs opacity-80">{q.explanation}</p>
        </div>
      )}

      <div className="mt-6 flex flex-wrap justify-between gap-3">
        <button className="btn-ghost" disabled={idx === 0} onClick={() => setIdx(idx - 1)}>Previous</button>
        <div className="flex gap-3">
          {!exam && !isRevealed && <button className="btn-outline" disabled={!given.trim()} onClick={() => setRevealed({ ...revealed, [q.id]: true })}>Check answer</button>}
          {last ? (
            <button className="btn-primary" onClick={finish}>Submit {exam ? "exam" : "quiz"}</button>
          ) : (
            <button className="btn-primary" onClick={() => setIdx(idx + 1)}>Next <ChevronRight size={16} /></button>
          )}
        </div>
      </div>
    </div>
  );
}
