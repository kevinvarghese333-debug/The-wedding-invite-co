import { editable, json } from "@/lib/builder/api";
import { publishChanges } from "@/lib/builder/sites";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/* "Update live invitation": copy the latest edits to what guests see. */
export async function POST(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { site, error } = await editable(id);
  if (error) return error;
  if (!site.paid_at) return json({ ok: false, error: "Publish your invitation first." }, 402);
  publishChanges(site.id);
  return json({ ok: true });
}
