"use client";

import { useEffect, useRef, useState } from "react";
import { Bot, Loader2, Send, Sparkles, Trash2, User } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { useContent } from "@/lib/content";
import { getSupabase } from "@/lib/supabase/client";

interface Msg { role: "user" | "assistant"; content: string; error?: boolean }

const SUGGESTIONS = [
  "Explain Ohm's law with a simple example",
  "What is the difference between a stack and a queue?",
  "Write a Python class for a robot that can move and turn",
  "How does a PID controller keep a robot on a line?",
];

export default function AiTutor() {
  const { user } = useAuth();
  const { courses: COURSES } = useContent();
  const key = `cre.tutor.${user?.id}`;
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [course, setCourse] = useState("");
  const end = useRef<HTMLDivElement>(null);

  useEffect(() => { try { setMsgs(JSON.parse(localStorage.getItem(key) || "[]")); } catch {} }, [key]);
  useEffect(() => { if (user) localStorage.setItem(key, JSON.stringify(msgs.filter((m) => !m.error).slice(-40))); end.current?.scrollIntoView({ behavior: "smooth" }); }, [msgs, key, user]);

  async function send(text: string) {
    const content = text.trim();
    if (!content || busy) return;
    const next: Msg[] = [...msgs, { role: "user", content }];
    setMsgs(next);
    setInput("");
    setBusy(true);
    try {
      const sb = getSupabase();
      const token = sb ? (await sb.auth.getSession()).data.session?.access_token : undefined;
      const res = await fetch("/api/ai-tutor", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        body: JSON.stringify({ messages: next.filter((m) => !m.error).slice(-12), course: course || undefined, level: user?.level }),
      });
      const data = await res.json();
      setMsgs([...next, res.ok ? { role: "assistant", content: data.reply } : { role: "assistant", content: data.error ?? "The tutor is unavailable right now.", error: true }]);
    } catch {
      setMsgs([...next, { role: "assistant", content: "Network error. Please try again.", error: true }]);
    } finally { setBusy(false); }
  }

  return (
    <div className="mx-auto flex h-[calc(100vh-9rem)] max-w-4xl flex-col lg:h-[calc(100vh-6rem)]">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3"><span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-500 to-accent-500 text-white"><Sparkles size={22} /></span><div><h1 className="text-xl font-extrabold">AI Academic Tutor</h1><p className="text-xs text-slate-500">Ask about your courses, code or robotics concepts.</p></div></div>
        <div className="flex gap-2">
          <select className="input w-auto py-2 text-xs" value={course} onChange={(e) => setCourse(e.target.value)} aria-label="Course context"><option value="">General</option>{COURSES.map((c) => <option key={c.code} value={c.code}>{c.code} — {c.title}</option>)}</select>
          <button className="btn-outline px-3 py-2" onClick={() => setMsgs([])} aria-label="Clear conversation" disabled={!msgs.length}><Trash2 size={16} /></button>
        </div>
      </div>

      <div className="card mt-4 flex-1 space-y-4 overflow-y-auto p-5" aria-live="polite">
        {msgs.length === 0 && (
          <div className="flex h-full flex-col items-center justify-center text-center">
            <Bot size={44} className="text-brand-500" />
            <p className="mt-3 font-bold">How can I help you study today?</p>
            <div className="mt-5 grid gap-2 sm:grid-cols-2">{SUGGESTIONS.map((s) => <button key={s} onClick={() => send(s)} className="rounded-xl border border-slate-200 p-3 text-left text-sm transition hover:border-brand-400 hover:bg-brand-50">{s}</button>)}</div>
          </div>
        )}
        {msgs.map((m, i) => (
          <div key={i} className={`flex gap-3 ${m.role === "user" ? "flex-row-reverse" : ""}`}>
            <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${m.role === "user" ? "bg-navy-900 text-white" : "bg-brand-50 text-brand-600"}`}>{m.role === "user" ? <User size={18} /> : <Bot size={18} />}</span>
            <div className={`max-w-[85%] whitespace-pre-wrap rounded-2xl px-4 py-3 text-sm leading-relaxed ${m.role === "user" ? "bg-brand-600 text-white" : m.error ? "bg-amber-50 text-amber-900" : "bg-slate-100"}`}>{m.content}</div>
          </div>
        ))}
        {busy && <div className="flex items-center gap-2 text-sm text-slate-500"><Loader2 size={16} className="animate-spin" /> Thinking…</div>}
        <div ref={end} />
      </div>

      <form className="mt-4 flex gap-2" onSubmit={(e) => { e.preventDefault(); send(input); }}>
        <input className="input" placeholder="Ask a question…" value={input} onChange={(e) => setInput(e.target.value)} maxLength={2000} aria-label="Your question" />
        <button className="btn-primary px-5" disabled={busy || !input.trim()} aria-label="Send"><Send size={18} /></button>
      </form>
    </div>
  );
}
