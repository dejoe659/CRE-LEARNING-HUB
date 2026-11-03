"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Gauge, Maximize, Minimize, Pause, Play, RotateCcw, Volume2, VolumeX } from "lucide-react";
import LessonScene from "./LessonScene";
import { fmtDuration, Lesson } from "@/lib/data";

const RATES = [0.5, 0.75, 1, 1.25, 1.5, 2];

/**
 * Plays an uploaded video (MP4/WebM) or a Cloudflare Stream iframe when `lesson.videoUrl` is set.
 * Lessons without an uploaded video play the built-in animated explainer scene, driven by the same
 * custom controls (speed, seek, fullscreen) so the whole experience is consistent.
 * Position is saved every 5 s, on pause and on unmount, and `startAt` resumes where the student left off.
 */
export default function VideoPlayer({
  lesson, startAt = 0, onSave, onEnded,
}: { lesson: Lesson; startAt?: number; onSave: (seconds: number) => void; onEnded: () => void }) {
  const wrap = useRef<HTMLDivElement>(null);
  const video = useRef<HTMLVideoElement>(null);
  const [time, setTime] = useState(startAt);
  const [duration, setDuration] = useState(lesson.duration);
  const [playing, setPlaying] = useState(false);
  const [rate, setRate] = useState(1);
  const [menu, setMenu] = useState(false);
  const [full, setFull] = useState(false);
  const [muted, setMuted] = useState(false);
  const timeRef = useRef(startAt);
  const url = lesson.videoUrl;
  const isIframe = !!url && /cloudflarestream\.com|iframe\./.test(url);
  const isFile = !!url && !isIframe;

  const save = useCallback(() => onSave(Math.floor(timeRef.current)), [onSave]);

  // Reset when switching lesson
  useEffect(() => {
    timeRef.current = startAt;
    setTime(startAt);
    setDuration(lesson.duration);
    setPlaying(false);
    if (video.current) video.current.currentTime = startAt;
  }, [lesson.id, startAt, lesson.duration]);

  // Animated-scene clock
  useEffect(() => {
    if (isFile || isIframe || !playing) return;
    const tick = setInterval(() => {
      timeRef.current = Math.min(duration, timeRef.current + 0.1 * rate);
      setTime(timeRef.current);
      if (timeRef.current >= duration) {
        setPlaying(false);
        save();
        onEnded();
      }
    }, 100);
    return () => clearInterval(tick);
  }, [playing, rate, duration, isFile, isIframe, save, onEnded]);

  // Autosave every 5 s while playing, and on unmount
  useEffect(() => {
    if (!playing) return;
    const t = setInterval(save, 5000);
    return () => clearInterval(t);
  }, [playing, save]);
  useEffect(() => () => save(), [save]);

  useEffect(() => {
    const h = () => setFull(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", h);
    return () => document.removeEventListener("fullscreenchange", h);
  }, []);

  useEffect(() => {
    if (video.current) video.current.playbackRate = rate;
  }, [rate, url]);

  const toggle = () => {
    if (isFile && video.current) {
      if (video.current.paused) video.current.play();
      else video.current.pause();
      return;
    }
    if (timeRef.current >= duration) { timeRef.current = 0; setTime(0); }
    setPlaying((p) => { if (p) save(); return !p; });
  };

  const seek = (v: number) => {
    timeRef.current = v;
    setTime(v);
    if (video.current) video.current.currentTime = v;
  };

  const toggleFull = () => {
    if (document.fullscreenElement) document.exitFullscreen();
    else wrap.current?.requestFullscreen?.();
  };

  const onKey = (e: React.KeyboardEvent) => {
    if (e.key === " " || e.key === "k") { e.preventDefault(); toggle(); }
    if (e.key === "ArrowRight") seek(Math.min(duration, timeRef.current + 5));
    if (e.key === "ArrowLeft") seek(Math.max(0, timeRef.current - 5));
    if (e.key === "f") toggleFull();
  };

  if (isIframe)
    return (
      <div className="aspect-video overflow-hidden rounded-2xl bg-black">
        <iframe src={url} className="h-full w-full" allow="accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture" allowFullScreen title={lesson.title} />
      </div>
    );

  return (
    <div ref={wrap} tabIndex={0} onKeyDown={onKey} className="group relative aspect-video overflow-hidden rounded-2xl bg-navy-900 shadow-card outline-none focus-visible:ring-4 focus-visible:ring-brand-200" aria-label={`Video player: ${lesson.title}`}>
      {isFile ? (
        <video
          ref={video}
          src={url}
          className="h-full w-full bg-black object-contain"
          muted={muted}
          playsInline
          onLoadedMetadata={(e) => { setDuration(e.currentTarget.duration); e.currentTarget.currentTime = startAt; }}
          onTimeUpdate={(e) => { timeRef.current = e.currentTarget.currentTime; setTime(e.currentTarget.currentTime); }}
          onPlay={() => setPlaying(true)}
          onPause={() => { setPlaying(false); save(); }}
          onEnded={() => { save(); onEnded(); }}
          onClick={toggle}
        />
      ) : (
        <button className="block h-full w-full" onClick={toggle} aria-label={playing ? "Pause" : "Play"}>
          <LessonScene scene={lesson.scene} t={time} title={lesson.title} />
        </button>
      )}

      {!playing && (
        <button onClick={toggle} className="absolute inset-0 flex items-center justify-center bg-navy-900/30" aria-label="Play video">
          <span className="relative flex h-20 w-20 items-center justify-center rounded-full bg-brand-600 text-white shadow-glow">
            <span className="absolute inset-0 animate-pulseRing rounded-full bg-brand-500/60" />
            <Play size={34} className="relative ml-1" fill="currentColor" />
          </span>
        </button>
      )}

      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent px-4 pb-3 pt-10 text-white">
        <input type="range" min={0} max={duration} step={0.1} value={time} onChange={(e) => seek(Number(e.target.value))} aria-label="Seek" className="h-1.5 w-full cursor-pointer accent-brand-500" />
        <div className="mt-2 flex items-center gap-3 text-sm">
          <button onClick={toggle} aria-label={playing ? "Pause" : "Play"} className="rounded-lg p-1.5 hover:bg-white/15">{playing ? <Pause size={20} /> : <Play size={20} />}</button>
          <button onClick={() => seek(0)} aria-label="Restart" className="rounded-lg p-1.5 hover:bg-white/15"><RotateCcw size={18} /></button>
          {isFile && <button onClick={() => setMuted(!muted)} aria-label={muted ? "Unmute" : "Mute"} className="rounded-lg p-1.5 hover:bg-white/15">{muted ? <VolumeX size={18} /> : <Volume2 size={18} />}</button>}
          <span className="tabular-nums text-xs">{fmtDuration(time)} / {fmtDuration(duration)}</span>
          <div className="relative ml-auto">
            <button onClick={() => setMenu(!menu)} aria-haspopup="true" aria-expanded={menu} className="flex items-center gap-1 rounded-lg px-2 py-1.5 text-xs font-semibold hover:bg-white/15"><Gauge size={16} /> {rate}×</button>
            {menu && (
              <ul className="absolute bottom-full right-0 mb-2 w-24 overflow-hidden rounded-xl bg-navy-800 py-1 shadow-card">
                {RATES.map((r) => (
                  <li key={r}><button onClick={() => { setRate(r); setMenu(false); }} className={`w-full px-3 py-1.5 text-left text-xs hover:bg-white/10 ${r === rate ? "font-bold text-accent-400" : ""}`}>{r}×</button></li>
                ))}
              </ul>
            )}
          </div>
          <button onClick={toggleFull} aria-label="Toggle fullscreen" className="rounded-lg p-1.5 hover:bg-white/15">{full ? <Minimize size={18} /> : <Maximize size={18} />}</button>
        </div>
      </div>
    </div>
  );
}
