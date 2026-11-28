import { CalendarHeart, Check, Images, MapPin, Music2, Palette, Send, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { BuilderFooter, BuilderHeader } from "@/components/builder/header";
import { TemplateCard } from "@/components/builder/template-card";
import { StudioCard } from "@/components/builder/studio-card";
import { DESIGNS, designThumb } from "@/lib/builder/designs";
import { TEMPLATES } from "@/lib/builder/templates";
import { getBase, simplePrice, storyPrice, support } from "@/lib/builder/server";
import { SupportSection } from "@/components/builder/support";
import { builderUrl, publicWhatsApp, siteUrl } from "@/lib/config";
import { whatsappHref } from "@/lib/whatsapp";
import { rupees } from "@/lib/format";

export function generateMetadata() {
  return {
    title: { absolute: "Wedding Invitation Website Maker · The Wedding Invite Co." },
    alternates: { canonical: builderUrl() },
  };
}

const INCLUDED: [React.ReactNode, string, string][] = [
  [<Sparkles key="a" />, "An opening guests tap", "Temple doors, a sealed envelope or a night sky, before the invitation unfolds."],
  [<CalendarHeart key="b" />, "Every celebration", "Haldi to reception, each with its time, venue and an add-to-calendar button."],
  [<MapPin key="c" />, "Directions in a tap", "Paste a Google Maps link, or we find the venue for you."],
  [<Send key="d" />, "RSVPs in one list", "Guests reply on the invitation. You see who's coming, per celebration."],
  [<Images key="e" />, "Your photos and story", "A cover photo, chapters of how you met, and a gallery."],
  [<Music2 key="f" />, "Music", "Pick a track or upload your own song. It plays when guests open the invitation."],
  [<Palette key="g" />, "Your colours and fonts", "Change the colours, the font for your names and the text size."],
];

const FAQ: [string, string][] = [
  ["Do I pay before I start?", "No. Designing is free and needs no account. You pay once, only when you're happy and want to share it with your guests."],
  ["Can I change things after it's live?", "Yes, as often as you like until the wedding. Edit, then press \"Update live invitation\". Your link stays the same."],
  ["Do guests need to install anything?", "No. It's a normal link that opens in the phone's browser, straight from WhatsApp."],
  ["Can it be in Malayalam?", "Yes. Type in Malayalam anywhere, and pick a Malayalam font in Style for the whole invitation."],
  ["Can I use our own song?", "Yes. Upload an MP3 in the Music tab. Please only use music you have the right to share."],
  ["Is it private?", "Your draft is visible only to you. Once live, anyone with the link can open it, and it's hidden from Google."],
  ["What if I get stuck?", "Message us on WhatsApp. We can also design the whole thing for you, from ₹4,999."],
];

export default async function BuilderHome({ searchParams }: { searchParams: Promise<{ busy?: string }> }) {
  const base = await getBase();
  const price = simplePrice();
  const story = storyPrice();
  const sup = support();
  const sp = await searchParams;
  const wrap = "mx-auto w-full max-w-6xl px-4 sm:px-6";
  return (
    <div className="min-h-dvh">
      <BuilderHeader base={base} active="designs" />
      <main>
        <section className="border-b py-[clamp(48px,7vw,96px)]">
          <div className={`${wrap} grid items-center gap-10 text-center`}>
            <div className="mx-auto max-w-3xl">
              <Badge variant="clay">Do it yourself · from {rupees(price)}</Badge>
              <h1 className="heading mt-5 text-[clamp(42px,6.4vw,80px)] leading-[0.98] text-balance">
                Make your wedding invitation website, <em className="text-clay-ink font-normal">yourself.</em>
              </h1>
              <p className="text-muted-foreground mx-auto mt-5 max-w-2xl text-[17px] text-pretty">
                Pick a design, type your names, events and story, add photos and music, and watch it change as you go. Designing is free. You pay once, only when you&apos;re ready to send it: {rupees(story)} for our studio designs with a story line, {rupees(price)} for the simpler ones.
              </p>
              <div className="mt-7 flex flex-wrap justify-center gap-3">
                <Button size="lg" asChild>
                  <a href="#designs">Choose a design</a>
                </Button>
                <Button size="lg" variant="outline" asChild>
                  <a href={`${base}/mine`}>Continue my design</a>
                </Button>
              </div>
              <ul className="text-muted-foreground mt-7 flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm">
                {["Free to design, no account", "Pay once, only to publish", "Change it any time until the wedding"].map((t) => (
                  <li key={t} className="flex items-center gap-2">
                    <Check className="text-sage size-4" strokeWidth={2.4} aria-hidden />
                    {t}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        <section aria-labelledby="how-h" className="bg-muted border-b py-14">
          <div className={wrap}>
            <h2 id="how-h" className="sr-only">How it works</h2>
            <ol className="grid gap-4 md:grid-cols-3">
              {[
                ["Pick a design", `${DESIGNS.length + TEMPLATES.length} designs, most of them real invitations from our studio. Open any of them before you choose.`],
                ["Make it yours", "Names, celebrations, venues, story, photos, music, fonts and text size. The phone preview updates as you type."],
                ["Pay once and share", `Choose your link, pay once (from ${rupees(price)}), and send it on WhatsApp. RSVPs come straight to you.`],
              ].map(([t, d], i) => (
                <li key={t} className="bg-card flex gap-4 rounded-xl border p-5">
                  <span className="bg-primary text-primary-foreground heading grid size-10 flex-none place-items-center rounded-full text-xl">{i + 1}</span>
                  <span>
                    <span className="block font-semibold">{t}</span>
                    <span className="text-muted-foreground mt-1 block text-sm">{d}</span>
                  </span>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section id="designs" aria-labelledby="designs-h" className="scroll-mt-16 py-[clamp(56px,7vw,96px)]">
          <div className={wrap}>
            <div className="mx-auto max-w-2xl text-center">
              <Badge variant="outline">Designs</Badge>
              <h2 id="designs-h" className="heading mt-4 text-[clamp(36px,4.6vw,58px)] leading-[1.02]">
                Start from a design you love.
              </h2>
              <p className="text-muted-foreground mt-3">Real invitations from our studio, ready for your names, dates and photos. Tap one to open it the way your guests will.</p>
            </div>
            {sp.busy ? (
              <p role="status" className="bg-destructive/10 text-destructive mx-auto mt-8 max-w-xl rounded-lg px-4 py-3 text-center text-sm">
                Lots of new designs from this connection. Please continue one from &quot;My designs&quot;, or try again in an hour.
              </p>
            ) : null}
            <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {DESIGNS.map((d) => (
                <StudioCard key={d.id} id={d.id} name={d.name} blurb={d.blurb} tags={d.tags} thumb={designThumb(d.id)} base={base} price={story} was={0} />
              ))}
            </div>
            <div className="mx-auto mt-20 max-w-2xl text-center">
              <h3 className="heading text-[clamp(30px,3.6vw,44px)] leading-[1.05]">Or keep it simple.</h3>
              <p className="text-muted-foreground mt-2">Lighter designs where you also choose the colours, fonts and text size, and see every change as you type.</p>
            </div>
            <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {TEMPLATES.map((t) => (
                <TemplateCard key={t.id} id={t.id} name={t.name} blurb={t.blurb} tags={t.tags} palettes={t.palettes.map(({ id, label, bg, accent, ink }) => ({ id, label, bg, accent, ink }))} price={price} was={0} />
              ))}
            </div>
          </div>
        </section>

        <section aria-labelledby="inc-h" className="bg-muted border-y py-[clamp(56px,7vw,96px)]">
          <div className={`${wrap} grid gap-10 lg:grid-cols-[1fr_380px] lg:items-start`}>
            <div>
              <Badge variant="outline">What&apos;s included</Badge>
              <h2 id="inc-h" className="heading mt-4 text-[clamp(34px,4.2vw,52px)] leading-[1.04]">Everything guests need, in one link.</h2>
              <ul className="mt-8 grid gap-5 sm:grid-cols-2">
                {INCLUDED.map(([icon, t, d]) => (
                  <li key={t} className="flex gap-3.5">
                    <span className="bg-card text-clay-ink grid size-10 flex-none place-items-center rounded-full border [&_svg]:size-5">{icon}</span>
                    <span>
                      <span className="block font-semibold">{t}</span>
                      <span className="text-muted-foreground text-sm">{d}</span>
                    </span>
                  </li>
                ))}
              </ul>
            </div>
            <Card className="border-primary gap-0 border-2 p-7 shadow-[0_24px_60px_rgba(74,15,22,0.12)]">
              <h3 className="text-lg font-semibold">Do it yourself</h3>
              <p className="text-muted-foreground mt-1 text-sm">You design it, we host it.</p>
              <div className="mt-5">
                <p className="flex items-baseline gap-2">
                  <span className="text-muted-foreground text-sm">from</span>
                  <span className="heading text-[52px] leading-none font-semibold lining-nums">{rupees(price)}</span>
                </p>
                <p className="text-muted-foreground mt-2 text-sm">
                  One-time, when you publish: {rupees(price)} for the simpler designs, {rupees(story)} for our studio designs with a story line.
                </p>
              </div>
              <Button className="mt-6 w-full" size="lg" asChild>
                <a href="#designs">Choose a design</a>
              </Button>
              <ul className="mt-6 grid gap-2.5 text-sm">
                {["Free to design and preview", "Your own link: theweddinginviteco.xyz/i/your-names", "RSVP list you can download", "Edit any time until the wedding", "No ads, no app for guests"].map((t) => (
                  <li key={t} className="flex gap-2.5">
                    <Check className="text-sage mt-0.5 size-4 flex-none" strokeWidth={2.4} aria-hidden />
                    {t}
                  </li>
                ))}
              </ul>
              <p className="text-muted-foreground mt-6 border-t pt-5 text-sm">
                Rather we design it for you, with your story illustrated?{" "}
                <a href={`${siteUrl()}/#pricing`} className="text-foreground font-medium underline underline-offset-4">
                  See our custom packages
                </a>
              </p>
            </Card>
          </div>
        </section>

        <section aria-labelledby="faq-h" className="py-[clamp(56px,7vw,96px)]">
          <div className={`${wrap} max-w-3xl`}>
            <h2 id="faq-h" className="heading text-center text-[clamp(34px,4.2vw,52px)] leading-[1.04]">Questions</h2>
            <Accordion type="single" collapsible className="mt-8">
              {FAQ.map(([q, a]) => (
                <AccordionItem key={q} value={q}>
                  <AccordionTrigger className="text-left text-base">{q}</AccordionTrigger>
                  <AccordionContent className="text-muted-foreground">{a}</AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
            <p className="mt-8 text-center">
              <Button variant="outline" asChild>
                <a href={whatsappHref(publicWhatsApp(), "Hi! I have a question about the invitation builder.")} target="_blank" rel="noopener">
                  Ask us on WhatsApp
                </a>
              </Button>
            </p>
          </div>
        </section>
        <section className="border-t py-[clamp(56px,7vw,96px)]">
          <div className={wrap}>
            <SupportSection {...sup} />
          </div>
        </section>
      </main>
      <BuilderFooter />
    </div>
  );
}
