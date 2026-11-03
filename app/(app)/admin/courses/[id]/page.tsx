"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { ChevronLeft, Loader2, Plus, Trash2, Upload } from "lucide-react";
import { getSupabase } from "@/lib/supabase/client";

interface Lesson { id: string; title: string; summary: string; video_url: string | null; duration_sec: number; position: number; objectives: string[]; practical_example: string }
interface Mod { id: string; title: string; position: number; lessons: Lesson[] }

export default function CourseEditor({ params }: { params: { id: string } }) {
  const sb = getSupabase();
  const [title, setTitle] = useState("");
  const [mods, setMods] = useState<Mod[]>([]);
  const [newMod, setNewMod] = useState("");
  const [busy, setBusy] = useState("");
  const [err, setErr] = useState("");

  const load = useCallback(async () => {
    if (!sb) return;
    const { data: c } = await sb.from("courses").select("code,title").eq("id", params.id).maybeSingle();
    setTitle(c ? `${c.code}: ${c.title}` : "Course");
    const { data } = await sb.from("modules").select("*, lessons(*)").eq("course_id", params.id).order("position");
    setMods(((data ?? []) as Mod[]).map((m) => ({ ...m, lessons: [...(m.lessons ?? [])].sort((a, b) => a.position - b.position) })));
  }, [sb, params.id]);
  useEffect(() => { load(); }, [load]);

  const fail = (m?: string) => m && setErr(m);

  const addModule = async () => {
    if (!newMod.trim()) return;
    const { error } = await sb!.from("modules").insert({ course_id: params.id, title: newMod.trim(), position: mods.length });
    fail(error?.message); setNewMod(""); load();
  };
  const delModule = async (m: Mod) => { if (confirm(`Delete module “${m.title}” and its lessons?`)) { fail((await sb!.from("modules").delete().eq("id", m.id)).error?.message); load(); } };
  const addLesson = async (m: Mod) => {
    const t = prompt("Lesson title?");
    if (!t) return;
    fail((await sb!.from("lessons").insert({ module_id: m.id, title: t, position: m.lessons.length })).error?.message); load();
  };
  const delLesson = async (l: Lesson) => { if (confirm(`Delete lesson “${l.title}”?`)) { fail((await sb!.from("lessons").delete().eq("id", l.id)).error?.message); load(); } };
  const patch = async (l: Lesson, p: Partial<Lesson>) => { fail((await sb!.from("lessons").update(p).eq("id", l.id)).error?.message); load(); };

  /** Upload a video file to private Storage; the signed-in students get a signed URL at play time. */
  const upload = async (l: Lesson, file: File) => {
    setBusy(l.id); setErr("");
    const path = `${params.id}/${l.id}-${Date.now()}-${file.name.replace(/[^\w.-]+/g, "_")}`;
    const { error } = await sb!.storage.from("videos").upload(path, file, { upsert: true, contentType: file.type });
    if (error) { setErr(error.message); setBusy(""); return; }
    const { data } = await sb!.storage.from("videos").createSignedUrl(path, 60 * 60 * 24 * 365);
    await patch(l, { video_url: data?.signedUrl ?? null });
    setBusy("");
  };

  return (
    <>
      <Link href="/admin/courses" className="mb-4 inline-flex items-center gap-1 text-sm text-slate-500 hover:text-brand-600"><ChevronLeft size={16} /> All courses</Link>
      <h1 className="text-2xl font-extrabold">{title}</h1>
      <p className="mt-1 text-sm text-slate-500">Create modules and topics, then upload an animated video (MP4/WebM) or paste a Cloudflare Stream embed URL.</p>
      {err && <p className="mt-4 rounded-xl bg-rose-50 p-3 text-sm text-rose-700" role="alert">{err}</p>}

      <div className="mt-6 flex gap-3"><input className="input max-w-sm" placeholder="New module title" value={newMod} onChange={(e) => setNewMod(e.target.value)} aria-label="New module title" /><button className="btn-primary" onClick={addModule}><Plus size={16} /> Add module</button></div>

      <div className="mt-6 space-y-5">
        {mods.map((m) => (
          <div key={m.id} className="card p-5">
            <div className="flex items-center justify-between"><h2 className="font-bold">{m.title}</h2><div className="flex gap-2"><button className="btn-outline px-3 py-1.5 text-xs" onClick={() => addLesson(m)}><Plus size={14} /> Lesson</button><button aria-label="Delete module" className="rounded-lg p-2 text-rose-600 hover:bg-rose-50" onClick={() => delModule(m)}><Trash2 size={15} /></button></div></div>
            <div className="mt-4 space-y-4">
              {m.lessons.length === 0 && <p className="text-sm text-slate-500">No lessons yet.</p>}
              {m.lessons.map((l) => (
                <div key={l.id} className="rounded-xl border border-slate-200 p-4">
                  <div className="flex items-center justify-between gap-2"><p className="font-semibold">{l.title}</p><button aria-label="Delete lesson" className="rounded-lg p-1.5 text-rose-600 hover:bg-rose-50" onClick={() => delLesson(l)}><Trash2 size={14} /></button></div>
                  <div className="mt-3 grid gap-3 sm:grid-cols-2">
                    <div className="sm:col-span-2"><label className="label">Summary</label><textarea className="input" rows={2} defaultValue={l.summary} onBlur={(e) => e.target.value !== l.summary && patch(l, { summary: e.target.value })} /></div>
                    <div><label className="label">Learning objectives (one per line)</label><textarea className="input" rows={3} defaultValue={l.objectives?.join("\n")} onBlur={(e) => patch(l, { objectives: e.target.value.split("\n").map((s) => s.trim()).filter(Boolean) })} /></div>
                    <div><label className="label">Practical example</label><textarea className="input" rows={3} defaultValue={l.practical_example} onBlur={(e) => e.target.value !== l.practical_example && patch(l, { practical_example: e.target.value })} /></div>
                    <div><label className="label">Duration (seconds)</label><input type="number" min={0} className="input" defaultValue={l.duration_sec} onBlur={(e) => Number(e.target.value) !== l.duration_sec && patch(l, { duration_sec: Number(e.target.value) })} /></div>
                    <div><label className="label">Video URL (Cloudflare Stream or file)</label><input className="input" placeholder="https://…" defaultValue={l.video_url ?? ""} onBlur={(e) => e.target.value !== (l.video_url ?? "") && patch(l, { video_url: e.target.value || null })} /></div>
                  </div>
                  <label className="btn-outline mt-3 cursor-pointer text-xs">{busy === l.id ? <Loader2 size={14} className="animate-spin" /> : <Upload size={14} />} Upload video file<input type="file" accept="video/*" className="hidden" onChange={(e) => e.target.files?.[0] && upload(l, e.target.files[0])} /></label>
                  {l.video_url && <span className="ml-3 text-xs text-emerald-600">Video attached</span>}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
