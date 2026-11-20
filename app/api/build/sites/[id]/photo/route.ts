import { editable, json } from "@/lib/builder/api";
import { savePhoto } from "@/lib/couples";
import { rateLimited } from "@/lib/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/* A photo for the invitation: resized to 1200px webp and served from /api/photos/<name>. */
export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { site, error } = await editable(id);
  if (error) return error;
  if (rateLimited(`photo:${site.id}`, 60, 60 * 60 * 1000)) return json({ ok: false, error: "That's a lot of photos in an hour. Please try again a little later." }, 429);
  const fd = await req.formData().catch(() => null);
  const file = fd?.get("file");
  if (!(file instanceof File) || !file.size) return json({ ok: false, error: "Please choose a photo." }, 400);
  try {
    return json({ ok: true, name: await savePhoto(file) });
  } catch (e) {
    return json({ ok: false, error: (e as Error).message }, 400);
  }
}
