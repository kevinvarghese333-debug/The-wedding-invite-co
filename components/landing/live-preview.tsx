"use client";

import * as React from "react";
import { ExternalLink, Play } from "lucide-react";
import { SAMPLES, sampleHref } from "@/lib/samples";
import { track } from "@/lib/track";

const PICKABLE = SAMPLES.filter((s) => s.frame !== false);

/* Two real invitations running inside phones, side by side.
   Only one plays at a time: when a guest taps into one phone, the other closes (which stops its music)
   and shows a "Tap to open" cover. Frames load only once the section is near the screen. */
function Phone({
  index,
  initial,
  label,
  near,
  paused,
  onActivate,
}: {
  index: number;
  initial: string;
  label: string;
  near: boolean;
  paused: boolean;
  onActivate: (i: number) => void;
}) {
  const [slug, setSlug] = React.useState(initial);
  const frame = React.useRef<HTMLIFrameElement>(null);
  const s = PICKABLE.find((x) => x.slug === slug) ?? PICKABLE[0];

  // A tap inside a cross-site frame moves focus to it; that's how we know which phone is in use.
  React.useEffect(() => {
    const onBlur = () => {
      setTimeout(() => {
        if (frame.current && document.activeElement === frame.current) onActivate(index);
      }, 0);
    };
    window.addEventListener("blur", onBlur);
    return () => window.removeEventListener("blur", onBlur);
  }, [index, onActivate]);

  return (
    <figure className="flex w-full max-w-[320px] flex-col items-center gap-4">
      <div
        className="relative aspect-[9/19] w-full overflow-hidden rounded-[42px] border-[10px] border-[#2a0a0e] bg-[#2a0a0e] shadow-[0_30px_60px_rgba(74,15,22,0.28)]"
        onPointerDown={() => onActivate(index)}
      >
        <span aria-hidden className="absolute top-2 left-1/2 z-20 h-5 w-24 -translate-x-1/2 rounded-full bg-[#2a0a0e]" />
        <div className="absolute inset-0 grid place-items-center bg-[#F8F1EA] p-6 text-center text-sm text-[#6E4A47]">Loading {s.names}…</div>
        {near && !paused ? (
          <iframe
            ref={frame}
            key={s.slug}
            src={s.live}
            title={`${s.names}: live wedding invitation website, ${s.style}`}
            className="absolute inset-0 h-full w-full rounded-[32px] bg-transparent"
            allow="autoplay; fullscreen"
          />
        ) : null}
        {paused ? (
          <button
            type="button"
            onClick={() => onActivate(index)}
            className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-4 rounded-[32px] bg-[radial-gradient(ellipse_at_50%_45%,#7C1A24,#4A0C12)] p-6 text-center text-[#FBEFE6]"
          >
            <span className="grid size-14 place-items-center rounded-full bg-[#E6BF96] text-[#3A0D12] shadow-lg">
              <Play className="ml-0.5 size-6" aria-hidden />
            </span>
            <span className="heading text-2xl leading-tight">{s.names}</span>
            <span className="text-[11px] tracking-[0.24em] text-[#F4D9C8] uppercase">Tap to open</span>
          </button>
        ) : null}
      </div>
      <figcaption className="w-full text-center">
        <label className="sr-only" htmlFor={`pick-${label}`}>Choose an invitation for the {label} phone</label>
        <select
          id={`pick-${label}`}
          value={slug}
          onChange={(e) => {
            setSlug(e.target.value);
            onActivate(index);
            track("ViewContent", { content_name: e.target.value, origin: "live-preview" });
          }}
          className="mx-auto block max-w-full rounded-full border border-[#EAD9CD] bg-[#FFFAF5] px-4 py-2 text-[15px] font-medium text-[#4A0F16]"
        >
          {PICKABLE.map((x) => (
            <option key={x.slug} value={x.slug}>
              {x.names}
            </option>
          ))}
        </select>
        <p className="mt-2 text-[13px] text-[#6E4A47]">{s.style}</p>
        <a href={sampleHref(s.slug)} target="_blank" rel="noopener" className="mt-1 inline-flex items-center gap-1 text-[13px] font-medium text-[#4A0F16] underline underline-offset-4">
          Open full screen <ExternalLink className="size-3.5" aria-hidden />
        </a>
      </figcaption>
    </figure>
  );
}

export function LivePreview() {
  const ref = React.useRef<HTMLDivElement>(null);
  const [near, setNear] = React.useState(false);
  const [active, setActive] = React.useState<number | null>(null);
  const [wide, setWide] = React.useState(false);

  React.useEffect(() => {
    const mq = window.matchMedia("(min-width: 768px)");
    const update = () => setWide(mq.matches);
    update();
    mq.addEventListener("change", update);
    const el = ref.current;
    const io = el ? new IntersectionObserver(([e]) => e.isIntersecting && setNear(true), { rootMargin: "300px" }) : null;
    if (el && io) io.observe(el);
    return () => {
      mq.removeEventListener("change", update);
      io?.disconnect();
    };
  }, []);

  const activate = React.useCallback((i: number) => setActive(i), []);

  return (
    <section id="try" aria-labelledby="try-h" className="pc-section py-[clamp(64px,8vw,110px)]">
      <div className="pc-wrap">
        <div className="pc-head">
          <p className="pc-eyebrow">Try it right here</p>
          <h2 id="try-h">
            Two couples. <em>Two completely different invitations.</em>
          </h2>
          <p>Custom designed, not a drag-and-drop template. Tap through a real invitation below, the way your guests will on WhatsApp.</p>
        </div>
        <div ref={ref} className="mt-12 flex flex-wrap items-start justify-center gap-10 md:gap-16">
          <Phone index={0} initial="malavika-hari" label="first" near={near} paused={active === 1} onActivate={activate} />
          {wide ? <Phone index={1} initial="ross-rachel" label="second" near={near} paused={active === 0} onActivate={activate} /> : null}
        </div>
      </div>
    </section>
  );
}
