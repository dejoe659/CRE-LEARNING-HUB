import { Suspense } from "react";
import { notFound } from "next/navigation";
import { COURSES, courseSlug, getCourse } from "@/lib/data";
import Learn from "./Learn";

export function generateStaticParams() {
  return COURSES.map((c) => ({ slug: courseSlug(c.code) }));
}

export default function LearnPage({ params }: { params: { slug: string } }) {
  const course = getCourse(params.slug);
  if (!course) notFound();
  return (
    <Suspense fallback={<div className="p-10 text-center text-sm text-slate-500">Loading lesson…</div>}>
      <Learn slug={params.slug} />
    </Suspense>
  );
}
