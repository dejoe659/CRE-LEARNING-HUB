import { NextResponse } from "next/server";
import { clientIp, getAdminSupabase, rateLimit } from "@/lib/server/helpers";

export const runtime = "nodejs";

export async function POST(req: Request) {
  if (!rateLimit(`contact:${clientIp(req)}`, 5, 10 * 60_000))
    return NextResponse.json({ error: "Too many messages. Please try again later." }, { status: 429 });

  let b: { name?: string; email?: string; message?: string };
  try { b = await req.json(); } catch { return NextResponse.json({ error: "Invalid request." }, { status: 400 }); }
  const name = (b.name ?? "").trim().slice(0, 120);
  const email = (b.email ?? "").trim().slice(0, 200);
  const message = (b.message ?? "").trim().slice(0, 4000);
  if (!name || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email) || message.length < 10)
    return NextResponse.json({ error: "Please complete all fields." }, { status: 400 });

  const sb = getAdminSupabase();
  if (!sb) return NextResponse.json({ error: "Messaging is not configured yet (database not connected)." }, { status: 503 });
  const { error } = await sb.from("contact_messages").insert({ name, email, message });
  if (error) return NextResponse.json({ error: "Could not save your message. Please try again." }, { status: 500 });
  return NextResponse.json({ ok: true });
}
