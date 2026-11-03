"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import {
  Award, BarChart3, BookOpen, ClipboardList, Compass, FileText, LayoutDashboard, LogOut, Menu, PlayCircle,
  Settings, ShieldCheck, Sparkles, User, X, Bot, HelpCircle,
} from "lucide-react";
import Logo from "./Logo";
import { useAuth } from "@/lib/auth";

const items = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/dashboard/my-courses", label: "My Courses", icon: BookOpen },
  { href: "/dashboard/explore", label: "Explore Courses", icon: Compass },
  { href: "/dashboard/videos", label: "Video Lessons", icon: PlayCircle },
  { href: "/dashboard/materials", label: "Study Materials", icon: FileText },
  { href: "/dashboard/quizzes", label: "Quizzes", icon: HelpCircle },
  { href: "/dashboard/assignments", label: "Assignments", icon: ClipboardList },
  { href: "/dashboard/results", label: "My Results", icon: Award },
  { href: "/dashboard/progress", label: "Learning Progress", icon: BarChart3 },
  { href: "/dashboard/ai-tutor", label: "AI Tutor", icon: Bot },
  { href: "/dashboard/profile", label: "Profile", icon: User },
  { href: "/dashboard/settings", label: "Settings", icon: Settings },
];

export default function Sidebar() {
  const path = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);

  const nav = (
    <div className="flex h-full flex-col">
      <div className="px-5 py-5"><Logo dark /></div>
      <nav className="flex-1 space-y-1 overflow-y-auto px-3 pb-4" aria-label="Dashboard">
        {items.map(({ href, label, icon: Icon }) => {
          const active = href === "/dashboard" ? path === href : path.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              onClick={() => setOpen(false)}
              aria-current={active ? "page" : undefined}
              className={`flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium transition ${
                active ? "bg-brand-600 text-white shadow-glow" : "text-slate-300 hover:bg-white/5 hover:text-white"
              }`}
            >
              <Icon size={18} /> {label}
              {label === "AI Tutor" && <Sparkles size={13} className="ml-auto text-accent-400" />}
            </Link>
          );
        })}
        {user?.role === "admin" && (
          <Link href="/admin" className="mt-3 flex items-center gap-3 rounded-xl border border-amber-400/30 px-3.5 py-2.5 text-sm font-medium text-amber-300 hover:bg-white/5">
            <ShieldCheck size={18} /> Admin dashboard
          </Link>
        )}
      </nav>
      <div className="border-t border-white/10 p-3">
        <button
          onClick={async () => { await logout(); router.replace("/"); }}
          className="flex w-full items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium text-slate-300 hover:bg-white/5 hover:text-white"
        >
          <LogOut size={18} /> Logout
        </button>
      </div>
    </div>
  );

  return (
    <>
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 bg-navy-900 lg:block">{nav}</aside>
      <div className="sticky top-0 z-40 flex h-14 items-center justify-between border-b border-slate-200 bg-white px-4 lg:hidden">
        <Logo />
        <button onClick={() => setOpen(true)} aria-label="Open menu" className="rounded-lg p-2 hover:bg-slate-100"><Menu size={22} /></button>
      </div>
      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setOpen(false)} />
          <aside className="absolute inset-y-0 left-0 w-72 bg-navy-900">
            <button onClick={() => setOpen(false)} aria-label="Close menu" className="absolute right-3 top-4 rounded-lg p-1.5 text-slate-300 hover:bg-white/10"><X size={20} /></button>
            {nav}
          </aside>
        </div>
      )}
    </>
  );
}
