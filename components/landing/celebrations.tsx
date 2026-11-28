"use client";

import { ArrowRight, MessageCircle } from "lucide-react";
import { useEnquiry, type Occasion } from "@/components/landing/enquiry";
import { whatsappHref } from "@/lib/whatsapp";
import { track } from "@/lib/track";

/* "More celebrations": the invitations we make besides weddings. Each card opens the enquiry form with its occasion
   chosen, so the lead arrives saying what it's for. The little animations pause off screen (data-motion, see MotionGate)
   and are off for visitors who prefer reduced motion. */

type Card = { occasion: Occasion; title: string; text: string; cta: string; art: React.ReactNode; example?: { href: string; label: string } };

const line = { fill: "none", strokeLinecap: "round" as const, strokeLinejoin: "round" as const };

function CakeArt() {
  const ink = "#7A1E2A";
  const gold = "#C9974B";
  return (
    <svg viewBox="0 0 400 300" preserveAspectRatio="xMidYMid slice" aria-hidden>
      <g transform="translate(200 176) scale(1.28) translate(-200 -176)">
      <g className="pc-cel-bob" style={{ animationDelay: "-1s" }}>
        {[[64, 70, "#E9B8A6"], [336, 92, "#D9A35B"], [86, 214, "#C98A9A"]].map(([x, y, c], i) => (
          <g key={i} transform={`translate(${x} ${y})`}>
            <ellipse rx="15" ry="18" fill={c as string} opacity=".85" />
            <path d="M0 18 q-4 14 3 28" stroke={ink} strokeWidth="1.2" opacity=".5" {...line} />
          </g>
        ))}
      </g>
      <rect x="128" y="196" width="144" height="58" rx="8" fill="#FBF3EA" stroke={ink} strokeWidth="2.4" />
      <path d="M128 214 q18 14 36 0 t36 0 t36 0 t36 0" stroke={ink} strokeWidth="2.4" fill="#F2D4C6" />
      <rect x="152" y="150" width="96" height="48" rx="7" fill="#FBF3EA" stroke={ink} strokeWidth="2.4" />
      <path d="M152 166 q12 10 24 0 t24 0 t24 0 t24 0" stroke={ink} strokeWidth="2.2" fill="#F2D4C6" />
      <path d="M112 256 H288" stroke={gold} strokeWidth="3" {...line} />
      {[176, 200, 224].map((x, i) => (
        <g key={x}>
          <rect x={x - 3} y="122" width="6" height="28" rx="2" fill={i === 1 ? gold : "#E7B9A9"} stroke={ink} strokeWidth="1.4" />
          <path className="pc-cel-flame" style={{ animationDelay: `${-i * 0.37}s` }} d={`M${x} 104 C${x - 7} 113 ${x - 5} 121 ${x} 121 C${x + 5} 121 ${x + 7} 113 ${x} 104Z`} fill="#F2B94B" />
        </g>
      ))}
      {[[118, 120], [284, 132], [300, 196], [104, 176]].map(([x, y], i) => (
        <circle key={i} className="pc-cel-twinkle" style={{ animationDelay: `${-i * 0.6}s` }} cx={x} cy={y} r="2.6" fill={gold} />
      ))}
      </g>
    </svg>
  );
}

function MobileArt() {
  const ink = "#3F5A6E";
  return (
    <svg viewBox="0 0 400 300" preserveAspectRatio="xMidYMid slice" aria-hidden>
      <g transform="translate(200 0) scale(1.22) translate(-200 0)">
      <g className="pc-cel-sway">
        <path d="M200 0 V34" stroke={ink} strokeWidth="2" {...line} />
        <path d="M110 40 Q200 26 290 40" stroke={ink} strokeWidth="2.4" {...line} />
        <path d="M120 40 V108 M200 34 V150 M280 40 V96" stroke={ink} strokeWidth="1.4" opacity=".7" {...line} />
        <g className="pc-cel-bob">
          <path d="M120 108 a26 26 0 1 0 22 40 a20 20 0 1 1 -22 -40Z" transform="translate(-14 0)" fill="#F3D9A4" stroke={ink} strokeWidth="2" />
        </g>
        <g className="pc-cel-bob" style={{ animationDelay: "-1.2s" }}>
          <path d="M200 150 l7 15 16 2 -12 11 3 16 -14 -8 -14 8 3 -16 -12 -11 16 -2z" fill="#F2C6C2" stroke={ink} strokeWidth="2" strokeLinejoin="round" />
        </g>
        <g className="pc-cel-bob" style={{ animationDelay: "-2s" }}>
          <path d="M262 112 a14 14 0 0 1 22 -10 a18 18 0 0 1 32 8 a12 12 0 0 1 -2 24 h-50 a11 11 0 0 1 -2 -22z" transform="translate(-16 -6)" fill="#FFFFFF" stroke={ink} strokeWidth="2" />
        </g>
      </g>
      </g>
      <path d="M0 300 V262 C80 250 160 256 200 262 C260 252 330 248 400 258 V300Z" fill="#CFDDE4" />
      {[[60, 230], [340, 216], [300, 268], [90, 276]].map(([x, y], i) => (
        <circle key={i} className="pc-cel-twinkle" style={{ animationDelay: `${-i * 0.5}s` }} cx={x} cy={y} r="2.4" fill="#FFFFFF" />
      ))}
    </svg>
  );
}

function ConfettiArt() {
  const bits = Array.from({ length: 18 }, (_, i) => i);
  const colours = ["#E3C47E", "#F2C6C2", "#FBF3EA", "#C9974B"];
  return (
    <svg viewBox="0 0 400 300" preserveAspectRatio="xMidYMid slice" aria-hidden>
      {bits.map((i) => {
        const x = 14 + ((i * 53) % 372);
        const w = i % 3 === 0 ? 4 : 8;
        return (
          <rect
            key={i}
            className="pc-cel-fall"
            style={{ animationDelay: `${-(i * 0.47) % 6}s`, animationDuration: `${5 + (i % 4)}s` }}
            x={x}
            y="-16"
            width={w}
            height={i % 3 === 0 ? 4 : 12}
            rx={i % 3 === 0 ? 2 : 1}
            fill={colours[i % colours.length]}
          />
        );
      })}
      <text x="200" y="168" textAnchor="middle" fill="#E3C47E" style={{ fontFamily: "var(--pc-script)", fontSize: 74 }}>
        &amp; more
      </text>
    </svg>
  );
}

const CARDS: Card[] = [
  {
    occasion: "Engagement",
    title: "Engagements",
    text: "Betrothals, ring ceremonies and nischayam. Share the date and the venue, and see who's coming.",
    cta: "Plan an engagement invite",
    art: (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src="/media/opt/work-amala-480.webp"
        srcSet="/media/opt/work-amala-480.webp 480w, /media/opt/work-amala-800.webp 800w"
        sizes="(max-width: 700px) 80vw, 280px"
        width={480}
        height={360}
        loading="lazy"
        decoding="async"
        alt="Amala and Lino's engagement invitation: a powder-blue envelope sealed in gold"
      />
    ),
    example: { href: "/i/amala-lino", label: "Open Amala & Lino's" },
  },
  {
    occasion: "Birthday",
    title: "Birthdays",
    text: "First birthdays, sweet sixteens, 50ths and 60ths. A theme they'll love, a countdown, the map and RSVP, so you know how much cake to order.",
    cta: "Plan a birthday invite",
    art: <CakeArt />,
  },
  {
    occasion: "Baby shower",
    title: "Baby showers",
    text: "Baby showers and the family functions before the little one arrives. Soft colours, the date and the place, and RSVP for everyone you invite.",
    cta: "Plan a baby shower invite",
    art: <MobileArt />,
  },
  {
    occasion: "Something else",
    title: "And more",
    text: "Housewarmings, anniversaries, baptisms and naming ceremonies. If you're inviting people, we can make it beautiful.",
    cta: "Tell us what it is",
    art: <ConfettiArt />,
  },
];

const BG: Record<string, string> = {
  Engagement: "#EEF2F6",
  Birthday: "radial-gradient(ellipse at 50% 62%, #FBEDE4, #F1D3C4 75%)",
  "Baby shower": "radial-gradient(ellipse at 50% 40%, #F4F8FA, #DCE8EE 75%)",
  "Something else": "radial-gradient(ellipse at 50% 55%, #6B1A26, #3A0A12 75%)",
};

export function Celebrations() {
  const { open, whatsapp } = useEnquiry();
  const chat = whatsapp ? whatsappHref(whatsapp, "Hi! I'd like an invitation website for a celebration that isn't a wedding.") : "";
  return (
    <section id="celebrations" aria-labelledby="celebrations-h" className="pc-section pc-celebrate" data-motion="off">
      <div className="pc-wrap">
        <div className="pc-head">
          <p className="pc-eyebrow">More celebrations</p>
          <h2 id="celebrations-h">
            Not only weddings. <em>Every day worth celebrating.</em>
          </h2>
          <p>The same care for the other days you want your people there. One link with the date, the venue map and RSVP, designed for the occasion and sent on WhatsApp. Your first preview is free.</p>
        </div>
        <ul className="pc-cel-list">
          {CARDS.map((c) => (
            <li key={c.occasion} className="pc-cel">
              <div className="art" style={{ background: BG[c.occasion] }}>
                {c.art}
                {c.example ? <span className="tag">A real one</span> : null}
              </div>
              <div className="body">
                <h3>{c.title}</h3>
                <p>{c.text}</p>
                <div className="acts">
                  <button type="button" className="go" onClick={() => open("unsure", `celebrations-${c.occasion.toLowerCase().replace(/\s+/g, "-")}`, { occasion: c.occasion })}>
                    {c.cta} <ArrowRight aria-hidden />
                  </button>
                  {c.example ? (
                    <a className="see" href={c.example.href} target="_blank" rel="noopener">
                      {c.example.label}
                    </a>
                  ) : null}
                </div>
              </div>
            </li>
          ))}
        </ul>
        {chat ? (
          <p className="pc-cel-foot">
            <span>Rather just message us?</span>
            <a href={chat} target="_blank" rel="noopener" onClick={() => track("Contact", { method: "whatsapp", origin: "celebrations" })}>
              <MessageCircle aria-hidden /> Tell us on WhatsApp
            </a>
          </p>
        ) : null}
      </div>
    </section>
  );
}
