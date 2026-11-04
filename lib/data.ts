/**
 * SAMPLE DATA ONLY.
 * These courses are demonstration content to showcase the platform.
 * They are NOT an official UNN (or any institution's) curriculum.
 * Administrators replace this with real courses stored in Supabase.
 */

export type Level = 100 | 200 | 300 | 400;
export type Semester = 1 | 2;

export interface Lesson {
  id: string;
  title: string;
  duration: number; // seconds
  summary: string;
  objectives: string[];
  example?: string;
  videoUrl?: string; // MP4 / HLS / Cloudflare Stream URL once uploaded
  scene: "circuit" | "code" | "robot" | "network" | "data" | "sensor";
}

export interface Module {
  id: string;
  title: string;
  lessons: Lesson[];
  quiz: QuizQuestion[];
}

export interface Course {
  id?: string; // database id (undefined for built-in sample courses)
  code: string;
  title: string;
  level: Level;
  semester: Semester;
  units: number;
  description: string;
  instructor?: string;
  premium: boolean;
  price: number; // Naira
  rating?: number;
  students?: number;
  tag?: string;
  modules: Module[];
}

export interface QuizQuestion {
  id: string;
  type: "mcq" | "tf" | "short";
  question: string;
  options?: string[];
  answer: string; // for mcq: option text; tf: "True"/"False"; short: accepted keyword(s) separated by |
  explanation: string;
}

/** A quiz or examination ready to run. `remote` exams are marked on the server; sample ones locally. */
export interface ExamItem {
  id: string;
  courseCode: string;
  courseTitle: string;
  title: string;
  timeLimitSec?: number;
  moduleId?: string;
  questions: QuizQuestion[];
  remote: boolean;
}

export const LEVELS: { level: Level; title: string; blurb: string; color: string }[] = [
  { level: 100, title: "Foundation", blurb: "Computing fundamentals, basic electronics and problem solving.", color: "from-sky-500 to-brand-600" },
  { level: 200, title: "Core Skills", blurb: "Programming, data structures, circuits and microcontrollers.", color: "from-brand-500 to-indigo-600" },
  { level: 300, title: "Applied Systems", blurb: "Embedded systems, control theory, networks and databases.", color: "from-indigo-500 to-violet-600" },
  { level: 400, title: "Advanced & Capstone", blurb: "Machine learning, autonomous robotics and final-year projects.", color: "from-violet-500 to-fuchsia-600" },
];

/** Courses live in the database and are managed from the admin site. No built-in courses. */
export const COURSES: Course[] = [];

/* ---------- helpers ---------- */
export const getCourse = (code: string) =>
  COURSES.find((c) => c.code.replace(/\s/g, "-").toLowerCase() === code.toLowerCase());

export const courseSlug = (code: string) => code.replace(/\s/g, "-").toLowerCase();

export const flatLessons = (c: Course) =>
  c.modules.flatMap((m) => m.lessons.map((l) => ({ ...l, moduleId: m.id, moduleTitle: m.title })));

export const coursesFor = (level: Level, semester?: Semester) =>
  COURSES.filter((c) => c.level === level && (semester ? c.semester === semester : true));

export const formatNaira = (n: number) => (n === 0 ? "Free" : `₦${n.toLocaleString("en-NG")}`);

export const fmtDuration = (s: number) => {
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${m}:${sec.toString().padStart(2, "0")}`;
};

export const TESTIMONIALS = [
  { name: "Amaka O.", role: "300 Level student (sample testimonial)", text: "The animated explanations made PID control finally click. I rewatched the line-follower lesson three times." },
  { name: "Chinedu E.", role: "200 Level student (sample testimonial)", text: "Quizzes after every topic keep me honest. I can see exactly which concepts I still need to review." },
  { name: "Ngozi A.", role: "100 Level student (sample testimonial)", text: "I could study on my phone with low data. Resume watching is a lifesaver." },
];

export const MATERIALS: { id: string; course: string; title: string; kind: string; size?: string }[] = [];
