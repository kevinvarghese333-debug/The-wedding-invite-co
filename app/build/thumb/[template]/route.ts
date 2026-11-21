import { findTemplate } from "@/lib/builder/templates";
import { renderDocument } from "@/lib/builder/render";
import { siteUrl } from "@/lib/config";
import { findDesign } from "@/lib/builder/designs";
import { renderStudio, startingConfig, studioSummary } from "@/lib/builder/studio";
import { designHtml } from "@/lib/builder/server";

export const runtime = "nodejs";

/* A template filled with its sample wording, for the gallery cards and "see it full screen". */
export async function GET(req: Request, { params }: { params: Promise<{ template: string }> }) {
  const { template } = await params;
  const u = new URL(req.url);
  const full = u.searchParams.get("full") === "1";
  const design = findDesign(template);
  if (design) {
    const c = startingConfig(design);
    const x = studioSummary(design, c);
    const names = [x.one, x.two].filter(Boolean).join(" & ");
    const html = renderStudio(design, designHtml(design.id), c, { mode: full ? "preview" : "thumb", title: `${design.name} · sample invitation`, description: `${names}: a sample of the ${design.name} design.` }).replace(
      "Preview · Only you can see this. Guests can open it once it's published.",
      "Sample invitation · Use this design to make it yours."
    );
    return new Response(html, { headers: { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "public, max-age=600", "X-Robots-Tag": "noindex" } });
  }
  const t = findTemplate(template);
  if (!t) return new Response("Not found", { status: 404 });
  const palette = u.searchParams.get("p");
  const data = palette && t.palettes.some((p) => p.id === palette) ? { ...t.sample, style: { ...t.sample.style, palette } } : t.sample;
  const html = renderDocument(t, data, { mode: full ? "preview" : "thumb", musicSrc: "", siteUrl: siteUrl() }).replace(
    "Preview · Only you can see this. Guests can open it once it's published.",
    "Sample invitation · Use this design to make it yours."
  );
  return new Response(html, { headers: { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "public, max-age=600", "X-Robots-Tag": "noindex" } });
}
