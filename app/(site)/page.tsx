"use client";

import Link from "next/link";
import {
  ArrowRight, Bot, ClipboardCheck, FileText, MonitorPlay, PlayCircle, Smartphone, Sparkles,
  UserPlus, Search, Trophy, Wallet,
} from "lucide-react";
import RobotHero from "@/components/RobotHero";
import CourseCard from "@/components/CourseCard";
import { LEVELS, TESTIMONIALS } from "@/lib/data";
import { useContent } from "@/lib/content";

const why = [
  { icon: MonitorPlay, title: "Animated video lessons", text: "Abstract ideas become visual stories — circuits, algorithms and robots animated step by step." },
  { icon: FileText, title: "Notes & practical guides", text: "Downloadable lecture notes, summaries and lab guides organised by level, semester and course." },
  { icon: ClipboardCheck, title: "Quizzes & timed exams", text: "Auto-marked practice and examinations with instant feedback and performance reports." },
  { icon: Bot, title: "AI academic tutor", text: "Ask questions, debug code and get robotics concepts explained in plain language." },
  { icon: Smartphone, title: "Learn anywhere", text: "A fast, mobile-first design with automatic progress saving and resume watching." },
  { icon: Wallet, title: "Free & premium courses", text: "Start free. Unlock premium courses securely in Naira (₦) via Paystack." },
];

const steps = [
  { icon: UserPlus, title: "Create your account", text: "Register with your institution, department and level." },
  { icon: Search, title: "Pick your courses", text: "Browse by level and semester, then enrol in a click." },
  { icon: PlayCircle, title: "Watch & practise", text: "Follow animated lessons, read notes and try practical examples." },
  { icon: Trophy, title: "Test & track", text: "Take quizzes and exams, then review your progress reports." },
];

export default function Home() {
  const { courses, settings, sample, loading } = useContent();
  const featured = courses.slice(0, 6);
  return (
    <>
      {/* HERO */}
      <section className="relative overflow-hidden bg-gradient-to-b from-brand-50 via-white to-white">
        <div className="grid-bg pointer-events-none absolute inset-0 opacity-70" aria-hidden="true" />
        <div className="section relative grid items-center gap-10 py-16 lg:grid-cols-2 lg:py-24">
          <div className="animate-fadeUp">
            <span className="badge gap-1.5 bg-brand-100 text-brand-700">
              <Sparkles size={13} /> Computer &amp; Robotics Education · 100–400 Level
            </span>
            <h1 className="mt-5 text-4xl font-extrabold leading-[1.1] tracking-tight sm:text-5xl lg:text-6xl">
              <span className="bg-gradient-to-r from-brand-600 to-accent-500 bg-clip-text text-transparent">
                {settings.hero_title}
              </span>
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-slate-600">
              {settings.hero_subtitle}
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/courses" className="btn-primary px-7 py-3.5 text-base">
                Explore Courses <ArrowRight size={18} />
              </Link>
              <Link href="/register" className="btn-outline px-7 py-3.5 text-base">
                <PlayCircle size={18} /> Start Learning
              </Link>
            </div>
            <dl className="mt-10 grid max-w-md grid-cols-3 gap-4">
              {[["4", "Academic levels"], ["8", "Semesters"], [String(courses.length), sample ? "Sample courses" : "Courses"]].map(([n, l]) => (
                <div key={l}>
                  <dt className="text-2xl font-extrabold text-brand-600">{n}</dt>
                  <dd className="text-xs text-slate-500">{l}</dd>
                </div>
              ))}
            </dl>
          </div>
          <RobotHero />
        </div>
      </section>

      {/* LEVELS */}
      <section className="section py-20" id="levels">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-extrabold sm:text-4xl">Choose your academic level</h2>
          <p className="mt-3 text-slate-600">Every level has a First and Second Semester course catalogue.</p>
        </div>
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {LEVELS.map((l) => (
            <Link
              key={l.level}
              href={`/courses?level=${l.level}`}
              className="group relative overflow-hidden rounded-3xl p-6 text-white shadow-card transition duration-300 hover:-translate-y-1.5 hover:shadow-glow"
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${l.color}`} />
              <div className="absolute -right-6 -top-6 h-32 w-32 rounded-full bg-white/10 transition group-hover:scale-125" />
              <div className="relative">
                <p className="text-5xl font-extrabold">{l.level}</p>
                <p className="text-sm font-semibold uppercase tracking-widest opacity-90">Level</p>
                <h3 className="mt-5 text-lg font-bold">{l.title}</h3>
                <p className="mt-1 text-sm text-white/80">{l.blurb}</p>
                <p className="mt-5 flex items-center gap-1 text-sm font-semibold">
                  {courses.filter((c) => c.level === l.level).length} {sample ? "sample " : ""}courses <ArrowRight size={16} className="transition group-hover:translate-x-1" />
                </p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* FEATURED */}
      <section className="bg-white py-20">
        <div className="section">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <h2 className="text-3xl font-extrabold sm:text-4xl">Featured courses</h2>
              <p className="mt-2 text-slate-600">Start learning with animated lessons, notes and quizzes.</p>
            </div>
            <Link href="/courses" className="btn-outline">View all courses <ArrowRight size={16} /></Link>
          </div>
          {featured.length === 0 ? (
            <div className="mt-10 rounded-2xl border border-dashed border-slate-300 p-12 text-center text-sm text-slate-500">
              {loading ? "Loading courses…" : "Courses are being added. Please check back soon."}
            </div>
          ) : (
            <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {featured.map((c) => <CourseCard key={c.code} course={c} />)}
            </div>
          )}
          {sample && (
            <p className="mt-6 text-center text-xs text-slate-500">
              Sample course catalogue for demonstration — not an official university curriculum.
            </p>
          )}
        </div>
      </section>

      {/* WHY */}
      <section className="section py-20">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-extrabold sm:text-4xl">Why choose CRE Learning Hub?</h2>
          <p className="mt-3 text-slate-600">Built for how Computer and Robotics students actually learn.</p>
        </div>
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {why.map(({ icon: Icon, title, text }) => (
            <div key={title} className="card p-6 transition duration-300 hover:-translate-y-1 hover:shadow-glow">
              <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-50 text-brand-600"><Icon size={24} /></span>
              <h3 className="mt-4 text-lg font-bold">{title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">{text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="bg-navy-900 py-20 text-white">
        <div className="section">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-extrabold sm:text-4xl">How it works</h2>
            <p className="mt-3 text-slate-400">From sign-up to certificate-ready progress in four steps.</p>
          </div>
          <ol className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {steps.map(({ icon: Icon, title, text }, i) => (
              <li key={title} className="relative rounded-2xl border border-slate-700/60 bg-navy-800 p-6">
                <span className="absolute -top-3 right-5 rounded-full bg-brand-600 px-3 py-1 text-xs font-bold">Step {i + 1}</span>
                <Icon className="text-accent-400" size={28} />
                <h3 className="mt-4 font-bold">{title}</h3>
                <p className="mt-2 text-sm text-slate-400">{text}</p>
              </li>
            ))}
          </ol>
          <div className="mt-10 text-center">
            <Link href="/register" className="btn-primary px-8 py-3.5 text-base">Get Started — it&apos;s free</Link>
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="section py-20">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-extrabold sm:text-4xl">What students say</h2>
          <p className="mt-3 text-xs text-slate-500">Illustrative sample testimonials for the demo site.</p>
        </div>
        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {TESTIMONIALS.map((t) => (
            <figure key={t.name} className="card p-6">
              <blockquote className="text-sm leading-relaxed text-slate-700">“{t.text}”</blockquote>
              <figcaption className="mt-5 flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-600 text-sm font-bold text-white">{t.name[0]}</span>
                <span>
                  <span className="block text-sm font-semibold">{t.name}</span>
                  <span className="block text-xs text-slate-500">{t.role}</span>
                </span>
              </figcaption>
            </figure>
          ))}
        </div>
      </section>
    </>
  );
}
