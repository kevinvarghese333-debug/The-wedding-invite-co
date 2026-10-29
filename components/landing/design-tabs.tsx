"use client";

import { ArrowRight, Check } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AutoVideo } from "@/components/landing/auto-video";
import { EnquireButton } from "@/components/landing/enquiry";

const DESIGNS = [
  {
    id: "story" as const,
    tab: "The Story",
    badge: { text: "Our signature", variant: "clay" as const },
    price: "₹8,490",
    title: "Your how-we-met, told as they scroll",
    body: "A cover that moves, then your story in watercolour chapters before guests reach the date and venues.",
    points: ["A cover like a waltz on sheet music", "Watercolour scenes of the places that matter to you", "Your first photo, developing like a polaroid", "Everything in The Classic"],
    video: "/media/story.mp4",
    poster: "/media/poster-story.jpg",
    label: "Screen recording of The Story invitation: a waltz cover, watercolour chapters, then the date, functions, gallery and RSVP",
    secondary: { href: "#story", text: "See the chapters" },
  },
  {
    id: "classic" as const,
    tab: "The Classic",
    badge: { text: "Elegant and quick", variant: "secondary" as const },
    price: "₹4,999",
    title: "Floral, timeless and straight to the details",
    body: "A wax seal cover that opens onto your video or photo, with everything guests need laid out below.",
    points: ["Wax seal cover with falling petals", "Your video or photo behind your names", "Invitation wording from both families", "Countdown, functions, gallery and RSVP"],
    video: "/media/classic.mp4",
    poster: "/media/poster-classic.jpg",
    label: "Screen recording of The Classic invitation: a floral wax seal cover opening to a video, then the invitation, countdown, functions, gallery and RSVP",
    secondary: { href: "#pricing", text: "Compare packages" },
  },
];

export function DesignTabs() {
  return (
    <Tabs defaultValue="story" className="mt-9 items-center gap-5">
      <TabsList aria-label="Invitation designs">
        {DESIGNS.map((d) => (
          <TabsTrigger key={d.id} value={d.id}>
            {d.tab}
          </TabsTrigger>
        ))}
      </TabsList>
      {DESIGNS.map((d) => (
        <TabsContent key={d.id} value={d.id} className="w-full">
          <Card className="flex-row flex-wrap items-center justify-center gap-[clamp(28px,5vw,64px)] px-[clamp(20px,4vw,48px)] py-[clamp(20px,4vw,48px)]">
            <div className="w-[252px] flex-none rounded-[40px] bg-[#26302A] p-2 shadow-[0_30px_60px_rgba(55,70,60,0.22)]">
              <AutoVideo src={d.video} poster={d.poster} aria-label={d.label} className="h-[510px] w-[236px] rounded-[32px] bg-[#1E140E] object-cover" />
            </div>
            <div className="max-w-[480px] min-w-0 flex-[1_1_320px]">
              <div className="flex flex-wrap gap-2">
                <Badge variant={d.badge.variant}>{d.badge.text}</Badge>
                <Badge variant="outline">{d.price}</Badge>
              </div>
              <h3 className="heading mt-3.5 text-[clamp(30px,3vw,40px)] leading-[1.08]">{d.title}</h3>
              <p className="text-muted-foreground mt-3 leading-relaxed">{d.body}</p>
              <Separator className="my-5" />
              <ul className="grid gap-3 text-[15px]">
                {d.points.map((p) => (
                  <li key={p} className="flex gap-2.5">
                    <Check className="text-sage mt-0.5 size-[18px] flex-none" aria-hidden />
                    {p}
                  </li>
                ))}
              </ul>
              <div className="mt-6 flex flex-wrap gap-2.5">
                <EnquireButton pkg={d.id} origin={`designs-${d.id}`}>
                  Ask about {d.tab} <ArrowRight />
                </EnquireButton>
                <Button variant="outline" asChild>
                  <a href={d.secondary.href}>{d.secondary.text}</a>
                </Button>
              </div>
            </div>
          </Card>
        </TabsContent>
      ))}
    </Tabs>
  );
}
