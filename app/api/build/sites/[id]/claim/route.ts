import { after } from "next/server";
import { clean, editable, json } from "@/lib/builder/api";
import { claimPayment, siteData } from "@/lib/builder/sites";
import { builderPrice, liveUrl } from "@/lib/builder/server";
import { coupleNames } from "@/lib/builder/render";
import { notifyStudio } from "@/lib/notify";
import { siteUrl } from "@/lib/config";
import { rupees } from "@/lib/format";
import { rateLimited } from "@/lib/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/* "I've paid": the couple gives the UPI transaction id; we get an alert to check the bank and publish. */
export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { site, error } = await editable(id);
  if (error) return error;
  if (site.paid_at) return json({ ok: true, paid: true });
  if (rateLimited(`claim:${site.id}`, 6, 60 * 60 * 1000)) return json({ ok: false, error: "Please wait a few minutes and try again." }, 429);
  const b = (await req.json().catch(() => ({}))) as Record<string, unknown>;
  const ref = clean(b.ref, 40).replace(/\s+/g, "");
  if (!/^[A-Za-z0-9-]{6,40}$/.test(ref)) return json({ ok: false, error: "Please enter the UPI transaction ID (UTR) from your payment app. It's usually 12 digits." }, 422);
  claimPayment(site.id, ref);
  const d = siteData(site);
  after(() =>
    notifyStudio(
      `Paid by UPI? ${coupleNames(d)} · ${rupees(builderPrice())}`,
      [
        `${site.contact_name || coupleNames(d)} says they paid ${rupees(builderPrice())} by UPI.`,
        `Transaction ID: ${ref}`,
        site.slug ? `Their link: ${liveUrl(site.slug)}` : "",
        `Check your bank, then press "Mark paid and publish": ${siteUrl()}/admin/sites/${site.id}`,
      ]
        .filter(Boolean)
        .join("\n")
    )
  );
  return json({ ok: true });
}
