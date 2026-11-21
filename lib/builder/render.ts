/* Turns a couple's InviteData + template into a self-contained HTML invitation.
   Runs on the server (published pages, previews) and in the browser (the editor's live preview),
   so it must stay free of Node and React imports. */
import type { InviteData } from "@/lib/builder/types";
import { fontStack, fontsHref } from "@/lib/builder/fonts";
import { type Palette, type Template, isDark, paletteFor } from "@/lib/builder/templates";
import * as art from "@/lib/builder/art";
import { RUNTIME } from "@/lib/builder/runtime";
import { greetingBanner } from "@/lib/builder/studio";

export type RenderMode = "live" | "preview" | "editor" | "thumb";
export type RenderOpts = {
  mode: RenderMode;
  musicSrc: string;
  rsvpUrl?: string;
  /** absolute site address, for og:image and links */
  siteUrl?: string;
  /** where "make your own" points */
  builderUrl?: string;
  /** absolute URL of this page (live only) */
  pageUrl?: string;
};

/* ---------- text helpers ---------- */
const ESC: Record<string, string> = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" };
export const h = (s: string) => String(s ?? "").replace(/[&<>"']/g, (c) => ESC[c]);
const para = (s: string) => h(s.trim()).replace(/\n{2,}/g, "</p><p>").replace(/\n/g, "<br>");

const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
function parts(date: string) {
  const [y, m, d] = date.split("-").map(Number);
  const dow = new Date(Date.UTC(y, m - 1, d)).getUTCDay();
  return { y, m, d, dow };
}
export function longDate(date: string) {
  if (!date) return "";
  const p = parts(date);
  return `${DAYS[p.dow]}, ${p.d} ${MONTHS[p.m - 1]} ${p.y}`;
}
export function dayMonth(date: string) {
  if (!date) return "";
  const p = parts(date);
  return `${p.d} ${MONTHS[p.m - 1]} ${p.y}`;
}
const dotDate = (date: string) => (date ? date.split("-").reverse().join(" · ") : "");
export function clock(t: string) {
  if (!t) return "";
  const [H, M] = t.split(":").map(Number);
  return `${H % 12 || 12}:${String(M).padStart(2, "0")} ${H < 12 ? "AM" : "PM"}`;
}
const initials = (d: InviteData) => [d.one, d.two].map((n) => (n.trim()[0] || "").toUpperCase()).filter(Boolean).join(" ");
export const coupleNames = (d: InviteData) => [d.one.trim(), d.two.trim()].filter(Boolean).join(" & ") || "Our wedding";

function calendarLink(name: string, d: InviteData, date: string, time: string, where: string) {
  if (!date) return "";
  const t = time || "10:00";
  const [y, m, dd] = date.split("-").map(Number);
  const [H, M] = t.split(":").map(Number);
  const start = new Date(Date.UTC(y, m - 1, dd, H, M));
  const end = new Date(start.getTime() + 3 * 3600_000);
  const fmt = (x: Date) => x.toISOString().replace(/[-:]/g, "").slice(0, 15);
  const q = new URLSearchParams({
    action: "TEMPLATE",
    text: `${name} · ${coupleNames(d)}`,
    dates: `${fmt(start)}/${fmt(end)}`,
    ctz: "Asia/Kolkata",
    location: where,
    details: `${coupleNames(d)} would love to see you there.`,
  });
  return `https://calendar.google.com/calendar/render?${q.toString()}`;
}
const mapsLink = (map: string, venue: string, address: string) =>
  map || (venue || address ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent([venue, address].filter(Boolean).join(", "))}` : "");
const photo = (name: string) => `/api/photos/${name}`;

/* ---------- colours ---------- */
function rgb(hex: string) {
  const n = parseInt(hex.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}
function mix(a: string, b: string, t: number) {
  const [r1, g1, b1] = rgb(a);
  const [r2, g2, b2] = rgb(b);
  const c = (x: number, y: number) => Math.round(x + (y - x) * t).toString(16).padStart(2, "0");
  return `#${c(r1, r2)}${c(g1, g2)}${c(b1, b2)}`;
}
const alpha = (hex: string, a: number) => `rgba(${rgb(hex).join(",")},${a})`;

function colorVars(p: Palette) {
  const dark = isDark(p.bg);
  const v: Record<string, string> = {
    "--bg": p.bg,
    "--ink": p.ink,
    "--accent": p.accent,
    "--soft": p.soft,
    "--paper": dark ? mix(p.bg, "#ffffff", 0.05) : mix(p.bg, "#ffffff", 0.6),
    "--muted": mix(p.ink, p.bg, 0.32),
    "--line": alpha(p.accent, dark ? 0.45 : 0.4),
    "--accent-deep": dark ? mix(p.accent, "#ffffff", 0.15) : mix(p.accent, "#000000", 0.28),
    "--accent-light": mix(p.accent, "#ffffff", 0.45),
    "--flower": p.soft,
    "--flower-deep": mix(p.soft, p.accent, 0.5),
    "--leaf": "#8aa476",
    "--leaf-deep": "#4f6e46",
    "--marigold": "#f3a93c",
    "--marigold-deep": "#d97b20",
    "--door": dark ? mix(p.bg, "#000000", 0.3) : mix(p.ink, "#3b1d0e", 0.55),
    "--star": "#fff7e0",
    "--seal": "#7b2331",
    "--seal-light": "#a8404f",
    "--seal-line": "rgba(255,240,225,.85)",
    "--env": mix(p.soft, p.ink, 0.06),
    "--env-front": mix(p.soft, "#ffffff", 0.3),
    "--env-flap": mix(p.soft, p.ink, 0.12),
    "--btn-ink": p.bg,
  };
  Object.assign(v, p.extra || {});
  v["--door-inset"] = mix(v["--door"].startsWith("#") ? v["--door"] : "#2a140a", "#000000", 0.22);
  v["--door-line"] = alpha(p.accent, 0.55);
  return Object.entries(v)
    .map(([k, x]) => `${k}:${x}`)
    .join(";");
}

/* ---------- CSS ---------- */
const BASE_CSS = `
*{box-sizing:border-box;margin:0;padding:0}
html{font-size:calc(16px * var(--scale));-webkit-text-size-adjust:100%;scroll-behavior:smooth}
body{background:var(--bg);color:var(--ink);font-family:var(--f-body);line-height:1.6;overflow-x:hidden;min-height:100vh;-webkit-font-smoothing:antialiased}
body.locked{overflow:hidden;height:100vh}
img{display:block;max-width:100%}
a{color:inherit}
.tpl{position:relative;overflow-x:clip}
main{position:relative;z-index:1}
.wrap{max-width:34rem;margin:0 auto;padding:0 1.5rem;position:relative}
section{padding:4.5rem 0;text-align:center;position:relative}
.band{background:var(--soft)}
.eyebrow{font-size:.72rem;letter-spacing:.28em;text-transform:uppercase;color:var(--muted)}
.h2{font-family:var(--f-head);font-weight:500;font-size:2.3rem;line-height:1.1;margin:.4rem 0 1.6rem}
.art{display:block;height:auto}
.art-divider{width:11rem;margin:0 auto .9rem}
.hero{min-height:100svh;display:flex;flex-direction:column;justify-content:center;padding:4rem 0 3.5rem;overflow:hidden}
.blessing{font-family:var(--f-head);font-style:italic;font-size:1.08rem;color:var(--muted);max-width:24rem;margin:0 auto 1.2rem;line-height:1.45}
.blessing small{display:block;font-style:normal;font-size:.68rem;letter-spacing:.2em;text-transform:uppercase;margin-top:.45rem;color:var(--accent-deep)}
.names{font-family:var(--f-script);font-weight:400;font-size:clamp(3.1rem,14vw,5.2rem);line-height:1.02;margin:1rem 0 .7rem;overflow-wrap:anywhere}
.names span{display:block}
.names .amp{font-size:.48em;color:var(--accent);margin:.12em 0}
.headline{font-family:var(--f-head);font-size:1.3rem;font-style:italic}
.date-line{margin-top:1.4rem;font-size:.74rem;letter-spacing:.26em;text-transform:uppercase;color:var(--muted)}
.date-line b{display:block;font-family:var(--f-head);font-size:1.55rem;letter-spacing:.04em;font-weight:500;text-transform:none;margin:.3rem 0;color:var(--ink)}
.hero-photo{width:min(15rem,66vw);aspect-ratio:4/5;object-fit:cover;margin:1.6rem auto .4rem;padding:6px;border:1px solid var(--line);background:var(--paper);border-radius:999px}
.cue{margin-top:2.2rem;font-size:.66rem;letter-spacing:.32em;text-transform:uppercase;color:var(--muted)}
.cue::after{content:"";display:block;width:1px;height:2.4rem;background:var(--accent);margin:.6rem auto 0;transform-origin:top;animation:cue 2.2s ease-in-out infinite}
@keyframes cue{0%{transform:scaleY(0)}50%{transform:scaleY(1)}100%{transform:scaleY(0);transform-origin:bottom}}
.count{display:flex;justify-content:center;gap:.55rem;margin-top:1.1rem}
.count div{min-width:4.3rem;padding:.9rem .3rem .7rem;border:1px solid var(--line);background:var(--paper);border-radius:.7rem}
.count b{display:block;font-family:var(--f-head);font-size:2.1rem;font-weight:500;line-height:1}
.count span{font-size:.6rem;letter-spacing:.2em;text-transform:uppercase;color:var(--muted)}
.count.done{display:none}
.count-done{display:none;font-family:var(--f-head);font-size:1.6rem;font-style:italic;margin-top:1rem}
.count.done+.count-done{display:block}
.families{display:grid;gap:.4rem;margin:.2rem 0 1.6rem}
.fam{font-family:var(--f-head);font-size:1.1rem;color:var(--muted);line-height:1.45}
.fam strong{display:block;font-family:var(--f-script);font-weight:400;font-size:2.3rem;color:var(--ink);line-height:1.15}
.fam-and{font-family:var(--f-script);font-size:1.8rem;color:var(--accent)}
.invite-text{font-size:1.05rem;max-width:28rem;margin:0 auto;font-family:var(--f-head);line-height:1.55}
.invite-text p+p{margin-top:.8em}
.events{display:grid;gap:1.1rem}
.event{background:var(--paper);border:1px solid var(--line);border-radius:1rem;padding:1.9rem 1.4rem}
.event h3{font-family:var(--f-head);font-weight:500;font-size:1.75rem;line-height:1.15}
.event .when{margin:.55rem 0 .9rem;font-size:.74rem;letter-spacing:.18em;text-transform:uppercase;color:var(--accent-deep)}
.event .venue{font-weight:600}
.event .addr{color:var(--muted);font-size:.93rem}
.event .note{margin-top:.75rem;font-style:italic;font-family:var(--f-head);font-size:1.05rem}
.btns{display:flex;flex-wrap:wrap;justify-content:center;gap:.5rem;margin-top:1.2rem}
.btn{display:inline-flex;align-items:center;justify-content:center;gap:.45rem;padding:.7rem 1.15rem;border-radius:999px;font:500 .78rem/1 var(--f-body);letter-spacing:.06em;text-decoration:none;border:1px solid var(--ink);color:var(--ink);background:transparent;cursor:pointer;min-height:2.75rem}
.btn svg{width:1rem;height:1rem;flex:none}
.btn.solid{background:var(--ink);color:var(--btn-ink)}
.btn:disabled{opacity:.6}
.story{display:grid;gap:2.6rem}
.chapter .when{font-family:var(--f-script);font-size:2.3rem;color:var(--accent);line-height:1}
.chapter h3{font-family:var(--f-head);font-size:1.55rem;font-weight:500;margin:.35rem 0 .5rem;line-height:1.2}
.chapter img{width:100%;max-width:22rem;aspect-ratio:4/3;object-fit:cover;margin:0 auto 1.1rem;border-radius:.7rem}
.chapter p{color:var(--muted);max-width:26rem;margin:0 auto}
.gallery{display:grid;grid-template-columns:1fr 1fr;gap:.5rem}
.gallery img{width:100%;height:100%;aspect-ratio:3/4;object-fit:cover;border-radius:.45rem}
.gallery img:nth-child(3n+1){grid-column:span 2;aspect-ratio:4/3}
.rsvp-note{color:var(--muted);margin:-.6rem 0 1.4rem}
.form{display:grid;gap:1rem;text-align:left;background:var(--paper);border:1px solid var(--line);border-radius:1rem;padding:1.5rem}
.form label,.form .lbl{font-size:.72rem;letter-spacing:.14em;text-transform:uppercase;color:var(--muted);display:grid;gap:.4rem}
.form input,.form textarea,.form select{font:inherit;font-size:1rem;color:var(--ink);background:var(--bg);border:1px solid var(--line);border-radius:.55rem;padding:.7rem .8rem;width:100%;letter-spacing:0;text-transform:none}
.form textarea{min-height:5.5rem;resize:vertical}
.choice{display:grid;grid-template-columns:1fr 1fr;gap:.5rem}
.choice label{display:block;position:relative;cursor:pointer}
.choice input{position:absolute;opacity:0;pointer-events:none}
.choice span{display:block;text-align:center;padding:.75rem .5rem;border:1px solid var(--line);border-radius:.55rem;font-size:.9rem;letter-spacing:0;text-transform:none;color:var(--ink);background:var(--bg)}
.choice input:checked+span{background:var(--ink);color:var(--btn-ink);border-color:var(--ink)}
.choice input:focus-visible+span{outline:2px solid var(--accent);outline-offset:2px}
.checks{display:flex;flex-wrap:wrap;gap:.4rem}
.checks label{display:inline-flex;align-items:center;gap:.45rem;padding:.5rem .8rem;border:1px solid var(--line);border-radius:999px;font-size:.88rem;letter-spacing:0;text-transform:none;color:var(--ink);background:var(--bg)}
.checks input{width:auto;accent-color:var(--accent)}
.form .btn{width:100%;margin-top:.2rem}
.msg{font-size:.9rem;color:var(--accent-deep);min-height:1.2em;text-align:center}
.thanks{font-family:var(--f-head);font-size:1.5rem;text-align:center;padding:1.5rem 0}
.wa{margin-top:1.1rem}
.closing{padding:5rem 0 7rem}
.closing-text{font-family:var(--f-head);font-size:1.3rem;font-style:italic;max-width:26rem;margin:0 auto}
.signoff{margin-top:1.6rem;color:var(--muted);font-size:.8rem;letter-spacing:.2em;text-transform:uppercase}
.signoff b{display:block;font-family:var(--f-script);font-size:2.6rem;font-weight:400;letter-spacing:0;text-transform:none;color:var(--ink);line-height:1.2;margin-top:.3rem}
.hashtag{margin-top:1.2rem;font-weight:600;letter-spacing:.06em;color:var(--accent-deep)}
.made{margin-top:3.5rem;font-size:.66rem;letter-spacing:.16em;text-transform:uppercase;color:var(--muted)}
.made a{text-underline-offset:3px}
.rv{opacity:0;transform:translateY(22px);transition:opacity 1s ease,transform 1s ease}
.rv.in{opacity:1;transform:none}
.instant .rv{transition:none}
.music{position:fixed;right:1rem;bottom:calc(1rem + env(safe-area-inset-bottom));z-index:40;width:3rem;height:3rem;border-radius:50%;background:var(--ink);color:var(--btn-ink);border:0;display:grid;place-items:center;box-shadow:0 8px 22px rgba(0,0,0,.2);cursor:pointer}
.music[hidden]{display:none}
.music .note{width:1.2rem;height:1.2rem}
.music .bars{display:none;align-items:flex-end;gap:2px;height:14px}
.music.on .bars{display:flex}.music.on .note{display:none}
.music .bars i{display:block;width:3px;height:4px;background:currentColor;border-radius:1px}
.music.on .bars i{animation:eq .9s ease-in-out infinite alternate}
.music.on .bars i:nth-child(2){animation-delay:.25s}.music.on .bars i:nth-child(3){animation-delay:.5s}.music.on .bars i:nth-child(4){animation-delay:.15s}
@keyframes eq{to{height:14px}}
#fx{position:fixed;inset:0;pointer-events:none;z-index:30;overflow:hidden}
#fx .p{position:absolute;top:-24px;width:12px;height:9px;border-radius:70% 0 70% 0;opacity:.85;animation:fall linear infinite;will-change:transform}
#fx .p-petals{background:var(--flower);box-shadow:inset -2px -2px 0 var(--flower-deep)}
#fx .p-petals.v1{border-radius:50% 50% 50% 0;background:var(--soft)}
#fx .p-marigold{background:var(--marigold);border-radius:50% 50% 50% 10%}
#fx .p-marigold.v1{background:#fffaf0;width:8px;height:8px;border-radius:50%}
#fx .p-marigold.v2{background:var(--marigold-deep)}
#fx .p-stars{top:10%;width:90px;height:1.5px;border-radius:2px;background:linear-gradient(90deg,transparent,var(--star));opacity:0;animation:shoot ease-out infinite}
@keyframes fall{0%{transform:translate3d(0,0,0) rotate(0) scale(var(--s,1))}100%{transform:translate3d(var(--drift,30px),110vh,0) rotate(540deg) scale(var(--s,1))}}
@keyframes shoot{0%{opacity:0;transform:translate(0,0) rotate(20deg)}3%{opacity:1}9%{opacity:0;transform:translate(-260px,95px) rotate(20deg)}100%{opacity:0;transform:translate(-260px,95px) rotate(20deg)}}
#cover{position:fixed;inset:0;z-index:60;display:grid;place-items:center;cursor:pointer;transition:opacity 1s ease,visibility 1s;-webkit-tap-highlight-color:transparent;overflow:hidden}
#cover.gone{opacity:0;visibility:hidden;pointer-events:none}
#cover:focus-visible{outline:none}
.hint{font-size:.7rem;letter-spacing:.32em;text-transform:uppercase;animation:pulse 2.4s ease-in-out infinite}
@keyframes pulse{50%{opacity:.45}}
.c-names{font-family:var(--f-script);font-size:clamp(2.4rem,11vw,3.4rem);line-height:1.1;margin:.4rem 0}
.c-date{font-size:.8rem;letter-spacing:.3em}
/* envelope */
.cover-env{background:radial-gradient(ellipse at 50% 40%,var(--paper),var(--bg) 75%);color:var(--ink)}
.env-wrap{display:grid;justify-items:center;gap:2.2rem;width:100%}
.env{position:relative;width:min(84vw,23rem);aspect-ratio:1.42;perspective:1400px}
.env-back{position:absolute;inset:0;background:var(--env);border-radius:4px;box-shadow:0 30px 60px rgba(40,20,20,.18),0 4px 10px rgba(40,20,20,.08)}
.env-card{position:absolute;left:5%;right:5%;top:6%;height:88%;background:var(--paper);border-radius:3px;z-index:1;display:grid;place-content:center;text-align:center;padding:1rem;transition:transform 1.1s cubic-bezier(.3,.7,.2,1) .55s;box-shadow:0 2px 6px rgba(0,0,0,.06)}
.env-card .c-names{font-size:clamp(1.8rem,8vw,2.4rem)}
.env-front{position:absolute;inset:0;z-index:2;background:var(--env-front);clip-path:polygon(0 0,50% 56%,100% 0,100% 100%,0 100%);border-radius:4px}
.env-front::after{content:"";position:absolute;inset:0;background:linear-gradient(160deg,transparent 40%,rgba(0,0,0,.05))}
.env-flap{position:absolute;left:0;right:0;top:0;height:62%;z-index:3;background:var(--env-flap);clip-path:polygon(0 0,100% 0,50% 100%);transform-origin:50% 0;transition:transform .8s ease,z-index 0s .4s;backface-visibility:hidden}
.env-seal{position:absolute;left:50%;top:62%;width:25%;z-index:4;transform:translate(-50%,-50%);transition:transform .45s ease,opacity .45s ease;filter:drop-shadow(0 3px 4px rgba(0,0,0,.25))}
.seal-svg{display:block;width:100%;height:auto}
.opening .env-seal{opacity:0;transform:translate(-50%,-50%) scale(1.4)}
.opening .env-flap{transform:rotateX(180deg);z-index:0}
.opening .env-card{transform:translateY(-62%);z-index:2}
/* temple doors */
.cover-doors{background:radial-gradient(ellipse at 50% 40%,var(--door-inset),#120604 75%);color:var(--ink)}
.doorway{position:absolute;top:0;bottom:0;left:50%;width:min(100%,36rem);transform:translateX(-50%);perspective:1600px;box-shadow:0 0 0 1px var(--door-line),0 0 80px rgba(0,0,0,.5)}
.door{position:absolute;top:0;bottom:0;width:50.5%;transition:transform 1.9s cubic-bezier(.6,.05,.25,1);box-shadow:inset 0 0 40px rgba(0,0,0,.35)}
.door svg{display:block;width:100%;height:100%}
.door-l{left:0;transform-origin:0 50%}
.door-r{right:0;transform-origin:100% 50%}
.door-top{position:absolute;left:0;right:0;top:0;z-index:2;transition:opacity .6s}
.opening.cover-doors{background:transparent;transition:opacity 1s ease 1s,visibility 1s 1s,background .8s}
.door-top .art-toran{width:100%;max-width:40rem;margin:0 auto}
.plaque{position:relative;z-index:3;text-align:center;background:var(--paper);border:1px solid var(--accent);outline:1px solid var(--accent);outline-offset:4px;padding:1.4rem 1.6rem;border-radius:.4rem;width:min(80vw,19rem);transition:opacity .5s,transform .5s;box-shadow:0 18px 40px rgba(0,0,0,.35)}
.opening .door-l{transform:rotateY(-104deg)}
.opening .door-r{transform:rotateY(104deg)}
.opening .plaque,.opening .door-top{opacity:0;transform:scale(.96)}
/* night */
.cover-night{background:radial-gradient(ellipse at 50% 30%,var(--soft),var(--bg) 70%);color:var(--ink)}
.cover-night .art-stars{position:absolute;inset:0;width:100%;height:100%}
.night-in{position:relative;text-align:center;transition:transform 1.4s ease,opacity 1.2s ease}
.night-in .art-moon{width:11rem;margin:0 auto 1rem}
.night-in .c-names{color:var(--accent-light)}
.opening .night-in{transform:scale(1.25);opacity:0}
/* card */
.cover-card{background:var(--soft);color:var(--ink)}
.cv-card{background:var(--paper);width:min(82vw,21rem);aspect-ratio:5/7;display:grid;place-content:center;gap:.6rem;text-align:center;padding:2rem;border:1px solid var(--line);outline:1px solid var(--line);outline-offset:-10px;box-shadow:0 30px 60px rgba(0,0,0,.12);transition:transform 1.1s cubic-bezier(.6,0,.2,1),opacity 1.1s}
.opening .cv-card{transform:translateY(-110vh) rotate(-6deg)}
.ribbon{position:fixed;left:0;right:0;top:0;z-index:70;background:#1f1a17;color:#f6efe6;font:500 12px/1.35 system-ui,sans-serif;text-align:center;padding:8px 12px}
.ribbon a{color:#f4d9a6}
.has-ribbon .hero{padding-top:5.5rem}
@media (prefers-reduced-motion:reduce){.rv{opacity:1;transform:none;transition:none}*{animation-duration:.01ms!important;animation-iteration-count:1!important}}
`;

const TEMPLATE_CSS: Record<string, string> = {
  thamara: `
.t-thamara .hero{padding-top:5.5rem;padding-bottom:0}
.t-thamara .hero>.wrap{flex:1;display:flex;flex-direction:column;justify-content:center;width:100%}
.t-thamara .pond{margin-top:auto}
.t-thamara .hero .art-toran{position:absolute;top:0;left:50%;transform:translateX(-50%);width:min(104%,40rem)}
.t-thamara .hero-mid{position:relative;padding:0 3.4rem}
.t-thamara .lamp-l,.t-thamara .lamp-r{position:absolute;top:50%;width:2.7rem;transform:translateY(-46%)}
.t-thamara .lamp-l{left:-.4rem}.t-thamara .lamp-r{right:-.4rem}
.t-thamara .art-lamp{width:100%}
.t-thamara .art-pond{width:min(112%,32rem);margin:1.2rem auto 0;position:relative;left:50%;transform:translateX(-50%)}
.t-thamara .hero-photo{border-radius:50%;aspect-ratio:1;border:2px solid var(--accent);outline:1px solid var(--accent);outline-offset:4px}
.t-thamara .names .amp{font-family:var(--f-head);font-style:italic}
.t-thamara .event{border-top:3px solid var(--accent)}
.flame{transform-box:fill-box;transform-origin:50% 100%;animation:flick 1.4s ease-in-out infinite alternate}
@keyframes flick{0%{transform:scale(1,1)}50%{transform:scale(.9,1.1) skewX(3deg)}100%{transform:scale(1.05,.94) skewX(-3deg)}}
`,
  verse: `
.t-verse .hero{background:radial-gradient(ellipse at 50% 28%,var(--paper),var(--bg) 72%)}
.t-verse .arch{--aw:min(86vw,22rem);position:relative;width:var(--aw);margin:0 auto;padding:2.2rem 1.1rem 2.6rem;border:1px solid var(--accent);border-bottom:0;border-radius:calc(var(--aw) / 2) calc(var(--aw) / 2) 0 0}
.t-verse .arch::before{content:"";position:absolute;inset:7px 7px 0;border:1px solid var(--line);border-bottom:0;border-radius:calc(var(--aw) / 2 - 7px) calc(var(--aw) / 2 - 7px) 0 0;pointer-events:none}
.t-verse .art-arch{width:9.5rem;margin:0 auto .8rem}
.t-verse .art-olive{width:min(92%,19rem);margin:-1.6rem auto 0;position:relative}
.t-verse .arch .names{font-size:clamp(3rem,13vw,4.6rem)}
.t-verse .hero-photo{border-radius:999px 999px .6rem .6rem}
.t-verse .event{border-radius:999px 999px 1rem 1rem;padding:3.2rem 1.9rem 1.9rem}
`,
  peony: `
.t-peony .art-corner{position:absolute;top:-1.4rem;left:-2.2rem;width:min(64vw,17rem);pointer-events:none;z-index:0}
.t-peony .art-corner-b{top:auto;left:auto;bottom:-1.4rem;right:-2.2rem}
.t-peony .hero .wrap{z-index:1}
.t-peony .hero-photo{border-radius:50%/42%}
.t-peony .closing{overflow:hidden}
.t-peony .event{border-radius:1.4rem}
`,
  midnight: `
.t-midnight .sky{position:fixed;inset:0;z-index:0;pointer-events:none}
.t-midnight .sky .art-stars{width:100%;height:100%}
.t-midnight .art-moon{width:9rem;margin:0 auto -.2rem}
.t-midnight .names,.t-midnight .signoff b,.t-midnight .fam strong{color:var(--accent-light)}
.t-midnight .names{letter-spacing:.02em}
.t-midnight .band{background:rgba(255,255,255,.03)}
.t-midnight .event,.t-midnight .count div,.t-midnight .form{background:rgba(255,255,255,.04);backdrop-filter:blur(3px);-webkit-backdrop-filter:blur(3px)}
.t-midnight .hero-photo{border-radius:50%;aspect-ratio:1;box-shadow:0 0 60px var(--line)}
.tw{transform-box:fill-box;transform-origin:center;animation:tw 3.2s ease-in-out infinite}
@keyframes tw{50%{opacity:.2;transform:scale(.7)}}
`,
  minimal: `
.t-minimal .hero{margin:.9rem;min-height:calc(100svh - 1.8rem);border:1px solid var(--line);padding:3rem 0}
.t-minimal .names{font-size:clamp(3.4rem,17vw,6.4rem);letter-spacing:-.03em;line-height:.95}
.t-minimal .names .amp{font-style:italic;font-size:.42em;margin:.3em 0;color:var(--accent)}
.t-minimal .headline{font-style:normal;font-family:var(--f-body);font-size:.8rem;letter-spacing:.3em;text-transform:uppercase;color:var(--muted)}
.t-minimal .date-big{font-family:var(--f-head);font-size:2.5rem;letter-spacing:.06em;margin-top:1.6rem;line-height:1}
.t-minimal .hero-photo{border-radius:0;width:min(20rem,78vw);aspect-ratio:4/5;padding:0;border:0}
.t-minimal .h2{font-size:2.6rem;letter-spacing:-.02em}
.t-minimal .event{border-radius:0;border-width:1px 0 0;background:none;padding:1.8rem 0 .4rem}
.t-minimal .events{gap:0}
.t-minimal .count div{border-radius:0;background:none;border-width:0 0 1px}
.t-minimal .btn{border-radius:0}
.t-minimal .form{border-radius:0;background:none}
`,
};

/* ---------- pieces ---------- */
const ICON = {
  pin: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 21s-7-6.2-7-11.5A7 7 0 0 1 19 9.5C19 14.8 12 21 12 21z"/><circle cx="12" cy="9.5" r="2.5"/></svg>`,
  cal: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3.5" y="5" width="17" height="15.5" rx="2"/><path d="M3.5 10h17M8 3v4M16 3v4"/></svg>`,
  wa: `<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2zm0 18.2a8.2 8.2 0 0 1-4.2-1.2l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2zm4.5-6.1c-.2-.1-1.5-.7-1.7-.8-.2-.1-.4-.1-.6.1l-.8 1c-.1.2-.3.2-.5.1a6.7 6.7 0 0 1-3.3-2.9c-.3-.4.3-.4.7-1.4.1-.2 0-.3 0-.4l-.8-1.8c-.2-.5-.4-.4-.6-.4h-.5a1 1 0 0 0-.7.3 3 3 0 0 0-.9 2.2 5.2 5.2 0 0 0 1.1 2.7 11.8 11.8 0 0 0 4.5 4c1.7.7 2.3.8 3.2.6.5-.1 1.5-.6 1.7-1.2.2-.6.2-1.1.2-1.2-.1-.1-.3-.2-.5-.3z"/></svg>`,
};

function divider(t: Template) {
  switch (t.id) {
    case "thamara":
      return art.lotusSmall();
    case "verse":
      return art.oliveDivider();
    case "peony":
      return art.peonyDivider();
    case "midnight":
      return art.starDivider();
    default:
      return art.lineDivider();
  }
}

function coverHtml(t: Template, d: InviteData) {
  const names = `<p class="c-names">${h(d.one || "")}${d.one && d.two ? " &amp; " : ""}${h(d.two || "")}</p>`;
  const date = d.date ? `<p class="c-date">${h(dotDate(d.date))}</p>` : "";
  const a = `role="button" tabindex="0" aria-label="Open the invitation"`;
  const of = d.one || d.two ? "The wedding of" : "You are invited";
  switch (t.cover) {
    case "doors":
      return `<div id="cover" class="cover-doors" ${a}><div class="doorway"><div class="door door-l">${art.doorPanel("l")}</div><div class="door door-r">${art.doorPanel("r")}</div><div class="door-top">${art.toran()}</div></div><div class="plaque"><p class="eyebrow">${of}</p>${names}${date}<p class="hint" style="margin-top:1rem">Tap to open the doors</p></div></div>`;
    case "night":
      return `<div id="cover" class="cover-night" ${a}>${art.starfield(90, 3)}<div class="night-in">${art.moon()}<p class="eyebrow">You are invited</p>${names}${date}<p class="hint" style="margin-top:1.6rem">Tap to open</p></div></div>`;
    case "card":
      return `<div id="cover" class="cover-card" ${a}><div class="cv-card"><p class="eyebrow">${h(d.eyebrow || "Save the date")}</p>${names}${date}<p class="hint" style="margin-top:1.4rem">Tap to open</p></div></div>`;
    default:
      return `<div id="cover" class="cover-env" ${a}><div class="env-wrap"><div class="env"><div class="env-back"></div><div class="env-card"><p class="eyebrow">${of}</p>${names}${date}</div><div class="env-front"></div><div class="env-flap"></div><div class="env-seal">${art.seal(h(initials(d)))}</div></div><p class="hint">Tap to open</p></div></div>`;
  }
}

function heroHtml(t: Template, d: InviteData) {
  const blessing = d.blessing ? `<p class="blessing rv">${para(d.blessing)}${d.blessingRef ? `<small>${h(d.blessingRef)}</small>` : ""}</p>` : "";
  const eyebrow = d.eyebrow ? `<p class="eyebrow rv">${h(d.eyebrow)}</p>` : "";
  const names = `<h1 class="names rv">${d.one ? `<span>${h(d.one)}</span>` : ""}${d.one && d.two ? `<span class="amp">&amp;</span>` : ""}${d.two ? `<span>${h(d.two)}</span>` : ""}</h1>`;
  const headline = d.headline ? `<p class="headline rv">${h(d.headline)}</p>` : "";
  const when = d.date
    ? `<p class="date-line rv">${d.time ? h(clock(d.time)) : "&nbsp;"}<b>${h(longDate(d.date))}</b>${h(d.city)}</p>`
    : d.city
      ? `<p class="date-line rv">${h(d.city)}</p>`
      : "";
  const photo_ = d.cover ? `<img class="hero-photo rv" src="${photo(d.cover)}" alt="${h(coupleNames(d))}">` : "";
  const cue = `<p class="cue rv">Scroll</p>`;
  const core = `${blessing}${eyebrow}${names}${headline}${when}`;
  switch (t.id) {
    case "thamara":
      return `<section class="hero" id="sec-names">${art.toran()}<div class="wrap">${blessing}<div class="hero-mid"><span class="lamp-l">${art.lamp()}</span><span class="lamp-r">${art.lamp()}</span>${eyebrow}${names}${headline}</div>${when}${photo_}<div class="pond rv">${art.lotusPond()}</div></div></section>`;
    case "verse":
      return `<section class="hero" id="sec-names"><div class="wrap"><div class="arch rv">${art.archTop()}${core}</div><div class="rv">${art.oliveBase()}</div>${photo_}${cue}</div></section>`;
    case "peony":
      return `<section class="hero" id="sec-names">${art.peonyCorner()}${art.peonyCorner(true)}<div class="wrap">${core}${photo_}${cue}</div></section>`;
    case "midnight":
      return `<section class="hero" id="sec-names"><div class="wrap"><div class="rv">${art.moon()}</div>${core}${photo_}${cue}</div></section>`;
    default: {
      const big = d.date ? `<p class="date-big rv">${h(d.date.split("-").reverse().map((x, i) => (i === 2 ? x.slice(2) : x)).join(" . "))}</p>` : "";
      const line = d.date || d.city ? `<p class="date-line rv">${h([d.time ? clock(d.time) : "", d.date ? longDate(d.date) : "", d.city].filter(Boolean).join(" · "))}</p>` : "";
      return `<section class="hero" id="sec-names"><div class="wrap">${blessing}${eyebrow}${names}${headline}${big}${line}${photo_}${cue}</div></section>`;
    }
  }
}

function eventsHtml(t: Template, d: InviteData) {
  const list = d.events.filter((e) => e.name || e.venue || e.date);
  if (!list.length) return "";
  const cards = list
    .map((e) => {
      const when = [e.date ? longDate(e.date) : "", e.time ? clock(e.time) : ""].filter(Boolean).join(" · ");
      const map = mapsLink(e.map, e.venue, e.address);
      const cal = calendarLink(e.name || "Wedding", d, e.date, e.time, [e.venue, e.address].filter(Boolean).join(", "));
      return `<article class="event rv">${e.name ? `<h3>${h(e.name)}</h3>` : ""}${when ? `<p class="when">${h(when)}</p>` : ""}${e.venue ? `<p class="venue">${h(e.venue)}</p>` : ""}${e.address ? `<p class="addr">${h(e.address)}</p>` : ""}${e.note ? `<p class="note">${h(e.note)}</p>` : ""}<div class="btns">${map ? `<a class="btn" href="${h(map)}" target="_blank" rel="noopener">${ICON.pin}Directions</a>` : ""}${cal ? `<a class="btn" href="${h(cal)}" target="_blank" rel="noopener">${ICON.cal}Add to calendar</a>` : ""}</div></article>`;
    })
    .join("");
  return `<section id="sec-events"><div class="wrap">${divider(t)}<p class="eyebrow rv">Join us for</p><h2 class="h2 rv">The celebrations</h2><div class="events">${cards}</div></div></section>`;
}

function rsvpHtml(t: Template, d: InviteData) {
  if (!d.rsvp.on) return "";
  const list = d.events.filter((e) => e.name);
  const deadline = d.rsvp.deadline ? `Kindly reply by ${dayMonth(d.rsvp.deadline)}.` : "";
  const note = [deadline, d.rsvp.note].filter(Boolean).join(" ");
  const checks =
    list.length > 1
      ? `<div class="lbl" data-yes>Which celebrations?<div class="checks">${list.map((e) => `<label><input type="checkbox" name="events" value="${h(e.name)}" checked>${h(e.name)}</label>`).join("")}</div></div>`
      : "";
  const wa = d.rsvp.whatsapp
    ? `<a class="btn wa" href="https://wa.me/${h(d.rsvp.whatsapp)}?text=${encodeURIComponent(`Hi ${coupleNames(d)}! `)}" target="_blank" rel="noopener">${ICON.wa}Or reply on WhatsApp</a>`
    : "";
  return `<section id="sec-rsvp" class="band"><div class="wrap">${divider(t)}<p class="eyebrow rv">RSVP</p><h2 class="h2 rv">Will you join us?</h2>${note ? `<p class="rsvp-note rv">${h(note)}</p>` : ""}<form id="wic-rsvp" class="form rv" novalidate><label>Your name<input name="name" autocomplete="name" maxlength="80" required></label><div class="lbl">Will you attend?<div class="choice"><label><input type="radio" name="attending" value="yes" checked><span>Joyfully accept</span></label><label><input type="radio" name="attending" value="no"><span>Regretfully decline</span></label></div></div><label data-yes>Number of guests, including you<select name="guests">${[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => `<option>${n}</option>`).join("")}</select></label>${checks}<label>Phone (optional)<input name="phone" type="tel" autocomplete="tel" maxlength="20"></label><label>A note for the couple (optional)<textarea name="message" maxlength="600"></textarea></label><button class="btn solid" type="submit">Send reply</button><p class="msg" id="wic-rsvp-msg" role="status"></p></form>${wa}</div></section>`;
}

function bodyHtml(t: Template, d: InviteData, o: RenderOpts) {
  const out: string[] = [];
  if (d.show.opening && o.mode !== "thumb") out.push(coverHtml(t, d));
  if (t.id === "midnight") out.push(`<div class="sky">${art.starfield(80, 11)}</div>`);
  out.push("<main>");
  out.push(heroHtml(t, d));

  if (d.show.countdown && d.date) {
    out.push(
      `<section id="sec-countdown" class="band"><div class="wrap"><p class="eyebrow rv">Counting down to ${h(dayMonth(d.date))}</p><div class="count rv" id="wic-count"><div><b>0</b><span>Days</span></div><div><b>00</b><span>Hours</span></div><div><b>00</b><span>Mins</span></div><div><b>00</b><span>Secs</span></div></div><p class="count-done">Today is the day!</p></div></section>`
    );
  }

  const fam = d.families.one || d.families.two;
  if (fam || d.invite) {
    const families = fam
      ? `<div class="families"><p class="fam rv"><strong>${h(d.one)}</strong>${h(d.families.one)}</p><p class="fam-and rv">&amp;</p><p class="fam rv"><strong>${h(d.two)}</strong>${h(d.families.two)}</p></div>`
      : "";
    out.push(`<section id="sec-invite"><div class="wrap">${divider(t)}<p class="eyebrow rv">You are invited</p>${families}${d.invite ? `<div class="invite-text rv"><p>${para(d.invite)}</p></div>` : ""}</div></section>`);
  }

  out.push(eventsHtml(t, d));

  const chapters = d.story.filter((c) => c.title || c.text || c.when);
  if (d.show.story && chapters.length) {
    out.push(
      `<section id="sec-story" class="band"><div class="wrap">${divider(t)}<h2 class="h2 rv">${h(d.storyTitle || "Our story")}</h2><div class="story">${chapters
        .map(
          (c) =>
            `<article class="chapter rv">${c.photo ? `<img src="${photo(c.photo)}" alt="" loading="lazy">` : ""}${c.when ? `<p class="when">${h(c.when)}</p>` : ""}${c.title ? `<h3>${h(c.title)}</h3>` : ""}${c.text ? `<p>${para(c.text)}</p>` : ""}</article>`
        )
        .join("")}</div></div></section>`
    );
  }

  if (d.show.gallery && d.gallery.length) {
    out.push(
      `<section id="sec-gallery"><div class="wrap">${divider(t)}<h2 class="h2 rv">${h(d.galleryTitle || "Moments")}</h2><div class="gallery rv">${d.gallery.map((g) => `<img src="${photo(g)}" alt="" loading="lazy">`).join("")}</div></div></section>`
    );
  }

  out.push(rsvpHtml(t, d));

  const brand = o.siteUrl || "https://theweddinginviteco.xyz";
  out.push(
    `<section class="closing" id="sec-closing"><div class="wrap">${divider(t)}${d.closing ? `<p class="closing-text rv">${para(d.closing)}</p>` : ""}<p class="signoff rv">${h(d.signoff || "With love")}<b>${h(coupleNames(d))}</b></p>${d.hashtag ? `<p class="hashtag rv">${h(d.hashtag.startsWith("#") ? d.hashtag : "#" + d.hashtag)}</p>` : ""}<p class="made">Made with <a href="${h(o.builderUrl || brand)}" target="_blank" rel="noopener">The Wedding Invite Co.</a></p></div></section>`
  );
  out.push("</main>");
  out.push(`<button class="music" id="wic-music" type="button" aria-label="Play or pause music" aria-pressed="false" hidden><svg class="note" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9 18V5l11-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="17" cy="16" r="3"/></svg><span class="bars"><i></i><i></i><i></i><i></i></span></button>`);
  if (o.mode === "preview")
    out.push(`<div class="ribbon">Preview · Only you can see this. Guests can open it once it's published.</div>`);
  const tz = "+05:30";
  const cfg = {
    mode: o.mode,
    target: d.date ? `${d.date}T${d.time || "00:00"}:00${tz}` : "",
    music: o.musicSrc,
    rsvpUrl: o.rsvpUrl || "",
    effect: t.effect,
    effects: d.show.effects,
    coverMs: t.cover === "doors" ? 1900 : t.cover === "envelope" ? 2000 : 1400,
  };
  out.push(`<script type="application/json" id="wic-config">${JSON.stringify(cfg).replace(/</g, "\\u003c")}</script>`);
  return `<div class="tpl t-${t.id}${o.mode === "preview" ? " has-ribbon" : ""}">${out.join("")}</div>`;
}

export type RenderedParts = { css: string; html: string; fonts: string; title: string };

/** The parts the editor swaps into its preview frame on every change. */
export function renderParts(t: Template, d: InviteData, o: RenderOpts): RenderedParts {
  const p = paletteFor(t, d.style);
  const vars = `${colorVars(p)};--scale:${d.style.scale};--f-script:${fontStack(d.style.script, "great-vibes")};--f-head:${fontStack(d.style.heading, "cormorant")};--f-body:${fontStack(d.style.body, "dm-sans")}`;
  return {
    css: `:root{${vars}}\n${BASE_CSS}\n${TEMPLATE_CSS[t.id] || ""}`,
    html: bodyHtml(t, d, o),
    fonts: fontsHref([d.style.script, d.style.heading, d.style.body]),
    title: d.date ? `${coupleNames(d)} · ${dayMonth(d.date)}` : coupleNames(d),
  };
}

/** A full HTML document: what guests open from WhatsApp. */
export function renderDocument(t: Template, d: InviteData, o: RenderOpts & { greeting?: string }) {
  const r = renderParts(t, d, o);
  const site = (o.siteUrl || "").replace(/\/$/, "");
  const desc = `${d.eyebrow ? d.eyebrow + ", " : ""}${coupleNames(d)} invite you to celebrate their wedding${d.date ? " on " + dayMonth(d.date) : ""}${d.city ? " in " + d.city : ""}. Tap to open.`;
  const image = d.cover ? `${site}/api/photos/${d.cover}` : `${site}/builder/og/${t.id}.jpg`;
  const p = paletteFor(t, d.style);
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>${h(r.title)}</title>
<meta name="description" content="${h(desc)}">
<meta name="robots" content="noindex, nofollow">
<meta name="theme-color" content="${p.bg}">
<meta property="og:type" content="website">
<meta property="og:title" content="${h(r.title)}">
<meta property="og:description" content="${h(desc)}">
${site ? `<meta property="og:image" content="${h(image)}">` : ""}
${o.pageUrl ? `<meta property="og:url" content="${h(o.pageUrl)}"><link rel="canonical" href="${h(o.pageUrl)}">` : ""}
<meta name="twitter:card" content="summary_large_image">
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link id="wic-fonts" rel="stylesheet" href="${h(r.fonts)}">
<style id="wic-css">${r.css}</style>
</head>
<body${d.show.opening && o.mode !== "thumb" && o.mode !== "editor" ? ' class="locked"' : ""}>
${art.DEFS}
<div id="wic-root">${r.html}</div>
<div id="fx" aria-hidden="true"></div>
<script>${RUNTIME}</script>
${o.greeting ? greetingBanner(o.greeting) : ""}
</body>
</html>`;
}
