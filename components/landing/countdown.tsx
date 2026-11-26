"use client";

import * as React from "react";

const pad = (n: number) => String(n).padStart(2, "0");

/** Ticks every second, but only while `active` (on screen). */
export function useCountdown(targetIso: string, active = true) {
  const [now, setNow] = React.useState<number | null>(null);
  React.useEffect(() => {
    setNow(Date.now());
    if (!active) return;
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, [active]);
  if (now === null) return { d: "--", h: "--", m: "--", s: "--" };
  let diff = Math.max(0, Date.parse(targetIso) - now);
  const d = Math.floor(diff / 86_400_000); diff -= d * 86_400_000;
  const h = Math.floor(diff / 3_600_000); diff -= h * 3_600_000;
  const m = Math.floor(diff / 60_000); diff -= m * 60_000;
  const s = Math.floor(diff / 1000);
  return { d: pad(d), h: pad(h), m: pad(m), s: pad(s) };
}

export const SAMPLE_DATE = "2027-02-06T15:00:00+05:30";

export function CountdownTiles() {
  const box = React.useRef<HTMLDivElement>(null);
  const [visible, setVisible] = React.useState(false);
  React.useEffect(() => {
    const el = box.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setVisible(e.isIntersecting));
    io.observe(el);
    return () => io.disconnect();
  }, []);
  const c = useCountdown(SAMPLE_DATE, visible);
  const cells: [string, string][] = [[c.d, "Days"], [c.h, "Hrs"], [c.m, "Min"], [c.s, "Sec"]];
  return (
    <div ref={box} className="mt-5 grid grid-cols-4 gap-1.5 text-center" aria-label="Live countdown to a sample wedding">
      {cells.map(([v, l]) => (
        <div key={l} className="bg-muted rounded-md border px-0.5 py-3.5">
          <p className="heading text-3xl leading-none font-semibold tabular-nums">{v}</p>
          <p className="text-muted-foreground mt-1.5 text-[11px]">{l}</p>
        </div>
      ))}
    </div>
  );
}
