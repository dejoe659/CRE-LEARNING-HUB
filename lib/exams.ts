"use client";

import { useEffect, useMemo, useState } from "react";
import { Course, ExamItem, QuizQuestion } from "./data";
import { useContent } from "./content";
import { getSupabase } from "./supabase/client";

interface DbQuestion { id: string; type: "mcq" | "tf" | "short"; prompt: string; options: string[] | null; position: number }
interface DbExam {
  id: string; title: string; time_limit_sec: number | null; module_id: string | null;
  courses: { code: string; title: string } | null; questions: DbQuestion[];
}

/** Sample quizzes: one practice quiz per module plus one timed exam per course. */
function sampleExams(courses: Course[]): ExamItem[] {
  return courses.flatMap((c) => {
    const mods = c.modules.filter((m) => m.quiz.length).map((m): ExamItem => ({
      id: m.id, courseCode: c.code, courseTitle: c.title, title: `${m.title} quiz`, moduleId: m.id, questions: m.quiz, remote: false,
    }));
    const all = c.modules.flatMap((m) => m.quiz);
    const exam: ExamItem[] = all.length
      ? [{ id: `${c.code}-exam`, courseCode: c.code, courseTitle: c.title, title: `${c.code} Examination`, timeLimitSec: Math.max(60, all.length * 90), questions: all, remote: false }]
      : [];
    return [...mods, ...exam];
  });
}

/** Loads the quizzes and exams the signed-in student may take. Answers never reach the browser for real exams. */
export function useExams() {
  const { courses, sample } = useContent();
  const [remote, setRemote] = useState<ExamItem[]>([]);
  const [loading, setLoading] = useState(!sample);

  useEffect(() => {
    if (sample) return;
    const sb = getSupabase();
    if (!sb) return;
    let alive = true;
    (async () => {
      const { data } = await sb
        .from("exams")
        .select("id,title,time_limit_sec,module_id,courses(code,title),questions(id,type,prompt,options,position)")
        .eq("is_published", true);
      if (!alive) return;
      const items = ((data ?? []) as unknown as DbExam[])
        .filter((e) => e.questions?.length)
        .map((e): ExamItem => ({
          id: e.id,
          courseCode: e.courses?.code ?? "",
          courseTitle: e.courses?.title ?? "",
          title: e.title,
          timeLimitSec: e.time_limit_sec ?? undefined,
          moduleId: e.module_id ?? undefined,
          remote: true,
          questions: [...e.questions].sort((a, b) => a.position - b.position).map((q): QuizQuestion => ({
            id: q.id, type: q.type, question: q.prompt, options: q.options ?? undefined, answer: "", explanation: "",
          })),
        }));
      setRemote(items);
      setLoading(false);
    })();
    return () => { alive = false; };
  }, [sample]);

  const exams = useMemo(() => (sample ? sampleExams(courses) : remote), [sample, courses, remote]);
  return { exams, loading };
}
