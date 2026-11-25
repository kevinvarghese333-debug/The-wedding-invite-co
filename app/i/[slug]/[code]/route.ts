import { siteUrl } from "@/lib/config";
import { liveResponse } from "@/lib/builder/live";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/* A guest link: /i/<slug>/<code> shows only that link's functions, and greets the guest when it has a name. */
export async function GET(_req: Request, { params }: { params: Promise<{ slug: string; code: string }> }) {
  const { slug, code } = await params;
  return liveResponse(slug, code) ?? Response.redirect(new URL("/#samples", siteUrl()), 302);
}
