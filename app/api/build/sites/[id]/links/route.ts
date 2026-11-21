import { editable, json } from "@/lib/builder/api";
import { setLinks } from "@/lib/builder/sites";
import { cleanLinks, linkLimit, parseAddons } from "@/lib/builder/addons";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/* Save the guest links: up to 3 for every plan, up to 50 (with names) with the personal links add-on. */
export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { site, error } = await editable(id);
  if (error) return error;
  const b = (await req.json().catch(() => ({}))) as { links?: unknown };
  const addons = parseAddons(site.addons);
  const links = cleanLinks(b.links, addons);
  setLinks(site.id, links);
  return json({ ok: true, links, limit: linkLimit(addons) });
}
