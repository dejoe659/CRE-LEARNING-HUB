"use client";

import { useEffect, useState } from "react";
import { BookOpen, CreditCard, HelpCircle, Users } from "lucide-react";
import { getSupabase } from "@/lib/supabase/client";
import { PageHeader } from "@/lib/admin";

export default function AdminOverview() {
  const [c, setC] = useState({ students: 0, courses: 0, attempts: 0, revenue: 0 });
  useEffect(() => {
    const sb = getSupabase();
    if (!sb) return;
    (async () => {
      const count = async (t: string, f?: (q: any) => any) => { let q: any = sb.from(t).select("*", { count: "exact", head: true }); if (f) q = f(q); return (await q).count ?? 0; };
      const { data: pays } = await sb.from("payments").select("amount_kobo").eq("status", "success");
      setC({
        students: await count("profiles", (q) => q.eq("role", "student")),
        courses: await count("courses"),
        attempts: await count("exam_attempts"),
        revenue: ((pays ?? []) as { amount_kobo: number }[]).reduce((a, p) => a + Number(p.amount_kobo), 0) / 100,
      });
    })();
  }, []);
  const cards = [
    { label: "Students", value: c.students, icon: Users }, { label: "Courses", value: c.courses, icon: BookOpen },
    { label: "Exam attempts", value: c.attempts, icon: HelpCircle }, { label: "Revenue", value: `₦${c.revenue.toLocaleString("en-NG")}`, icon: CreditCard },
  ];
  return (
    <>
      <PageHeader title="Admin overview" subtitle="Live figures from your database." />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map(({ label, value, icon: Icon }) => (
          <div key={label} className="card flex items-center gap-4 p-5"><span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-50 text-brand-600"><Icon size={22} /></span><div><p className="text-2xl font-extrabold">{value}</p><p className="text-xs text-slate-500">{label}</p></div></div>
        ))}
      </div>
    </>
  );
}
