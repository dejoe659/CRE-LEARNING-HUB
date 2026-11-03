"use client";

import Link from "next/link";
import { ArrowRight, Award, BookOpen, CheckCircle2, Clock, PlayCircle, TrendingUp } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { useProgress } from "@/lib/progress";
import { COURSES, courseSlug, fmtDuration } from "@/lib/data";
import { courseProgress, findLesson, isCourseComplete, timeAgo } from "@/lib/stats";
import CourseCard from "@/components/CourseCard";
import { SceneThumb } from "@/components/LessonScene";

export default function DashboardHome() {
  const { user } = useAuth();
  const { enrolled, completed, recent, results, positions } = useProgress();
  const enrolledCourses = COURSES.filter((c) => enrolled.includes(c.code));
  const done = enrolledCourses.filter((c) => isCourseComplete(c, completed));
  const avg = enrolledCourses.length
    ? Math.round(enrolledCourses.reduce((a, c) => a + courseProgress(c, completed), 0) / enrolledCourses.length)
    : 0;
  const recommended = COURSES.filter((c) => c.level === user?.level && !enrolled.includes(c.code)).slice(0, 3);
  const upcoming = enrolledCourses.filter((c) => c.modules.some((m) => m.quiz.length)).slice(0, 4);

  const stats = [
    { label: "Enrolled courses", value: enrolledCourses.length, icon: BookOpen, tone: "bg-brand-50 text-brand-600" },
    { label: "Completed courses", value: done.length, icon: CheckCircle2, tone: "bg-emerald-50 text-emerald-600" },
    { label: "Learning progress", value: `${avg}%`, icon: TrendingUp, tone: "bg-violet-50 text-violet-600" },
    { label: "Exams taken", value: results.length, icon: Award, tone: "bg-amber-50 text-amber-600" },
  ];

  return (
    <div className="space-y-8">
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-navy-900 to-brand-700 p-7 text-white sm:p-9">
        <div className="grid-bg absolute inset-0 opacity-20" />
        <div className="relative">
          <p className="text-sm text-slate-300">Welcome back 👋</p>
          <h1 className="mt-1 text-2xl font-extrabold sm:text-3xl">{user?.fullName.split(" ")[0]}, ready to learn today?</h1>
          <p className="mt-2 max-w-xl text-sm text-slate-200">{user?.level} Level · {user?.department}</p>
          <div className="mt-5 flex flex-wrap gap-3">
            <Link href="/dashboard/explore" className="btn bg-white text-navy-900 hover:bg-brand-50">Explore courses</Link>
            <Link href="/dashboard/ai-tutor" className="btn border border-white/30 text-white hover:bg-white/10">Ask AI Tutor</Link>
          </div>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map(({ label, value, icon: Icon, tone }) => (
          <div key={label} className="card flex items-center gap-4 p-5">
            <span className={`flex h-12 w-12 items-center justify-center rounded-2xl ${tone}`}><Icon size={22} /></span>
            <div><p className="text-2xl font-extrabold">{value}</p><p className="text-xs text-slate-500">{label}</p></div>
          </div>
        ))}
      </div>

      <section>
        <div className="mb-4 flex items-center justify-between"><h2 className="text-lg font-bold">Continue learning</h2><Link href="/dashboard/my-courses" className="text-sm font-semibold text-brand-600 hover:underline">All my courses</Link></div>
        {enrolledCourses.length === 0 ? (
          <div className="card p-10 text-center">
            <p className="font-bold">You haven&apos;t enrolled in a course yet</p>
            <p className="mt-1 text-sm text-slate-500">Browse the catalogue and start with a free course.</p>
            <Link href="/dashboard/explore" className="btn-primary mt-5">Explore courses</Link>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
            {enrolledCourses.slice(0, 3).map((c) => <CourseCard key={c.code} course={c} progress={courseProgress(c, completed)} />)}
          </div>
        )}
      </section>

      <div className="grid gap-8 lg:grid-cols-2">
        <section>
          <h2 className="mb-4 text-lg font-bold">Recently watched</h2>
          <div className="card divide-y divide-slate-100">
            {recent.length === 0 && <p className="p-6 text-sm text-slate-500">Videos you watch will appear here.</p>}
            {recent.slice(0, 4).map((r) => {
              const f = findLesson(r.lessonId);
              if (!f) return null;
              return (
                <Link key={r.lessonId} href={`/dashboard/learn/${courseSlug(f.course.code)}?lesson=${r.lessonId}`} className="flex items-center gap-4 p-4 transition hover:bg-slate-50">
                  <div className="w-24 shrink-0 overflow-hidden rounded-lg"><SceneThumb scene={f.lesson.scene} /></div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold">{f.lesson.title}</p>
                    <p className="text-xs text-slate-500">{f.course.code} · {timeAgo(r.at)}</p>
                    <p className="text-xs text-brand-600">Resume at {fmtDuration(positions[r.lessonId] ?? 0)}</p>
                  </div>
                  <PlayCircle className="text-brand-600" size={22} />
                </Link>
              );
            })}
          </div>
        </section>

        <section>
          <h2 className="mb-4 text-lg font-bold">Upcoming examinations</h2>
          <div className="card divide-y divide-slate-100">
            {upcoming.length === 0 && <p className="p-6 text-sm text-slate-500">Enrol in a course to see its quizzes and examinations.</p>}
            {upcoming.map((c) => (
              <div key={c.code} className="flex items-center justify-between gap-3 p-4">
                <div className="min-w-0"><p className="truncate text-sm font-semibold">{c.code} Examination</p><p className="flex items-center gap-1 text-xs text-slate-500"><Clock size={12} /> Timed · {c.modules.reduce((a, m) => a + m.quiz.length, 0)} questions</p></div>
                <Link href={`/dashboard/quizzes?course=${courseSlug(c.code)}`} className="btn-outline px-3 py-2 text-xs">Start</Link>
              </div>
            ))}
          </div>
        </section>
      </div>

      {recommended.length > 0 && (
        <section>
          <div className="mb-4 flex items-center justify-between"><h2 className="text-lg font-bold">Recommended for your level</h2><Link href="/dashboard/explore" className="flex items-center gap-1 text-sm font-semibold text-brand-600 hover:underline">See more <ArrowRight size={14} /></Link></div>
          <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">{recommended.map((c) => <CourseCard key={c.code} course={c} />)}</div>
        </section>
      )}
    </div>
  );
}
