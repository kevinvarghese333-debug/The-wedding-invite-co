"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { countRecentByIp, createSite, getSite } from "@/lib/builder/sites";
import { getBase, rememberOwner } from "@/lib/builder/server";
import { findTemplate } from "@/lib/builder/templates";
import { findDesign } from "@/lib/builder/designs";

/* "Use this design": a new draft with the template's sample wording, owned by this browser. */
export async function startDesign(fd: FormData) {
  const id = String(fd.get("template") || "");
  const t = findTemplate(id) ?? findDesign(id);
  const base = await getBase();
  if (!t) redirect(`${base}/`);
  const h = await headers();
  const ip = (h.get("x-forwarded-for") || "").split(",")[0].trim() || h.get("x-real-ip") || "local";
  if (countRecentByIp(ip, 60) >= 25) redirect(`${base}/?busy=1`);
  const siteId = createSite(t.id, ip, String(fd.get("palette") || ""));
  await rememberOwner(getSite(siteId)!);
  redirect(`${base}/edit/${siteId}`);
}
