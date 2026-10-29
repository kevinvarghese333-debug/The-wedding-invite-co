import { after } from "next/server";
import { createLead, setNotifyStatus } from "@/lib/db";
import { notifyNewLead } from "@/lib/notify";
import { rateLimited } from "@/lib/auth";
import { PACKAGES } from "@/lib/config";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const clean = (v: unknown, max: number) =>
  typeof v === "string" ? v.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, "").trim().slice(0, max) : "";

export async function POST(req: Request) {
  const ip = (req.headers.get("x-forwarded-for") || "").split(",")[0].trim() || req.headers.get("x-real-ip") || "local";
  if (rateLimited(`enquiry:${ip}`, 6, 10 * 60 * 1000)) {
    return Response.json({ ok: false, error: "Too many enquiries from this connection. Please try again in a few minutes, or message us on WhatsApp." }, { status: 429 });
  }

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return Response.json({ ok: false, error: "Invalid request." }, { status: 400 });
  }

  // Honeypot: real people never fill this hidden field.
  if (clean(body.website, 200)) return Response.json({ ok: true });

  const name = clean(body.name, 80);
  let phone = clean(body.phone, 24).replace(/[^\d+]/g, "");
  const email = clean(body.email, 120).toLowerCase();
  const wedding_date = clean(body.wedding_date, 10);
  const location = clean(body.location, 120);
  const pkg = clean(body.package, 20);
  const functions = clean(body.functions, 20);
  const message = clean(body.message, 1500);
  const source = clean(body.source, 300);

  const errors: Record<string, string> = {};
  if (name.length < 2) errors.name = "Please tell us your name.";
  let d = phone.replace(/\D/g, "");
  if (d.length === 10) d = "91" + d; // assume India when no country code
  if (d.length === 11 && d.startsWith("0")) d = "91" + d.slice(1);
  if (d.length < 10 || d.length > 15) errors.phone = "Please enter a WhatsApp number with country code.";
  phone = d;
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) errors.email = "That email doesn't look right.";
  if (wedding_date && !/^\d{4}-\d{2}-\d{2}$/.test(wedding_date)) errors.wedding_date = "Please pick a date.";
  if (Object.keys(errors).length) return Response.json({ ok: false, errors }, { status: 422 });

  const lead = createLead({
    name,
    phone,
    email: email || null,
    wedding_date: wedding_date || null,
    location: location || null,
    package: pkg in PACKAGES ? pkg : "unsure",
    functions: functions || null,
    message: message || null,
    source: source || null,
  });

  // Notify after the response is sent, so the couple never waits on email or WhatsApp.
  after(async () => {
    const r = await notifyNewLead(lead);
    setNotifyStatus(lead.id, r.email, r.whatsapp);
  });

  return Response.json({ ok: true, id: lead.id });
}
