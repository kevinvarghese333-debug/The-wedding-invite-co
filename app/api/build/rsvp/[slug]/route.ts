import { clean, cleanPhone, json } from "@/lib/builder/api";
import { addRsvp, getSiteBySlug, listWishes } from "@/lib/builder/sites";
import { clientIp } from "@/lib/builder/server";
import { rateLimited } from "@/lib/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/* Replies and blessings from a live invitation. Our own designs post JSON; the studio designs post
   whatever their form had (JSON, text/plain JSON, or form fields), so field names are matched loosely. */

const pick = (b: Record<string, unknown>, keys: string[]) => {
  for (const k of keys) {
    const hit = Object.keys(b).find((x) => x.toLowerCase() === k);
    if (hit !== undefined && b[hit] !== undefined && b[hit] !== null && String(b[hit]).trim() !== "") return b[hit];
  }
  return undefined;
};
const NAME = ["name", "fullname", "full_name", "guest", "guestname", "your_name", "from"];
const ATTEND = ["attending", "attend", "attendance", "response", "rsvp", "coming", "status", "answer"];
const GUESTS = ["guests", "guestcount", "count", "number", "people", "party", "adults", "seats"];
const MESSAGE = ["message", "note", "notes", "wish", "wishes", "blessing", "comment", "comments", "text"];
const PHONE = ["phone", "mobile", "whatsapp", "tel", "contact"];
const EVENTS = ["events", "functions", "ceremonies", "celebrations"];
const KNOWN = new Set([...NAME, ...ATTEND, ...GUESTS, ...MESSAGE, ...PHONE, ...EVENTS, "type", "website", "_gotcha", "lang", "language"]);

async function readBody(req: Request): Promise<Record<string, unknown>> {
  const type = req.headers.get("content-type") || "";
  if (type.includes("multipart/form-data") || type.includes("application/x-www-form-urlencoded")) {
    const fd = await req.formData().catch(() => null);
    const out: Record<string, unknown> = {};
    fd?.forEach((v, k) => {
      if (typeof v !== "string") return;
      out[k] = k in out ? [out[k], v].flat() : v;
    });
    return out;
  }
  const raw = (await req.text().catch(() => "")).slice(0, 20_000);
  try {
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === "object" && !Array.isArray(parsed) ? parsed : {};
  } catch {
    return Object.fromEntries(new URLSearchParams(raw));
  }
}

function liveSite(slug: string) {
  const site = getSiteBySlug(slug);
  return site && site.paid_at && site.status === "live" ? site : undefined;
}

export async function POST(req: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const site = liveSite(slug);
  if (!site) return json({ ok: false, error: "This invitation isn't taking replies right now." }, 404);
  if (rateLimited(`rsvp:${clientIp(req)}`, 12, 10 * 60 * 1000)) return json({ ok: false, error: "Too many replies from this connection. Please try again in a few minutes." }, 429);
  const b = await readBody(req);
  if (clean(b.website, 200) || clean(b._gotcha, 200)) return json({ ok: true }); // honeypots

  const name = clean(String(pick(b, NAME) ?? ""), 80);
  if (name.length < 2) return json({ ok: false, error: "Please add your name." }, 422);
  const isWish = String(b.type ?? "").toLowerCase() === "blessing" || String(b.type ?? "").toLowerCase() === "wish";
  const a = pick(b, ATTEND);
  const no = a === false || /^(no|false|0|decline|declines|regret|regretfully|not|can'?t|cannot|unable)/i.test(String(a ?? "").trim());
  const attending = isWish ? "wish" : no ? "no" : "yes";
  const guests = Math.min(20, Math.max(1, Number.parseInt(String(pick(b, GUESTS) ?? "1"), 10) || 1));
  const ev = pick(b, EVENTS);
  const events = (Array.isArray(ev) ? ev : typeof ev === "string" ? ev.split(",") : []).map((e) => clean(String(e), 80)).filter(Boolean).slice(0, 10).join(", ");
  const extra = Object.entries(b)
    .filter(([k, v]) => !KNOWN.has(k.toLowerCase()) && v !== "" && v !== null && typeof v !== "object")
    .slice(0, 8)
    .map(([k, v]) => `${clean(k, 30)}: ${clean(String(v), 200)}`);
  const message = [clean(String(pick(b, MESSAGE) ?? ""), 600), ...extra].filter(Boolean).join("\n") || null;
  const phoneRaw = pick(b, PHONE);
  addRsvp({ site_id: site.id, name, phone: phoneRaw ? cleanPhone(phoneRaw) || clean(String(phoneRaw), 20) : null, attending, guests: attending === "yes" ? guests : 1, events: events || null, message });
  return json({ ok: true });
}

/* Designs with a blessings wall read it back: ?action=blessings */
export async function GET(req: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const site = liveSite(slug);
  if (!site) return json({ ok: false, blessings: [] }, 404);
  const rows = new URL(req.url).searchParams.get("action") === "blessings" ? listWishes(site.id) : [];
  return json({ ok: true, blessings: rows.map((r) => ({ name: r.name, message: r.message, at: r.created_at })) });
}
