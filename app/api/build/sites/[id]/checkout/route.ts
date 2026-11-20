import { after } from "next/server";
import { clean, cleanPhone, editable, emailOk, json } from "@/lib/builder/api";
import { addOrder, cleanSlug, getSite, requestPublish, setContact, setSlug, siteData, slugProblem } from "@/lib/builder/sites";
import { builderPrice, liveUrl } from "@/lib/builder/server";
import { createRazorpayOrder, razorpayKeyId, razorpayReady } from "@/lib/builder/razorpay";
import { onContactSaved } from "@/lib/builder/publish";
import { coupleNames } from "@/lib/builder/render";
import { notifyStudio } from "@/lib/notify";
import { publicWhatsApp, siteUrl, STUDIO } from "@/lib/config";
import { rupees } from "@/lib/format";
import { rateLimited } from "@/lib/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/* Step before paying: claim the web address, save contact details, and open a Razorpay order
   (or, when Razorpay isn't set up, ask the studio to take payment by UPI and publish from Admin). */
export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { site, error } = await editable(id);
  if (error) return error;
  if (site.paid_at) return json({ ok: true, paid: true, url: site.slug ? liveUrl(site.slug) : "" });
  if (rateLimited(`checkout:${site.id}`, 12, 60 * 60 * 1000)) return json({ ok: false, error: "Please wait a few minutes and try again." }, 429);

  const body = (await req.json().catch(() => ({}))) as Record<string, unknown>;
  const slug = cleanSlug(clean(body.slug, 60));
  const name = clean(body.name, 80);
  const email = clean(body.email, 120).toLowerCase();
  const phone = cleanPhone(body.phone);
  const errors: Record<string, string> = {};
  const problem = slugProblem(slug, site.id);
  if (problem) errors.slug = problem;
  if (name.length < 2) errors.name = "Please tell us your name.";
  if (!phone) errors.phone = "Please enter a WhatsApp number with country code.";
  if (!email || !emailOk(email)) errors.email = "Please enter your email for the receipt and your link.";
  if (Object.keys(errors).length) return json({ ok: false, errors }, 422);

  setSlug(site.id, slug);
  const emailChanged = email !== (site.email || "");
  setContact(site.id, { name, email, phone });
  const fresh = getSite(site.id)!;
  if (!site.lead_id || emailChanged) after(() => onContactSaved(fresh));

  const d = siteData(fresh);
  const amount = builderPrice();

  if (!razorpayReady()) {
    const first = !site.publish_requested_at;
    requestPublish(site.id);
    if (first)
      after(() =>
        notifyStudio(
          `Ready to publish: ${coupleNames(d)} · ${rupees(amount)}`,
          `${name} (+${phone}, ${email}) finished "${coupleNames(d)}" and wants it live at ${liveUrl(slug)}.\nThey're paying ${rupees(amount)} by UPI (note "Invitation ${site.id}"). Once it's in your account, press "Mark paid and publish": ${siteUrl()}/admin/sites/${site.id}`
        )
      );
    return json({ ok: true, mode: "manual", amount, whatsapp: publicWhatsApp(), url: liveUrl(slug) });
  }

  try {
    const order = await createRazorpayOrder(amount, `site_${site.id}`, { site: site.id, slug, couple: coupleNames(d) });
    addOrder({ id: order.id, site_id: site.id, amount });
    return json({
      ok: true,
      mode: "razorpay",
      key: razorpayKeyId(),
      orderId: order.id,
      amount: order.amount,
      currency: "INR",
      name: STUDIO,
      description: `Wedding invitation · ${coupleNames(d)}`,
      prefill: { name, email, contact: `+${phone}` },
      url: liveUrl(slug),
    });
  } catch (e) {
    console.error("[razorpay] order failed", e);
    return json({ ok: false, error: "We couldn't start the payment just now. Please try again in a minute, or message us on WhatsApp." }, 502);
  }
}
