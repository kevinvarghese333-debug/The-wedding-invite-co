import { isAdmin } from "@/lib/auth";
import { listLeads, statusLabel } from "@/lib/db";
import { packageLabel } from "@/lib/config";
import { fmtPhone } from "@/lib/format";

export const dynamic = "force-dynamic";

const cell = (v: unknown) => {
  const s = v == null ? "" : String(v);
  const safe = /^[=+\-@]/.test(s) ? `'${s}` : s; // stop spreadsheet formula injection
  return `"${safe.replace(/"/g, '""')}"`;
};

export async function GET() {
  if (!(await isAdmin())) return new Response("Not signed in", { status: 401 });
  const rows = listLeads();
  const head = ["ID", "Received", "Name", "WhatsApp", "Email", "Wedding date", "Package", "Functions", "City or venue", "Message", "Status", "Follow up", "Amount", "Source"];
  const lines = rows.map((l) =>
    [l.id, l.created_at, l.name, fmtPhone(l.phone).replace(/^\+/, ""), l.email, l.wedding_date, packageLabel(l.package), l.functions, l.location, l.message, statusLabel(l.status), l.follow_up, l.amount, l.source].map(cell).join(",")
  );
  const csv = "﻿" + [head.map(cell).join(","), ...lines].join("\r\n");
  const date = new Date().toISOString().slice(0, 10);
  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="wedding-invite-co-leads-${date}.csv"`,
    },
  });
}
