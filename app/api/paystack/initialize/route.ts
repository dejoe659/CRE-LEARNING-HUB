import { NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { COURSES } from "@/lib/data";
import { getAdminSupabase, getRequestUser, rateLimit } from "@/lib/server/helpers";

export const runtime = "nodejs";

/**
 * Starts a Paystack transaction.
 * The price ALWAYS comes from the server (database, or the sample catalogue) — never from the browser.
 */
export async function POST(req: Request) {
  const secret = process.env.PAYSTACK_SECRET_KEY;
  if (!secret)
    return NextResponse.json({ error: "Payments are not configured yet (PAYSTACK_SECRET_KEY missing on the server).", configured: false }, { status: 503 });

  const { user, demo } = await getRequestUser(req);
  if (!user && !demo) return NextResponse.json({ error: "Please log in to continue." }, { status: 401 });
  if (!rateLimit(`pay:${user?.id ?? "demo"}`, 10, 60_000)) return NextResponse.json({ error: "Too many attempts. Please wait." }, { status: 429 });

  let b: { courseCode?: string; email?: string };
  try { b = await req.json(); } catch { return NextResponse.json({ error: "Invalid request." }, { status: 400 }); }
  const email = user?.email ?? b.email;
  if (!b.courseCode || !email) return NextResponse.json({ error: "Missing course or email." }, { status: 400 });

  // Resolve price server-side
  const admin = getAdminSupabase();
  let price: number | null = null;
  let courseId: string | null = null;
  if (admin) {
    const { data } = await admin.from("courses").select("id, price_ngn, is_premium").eq("code", b.courseCode).maybeSingle();
    if (data?.is_premium) { price = Number(data.price_ngn); courseId = data.id; }
  } else {
    const c = COURSES.find((x) => x.code === b.courseCode);
    if (c?.premium) price = c.price;
  }
  if (!price || price <= 0) return NextResponse.json({ error: "This course is free or does not exist." }, { status: 400 });

  const reference = `CRE-${randomUUID()}`;
  if (admin && user && courseId) {
    const { error } = await admin.from("payments").insert({ user_id: user.id, course_id: courseId, reference, amount_kobo: price * 100, currency: "NGN", status: "pending" });
    if (error) return NextResponse.json({ error: "Could not record payment." }, { status: 500 });
  }

  const origin = process.env.NEXT_PUBLIC_SITE_URL ?? new URL(req.url).origin;
  const res = await fetch("https://api.paystack.co/transaction/initialize", {
    method: "POST",
    headers: { Authorization: `Bearer ${secret}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      email, amount: price * 100, currency: "NGN", reference,
      callback_url: `${origin}/dashboard/payment/callback`,
      metadata: { courseCode: b.courseCode, userId: user?.id ?? null },
    }),
  });
  const data = await res.json();
  if (!res.ok || !data.status) return NextResponse.json({ error: "Paystack could not start the payment." }, { status: 502 });
  return NextResponse.json({ authorization_url: data.data.authorization_url, reference });
}
