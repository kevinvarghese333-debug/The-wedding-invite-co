/* eslint-disable @next/next/no-img-element */
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { listCoupleWords, monthLabel, type CoupleWord } from "@/lib/couples";
import { siteUrl } from "@/lib/config";
import { fmtDate } from "@/lib/format";
import { addCoupleWord, editCoupleWord, removeCoupleWord, setCoupleStatus, showFirst } from "@/app/admin/couple-actions";

export const dynamic = "force-dynamic";

const STATUS: Record<CoupleWord["status"], { label: string; variant: "clay" | "success" | "outline" }> = {
  pending: { label: "Waiting for approval", variant: "clay" },
  published: { label: "On the website", variant: "success" },
  hidden: { label: "Hidden", variant: "outline" },
};

function Fields({ w }: { w?: CoupleWord }) {
  const k = w ? `e${w.id}` : "new";
  return (
    <>
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="grid gap-2">
          <Label htmlFor={`${k}-names`}>Couple&apos;s names</Label>
          <Input id={`${k}-names`} name="names" defaultValue={w?.names} placeholder="Anu & Joel" required />
        </div>
        <div className="grid gap-2">
          <Label htmlFor={`${k}-place`}>Place</Label>
          <Input id={`${k}-place`} name="place" defaultValue={w?.place ?? ""} placeholder="Kochi" />
        </div>
        <div className="grid gap-2">
          <Label htmlFor={`${k}-month`}>Wedding month</Label>
          <Input id={`${k}-month`} name="wedding_month" type="month" defaultValue={w?.wedding_month ?? ""} />
        </div>
      </div>
      <div className="grid gap-2">
        <Label htmlFor={`${k}-quote`}>What they said</Label>
        <Textarea id={`${k}-quote`} name="quote" rows={4} defaultValue={w?.quote} placeholder="Paste their message here" required />
      </div>
      <div className="grid gap-2">
        <Label htmlFor={`${k}-photo`}>{w?.photo ? "Replace photo" : "Photo of the couple"}</Label>
        <Input id={`${k}-photo`} name="photo" type="file" accept="image/*" />
        {w?.photo ? (
          <label className="text-muted-foreground flex items-center gap-2 text-sm">
            <input type="checkbox" name="remove_photo" value="yes" className="accent-primary" /> Remove the current photo
          </label>
        ) : null}
      </div>
    </>
  );
}

export default async function CouplesPage({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const sp = await searchParams;
  const words = listCoupleWords();
  const link = `${siteUrl()}/kind-words`;
  const waText = encodeURIComponent(`Congratulations again! 🎉 If you have a minute, we'd love to hear how your invitation went. You can write a few lines (and add a photo) here: ${link}`);
  const counts = { pending: 0, published: 0, hidden: 0 };
  words.forEach((w) => counts[w.status]++);

  return (
    <div className="grid gap-8">
      <div>
        <h1 className="heading text-4xl">Happy couples</h1>
        <p className="text-muted-foreground mt-1">
          What married couples say about us. Anything marked &ldquo;On the website&rdquo; shows in the &ldquo;What our happily married couples say&rdquo; section straight away.
        </p>
        <p className="mt-3 flex flex-wrap gap-2 text-sm">
          <Badge variant="clay">{counts.pending} waiting</Badge>
          <Badge variant="success">{counts.published} on the website</Badge>
          <Badge variant="outline">{counts.hidden} hidden</Badge>
        </p>
      </div>

      {sp.error ? <p className="bg-destructive/10 text-destructive rounded-lg px-4 py-3 text-sm">{sp.error}</p> : null}
      {sp.added ? <p className="rounded-lg bg-emerald-50 px-4 py-3 text-sm text-emerald-800">Added.</p> : null}
      {sp.saved ? <p className="rounded-lg bg-emerald-50 px-4 py-3 text-sm text-emerald-800">Saved.</p> : null}

      <Card className="gap-3 p-5">
        <h2 className="text-lg font-semibold">Ask a couple for their words</h2>
        <p className="text-muted-foreground text-sm">Send them this link after the wedding. What they write comes here for your approval before it goes on the website.</p>
        <div className="flex flex-wrap items-center gap-2">
          <code className="bg-muted rounded-md px-3 py-2 text-sm break-all">{link}</code>
          <Button asChild size="sm" variant="outline">
            <a href={`https://wa.me/?text=${waText}`} target="_blank" rel="noopener">Send on WhatsApp</a>
          </Button>
        </div>
      </Card>

      <Card className="gap-4 p-5">
        <h2 className="text-lg font-semibold">Add words you received</h2>
        <p className="text-muted-foreground text-sm">For messages couples sent you directly, on WhatsApp or in person.</p>
        <form action={addCoupleWord} className="grid gap-4">
          <Fields />
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" name="publish" value="yes" defaultChecked className="accent-primary size-4" /> Show it on the website now
          </label>
          <div>
            <Button type="submit">Add</Button>
          </div>
        </form>
      </Card>

      <div className="grid gap-4">
        {words.length === 0 ? <p className="text-muted-foreground">Nothing yet. Add the first one above, or send a couple the link.</p> : null}
        {words.map((w) => (
          <Card key={w.id} id={`w${w.id}`} className="gap-4 p-5">
            <div className="flex flex-wrap items-start gap-4">
              {w.photo ? (
                <img src={`/api/photos/${w.photo}`} alt="" className="size-24 rounded-lg object-cover" />
              ) : (
                <div className="bg-muted text-muted-foreground grid size-24 place-items-center rounded-lg text-xs">No photo</div>
              )}
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-semibold">{w.names}</p>
                  <Badge variant={STATUS[w.status].variant}>{STATUS[w.status].label}</Badge>
                  <Badge variant="outline">{w.source === "couple" ? "Sent by the couple" : "Added by you"}</Badge>
                </div>
                <p className="text-muted-foreground mt-0.5 text-sm">
                  {[w.place, monthLabel(w.wedding_month)].filter(Boolean).join(" · ") || "No place or date"} · received {fmtDate(w.created_at)}
                  {w.contact ? ` · ${w.contact}` : ""}
                </p>
                <p className="mt-3 leading-relaxed whitespace-pre-line">&ldquo;{w.quote}&rdquo;</p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <form action={setCoupleStatus}>
                <input type="hidden" name="id" value={w.id} />
                <input type="hidden" name="status" value={w.status === "published" ? "hidden" : "published"} />
                <Button size="sm" type="submit" variant={w.status === "published" ? "outline" : "default"}>
                  {w.status === "published" ? "Hide from website" : w.status === "pending" ? "Approve and show" : "Show on website"}
                </Button>
              </form>
              {w.status === "published" ? (
                <form action={showFirst}>
                  <input type="hidden" name="id" value={w.id} />
                  <Button size="sm" type="submit" variant="outline">Show first</Button>
                </form>
              ) : null}
              <details className="w-full">
                <summary className="text-primary cursor-pointer text-sm font-medium">Edit</summary>
                <form action={editCoupleWord} className="mt-4 grid gap-4">
                  <input type="hidden" name="id" value={w.id} />
                  <Fields w={w} />
                  <div>
                    <Button size="sm" type="submit">Save changes</Button>
                  </div>
                </form>
              </details>
              <details>
                <summary className="text-destructive cursor-pointer text-sm font-medium">Delete</summary>
                <form action={removeCoupleWord} className="mt-2 flex items-center gap-2">
                  <input type="hidden" name="id" value={w.id} />
                  <span className="text-sm">Delete for good, with the photo?</span>
                  <Button size="sm" type="submit" variant="destructive">Yes, delete</Button>
                </form>
              </details>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
