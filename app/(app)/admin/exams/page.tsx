"use client";

import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { Empty, PageHeader, useRows } from "@/lib/admin";
import { getSupabase } from "@/lib/supabase/client";

interface Exam { id: string; title: string; time_limit_sec: number | null; is_published: boolean; courses: { code: string } | null; questions: { id: string }[] }
interface Q { type: "mcq" | "tf" | "short"; prompt: string; options: string; answer: string; explanation: string }
const blankQ: Q = { type: "mcq", prompt: "", options: "", answer: "", explanation: "" };

export default function Exams() {
  const courses = useRows<{ id: string; code: string }>("courses", "id, code", { col: "code", asc: true });
  const { rows, loading, reload } = useRows<Exam>("exams", "id, title, time_limit_sec, is_published, courses(code), questions(id)", { col: "title", asc: true });
  const [open, setOpen] = useState(false);
  const [meta, setMeta] = useState({ course: "", title: "", minutes: 0, published: false });
  const [qs, setQs] = useState<Q[]>([{ ...blankQ }]);
  const [err, setErr] = useState("");

  const setQ = (i: number, p: Partial<Q>) => setQs(qs.map((q, j) => (j === i ? { ...q, ...p } : q)));

  const save = async (e: React.FormEvent) => {
    e.preventDefault(); setErr("");
    const sb = getSupabase()!;
    const { data: exam, error } = await sb.from("exams").insert({ course_id: meta.course, title: meta.title, time_limit_sec: meta.minutes ? meta.minutes * 60 : null, is_published: meta.published }).select("id").single();
    if (error || !exam) return setErr(error?.message ?? "Could not create exam.");
    for (const [i, q] of qs.entries()) {
      const options = q.type === "mcq" ? q.options.split("\n").map((s) => s.trim()).filter(Boolean) : null;
      const { data: row, error: qe } = await sb.from("questions").insert({ exam_id: exam.id, type: q.type, prompt: q.prompt, options, explanation: q.explanation, position: i }).select("id").single();
      if (qe || !row) return setErr(qe?.message ?? "Question failed.");
      const { error: ae } = await sb.from("question_answers").insert({ question_id: row.id, answer: q.type === "tf" ? (q.answer === "False" ? "False" : "True") : q.answer });
      if (ae) return setErr(ae.message);
    }
    setOpen(false); setQs([{ ...blankQ }]); setMeta({ course: "", title: "", minutes: 0, published: false }); reload();
  };
  const togglePub = async (x: Exam) => { await getSupabase()!.from("exams").update({ is_published: !x.is_published }).eq("id", x.id); reload(); };
  const del = async (x: Exam) => { if (confirm(`Delete “${x.title}” and its questions?`)) { await getSupabase()!.from("exams").delete().eq("id", x.id); reload(); } };

  return (
    <>
      <PageHeader title="Quizzes & examinations" subtitle="Multiple-choice, true/false and short-answer questions. Answers are stored in an admin-only table and marked on the server." action={<button className="btn-primary" onClick={() => setOpen(true)}><Plus size={16} /> New exam</button>} />
      {open && (
        <form onSubmit={save} className="card mb-6 space-y-5 p-6">
          <div className="grid gap-4 sm:grid-cols-3">
            <div><label className="label">Course</label><select required className="input" value={meta.course} onChange={(e) => setMeta({ ...meta, course: e.target.value })}><option value="">Select…</option>{courses.rows.map((c) => <option key={c.id} value={c.id}>{c.code}</option>)}</select></div>
            <div><label className="label">Title</label><input required className="input" value={meta.title} onChange={(e) => setMeta({ ...meta, title: e.target.value })} /></div>
            <div><label className="label">Time limit (minutes, 0 = none)</label><input type="number" min={0} className="input" value={meta.minutes} onChange={(e) => setMeta({ ...meta, minutes: Number(e.target.value) })} /></div>
          </div>
          {qs.map((q, i) => (
            <div key={i} className="rounded-xl border border-slate-200 p-4">
              <div className="flex items-center justify-between"><p className="text-sm font-semibold">Question {i + 1}</p>{qs.length > 1 && <button type="button" className="text-rose-600" aria-label="Remove question" onClick={() => setQs(qs.filter((_, j) => j !== i))}><Trash2 size={15} /></button>}</div>
              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                <div><label className="label">Type</label><select className="input" value={q.type} onChange={(e) => setQ(i, { type: e.target.value as Q["type"], answer: "" })}><option value="mcq">Multiple choice</option><option value="tf">True / False</option><option value="short">Short answer</option></select></div>
                <div><label className="label">{q.type === "short" ? "Accepted answers (use | between alternatives)" : "Correct answer"}</label>
                  {q.type === "tf" ? <select className="input" value={q.answer || "True"} onChange={(e) => setQ(i, { answer: e.target.value })}><option>True</option><option>False</option></select> : <input required className="input" value={q.answer} onChange={(e) => setQ(i, { answer: e.target.value })} />}</div>
                <div className="sm:col-span-2"><label className="label">Question</label><textarea required className="input" rows={2} value={q.prompt} onChange={(e) => setQ(i, { prompt: e.target.value })} /></div>
                {q.type === "mcq" && <div className="sm:col-span-2"><label className="label">Options (one per line — the correct answer must match one exactly)</label><textarea required className="input" rows={4} value={q.options} onChange={(e) => setQ(i, { options: e.target.value })} /></div>}
                <div className="sm:col-span-2"><label className="label">Explanation shown after marking</label><input className="input" value={q.explanation} onChange={(e) => setQ(i, { explanation: e.target.value })} /></div>
              </div>
            </div>
          ))}
          <button type="button" className="btn-outline" onClick={() => setQs([...qs, { ...blankQ }])}><Plus size={16} /> Add question</button>
          <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={meta.published} onChange={(e) => setMeta({ ...meta, published: e.target.checked })} /> Publish now</label>
          {err && <p className="text-sm text-rose-600" role="alert">{err}</p>}
          <div className="flex gap-3"><button className="btn-primary">Save exam</button><button type="button" className="btn-outline" onClick={() => setOpen(false)}>Cancel</button></div>
        </form>
      )}
      <div className="card divide-y divide-slate-100">
        {loading ? <Empty text="Loading…" /> : rows.length === 0 ? <Empty text="No exams yet." /> : rows.map((x) => (
          <div key={x.id} className="flex flex-wrap items-center gap-3 p-4"><div className="min-w-0 flex-1"><p className="truncate font-semibold">{x.title}</p><p className="text-xs text-slate-500">{x.courses?.code} · {x.questions?.length ?? 0} questions · {x.time_limit_sec ? `${Math.round(x.time_limit_sec / 60)} min` : "untimed"}</p></div>
            <button className={`badge ${x.is_published ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-600"}`} onClick={() => togglePub(x)}>{x.is_published ? "Published" : "Draft"} (toggle)</button>
            <button aria-label="Delete" className="rounded-lg p-2 text-rose-600 hover:bg-rose-50" onClick={() => del(x)}><Trash2 size={15} /></button></div>
        ))}
      </div>
    </>
  );
}
