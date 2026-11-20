"use client";

import * as React from "react";
import Link from "next/link";
import { ArrowLeft, Check, CircleAlert, Copy, ExternalLink, Loader2, Lock, MessageCircle, PartyPopper } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useBase } from "@/components/builder/base";
import { cn } from "@/lib/utils";

type Props = {
  siteId: string;
  names: string;
  price: number;
  host: string; // theweddinginviteco.xyz/i/
  initialSlug: string;
  contact: { name: string; email: string; phone: string };
  paid: boolean;
  liveUrl: string;
  requested: boolean;
  whatsapp: string;
  previewSrc: string;
};

type RzpResponse = { razorpay_payment_id: string; razorpay_order_id: string; razorpay_signature: string };
type RzpOptions = Record<string, unknown> & { handler: (r: RzpResponse) => void; modal?: { ondismiss?: () => void } };
declare global {
  interface Window {
    Razorpay?: new (o: RzpOptions) => { open: () => void; on: (evt: string, cb: (r: { error?: { description?: string } }) => void) => void };
  }
}

function loadCheckout() {
  return new Promise<void>((resolve, reject) => {
    if (window.Razorpay) return resolve();
    const s = document.createElement("script");
    s.src = "https://checkout.razorpay.com/v1/checkout.js";
    s.onload = () => resolve();
    s.onerror = () => reject(new Error("Couldn't load the payment window. Please check your connection."));
    document.body.appendChild(s);
  });
}

const rupee = (n: number) => `₹${n.toLocaleString("en-IN")}`;

export function PublishFlow(p: Props) {
  const base = useBase();
  const [slug, setSlug] = React.useState(p.initialSlug);
  const [slugState, setSlugState] = React.useState<{ ok: boolean; problem?: string; checking?: boolean }>({ ok: true });
  const [f, setF] = React.useState(p.contact);
  const [errors, setErrors] = React.useState<Record<string, string>>({});
  const [stage, setStage] = React.useState<"form" | "paying" | "manual" | "done">(p.paid ? "done" : p.requested ? "manual" : "form");
  const [error, setError] = React.useState("");
  const [url, setUrl] = React.useState(p.liveUrl);
  const [copied, setCopied] = React.useState(false);

  React.useEffect(() => {
    if (stage !== "form") return;
    setSlugState((s) => ({ ...s, checking: true }));
    const id = setTimeout(async () => {
      const r = await fetch(`/api/build/sites/${p.siteId}/slug?s=${encodeURIComponent(slug)}`).catch(() => null);
      const j = r ? await r.json().catch(() => null) : null;
      if (j) setSlugState({ ok: j.ok, problem: j.problem || undefined });
      else setSlugState({ ok: true });
    }, 350);
    return () => clearTimeout(id);
  }, [slug, p.siteId, stage]);

  const pay = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setErrors({});
    setStage("paying");
    const r = await fetch(`/api/build/sites/${p.siteId}/checkout`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ slug, ...f }) });
    const j = await r.json().catch(() => ({}));
    if (!r.ok || !j.ok) {
      setStage("form");
      if (j.errors) setErrors(j.errors);
      setError(j.error || (j.errors ? "Please check the highlighted fields." : "Something went wrong. Please try again."));
      return;
    }
    if (j.paid) {
      setUrl(j.url);
      setStage("done");
      return;
    }
    setUrl(j.url);
    if (j.mode === "manual") {
      setStage("manual");
      return;
    }
    try {
      await loadCheckout();
    } catch (err) {
      setStage("form");
      setError((err as Error).message);
      return;
    }
    const rzp = new window.Razorpay!({
      key: j.key,
      amount: j.amount,
      currency: j.currency,
      name: j.name,
      description: j.description,
      order_id: j.orderId,
      prefill: j.prefill,
      theme: { color: "#6B1420" },
      handler: async (resp: RzpResponse) => {
        const v = await fetch(`/api/build/sites/${p.siteId}/verify`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(resp) });
        const vj = await v.json().catch(() => ({}));
        if (v.ok && vj.ok) {
          setUrl(vj.url || j.url);
          setStage("done");
        } else {
          setStage("form");
          setError(vj.error || "We couldn't confirm the payment. If money was taken, message us on WhatsApp and we'll publish it right away.");
        }
      },
      modal: { ondismiss: () => setStage((s) => (s === "paying" ? "form" : s)) },
    });
    rzp.on("payment.failed", (resp) => {
      setError(resp.error?.description || "The payment didn't go through. You can try again.");
    });
    rzp.open();
  };

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {}
  };

  const share = `https://wa.me/?text=${encodeURIComponent(`You're invited! ${p.names}\n${url}`)}`;
  const askUs = `https://wa.me/${p.whatsapp}?text=${encodeURIComponent(`Hi! I've made my invitation in the builder and would like to publish it.\n${p.names}\n${url}\nRef: ${p.siteId}`)}`;

  return (
    <div className="mx-auto grid max-w-5xl gap-8 px-4 py-8 sm:px-6 lg:grid-cols-[1fr_340px] lg:py-12">
      <div className="grid content-start gap-6">
        <Link href={`${base}/edit/${p.siteId}`} className="text-muted-foreground inline-flex items-center gap-1.5 text-sm font-medium hover:underline">
          <ArrowLeft className="size-4" /> Back to editing
        </Link>

        {stage === "done" ? (
          <Card className="gap-5 p-7">
            <PartyPopper className="text-clay-ink size-9" aria-hidden />
            <div>
              <h1 className="heading text-4xl">Your invitation is live.</h1>
              <p className="text-muted-foreground mt-2">Send this link to your guests. Their replies come to you, and you can keep editing until the wedding.</p>
            </div>
            <div className="bg-muted flex items-center gap-2 rounded-lg border p-2 pl-3">
              <span className="min-w-0 flex-1 truncate font-medium">{url.replace(/^https?:\/\//, "")}</span>
              <Button size="sm" variant="outline" onClick={copy}>
                {copied ? <Check /> : <Copy />} {copied ? "Copied" : "Copy"}
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button asChild>
                <a href={share} target="_blank" rel="noopener">
                  <MessageCircle /> Share on WhatsApp
                </a>
              </Button>
              <Button variant="outline" asChild>
                <a href={url} target="_blank" rel="noopener">
                  <ExternalLink /> Open it
                </a>
              </Button>
              <Button variant="outline" asChild>
                <Link href={`${base}/rsvps/${p.siteId}`}>See replies</Link>
              </Button>
            </div>
            <p className="text-muted-foreground text-sm">We&apos;ve emailed you the link and a receipt.</p>
          </Card>
        ) : stage === "manual" ? (
          <Card className="gap-5 p-7">
            <div>
              <h1 className="heading text-4xl">Almost there.</h1>
              <p className="text-muted-foreground mt-2">
                Pay {rupee(p.price)} by UPI or bank transfer and send us the screenshot on WhatsApp. We publish it as soon as it arrives, usually within the hour, and email you when it&apos;s live.
              </p>
            </div>
            <div className="bg-muted rounded-lg border p-4 text-sm">
              <p className="font-medium">Your link will be</p>
              <p className="mt-1 break-all">{url.replace(/^https?:\/\//, "")}</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button asChild>
                <a href={askUs} target="_blank" rel="noopener">
                  <MessageCircle /> Pay on WhatsApp
                </a>
              </Button>
              <Button variant="outline" onClick={() => setStage("form")}>
                Change the link
              </Button>
            </div>
          </Card>
        ) : (
          <form onSubmit={pay} className="grid gap-6" noValidate>
            <div>
              <h1 className="heading text-[clamp(36px,5vw,52px)] leading-[1.02]">Publish your invitation</h1>
              <p className="text-muted-foreground mt-2">Choose your link, leave your details for the receipt, and pay once. It goes live straight away.</p>
            </div>
            <Card className="gap-4 p-6">
              <h2 className="font-semibold">1. Your link</h2>
              <div className="grid gap-1.5">
                <Label htmlFor="slug">The address guests open</Label>
                <div className={cn("bg-card focus-within:ring-ring/50 flex items-center overflow-hidden rounded-md border focus-within:ring-[3px]", (errors.slug || !slugState.ok) && "border-destructive")}>
                  <span className="text-muted-foreground bg-muted flex h-11 items-center border-r px-3 text-sm whitespace-nowrap">{p.host}</span>
                  <input
                    id="slug"
                    value={slug}
                    onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "-").replace(/-{2,}/g, "-").slice(0, 40))}
                    className="h-11 min-w-0 flex-1 bg-transparent px-3 text-base outline-none md:text-sm"
                    autoCapitalize="none"
                    autoCorrect="off"
                    spellCheck={false}
                    aria-describedby="slug-msg"
                  />
                </div>
                <p id="slug-msg" className={cn("flex items-center gap-1.5 text-xs", slugState.ok && !errors.slug ? "text-[#2F4A2E]" : "text-destructive")} role="status">
                  {slugState.checking ? (
                    <Loader2 className="size-3 animate-spin" />
                  ) : slugState.ok && !errors.slug ? (
                    <>
                      <Check className="size-3" /> Available
                    </>
                  ) : (
                    <>
                      <CircleAlert className="size-3" /> {errors.slug || slugState.problem}
                    </>
                  )}
                </p>
              </div>
            </Card>
            <Card className="gap-4 p-6">
              <h2 className="font-semibold">2. Your details</h2>
              {(
                [
                  ["name", "Your name", "text", "name"],
                  ["phone", "WhatsApp number", "tel", "tel"],
                  ["email", "Email, for the receipt and your link", "email", "email"],
                ] as const
              ).map(([k, label, type, ac]) => (
                <div key={k} className="grid gap-1.5">
                  <Label htmlFor={`p-${k}`}>{label}</Label>
                  <Input id={`p-${k}`} type={type} autoComplete={ac} value={f[k]} onChange={(e) => setF({ ...f, [k]: e.target.value })} aria-invalid={!!errors[k]} />
                  {errors[k] ? <p className="text-destructive text-xs">{errors[k]}</p> : null}
                </div>
              ))}
            </Card>
            <Card className="gap-4 p-6">
              <h2 className="font-semibold">3. Pay and publish</h2>
              {error ? (
                <p role="alert" className="bg-destructive/10 text-destructive rounded-lg px-3 py-2 text-sm">
                  {error}
                </p>
              ) : null}
              <Button type="submit" size="lg" disabled={stage === "paying" || !slugState.ok}>
                {stage === "paying" ? <Loader2 className="animate-spin" /> : <Lock />} Pay {rupee(p.price)} and publish
              </Button>
              <p className="text-muted-foreground text-xs">UPI, cards and net banking through Razorpay. One-time payment, no subscription.</p>
            </Card>
          </form>
        )}
      </div>

      <aside className="grid content-start gap-4">
        <div className="mx-auto h-[520px] w-[270px] overflow-hidden rounded-[36px] border-[9px] border-[#2a0a0e] bg-white shadow-[0_24px_50px_rgba(74,15,22,0.18)]">
          <iframe src={p.previewSrc} title={`Preview of ${p.names}`} className="pointer-events-none h-[740px] w-[384px] origin-top-left scale-[0.656] border-0" tabIndex={-1} />
        </div>
        <Card className="gap-3 p-5 text-sm">
          <p className="font-semibold">{p.names}</p>
          <ul className="grid gap-2">
            {["Live straight after payment", "Edit any time until the wedding", "RSVP list you can download", "Hidden from Google, open to anyone with the link"].map((t) => (
              <li key={t} className="flex gap-2">
                <Check className="text-sage mt-0.5 size-4 flex-none" strokeWidth={2.4} aria-hidden />
                {t}
              </li>
            ))}
          </ul>
          <p className="mt-1 flex items-baseline justify-between border-t pt-3">
            <span>Total</span>
            <span className="heading text-2xl font-semibold lining-nums">{rupee(p.price)}</span>
          </p>
        </Card>
      </aside>
    </div>
  );
}
