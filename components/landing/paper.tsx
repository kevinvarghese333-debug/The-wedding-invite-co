"use client";

/* eslint-disable @next/next/no-img-element */
import { useEffect, useRef } from "react";
import { ArrowRight } from "lucide-react";
import { EnquireButton } from "@/components/landing/enquiry";

const HEADLINE = "People don't remember boring invitation cards. They remember experiences.";
const LINES_WIDE = ["PEOPLE DON'T REMEMBER", "BORING INVITATION CARDS.", "THEY REMEMBER", "EXPERIENCES."];
const LINES_NARROW = ["PEOPLE DON'T", "REMEMBER BORING", "INVITATION CARDS.", "THEY REMEMBER", "EXPERIENCES."];

/* ---------- dot-matrix headline that lights up around the cursor ---------- */

function DotHeadline() {
  const wrap = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const el = wrap.current!;
    const cv = canvas.current!;
    const ctx = cv.getContext("2d")!;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let dots: { x: number; y: number }[] = [];
    let base: HTMLCanvasElement | null = null;
    let W = 0, H = 0, gap = 6, r = 1.7, R = 150;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const target = { x: -999, y: -999 };
    const pos = { x: -999, y: -999 };
    let hovering = false;
    let raf = 0;
    let t0 = performance.now();
    let visible = true;

    const build = () => {
      W = el.clientWidth;
      const narrow = W < 640;
      const lines = narrow ? LINES_NARROW : LINES_WIDE;
      gap = narrow ? 4 : W < 1000 ? 5 : 6;
      r = gap * 0.34;
      R = narrow ? 95 : 160;
      const probe = document.createElement("canvas").getContext("2d")!;
      const family = "Anton, Impact, 'Arial Narrow', sans-serif";
      probe.font = `100px ${family}`;
      const widest = Math.max(...lines.map((l) => probe.measureText(l).width));
      const size = Math.min(Math.floor((100 * W * 0.98) / widest), narrow ? 64 : 112);
      const lh = size * 1.04;
      H = Math.ceil(lh * lines.length);
      el.style.height = `${H}px`;
      cv.width = W * dpr; cv.height = H * dpr;
      cv.style.width = `${W}px`; cv.style.height = `${H}px`;

      const off = document.createElement("canvas");
      off.width = W; off.height = H;
      const o = off.getContext("2d")!;
      o.fillStyle = "#000";
      o.font = `${size}px ${family}`;
      o.textAlign = "center";
      o.textBaseline = "alphabetic";
      lines.forEach((l, i) => o.fillText(l, W / 2, size * 0.9 + i * lh));
      const data = o.getImageData(0, 0, W, H).data;
      dots = [];
      for (let y = gap / 2; y < H; y += gap)
        for (let x = gap / 2; x < W; x += gap) if (data[((y | 0) * W + (x | 0)) * 4 + 3] > 120) dots.push({ x, y });

      base = document.createElement("canvas");
      base.width = W * dpr; base.height = H * dpr;
      const b = base.getContext("2d")!;
      b.scale(dpr, dpr);
      b.fillStyle = `rgba(247, 214, 196, ${narrow ? 0.5 : 0.38})`;
      for (const d of dots) { b.beginPath(); b.arc(d.x, d.y, r, 0, 6.2832); b.fill(); }
    };

    const draw = (now: number) => {
      raf = 0;
      if (!base) return;
      if (!hovering) {
        const t = (now - t0) / 1000;
        target.x = W * (0.5 + 0.38 * Math.sin(t * 0.45));
        target.y = H * (0.5 + 0.32 * Math.sin(t * 0.83 + 1.2));
        if (pos.x < -900) { pos.x = target.x; pos.y = target.y; }
      }
      pos.x += (target.x - pos.x) * 0.12;
      pos.y += (target.y - pos.y) * 0.12;
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.clearRect(0, 0, cv.width, cv.height);
      ctx.drawImage(base, 0, 0);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const t = now / 1000;
      for (const d of dots) {
        const dx = d.x - pos.x, dy = d.y - pos.y;
        const dist = Math.hypot(dx, dy);
        if (dist > R) continue;
        const k = 1 - dist / R;
        const ring = Math.max(0, 1 - Math.abs(dist / R - (0.55 + 0.12 * Math.sin(t * 2.2))) * 3.2);
        const glow = Math.min(1, k * 0.55 + ring * 0.85);
        const ang = Math.atan2(dy, dx);
        const mix = (Math.sin(ang * 2 + t * 1.3) + 1) / 2;
        const cr = Math.round(242 - 2 * mix);
        const cg = Math.round(196 - 58 * mix);
        const cb = Math.round(109 + 51 * mix);
        ctx.fillStyle = `rgba(${cr},${cg},${cb},${0.25 + glow * 0.75})`;
        ctx.beginPath();
        ctx.arc(d.x, d.y, r * (1 + glow * 0.7), 0, 6.2832);
        ctx.fill();
      }
      if (visible && !reduce) raf = requestAnimationFrame(draw);
    };

    const kick = () => { if (!raf && visible && !reduce) raf = requestAnimationFrame(draw); };
    const onMove = (e: PointerEvent) => {
      const b = cv.getBoundingClientRect();
      target.x = e.clientX - b.left; target.y = e.clientY - b.top;
      if (!hovering) { hovering = true; if (pos.x < -900) { pos.x = target.x; pos.y = target.y; } }
      kick();
    };
    const onLeave = () => { hovering = false; t0 = performance.now() - 2000; };

    let ro: ResizeObserver | undefined;
    const start = () => {
      build();
      if (reduce) { ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.drawImage(base!, 0, 0); return; }
      kick();
      let lastW = W;
      ro = new ResizeObserver(() => { if (el.clientWidth !== lastW) { lastW = el.clientWidth; build(); kick(); } });
      ro.observe(el);
    };
    const io = new IntersectionObserver(([e]) => { visible = e.isIntersecting; if (visible) kick(); });
    io.observe(el);
    const host = el.closest("section") ?? el;
    host.addEventListener("pointermove", onMove as EventListener);
    host.addEventListener("pointerleave", onLeave);
    document.fonts.load("100px Anton").then(start, start);

    return () => {
      cancelAnimationFrame(raf);
      ro?.disconnect();
      io.disconnect();
      host.removeEventListener("pointermove", onMove as EventListener);
      host.removeEventListener("pointerleave", onLeave);
    };
  }, []);

  return (
    <div ref={wrap} className="pc-dots" aria-hidden>
      <canvas ref={canvas} />
    </div>
  );
}

/* ---------- hero: maroon stage, cutouts in the corners, envelope opens on scroll ---------- */

export function PaperHero() {
  const stage = useRef<HTMLElement>(null);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let ctx: { revert: () => void } | undefined;
    let cancelled = false;
    (async () => {
      const { gsap } = await import("gsap");
      const { ScrollTrigger } = await import("gsap/ScrollTrigger");
      if (cancelled || !stage.current) return;
      gsap.registerPlugin(ScrollTrigger);
      ctx = gsap.context(() => {
        const vw = (n: number) => () => (n * window.innerWidth) / 100;
        const vh = (n: number) => () => (n * window.innerHeight) / 100;
        const tl = gsap.timeline({
          defaults: { ease: "none" },
          scrollTrigger: { trigger: stage.current, start: "top 64px", end: "+=150%", pin: true, scrub: 0.7, anticipatePin: 1 },
        });
        tl.to(".pc-copy", { y: vh(-25), opacity: 0, duration: 0.32 }, 0)
          .to(".pc-hint", { opacity: 0, duration: 0.08 }, 0)
          .to(".pc-lights.l", { y: vh(-40), rotation: -10, duration: 0.4 }, 0)
          .to(".pc-lights.r", { y: vh(-40), rotation: 10, duration: 0.4 }, 0)
          .to("#pc-bride", { x: vw(-55), y: vh(-20), rotation: -18, duration: 0.5 }, 0.03)
          .to("#pc-lotus", { x: vw(50), y: vh(-35), rotation: 30, duration: 0.5 }, 0.03)
          .to("#pc-camera", { x: vw(-55), y: vh(30), rotation: -30, duration: 0.5 }, 0.07)
          .to("#pc-ringbox", { x: vw(55), y: vh(30), rotation: 25, duration: 0.5 }, 0.07)
          .to(
            ".pc-env-wrap",
            {
              y: () => {
                const s = stage.current!.getBoundingClientRect();
                const r = stage.current!.querySelector(".pc-env")!.getBoundingClientRect();
                return s.top + s.height / 2 - (r.top + r.height / 2);
              },
              scale: 1.3,
              duration: 0.4,
            },
            0.08,
          )
          .to(".pc-seal", { scale: 1.25, opacity: 0, duration: 0.1 }, 0.4)
          .to(".pc-flap", { rotationX: 180, duration: 0.14 }, 0.44)
          .set(".pc-flap", { zIndex: 1 }, 0.51)
          .to(".pc-letter", { yPercent: -62, duration: 0.2 }, 0.54)
          .to(".pc-dawn", { opacity: 1, duration: 0.3 }, 0.62)
          .to({}, { duration: 0.12 });

        const st = (start: string, end: string) => ({ trigger: "#feel", start, end, scrub: 0.6 });
        gsap.from("#pc-s-photo", { x: -160, rotation: -14, opacity: 0, scrollTrigger: st("top 90%", "top 35%") });
        gsap.from("#pc-s-pol", { x: 180, y: 60, rotation: 24, opacity: 0, scrollTrigger: st("top 85%", "top 25%") });
        gsap.from("#pc-s-bouquet", { y: -140, rotation: 40, opacity: 0, scrollTrigger: st("top 85%", "top 30%") });
        gsap.from("#pc-s-player", { x: -120, y: 80, rotation: -18, opacity: 0, scrollTrigger: st("top 75%", "top 20%") });
        const cs = { trigger: "#pc-cards", start: "top 95%", end: "top 45%", scrub: 0.6 };
        gsap.utils.toArray<HTMLElement>(".pc-card").forEach((el, i, all) => {
          const side = all.length === 3 ? i - 1 : i ? 1 : -1;
          gsap.from(el, { x: side * 220, y: side === 0 ? 120 : 0, rotation: side * 12, scrollTrigger: cs });
        });
      });
      window.addEventListener("load", () => ScrollTrigger.refresh(), { once: true });
    })();
    return () => {
      cancelled = true;
      ctx?.revert();
    };
  }, []);

  return (
    <section id="top" ref={stage} aria-labelledby="hero-h" className="pc-stage">
      <div className="pc-velvet" aria-hidden />

      <img className="pc-cut pc-lights l" src="/media/cut/lights.webp" alt="" aria-hidden />
      <img className="pc-cut pc-lights r" src="/media/cut/lights.webp" alt="" aria-hidden />
      <img className="pc-cut pc-float" id="pc-bride" src="/media/cut/bride.webp" alt="" aria-hidden />
      <img className="pc-cut pc-float d2" id="pc-lotus" src="/media/cut/lotus.webp" alt="" aria-hidden />
      <img className="pc-cut pc-float d3" id="pc-camera" src="/media/cut/camera.webp" alt="" aria-hidden />
      <img className="pc-cut pc-float d4" id="pc-ringbox" src="/media/cut/ringbox.webp" alt="" aria-hidden />

      <div className="pc-copy">
        <p className="pc-eyebrow">Wedding invitation websites · Kerala</p>
        <h1 id="hero-h" className="sr-only">{HEADLINE}</h1>
        <DotHeadline />
        <p className="pc-lede">One link that invites, informs and counts your guests. Designed for the two of you, sent on WhatsApp.</p>
        <div className="pc-cta">
          <EnquireButton size="lg" origin="hero" variant="clay" className="rounded-full">
            Plan your invitation <ArrowRight />
          </EnquireButton>
          <a className="pc-ghost" href="#samples">See samples</a>
        </div>
      </div>

      <div className="pc-env-wrap">
        <p className="pc-hint">Scroll to open</p>
        <div className="pc-env" aria-hidden>
          <div className="pc-env-back" />
          <div className="pc-letter">
            <span className="s">Tap. Open. Celebrate.</span>
          </div>
          <div className="pc-env-front" />
          <div className="pc-flap" />
          <div className="pc-seal"><img src="/media/seal.webp" alt="" width={480} height={480} /></div>
        </div>
      </div>
      <div className="pc-dawn" aria-hidden />
    </section>
  );
}

/* ---------- what guests feel ---------- */

export function PaperFeel() {
  return (
    <section id="feel" aria-labelledby="feel-h" className="pc-section pc-origin">
      <div className="pc-wrap pc-story-grid">
        <div className="pc-collage">
          <div className="pc-cut pc-photo" id="pc-s-photo">
            <img src="/media/ph-g3.jpg" alt="A couple on the beach at sunset" />
          </div>
          <img className="pc-cut" id="pc-s-bouquet" src="/media/cut/bouquet.webp" alt="" aria-hidden />
          <figure className="pc-cut pc-polaroid" id="pc-s-pol">
            <span className="pc-tape" aria-hidden />
            <img src="/media/ph-poster.jpg" alt="A couple dancing at their reception" style={{ objectPosition: "50% 70%" }} />
            <figcaption>the first dance</figcaption>
          </figure>
          <img className="pc-cut" id="pc-s-player" src="/media/cut/player.webp" alt="" aria-hidden />
        </div>
        <div className="pc-story">
          <p className="pc-eyebrow">More than an invitation</p>
          <h2 id="feel-h">
            An invitation your guests <em>keep opening.</em>
          </h2>
          <p>
            Your story, your song, the places that matter to you, every venue with directions and a way to reply. Guests open it the day it arrives and again on the morning of the wedding.
          </p>
          <p>
            Each family gets its own links, so every guest sees only the functions they are invited to, and every reply lands in one list for you.
          </p>
          <div className="pc-note">
            <dl>
              <dt>Link</dt><dd>1</dd>
              <dt>Functions</dt><dd>All</dd>
              <dt>Guest lists</dt><dd>Any</dd>
              <dt>Apps to install</dt><dd>0</dd>
            </dl>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ---------- live samples ---------- */

const STAR = "M0 -10 L2.4 -2.4 L10 0 L2.4 2.4 L0 10 L-2.4 2.4 L-10 0 L-2.4 -2.4Z";

// Third sample (the lotus / Thamara design). The card shows once its link is filled in.
const THAMARA_URL = "";

export function PaperSamples() {
  return (
    <section id="samples" aria-labelledby="samples-h" className="pc-section pc-samples">
      <div className="pc-wrap">
        <div className="pc-head">
          <p className="pc-eyebrow">Our work</p>
          <h2 id="samples-h">
            No two invitations <em>look the same.</em>
          </h2>
          <p>Every invitation is designed around the couple: their story, their colours, their functions. Open them on your phone.</p>
        </div>
        <div className={`pc-cards${THAMARA_URL ? " three" : ""}`} id="pc-cards">
          <a className="pc-card" id="pc-card1" href="https://kavitha.cloud/keerthyandrosheel" target="_blank" rel="noopener">
            <div className="art">
              <img src="/media/sc-church.jpg" alt="Watercolour church from Keerthy and Rosheel's invitation" style={{ objectPosition: "50% 40%" }} />
            </div>
            <div className="meta">
              <div>
                <h3>Keerthy &amp; Rosheel</h3>
                <p className="sub">The Story · watercolour chapters</p>
              </div>
              <span className="go">Open invite</span>
            </div>
          </a>
          <a className="pc-card" id="pc-card2" href="https://nila-aaron.vercel.app/" target="_blank" rel="noopener">
            <div className="art pc-night">
              <svg viewBox="0 0 400 300" preserveAspectRatio="xMidYMid slice" aria-hidden>
                <g fill="#F4E9C9">
                  {[[52, 44, 0.7], [330, 38, 0.9], [370, 120, 0.5], [24, 150, 0.5], [110, 112, 0.4]].map(([x, y, s], i) => (
                    <path key={i} d={STAR} transform={`translate(${x} ${y}) scale(${s})`} />
                  ))}
                </g>
                <circle cx="300" cy="205" r="44" fill="#F1DFA6" stroke="#2A365C" strokeWidth="3" />
                <path d="M0 300 L0 252 C80 236 150 240 200 250 C260 238 330 232 400 246 L400 300Z" fill="#1C2A52" />
                <g stroke="#0A1128" strokeWidth="4" strokeLinecap="round" fill="none">
                  <path d="M70 252 L120 160 M170 252 L120 160 M120 160 L120 132" />
                  <path d="M58 196 Q120 236 184 196" strokeWidth="2" />
                </g>
                <path d="M0 300 L0 270 C120 258 260 262 400 272 L400 300Z" fill="#26386A" />
              </svg>
              <div className="lbl">
                <b>Nila &amp; Aaron</b>
                <span>Stay up with us</span>
              </div>
            </div>
            <div className="meta">
              <div>
                <h3>Nila &amp; Aaron</h3>
                <p className="sub">New Year&apos;s Eve · moon and midnight</p>
              </div>
              <span className="go">Open invite</span>
            </div>
          </a>
          {THAMARA_URL ? (
            <a className="pc-card" id="pc-card3" href={THAMARA_URL} target="_blank" rel="noopener">
              <div className="art pc-lotus-art">
                <img src="/media/cut/lotus.webp" alt="" aria-hidden />
                <div className="lbl"><b>Thamara</b><span>Lotus</span></div>
              </div>
              <div className="meta">
                <div>
                  <h3>Thamara</h3>
                  <p className="sub">Lotus and brass, in maroon</p>
                </div>
                <span className="go">Open invite</span>
              </div>
            </a>
          ) : null}
        </div>
      </div>
    </section>
  );
}
