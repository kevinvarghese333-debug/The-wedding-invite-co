import Link from "next/link";
import { ArrowRight, Expand } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PriceTag } from "@/components/builder/price-tag";

/* A studio design in the gallery: a still of its opening, the price, and the way into its page. */
export function StudioCard({ id, name, blurb, tags, thumb, base, price, was }: { id: string; name: string; blurb: string; tags: string[]; thumb: string; base: string; price: number; was: number }) {
  const href = `${base}/d/${id}`;
  return (
    <article className="bg-card group flex flex-col overflow-hidden rounded-2xl border shadow-sm">
      <Link href={href} className="bg-muted relative flex justify-center px-6 pt-7" aria-label={`${name}: see the design`}>
        <span className="relative block h-[460px] w-[236px] overflow-hidden rounded-t-[34px] border-[8px] border-b-0 border-[#2a0a0e] bg-[#2a0a0e] shadow-[0_20px_40px_rgba(74,15,22,0.18)]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={thumb} alt={`${name} wedding invitation design`} loading="lazy" className="size-full object-cover object-top transition-transform duration-700 group-hover:scale-[1.03]" />
        </span>
        <span className="bg-card/90 absolute top-3 right-3 inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium shadow-sm">
          <Expand className="size-3.5" aria-hidden /> Preview
        </span>
      </Link>
      <div className="flex flex-1 flex-col gap-4 p-5">
        <div>
          <h3 className="heading text-3xl leading-tight">{name}</h3>
          <div className="mt-2 flex flex-wrap gap-1">
            {tags.map((t) => (
              <span key={t} className="bg-secondary text-secondary-foreground rounded-full px-2 py-0.5 text-[11px] font-medium">
                {t}
              </span>
            ))}
          </div>
          <p className="text-muted-foreground mt-2 text-sm">{blurb}</p>
        </div>
        <div className="mt-auto grid gap-3">
          <PriceTag base={price} was={was} size="sm" />
          <Button asChild>
            <Link href={href}>
              Choose this design <ArrowRight />
            </Link>
          </Button>
        </div>
      </div>
    </article>
  );
}
