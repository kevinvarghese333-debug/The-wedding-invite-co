import Link from "next/link";
import { ExternalLink, IndianRupee, LayoutTemplate, Search, Send, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { listSites, siteSummary, siteStats } from "@/lib/builder/sites";
import { findDesign } from "@/lib/builder/designs";
import { SiteBadge } from "@/components/admin/site-badge";
import { templateOrDefault } from "@/lib/builder/templates";
import { builderUrl } from "@/lib/config";
import { ago, fmtDate, fmtPhone, rupees } from "@/lib/format";
import { cn } from "@/lib/utils";

type SP = Promise<{ f?: string; q?: string; deleted?: string }>;

export default async function SitesPage({ searchParams }: { searchParams: SP }) {
  const sp = await searchParams;
  const f = sp.f || "";
  const q = (sp.q || "").trim();
  const sites = listSites({ filter: f, q });
  const stats = siteStats();
  const filters = [
    ["", "All"],
    ["requested", `Wants to publish${stats.requested ? ` (${stats.requested})` : ""}`],
    ["live", "Live"],
    ["contact", "Drafts with contact"],
    ["draft", "All drafts"],
  ];
  const href = (id: string) => {
    const p = new URLSearchParams();
    if (id) p.set("f", id);
    if (q) p.set("q", q);
    return p.toString() ? `/admin/sites?${p}` : "/admin/sites";
  };
  return (
    <div className="grid gap-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="heading text-4xl">Builder</h1>
          <p className="text-muted-foreground mt-1 text-sm">Invitations couples design themselves. Drafts are free; they pay to publish.</p>
        </div>
        <Button variant="outline" asChild>
          <a href={builderUrl()} target="_blank" rel="noopener">
            <ExternalLink /> Open the builder
          </a>
        </Button>
      </div>
      {sp.deleted ? <Card className="px-5 py-4 text-sm">Invitation deleted.</Card> : null}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {[
          [<LayoutTemplate key="a" />, "Designs started", stats.total, `${stats.thisWeek} this week`],
          [<Send key="b" />, "Waiting to publish", stats.requested, "Take payment, then publish"],
          [<Sparkles key="c" />, "Live", stats.live, ""],
          [<IndianRupee key="d" />, "Builder revenue", rupees(stats.revenue), ""],
        ].map(([icon, label, value, hint]) => (
          <Card key={String(label)} className="gap-0 p-4 sm:p-5">
            <div className="text-muted-foreground flex items-center justify-between gap-2 text-[13px]">
              <span>{label}</span>
              <span aria-hidden className="[&_svg]:size-4">
                {icon}
              </span>
            </div>
            <p className="heading mt-2 text-4xl leading-none font-semibold lining-nums">{value}</p>
            {hint ? <p className="text-muted-foreground mt-1.5 text-xs">{hint}</p> : null}
          </Card>
        ))}
      </div>
      <Card className="gap-0 py-0">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b p-3">
          <nav aria-label="Filter" className="bg-muted flex max-w-full gap-0.5 overflow-x-auto rounded-lg border p-[3px]">
            {filters.map(([id, label]) => (
              <Link
                key={id || "all"}
                href={href(id)}
                aria-current={f === id ? "page" : undefined}
                className={cn("inline-flex h-9 items-center rounded-md px-3 text-sm font-medium whitespace-nowrap", f === id ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground")}
              >
                {label}
              </Link>
            ))}
          </nav>
          <form className="relative w-full sm:w-64" role="search">
            {f ? <input type="hidden" name="f" value={f} /> : null}
            <Search className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2" aria-hidden />
            <Input name="q" defaultValue={q} placeholder="Search names, phone, link" aria-label="Search invitations" className="h-10 pl-9" />
          </form>
        </div>
        {sites.length === 0 ? (
          <p className="text-muted-foreground px-6 py-16 text-center text-sm">{stats.total ? "Nothing matches this filter." : "No designs yet. Share the builder link and they'll show up here."}</p>
        ) : (
          <>
            <div className="max-md:hidden">
          <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="pl-5">Couple</TableHead>
                  <TableHead>Design</TableHead>
                  <TableHead>Wedding</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="pr-5">Edited</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sites.map((s) => {
                  const d = siteSummary(s);
                  return (
                    <TableRow key={s.id} className="relative">
                      <TableCell className="pl-5 font-medium">
                        <Link href={`/admin/sites/${s.id}`} className="after:absolute after:inset-0 hover:underline">
                          {d.names}
                        </Link>
                      </TableCell>
                      <TableCell>{(findDesign(s.template) ?? templateOrDefault(s.template)).name}</TableCell>
                      <TableCell>{d.date ? fmtDate(d.date) : <span className="text-muted-foreground">Not set</span>}</TableCell>
                      <TableCell className="tabular-nums">{s.phone ? fmtPhone(s.phone) : <span className="text-muted-foreground">Not saved</span>}</TableCell>
                      <TableCell>
                        <SiteBadge s={s} />
                        {s.rsvps ? <span className="text-muted-foreground ml-2 text-xs">{s.rsvps} RSVPs</span> : null}
                      </TableCell>
                      <TableCell className="text-muted-foreground pr-5">{ago(s.updated_at)}</TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
            </div>
            <ul className="divide-y md:hidden">
              {sites.map((s) => {
                const d = siteSummary(s);
                return (
                  <li key={s.id}>
                    <Link href={`/admin/sites/${s.id}`} className="hover:bg-muted/50 flex items-start justify-between gap-3 px-4 py-3.5">
                      <div className="min-w-0">
                        <p className="truncate font-medium">{d.names}</p>
                        <p className="text-muted-foreground mt-0.5 text-[13px]">
                          {(findDesign(s.template) ?? templateOrDefault(s.template)).name}
                          {d.date ? ` · ${fmtDate(d.date)}` : ""}
                        </p>
                        <p className="text-muted-foreground mt-0.5 text-[13px]">{ago(s.updated_at)}</p>
                      </div>
                      <SiteBadge s={s} />
                    </Link>
                  </li>
                );
              })}
            </ul>
          </>
        )}
      </Card>
    </div>
  );
}
