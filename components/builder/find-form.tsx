"use client";

import * as React from "react";
import { Loader2, MailCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function FindForm() {
  const [email, setEmail] = React.useState("");
  const [state, setState] = React.useState<"idle" | "busy" | "sent">("idle");
  const [error, setError] = React.useState("");
  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setState("busy");
    setError("");
    const r = await fetch("/api/build/find", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email }) });
    const j = await r.json().catch(() => ({}));
    if (!r.ok || !j.ok) {
      setState("idle");
      setError(j.error || "Something went wrong. Please try again.");
      return;
    }
    setState("sent");
  };
  if (state === "sent")
    return (
      <div className="bg-card grid justify-items-center gap-2 rounded-xl border p-6 text-center" role="status">
        <MailCheck className="text-clay-ink size-8" aria-hidden />
        <p className="font-semibold">Check your email</p>
        <p className="text-muted-foreground text-sm">If {email} has any designs, the links are on their way. It can take a minute, and sometimes lands in spam.</p>
      </div>
    );
  return (
    <form onSubmit={submit} className="bg-card grid gap-4 rounded-xl border p-6 text-left" noValidate>
      <div className="grid gap-1.5">
        <Label htmlFor="find-email">The email you saved your design with</Label>
        <Input id="find-email" type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} aria-invalid={!!error} />
        {error ? <p className="text-destructive text-xs">{error}</p> : null}
      </div>
      <Button type="submit" disabled={state === "busy"}>
        {state === "busy" ? <Loader2 className="animate-spin" /> : null} Email me my links
      </Button>
    </form>
  );
}
