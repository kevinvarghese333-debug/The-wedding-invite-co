import { after } from "next/server";
import { clean, cleanPhone, editable, emailOk, json } from "@/lib/builder/api";
import { addOrder, cleanSlug, getSite, requestPublish, setAddons, setContact, setSlug, siteSummary, slugProblem } from "@/lib/builder/sites";
import { ADDONS, cleanAddons, totalFor } from "@/lib/builder/addons";
import { upiPayment } from "@/lib/builder/upi";
import { liveUrl, prices } from "@/lib/builder/server";
import { createRazorpayOrder, razorpayKeyId, razorpayReady } from "@/lib/builder/razorpay";
import { onContactSaved } from "@/lib/builder/publish";
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

  const addons = cleanAddons(body.addons);
  setSlug(site.id, slug);
  setAddons(site.id, addons);
  const emailChanged = email !== (site.email || "");
  setContact(site.id, { name, email, phone });
  const fresh = getSite(site.id)!;
  if (!site.lead_id || emailChanged) after(() => onContactSaved(fresh));

  const names = siteSummary(fresh).names;
  const amount = totalFor(prices(site.template), addons);
  const extras = addons.map((a) => ADDONS.find((x) => x.id === a)!.title);

  if (!razorpayReady()) {
    const first = !site.publish_requested_at;
    requestPublish(site.id);
    const upi = await upiPayment(amount, site.id);
    if (first)
      after(() =>
        notifyStudio(
          `Ready to publish: ${names} · ${rupees(amount)}`,
          `${name} (+${phone}, ${email}) finished "${names}" and wants it live at ${liveUrl(slug)}.\n${extras.length ? `Add-ons: ${extras.join(", ")}.\n` : ""}They're paying ${rupees(amount)} by UPI (note "Invitation ${site.id}"). Once it's in your account, press "Mark paid and publish": ${siteUrl()}/admin/sites/${site.id}`
        )
      );
    return json({ ok: true, mode: "manual", amount, upi, whatsapp: publicWhatsApp(), url: liveUrl(slug) });
  }

  try {
    const order = await createRazorpayOrder(amount, `site_${site.id}`, { site: site.id, slug, couple: names });
    addOrder({ id: order.id, site_id: site.id, amount });
    return json({
      ok: true,
      mode: "razorpay",
      key: razorpayKeyId(),
      orderId: order.id,
      amount: order.amount,
      currency: "INR",
      name: STUDIO,
      description: `Wedding invitation · ${names}${extras.length ? ` + ${extras.length} add-on${extras.length > 1 ? "s" : ""}` : ""}`,
      prefill: { name, email, contact: `+${phone}` },
      url: liveUrl(slug),
    });
  } catch (e) {
    console.error("[razorpay] order failed", e);
    return json({ ok: false, error: "We couldn't start the payment just now. Please try again in a minute, or message us on WhatsApp." }, 502);
  }
}
