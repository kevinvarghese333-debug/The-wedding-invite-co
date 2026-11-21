import { editable } from "@/lib/builder/api";
import { listRsvps } from "@/lib/builder/sites";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const cell = (v: unknown) => {
  const s = v == null ? "" : String(v);
  const safe = /^[=+\-@\t\r]/.test(s) ? `'${s}` : s;
  return /[",\n]/.test(safe) ? `"${safe.replace(/"/g, '""')}"` : safe;
};

/* Guest replies as a spreadsheet. */
export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { site, error } = await editable(id);
  if (error) return error;
  const rows = listRsvps(site.id);
  const csv = [
    ["Received", "Name", "Attending", "Guests", "Celebrations", "Phone", "Note", "Link"].join(","),
    ...rows.map((r) => [r.created_at, r.name, r.attending === "yes" ? "Yes" : r.attending === "no" ? "No" : "Wish", r.attending === "yes" ? r.guests : 0, r.events, r.phone, r.message, r.via || "Main link"].map(cell).join(",")),
  ].join("\n");
  return new Response("﻿" + csv, {
    headers: { "Content-Type": "text/csv; charset=utf-8", "Content-Disposition": `attachment; filename="rsvps-${site.slug || site.id}.csv"`, "Cache-Control": "no-store" },
  });
}
