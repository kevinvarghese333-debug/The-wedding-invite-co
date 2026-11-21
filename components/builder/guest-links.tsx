"use client";

import * as React from "react";
import { Check, Copy, Link2, Loader2, MessageCircle, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import type { GuestLink } from "@/lib/builder/addons";

const IDEAS = [
  { label: "Family", note: "every function" },
  { label: "Friends", note: "a few of the functions" },
  { label: "Office and neighbours", note: "the rest" },
];

export function GuestLinksEditor({
  siteId,
  initial,
  events,
  personal,
  limit,
  liveBase,
  names,
  paid,
  upsell,
}: {
  siteId: string;
  initial: GuestLink[];
  events: string[];
  personal: boolean;
  limit: number;
  liveBase: string; // https://…/i/slug, or "" before the address is chosen
  names: string;
  paid: boolean;
  upsell: React.ReactNode;
}) {
  const [links, setLinks] = React.useState<GuestLink[]>(initial);
  const [state, setState] = React.useState<"saved" | "dirty" | "saving" | "error">("saved");
  const [copied, setCopied] = React.useState("");
  const first = React.useRef(true);
  React.useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    setState("dirty");
    const t = setTimeout(async () => {
      setState("saving");
      const r = await fetch(`/api/build/sites/${siteId}/links`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ links }) }).catch(() => null);
      setState(r?.ok ? "saved" : "error");
    }, 700);
    return () => clearTimeout(t);
  }, [links, siteId]);

  const code = () => Math.random().toString(36).slice(2, 8);
  const add = () => {
    const idea = IDEAS[links.length];
    setLinks((l) => [...l, { code: code(), label: personal ? "" : idea?.label || `Link ${l.length + 1}`, greeting: "", events: [] }]);
  };
  const update = (i: number, patch: Partial<GuestLink>) => setLinks((l) => l.map((x, j) => (j === i ? { ...x, ...patch } : x)));
  const toggle = (i: number, name: string) => {
    const cur = links[i].events.length ? links[i].events : events;
    const next = cur.includes(name) ? cur.filter((e) => e !== name) : [...cur, name];
    update(i, { events: next.length === events.length ? [] : next });
  };
  const url = (l: GuestLink) => (liveBase ? `${liveBase}/${l.code}` : "");
  const copy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(text);
      setTimeout(() => setCopied(""), 1800);
    } catch {}
  };
  const share = (l: GuestLink) => `https://wa.me/?text=${encodeURIComponent(`${l.greeting ? `Dear ${l.greeting}, you` : "You"}'re invited to ${names}'s wedding!\n${url(l)}`)}`;

  return (
    <div className="grid gap-4">
      <p className="text-muted-foreground text-xs" role="status">
        {state === "saving" ? "Saving…" : state === "dirty" ? "Unsaved" : state === "error" ? "Couldn't save. Check your connection." : "Saved"}
        {!paid ? " · Links start working once your invitation is published." : ""}
      </p>
      {links.map((l, i) => {
        const shown = l.events.length ? l.events : events;
        const hidden = events.filter((e) => !shown.includes(e));
        return (
          <Card key={l.code} className="gap-4 p-5">
            <div className="flex items-start justify-between gap-3">
              <div className="grid flex-1 gap-3 sm:grid-cols-2">
                <div className="grid gap-1.5">
                  <Label htmlFor={`l-${l.code}`}>{personal ? "Who is it for? (only you see this)" : "Name of this link (only you see this)"}</Label>
                  <Input id={`l-${l.code}`} value={l.label} maxLength={60} placeholder={personal ? "Sharma family" : IDEAS[i]?.label || "Friends"} onChange={(e) => update(i, { label: e.target.value })} />
                </div>
                {personal ? (
                  <div className="grid gap-1.5">
                    <Label htmlFor={`g-${l.code}`}>Greeting guests see</Label>
                    <div className="flex items-center gap-2">
                      <span className="text-muted-foreground font-serif italic">Dear</span>
                      <Input id={`g-${l.code}`} value={l.greeting} maxLength={60} placeholder="Sharma family" onChange={(e) => update(i, { greeting: e.target.value })} />
                    </div>
                  </div>
                ) : null}
              </div>
              <Button type="button" variant="ghost" size="icon" onClick={() => setLinks((x) => x.filter((_, j) => j !== i))} aria-label={`Remove ${l.label || "this link"}`}>
                <Trash2 />
              </Button>
            </div>
            {events.length ? (
              <div className="grid gap-2">
                <p className="text-sm">
                  {hidden.length ? `Sees ${shown.length} of ${events.length} functions. ${hidden.join(" and ")} ${hidden.length === 1 ? "stays" : "stay"} hidden.` : `Sees all ${events.length} functions.`}
                </p>
                <div className="flex flex-wrap gap-2">
                  {events.map((e) => {
                    const on = shown.includes(e);
                    return (
                      <button
                        key={e}
                        type="button"
                        aria-pressed={on}
                        onClick={() => toggle(i, e)}
                        className={cn("inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-sm font-medium transition", on ? "bg-secondary text-primary" : "text-muted-foreground line-through decoration-1")}
                      >
                        {on ? <Check className="size-3.5" aria-hidden /> : null}
                        {e}
                      </button>
                    );
                  })}
                </div>
              </div>
            ) : (
              <p className="text-muted-foreground text-sm">This design has no list of functions to choose from, so this link shows the whole invitation{personal ? " with the greeting" : ""}.</p>
            )}
            {url(l) ? (
              <div className="bg-muted flex flex-wrap items-center gap-2 rounded-lg border p-2 pl-3">
                <Link2 className="text-muted-foreground size-4" aria-hidden />
                <span className="min-w-0 flex-1 truncate text-sm font-medium">{url(l).replace(/^https?:\/\//, "")}</span>
                <Button type="button" size="sm" variant="outline" onClick={() => copy(url(l))}>
                  {copied === url(l) ? <Check /> : <Copy />} {copied === url(l) ? "Copied" : "Copy"}
                </Button>
                {paid ? (
                  <Button size="sm" variant="outline" asChild>
                    <a href={share(l)} target="_blank" rel="noopener">
                      <MessageCircle /> Send
                    </a>
                  </Button>
                ) : null}
              </div>
            ) : null}
          </Card>
        );
      })}
      {links.length < limit ? (
        <Button type="button" variant="outline" className="justify-self-start" onClick={add}>
          <Plus /> {personal ? "Add a guest" : "Add a link"} <span className="text-muted-foreground">({links.length} of {limit})</span>
        </Button>
      ) : (
        <p className="text-muted-foreground text-sm">You&apos;ve used all {limit} links.</p>
      )}
      {!personal ? upsell : null}
      {state === "saving" ? <Loader2 className="size-4 animate-spin" aria-hidden /> : null}
    </div>
  );
}
