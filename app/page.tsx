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
import { PaperFeel, PaperHero, PaperSamples } from "@/components/landing/paper";
import { publicWhatsApp, STUDIO } from "@/lib/config";

export const dynamic = "force-dynamic";

const CHAPTERS = [
  { img: "/media/sc-church.jpg", alt: "Watercolour of Don Bosco Church, North Paravur", text: "Every day, the bells rang at Don Bosco Church." },
  { img: "/media/sc-altar.jpg", alt: "Watercolour of the groom standing in the aisle facing the altar", text: "He came for Mass, praying quietly before the altar." },
  { img: "/media/sc-choir.jpg", alt: "Watercolour of the bride singing in the church choir", text: "And in the choir, she sang." },
  { img: "/media/sc-london.jpg", alt: "Illustration of London with Big Ben and the London Eye", text: "He flew to London, chasing his dreams." },
  { img: "/media/sc-ca.jpg", alt: "Illustration of a study desk with a Chartered Accountant certificate", text: "She became a Chartered Accountant." },
  { img: "/media/sc-cafe.jpg", alt: "Illustration of a coffee shop table with two coffees", text: "Years later, over two coffees, their paths finally crossed." },
];

const COLLAGE = [
  [["sc-church", "aspect-[3/4]"], ["sc-cafe", "aspect-square"]],
  [["ph-poster", "aspect-[3/4]"], ["sc-london", "aspect-square"]],
  [["sc-choir", "aspect-[3/4]"], ["ph-g3", "aspect-[3/4]"]],
  [["sc-ca", "aspect-square"], ["sc-altar", "aspect-[3/4]"]],
  [["ph-p1", "aspect-[3/4]"], ["cover-floral", "aspect-[3/4]"]],
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
          <Badge className="bg-clay text-clay-foreground">Now booking</Badge>
          <span>
            Weddings for 2026 and 2027<span className="max-sm:hidden">, designed for you and sent on WhatsApp</span>
          </span>
          <span className="inline-flex items-center gap-1 underline underline-offset-3">
            See packages <ArrowRight className="size-3.5" aria-hidden />
          </span>
        </a>
      </div>

      {/* Header */}
      <header className="sticky top-0 z-40 border-b bg-[#F8F1EA]/90 backdrop-blur-md backdrop-saturate-150">
        <nav aria-label="Main" className={`${wrap} flex h-16 items-center justify-between gap-4`}>
          <div className="flex items-center gap-7">
            <a href="#top" aria-label={`${STUDIO} home`}>
              <Logo name={STUDIO} />
            </a>
            <div className="hidden items-center gap-1 lg:flex">
              {[
                ["#samples", "Samples"],
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
        <PaperHero />
        <PaperSamples />
        <PaperFeel />

        {/* Designs */}
        <section id="designs" aria-labelledby="designs-h" className="py-[clamp(72px,9vw,120px)]">
          <div className={wrap}>
            <div className="mx-auto max-w-[700px] text-center">
              <Badge variant="outline">Two designs</Badge>
              <h2 id="designs-h" className="heading mt-4 text-[clamp(40px,5vw,64px)] leading-[1.02]">
                Choose how it <em className="text-clay-ink font-normal">unfolds.</em>
              </h2>
              <p className="text-muted-foreground mt-4 text-[17px] leading-relaxed">Both are screen recordings of real invitations we made.</p>
            </div>
            <DesignTabs />
          </div>
        </section>

        {/* Story chapters */}
        <section id="story" aria-labelledby="story-h" className="bg-primary text-primary-foreground py-[clamp(72px,9vw,120px)]">
          <div className={`${wrap} flex flex-wrap items-end justify-between gap-6`}>
            <div className="max-w-[700px] flex-[1_1_520px]">
              <Badge className="border-[#F8F1EA33] bg-[#F8F1EA1a] text-[#F8F1EA]">The Story, chapter by chapter</Badge>
              <h2 id="story-h" className="heading mt-4 text-[clamp(40px,5vw,64px)] leading-[1.02]">
                Your love story, <em className="font-normal text-[#E9C29A]">in watercolour.</em>
              </h2>
              <p className="mt-4 text-[17px] leading-[1.7] text-[#EAD9CD]">
                Tell us how you met. We turn the church, the city, the coffee shop and the first photo into scenes your guests scroll through before they reach the date. These chapters are from a real invitation we made.
              </p>
            </div>
            <p className="flex items-center gap-2 text-[13px] font-medium text-[#E3C9A8]">
              Scroll sideways <ArrowRight className="size-[18px]" aria-hidden />
            </p>
          </div>
          <div className="strip mt-11 flex gap-4 overflow-x-auto px-[max(16px,calc((100vw-1200px)/2+40px))] pt-1 pb-6">
            {CHAPTERS.map((c, i) => (
              <figure key={c.img} className="bg-forest-2 m-0 w-[clamp(230px,24vw,288px)] flex-none rounded-2xl border border-[#F8F1EA1a] p-2">
                <img src={c.img} alt={c.alt} loading="lazy" className="aspect-[4/5] w-full rounded-[10px] object-cover" />
                <figcaption className="px-2 pt-3.5 pb-2">
                  <Badge className="bg-[#F8F1EA1a] text-[#E9C29A]">{String(i + 1).padStart(2, "0")}</Badge>
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
                <RouteMap className="h-auto w-full max-w-[440px] rounded-xl border bg-[#F8F1EA]" />
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
                  <div className="ml-auto max-w-[360px] rounded-[12px_4px_12px_12px] bg-[#FFFDF9] p-1.5 pb-2 shadow-[0_1px_2px_rgba(74,15,22,0.12)]">
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
              <Card className="border-primary gap-0 border-2 p-7 shadow-[0_24px_60px_rgba(74,15,22,0.16)]">
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

        {/* Start your journey */}
        <section id="journey" aria-labelledby="journey-h" className="pb-[clamp(72px,9vw,120px)]">
          <div className={wrap}>
            <Card className="bg-primary text-primary-foreground border-primary relative flex-row flex-wrap items-center gap-[clamp(28px,5vw,56px)] p-[clamp(26px,5vw,60px)]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/media/cut/tulips.webp" alt="" aria-hidden className="pointer-events-none absolute -top-14 right-[2%] w-[clamp(92px,11vw,140px)] rotate-[14deg] drop-shadow-[0_14px_18px_rgba(0,0,0,0.3)] max-sm:-top-10 max-sm:w-20" />
              <div className="relative min-w-0 flex-[1_1_440px]">
                <Badge className="bg-clay text-clay-foreground">Your invitation</Badge>
                <h2 id="journey-h" className="heading mt-4 text-[clamp(38px,4.6vw,58px)] leading-[1.02]">
                  Start your journey <em className="font-normal text-[#E9C29A]">with us.</em>
                </h2>
                <p className="mt-4 max-w-[540px] text-[17px] leading-[1.7] text-[#EAD9CD]">
                  Send us your dates, your venues and a little about the two of you. We write it, design it and set up every guest link, and you share one link on WhatsApp.
                </p>
                <EnquireButton variant="clay" size="lg" origin="journey" className="mt-6">
                  Start your invitation <ArrowRight />
                </EnquireButton>
              </div>
              <Card className="relative max-w-[380px] min-w-0 flex-[1_1_300px] gap-0 p-6">
                <p className="text-muted-foreground text-sm">Every couple gets</p>
                <ul className="mt-3 grid gap-0 text-sm">
                  {["Planned with the founder, directly on WhatsApp", "Changes until the day, on the same link", "A private page with every RSVP and headcount"].map((p, i) => (
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
          <div className="flex w-full flex-col items-center gap-1 pt-2">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/media/cut/cat.webp" alt="A cat making a heart with its paws" className="w-[104px] drop-shadow-[0_10px_14px_rgba(74,15,22,0.18)]" />
            <p className="text-clay-ink text-[34px] leading-none" style={{ fontFamily: "'Mrs Saint Delafield', cursive" }}>Made with love</p>
            <p className="text-muted-foreground text-[12px] tracking-[0.2em] uppercase">in Kerala</p>
          </div>
          <Separator />
          <p className="text-muted-foreground text-[13px]">© {new Date().getFullYear()} {STUDIO} · More than an invitation. Wedding invitation websites, made in Kerala.</p>
        </div>
      </footer>
    </EnquiryProvider>
  );
}
