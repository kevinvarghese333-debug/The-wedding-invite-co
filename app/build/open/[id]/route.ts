import { NextResponse } from "next/server";
import { getSite } from "@/lib/builder/sites";
import { editToken, isBuilderHost, tokenOk } from "@/lib/builder/server";
import { siteUrl } from "@/lib/config";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/* The link we email couples: remembers this browser as the owner, then opens the editor. */
export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const u = new URL(req.url);
  const host = req.headers.get("x-forwarded-host") || req.headers.get("host");
  const proto = req.headers.get("x-forwarded-proto") || u.protocol.replace(":", "");
  const origin = host ? `${proto}://${host}` : siteUrl();
  const base = isBuilderHost(host) ? "" : "/build";
  const site = getSite(id);
  if (!site || !tokenOk(site, u.searchParams.get("t"))) return NextResponse.redirect(`${origin}${base}/find?expired=1`, 302);
  const res = NextResponse.redirect(`${origin}${base}/edit/${site.id}`, 302);
  res.cookies.set(`wicb_${site.id}`, editToken(site), { httpOnly: true, sameSite: "lax", secure: siteUrl().startsWith("https://"), path: "/", maxAge: 365 * 24 * 60 * 60 });
  return res;
}
