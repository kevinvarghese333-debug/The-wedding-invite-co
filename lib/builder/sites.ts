/* Invitations made in the builder, their payments and their guests' RSVPs.
   Same SQLite database as the leads. Server only. */
import crypto from "node:crypto";
import { getDb } from "@/lib/db";
import { SAMPLES } from "@/lib/samples";
import { normalize, type InviteData } from "@/lib/builder/types";
import { templateOrDefault } from "@/lib/builder/templates";
import { findDesign, type Config } from "@/lib/builder/designs";
import { cleanConfig, startingConfig, studioSummary } from "@/lib/builder/studio";

export type SiteStatus = "draft" | "live" | "paused";
export type Site = {
  id: string;
  created_at: string;
  updated_at: string;
  template: string;
  data: string;
  live_data: string | null;
  status: SiteStatus;
  slug: string | null;
  contact_name: string | null;
  email: string | null;
  phone: string | null;
  token_v: number;
  paid_at: string | null;
  amount: number | null;
  payment_ref: string | null;
  payment_method: string | null;
  publish_requested_at: string | null;
  published_at: string | null;
  lead_id: number | null;
  views: number;
  claim_ref: string | null; // UPI transaction id the couple gave us
  claimed_at: string | null;
  addons: string | null; // JSON: add-ons chosen (before paying) or bought (after)
  links: string | null; // JSON: guest links
  live_until: string | null; // the invitation stays live until this date
};

export type Rsvp = {
  id: number;
  site_id: string;
  created_at: string;
  name: string;
  phone: string | null;
  attending: "yes" | "no" | "wish"; // "wish": a blessing or message, not a reply
  guests: number;
  events: string | null;
  message: string | null;
  via: string | null; // which guest link the reply came through
};

export type Order = { id: string; site_id: string; amount: number; status: "created" | "paid"; payment_id: string | null; created_at: string; paid_at: string | null };
export type LibraryTrack = { id: string; title: string; by: string; file: string; created_at: string };

let ready = false;
function db() {
  const d = getDb();
  if (!ready) {
    d.exec(`
      CREATE TABLE IF NOT EXISTS sites (
        id TEXT PRIMARY KEY,
        created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
        updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
        template TEXT NOT NULL,
        data TEXT NOT NULL,
        live_data TEXT,
        status TEXT NOT NULL DEFAULT 'draft',
        slug TEXT UNIQUE,
        contact_name TEXT,
        email TEXT,
        phone TEXT,
        token_v INTEGER NOT NULL DEFAULT 1,
        paid_at TEXT,
        amount INTEGER,
        payment_ref TEXT,
        payment_method TEXT,
        publish_requested_at TEXT,
        published_at TEXT,
        lead_id INTEGER,
        views INTEGER NOT NULL DEFAULT 0,
        ip TEXT
      );
      CREATE INDEX IF NOT EXISTS idx_sites_status ON sites(status);
      CREATE INDEX IF NOT EXISTS idx_sites_email ON sites(email);
      CREATE TABLE IF NOT EXISTS site_orders (
        id TEXT PRIMARY KEY,
        site_id TEXT NOT NULL REFERENCES sites(id) ON DELETE CASCADE,
        amount INTEGER NOT NULL,
        status TEXT NOT NULL DEFAULT 'created',
        payment_id TEXT,
        created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
        paid_at TEXT
      );
      CREATE TABLE IF NOT EXISTS site_rsvps (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        site_id TEXT NOT NULL REFERENCES sites(id) ON DELETE CASCADE,
        created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
        name TEXT NOT NULL,
        phone TEXT,
        attending TEXT NOT NULL,
        guests INTEGER NOT NULL DEFAULT 1,
        events TEXT,
        message TEXT
      );
      CREATE INDEX IF NOT EXISTS idx_rsvps_site ON site_rsvps(site_id);
      CREATE TABLE IF NOT EXISTS builder_music (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        by TEXT NOT NULL DEFAULT '',
        file TEXT NOT NULL,
        created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
      );
    `);
    ready = true;
    const cols = (d.prepare("PRAGMA table_info(sites)").all() as { name: string }[]).map((c) => c.name);
    if (!cols.includes("claim_ref")) d.exec("ALTER TABLE sites ADD COLUMN claim_ref TEXT");
    if (!cols.includes("claimed_at")) d.exec("ALTER TABLE sites ADD COLUMN claimed_at TEXT");
    for (const c of ["addons", "links", "live_until"]) if (!cols.includes(c)) d.exec(`ALTER TABLE sites ADD COLUMN ${c} TEXT`);
    const rcols = (d.prepare("PRAGMA table_info(site_rsvps)").all() as { name: string }[]).map((c) => c.name);
    if (!rcols.includes("via")) d.exec("ALTER TABLE site_rsvps ADD COLUMN via TEXT");
  }
  return d;
}

const now = () => new Date().toISOString();

/* ---------- sites ---------- */
export function newSiteId() {
  return crypto.randomBytes(8).toString("base64url").replace(/[-_]/g, "x").slice(0, 10).toLowerCase();
}

export function createSite(templateId: string, ip: string, palette?: string, addons: string[] = []) {
  const id = newSiteId();
  const withAddons = () => addons.length && setAddons(id, addons);
  const design = findDesign(templateId);
  if (design) {
    db().prepare("INSERT INTO sites (id, template, data, ip) VALUES (?, ?, ?, ?)").run(id, design.id, JSON.stringify(startingConfig(design)), ip);
    withAddons();
    return id;
  }
  const t = templateOrDefault(templateId);
  const data = palette && t.palettes.some((p) => p.id === palette) ? { ...t.sample, style: { ...t.sample.style, palette } } : t.sample;
  db().prepare("INSERT INTO sites (id, template, data, ip) VALUES (?, ?, ?, ?)").run(id, t.id, JSON.stringify(data), ip);
  withAddons();
  return id;
}

export function countRecentByIp(ip: string, minutes: number) {
  return (db().prepare("SELECT COUNT(*) n FROM sites WHERE ip = ? AND created_at >= ?").get(ip, new Date(Date.now() - minutes * 60_000).toISOString()) as { n: number }).n;
}

export function getSite(id: string): Site | undefined {
  if (!/^[a-z0-9]{6,16}$/.test(id)) return undefined;
  return db().prepare("SELECT * FROM sites WHERE id = ?").get(id) as Site | undefined;
}

export function getSiteBySlug(slug: string): Site | undefined {
  return db().prepare("SELECT * FROM sites WHERE slug = ?").get(slug) as Site | undefined;
}

/** A studio design (one of our real invitations) rather than a builder template? */
export const isStudio = (s: Pick<Site, "template">) => !!findDesign(s.template);

/** The settings of a studio design site: the working copy, or what guests see. */
export function studioConfig(s: Site, which: "draft" | "live" = "draft"): Config | null {
  const design = findDesign(s.template);
  const raw = which === "live" ? s.live_data : s.data;
  if (!design || !raw) return null;
  try {
    return cleanConfig(design, JSON.parse(raw));
  } catch {
    return null;
  }
}

export type Summary = { one: string; two: string; names: string; date: string; place: string; events: string[] };

/** Names, date and place, whichever kind of design the site uses. */
export function siteSummary(s: Site): Summary {
  const design = findDesign(s.template);
  if (design) {
    const c = studioConfig(s) ?? design.sample;
    const x = studioSummary(design, c);
    const evs = (c as Record<string, unknown>).events;
    const events = Array.isArray(evs) ? evs.map((e) => String((e as Record<string, unknown>)?.name ?? (e as Record<string, unknown>)?.title ?? "")).filter(Boolean) : [];
    return { ...x, names: [x.one, x.two].filter(Boolean).join(" & ") || "Our wedding", events };
  }
  const d = siteData(s);
  return { one: d.one, two: d.two, names: [d.one.trim(), d.two.trim()].filter(Boolean).join(" & ") || "Our wedding", date: d.date, place: d.city, events: d.events.map((e) => e.name).filter(Boolean) };
}

/** The couple's working copy, cleaned (builder templates only; see studioConfig for studio designs). */
export function siteData(s: Site): InviteData {
  const t = templateOrDefault(s.template);
  try {
    return normalize(JSON.parse(s.data), t.sample);
  } catch {
    return t.sample;
  }
}

/** What guests see. */
export function liveData(s: Site): InviteData | null {
  if (!s.live_data) return null;
  const t = templateOrDefault(s.template);
  try {
    return normalize(JSON.parse(s.live_data), t.sample);
  } catch {
    return null;
  }
}

export function saveDraft(id: string, template: string, data: InviteData | Config) {
  db().prepare("UPDATE sites SET template = ?, data = ?, updated_at = ? WHERE id = ?").run(template, JSON.stringify(data), now(), id);
}

export function setContact(id: string, c: { name: string; email: string; phone: string }) {
  db().prepare("UPDATE sites SET contact_name = ?, email = ?, phone = ?, updated_at = ? WHERE id = ?").run(c.name, c.email || null, c.phone || null, now(), id);
}

export function setLead(id: string, leadId: number) {
  db().prepare("UPDATE sites SET lead_id = ? WHERE id = ?").run(leadId, id);
}

/* ---------- web addresses ---------- */
const RESERVED = new Set(["admin", "api", "build", "i", "new", "edit", "preview", "www", "help", "about", ...SAMPLES.map((s) => s.slug)]);

export function cleanSlug(s: string) {
  return s
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/&/g, "-")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40);
}

export function slugProblem(slug: string, siteId: string): string | null {
  if (slug.length < 3) return "Use at least 3 letters or numbers.";
  if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(slug)) return "Use only letters, numbers and dashes.";
  if (RESERVED.has(slug)) return "That address is taken. Try adding your wedding year.";
  const other = getSiteBySlug(slug);
  if (other && other.id !== siteId) return "That address is taken. Try adding your wedding year.";
  return null;
}

export function suggestSlug(d: Pick<Summary, "one" | "two" | "date">, siteId: string) {
  const a = cleanSlug(d.one);
  const b = cleanSlug(d.two);
  const year = d.date ? d.date.slice(0, 4) : "";
  const options = [[a, b].filter(Boolean).join("-weds-"), [a, b].filter(Boolean).join("-and-"), [a, b, year].filter(Boolean).join("-")].map(cleanSlug).filter(Boolean);
  for (const o of options) if (!slugProblem(o, siteId)) return o;
  return `${options[0] || "our-wedding"}-${siteId.slice(0, 4)}`;
}

export function setSlug(id: string, slug: string) {
  db().prepare("UPDATE sites SET slug = ?, updated_at = ? WHERE id = ?").run(slug, now(), id);
}

/* ---------- publishing ---------- */
export function requestPublish(id: string) {
  db().prepare("UPDATE sites SET publish_requested_at = COALESCE(publish_requested_at, ?) WHERE id = ?").run(now(), id);
}

/** The couple says they paid by UPI; we check the bank and publish from Admin. */
export function claimPayment(id: string, ref: string) {
  db().prepare("UPDATE sites SET claim_ref = ?, claimed_at = ?, publish_requested_at = COALESCE(publish_requested_at, ?) WHERE id = ?").run(ref, now(), now(), id);
}

/** Marks the site paid and puts the current design live. Safe to call twice. */
export function markPaid(id: string, p: { amount: number; ref: string; method: "razorpay" | "manual" | "free"; addons?: string[] }) {
  const s = getSite(id);
  if (!s) return undefined;
  if (s.paid_at) return s;
  const t = now();
  const addons = p.addons ?? JSON.parse(s.addons || "[]");
  const until = new Date();
  until.setFullYear(until.getFullYear() + (addons.includes("year") ? 2 : 1)); // a year live, two with the add-on
  db()
    .prepare(
      "UPDATE sites SET paid_at = ?, amount = ?, payment_ref = ?, payment_method = ?, status = 'live', live_data = data, published_at = COALESCE(published_at, ?), addons = ?, live_until = COALESCE(live_until, ?), updated_at = ? WHERE id = ?"
    )
    .run(t, p.amount, p.ref, p.method, t, JSON.stringify(addons), until.toISOString().slice(0, 10), t, id);
  return getSite(id);
}

/** Add-ons chosen before paying (from the design page or the publish page). Locked once paid, except from Admin. */
export function setAddons(id: string, addons: string[]) {
  db().prepare("UPDATE sites SET addons = ? WHERE id = ?").run(JSON.stringify(addons), id);
}

export function setLinks(id: string, links: unknown[]) {
  db().prepare("UPDATE sites SET links = ?, updated_at = ? WHERE id = ?").run(JSON.stringify(links), now(), id);
}

export function setLiveUntil(id: string, date: string | null) {
  db().prepare("UPDATE sites SET live_until = ? WHERE id = ?").run(date, id);
}

/** Past its live-until date? */
export const expired = (s: Pick<Site, "live_until">) => !!s.live_until && s.live_until < new Date().toISOString().slice(0, 10);

/** Puts the latest edits live (only once paid). */
export function publishChanges(id: string) {
  const r = db().prepare("UPDATE sites SET live_data = data, updated_at = ? WHERE id = ? AND paid_at IS NOT NULL").run(now(), id);
  return r.changes > 0;
}

export function setStatus(id: string, status: SiteStatus) {
  db().prepare("UPDATE sites SET status = ?, updated_at = ? WHERE id = ?").run(status, now(), id);
}

export function revokeLinks(id: string) {
  db().prepare("UPDATE sites SET token_v = token_v + 1 WHERE id = ?").run(id);
}

export function deleteSite(id: string) {
  db().prepare("DELETE FROM sites WHERE id = ?").run(id);
}

export function countView(id: string) {
  db().prepare("UPDATE sites SET views = views + 1 WHERE id = ?").run(id);
}

export function hasUnpublishedChanges(s: Site) {
  return !!s.paid_at && s.live_data !== s.data;
}

export function listSites(opts: { filter?: string; q?: string } = {}): (Site & { rsvps: number })[] {
  const where: string[] = [];
  const params: Record<string, string> = {};
  if (opts.filter === "live") where.push("s.paid_at IS NOT NULL");
  else if (opts.filter === "requested") where.push("s.paid_at IS NULL AND s.publish_requested_at IS NOT NULL");
  else if (opts.filter === "contact") where.push("s.paid_at IS NULL AND (s.email IS NOT NULL OR s.phone IS NOT NULL)");
  else if (opts.filter === "draft") where.push("s.paid_at IS NULL");
  if (opts.q) {
    where.push("(s.data LIKE @q OR s.email LIKE @q OR s.phone LIKE @q OR s.slug LIKE @q OR s.contact_name LIKE @q)");
    params.q = `%${opts.q}%`;
  }
  const sql = `SELECT s.*, (SELECT COUNT(*) FROM site_rsvps r WHERE r.site_id = s.id) AS rsvps FROM sites s ${where.length ? "WHERE " + where.join(" AND ") : ""} ORDER BY s.updated_at DESC LIMIT 500`;
  return db().prepare(sql).all(params) as (Site & { rsvps: number })[];
}

export function listByEmail(email: string): Site[] {
  return db().prepare("SELECT * FROM sites WHERE lower(email) = lower(?) ORDER BY updated_at DESC LIMIT 20").all(email) as Site[];
}

export function listByIds(ids: string[]): Site[] {
  if (!ids.length) return [];
  return db()
    .prepare(`SELECT * FROM sites WHERE id IN (${ids.map(() => "?").join(",")}) ORDER BY updated_at DESC`)
    .all(...ids) as Site[];
}

export function siteStats() {
  const one = (sql: string) => (db().prepare(sql).get() as { n: number | null }).n ?? 0;
  return {
    total: one("SELECT COUNT(*) n FROM sites"),
    live: one("SELECT COUNT(*) n FROM sites WHERE paid_at IS NOT NULL"),
    requested: one("SELECT COUNT(*) n FROM sites WHERE paid_at IS NULL AND publish_requested_at IS NOT NULL"),
    claimed: one("SELECT COUNT(*) n FROM sites WHERE paid_at IS NULL AND claim_ref IS NOT NULL"),
    revenue: one("SELECT SUM(amount) n FROM sites WHERE paid_at IS NOT NULL"),
    thisWeek: one(`SELECT COUNT(*) n FROM sites WHERE created_at >= '${new Date(Date.now() - 7 * 86_400_000).toISOString()}'`),
  };
}

/* ---------- payments ---------- */
export function addOrder(o: { id: string; site_id: string; amount: number }) {
  db().prepare("INSERT OR IGNORE INTO site_orders (id, site_id, amount) VALUES (?, ?, ?)").run(o.id, o.site_id, o.amount);
}

export function getOrder(id: string): Order | undefined {
  return db().prepare("SELECT * FROM site_orders WHERE id = ?").get(id) as Order | undefined;
}

export function markOrderPaid(id: string, paymentId: string) {
  db().prepare("UPDATE site_orders SET status = 'paid', payment_id = ?, paid_at = ? WHERE id = ? AND status != 'paid'").run(paymentId, now(), id);
}

/* ---------- RSVPs ---------- */
export function addRsvp(r: Omit<Rsvp, "id" | "created_at">) {
  db()
    .prepare("INSERT INTO site_rsvps (site_id, name, phone, attending, guests, events, message, via) VALUES (?, ?, ?, ?, ?, ?, ?, ?)")
    .run(r.site_id, r.name, r.phone, r.attending, r.guests, r.events, r.message, r.via ?? null);
}

export function listRsvps(siteId: string): Rsvp[] {
  return db().prepare("SELECT * FROM site_rsvps WHERE site_id = ? ORDER BY created_at DESC").all(siteId) as Rsvp[];
}

export function listWishes(siteId: string, limit = 60) {
  return db()
    .prepare("SELECT name, message, created_at FROM site_rsvps WHERE site_id = ? AND attending = 'wish' AND message IS NOT NULL AND message != '' ORDER BY created_at DESC LIMIT ?")
    .all(siteId, limit) as { name: string; message: string; created_at: string }[];
}

export function deleteRsvp(siteId: string, id: number) {
  db().prepare("DELETE FROM site_rsvps WHERE site_id = ? AND id = ?").run(siteId, id);
}

/* ---------- music added by the studio ---------- */
export function listLibraryTracks(): LibraryTrack[] {
  return db().prepare("SELECT * FROM builder_music ORDER BY created_at DESC").all() as LibraryTrack[];
}

export function addLibraryTrack(t: { title: string; by: string; file: string }) {
  const id = "m" + crypto.randomBytes(5).toString("hex");
  db().prepare("INSERT INTO builder_music (id, title, by, file) VALUES (?, ?, ?, ?)").run(id, t.title, t.by, t.file);
  return id;
}

export function deleteLibraryTrack(id: string) {
  const t = db().prepare("SELECT * FROM builder_music WHERE id = ?").get(id) as LibraryTrack | undefined;
  db().prepare("DELETE FROM builder_music WHERE id = ?").run(id);
  return t;
}
