/* Sends conversion events to Meta Pixel (and Google tag, if added later). Safe to call when neither is loaded. */
type Fn = (...args: unknown[]) => void;
export function track(event: "Lead" | "Contact" | "ViewContent" | "InitiateCheckout", params: Record<string, string> = {}) {
  if (typeof window === "undefined") return;
  const w = window as unknown as { fbq?: Fn; gtag?: Fn };
  try {
    w.fbq?.("track", event, params);
    w.gtag?.("event", event.toLowerCase(), params);
  } catch {}
}
