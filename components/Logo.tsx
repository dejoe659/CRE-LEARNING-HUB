import Link from "next/link";

export function LogoMark({ size = 40 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" aria-hidden="true">
      <defs>
        <linearGradient id="lg" x1="0" y1="0" x2="48" y2="48">
          <stop stopColor="#3B82F6" />
          <stop offset="1" stopColor="#1D4ED8" />
        </linearGradient>
      </defs>
      <rect width="48" height="48" rx="14" fill="url(#lg)" />
      <rect x="11" y="15" width="26" height="20" rx="6" fill="#fff" />
      <circle cx="19" cy="25" r="3" fill="#2563EB" />
      <circle cx="29" cy="25" r="3" fill="#2563EB" />
      <rect x="22.5" y="9" width="3" height="6" rx="1.5" fill="#fff" />
      <circle cx="24" cy="8" r="2.5" fill="#22D3EE" />
    </svg>
  );
}

export default function Logo({ dark = false }: { dark?: boolean }) {
  return (
    <Link href="/" className="flex items-center gap-2.5" aria-label="CRE Learning Hub home">
      <LogoMark />
      <span className="leading-tight">
        <span className={`block text-lg font-extrabold tracking-tight ${dark ? "text-white" : "text-navy-900"}`}>
          CRE <span className="text-brand-500">Learning Hub</span>
        </span>
        <span className={`block text-[10px] font-medium uppercase tracking-widest ${dark ? "text-slate-400" : "text-slate-500"}`}>
          Computer &amp; Robotics Education
        </span>
      </span>
    </Link>
  );
}
