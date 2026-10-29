"use client";

import * as React from "react";
import { Globe, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { LeafMark } from "@/components/landing/art";
import { cn } from "@/lib/utils";

const FUNCTIONS = [
  { key: "eng", name: "Engagement", when: "Sat 30 Jan · 5:00 PM" },
  { key: "wed", name: "Holy Matrimony", when: "Sat 6 Feb · 3:00 PM" },
  { key: "rec", name: "Reception", when: "Sat 6 Feb · 6:30 PM" },
];

export function RsvpDemo() {
  const [replies, setReplies] = React.useState<Record<string, string>>({ eng: "yes", wed: "yes", rec: "no" });
  const going = Object.values(replies).some((v) => v === "yes");
  return (
    <Card className="w-full max-w-[440px] gap-0 py-0 shadow-[0_20px_50px_rgba(55,70,60,0.12)]">
      <div className="flex items-start justify-between gap-3 px-5 pt-5 pb-4">
        <div>
          <p className="font-semibold">The Thomas family</p>
          <p className="text-muted-foreground mt-1 text-sm">Anna and Joel&apos;s wedding</p>
        </div>
        <Badge variant="secondary">Sample</Badge>
      </div>
      <Separator />
      <div className="px-5">
        {FUNCTIONS.map((f) => (
          <div key={f.key} className="flex flex-wrap items-center justify-between gap-2.5 border-b py-3.5">
            <div className="min-w-0">
              <p className="text-sm font-semibold">{f.name}</p>
              <p className="text-muted-foreground mt-0.5 text-[13px]">{f.when}</p>
            </div>
            <ToggleGroup
              type="single"
              variant="outline"
              size="sm"
              value={replies[f.key]}
              onValueChange={(v) => v && setReplies((r) => ({ ...r, [f.key]: v }))}
              aria-label={`Reply for ${f.name}`}
            >
              <ToggleGroupItem value="yes" className="px-3">Going</ToggleGroupItem>
              <ToggleGroupItem value="no" className="px-3">Not going</ToggleGroupItem>
            </ToggleGroup>
          </div>
        ))}
      </div>
      <div className="grid gap-2.5 px-5 pt-3.5 text-sm">
        <Row k="Guests coming" v={going ? "4" : "0"} />
        <Row k="Food preference" v="2 veg · 2 non-veg" />
        <Row k="Need a place to stay?" v="Yes, one room" />
      </div>
      <div className="px-5 pt-4 pb-5">
        <Button className="w-full" type="button">Send reply</Button>
      </div>
    </Card>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex justify-between gap-3">
      <span className="text-muted-foreground">{k}</span>
      <span className="font-semibold">{v}</span>
    </div>
  );
}

export function GuestLinksDemo() {
  const [pw, setPw] = React.useState(true);
  const rows = [
    { icon: <Users />, name: "Engagement", link: "annaandjoel.in/family", badge: <Badge variant="clay">Family only</Badge> },
    { icon: <Users />, name: "Madhuram Veppu", link: "annaandjoel.in/groom", badge: <Badge variant="outline">Groom&apos;s side</Badge> },
    { icon: <Globe />, name: "Reception", link: "annaandjoel.in/reception", badge: <Badge variant="secondary">Everyone</Badge> },
  ];
  return (
    <Card className="w-full max-w-[440px] gap-0 py-0 shadow-[0_20px_50px_rgba(55,70,60,0.12)]">
      <div className="px-5 pt-5 pb-4">
        <p className="font-semibold">Guest links</p>
        <p className="text-muted-foreground mt-1 text-sm">Who sees which functions</p>
      </div>
      <Separator />
      <div className="px-5 py-1.5">
        {rows.map((r, i) => (
          <div key={r.name} className={cn("flex items-center gap-3 py-3", i < rows.length - 1 && "border-b")}>
            <span aria-hidden className="bg-card grid size-9 flex-none place-items-center rounded-md border [&_svg]:size-4">{r.icon}</span>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold">{r.name}</p>
              <p className="text-muted-foreground mt-0.5 text-[13px] break-all">{r.link}</p>
            </div>
            {r.badge}
          </div>
        ))}
      </div>
      <Separator />
      <div className="flex items-center justify-between gap-4 px-5 pt-4 pb-5">
        <div>
          <label htmlFor="pw-demo" className="text-sm font-semibold">Password protection</label>
          <p className="text-muted-foreground mt-0.5 text-[13px]">{pw ? "On · guests need the password" : "Off · anyone with the link can open it"}</p>
        </div>
        <Switch id="pw-demo" checked={pw} onCheckedChange={setPw} />
      </div>
    </Card>
  );
}

const SWATCHES = [
  { hex: "#879581", label: "Sage" },
  { hex: "#37463C", label: "Forest" },
  { hex: "#C5A18A", label: "Clay" },
  { hex: "#C98F86", label: "Rose" },
  { hex: "#7F95AD", label: "Dusty blue" },
  { hex: "#B8975A", label: "Antique gold" },
];
const FONTS = [
  { id: "cormorant", label: "Cormorant Garamond", family: "'Cormorant Garamond', Georgia, serif", size: 38 },
  { id: "dmserif", label: "DM Serif Display", family: "'DM Serif Display', Georgia, serif", size: 34 },
  { id: "bodoni", label: "Bodoni Moda", family: "'Bodoni Moda', Georgia, serif", size: 32 },
  { id: "pinyon", label: "Pinyon Script", family: "'Pinyon Script', cursive", size: 38 },
];

export function DesignPicker() {
  const [accent, setAccent] = React.useState(SWATCHES[0].hex);
  const [font, setFont] = React.useState(FONTS[0].id);
  const f = FONTS.find((x) => x.id === font) ?? FONTS[0];
  return (
    <div className="flex flex-wrap items-center gap-7">
      <div className="min-w-0 flex-[1_1_240px]">
        <p className="mb-2 text-[13px] font-medium">Colour</p>
        <div className="flex flex-wrap gap-1" role="group" aria-label="Colour">
          {SWATCHES.map((s) => (
            <button
              key={s.hex}
              type="button"
              aria-label={s.label}
              aria-pressed={accent === s.hex}
              onClick={() => setAccent(s.hex)}
              className="grid size-11 cursor-pointer place-items-center rounded-full"
            >
              <span
                className="block size-7 rounded-full"
                style={{ background: s.hex, boxShadow: accent === s.hex ? "0 0 0 3px #FFFDF9, 0 0 0 5px #37463C" : "inset 0 0 0 1px rgba(55,70,60,.15)" }}
              />
            </button>
          ))}
        </div>
        <p className="mt-3 mb-2 text-[13px] font-medium">Lettering</p>
        <ToggleGroup type="single" variant="outline" value={font} onValueChange={(v) => v && setFont(v)} aria-label="Lettering">
          {FONTS.map((x) => (
            <ToggleGroupItem key={x.id} value={x.id} aria-label={x.label} className="min-w-12 text-xl" style={{ fontFamily: x.family }}>
              Aa
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
      </div>
      <div className="flex min-w-0 flex-[1_1_240px] justify-center">
        <div role="img" aria-label="Sample invitation card for Anna and Joel" className="aspect-[4/5] w-full max-w-[260px] rotate-2 rounded-lg border bg-[#F7F3ED] p-3.5 shadow-[0_20px_44px_rgba(55,70,60,0.14)]">
          <div className="flex h-full flex-col items-center justify-center rounded-[4px] border-[1.5px] p-3.5 text-center" style={{ borderColor: accent }}>
            <LeafMark className="size-10" stroke={accent} strokeWidth={1.3} />
            <p className="mt-2.5 text-[9px] font-medium tracking-[0.26em] text-[#4E5B49] uppercase">The wedding of</p>
            <p className="mt-2 leading-[1.05]" style={{ fontFamily: f.family, fontSize: f.size }}>Anna</p>
            <p className="heading my-0.5 text-[22px] leading-none italic" style={{ color: accent }}>&amp;</p>
            <p className="leading-[1.05]" style={{ fontFamily: f.family, fontSize: f.size }}>Joel</p>
            <p className="mt-2.5 text-[11px] tracking-[0.2em] text-[#4E5B49]">06 · 02 · 2027</p>
          </div>
        </div>
      </div>
    </div>
  );
}
