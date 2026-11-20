import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ExternalLink, Eye, MessageCircle, Pencil, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { NativeSelect } from "@/components/ui/native-select";
import { SiteBadge } from "@/components/admin/site-badge";
import { getSite, hasUnpublishedChanges, listRsvps, siteSummary, suggestSlug } from "@/lib/builder/sites";
import { findDesign } from "@/lib/builder/designs";
import { builderPrice, editLink, liveUrl } from "@/lib/builder/server";
import { templateOrDefault } from "@/lib/builder/templates";
import { deleteSiteAction, markPaidAction, publishChangesAction, revokeAction, setSlugAction, setStatusAction } from "@/app/admin/site-actions";
import { fmtDate, fmtDateTime, fmtPhone, rupees } from "@/lib/format";
import { whatsappHref } from "@/lib/whatsapp";

type Props = { params: Promise<{ id: string }>; searchParams: Promise<{ saved?: string; error?: string }> };

export default async function SiteAdminPage({ params, searchParams }: Props) {
  const { id } = await params;
  const sp = await searchParams;
  const s = getSite(id);
  if (!s) notFound();
  const d = siteSummary(s);
  const t = findDesign(s.template) ?? templateOrDefault(s.template);
  const rsvps = listRsvps(s.id);
  const link = editLink(s);
  const slug = s.slug || suggestSlug(d, s.id);
  const rows: [string, React.ReactNode][] = [
    ["Design", t.name],
    ["Wedding", d.date ? fmtDate(d.date) : "Not set"],
    ["Contact", s.contact_name || "Not saved"],
    ["WhatsApp", s.phone ? <a key="w" className="underline underline-offset-4" href={`https://wa.me/${s.phone}`} target="_blank" rel="noopener">{fmtPhone(s.phone)}</a> : "Not saved"],
    ["Email", s.email ? <a key="e" className="underline underline-offset-4" href={`mailto:${s.email}`}>{s.email}</a> : "Not saved"],
    ["Started", fmtDateTime(s.created_at)],
    ["Last edited", fmtDateTime(s.updated_at)],
    ["Asked to publish", s.publish_requested_at ? fmtDateTime(s.publish_requested_at) : "No"],
    ["Says they paid", s.claim_ref ? `UTR ${s.claim_ref} · ${fmtDateTime(s.claimed_at)}` : "No"],
    ["Paid", s.paid_at ? `${rupees(s.amount)} · ${s.payment_method}${s.payment_ref ? ` · ${s.payment_ref}` : ""} · ${fmtDateTime(s.paid_at)}` : "Not yet"],
    ["Opens", String(s.views)],
    ["RSVPs", String(rsvps.length)],
  ];
  if (s.lead_id) rows.push(["Lead", <Link key="l" href={`/admin/leads/${s.lead_id}`} className="underline underline-offset-4">Open lead</Link>]);
  const sendLink = s.phone ? whatsappHref(s.phone, `Hi ${s.contact_name?.split(" ")[0] || ""}! Here's the link to edit your invitation: ${link}`) : "";
  return (
    <div className="grid gap-6">
      <Link href="/admin/sites" className="text-muted-foreground inline-flex items-center gap-1.5 text-sm font-medium hover:underline">
        <ArrowLeft className="size-4" /> All invitations
      </Link>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="heading text-4xl">{d.names}</h1>
            <SiteBadge s={s} />
          </div>
          {s.slug && s.paid_at ? (
            <a href={liveUrl(s.slug)} target="_blank" rel="noopener" className="text-muted-foreground mt-1 inline-flex items-center gap-1 text-sm underline underline-offset-4">
              {liveUrl(s.slug).replace(/^https?:\/\//, "")} <ExternalLink className="size-3.5" />
            </a>
          ) : null}
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" asChild>
            <a href={`/build/preview/${s.id}`} target="_blank" rel="noopener">
              <Eye /> Preview draft
            </a>
          </Button>
          <Button variant="outline" asChild>
            <a href={`/build/edit/${s.id}`} target="_blank" rel="noopener">
              <Pencil /> Edit as studio
            </a>
          </Button>
          {s.paid_at ? (
            <Button variant="outline" asChild>
              <a href={`/build/rsvps/${s.id}`} target="_blank" rel="noopener">
                <Users /> RSVPs
              </a>
            </Button>
          ) : null}
        </div>
      </div>
      {sp.saved ? <p className="rounded-lg bg-emerald-50 px-4 py-3 text-sm text-emerald-800">{sp.saved}</p> : null}
      {sp.error ? <p className="bg-destructive/10 text-destructive rounded-lg px-4 py-3 text-sm">{sp.error}</p> : null}

      <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
        <div className="grid content-start gap-6">
          {!s.paid_at ? (
            <Card className="gap-4 p-5">
              <div>
                <h2 className="text-lg font-semibold">Mark paid and publish</h2>
                <p className="text-muted-foreground text-sm">For payments taken by UPI or bank transfer, or to publish free. The couple gets an email with their link.</p>
              </div>
              {s.claim_ref ? (
                <p className="bg-clay-soft rounded-lg px-4 py-3 text-sm">
                  The couple says they paid by UPI, transaction ID <strong className="font-semibold">{s.claim_ref}</strong>. Check it in your bank app before publishing.
                </p>
              ) : null}
              <form action={markPaidAction} className="grid gap-3 sm:grid-cols-2">
                <input type="hidden" name="id" value={s.id} />
                <div className="grid gap-1.5 sm:col-span-2">
                  <Label htmlFor="m-slug">Web address</Label>
                  <Input id="m-slug" name="slug" defaultValue={slug} />
                </div>
                <div className="grid gap-1.5">
                  <Label htmlFor="m-amount">Amount received (₹)</Label>
                  <Input id="m-amount" name="amount" inputMode="numeric" defaultValue={String(builderPrice())} />
                </div>
                <div className="grid gap-1.5">
                  <Label htmlFor="m-method">How</Label>
                  <NativeSelect id="m-method" name="method" defaultValue="manual">
                    <option value="manual">UPI, bank or cash</option>
                    <option value="free">Free (no payment)</option>
                  </NativeSelect>
                </div>
                <div className="grid gap-1.5 sm:col-span-2">
                  <Label htmlFor="m-ref">Reference (optional)</Label>
                  <Input id="m-ref" name="ref" placeholder="UPI transaction id" defaultValue={s.claim_ref || ""} />
                </div>
                <Button type="submit" className="sm:col-span-2">Mark paid and publish</Button>
              </form>
            </Card>
          ) : (
            <Card className="gap-4 p-5">
              <h2 className="text-lg font-semibold">Live invitation</h2>
              <div className="flex flex-wrap gap-2">
                {hasUnpublishedChanges(s) ? (
                  <form action={publishChangesAction}>
                    <input type="hidden" name="id" value={s.id} />
                    <Button type="submit">Publish the latest edits</Button>
                  </form>
                ) : null}
                <form action={setStatusAction}>
                  <input type="hidden" name="id" value={s.id} />
                  <input type="hidden" name="status" value={s.status === "paused" ? "live" : "paused"} />
                  <Button type="submit" variant="outline">{s.status === "paused" ? "Put back online" : "Take offline"}</Button>
                </form>
              </div>
              <form action={setSlugAction} className="flex flex-wrap items-end gap-2">
                <input type="hidden" name="id" value={s.id} />
                <div className="grid flex-1 gap-1.5">
                  <Label htmlFor="s-slug">Web address</Label>
                  <Input id="s-slug" name="slug" defaultValue={s.slug || ""} />
                </div>
                <Button type="submit" variant="outline">Change</Button>
              </form>
            </Card>
          )}
          <Card className="gap-3 p-5">
            <h2 className="text-lg font-semibold">The couple&apos;s edit link</h2>
            <p className="text-muted-foreground text-sm">Anyone with this link can edit the invitation. Send it if they lost theirs.</p>
            <Input readOnly value={link} aria-label="Edit link" className="font-mono text-xs" />
            <div className="flex flex-wrap gap-2">
              {sendLink ? (
                <Button variant="outline" asChild>
                  <a href={sendLink} target="_blank" rel="noopener">
                    <MessageCircle /> Send on WhatsApp
                  </a>
                </Button>
              ) : null}
              <form action={revokeAction}>
                <input type="hidden" name="id" value={s.id} />
                <Button type="submit" variant="outline">Make a new link (old ones stop working)</Button>
              </form>
            </div>
          </Card>
          <Card className="gap-3 p-5">
            <h2 className="text-destructive text-lg font-semibold">Delete</h2>
            <form action={deleteSiteAction} className="flex flex-wrap items-end gap-2">
              <input type="hidden" name="id" value={s.id} />
              <div className="grid gap-1.5">
                <Label htmlFor="del">Type DELETE to remove this invitation and its RSVPs</Label>
                <Input id="del" name="confirm" autoComplete="off" />
              </div>
              <Button type="submit" variant="destructive">Delete</Button>
            </form>
          </Card>
        </div>
        <Card className="h-fit gap-0 p-5">
          <dl className="grid gap-0 text-sm">
            {rows.map(([k, v]) => (
              <div key={k} className="flex justify-between gap-4 border-b py-2.5 last:border-0">
                <dt className="text-muted-foreground">{k}</dt>
                <dd className="text-right">{v}</dd>
              </div>
            ))}
          </dl>
        </Card>
      </div>
    </div>
  );
}
