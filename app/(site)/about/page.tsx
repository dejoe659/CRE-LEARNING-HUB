import Link from "next/link";
import { Eye, GraduationCap, ShieldCheck, Target } from "lucide-react";

export const metadata = { title: "About" };

const values = [
  { icon: Target, title: "Our mission", text: "Help every Computer and Robotics Education student understand each course through animated visual explanations and practical learning." },
  { icon: Eye, title: "Our vision", text: "A world-class, accessible learning platform that makes technical education engaging for students across Nigeria and beyond." },
  { icon: GraduationCap, title: "Built for students", text: "Mobile-first design, saved progress and low-friction access so learning fits around real student life." },
  { icon: ShieldCheck, title: "Privacy first", text: "Student data is protected with Row Level Security. Secret keys never reach the browser and payments are verified on the server." },
];

export default function About() {
  return (
    <>
      <section className="bg-gradient-to-br from-navy-900 to-brand-700 py-20 text-white">
        <div className="section max-w-3xl">
          <h1 className="text-4xl font-extrabold">About CRE Learning Hub</h1>
          <p className="mt-4 text-lg text-slate-200">
            CRE Learning Hub is a learning platform for Computer and Robotics Education students from 100 to 400 Level,
            combining animated video lessons, practical demonstrations, PDF notes, quizzes and examinations.
          </p>
        </div>
      </section>
      <section className="section grid gap-6 py-16 sm:grid-cols-2">
        {values.map(({ icon: Icon, title, text }) => (
          <div key={title} className="card p-7">
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-50 text-brand-600"><Icon size={24} /></span>
            <h2 className="mt-4 text-lg font-bold">{title}</h2>
            <p className="mt-2 text-sm leading-relaxed text-slate-600">{text}</p>
          </div>
        ))}
      </section>
      <section className="section pb-20">
        <div className="rounded-3xl bg-amber-50 p-6 text-sm text-amber-900">
          <strong>Note on curriculum:</strong> the courses displayed are sample content for demonstration. They are not an
          official university (including UNN) curriculum. Administrators add the real course catalogue from the admin dashboard.
        </div>
        <div className="mt-8 text-center">
          <Link href="/register" className="btn-primary px-8 py-3.5">Join CRE Learning Hub</Link>
        </div>
      </section>
    </>
  );
}
