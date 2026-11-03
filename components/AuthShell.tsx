"use client";

import Link from "next/link";
import Logo from "./Logo";
import RobotHero from "./RobotHero";
import { useAuth } from "@/lib/auth";

export default function AuthShell({ title, subtitle, children }: { title: string; subtitle: string; children: React.ReactNode }) {
  const { demo } = useAuth();
  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <div className="flex flex-col justify-center px-6 py-10 sm:px-12">
        <div className="mx-auto w-full max-w-md">
          <Logo />
          <h1 className="mt-10 text-3xl font-extrabold">{title}</h1>
          <p className="mt-2 text-sm text-slate-500">{subtitle}</p>
          {demo && (
            <p className="mt-4 rounded-xl bg-amber-50 p-3 text-xs text-amber-800" role="note">
              <strong>Demo mode:</strong> Supabase keys are not configured, so accounts are stored only in this browser.
              Add the keys in <code>.env.local</code> to enable real authentication.
            </p>
          )}
          <div className="mt-6">{children}</div>
          <p className="mt-8 text-center text-xs text-slate-400">
            <Link href="/" className="hover:text-brand-600">← Back to home</Link>
          </p>
        </div>
      </div>
      <div className="relative hidden items-center justify-center overflow-hidden bg-gradient-to-br from-navy-900 via-navy-800 to-brand-700 p-12 lg:flex">
        <div className="grid-bg absolute inset-0 opacity-30" />
        <div className="relative max-w-md text-center text-white">
          <RobotHero />
          <h2 className="mt-4 text-2xl font-bold">Learn Computer &amp; Robotics visually</h2>
          <p className="mt-2 text-sm text-slate-300">Animated lessons, practical guides, quizzes and exams in one place.</p>
        </div>
      </div>
    </div>
  );
}
