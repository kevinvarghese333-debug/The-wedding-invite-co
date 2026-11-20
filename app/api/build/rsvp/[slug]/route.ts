import { clean, cleanPhone, json } from "@/lib/builder/api";
import { addRsvp, getSiteBySlug } from "@/lib/builder/sites";
import { clientIp } from "@/lib/builder/server";
import { rateLimited } from "@/lib/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/* A guest's reply from a live invitation. */
export async function POST(req: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const site = getSiteBySlug(slug);
  if (!site || !site.paid_at || site.status !== "live") return json({ ok: false, error: "This invitation isn't taking replies right now." }, 404);
  if (rateLimited(`rsvp:${clientIp(req)}`, 12, 10 * 60 * 1000)) return json({ ok: false, error: "Too many replies from this connection. Please try again in a few minutes." }, 429);
  const b = (await req.json().catch(() => ({}))) as Record<string, unknown>;
  const name = clean(b.name, 80);
  if (name.length < 2) return json({ ok: false, error: "Please add your name." }, 422);
  const attending = b.attending === "no" ? "no" : "yes";
  const guests = Math.min(20, Math.max(1, Number.parseInt(String(b.guests || "1"), 10) || 1));
  const events = Array.isArray(b.events) ? b.events.map((e) => clean(e, 80)).filter(Boolean).slice(0, 10).join(", ") : "";
  addRsvp({ site_id: site.id, name, phone: cleanPhone(b.phone) || clean(b.phone, 20) || null, attending, guests, events: events || null, message: clean(b.message, 600) || null });
  return json({ ok: true });
}
