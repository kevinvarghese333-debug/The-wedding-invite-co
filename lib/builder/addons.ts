/* What couples can add when they publish, and the guest links every plan includes.
   Client-safe: prices come from the server (Admin → Settings) as a prop. */

export type AddonId = "domain" | "year" | "build" | "links";

export type Addon = {
  id: AddonId;
  title: string;
  blurb: string;
  /** Admin → Settings key holding the price in rupees */
  setting: "addon_b_domain" | "addon_b_year" | "addon_b_build" | "addon_b_links";
  price: number;
};

export const ADDONS: Addon[] = [
  { id: "links", title: "A personal link for every guest", blurb: "Up to 50 separate links. Each opens with “Dear Sharma family” and shows only the functions you pick for them.", setting: "addon_b_links", price: 999 },
  { id: "domain", title: "Your own web address", blurb: "A .in or .com of your own, like annaandjoel.in, set up by our team.", setting: "addon_b_domain", price: 1499 },
  { id: "year", title: "One more year live", blurb: "Keep the invitation, photos and replies online for a second year.", setting: "addon_b_year", price: 499 },
  { id: "build", title: "We build it from your WhatsApp messages", blurb: "Too busy? Send us your details and photos on WhatsApp and we put it all together for you.", setting: "addon_b_build", price: 2999 },
];

export const isAddon = (x: unknown): x is AddonId => ADDONS.some((a) => a.id === x);
export const cleanAddons = (v: unknown): AddonId[] => (Array.isArray(v) ? Array.from(new Set(v.filter(isAddon))) : []);
export const parseAddons = (raw: string | null | undefined): AddonId[] => {
  try {
    return cleanAddons(JSON.parse(raw || "[]"));
  } catch {
    return [];
  }
};

export type Prices = { base: number; was: number } & Record<AddonId, number>;
export const discount = (p: Pick<Prices, "base" | "was">) => (p.was > p.base ? Math.round((1 - p.base / p.was) * 100) : 0);
export const totalFor = (prices: Prices, addons: AddonId[]) => prices.base + addons.reduce((n, a) => n + (prices[a] || 0), 0);

/* ---------- guest links ----------
   Every plan: up to 3 links, each showing some of the functions (family sees all, friends see a few…).
   With the "links" add-on: up to 50, and each can greet the guest by name. */
export type GuestLink = { code: string; label: string; greeting: string; events: string[] };
export const GROUP_LINKS = 3;
export const PERSONAL_LINKS = 50;
export const linkLimit = (addons: AddonId[]) => (addons.includes("links") ? PERSONAL_LINKS : GROUP_LINKS);

const CODE = /^[a-z0-9]{4,12}$/;
const str = (v: unknown, n: number) => (typeof v === "string" ? v.replace(/[\u0000-\u001F\u007F<>]/g, "").trim().slice(0, n) : "");

export function cleanLinks(v: unknown, addons: AddonId[]): GuestLink[] {
  const personal = addons.includes("links");
  const out: GuestLink[] = [];
  for (const x of Array.isArray(v) ? v : []) {
    if (!x || typeof x !== "object") continue;
    const o = x as Record<string, unknown>;
    const code = typeof o.code === "string" && CODE.test(o.code) ? o.code : Math.random().toString(36).slice(2, 8);
    if (out.some((l) => l.code === code)) continue;
    out.push({
      code,
      label: str(o.label, 60) || `Link ${out.length + 1}`,
      greeting: personal ? str(o.greeting, 60) : "",
      events: Array.isArray(o.events) ? o.events.map((e) => str(e, 80)).filter(Boolean).slice(0, 20) : [],
    });
    if (out.length >= linkLimit(addons)) break;
  }
  return out;
}

export const parseLinks = (raw: string | null | undefined, addons: AddonId[]) => {
  try {
    return cleanLinks(JSON.parse(raw || "[]"), addons);
  } catch {
    return [];
  }
};
