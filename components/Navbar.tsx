"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Menu, X } from "lucide-react";
import Logo from "./Logo";
import { useAuth } from "@/lib/auth";

const links = [
  { href: "/", label: "Home" },
  { href: "/courses", label: "Courses" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

export default function Navbar() {
  const path = usePathname();
  const [open, setOpen] = useState(false);
  const { user } = useAuth();

  return (
    <header className="sticky top-0 z-50 border-b border-slate-100 bg-white/85 backdrop-blur-lg">
      <div className="section flex h-16 items-center justify-between">
        <Logo />
        <nav className="hidden items-center gap-1 md:flex" aria-label="Main">
          {links.map((l) => {
            const active = l.href === "/" ? path === "/" : path.startsWith(l.href);
            return (
              <Link
                key={l.href}
                href={l.href}
                className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
                  active ? "bg-brand-50 text-brand-600" : "text-slate-600 hover:text-brand-600"
                }`}
              >
                {l.label}
              </Link>
            );
          })}
        </nav>
        <div className="hidden items-center gap-2 md:flex">
          {user ? (
            <>
              <Link href="/dashboard" className="btn-primary">Go to Dashboard</Link>
            </>
          ) : (
            <>
              <Link href="/login" className="btn-ghost">Login</Link>
              <Link href="/register" className="btn-primary">Get Started</Link>
            </>
          )}
        </div>
        <button
          className="rounded-lg p-2 text-slate-700 hover:bg-slate-100 md:hidden"
          onClick={() => setOpen(!open)}
          aria-label="Toggle menu"
          aria-expanded={open}
        >
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>
      {open && (
        <div className="border-t border-slate-100 bg-white px-4 pb-4 md:hidden">
          <nav className="flex flex-col py-2" aria-label="Mobile">
            {links.map((l) => (
              <Link key={l.href} href={l.href} onClick={() => setOpen(false)} className="rounded-lg px-3 py-3 text-sm font-medium text-slate-700 hover:bg-slate-50">
                {l.label}
              </Link>
            ))}
          </nav>
          <div className="mt-2 grid grid-cols-2 gap-2">
            {user ? (
              <>
                <Link href="/dashboard" onClick={() => setOpen(false)} className="btn-primary col-span-2">Go to Dashboard</Link>
              </>
            ) : (
              <>
                <Link href="/login" onClick={() => setOpen(false)} className="btn-outline">Login</Link>
                <Link href="/register" onClick={() => setOpen(false)} className="btn-primary">Get Started</Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
