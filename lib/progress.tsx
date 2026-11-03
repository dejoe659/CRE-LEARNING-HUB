"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { useAuth } from "./auth";

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
  results: ExamResult[];
}

const empty: State = { enrolled: [], paid: [], completed: [], positions: {}, recent: [], results: [] };

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
 * Progress is stored per-user in the browser (localStorage) so the experience works
 * offline and without a backend. The Supabase schema in /supabase/migrations contains the
 * matching tables (enrollments, lesson_progress, exam_attempts) with RLS for server sync.
 */
export function ProgressProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const key = user ? `cre.progress.${user.id}` : null;
  const [state, setState] = useState<State>(empty);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setReady(false);
    if (!key) {
      setState(empty);
      return;
    }
    try {
      const raw = localStorage.getItem(key);
      setState(raw ? { ...empty, ...JSON.parse(raw) } : empty);
    } catch {
      setState(empty);
    }
    setReady(true);
  }, [key]);

  useEffect(() => {
    if (key && ready) localStorage.setItem(key, JSON.stringify(state));
  }, [state, key, ready]);

  const enroll = useCallback((code: string) => setState((s) => (s.enrolled.includes(code) ? s : { ...s, enrolled: [...s.enrolled, code] })), []);
  const unlock = useCallback((code: string) => setState((s) => ({ ...s, paid: s.paid.includes(code) ? s.paid : [...s.paid, code], enrolled: s.enrolled.includes(code) ? s.enrolled : [...s.enrolled, code] })), []);
  const markComplete = useCallback((lessonId: string, done = true) => setState((s) => ({ ...s, completed: done ? Array.from(new Set([...s.completed, lessonId])) : s.completed.filter((x) => x !== lessonId) })), []);
  const savePosition = useCallback((lessonId: string, seconds: number) => setState((s) => ({ ...s, positions: { ...s.positions, [lessonId]: seconds } })), []);
  const touch = useCallback((lessonId: string, courseCode: string) => setState((s) => ({ ...s, recent: [{ lessonId, courseCode, at: new Date().toISOString() }, ...s.recent.filter((r) => r.lessonId !== lessonId)].slice(0, 8) })), []);
  const addResult = useCallback((r: Omit<ExamResult, "id" | "takenAt">) => setState((s) => ({ ...s, results: [{ ...r, id: crypto.randomUUID(), takenAt: new Date().toISOString() }, ...s.results] })), []);

  return <C.Provider value={{ ...state, enroll, unlock, markComplete, savePosition, touch, addResult }}>{children}</C.Provider>;
}

export const useProgress = () => {
  const c = useContext(C);
  if (!c) throw new Error("useProgress must be used inside <ProgressProvider>");
  return c;
};
