"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { COURSES as SAMPLE_COURSES, Course, Lesson, courseSlug } from "./data";
import { getSupabase, isSupabaseConfigured } from "./supabase/client";

export interface SiteSettings {
  hero_title: string;
  hero_subtitle: string;
  announcement: string;
  support_email: string;
}

export const DEFAULT_SETTINGS: SiteSettings = {
  hero_title: "Transforming the Way You Learn Computer and Robotics Education.",
  hero_subtitle:
    "Understand every course through animated visual explanations, hands-on practical examples, downloadable notes, quizzes and examinations — all in one modern learning platform.",
  announcement: "",
  support_email: "",
};

interface Ctx {
  /** Real courses from the database. When Supabase is not configured, the built-in sample courses (demo mode). */
  courses: Course[];
  settings: SiteSettings;
  loading: boolean;
  /** true when showing built-in sample courses */
  sample: boolean;
  bySlug: (slug: string) => Course | undefined;
  byCode: (code: string) => Course | undefined;
  reload: () => void;
}

const C = createContext<Ctx | null>(null);

/** Picks one of the built-in animated explainer scenes from the lesson title. */
function sceneFor(title: string): Lesson["scene"] {
  const t = title.toLowerCase();
  if (/circuit|voltage|current|resist|logic|gate|electr|transistor|capacitor/.test(t)) return "circuit";
  if (/robot|control|pid|navigation|actuator|motor/.test(t)) return "robot";
  if (/network|protocol|iot|internet|tcp|wireless/.test(t)) return "network";
  if (/sensor|arduino|micro|embedded|interrupt|signal/.test(t)) return "sensor";
  if (/data|sort|search|array|stack|queue|database|sql|machine learning|neural/.test(t)) return "data";
  return "code";
}

interface DbLesson { id: string; title: string; summary: string; objectives: string[]; duration_sec: number }
interface DbModule { id: string; title: string; lessons: DbLesson[] }
interface DbCourse {
  id: string; code: string; title: string; description: string; level: number; semester: number; units: number;
  is_premium: boolean; price_ngn: number | string; modules: DbModule[];
}

function mapCourse(c: DbCourse): Course {
  return {
    id: c.id,
    code: c.code,
    title: c.title,
    description: c.description,
    level: c.level as Course["level"],
    semester: c.semester as Course["semester"],
    units: c.units,
    premium: c.is_premium,
    price: Number(c.price_ngn),
    modules: (c.modules ?? []).map((m) => ({
      id: m.id,
      title: m.title,
      quiz: [],
      lessons: (m.lessons ?? []).map((l) => ({
        id: l.id,
        title: l.title,
        summary: l.summary,
        objectives: l.objectives ?? [],
        duration: l.duration_sec,
        scene: sceneFor(l.title),
      })),
    })),
  };
}

export function ContentProvider({ children }: { children: React.ReactNode }) {
  const sample = !isSupabaseConfigured();
  const [courses, setCourses] = useState<Course[]>(sample ? SAMPLE_COURSES : []);
  const [settings, setSettings] = useState<SiteSettings>(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(!sample);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    if (sample) return;
    const sb = getSupabase();
    if (!sb) return;
    let alive = true;
    (async () => {
      const [cat, set] = await Promise.all([sb.rpc("get_catalogue"), sb.from("site_settings").select("key,value")]);
      if (!alive) return;
      if (!cat.error && Array.isArray(cat.data)) setCourses((cat.data as DbCourse[]).map(mapCourse));
      if (!set.error && set.data) {
        const s: Record<string, string> = {};
        (set.data as { key: string; value: string }[]).forEach((r) => (s[r.key] = r.value));
        setSettings({ ...DEFAULT_SETTINGS, ...Object.fromEntries(Object.entries(s).filter(([, v]) => v !== "")), announcement: s.announcement ?? "", support_email: s.support_email ?? "" });
      }
      setLoading(false);
    })();
    return () => { alive = false; };
  }, [sample, tick]);

  const bySlug = useCallback((slug: string) => courses.find((c) => courseSlug(c.code) === slug.toLowerCase()), [courses]);
  const byCode = useCallback((code: string) => courses.find((c) => c.code === code), [courses]);
  const reload = useCallback(() => setTick((n) => n + 1), []);

  const value = useMemo(() => ({ courses, settings, loading, sample, bySlug, byCode, reload }), [courses, settings, loading, sample, bySlug, byCode, reload]);
  return <C.Provider value={value}>{children}</C.Provider>;
}

export const useContent = () => {
  const c = useContext(C);
  if (!c) throw new Error("useContent must be used inside <ContentProvider>");
  return c;
};
