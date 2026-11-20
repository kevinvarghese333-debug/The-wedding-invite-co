import Link from "next/link";
import { Logo } from "@/components/landing/art";
import { STUDIO, siteUrl } from "@/lib/config";

export function BuilderHeader({ base, active }: { base: string; active?: "designs" | "mine" }) {
  const item = (href: string, label: string, on: boolean, className = "") => (
    <Link href={href} className={`rounded-md px-2.5 py-2 text-sm font-medium whitespace-nowrap transition-colors hover:bg-accent sm:px-3 ${on ? "text-foreground" : "text-muted-foreground"} ${className}`}>
      {label}
    </Link>
  );
  return (
    <header className="bg-background/90 sticky top-0 z-30 border-b backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-3 px-4 sm:px-6">
        <Link href={`${base}/`} aria-label="Invitation builder home" className="flex min-w-0 items-center gap-2">
          <Logo name={STUDIO} />
          <span className="bg-clay-soft text-clay-ink hidden rounded-full px-2 py-0.5 text-[11px] font-semibold tracking-wide uppercase sm:inline">Builder</span>
        </Link>
        <nav aria-label="Builder" className="flex items-center gap-1">
          {item(`${base}/#designs`, "Designs", active === "designs", "max-sm:hidden")}
          {item(`${base}/mine`, "My designs", active === "mine")}
          <a href={siteUrl()} className="text-muted-foreground hover:bg-accent hidden rounded-md px-3 py-2 text-sm font-medium md:inline">
            Have us design it
          </a>
        </nav>
      </div>
    </header>
  );
}

export function BuilderFooter() {
  return (
    <footer className="text-muted-foreground border-t py-10 text-center text-sm">
      <p>
        {STUDIO} · <a href={siteUrl()} className="underline underline-offset-4">theweddinginviteco.xyz</a> · <a href={`${siteUrl()}/privacy`} className="underline underline-offset-4">Privacy</a>
      </p>
    </footer>
  );
}
