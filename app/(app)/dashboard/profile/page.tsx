"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, Loader2 } from "lucide-react";
import { useAuth } from "@/lib/auth";

export default function Profile() {
  const { user, updateProfile } = useAuth();
  const [f, setF] = useState({ fullName: "", institution: "", department: "", level: 100 });
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => { if (user) setF({ fullName: user.fullName, institution: user.institution, department: user.department, level: user.level }); }, [user]);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    const r = await updateProfile(f);
    setBusy(false);
    setMsg(r.error ? { ok: false, text: r.error } : { ok: true, text: "Profile updated." });
  }

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="text-2xl font-extrabold">Profile</h1>
      <div className="card mt-6 p-6">
        <div className="flex items-center gap-4">
          <span className="flex h-16 w-16 items-center justify-center rounded-full bg-brand-600 text-2xl font-bold text-white">{user?.fullName?.[0]?.toUpperCase()}</span>
          <div><p className="font-bold">{user?.fullName}</p><p className="text-sm text-slate-500">{user?.email}</p><span className="badge mt-1 bg-brand-50 text-brand-700">{user?.role}</span></div>
        </div>
        <form onSubmit={save} className="mt-6 space-y-4">
          <div><label className="label" htmlFor="n">Full name</label><input id="n" className="input" required value={f.fullName} onChange={(e) => setF({ ...f, fullName: e.target.value })} /></div>
          <div><label className="label" htmlFor="e">Email (cannot be changed here)</label><input id="e" className="input bg-slate-50" disabled value={user?.email ?? ""} /></div>
          <div><label className="label" htmlFor="i">Institution</label><input id="i" className="input" value={f.institution} onChange={(e) => setF({ ...f, institution: e.target.value })} /></div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div><label className="label" htmlFor="d">Department</label><input id="d" className="input" value={f.department} onChange={(e) => setF({ ...f, department: e.target.value })} /></div>
            <div><label className="label" htmlFor="l">Academic level</label><select id="l" className="input" value={f.level} onChange={(e) => setF({ ...f, level: Number(e.target.value) })}>{[100, 200, 300, 400].map((l) => <option key={l} value={l}>{l} Level</option>)}</select></div>
          </div>
          {msg && <p className={`flex items-center gap-2 text-sm ${msg.ok ? "text-emerald-600" : "text-rose-600"}`} role="status">{msg.ok && <CheckCircle2 size={16} />}{msg.text}</p>}
          <button className="btn-primary" disabled={busy}>{busy && <Loader2 size={16} className="animate-spin" />} Save changes</button>
        </form>
      </div>
    </div>
  );
}
