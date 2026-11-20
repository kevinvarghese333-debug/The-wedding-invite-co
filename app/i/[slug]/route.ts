import { findSample } from "@/lib/samples";
import { countView, getSiteBySlug } from "@/lib/builder/sites";
import { renderSite } from "@/lib/builder/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/* theweddinginviteco…/i/<slug>
   · a sample invitation → forwards to where it is hosted
   · an invitation made in the builder and paid for → the invitation itself */
export async function GET(_req: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const s = findSample(slug);
  if (s) return new Response(null, { status: 302, headers: { Location: s.live, "Cache-Control": "public, max-age=300" } });

  const site = /^[a-z0-9-]{3,40}$/.test(slug) ? getSiteBySlug(slug) : undefined;
  const html = site && site.paid_at && site.status === "live" ? renderSite(site, "live") : "";
  if (site && html) {
    countView(site.id);
    return new Response(html, {
      headers: { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "no-cache", "X-Robots-Tag": "noindex, nofollow" },
    });
  }
  if (site && site.paid_at && site.status === "paused")
    return new Response(
      `<!doctype html><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Invitation paused</title><body style="font-family:Georgia,serif;background:#f8f1ea;color:#3a0d12;display:grid;place-items:center;min-height:100vh;margin:0;text-align:center;padding:24px"><div><h1 style="font-weight:normal">This invitation is resting for now.</h1><p>Please check back with the couple.</p></div></body>`,
      { status: 410, headers: { "Content-Type": "text/html; charset=utf-8" } }
    );
  return Response.redirect(new URL("/#samples", process.env.SITE_URL || "http://localhost:3000"), 302);
}
