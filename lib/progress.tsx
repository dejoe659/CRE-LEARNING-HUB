"use client";

import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { useAuth } from "./auth";
import { useContent } from "./content";
import { getSupabase } from "./supabase/client";

export interface ExamResult {
  id: string;
  courseCode: string;
  title: string;
  score: number;
  total: number;
  percent: number;
  takenAt: string;
  durationSec: number;
}

interface State {
  enrolled: string[]; // course codes
  paid: string[]; // premium course codes unlocked
  completed: string[]; // lesson ids
  positions: Record<string, number>; // lesson id -> seconds
  recent: { lessonId: string; courseCode: string; at: string }[];
  results: ExamResult[]; // demo mode only; real results are read from exam_attempts
}

const empty: State = { enrolled: [], paid: [], completed: [], positions: {}, recent: [], results: [] };
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

interface Ctx extends State {
  enroll: (code: string) => void;
  unlock: (code: string) => void;
  markComplete: (lessonId: string, done?: boolean) => void;
  savePosition: (lessonId: string, seconds: number) => void;
  touch: (lessonId: string, courseCode: string) => void;
  addResult: (r: Omit<ExamResult, "id" | "takenAt">) => void;
}

const C = createContext<Ctx | null>(null);

/**
 * Progress lives in the browser for speed. With Supabase configured it is also saved to the database
 * (enrollments, lesson_progress), so it follows the student across devices. Paid access is always
 * read from the database — only the server (Paystack verification) can grant it.
 */
export function ProgressProvider({ children }: { children: React.ReactNode }) {
  const { user, demo } = useAuth();
  const { byCode, courses } = useContent();
  const key = user ? `cre.progress.${user.id}` : null;
  const [state, setState] = useState<State>(empty);
  const [ready, setReady] = useState(false);
  const saveTimers = useRef<Record<string, ReturnType<typeof setTimeout>>>({});

  // Load local copy
  useEffect(() => {
    setReady(false);
    if (!key) { setState(empty); return; }
    try {
      const raw = localStorage.getItem(key);
      setState(raw ? { ...empty, ...JSON.parse(raw) } : empty);
    } catch { setState(empty); }
    setReady(true);
  }, [key]);

  useEffect(() => {
    if (key && ready) localStorage.setItem(key, JSON.stringify(state));
  }, [state, key, ready]);

  // Merge in server copy (real mode)
  useEffect(() => {
    if (demo || !user || !ready || courses.length === 0) return;
    const sb = getSupabase();
    if (!sb) return;
    let alive = true;
    (async () => {
      const [en, lp] = await Promise.all([
        sb.from("enrollments").select("has_paid, courses(code)").eq("user_id", user.id),
        sb.from("lesson_progress").select("lesson_id, position_sec, completed").eq("user_id", user.id),
      ]);
      if (!alive) return;
      setState((s) => {
        const enrolled = new Set(s.enrolled);
        const paid = new Set<string>(); // paid comes ONLY from the server
        ((en.data ?? []) as unknown as { has_paid: boolean; courses: { code: string } | null }[]).forEach((r) => {
          if (r.courses?.code) { enrolled.add(r.courses.code); if (r.has_paid) paid.add(r.courses.code); }
        });
        const completed = new Set(s.completed);
        const positions = { ...s.positions };
        ((lp.data ?? []) as { lesson_id: string; position_sec: number; completed: boolean }[]).forEach((r) => {
          if (r.completed) completed.add(r.lesson_id);
          positions[r.lesson_id] = Math.max(positions[r.lesson_id] ?? 0, r.position_sec);
        });
        return { ...s, enrolled: [...enrolled], paid: [...paid], completed: [...completed], positions };
      });
    })();
    return () => { alive = false; };
  }, [demo, user, ready, courses.length]);

  const pushProgress = useCallback((lessonId: string, patch: { position_sec?: number; completed?: boolean }) => {
    if (demo || !user || !UUID.test(lessonId)) return;
    const sb = getSupabase();
    if (!sb) return;
    clearTimeout(saveTimers.current[lessonId]);
    saveTimers.current[lessonId] = setTimeout(() => {
      sb.from("lesson_progress").upsert({ user_id: user.id, lesson_id: lessonId, updated_at: new Date().toISOString(), ...patch }, { onConflict: "user_id,lesson_id" }).then(() => {});
    }, 800);
  }, [demo, user]);

  const enroll = useCallback((code: string) => {
    setState((s) => (s.enrolled.includes(code) ? s : { ...s, enrolled: [...s.enrolled, code] }));
    const course = byCode(code);
    const sb = getSupabase();
    if (!demo && user && course?.id && sb && !course.premium)
      sb.from("enrollments").upsert({ user_id: user.id, course_id: course.id, has_paid: false }, { onConflict: "user_id,course_id", ignoreDuplicates: true }).then(() => {});
  }, [byCode, demo, user]);

  /** Local unlock — used only in demo mode or right after a verified payment. Real access is enforced by the database. */
  const unlock = useCallback((code: string) => setState((s) => ({ ...s, paid: s.paid.includes(code) ? s.paid : [...s.paid, code], enrolled: s.enrolled.includes(code) ? s.enrolled : [...s.enrolled, code] })), []);

  const markComplete = useCallback((lessonId: string, done = true) => {
    setState((s) => ({ ...s, completed: done ? Array.from(new Set([...s.completed, lessonId])) : s.completed.filter((x) => x !== lessonId) }));
    pushProgress(lessonId, { completed: done });
  }, [pushProgress]);

  const savePosition = useCallback((lessonId: string, seconds: number) => {
    setState((s) => ({ ...s, positions: { ...s.positions, [lessonId]: seconds } }));
    pushProgress(lessonId, { position_sec: Math.floor(seconds) });
  }, [pushProgress]);

  const touch = useCallback((lessonId: string, courseCode: string) => setState((s) => ({ ...s, recent: [{ lessonId, courseCode, at: new Date().toISOString() }, ...s.recent.filter((r) => r.lessonId !== lessonId)].slice(0, 8) })), []);
  const addResult = useCallback((r: Omit<ExamResult, "id" | "takenAt">) => setState((s) => ({ ...s, results: [{ ...r, id: crypto.randomUUID(), takenAt: new Date().toISOString() }, ...s.results] })), []);

  return <C.Provider value={{ ...state, enroll, unlock, markComplete, savePosition, touch, addResult }}>{children}</C.Provider>;
}

export const useProgress = () => {
  const c = useContext(C);
  if (!c) throw new Error("useProgress must be used inside <ProgressProvider>");
  return c;
};
