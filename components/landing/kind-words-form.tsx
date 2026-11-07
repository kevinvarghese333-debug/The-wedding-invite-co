"use client";

import * as React from "react";
import { Heart, ImagePlus, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export function KindWordsForm() {
  const [status, setStatus] = React.useState<"idle" | "sending" | "done">("idle");
  const [errors, setErrors] = React.useState<Record<string, string>>({});
  const [preview, setPreview] = React.useState<string | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("sending");
    setErrors({});
    try {
      const res = await fetch("/api/kind-words", { method: "POST", body: new FormData(e.currentTarget) });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.ok) return setStatus("done");
      setErrors(data.errors || { form: data.error || "Something went wrong. Please try again." });
    } catch {
      setErrors({ form: "We couldn't send that. Please check your connection and try again." });
    }
    setStatus("idle");
  }

  if (status === "done")
    return (
      <div className="py-6 text-center">
        <Heart className="text-clay-ink mx-auto size-8" aria-hidden />
        <p className="heading mt-4 text-3xl">Thank you!</p>
        <p className="text-muted-foreground mt-2">Your words mean a lot to us. Wishing you both a lifetime of happiness.</p>
      </div>
    );

  const err = (k: string) => (errors[k] ? <p className="text-destructive text-sm">{errors[k]}</p> : null);
  return (
    <form onSubmit={onSubmit} className="grid gap-5" noValidate>
      <div className="grid gap-2">
        <Label htmlFor="kw-names">Your names</Label>
        <Input id="kw-names" name="names" placeholder="Anu & Joel" required aria-invalid={!!errors.names} />
        {err("names")}
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="grid gap-2">
          <Label htmlFor="kw-place">Where was the wedding?</Label>
          <Input id="kw-place" name="place" placeholder="Kochi" />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="kw-month">When?</Label>
          <Input id="kw-month" name="wedding_month" type="month" />
        </div>
      </div>
      <div className="grid gap-2">
        <Label htmlFor="kw-quote">Your words</Label>
        <Textarea id="kw-quote" name="quote" rows={5} placeholder="Our guests kept telling us..." required aria-invalid={!!errors.quote} />
        {err("quote")}
      </div>
      <div className="grid gap-2">
        <Label htmlFor="kw-photo">A photo of the two of you (optional)</Label>
        <label htmlFor="kw-photo" className="hover:bg-muted flex cursor-pointer items-center gap-4 rounded-lg border border-dashed p-3">
          {preview ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={preview} alt="" className="size-16 rounded-md object-cover" />
          ) : (
            <span className="bg-muted grid size-16 place-items-center rounded-md">
              <ImagePlus className="text-muted-foreground size-6" aria-hidden />
            </span>
          )}
          <span className="text-muted-foreground text-sm">{preview ? "Change photo" : "Choose a photo"}</span>
        </label>
        <input
          id="kw-photo"
          name="photo"
          type="file"
          accept="image/*"
          className="sr-only"
          onChange={(e) => {
            const f = e.target.files?.[0];
            setPreview(f ? URL.createObjectURL(f) : null);
          }}
        />
        {err("photo")}
      </div>
      <div className="grid gap-2">
        <Label htmlFor="kw-contact">Phone or email (optional, only for us)</Label>
        <Input id="kw-contact" name="contact" />
      </div>
      <div aria-hidden="true" className="absolute -left-[9999px]">
        <input name="website" tabIndex={-1} autoComplete="off" />
      </div>
      <label className="flex items-start gap-3 text-sm leading-relaxed">
        <input type="checkbox" name="consent" value="yes" className="accent-primary mt-1 size-4" />
        <span>You can show our words, names and photo on The Wedding Invite Co. website and social pages.</span>
      </label>
      {err("consent")}
      {err("form")}
      <Button type="submit" size="lg" disabled={status === "sending"} className="rounded-full">
        {status === "sending" ? <Loader2 className="animate-spin" /> : <Heart />} Send our words
      </Button>
    </form>
  );
}
