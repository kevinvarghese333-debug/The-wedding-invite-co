import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { BuilderHeader } from "@/components/builder/header";
import { getSite, listRsvps, siteData } from "@/lib/builder/sites";
import { canEdit, getBase, liveUrl } from "@/lib/builder/server";
import { coupleNames } from "@/lib/builder/render";
import { fmtDateTime, fmtPhone } from "@/lib/format";

export const metadata = { title: "Guest replies", robots: { index: false } };

export default async function RsvpsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const base = await getBase();
  const site = getSite(id);
  if (!site || !(await canEdit(site))) redirect(`${base}/edit/${id}`);
  const d = siteData(site);
  const rows = listRsvps(site.id);
  const yes = rows.filter((r) => r.attending === "yes");
  const guests = yes.reduce((n, r) => n + r.guests, 0);
  const perEvent = d.events
    .filter((e) => e.name)
    .map((e) => ({ name: e.name, n: yes.filter((r) => (r.events || "").split(", ").includes(e.name)).reduce((s, r) => s + r.guests, 0) }));
  return (
    <div className="bg-muted min-h-dvh">
      <BuilderHeader base={base} active="mine" />
      <main className="mx-auto grid max-w-5xl gap-6 px-4 py-8 sm:px-6">
        <Link href={`${base}/edit/${site.id}`} className="text-muted-foreground inline-flex items-center gap-1.5 text-sm font-medium hover:underline">
          <ArrowLeft className="size-4" /> Back to editing
        </Link>
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="heading text-5xl">Guest replies</h1>
            <p className="text-muted-foreground mt-1">
              {coupleNames(d)}
              {site.slug ? (
                <>
                  {" · "}
                  <a href={liveUrl(site.slug)} target="_blank" rel="noopener" className="underline underline-offset-4">
                    {liveUrl(site.slug).replace(/^https?:\/\//, "")}
                  </a>
                </>
              ) : null}
            </p>
          </div>
          <Button variant="outline" asChild>
            <a href={`/api/build/sites/${site.id}/rsvps`}>
              <Download /> Download spreadsheet
            </a>
          </Button>
        </div>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          {[
            ["Guests coming", guests],
            ["Replies", rows.length],
            ["Accepted", yes.length],
            ["Declined", rows.length - yes.length],
          ].map(([l, v]) => (
            <Card key={l} className="gap-1 p-5">
              <p className="text-muted-foreground text-sm">{l}</p>
              <p className="heading text-4xl lining-nums tabular-nums">{v}</p>
            </Card>
          ))}
        </div>
        {perEvent.length > 1 ? (
          <Card className="gap-3 p-5">
            <p className="font-semibold">Guests per celebration</p>
            <ul className="grid gap-2 sm:grid-cols-2">
              {perEvent.map((e) => (
                <li key={e.name} className="flex justify-between border-b py-1.5 text-sm">
                  <span>{e.name}</span>
                  <span className="font-semibold tabular-nums">{e.n}</span>
                </li>
              ))}
            </ul>
          </Card>
        ) : null}
        <Card className="gap-0 py-0">
          {rows.length ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Coming</TableHead>
                  <TableHead>Guests</TableHead>
                  <TableHead>Celebrations</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Note</TableHead>
                  <TableHead>When</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((r) => (
                  <TableRow key={r.id}>
                    <TableCell className="font-medium">{r.name}</TableCell>
                    <TableCell>{r.attending === "yes" ? "Yes" : "No"}</TableCell>
                    <TableCell className="tabular-nums">{r.attending === "yes" ? r.guests : "–"}</TableCell>
                    <TableCell className="max-w-[200px] whitespace-normal">{r.events || ""}</TableCell>
                    <TableCell>{r.phone ? (/^\d{10,15}$/.test(r.phone) ? fmtPhone(r.phone) : r.phone) : ""}</TableCell>
                    <TableCell className="max-w-[260px] whitespace-normal">{r.message || ""}</TableCell>
                    <TableCell className="text-muted-foreground whitespace-nowrap">{fmtDateTime(r.created_at)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <p className="text-muted-foreground p-10 text-center">No replies yet. Share your link on WhatsApp and they&apos;ll appear here.</p>
          )}
        </Card>
      </main>
    </div>
  );
}
