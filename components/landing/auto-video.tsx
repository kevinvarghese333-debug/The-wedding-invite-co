"use client";

import * as React from "react";

/** Muted, looping video that loads and plays only while it's on screen (and respects reduced motion). */
export function AutoVideo(props: React.ComponentProps<"video">) {
  const ref = React.useRef<HTMLVideoElement>(null);
  const [near, setNear] = React.useState(false);
  React.useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.muted = true;
    el.defaultMuted = true;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) el.controls = true;
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setNear(true);
          if (!reduce) el.play().catch(() => {});
        } else if (!el.paused) el.pause();
      },
      { rootMargin: "200px" }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return <video ref={ref} muted loop playsInline preload={near ? "metadata" : "none"} {...props} />;
}
