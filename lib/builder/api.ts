/* Small helpers shared by the builder's API routes. */
import { getSite, type Site } from "@/lib/builder/sites";
import { canEdit } from "@/lib/builder/server";

export const json = (body: unknown, status = 200) => Response.json(body, { status, headers: { "Cache-Control": "no-store" } });

/** Loads a site the caller may edit, or returns the error response to send. */
export async function editable(id: string): Promise<{ site: Site; error?: undefined } | { site?: undefined; error: Response }> {
  const site = getSite(id);
  if (!site) return { error: json({ ok: false, error: "We couldn't find that invitation." }, 404) };
  if (!(await canEdit(site))) return { error: json({ ok: false, error: "Open this invitation from your edit link to change it." }, 403) };
  return { site };
}

export const clean = (v: unknown, max: number) =>
  typeof v === "string" ? v.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, "").trim().slice(0, max) : "";

/** Indian numbers without a country code get 91. Returns digits, or "" when it can't be a phone number. */
export function cleanPhone(v: unknown) {
  let d = clean(v, 24).replace(/\D/g, "");
  if (d.length === 10) d = "91" + d;
  if (d.length === 11 && d.startsWith("0")) d = "91" + d.slice(1);
  return d.length >= 10 && d.length <= 15 ? d : "";
}

export const emailOk = (e: string) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(e);
