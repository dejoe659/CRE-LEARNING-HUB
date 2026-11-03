import { NextResponse } from "next/server";
import { verifyAndGrant } from "@/lib/server/paystack";
import { rateLimit } from "@/lib/server/helpers";

export const runtime = "nodejs";

export async function GET(req: Request) {
  const reference = new URL(req.url).searchParams.get("reference");
  if (!reference || !/^CRE-[0-9a-f-]{36}$/i.test(reference)) return NextResponse.json({ ok: false, error: "Invalid reference." }, { status: 400 });
  if (!rateLimit(`verify:${reference}`, 10, 60_000)) return NextResponse.json({ ok: false, error: "Too many requests." }, { status: 429 });
  const r = await verifyAndGrant(reference);
  return NextResponse.json(r, { status: r.ok ? 200 : 402 });
}
