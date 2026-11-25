/* Server helpers for the builder: who may edit a site, the music library, prices and paths. */
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { cookies, headers } from "next/headers";
import { isAdmin } from "@/lib/auth";
import { builderUrl, publicWhatsApp, siteUrl } from "@/lib/config";
import { ADDONS, type Prices } from "@/lib/builder/addons";
import { getSettings } from "@/lib/settings";
import { BUILT_IN, trackSrc, type Track } from "@/lib/builder/music";
import { listByIds, listLibraryTracks, siteData, siteSummary, studioConfig, liveData, type Site } from "@/lib/builder/sites";
import { findDesign, designThumb } from "@/lib/builder/designs";
import { greetingBanner, onlyEvents, renderStudio, studioEvents } from "@/lib/builder/studio";
import type { GuestLink } from "@/lib/builder/addons";
import { dayMonth } from "@/lib/builder/render";
import { templateOrDefault } from "@/lib/builder/templates";
import { renderDocument, type RenderMode } from "@/lib/builder/render";
import type { InviteData } from "@/lib/builder/types";

/* ---------- ownership ----------
   No accounts: whoever holds a site's edit link may edit it. The link carries an HMAC of the site id,
   so nothing secret is stored in the database, and Admin can revoke old links by bumping token_v. */
const COOKIE = (id: string) => `wicb_${id}`;
const YEAR = 365 * 24 * 60 * 60;

function secret() {
  const s = process.env.SESSION_SECRET || process.env.ADMIN_PASSWORD;
  if (!s) throw new Error("Set SESSION_SECRET (or ADMIN_PASSWORD) in .env");
  return s;
}

export function editToken(s: Pick<Site, "id" | "token_v">) {
  return crypto.createHmac("sha256", secret()).update(`site:${s.id}:${s.token_v}`).digest("base64url").slice(0, 32);
}

function same(a: string, b: string) {
  const ha = crypto.createHash("sha256").update(a).digest();
  const hb = crypto.createHash("sha256").update(b).digest();
  return crypto.timingSafeEqual(ha, hb);
}

export function tokenOk(s: Pick<Site, "id" | "token_v">, token: string | undefined | null) {
  return !!token && same(token, editToken(s));
}

export async function ownsSite(s: Site) {
  const jar = await cookies();
  return tokenOk(s, jar.get(COOKIE(s.id))?.value);
}

/** The couple who made it, or the studio. */
export async function canEdit(s: Site) {
  return (await ownsSite(s)) || (await isAdmin());
}

export async function rememberOwner(s: Site) {
  const jar = await cookies();
  jar.set(COOKIE(s.id), editToken(s), { httpOnly: true, sameSite: "lax", secure: siteUrl().startsWith("https://"), path: "/", maxAge: YEAR });
}

/** Site ids this browser holds edit cookies for (not yet checked). */
export async function cookieSiteIds() {
  const jar = await cookies();
  return jar
    .getAll()
    .filter((c) => c.name.startsWith("wicb_"))
    .map((c) => c.name.slice(5))
    .filter((id) => /^[a-z0-9]{6,16}$/.test(id));
}

export async function mySites() {
  const jar = await cookies();
  const ids = await cookieSiteIds();
  return listByIds(ids).filter((s) => tokenOk(s, jar.get(COOKIE(s.id))?.value));
}

/** The magic link we email: opens the editor on any device. */
export function editLink(s: Pick<Site, "id" | "token_v">) {
  return `${builderUrl()}/open/${s.id}?t=${editToken(s)}`;
}

/* ---------- paths ----------
   The builder answers on build.<domain> (where "/" is the builder home) and on <domain>/build. */
export function isBuilderHost(host: string | null) {
  if (!host) return false;
  const h = host.split(":")[0].toLowerCase();
  if (h.startsWith("build.")) return true;
  try {
    return !!process.env.BUILDER_URL && new URL(process.env.BUILDER_URL).hostname === h;
  } catch {
    return false;
  }
}

export async function getBase() {
  const h = await headers();
  return isBuilderHost(h.get("x-forwarded-host") || h.get("host")) ? "" : "/build";
}

export const liveUrl = (slug: string) => `${siteUrl()}/i/${slug}`;

/* ---------- money ---------- */
/** Prices for one design (its own publish price), or the simpler designs' price when no design is given. */
export function prices(template?: string): Prices {
  const s = getSettings();
  const num = (v: string | undefined, d: number) => {
    const n = Number(String(v || "").replace(/[^\d]/g, ""));
    return Number.isFinite(n) && n > 0 ? n : d;
  };
  const wasRaw = String(s.builder_price_was ?? "").trim();
  // A crossed-out "original" price only shows when one is set in Admin.
  const p = { base: builderPrice(template), was: wasRaw ? num(wasRaw, 0) : 0 } as Prices;
  for (const a of ADDONS) p[a.id] = num(s[a.setting], a.price);
  return p;
}

export type Support = { phone: string; hours: string; email: string; call: string };
/** How couples reach the studio, from Admin → Settings with sensible fallbacks. */
export function support(): Support {
  const s = getSettings();
  const phone = (s.support_phone || "").replace(/\D/g, "") || publicWhatsApp();
  const email = (s.support_email || "").trim() || (process.env.NOTIFY_EMAIL || "").split(",")[0].trim();
  return { phone, hours: s.support_hours?.trim() || "Mon to Sat, 10:00 AM to 7:00 PM IST", email, call: callLink(phone) };
}

/** "Book a free call": a booking link from Admin → Settings, or a WhatsApp message to the support number. */
export function callLink(phone = (getSettings().support_phone || "").replace(/\D/g, "") || publicWhatsApp()) {
  const l = getSettings().call_link;
  return l && /^https?:\/\//.test(l) ? l : `https://wa.me/${phone}?text=${encodeURIComponent("Hi! I'd like to book a free 15-minute call about the invitation builder.")}`;
}

/* Two prices: our studio designs, which carry a story line (₹2,999), and the simpler designs (₹1,999). */
const rupeesSetting = (v: string | undefined, d: number) => {
  const n = Number(String(v || "").replace(/[^\d]/g, ""));
  return Number.isFinite(n) && n > 0 ? n : d;
};
export const simplePrice = () => rupeesSetting(getSettings().builder_price, 1999);
export const storyPrice = () => rupeesSetting(getSettings().builder_price_story, 2999);
/** What publishing a design costs. Without a design: the lowest price ("from ₹1,999"). */
export function builderPrice(template?: string) {
  return template && findDesign(template) ? storyPrice() : simplePrice();
}

/* ---------- music ---------- */
export const MUSIC_RE = /^[a-f0-9]{24}\.(mp3|m4a|ogg)$/;
export const MAX_MUSIC_BYTES = 12 * 1024 * 1024;

export function musicDir() {
  const dir = path.join(process.env.DATA_DIR || path.join(process.cwd(), "data"), "music");
  fs.mkdirSync(dir, { recursive: true });
  return dir;
}

export async function saveMusic(file: File) {
  const ext = /\.(m4a|aac)$/i.test(file.name) || file.type === "audio/mp4" || file.type === "audio/x-m4a" ? "m4a" : /\.ogg$/i.test(file.name) || file.type === "audio/ogg" ? "ogg" : "mp3";
  if (!file.type.startsWith("audio/") && !/\.(mp3|m4a|aac|ogg)$/i.test(file.name)) throw new Error("Please choose an MP3 or M4A song.");
  if (file.size > MAX_MUSIC_BYTES) throw new Error("That song is over 12 MB. Please choose a shorter or smaller file.");
  const buf = Buffer.from(await file.arrayBuffer());
  const name = `${crypto.randomBytes(12).toString("hex")}.${ext}`;
  fs.writeFileSync(path.join(musicDir(), name), buf);
  return name;
}

/** Built-in tracks plus anything added in Admin → Music. */
export function library(): Track[] {
  const added = listLibraryTracks().map((t) => ({ id: t.id, title: t.title, by: t.by, src: `/api/build/music/${t.file}` }));
  return [...added, ...BUILT_IN];
}

/* ---------- rendering ---------- */
const htmlCache = new Map<string, string>();
/** The original page of a studio design, as shipped in public/builder/designs/<id>/index.html. */
export function designHtml(id: string) {
  if (!/^[a-z0-9-]+$/.test(id)) return "";
  const hit = htmlCache.get(id);
  if (hit !== undefined && process.env.NODE_ENV === "production") return hit;
  const file = path.join(process.cwd(), "public", "builder", "designs", id, "index.html");
  const html = fs.existsSync(file) ? fs.readFileSync(file, "utf8") : "";
  htmlCache.set(id, html);
  return html;
}

/** A site as a full HTML page: its draft (previews) or its published copy (live). Empty when there's nothing to show. */
export function renderSite(s: Site, mode: RenderMode, link?: GuestLink) {
  const which = mode === "live" ? "live" : "draft";
  const design = findDesign(s.template);
  const rsvpUrl = s.slug ? `/api/build/rsvp/${s.slug}${link ? `?via=${link.code}` : ""}` : "";
  if (design) {
    let config = studioConfig(s, which);
    if (!config) return "";
    if (link) config = onlyEvents(design, config, link.events);
    const x = siteSummary(s);
    const names = [x.one, x.two].filter(Boolean).join(" & ") || "Our wedding";
    return renderStudio(design, designHtml(design.id), config, {
      mode,
      title: x.date ? `${names} · ${dayMonth(x.date)}` : names,
      description: `${names} invite you to celebrate their wedding${x.date ? " on " + dayMonth(x.date) : ""}${x.place ? " in " + x.place : ""}. Tap to open.`,
      image: `${siteUrl()}${designThumb(design.id).replace(".jpg", "-og.jpg")}`,
      pageUrl: s.slug ? liveUrl(s.slug) + (link ? `/${link.code}` : "") : undefined,
      rsvpUrl,
    }).replace(/<\/body>/i, `${link?.greeting ? greetingBanner(link.greeting) : ""}</body>`);
  }
  let data = which === "live" ? liveData(s) : siteData(s);
  if (!data) return "";
  if (link?.events.length) data = { ...data, events: data.events.filter((e) => link.events.includes(e.name)) };
  return renderEngine(s, data, mode, link, rsvpUrl);
}

/** The functions a site has, by name: what guest links choose from. */
export function siteEvents(s: Site) {
  const design = findDesign(s.template);
  if (design) return studioEvents(design, studioConfig(s) ?? design.sample);
  return siteData(s).events.map((e) => e.name).filter(Boolean);
}


function renderEngine(s: Site, data: InviteData, mode: RenderMode, link?: GuestLink, rsvpUrl?: string) {
  const t = templateOrDefault(s.template);
  return renderDocument(t, data, {
    mode,
    musicSrc: mode === "thumb" ? "" : trackSrc(data.music.track, library()),
    rsvpUrl,
    greeting: link?.greeting,
    siteUrl: siteUrl(),
    builderUrl: builderUrl(),
    pageUrl: mode === "live" && s.slug ? liveUrl(s.slug) + (link ? `/${link.code}` : "") : undefined,
  });
}

export function clientIp(req: Request) {
  return (req.headers.get("x-forwarded-for") || "").split(",")[0].trim() || req.headers.get("x-real-ip") || "local";
}
