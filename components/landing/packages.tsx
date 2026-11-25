"use client";

import * as React from "react";
import { ArrowRight, Check, ExternalLink, MessageCircle, Minus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AutoVideo } from "@/components/landing/auto-video";
import { useEnquiry } from "@/components/landing/enquiry";
import { whatsappHref } from "@/lib/whatsapp";
import { track } from "@/lib/track";
import { cn } from "@/lib/utils";

export type PackageId = "collection" | "studio" | "signature";
export type PackageInfo = {
  id: PackageId;
  name: string;
  label: string;
  price: string;
  priceNote: string;
  description: string;
  /** "Everything in The Studio, plus:" — only where it is literally true */
  lead?: string;
  includes: string[];
  extras: [string, string][];
  missing: string[];
  reassurance: string;
};
type DesignOption = { id: string; name: string };

const ORDER: PackageId[] = ["collection", "studio", "signature"];

/* The packages: a phone on the left showing what the selected package looks like, three cards on the right.
   One card is open at a time. On phones the cards come first and the phone follows. */
export function Packages({
  packages,
  designs,
  designCount,
  builder,
  whatsapp,
  signature,
}: {
  packages: PackageInfo[];
  designs: DesignOption[];
  designCount: number;
  builder: string;
  whatsapp: string;
  signature: { video: string; poster: string; live: string };
}) {
  const [sel, setSel] = React.useState<PackageId>("studio");
  const [design, setDesign] = React.useState<DesignOption>(designs[0]);
  const heads = React.useRef<Record<string, HTMLButtonElement | null>>({});
  const anchor = React.useRef<{ id: PackageId; top: number } | null>(null);
  const { open } = useEnquiry();

  // /#collection, /#studio and /#signature open that package.
  React.useEffect(() => {
    const fromHash = () => {
      const h = window.location.hash.slice(1) as PackageId;
      if (ORDER.includes(h)) setSel(h);
    };
    fromHash();
    window.addEventListener("hashchange", fromHash);
    return () => window.removeEventListener("hashchange", fromHash);
  }, []);

  // Closing the card above the chosen one would pull it upwards; keep its heading where the finger was.
  React.useLayoutEffect(() => {
    const a = anchor.current;
    anchor.current = null;
    const el = a && heads.current[a.id];
    if (!a || !el) return;
    const moved = el.getBoundingClientRect().top - a.top;
    if (Math.abs(moved) > 1) window.scrollBy({ top: moved, behavior: "instant" as ScrollBehavior });
  }, [sel]);

  const choose = (id: PackageId) => {
    if (id === sel) return;
    const el = heads.current[id];
    if (el) anchor.current = { id, top: el.getBoundingClientRect().top };
    setSel(id);
    track("ViewContent", { content_name: id, origin: "packages" });
  };

  const onKey = (e: React.KeyboardEvent, i: number) => {
    const to = e.key === "ArrowDown" ? i + 1 : e.key === "ArrowUp" ? i - 1 : e.key === "Home" ? 0 : e.key === "End" ? ORDER.length - 1 : null;
    if (to === null) return;
    e.preventDefault();
    heads.current[ORDER[(to + ORDER.length) % ORDER.length]]?.focus();
  };

  const studioChat = whatsappHref(whatsapp, `Hi! We'd like The Studio with the ${design.name} design. Our names are `);
  const briefChat = whatsappHref(whatsapp, "Hi! We'd like to talk about The Signature. A little about us: ");

  const cta: Record<PackageId, React.ReactNode> = {
    collection: (
      <>
        <Button size="lg" asChild>
          <a href={`${builder}/d/${design.id}`} onClick={() => track("InitiateCheckout", { content_name: "collection", origin: "packages" })}>
            Personalise {design.name} <ArrowRight />
          </a>
        </Button>
        <a href={`${builder}/#designs`} className="text-primary text-sm font-medium underline-offset-4 hover:underline">
          See all {designCount} designs
        </a>
      </>
    ),
    studio: (
      <>
        <Button size="lg" onClick={() => open("classic", `packages-studio · ${design.id}`, { variant: "setup", design: design.name })}>
          Set it up with our team <ArrowRight />
        </Button>
        <a href={studioChat} target="_blank" rel="noopener" onClick={() => track("Contact", { method: "whatsapp", origin: "packages-studio" })} className="text-primary inline-flex items-center gap-1.5 text-sm font-medium underline-offset-4 hover:underline">
          <MessageCircle className="size-4" aria-hidden /> Or message us on WhatsApp
        </a>
      </>
    ),
    signature: (
      <>
        <Button size="lg" onClick={() => open("story", "packages-signature", { variant: "brief" })}>
          Start your creative brief <ArrowRight />
        </Button>
        <a href={briefChat} target="_blank" rel="noopener" onClick={() => track("Contact", { method: "whatsapp", origin: "packages-signature" })} className="text-primary inline-flex items-center gap-1.5 text-sm font-medium underline-offset-4 hover:underline">
          <MessageCircle className="size-4" aria-hidden /> Or talk it through on WhatsApp
        </a>
      </>
    ),
  };

  return (
    <div className="mt-12 grid items-start gap-10 lg:grid-cols-[minmax(0,330px)_minmax(0,1fr)] lg:gap-14">
      <Preview sel={sel} design={design} designs={designs} setDesign={setDesign} signature={signature} />

      <div className="grid min-w-0 gap-4 lg:order-2" role="group" aria-label="Packages">
        {packages.map((p, i) => {
          const on = sel === p.id;
          return (
            <article
              key={p.id}
              id={p.id}
              className={cn(
                "bg-card scroll-mt-24 rounded-2xl border transition-[border-color,box-shadow] duration-200 motion-reduce:transition-none",
                on ? "border-primary/60 shadow-[0_18px_44px_rgba(74,15,22,0.10)]" : "hover:border-ring/70"
              )}
            >
              <h3 className="m-0">
                <button
                  ref={(el) => {
                    heads.current[p.id] = el;
                  }}
                  type="button"
                  id={`pkg-${p.id}-h`}
                  aria-expanded={on}
                  aria-controls={`pkg-${p.id}-body`}
                  onClick={() => choose(p.id)}
                  onKeyDown={(e) => onKey(e, i)}
                  className="focus-visible:ring-ring/60 grid w-full cursor-pointer grid-cols-[auto_minmax(0,1fr)] gap-x-3.5 gap-y-2 rounded-2xl p-5 text-left outline-none focus-visible:ring-[3px] sm:grid-cols-[auto_minmax(0,1fr)_auto] sm:gap-x-4 sm:p-6"
                >
                  <span
                    aria-hidden
                    className={cn(
                      "mt-2 grid size-5 place-items-center rounded-full border-[1.5px] transition-colors motion-reduce:transition-none",
                      on ? "border-primary bg-primary text-primary-foreground" : "border-input"
                    )}
                  >
                    {on ? <Check className="size-3" strokeWidth={3.2} /> : null}
                  </span>
                  <span className="min-w-0">
                    <span className="heading block text-[28px] leading-[1.05] font-medium sm:text-[32px]">{p.name}</span>
                    <span className="text-clay-ink mt-1 block text-[11.5px] font-semibold tracking-[0.14em] uppercase">{p.label}</span>
                  </span>
                  <span className="col-start-2 sm:col-start-3 sm:row-start-1 sm:text-right">
                    <span className="heading block text-[28px] leading-none font-semibold lining-nums sm:text-[34px]">{p.price}</span>
                    <span className="text-muted-foreground mt-1 block text-xs">{p.priceNote}</span>
                  </span>
                  <span className="text-muted-foreground col-start-2 text-[15px] leading-relaxed sm:col-[2/4] sm:max-w-[60ch]">{p.description}</span>
                </button>
              </h3>
              <div
                id={`pkg-${p.id}-body`}
                role="region"
                aria-labelledby={`pkg-${p.id}-h`}
                hidden={!on}
                className="animate-in fade-in slide-in-from-top-1 px-5 pb-6 duration-300 motion-reduce:animate-none sm:px-6 sm:pb-7"
              >
                <div className="border-t pt-5 sm:ml-9">
                  {p.lead ? <p className="mb-3 text-[15px] font-semibold">{p.lead}</p> : null}
                  <ul className="grid gap-x-6 gap-y-2.5 text-[15px] sm:grid-cols-2">
                    {p.includes.map((t) => (
                      <li key={t} className="flex gap-2.5">
                        <Check className="text-sage mt-[3px] size-4 flex-none" strokeWidth={2.4} aria-hidden />
                        {t}
                      </li>
                    ))}
                  </ul>
                  <div className="mt-5 grid gap-5 sm:grid-cols-2">
                    {p.extras.length ? (
                      <div>
                        <p className="text-muted-foreground text-[11.5px] font-semibold tracking-[0.14em] uppercase">Optional extras</p>
                        <ul className="mt-2 grid text-sm">
                          {p.extras.map(([t, price]) => (
                            <li key={t} className="flex justify-between gap-3 border-b border-dashed py-2 last:border-0">
                              <span>{t}</span>
                              <span className="font-semibold whitespace-nowrap lining-nums">{price}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ) : null}
                    {p.missing.length ? (
                      <div>
                        <p className="text-muted-foreground text-[11.5px] font-semibold tracking-[0.14em] uppercase">Not included</p>
                        <ul className="text-muted-foreground mt-2 grid gap-2 text-sm">
                          {p.missing.map((t) => (
                            <li key={t} className="flex gap-2.5">
                              <Minus className="mt-0.5 size-4 flex-none opacity-60" aria-hidden />
                              {t}
                            </li>
                          ))}
                        </ul>
                      </div>
                    ) : null}
                  </div>
                  <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-3">{cta[p.id]}</div>
                  <p className="text-muted-foreground mt-3 text-sm">{p.reassurance}</p>
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}

/* The phone. The Collection and The Studio show the design you pick (and carry it into the next step);
   The Signature shows a recording of one made around a couple's story. Frames load once the section is near. */
function Preview({
  sel,
  design,
  designs,
  setDesign,
  signature,
}: {
  sel: PackageId;
  design: DesignOption;
  designs: DesignOption[];
  setDesign: (d: DesignOption) => void;
  signature: { video: string; poster: string; live: string };
}) {
  const box = React.useRef<HTMLDivElement>(null);
  const [near, setNear] = React.useState(false);
  const [sawSignature, setSawSignature] = React.useState(false);
  React.useEffect(() => {
    if (sel === "signature") setSawSignature(true);
  }, [sel]);
  React.useEffect(() => {
    const el = box.current;
    if (!el || near) return;
    const io = new IntersectionObserver((es) => es.some((e) => e.isIntersecting) && setNear(true), { rootMargin: "600px" });
    io.observe(el);
    return () => io.disconnect();
  }, [near]);
  const sig = sel === "signature";
  const screen = "relative h-[548px] w-[257px] overflow-hidden rounded-[30px] bg-[#1E140E] sm:h-[606px] sm:w-[285px]";
  return (
    <div ref={box} className="order-2 grid justify-items-center gap-4 lg:sticky lg:top-24 lg:order-1">
      <p className="text-muted-foreground text-center text-[13px]" aria-live="polite">
        {sig ? "A Signature invitation, recorded on a phone" : `Sample invitation · ${design.name}`}
      </p>
      <div className="rounded-[38px] bg-[#2A0A0E] p-2 shadow-[0_30px_60px_rgba(74,15,22,0.22)]">
        <div className={cn(screen, sig && "hidden")}>
          {near ? (
            <iframe
              key={design.id}
              src={`/build/thumb/${design.id}?full=1`}
              title={`${design.name}: sample wedding invitation`}
              className="absolute top-0 left-0 h-[830px] w-[390px] origin-top-left scale-[0.66] border-0 sm:scale-[0.73]"
              allow="autoplay"
            />
          ) : null}
        </div>
        {sawSignature ? (
          <div className={cn(screen, !sig && "hidden")}>
            <AutoVideo src={signature.video} poster={signature.poster} aria-label="Screen recording of a Signature invitation: a waltz cover, the couple's story in watercolour chapters, then the date, functions and RSVP" className="size-full object-cover" />
          </div>
        ) : null}
      </div>
      {sig ? (
        <a href={signature.live} target="_blank" rel="noopener" className="text-primary inline-flex items-center gap-1.5 text-sm font-medium underline-offset-4 hover:underline">
          Open this invitation <ExternalLink className="size-3.5" aria-hidden />
        </a>
      ) : (
        <div className="grid justify-items-center gap-2">
          <p id="pkg-design-l" className="text-muted-foreground text-[13px]">
            {sel === "studio" ? "Pick the design you'd like us to complete" : "Try another design"}
          </p>
          <div role="group" aria-labelledby="pkg-design-l" className="flex max-w-[330px] flex-wrap justify-center gap-2">
            {designs.map((d) => (
              <button
                key={d.id}
                type="button"
                aria-pressed={d.id === design.id}
                onClick={() => setDesign(d)}
                className={cn(
                  "focus-visible:ring-ring/60 min-h-10 rounded-full border px-3.5 text-[13px] font-medium outline-none focus-visible:ring-[3px]",
                  d.id === design.id ? "border-foreground bg-foreground text-background" : "bg-card hover:border-ring"
                )}
              >
                {d.name}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
