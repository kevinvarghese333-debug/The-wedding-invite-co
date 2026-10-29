import nodemailer from "nodemailer";
import { packageLabel, siteUrl, STUDIO } from "@/lib/config";
import type { Lead } from "@/lib/db";
import { fmtPhone } from "@/lib/format";

const esc = (s: string) => s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);
const digits = (s?: string | null) => (s || "").replace(/\D/g, "");

export function prettyDate(iso?: string | null) {
  if (!iso) return "";
  const d = new Date(iso.length === 10 ? iso + "T00:00:00" : iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short", year: "numeric", timeZone: "Asia/Kolkata" });
}

export function replyLink(lead: Pick<Lead, "name" | "phone">) {
  const first = lead.name.split(/\s+/)[0];
  const text = `Hi ${first}, thank you for your enquiry with ${STUDIO}! `;
  return `https://wa.me/${digits(lead.phone)}?text=${encodeURIComponent(text)}`;
}

function leadLines(lead: Lead): [string, string][] {
  const rows: [string, string][] = [
    ["Name", lead.name],
    ["WhatsApp", fmtPhone(lead.phone)],
  ];
  if (lead.email) rows.push(["Email", lead.email]);
  rows.push(["Package", packageLabel(lead.package)]);
  if (lead.wedding_date) rows.push(["Wedding date", prettyDate(lead.wedding_date)]);
  if (lead.functions) rows.push(["Functions", lead.functions]);
  if (lead.location) rows.push(["Where", lead.location]);
  if (lead.message) rows.push(["Message", lead.message]);
  return rows;
}

export function whatsappText(lead: Lead) {
  const lines = leadLines(lead).map(([k, v]) => `${k}: ${v}`);
  return [`New enquiry · ${STUDIO}`, "", ...lines, "", `Reply: ${replyLink(lead)}`, `Open: ${siteUrl()}/admin/leads/${lead.id}`].join("\n");
}

function emailHtml(lead: Lead) {
  const rows = leadLines(lead)
    .map(
      ([k, v]) =>
        `<tr><td style="padding:8px 12px 8px 0;color:#4E5B49;font-size:14px;vertical-align:top;white-space:nowrap">${esc(k)}</td><td style="padding:8px 0;color:#37463C;font-size:14px;white-space:pre-wrap">${esc(v)}</td></tr>`
    )
    .join("");
  const btn = (href: string, label: string, primary: boolean) =>
    `<a href="${esc(href)}" style="display:inline-block;margin:0 8px 8px 0;padding:11px 18px;border-radius:8px;text-decoration:none;font-size:14px;font-weight:600;${
      primary ? "background:#37463C;color:#F7F3ED" : "background:#FFFDF9;color:#37463C;border:1px solid #D9D8C8"
    }">${esc(label)}</a>`;
  return `<!doctype html><html><body style="margin:0;background:#F7F3ED;font-family:Arial,Helvetica,sans-serif">
  <div style="max-width:560px;margin:0 auto;padding:24px 16px">
    <p style="margin:0 0 12px;font-size:13px;color:#4E5B49">${esc(STUDIO)}</p>
    <div style="background:#FFFDF9;border:1px solid #E2DFD4;border-radius:14px;padding:24px">
      <h1 style="margin:0 0 4px;font-family:Georgia,serif;font-weight:normal;font-size:26px;color:#37463C">New enquiry from ${esc(lead.name)}</h1>
      <p style="margin:0 0 16px;font-size:14px;color:#4E5B49">${esc(packageLabel(lead.package))}${lead.wedding_date ? " · " + esc(prettyDate(lead.wedding_date)) : ""}</p>
      <table style="border-collapse:collapse;width:100%">${rows}</table>
      <div style="margin-top:20px">${btn(replyLink(lead), "Reply on WhatsApp", true)}${btn(`${siteUrl()}/admin/leads/${lead.id}`, "Open in dashboard", false)}</div>
    </div>
  </div></body></html>`;
}

async function sendEmail(lead: Lead): Promise<string> {
  const host = process.env.SMTP_HOST;
  const to = process.env.NOTIFY_EMAIL;
  if (!host || !to) return "skipped (email not set up)";
  const port = Number(process.env.SMTP_PORT || 587);
  const secure = process.env.SMTP_SECURE ? process.env.SMTP_SECURE === "true" : port === 465;
  const user = process.env.SMTP_USER;
  const transporter = nodemailer.createTransport({
    host,
    port,
    secure,
    auth: user ? { user, pass: process.env.SMTP_PASS || "" } : undefined,
    connectionTimeout: 10_000,
    greetingTimeout: 10_000,
    socketTimeout: 15_000,
  });
  await transporter.sendMail({
    from: process.env.MAIL_FROM || `${STUDIO} <${user}>`,
    to,
    replyTo: lead.email || undefined,
    subject: `New enquiry: ${lead.name} · ${packageLabel(lead.package)}`,
    text: whatsappText(lead),
    html: emailHtml(lead),
  });
  return "sent";
}

export async function sendWhatsApp(text: string): Promise<string> {
  const provider = (process.env.WHATSAPP_PROVIDER || "none").toLowerCase();
  const to = digits(process.env.NOTIFY_WHATSAPP);
  if (provider === "none") return "skipped (WhatsApp not set up)";
  if (!to && provider !== "webhook") return "skipped (NOTIFY_WHATSAPP is empty)";
  const signal = AbortSignal.timeout(12_000);

  if (provider === "callmebot") {
    const key = process.env.CALLMEBOT_API_KEY;
    if (!key) return "skipped (CALLMEBOT_API_KEY is empty)";
    const url = `https://api.callmebot.com/whatsapp.php?phone=%2B${to}&text=${encodeURIComponent(text)}&apikey=${encodeURIComponent(key)}`;
    const res = await fetch(url, { signal });
    const body = await res.text();
    if (!res.ok || /error|invalid|not allowed/i.test(body)) throw new Error(`CallMeBot ${res.status}: ${body.replace(/<[^>]+>/g, " ").trim().slice(0, 160)}`);
    return "sent";
  }

  if (provider === "waha") {
    const base = (process.env.WAHA_URL || "http://waha:3000").replace(/\/$/, "");
    const res = await fetch(`${base}/api/sendText`, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...(process.env.WAHA_API_KEY ? { "X-Api-Key": process.env.WAHA_API_KEY } : {}) },
      body: JSON.stringify({ session: process.env.WAHA_SESSION || "default", chatId: `${to}@c.us`, text }),
      signal,
    });
    if (!res.ok) throw new Error(`WAHA ${res.status}: ${(await res.text()).slice(0, 160)}`);
    return "sent";
  }

  if (provider === "webhook") {
    const url = process.env.WHATSAPP_WEBHOOK_URL;
    if (!url) return "skipped (WHATSAPP_WEBHOOK_URL is empty)";
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...(process.env.WHATSAPP_WEBHOOK_TOKEN ? { Authorization: `Bearer ${process.env.WHATSAPP_WEBHOOK_TOKEN}` } : {}) },
      body: JSON.stringify({ to, text }),
      signal,
    });
    if (!res.ok) throw new Error(`Webhook ${res.status}: ${(await res.text()).slice(0, 160)}`);
    return "sent";
  }

  return `skipped (unknown WHATSAPP_PROVIDER "${provider}")`;
}

const outcome = (r: PromiseSettledResult<string>) => (r.status === "fulfilled" ? r.value : `failed: ${r.reason instanceof Error ? r.reason.message : String(r.reason)}`);

/** Sends both notifications in parallel. Never throws. */
export async function notifyNewLead(lead: Lead) {
  const [email, whatsapp] = await Promise.allSettled([sendEmail(lead), sendWhatsApp(whatsappText(lead))]);
  const result = { email: outcome(email), whatsapp: outcome(whatsapp) };
  if (!result.email.startsWith("sent") || !result.whatsapp.startsWith("sent")) console.warn(`[notify] lead ${lead.id}`, result);
  return result;
}
