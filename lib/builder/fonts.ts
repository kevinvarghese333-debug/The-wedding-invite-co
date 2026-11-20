/* Fonts a couple can pick in the builder. Every one is a Google Font.
   `spec` is the css2 family string; `stack` is what goes in font-family. */
export type FontRole = "script" | "heading" | "body";
export type Font = { id: string; label: string; spec: string; stack: string; roles: FontRole[] };

const serif = `Georgia, "Noto Serif Malayalam", "Noto Serif Devanagari", serif`;
const sans = `system-ui, "Noto Sans Malayalam", "Noto Sans Devanagari", sans-serif`;
const cursive = `"Noto Serif Malayalam", cursive`;

export const FONTS: Font[] = [
  // Script, for the couple's names
  { id: "great-vibes", label: "Great Vibes", spec: "Great+Vibes", stack: `"Great Vibes", ${cursive}`, roles: ["script"] },
  { id: "pinyon", label: "Pinyon Script", spec: "Pinyon+Script", stack: `"Pinyon Script", ${cursive}`, roles: ["script"] },
  { id: "parisienne", label: "Parisienne", spec: "Parisienne", stack: `"Parisienne", ${cursive}`, roles: ["script"] },
  { id: "alex-brush", label: "Alex Brush", spec: "Alex+Brush", stack: `"Alex Brush", ${cursive}`, roles: ["script"] },
  { id: "allura", label: "Allura", spec: "Allura", stack: `"Allura", ${cursive}`, roles: ["script"] },
  { id: "mrs-saint", label: "Mrs Saint Delafield", spec: "Mrs+Saint+Delafield", stack: `"Mrs Saint Delafield", ${cursive}`, roles: ["script"] },
  { id: "italianno", label: "Italianno", spec: "Italianno", stack: `"Italianno", ${cursive}`, roles: ["script"] },
  // Serif and display, for names or headings
  { id: "cormorant", label: "Cormorant Garamond", spec: "Cormorant+Garamond:ital,wght@0,400;0,500;0,600;1,400;1,500", stack: `"Cormorant Garamond", ${serif}`, roles: ["script", "heading", "body"] },
  { id: "playfair", label: "Playfair Display", spec: "Playfair+Display:ital,wght@0,400;0,500;0,600;1,400", stack: `"Playfair Display", ${serif}`, roles: ["script", "heading"] },
  { id: "cinzel", label: "Cinzel", spec: "Cinzel:wght@400;500;600", stack: `"Cinzel", ${serif}`, roles: ["script", "heading"] },
  { id: "marcellus", label: "Marcellus", spec: "Marcellus", stack: `"Marcellus", ${serif}`, roles: ["script", "heading"] },
  { id: "italiana", label: "Italiana", spec: "Italiana", stack: `"Italiana", ${serif}`, roles: ["script", "heading"] },
  { id: "bodoni", label: "Bodoni Moda", spec: "Bodoni+Moda:ital,opsz,wght@0,6..96,400;0,6..96,500;1,6..96,400", stack: `"Bodoni Moda", ${serif}`, roles: ["script", "heading"] },
  { id: "dm-serif", label: "DM Serif Display", spec: "DM+Serif+Display:ital@0;1", stack: `"DM Serif Display", ${serif}`, roles: ["script", "heading"] },
  { id: "prata", label: "Prata", spec: "Prata", stack: `"Prata", ${serif}`, roles: ["heading"] },
  { id: "eb-garamond", label: "EB Garamond", spec: "EB+Garamond:ital,wght@0,400;0,500;1,400", stack: `"EB Garamond", ${serif}`, roles: ["heading", "body"] },
  { id: "lora", label: "Lora", spec: "Lora:ital,wght@0,400;0,500;1,400", stack: `"Lora", ${serif}`, roles: ["heading", "body"] },
  // Sans, for the body text
  { id: "dm-sans", label: "DM Sans", spec: "DM+Sans:ital,opsz,wght@0,9..40,400;0,9..40,500;0,9..40,600;1,9..40,400", stack: `"DM Sans", ${sans}`, roles: ["body"] },
  { id: "jost", label: "Jost", spec: "Jost:ital,wght@0,300;0,400;0,500;1,400", stack: `"Jost", ${sans}`, roles: ["heading", "body"] },
  { id: "lato", label: "Lato", spec: "Lato:ital,wght@0,400;0,700;1,400", stack: `"Lato", ${sans}`, roles: ["body"] },
  { id: "montserrat", label: "Montserrat", spec: "Montserrat:ital,wght@0,400;0,500;1,400", stack: `"Montserrat", ${sans}`, roles: ["heading", "body"] },
  { id: "nunito-sans", label: "Nunito Sans", spec: "Nunito+Sans:ital,wght@0,400;0,600;1,400", stack: `"Nunito Sans", ${sans}`, roles: ["body"] },
  // Malayalam
  { id: "manjari", label: "Manjari (മലയാളം)", spec: "Manjari:wght@400;700", stack: `"Manjari", ${sans}`, roles: ["heading", "body"] },
  { id: "noto-serif-ml", label: "Noto Serif Malayalam (മലയാളം)", spec: "Noto+Serif+Malayalam:wght@400;500;600", stack: `"Noto Serif Malayalam", ${serif}`, roles: ["script", "heading", "body"] },
];

/* Always requested: only downloaded by the browser when Malayalam or Devanagari text appears. */
const ALWAYS = ["Noto+Serif+Malayalam:wght@400;500", "Noto+Serif+Devanagari:wght@400;500"];

export const findFont = (id: string) => FONTS.find((f) => f.id === id);
export const fontsFor = (role: FontRole) => FONTS.filter((f) => f.roles.includes(role));
export const isFont = (id: unknown, role: FontRole): id is string => typeof id === "string" && !!FONTS.find((f) => f.id === id && f.roles.includes(role));

export function fontStack(id: string, fallbackId: string) {
  return (findFont(id) ?? findFont(fallbackId) ?? FONTS[0]).stack;
}

/** One Google Fonts stylesheet URL for the given font ids. */
export function fontsHref(ids: string[]) {
  const specs = Array.from(new Set(ids.map((id) => findFont(id)?.spec).filter(Boolean) as string[]));
  for (const a of ALWAYS) if (!specs.some((s) => s.split(":")[0] === a.split(":")[0])) specs.push(a);
  return `https://fonts.googleapis.com/css2?${specs.map((s) => `family=${s}`).join("&")}&display=swap`;
}

/** Every font in the catalog, for the editor's font pickers. */
export const allFontsHref = () => fontsHref(FONTS.map((f) => f.id));
