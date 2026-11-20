import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { BUILT_IN } from "@/lib/builder/music";
import { listLibraryTracks } from "@/lib/builder/sites";
import { addTrackAction, deleteTrackAction } from "@/app/admin/site-actions";

export default async function MusicPage({ searchParams }: { searchParams: Promise<{ saved?: string; error?: string }> }) {
  const sp = await searchParams;
  const tracks = listLibraryTracks();
  return (
    <div className="grid gap-6">
      <div>
        <h1 className="heading text-4xl">Music</h1>
        <p className="text-muted-foreground mt-1 text-sm">Tracks couples can choose in the builder. Only add music you have the licence to use on invitations.</p>
      </div>
      {sp.saved ? <p className="rounded-lg bg-emerald-50 px-4 py-3 text-sm text-emerald-800">Added. It shows at the top of the list in the builder.</p> : null}
      {sp.error ? <p className="bg-destructive/10 text-destructive rounded-lg px-4 py-3 text-sm">{sp.error}</p> : null}
      <Card className="gap-4 p-5">
        <h2 className="text-lg font-semibold">Add a track</h2>
        <form action={addTrackAction} className="grid gap-3 sm:grid-cols-2">
          <div className="grid gap-1.5">
            <Label htmlFor="t-title">Title</Label>
            <Input id="t-title" name="title" required maxLength={80} placeholder="Nadaswaram at dawn" />
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="t-by">Description</Label>
            <Input id="t-by" name="by" maxLength={80} placeholder="Instrumental · traditional" />
          </div>
          <div className="grid gap-1.5 sm:col-span-2">
            <Label htmlFor="t-file">MP3 or M4A, up to 12 MB</Label>
            <Input id="t-file" name="file" type="file" accept="audio/*,.mp3,.m4a" required />
          </div>
          <Button type="submit" className="sm:col-span-2">Add track</Button>
        </form>
      </Card>
      <Card className="gap-0 p-0">
        {[...tracks.map((t) => ({ ...t, src: `/api/build/music/${t.file}`, own: true })), ...BUILT_IN.map((t) => ({ ...t, own: false }))].map((t) => (
          <div key={t.id} className="flex flex-wrap items-center gap-4 border-b p-4 last:border-0">
            <div className="min-w-0 flex-1">
              <p className="font-medium">{t.title}</p>
              <p className="text-muted-foreground text-sm">{t.by || " "}{t.own ? "" : " · built in"}</p>
            </div>
            <audio controls preload="none" src={t.src} className="h-10 max-w-full" />
            {t.own ? (
              <form action={deleteTrackAction}>
                <input type="hidden" name="id" value={t.id} />
                <Button type="submit" variant="ghost" size="icon" aria-label={`Remove ${t.title}`}>
                  <Trash2 />
                </Button>
              </form>
            ) : null}
          </div>
        ))}
      </Card>
    </div>
  );
}
