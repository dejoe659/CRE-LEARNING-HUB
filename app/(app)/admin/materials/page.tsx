"use client";

import { useState } from "react";
import { Loader2, Trash2, Upload } from "lucide-react";
import { Empty, PageHeader, useRows } from "@/lib/admin";
import { getSupabase } from "@/lib/supabase/client";

const KINDS = ["Lecture Notes", "Course Summary", "Textbook", "Practical Guide", "Past Questions", "Assignment"];
interface M { id: string; kind: string; title: string; file_path: string; courses: { code: string } | null }

export default function AdminMaterials() {
  const courses = useRows<{ id: string; code: string; title: string }>("courses", "id, code, title", { col: "code", asc: true });
  const { rows, loading, reload } = useRows<M>("materials", "id, kind, title, file_path, courses(code)", { col: "created_at" });
  const [f, setF] = useState({ course: "", kind: KINDS[0], title: "" });
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !f.course) return;
    setBusy(true); setErr("");
    const sb = getSupabase()!;
    const path = `${f.course}/${Date.now()}-${file.name.replace(/[^\w.-]+/g, "_")}`;
    const up = await sb.storage.from("materials").upload(path, file, { contentType: file.type });
    if (up.error) { setErr(up.error.message); setBusy(false); return; }
    const ins = await sb.from("materials").insert({ course_id: f.course, kind: f.kind, title: f.title || file.name, file_path: path });
    if (ins.error) setErr(ins.error.message); else { setFile(null); setF({ ...f, title: "" }); reload(); }
    setBusy(false);
  };
  const del = async (m: M) => {
    if (!confirm(`Delete “${m.title}”?`)) return;
    const sb = getSupabase()!;
    await sb.storage.from("materials").remove([m.file_path]);
    await sb.from("materials").delete().eq("id", m.id);
    reload();
  };

  return (
    <>
      <PageHeader title="PDF materials" subtitle="Upload lecture notes, summaries, textbooks, practical guides, past questions and assignments." />
      <form onSubmit={submit} className="card mb-6 grid gap-4 p-6 sm:grid-cols-2">
        <div><label className="label">Course</label><select required className="input" value={f.course} onChange={(e) => setF({ ...f, course: e.target.value })}><option value="">Select…</option>{courses.rows.map((c) => <option key={c.id} value={c.id}>{c.code} — {c.title}</option>)}</select></div>
        <div><label className="label">Type</label><select className="input" value={f.kind} onChange={(e) => setF({ ...f, kind: e.target.value })}>{KINDS.map((k) => <option key={k}>{k}</option>)}</select></div>
        <div><label className="label">Title</label><input className="input" value={f.title} onChange={(e) => setF({ ...f, title: e.target.value })} placeholder="Defaults to the file name" /></div>
        <div><label className="label">File</label><input required type="file" accept=".pdf,.doc,.docx,.ppt,.pptx" className="block w-full text-sm" onChange={(e) => setFile(e.target.files?.[0] ?? null)} /></div>
        {err && <p className="text-sm text-rose-600 sm:col-span-2">{err}</p>}
        <button className="btn-primary sm:col-span-2 sm:w-fit" disabled={busy}>{busy ? <Loader2 size={16} className="animate-spin" /> : <Upload size={16} />} Upload</button>
      </form>
      <div className="card divide-y divide-slate-100">
        {loading ? <Empty text="Loading…" /> : rows.length === 0 ? <Empty text="No materials uploaded yet." /> : rows.map((m) => (
          <div key={m.id} className="flex items-center gap-3 p-4"><div className="min-w-0 flex-1"><p className="truncate text-sm font-semibold">{m.title}</p><p className="text-xs text-slate-500">{m.courses?.code} · {m.kind}</p></div><button aria-label="Delete" className="rounded-lg p-2 text-rose-600 hover:bg-rose-50" onClick={() => del(m)}><Trash2 size={15} /></button></div>
        ))}
      </div>
    </>
  );
}
