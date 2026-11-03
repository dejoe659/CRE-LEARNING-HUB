import Link from "next/link";
import { BookOpen, Clock, Lock, Star, Users } from "lucide-react";
import { Course, courseSlug, flatLessons, formatNaira } from "@/lib/data";
import { SceneThumb } from "./LessonScene";

export default function CourseCard({ course, progress }: { course: Course; progress?: number }) {
  const lessons = flatLessons(course);
  const mins = Math.round(lessons.reduce((a, l) => a + l.duration, 0) / 60);
  return (
    <Link
      href={`/courses/${courseSlug(course.code)}`}
      className="card group flex flex-col overflow-hidden transition duration-300 hover:-translate-y-1 hover:shadow-glow"
    >
      <div className="relative">
        <SceneThumb scene={lessons[0]?.scene ?? "code"} />
        <span className="badge absolute left-3 top-3 bg-white/90 text-brand-700">{course.level} Level</span>
        <span
          className={`badge absolute right-3 top-3 ${
            course.premium ? "bg-amber-400 text-navy-900" : "bg-emerald-500 text-white"
          }`}
        >
          {course.premium && <Lock size={11} className="mr-1" />}
          {formatNaira(course.price)}
        </span>
      </div>
      <div className="flex flex-1 flex-col p-5">
        <p className="text-xs font-semibold uppercase tracking-wide text-brand-600">
          {course.code} · {course.tag}
        </p>
        <h3 className="mt-1 text-base font-bold leading-snug group-hover:text-brand-600">{course.title}</h3>
        <p className="mt-2 line-clamp-2 text-sm text-slate-500">{course.description}</p>
        <div className="mt-auto flex flex-wrap items-center gap-x-4 gap-y-1 pt-4 text-xs text-slate-500">
          <span className="flex items-center gap-1"><BookOpen size={13} /> {lessons.length} lessons</span>
          <span className="flex items-center gap-1"><Clock size={13} /> {mins} min</span>
          <span className="flex items-center gap-1"><Star size={13} className="fill-amber-400 text-amber-400" /> {course.rating}</span>
          <span className="flex items-center gap-1"><Users size={13} /> {course.students.toLocaleString()}</span>
        </div>
        {progress !== undefined && (
          <div className="mt-4">
            <div className="h-2 overflow-hidden rounded-full bg-slate-100">
              <div className="h-full rounded-full bg-brand-600 transition-all" style={{ width: `${progress}%` }} />
            </div>
            <p className="mt-1 text-xs text-slate-500">{progress}% complete</p>
          </div>
        )}
      </div>
    </Link>
  );
}
