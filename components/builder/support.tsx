"use client";

import * as React from "react";
import { Check, Clock, Copy, Mail, MessageCircle, Phone, CalendarClock } from "lucide-react";
import { Button } from "@/components/ui/button";

const pretty = (d: string) => (d.length === 12 && d.startsWith("91") ? `+91 ${d.slice(2, 7)} ${d.slice(7)}` : `+${d}`);

/* "How can we help?": call or WhatsApp with the number and hours, email with a copy button, and a free call. */
export function SupportSection({ phone, hours, email, call, id = "support" }: { phone: string; hours: string; email: string; call: string; id?: string }) {
  const [copied, setCopied] = React.useState(false);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(email);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {}
  };
  return (
    <section id={id} aria-labelledby={`${id}-h`} className="scroll-mt-16">
      <p className="text-primary text-xs font-semibold tracking-[0.2em] uppercase">Support</p>
      <h2 id={`${id}-h`} className="heading mt-2 text-[clamp(34px,4.4vw,52px)] leading-[1.04]">
        How can we <em className="text-clay-ink">help?</em>
      </h2>
      <p className="text-muted-foreground mt-2">Call or message our team, or write to us. Real people, the same day.</p>
      <div className="mt-8 grid gap-4 lg:grid-cols-[1.4fr_1fr]">
        <div className="bg-card relative overflow-hidden rounded-2xl border p-6 sm:p-8">
          <div className="from-secondary/70 pointer-events-none absolute inset-0 bg-gradient-to-br to-transparent" aria-hidden />
          <div className="relative">
            <span className="bg-secondary text-primary grid size-11 place-items-center rounded-xl">
              <MessageCircle className="size-5" aria-hidden />
            </span>
            <h3 className="mt-5 text-2xl font-semibold">Call or WhatsApp us</h3>
            <p className="text-muted-foreground mt-2 max-w-md">The quickest way to reach us about your invitation, your guests or a payment.</p>
            <p className="heading mt-8 text-[clamp(32px,5vw,46px)] leading-none font-semibold lining-nums">{pretty(phone)}</p>
            <p className="text-muted-foreground mt-3 flex items-center gap-2 text-sm">
              <Clock className="size-4" aria-hidden /> {hours}
            </p>
            <div className="mt-6 flex flex-wrap gap-2">
              <Button size="lg" asChild>
                <a href={`https://wa.me/${phone}?text=${encodeURIComponent("Hi! I have a question about my wedding invitation.")}`} target="_blank" rel="noopener">
                  <MessageCircle /> Chat on WhatsApp
                </a>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <a href={`tel:+${phone}`}>
                  <Phone /> Call now
                </a>
              </Button>
            </div>
          </div>
        </div>
        <div className="grid gap-4">
          {email ? (
            <div className="bg-card rounded-2xl border p-6">
              <span className="bg-secondary text-primary grid size-11 place-items-center rounded-xl">
                <Mail className="size-5" aria-hidden />
              </span>
              <h3 className="mt-5 text-xl font-semibold">Email us</h3>
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <a href={`mailto:${email}`} className="font-semibold break-all underline-offset-4 hover:underline">
                  {email}
                </a>
                <Button type="button" size="sm" variant="outline" onClick={copy}>
                  {copied ? <Check /> : <Copy />} {copied ? "Copied" : "Copy"}
                </Button>
              </div>
              <p className="text-muted-foreground mt-3 flex items-center gap-2 text-sm">
                <Clock className="size-4" aria-hidden /> Replies within 12 to 24 hours
              </p>
            </div>
          ) : null}
          <div className="bg-card rounded-2xl border p-6">
            <span className="bg-secondary text-primary grid size-11 place-items-center rounded-xl">
              <CalendarClock className="size-5" aria-hidden />
            </span>
            <h3 className="mt-5 text-xl font-semibold">Book a free call</h3>
            <p className="text-muted-foreground mt-2 text-sm">15 minutes with us to pick a design, plan your guest links or see what&apos;s possible.</p>
            <Button variant="outline" className="mt-4" asChild>
              <a href={call} target="_blank" rel="noopener">
                Book a free call
              </a>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
