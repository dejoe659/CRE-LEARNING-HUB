import { Course, flatLessons } from "./data";

export const courseProgress = (c: Course, completed: string[]) => {
  const ls = flatLessons(c);
  if (!ls.length) return 0;
  return Math.round((ls.filter((l) => completed.includes(l.id)).length / ls.length) * 100);
};

export const isCourseComplete = (c: Course, completed: string[]) => courseProgress(c, completed) === 100;

export const findLesson = (courses: Course[], lessonId: string) => {
  for (const c of courses) {
    const l = flatLessons(c).find((x) => x.id === lessonId);
    if (l) return { course: c, lesson: l };
  }
  return null;
};

export const timeAgo = (iso: string) => {
  const s = Math.max(1, Math.floor((Date.now() - new Date(iso).getTime()) / 1000));
  if (s < 60) return "just now";
  if (s < 3600) return `${Math.floor(s / 60)} min ago`;
  if (s < 86400) return `${Math.floor(s / 3600)} h ago`;
  return `${Math.floor(s / 86400)} d ago`;
};
