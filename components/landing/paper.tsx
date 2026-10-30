"use client";

/* eslint-disable @next/next/no-img-element */
import { useEffect, useRef } from "react";
import { ArrowRight } from "lucide-react";
import { EnquireButton } from "@/components/landing/enquiry";

/* ---------- paper cutout shapes (cream margin via paint-order stroke) ---------- */

const LEAF = "M0 0 C8 -9 24 -10 34 0 C24 10 8 9 0 0Z";
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

/* jasmine and marigold strand, hung from the top like a thoranam */
function Strand({ n, seed = 0 }: { n: number; seed?: number }) {
  const h = n * 12 + 26;
  const beads: React.ReactNode[] = [];
  for (let i = 0; i < n; i++) {
    const y = 8 + i * 12;
    beads.push(
      (i + seed) % 4 === 3 ? (
        <g key={i}>
          <circle className="pc-pp pc-thin" cx="12" cy={y} r="7" fill="#E39A2E" />
          <circle cx="12" cy={y} r="3.4" fill="#C47A22" />
        </g>
      ) : (
        <ellipse key={i} className="pc-pp pc-thin" cx="12" cy={y} rx="4.2" ry="5.6" fill="#FFFDF6" />
      ),
    );
  }
  const ty = 8 + n * 12;
  return (
    <svg viewBox={`0 0 24 ${h}`} aria-hidden>
      <rect x="11.4" y="0" width="1.2" height={ty} fill="#B9A57A" />
      {beads}
      <path className="pc-pp pc-thin" fill="#6E8A5E" d={`M12 ${ty - 2} C5 ${ty + 2} 3 ${ty + 9} 6 ${ty + 14} C9 ${ty + 9} 11 ${ty + 5} 12 ${ty - 2}Z`} />
      <path className="pc-pp pc-thin" fill="#5E7A55" d={`M12 ${ty - 2} C19 ${ty + 2} 21 ${ty + 9} 18 ${ty + 14} C15 ${ty + 9} 13 ${ty + 5} 12 ${ty - 2}Z`} />
      <circle className="pc-pp pc-thin" cx="12" cy={ty + 3} r="8.5" fill="#D9822B" />
      <circle cx="12" cy={ty + 3} r="4" fill="#B5651D" />
    </svg>
  );
}

/* nilavilakku, the Kerala brass lamp */
function Lamp() {
  const flame = "M0 0 C-6 -8 -4 -18 0 -27 C4 -18 6 -8 0 0Z";
  return (
    <svg viewBox="0 0 120 300" aria-hidden>
      {[26, 60, 94].map((x) => (
        <g key={x} transform={`translate(${x} 128)`}>
          <path className="pc-pp pc-thin" d={flame} fill="#F0AE3C" />
          <path d={flame} fill="#FBE29A" transform="translate(0 -2) scale(.5)" />
        </g>
      ))}
      <path className="pc-pp" fill="#C9A24A" d="M60 62 C71 76 71 88 60 96 C49 88 49 76 60 62Z" />
      <rect className="pc-pp" x="56" y="94" width="8" height="40" fill="#B38C3A" />
      <path className="pc-pp" fill="#C9A24A" d="M16 130 Q60 172 104 130 Z" />
      <ellipse className="pc-pp" cx="60" cy="130" rx="44" ry="7" fill="#E2C478" />
      <path className="pc-pp" fill="#C9A24A" d="M54 156 L52 266 L68 266 L66 156Z" />
      <ellipse className="pc-pp" cx="60" cy="170" rx="11" ry="6" fill="#B38C3A" />
      <ellipse className="pc-pp" cx="60" cy="208" rx="13" ry="7" fill="#D4B05E" />
      <ellipse className="pc-pp" cx="60" cy="246" rx="15" ry="7.5" fill="#B38C3A" />
      <rect className="pc-pp" x="42" y="264" width="36" height="14" rx="5" fill="#B38C3A" />
      <path className="pc-pp" fill="#C9A24A" d="M12 298 C12 286 38 278 60 278 C82 278 108 286 108 298 Z" />
      <path d="M58 158 L57 262 L60 262 L61 158Z" fill="#E7CC87" opacity=".7" />
    </svg>
  );
}

/* banana leaf, as served at the wedding sadhya */
function BananaLeaf() {
  const blade = "M100 338 C40 280 18 160 58 70 C78 30 104 12 122 6 C142 60 170 150 162 240 C156 300 132 330 100 338Z";
  const veins: React.ReactNode[] = [];
  for (let i = 1; i < 16; i++) {
    const t = i / 16;
    const mx = 100 + 22 * t;
    const my = 330 - 320 * t;
    veins.push(<path key={`a${i}`} d={`M${mx} ${my} L${mx - 70} ${my - 36}`} />, <path key={`b${i}`} d={`M${mx} ${my} L${mx + 64} ${my - 30}`} />);
  }
  return (
    <svg viewBox="0 0 200 350" aria-hidden>
      <defs>
        <clipPath id="pc-bl-clip"><path d={blade} /></clipPath>
      </defs>
      <path className="pc-pp" fill="#5E7A55" d={blade} />
      <path fill="#4E6A48" d="M100 338 C112 240 120 120 122 6 C142 60 170 150 162 240 C156 300 132 330 100 338Z" />
      <g clipPath="url(#pc-bl-clip)" stroke="#86A276" strokeWidth="1.1" opacity=".55">{veins}</g>
      <path fill="#A9BE95" d="M99 348 C108 240 116 120 122 6 L124 7 C119 120 112 240 104 348Z" />
    </svg>
  );
}

/* layered lotus on its leaf */
function Lotus() {
  const P = "M0 0 C-16 -22 -14 -54 0 -76 C14 -54 16 -22 0 0Z";
  const row = (rots: number[], sc: number, fill: string, dy = 10) =>
    rots.map((r) => <path key={`${r}${fill}`} className="pc-pp pc-thin" d={P} fill={fill} transform={`translate(0 ${dy}) rotate(${r}) scale(${sc})`} />);
  return (
    <svg viewBox="-100 -90 200 125" aria-hidden>
      <ellipse className="pc-pp" cx="0" cy="18" rx="92" ry="15" fill="#879581" />
      <ellipse cx="0" cy="17" rx="64" ry="9" fill="#9FAA97" />
      {row([-72, -36, 0, 36, 72], 0.95, "#F3D9CF")}
      {row([-100, 100], 0.72, "#E2A691", 12)}
      {row([-54, -18, 18, 54], 0.86, "#E8B4A3")}
      {row([-30, 0, 30], 0.7, "#D9927E")}
      <path d="M0 6 C-3 -14 -3 -30 0 -44 C3 -30 3 -14 0 6Z" fill="#F7E3DA" opacity=".55" />
    </svg>
  );
}

/* wedding bells tied with a ribbon */
function Bells() {
  const B = "M0 -26 C10 -26 16 -16 16 -4 C16 8 19 14 24 20 L-24 20 C-19 14 -16 8 -16 -4 C-16 -16 -10 -26 0 -26Z";
  const bell = (x: number, r: number) => (
    <g transform={`translate(${x} 78) rotate(${r})`}>
      <circle className="pc-pp pc-thin" cx="0" cy="27" r="5" fill="#B8913F" />
      <path className="pc-pp" d={B} fill="#D4AF5A" />
      <rect x="-25" y="18" width="50" height="5" rx="2.5" fill="#B8913F" />
      <path d="M-8 -18 C-12 -8 -12 6 -14 14 L-10 14 C-9 4 -8 -8 -5 -18Z" fill="#EBD08A" />
    </g>
  );
  return (
    <svg viewBox="0 0 120 112" aria-hidden>
      <path className="pc-pp pc-thin" fill="#B5674B" d="M58 22 C54 34 50 42 44 52 L49 51 L50 56 C55 44 59 33 61 22Z" />
      <path className="pc-pp pc-thin" fill="#B5674B" d="M62 22 C66 34 70 42 76 52 L71 51 L70 56 C65 44 61 33 59 22Z" />
      {bell(44, 12)}
      {bell(76, -12)}
      <path className="pc-pp" fill="#C9785A" d="M60 20 C44 4 26 8 30 20 C34 30 50 26 60 20Z" />
      <path className="pc-pp" fill="#C9785A" d="M60 20 C76 4 94 8 90 20 C86 30 70 26 60 20Z" />
      <circle className="pc-pp pc-thin" cx="60" cy="20" r="5.5" fill="#A95F44" />
    </svg>
  );
}

/* two wedding rings */
function Rings() {
  const ring = (cx: number, cy: number) => `M${cx - 36} ${cy} a36 36 0 1 0 72 0 a36 36 0 1 0 -72 0Z M${cx - 29} ${cy} a29 29 0 1 1 58 0 a29 29 0 1 1 -58 0Z`;
  return (
    <svg viewBox="0 0 150 112" aria-hidden>
      <defs>
        <clipPath id="pc-ring-clip"><rect x="78" y="62" width="30" height="50" /></clipPath>
      </defs>
      <path className="pc-pp" fillRule="evenodd" fill="#D4AF5A" d={ring(56, 68)} />
      <path className="pc-pp" fillRule="evenodd" fill="#E2C277" d={ring(96, 62)} />
      <path fillRule="evenodd" fill="#D4AF5A" d={ring(56, 68)} clipPath="url(#pc-ring-clip)" />
      <rect className="pc-pp pc-thin" x="89" y="22" width="14" height="6" rx="2" fill="#C9A24A" />
      <path className="pc-pp pc-thin" fill="#F7F4EE" d="M96 6 L106 16 L96 25 L86 16Z" />
      <path d="M96 6 L100 16 L96 25Z" fill="#E4E7EC" />
      <path d="M30 52 C34 42 42 36 50 34" stroke="#F1DC9C" strokeWidth="2.5" fill="none" strokeLinecap="round" />
    </svg>
  );
}

function Marigold() {
  return (
    <svg viewBox="-30 -30 60 60" aria-hidden>
      {Array.from({ length: 12 }, (_, i) => (
        <ellipse key={i} className="pc-pp pc-thin" cx="0" cy="-14" rx="5.5" ry="10" fill="#E8A33D" transform={`rotate(${i * 30})`} />
      ))}
      {Array.from({ length: 8 }, (_, i) => (
        <ellipse key={`b${i}`} cx="0" cy="-8" rx="4.5" ry="7" fill="#D98A2B" transform={`rotate(${i * 45 + 20})`} />
      ))}
      <circle r="5" fill="#B5651D" />
    </svg>
  );
}

function Jasmine() {
  return (
    <svg viewBox="-30 -30 60 60" aria-hidden>
      {[0, 72, 144, 216, 288].map((r) => (
        <ellipse key={r} className="pc-pp pc-thin" cx="0" cy="-13" rx="5.5" ry="13" fill="#FFFDF7" transform={`rotate(${r})`} />
      ))}
      <circle r="3.5" fill="#E9D6A0" />
    </svg>
  );
}

const STRANDS: { x: string; n: number; side: "l" | "r"; m?: boolean }[] = [
  { x: "1.5%", n: 13, side: "l" }, { x: "4.6%", n: 6, side: "l", m: true }, { x: "7.7%", n: 16, side: "l" }, { x: "10.8%", n: 9, side: "l", m: true }, { x: "13.9%", n: 4, side: "l" },
  { x: "84.6%", n: 4, side: "r" }, { x: "87.7%", n: 9, side: "r", m: true }, { x: "90.8%", n: 16, side: "r" }, { x: "93.9%", n: 6, side: "r", m: true }, { x: "97%", n: 13, side: "r" },
];

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
          .to(".pc-strand.l", { y: vh(-45), rotation: -8, duration: 0.4, stagger: 0.015 }, 0)
          .to(".pc-strand.r", { y: vh(-45), rotation: 8, duration: 0.4, stagger: 0.015 }, 0)
          .to("#pc-bells", { x: vw(-55), y: vh(-45), rotation: -45, duration: 0.5 }, 0.02)
          .to("#pc-rings", { x: vw(60), y: vh(-45), rotation: 50, duration: 0.5 }, 0.02)
          .to("#pc-fl3", { x: vw(-40), y: vh(-70), rotation: -160, duration: 0.45 }, 0.04)
          .to("#pc-polA", { x: vw(-75), y: vh(5), rotation: -28, duration: 0.5 }, 0.08)
          .to("#pc-polB", { x: vw(75), y: vh(-8), rotation: 26, duration: 0.5 }, 0.1)
          .to("#pc-lamp", { x: vw(-60), y: vh(15), rotation: -22, duration: 0.5 }, 0.12)
          .to("#pc-banana", { x: vw(55), y: vh(20), rotation: 20, duration: 0.5 }, 0.12)
          .to("#pc-lotus", { x: vw(40), y: vh(45), rotation: 25, duration: 0.5 }, 0.15)
          .to("#pc-fl1", { x: vw(-60), y: vh(40), rotation: -200, duration: 0.5 }, 0.14)
          .to("#pc-fl2", { x: vw(60), y: vh(40), rotation: 220, duration: 0.5 }, 0.14)
          .to("#pc-kasavu", { y: 80, duration: 0.3 }, 0.18)
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

      <div className="pc-kasavu" id="pc-kasavu" aria-hidden />

      {STRANDS.map((st, i) => (
        <div key={st.x} className={`pc-cut pc-strand ${st.side}${st.m ? "" : " m-hide"}`} style={{ left: st.x }} aria-hidden>
          <Strand n={st.n} seed={i} />
        </div>
      ))}

      <div className="pc-cut" id="pc-bells" aria-hidden><Bells /></div>
      <div className="pc-cut" id="pc-rings" aria-hidden><Rings /></div>
      <div className="pc-cut" id="pc-fl1" aria-hidden><Marigold /></div>
      <div className="pc-cut" id="pc-fl2" aria-hidden><Jasmine /></div>
      <div className="pc-cut" id="pc-fl3" aria-hidden><Jasmine /></div>
      <div className="pc-cut" id="pc-banana" aria-hidden><BananaLeaf /></div>
      <div className="pc-cut" id="pc-lamp" aria-hidden><Lamp /></div>

      <figure className="pc-cut pc-polaroid" id="pc-polA">
        <span className="pc-tape" aria-hidden />
        <img src="/media/real-hero.jpg" alt="Keerthy and Rosheel on the beach at sunset" />
        <figcaption>Keerthy &amp; Rosheel</figcaption>
      </figure>
      <figure className="pc-cut pc-polaroid" id="pc-polB">
        <span className="pc-tape" aria-hidden />
        <img src="/media/ph-p1.jpg" alt="Keerthy and Rosheel under fairy lights" />
        <figcaption>under the lights</figcaption>
      </figure>

      <div className="pc-cut" id="pc-lotus" aria-hidden><Lotus /></div>

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
          <a className="pc-ghost" href="#samples">See samples</a>
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
          <div className="pc-seal"><img src="/media/seal.webp" alt="" width={480} height={480} /></div>
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

/* ---------- wax seal with the TWIC mark ---------- */

export const SEAL_BLOB = "M94.1 43.7 Q95.4 50.0 94.3 56.3 Q93.1 62.6 91.1 68.9 Q89.1 75.1 85.2 80.6 Q81.3 86.1 75.6 89.9 Q69.9 93.6 63.2 94.3 Q56.5 95.1 50.1 94.6 Q43.7 94.1 37.3 93.0 Q30.9 91.9 25.9 87.8 Q20.8 83.6 14.8 80.1 Q8.8 76.5 7.1 69.8 Q5.5 63.1 5.4 56.5 Q5.3 50.0 5.7 43.6 Q6.1 37.1 8.3 30.8 Q10.4 24.6 15.5 20.4 Q20.7 16.1 25.3 11.1 Q29.9 6.1 36.5 4.2 Q43.1 2.3 49.9 2.7 Q56.8 3.1 63.0 5.5 Q69.2 7.9 75.6 10.5 Q82.0 13.1 86.0 18.7 Q90.0 24.3 91.4 30.9 Q92.7 37.4 94.1 43.7Z";
const LEAF_PATHS = ["M12 22V5", "M12 17c-3.5-.5-5.5-2.6-6-5.5 3.2.2 5.4 2.2 6 5.5z", "M12 17c3.5-.5 5.5-2.6 6-5.5-3.2.2-5.4 2.2-6 5.5z", "M12 11c-2.6-.6-4-2.3-4.2-4.6 2.5.3 4 2 4.2 4.6z", "M12 11c2.6-.6 4-2.3 4.2-4.6-2.5.3-4 2-4.2 4.6z"];

function Leaf({ stroke, dx = 0, dy = 0, opacity = 1 }: { stroke: string; dx?: number; dy?: number; opacity?: number }) {
  return (
    <g transform={`translate(${39.5 + dx} ${21 + dy}) scale(.875)`} fill="none" stroke={stroke} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" opacity={opacity}>
      {LEAF_PATHS.map((d) => <path key={d} d={d} />)}
    </g>
  );
}

export function WaxSeal({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 100" className={className} role="img" aria-label="Wax seal with the TWIC mark of The Wedding Invite Co.">
      <defs>
        <radialGradient id="wx-wax" cx="36%" cy="30%" r="78%">
          <stop offset="0" stopColor="#DE9F82" />
          <stop offset=".45" stopColor="#C26E50" />
          <stop offset="1" stopColor="#97492F" />
        </radialGradient>
        <radialGradient id="wx-disc" cx="50%" cy="56%" r="60%">
          <stop offset="0" stopColor="#B4603F" />
          <stop offset=".75" stopColor="#BC6A4C" />
          <stop offset="1" stopColor="#CF8366" />
        </radialGradient>
        <path id="wx-arc" d="M50 18.5 a31.5 31.5 0 1 1 -0.01 0" />
      </defs>
      <path d={SEAL_BLOB} fill="url(#wx-wax)" />
      <path d={SEAL_BLOB} fill="none" stroke="#7E3826" strokeOpacity=".35" strokeWidth="1" />
      <ellipse cx="28" cy="20" rx="12" ry="4.5" transform="rotate(-32 28 20)" fill="#fff" opacity=".16" />
      {/* pressed disc: dark rim top-left, light rim bottom-right */}
      <circle cx="50" cy="50" r="35" fill="url(#wx-disc)" />
      <circle cx="49.4" cy="49.4" r="35" fill="none" stroke="#7A3622" strokeOpacity=".55" strokeWidth="1.4" />
      <circle cx="50.6" cy="50.6" r="35" fill="none" stroke="#EDB59A" strokeOpacity=".5" strokeWidth="1" />
      <circle cx="50" cy="50" r="27.5" fill="none" stroke="#F0C3AC" strokeOpacity=".45" strokeWidth=".6" />
      <text fontFamily="'DM Sans', sans-serif" fontSize="4.6" fontWeight="600" letterSpacing="1" fill="#F6DCCD" opacity=".85">
        <textPath href="#wx-arc" textLength="190" lengthAdjust="spacing">THE WEDDING INVITE CO · MORE THAN AN INVITATION ·</textPath>
      </text>
      <Leaf stroke="#7A3622" dx={-0.5} dy={-0.5} opacity={0.6} />
      <Leaf stroke="#F6DCCD" />
      <text x="49.5" y="61.5" textAnchor="middle" fontFamily="'Cormorant Garamond', Georgia, serif" fontWeight="600" fontSize="13" letterSpacing="1.6" fill="#7A3622" opacity=".6">TWIC</text>
      <text x="50" y="62" textAnchor="middle" fontFamily="'Cormorant Garamond', Georgia, serif" fontWeight="600" fontSize="13" letterSpacing="1.6" fill="#F6DCCD">TWIC</text>
    </svg>
  );
}
