export const STUDIO = "The Wedding Invite Co.";

/** The live address, used for canonical tags and the sitemap. Static pages read this at build time,
    so a production build falls back to the real domain rather than localhost when SITE_URL isn't set. */
export const PRODUCTION_URL = "https://theweddinginviteco.xyz";

export function siteUrl() {
  const fallback = process.env.NODE_ENV === "production" ? PRODUCTION_URL : "http://localhost:3000";
  return (process.env.SITE_URL || fallback).replace(/\/$/, "");
}

/** The number couples chat with on WhatsApp (shown on the website). Digits only, with country code. */
export function publicWhatsApp() {
  return (process.env.PUBLIC_WHATSAPP || "919747351013").replace(/\D/g, "");
}

export const PACKAGES = {
  classic: { label: "The Classic Invitation", price: "₹4,999" },
  story: { label: "The Signature Invitation", price: "₹8,490" },
  diy: { label: "Do-it-yourself (builder)", price: "" },
  unsure: { label: "Not sure yet", price: "" },
} as const;

export type PackageId = keyof typeof PACKAGES;

/** Where couples design their own invitation. On its own subdomain when BUILDER_URL is set, else SITE_URL/build. */
export function builderUrl() {
  return (process.env.BUILDER_URL || `${siteUrl()}/build`).replace(/\/$/, "");
}

export function packageLabel(id?: string | null) {
  if (!id) return "Not sure yet";
  return (PACKAGES as Record<string, { label: string }>)[id]?.label ?? id;
}
