"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, ClipboardList, Download, Upload } from "lucide-react";
import { COURSES, MATERIALS } from "@/lib/data";
import { useAuth } from "@/lib/auth";
import { useProgress } from "@/lib/progress";

interface Sub { id: string; text: string; fileName?: string; at: string }

/** Assignments are the "Assignment" study materials. Submissions are saved per student in this browser until the DB is connected. */
export default function Assignments() {
  const { user } = useAuth();
  const { enrolled } = useProgress();
  const key = `cre.assignments.${user?.id}`;
  const [subs, setSubs] = useState<Record<string, Sub>>({});
  const [open, setOpen] = useState<string | null>(null);
  const [text, setText] = useState("");
  const [file, setFile] = useState<File | null>(null);

  useEffect(() => { try { setSubs(JSON.parse(localStorage.getItem(key) || "{}")); } catch {} }, [key]);

  const items = MATERIALS.filter((m) => m.kind === "Assignment");
  const submit = (id: string) => {
    const next = { ...subs, [id]: { id, text, fileName: file?.name, at: new Date().toISOString() } };
    setSubs(next);
    localStorage.setItem(key, JSON.stringify(next));
    setOpen(null); setText(""); setFile(null);
  };

  return (
    <div>
      <h1 className="text-2xl font-extrabold">Assignments</h1>
      <p className="mt-1 text-sm text-slate-500">Submit your work before the deadline set by your lecturer.</p>
      <div className="mt-6 space-y-4">
        {items.map((a) => {
          const c = COURSES.find((x) => x.code === a.course)!;
          const sub = subs[a.id];
          return (
            <div key={a.id} className="card p-5">
              <div className="flex flex-wrap items-center gap-4">
                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-50 text-amber-600"><ClipboardList size={20} /></span>
                <div className="min-w-0 flex-1"><p className="font-semibold">{a.title}</p><p className="text-xs text-slate-500">{a.course} · {c.title}{!enrolled.includes(a.course) && " · not enrolled"}</p></div>
                {sub ? <span className="badge gap-1 bg-emerald-50 text-emerald-700"><CheckCircle2 size={13} /> Submitted</span> : <button className="btn-primary px-4 py-2 text-xs" onClick={() => setOpen(open === a.id ? null : a.id)}><Upload size={14} /> Submit</button>}
              </div>
              {open === a.id && (
                <div className="mt-4 space-y-3 border-t border-slate-100 pt-4">
                  <textarea className="input" rows={4} placeholder="Write your answer or notes…" value={text} onChange={(e) => setText(e.target.value)} aria-label="Answer" />
                  <input type="file" onChange={(e) => setFile(e.target.files?.[0] ?? null)} className="block w-full text-sm" aria-label="Attach a file" />
                  <button className="btn-primary" disabled={!text.trim() && !file} onClick={() => submit(a.id)}>Submit assignment</button>
                </div>
              )}
              {sub && <p className="mt-3 text-xs text-slate-500">Submitted {new Date(sub.at).toLocaleString()}{sub.fileName && ` · ${sub.fileName}`}</p>}
            </div>
          );
        })}
      </div>
    </div>
  );
}
