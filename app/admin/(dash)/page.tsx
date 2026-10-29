import Link from "next/link";
import { BellRing, CalendarClock, Download, Inbox, Search, Sparkles, Trophy } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { StatusBadge } from "@/components/admin/status-badge";
import { getStats, listLeads, STATUSES } from "@/lib/db";
import { packageLabel } from "@/lib/config";
import { ago, fmtDate, fmtPhone, rupees, todayIso } from "@/lib/format";
import { cn } from "@/lib/utils";
import { sendTest } from "@/app/admin/actions";

type SP = Promise<{ status?: string; q?: string; test?: string; deleted?: string }>;

export default async function LeadsPage({ searchParams }: { searchParams: SP }) {
  const sp = await searchParams;
  const status = sp.status || "";
  const q = (sp.q || "").trim();
  const leads = listLeads({ status, q });
  const stats = getStats();
  const today = todayIso();

  const filters = [
    { id: "", label: "All" },
    { id: "open", label: "Open" },
    ...STATUSES.map((s) => ({ id: s.id as string, label: s.label })),
    { id: "followup", label: `Follow-ups due${stats.followUps ? ` (${stats.followUps})` : ""}` },
  ];
  const href = (s: string) => {
    const p = new URLSearchParams();
    if (s) p.set("status", s);
    if (q) p.set("q", q);
    const qs = p.toString();
    return qs ? `/admin?${qs}` : "/admin";
  };

  return (
    <div className="grid gap-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="heading text-4xl">Leads</h1>
          <p className="text-muted-foreground mt-1 text-sm">Every enquiry from the website lands here, and you get an email and a WhatsApp for each one.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <form action={sendTest}>
            <Button variant="outline" type="submit">
              <BellRing /> Send test notification
            </Button>
          </form>
          <Button variant="outline" asChild>
            <a href="/admin/export">
              <Download /> Export CSV
            </a>
          </Button>
        </div>
      </div>

      {sp.test ? (
        <Card className="border-sage gap-1 px-5 py-4" role="status">
          <p className="text-sm font-semibold">Test notification</p>
          <p className="text-muted-foreground text-sm break-words">{sp.test}</p>
        </Card>
      ) : null}
      {sp.deleted ? (
        <Card className="gap-1 px-5 py-4" role="status">
          <p className="text-sm">Lead deleted.</p>
        </Card>
      ) : null}

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Stat icon={<Inbox />} label="New, not yet contacted" value={String(stats.fresh)} />
        <Stat icon={<Sparkles />} label="Open leads" value={String(stats.open)} hint={`${stats.thisMonth} this month`} />
        <Stat icon={<CalendarClock />} label="Follow-ups due" value={String(stats.followUps)} />
        <Stat icon={<Trophy />} label="Booked" value={String(stats.booked)} hint={stats.bookedValue ? rupees(stats.bookedValue) : undefined} />
      </div>

      <Card className="gap-0 py-0">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b p-3">
          <nav aria-label="Filter by status" className="no-scrollbar bg-muted flex max-w-full gap-0.5 overflow-x-auto rounded-lg border p-[3px]">
            {filters.map((f) => (
              <Link
                key={f.id || "all"}
                href={href(f.id)}
                aria-current={status === f.id ? "page" : undefined}
                className={cn(
                  "inline-flex h-9 items-center rounded-md px-3 text-sm font-medium whitespace-nowrap transition-colors",
                  status === f.id ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
                )}
              >
                {f.label}
              </Link>
            ))}
          </nav>
          <form className="relative w-full sm:w-64" role="search">
            {status ? <input type="hidden" name="status" value={status} /> : null}
            <Search className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2" aria-hidden />
            <Input name="q" defaultValue={q} placeholder="Search name, phone, city" aria-label="Search leads" className="h-10 pl-9" />
          </form>
        </div>

        {leads.length === 0 ? (
          <div className="text-muted-foreground px-6 py-16 text-center text-sm">
            {stats.total === 0 ? "No enquiries yet. When someone fills the form on the website, they will show up here." : "No leads match this filter."}
          </div>
        ) : (
          <>
            <div className="max-md:hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="pl-5">Received</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>WhatsApp</TableHead>
                    <TableHead>Wedding</TableHead>
                    <TableHead>Package</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="pr-5">Follow-up</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {leads.map((l) => (
                    <TableRow key={l.id} className="relative">
                      <TableCell className="text-muted-foreground pl-5">{ago(l.created_at)}</TableCell>
                      <TableCell className="font-medium">
                        <Link href={`/admin/leads/${l.id}`} className="after:absolute after:inset-0 hover:underline">
                          {l.name}
                        </Link>
                      </TableCell>
                      <TableCell className="tabular-nums">{fmtPhone(l.phone)}</TableCell>
                      <TableCell>{fmtDate(l.wedding_date) || <span className="text-muted-foreground">Not set</span>}</TableCell>
                      <TableCell>{packageLabel(l.package)}</TableCell>
                      <TableCell>
                        <StatusBadge status={l.status} />
                      </TableCell>
                      <TableCell className="pr-5">
                        {l.follow_up ? (
                          <span className={cn(l.follow_up <= today && l.status !== "booked" && l.status !== "lost" && "text-destructive font-medium")}>{fmtDate(l.follow_up)}</span>
                        ) : (
                          <span className="text-muted-foreground">None</span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            <ul className="divide-y md:hidden">
              {leads.map((l) => (
                <li key={l.id}>
                  <Link href={`/admin/leads/${l.id}`} className="hover:bg-muted/50 flex items-start justify-between gap-3 px-4 py-3.5">
                    <div className="min-w-0">
                      <p className="truncate font-medium">{l.name}</p>
                      <p className="text-muted-foreground mt-0.5 text-[13px]">
                        {packageLabel(l.package)}
                        {l.wedding_date ? ` · ${fmtDate(l.wedding_date)}` : ""}
                      </p>
                      <p className="text-muted-foreground mt-0.5 text-[13px]">{ago(l.created_at)}</p>
                    </div>
                    <StatusBadge status={l.status} />
                  </Link>
                </li>
              ))}
            </ul>
          </>
        )}
      </Card>
      {stats.total > 0 ? (
        <p className="text-muted-foreground text-center text-xs">
          Showing {leads.length} of {stats.total} leads
          {q ? (
            <>
              {" "}matching <Badge variant="outline">{q}</Badge>
            </>
          ) : null}
        </p>
      ) : null}
    </div>
  );
}

function Stat({ icon, label, value, hint }: { icon: React.ReactNode; label: string; value: string; hint?: string }) {
  return (
    <Card className="gap-0 p-4 sm:p-5">
      <div className="text-muted-foreground flex items-center justify-between gap-2 text-[13px]">
        <span>{label}</span>
        <span aria-hidden className="[&_svg]:size-4">{icon}</span>
      </div>
      <p className="heading mt-2 text-4xl leading-none font-semibold">{value}</p>
      {hint ? <p className="text-muted-foreground mt-1.5 text-xs">{hint}</p> : null}
    </Card>
  );
}
