"use client";

/* The editor for studio designs: a form built from the design's own settings, next to the real design. */
import * as React from "react";
import Link from "next/link";
import { ArrowDown, ArrowLeft, ArrowUp, Check, CircleAlert, ExternalLink, Eye, ImagePlus, Link2, Loader2, Plus, RotateCcw, Sparkles, Trash2, Upload, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { useBase } from "@/components/builder/base";
import { ContactDialog, type EditorSite } from "@/components/builder/editor";
import { uploadPhoto } from "@/components/builder/fields";
import { designBase, type Config, type Design, type Json } from "@/lib/builder/designs";
import { fieldKind, getPath, isHidden, renderStudio, samplePhotoCount, setPath, studioSummary } from "@/lib/builder/studio";
import { withWatermark } from "@/lib/builder/watermark";
import type { Track } from "@/lib/builder/music";

/* ---------- labels ---------- */
const LABELS: Record<string, string> = {
  one: "First person",
  two: "Second person",
  first: "First name",
  family: "Family name",
  last: "Last name",
  joiner: "Word between the names",
  start: "Date and time",
  end: "Ends at",
  weddingAt: "Wedding date and time",
  weddingStart: "Wedding date and time",
  map: "Google Maps link",
  maps: "Google Maps link",
  mapUrl: "Google Maps link",
  whatsapp: "WhatsApp number (with country code)",
  dress: "Dress code",
  alt: "Photo description",
  src: "Photo",
  art: "Artwork",
  elders: "Elders (blessings of)",
  hosts: "Hosts (parents)",
  parents: "Parents",
  invocation: "Invocation",
  signoff: "Sign-off",
  dateLine: "Date line",
  tagline: "Date line",
  rsvp: "RSVP",
  rsvpBy: "Reply by",
  deadline: "Reply by",
  maxGuests: "Most guests per reply",
  know: "Good to know",
  meet: "About you",
  kicker: "Small heading",
  note: "Note",
  instagram: "Instagram link",
  music: "Music",
  file: "Music",
  hashtag: "Hashtag",
  hashtags: "Hashtags",
  defaultLanguage: "Starting language",
  cal: "Calendar times",
  weekday: "Day of the week",
  parts: "Times and places",
  where: "Where",
  time: "Time",
};
const human = (k: string) =>
  LABELS[k] ??
  k
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/[_-]+/g, " ")
    .replace(/^./, (c) => c.toUpperCase());

/* Technical settings nobody needs to touch. */
const QUIET = /^(id|icon|focus|lat|lon|tz|timezone|locale|flag|code|appleTrackId|seconds|embedUrl|provider|key|table|demo|endpoint|sheetUrl|rsvpEndpoint|url)$/;

type SaveState = "saved" | "dirty" | "saving" | "error";

export function StudioEditor({
  site,
  design,
  initial,
  html,
  library,
  price,
}: {
  site: EditorSite;
  design: Design;
  initial: Config;
  html: string;
  library: Track[];
  price: number;
}) {
  const base = useBase();
  const [config, setConfig] = React.useState<Config>(initial);
  const [save, setSave] = React.useState<SaveState>("saved");
  const [saveError, setSaveError] = React.useState("");
  const [unpublished, setUnpublished] = React.useState(site.unpublished);
  const [publishing, setPublishing] = React.useState(false);
  const [published, setPublished] = React.useState(false);
  const [showPreview, setShowPreview] = React.useState(false);
  const [contact, setContact] = React.useState(site.contact);
  const [contactOpen, setContactOpen] = React.useState(false);
  const [nudge, setNudge] = React.useState(!site.contact.email);
  const [srcDoc, setSrcDoc] = React.useState("");
  const latest = React.useRef(config);
  latest.current = config;

  const summary = studioSummary(design, config);
  const names = [summary.one, summary.two].filter(Boolean).join(" & ") || "Your invitation";
  const samples = samplePhotoCount(design, config);

  /* preview: the real design, reloaded a moment after typing stops (watermarked until it's paid for) */
  const render = React.useCallback(
    () => {
      const doc = renderStudio(design, html, latest.current, { mode: "editor", title: names, description: "" });
      setSrcDoc(site.paid ? doc : withWatermark(doc));
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [design, html, site.paid]
  );
  React.useEffect(() => {
    const id = setTimeout(render, srcDoc ? 900 : 0);
    return () => clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [config, render]);

  /* autosave */
  const mounted = React.useRef(false);
  const saving = React.useRef<Promise<void> | null>(null);
  const doSave = React.useCallback(async () => {
    setSave("saving");
    try {
      const r = await fetch(`/api/build/sites/${site.id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ data: latest.current }), keepalive: true });
      const j = await r.json().catch(() => ({}));
      if (!r.ok || !j.ok) throw new Error(j.error || "Couldn't save");
      setSave((s) => (s === "saving" ? "saved" : s));
      setSaveError("");
    } catch (e) {
      setSave("error");
      setSaveError((e as Error).message);
    }
  }, [site.id]);
  React.useEffect(() => {
    if (!mounted.current) {
      mounted.current = true;
      return;
    }
    setSave("dirty");
    if (site.paid) setUnpublished(true);
    setPublished(false);
    const id = setTimeout(() => {
      saving.current = doSave();
    }, 800);
    return () => clearTimeout(id);
  }, [config, doSave, site.paid]);
  React.useEffect(() => {
    const flush = () => {
      if (save === "dirty") void doSave();
    };
    const warn = (e: BeforeUnloadEvent) => {
      if (save === "dirty" || save === "saving") e.preventDefault();
    };
    window.addEventListener("pagehide", flush);
    window.addEventListener("beforeunload", warn);
    return () => {
      window.removeEventListener("pagehide", flush);
      window.removeEventListener("beforeunload", warn);
    };
  }, [save, doSave]);
  const ensureSaved = async () => {
    if (save === "dirty") await doSave();
    else if (saving.current) await saving.current;
  };
  const publishChanges = async () => {
    setPublishing(true);
    await ensureSaved();
    const r = await fetch(`/api/build/sites/${site.id}/publish`, { method: "POST" });
    setPublishing(false);
    if (r.ok) {
      setUnpublished(false);
      setPublished(true);
    }
  };

  const set = React.useCallback((path: string, value: Json) => setConfig((c) => setPath(c, path, value)), []);

  /* sections: one per top-level setting, the names first */
  const keys = Object.keys(design.sample).filter((k) => !isHidden(design, k) && !QUIET.test(k));
  const first = [design.one, design.date].map((p) => p.split(/[.[]/)[0]);
  const loose = keys.filter((k) => typeof design.sample[k] !== "object" || design.sample[k] === null);
  const groups = keys.filter((k) => !loose.includes(k)).sort((a, b) => (first.includes(b) ? 1 : 0) - (first.includes(a) ? 1 : 0));
  const saveLabel = save === "saving" ? "Saving…" : save === "dirty" ? "Unsaved" : save === "error" ? "Not saved" : "Saved";

  return (
    <div className="bg-muted flex h-dvh flex-col overflow-hidden">
      <header className="bg-card z-20 flex h-14 flex-none items-center gap-2 border-b px-2 sm:px-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href={`${base}/mine`} aria-label="My designs">
            <ArrowLeft />
          </Link>
        </Button>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold">{names}</p>
          <p className="text-muted-foreground flex items-center gap-1.5 text-xs" role="status" aria-live="polite">
            {save === "saving" ? <Loader2 className="size-3 animate-spin" aria-hidden /> : save === "error" ? <CircleAlert className="text-destructive size-3" aria-hidden /> : save === "saved" ? <Check className="size-3" aria-hidden /> : null}
            <span className={save === "error" ? "text-destructive" : ""}>{save === "error" ? `${saveLabel}: ${saveError}` : saveLabel}</span>
            <span aria-hidden>·</span>
            <span className="truncate">{site.paid ? (unpublished ? "Live, with changes not yet published" : "Live") : `${design.name} · draft`}</span>
          </p>
        </div>
        <Button variant="outline" size="sm" asChild className="max-sm:hidden">
          <a href={`${base}/preview/${site.id}`} target="_blank" rel="noopener" onClick={() => void ensureSaved()}>
            <Eye /> Preview
          </a>
        </Button>
        {!contact.email ? (
          <Button variant="outline" size="sm" onClick={() => setContactOpen(true)} className="max-md:hidden">
            Save my design
          </Button>
        ) : null}
        <Button variant="outline" size="sm" asChild className="max-md:hidden">
          <Link href={`${base}/links/${site.id}`} onClick={() => void ensureSaved()}>
            <Link2 /> Guest links
          </Link>
        </Button>
        {site.paid ? (
          <>
            <Button variant="outline" size="sm" asChild className="max-sm:hidden">
              <a href={site.liveUrl} target="_blank" rel="noopener">
                <ExternalLink /> View live
              </a>
            </Button>
            <Button size="sm" onClick={publishChanges} disabled={!unpublished || publishing}>
              {publishing ? <Loader2 className="animate-spin" /> : published ? <Check /> : null}
              {published ? "Updated" : unpublished ? "Update live invitation" : "Up to date"}
            </Button>
          </>
        ) : (
          <Button size="sm" asChild>
            <Link href={`${base}/publish/${site.id}`} onClick={() => void ensureSaved()}>
              <Sparkles /> Publish · ₹{price.toLocaleString("en-IN")}
            </Link>
          </Button>
        )}
      </header>

      <div className="flex min-h-0 flex-1">
        <div className="bg-card flex w-full min-w-0 flex-col border-r lg:w-[460px] lg:flex-none">
          <div className="min-h-0 flex-1 overflow-y-auto pb-28 lg:pb-10">
            <div className="border-b px-5 py-4">
              <p className="text-muted-foreground text-xs font-semibold tracking-wider uppercase">{design.name}</p>
              <p className="text-muted-foreground mt-1 text-[13px]">Everything guests read is below. Change the wording, dates, places and photos; the design takes care of the rest.</p>
              {design.tip ? <p className="text-muted-foreground mt-1 text-[13px]">{design.tip}</p> : null}
              {samples ? (
                <p className="bg-clay-soft mt-3 rounded-lg px-3 py-2 text-[13px]">
                  {samples} {samples === 1 ? "photo is" : "photos are"} still our sample. Replace {samples === 1 ? "it" : "them"} with yours before you publish.
                </p>
              ) : null}
            </div>
            {nudge && !contact.email ? (
              <div className="bg-clay-soft m-4 mb-0 flex items-start gap-3 rounded-xl p-4 text-sm">
                <p className="flex-1">
                  <span className="font-semibold">Save your design</span>
                  <span className="text-muted-foreground block">We&apos;ll email you a link to come back to it on any phone or computer.</span>
                  <button type="button" onClick={() => setContactOpen(true)} className="mt-2 font-medium underline underline-offset-4">
                    Save it now
                  </button>
                </p>
                <button type="button" onClick={() => setNudge(false)} aria-label="Dismiss" className="grid size-8 place-items-center rounded-full hover:bg-black/5">
                  <X className="size-4" />
                </button>
              </div>
            ) : null}
            {loose.length ? (
              <Section title="Basics" open>
                {loose.map((k) => (
                  <Node key={k} design={design} path={k} k={k} value={config[k]} sample={design.sample[k]} set={set} library={library} siteId={site.id} />
                ))}
              </Section>
            ) : null}
            {groups.flatMap((k, i) =>
              // "text" holds every line of a page, by section: one panel per section
              k === "text" && design.sample.text && typeof design.sample.text === "object"
                ? Object.keys(design.sample.text).map((g) => (
                    <Section key={`text.${g}`} title={`Words · ${human(g)}`}>
                      <Node design={design} path={`text.${g}`} k={g} value={getPath(config, `text.${g}`)} sample={getPath(design.sample, `text.${g}`)} set={set} library={library} siteId={site.id} bare />
                    </Section>
                  ))
                : [
                    <Section key={k} title={human(k)} open={i < 2}>
                      <Node design={design} path={k} k={k} value={config[k]} sample={design.sample[k]} set={set} library={library} siteId={site.id} bare />
                    </Section>,
                  ]
            )}
            <div className="flex justify-end px-5 pt-5">
              {site.paid ? null : (
                <Button asChild>
                  <Link href={`${base}/publish/${site.id}`} onClick={() => void ensureSaved()}>
                    I&apos;m happy, publish it
                  </Link>
                </Button>
              )}
            </div>
          </div>
        </div>

        <div className={cn("flex-1 flex-col items-center justify-center gap-3 p-6", showPreview ? "bg-muted fixed inset-0 z-40 flex p-0 lg:static lg:p-6" : "hidden lg:flex")}>
          <div
            className={cn(
              "relative overflow-hidden bg-white shadow-[0_30px_60px_rgba(74,15,22,0.18)]",
              showPreview ? "h-full w-full lg:h-[min(860px,calc(100dvh-140px))] lg:w-[390px] lg:rounded-[40px] lg:border-[10px] lg:border-[#2a0a0e]" : "h-[min(860px,calc(100dvh-140px))] w-[390px] rounded-[40px] border-[10px] border-[#2a0a0e]"
            )}
          >
            {srcDoc ? <iframe srcDoc={srcDoc} title="Live preview of your invitation" className="size-full border-0" allow="autoplay" /> : null}
          </div>
          <p className="text-muted-foreground hidden items-center gap-3 text-xs lg:flex">
            The preview reloads a moment after you stop typing.
            <button type="button" onClick={render} className="text-foreground inline-flex items-center gap-1 font-medium underline underline-offset-4">
              <RotateCcw className="size-3" /> Reload
            </button>
          </p>
          {showPreview ? (
            <Button className="absolute top-3 right-3 z-50 rounded-full shadow-lg lg:hidden" size="sm" onClick={() => setShowPreview(false)}>
              <X /> Back to editing
            </Button>
          ) : null}
        </div>
      </div>

      {!showPreview ? (
        <div className="bg-card/95 fixed inset-x-0 bottom-0 z-30 flex gap-2 border-t p-3 backdrop-blur lg:hidden">
          <Button className="flex-1" size="lg" onClick={() => (render(), setShowPreview(true))}>
            <Eye /> Preview
          </Button>
          {!contact.email ? (
            <Button variant="outline" size="lg" onClick={() => setContactOpen(true)}>
              Save
            </Button>
          ) : null}
        </div>
      ) : null}

      <ContactDialog
        open={contactOpen}
        onOpenChange={setContactOpen}
        siteId={site.id}
        initial={contact}
        onSaved={(c) => {
          setContact(c);
          setNudge(false);
        }}
      />
    </div>
  );
}

function Section({ title, open, children }: { title: string; open?: boolean; children: React.ReactNode }) {
  return (
    <details open={open} className="group border-b">
      <summary className="hover:bg-accent/60 flex cursor-pointer list-none items-center justify-between px-5 py-4 text-[15px] font-semibold [&::-webkit-details-marker]:hidden">
        {title}
        <span className="text-muted-foreground text-xs transition-transform group-open:rotate-180" aria-hidden>
          ▾
        </span>
      </summary>
      <div className="grid gap-4 px-5 pb-6">{children}</div>
    </details>
  );
}

type NodeProps = {
  design: Design;
  path: string;
  k: string;
  value: Json | undefined;
  sample: Json | undefined;
  set: (path: string, v: Json) => void;
  library: Track[];
  siteId: string;
  bare?: boolean;
};

/* One setting, whatever its shape: a field, a group of fields, or a list. */
function Node({ design, path, k, value, sample, set, library, siteId, bare }: NodeProps) {
  if (isHidden(design, path) || QUIET.test(k)) return null;
  const shape = sample ?? value;
  if (Array.isArray(shape)) return <List design={design} path={path} k={k} value={Array.isArray(value) ? value : []} sample={shape} set={set} library={library} siteId={siteId} />;
  if (shape && typeof shape === "object") {
    const obj = (value && typeof value === "object" && !Array.isArray(value) ? value : {}) as Record<string, Json>;
    const inner = Object.keys(shape).map((kk) => (
      <Node key={kk} design={design} path={`${path}.${kk}`} k={kk} value={obj[kk]} sample={(shape as Record<string, Json>)[kk]} set={set} library={library} siteId={siteId} />
    ));
    if (bare) return <>{inner}</>;
    return (
      <fieldset className="grid gap-3 rounded-xl border p-4">
        <legend className="text-muted-foreground px-1 text-xs font-semibold tracking-wider uppercase">{human(k)}</legend>
        {inner}
      </fieldset>
    );
  }
  return <Field path={path} k={k} value={value ?? shape ?? ""} sample={shape ?? ""} set={set} library={library} siteId={siteId} design={design} />;
}

function List({ design, path, k, value, sample, set, library, siteId }: Omit<NodeProps, "value" | "sample"> & { value: Json[]; sample: Json[] }) {
  const shape = sample[0] ?? (typeof value[0] === "string" ? "" : value[0]);
  const blank = (s: Json | undefined): Json =>
    Array.isArray(s) ? s.map(blank) : s && typeof s === "object" ? Object.fromEntries(Object.entries(s).map(([kk, v]) => [kk, /^(art|icon|src|photo|focus)$/.test(kk) ? v : blank(v)])) : typeof s === "string" ? "" : (s ?? "");
  const add = () => set(path, [...value, blank(value[value.length - 1] ?? shape)]);
  const move = (i: number, by: number) => {
    const j = i + by;
    if (j < 0 || j >= value.length) return;
    const next = value.slice();
    [next[i], next[j]] = [next[j], next[i]];
    set(path, next);
  };
  const remove = (i: number) => set(path, value.filter((_, x) => x !== i));
  const primitive = shape === undefined || shape === null || typeof shape !== "object";
  const titleOf = (v: Json) => {
    if (v && typeof v === "object" && !Array.isArray(v)) {
      const o = v as Record<string, Json>;
      return String(o.name ?? o.title ?? o.label ?? o.day ?? "");
    }
    return "";
  };
  return (
    <div className="grid gap-2">
      <span className="text-[13px] font-medium">{human(k)}</span>
      {value.map((v, i) => (
        <div key={i} className={cn("grid gap-3", primitive ? "grid-cols-[1fr_auto] items-start" : "bg-background rounded-xl border p-4")}>
          {!primitive ? (
            <div className="flex items-center justify-between gap-2">
              <span className="text-muted-foreground truncate text-xs font-semibold tracking-wider uppercase">{titleOf(v) || `${human(k)} ${i + 1}`}</span>
              <Controls i={i} n={value.length} move={move} remove={remove} />
            </div>
          ) : null}
          <Node design={design} path={`${path}[${i}]`} k={primitive ? k : String(i)} value={v} sample={sample[i] ?? shape} set={set} library={library} siteId={siteId} bare={!primitive} />
          {primitive ? <Controls i={i} n={value.length} move={move} remove={remove} compact /> : null}
        </div>
      ))}
      {value.length < 24 ? (
        <Button type="button" variant="outline" size="sm" className="justify-self-start" onClick={add}>
          <Plus /> Add
        </Button>
      ) : null}
    </div>
  );
}

function Controls({ i, n, move, remove, compact }: { i: number; n: number; move: (i: number, by: number) => void; remove: (i: number) => void; compact?: boolean }) {
  return (
    <div className="flex gap-0.5">
      {!compact ? (
        <>
          <Button type="button" variant="ghost" size="icon" className="size-8" onClick={() => move(i, -1)} disabled={i === 0} aria-label="Move up">
            <ArrowUp />
          </Button>
          <Button type="button" variant="ghost" size="icon" className="size-8" onClick={() => move(i, 1)} disabled={i === n - 1} aria-label="Move down">
            <ArrowDown />
          </Button>
        </>
      ) : null}
      <Button type="button" variant="ghost" size="icon" className="size-8" onClick={() => remove(i)} aria-label="Remove">
        <Trash2 />
      </Button>
    </div>
  );
}

function Field({ path, k, value, sample, set, library, siteId, design }: { path: string; k: string; value: Json; sample: Json; set: (p: string, v: Json) => void; library: Track[]; siteId: string; design: Design }) {
  const id = React.useId();
  const kind = fieldKind(k, sample === "" ? value : sample);
  const label = /^(\d+|t\d+)$/.test(k) ? "" : human(k);
  const lab = label ? (
    <Label htmlFor={id} className="text-[13px]">
      {label}
    </Label>
  ) : null;
  const v = value === null || value === undefined ? "" : value;

  if (kind === "bool")
    return (
      <div className="flex items-center justify-between gap-3">
        {lab}
        <Switch id={id} checked={!!v} onCheckedChange={(x) => set(path, x)} />
      </div>
    );
  if (kind === "number")
    return (
      <div className="grid gap-1.5">
        {lab}
        <Input id={id} type="number" value={String(v)} onChange={(e) => set(path, e.target.value === "" ? 0 : Number(e.target.value))} />
      </div>
    );
  if (kind === "photo") return <StudioPhoto label={label || "Photo"} value={String(v)} design={design} siteId={siteId} onChange={(x) => set(path, x)} />;
  if (kind === "music") return <StudioMusic label={label || "Music"} value={String(v)} library={library} siteId={siteId} onChange={(x) => set(path, x)} />;
  if (kind === "datetime") {
    const s = String(v);
    const m = /^(\d{4}-\d{2}-\d{2}T\d{2}:\d{2})(?::\d{2})?(.*)$/.exec(s);
    const local = m ? m[1] : "";
    const tz = m ? m[2] : "+05:30";
    return (
      <div className="grid gap-1.5">
        {lab}
        <Input id={id} type="datetime-local" value={local} onChange={(e) => set(path, e.target.value ? `${e.target.value}:00${tz || ""}` : "")} />
      </div>
    );
  }
  if (kind === "date")
    return (
      <div className="grid gap-1.5">
        {lab}
        <Input id={id} type="date" value={String(v)} onChange={(e) => set(path, e.target.value)} />
      </div>
    );
  if (kind === "color")
    return (
      <div className="flex items-center justify-between gap-3">
        {lab}
        <input id={id} type="color" value={String(v).length === 7 ? String(v) : "#000000"} onChange={(e) => set(path, e.target.value)} className="h-9 w-14 cursor-pointer rounded border" />
      </div>
    );
  if (kind === "long")
    return (
      <div className="grid gap-1.5">
        {lab}
        <Textarea id={id} rows={Math.min(6, Math.max(2, Math.ceil(String(v).length / 48)))} value={String(v)} onChange={(e) => set(path, e.target.value)} />
      </div>
    );
  return (
    <div className="grid gap-1.5">
      {lab}
      <Input id={id} type={kind === "url" ? "url" : "text"} inputMode={kind === "url" ? "url" : undefined} value={String(v)} onChange={(e) => set(path, e.target.value)} />
    </div>
  );
}

function StudioPhoto({ label, value, design, siteId, onChange }: { label: string; value: string; design: Design; siteId: string; onChange: (v: string) => void }) {
  const [busy, setBusy] = React.useState(false);
  const [err, setErr] = React.useState("");
  const input = React.useRef<HTMLInputElement>(null);
  const src = !value ? "" : value.startsWith("/") || value.startsWith("http") ? value : designBase(design.id) + value.replace(/^\.\//, "");
  const sample = !!value && !value.startsWith("/api/photos/");
  const pick = async (f?: File) => {
    if (!f) return;
    setBusy(true);
    setErr("");
    try {
      onChange(`/api/photos/${await uploadPhoto(siteId, f)}`);
    } catch (e) {
      setErr((e as Error).message);
    } finally {
      setBusy(false);
      if (input.current) input.current.value = "";
    }
  };
  return (
    <div className="grid gap-1.5">
      <span className="text-[13px] font-medium">{label}</span>
      <div className="flex items-start gap-3">
        <button type="button" onClick={() => input.current?.click()} className="bg-muted hover:bg-accent relative grid aspect-[4/5] w-24 flex-none place-items-center overflow-hidden rounded-lg border border-dashed" aria-label={`Replace ${label.toLowerCase()}`}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          {src ? <img src={src} alt="" className="absolute inset-0 size-full object-cover" /> : <ImagePlus className="text-muted-foreground size-6" aria-hidden />}
          {busy ? (
            <span className="bg-background/70 absolute inset-0 grid place-items-center">
              <Loader2 className="size-5 animate-spin" aria-hidden />
            </span>
          ) : null}
        </button>
        <div className="grid gap-1.5 text-xs">
          {sample ? <span className="bg-clay-soft text-clay-ink w-fit rounded-full px-2 py-0.5 font-medium">Sample</span> : null}
          <button type="button" onClick={() => input.current?.click()} className="text-left font-medium underline underline-offset-4">
            {value ? "Replace with my photo" : "Choose a photo"}
          </button>
          <span className="text-muted-foreground">JPG or PNG, up to 12 MB.</span>
          {err ? <span className="text-destructive">{err}</span> : null}
        </div>
      </div>
      <input ref={input} type="file" accept="image/*" className="sr-only" tabIndex={-1} onChange={(e) => pick(e.target.files?.[0])} />
    </div>
  );
}

function StudioMusic({ label, value, library, siteId, onChange }: { label: string; value: string; library: Track[]; siteId: string; onChange: (v: string) => void }) {
  const [busy, setBusy] = React.useState(false);
  const [err, setErr] = React.useState("");
  const input = React.useRef<HTMLInputElement>(null);
  const own = value.startsWith("/api/build/music/");
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
      onChange(`/api/build/music/${String(j.track).slice(3)}`);
    } catch (e) {
      setErr((e as Error).message);
    } finally {
      setBusy(false);
      if (input.current) input.current.value = "";
    }
  };
  return (
    <div className="grid gap-1.5">
      <span className="text-[13px] font-medium">{label}</span>
      <select value={own ? "__own" : library.some((t) => t.src === value) ? value : value ? "__design" : ""} onChange={(e) => e.target.value !== "__own" && e.target.value !== "__design" && onChange(e.target.value)} className="border-input bg-card h-11 rounded-md border px-3 text-sm">
        <option value="">No music</option>
        {library.map((t) => (
          <option key={t.id} value={t.src}>
            {t.title} · {t.by}
          </option>
        ))}
        {own ? <option value="__own">Your song</option> : null}
        {!own && value && !library.some((t) => t.src === value) ? <option value="__design">The design&apos;s own track</option> : null}
      </select>
      {value ? <audio controls preload="none" src={value.startsWith("/") ? value : undefined} className="h-9 w-full" /> : null}
      <Button type="button" variant="outline" size="sm" className="justify-self-start" onClick={() => input.current?.click()} disabled={busy}>
        {busy ? <Loader2 className="animate-spin" /> : <Upload />} Upload our song
      </Button>
      <p className="text-muted-foreground text-xs">MP3 or M4A, up to 12 MB. Only upload music you have the right to share.</p>
      {err ? <p className="text-destructive text-xs">{err}</p> : null}
      <input ref={input} type="file" accept="audio/mpeg,audio/mp3,audio/mp4,audio/x-m4a,.mp3,.m4a" className="sr-only" tabIndex={-1} onChange={(e) => upload(e.target.files?.[0])} />
    </div>
  );
}
