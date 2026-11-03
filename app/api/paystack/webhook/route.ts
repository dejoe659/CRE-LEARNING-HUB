import { NextResponse } from "next/server";
import { createHmac, timingSafeEqual } from "crypto";
import { verifyAndGrant } from "@/lib/server/paystack";

export const runtime = "nodejs";

/** Paystack webhook — set this URL in your Paystack dashboard. Requests are authenticated by HMAC-SHA512 signature. */
export async function POST(req: Request) {
  const secret = process.env.PAYSTACK_SECRET_KEY;
  if (!secret) return NextResponse.json({ error: "not configured" }, { status: 503 });

  const raw = await req.text();
  const sig = req.headers.get("x-paystack-signature") ?? "";
  const expected = createHmac("sha512", secret).update(raw).digest("hex");
  const a = Buffer.from(sig);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return NextResponse.json({ error: "invalid signature" }, { status: 401 });

  const event = JSON.parse(raw);
  if (event.event === "charge.success" && event.data?.reference) await verifyAndGrant(event.data.reference);
  return NextResponse.json({ received: true });
}
