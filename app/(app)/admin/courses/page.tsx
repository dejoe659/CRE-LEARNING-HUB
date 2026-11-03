"use client";

import Link from "next/link";
import { useState } from "react";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { Empty, PageHeader, useRows } from "@/lib/admin";
import { getSupabase } from "@/lib/supabase/client";

interface C { id: string; code: string; title: string; description: string; level: number; semester: number; units: number; is_premium: boolean; price_ngn: number; is_published: boolean }
const blank = { code: "", title: "", description: "", level: 100, semester: 1, units: 2, is_premium: false, price_ngn: 0, is_published: false };

export default function Courses() {
  const { rows, loading, error, reload } = useRows<C>("courses", "*", { col: "code", asc: true });
  const [edit, setEdit] = useState<(Partial<C> & typeof blank) | null>(null);
  const [msg, setMsg] = useState("");

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!edit) return;
    const { id, ...payload } = edit as C;
    const sb = getSupabase()!;
    const { error } = id ? await sb.from("courses").update(payload).eq("id", id) : await sb.from("courses").insert(payload);
    if (error) return setMsg(error.message);
    setEdit(null); setMsg(""); reload();
  };
  const del = async (c: C) => {
    if (!confirm(`Delete ${c.code}? This also deletes its modules, lessons and materials.`)) return;
    const { error } = await getSupabase()!.from("courses").delete().eq("id", c.id);
    if (error) alert(error.message); else reload();
  };

  return (
    <>
      <PageHeader title="Courses, modules & videos" subtitle="Add your institution's real course catalogue. Nothing is pre-filled." action={<button className="btn-primary" onClick={() => setEdit({ ...blank })}><Plus size={16} /> Add course</button>} />

      {edit && (
        <form onSubmit={save} className="card mb-6 grid gap-4 p-6 sm:grid-cols-2">
          <h2 className="font-bold sm:col-span-2">{(edit as C).id ? "Edit course" : "New course"}</h2>
          <div><label className="label">Course code</label><input required className="input" value={edit.code} onChange={(e) => setEdit({ ...edit, code: e.target.value })} /></div>
          <div><label className="label">Title</label><input required className="input" value={edit.title} onChange={(e) => setEdit({ ...edit, title: e.target.value })} /></div>
          <div className="sm:col-span-2"><label className="label">Description</label><textarea className="input" rows={3} value={edit.description} onChange={(e) => setEdit({ ...edit, description: e.target.value })} /></div>
          <div><label className="label">Level</label><select className="input" value={edit.level} onChange={(e) => setEdit({ ...edit, level: Number(e.target.value) })}>{[100, 200, 300, 400].map((l) => <option key={l}>{l}</option>)}</select></div>
          <div><label className="label">Semester</label><select className="input" value={edit.semester} onChange={(e) => setEdit({ ...edit, semester: Number(e.target.value) })}><option value={1}>First</option><option value={2}>Second</option></select></div>
          <div><label className="label">Units</label><input type="number" min={0} className="input" value={edit.units} onChange={(e) => setEdit({ ...edit, units: Number(e.target.value) })} /></div>
          <div><label className="label">Price (₦, 0 = free)</label><input type="number" min={0} className="input" value={edit.price_ngn} onChange={(e) => { const p = Number(e.target.value); setEdit({ ...edit, price_ngn: p, is_premium: p > 0 }); }} /></div>
          <label className="flex items-center gap-2 text-sm sm:col-span-2"><input type="checkbox" checked={edit.is_published} onChange={(e) => setEdit({ ...edit, is_published: e.target.checked })} /> Published (visible to students)</label>
          {msg && <p className="text-sm text-rose-600 sm:col-span-2">{msg}</p>}
          <div className="flex gap-3 sm:col-span-2"><button className="btn-primary">Save course</button><button type="button" className="btn-outline" onClick={() => { setEdit(null); setMsg(""); }}>Cancel</button></div>
        </form>
      )}

      <div className="card overflow-x-auto">
        {error && <p className="p-4 text-sm text-rose-600">{error}</p>}
        {loading ? <Empty text="Loading…" /> : rows.length === 0 ? <Empty text="No courses yet. Click “Add course”." /> : (
          <table className="w-full min-w-[640px] text-sm"><thead><tr className="border-b border-slate-100 text-left text-xs uppercase text-slate-500"><th className="p-4">Code</th><th className="p-4">Title</th><th className="p-4">Level / Sem</th><th className="p-4">Price</th><th className="p-4">Status</th><th className="p-4" /></tr></thead>
            <tbody>{rows.map((c) => (
              <tr key={c.id} className="border-b border-slate-50 last:border-0"><td className="p-4 font-semibold">{c.code}</td><td className="p-4">{c.title}</td><td className="p-4">{c.level} / {c.semester}</td><td className="p-4">{c.is_premium ? `₦${Number(c.price_ngn).toLocaleString("en-NG")}` : "Free"}</td>
                <td className="p-4"><span className={`badge ${c.is_published ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-600"}`}>{c.is_published ? "Published" : "Draft"}</span></td>
                <td className="p-4"><div className="flex justify-end gap-2"><Link className="btn-outline px-3 py-1.5 text-xs" href={`/admin/courses/${c.id}`}>Lessons & videos</Link><button aria-label="Edit" className="rounded-lg p-2 hover:bg-slate-100" onClick={() => setEdit(c)}><Pencil size={15} /></button><button aria-label="Delete" className="rounded-lg p-2 text-rose-600 hover:bg-rose-50" onClick={() => del(c)}><Trash2 size={15} /></button></div></td></tr>
            ))}</tbody></table>
        )}
      </div>
    </>
  );
}
