"use client";

import type { Lesson } from "@/lib/data";

type SceneKind = Lesson["scene"];

/** Position along a rectangle loop, p in [0,1) */
function loopPoint(p: number, x: number, y: number, w: number, h: number) {
  const per = 2 * (w + h);
  let d = (((p % 1) + 1) % 1) * per;
  if (d < w) return { x: x + d, y };
  d -= w;
  if (d < h) return { x: x + w, y: y + d };
  d -= h;
  if (d < w) return { x: x + w - d, y: y + h };
  d -= w;
  return { x, y: y + h - d };
}

const CODE_LINES = [
  "class Robot:",
  "    def __init__(self):",
  "        self.x, self.y = 0, 0",
  "    def move(self, dx):",
  "        self.x += dx",
  "bot = Robot()",
  "bot.move(5)",
  "print(bot.x)  # 5",
];

function Circuit({ t, title }: { t: number; title: string }) {
  const ohm = /voltage|current|resistance|series|parallel|ohm/i.test(title);
  const dots = Array.from({ length: 14 }, (_, i) => loopPoint(i / 14 + t * 0.12, 90, 90, 420, 170));
  const glow = 0.55 + 0.45 * Math.sin(t * 4);
  return (
    <g>
      <rect x="90" y="90" width="420" height="170" rx="6" fill="none" stroke="#475569" strokeWidth="4" />
      <rect x="70" y="150" width="40" height="50" rx="6" fill="#1E293B" stroke="#22D3EE" strokeWidth="3" />
      <text x="90" y="182" textAnchor="middle" fill="#22D3EE" fontSize="18" fontWeight="700">{ohm ? "9V" : "IN"}</text>
      <rect x="230" y="75" width="90" height="30" rx="6" fill="#F59E0B" />
      <text x="275" y="96" textAnchor="middle" fill="#0F172A" fontSize="14" fontWeight="700">{ohm ? "450 Ω" : "GATE"}</text>
      <circle cx="430" cy="260" r="26" fill="#FDE047" opacity={glow} />
      <circle cx="430" cy="260" r="14" fill="#FACC15" />
      <text x="430" y="310" textAnchor="middle" fill="#94A3B8" fontSize="14">LED</text>
      {dots.map((d, i) => (
        <circle key={i} cx={d.x} cy={d.y} r="5" fill="#22D3EE" />
      ))}
      <text x="300" y="195" textAnchor="middle" fill="#E2E8F0" fontSize="20" fontWeight="600">{ohm ? "I = V ÷ R = 20 mA" : "Signals flow through the circuit"}</text>
    </g>
  );
}

function Code({ t }: { t: number }) {
  const total = CODE_LINES.join("\n").length;
  let chars = Math.floor(((t * 9) % (total + 30)));
  chars = Math.min(chars, total);
  let used = 0;
  return (
    <g>
      <rect x="60" y="50" width="480" height="270" rx="14" fill="#0B1220" stroke="#334155" />
      <circle cx="84" cy="72" r="5" fill="#F87171" /><circle cx="102" cy="72" r="5" fill="#FBBF24" /><circle cx="120" cy="72" r="5" fill="#34D399" />
      {CODE_LINES.map((line, i) => {
        const shown = Math.max(0, Math.min(line.length, chars - used));
        used += line.length + 1;
        return (
          <text key={i} x="84" y={110 + i * 26} fill={i % 2 ? "#93C5FD" : "#A5B4FC"} fontFamily="monospace" fontSize="16" xmlSpace="preserve" style={{ whiteSpace: "pre" }}>
            {line.slice(0, shown)}
            {shown > 0 && shown < line.length && <tspan fill="#22D3EE">▌</tspan>}
          </text>
        );
      })}
    </g>
  );
}

function Robot({ t }: { t: number }) {
  const path = [[1, 1], [4, 1], [4, 3], [7, 3], [7, 1], [9, 1]];
  const seg = (t * 0.45) % (path.length - 1);
  const i = Math.floor(seg);
  const f = seg - i;
  const [x1, y1] = path[i];
  const [x2, y2] = path[i + 1];
  const gx = 60 + (x1 + (x2 - x1) * f) * 50;
  const gy = 70 + (y1 + (y2 - y1) * f) * 55;
  const angle = Math.atan2(y2 - y1, x2 - x1);
  return (
    <g>
      {Array.from({ length: 11 }, (_, c) => <line key={"c" + c} x1={60 + c * 50} y1={70} x2={60 + c * 50} y2={290} stroke="#1E293B" />)}
      {Array.from({ length: 5 }, (_, r) => <line key={"r" + r} x1={60} y1={70 + r * 55} x2={560} y2={70 + r * 55} stroke="#1E293B" />)}
      <polyline points={path.map(([x, y]) => `${60 + x * 50},${70 + y * 55}`).join(" ")} fill="none" stroke="#3B82F6" strokeWidth="4" strokeDasharray="8 8" />
      <rect x={60 + 9 * 50 - 14} y={70 + 55 - 14} width="28" height="28" rx="6" fill="#22C55E" />
      <g transform={`translate(${gx} ${gy}) rotate(${(angle * 180) / Math.PI})`}>
        <path d={`M0 0 L120 -26 L120 26 Z`} fill="#22D3EE" opacity=".18" />
        <rect x="-18" y="-14" width="36" height="28" rx="8" fill="#F8FAFC" />
        <circle cx="6" cy="-5" r="4" fill="#06B6D4" /><circle cx="6" cy="5" r="4" fill="#06B6D4" />
      </g>
      <text x="310" y="330" textAnchor="middle" fill="#94A3B8" fontSize="14">Sense → Think → Act</text>
    </g>
  );
}

function Network({ t }: { t: number }) {
  const nodes = [{ x: 90, y: 180, l: "Sensor" }, { x: 250, y: 90, l: "Gateway" }, { x: 250, y: 270, l: "Router" }, { x: 430, y: 180, l: "Cloud" }, { x: 540, y: 90, l: "App" }];
  const edges = [[0, 1], [0, 2], [1, 3], [2, 3], [3, 4]];
  return (
    <g>
      {edges.map(([a, b], i) => (
        <line key={i} x1={nodes[a].x} y1={nodes[a].y} x2={nodes[b].x} y2={nodes[b].y} stroke="#334155" strokeWidth="3" />
      ))}
      {edges.map(([a, b], i) => {
        const p = (t * 0.5 + i * 0.23) % 1;
        return <rect key={"p" + i} x={nodes[a].x + (nodes[b].x - nodes[a].x) * p - 6} y={nodes[a].y + (nodes[b].y - nodes[a].y) * p - 6} width="12" height="12" rx="3" fill="#22D3EE" />;
      })}
      {nodes.map((n) => (
        <g key={n.l}>
          <circle cx={n.x} cy={n.y} r="26" fill="#1E293B" stroke="#3B82F6" strokeWidth="3" />
          <text x={n.x} y={n.y + 46} textAnchor="middle" fill="#CBD5E1" fontSize="13">{n.l}</text>
        </g>
      ))}
    </g>
  );
}

function Data({ t }: { t: number }) {
  const base = [7, 3, 9, 2, 6, 4, 8, 1];
  // simple bubble-sort animation: step count driven by t
  const arr = [...base];
  let steps = Math.floor(t * 3);
  outer: for (let i = 0; i < arr.length; i++) {
    for (let j = 0; j < arr.length - 1 - i; j++) {
      if (steps-- <= 0) break outer;
      if (arr[j] > arr[j + 1]) [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]];
    }
  }
  const sorted = steps > 0;
  const active = Math.floor(t * 3) % 7;
  return (
    <g>
      {arr.map((v, i) => (
        <g key={i}>
          <rect x={70 + i * 58} y={290 - v * 24} width="42" height={v * 24} rx="8" fill={sorted ? "#22C55E" : i === active || i === active + 1 ? "#22D3EE" : "#3B82F6"} />
          <text x={91 + i * 58} y={284 - v * 24} textAnchor="middle" fill="#E2E8F0" fontSize="14">{v}</text>
        </g>
      ))}
      <text x="300" y="325" textAnchor="middle" fill="#94A3B8" fontSize="14">{sorted ? "Sorted ✓" : "Bubble sort in progress…"}</text>
    </g>
  );
}

function Sensor({ t }: { t: number }) {
  const dist = 150 + 60 * Math.sin(t * 0.8);
  const waves = [0, 1, 2].map((i) => ((t * 0.9 + i / 3) % 1));
  return (
    <g>
      <rect x="60" y="150" width="60" height="70" rx="10" fill="#F8FAFC" />
      <circle cx="82" cy="185" r="12" fill="#0F172A" /><circle cx="104" cy="185" r="12" fill="#0F172A" />
      {waves.map((p, i) => (
        <path key={i} d={`M ${130 + p * dist} ${185 - 30 - p * 20} Q ${150 + p * dist} 185 ${130 + p * dist} ${185 + 30 + p * 20}`} fill="none" stroke="#22D3EE" strokeWidth="3" opacity={1 - p} />
      ))}
      <rect x={130 + dist} y="140" width="28" height="90" rx="6" fill="#F59E0B" />
      <line x1="130" y1="250" x2={130 + dist} y2="250" stroke="#94A3B8" strokeDasharray="5 5" />
      <text x={130 + dist / 2} y="272" textAnchor="middle" fill="#E2E8F0" fontSize="15">{(dist * 0.18).toFixed(0)} cm</text>
    </g>
  );
}

export default function LessonScene({ scene, t, title }: { scene: SceneKind; t: number; title: string }) {
  return (
    <svg viewBox="0 0 600 340" className="h-full w-full" role="img" aria-label={`Animated lesson: ${title}`} preserveAspectRatio="xMidYMid meet">
      <defs>
        <linearGradient id="sceneBg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#0F172A" />
          <stop offset="1" stopColor="#1E3A8A" />
        </linearGradient>
      </defs>
      <rect width="600" height="340" fill="url(#sceneBg)" />
      <g opacity=".5">
        {Array.from({ length: 12 }, (_, i) => <circle key={i} cx={30 + i * 52} cy={20} r="1.5" fill="#60A5FA" />)}
      </g>
      {scene === "circuit" && <Circuit t={t} title={title} />}
      {scene === "code" && <Code t={t} />}
      {scene === "robot" && <Robot t={t} />}
      {scene === "network" && <Network t={t} />}
      {scene === "data" && <Data t={t} />}
      {scene === "sensor" && <Sensor t={t} />}
    </svg>
  );
}

/** Static thumbnail used on course cards */
export function SceneThumb({ scene }: { scene: SceneKind }) {
  return (
    <div className="aspect-[16/8] w-full overflow-hidden bg-navy-900">
      <LessonScene scene={scene} t={4} title="Course preview" />
    </div>
  );
}
