import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Mail, MessageCircle, Phone, Send, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { NativeSelect } from "@/components/ui/native-select";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { StatusBadge } from "@/components/admin/status-badge";
import { getLead, listEvents, STATUSES } from "@/lib/db";
import { packageLabel } from "@/lib/config";
import { replyLink } from "@/lib/notify";
import { ago, daysUntil, fmtDate, fmtDateTime, fmtPhone } from "@/lib/format";
import { addNote, quickStatus, removeLead, resendNotify, saveLead } from "@/app/admin/actions";

type Props = { params: Promise<{ id: string }>; searchParams: Promise<{ saved?: string; notified?: string; confirm?: string }> };

export default async function LeadPage({ params, searchParams }: Props) {
  const { id } = await params;
  const sp = await searchParams;
  const lead = getLead(Number(id));
  if (!lead) notFound();
  const events = listEvents(lead.id);
  const until = daysUntil(lead.wedding_date);
  const notifyTone = (s: string | null) => (!s ? "outline" : s.startsWith("sent") ? "success" : s.startsWith("skipped") ? "outline" : "destructive");

  const details: [string, React.ReactNode][] = [
    ["WhatsApp", <a key="p" href={`https://wa.me/${lead.phone}`} target="_blank" rel="noopener" className="underline underline-offset-4">{fmtPhone(lead.phone)}</a>],
    ["Email", lead.email ? <a key="e" href={`mailto:${lead.email}`} className="underline underline-offset-4">{lead.email}</a> : "Not given"],
    ["Wedding date", lead.wedding_date ? `${fmtDate(lead.wedding_date)}${until !== null ? (until >= 0 ? ` · in ${until} days` : " · passed") : ""}` : "Not set"],
    ["Package", packageLabel(lead.package)],
    ["Functions", lead.functions || "Not given"],
    ["City or venue", lead.location || "Not given"],
    ["Source", lead.source || "Website"],
  ];

  return (
    <div className="grid gap-6">
      <div>
        <Button variant="ghost" size="sm" asChild className="-ml-3">
          <Link href="/admin">
            <ArrowLeft /> All leads
          </Link>
        </Button>
        <div className="mt-2 flex flex-wrap items-center gap-3">
          <h1 className="heading text-4xl">{lead.name}</h1>
          <StatusBadge status={lead.status} />
          <Badge variant="outline">{packageLabel(lead.package)}</Badge>
        </div>
        <p className="text-muted-foreground mt-1 text-sm">
          Received {fmtDateTime(lead.created_at)} ({ago(lead.created_at)})
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          <Button asChild>
            <a href={replyLink(lead)} target="_blank" rel="noopener">
              <MessageCircle /> Reply on WhatsApp
            </a>
          </Button>
          <Button variant="outline" asChild>
            <a href={`tel:+${lead.phone}`}>
              <Phone /> Call
            </a>
          </Button>
          {lead.email ? (
            <Button variant="outline" asChild>
              <a href={`mailto:${lead.email}?subject=${encodeURIComponent("Your wedding invitation")}`}>
                <Mail /> Email
              </a>
            </Button>
          ) : null}
          {lead.status === "new" ? (
            <form action={quickStatus}>
              <input type="hidden" name="id" value={lead.id} />
              <input type="hidden" name="status" value="contacted" />
              <Button variant="secondary" type="submit">Mark as contacted</Button>
            </form>
          ) : null}
        </div>
      </div>

      {sp.saved ? <Notice>Saved.</Notice> : null}
      {sp.notified ? <Notice>Notifications sent again. Results are below.</Notice> : null}

      <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
        <div className="grid gap-6">
          <Card className="gap-4">
            <CardHeader>
              <CardTitle>Enquiry</CardTitle>
            </CardHeader>
            <CardContent>
              <dl className="grid gap-x-6 gap-y-3 text-sm sm:grid-cols-[140px_minmax(0,1fr)]">
                {details.map(([k, v]) => (
                  <div key={k} className="contents">
                    <dt className="text-muted-foreground">{k}</dt>
                    <dd className="break-words">{v}</dd>
                  </div>
                ))}
              </dl>
              {lead.message ? (
                <>
                  <Separator className="my-4" />
                  <p className="text-muted-foreground mb-1.5 text-sm">Message</p>
                  <p className="text-sm leading-relaxed whitespace-pre-wrap">{lead.message}</p>
                </>
              ) : null}
            </CardContent>
          </Card>

          <Card className="gap-4">
            <CardHeader>
              <CardTitle>Notes and activity</CardTitle>
              <CardDescription>Calls, quotes, what they liked. Newest first.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-5">
              <form action={addNote} className="grid gap-2">
                <input type="hidden" name="id" value={lead.id} />
                <Label htmlFor="note" className="sr-only">Add a note</Label>
                <Textarea id="note" name="note" rows={3} placeholder="Add a note, e.g. Sent The Story sample, will confirm by Friday" required />
                <Button type="submit" variant="secondary" className="w-fit">Add note</Button>
              </form>
              <ol className="grid gap-4 border-l pl-5">
                {events.map((e) => (
                  <li key={e.id} className="relative text-sm">
                    <span aria-hidden className={`absolute top-1.5 -left-[25px] size-[9px] rounded-full ${e.kind === "note" ? "bg-clay" : "bg-sage"}`} />
                    <p className={e.kind === "note" ? "whitespace-pre-wrap" : "text-muted-foreground"}>{e.text}</p>
                    <p className="text-muted-foreground mt-0.5 text-xs">{fmtDateTime(e.at)}</p>
                  </li>
                ))}
              </ol>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6">
          <Card className="gap-4">
            <CardHeader>
              <CardTitle>Manage</CardTitle>
            </CardHeader>
            <CardContent>
              <form action={saveLead} className="grid gap-4">
                <input type="hidden" name="id" value={lead.id} />
                <div className="grid gap-2">
                  <Label htmlFor="status">Status</Label>
                  <NativeSelect id="status" name="status" defaultValue={lead.status}>
                    {STATUSES.map((s) => (
                      <option key={s.id} value={s.id}>{s.label}</option>
                    ))}
                  </NativeSelect>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="follow_up">Follow up on</Label>
                  <Input id="follow_up" name="follow_up" type="date" defaultValue={lead.follow_up || ""} />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="amount">Amount quoted or paid (₹)</Label>
                  <Input id="amount" name="amount" inputMode="numeric" placeholder="8490" defaultValue={lead.amount ?? ""} />
                </div>
                <Button type="submit">Save</Button>
              </form>
            </CardContent>
          </Card>

          <Card className="gap-4">
            <CardHeader>
              <CardTitle>Notifications</CardTitle>
              <CardDescription>What happened when this enquiry came in.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-3 text-sm">
              <div className="flex items-start justify-between gap-3">
                <span className="text-muted-foreground">Email</span>
                <Badge variant={notifyTone(lead.email_status)} className="max-w-[200px] whitespace-normal text-right">{lead.email_status || "Pending"}</Badge>
              </div>
              <div className="flex items-start justify-between gap-3">
                <span className="text-muted-foreground">WhatsApp</span>
                <Badge variant={notifyTone(lead.whatsapp_status)} className="max-w-[200px] whitespace-normal text-right">{lead.whatsapp_status || "Pending"}</Badge>
              </div>
              <form action={resendNotify}>
                <input type="hidden" name="id" value={lead.id} />
                <Button type="submit" variant="outline" size="sm" className="mt-1">
                  <Send /> Send again
                </Button>
              </form>
            </CardContent>
          </Card>

          <Card className="gap-4">
            <CardHeader>
              <CardTitle>Delete lead</CardTitle>
              <CardDescription>Removes the enquiry and its notes for good.</CardDescription>
            </CardHeader>
            <CardContent>
              <form action={removeLead} className="grid gap-3">
                <input type="hidden" name="id" value={lead.id} />
                <label className="flex items-center gap-2 text-sm">
                  <input type="checkbox" name="confirm" value="yes" required className="accent-primary size-4" />
                  Yes, delete {lead.name}
                </label>
                {sp.confirm ? <p className="text-destructive text-[13px]">Tick the box to confirm.</p> : null}
                <Button type="submit" variant="destructive" size="sm" className="w-fit">
                  <Trash2 /> Delete
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function Notice({ children }: { children: React.ReactNode }) {
  return (
    <Card className="border-sage gap-0 px-5 py-3" role="status">
      <p className="text-sm">{children}</p>
    </Card>
  );
}
