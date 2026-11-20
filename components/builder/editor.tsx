"use client";

import * as React from "react";
import Link from "next/link";
import { ArrowLeft, Check, CircleAlert, ExternalLink, Eye, Loader2, Smartphone, Sparkles, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { useBase } from "@/components/builder/base";
import { CouplePanel, EventsPanel, MusicPanel, RsvpPanel, StoryPanel, StylePanel } from "@/components/builder/panels";
import type { InviteData } from "@/lib/builder/types";
import { TEMPLATES, findTemplate, type Template } from "@/lib/builder/templates";
import { renderDocument, renderParts } from "@/lib/builder/render";
import { trackSrc, type Track } from "@/lib/builder/music";
import { allFontsHref } from "@/lib/builder/fonts";

export type EditorSite = {
  id: string;
  template: string;
  paid: boolean;
  status: string;
  slug: string | null;
  liveUrl: string;
  unpublished: boolean;
  contact: { name: string; email: string; phone: string };
  rsvps: number;
};

type Tab = "couple" | "events" | "story" | "style" | "music" | "rsvp";
const TABS: { id: Tab; label: string; goto: string }[] = [
  { id: "couple", label: "Names", goto: "names" },
  { id: "events", label: "Events", goto: "events" },
  { id: "story", label: "Photos", goto: "story" },
  { id: "style", label: "Style", goto: "names" },
  { id: "music", label: "Music", goto: "names" },
  { id: "rsvp", label: "RSVP", goto: "rsvp" },
];

type SaveState = "saved" | "dirty" | "saving" | "error";

export function Editor({ site, initial, library, price, siteUrl, builderUrl }: { site: EditorSite; initial: InviteData; library: Track[]; price: number; siteUrl: string; builderUrl: string }) {
  const base = useBase();
  const [data, setData] = React.useState<InviteData>(initial);
  const [templateId, setTemplateId] = React.useState(site.template);
  const [tab, setTab] = React.useState<Tab>("couple");
  const [save, setSave] = React.useState<SaveState>("saved");
  const [saveError, setSaveError] = React.useState("");
  const [unpublished, setUnpublished] = React.useState(site.unpublished);
  const [publishing, setPublishing] = React.useState(false);
  const [published, setPublished] = React.useState(false);
  const [showPreview, setShowPreview] = React.useState(false);
  const [contact, setContact] = React.useState(site.contact);
  const [contactOpen, setContactOpen] = React.useState(false);
  const [nudge, setNudge] = React.useState(!site.contact.email);

  const t = findTemplate(templateId) ?? TEMPLATES[0];
  const opts = React.useMemo(() => ({ mode: "editor" as const, musicSrc: trackSrc(data.music.track, library), siteUrl, builderUrl }), [data.music.track, library, siteUrl, builderUrl]);

  /* ---------- live preview ---------- */
  const frame = React.useRef<HTMLIFrameElement>(null);
  const [srcDoc] = React.useState(() => renderDocument(t, data, opts));
  const latest = React.useRef({ t, data, opts });
  latest.current = { t, data, opts };
  const post = React.useCallback((msg: Record<string, unknown>) => frame.current?.contentWindow?.postMessage(msg, "*"), []);
  const push = React.useCallback(() => {
    const { t, data, opts } = latest.current;
    post({ type: "wic:update", ...renderParts(t, data, opts) });
  }, [post]);
  React.useEffect(() => {
    const id = setTimeout(push, 60);
    return () => clearTimeout(id);
  }, [data, templateId, push]);

  const goTo = (next: Tab) => {
    setTab(next);
    post({ type: "wic:goto", id: TABS.find((x) => x.id === next)!.goto });
    document.getElementById("editor-panel")?.scrollTo({ top: 0 });
  };

  /* ---------- autosave ---------- */
  const mounted = React.useRef(false);
  const saving = React.useRef<Promise<void> | null>(null);
  const doSave = React.useCallback(async () => {
    const { t, data } = latest.current;
    setSave("saving");
    try {
      const r = await fetch(`/api/build/sites/${site.id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ template: t.id, data }), keepalive: true });
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
  }, [data, templateId, doSave, site.paid]);
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

  const update = React.useCallback((fn: (d: InviteData) => InviteData) => setData((d) => fn(d)), []);
  const switchTemplate = (next: Template) => {
    setTemplateId(next.id);
    setData((d) => ({ ...d, style: { ...next.sample.style, scale: d.style.scale } }));
  };

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

  const names = [data.one, data.two].filter(Boolean).join(" & ") || "Your invitation";
  const saveLabel = save === "saving" ? "Saving…" : save === "dirty" ? "Unsaved" : save === "error" ? "Not saved" : "Saved";

  return (
    <div className="bg-muted flex h-dvh flex-col overflow-hidden">
      <link rel="stylesheet" href={allFontsHref()} />
      {/* top bar */}
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
            <span>{site.paid ? (unpublished ? "Live, with changes not yet published" : "Live") : `${t.name} · draft`}</span>
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
        {/* panel */}
        <div className="bg-card flex w-full min-w-0 flex-col border-r lg:w-[440px] lg:flex-none">
          <nav aria-label="Edit sections" className="flex flex-none gap-0.5 overflow-x-auto border-b px-2 py-2 [scrollbar-width:none]">
            {TABS.map((x) => (
              <button
                key={x.id}
                type="button"
                onClick={() => goTo(x.id)}
                aria-current={tab === x.id ? "page" : undefined}
                className={cn("flex-none rounded-full px-3 py-2 text-sm font-medium whitespace-nowrap transition-colors", tab === x.id ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-accent")}
              >
                {x.label}
              </button>
            ))}
          </nav>
          <div id="editor-panel" className="min-h-0 flex-1 overflow-y-auto pb-28 lg:pb-10">
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
            {tab === "couple" ? <CouplePanel data={data} update={update} siteId={site.id} /> : null}
            {tab === "events" ? <EventsPanel data={data} update={update} siteId={site.id} /> : null}
            {tab === "story" ? <StoryPanel data={data} update={update} siteId={site.id} /> : null}
            {tab === "style" ? <StylePanel data={data} update={update} siteId={site.id} templateId={templateId} setTemplate={switchTemplate} onReplay={() => post({ type: "wic:replay" })} /> : null}
            {tab === "music" ? <MusicPanel data={data} update={update} siteId={site.id} library={library} /> : null}
            {tab === "rsvp" ? <RsvpPanel data={data} update={update} siteId={site.id} rsvpsHref={site.paid ? `${base}/rsvps/${site.id}` : undefined} /> : null}
            <div className="flex justify-between gap-2 px-5 pt-2">
              {TABS.findIndex((x) => x.id === tab) > 0 ? (
                <Button variant="ghost" onClick={() => goTo(TABS[TABS.findIndex((x) => x.id === tab) - 1].id)}>
                  Back
                </Button>
              ) : (
                <span />
              )}
              {TABS.findIndex((x) => x.id === tab) < TABS.length - 1 ? (
                <Button variant="outline" onClick={() => goTo(TABS[TABS.findIndex((x) => x.id === tab) + 1].id)}>
                  Next: {TABS[TABS.findIndex((x) => x.id === tab) + 1].label}
                </Button>
              ) : site.paid ? null : (
                <Button asChild>
                  <Link href={`${base}/publish/${site.id}`} onClick={() => void ensureSaved()}>
                    I&apos;m happy, publish it
                  </Link>
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* preview: beside the panel on wide screens, full screen on phones */}
        <div
          className={cn(
            "flex-1 flex-col items-center justify-center gap-3 p-6",
            showPreview ? "bg-muted fixed inset-0 z-40 flex p-0 lg:static lg:p-6" : "hidden lg:flex"
          )}
        >
          <div className={cn("relative overflow-hidden bg-white shadow-[0_30px_60px_rgba(74,15,22,0.18)]", showPreview ? "h-full w-full lg:h-[min(860px,calc(100dvh-140px))] lg:w-[390px] lg:rounded-[40px] lg:border-[10px] lg:border-[#2a0a0e]" : "h-[min(860px,calc(100dvh-140px))] w-[390px] rounded-[40px] border-[10px] border-[#2a0a0e]")}>
            <iframe ref={frame} srcDoc={srcDoc} onLoad={push} title="Live preview of your invitation" className="size-full border-0" allow="autoplay" />
          </div>
          <p className="text-muted-foreground hidden items-center gap-1.5 text-xs lg:flex">
            <Smartphone className="size-3.5" aria-hidden /> Live preview. Tap around, it works like the real thing.
          </p>
          {showPreview ? (
            <Button className="absolute top-3 right-3 z-50 rounded-full shadow-lg lg:hidden" size="sm" onClick={() => setShowPreview(false)}>
              <X /> Back to editing
            </Button>
          ) : null}
        </div>
      </div>

      {/* phone: open the preview */}
      {!showPreview ? (
        <div className="fixed inset-x-0 bottom-0 z-30 flex gap-2 border-t bg-card/95 p-3 backdrop-blur lg:hidden">
          <Button className="flex-1" size="lg" onClick={() => setShowPreview(true)}>
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

function ContactDialog({
  open,
  onOpenChange,
  siteId,
  initial,
  onSaved,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  siteId: string;
  initial: EditorSite["contact"];
  onSaved: (c: EditorSite["contact"]) => void;
}) {
  const [f, setF] = React.useState(initial);
  const [errors, setErrors] = React.useState<Record<string, string>>({});
  const [busy, setBusy] = React.useState(false);
  const [done, setDone] = React.useState(false);
  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setErrors({});
    const r = await fetch(`/api/build/sites/${siteId}/contact`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(f) });
    const j = await r.json().catch(() => ({}));
    setBusy(false);
    if (!r.ok || !j.ok) return setErrors(j.errors || { form: j.error || "Couldn't save. Please try again." });
    setDone(true);
    onSaved(f);
  };
  return (
    <Dialog open={open} onOpenChange={(o) => (onOpenChange(o), o || setDone(false))}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="heading text-3xl font-medium">{done ? "Saved" : "Save your design"}</DialogTitle>
          <DialogDescription>
            {done ? `We've emailed a link to ${f.email}. Open it on any phone or computer to keep editing.` : "We'll email you a private link, so you can come back to it on any phone or computer. No password needed."}
          </DialogDescription>
        </DialogHeader>
        {done ? (
          <Button onClick={() => onOpenChange(false)}>Keep editing</Button>
        ) : (
          <form onSubmit={submit} className="grid gap-4" noValidate>
            {(
              [
                ["name", "Your name", "text", "name"],
                ["phone", "WhatsApp number", "tel", "tel"],
                ["email", "Email", "email", "email"],
              ] as const
            ).map(([k, label, type, ac]) => (
              <div key={k} className="grid gap-1.5">
                <Label htmlFor={`c-${k}`}>{label}</Label>
                <Input id={`c-${k}`} type={type} autoComplete={ac} value={f[k]} onChange={(e) => setF({ ...f, [k]: e.target.value })} aria-invalid={!!errors[k]} />
                {errors[k] ? <p className="text-destructive text-xs">{errors[k]}</p> : null}
              </div>
            ))}
            {errors.form ? <p className="text-destructive text-sm">{errors.form}</p> : null}
            <p className="text-muted-foreground text-xs">We&apos;ll only use these to send your link and help if you get stuck.</p>
            <Button type="submit" disabled={busy}>
              {busy ? <Loader2 className="animate-spin" /> : null} Email me my link
            </Button>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
