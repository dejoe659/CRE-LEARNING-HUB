"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/lib/auth";

export default function Settings() {
  const { user, resetPassword, logout } = useAuth();
  const router = useRouter();
  const [pw, setPw] = useState("");
  const [pw2, setPw2] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  async function change(e: React.FormEvent) {
    e.preventDefault();
    if (pw.length < 8) return setMsg({ ok: false, text: "Password must be at least 8 characters." });
    if (pw !== pw2) return setMsg({ ok: false, text: "Passwords do not match." });
    setBusy(true);
    const r = await resetPassword(pw);
    setBusy(false);
    setMsg(r.error ? { ok: false, text: r.error } : { ok: true, text: "Password updated." });
    if (!r.error) { setPw(""); setPw2(""); }
  }

  const clearLocal = () => {
    if (!user || !confirm("Clear all saved progress, results and assignment drafts stored in this browser?")) return;
    [`cre.progress.${user.id}`, `cre.assignments.${user.id}`, `cre.tutor.${user.id}`].forEach((k) => localStorage.removeItem(k));
    location.reload();
  };

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <h1 className="text-2xl font-extrabold">Settings</h1>
      <form onSubmit={change} className="card space-y-4 p-6">
        <h2 className="font-bold">Change password</h2>
        <div><label className="label" htmlFor="p1">New password</label><input id="p1" type="password" className="input" minLength={8} autoComplete="new-password" value={pw} onChange={(e) => setPw(e.target.value)} /></div>
        <div><label className="label" htmlFor="p2">Confirm password</label><input id="p2" type="password" className="input" minLength={8} autoComplete="new-password" value={pw2} onChange={(e) => setPw2(e.target.value)} /></div>
        {msg && <p className={`text-sm ${msg.ok ? "text-emerald-600" : "text-rose-600"}`} role="status">{msg.text}</p>}
        <button className="btn-primary" disabled={busy}>{busy && <Loader2 size={16} className="animate-spin" />} Update password</button>
      </form>
      <div className="card space-y-3 p-6">
        <h2 className="font-bold">Your data</h2>
        <p className="text-sm text-slate-500">Progress and exam results are stored for your account. You can clear the copy saved in this browser.</p>
        <button className="btn-outline" onClick={clearLocal}>Clear saved progress on this device</button>
      </div>
      <div className="card space-y-3 p-6">
        <h2 className="font-bold">Session</h2>
        <button className="btn-danger" onClick={async () => { await logout(); router.replace("/"); }}>Log out</button>
      </div>
    </div>
  );
}
