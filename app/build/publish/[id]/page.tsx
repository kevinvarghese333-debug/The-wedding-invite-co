import { redirect } from "next/navigation";
import { BuilderHeader } from "@/components/builder/header";
import { PublishFlow } from "@/components/builder/publish-flow";
import { getSite, siteSummary, suggestSlug } from "@/lib/builder/sites";
import { canEdit, getBase, liveUrl, prices } from "@/lib/builder/server";
import { isOffered, parseAddons, totalFor } from "@/lib/builder/addons";
import { publicWhatsApp, siteUrl } from "@/lib/config";
import { razorpayReady } from "@/lib/builder/razorpay";
import { upiPayment } from "@/lib/builder/upi";

export const metadata = { title: "Publish your invitation", robots: { index: false } };

export default async function PublishPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const base = await getBase();
  const site = getSite(id);
  if (!site || !(await canEdit(site))) redirect(`${base}/edit/${id}`);
  const d = siteSummary(site);
  const slug = site.slug || suggestSlug(d, site.id);
  const pr = prices(site.template);
  const addons = parseAddons(site.addons).filter(isOffered);
  const rzp = razorpayReady();
  const upi = rzp ? null : await upiPayment(totalFor(pr, addons), site.id);
  return (
    <div className="bg-muted min-h-dvh">
      <BuilderHeader base={base} />
      <PublishFlow
        siteId={site.id}
        names={d.names}
        prices={pr}
        addons={addons}
        host={`${siteUrl().replace(/^https?:\/\//, "")}/i/`}
        initialSlug={slug}
        contact={{ name: site.contact_name || "", email: site.email || "", phone: site.phone || "" }}
        paid={!!site.paid_at}
        liveUrl={liveUrl(slug)}
        requested={!site.paid_at && !!site.publish_requested_at}
        whatsapp={publicWhatsApp()}
        previewSrc={`${base}/preview/${site.id}?thumb=1`}
        razorpay={rzp}
        upi={upi}
        claimRef={site.claim_ref || ""}
      />
    </div>
  );
}
