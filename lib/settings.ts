/* Business facts edited in Admin → Settings. Anything left empty simply doesn't show on the site. */
import { getDb } from "@/lib/db";

export const SETTING_FIELDS = [
  { key: "addon_domain", label: "Add-on price: your own web address (The Studio and The Signature)", type: "text", help: "Subject to availability. Empty means ₹1,599." },
  { key: "addon_links", label: "Add-on price: personal links for up to 15 special guests (The Studio and The Signature)", type: "text", help: "Empty means ₹999." },
  { key: "addon_language", label: "Add-on price: Malayalam or bilingual wording", type: "text" },
  { key: "addon_pages", label: "Add-on price: save-the-date and thank-you pages (The Studio)", type: "text" },
  { key: "bundle_price", label: "Third package: invitation + printed QR cards, price", type: "text", help: "For example from ₹7,499. Fill this to show a third package card." },
  { key: "bundle_note", label: "Third package: what it includes", type: "textarea", help: "One item per line. For example: The Studio / 100 printed cards with your QR code / Delivered to your home." },
  { key: "stats_invites", label: "Invitations delivered", type: "text", help: "A number, for example 24. Shown with guests reached once filled." },
  { key: "stats_guests", label: "Guests reached", type: "text", help: "A number, for example 6,500." },
  { key: "turnaround", label: "Turnaround", type: "text", help: "For example: Preview in 48 hours, live in 5 days." },
  { key: "payment_terms", label: "Payment terms", type: "text", help: "For example: 50% to start, 50% before the link goes live." },
  { key: "revisions", label: "Changes and revisions", type: "text", help: "For example: Unlimited text changes until the wedding day, 2 rounds of design changes." },
  { key: "refund_policy", label: "Refund or no-obligation policy", type: "text", help: "For example: The preview is free. Pay only if you love it." },
  { key: "instagram_url", label: "Instagram link", type: "url", help: "For example https://instagram.com/theweddinginviteco" },
  { key: "founder_name", label: "Founder names", type: "text", help: "Shown as the sign-off, for example Kevin Varghese & Greeny Saju." },
  { key: "founder_story", label: "Founder note (2 or 3 lines)", type: "textarea" },
  { key: "builder_price", label: "Do-it-yourself builder: price for the simpler designs, in rupees", type: "text", help: "The 5 designs under \"Or keep it simple\". Numbers only, for example 1999. Empty means ₹1,999." },
  { key: "builder_price_story", label: "Do-it-yourself builder: price for our studio designs with a story line, in rupees", type: "text", help: "The designs adapted from invitations we made for couples. Empty means ₹2,999." },
  { key: "builder_price_was", label: "Do-it-yourself builder: original price, shown struck through", type: "text", help: "Only for a real earlier price. Shows it crossed out next to the price, with the discount. Empty or 0 hides it." },
  { key: "support_phone", label: "Support: phone number for calls and WhatsApp", type: "text", help: "Digits with country code. Empty uses the WhatsApp number from the server settings." },
  { key: "support_hours", label: "Support: hours", type: "text", help: "Shown under the number. Empty means: Mon to Sat, 10:00 AM to 7:00 PM IST." },
  { key: "support_email", label: "Support: email address", type: "text", help: "Empty uses the alert email from the server settings." },
  { key: "addon_b_links", label: "Builder add-on: a personal link for every guest (up to 50), in rupees", type: "text", help: "Empty means ₹999." },
  { key: "addon_b_domain", label: "Builder add-on: their own web address, in rupees", type: "text", help: "Empty means ₹1,599. You set the domain up for them; you get an alert when someone buys it." },
  { key: "addon_b_year", label: "Builder add-on: one more year live, in rupees", type: "text", help: "Every plan stays live for a year; this makes it two. Empty means ₹499." },
  { key: "addon_year", label: "Add-on price: one more year live (The Studio and The Signature)", type: "text", help: "These stay live until a week after the couple's last function. Empty means ₹399." },
  { key: "call_link", label: "Link for “Book a free call”", type: "url", help: "A Calendly or Google Calendar booking link. Empty opens WhatsApp with a message asking for a call." },
  { key: "upi_id", label: "UPI ID for builder payments", type: "text", help: "For example yourname@okbank. Couples see a QR code with the amount filled in, then tell us their transaction ID. Only used while Razorpay keys aren't set." },
  { key: "upi_name", label: "Name on the UPI account", type: "text", help: "Shown to couples next to the QR code, for example Kevin Varghese." },
  { key: "autoreply", label: "Instant reply to new enquiries", type: "toggle", help: "Sends the couple a thank-you right after they enquire: by WhatsApp when WAHA is set up, otherwise by email if they gave one." },
] as const;

export type SettingKey = (typeof SETTING_FIELDS)[number]["key"] | "addon_b_build" | "addon_chapters" | "offer_ends" | "founder_photo" | "seed_keerthy" | "seed_keerthy2" | "seed_twelve";
export type Settings = Partial<Record<SettingKey, string>>;

const DEFAULTS: Settings = {
  founder_name: "Kevin Varghese & Greeny Saju",
  founder_story: "We built the first one for our sister's wedding, because a PDF couldn't hold four functions and two families. Every invitation since is planned with us, directly on WhatsApp.",
  autoreply: "on",
  addon_year: "₹399",
  addon_domain: "₹1,599",
  addon_links: "₹999",
};

let ready = false;
function db() {
  const d = getDb();
  if (!ready) {
    d.exec("CREATE TABLE IF NOT EXISTS settings (key TEXT PRIMARY KEY, value TEXT NOT NULL)");
    ready = true;
  }
  return d;
}

export function getSettings(): Settings {
  try {
    const rows = db().prepare("SELECT key, value FROM settings").all() as { key: SettingKey; value: string }[];
    const s: Settings = { ...DEFAULTS };
    for (const r of rows) s[r.key] = r.value;
    return s;
  } catch {
    return { ...DEFAULTS };
  }
}

export function setSetting(key: SettingKey, value: string | null) {
  if (value === null) db().prepare("DELETE FROM settings WHERE key = ?").run(key);
  else db().prepare("INSERT INTO settings (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value").run(key, value);
}

/** The introductory price is only shown while its end date is in the future. */
export function offerActive(s: Settings) {
  if (!s.offer_ends || !/^\d{4}-\d{2}-\d{2}$/.test(s.offer_ends)) return false;
  return new Date(`${s.offer_ends}T23:59:59+05:30`).getTime() > Date.now();
}

export function fmtLongDate(iso: string) {
  return new Date(`${iso}T12:00:00+05:30`).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric", timeZone: "Asia/Kolkata" });
}
