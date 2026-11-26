"use client";

import { useEffect } from "react";

/* Looping decorations (fairy lights, floating cut-outs, the scrolling words) run only while their section is on
   screen, and not before the page has finished loading. A section opts in with data-motion="off"; the CSS in
   globals.css pauses every animation inside it until this sets it to "on". */
export function MotionGate() {
  useEffect(() => {
    const els = [...document.querySelectorAll<HTMLElement>("[data-motion]")];
    if (!els.length) return;
    const onScreen = new Map<Element, boolean>();
    let loaded = document.readyState === "complete";
    const apply = () => {
      for (const el of els) el.dataset.motion = loaded && onScreen.get(el) ? "on" : "off";
    };
    const io = new IntersectionObserver((entries) => {
      for (const e of entries) onScreen.set(e.target, e.isIntersecting);
      apply();
    }, { rootMargin: "120px" });
    els.forEach((el) => io.observe(el));
    const onLoad = () => {
      loaded = true;
      apply();
    };
    if (!loaded) window.addEventListener("load", onLoad, { once: true });
    return () => {
      io.disconnect();
      window.removeEventListener("load", onLoad);
    };
  }, []);
  return null;
}

/** Runs `fn` once the page has loaded and the browser is idle, or straight away on the visitor's first scroll or touch. */
export function afterLoadOrScroll(fn: () => void) {
  let done = false;
  const run = () => {
    if (done) return;
    done = true;
    cleanup();
    fn();
  };
  const idle = () => {
    const w = window as Window & { requestIdleCallback?: (cb: () => void, o?: { timeout: number }) => number };
    if (w.requestIdleCallback) w.requestIdleCallback(run, { timeout: 1500 });
    else setTimeout(run, 200);
  };
  const events = ["scroll", "touchstart", "pointerdown", "keydown"] as const;
  const cleanup = () => {
    events.forEach((e) => window.removeEventListener(e, run));
    window.removeEventListener("load", idle);
  };
  events.forEach((e) => window.addEventListener(e, run, { once: true, passive: true }));
  if (document.readyState === "complete") idle();
  else window.addEventListener("load", idle, { once: true });
  return () => {
    done = true;
    cleanup();
  };
}
