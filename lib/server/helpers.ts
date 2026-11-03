import "server-only";
import { createClient } from "@supabase/supabase-js";
import { getAdminSupabase } from "@/lib/supabase/server";

export interface ServerUser { id: string; email: string; role: string }

/**
 * Resolves the signed-in user from an `Authorization: Bearer <supabase access token>` header.
 * Returns:
 *  - { user }                 when Supabase is configured and the token is valid
 *  - { user: null, demo: true } when Supabase is NOT configured (local demo mode)
 *  - { user: null }           when Supabase is configured but the token is missing/invalid
 */
export async function getRequestUser(req: Request): Promise<{ user: ServerUser | null; demo?: boolean }> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anon) return { user: null, demo: true };
  const token = req.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
  if (!token) return { user: null };
  const sb = createClient(url, anon, { auth: { persistSession: false }, global: { headers: { Authorization: `Bearer ${token}` } } });
  const { data, error } = await sb.auth.getUser(token);
  if (error || !data.user) return { user: null };
  const { data: p } = await sb.from("profiles").select("role").eq("id", data.user.id).maybeSingle();
  return { user: { id: data.user.id, email: data.user.email ?? "", role: p?.role ?? "student" } };
}

export { getAdminSupabase };

/** Very small in-memory rate limiter (per server instance). Use Upstash/Redis in multi-instance production. */
const hits = new Map<string, number[]>();
export function rateLimit(key: string, max: number, windowMs: number) {
  const now = Date.now();
  const arr = (hits.get(key) ?? []).filter((t) => now - t < windowMs);
  if (arr.length >= max) return false;
  arr.push(now);
  hits.set(key, arr);
  return true;
}

export const clientIp = (req: Request) => req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "local";
