import { editable, json } from "@/lib/builder/api";
import { saveDraft, siteData } from "@/lib/builder/sites";
import { findTemplate } from "@/lib/builder/templates";
import { normalize } from "@/lib/builder/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type P = { params: Promise<{ id: string }> };

/* Autosave from the editor. */
export async function PUT(req: Request, { params }: P) {
  const { id } = await params;
  const { site, error } = await editable(id);
  if (error) return error;
  const raw = await req.text();
  if (raw.length > 400_000) return json({ ok: false, error: "That's too much text to save." }, 413);
  let body: { template?: string; data?: unknown };
  try {
    body = JSON.parse(raw);
  } catch {
    return json({ ok: false, error: "Invalid request." }, 400);
  }
  const t = findTemplate(String(body.template || site.template));
  if (!t) return json({ ok: false, error: "Unknown design." }, 400);
  const data = normalize(body.data, siteData(site));
  saveDraft(site.id, t.id, data);
  return json({ ok: true, savedAt: new Date().toISOString() });
}
