"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { CheckCircle2, Loader2 } from "lucide-react";
import AuthShell from "@/components/AuthShell";
import { useAuth } from "@/lib/auth";

export default function RegisterPage() {
  const { register } = useAuth();
  const router = useRouter();
  const [f, setF] = useState({ fullName: "", email: "", password: "", institution: "", department: "Computer and Robotics Education", level: 100 });
  const [error, setError] = useState("");
  const [confirm, setConfirm] = useState(false);
  const [busy, setBusy] = useState(false);
  const set = (k: keyof typeof f) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setF({ ...f, [k]: k === "level" ? Number(e.target.value) : e.target.value });

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (f.password.length < 8) return setError("Password must be at least 8 characters.");
    setBusy(true);
    const r = await register({ ...f, email: f.email.trim() });
    setBusy(false);
    if (r.error) return setError(r.error);
    if (r.needsConfirm) return setConfirm(true);
    router.replace("/dashboard");
  }

  if (confirm)
    return (
      <AuthShell title="Check your email" subtitle="One more step to activate your account.">
        <div className="card p-6 text-center">
          <CheckCircle2 className="mx-auto text-emerald-500" size={44} />
          <p className="mt-3 text-sm text-slate-600">
            We sent a confirmation link to <strong>{f.email}</strong>. Click it, then log in.
          </p>
          <Link href="/login" className="btn-primary mt-5 w-full">Go to login</Link>
        </div>
      </AuthShell>
    );

  return (
    <AuthShell title="Create your account" subtitle="Join CRE Learning Hub and start learning today.">
      <form onSubmit={submit} className="space-y-4">
        <div><label className="label" htmlFor="fullName">Full name</label><input id="fullName" required className="input" autoComplete="name" value={f.fullName} onChange={set("fullName")} /></div>
        <div><label className="label" htmlFor="email">Email</label><input id="email" type="email" required className="input" autoComplete="email" value={f.email} onChange={set("email")} /></div>
        <div><label className="label" htmlFor="password">Password (min. 8 characters)</label><input id="password" type="password" required minLength={8} className="input" autoComplete="new-password" value={f.password} onChange={set("password")} /></div>
        <div><label className="label" htmlFor="institution">Institution</label><input id="institution" required className="input" placeholder="e.g. your university" value={f.institution} onChange={set("institution")} /></div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div><label className="label" htmlFor="department">Department</label><input id="department" required className="input" value={f.department} onChange={set("department")} /></div>
          <div>
            <label className="label" htmlFor="level">Academic level</label>
            <select id="level" className="input" value={f.level} onChange={set("level")}>
              {[100, 200, 300, 400].map((l) => <option key={l} value={l}>{l} Level</option>)}
            </select>
          </div>
        </div>
        {error && <p className="rounded-xl bg-rose-50 p-3 text-sm text-rose-700" role="alert">{error}</p>}
        <button className="btn-primary w-full" disabled={busy}>{busy && <Loader2 size={16} className="animate-spin" />} Create account</button>
        <p className="text-center text-sm text-slate-500">Already registered? <Link href="/login" className="font-semibold text-brand-600 hover:underline">Log in</Link></p>
      </form>
    </AuthShell>
  );
}
