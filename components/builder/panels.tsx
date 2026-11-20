"use client";

import * as React from "react";
import { ArrowDown, ArrowUp, Check, Loader2, Pause, Play, Plus, RotateCcw, Trash2, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { Area, GalleryPicker, Group, PhotoPicker, Text, Toggle } from "@/components/builder/fields";
import { LIMITS, newId, type InviteData, type InviteEvent, type StoryChapter } from "@/lib/builder/types";
import { TEMPLATES, findTemplate, paletteFor, type Template } from "@/lib/builder/templates";
import { fontsFor, type FontRole } from "@/lib/builder/fonts";
import { trackSrc, type Track } from "@/lib/builder/music";

export type Upd = (fn: (d: InviteData) => InviteData) => void;
type P = { data: InviteData; update: Upd; siteId: string };

const move = <T,>(list: T[], i: number, by: number) => {
  const j = i + by;
  if (j < 0 || j >= list.length) return list;
  const next = list.slice();
  [next[i], next[j]] = [next[j], next[i]];
  return next;
};

/* ---------- Couple and wording ---------- */
export function CouplePanel({ data, update }: P) {
  const set = <K extends keyof InviteData>(k: K) => (v: InviteData[K]) => update((d) => ({ ...d, [k]: v }));
  return (
    <>
      <Group title="Your names" desc="As you'd like them on the invitation, usually first names. The order is up to you.">
        <div className="grid grid-cols-2 gap-3">
          <Text label="First name" value={data.one} onChange={set("one")} maxLength={40} placeholder="Anna" />
          <Text label="Second name" value={data.two} onChange={set("two")} maxLength={40} placeholder="Joel" />
        </div>
      </Group>
      <Group title="Families" desc="Optional. Shown under each name, for example &quot;Daughter of Mr. Thomas & Mrs. Mary Kurian, Kottayam&quot;.">
        <Area label={`Under ${data.one || "the first name"}`} value={data.families.one} onChange={(v) => update((d) => ({ ...d, families: { ...d.families, one: v } }))} rows={2} maxLength={200} />
        <Area label={`Under ${data.two || "the second name"}`} value={data.families.two} onChange={(v) => update((d) => ({ ...d, families: { ...d.families, two: v } }))} rows={2} maxLength={200} />
      </Group>
      <Group title="Wording">
        <Area label="Blessing or verse at the top" value={data.blessing} onChange={set("blessing")} rows={2} maxLength={300} hint="A verse, a sloka, or a line like Shri Ganeshaya Namah. Leave empty to skip. Malayalam works too." />
        <Text label="Verse reference" value={data.blessingRef} onChange={set("blessingRef")} maxLength={80} placeholder="1 Corinthians 13:7" />
        <Text label="Line above your names" value={data.eyebrow} onChange={set("eyebrow")} maxLength={120} />
        <Text label="Line below your names" value={data.headline} onChange={set("headline")} maxLength={120} />
        <Area label="Invitation message" value={data.invite} onChange={set("invite")} rows={4} maxLength={1200} />
      </Group>
    </>
  );
}

/* ---------- Date and celebrations ---------- */
const QUICK = ["Engagement", "Haldi", "Mehendi", "Sangeet", "Betrothal", "Holy Mass", "The Wedding", "Reception"];

function EventCard({ e, i, count, onChange, onMove, onRemove }: { e: InviteEvent; i: number; count: number; onChange: (e: InviteEvent) => void; onMove: (by: number) => void; onRemove: () => void }) {
  const set = <K extends keyof InviteEvent>(k: K) => (v: InviteEvent[K]) => onChange({ ...e, [k]: v });
  return (
    <div className="bg-background grid gap-3 rounded-xl border p-4">
      <div className="flex items-center justify-between gap-2">
        <span className="text-muted-foreground text-xs font-semibold tracking-wider uppercase">Celebration {i + 1}</span>
        <div className="flex gap-1">
          <Button type="button" variant="ghost" size="icon" className="size-8" onClick={() => onMove(-1)} disabled={i === 0} aria-label="Move up">
            <ArrowUp />
          </Button>
          <Button type="button" variant="ghost" size="icon" className="size-8" onClick={() => onMove(1)} disabled={i === count - 1} aria-label="Move down">
            <ArrowDown />
          </Button>
          <Button type="button" variant="ghost" size="icon" className="size-8" onClick={onRemove} aria-label={`Remove ${e.name || "this celebration"}`}>
            <Trash2 />
          </Button>
        </div>
      </div>
      <Text label="Name" value={e.name} onChange={set("name")} maxLength={80} placeholder="Reception" />
      <div className="grid grid-cols-2 gap-3">
        <Text label="Date" type="date" value={e.date} onChange={set("date")} />
        <Text label="Time" type="time" value={e.time} onChange={set("time")} />
      </div>
      <Text label="Venue" value={e.venue} onChange={set("venue")} maxLength={120} placeholder="St. Mary's Church" />
      <Text label="Address" value={e.address} onChange={set("address")} maxLength={300} placeholder="Kudamaloor, Kottayam" />
      <Text
        label="Google Maps link (optional)"
        type="url"
        inputMode="url"
        value={e.map}
        onChange={set("map")}
        placeholder="https://maps.app.goo.gl/…"
        hint="In Google Maps, tap Share on the venue and paste the link. Without one, Directions searches for the venue and address."
      />
      <Text label="Note (optional)" value={e.note} onChange={set("note")} maxLength={300} placeholder="Dress code, lunch to follow…" />
    </div>
  );
}

export function EventsPanel({ data, update }: P) {
  const setEvents = (fn: (e: InviteEvent[]) => InviteEvent[]) => update((d) => ({ ...d, events: fn(d.events) }));
  const add = (name = "") =>
    setEvents((list) => [...list, { id: newId(), name, date: data.date, time: "", venue: "", address: "", map: "", note: "" }].slice(0, LIMITS.events));
  return (
    <>
      <Group title="The big day" desc="Drives the countdown and the date under your names.">
        <div className="grid grid-cols-2 gap-3">
          <Text label="Date" type="date" value={data.date} onChange={(v) => update((d) => ({ ...d, date: v }))} />
          <Text label="Time" type="time" value={data.time} onChange={(v) => update((d) => ({ ...d, time: v }))} />
        </div>
        <Text label="Town or city" value={data.city} onChange={(v) => update((d) => ({ ...d, city: v }))} maxLength={80} placeholder="Kochi" />
        <Toggle label="Show a countdown" checked={data.show.countdown} onChange={(v) => update((d) => ({ ...d, show: { ...d.show, countdown: v } }))} />
      </Group>
      <Group title="Celebrations" desc={`Each one gets its own card with directions and an add-to-calendar button. Up to ${LIMITS.events}.`}>
        {data.events.map((e, i) => (
          <EventCard
            key={e.id}
            e={e}
            i={i}
            count={data.events.length}
            onChange={(next) => setEvents((list) => list.map((x) => (x.id === e.id ? next : x)))}
            onMove={(by) => setEvents((list) => move(list, i, by))}
            onRemove={() => setEvents((list) => list.filter((x) => x.id !== e.id))}
          />
        ))}
        {data.events.length < LIMITS.events ? (
          <div className="grid gap-2">
            <Button type="button" variant="outline" onClick={() => add()}>
              <Plus /> Add a celebration
            </Button>
            <div className="flex flex-wrap gap-1.5">
              {QUICK.filter((q) => !data.events.some((e) => e.name.toLowerCase() === q.toLowerCase())).map((q) => (
                <button key={q} type="button" onClick={() => add(q)} className="bg-secondary hover:bg-accent rounded-full px-3 py-1 text-xs font-medium">
                  + {q}
                </button>
              ))}
            </div>
          </div>
        ) : null}
      </Group>
    </>
  );
}

/* ---------- Photos and story ---------- */
function ChapterCard({ c, i, count, siteId, onChange, onMove, onRemove }: { c: StoryChapter; i: number; count: number; siteId: string; onChange: (c: StoryChapter) => void; onMove: (by: number) => void; onRemove: () => void }) {
  const set = <K extends keyof StoryChapter>(k: K) => (v: StoryChapter[K]) => onChange({ ...c, [k]: v });
  return (
    <div className="bg-background grid gap-3 rounded-xl border p-4">
      <div className="flex items-center justify-between gap-2">
        <span className="text-muted-foreground text-xs font-semibold tracking-wider uppercase">Chapter {i + 1}</span>
        <div className="flex gap-1">
          <Button type="button" variant="ghost" size="icon" className="size-8" onClick={() => onMove(-1)} disabled={i === 0} aria-label="Move up">
            <ArrowUp />
          </Button>
          <Button type="button" variant="ghost" size="icon" className="size-8" onClick={() => onMove(1)} disabled={i === count - 1} aria-label="Move down">
            <ArrowDown />
          </Button>
          <Button type="button" variant="ghost" size="icon" className="size-8" onClick={onRemove} aria-label="Remove chapter">
            <Trash2 />
          </Button>
        </div>
      </div>
      <div className="grid grid-cols-[110px_1fr] gap-3">
        <Text label="When" value={c.when} onChange={set("when")} maxLength={40} placeholder="2019" />
        <Text label="Title" value={c.title} onChange={set("title")} maxLength={100} placeholder="How we met" />
      </div>
      <Area label="What happened" value={c.text} onChange={set("text")} rows={3} maxLength={1500} />
      <PhotoPicker siteId={siteId} label="Photo (optional)" value={c.photo} onChange={set("photo")} aspect="aspect-[4/3]" />
    </div>
  );
}

export function StoryPanel({ data, update, siteId }: P) {
  const setStory = (fn: (s: StoryChapter[]) => StoryChapter[]) => update((d) => ({ ...d, story: fn(d.story) }));
  return (
    <>
      <Group title="Cover photo" desc="Optional. Shown under your names, and as the picture when the link is shared on WhatsApp.">
        <PhotoPicker siteId={siteId} label="Your photo" value={data.cover} onChange={(v) => update((d) => ({ ...d, cover: v }))} />
      </Group>
      <Group title="Your story" desc={`A few chapters of how you got here. Up to ${LIMITS.story}.`}>
        <Toggle label="Show our story" checked={data.show.story} onChange={(v) => update((d) => ({ ...d, show: { ...d.show, story: v } }))} />
        {data.show.story ? (
          <>
            <Text label="Section title" value={data.storyTitle} onChange={(v) => update((d) => ({ ...d, storyTitle: v }))} maxLength={80} />
            {data.story.map((c, i) => (
              <ChapterCard
                key={c.id}
                c={c}
                i={i}
                count={data.story.length}
                siteId={siteId}
                onChange={(next) => setStory((s) => s.map((x) => (x.id === c.id ? next : x)))}
                onMove={(by) => setStory((s) => move(s, i, by))}
                onRemove={() => setStory((s) => s.filter((x) => x.id !== c.id))}
              />
            ))}
            {data.story.length < LIMITS.story ? (
              <Button type="button" variant="outline" onClick={() => setStory((s) => [...s, { id: newId(), when: "", title: "", text: "", photo: "" }])}>
                <Plus /> Add a chapter
              </Button>
            ) : null}
          </>
        ) : null}
      </Group>
      <Group title="Photo gallery" desc={`Up to ${LIMITS.gallery} photos. Every third one is shown wide.`}>
        <Toggle label="Show the gallery" checked={data.show.gallery} onChange={(v) => update((d) => ({ ...d, show: { ...d.show, gallery: v } }))} />
        {data.show.gallery ? (
          <>
            <Text label="Section title" value={data.galleryTitle} onChange={(v) => update((d) => ({ ...d, galleryTitle: v }))} maxLength={80} />
            <GalleryPicker siteId={siteId} value={data.gallery} onChange={(v) => update((d) => ({ ...d, gallery: v }))} max={LIMITS.gallery} />
          </>
        ) : null}
      </Group>
    </>
  );
}

/* ---------- Style ---------- */
function FontGrid({ role, value, onChange, sample, label }: { role: FontRole; value: string; onChange: (v: string) => void; sample: string; label: string }) {
  const fonts = fontsFor(role);
  return (
    <div className="grid gap-2">
      <span className="text-[13px] font-medium">{label}</span>
      <div role="radiogroup" aria-label={label} className="grid max-h-64 grid-cols-2 gap-2 overflow-y-auto pr-1">
        {fonts.map((f) => (
          <button
            key={f.id}
            type="button"
            role="radio"
            aria-checked={value === f.id}
            onClick={() => onChange(f.id)}
            className={cn("bg-background flex min-h-16 flex-col items-start justify-center gap-0.5 rounded-lg border px-3 py-2 text-left transition", value === f.id ? "border-primary ring-primary/30 ring-2" : "hover:border-ring")}
          >
            <span className={cn("block w-full truncate leading-tight", role === "script" ? "text-[22px]" : role === "heading" ? "text-[19px]" : "text-[15px]")} style={{ fontFamily: f.stack }}>
              {sample}
            </span>
            <span className="text-muted-foreground text-[11px]">{f.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

export function StylePanel({ data, update, templateId, setTemplate, onReplay }: P & { templateId: string; setTemplate: (t: Template) => void; onReplay: () => void }) {
  const t = findTemplate(templateId) ?? TEMPLATES[0];
  const current = paletteFor(t, data.style);
  const setStyle = (patch: Partial<InviteData["style"]>) => update((d) => ({ ...d, style: { ...d.style, ...patch } }));
  const names = [data.one, data.two].filter(Boolean).join(" & ") || "Anna & Joel";
  const colors = data.style.colors ?? { bg: current.bg, ink: current.ink, accent: current.accent, soft: current.soft };
  const pct = Math.round(data.style.scale * 100);
  return (
    <>
      <Group title="Design" desc="Switch any time. Everything you've typed stays.">
        <div role="radiogroup" aria-label="Design" className="grid grid-cols-2 gap-2">
          {TEMPLATES.map((x) => {
            const p = x.palettes[0];
            return (
              <button
                key={x.id}
                type="button"
                role="radio"
                aria-checked={x.id === templateId}
                onClick={() => x.id !== templateId && setTemplate(x)}
                className={cn("bg-background flex items-center gap-3 rounded-lg border p-2.5 text-left transition", x.id === templateId ? "border-primary ring-primary/30 ring-2" : "hover:border-ring")}
              >
                <span className="grid size-10 flex-none place-items-center rounded-md border text-lg" style={{ background: p.bg, color: p.accent, fontFamily: "Georgia, serif" }} aria-hidden>
                  {x.name[0]}
                </span>
                <span className="min-w-0">
                  <span className="block text-sm font-semibold">{x.name}</span>
                  <span className="text-muted-foreground block truncate text-[11px]">{x.tags.join(" · ")}</span>
                </span>
              </button>
            );
          })}
        </div>
      </Group>
      <Group title="Colours">
        <div role="radiogroup" aria-label="Colour palette" className="flex flex-wrap gap-2">
          {t.palettes.map((p) => {
            const on = !data.style.colors && data.style.palette === p.id;
            return (
              <button
                key={p.id}
                type="button"
                role="radio"
                aria-checked={on}
                onClick={() => setStyle({ palette: p.id, colors: null })}
                className={cn("bg-background flex items-center gap-2 rounded-full border py-1.5 pr-3 pl-1.5 text-xs font-medium", on ? "border-primary ring-primary/30 ring-2" : "hover:border-ring")}
              >
                <span className="block size-6 rounded-full border" style={{ background: `linear-gradient(135deg, ${p.bg} 0 50%, ${p.accent} 50% 75%, ${p.ink} 75%)` }} />
                {p.label}
              </button>
            );
          })}
        </div>
        <div className="grid gap-2">
          <div className="flex items-center justify-between">
            <span className="text-[13px] font-medium">Your own colours</span>
            {data.style.colors ? (
              <button type="button" className="text-muted-foreground text-xs underline underline-offset-4" onClick={() => setStyle({ colors: null })}>
                Back to the palette
              </button>
            ) : null}
          </div>
          <div className="grid grid-cols-4 gap-2">
            {(
              [
                ["bg", "Background"],
                ["ink", "Text"],
                ["accent", "Accent"],
                ["soft", "Soft"],
              ] as const
            ).map(([k, label]) => (
              <label key={k} className="bg-background grid cursor-pointer justify-items-center gap-1 rounded-lg border p-2 text-[11px]">
                <input type="color" value={colors[k]} onChange={(e) => setStyle({ colors: { ...colors, [k]: e.target.value } })} className="h-8 w-full cursor-pointer rounded border-0 bg-transparent p-0" />
                {label}
              </label>
            ))}
          </div>
        </div>
      </Group>
      <Group title="Fonts">
        <FontGrid role="script" label="Your names" value={data.style.script} onChange={(v) => setStyle({ script: v })} sample={names} />
        <FontGrid role="heading" label="Headings" value={data.style.heading} onChange={(v) => setStyle({ heading: v })} sample="The celebrations" />
        <FontGrid role="body" label="Text" value={data.style.body} onChange={(v) => setStyle({ body: v })} sample="We'd love you to join us" />
      </Group>
      <Group title="Text size" desc="Make everything larger for older guests, or smaller to fit more.">
        <div className="flex items-center gap-3">
          <span className="text-sm" aria-hidden>
            A
          </span>
          <input
            type="range"
            min={85}
            max={130}
            step={5}
            value={pct}
            onChange={(e) => setStyle({ scale: Number(e.target.value) / 100 })}
            aria-label="Text size"
            aria-valuetext={`${pct}%`}
            className="accent-primary h-2 flex-1"
          />
          <span className="text-xl" aria-hidden>
            A
          </span>
          <span className="text-muted-foreground w-12 text-right text-sm tabular-nums">{pct}%</span>
        </div>
      </Group>
      <Group title="Opening and effects">
        <Toggle
          label={t.cover === "doors" ? "Open with temple doors" : t.cover === "night" ? "Open with the night sky" : t.cover === "card" ? "Open with a card" : "Open from a sealed envelope"}
          hint="Guests tap to open. It also starts your music, since phones don't play music on their own."
          checked={data.show.opening}
          onChange={(v) => update((d) => ({ ...d, show: { ...d.show, opening: v } }))}
        />
        {data.show.opening ? (
          <Button type="button" variant="outline" size="sm" className="justify-self-start" onClick={onReplay}>
            <RotateCcw /> Replay the opening in the preview
          </Button>
        ) : null}
        {t.effect !== "none" ? (
          <Toggle
            label={t.effect === "stars" ? "Shooting stars" : t.effect === "marigold" ? "Falling marigold petals" : "Falling petals"}
            checked={data.show.effects}
            onChange={(v) => update((d) => ({ ...d, show: { ...d.show, effects: v } }))}
          />
        ) : null}
      </Group>
    </>
  );
}

/* ---------- Music ---------- */
export function MusicPanel({ data, update, siteId, library }: P & { library: Track[] }) {
  const audio = React.useRef<HTMLAudioElement | null>(null);
  const [playing, setPlaying] = React.useState("");
  const [busy, setBusy] = React.useState(false);
  const [err, setErr] = React.useState("");
  const input = React.useRef<HTMLInputElement>(null);
  React.useEffect(() => () => audio.current?.pause(), []);
  const toggle = (track: string) => {
    if (!audio.current) audio.current = new Audio();
    const a = audio.current;
    if (playing === track) {
      a.pause();
      setPlaying("");
      return;
    }
    a.src = trackSrc(track, library);
    a.currentTime = 0;
    a.play().catch(() => setPlaying(""));
    a.onended = () => setPlaying("");
    setPlaying(track);
  };
  const choose = (track: string, title = "") => update((d) => ({ ...d, music: { track, title } }));
  const upload = async (f?: File) => {
    if (!f) return;
    setBusy(true);
    setErr("");
    try {
      const fd = new FormData();
      fd.append("file", f);
      const r = await fetch(`/api/build/sites/${siteId}/music`, { method: "POST", body: fd });
      const j = await r.json().catch(() => ({}));
      if (!r.ok || !j.ok) throw new Error(j.error || "That song didn't upload.");
      choose(j.track, j.title);
    } catch (e) {
      setErr((e as Error).message);
    } finally {
      setBusy(false);
      if (input.current) input.current.value = "";
    }
  };
  const Row = ({ track, title, by }: { track: string; title: string; by: string }) => {
    const on = data.music.track === track;
    return (
      <div className={cn("bg-background flex items-center gap-3 rounded-lg border p-2.5", on && "border-primary ring-primary/30 ring-2")}>
        {track ? (
          <Button type="button" variant="outline" size="icon" className="size-9 flex-none rounded-full" onClick={() => toggle(track)} aria-label={playing === track ? `Pause ${title}` : `Play ${title}`}>
            {playing === track ? <Pause /> : <Play />}
          </Button>
        ) : (
          <span className="size-9 flex-none" />
        )}
        <button type="button" role="radio" aria-checked={on} onClick={() => choose(track, track.startsWith("up:") ? title : "")} className="flex min-w-0 flex-1 items-center justify-between gap-2 text-left">
          <span className="min-w-0">
            <span className="block truncate text-sm font-medium">{title}</span>
            {by ? <span className="text-muted-foreground block truncate text-xs">{by}</span> : null}
          </span>
          {on ? <Check className="text-primary size-4 flex-none" aria-hidden /> : null}
        </button>
      </div>
    );
  };
  return (
    <>
      <Group title="Music" desc="Plays softly once guests tap to open the invitation. They can pause it with the music button.">
        <div role="radiogroup" aria-label="Music" className="grid gap-2">
          <Row track="" title="No music" by="" />
          {library.map((t) => (
            <Row key={t.id} track={`lib:${t.id}`} title={t.title} by={t.by} />
          ))}
          {data.music.track.startsWith("up:") ? <Row track={data.music.track} title={data.music.title || "Your song"} by="Uploaded by you" /> : null}
        </div>
      </Group>
      <Group title="Your own song" desc="An MP3 or M4A, up to 12 MB. Please only upload music you have the right to share.">
        <Button type="button" variant="outline" onClick={() => input.current?.click()} disabled={busy} className="justify-self-start">
          {busy ? <Loader2 className="animate-spin" /> : <Upload />} Upload a song
        </Button>
        {err ? <p className="text-destructive text-xs">{err}</p> : null}
        <input ref={input} type="file" accept="audio/mpeg,audio/mp3,audio/mp4,audio/x-m4a,audio/aac,.mp3,.m4a" className="sr-only" tabIndex={-1} onChange={(e) => upload(e.target.files?.[0])} />
      </Group>
    </>
  );
}

/* ---------- RSVP and closing ---------- */
export function RsvpPanel({ data, update, rsvpsHref }: P & { rsvpsHref?: string }) {
  const setR = (patch: Partial<InviteData["rsvp"]>) => update((d) => ({ ...d, rsvp: { ...d.rsvp, ...patch } }));
  return (
    <>
      <Group title="RSVP" desc="Guests tell you if they're coming, how many, and to which celebrations. You see every reply in one list.">
        <Toggle label="Ask guests to RSVP" checked={data.rsvp.on} onChange={(v) => setR({ on: v })} />
        {data.rsvp.on ? (
          <>
            <Text label="Reply by (optional)" type="date" value={data.rsvp.deadline} onChange={(v) => setR({ deadline: v })} />
            <Text label="Note (optional)" value={data.rsvp.note} onChange={(v) => setR({ note: v })} maxLength={300} placeholder="Children are welcome!" />
            <Text
              label="WhatsApp number (optional)"
              type="tel"
              inputMode="tel"
              value={data.rsvp.whatsapp}
              onChange={(v) => setR({ whatsapp: v.replace(/[^\d+ ]/g, "") })}
              maxLength={20}
              placeholder="91 98765 43210"
              hint="Adds an &quot;Or reply on WhatsApp&quot; button. Include the country code."
            />
            {rsvpsHref ? (
              <Button variant="outline" asChild className="justify-self-start">
                <a href={rsvpsHref}>See replies</a>
              </Button>
            ) : null}
          </>
        ) : null}
      </Group>
      <Group title="Closing">
        <Area label="Closing message" value={data.closing} onChange={(v) => update((d) => ({ ...d, closing: v }))} rows={3} maxLength={400} />
        <Text label="Sign-off" value={data.signoff} onChange={(v) => update((d) => ({ ...d, signoff: v }))} maxLength={120} hint="Your names follow it." />
        <Text label="Wedding hashtag (optional)" value={data.hashtag} onChange={(v) => update((d) => ({ ...d, hashtag: v.replace(/\s+/g, "") }))} maxLength={40} placeholder="#AnnaWedsJoel" />
      </Group>
    </>
  );
}

export function ShortLabel({ children }: { children: React.ReactNode }) {
  return <Label className="text-[13px]">{children}</Label>;
}
