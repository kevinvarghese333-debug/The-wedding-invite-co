import { cn } from "@/lib/utils";

const rupee = (n: number) => `₹${n.toLocaleString("en-IN")}`;

/** ₹1,999 with the original price struck through and the saving, when there is one. */
export function PriceTag({ base, was, className, size = "md" }: { base: number; was: number; className?: string; size?: "sm" | "md" | "lg" }) {
  const off = was > base ? Math.round((1 - base / was) * 100) : 0;
  return (
    <span className={cn("inline-flex flex-wrap items-baseline gap-x-2 gap-y-1", className)}>
      <span className={cn("heading font-semibold lining-nums", size === "lg" ? "text-[52px] leading-none" : size === "md" ? "text-2xl" : "text-lg")}>{rupee(base)}</span>
      {off ? (
        <>
          <s className={cn("text-muted-foreground lining-nums", size === "lg" ? "text-lg" : "text-sm")}>
            <span className="sr-only">Usually </span>
            {rupee(was)}
          </s>
          <span className="bg-primary/10 text-primary rounded-full px-2 py-0.5 text-xs font-semibold">{off}% off</span>
        </>
      ) : null}
    </span>
  );
}
