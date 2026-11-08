"use client";

import * as React from "react";
import { MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { track } from "@/lib/track";

/* A/B test for the main form button. Each visitor keeps one wording; it is saved with their enquiry ("cta-a" / "cta-b"). */
export const CTA_TEXT = { a: "Check my date", b: "See my free preview" } as const;
export type CtaVariant = keyof typeof CTA_TEXT;

export function getCtaVariant(): CtaVariant {
  if (typeof window === "undefined") return "a";
  try {
    const v = localStorage.getItem("twic_cta");
    if (v === "a" || v === "b") return v;
    const pick: CtaVariant = Math.random() < 0.5 ? "a" : "b";
    localStorage.setItem("twic_cta", pick);
    return pick;
  } catch {
    return "a";
  }
}

export function CtaText() {
  const [v, setV] = React.useState<CtaVariant>("a");
  React.useEffect(() => setV(getCtaVariant()), []);
  return <>{CTA_TEXT[v]}</>;
}

/* The main call to action: open WhatsApp with a ready message. */
export function WhatsAppButton({
  href,
  origin,
  children = "Chat on WhatsApp",
  ...props
}: React.ComponentProps<typeof Button> & { href: string; origin: string }) {
  return (
    <Button asChild {...props}>
      <a href={href} target="_blank" rel="noopener" onClick={() => track("Contact", { method: "whatsapp", origin })}>
        <MessageCircle /> {children}
      </a>
    </Button>
  );
}
