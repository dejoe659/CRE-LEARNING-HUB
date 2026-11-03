"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { CheckCircle2, Loader2, XCircle } from "lucide-react";
import { courseSlug } from "@/lib/data";
import { useProgress } from "@/lib/progress";

export default function Callback() {
  const sp = useSearchParams();
  const reference = sp.get("reference") ?? sp.get("trxref");
  const { unlock } = useProgress();
  const [state, setState] = useState<{ status: "checking" | "ok" | "fail"; code?: string; error?: string }>({ status: "checking" });
  const ran = useRef(false);

  useEffect(() => {
    if (ran.current || !reference) return;
    ran.current = true;
    fetch(`/api/paystack/verify?reference=${encodeURIComponent(reference)}`)
      .then((r) => r.json())
      .then((d) => {
        if (d.ok) { if (d.courseCode) unlock(d.courseCode); setState({ status: "ok", code: d.courseCode }); }
        else setState({ status: "fail", error: d.error });
      })
      .catch(() => setState({ status: "fail", error: "Network error while verifying." }));
  }, [reference, unlock]);

  return (
    <div className="card mx-auto mt-10 max-w-md p-10 text-center">
      {!reference && <><XCircle className="mx-auto text-rose-500" size={44} /><p className="mt-3 font-bold">No payment reference found.</p></>}
      {reference && state.status === "checking" && <><Loader2 className="mx-auto animate-spin text-brand-600" size={44} /><p className="mt-3 font-bold">Verifying your payment…</p><p className="text-sm text-slate-500">Please don&apos;t close this page.</p></>}
      {state.status === "ok" && <><CheckCircle2 className="mx-auto text-emerald-500" size={44} /><p className="mt-3 text-lg font-bold">Payment confirmed</p><p className="text-sm text-slate-500">Your course is now unlocked.</p>{state.code && <Link href={`/dashboard/learn/${courseSlug(state.code)}`} className="btn-primary mt-6">Start learning</Link>}</>}
      {state.status === "fail" && <><XCircle className="mx-auto text-rose-500" size={44} /><p className="mt-3 text-lg font-bold">We couldn&apos;t confirm the payment</p><p className="text-sm text-slate-500">{state.error}</p><Link href="/dashboard/explore" className="btn-outline mt-6">Back to courses</Link></>}
    </div>
  );
}
