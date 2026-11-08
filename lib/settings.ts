/* Business facts edited in Admin → Settings. Anything left empty simply doesn't show on the site. */
import { getDb } from "@/lib/db";

export const SETTING_FIELDS = [
  { key: "offer_ends", label: "Introductory price ends on", type: "date", help: "While this date is in the future, The Signature Invitation shows ₹9,999 struck through and \"Introductory price until …\". Leave empty to show ₹8,490 on its own." },
  { key: "addon_domain", label: "Add-on price: your own web address", type: "text", help: "For example ₹1,499 or from ₹999. Empty shows \"Ask us\"." },
  { key: "addon_language", label: "Add-on price: Malayalam or bilingual wording", type: "text" },
  { key: "addon_chapters", label: "Add-on price: extra story chapters", type: "text" },
  { key: "addon_pages", label: "Add-on price: save-the-date and thank-you pages (Classic)", type: "text" },
  { key: "bundle_price", label: "Third package: invitation + printed QR cards, price", type: "text", help: "For example from ₹7,499. Fill this to show a third package card." },
  { key: "bundle_note", label: "Third package: what it includes", type: "textarea", help: "One item per line. For example: The Classic Invitation / 100 printed cards with your QR code / Delivered to your home." },
  { key: "stats_invites", label: "Invitations delivered", type: "text", help: "A number, for example 24. Shown with guests reached once filled." },
  { key: "stats_guests", label: "Guests reached", type: "text", help: "A number, for example 6,500." },
  { key: "turnaround", label: "Turnaround", type: "text", help: "For example: Preview in 48 hours, live in 5 days." },
  { key: "payment_terms", label: "Payment terms", type: "text", help: "For example: 50% to start, 50% before the link goes live." },
  { key: "revisions", label: "Changes and revisions", type: "text", help: "For example: Unlimited text changes until the wedding day, 2 rounds of design changes." },
  { key: "refund_policy", label: "Refund or no-obligation policy", type: "text", help: "For example: The preview is free. Pay only if you love it." },
  { key: "instagram_url", label: "Instagram link", type: "url", help: "For example https://instagram.com/theweddinginviteco" },
  { key: "founder_name", label: "Founder names", type: "text", help: "Shown as the sign-off, for example Kevin Varghese & Greeny Saju." },
  { key: "founder_story", label: "Founder note (2 or 3 lines)", type: "textarea" },
  { key: "autoreply", label: "Instant reply to new enquiries", type: "toggle", help: "Sends the couple a thank-you right after they enquire: by WhatsApp when WAHA is set up, otherwise by email if they gave one." },
] as const;

export type SettingKey = (typeof SETTING_FIELDS)[number]["key"] | "founder_photo" | "seed_keerthy";
export type Settings = Partial<Record<SettingKey, string>>;

const DEFAULTS: Settings = {
  founder_name: "Kevin Varghese & Greeny Saju",
  founder_story: "We built the first one for our sister's wedding, because a PDF couldn't hold four functions and two families. Every invitation since is planned with us, directly on WhatsApp.",
  autoreply: "on",
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
