import Link from "next/link";
import { ExternalLink, Eye, Pencil, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { BuilderFooter, BuilderHeader } from "@/components/builder/header";
import { getBase, liveUrl, mySites } from "@/lib/builder/server";
import { listRsvps, siteSummary } from "@/lib/builder/sites";
import { findDesign } from "@/lib/builder/designs";
import { templateOrDefault } from "@/lib/builder/templates";
import { dayMonth } from "@/lib/builder/render";
import { ago } from "@/lib/format";

export const metadata = { title: "My designs", robots: { index: false } };

export default async function MinePage() {
  const base = await getBase();
  const sites = await mySites();
  return (
    <div className="flex min-h-dvh flex-col">
      <BuilderHeader base={base} active="mine" />
      <main className="mx-auto w-full max-w-4xl flex-1 px-4 py-10 sm:px-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="heading text-5xl">My designs</h1>
            <p className="text-muted-foreground mt-1">Invitations made on this phone or computer.</p>
          </div>
          <Button asChild>
            <Link href={`${base}/#designs`}>Start a new design</Link>
          </Button>
        </div>
        {sites.length ? (
          <div className="mt-8 grid gap-3">
            {sites.map((s) => {
              const d = siteSummary(s);
              const t = findDesign(s.template) ?? templateOrDefault(s.template);
              const rsvps = s.paid_at ? listRsvps(s.id).length : 0;
              return (
                <Card key={s.id} className="flex-row flex-wrap items-center gap-4 p-5">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="heading text-2xl">{d.names}</h2>
                      {s.paid_at ? <Badge variant="success">{s.status === "paused" ? "Paused" : "Live"}</Badge> : <Badge variant="outline">Draft</Badge>}
                    </div>
                    <p className="text-muted-foreground text-sm">
                      {t.name}
                      {d.date ? ` · ${dayMonth(d.date)}` : ""} · edited {ago(s.updated_at)}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Button size="sm" asChild>
                      <Link href={`${base}/edit/${s.id}`}>
                        <Pencil /> Edit
                      </Link>
                    </Button>
                    {s.paid_at && s.slug ? (
                      <>
                        <Button size="sm" variant="outline" asChild>
                          <a href={liveUrl(s.slug)} target="_blank" rel="noopener">
                            <ExternalLink /> Live
                          </a>
                        </Button>
                        <Button size="sm" variant="outline" asChild>
                          <Link href={`${base}/rsvps/${s.id}`}>
                            <Users /> Replies ({rsvps})
                          </Link>
                        </Button>
                      </>
                    ) : (
                      <Button size="sm" variant="outline" asChild>
                        <a href={`${base}/preview/${s.id}`} target="_blank" rel="noopener">
                          <Eye /> Preview
                        </a>
                      </Button>
                    )}
                  </div>
                </Card>
              );
            })}
          </div>
        ) : (
          <Card className="mt-8 items-center gap-3 p-10 text-center">
            <p className="heading text-3xl">Nothing here yet</p>
            <p className="text-muted-foreground max-w-md text-sm">Designs you start on this device appear here. Made one somewhere else? We can email you the link.</p>
            <div className="mt-2 flex flex-wrap justify-center gap-2">
              <Button asChild>
                <Link href={`${base}/#designs`}>Choose a design</Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href={`${base}/find`}>Email me my link</Link>
              </Button>
            </div>
          </Card>
        )}
        {sites.length ? (
          <p className="text-muted-foreground mt-6 text-sm">
            Missing one? <Link href={`${base}/find`} className="text-foreground underline underline-offset-4">Email me my links</Link>
          </p>
        ) : null}
      </main>
      <BuilderFooter />
    </div>
  );
}
