import { editable, json } from "@/lib/builder/api";
import { saveMusic } from "@/lib/builder/server";
import { rateLimited } from "@/lib/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/* The couple's own song. */
export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { site, error } = await editable(id);
  if (error) return error;
  if (rateLimited(`music:${site.id}`, 10, 60 * 60 * 1000)) return json({ ok: false, error: "Please try again a little later." }, 429);
  const fd = await req.formData().catch(() => null);
  const file = fd?.get("file");
  if (!(file instanceof File) || !file.size) return json({ ok: false, error: "Please choose a song." }, 400);
  try {
    const name = await saveMusic(file);
    return json({ ok: true, track: `up:${name}`, title: file.name.replace(/\.[a-z0-9]+$/i, "").slice(0, 80) });
  } catch (e) {
    return json({ ok: false, error: (e as Error).message }, 400);
  }
}
