"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import { BarChart3, BookOpen, CreditCard, FileText, GraduationCap, HelpCircle, LayoutDashboard, LogOut, Users } from "lucide-react";
import Logo from "@/components/Logo";
import { useAuth } from "@/lib/auth";

const nav = [
  { href: "/admin", label: "Overview", icon: LayoutDashboard },
  { href: "/admin/students", label: "Students", icon: Users },
  { href: "/admin/courses", label: "Courses & Videos", icon: BookOpen },
  { href: "/admin/materials", label: "PDF Materials", icon: FileText },
  { href: "/admin/exams", label: "Quizzes & Exams", icon: HelpCircle },
  { href: "/admin/results", label: "Results & Progress", icon: BarChart3 },
  { href: "/admin/payments", label: "Payments", icon: CreditCard },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, loading, logout, demo } = useAuth();
  const router = useRouter();
  const path = usePathname();

  useEffect(() => {
    if (loading) return;
    if (!user) router.replace(`/login?next=${encodeURIComponent(path)}`);
    else if (user.role !== "admin") router.replace("/dashboard");
  }, [loading, user, router, path]);

  if (loading || !user || user.role !== "admin")
    return <div className="flex min-h-screen items-center justify-center text-sm text-slate-500">Checking admin access…</div>;

  return (
    <div className="min-h-screen bg-slate-50 lg:flex">
      <aside className="bg-navy-900 text-slate-300 lg:sticky lg:top-0 lg:h-screen lg:w-64 lg:shrink-0">
        <div className="flex items-center justify-between px-5 py-4 lg:block"><Logo dark /><span className="badge mt-0 bg-amber-400 text-navy-900 lg:mt-3">ADMIN</span></div>
        <nav className="flex gap-1 overflow-x-auto px-3 pb-3 lg:flex-col lg:overflow-visible" aria-label="Admin">
          {nav.map(({ href, label, icon: Icon }) => {
            const active = href === "/admin" ? path === href : path.startsWith(href);
            return <Link key={href} href={href} className={`flex shrink-0 items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium ${active ? "bg-brand-600 text-white" : "hover:bg-white/5 hover:text-white"}`}><Icon size={18} />{label}</Link>;
          })}
          <Link href="/dashboard" className="flex shrink-0 items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm hover:bg-white/5"><GraduationCap size={18} />Student view</Link>
          <button onClick={async () => { await logout(); router.replace("/"); }} className="flex shrink-0 items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm hover:bg-white/5"><LogOut size={18} />Logout</button>
        </nav>
      </aside>
      <main className="min-w-0 flex-1 p-4 sm:p-6 lg:p-8">
        {demo && (
          <div className="mb-6 rounded-2xl bg-amber-50 p-4 text-sm text-amber-900">
            <strong>Supabase is not connected.</strong> The admin tools read and write real database tables, so they stay empty until you add
            <code> NEXT_PUBLIC_SUPABASE_URL</code> and <code>NEXT_PUBLIC_SUPABASE_ANON_KEY</code> and run <code>supabase/migrations/0001_init.sql</code>.
          </div>
        )}
        {children}
      </main>
    </div>
  );
}
