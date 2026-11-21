import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft, Users } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BuilderHeader } from "@/components/builder/header";
import { GuestLinksEditor } from "@/components/builder/guest-links";
import { getSite, siteSummary } from "@/lib/builder/sites";
import { canEdit, getBase, liveUrl, prices, siteEvents } from "@/lib/builder/server";
import { linkLimit, parseAddons, parseLinks } from "@/lib/builder/addons";
import { publicWhatsApp } from "@/lib/config";
import { rupees } from "@/lib/format";

export const metadata = { title: "Guest links", robots: { index: false } };

export default async function LinksPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const base = await getBase();
  const site = getSite(id);
  if (!site || !(await canEdit(site))) redirect(`${base}/edit/${id}`);
  const addons = parseAddons(site.addons);
  const personal = addons.includes("links");
  const d = siteSummary(site);
  const price = prices().links;
  const upsell = (
    <Card className="bg-clay-soft/60 gap-2 p-5">
      <p className="font-semibold">Want a personal link for every guest?</p>
      <p className="text-muted-foreground text-sm">
        Up to 50 separate links, each opening with &ldquo;Dear Sharma family&rdquo; and showing only the functions you choose for them. {rupees(price)}.
      </p>
      {site.paid_at ? (
        <Button variant="outline" size="sm" className="justify-self-start" asChild>
          <a href={`https://wa.me/${publicWhatsApp()}?text=${encodeURIComponent(`Hi! I'd like to add personal guest links to ${d.names}'s invitation. Ref: ${site.id}`)}`} target="_blank" rel="noopener">
            Add it on WhatsApp
          </a>
        </Button>
      ) : (
        <Button variant="outline" size="sm" className="justify-self-start" asChild>
          <Link href={`${base}/publish/${site.id}`}>Add it when you publish</Link>
        </Button>
      )}
    </Card>
  );
  return (
    <div className="bg-muted min-h-dvh">
      <BuilderHeader base={base} active="mine" />
      <main className="mx-auto grid max-w-3xl gap-6 px-4 py-8 sm:px-6">
        <Link href={`${base}/edit/${site.id}`} className="text-muted-foreground inline-flex items-center gap-1.5 text-sm font-medium hover:underline">
          <ArrowLeft className="size-4" /> Back to editing
        </Link>
        <div>
          <h1 className="heading text-5xl">{personal ? "A link for every guest" : "Different links for different guests"}</h1>
          <p className="text-muted-foreground mt-2">
            {personal
              ? "Each guest gets their own link that greets them by name and shows only the functions you invite them to."
              : "Family sees every function, friends see a few, the office sees the reception. Make up to 3 links, each showing the functions you choose."}
          </p>
        </div>
        <Card className="flex-row items-center gap-3 p-4">
          <Users className="text-clay-ink size-5 flex-none" aria-hidden />
          <p className="text-sm">
            <span className="font-medium">Your main link shows everything:</span>{" "}
            <span className="text-muted-foreground break-all">{site.slug ? liveUrl(site.slug).replace(/^https?:\/\//, "") : "you choose it when you publish"}</span>
          </p>
        </Card>
        <GuestLinksEditor
          siteId={site.id}
          initial={parseLinks(site.links, addons)}
          events={siteEvents(site)}
          personal={personal}
          limit={linkLimit(addons)}
          liveBase={site.slug ? liveUrl(site.slug) : ""}
          names={d.names}
          paid={!!site.paid_at}
          upsell={upsell}
        />
      </main>
    </div>
  );
}
