"use client";

import Link from "next/link";
import { COURSES } from "@/lib/data";
import { useProgress } from "@/lib/progress";
import { courseProgress } from "@/lib/stats";
import CourseCard from "@/components/CourseCard";

export default function MyCourses() {
  const { enrolled, completed } = useProgress();
  const mine = COURSES.filter((c) => enrolled.includes(c.code));
  return (
    <div>
      <h1 className="text-2xl font-extrabold">My Courses</h1>
      <p className="mt-1 text-sm text-slate-500">Courses you have enrolled in.</p>
      {mine.length === 0 ? (
        <div className="card mt-8 p-12 text-center">
          <p className="font-bold">No enrolled courses yet</p>
          <Link href="/dashboard/explore" className="btn-primary mt-5">Explore courses</Link>
        </div>
      ) : (
        <div className="mt-6 grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
          {mine.map((c) => <CourseCard key={c.code} course={c} progress={courseProgress(c, completed)} />)}
        </div>
      )}
    </div>
  );
}
