/* What happens around saving contact details and taking payment: the lead in the dashboard,
   the studio alert, and the emails to the couple. Server only. */
import { addEvent, createLead, getLead, updateLead } from "@/lib/db";
import { notifyNewLead, notifyStudio, sendMailTo, simpleEmail } from "@/lib/notify";
import { builderUrl, siteUrl } from "@/lib/config";
import { coupleNames, dayMonth } from "@/lib/builder/render";
import { getSite, markPaid, setLead, siteData, type Site } from "@/lib/builder/sites";
import { editLink, liveUrl } from "@/lib/builder/server";
import { templateOrDefault } from "@/lib/builder/templates";
import { rupees } from "@/lib/format";

const adminLink = (s: Site) => `${siteUrl()}/admin/sites/${s.id}`;

/** First time a couple leaves their details: a lead in the dashboard (with the usual alerts), and their edit link by email. */
export async function onContactSaved(s: Site) {
  const d = siteData(s);
  const t = templateOrDefault(s.template);
  if (!s.lead_id && s.phone) {
    const lead = createLead({
      name: s.contact_name || coupleNames(d),
      phone: s.phone,
      email: s.email,
      wedding_date: d.date || null,
      location: d.city || null,
      package: "diy",
      functions: d.events.length ? String(d.events.length) : null,
      message: `Designing "${t.name}" in the builder: ${coupleNames(d)}. Open it: ${adminLink(s)}`,
      source: "builder",
    });
    setLead(s.id, lead.id);
    await notifyNewLead(lead);
  }
  if (s.email) {
    const link = editLink(s);
    await sendMailTo(
      s.email,
      `Your invitation for ${coupleNames(d)} is saved`,
      `Your invitation is saved. Open it on any phone or computer to keep editing:\n${link}\n\nKeep this link to yourself: anyone with it can edit your invitation.\n\n${builderUrl()}`,
      simpleEmail(
        "Your invitation is saved",
        [`Open it on any phone or computer to keep editing ${coupleNames(d)}'s invitation.`, "Keep this link to yourself: anyone with it can edit your invitation."],
        { href: link, label: "Open my invitation" }
      )
    );
  }
}

/** Marks paid, publishes, updates the lead, and tells everyone. Returns the site, or undefined. */
export async function completePayment(siteId: string, p: { amount: number; ref: string; method: "razorpay" | "manual" | "free" }) {
  const before = getSite(siteId);
  if (!before) return undefined;
  const s = markPaid(siteId, p);
  if (!s || before.paid_at) return s;
  const d = siteData(s);
  const url = s.slug ? liveUrl(s.slug) : "";
  if (s.lead_id && getLead(s.lead_id)) {
    updateLead(s.lead_id, { status: "booked", amount: p.amount });
    addEvent(s.lead_id, "builder", `Paid ${rupees(p.amount)} (${p.method}${p.ref ? ` ${p.ref}` : ""}) and published ${url}`);
  }
  await Promise.all([
    notifyStudio(
      `Builder sale: ${coupleNames(d)} · ${rupees(p.amount)}`,
      [`${coupleNames(d)}${d.date ? ` · ${dayMonth(d.date)}` : ""}`, `Paid ${rupees(p.amount)} by ${p.method}${p.ref ? ` (${p.ref})` : ""}`, `Live: ${url}`, `Admin: ${adminLink(s)}`, s.phone ? `WhatsApp: https://wa.me/${s.phone}` : ""]
        .filter(Boolean)
        .join("\n")
    ),
    s.email
      ? sendMailTo(
          s.email,
          `Your invitation is live: ${url}`,
          `Thank you! ${coupleNames(d)}'s invitation is live.\n\nShare this link with your guests:\n${url}\n\nKeep editing (changes go live when you press "Update live invitation"):\n${editLink(s)}\n\nPaid ${rupees(p.amount)}${p.ref ? ` · Ref ${p.ref}` : ""}`,
          simpleEmail(
            "Your invitation is live",
            [`Thank you! ${coupleNames(d)}'s invitation is ready to share with your guests:`, url, `You can keep editing any time. Changes go live when you press "Update live invitation".`, `Paid ${rupees(p.amount)}${p.ref ? ` · Ref ${p.ref}` : ""}`],
            { href: url, label: "Open the invitation" }
          )
        )
      : Promise.resolve("skipped"),
  ]);
  return s;
}
