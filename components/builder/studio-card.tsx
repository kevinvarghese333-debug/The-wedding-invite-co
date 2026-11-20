import { ArrowRight, Expand } from "lucide-react";
import { Button } from "@/components/ui/button";

/* A studio design in the gallery: a still of its opening, and a link to open the real thing. */
export function StudioCard({ id, name, blurb, tags, thumb, base, action }: { id: string; name: string; blurb: string; tags: string[]; thumb: string; base: string; action: (fd: FormData) => Promise<void> }) {
  return (
    <article className="bg-card flex flex-col overflow-hidden rounded-2xl border shadow-sm">
      <a href={`${base}/thumb/${id}?full=1`} target="_blank" rel="noopener" className="bg-muted group relative flex justify-center px-6 pt-7" aria-label={`Open the ${name} design full screen`}>
        <span className="relative block h-[460px] w-[236px] overflow-hidden rounded-t-[34px] border-[8px] border-b-0 border-[#2a0a0e] bg-[#2a0a0e] shadow-[0_20px_40px_rgba(74,15,22,0.18)]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={thumb} alt={`${name} wedding invitation design`} loading="lazy" className="size-full object-cover object-top transition-transform duration-700 group-hover:scale-[1.03]" />
        </span>
        <span className="bg-card/90 absolute top-3 right-3 inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium shadow-sm">
          <Expand className="size-3.5" aria-hidden /> Open it
        </span>
      </a>
      <div className="flex flex-1 flex-col gap-4 p-5">
        <div>
          <div className="flex items-start justify-between gap-3">
            <h3 className="heading text-3xl leading-tight">{name}</h3>
          </div>
          <div className="mt-2 flex flex-wrap gap-1">
            {tags.map((t) => (
              <span key={t} className="bg-secondary text-secondary-foreground rounded-full px-2 py-0.5 text-[11px] font-medium">
                {t}
              </span>
            ))}
          </div>
          <p className="text-muted-foreground mt-2 text-sm">{blurb}</p>
        </div>
        <form action={action} className="mt-auto flex gap-2">
          <input type="hidden" name="template" value={id} />
          <Button type="submit" className="flex-1">
            Use this design <ArrowRight />
          </Button>
        </form>
      </div>
    </article>
  );
}
