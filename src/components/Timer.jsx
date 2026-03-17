import React, { useEffect, useMemo, useState } from "react";

export function Timer({ duration = 600, running = false, onComplete }) {
  const [secondsLeft, setSecondsLeft] = useState(duration);

  useEffect(() => {
    setSecondsLeft(duration);
  }, [duration]);

  useEffect(() => {
    if (!running) return;
    if (secondsLeft <= 0) {
      onComplete?.();
      return;
    }

    const t = setTimeout(() => setSecondsLeft((prev) => prev - 1), 1000);
    return () => clearTimeout(t);
  }, [running, secondsLeft, onComplete]);

  const pct = useMemo(() => {
    if (!duration) return 0;
    return Math.max(0, Math.min(100, (secondsLeft / duration) * 100));
  }, [duration, secondsLeft]);

  const mm = String(Math.floor(secondsLeft / 60)).padStart(2, "0");
  const ss = String(secondsLeft % 60).padStart(2, "0");

  return (
    <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-4">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs uppercase tracking-widest text-slate-400 font-bold">
          Interview Timer
        </span>
        <span className="text-lg font-black text-cyan-400">
          {mm}:{ss}
        </span>
      </div>
      <div className="h-2 rounded-full bg-white/10 overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-cyan-500 to-purple-500 transition-all"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
