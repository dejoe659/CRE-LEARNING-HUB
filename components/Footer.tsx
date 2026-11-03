import Link from "next/link";
import Logo from "./Logo";

export default function Footer() {
  return (
    <footer className="bg-navy-900 text-slate-300">
      <div className="section grid gap-10 py-14 md:grid-cols-4">
        <div className="md:col-span-2">
          <Logo dark />
          <p className="mt-4 max-w-md text-sm leading-relaxed text-slate-400">
            Animated video lessons, practical guides, quizzes and examinations for Computer and Robotics Education
            students from 100 to 400 Level.
          </p>
          <p className="mt-4 max-w-md rounded-xl border border-slate-700 bg-navy-800 p-3 text-xs text-slate-400">
            Course listings shown here are <strong className="text-slate-200">sample content</strong> and are not an
            official university curriculum.
          </p>
        </div>
        <div>
          <h4 className="mb-4 text-sm font-semibold text-white">Platform</h4>
          <ul className="space-y-2.5 text-sm">
            <li><Link className="hover:text-white" href="/courses">All courses</Link></li>
            <li><Link className="hover:text-white" href="/courses?level=100">100 Level</Link></li>
            <li><Link className="hover:text-white" href="/courses?level=200">200 Level</Link></li>
            <li><Link className="hover:text-white" href="/courses?level=300">300 Level</Link></li>
            <li><Link className="hover:text-white" href="/courses?level=400">400 Level</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="mb-4 text-sm font-semibold text-white">Company</h4>
          <ul className="space-y-2.5 text-sm">
            <li><Link className="hover:text-white" href="/about">About</Link></li>
            <li><Link className="hover:text-white" href="/contact">Contact</Link></li>
            <li><Link className="hover:text-white" href="/login">Login</Link></li>
            <li><Link className="hover:text-white" href="/register">Create account</Link></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-slate-800 py-5 text-center text-xs text-slate-500">
        © {new Date().getFullYear()} CRE Learning Hub. All rights reserved.
      </div>
    </footer>
  );
}
