import type { MetadataRoute } from "next";
import { AUDIENCES } from "@/lib/audiences";
import { builderUrl, siteUrl } from "@/lib/config";
import { DESIGNS } from "@/lib/builder/designs";
import { TEMPLATES } from "@/lib/builder/templates";

export const dynamic = "force-dynamic";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = siteUrl();
  const now = new Date();
  return [
    { url: `${base}/`, lastModified: now, changeFrequency: "weekly", priority: 1 },
    ...AUDIENCES.map((a) => ({ url: `${base}/${a.slug}`, lastModified: now, changeFrequency: "monthly" as const, priority: 0.8 })),
    { url: `${builderUrl()}/`, lastModified: now, changeFrequency: "weekly", priority: 0.9 },
    ...[...DESIGNS, ...TEMPLATES].map((d) => ({ url: `${builderUrl()}/d/${d.id}`, lastModified: now, changeFrequency: "monthly" as const, priority: 0.7 })),
    { url: `${base}/privacy`, lastModified: now, changeFrequency: "yearly", priority: 0.2 },
  ];
}
