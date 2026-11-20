import { NextResponse, type NextRequest } from "next/server";

/* build.<domain> serves the invitation builder, which lives at /build in this app.
   On that host, /edit/abc is answered by /build/edit/abc. API routes, Next's files and
   public files pass through untouched. Published invitations live on the main domain. */
export function middleware(req: NextRequest) {
  const host = (req.headers.get("x-forwarded-host") || req.headers.get("host") || "").split(":")[0].toLowerCase();
  if (!host.startsWith("build.")) return NextResponse.next();
  const { pathname, search } = req.nextUrl;
  if (pathname.startsWith("/build") || pathname.startsWith("/api/")) return NextResponse.next();
  if (pathname.startsWith("/i/") || pathname.startsWith("/admin")) {
    const proto = req.headers.get("x-forwarded-proto") || req.nextUrl.protocol.replace(":", "");
    const port = req.nextUrl.port && !req.headers.get("x-forwarded-host") ? `:${req.nextUrl.port}` : "";
    return NextResponse.redirect(`${proto}://${host.slice("build.".length)}${port}${pathname}${search}`, 308);
  }
  const url = req.nextUrl.clone();
  url.pathname = `/build${pathname === "/" ? "" : pathname}`;
  return NextResponse.rewrite(url);
}

export const config = {
  // Skip Next's own files and anything with a file extension (images, music, robots.txt…).
  matcher: ["/((?!_next/|.*\\.[a-zA-Z0-9]{2,5}$).*)"],
};
