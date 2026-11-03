"use client";

import { Empty, PageHeader, useRows } from "@/lib/admin";

interface Pay { id: string; reference: string; amount_kobo: number; status: string; created_at: string; paid_at: string | null; profiles: { full_name: string } | null; courses: { code: string } | null }

export default function Payments() {
  const { rows, loading, error } = useRows<Pay>("payments", "id, reference, amount_kobo, status, created_at, paid_at, profiles(full_name), courses(code)", { col: "created_at" });
  const total = rows.filter((r) => r.status === "success").reduce((a, r) => a + Number(r.amount_kobo), 0) / 100;
  return (
    <>
      <PageHeader title="Course payments" subtitle={`Verified revenue: ₦${total.toLocaleString("en-NG")}. Payments are confirmed server-side with Paystack.`} />
      <div className="card overflow-x-auto">
        {error && <p className="p-4 text-sm text-rose-600">{error}</p>}
        {loading ? <Empty text="Loading…" /> : rows.length === 0 ? <Empty text="No payments yet." /> : (
          <table className="w-full min-w-[640px] text-sm"><thead><tr className="border-b border-slate-100 text-left text-xs uppercase text-slate-500"><th className="p-4">Student</th><th className="p-4">Course</th><th className="p-4">Amount</th><th className="p-4">Status</th><th className="p-4">Reference</th><th className="p-4">Date</th></tr></thead>
            <tbody>{rows.map((p) => (
              <tr key={p.id} className="border-b border-slate-50 last:border-0"><td className="p-4">{p.profiles?.full_name}</td><td className="p-4">{p.courses?.code}</td><td className="p-4">₦{(Number(p.amount_kobo) / 100).toLocaleString("en-NG")}</td>
                <td className="p-4"><span className={`badge ${p.status === "success" ? "bg-emerald-50 text-emerald-700" : p.status === "failed" ? "bg-rose-50 text-rose-700" : "bg-amber-50 text-amber-700"}`}>{p.status}</span></td>
                <td className="p-4 font-mono text-xs">{p.reference.slice(0, 16)}…</td><td className="p-4 text-slate-500">{new Date(p.created_at).toLocaleDateString()}</td></tr>
            ))}</tbody></table>
        )}
      </div>
    </>
  );
}
