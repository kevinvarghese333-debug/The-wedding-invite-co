import {
  ArrowRight,
  CalendarPlus,
  Check,
  ClipboardCheck,
  Clock,
  Globe,
  Images,
  Link2,
  Lock,
  Mail,
  MapPin,
  MessageCircle,
  Palette,
  QrCode,
  Sparkles,
  Timer,
} from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Logo, RouteMap, Sprig } from "@/components/landing/art";
import { CountdownTiles } from "@/components/landing/countdown";
import { DesignPicker, GuestLinksDemo, RsvpDemo } from "@/components/landing/demos";
import { DesignTabs } from "@/components/landing/design-tabs";
import { EnquireButton, EnquiryForm, EnquiryProvider } from "@/components/landing/enquiry";
import { whatsappHref } from "@/lib/whatsapp";
import { SampleInvite } from "@/components/landing/sample-invite";
import { publicWhatsApp, STUDIO } from "@/lib/config";

export const dynamic = "force-dynamic";

const CHAPTERS = [
  { img: "/media/sc-church.jpg", alt: "Watercolour of Don Bosco Church, North Paravur", text: "Every day, the bells rang at Don Bosco Church." },
  { img: "/media/sc-altar.jpg", alt: "Watercolour of Rosheel standing in the aisle facing the altar", text: "He came for Mass, praying quietly before the altar." },
  { img: "/media/sc-choir.jpg", alt: "Watercolour of Keerthy singing in the church choir", text: "And in the choir, she sang." },
  { img: "/media/sc-london.jpg", alt: "Illustration of London with Big Ben and the London Eye", text: "He flew to London, chasing his dreams." },
  { img: "/media/sc-ca.jpg", alt: "Illustration of a study desk with a Chartered Accountant certificate", text: "She became a Chartered Accountant." },
  { img: "/media/sc-cafe.jpg", alt: "Illustration of a coffee shop table with two coffees", text: "Years later, over two coffees, their paths finally crossed." },
  { img: "/media/sc-polaroid.jpg", alt: "Polaroid of Keerthy and Rosheel's first photo together", text: "Their very first photo, developing as you watch." },
];

const COLLAGE = [
  [["ph-g1", "aspect-[3/4]"], ["ph-p6", "aspect-[3/4]"]],
  [["ph-p3", "aspect-square"], ["ph-p11", "aspect-[3/4]"]],
  [["ph-g4", "aspect-[3/4]"], ["ph-p2", "aspect-square"]],
  [["ph-p12", "aspect-[3/4]"], ["ph-p9", "aspect-[3/4]"]],
  [["ph-p4", "aspect-square"], ["ph-g5", "aspect-[3/4]"]],
];

const CLASSIC_POINTS = [
  "Wax seal cover with falling petals",
  "Your photos, video and song",
  "Every function with maps, calendar and timings",
  "Live countdown to the day",
  "RSVP for each function, with your own questions",
  "A separate link for each guest list",
  "Password protection and a QR code for cards",
  "WhatsApp preview with your names",
];
const STORY_POINTS = [
  "A moving cover designed for you",
  "Watercolour chapters of how you met",
  "Polaroid reveal of your first photo",
  "Bride's side and groom's side versions",
  "Save-the-date and thank-you pages",
];
const ADDONS = ["Your own web address", "Malayalam or bilingual wording", "Extra story chapters", "Save-the-date and thank-you pages for The Classic"];

const FAQ = [
  ["Do our guests need to download anything?", "No. It opens in the browser on any phone, straight from WhatsApp. Grandparents included."],
  ["Can different guests see different functions?", "Yes. We make a separate link for each guest list, so office friends see the reception while close family sees everything. Each link has its own RSVP choices and its own WhatsApp preview."],
  ["Can we keep it private?", "Yes. Add a password and only the guests you share it with can open the invitation."],
  ["We're printing cards too. Can they link to it?", "Yes. You get a QR code to print on your cards. Guests scan it and land on the invitation with maps and RSVP."],
  ["How do the RSVPs reach us?", "On a private page only you can open. See headcounts, read guests' notes and answers, filter by link and download everything to Excel for the caterer."],
  ["What if something changes after we send it?", "Tell us and we update it. Guests keep the same link, so they always see the latest time and venue."],
  ["What do you need from us?", "Your names and your parents' names, each function with its time and venue, your photos or a video, and the song you love. For The Story, a few lines on how you met."],
  ["How early should we start?", "As soon as your dates and venues are fixed. Message us your first function date and we'll tell you honestly what we can do in that time."],
];

function SectionHead({ badge, title, accent, sub, center = true }: { badge: string; title: string; accent: string; sub?: string; center?: boolean }) {
  return (
    <div className={center ? "mx-auto max-w-[760px] text-center" : "max-w-[700px]"}>
      <Badge variant="outline">{badge}</Badge>
      <h2 className="heading mt-4 text-[clamp(40px,5vw,64px)] leading-[1.02] text-balance">
        {title} <em className="text-clay-ink font-normal">{accent}</em>
      </h2>
      {sub ? <p className="text-muted-foreground mt-4 text-[17px] leading-relaxed">{sub}</p> : null}
    </div>
  );
}

function IconBox({ children }: { children: React.ReactNode }) {
  return <span aria-hidden className="bg-card grid size-10 flex-none place-items-center rounded-md border [&_svg]:size-[18px]">{children}</span>;
}

function Checklist({ items, first }: { items: string[]; first?: React.ReactNode }) {
  return (
    <ul className="grid flex-1 gap-3 text-sm">
      {first}
      {items.map((p) => (
        <li key={p} className="flex gap-2.5">
          <Check className="text-sage mt-0.5 size-4 flex-none" strokeWidth={2.4} aria-hidden />
          {p}
        </li>
      ))}
    </ul>
  );
}

export default function Home() {
  const wa = publicWhatsApp();
  const chat = whatsappHref(wa, "Hi! We would like a wedding invitation website. Our first function is on ");
  const wrap = "mx-auto w-full max-w-[1200px] px-[clamp(16px,5vw,40px)]";

  return (
    <EnquiryProvider whatsapp={wa}>
      {/* Announcement */}
      <div className="bg-primary text-primary-foreground px-4 py-2.5 text-center text-[13px]">
        <a href="#pricing" className="inline-flex flex-wrap items-center justify-center gap-2">
          <Badge className="bg-clay text-clay-foreground">Launch offer</Badge>
          <span>
            The Story invitation at ₹8,490<span className="max-sm:hidden">, down from ₹9,999</span>
          </span>
          <span className="inline-flex items-center gap-1 underline underline-offset-3">
            See packages <ArrowRight className="size-3.5" aria-hidden />
          </span>
        </a>
      </div>

      {/* Header */}
      <header className="sticky top-0 z-40 border-b bg-[#F7F3ED]/90 backdrop-blur-md backdrop-saturate-150">
        <nav aria-label="Main" className={`${wrap} flex h-16 items-center justify-between gap-4`}>
          <div className="flex items-center gap-7">
            <a href="#top" aria-label={`${STUDIO} home`}>
              <Logo name={STUDIO} />
            </a>
            <div className="hidden items-center gap-1 lg:flex">
              {[
                ["#designs", "Designs"],
                ["#features", "Features"],
                ["#pricing", "Packages"],
                ["#faq", "FAQ"],
              ].map(([href, label]) => (
                <Button key={href} variant="ghost" size="sm" asChild className="text-muted-foreground">
                  <a href={href}>{label}</a>
                </Button>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" asChild className="max-md:hidden">
              <a href={chat} target="_blank" rel="noopener">
                <MessageCircle /> WhatsApp
              </a>
            </Button>
            <EnquireButton size="sm" origin="header">
              Plan yours
            </EnquireButton>
          </div>
        </nav>
      </header>

      <main>
        {/* Hero */}
        <section id="top" aria-labelledby="hero-h" className="relative overflow-hidden">
          <div className={`${wrap} pt-[clamp(48px,7vw,88px)] text-center`}>
            <a href="#pricing" className="rise bg-card inline-flex h-9 items-center gap-2.5 rounded-full border py-0 pr-3 pl-1 text-[13px] font-medium shadow-xs">
              <Badge variant="secondary" className="rounded-full">New</Badge>
              Packages from ₹4,999
              <ArrowRight className="size-3.5" aria-hidden />
            </a>
            <h1 id="hero-h" className="rise d1 heading mx-auto mt-6 max-w-[980px] text-[clamp(54px,8.6vw,120px)] leading-[0.95] tracking-[-0.02em]">
              More than an <em className="text-clay-ink font-normal">invitation.</em>
            </h1>
            <p className="rise d2 text-muted-foreground mx-auto mt-6 max-w-[580px] text-[clamp(16px,1.3vw,18px)] leading-relaxed">
              Discover designs, create your invitation, and bring every wedding detail together. Your story, every function, maps and RSVPs in one link. We design it, you send it on WhatsApp.
            </p>
            <div className="rise d3 mt-8 flex flex-wrap justify-center gap-2.5">
              <EnquireButton size="lg" origin="hero">
                Plan your invitation <ArrowRight />
              </EnquireButton>
              <Button size="lg" variant="outline" asChild>
                <a href="#designs">See the designs</a>
              </Button>
            </div>
          </div>

          <div className="arc" role="group" aria-label="Photos from a real invitation and a sample invitation to try">
            {/* eslint-disable @next/next/no-img-element */}
            <img className="arc-far h-[420px] w-[210px] rounded-[18px] border object-cover" style={{ transform: "perspective(1100px) rotateY(32deg)" }} src="/media/ph-g2.jpg" alt="" />
            <img className="arc-mid h-[360px] w-[200px] rounded-[18px] border object-cover" style={{ transform: "perspective(1100px) rotateY(22deg)" }} src="/media/ph-p1.jpg" alt="" />
            <img className="arc-near h-[310px] w-[190px] rounded-[18px] border object-cover" style={{ transform: "perspective(1100px) rotateY(12deg)" }} src="/media/ph-p5.jpg" alt="" />
            <div className="flex flex-col items-center gap-3.5">
              <SampleInvite />
              <Badge variant="outline">Sample invitation · Tap the seal</Badge>
            </div>
            <img className="arc-near h-[310px] w-[190px] rounded-[18px] border object-cover" style={{ transform: "perspective(1100px) rotateY(-12deg)" }} src="/media/ph-p8.jpg" alt="" />
            <img className="arc-mid h-[360px] w-[200px] rounded-[18px] border object-cover" style={{ transform: "perspective(1100px) rotateY(-22deg)" }} src="/media/ph-g3.jpg" alt="" />
            <img className="arc-far h-[420px] w-[210px] rounded-[18px] border object-cover" style={{ transform: "perspective(1100px) rotateY(-32deg)" }} src="/media/ph-poster.jpg" alt="" />
          </div>

          <div className={`${wrap} pb-[clamp(64px,8vw,104px)]`}>
            <div className="grid gap-4 md:grid-cols-3">
              {[
                [<Link2 key="i" />, "A link for every guest list", "Each family's guests see only the functions they're invited to."],
                [<ClipboardCheck key="i" />, "Replies straight to you", "Headcounts for every function, ready to download to Excel."],
                [<Sparkles key="i" />, "Designed for the two of you", "Tell us about your wedding. We write it, design it and set it all up."],
              ].map(([icon, t, d]) => (
                <Card key={t as string} className="flex-row items-start gap-3.5 p-5">
                  <IconBox>{icon}</IconBox>
                  <div>
                    <h2 className="text-[15px] font-semibold">{t}</h2>
                    <p className="text-muted-foreground mt-1.5 text-sm leading-relaxed">{d}</p>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Where it started */}
        <section aria-labelledby="origin-h" className="bg-muted border-y py-[clamp(72px,9vw,120px)]">
          <div className={`${wrap} flex flex-wrap items-center gap-[clamp(40px,6vw,80px)]`}>
            <div className="relative mx-auto max-w-[460px] flex-[1_1_340px]">
              <img src="/media/real-hero.jpg" alt="Keerthy and Rosheel holding hands on the beach at sunset" className="aspect-[3/4] w-full rounded-t-full rounded-b-2xl border object-cover" />
              <img src="/media/sc-polaroid.jpg" alt="Polaroid of Keerthy and Rosheel's first photo together" className="absolute -right-[4%] -bottom-[6%] aspect-[4/5] w-[46%] rotate-[4deg] rounded-lg object-cover shadow-[0_20px_40px_rgba(55,70,60,0.22)]" />
            </div>
            <div className="min-w-0 flex-[1_1_460px]">
              <Badge variant="outline">Where it started</Badge>
              <h2 id="origin-h" className="heading mt-4 text-[clamp(38px,4.6vw,60px)] leading-[1.02]">
                We made the first one for <em className="text-clay-ink font-normal">my sister&apos;s wedding.</em>
              </h2>
              <p className="text-muted-foreground mt-5 text-[17px] leading-[1.7]">
                Keerthy and Rosheel had four functions across North Paravur and Nedumbassery, a bride&apos;s side and a groom&apos;s side, and guests invited to different days. A printed card couldn&apos;t hold all of that, and a PDF on WhatsApp felt like a circular.
              </p>
              <p className="text-muted-foreground mt-3.5 text-[17px] leading-[1.7]">
                So we built one invitation with their story, every venue and a way to reply. Each family sent links that showed only the functions their guests were invited to. That invitation became {STUDIO}
              </p>
              <dl className="mt-8 grid grid-cols-2 gap-2.5 sm:grid-cols-4">
                {[
                  ["Functions", "4"],
                  ["Families", "2"],
                  ["Guest links", "8"],
                  ["RSVP list", "1"],
                ].map(([k, v]) => (
                  <Card key={k} className="gap-0 p-4">
                    <dt className="text-muted-foreground text-[13px]">{k}</dt>
                    <dd className="heading mt-1.5 text-[38px] leading-none font-semibold">{v}</dd>
                  </Card>
                ))}
              </dl>
              <p className="heading text-muted-foreground mt-5 text-[19px] italic">Kevin Varghese, founder</p>
            </div>
          </div>
        </section>

        {/* Designs */}
        <section id="designs" aria-labelledby="designs-h" className="py-[clamp(72px,9vw,120px)]">
          <div className={wrap}>
            <div className="mx-auto max-w-[700px] text-center">
              <Badge variant="outline">Two designs</Badge>
              <h2 id="designs-h" className="heading mt-4 text-[clamp(40px,5vw,64px)] leading-[1.02]">
                Choose how it <em className="text-clay-ink font-normal">unfolds.</em>
              </h2>
              <p className="text-muted-foreground mt-4 text-[17px] leading-relaxed">Both are screen recordings of Keerthy and Rosheel&apos;s real invitation.</p>
            </div>
            <DesignTabs />
          </div>
        </section>

        {/* Story chapters */}
        <section id="story" aria-labelledby="story-h" className="bg-primary text-primary-foreground py-[clamp(72px,9vw,120px)]">
          <div className={`${wrap} flex flex-wrap items-end justify-between gap-6`}>
            <div className="max-w-[700px] flex-[1_1_520px]">
              <Badge className="border-[#f7f3ed33] bg-[#f7f3ed1a] text-[#F7F3ED]">The Story, chapter by chapter</Badge>
              <h2 id="story-h" className="heading mt-4 text-[clamp(40px,5vw,64px)] leading-[1.02]">
                Your love story, <em className="font-normal text-[#DDBFAA]">in watercolour.</em>
              </h2>
              <p className="mt-4 text-[17px] leading-[1.7] text-[#D9D8C8]">
                Tell us how you met. We turn the church, the city, the coffee shop and the first photo into scenes your guests scroll through before they reach the date. These chapters are from Keerthy and Rosheel&apos;s invitation.
              </p>
            </div>
            <p className="flex items-center gap-2 text-[13px] font-medium text-[#B9C2B3]">
              Scroll sideways <ArrowRight className="size-[18px]" aria-hidden />
            </p>
          </div>
          <div className="strip mt-11 flex gap-4 overflow-x-auto px-[max(16px,calc((100vw-1200px)/2+40px))] pt-1 pb-6">
            {CHAPTERS.map((c, i) => (
              <figure key={c.img} className="bg-forest-2 m-0 w-[clamp(230px,24vw,288px)] flex-none rounded-2xl border border-[#f7f3ed1a] p-2">
                <img src={c.img} alt={c.alt} loading="lazy" className="aspect-[4/5] w-full rounded-[10px] object-cover" />
                <figcaption className="px-2 pt-3.5 pb-2">
                  <Badge className="bg-[#f7f3ed1a] text-[#DDBFAA]">{String(i + 1).padStart(2, "0")}</Badge>
                  <span className="heading mt-2.5 block text-xl leading-snug font-normal italic">{c.text}</span>
                </figcaption>
              </figure>
            ))}
          </div>
        </section>

        {/* Features */}
        <section id="features" aria-labelledby="features-h" className="py-[clamp(72px,9vw,120px)]">
          <div className={wrap}>
            <div className="mx-auto max-w-[780px] text-center">
              <Badge variant="outline">In every invitation</Badge>
              <h2 id="features-h" className="heading mt-4 text-[clamp(40px,5vw,64px)] leading-[1.02] text-balance">
                Every question your guests ask, <em className="text-clay-ink font-normal">answered in one link.</em>
              </h2>
            </div>

            {/* Gallery */}
            <div className="mt-[clamp(52px,7vw,80px)] flex flex-wrap items-center gap-[clamp(32px,6vw,72px)]">
              <div className="grid min-w-0 flex-[1_1_520px] grid-cols-3 items-start gap-2.5 md:grid-cols-5">
                {COLLAGE.map((col, i) => (
                  <div key={i} className={`flex flex-col gap-2.5 ${i % 2 ? "mt-5 md:mt-10" : ""} ${i > 2 ? "max-md:hidden" : ""}`}>
                    {col.map(([src, ratio]) => (
                      <img key={src} src={`/media/${src}.jpg`} alt="" loading="lazy" className={`${ratio} w-full rounded-[10px] border object-cover`} />
                    ))}
                  </div>
                ))}
              </div>
              <div className="max-w-[440px] min-w-0 flex-[1_1_320px]">
                <IconBox><Images /></IconBox>
                <h3 className="heading mt-4 text-[clamp(30px,3vw,40px)] leading-[1.08]">Share your love story in a photo gallery</h3>
                <p className="text-muted-foreground mt-3.5 leading-[1.7]">Your photos and video in a gallery made for phones, with the song you pick playing softly as guests open it.</p>
                <EnquireButton variant="outline" origin="gallery" className="mt-6">
                  Plan yours <ArrowRight />
                </EnquireButton>
              </div>
            </div>

            {/* RSVP */}
            <div className="mt-[clamp(72px,9vw,112px)] flex flex-wrap items-center gap-[clamp(32px,6vw,72px)]">
              <div className="max-w-[440px] min-w-0 flex-[1_1_320px]">
                <IconBox><ClipboardCheck /></IconBox>
                <h3 className="heading mt-4 text-[clamp(30px,3vw,40px)] leading-[1.08]">An RSVP for every function</h3>
                <p className="text-muted-foreground mt-3.5 leading-[1.7]">
                  Guests reply to each function separately, tell you how many are coming and answer your own questions, from food preference to whether they need a place to stay. Try the sample.
                </p>
                <p className="text-muted-foreground mt-3 leading-[1.7]">Every reply lands on a private page with headcounts by function, ready to download to Excel.</p>
              </div>
              <div className="flex min-w-0 flex-[1_1_400px] justify-center">
                <RsvpDemo />
              </div>
            </div>

            {/* Guest links */}
            <div className="mt-[clamp(72px,9vw,112px)] flex flex-wrap-reverse items-center gap-[clamp(32px,6vw,72px)]">
              <div className="flex min-w-0 flex-[1_1_400px] justify-center">
                <GuestLinksDemo />
              </div>
              <div className="max-w-[440px] min-w-0 flex-[1_1_320px]">
                <IconBox><Lock /></IconBox>
                <h3 className="heading mt-4 text-[clamp(30px,3vw,40px)] leading-[1.08]">Choose what each guest sees</h3>
                <p className="text-muted-foreground mt-3.5 leading-[1.7]">
                  A private engagement? A reception for the whole office? Each guest list gets its own link showing only their functions, with its own RSVP choices and WhatsApp preview.
                </p>
                <p className="text-muted-foreground mt-3 leading-[1.7]">Want it fully private? Turn on a password, so only the guests you share it with can open it.</p>
              </div>
            </div>

            {/* Directions */}
            <Card className="bg-muted mt-[clamp(72px,9vw,112px)] flex-row flex-wrap items-center gap-[clamp(28px,5vw,64px)] p-[clamp(24px,4vw,48px)]">
              <div className="max-w-[440px] min-w-0 flex-[1_1_320px]">
                <IconBox><MapPin /></IconBox>
                <h3 className="heading mt-4 text-[clamp(30px,3vw,40px)] leading-[1.08]">Show your guests the way</h3>
                <p className="text-muted-foreground mt-3.5 leading-[1.7]">
                  Every venue opens straight in Google Maps, and each function goes into their calendar with one tap. Nobody ends up at the wrong church.
                </p>
                <div className="mt-5 flex flex-wrap gap-2.5" aria-hidden>
                  <span className="bg-card inline-flex h-10 items-center gap-2 rounded-md border px-3.5 text-sm font-medium shadow-xs">
                    <MapPin className="size-4" /> Directions
                  </span>
                  <span className="bg-card inline-flex h-10 items-center gap-2 rounded-md border px-3.5 text-sm font-medium shadow-xs">
                    <CalendarPlus className="size-4" /> Add to calendar
                  </span>
                </div>
              </div>
              <div className="flex min-w-0 flex-[1_1_360px] justify-center">
                <RouteMap className="h-auto w-full max-w-[440px] rounded-xl border bg-[#F7F3ED]" />
              </div>
            </Card>

            {/* Bento */}
            <div className="mt-4 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              <Card className="gap-0 p-[clamp(22px,3vw,30px)] md:col-span-2">
                <div className="flex flex-wrap items-start gap-3.5">
                  <IconBox><Palette /></IconBox>
                  <div className="min-w-0 flex-1">
                    <h3 className="text-lg font-semibold">A design that feels like the two of you</h3>
                    <p className="text-muted-foreground mt-1.5 text-sm leading-relaxed">Your colours, your lettering, your song. Pick a colour and a typeface to see the card change.</p>
                  </div>
                </div>
                <div className="mt-5">
                  <DesignPicker />
                </div>
              </Card>
              <Card className="gap-0 p-[clamp(22px,3vw,30px)]">
                <IconBox><Timer /></IconBox>
                <h3 className="mt-4 text-lg font-semibold">A countdown to the day</h3>
                <p className="text-muted-foreground mt-1.5 text-sm leading-relaxed">Ticking live, so every visit feels a little closer.</p>
                <CountdownTiles />
              </Card>
              <Card className="gap-0 p-[clamp(22px,3vw,30px)]">
                <IconBox><Clock /></IconBox>
                <h3 className="mt-4 text-lg font-semibold">The day, hour by hour</h3>
                <p className="text-muted-foreground mt-1.5 text-sm leading-relaxed">From the Mass to the last dance, so guests know when and where.</p>
                <ol className="mt-5 grid gap-3.5 border-l pl-[18px] text-sm">
                  {[
                    ["3:00 PM", "Holy Mass", "bg-primary"],
                    ["4:30 PM", "Photographs", "bg-sage"],
                    ["6:30 PM", "Reception", "bg-sage"],
                    ["8:30 PM", "Dinner and dancing", "bg-clay"],
                  ].map(([t, w, dot]) => (
                    <li key={t} className="relative">
                      <span aria-hidden className={`absolute top-1 -left-6 size-[11px] rounded-full ${dot} shadow-[0_0_0_3px_var(--card)]`} />
                      <strong className="font-semibold">{t}</strong> <span className="text-muted-foreground">{w}</span>
                    </li>
                  ))}
                </ol>
              </Card>
              <Card className="flex-row flex-wrap items-center gap-7 p-[clamp(22px,3vw,30px)] md:col-span-2">
                <div className="min-w-0 flex-[1_1_240px]">
                  <IconBox><MessageCircle /></IconBox>
                  <h3 className="mt-4 text-lg font-semibold">Sent on WhatsApp, looking like an invitation</h3>
                  <p className="text-muted-foreground mt-1.5 text-sm leading-relaxed">Your names, date and cover show up in the chat preview, so guests see an invitation, not a bare link.</p>
                </div>
                <div className="bg-muted min-w-0 flex-[1_1_300px] rounded-xl border p-4">
                  <div className="ml-auto max-w-[360px] rounded-[12px_4px_12px_12px] bg-[#FFFDF9] p-1.5 pb-2 shadow-[0_1px_2px_rgba(55,70,60,0.12)]">
                    <div className="flex gap-2.5 rounded-lg bg-[#F2EFE7] p-1.5">
                      <img src="/media/cover-floral.jpg" alt="" className="size-[72px] flex-none rounded-md object-cover object-[center_30%]" />
                      <div className="min-w-0">
                        <p className="text-[13px] font-semibold">Anna &amp; Joel · 6 February 2027</p>
                        <p className="text-muted-foreground mt-1 text-xs leading-snug">Together with their families, Anna and Joel invite you to their wedding. Tap to open your invitation.</p>
                        <p className="text-muted-foreground mt-1 text-[11px]">annaandjoel.in</p>
                      </div>
                    </div>
                    <p className="mx-1.5 mt-2 text-sm leading-snug">Here&apos;s our invitation with all the details. Please do come!</p>
                    <p className="text-muted-foreground mx-1.5 mt-0.5 text-right text-[11px]">7:42 pm</p>
                  </div>
                </div>
              </Card>
            </div>

            <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {[
                [<Lock key="i" />, "Password protected", "Keep it private with a password only your guests know."],
                [<QrCode key="i" />, "QR code for printed cards", "Print it on your cards and guests scan straight into the invitation."],
                [<Globe key="i" />, "Your own web address", "annaandjoel.in instead of a long link nobody remembers."],
                [<Mail key="i" />, "Save-the-dates and thank-yous", "A save-the-date before the invitation, and a thank-you page with your photos after."],
              ].map(([icon, t, d]) => (
                <Card key={t as string} className="gap-0 p-5">
                  <IconBox>{icon}</IconBox>
                  <h3 className="mt-4 font-semibold">{t}</h3>
                  <p className="text-muted-foreground mt-1.5 text-sm leading-relaxed">{d}</p>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* How it works */}
        <section id="how" aria-labelledby="how-h" className="bg-muted border-y py-[clamp(72px,9vw,120px)]">
          <div className={wrap}>
            <SectionHead badge="How it works" title="From your first message to" accent="their first reply." />
            <ol className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {[
                ["Message us", "Send your names, functions, venues and a few photos. For The Story, tell us how you met."],
                ["We design it", "We write the wording, build your invitation and send you a private preview to open on your phone."],
                ["Make it yours", "Change the words, photos, music or colours until it feels like the two of you."],
                ["Send and relax", "Share your links on WhatsApp or print the QR code, then watch replies come in."],
              ].map(([t, d], i) => (
                <li key={t} className="bg-card text-card-foreground flex flex-col rounded-xl border p-6 shadow-sm">
                  <span aria-hidden className={`grid size-9 place-items-center rounded-full text-sm font-semibold ${i === 3 ? "bg-clay text-clay-foreground" : "bg-primary text-primary-foreground"}`}>
                    {i + 1}
                  </span>
                  <h3 className="mt-4 font-semibold">{t}</h3>
                  <p className="text-muted-foreground mt-1.5 text-sm leading-relaxed">{d}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* Pricing */}
        <section id="pricing" aria-labelledby="pricing-h" className="py-[clamp(72px,9vw,120px)]">
          <div className={wrap}>
            <div className="mx-auto max-w-[740px] text-center">
              <Badge variant="outline">Packages</Badge>
              <h2 id="pricing-h" className="heading mt-4 text-[clamp(40px,5vw,64px)] leading-[1.02]">
                Simple, one-time <em className="text-clay-ink font-normal">pricing.</em>
              </h2>
              <p className="text-muted-foreground mt-4 text-[17px]">Pay once. We design it, you share it.</p>
            </div>
            <div className="mx-auto mt-12 grid max-w-[920px] gap-5 md:grid-cols-2">
              <Card className="gap-0 p-7">
                <div className="flex items-center justify-between gap-3">
                  <h3 className="text-lg font-semibold">The Classic</h3>
                  <Badge variant="secondary">Elegant and quick</Badge>
                </div>
                <p className="text-muted-foreground mt-1.5 text-sm">Everything guests need, beautifully laid out.</p>
                <p className="mt-6 flex items-baseline gap-2">
                  <span className="heading text-[52px] leading-none font-semibold">₹4,999</span>
                  <span className="text-muted-foreground text-sm">one-time</span>
                </p>
                <EnquireButton variant="outline" pkg="classic" origin="pricing-classic" className="mt-6 w-full">
                  Choose The Classic
                </EnquireButton>
                <Separator className="mt-6 mb-5" />
                <Checklist items={CLASSIC_POINTS} />
              </Card>
              <Card className="border-primary gap-0 border-2 p-7 shadow-[0_24px_60px_rgba(55,70,60,0.16)]">
                <div className="flex items-center justify-between gap-3">
                  <h3 className="text-lg font-semibold">The Story</h3>
                  <Badge>Our signature</Badge>
                </div>
                <p className="text-muted-foreground mt-1.5 text-sm">Everything in The Classic, plus your story.</p>
                <div className="mt-6 flex flex-wrap items-baseline gap-x-2.5 gap-y-1.5">
                  <span className="heading text-[52px] leading-none font-semibold">₹8,490</span>
                  <s className="text-muted-foreground text-lg">
                    <span className="sr-only">Was </span>₹9,999
                  </s>
                  <span className="text-muted-foreground text-sm">one-time</span>
                </div>
                <Badge variant="clay" className="mt-2.5">Launch offer · Save ₹1,509</Badge>
                <EnquireButton pkg="story" origin="pricing-story" className="mt-4 w-full">
                  Choose The Story <ArrowRight />
                </EnquireButton>
                <Separator className="mt-6 mb-5" />
                <Checklist
                  items={STORY_POINTS}
                  first={
                    <li className="flex gap-2.5">
                      <Check className="text-sage mt-0.5 size-4 flex-none" strokeWidth={2.4} aria-hidden />
                      <span>
                        Everything in <strong className="font-semibold">The Classic</strong>
                      </span>
                    </li>
                  }
                />
              </Card>
            </div>
            <Card className="mx-auto mt-5 max-w-[920px] gap-0 px-6 py-2">
              <p className="mt-3.5 mb-1.5 text-sm font-semibold">Add-ons</p>
              {ADDONS.map((a) => (
                <div key={a} className="flex justify-between gap-4 border-t py-3 text-sm">
                  <span className="text-muted-foreground">{a}</span>
                  <span className="font-semibold">Ask us</span>
                </div>
              ))}
            </Card>
          </div>
        </section>

        {/* Founding couples */}
        <section id="founding" aria-labelledby="founding-h" className="pb-[clamp(72px,9vw,120px)]">
          <div className={wrap}>
            <Card className="bg-primary text-primary-foreground border-primary relative flex-row flex-wrap items-center gap-[clamp(28px,5vw,56px)] overflow-hidden p-[clamp(26px,5vw,60px)]">
              <Sprig className="absolute -right-8 -bottom-10 h-[316px] w-[190px] opacity-30" stroke="#B9C2B3" />
              <div className="relative min-w-0 flex-[1_1_440px]">
                <Badge className="bg-clay text-clay-foreground">Founding couples</Badge>
                <h2 id="founding-h" className="heading mt-4 text-[clamp(38px,4.6vw,58px)] leading-[1.02]">
                  Be one of our <em className="font-normal text-[#DDBFAA]">founding couples.</em>
                </h2>
                <p className="mt-4 max-w-[540px] text-[17px] leading-[1.7] text-[#D9D8C8]">
                  We&apos;re opening {STUDIO} to a small group of couples first, with The Story at its launch price of ₹8,490. In return, we&apos;d love an honest review after your wedding, and it will go right here.
                </p>
                <EnquireButton variant="clay" size="lg" pkg="story" origin="founding" className="mt-6">
                  Apply as a founding couple <ArrowRight />
                </EnquireButton>
              </div>
              <Card className="relative max-w-[380px] min-w-0 flex-[1_1_300px] gap-0 p-6">
                <p className="text-muted-foreground text-sm">Founding couples get</p>
                <ul className="mt-3 grid gap-0 text-sm">
                  {["The Story at ₹8,490 instead of ₹9,999", "Planned with the founder, directly on WhatsApp", "Your invitation featured here, only if you'd like"].map((p, i) => (
                    <li key={p} className={`flex gap-2.5 py-2.5 ${i ? "border-t" : ""}`}>
                      <Check className="text-sage mt-0.5 size-4 flex-none" strokeWidth={2.4} aria-hidden />
                      {p}
                    </li>
                  ))}
                </ul>
              </Card>
            </Card>
          </div>
        </section>

        {/* FAQ */}
        <section id="faq" aria-labelledby="faq-h" className="bg-muted border-t py-[clamp(72px,9vw,120px)]">
          <div className={`${wrap} flex flex-wrap gap-[clamp(32px,5vw,64px)]`}>
            <div className="max-w-[380px] flex-[1_1_300px]">
              <Badge variant="outline">FAQ</Badge>
              <h2 id="faq-h" className="heading mt-4 text-[clamp(38px,4.4vw,56px)] leading-[1.02]">
                Asked by <em className="text-clay-ink font-normal">every family.</em>
              </h2>
              <p className="text-muted-foreground mt-4">Something else on your mind?</p>
              <Button variant="outline" asChild className="mt-4">
                <a href={chat} target="_blank" rel="noopener">
                  <MessageCircle /> Ask us on WhatsApp
                </a>
              </Button>
            </div>
            <Card className="min-w-0 flex-[1_1_520px] gap-0 px-6 py-1">
              <Accordion type="single" collapsible>
                {FAQ.map(([q, a], i) => (
                  <AccordionItem key={q} value={`q${i}`}>
                    <AccordionTrigger className="min-h-14 text-base">{q}</AccordionTrigger>
                    <AccordionContent className="text-muted-foreground text-[15px] leading-[1.7]">{a}</AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </Card>
          </div>
        </section>

        {/* Enquiry */}
        <section id="enquire" aria-labelledby="cta-h" className="relative overflow-hidden border-t py-[clamp(80px,10vw,128px)]">
          <Sprig className="absolute top-1/2 left-[3%] h-[266px] w-40 -translate-y-1/2 -rotate-[14deg] opacity-45 max-lg:hidden" />
          <Sprig className="absolute top-1/2 right-[3%] h-[266px] w-40 -translate-y-1/2 -scale-x-100 -rotate-[14deg] opacity-45 max-lg:hidden" />
          <div className={`${wrap} relative`}>
            <div className="mx-auto max-w-[620px] text-center">
              <Badge variant="outline">More than an invitation</Badge>
              <h2 id="cta-h" className="heading mt-4 text-[clamp(48px,7vw,92px)] leading-[0.98] tracking-[-0.02em]">
                Tell us your <em className="text-clay-ink font-normal">date.</em>
              </h2>
              <p className="text-muted-foreground mt-4 text-[17px] leading-relaxed">Send this and we&apos;ll reply on WhatsApp with what&apos;s possible and how your invitation could look.</p>
            </div>
            <Card className="mx-auto mt-10 max-w-[720px] gap-0 p-[clamp(20px,4vw,36px)]">
              <EnquiryForm origin="enquire-section" whatsapp={wa} />
            </Card>
            <p className="text-muted-foreground mt-5 text-center text-sm">
              Prefer to chat?{" "}
              <a href={chat} target="_blank" rel="noopener" className="text-foreground font-medium underline underline-offset-4">
                Message us on WhatsApp
              </a>
            </p>
          </div>
        </section>
      </main>

      <footer className="bg-card border-t">
        <div className={`${wrap} flex flex-wrap items-center justify-between gap-x-8 gap-y-4 py-8 text-sm`}>
          <div className="flex items-center gap-3">
            <Logo name={STUDIO} />
          </div>
          <nav aria-label="Footer" className="flex flex-wrap gap-1">
            {[
              ["#designs", "Designs"],
              ["#features", "Features"],
              ["#pricing", "Packages"],
              ["#faq", "FAQ"],
            ].map(([href, label]) => (
              <Button key={href} variant="ghost" size="sm" asChild className="text-muted-foreground">
                <a href={href}>{label}</a>
              </Button>
            ))}
            <Button variant="ghost" size="sm" asChild className="text-muted-foreground">
              <a href={chat} target="_blank" rel="noopener">WhatsApp</a>
            </Button>
          </nav>
          <Separator />
          <p className="text-muted-foreground text-[13px]">© {new Date().getFullYear()} {STUDIO} · More than an invitation. Wedding invitation websites, made in Kerala.</p>
        </div>
      </footer>
    </EnquiryProvider>
  );
}
