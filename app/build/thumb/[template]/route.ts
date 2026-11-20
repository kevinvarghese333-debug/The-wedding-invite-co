import { findTemplate } from "@/lib/builder/templates";
import { renderDocument } from "@/lib/builder/render";
import { siteUrl } from "@/lib/config";

export const runtime = "nodejs";

/* A template filled with its sample wording, for the gallery cards and "see it full screen". */
export async function GET(req: Request, { params }: { params: Promise<{ template: string }> }) {
  const { template } = await params;
  const t = findTemplate(template);
  if (!t) return new Response("Not found", { status: 404 });
  const u = new URL(req.url);
  const full = u.searchParams.get("full") === "1";
  const palette = u.searchParams.get("p");
  const data = palette && t.palettes.some((p) => p.id === palette) ? { ...t.sample, style: { ...t.sample.style, palette } } : t.sample;
  const html = renderDocument(t, data, { mode: full ? "preview" : "thumb", musicSrc: "", siteUrl: siteUrl() }).replace(
    "Preview · Only you can see this. Guests can open it once it's published.",
    "Sample invitation · Use this design to make it yours."
  );
  return new Response(html, { headers: { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "public, max-age=600", "X-Robots-Tag": "noindex" } });
}
