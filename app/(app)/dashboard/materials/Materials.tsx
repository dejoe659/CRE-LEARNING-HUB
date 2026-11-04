"use client";

import { useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";
import { Download, FileText } from "lucide-react";
import { LEVELS, courseSlug } from "@/lib/data";
import { useContent } from "@/lib/content";
import { openMaterial, useMaterials } from "@/lib/materials";

const KINDS = ["All", "Lecture Notes", "Course Summary", "Textbook", "Practical Guide", "Past Questions", "Assignment"];

export default function Materials() {
  const sp = useSearchParams();
  const { courses: COURSES } = useContent();
  const { materials: MATERIALS, loading, sample } = useMaterials();
  const [level, setLevel] = useState(0);
  const [semester, setSemester] = useState(0);
  const [kind, setKind] = useState("All");
  const [course, setCourse] = useState(sp.get("course") ?? "all");

  const rows = useMemo(
    () =>
      MATERIALS.map((m) => ({ ...m, c: COURSES.find((c) => c.code === m.course)! })).filter((m) => m.c).filter(
        (m) =>
          (!level || m.c.level === level) &&
          (!semester || m.c.semester === semester) &&
          (kind === "All" || m.kind === kind) &&
          (course === "all" || courseSlug(m.course) === course)
      ),
    [COURSES, MATERIALS, level, semester, kind, course]
  );

  const download = async (m: (typeof rows)[number]) => {
    if (m.filePath) {
      const url = await openMaterial(m.filePath);
      if (url) window.open(url, "_blank", "noopener");
      else alert("Could not open this file. Please try again.");
      return;
    }
    const text = `# ${m.title}\n${m.course} — ${m.c.title}\n${m.c.level} Level · ${m.c.semester === 1 ? "First" : "Second"} Semester\n\nSAMPLE MATERIAL (demonstration only).\n\n${m.c.description}\n\nTopics:\n${m.c.modules.flatMap((x) => x.lessons.map((l) => `- ${l.title}: ${l.summary}`)).join("\n")}\n`;
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([text], { type: "text/markdown" }));
    a.download = `${courseSlug(m.course)}-${m.kind.toLowerCase().replace(/\s+/g, "-")}.md`;
    a.click();
    URL.revokeObjectURL(a.href);
  };

  return (
    <div>
      <h1 className="text-2xl font-extrabold">Study Materials</h1>
      <p className="mt-1 text-sm text-slate-500">Organised by level, semester and course. {sample ? "The items below are samples." : "Notes and guides uploaded by your lecturers."}</p>

      <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <select className="input" value={level} onChange={(e) => setLevel(Number(e.target.value))} aria-label="Level"><option value={0}>All levels</option>{LEVELS.map((l) => <option key={l.level} value={l.level}>{l.level} Level</option>)}</select>
        <select className="input" value={semester} onChange={(e) => setSemester(Number(e.target.value))} aria-label="Semester"><option value={0}>Both semesters</option><option value={1}>First Semester</option><option value={2}>Second Semester</option></select>
        <select className="input" value={course} onChange={(e) => setCourse(e.target.value)} aria-label="Course"><option value="all">All courses</option>{COURSES.map((c) => <option key={c.code} value={courseSlug(c.code)}>{c.code} — {c.title}</option>)}</select>
        <select className="input" value={kind} onChange={(e) => setKind(e.target.value)} aria-label="Material type">{KINDS.map((k) => <option key={k}>{k}</option>)}</select>
      </div>

      <div className="card mt-6 divide-y divide-slate-100">
        {rows.length === 0 && <p className="p-10 text-center text-sm text-slate-500">{loading ? "Loading…" : "No materials match these filters."}</p>}
        {rows.map((m) => (
          <div key={m.id} className="flex items-center gap-4 p-4">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-600"><FileText size={20} /></span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold">{m.title}</p>
              <p className="text-xs text-slate-500">{m.course} · {m.c.level} Level · {m.c.semester === 1 ? "1st" : "2nd"} sem · {m.kind}{m.size ? ` · ${m.size}` : ""}</p>
            </div>
            <button className="btn-outline px-3 py-2 text-xs" onClick={() => download(m)}><Download size={14} /> Download</button>
          </div>
        ))}
      </div>
    </div>
  );
}
