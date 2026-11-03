"use client";

import { useCallback, useEffect, useState } from "react";
import { getSupabase } from "./supabase/client";

/** Loads rows with the signed-in admin's session (RLS enforces admin-only access). */
export function useRows<T = Record<string, unknown>>(table: string, select = "*", order?: { col: string; asc?: boolean }) {
  const [rows, setRows] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const reload = useCallback(async () => {
    const sb = getSupabase();
    if (!sb) { setRows([]); setLoading(false); return; }
    setLoading(true);
    let q = sb.from(table).select(select);
    if (order) q = q.order(order.col, { ascending: order.asc ?? false });
    const { data, error } = await q;
    setError(error?.message ?? "");
    setRows((data as unknown as T[]) ?? []);
    setLoading(false);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [table, select]);

  useEffect(() => { reload(); }, [reload]);
  return { rows, loading, error, reload };
}

export function PageHeader({ title, subtitle, action }: { title: string; subtitle?: string; action?: React.ReactNode }) {
  return (
    <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
      <div><h1 className="text-2xl font-extrabold">{title}</h1>{subtitle && <p className="mt-1 text-sm text-slate-500">{subtitle}</p>}</div>
      {action}
    </div>
  );
}

export function Empty({ text }: { text: string }) {
  return <p className="p-10 text-center text-sm text-slate-500">{text}</p>;
}
