import { after } from "next/server";
import { clean, cleanPhone, editable, emailOk, json } from "@/lib/builder/api";
import { getSite, setContact } from "@/lib/builder/sites";
import { onContactSaved } from "@/lib/builder/publish";
import { rateLimited } from "@/lib/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/* "Save my design": name, WhatsApp and email, so we can send the edit link and help if they get stuck. */
export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { site, error } = await editable(id);
  if (error) return error;
  if (rateLimited(`contact:${site.id}`, 8, 60 * 60 * 1000)) return json({ ok: false, error: "Please try again a little later." }, 429);
  const body = (await req.json().catch(() => ({}))) as Record<string, unknown>;
  const name = clean(body.name, 80);
  const email = clean(body.email, 120).toLowerCase();
  const phone = cleanPhone(body.phone);
  const errors: Record<string, string> = {};
  if (name.length < 2) errors.name = "Please tell us your name.";
  if (!phone) errors.phone = "Please enter a WhatsApp number with country code.";
  if (!email || !emailOk(email)) errors.email = "Please enter your email, so we can send your link.";
  if (Object.keys(errors).length) return json({ ok: false, errors }, 422);
  const emailChanged = email !== (site.email || "");
  setContact(site.id, { name, email, phone });
  const fresh = getSite(site.id)!;
  if (!site.lead_id || emailChanged) after(() => onContactSaved(fresh));
  return json({ ok: true });
}
