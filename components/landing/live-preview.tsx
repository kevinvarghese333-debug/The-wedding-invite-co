"use client";

import * as React from "react";
import { ExternalLink } from "lucide-react";
import { SAMPLES, sampleHref } from "@/lib/samples";
import { track } from "@/lib/track";

const PICKABLE = SAMPLES.filter((s) => s.frame !== false);

/* Two real invitations running inside phones, side by side, so visitors can tap through one without leaving the page.
   The frames only load when the section scrolls into view. */
function Phone({ initial, label }: { initial: string; label: string }) {
  const [slug, setSlug] = React.useState(initial);
  const s = PICKABLE.find((x) => x.slug === slug) ?? PICKABLE[0];
  return (
    <figure className="flex w-full max-w-[320px] flex-col items-center gap-4">
      <div className="relative aspect-[9/19] w-full overflow-hidden rounded-[42px] border-[10px] border-[#2a0a0e] bg-[#2a0a0e] shadow-[0_30px_60px_rgba(74,15,22,0.28)]">
        <span aria-hidden className="absolute top-2 left-1/2 z-10 h-5 w-24 -translate-x-1/2 rounded-full bg-[#2a0a0e]" />
        <div className="absolute inset-0 grid place-items-center bg-[#F8F1EA] p-6 text-center text-sm text-[#6E4A47]">Loading {s.names}…</div>
        <iframe
          key={s.slug}
          data-src={s.live}
          title={`${s.names}: live wedding invitation website, ${s.style}`}
          className="pc-frame absolute inset-0 h-full w-full rounded-[32px] bg-transparent"
          loading="lazy"
          allow="autoplay; fullscreen"
        />
      </div>
      <figcaption className="w-full text-center">
        <label className="sr-only" htmlFor={`pick-${label}`}>Choose an invitation for the {label} phone</label>
        <select
          id={`pick-${label}`}
          value={slug}
          onChange={(e) => {
            setSlug(e.target.value);
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
  React.useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const load = () => el.querySelectorAll<HTMLIFrameElement>("iframe.pc-frame").forEach((f) => { if (!f.src && f.dataset.src) f.src = f.dataset.src; });
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { load(); } }, { rootMargin: "300px" });
    io.observe(el);
    const mo = new MutationObserver(() => { if (el.getBoundingClientRect().top < innerHeight + 300) load(); });
    mo.observe(el, { childList: true, subtree: true });
    return () => { io.disconnect(); mo.disconnect(); };
  }, []);

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
          <Phone initial="malavika-hari" label="first" />
          <div className="hidden w-full max-w-[320px] md:block">
            <Phone initial="ross-rachel" label="second" />
          </div>
        </div>
      </div>
    </section>
  );
}
