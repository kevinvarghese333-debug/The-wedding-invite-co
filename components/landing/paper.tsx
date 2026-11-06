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

/* ---------- simple fairy lights: a thin wire with small warm bulbs ---------- */

function FairyLights({ className }: { className: string }) {
  const W = 600, H = 120, n = 19;
  const p0 = [0, 6], c = [300, 150], p1 = [600, 14];
  const pt = (t: number) => [
    (1 - t) ** 2 * p0[0] + 2 * (1 - t) * t * c[0] + t * t * p1[0],
    (1 - t) ** 2 * p0[1] + 2 * (1 - t) * t * c[1] + t * t * p1[1],
  ];
  const bulbs = Array.from({ length: n }, (_, i) => pt((i + 0.5) / n));
  return (
    <svg className={className} viewBox={`0 0 ${W} ${H}`} aria-hidden>
      <path d={`M${p0} Q${c} ${p1}`} fill="none" stroke="#2A0A0E" strokeWidth="1.4" opacity=".7" />
      {bulbs.map(([x, y], i) => (
        <g key={i} className="pc-bulb" style={{ animationDelay: `${-((i * 0.37) % 2.6)}s` }}>
          <line x1={x} y1={y} x2={x} y2={y + 7} stroke="#2A0A0E" strokeWidth="1" opacity=".7" />
          <circle cx={x} cy={y + 12} r="11" fill="url(#pc-glow)" />
          <circle cx={x} cy={y + 11} r="3.6" fill="#FFE6B0" />
        </g>
      ))}
      <defs>
        <radialGradient id="pc-glow">
          <stop offset="0" stopColor="#FFD58A" stopOpacity=".75" />
          <stop offset="1" stopColor="#FFB45C" stopOpacity="0" />
        </radialGradient>
      </defs>
    </svg>
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
          .to("#pc-couple", { x: vw(-55), y: vh(-20), rotation: -18, duration: 0.5 }, 0.03)
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

        const st = (start: string, end: string) => ({ trigger: "#origin", start, end, scrub: 0.6 });
        gsap.from("#pc-s-photo", { x: -160, rotation: -14, opacity: 0, scrollTrigger: st("top 90%", "top 35%") });
        gsap.from("#pc-s-pol", { x: 180, y: 60, rotation: 24, opacity: 0, scrollTrigger: st("top 85%", "top 25%") });
        gsap.from("#pc-s-bouquet", { y: -140, rotation: 40, opacity: 0, scrollTrigger: st("top 85%", "top 30%") });
        gsap.from("#pc-s-player", { x: -120, y: 80, rotation: -18, opacity: 0, scrollTrigger: st("top 75%", "top 20%") });
        const cs = { trigger: "#pc-cards", start: "top 95%", end: "top 45%", scrub: 0.6 };
        gsap.utils.toArray<HTMLElement>(".pc-card").forEach((el, i, all) => {
          const side = (i % 3) - 1;
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

      <FairyLights className="pc-cut pc-lights l" />
      <FairyLights className="pc-cut pc-lights r" />
      <img className="pc-cut pc-float" id="pc-couple" src="/media/cut/couple.webp" alt="" aria-hidden />
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
            Check my date <ArrowRight />
          </EnquireButton>
          <a className="pc-ghost" href="#samples">See real invitations</a>
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

/* ---------- where it started ---------- */

export function PaperOrigin({ studio }: { studio: string }) {
  return (
    <section id="origin" aria-labelledby="origin-h" className="pc-section pc-origin">
      <div className="pc-wrap pc-story-grid">
        <div className="pc-collage">
          <div className="pc-cut pc-photo" id="pc-s-photo">
            <img src="/media/sc-altar.jpg" alt="Watercolour of a church aisle from the first invitation we made" />
          </div>
          <img className="pc-cut" id="pc-s-bouquet" src="/media/cut/bouquet.webp" alt="" aria-hidden />
          <figure className="pc-cut pc-polaroid" id="pc-s-pol">
            <span className="pc-tape" aria-hidden />
            <img src="/media/ph-poster.jpg" alt="A couple dancing at their reception, seen from behind" style={{ objectPosition: "50% 70%" }} />
            <figcaption>the first dance</figcaption>
          </figure>
          <img className="pc-cut" id="pc-s-player" src="/media/cut/player.webp" alt="" aria-hidden />
        </div>
        <div className="pc-story">
          <p className="pc-eyebrow">Where it started</p>
          <h2 id="origin-h">
            We made the first one for <em>our sister&apos;s wedding.</em>
          </h2>
          <p>
            Four functions across two towns, a bride&apos;s side and a groom&apos;s side, and guests invited to different days. A printed card couldn&apos;t hold all of that, and a PDF on WhatsApp felt like a circular.
          </p>
          <p>
            So we built one invitation with their story, their song, every venue and a way to reply. Each family sent links that showed only the functions their guests were invited to. Guests kept opening it right up to the wedding day. That invitation became {studio}
          </p>
          <div className="pc-note">
            <dl>
              <dt>Functions</dt><dd>4</dd>
              <dt>Families</dt><dd>2</dd>
              <dt>Guest links</dt><dd>8</dd>
              <dt>RSVP list</dt><dd>1</dd>
            </dl>
          </div>
          <p className="pc-sign">Kevin</p>
        </div>
      </div>
    </section>
  );
}

/* ---------- live samples ---------- */

const STAR = "M0 -10 L2.4 -2.4 L10 0 L2.4 2.4 L0 10 L-2.4 2.4 L-10 0 L-2.4 -2.4Z";

// Third sample: Malavika & Hari, the lotus (Thamara) design.
const THAMARA_URL = "https://malavika-hari.vercel.app/";

export function PaperSamples() {
  return (
    <section id="samples" aria-labelledby="samples-h" className="pc-section pc-samples">
      <div className="pc-wrap">
        <div className="pc-head">
          <p className="pc-eyebrow">Our work</p>
          <h2 id="samples-h">
            No two invitations <em>look the same.</em>
          </h2>
          <p>Every invitation is designed around the couple: their story, their colours, their functions. These are live. Open them on your phone.</p>
        </div>
        <div className="pc-cards many" id="pc-cards">
          <a className="pc-card" id="pc-card1" href="https://kavitha.cloud/keerthyandrosheel" target="_blank" rel="noopener">
            <div className="art">
              <img src="/media/sc-church.jpg" alt="Watercolour church from Keerthy and Rosheel's invitation" style={{ objectPosition: "50% 40%" }} />
            </div>
            <div className="meta">
              <div>
                <h3>Keerthy &amp; Rosheel</h3>
                <p className="sub">The Signature Invitation · story in chapters</p>
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
                <p className="sub">The Signature Invitation · New Year&apos;s Eve</p>
              </div>
              <span className="go">Open invite</span>
            </div>
          </a>
          <a className="pc-card" id="pc-card3" href={THAMARA_URL} target="_blank" rel="noopener">
            <div className="art pc-lotus-art">
              <img src="/media/cut/lotus.webp" alt="" aria-hidden />
              <div className="lbl"><b>Malavika &amp; Hari</b><span>Some things open slowly</span></div>
            </div>
            <div className="meta">
              <div>
                <h3>Malavika &amp; Hari</h3>
                <p className="sub">The Signature Invitation · Thamara</p>
              </div>
              <span className="go">Open invite</span>
            </div>
          </a>
          <a className="pc-card" id="pc-card4" href="https://ishani-rudra.vercel.app/" target="_blank" rel="noopener">
            <div className="art pc-temple-art">
              <svg viewBox="0 0 400 300" preserveAspectRatio="xMidYMid slice" aria-hidden>
                <path d="M110 300 V170 Q110 92 200 70 Q290 92 290 170 V300" fill="none" stroke="#D9B26A" strokeWidth="3" />
                <path d="M128 300 V176 Q128 108 200 90 Q272 108 272 176 V300" fill="none" stroke="#D9B26A" strokeWidth="1.2" opacity=".6" />
                <path d="M200 52 l8 14 h-16z" fill="#D9B26A" />
                {[[70, 60], [330, 60], [60, 210], [340, 210]].map(([x, y], i) => (
                  <circle key={i} cx={x} cy={y} r="2.2" fill="#D9B26A" opacity=".7" />
                ))}
              </svg>
              <div className="lbl"><b>Ishani &amp; Rudra</b><span>You are invited</span></div>
            </div>
            <div className="meta">
              <div>
                <h3>Ishani &amp; Rudra</h3>
                <p className="sub">The Signature Invitation · temple in the mountains</p>
              </div>
              <span className="go">Open invite</span>
            </div>
          </a>
          <a className="pc-card" id="pc-card5" href="https://ross-and-rachel.vercel.app/" target="_blank" rel="noopener">
            <div className="art pc-bloom-art">
              <img src="/media/cut/tulips.webp" alt="" aria-hidden />
              <div className="lbl"><b>Ross &amp; Rachel</b><span>You are invited</span></div>
            </div>
            <div className="meta">
              <div>
                <h3>Ross &amp; Rachel</h3>
                <p className="sub">The Classic Invitation · peonies and roses</p>
              </div>
              <span className="go">Open invite</span>
            </div>
          </a>
        </div>
      </div>
    </section>
  );
}
