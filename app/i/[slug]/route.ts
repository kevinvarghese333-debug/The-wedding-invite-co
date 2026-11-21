import { siteUrl } from "@/lib/config";
import { findSample } from "@/lib/samples";
import { liveResponse } from "@/lib/builder/live";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/* theweddinginviteco…/i/<slug>
   · a sample invitation → forwards to where it is hosted
   · an invitation made in the builder and paid for → the invitation itself */
export async function GET(_req: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const s = findSample(slug);
  if (s) return new Response(null, { status: 302, headers: { Location: s.live, "Cache-Control": "public, max-age=300" } });
  return liveResponse(slug) ?? Response.redirect(new URL("/#samples", siteUrl()), 302);
}
