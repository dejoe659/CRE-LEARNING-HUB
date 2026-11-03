"use client";

import Link from "next/link";
import { useState } from "react";
import { CheckCircle2, Loader2 } from "lucide-react";
import AuthShell from "@/components/AuthShell";
import { useAuth } from "@/lib/auth";

export default function ForgotPassword() {
  const { forgot } = useAuth();
  const [email, setEmail] = useState("");
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    const r = await forgot(email.trim());
    setBusy(false);
    if (r.error) setError(r.error);
    else setDone(true);
  }

  return (
    <AuthShell title="Forgot password?" subtitle="Enter your email and we'll send you a reset link.">
      {done ? (
        <div className="card p-6 text-center">
          <CheckCircle2 className="mx-auto text-emerald-500" size={44} />
          <p className="mt-3 text-sm text-slate-600">If an account exists for <strong>{email}</strong>, a reset link is on its way.</p>
          <Link href="/login" className="btn-primary mt-5 w-full">Back to login</Link>
        </div>
      ) : (
        <form onSubmit={submit} className="space-y-4">
          <div><label className="label" htmlFor="email">Email</label><input id="email" type="email" required className="input" value={email} onChange={(e) => setEmail(e.target.value)} /></div>
          {error && <p className="rounded-xl bg-rose-50 p-3 text-sm text-rose-700" role="alert">{error}</p>}
          <button className="btn-primary w-full" disabled={busy}>{busy && <Loader2 size={16} className="animate-spin" />} Send reset link</button>
          <p className="text-center text-sm"><Link href="/login" className="font-semibold text-brand-600 hover:underline">Back to login</Link></p>
        </form>
      )}
    </AuthShell>
  );
}
