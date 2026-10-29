export const STUDIO = "The Wedding Invite Co.";

export function siteUrl() {
  return (process.env.SITE_URL || "http://localhost:3000").replace(/\/$/, "");
}

/** The number couples chat with on WhatsApp (shown on the website). Digits only, with country code. */
export function publicWhatsApp() {
  return (process.env.PUBLIC_WHATSAPP || "919747351013").replace(/\D/g, "");
}

export const PACKAGES = {
  classic: { label: "The Classic", price: "₹4,999" },
  story: { label: "The Story", price: "₹8,490" },
  unsure: { label: "Not sure yet", price: "" },
} as const;

export type PackageId = keyof typeof PACKAGES;

export function packageLabel(id?: string | null) {
  if (!id) return "Not sure yet";
  return (PACKAGES as Record<string, { label: string }>)[id]?.label ?? id;
}
