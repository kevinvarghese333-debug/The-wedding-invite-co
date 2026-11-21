"use client";

import * as React from "react";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { ADDONS, totalFor, type AddonId, type Prices } from "@/lib/builder/addons";

const rupee = (n: number) => `₹${n.toLocaleString("en-IN")}`;

/* The add-ons as checkable cards, with the total. Hidden inputs carry the choice in a form. */
export function AddonPicker({
  prices,
  initial = [],
  onChange,
  mode,
}: {
  prices: Prices;
  initial?: AddonId[];
  onChange?: (a: AddonId[]) => void;
  mode: "design" | "publish";
}) {
  const [picked, setPicked] = React.useState<AddonId[]>(initial);
  const toggle = (id: AddonId) => {
    const next = picked.includes(id) ? picked.filter((x) => x !== id) : [...picked, id];
    setPicked(next);
    onChange?.(next);
  };
  const total = totalFor(prices, picked);
  return (
    <div className="grid gap-3">
      {mode === "design" ? <p className="font-semibold">Add-ons</p> : null}
      {ADDONS.map((a) => {
        const on = picked.includes(a.id);
        return (
          <label
            key={a.id}
            className={cn("bg-card flex cursor-pointer items-start gap-4 rounded-2xl border p-4 transition-colors", on ? "border-primary bg-primary/[0.03] ring-primary/20 ring-2" : "hover:border-ring")}
          >
            <input type="checkbox" className="sr-only" checked={on} onChange={() => toggle(a.id)} />
            <span className={cn("mt-0.5 grid size-6 flex-none place-items-center rounded-md border-2 transition-colors", on ? "border-primary bg-primary text-primary-foreground" : "border-input")} aria-hidden>
              {on ? <Check className="size-4" strokeWidth={3} /> : null}
            </span>
            <span className="min-w-0 flex-1">
              <span className="block font-semibold">{a.title}</span>
              <span className="text-muted-foreground mt-0.5 block text-sm">{a.blurb}</span>
            </span>
            <span className="font-semibold whitespace-nowrap lining-nums">{rupee(prices[a.id])}</span>
          </label>
        );
      })}
      {picked.map((id) => (
        <input key={id} type="hidden" name="addons" value={id} />
      ))}
      <div className="mt-2 grid gap-1 border-t pt-4">
        {mode === "design" ? (
          <>
            <p className="flex items-baseline justify-between gap-4">
              <span className="text-muted-foreground">Due today</span>
              <span className="heading text-4xl font-semibold">Free</span>
            </p>
            <p className="text-muted-foreground flex items-baseline justify-between gap-4 text-sm">
              <span>When you publish</span>
              <span className="text-foreground font-semibold lining-nums">{rupee(total)}</span>
            </p>
          </>
        ) : (
          <p className="flex items-baseline justify-between gap-4">
            <span className="text-muted-foreground">Total</span>
            <span className="heading text-4xl font-semibold lining-nums">{rupee(total)}</span>
          </p>
        )}
      </div>
    </div>
  );
}

/* "Different links for different guests": pick a sample link to see which functions its guests get. */
const FUNCTIONS = ["Haldi", "Mehendi", "Sangeet", "Wedding", "Reception"];
const SAMPLE_LINKS = [
  { name: "Family", who: "Parents, cousins, the people who have known you forever", shows: FUNCTIONS },
  { name: "Friends", who: "College and school friends", shows: ["Sangeet", "Wedding", "Reception"] },
  { name: "Office & neighbours", who: "Colleagues, neighbours, the wider circle", shows: ["Reception"] },
];

export function LinksDemo() {
  const [i, setI] = React.useState(0);
  const l = SAMPLE_LINKS[i];
  const hidden = FUNCTIONS.filter((f) => !l.shows.includes(f));
  const list = (xs: string[]) => (xs.length < 2 ? xs.join("") : `${xs.slice(0, -1).join(", ")} and ${xs[xs.length - 1]}`);
  return (
    <div>
      <div role="tablist" aria-label="Sample guest links" className="flex flex-wrap gap-2">
        {SAMPLE_LINKS.map((x, j) => (
          <button
            key={x.name}
            role="tab"
            type="button"
            aria-selected={i === j}
            onClick={() => setI(j)}
            className={cn("rounded-full border px-4 py-2 text-[15px] font-medium transition-colors", i === j ? "border-foreground bg-foreground text-background" : "bg-card hover:border-ring")}
          >
            {x.name} link
          </button>
        ))}
      </div>
      <div role="tabpanel" className="bg-card mt-4 rounded-2xl border p-6">
        <p className="text-muted-foreground text-sm">{l.who}</p>
        <p className="mt-2 text-[17px]">
          {hidden.length ? (
            <>
              Sees <strong className="font-semibold">{l.shows.length === 1 ? `only the ${l.shows[0]}` : `${l.shows.length} of ${FUNCTIONS.length} functions`}</strong>. {list(hidden)} {hidden.length === 1 ? "stays" : "stay"} hidden.
            </>
          ) : (
            <>
              Sees <strong className="font-semibold">all {FUNCTIONS.length} functions</strong>.
            </>
          )}
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          {FUNCTIONS.map((f) => {
            const on = l.shows.includes(f);
            return (
              <span key={f} className={cn("inline-flex items-center gap-1.5 rounded-full px-4 py-1.5 text-[15px] font-medium", on ? "bg-secondary text-primary" : "text-muted-foreground line-through decoration-1")}>
                {on ? <Check className="size-4" aria-hidden /> : null}
                {f}
              </span>
            );
          })}
        </div>
        <p className="text-muted-foreground mt-5 border-t pt-4 text-sm">
          One invitation, three links. Each guest only sees the functions they&apos;re invited to, and every reply lands in the same list.
        </p>
      </div>
    </div>
  );
}
