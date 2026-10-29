"use client";

import * as React from "react";
import { CheckCircle2, Loader2, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { NativeSelect } from "@/components/ui/native-select";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { whatsappHref } from "@/lib/whatsapp";

type Pkg = "classic" | "story" | "unsure";
type Ctx = { open: (pkg?: Pkg, origin?: string) => void; whatsapp: string };
const EnquiryContext = React.createContext<Ctx>({ open: () => {}, whatsapp: "" });
export const useEnquiry = () => React.useContext(EnquiryContext);

export function EnquiryProvider({ whatsapp, children }: { whatsapp: string; children: React.ReactNode }) {
  const [state, setState] = React.useState<{ open: boolean; pkg: Pkg; origin: string }>({ open: false, pkg: "unsure", origin: "" });
  const open = React.useCallback((pkg: Pkg = "unsure", origin = "") => setState({ open: true, pkg, origin }), []);
  return (
    <EnquiryContext.Provider value={{ open, whatsapp }}>
      {children}
      <Dialog open={state.open} onOpenChange={(o) => setState((s) => ({ ...s, open: o }))}>
        <DialogContent className="sm:max-w-xl">
          <DialogHeader>
            <DialogTitle className="heading text-3xl font-medium">Plan your invitation</DialogTitle>
            <DialogDescription>Tell us a little about your wedding and we will reply on WhatsApp.</DialogDescription>
          </DialogHeader>
          <EnquiryForm key={`${state.pkg}-${state.origin}-${state.open}`} defaultPackage={state.pkg} origin={state.origin} whatsapp={whatsapp} compact />
        </DialogContent>
      </Dialog>
    </EnquiryContext.Provider>
  );
}

export function EnquireButton({
  pkg = "unsure",
  origin,
  children,
  ...props
}: React.ComponentProps<typeof Button> & { pkg?: Pkg; origin: string }) {
  const { open } = useEnquiry();
  return (
    <Button type="button" onClick={() => open(pkg, origin)} {...props}>
      {children}
    </Button>
  );
}


type Errors = Partial<Record<"name" | "phone" | "email" | "wedding_date" | "form", string>>;

export function EnquiryForm({
  defaultPackage = "unsure",
  origin = "page",
  whatsapp,
  compact = false,
}: {
  defaultPackage?: Pkg;
  origin?: string;
  whatsapp: string;
  compact?: boolean;
}) {
  const [status, setStatus] = React.useState<"idle" | "sending" | "done">("idle");
  const [errors, setErrors] = React.useState<Errors>({});
  const [firstName, setFirstName] = React.useState("");
  const id = React.useId();

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const data = Object.fromEntries(form.entries()) as Record<string, string>;
    const params = new URLSearchParams(window.location.search);
    const utm = ["utm_source", "utm_medium", "utm_campaign"].map((k) => params.get(k)).filter(Boolean).join(" / ");
    data.source = [origin, utm, document.referrer ? `from ${document.referrer}` : ""].filter(Boolean).join(" · ");
    setStatus("sending");
    setErrors({});
    try {
      const res = await fetch("/api/enquiries", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) });
      const json = await res.json().catch(() => ({}));
      if (res.ok && json.ok) {
        setFirstName((data.name || "").split(/[\s&,]+/)[0]);
        setStatus("done");
        return;
      }
      setErrors(json.errors || { form: json.error || "Something went wrong. Please try again or message us on WhatsApp." });
    } catch {
      setErrors({ form: "We couldn't send that. Check your connection, or message us on WhatsApp." });
    }
    setStatus("idle");
  }

  if (status === "done") {
    return (
      <div className="flex flex-col items-center gap-4 py-6 text-center" role="status">
        <CheckCircle2 className="size-12 text-sage" aria-hidden />
        <div>
          <p className="heading text-3xl">Thank you{firstName ? `, ${firstName}` : ""}!</p>
          <p className="text-muted-foreground mt-2 max-w-sm text-sm leading-relaxed">
            We have your enquiry and will reply on WhatsApp soon. Want to start the conversation now?
          </p>
        </div>
        <Button asChild size="lg">
          <a href={whatsappHref(whatsapp, `Hi! I just sent an enquiry on your website${firstName ? ` (${firstName})` : ""}.`)} target="_blank" rel="noopener">
            <MessageCircle /> Chat on WhatsApp
          </a>
        </Button>
      </div>
    );
  }

  const field = (name: keyof Errors) => ({ "aria-invalid": errors[name] ? true : undefined, "aria-describedby": errors[name] ? `${id}-${name}-err` : undefined });
  const err = (name: keyof Errors) =>
    errors[name] ? (
      <p id={`${id}-${name}-err`} className="text-destructive text-[13px]">
        {errors[name]}
      </p>
    ) : null;

  return (
    <form onSubmit={onSubmit} noValidate className="grid gap-4">
      <div className={cn("grid gap-4", !compact && "sm:grid-cols-2")}>
        <div className="grid gap-2">
          <Label htmlFor={`${id}-name`}>Your name(s)</Label>
          <Input id={`${id}-name`} name="name" autoComplete="name" placeholder="Anna & Joel" required {...field("name")} />
          {err("name")}
        </div>
        <div className="grid gap-2">
          <Label htmlFor={`${id}-phone`}>WhatsApp number</Label>
          <Input id={`${id}-phone`} name="phone" type="tel" inputMode="tel" autoComplete="tel" placeholder="+91 98765 43210" required {...field("phone")} />
          {err("phone")}
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="grid gap-2">
          <Label htmlFor={`${id}-date`}>Wedding date</Label>
          <Input id={`${id}-date`} name="wedding_date" type="date" {...field("wedding_date")} />
          {err("wedding_date")}
        </div>
        <div className="grid gap-2">
          <Label htmlFor={`${id}-pkg`}>Package</Label>
          <NativeSelect id={`${id}-pkg`} name="package" defaultValue={defaultPackage}>
            <option value="classic">The Classic</option>
            <option value="story">The Story</option>
            <option value="unsure">Not sure yet</option>
          </NativeSelect>
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="grid gap-2">
          <Label htmlFor={`${id}-fn`}>Number of functions</Label>
          <NativeSelect id={`${id}-fn`} name="functions" defaultValue="">
            <option value="">Choose</option>
            <option>1</option>
            <option>2</option>
            <option>3</option>
            <option>4</option>
            <option>5 or more</option>
          </NativeSelect>
        </div>
        <div className="grid gap-2">
          <Label htmlFor={`${id}-email`}>
            Email <span className="text-muted-foreground font-normal">(optional)</span>
          </Label>
          <Input id={`${id}-email`} name="email" type="email" autoComplete="email" placeholder="you@example.com" {...field("email")} />
          {err("email")}
        </div>
      </div>
      <div className="grid gap-2">
        <Label htmlFor={`${id}-loc`}>
          City or venue <span className="text-muted-foreground font-normal">(optional)</span>
        </Label>
        <Input id={`${id}-loc`} name="location" placeholder="Kochi" />
      </div>
      <div className="grid gap-2">
        <Label htmlFor={`${id}-msg`}>
          Anything else? <span className="text-muted-foreground font-normal">(optional)</span>
        </Label>
        <Textarea id={`${id}-msg`} name="message" rows={3} placeholder="How you met, the look you like, questions for us" />
      </div>
      <div aria-hidden="true" className="absolute -left-[9999px] h-px w-px overflow-hidden">
        <label>
          Website <input type="text" name="website" tabIndex={-1} autoComplete="off" />
        </label>
      </div>
      {errors.form ? (
        <p className="text-destructive text-sm" role="alert">
          {errors.form}
        </p>
      ) : null}
      <div className="flex flex-col gap-3 pt-1 sm:flex-row sm:items-center">
        <Button type="submit" size="lg" disabled={status === "sending"} className="sm:min-w-48">
          {status === "sending" ? <Loader2 className="animate-spin" /> : null}
          {status === "sending" ? "Sending" : "Send enquiry"}
        </Button>
        <p className="text-muted-foreground text-xs leading-relaxed">We only use your details to reply about your invitation.</p>
      </div>
    </form>
  );
}
