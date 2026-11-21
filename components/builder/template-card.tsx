"use client";

import * as React from "react";
import Link from "next/link";
import { ArrowRight, Expand } from "lucide-react";
import { PriceTag } from "@/components/builder/price-tag";
import { Button } from "@/components/ui/button";
import { useBase } from "@/components/builder/base";
import { cn } from "@/lib/utils";

type Props = {
  id: string;
  name: string;
  blurb: string;
  tags: string[];
  palettes: { id: string; label: string; bg: string; accent: string; ink: string }[];
  price: number;
  was: number;
};

/* A design in the gallery: the real invitation running in a small phone, with its colour options. */
export function TemplateCard({ id, name, blurb, tags, palettes, price, was }: Props) {
  const base = useBase();
  const [palette, setPalette] = React.useState(palettes[0].id);
  const src = `${base}/thumb/${id}?p=${palette}`;
  return (
    <article className="bg-card flex flex-col overflow-hidden rounded-2xl border shadow-sm">
      <div className="bg-muted relative flex justify-center px-6 pt-7 pb-0">
        <div className="relative h-[460px] w-[236px] overflow-hidden rounded-t-[34px] border-[8px] border-b-0 border-[#2a0a0e] bg-[#2a0a0e] shadow-[0_20px_40px_rgba(74,15,22,0.18)]">
          <iframe
            key={src}
            src={src}
            title={`${name} wedding invitation design, sample`}
            loading="lazy"
            tabIndex={-1}
            className="pointer-events-none absolute top-0 left-0 h-[740px] w-[380px] origin-top-left scale-[0.5789] rounded-t-[26px] border-0 bg-white"
          />
        </div>
        <a
          href={`${base}/thumb/${id}?full=1&p=${palette}`}
          target="_blank"
          rel="noopener"
          className="bg-card/90 hover:bg-card absolute top-3 right-3 inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium shadow-sm"
        >
          <Expand className="size-3.5" aria-hidden /> Full screen
        </a>
      </div>
      <div className="flex flex-1 flex-col gap-4 p-5">
        <div>
          <div className="flex items-center justify-between gap-3">
            <h3 className="heading text-3xl">{name}</h3>
            <div className="flex flex-wrap justify-end gap-1">
              {tags.map((t) => (
                <span key={t} className="bg-secondary text-secondary-foreground rounded-full px-2 py-0.5 text-[11px] font-medium">
                  {t}
                </span>
              ))}
            </div>
          </div>
          <p className="text-muted-foreground mt-1.5 text-sm">{blurb}</p>
        </div>
        <div role="radiogroup" aria-label={`${name} colours`} className="flex flex-wrap items-center gap-2">
          {palettes.map((p) => (
            <button
              key={p.id}
              type="button"
              role="radio"
              aria-checked={palette === p.id}
              aria-label={p.label}
              title={p.label}
              onClick={() => setPalette(p.id)}
              className={cn("grid size-9 place-items-center rounded-full border-2 transition", palette === p.id ? "border-primary" : "border-transparent hover:border-border")}
            >
              <span className="block size-7 overflow-hidden rounded-full border" style={{ background: `linear-gradient(135deg, ${p.bg} 0 50%, ${p.accent} 50% 75%, ${p.ink} 75%)` }} />
            </button>
          ))}
          <span className="text-muted-foreground ml-1 text-xs">{palettes.find((p) => p.id === palette)?.label}</span>
        </div>
        <div className="mt-auto grid gap-3">
          <PriceTag base={price} was={was} size="sm" />
          <Button asChild>
            <Link href={`${base}/d/${id}?p=${palette}`}>
              Choose this design <ArrowRight />
            </Link>
          </Button>
        </div>
      </div>
    </article>
  );
}
