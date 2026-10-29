"use client";

/* eslint-disable @next/next/no-img-element */
import { useEffect, useRef } from "react";
import { ArrowRight } from "lucide-react";
import { EnquireButton } from "@/components/landing/enquiry";

/* ---------- paper cutout shapes (cream margin via paint-order stroke) ---------- */

const LEAF = "M0 0 C8 -9 24 -10 34 0 C24 10 8 9 0 0Z";
const FROND = "M0 0 C20 -16 70 -20 110 4 C70 -2 22 4 0 0Z";
const STAR = "M0 -10 L2.4 -2.4 L10 0 L2.4 2.4 L0 10 L-2.4 2.4 L-10 0 L-2.4 -2.4Z";

function Fern({ a, b }: { a: string; b: string }) {
  const leaves: React.ReactNode[] = [];
  for (let y = 250, n = 0; y > 26; y -= 22, n++) {
    const t = (250 - y) / 224;
    const sx = 60 + (278 - y) * 0.045;
    const sc = 1.25 - t * 0.7;
    leaves.push(
      <path key={`l${n}`} className="pc-pp" d={LEAF} fill={n % 2 ? b : a} transform={`translate(${sx} ${y}) rotate(${-150 + t * 20}) scale(${sc})`} />,
      <path key={`r${n}`} className="pc-pp" d={LEAF} fill={n % 2 ? a : b} transform={`translate(${sx + 4} ${y - 6}) rotate(${-30 - t * 20}) scale(${sc})`} />,
    );
  }
  return (
    <svg viewBox="0 0 120 280" aria-hidden>
      <path className="pc-pp" fill={a} d="M57 278 C58 200 62 110 70 10 L74 11 C68 110 65 200 63 278Z" />
      {leaves}
      <path className="pc-pp" d={LEAF} fill={a} transform="translate(72 14) rotate(-80) scale(.6)" />
    </svg>
  );
}

function Palm() {
  const fronds: [number, number, string][] = [
    [-160, 1.05, "#37463C"], [-125, 1.1, "#4E6152"], [-95, 0.95, "#37463C"], [-60, 1.05, "#4E6152"], [-25, 1.1, "#37463C"], [10, 1, "#4E6152"],
  ];
  return (
    <svg viewBox="0 0 220 330" aria-hidden>
      <path className="pc-pp" fill="#A9826A" d="M100 328 C104 250 116 170 136 104 L146 107 C128 172 118 250 116 328Z" />
      {fronds.map(([r, s, c], i) => (
        <path key={i} className="pc-pp" d={FROND} fill={c} transform={`translate(140 100) rotate(${r}) scale(${s})`} />
      ))}
      {[[134, 110], [148, 112], [141, 120]].map(([x, y], i) => (
        <circle key={i} className="pc-pp" cx={x} cy={y} r="7" fill="#8A6A52" />
      ))}
    </svg>
  );
}

function Flower({ petal, mid }: { petal: string; mid: string }) {
  return (
    <svg viewBox="-30 -30 60 60" aria-hidden>
      {[0, 72, 144, 216, 288].map((r) => (
        <ellipse key={r} className="pc-pp" cx="0" cy="-13" rx="7.5" ry="12" fill={petal} transform={`rotate(${r})`} />
      ))}
      <circle className="pc-pp" r="6" fill={mid} />
    </svg>
  );
}

/* ---------- hero: cutouts fly away, envelope opens ---------- */

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
          scrollTrigger: { trigger: stage.current, start: "top 64px", end: "+=140%", pin: true, scrub: 0.7, anticipatePin: 1 },
        });
        tl.to(".pc-copy", { y: vh(-30), opacity: 0, duration: 0.35 }, 0)
          .to(".pc-hint", { opacity: 0, duration: 0.08 }, 0)
          .to("#pc-moon", { x: vw(-45), y: vh(-30), rotation: -40, duration: 0.5 }, 0.02)
          .to("#pc-sun", { x: vw(75), y: vh(-45), rotation: 30, duration: 0.5 }, 0)
          .to("#pc-fly", { x: vw(-70), y: vh(-60), rotation: -60, duration: 0.45 }, 0.06)
          .to("#pc-fl3", { x: vw(-40), y: vh(-70), rotation: -160, duration: 0.45 }, 0.04)
          .to("#pc-polA", { x: vw(-75), y: vh(5), rotation: -28, duration: 0.5 }, 0.08)
          .to("#pc-polB", { x: vw(75), y: vh(-8), rotation: 26, duration: 0.5 }, 0.1)
          .to("#pc-fern", { x: vw(-50), y: vh(25), rotation: -35, duration: 0.5 }, 0.12)
          .to("#pc-palm", { x: vw(50), y: vh(20), rotation: 18, duration: 0.5 }, 0.12)
          .to("#pc-fl1", { x: vw(-60), y: vh(40), rotation: -200, duration: 0.5 }, 0.14)
          .to("#pc-fl2", { x: vw(60), y: vh(40), rotation: 220, duration: 0.5 }, 0.14)
          .to("#pc-hills", { y: vh(30), duration: 0.45 }, 0.18)
          .to(
            ".pc-env-wrap",
            {
              y: () => {
                const s = stage.current!.getBoundingClientRect();
                const r = stage.current!.querySelector(".pc-env-wrap")!.getBoundingClientRect();
                return s.top + s.height / 2 - (r.top + r.height / 2);
              },
              scale: 1.35,
              duration: 0.4,
            },
            0.05,
          )
          .to(".pc-seal", { scale: 1.25, opacity: 0, duration: 0.1 }, 0.38)
          .to(".pc-flap", { rotationX: 180, duration: 0.14 }, 0.42)
          .set(".pc-flap", { zIndex: 1 }, 0.49)
          .to(".pc-letter", { yPercent: -62, duration: 0.2 }, 0.52)
          .to(".pc-letter .s", { scale: 1.08, duration: 0.2 }, 0.52)
          .to({}, { duration: 0.2 });

        // story pieces arrive from different sides
        const st = (start: string, end: string) => ({ trigger: "#origin", start, end, scrub: 0.6 });
        gsap.from("#pc-s-photo", { x: -160, rotation: -14, opacity: 0, scrollTrigger: st("top 90%", "top 35%") });
        gsap.from("#pc-s-pol", { x: 180, y: 60, rotation: 24, opacity: 0, scrollTrigger: st("top 85%", "top 25%") });
        gsap.from("#pc-s-leaf", { y: -140, rotation: 80, opacity: 0, scrollTrigger: st("top 85%", "top 30%") });
        gsap.from("#pc-s-blob", { scale: 0.4, scrollTrigger: st("top 90%", "top 40%") });
        // sample cards slide in from left and right
        const cs = { trigger: "#pc-cards", start: "top 95%", end: "top 45%", scrub: 0.6 };
        gsap.from("#pc-card1", { x: -220, rotation: -12, scrollTrigger: cs });
        gsap.from("#pc-card2", { x: 220, rotation: 12, scrollTrigger: cs });
      });
      const refresh = () => ScrollTrigger.refresh();
      window.addEventListener("load", refresh, { once: true });
    })();
    return () => {
      cancelled = true;
      ctx?.revert();
    };
  }, []);

  return (
    <section id="top" ref={stage} aria-labelledby="hero-h" className="pc-stage">
      <div className="pc-grain" aria-hidden />

      <div className="pc-cut" id="pc-hills" aria-hidden>
        <svg viewBox="0 0 1000 160" preserveAspectRatio="none" style={{ height: "clamp(90px,17vh,170px)" }}>
          <path className="pc-pp" vectorEffect="non-scaling-stroke" fill="#D9D8C8" d="M-20 170 C120 20 330 10 560 170Z" />
          <path className="pc-pp" vectorEffect="non-scaling-stroke" fill="#879581" d="M340 170 C520 50 790 0 1020 90 L1020 170Z" />
          <path className="pc-pp" vectorEffect="non-scaling-stroke" fill="#9FAA97" d="M-20 170 C60 110 180 90 300 170Z" />
        </svg>
      </div>

      <div className="pc-cut" id="pc-moon" aria-hidden>
        <svg viewBox="0 0 120 110">
          <path className="pc-pp" fill="#E9D6A0" d="M58 8 A44 44 0 1 0 58 96 A36 36 0 1 1 58 8Z" />
          <path className="pc-pp" d={STAR} fill="#E9D6A0" transform="translate(88 26) scale(1.1)" />
          <path className="pc-pp" d={STAR} fill="#C5A18A" transform="translate(104 62) scale(.7)" />
          <path className="pc-pp" d={STAR} fill="#E9D6A0" transform="translate(80 92) scale(.55)" />
        </svg>
      </div>

      <div className="pc-cut" id="pc-sun" aria-hidden>
        <svg viewBox="0 0 100 100">
          <circle className="pc-pp" cx="50" cy="50" r="47" fill="#C9785A" />
          <circle className="pc-pp" cx="50" cy="50" r="30" fill="#D9906F" style={{ strokeWidth: 3 }} />
        </svg>
      </div>

      <div className="pc-cut" id="pc-fly" aria-hidden>
        <svg viewBox="0 0 60 50">
          <path className="pc-pp" fill="#C5A18A" d="M30 26 C20 4 2 2 4 16 C6 26 18 28 30 26Z" />
          <path className="pc-pp" fill="#C9785A" d="M30 26 C40 4 58 2 56 16 C54 26 42 28 30 26Z" />
          <path className="pc-pp" fill="#A9826A" d="M30 27 C22 34 14 46 22 46 C28 46 30 36 30 27Z" />
          <path className="pc-pp" fill="#C5A18A" d="M30 27 C38 34 46 46 38 46 C32 46 30 36 30 27Z" />
        </svg>
      </div>

      <div className="pc-cut" id="pc-fl1" aria-hidden><Flower petal="#EBCDB8" mid="#C9785A" /></div>
      <div className="pc-cut" id="pc-fl2" aria-hidden><Flower petal="#F2E6D2" mid="#879581" /></div>
      <div className="pc-cut" id="pc-fl3" aria-hidden><Flower petal="#C5A18A" mid="#37463C" /></div>
      <div className="pc-cut" id="pc-fern" aria-hidden><Fern a="#37463C" b="#4E6152" /></div>
      <div className="pc-cut" id="pc-palm" aria-hidden><Palm /></div>

      <figure className="pc-cut pc-polaroid" id="pc-polA">
        <span className="pc-tape" aria-hidden />
        <img src="/media/real-hero.jpg" alt="Keerthy and Rosheel on the beach at sunset" />
        <figcaption>Keerthy &amp; Rosheel</figcaption>
      </figure>
      <figure className="pc-cut pc-polaroid" id="pc-polB">
        <span className="pc-tape" aria-hidden />
        <img src="/media/sc-polaroid.jpg" alt="Keerthy and Rosheel's first photo together" />
        <figcaption>our first photo</figcaption>
      </figure>

      <div className="pc-copy">
        <p className="pc-eyebrow">Wedding invitation websites · Kerala</p>
        <h1 id="hero-h">
          More than an <em>invitation.</em>
        </h1>
        <p className="pc-lede">One link that invites, informs and counts your guests. Designed for the two of you, sent on WhatsApp.</p>
        <div className="pc-cta">
          <EnquireButton size="lg" origin="hero" className="rounded-full">
            Plan your invitation <ArrowRight />
          </EnquireButton>
          <a className="pc-ghost" href="#pricing">From ₹4,999</a>
        </div>
      </div>

      <div className="pc-env-wrap">
        <div className="pc-env" aria-hidden>
          <div className="pc-env-back" />
          <div className="pc-letter">
            <span className="s">Tap. Open. Celebrate.</span>
            <span className="t">One link · every guest</span>
          </div>
          <div className="pc-env-front" />
          <div className="pc-flap" />
          <div className="pc-seal">W I</div>
        </div>
        <p className="pc-hint">Scroll to open</p>
      </div>
    </section>
  );
}

/* ---------- where it started ---------- */

export function PaperStory({ studio }: { studio: string }) {
  return (
    <section id="origin" aria-labelledby="origin-h" className="pc-section pc-origin">
      <div className="pc-wrap pc-story-grid">
        <div className="pc-collage">
          <div className="pc-blob" id="pc-s-blob" aria-hidden />
          <div className="pc-cut pc-photo" id="pc-s-photo">
            <img src="/media/real-hero.jpg" alt="Keerthy and Rosheel holding hands on the beach at sunset" />
          </div>
          <div className="pc-cut" id="pc-s-leaf" aria-hidden><Fern a="#879581" b="#9FAA97" /></div>
          <figure className="pc-cut pc-polaroid" id="pc-s-pol">
            <span className="pc-tape" aria-hidden />
            <img src="/media/sc-polaroid.jpg" alt="Polaroid of Keerthy and Rosheel's first photo together" />
            <figcaption>our first photo</figcaption>
          </figure>
        </div>
        <div className="pc-story">
          <p className="pc-eyebrow">Where it started</p>
          <h2 id="origin-h">
            We made the first one for <em>my sister&apos;s wedding.</em>
          </h2>
          <p>
            Keerthy and Rosheel had four functions across North Paravur and Nedumbassery, a bride&apos;s side and a groom&apos;s side, and guests invited to different days. A printed card couldn&apos;t hold all of that, and a PDF on WhatsApp felt like a circular.
          </p>
          <p>
            So we built one invitation with their story, every venue and a way to reply. Each family sent links that showed only the functions their guests were invited to. That invitation became {studio}
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

export function PaperSamples() {
  return (
    <section id="samples" aria-labelledby="samples-h" className="pc-section pc-samples">
      <div className="pc-wrap">
        <div className="pc-head">
          <p className="pc-eyebrow">Two couples, two stories</p>
          <h2 id="samples-h">
            No two invitations <em>look the same.</em>
          </h2>
          <p>A sunset beach for one couple, a New Year&apos;s midnight for another. Open them on your phone.</p>
        </div>
        <div className="pc-cards" id="pc-cards">
          <a className="pc-card" id="pc-card1" href="https://kavitha.cloud/keerthyandrosheel" target="_blank" rel="noopener">
            <div className="art">
              <img src="/media/real-hero.jpg" alt="Keerthy and Rosheel's invitation cover" style={{ objectPosition: "50% 35%" }} />
            </div>
            <div className="meta">
              <div>
                <h3>Keerthy &amp; Rosheel</h3>
                <p className="sub">14 Nov 2026 · North Paravur</p>
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
                <p className="sub">1 Jan 2027 · Kochi</p>
              </div>
              <span className="go">Open invite</span>
            </div>
          </a>
        </div>
      </div>
    </section>
  );
}
