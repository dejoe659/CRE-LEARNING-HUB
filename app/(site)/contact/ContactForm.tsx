"use client";

import { useState } from "react";
import { CheckCircle2, Loader2 } from "lucide-react";

export default function ContactForm() {
  const [state, setState] = useState<"idle" | "sending" | "done" | "error">("idle");
  const [error, setError] = useState("");

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    setState("sending");
    const body = Object.fromEntries(new FormData(form));
    try {
      const res = await fetch("/api/contact", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Could not send message.");
      setState("done");
      form.reset();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not send message.");
      setState("error");
    }
  }

  if (state === "done")
    return (
      <div className="card flex flex-col items-center justify-center p-10 text-center">
        <CheckCircle2 className="text-emerald-500" size={44} />
        <h2 className="mt-3 text-xl font-bold">Message sent</h2>
        <p className="mt-1 text-sm text-slate-500">Thank you — we&apos;ll get back to you by email.</p>
        <button className="btn-outline mt-5" onClick={() => setState("idle")}>Send another</button>
      </div>
    );

  return (
    <form onSubmit={onSubmit} className="card space-y-4 p-6">
      <div><label className="label" htmlFor="name">Full name</label><input id="name" name="name" required className="input" /></div>
      <div><label className="label" htmlFor="email">Email</label><input id="email" name="email" type="email" required className="input" /></div>
      <div><label className="label" htmlFor="message">Message</label><textarea id="message" name="message" required rows={5} minLength={10} className="input" /></div>
      {state === "error" && <p className="text-sm text-rose-600" role="alert">{error}</p>}
      <button className="btn-primary w-full" disabled={state === "sending"}>
        {state === "sending" && <Loader2 size={16} className="animate-spin" />} Send message
      </button>
    </form>
  );
}
