/* Rendering and cleaning for studio designs (see designs.ts). Pure string work, so the editor
   can run it in the browser for the live preview and the server can run it for published pages. */
import { designBase, type Config, type Design, type Json } from "@/lib/builder/designs";

/* ---------- paths like "couple.one.first" or "events[2].venue" ---------- */
const parts = (path: string) => path.replace(/\[(\d+)\]/g, ".$1").split(".").filter(Boolean);

export function getPath(obj: Json | undefined, path: string): Json | undefined {
  let cur: Json | undefined = obj;
  for (const p of parts(path)) {
    if (cur && typeof cur === "object") cur = (cur as Record<string, Json>)[p];
    else return undefined;
  }
  return cur;
}

export function setPath<T extends Json>(obj: T, path: string, value: Json): T {
  const ps = parts(path);
  const copy = (o: Json | undefined): Json => (Array.isArray(o) ? [...o] : o && typeof o === "object" ? { ...o } : {});
  const root = copy(obj) as Record<string, Json>;
  let cur: Record<string, Json> = root;
  for (let i = 0; i < ps.length - 1; i++) {
    const next = copy(cur[ps[i]]);
    cur[ps[i]] = next;
    cur = next as Record<string, Json>;
  }
  cur[ps[ps.length - 1]] = value;
  return root as T;
}

/** "couple.one.first" hidden when "couple.one" or "couple.one.first" is listed; numbers ignored. */
export function isHidden(design: Design, path: string) {
  const p = path.replace(/\[\d+\]/g, "");
  return (design.hide || []).some((h) => p === h || p.startsWith(h + ".")) || [design.endpoint, design.demo].some((h) => h && p === h);
}

/* ---------- what kind of value is this? ---------- */
export const IMG_RE = /\.(jpe?g|png|webp|gif|avif)(\?.*)?$/i;
export const AUDIO_RE = /\.(mp3|m4a|ogg|wav)(\?.*)?$/i;
const PHOTO_URL = /^\/api\/photos\/[a-f0-9]{24}\.(webp|jpg)$/;
const MUSIC_URL = /^(\/builder\/music\/[a-z0-9-]+\.mp3|\/api\/build\/music\/[a-f0-9]{24}\.(mp3|m4a|ogg))$/;
const LOCAL = /^(\.\/)?[\w-]+(\/[\w.-]+)*\.[a-z0-9]{2,5}$/i;
const ISO_DT = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(:\d{2})?([+-]\d{2}:\d{2}|Z)?$/;
const ISO_D = /^\d{4}-\d{2}-\d{2}$/;
const HEX = /^#[0-9a-f]{3,8}$/i;

export type FieldKind = "text" | "long" | "date" | "datetime" | "url" | "photo" | "music" | "color" | "number" | "bool";

export function fieldKind(key: string, sample: Json): FieldKind {
  if (typeof sample === "boolean") return "bool";
  if (typeof sample === "number") return "number";
  const s = String(sample ?? "");
  if (IMG_RE.test(s) || /^(photo|src|image|img|portrait|cover|picture)$/i.test(key)) return "photo";
  if (AUDIO_RE.test(s) || (/^(music|song|track|audio|file)$/i.test(key) && !s.includes(" "))) return "music";
  if (ISO_DT.test(s) || /^(start|end|weddingAt|weddingStart)$/.test(key)) return ISO_D.test(s) ? "date" : "datetime";
  if (ISO_D.test(s) || /date|deadline|rsvpBy|^from$|^to$/i.test(key)) return ISO_D.test(s) || !s ? "date" : "text";
  if (HEX.test(s)) return "color";
  if (/^https?:\/\//.test(s) || /(map|url|link|instagram|website)$/i.test(key)) return "url";
  if (s.length > 70 || s.includes("\n") || /(note|text|message|story|quote|line|welcome|request|invite|meaning)$/i.test(key)) return "long";
  return "text";
}

/* ---------- cleaning what the browser sends ---------- */
const MAX_ITEMS = 24;
const clip = (s: string, n: number) => s.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, "").slice(0, n);

function cleanValue(design: Design, key: string, sample: Json, input: unknown): Json {
  if (Array.isArray(sample)) {
    if (!Array.isArray(input)) return sample;
    const shape = sample[0];
    if (shape === undefined) return [];
    return input.slice(0, Math.max(MAX_ITEMS, sample.length)).map((v, i) => cleanValue(design, key, sample[i] ?? shape, v));
  }
  if (sample && typeof sample === "object") {
    const src = input && typeof input === "object" && !Array.isArray(input) ? (input as Record<string, unknown>) : {};
    const out: Record<string, Json> = {};
    for (const [k, v] of Object.entries(sample)) out[k] = k in src ? cleanValue(design, k, v, src[k]) : v;
    return out;
  }
  if (typeof sample === "boolean") return typeof input === "boolean" ? input : sample;
  if (typeof sample === "number") {
    const n = Number(input);
    return Number.isFinite(n) ? n : sample;
  }
  if (typeof input !== "string") return sample;
  const s = clip(input, 3000);
  switch (fieldKind(key, sample)) {
    case "photo":
      return !s || PHOTO_URL.test(s) || (LOCAL.test(s) && !s.includes("..")) ? s : sample;
    case "music":
      return !s || MUSIC_URL.test(s) || (LOCAL.test(s) && !s.includes("..")) ? s : sample;
    case "url":
      return !s || /^https?:\/\/[^\s"'<>]+$/.test(s) || s.startsWith("#") ? s : sample;
    case "color":
      return HEX.test(s) ? s : sample;
    default:
      return s;
  }
}

/** Keeps only the settings the design knows about, with safe values. Hidden settings keep the sample's value. */
export function cleanConfig(design: Design, input: unknown): Config {
  const cleaned = cleanValue(design, "", design.sample, input) as Config;
  let out: Config = cleaned;
  for (const h of design.hide || []) {
    const v = getPath(design.sample, h);
    if (v !== undefined) out = setPath(out, h, v);
  }
  return out;
}

/** The settings a couple starts from: the sample, with our music in place of the original song. */
export function startingConfig(design: Design): Config {
  let c = design.sample;
  if (design.music && getPath(c, design.music) !== undefined) c = setPath(c, design.music, "/builder/music/canon.mp3");
  return c;
}

/* ---------- summary for lists, emails and page titles ---------- */
const str = (v: Json | undefined) => (typeof v === "string" ? v.trim() : "");

export function studioSummary(design: Design, config: Config) {
  const one = str(getPath(config, design.one));
  const two = str(getPath(config, design.two));
  const raw = str(getPath(config, design.date));
  const date = /^\d{4}-\d{2}-\d{2}/.test(raw) ? raw.slice(0, 10) : "";
  const place = design.place ? str(getPath(config, design.place)) : "";
  return { one, two, date, place };
}

/** How many photos still point at the design's sample pictures. */
export function samplePhotoCount(design: Design, config: Config) {
  let n = 0;
  const walk = (v: Json, key: string) => {
    if (Array.isArray(v)) v.forEach((x) => walk(x, key));
    else if (v && typeof v === "object") Object.entries(v).forEach(([k, x]) => walk(x, k));
    else if (typeof v === "string" && fieldKind(key, v) === "photo" && v && !v.startsWith("/api/photos/")) n++;
  };
  walk(config, "");
  return n;
}

/* ---------- guest links ---------- */
/** The path of a design's list of functions, if it has one guests can be shown a part of. */
export function eventsPath(design: Design) {
  const p = design.events || "events";
  return Array.isArray(getPath(design.sample, p)) ? p : null;
}

export const eventName = (e: Json) => (e && typeof e === "object" && !Array.isArray(e) ? String((e as Record<string, Json>).name ?? (e as Record<string, Json>).title ?? "") : "");

/** Function names in a studio design's settings. */
export function studioEvents(design: Design, config: Config) {
  const p = eventsPath(design);
  const list = p ? getPath(config, p) : null;
  return Array.isArray(list) ? list.map(eventName).filter(Boolean) : [];
}

/** Keeps only the named functions (all of them when the list is empty). */
export function onlyEvents(design: Design, config: Config, names: string[]): Config {
  const p = eventsPath(design);
  const list = p ? getPath(config, p) : null;
  if (!p || !Array.isArray(list) || !names.length) return config;
  return setPath(config, p, list.filter((e) => names.includes(eventName(e))));
}

/** "Dear Sharma family", shown at the top of a personal link until the guest scrolls. */
export function greetingBanner(text: string) {
  if (!text) return "";
  const t = text.replace(/[<>&"]/g, "");
  return `<div id="wic-greet" role="note" style="position:fixed;left:50%;top:max(14px,env(safe-area-inset-top));transform:translateX(-50%);z-index:2147483646;background:rgba(255,253,249,.94);color:#4a0f16;border:1px solid rgba(74,15,22,.15);box-shadow:0 10px 30px rgba(0,0,0,.18);border-radius:999px;padding:9px 20px;font:italic 500 17px/1.2 Georgia,serif;white-space:nowrap;max-width:92vw;overflow:hidden;text-overflow:ellipsis;transition:opacity .6s,transform .6s">Dear ${t},</div><script>(function(){var g=document.getElementById("wic-greet");function hide(){g.style.opacity="0";g.style.transform="translate(-50%,-12px)"}addEventListener("scroll",function(){if(scrollY>160)hide()},{passive:true});setTimeout(hide,9000)})();</script>`;
}

/* ---------- rendering ---------- */
export type StudioOpts = {
  mode: "live" | "preview" | "editor" | "thumb";
  title: string;
  description: string;
  image?: string;
  pageUrl?: string;
  rsvpUrl?: string;
  /** where the design's own "Made by The Wedding Invite Co." line should link, on published invitations */
  brandUrl?: string;
};

const ESC: Record<string, string> = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" };
const h = (s: string) => s.replace(/[&<>"']/g, (c) => ESC[c]);
/* Names go into HTML text, attributes and inline scripts, so keep them to characters that are safe in all three. */
const safeName = (s: string) => h(s.replace(/[<>"'`\\]/g, "").slice(0, 80));

/* ---------- words a design may have written into its page ----------
   __WIC_ONE__, __WIC_DATE_LONG__ …: derived from the names and date.
   __WIC{path}__: any setting, as text. __WICURL{path}__: a setting that is a link.
   <!--wic-if:path--> … <!--/wic-if:path-->: dropped when that setting is empty. */
const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const ONES = ["", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine", "ten", "eleven", "twelve", "thirteen", "fourteen", "fifteen", "sixteen", "seventeen", "eighteen", "nineteen"];
const TENS = ["", "", "twenty", "thirty", "forty", "fifty", "sixty", "seventy", "eighty", "ninety"];
const ORD: Record<string, string> = { one: "first", two: "second", three: "third", five: "fifth", eight: "eighth", nine: "ninth", twelve: "twelfth", twenty: "twentieth", thirty: "thirtieth" };
const words = (n: number) => (n < 20 ? ONES[n] : TENS[Math.floor(n / 10)] + (n % 10 ? "-" + ONES[n % 10] : ""));
const ordinal = (n: number) => {
  const w = words(n);
  const last = w.split("-").pop()!;
  const o = ORD[last] ?? (last.endsWith("y") ? last.slice(0, -1) + "ieth" : last + "th");
  return w.slice(0, w.length - last.length) + o;
};
const yearWords = (y: number) => `two thousand${y % 100 ? " and " + words(y % 100) : ""}`;

export function wicValues(design: Design, config: Config): Record<string, string> {
  const x = studioSummary(design, config);
  const v: Record<string, string> = { ONE: x.one, TWO: x.two, I1: x.one.charAt(0).toUpperCase(), I2: x.two.charAt(0).toUpperCase(), PLACE: x.place };
  if (x.date) {
    const [y, m, d] = x.date.split("-").map(Number);
    const dow = DAYS[new Date(Date.UTC(y, m - 1, d)).getUTCDay()];
    Object.assign(v, {
      DATE: `${d} ${MONTHS[m - 1]} ${y}`,
      DATE_LONG: `${dow}, ${d} ${MONTHS[m - 1]} ${y}`,
      DATE_DM: `${d} ${MONTHS[m - 1]}`,
      DATE_DOTS: `${String(d).padStart(2, "0")} · ${String(m).padStart(2, "0")} · ${y}`,
      DATE_WORDS: `${dow}, the ${ordinal(d)} of ${MONTHS[m - 1]}`,
      YEAR_WORDS: yearWords(y),
      WEEKDAY: dow,
      MONTH_YEAR: `${MONTHS[m - 1]} ${y}`,
    });
  }
  const raw = String(getPath(config, design.date) ?? "");
  const ts = Date.parse(raw);
  if (Number.isFinite(ts)) v.TS = String(ts);
  const t = /T(\d{2}):(\d{2})/.exec(raw);
  if (t) v.TIME = `${Number(t[1]) % 12 || 12}:${t[2]} ${Number(t[1]) < 12 ? "AM" : "PM"}`;
  return v;
}

const text = (v: Json | undefined) => (typeof v === "string" || typeof v === "number" ? h(String(v).replace(/[\r\n]+/g, " ")) : "");
const src = (v: Json | undefined) => (typeof v === "string" && (PHOTO_URL.test(v) || (LOCAL.test(v) && !v.includes(".."))) ? h(v) : "");
const link = (v: Json | undefined) => (typeof v === "string" && /^(https?:\/\/|mailto:|tel:|#)/.test(v) ? h(v) : "#");

function fillTokens(out: string, design: Design, config: Config) {
  const vals = wicValues(design, config);
  return out
    .replace(/<!--wic-if:([^>]+?)-->([\s\S]*?)<!--\/wic-if:\1-->/g, (_, p, inner) => (text(getPath(config, p)) ? inner : ""))
    .replace(/__WICURL\{([^}]+)\}__/g, (_, p) => link(getPath(config, p)))
    .replace(/__WICSRC\{([^}]+)\}__/g, (_, p) => src(getPath(config, p)))
    .replace(/__WIC\{([^}]+)\}__/g, (_, p) => text(getPath(config, p)))
    .replace(/__WIC_([A-Z0-9_]+)__/g, (m, k) => (k in vals ? safeName(vals[k]) : ""));
}

export function renderStudio(design: Design, html: string, config: Config, o: StudioOpts) {
  let c = config;
  if (design.endpoint) c = setPath(c, design.endpoint, o.mode === "live" && o.rsvpUrl ? o.rsvpUrl : "");
  if (design.demo) c = setPath(c, design.demo, o.mode !== "live");
  if (getPath(c, "url") !== undefined && o.pageUrl) c = setPath(c, "url", o.pageUrl);
  const s = studioSummary(design, c);
  const json = JSON.stringify(c).replace(/</g, "\\u003c").replace(/[\u2028\u2029]/g, " ");

  const head = [
    `<base href="${designBase(design.id)}">`,
    `<title>${h(o.title)}</title>`,
    `<meta name="robots" content="noindex, nofollow">`,
    `<meta name="description" content="${h(o.description)}">`,
    `<meta property="og:type" content="website">`,
    `<meta property="og:title" content="${h(o.title)}">`,
    `<meta property="og:description" content="${h(o.description)}">`,
    o.image ? `<meta property="og:image" content="${h(o.image)}">` : "",
    o.pageUrl ? `<meta property="og:url" content="${h(o.pageUrl)}">` : "",
    `<meta name="twitter:card" content="summary_large_image">`,
    // With <base>, in-page links like #rsvp would leave the page: keep them on it.
    `<script>document.addEventListener("click",function(e){var a=e.target&&e.target.closest&&e.target.closest('a[href^="#"]');if(!a)return;var id=a.getAttribute("href").slice(1);e.preventDefault();var t=id?document.getElementById(id):null;if(t)t.scrollIntoView({behavior:"smooth"});else if(!id)window.scrollTo({top:0,behavior:"smooth"})},true);</script>`,
  ].join("\n");

  let out = html
    // their own title and sharing tags named the sample couple
    .replace(/<title>[\s\S]*?<\/title>/i, "")
    .replace(/<meta\s+(?:property|name)="(?:og:[^"]*|twitter:[^"]*|description|robots)"[^>]*>/gi, "")
    .replace(/<link\s+rel="canonical"[^>]*>/gi, "")
    .replace(/<head([^>]*)>/i, `<head$1>\n${head}\n<script>window.__WIC = ${JSON.stringify(wicValues(design, c)).replace(/</g, "\\u003c")};</script>`);
  out = fillTokens(out, design, c);

  const file = design.file.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const tag = new RegExp(`<script([^>]*)\\ssrc="(?:\\./)?${file}(?:\\?[^"]*)?"([^>]*)>\\s*</script>`, "i");
  const inline = `<script>window.${design.var} = ${json};</script>`;
  out = tag.test(out) ? out.replace(tag, inline) : out.replace(/<\/head>/i, `${inline}\n</head>`);

  // The design's own credit line becomes a link, so guests who like it can find us.
  if (o.brandUrl)
    out = out.replace(
      /(Made (?:with love )?by |Made with love · )The Wedding Invite Co\./,
      `$1<a href="${h(o.brandUrl)}" target="_blank" rel="noopener" style="color:inherit;text-decoration:underline;text-underline-offset:2px">The Wedding Invite Co.</a>`
    );

  if (o.mode === "preview")
    out = out.replace(
      /<\/body>/i,
      `<div style="position:fixed;left:0;right:0;top:0;z-index:2147483647;background:#1f1a17;color:#f6efe6;font:500 12px/1.35 system-ui,sans-serif;text-align:center;padding:8px 12px;pointer-events:none">Preview · Only you can see this. Guests can open it once it's published.</div></body>`
    );
  return out;
}
