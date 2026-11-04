"use client";

import { useEffect, useState } from "react";
import { MATERIALS } from "./data";
import { useContent } from "./content";
import { getSupabase } from "./supabase/client";

export interface MaterialItem { id: string; course: string; title: string; kind: string; size?: string; filePath?: string }

/** Study materials: the `materials` table (RLS-filtered to courses the student can access), or samples in demo mode. */
export function useMaterials() {
  const { sample } = useContent();
  const [items, setItems] = useState<MaterialItem[]>([]);
  const [loading, setLoading] = useState(!sample);

  useEffect(() => {
    if (sample) return;
    const sb = getSupabase();
    if (!sb) return;
    let alive = true;
    (async () => {
      const { data } = await sb.from("materials").select("id,kind,title,file_path,courses(code)").order("created_at", { ascending: false });
      if (!alive) return;
      setItems(
        ((data ?? []) as unknown as { id: string; kind: string; title: string; file_path: string; courses: { code: string } | null }[]).map((m) => ({
          id: m.id, course: m.courses?.code ?? "", title: m.title, kind: m.kind, filePath: m.file_path,
        }))
      );
      setLoading(false);
    })();
    return () => { alive = false; };
  }, [sample]);

  return { materials: sample ? (MATERIALS as MaterialItem[]) : items, loading, sample };
}

/** Opens a private material through a short-lived signed URL. */
export async function openMaterial(filePath: string): Promise<string | null> {
  const sb = getSupabase();
  if (!sb) return null;
  const { data } = await sb.storage.from("materials").createSignedUrl(filePath, 300);
  return data?.signedUrl ?? null;
}
