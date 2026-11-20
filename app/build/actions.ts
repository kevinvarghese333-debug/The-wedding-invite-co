"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { countRecentByIp, createSite, getSite } from "@/lib/builder/sites";
import { getBase, rememberOwner } from "@/lib/builder/server";
import { findTemplate } from "@/lib/builder/templates";

/* "Use this design": a new draft with the template's sample wording, owned by this browser. */
export async function startDesign(fd: FormData) {
  const t = findTemplate(String(fd.get("template") || ""));
  const base = await getBase();
  if (!t) redirect(`${base}/`);
  const h = await headers();
  const ip = (h.get("x-forwarded-for") || "").split(",")[0].trim() || h.get("x-real-ip") || "local";
  if (countRecentByIp(ip, 60) >= 25) redirect(`${base}/?busy=1`);
  const id = createSite(t.id, ip, String(fd.get("palette") || ""));
  await rememberOwner(getSite(id)!);
  redirect(`${base}/edit/${id}`);
}
