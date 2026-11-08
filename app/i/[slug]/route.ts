import { findSample } from "@/lib/samples";

/* theweddinginviteco…/i/<slug> → the live sample invitation */
export async function GET(_req: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const s = findSample(slug);
  if (!s) return Response.redirect(new URL("/#samples", process.env.SITE_URL || "http://localhost:3000"), 302);
  return new Response(null, { status: 302, headers: { Location: s.live, "Cache-Control": "public, max-age=300" } });
}
