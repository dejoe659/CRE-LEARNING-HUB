"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Search } from "lucide-react";
import { useMemo, useState } from "react";
import CourseCard from "@/components/CourseCard";
import { LEVELS, Level, Semester } from "@/lib/data";
import { useContent } from "@/lib/content";

export default function Catalogue({ basePath = "/courses" }: { basePath?: string }) {
  const router = useRouter();
  const sp = useSearchParams();
  const { courses: COURSES, sample, loading } = useContent();
  const level = (Number(sp.get("level")) || 0) as Level | 0;
  const semester = (Number(sp.get("semester")) || 0) as Semester | 0;
  const [q, setQ] = useState("");
  const [price, setPrice] = useState<"all" | "free" | "premium">("all");

  const setParam = (k: string, v: number) => {
    const p = new URLSearchParams(sp.toString());
    if (v) p.set(k, String(v));
    else p.delete(k);
    router.push(`${basePath}?${p.toString()}`, { scroll: false });
  };

  const list = useMemo(
    () =>
      COURSES.filter(
        (c) =>
          (!level || c.level === level) &&
          (!semester || c.semester === semester) &&
          (price === "all" || (price === "free" ? !c.premium : c.premium)) &&
          (q.trim() === "" || `${c.code} ${c.title} ${c.tag}`.toLowerCase().includes(q.toLowerCase()))
      ),
    [COURSES, level, semester, price, q]
  );

  const groups = ([1, 2] as Semester[])
    .filter((s) => !semester || semester === s)
    .map((s) => ({ s, items: list.filter((c) => c.semester === s) }))
    .filter((g) => g.items.length > 0);

  const pill = (active: boolean) =>
    `rounded-full px-4 py-2 text-sm font-semibold transition ${
      active ? "bg-brand-600 text-white shadow-glow" : "bg-white text-slate-600 ring-1 ring-slate-200 hover:ring-brand-400"
    }`;

  return (
    <div className="bg-slate-50">
      <div className="bg-gradient-to-br from-navy-900 to-brand-700 py-14 text-white">
        <div className="section">
          <h1 className="text-3xl font-extrabold sm:text-4xl">Course catalogue</h1>
          <p className="mt-2 max-w-2xl text-slate-200">
            Select an academic level and semester.{sample && <> These are <strong>sample courses</strong> for demonstration — not an official university curriculum.</>}
          </p>
        </div>
      </div>

      <div className="section py-10">
        {/* level selector */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {LEVELS.map((l) => (
            <button
              key={l.level}
              onClick={() => setParam("level", level === l.level ? 0 : l.level)}
              aria-pressed={level === l.level}
              className={`rounded-2xl border p-4 text-left transition ${
                level === l.level ? "border-brand-600 bg-brand-50 ring-2 ring-brand-200" : "border-slate-200 bg-white hover:border-brand-400"
              }`}
            >
              <p className="text-2xl font-extrabold text-brand-600">{l.level} Level</p>
              <p className="text-sm font-semibold">{l.title}</p>
              <p className="mt-1 text-xs text-slate-500">{COURSES.filter((c) => c.level === l.level).length} courses</p>
            </button>
          ))}
        </div>

        {/* filters */}
        <div className="mt-8 flex flex-wrap items-center gap-3">
          <div className="relative min-w-[220px] flex-1">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input className="input pl-10" placeholder="Search courses, codes or topics…" value={q} onChange={(e) => setQ(e.target.value)} aria-label="Search courses" />
          </div>
          <div className="flex flex-wrap gap-2">
            <button className={pill(!semester)} onClick={() => setParam("semester", 0)}>Both semesters</button>
            <button className={pill(semester === 1)} onClick={() => setParam("semester", 1)}>First Semester</button>
            <button className={pill(semester === 2)} onClick={() => setParam("semester", 2)}>Second Semester</button>
          </div>
          <select className="input w-auto" value={price} onChange={(e) => setPrice(e.target.value as typeof price)} aria-label="Filter by price">
            <option value="all">Free &amp; premium</option>
            <option value="free">Free only</option>
            <option value="premium">Premium only</option>
          </select>
        </div>

        {/* results */}
        {groups.length === 0 ? (
          <div className="card mt-10 p-12 text-center">
            <p className="text-lg font-bold">{loading ? "Loading courses…" : COURSES.length === 0 ? "No courses have been published yet" : "No courses match your filters"}</p>
            <p className="mt-1 text-sm text-slate-500">{COURSES.length === 0 ? "Please check back soon." : "Try clearing the search or choosing another level."}</p>
            <button className="btn-primary mt-5" onClick={() => { setQ(""); setPrice("all"); router.push(basePath); }}>Reset filters</button>
          </div>
        ) : (
          groups.map(({ s, items }) => (
            <section key={s} className="mt-10">
              <h2 className="mb-4 flex items-center gap-3 text-xl font-bold">
                {level ? `${level} Level · ` : ""}{s === 1 ? "First" : "Second"} Semester
                <span className="badge bg-slate-200 text-slate-600">{items.length}</span>
              </h2>
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {items.map((c) => <CourseCard key={c.code} course={c} />)}
              </div>
            </section>
          ))
        )}
      </div>
    </div>
  );
}
