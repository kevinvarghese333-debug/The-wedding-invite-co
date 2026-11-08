/* eslint-disable @next/next/no-img-element */
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { ArrowRight, Check } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Logo } from "@/components/landing/art";
import { EnquiryForm, EnquiryProvider, EnquireButton } from "@/components/landing/enquiry";
import { CtaText, WhatsAppButton } from "@/components/landing/cta";
import { StickyCta } from "@/components/landing/funnel";
import { AUDIENCES, findAudience } from "@/lib/audiences";
import { SAMPLES, sampleHref } from "@/lib/samples";
import { publicWhatsApp, siteUrl, STUDIO } from "@/lib/config";
import { whatsappHref } from "@/lib/whatsapp";

export const dynamicParams = false;
export function generateStaticParams() {
  return AUDIENCES.map((a) => ({ audience: a.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ audience: string }> }): Promise<Metadata> {
  const a = findAudience((await params).audience);
  if (!a) return {};
  return {
    title: { absolute: a.title },
    description: a.description,
    alternates: { canonical: `${siteUrl()}/${a.slug}` },
    openGraph: { title: a.title, description: a.description, url: `${siteUrl()}/${a.slug}`, images: [{ url: "/og.jpg", width: 1200, height: 630 }] },
  };
}

export default async function AudiencePage({ params }: { params: Promise<{ audience: string }> }) {
  const a = findAudience((await params).audience);
  if (!a) notFound();
  const wa = publicWhatsApp();
  const chat = whatsappHref(wa, "Hi! We'd like a free preview of our wedding invitation. Our names are ");
  const samples = SAMPLES.filter((s) => s.tags.includes(a.tag)).slice(0, 6);
  const wrap = "mx-auto w-full max-w-[1100px] px-[clamp(16px,5vw,40px)]";
  const faqLd = { "@context": "https://schema.org", "@type": "FAQPage", mainEntity: a.faq.map(([q, ans]) => ({ "@type": "Question", name: q, acceptedAnswer: { "@type": "Answer", text: ans } })) };

  return (
    <EnquiryProvider whatsapp={wa}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }} />
      <header className="sticky top-0 z-40 border-b bg-[#F8F1EA]/90 backdrop-blur-md">
        <nav aria-label="Main" className={`${wrap} flex h-16 items-center justify-between gap-4`}>
          <a href="/" aria-label={`${STUDIO} home`}>
            <Logo name={STUDIO} />
          </a>
          <WhatsAppButton href={chat} origin={`${a.slug}-header`} size="sm">
            WhatsApp
          </WhatsAppButton>
        </nav>
      </header>
      <main>
        <section className="relative overflow-hidden bg-[radial-gradient(ellipse_70%_60%_at_50%_40%,#7C1A24,#5C1018_55%,#3F0A10)] py-[clamp(64px,10vw,120px)] text-[#F7E6DC]">
          <div className={`${wrap} text-center`}>
            <p className="text-xs tracking-[0.26em] text-[#F7D6C4]/75 uppercase">{STUDIO} · Kerala</p>
            <h1 className="heading mx-auto mt-5 max-w-[880px] text-[clamp(40px,6vw,76px)] leading-[1.02] text-[#FBEFE6]">
              {a.h1} <em className="font-normal text-[#E9C29A]">{a.h1Accent}</em>
            </h1>
            {a.malayalam ? <p className="mt-5 text-lg text-[#F4D9C8]" lang="ml">{a.malayalam}</p> : null}
            <p className="mx-auto mt-5 max-w-[640px] text-[17px] leading-relaxed text-[#F7E6DC]/85">{a.intro}</p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <WhatsAppButton href={chat} origin={`${a.slug}-hero`} size="lg" variant="clay" className="rounded-full">
                Get a free preview on WhatsApp
              </WhatsAppButton>
              <EnquireButton origin={`${a.slug}-hero`} variant="link" className="text-[#F4D9C8] underline underline-offset-4">
                or send your names here
              </EnquireButton>
            </div>
            <p className="mt-6 text-sm text-[#F7E6DC]/70">The Classic Invitation ₹4,999 · The Signature Invitation ₹8,490 · one-time</p>
          </div>
        </section>

        <section className="py-[clamp(56px,8vw,96px)]">
          <div className={`${wrap} grid gap-5 sm:grid-cols-2`}>
            {a.points.map(([t, d]) => (
              <Card key={t} className="gap-2 p-6">
                <h2 className="flex items-center gap-2 font-semibold">
                  <Check className="text-sage size-4" strokeWidth={2.6} aria-hidden /> {t}
                </h2>
                <p className="text-muted-foreground text-sm leading-relaxed">{d}</p>
              </Card>
            ))}
          </div>
        </section>

        {samples.length ? (
          <section className="bg-muted border-y py-[clamp(56px,8vw,96px)]">
            <div className={wrap}>
              <div className="text-center">
                <Badge variant="outline">Live invitations</Badge>
                <h2 className="heading mt-4 text-[clamp(32px,4vw,48px)] leading-[1.05]">
                  Open one on your <em className="text-clay-ink font-normal">phone.</em>
                </h2>
              </div>
              <ul className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {samples.map((s) => (
                  <li key={s.slug}>
                    <a href={sampleHref(s.slug)} target="_blank" rel="noopener" className="bg-card flex h-full flex-col rounded-xl border p-5 transition-shadow hover:shadow-md">
                      <span className="heading text-2xl">{s.names}</span>
                      <span className="text-muted-foreground mt-1 flex-1 text-sm">{s.style}</span>
                      <span className="mt-4 inline-flex items-center gap-1 text-sm font-medium">
                        Open invite <ArrowRight className="size-4" aria-hidden />
                      </span>
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </section>
        ) : null}

        <section className="py-[clamp(56px,8vw,96px)]">
          <div className={`${wrap} max-w-[760px]`}>
            <h2 className="heading text-center text-[clamp(32px,4vw,48px)]">Questions families ask</h2>
            <dl className="mt-8 grid gap-6">
              {a.faq.map(([q, ans]) => (
                <div key={q} className="border-b pb-6">
                  <dt className="font-semibold">{q}</dt>
                  <dd className="text-muted-foreground mt-2 leading-relaxed">{ans}</dd>
                </div>
              ))}
            </dl>
          </div>
        </section>

        <section id="enquire" className="bg-muted border-t py-[clamp(56px,8vw,96px)]">
          <div className={`${wrap} max-w-[720px]`}>
            <h2 className="heading text-center text-[clamp(36px,5vw,60px)] leading-[1.02]">
              Send your names. <em className="text-clay-ink font-normal">We&apos;ll build a preview.</em>
            </h2>
            <Card className="mt-8 gap-0 p-[clamp(20px,4vw,36px)]">
              <EnquiryForm origin={`${a.slug}-form`} whatsapp={wa} />
            </Card>
            <p className="text-muted-foreground mt-6 text-center text-sm">
              <a href="/" className="underline underline-offset-4">See all our invitations</a>
              {" · "}
              <EnquireButton origin={`${a.slug}-bottom`} variant="link" className="h-auto p-0 text-sm">
                <CtaText />
              </EnquireButton>
            </p>
          </div>
        </section>
      </main>
      <footer className="border-t py-8">
        <nav aria-label="Invitations by type" className={`${wrap} text-muted-foreground flex flex-wrap justify-center gap-x-5 gap-y-2 text-[13px]`}>
          {AUDIENCES.map((x) => (
            <a key={x.slug} href={`/${x.slug}`} className="hover:text-foreground">{x.nav}</a>
          ))}
          <a href="/privacy" className="hover:text-foreground">Privacy</a>
        </nav>
        <p className="text-muted-foreground mt-4 text-center text-[13px]">© {new Date().getFullYear()} {STUDIO} · Wedding invitation websites, made in Kerala.</p>
      </footer>
      <StickyCta whatsapp={chat} />
    </EnquiryProvider>
  );
}
