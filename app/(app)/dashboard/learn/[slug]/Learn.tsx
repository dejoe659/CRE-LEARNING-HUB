"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  CheckCircle2, ChevronLeft, ChevronRight, Circle, Download, FileText, HelpCircle, Lock, PlayCircle, Target, Wrench,
} from "lucide-react";
import VideoPlayer from "@/components/VideoPlayer";
import QuizRunner from "@/components/QuizRunner";
import { courseSlug, flatLessons, fmtDuration, formatNaira, getCourse } from "@/lib/data";
import { useProgress } from "@/lib/progress";
import { courseProgress } from "@/lib/stats";

type Tab = "overview" | "objectives" | "notes" | "practical" | "quiz";

export default function Learn({ slug }: { slug: string }) {
  const course = getCourse(slug)!;
  const router = useRouter();
  const sp = useSearchParams();
  const { completed, positions, paid, enroll, markComplete, savePosition, touch, addResult } = useProgress();
  const lessons = useMemo(() => flatLessons(course), [course]);
  const lessonId = sp.get("lesson") ?? (lessons.find((l) => !completed.includes(l.id)) ?? lessons[0]).id;
  const idx = Math.max(0, lessons.findIndex((l) => l.id === lessonId));
  const lesson = lessons[idx];
  const module = course.modules.find((m) => m.id === lesson.moduleId)!;
  const [tab, setTab] = useState<Tab>("overview");
  const [startAt, setStartAt] = useState(0);
  const locked = course.premium && !paid.includes(course.code);

  // Resume position is captured once per lesson so autosave doesn't re-trigger it.
  useEffect(() => {
    setStartAt(positions[lesson.id] ?? 0);
    const t = sp.get("tab");
    setTab(t === "quiz" ? "quiz" : "overview");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lesson.id, sp.get("tab")]);

  useEffect(() => {
    if (!locked) {
      enroll(course.code);
      touch(lesson.id, course.code);
    }
  }, [lesson.id, locked, course.code, enroll, touch]);

  const go = useCallback(
    (id: string, t?: Tab) => router.push(`/dashboard/learn/${slug}?lesson=${id}${t ? `&tab=${t}` : ""}`, { scroll: false }),
    [router, slug]
  );
  const onSave = useCallback((s: number) => savePosition(lesson.id, s), [savePosition, lesson.id]);
  const onEnded = useCallback(() => markComplete(lesson.id, true), [markComplete, lesson.id]);

  if (locked)
    return (
      <div className="card mx-auto mt-10 max-w-lg p-10 text-center">
        <Lock className="mx-auto text-amber-500" size={44} />
        <h1 className="mt-4 text-xl font-extrabold">{course.title} is a premium course</h1>
        <p className="mt-2 text-sm text-slate-500">Unlock all lessons, notes and exams for {formatNaira(course.price)}.</p>
        <Link href={`/courses/${slug}`} className="btn-primary mt-6">View course &amp; pay</Link>
      </div>
    );

  const isDone = completed.includes(lesson.id);
  const prev = lessons[idx - 1];
  const next = lessons[idx + 1];
  const pct = courseProgress(course, completed);

  const downloadNotes = () => {
    const text = `# ${course.code}: ${course.title}\n## ${lesson.title}\n\n${lesson.summary}\n\n### Learning objectives\n${lesson.objectives.map((o) => `- ${o}`).join("\n")}\n\n### Practical example\n${lesson.example}\n`;
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([text], { type: "text/markdown" }));
    a.download = `${courseSlug(course.code)}-${lesson.title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-notes.md`;
    a.click();
    URL.revokeObjectURL(a.href);
  };

  const tabs: { id: Tab; label: string; icon: typeof Target }[] = [
    { id: "overview", label: "Overview", icon: PlayCircle },
    { id: "objectives", label: "Objectives", icon: Target },
    { id: "notes", label: "Notes", icon: FileText },
    { id: "practical", label: "Practical", icon: Wrench },
    { id: "quiz", label: "Topic quiz", icon: HelpCircle },
  ];

  return (
    <div className="grid gap-6 xl:grid-cols-[1fr_360px]">
      <div className="min-w-0 space-y-5">
        <nav className="flex items-center gap-1 text-xs text-slate-500" aria-label="Breadcrumb">
          <Link href="/dashboard/my-courses" className="hover:text-brand-600">My courses</Link><ChevronRight size={12} />
          <Link href={`/courses/${slug}`} className="hover:text-brand-600">{course.code}</Link><ChevronRight size={12} />
          <span className="text-slate-800">{lesson.title}</span>
        </nav>

        <VideoPlayer key={lesson.id} lesson={lesson} startAt={startAt} onSave={onSave} onEnded={onEnded} />

        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-brand-600">{module.title}</p>
            <h1 className="text-xl font-extrabold sm:text-2xl">{lesson.title}</h1>
            <p className="text-xs text-slate-500">Lesson {idx + 1} of {lessons.length} · {fmtDuration(lesson.duration)}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button className="btn-outline" disabled={!prev} onClick={() => prev && go(prev.id)}><ChevronLeft size={16} /> Previous</button>
            <button className={isDone ? "btn bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200" : "btn-dark"} onClick={() => markComplete(lesson.id, !isDone)} aria-pressed={isDone}>
              {isDone ? <CheckCircle2 size={16} /> : <Circle size={16} />} {isDone ? "Completed" : "Mark as completed"}
            </button>
            <button className="btn-primary" disabled={!next} onClick={() => next && go(next.id)}>Next lesson <ChevronRight size={16} /></button>
          </div>
        </div>

        <div className="card">
          <div className="flex gap-1 overflow-x-auto border-b border-slate-100 p-2" role="tablist">
            {tabs.map(({ id, label, icon: Icon }) => (
              <button key={id} role="tab" aria-selected={tab === id} onClick={() => setTab(id)}
                className={`flex shrink-0 items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition ${tab === id ? "bg-brand-50 text-brand-700" : "text-slate-500 hover:bg-slate-50"}`}>
                <Icon size={16} /> {label}
              </button>
            ))}
          </div>
          <div className="p-6" role="tabpanel">
            {tab === "overview" && (<><h2 className="font-bold">About this lesson</h2><p className="mt-2 text-sm leading-relaxed text-slate-600">{lesson.summary}</p>
              {!lesson.videoUrl && <p className="mt-4 rounded-xl bg-brand-50 p-3 text-xs text-brand-800">This lesson currently uses the built-in animated explainer. Administrators can replace it with an uploaded video.</p>}</>)}
            {tab === "objectives" && (<><h2 className="font-bold">By the end you will be able to</h2><ul className="mt-3 space-y-2">{lesson.objectives.map((o) => <li key={o} className="flex gap-2 text-sm text-slate-700"><CheckCircle2 size={18} className="shrink-0 text-emerald-500" />{o}</li>)}</ul></>)}
            {tab === "notes" && (<><h2 className="font-bold">Lesson notes</h2><p className="mt-2 text-sm leading-relaxed text-slate-600">{lesson.summary}</p><button className="btn-outline mt-4" onClick={downloadNotes}><Download size={16} /> Download notes</button>
              <p className="mt-3 text-xs text-slate-500">More lecture notes and PDFs for this course are in <Link href={`/dashboard/materials?course=${slug}`} className="font-semibold text-brand-600 hover:underline">Study Materials</Link>.</p></>)}
            {tab === "practical" && (<><h2 className="font-bold">Practical example</h2><pre className="mt-3 overflow-x-auto whitespace-pre-wrap rounded-xl bg-navy-900 p-4 text-sm text-slate-100">{lesson.example}</pre><p className="mt-3 text-xs text-slate-500">Try it yourself, then ask the <Link href="/dashboard/ai-tutor" className="font-semibold text-brand-600 hover:underline">AI Tutor</Link> if you get stuck.</p></>)}
            {tab === "quiz" && (
              <QuizRunner key={module.id} title={`${module.title} — quiz`} questions={module.quiz}
                onFinish={(o) => addResult({ courseCode: course.code, title: `${module.title} quiz`, score: o.score, total: o.total, percent: o.percent, durationSec: o.durationSec })} />
            )}
          </div>
        </div>
      </div>

      <aside className="xl:sticky xl:top-6 xl:self-start">
        <div className="card overflow-hidden">
          <div className="border-b border-slate-100 p-5">
            <h2 className="font-bold">{course.code}: {course.title}</h2>
            <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-100"><div className="h-full rounded-full bg-brand-600 transition-all" style={{ width: `${pct}%` }} /></div>
            <p className="mt-1 text-xs text-slate-500">{pct}% complete</p>
          </div>
          <div className="max-h-[560px] overflow-y-auto">
            {course.modules.map((m, i) => (
              <div key={m.id}>
                <p className="bg-slate-50 px-5 py-2.5 text-xs font-bold uppercase tracking-wide text-slate-500">Module {i + 1}: {m.title}</p>
                <ul>
                  {m.lessons.map((l) => {
                    const active = l.id === lesson.id;
                    return (
                      <li key={l.id}>
                        <button onClick={() => go(l.id)} aria-current={active ? "true" : undefined}
                          className={`flex w-full items-center gap-3 px-5 py-3 text-left text-sm transition ${active ? "bg-brand-50" : "hover:bg-slate-50"}`}>
                          {completed.includes(l.id) ? <CheckCircle2 size={18} className="shrink-0 text-emerald-500" /> : active ? <PlayCircle size={18} className="shrink-0 text-brand-600" /> : <Circle size={18} className="shrink-0 text-slate-300" />}
                          <span className={`flex-1 ${active ? "font-semibold text-brand-700" : ""}`}>{l.title}</span>
                          <span className="text-xs text-slate-400">{fmtDuration(l.duration)}</span>
                        </button>
                      </li>
                    );
                  })}
                  <li>
                    <button onClick={() => go(m.lessons[m.lessons.length - 1].id, "quiz")} className="flex w-full items-center gap-3 px-5 py-3 text-left text-sm text-slate-500 hover:bg-slate-50">
                      <HelpCircle size={18} className="shrink-0" /> Module quiz · {m.quiz.length} questions
                    </button>
                  </li>
                </ul>
              </div>
            ))}
          </div>
        </div>
      </aside>
    </div>
  );
}
