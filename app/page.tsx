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
  Instagram,
  Minus,
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
import { PaperHero, PaperOrigin, PaperSamples } from "@/components/landing/paper";
import { StickyCta, TrustStrip, InlineCta } from "@/components/landing/funnel";
import { WhatsAppMoment } from "@/components/landing/whatsapp-chat";
import { CoupleWords } from "@/components/landing/couple-words";
import { publicWhatsApp, siteUrl, STUDIO } from "@/lib/config";
import { fmtLongDate, getSettings, offerActive } from "@/lib/settings";
import { LivePreview } from "@/components/landing/live-preview";
import { CtaText, WhatsAppButton } from "@/components/landing/cta";
import { AUDIENCES } from "@/lib/audiences";

export const dynamic = "force-dynamic";

const CHAPTERS = [
  { img: "/media/sc-church.jpg", alt: "Kerala Christian wedding invitation website: watercolour church chapter", text: "Every day, the bells rang at Don Bosco Church." },
  { img: "/media/sc-altar.jpg", alt: "Wedding invitation story chapter: watercolour of the groom at the altar", text: "He came for Mass, praying quietly before the altar." },
  { img: "/media/sc-choir.jpg", alt: "Wedding invitation story chapter: watercolour of the bride in the church choir", text: "And in the choir, she sang." },
  { img: "/media/sc-london.jpg", alt: "NRI wedding invitation story chapter: illustration of London", text: "He flew to London, chasing his dreams." },
  { img: "/media/sc-ca.jpg", alt: "Wedding invitation story chapter: illustration of a study desk", text: "She became a Chartered Accountant." },
  { img: "/media/sc-cafe.jpg", alt: "Wedding invitation story chapter: how the couple met over coffee", text: "Years later, over two coffees, their paths finally crossed." },
];

const COLLAGE = [
  [["sc-church", "aspect-[3/4]"], ["sc-cafe", "aspect-square"]],
  [["ph-poster", "aspect-[3/4]"], ["sc-london", "aspect-square"]],
  [["sc-choir", "aspect-[3/4]"], ["ph-g3", "aspect-[3/4]"]],
  [["sc-ca", "aspect-square"], ["sc-altar", "aspect-[3/4]"]],
  [["ph-p1", "aspect-[3/4]"], ["cover-floral", "aspect-[3/4]"]],
];

const CLASSIC_POINTS = [
  "An elegant animated opening",
  "Your photos, video and song",
  "Every function with maps, calendar and timings",
  "Live countdown to the day",
  "RSVP for each function, with your own questions",
  "A separate link for each guest list",
  "Password protection and a QR code for cards",
  "WhatsApp preview with your names",
];
const STORY_POINTS = [
  "An opening designed only for you",
  "Your story in chapters, in the style you choose",
  "Custom moments, like a photo that develops as guests watch",
  "Bride's side and groom's side versions",
  "Save-the-date and thank-you pages",
];
const CLASSIC_MISSING = ["Your story told in chapters", "An opening designed only for you", "Bride's side and groom's side versions", "Save-the-date and thank-you pages"];
const ADDONS: [string, "addon_domain" | "addon_language" | "addon_chapters" | "addon_pages"][] = [
  ["Your own web address", "addon_domain"],
  ["Malayalam or bilingual wording", "addon_language"],
  ["Extra story chapters", "addon_chapters"],
  ["Save-the-date and thank-you pages for The Classic Invitation", "addon_pages"],
];

const FAQ = [
  ["Do our guests need to download anything?", "No. It opens in the browser on any phone, straight from WhatsApp. Grandparents included."],
  ["Can different guests see different functions?", "Yes. We make a separate link for each guest list, so office friends see the reception while close family sees everything. Each link has its own RSVP choices and its own WhatsApp preview."],
  ["Can we keep it private?", "Yes. Add a password and only the guests you share it with can open the invitation."],
  ["We're printing cards too. Can they link to it?", "Yes. You get a QR code to print on your cards. Guests scan it and land on the invitation with maps and RSVP."],
  ["How do the RSVPs reach us?", "On a private page only you can open. See headcounts, read guests' notes and answers, filter by link and download everything to Excel for the caterer."],
  ["What if something changes after we send it?", "Tell us and we update it. Guests keep the same link, so they always see the latest time and venue."],
  ["What do you need from us?", "Your names and your parents' names, each function with its time and venue, your photos or a video, and the song you love. For The Signature Invitation, a few lines on how you met."],
  ["Where are our guests' names and replies stored?", "On our own server in a private database, never in a public spreadsheet. Only the two of you (and we, to help you) can see the guest list and RSVPs. We never sell or share them, and we delete them on request after the wedding."],
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
    <ul className="grid flex-1 content-start gap-3 text-sm">
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
  const chat = whatsappHref(wa, "Hi! We'd like a free preview of our wedding invitation. Our names are ");
  const wrap = "mx-auto w-full max-w-[1200px] px-[clamp(16px,5vw,40px)]";
  const st = getSettings();
  const offer = offerActive(st);
  const goodToKnow = ([["Turnaround", st.turnaround], ["Payment", st.payment_terms], ["Changes", st.revisions], ["If it's not right", st.refund_policy]] as [string, string | undefined][]).filter(([, v]) => v);
  const faqLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: FAQ.map(([q, a]) => ({ "@type": "Question", name: q, acceptedAnswer: { "@type": "Answer", text: a } })),
  };
  const orgLd = {
    "@context": "https://schema.org",
    "@type": "ProfessionalService",
    name: STUDIO,
    url: siteUrl(),
    logo: `${siteUrl()}/media/seal.webp`,
    image: `${siteUrl()}/og.jpg`,
    description: "Custom wedding invitation websites from Kerala, sent on WhatsApp, with RSVP for every function.",
    areaServed: ["Kerala", "India", "United Arab Emirates", "United Kingdom"],
    priceRange: "₹4,999 to ₹8,490",
    sameAs: st.instagram_url ? [st.instagram_url] : undefined,
    makesOffer: [
      { "@type": "Offer", name: "The Classic Invitation", price: "4999", priceCurrency: "INR" },
      { "@type": "Offer", name: "The Signature Invitation", price: "8490", priceCurrency: "INR" },
    ],
  };

  return (
    <EnquiryProvider whatsapp={wa}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(orgLd) }} />
      {/* Announcement */}
      <div className="bg-primary text-primary-foreground px-4 py-2.5 text-center text-[13px]">
        <a href="#pricing" className="inline-flex flex-wrap items-center justify-center gap-2">
          <Badge className="bg-clay text-clay-foreground">Now booking</Badge>
          <span>
            Weddings for 2027<span className="max-sm:hidden">, designed for you and sent on WhatsApp</span>
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
            <EnquireButton size="sm" variant="outline" origin="header" className="max-md:hidden">
              <CtaText />
            </EnquireButton>
            <WhatsAppButton href={chat} origin="header" size="sm">
              WhatsApp
            </WhatsAppButton>
          </div>
        </nav>
      </header>

      <main>
        <PaperHero chat={chat} />
        <LivePreview />
        <PaperSamples />
        <TrustStrip />
        {st.stats_invites || st.stats_guests ? (
          <div className="bg-primary text-primary-foreground">
            <dl className="mx-auto flex max-w-[900px] flex-wrap justify-center gap-x-14 gap-y-4 px-4 py-8 text-center">
              {([["Invitations delivered", st.stats_invites], ["Guests reached", st.stats_guests]] as [string, string | undefined][]).filter(([, v]) => v).map(([k, v]) => (
                <div key={k}>
                  <dd className="heading text-5xl">{v}</dd>
                  <dt className="mt-1 text-xs tracking-[0.2em] text-[#EAD9CD] uppercase">{k}</dt>
                </div>
              ))}
            </dl>
          </div>
        ) : null}
        <WhatsAppMoment />
        <CoupleWords />
        <PaperOrigin
          studio={STUDIO}
          founder={
            <div className="mt-6 flex items-center gap-4">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={st.founder_photo ? `/api/photos/${st.founder_photo}` : "/media/seal.webp"} alt={st.founder_photo ? `${st.founder_name}, founder of ${STUDIO}` : ""} className="size-16 flex-none rounded-full object-cover" />
              <div>
                <p className="heading text-xl leading-tight">{st.founder_name}</p>
                <p className="text-muted-foreground text-sm">Founder, {STUDIO}</p>
              </div>
            </div>
          }
        />
        <InlineCta origin="after-origin" chat={chat} text="Send us your names. We'll build a preview." />

        {/* Designs */}
        <section id="designs" aria-labelledby="designs-h" className="py-[clamp(72px,9vw,120px)]">
          <div className={wrap}>
            <div className="mx-auto max-w-[700px] text-center">
              <Badge variant="outline">Two invitations</Badge>
              <h2 id="designs-h" className="heading mt-4 text-[clamp(40px,5vw,64px)] leading-[1.02]">
                Choose how it <em className="text-clay-ink font-normal">unfolds.</em>
              </h2>
              <p className="text-muted-foreground mt-4 text-[17px] leading-relaxed">Both are screen recordings of real invitations we made. Every detail, from the first tap to the last reply, is designed with care.</p>
            </div>
            <DesignTabs />
          </div>
        </section>

        {/* Story chapters */}
        <section id="story" aria-labelledby="story-h" className="bg-primary text-primary-foreground py-[clamp(72px,9vw,120px)]">
          <div className={`${wrap} flex flex-wrap items-end justify-between gap-6`}>
            <div className="max-w-[700px] flex-[1_1_520px]">
              <Badge className="border-[#F8F1EA33] bg-[#F8F1EA1a] text-[#F8F1EA]">The Signature Invitation</Badge>
              <h2 id="story-h" className="heading mt-4 text-[clamp(40px,5vw,64px)] leading-[1.02]">
                Your story, <em className="font-normal text-[#E9C29A]">the way you want to tell it.</em>
              </h2>
              <p className="mt-4 text-[17px] leading-[1.7] text-[#EAD9CD]">
                Watercolour, illustration, photographs or film. Tell us how you met and we turn the places and moments that matter into chapters your guests scroll through before they reach the date. These are from a real invitation we made.
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
                      <img key={src} src={`/media/${src}.jpg`} alt="Photo gallery in a Kerala wedding invitation website" loading="lazy" className={`${ratio} w-full rounded-[10px] border object-cover`} />
                    ))}
                  </div>
                ))}
              </div>
              <div className="max-w-[440px] min-w-0 flex-[1_1_320px]">
                <IconBox><Images /></IconBox>
                <h3 className="heading mt-4 text-[clamp(30px,3vw,40px)] leading-[1.08]">Share your love story in a photo gallery</h3>
                <p className="text-muted-foreground mt-3.5 leading-[1.7]">Your photos and video in a gallery made for phones, with the song you pick playing softly as guests open it.</p>
                <EnquireButton variant="outline" origin="gallery" className="mt-6">
                  <CtaText /> <ArrowRight />
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
                      <img src="/media/cover-floral.jpg" alt="WhatsApp link preview of a wedding invitation website" className="size-[72px] flex-none rounded-md object-cover object-[center_30%]" />
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

        <InlineCta origin="after-features" chat={chat} text="Imagine this with your names on it." />

        {/* How it works */}
        <section id="how" aria-labelledby="how-h" className="bg-muted border-y py-[clamp(72px,9vw,120px)]">
          <div className={wrap}>
            <SectionHead badge="How it works" title="You share the details." accent="We take care of the rest." />
            <ol className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {[
                ["Message us", "Send your names, functions, venues and a few photos, plus how you met if you would like your story told."],
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
              <p className="text-muted-foreground mt-4 text-[17px]">Pay once. We design it, you share it. No subscriptions, no hidden costs.</p>
            </div>
            <div className={`mx-auto mt-12 grid gap-5 ${st.bundle_price ? "max-w-[1200px] lg:grid-cols-3 md:grid-cols-2" : "max-w-[920px] md:grid-cols-2"}`}>
              <Card className="gap-0 p-7">
                <div className="flex items-center justify-between gap-3">
                  <h3 className="text-lg font-semibold">The Classic Invitation</h3>
                  <Badge variant="secondary">Elegant and quick</Badge>
                </div>
                <p className="text-muted-foreground mt-1.5 text-sm">Everything guests need, beautifully laid out.</p>
                <p className="mt-6 flex items-baseline gap-2">
                  <span className="heading text-[52px] leading-none font-semibold">₹4,999</span>
                  <span className="text-muted-foreground text-sm">one-time</span>
                </p>
                <EnquireButton variant="outline" pkg="classic" origin="pricing-classic" className="mt-6 w-full">
                  <CtaText />
                </EnquireButton>
                <Separator className="mt-6 mb-5" />
                <Checklist items={CLASSIC_POINTS} />
                <p className="text-muted-foreground mt-5 text-xs font-semibold tracking-[0.14em] uppercase">Not included (in The Signature Invitation)</p>
                <ul className="text-muted-foreground mt-2.5 grid gap-2 text-sm">
                  {CLASSIC_MISSING.map((p) => (
                    <li key={p} className="flex gap-2.5">
                      <Minus className="mt-0.5 size-4 flex-none opacity-60" aria-hidden />
                      {p}
                    </li>
                  ))}
                </ul>
              </Card>
              <Card className="border-primary gap-0 border-2 p-7 shadow-[0_24px_60px_rgba(74,15,22,0.16)]">
                <div className="flex items-center justify-between gap-3">
                  <h3 className="text-lg font-semibold">The Signature Invitation</h3>
                  <Badge>Recommended</Badge>
                </div>
                <p className="text-muted-foreground mt-1.5 text-sm">Everything in The Classic Invitation, plus your story.</p>
                <div className="mt-6 flex flex-wrap items-baseline gap-x-2.5 gap-y-1.5">
                  <span className="heading text-[52px] leading-none font-semibold">₹8,490</span>
                  {offer ? (
                    <s className="text-muted-foreground text-lg">
                      <span className="sr-only">Usually </span>₹9,999
                    </s>
                  ) : null}
                  <span className="text-muted-foreground text-sm">one-time</span>
                </div>
                {offer && st.offer_ends ? (
                  <Badge variant="clay" className="mt-2.5">Introductory price until {fmtLongDate(st.offer_ends)}</Badge>
                ) : null}
                <EnquireButton pkg="story" origin="pricing-story" className="mt-4 w-full">
                  <CtaText /> <ArrowRight />
                </EnquireButton>
                <Separator className="mt-6 mb-5" />
                <Checklist
                  items={STORY_POINTS}
                  first={
                    <li className="flex gap-2.5">
                      <Check className="text-sage mt-0.5 size-4 flex-none" strokeWidth={2.4} aria-hidden />
                      <span>
                        Everything in <strong className="font-semibold">The Classic Invitation</strong>
                      </span>
                    </li>
                  }
                />
              </Card>
              {st.bundle_price ? (
                <Card className="gap-0 p-7">
                  <div className="flex items-center justify-between gap-3">
                    <h3 className="text-lg font-semibold">Invitation + printed cards</h3>
                    <Badge variant="secondary">For the elders</Badge>
                  </div>
                  <p className="text-muted-foreground mt-1.5 text-sm">The website, plus printed cards with your QR code.</p>
                  <p className="mt-6 flex items-baseline gap-2">
                    <span className="heading text-[44px] leading-none font-semibold">{st.bundle_price}</span>
                  </p>
                  <EnquireButton variant="outline" origin="pricing-bundle" className="mt-6 w-full">
                    <CtaText />
                  </EnquireButton>
                  <Separator className="mt-6 mb-5" />
                  <Checklist items={(st.bundle_note || "The Classic Invitation\nPrinted cards with your QR code").split(/\n+/).map((x) => x.trim()).filter(Boolean)} />
                </Card>
              ) : null}
            </div>
            <Card className="mx-auto mt-5 max-w-[920px] gap-0 px-6 py-2">
              <p className="mt-3.5 mb-1.5 text-sm font-semibold">Add-ons</p>
              {ADDONS.map(([a, k]) => (
                <div key={a} className="flex justify-between gap-4 border-t py-3 text-sm">
                  <span className="text-muted-foreground">{a}</span>
                  <span className="font-semibold whitespace-nowrap">{st[k] || "Ask us"}</span>
                </div>
              ))}
            </Card>
            {goodToKnow.length ? (
              <Card className="mx-auto mt-5 max-w-[920px] gap-0 px-6 py-2">
                <p className="mt-3.5 mb-1.5 text-sm font-semibold">Good to know</p>
                {goodToKnow.map(([k, v]) => (
                  <div key={k} className="flex flex-wrap justify-between gap-x-6 gap-y-1 border-t py-3 text-sm">
                    <span className="font-medium">{k}</span>
                    <span className="text-muted-foreground sm:text-right">{v}</span>
                  </div>
                ))}
              </Card>
            ) : null}
            <ul className="text-muted-foreground mx-auto mt-6 flex max-w-[920px] flex-wrap justify-center gap-x-6 gap-y-2 text-sm">
              {["See a private preview before guests do", "Changes until the wedding day, same link", "Reply within the day on WhatsApp"].map((t) => (
                <li key={t} className="flex items-center gap-2">
                  <Check className="text-sage size-4" strokeWidth={2.4} aria-hidden />
                  {t}
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* Start your journey */}
        <section id="journey" aria-labelledby="journey-h" className="pb-[clamp(72px,9vw,120px)]">
          <div className={wrap}>
            <Card className="bg-primary text-primary-foreground border-primary relative flex-row flex-wrap items-center gap-[clamp(28px,5vw,56px)] p-[clamp(26px,5vw,60px)]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/media/cut/tulips.webp" alt="" aria-hidden className="pointer-events-none absolute -top-14 right-[2%] w-[clamp(92px,11vw,140px)] rotate-[14deg] drop-shadow-[0_14px_18px_rgba(0,0,0,0.3)] max-sm:-top-10 max-sm:w-20" />
              <div className="relative min-w-0 flex-[1_1_440px]">
                <Badge className="bg-clay text-clay-foreground">Your preview</Badge>
                <h2 id="journey-h" className="heading mt-4 text-[clamp(38px,4.6vw,58px)] leading-[1.02]">
                  Send us your names. <em className="font-normal text-[#E9C29A]">We&apos;ll build a preview.</em>
                </h2>
                <p className="mt-4 max-w-[540px] text-[17px] leading-[1.7] text-[#EAD9CD]">
                  Your names and WhatsApp number are enough to start. We send you a preview on your phone, then add your functions, venues and photos once you love it.
                </p>
                <div className="mt-6 flex flex-wrap items-center gap-3">
                  <WhatsAppButton href={chat} origin="journey" variant="clay" size="lg">
                    Chat on WhatsApp
                  </WhatsAppButton>
                  <EnquireButton variant="outline" size="lg" origin="journey" className="border-[#E9C29A]/50 bg-transparent text-[#FBEFE6] hover:bg-white/10 hover:text-white">
                    <CtaText />
                  </EnquireButton>
                </div>
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
                    <AccordionContent forceMount className="text-muted-foreground text-[15px] leading-[1.7] data-[state=closed]:hidden">{a}</AccordionContent>
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
              <Badge variant="outline">Your free preview</Badge>
              <h2 id="cta-h" className="heading mt-4 text-[clamp(48px,7vw,92px)] leading-[0.98] tracking-[-0.02em]">
                Is your date <em className="text-clay-ink font-normal">free?</em>
              </h2>
              <p className="text-muted-foreground mt-4 text-[17px] leading-relaxed">Just your names and WhatsApp number. We&apos;ll reply on WhatsApp with ideas and a preview of your invitation. No payment, no obligation.</p>
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
      <StickyCta whatsapp={chat} />

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
          <div className="flex w-full flex-col items-center gap-2 pt-2 text-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={st.founder_photo ? `/api/photos/${st.founder_photo}` : "/media/seal.webp"} alt={st.founder_photo ? `${st.founder_name}, founder` : ""} className="size-20 rounded-full object-cover drop-shadow-[0_8px_12px_rgba(74,15,22,0.18)]" />
            <p className="text-clay-ink text-[34px] leading-none" style={{ fontFamily: "'Mrs Saint Delafield', cursive" }}>Made with love</p>
            <p className="text-muted-foreground text-sm">by {st.founder_name}, founder</p>
            {st.instagram_url ? (
              <a href={st.instagram_url} target="_blank" rel="noopener" className="text-foreground mt-1 inline-flex items-center gap-1.5 text-sm font-medium underline underline-offset-4">
                <Instagram className="size-4" aria-hidden /> Follow our invitations on Instagram
              </a>
            ) : null}
          </div>
          <Separator />
          <nav aria-label="Invitations by type" className="text-muted-foreground flex w-full flex-wrap justify-center gap-x-5 gap-y-2 text-[13px]">
            {AUDIENCES.map((x) => (
              <a key={x.slug} href={`/${x.slug}`} className="hover:text-foreground underline-offset-4 hover:underline">
                {x.nav}
              </a>
            ))}
            <a href="/privacy" className="hover:text-foreground underline-offset-4 hover:underline">Privacy</a>
          </nav>
          <p className="text-muted-foreground w-full text-center text-[13px]">© {new Date().getFullYear()} {STUDIO} · Wedding invitation websites, made in Kerala.</p>
        </div>
      </footer>
    </EnquiryProvider>
  );
}
