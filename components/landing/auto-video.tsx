"use client";

import * as React from "react";

/** Muted, looping video that starts on its own (and respects reduced motion). */
export function AutoVideo(props: React.ComponentProps<"video">) {
  const ref = React.useRef<HTMLVideoElement>(null);
  React.useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.muted = true;
    el.defaultMuted = true;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      el.controls = true;
      return;
    }
    el.play().catch(() => {});
  }, []);
  return <video ref={ref} muted loop playsInline preload="metadata" {...props} />;
}
