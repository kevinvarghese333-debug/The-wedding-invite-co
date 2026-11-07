import fs from "node:fs";
import path from "node:path";
import { PHOTO_RE, photoDir } from "@/lib/couples";

export const runtime = "nodejs";

export async function GET(_req: Request, { params }: { params: Promise<{ name: string }> }) {
  const { name } = await params;
  if (!PHOTO_RE.test(name)) return new Response("Not found", { status: 404 });
  const file = path.join(photoDir(), name);
  if (!fs.existsSync(file)) return new Response("Not found", { status: 404 });
  return new Response(fs.readFileSync(file), {
    headers: {
      "Content-Type": name.endsWith(".jpg") ? "image/jpeg" : "image/webp",
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
}
