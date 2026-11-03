import { notFound } from "next/navigation";
import Link from "next/link";
import { ChevronRight, Clock, FileText, PlayCircle, Star, Users } from "lucide-react";
import { COURSES, courseSlug, fmtDuration, formatNaira, getCourse } from "@/lib/data";
import EnrollPanel from "./EnrollPanel";

export function generateStaticParams() {
  return COURSES.map((c) => ({ slug: courseSlug(c.code) }));
}

export function generateMetadata({ params }: { params: { slug: string } }) {
  const c = getCourse(params.slug);
  return { title: c ? `${c.code} ${c.title}` : "Course" };
}

export default function CourseDetails({ params }: { params: { slug: string } }) {
  const course = getCourse(params.slug);
  if (!course) notFound();
  const lessonCount = course.modules.reduce((a, m) => a + m.lessons.length, 0);
  const total = course.modules.reduce((a, m) => a + m.lessons.reduce((x, l) => x + l.duration, 0), 0);

  return (
    <>
      <section className="bg-gradient-to-br from-navy-900 via-navy-800 to-brand-700 py-14 text-white">
        <div className="section">
          <nav className="mb-4 flex items-center gap-1 text-xs text-slate-300" aria-label="Breadcrumb">
            <Link href="/courses" className="hover:text-white">Courses</Link>
            <ChevronRight size={12} />
            <Link href={`/courses?level=${course.level}`} className="hover:text-white">{course.level} Level</Link>
            <ChevronRight size={12} />
            <span className="text-white">{course.code}</span>
          </nav>
          <span className="badge bg-white/15 text-white">{course.level} Level · {course.semester === 1 ? "First" : "Second"} Semester · {course.units} units</span>
          <h1 className="mt-3 max-w-3xl text-3xl font-extrabold sm:text-4xl">{course.code}: {course.title}</h1>
          <p className="mt-3 max-w-2xl text-slate-200">{course.description}</p>
          <div className="mt-5 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-slate-200">
            <span className="flex items-center gap-1.5"><Star size={15} className="fill-amber-400 text-amber-400" />{course.rating}</span>
            <span className="flex items-center gap-1.5"><Users size={15} />{course.students.toLocaleString()} students</span>
            <span className="flex items-center gap-1.5"><PlayCircle size={15} />{lessonCount} video lessons</span>
            <span className="flex items-center gap-1.5"><Clock size={15} />{Math.round(total / 60)} min</span>
          </div>
        </div>
      </section>

      <div className="section grid gap-8 py-10 lg:grid-cols-[1fr_360px]">
        <div className="space-y-8">
          <div className="card p-6">
            <h2 className="text-lg font-bold">What you will learn</h2>
            <ul className="mt-4 grid gap-2.5 sm:grid-cols-2">
              {course.modules.flatMap((m) => m.lessons.flatMap((l) => l.objectives)).slice(0, 8).map((o) => (
                <li key={o} className="flex gap-2 text-sm text-slate-700"><span className="mt-0.5 text-emerald-500">✓</span>{o}</li>
              ))}
            </ul>
          </div>

          <div className="card p-6">
            <h2 className="text-lg font-bold">Course content</h2>
            <p className="text-sm text-slate-500">{course.modules.length} modules · {lessonCount} lessons · quiz after every module</p>
            <div className="mt-4 space-y-3">
              {course.modules.map((m, i) => (
                <details key={m.id} open={i === 0} className="group rounded-xl border border-slate-200">
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-3 p-4 font-semibold">
                    <span>Module {i + 1}: {m.title}</span>
                    <span className="text-xs font-medium text-slate-500">{m.lessons.length} lessons</span>
                  </summary>
                  <ul className="divide-y divide-slate-100 border-t border-slate-100">
                    {m.lessons.map((l) => (
                      <li key={l.id} className="flex items-center justify-between gap-3 px-4 py-3 text-sm">
                        <span className="flex items-center gap-2"><PlayCircle size={16} className="text-brand-600" />{l.title}</span>
                        <span className="text-xs text-slate-500">{fmtDuration(l.duration)}</span>
                      </li>
                    ))}
                    <li className="flex items-center gap-2 px-4 py-3 text-sm text-slate-500"><FileText size={16} /> Module quiz · {m.quiz.length} questions</li>
                  </ul>
                </details>
              ))}
            </div>
          </div>
        </div>

        <aside>
          <div className="card sticky top-24 p-6">
            <p className="text-3xl font-extrabold text-brand-600">{formatNaira(course.price)}</p>
            <p className="mt-1 text-xs text-slate-500">{course.premium ? "Premium course · one-time payment" : "Free course"}</p>
            <EnrollPanel code={course.code} slug={courseSlug(course.code)} premium={course.premium} price={course.price} title={course.title} />
            <ul className="mt-6 space-y-2.5 text-sm text-slate-600">
              <li>• Animated video lessons</li>
              <li>• PDF notes &amp; practical examples</li>
              <li>• Quizzes after every topic</li>
              <li>• Progress saved automatically</li>
            </ul>
            <p className="mt-5 rounded-xl bg-slate-50 p-3 text-xs text-slate-500">
              Sample course for demonstration. Not an official university curriculum.
            </p>
          </div>
        </aside>
      </div>
    </>
  );
}
