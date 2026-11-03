"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { CreditCard, Loader2, Play } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { useProgress } from "@/lib/progress";
import { getSupabase } from "@/lib/supabase/client";

export default function EnrollPanel({
  code, slug, premium, price, title,
}: { code: string; slug: string; premium: boolean; price: number; title: string }) {
  const { user, loading } = useAuth();
  const { enrolled, paid, enroll, unlock } = useProgress();
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ text: string; demoUnlock?: boolean } | null>(null);

  const isEnrolled = enrolled.includes(code);
  const hasAccess = !premium || paid.includes(code);

  if (loading) return <div className="mt-5 h-12 animate-pulse rounded-xl bg-slate-100" />;

  if (!user)
    return (
      <div className="mt-5 space-y-2">
        <Link href={`/login?next=/courses/${slug}`} className="btn-primary w-full">Login to enrol</Link>
        <Link href="/register" className="btn-outline w-full">Create free account</Link>
      </div>
    );

  const goLearn = () => router.push(`/dashboard/learn/${slug}`);

  const pay = async () => {
    setBusy(true);
    setMsg(null);
    try {
      const sb = getSupabase();
      const token = sb ? (await sb.auth.getSession()).data.session?.access_token : undefined;
      const res = await fetch("/api/paystack/initialize", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        body: JSON.stringify({ courseCode: code, email: user.email }),
      });
      const data = await res.json();
      if (res.ok && data.authorization_url) {
        window.location.href = data.authorization_url;
        return;
      }
      setMsg({ text: data.error ?? "Could not start payment.", demoUnlock: data.configured === false });
    } catch {
      setMsg({ text: "Network error. Please try again." });
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="mt-5 space-y-2">
      {hasAccess ? (
        <button
          className="btn-primary w-full"
          onClick={() => {
            enroll(code);
            goLearn();
          }}
        >
          <Play size={16} /> {isEnrolled ? "Continue learning" : "Enrol & start learning"}
        </button>
      ) : (
        <button className="btn-primary w-full" onClick={pay} disabled={busy}>
          {busy ? <Loader2 size={16} className="animate-spin" /> : <CreditCard size={16} />} Pay ₦{price.toLocaleString("en-NG")} with Paystack
        </button>
      )}
      {msg && (
        <div className="rounded-xl bg-amber-50 p-3 text-xs text-amber-800" role="status">
          {msg.text}
          {msg.demoUnlock && (
            <button
              className="mt-2 block font-semibold underline"
              onClick={() => {
                unlock(code);
                setMsg({ text: `Demo unlock applied for “${title}”. (No real payment was made.)` });
              }}
            >
              Simulate payment (demo mode only)
            </button>
          )}
        </div>
      )}
    </div>
  );
}
