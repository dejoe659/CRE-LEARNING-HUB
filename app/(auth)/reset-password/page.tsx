"use client";

import Link from "next/link";
import { useState } from "react";
import { CheckCircle2, Loader2 } from "lucide-react";
import AuthShell from "@/components/AuthShell";
import { useAuth } from "@/lib/auth";

export default function ResetPassword() {
  const { resetPassword } = useAuth();
  const [pw, setPw] = useState("");
  const [pw2, setPw2] = useState("");
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (pw.length < 8) return setError("Password must be at least 8 characters.");
    if (pw !== pw2) return setError("Passwords do not match.");
    setBusy(true);
    const r = await resetPassword(pw);
    setBusy(false);
    if (r.error) setError(r.error);
    else setDone(true);
  }

  return (
    <AuthShell title="Set a new password" subtitle="Choose a strong password you haven't used before.">
      {done ? (
        <div className="card p-6 text-center">
          <CheckCircle2 className="mx-auto text-emerald-500" size={44} />
          <p className="mt-3 text-sm text-slate-600">Your password has been updated.</p>
          <Link href="/dashboard" className="btn-primary mt-5 w-full">Continue to dashboard</Link>
        </div>
      ) : (
        <form onSubmit={submit} className="space-y-4">
          <div><label className="label" htmlFor="pw">New password</label><input id="pw" type="password" required minLength={8} className="input" autoComplete="new-password" value={pw} onChange={(e) => setPw(e.target.value)} /></div>
          <div><label className="label" htmlFor="pw2">Confirm password</label><input id="pw2" type="password" required minLength={8} className="input" autoComplete="new-password" value={pw2} onChange={(e) => setPw2(e.target.value)} /></div>
          {error && <p className="rounded-xl bg-rose-50 p-3 text-sm text-rose-700" role="alert">{error}</p>}
          <button className="btn-primary w-full" disabled={busy}>{busy && <Loader2 size={16} className="animate-spin" />} Update password</button>
        </form>
      )}
    </AuthShell>
  );
}
