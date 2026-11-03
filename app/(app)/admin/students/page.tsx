"use client";

import { useState } from "react";
import { Empty, PageHeader, useRows } from "@/lib/admin";
import { getSupabase } from "@/lib/supabase/client";

interface P { id: string; full_name: string; institution: string; department: string; level: number; role: string; created_at: string }

export default function Students() {
  const { rows, loading, error, reload } = useRows<P>("profiles", "*", { col: "created_at" });
  const [q, setQ] = useState("");
  const [level, setLevel] = useState(0);
  const list = rows.filter((r) => (!level || r.level === level) && `${r.full_name} ${r.institution}`.toLowerCase().includes(q.toLowerCase()));

  const setRole = async (id: string, role: string) => {
    if (!confirm(`Change this user's role to ${role}?`)) return;
    const { error } = await getSupabase()!.from("profiles").update({ role }).eq("id", id);
    if (error) alert(error.message); else reload();
  };

  return (
    <>
      <PageHeader title="Students" subtitle="Manage registered students and their roles." />
      <div className="mb-4 flex flex-wrap gap-3">
        <input className="input max-w-xs" placeholder="Search name or institution…" value={q} onChange={(e) => setQ(e.target.value)} aria-label="Search students" />
        <select className="input w-auto" value={level} onChange={(e) => setLevel(Number(e.target.value))} aria-label="Level"><option value={0}>All levels</option>{[100, 200, 300, 400].map((l) => <option key={l} value={l}>{l} Level</option>)}</select>
      </div>
      <div className="card overflow-x-auto">
        {error && <p className="p-4 text-sm text-rose-600">{error}</p>}
        {loading ? <Empty text="Loading…" /> : list.length === 0 ? <Empty text="No students found." /> : (
          <table className="w-full min-w-[640px] text-sm"><thead><tr className="border-b border-slate-100 text-left text-xs uppercase text-slate-500"><th className="p-4">Name</th><th className="p-4">Institution</th><th className="p-4">Dept</th><th className="p-4">Level</th><th className="p-4">Role</th><th className="p-4" /></tr></thead>
            <tbody>{list.map((s) => (
              <tr key={s.id} className="border-b border-slate-50 last:border-0"><td className="p-4 font-medium">{s.full_name || "—"}</td><td className="p-4">{s.institution}</td><td className="p-4">{s.department}</td><td className="p-4">{s.level}</td><td className="p-4"><span className="badge bg-slate-100">{s.role}</span></td>
                <td className="p-4 text-right"><button className="text-xs font-semibold text-brand-600 hover:underline" onClick={() => setRole(s.id, s.role === "admin" ? "student" : "admin")}>{s.role === "admin" ? "Make student" : "Make admin"}</button></td></tr>
            ))}</tbody></table>
        )}
      </div>
    </>
  );
}
