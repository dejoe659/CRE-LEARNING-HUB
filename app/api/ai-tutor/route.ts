import { NextResponse } from "next/server";
import { clientIp, getRequestUser, rateLimit } from "@/lib/server/helpers";

export const runtime = "nodejs";

const SYSTEM = `You are the CRE Learning Hub academic tutor for Computer and Robotics Education students (100–400 level) in Nigeria.
- Explain clearly with short examples, analogies and step-by-step reasoning.
- For programming questions give correct, commented code and explain it.
- For robotics/electronics, include formulas with units and a worked example.
- Encourage understanding rather than just giving final answers to graded work; if a student asks you to do an assignment for them, guide them instead.
- Be honest when unsure. Keep answers focused.`;

export async function POST(req: Request) {
  const key = process.env.ANTHROPIC_API_KEY;
  if (!key)
    return NextResponse.json(
      { error: "The AI tutor is not configured yet. An administrator must set ANTHROPIC_API_KEY on the server.", configured: false },
      { status: 503 }
    );

  const { user, demo } = await getRequestUser(req);
  if (!user && !demo) return NextResponse.json({ error: "Please log in to use the AI tutor." }, { status: 401 });
  if (!rateLimit(`ai:${user?.id ?? clientIp(req)}`, 20, 60_000))
    return NextResponse.json({ error: "You're asking very quickly — please wait a moment." }, { status: 429 });

  let body: { messages?: { role: string; content: string }[]; course?: string; level?: number };
  try { body = await req.json(); } catch { return NextResponse.json({ error: "Invalid request." }, { status: 400 }); }

  const messages = (body.messages ?? [])
    .filter((m) => (m.role === "user" || m.role === "assistant") && typeof m.content === "string" && m.content.trim())
    .slice(-12)
    .map((m) => ({ role: m.role as "user" | "assistant", content: m.content.slice(0, 4000) }));
  if (!messages.length || messages[messages.length - 1].role !== "user")
    return NextResponse.json({ error: "No question provided." }, { status: 400 });

  const context = `${body.course ? `The student is asking about course ${String(body.course).slice(0, 20)}. ` : ""}${body.level ? `Student level: ${Number(body.level)} Level.` : ""}`;

  try {
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: { "content-type": "application/json", "x-api-key": key, "anthropic-version": "2023-06-01" },
      body: JSON.stringify({ model: process.env.AI_MODEL ?? "claude-sonnet-5-5", max_tokens: 1200, system: `${SYSTEM}\n${context}`, messages }),
    });
    if (!res.ok) return NextResponse.json({ error: "The AI service returned an error. Please try again shortly." }, { status: 502 });
    const data = await res.json();
    const reply = (data.content ?? []).filter((b: { type: string }) => b.type === "text").map((b: { text: string }) => b.text).join("\n");
    return NextResponse.json({ reply: reply || "I couldn't generate an answer. Please rephrase your question." });
  } catch {
    return NextResponse.json({ error: "Could not reach the AI service." }, { status: 502 });
  }
}
