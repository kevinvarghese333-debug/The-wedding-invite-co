/* Serving a published invitation: the main link, a guest link, or a note when it's paused or has ended. */
import { countView, expired, getSiteBySlug } from "@/lib/builder/sites";
import { renderSite } from "@/lib/builder/server";
import { parseAddons, parseLinks } from "@/lib/builder/addons";
import { siteUrl } from "@/lib/config";

const note = (title: string, text: string, status: number) =>
  new Response(
    `<!doctype html><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex"><title>${title}</title><body style="font-family:Georgia,serif;background:#f8f1ea;color:#3a0d12;display:grid;place-items:center;min-height:100vh;margin:0;text-align:center;padding:24px"><div><h1 style="font-weight:normal">${title}</h1><p>${text}</p></div></body>`,
    { status, headers: { "Content-Type": "text/html; charset=utf-8" } }
  );

/** The page for /i/<slug> or /i/<slug>/<code>, or null when there's no such invitation. */
export function liveResponse(slug: string, code?: string): Response | null {
  const site = /^[a-z0-9-]{3,40}$/.test(slug) ? getSiteBySlug(slug) : undefined;
  if (!site || !site.paid_at) return null;
  if (site.status === "paused") return note("This invitation is resting for now.", "Please check back with the couple.", 410);
  if (expired(site)) return note("This celebration has passed.", "Thank you for being part of it.", 410);
  const link = code ? parseLinks(site.links, parseAddons(site.addons)).find((l) => l.code === code) : undefined;
  if (code && !link) return Response.redirect(`${siteUrl()}/i/${slug}`, 302);
  const html = renderSite(site, "live", link);
  if (!html) return null;
  countView(site.id);
  return new Response(html, { headers: { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "no-cache", "X-Robots-Tag": "noindex, nofollow" } });
}
