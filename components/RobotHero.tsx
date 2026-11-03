/** Layered, gradient-shaded SVG robot + laptop scene giving a 3D look, with CSS float animations. */
export default function RobotHero() {
  return (
    <div className="relative mx-auto aspect-square w-full max-w-[520px]">
      <div className="absolute inset-0 rounded-full bg-gradient-to-br from-brand-200/70 via-brand-100/40 to-transparent blur-2xl" />
      <svg viewBox="0 0 520 520" className="relative h-full w-full" role="img" aria-label="Friendly robot working on a laptop">
        <defs>
          <linearGradient id="body" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#F8FAFC" />
            <stop offset="1" stopColor="#CBD5E1" />
          </linearGradient>
          <linearGradient id="blue" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#60A5FA" />
            <stop offset="1" stopColor="#1D4ED8" />
          </linearGradient>
          <linearGradient id="screen" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#1E293B" />
            <stop offset="1" stopColor="#0F172A" />
          </linearGradient>
          <radialGradient id="eye" cx=".5" cy=".5" r=".5">
            <stop offset="0" stopColor="#A5F3FC" />
            <stop offset="1" stopColor="#06B6D4" />
          </radialGradient>
          <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="14" stdDeviation="14" floodColor="#0F172A" floodOpacity=".22" />
          </filter>
        </defs>

        {/* ground shadow */}
        <ellipse cx="260" cy="470" rx="190" ry="22" fill="#0F172A" opacity=".12" />

        {/* laptop */}
        <g filter="url(#shadow)">
          <path d="M70 430 L120 300 H400 L450 430 Z" fill="url(#screen)" />
          <rect x="130" y="312" width="260" height="104" rx="6" fill="#0B1220" />
          <rect x="146" y="330" width="90" height="8" rx="4" fill="#3B82F6" />
          <rect x="146" y="348" width="140" height="8" rx="4" fill="#22D3EE" opacity=".8" />
          <rect x="146" y="366" width="110" height="8" rx="4" fill="#818CF8" />
          <rect x="146" y="384" width="160" height="8" rx="4" fill="#3B82F6" opacity=".6" />
          <path d="M40 440 H480 L460 458 Q458 462 452 462 H68 Q62 462 60 458 Z" fill="url(#body)" />
        </g>

        {/* robot */}
        <g className="animate-float" style={{ transformOrigin: "260px 200px" }} filter="url(#shadow)">
          {/* antenna */}
          <rect x="256" y="40" width="8" height="40" rx="4" fill="#94A3B8" />
          <circle cx="260" cy="36" r="11" fill="url(#eye)" />
          <circle cx="260" cy="36" r="11" fill="none" stroke="#22D3EE" strokeWidth="2" className="animate-pulseRing" style={{ transformOrigin: "260px 36px" }} />
          {/* head */}
          <rect x="170" y="78" width="180" height="140" rx="46" fill="url(#body)" />
          <rect x="188" y="100" width="144" height="96" rx="32" fill="url(#screen)" />
          <g className="animate-blink" style={{ transformOrigin: "260px 148px" }}>
            <ellipse cx="226" cy="148" rx="18" ry="20" fill="url(#eye)" />
            <ellipse cx="294" cy="148" rx="18" ry="20" fill="url(#eye)" />
            <ellipse cx="220" cy="140" rx="5" ry="6" fill="#fff" opacity=".85" />
            <ellipse cx="288" cy="140" rx="5" ry="6" fill="#fff" opacity=".85" />
          </g>
          <path d="M240 178 Q260 192 280 178" stroke="#22D3EE" strokeWidth="5" strokeLinecap="round" fill="none" />
          {/* ears */}
          <rect x="150" y="124" width="22" height="50" rx="11" fill="url(#blue)" />
          <rect x="348" y="124" width="22" height="50" rx="11" fill="url(#blue)" />
          {/* neck + torso */}
          <rect x="240" y="214" width="40" height="20" rx="8" fill="#94A3B8" />
          <rect x="196" y="230" width="128" height="86" rx="34" fill="url(#body)" />
          <rect x="226" y="252" width="68" height="40" rx="14" fill="url(#blue)" />
          <circle cx="260" cy="272" r="9" fill="#fff" opacity=".9" />
          {/* arms */}
          <path d="M196 256 Q150 290 170 330" stroke="url(#blue)" strokeWidth="22" strokeLinecap="round" fill="none" />
          <path d="M324 256 Q372 290 352 330" stroke="url(#blue)" strokeWidth="22" strokeLinecap="round" fill="none" />
          <circle cx="170" cy="334" r="15" fill="url(#body)" />
          <circle cx="352" cy="334" r="15" fill="url(#body)" />
        </g>

        {/* floating chips */}
        <g className="animate-float" style={{ animationDelay: "1.2s" }}>
          <rect x="400" y="120" width="88" height="88" rx="22" fill="#fff" filter="url(#shadow)" />
          <text x="444" y="176" textAnchor="middle" fontFamily="monospace" fontSize="34" fontWeight="700" fill="#2563EB">{"</>"}</text>
        </g>
        <g className="animate-float" style={{ animationDelay: "2.4s" }}>
          <rect x="30" y="170" width="84" height="84" rx="22" fill="#fff" filter="url(#shadow)" />
          <circle cx="72" cy="212" r="20" fill="none" stroke="#2563EB" strokeWidth="6" />
          <circle cx="72" cy="212" r="7" fill="#22D3EE" />
          <path d="M72 184 V192 M72 232 V240 M44 212 H52 M92 212 H100" stroke="#2563EB" strokeWidth="6" strokeLinecap="round" />
        </g>
      </svg>
    </div>
  );
}
