import Link from "next/link";
import { Button } from "@/components/ui/button";
import { BuilderHeader } from "@/components/builder/header";
import { Editor } from "@/components/builder/editor";
import { getSite, hasUnpublishedChanges, listRsvps, siteData } from "@/lib/builder/sites";
import { builderPrice, canEdit, getBase, library, liveUrl } from "@/lib/builder/server";
import { builderUrl, siteUrl } from "@/lib/config";

export const metadata = { title: "Edit your invitation", robots: { index: false } };

export default async function EditPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const base = await getBase();
  const site = getSite(id);
  if (!site || !(await canEdit(site))) {
    return (
      <div className="min-h-dvh">
        <BuilderHeader base={base} />
        <main className="mx-auto grid max-w-lg gap-4 px-4 py-20 text-center">
          <h1 className="heading text-4xl">{site ? "Open this from your link" : "We couldn't find that invitation"}</h1>
          <p className="text-muted-foreground">
            {site
              ? "This invitation can only be edited from the device it was made on, or from the link we emailed you."
              : "It may have been removed, or the link is incomplete."}
          </p>
          <div className="flex flex-wrap justify-center gap-2">
            <Button asChild>
              <Link href={`${base}/find`}>Email me my link</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href={`${base}/`}>Start a new design</Link>
            </Button>
          </div>
        </main>
      </div>
    );
  }
  return (
    <Editor
      site={{
        id: site.id,
        template: site.template,
        paid: !!site.paid_at,
        status: site.status,
        slug: site.slug,
        liveUrl: site.slug ? liveUrl(site.slug) : "",
        unpublished: hasUnpublishedChanges(site),
        contact: { name: site.contact_name || "", email: site.email || "", phone: site.phone || "" },
        rsvps: site.paid_at ? listRsvps(site.id).length : 0,
      }}
      initial={siteData(site)}
      library={library()}
      price={builderPrice()}
      siteUrl={siteUrl()}
      builderUrl={builderUrl()}
    />
  );
}
