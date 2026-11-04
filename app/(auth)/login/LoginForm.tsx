"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import AuthShell from "@/components/AuthShell";
import { useAuth } from "@/lib/auth";

export default function LoginForm() {
  const { login, user } = useAuth();
  const router = useRouter();
  const sp = useSearchParams();
  const next = sp.get("next");
  const safeNext = next && next.startsWith("/") && !next.startsWith("//") ? next : "/dashboard";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (user) router.replace(safeNext);
  }, [user, router, safeNext, next]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    const r = await login(email.trim(), password);
    setBusy(false);
    if (r.error) setError(r.error);
  }

  return (
    <AuthShell title="Welcome back" subtitle="Log in to continue your learning journey.">
      <form onSubmit={submit} className="space-y-4">
        <div>
          <label className="label" htmlFor="email">Email</label>
          <input id="email" type="email" required autoComplete="email" className="input" value={email} onChange={(e) => setEmail(e.target.value)} />
        </div>
        <div>
          <div className="flex items-center justify-between">
            <label className="label" htmlFor="password">Password</label>
            <Link href="/forgot-password" className="mb-1.5 text-xs font-semibold text-brand-600 hover:underline">Forgot password?</Link>
          </div>
          <div className="relative">
            <input id="password" type={show ? "text" : "password"} required autoComplete="current-password" className="input pr-11" value={password} onChange={(e) => setPassword(e.target.value)} />
            <button type="button" onClick={() => setShow(!show)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600" aria-label={show ? "Hide password" : "Show password"}>
              {show ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>
        {error && <p className="rounded-xl bg-rose-50 p-3 text-sm text-rose-700" role="alert">{error}</p>}
        <button className="btn-primary w-full" disabled={busy}>
          {busy && <Loader2 size={16} className="animate-spin" />} Log in
        </button>
        <p className="text-center text-sm text-slate-500">
          New here? <Link href="/register" className="font-semibold text-brand-600 hover:underline">Create an account</Link>
        </p>
      </form>
    </AuthShell>
  );
}
