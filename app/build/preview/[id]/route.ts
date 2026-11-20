import { getSite, siteData } from "@/lib/builder/sites";
import { canEdit, renderSite } from "@/lib/builder/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/* The couple's private full-screen preview of their draft. Only the owner (or the studio) can open it. */
export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const site = getSite(id);
  if (!site || !(await canEdit(site)))
    return new Response(
      `<!doctype html><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Private preview</title><body style="font-family:system-ui,sans-serif;background:#f8f1ea;color:#3a0d12;display:grid;place-items:center;min-height:100vh;margin:0;text-align:center;padding:24px"><div><h1 style="font-family:Georgia,serif;font-weight:normal">This preview is private</h1><p>Only the couple who made it can open it, from their own phone or edit link.</p></div></body>`,
      { status: 403, headers: { "Content-Type": "text/html; charset=utf-8" } }
    );
  const thumb = new URL(req.url).searchParams.get("thumb") === "1";
  return new Response(renderSite(site, siteData(site), thumb ? "thumb" : "preview"), {
    headers: { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "no-store", "X-Robots-Tag": "noindex, nofollow" },
  });
}
