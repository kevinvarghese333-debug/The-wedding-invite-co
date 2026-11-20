"use client";

import * as React from "react";
import { ImagePlus, Loader2, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

/* Small form pieces for the editor panels. */

export function Group({ title, desc, children, className }: { title: string; desc?: React.ReactNode; children: React.ReactNode; className?: string }) {
  return (
    <section className={cn("grid gap-4 border-b px-5 py-6 last:border-b-0", className)}>
      <div>
        <h3 className="text-[15px] font-semibold">{title}</h3>
        {desc ? <p className="text-muted-foreground mt-1 text-[13px] leading-relaxed">{desc}</p> : null}
      </div>
      {children}
    </section>
  );
}


export function Text({
  label,
  value,
  onChange,
  hint,
  className,
  ...rest
}: { label: string; value: string; onChange: (v: string) => void; hint?: string; className?: string } & Omit<React.ComponentProps<"input">, "value" | "onChange">) {
  const id = React.useId();
  return (
    <div className={cn("grid gap-1.5", className)}>
      <Label htmlFor={id} className="text-[13px]">
        {label}
      </Label>
      <Input id={id} value={value} onChange={(e) => onChange(e.target.value)} {...rest} />
      {hint ? <p className="text-muted-foreground text-xs">{hint}</p> : null}
    </div>
  );
}

export function Area({
  label,
  value,
  onChange,
  hint,
  rows = 3,
  className,
  ...rest
}: { label: string; value: string; onChange: (v: string) => void; hint?: string; rows?: number; className?: string } & Omit<React.ComponentProps<"textarea">, "value" | "onChange">) {
  const id = React.useId();
  return (
    <div className={cn("grid gap-1.5", className)}>
      <Label htmlFor={id} className="text-[13px]">
        {label}
      </Label>
      <Textarea id={id} rows={rows} value={value} onChange={(e) => onChange(e.target.value)} {...rest} />
      {hint ? <p className="text-muted-foreground text-xs">{hint}</p> : null}
    </div>
  );
}

export function Toggle({ label, hint, checked, onChange }: { label: string; hint?: string; checked: boolean; onChange: (v: boolean) => void }) {
  const id = React.useId();
  return (
    <div className="flex items-start justify-between gap-4">
      <label htmlFor={id} className="cursor-pointer text-sm">
        <span className="font-medium">{label}</span>
        {hint ? <span className="text-muted-foreground block text-xs">{hint}</span> : null}
      </label>
      <Switch id={id} checked={checked} onCheckedChange={onChange} />
    </div>
  );
}

export async function uploadPhoto(siteId: string, file: File): Promise<string> {
  const fd = new FormData();
  fd.append("file", file);
  const r = await fetch(`/api/build/sites/${siteId}/photo`, { method: "POST", body: fd });
  const j = await r.json().catch(() => ({}));
  if (!r.ok || !j.ok) throw new Error(j.error || "That photo didn't upload. Please try another.");
  return j.name as string;
}

export const photoUrl = (name: string) => `/api/photos/${name}`;

/** One photo: pick, replace or remove. */
export function PhotoPicker({ siteId, value, onChange, label, aspect = "aspect-[4/5]" }: { siteId: string; value: string; onChange: (v: string) => void; label: string; aspect?: string }) {
  const [busy, setBusy] = React.useState(false);
  const [err, setErr] = React.useState("");
  const input = React.useRef<HTMLInputElement>(null);
  const pick = async (f?: File) => {
    if (!f) return;
    setBusy(true);
    setErr("");
    try {
      onChange(await uploadPhoto(siteId, f));
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
        <button
          type="button"
          onClick={() => input.current?.click()}
          className={cn("bg-muted hover:bg-accent relative grid w-28 flex-none place-items-center overflow-hidden rounded-lg border border-dashed", aspect)}
          aria-label={value ? `Replace ${label.toLowerCase()}` : `Add ${label.toLowerCase()}`}
        >
          {value ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={photoUrl(value)} alt="" className="absolute inset-0 size-full object-cover" />
          ) : (
            <ImagePlus className="text-muted-foreground size-6" aria-hidden />
          )}
          {busy ? (
            <span className="bg-background/70 absolute inset-0 grid place-items-center">
              <Loader2 className="size-5 animate-spin" aria-hidden />
            </span>
          ) : null}
        </button>
        <div className="grid gap-2 text-xs">
          <button type="button" onClick={() => input.current?.click()} className="text-left font-medium underline underline-offset-4">
            {value ? "Replace photo" : "Choose a photo"}
          </button>
          {value ? (
            <button type="button" onClick={() => onChange("")} className="text-muted-foreground text-left underline underline-offset-4">
              Remove
            </button>
          ) : null}
          <span className="text-muted-foreground">JPG or PNG, up to 12 MB.</span>
          {err ? <span className="text-destructive">{err}</span> : null}
        </div>
      </div>
      <input ref={input} type="file" accept="image/*" className="sr-only" tabIndex={-1} onChange={(e) => pick(e.target.files?.[0])} />
    </div>
  );
}

/** Several photos: add many at once, remove, move first. */
export function GalleryPicker({ siteId, value, onChange, max }: { siteId: string; value: string[]; onChange: (v: string[]) => void; max: number }) {
  const [busy, setBusy] = React.useState(0);
  const [err, setErr] = React.useState("");
  const input = React.useRef<HTMLInputElement>(null);
  const latest = React.useRef(value);
  latest.current = value;
  const add = async (files: FileList | null) => {
    if (!files?.length) return;
    const room = max - latest.current.length;
    const list = Array.from(files).slice(0, Math.max(0, room));
    if (!list.length) return setErr(`Up to ${max} photos.`);
    setErr("");
    setBusy(list.length);
    for (const f of list) {
      try {
        const name = await uploadPhoto(siteId, f);
        onChange([...latest.current, name]);
        latest.current = [...latest.current, name];
      } catch (e) {
        setErr((e as Error).message);
      }
      setBusy((b) => b - 1);
    }
    if (input.current) input.current.value = "";
  };
  return (
    <div className="grid gap-2">
      <div className="grid grid-cols-4 gap-2">
        {value.map((p, i) => (
          <div key={p} className="group relative aspect-square overflow-hidden rounded-md border">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={photoUrl(p)} alt="" className="size-full object-cover" />
            <button
              type="button"
              onClick={() => onChange(value.filter((x) => x !== p))}
              aria-label={`Remove photo ${i + 1}`}
              className="bg-background/90 absolute top-1 right-1 grid size-7 place-items-center rounded-full shadow"
            >
              <X className="size-3.5" aria-hidden />
            </button>
            {i > 0 ? (
              <button
                type="button"
                onClick={() => onChange([p, ...value.filter((x) => x !== p)])}
                className="bg-background/90 absolute bottom-1 left-1 rounded-full px-2 py-0.5 text-[10px] font-medium shadow"
              >
                Move first
              </button>
            ) : null}
          </div>
        ))}
        {Array.from({ length: busy }).map((_, i) => (
          <div key={`b${i}`} className="bg-muted grid aspect-square place-items-center rounded-md border">
            <Loader2 className="size-5 animate-spin" aria-hidden />
          </div>
        ))}
        {value.length + busy < max ? (
          <button type="button" onClick={() => input.current?.click()} className="bg-muted hover:bg-accent grid aspect-square place-items-center rounded-md border border-dashed" aria-label="Add photos">
            <ImagePlus className="text-muted-foreground size-5" aria-hidden />
          </button>
        ) : null}
      </div>
      <p className="text-muted-foreground text-xs">
        {value.length} of {max}. You can pick several at once.
      </p>
      {err ? <p className="text-destructive text-xs">{err}</p> : null}
      <input ref={input} type="file" accept="image/*" multiple className="sr-only" tabIndex={-1} onChange={(e) => add(e.target.files)} />
    </div>
  );
}
