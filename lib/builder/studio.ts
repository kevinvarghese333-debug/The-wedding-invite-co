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

/* ---------- rendering ---------- */
export type StudioOpts = {
  mode: "live" | "preview" | "editor" | "thumb";
  title: string;
  description: string;
  image?: string;
  pageUrl?: string;
  rsvpUrl?: string;
};

const ESC: Record<string, string> = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" };
const h = (s: string) => s.replace(/[&<>"']/g, (c) => ESC[c]);
/* Names go into HTML text, attributes and inline scripts, so keep them to characters that are safe in all three. */
const safeName = (s: string) => h(s.replace(/[<>"'`\\]/g, "").slice(0, 40));

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
    .replace(/<head([^>]*)>/i, `<head$1>\n${head}`)
    .replace(/__WIC_ONE__/g, safeName(s.one))
    .replace(/__WIC_TWO__/g, safeName(s.two));

  const file = design.file.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const tag = new RegExp(`<script([^>]*)\\ssrc="(?:\\./)?${file}(?:\\?[^"]*)?"([^>]*)>\\s*</script>`, "i");
  const inline = `<script>window.${design.var} = ${json};</script>`;
  out = tag.test(out) ? out.replace(tag, inline) : out.replace(/<\/head>/i, `${inline}\n</head>`);

  if (o.mode === "preview")
    out = out.replace(
      /<\/body>/i,
      `<div style="position:fixed;left:0;right:0;top:0;z-index:2147483647;background:#1f1a17;color:#f6efe6;font:500 12px/1.35 system-ui,sans-serif;text-align:center;padding:8px 12px;pointer-events:none">Preview · Only you can see this. Guests can open it once it's published.</div></body>`
    );
  return out;
}
