import "server-only";
import { COURSES } from "@/lib/data";
import { getAdminSupabase } from "@/lib/supabase/server";

export interface VerifyResult { ok: boolean; courseCode?: string; error?: string }

/**
 * Verifies a transaction directly with Paystack and checks status, currency and amount
 * against the price held on the server, then grants access. Idempotent.
 * Used by both the browser callback (/api/paystack/verify) and the signed webhook.
 */
export async function verifyAndGrant(reference: string): Promise<VerifyResult> {
  const secret = process.env.PAYSTACK_SECRET_KEY;
  if (!secret) return { ok: false, error: "Payments are not configured." };

  const res = await fetch(`https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`, {
    headers: { Authorization: `Bearer ${secret}` },
    cache: "no-store",
  });
  const json = await res.json();
  if (!res.ok || !json.status) return { ok: false, error: "Could not verify payment with Paystack." };
  const t = json.data;
  if (t.status !== "success") return { ok: false, error: `Payment ${t.status}.` };
  if (t.currency !== "NGN") return { ok: false, error: "Unexpected currency." };

  const admin = getAdminSupabase();
  if (admin) {
    const { data: pay } = await admin.from("payments").select("id, user_id, course_id, amount_kobo, status, courses(code)").eq("reference", reference).maybeSingle();
    if (!pay) return { ok: false, error: "Unknown payment reference." };
    if (Number(pay.amount_kobo) !== Number(t.amount)) return { ok: false, error: "Amount mismatch." };
    if (pay.status !== "success") {
      await admin.from("payments").update({ status: "success", paid_at: new Date().toISOString(), raw: t }).eq("id", pay.id);
      await admin.from("enrollments").upsert({ user_id: pay.user_id, course_id: pay.course_id, has_paid: true }, { onConflict: "user_id,course_id" });
    }
    const code = (pay.courses as unknown as { code?: string } | null)?.code;
    return { ok: true, courseCode: code };
  }

  // No database (demo): check the amount against the sample catalogue.
  const code = t.metadata?.courseCode as string | undefined;
  const c = COURSES.find((x) => x.code === code);
  if (!c || c.price * 100 !== Number(t.amount)) return { ok: false, error: "Amount mismatch." };
  return { ok: true, courseCode: c.code };
}
