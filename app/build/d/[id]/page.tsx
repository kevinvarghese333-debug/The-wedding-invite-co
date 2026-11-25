import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, CalendarCheck, CalendarHeart, ExternalLink, Headset, Link2, MessageCircle, Pencil, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BuilderFooter, BuilderHeader } from "@/components/builder/header";
import { PriceTag } from "@/components/builder/price-tag";
import { AddonPicker, LinksDemo } from "@/components/builder/funnel";
import { SupportSection } from "@/components/builder/support";
import { findDesign } from "@/lib/builder/designs";
import { findTemplate } from "@/lib/builder/templates";
import { getBase, prices, support } from "@/lib/builder/server";
import { startDesign } from "@/app/build/actions";
import { builderUrl, siteUrl } from "@/lib/config";
import { rupees } from "@/lib/format";

type Props = { params: Promise<{ id: string }>; searchParams: Promise<{ p?: string }> };

export async function generateMetadata({ params }: Props) {
  const { id } = await params;
  const d = findDesign(id) ?? findTemplate(id);
  return { title: d ? `${d.name} wedding invitation` : "Design", description: d?.blurb };
}

const PLAN: [React.ReactNode, string][] = [
  [<Link2 key="a" />, "Different links for different guests"],
  [<CalendarHeart key="b" />, "Every function, with maps and calendar"],
  [<Send key="c" />, "RSVPs in one list you can download"],
  [<Pencil key="d" />, "Edit anything, even after sending"],
  [<CalendarCheck key="e" />, "Live for a full year"],
  [<MessageCircle key="f" />, "Share on WhatsApp in one tap"],
];

/* One design, before starting: the real thing in a phone, the plan with add-ons, and what you get. */
export default async function DesignPage({ params, searchParams }: Props) {
  const { id } = await params;
  const { p: palette } = await searchParams;
  const design = findDesign(id);
  const template = design ? undefined : findTemplate(id);
  const d = design ?? template;
  if (!d) notFound();
  const base = await getBase();
  const pr = prices(d.id);
  const sup = support();
  const preview = `${base}/thumb/${d.id}?full=1${palette ? `&p=${encodeURIComponent(palette)}` : ""}`;
  const share = `https://wa.me/?text=${encodeURIComponent(`Look at this wedding invitation design: ${d.name}\n${builderUrl()}/d/${d.id}`)}`;
  return (
    <div className="bg-muted/40 min-h-dvh">
      <BuilderHeader base={base} active="designs" />
      <main className="mx-auto grid max-w-6xl gap-10 px-4 py-8 sm:px-6 lg:grid-cols-[400px_1fr] lg:py-12">
        <div className="lg:sticky lg:top-24 lg:self-start">
          <div className="mx-auto h-[740px] max-h-[calc(100dvh-160px)] w-full max-w-[380px] overflow-hidden rounded-[42px] border-[10px] border-[#2a0a0e] bg-white shadow-[0_30px_60px_rgba(74,15,22,0.2)]">
            <iframe src={preview} title={`${d.name}: sample invitation`} className="size-full border-0" allow="autoplay" />
          </div>
          <p className="mt-3 text-center">
            <a href={preview} target="_blank" rel="noopener" className="text-muted-foreground inline-flex items-center gap-1.5 text-sm font-medium hover:underline">
              Open in a new tab <ExternalLink className="size-3.5" />
            </a>
          </p>
        </div>

        <div className="grid content-start gap-14">
          <form action={startDesign} className="bg-card grid gap-6 rounded-3xl border p-6 shadow-sm sm:p-8">
            <input type="hidden" name="template" value={d.id} />
            {palette ? <input type="hidden" name="palette" value={palette} /> : null}
            <div>
              <div className="flex flex-wrap gap-1.5">
                {d.tags.map((t) => (
                  <span key={t} className="bg-secondary text-secondary-foreground rounded-full px-2.5 py-0.5 text-xs font-medium">
                    {t}
                  </span>
                ))}
              </div>
              <h1 className="heading mt-3 text-[clamp(40px,5vw,56px)] leading-[1]">{d.name}</h1>
              <p className="text-muted-foreground mt-3 text-[17px]">{d.blurb}</p>
              <div className="mt-5">
                <PriceTag base={pr.base} was={pr.was} size="lg" />
              </div>
              <p className="text-muted-foreground mt-2 text-sm">Free to design. Pay once, only when you publish.</p>
            </div>
            <AddonPicker prices={pr} mode="design" />
            <div className="grid gap-3 sm:grid-cols-[1.3fr_1fr]">
              <Button type="submit" size="lg" className="h-14 rounded-full text-base">
                Start for free <ArrowRight />
              </Button>
              <Button variant="outline" size="lg" className="h-14 rounded-full text-base" asChild>
                <a href={share} target="_blank" rel="noopener">
                  <MessageCircle /> Share with family
                </a>
              </Button>
            </div>
            <p className="text-muted-foreground -mt-2 text-sm">
              No payment needed. Your invitation opens for editing straight away. Rather have our team set it up?{" "}
              <a href={`${siteUrl()}/#studio`} className="text-primary font-medium underline-offset-4 hover:underline">
                See The Studio
              </a>
            </p>
          </form>

          <section aria-labelledby="links-h">
            <h2 id="links-h" className="heading text-[clamp(32px,4vw,44px)] leading-[1.05]">
              Different links for <em className="text-clay-ink">different guests</em>
            </h2>
            <p className="text-muted-foreground mt-2">Pick a link to see what those guests get. Every plan includes up to three.</p>
            <div className="mt-6">
              <LinksDemo />
            </div>
            <div className="bg-clay-soft/60 mt-4 flex flex-wrap items-center justify-between gap-4 rounded-2xl p-5">
              <div className="min-w-0">
                <p className="font-semibold">Want every guest greeted by name?</p>
                <p className="text-muted-foreground text-sm">
                  Add up to 50 personal links, each opening with <span className="font-serif italic">&ldquo;Dear Sharma family&rdquo;</span> and only their functions. {rupees(pr.links)}, as an add-on above.
                </p>
              </div>
            </div>
          </section>

          <section aria-labelledby="plan-h">
            <h2 id="plan-h" className="heading text-[clamp(32px,4vw,44px)] leading-[1.05]">Every plan comes with</h2>
            <ul className="mt-6 grid gap-x-8 gap-y-5 sm:grid-cols-2">
              {PLAN.map(([icon, t]) => (
                <li key={t} className="flex items-center gap-3 text-[17px]">
                  <span className="text-primary [&_svg]:size-5" aria-hidden>
                    {icon}
                  </span>
                  {t}
                </li>
              ))}
            </ul>
          </section>

          <section aria-labelledby="next-h">
            <h2 id="next-h" className="heading text-[clamp(32px,4vw,44px)] leading-[1.05]">What happens next</h2>
            <ol className="mt-6 grid gap-6">
              {[
                ["Start for free", "This design opens for editing straight away. No account, no payment."],
                ["Add your details", "Names, functions, venues, photos and music. See every change in the phone as you go."],
                ["Publish and share", `Pay ${rupees(pr.base)} once, choose your link and send it on WhatsApp. Replies come straight to you.`],
              ].map(([t, s], i) => (
                <li key={t} className="flex gap-4">
                  <span className="bg-secondary text-muted-foreground grid size-10 flex-none place-items-center rounded-full font-semibold">{i + 1}</span>
                  <span>
                    <span className="block text-[17px] font-semibold">{t}</span>
                    <span className="text-muted-foreground block">{s}</span>
                  </span>
                </li>
              ))}
            </ol>
            <p className="mt-8 text-[17px]">
              <Headset className="text-primary mr-2 inline size-5 align-[-4px]" aria-hidden />
              Not sure yet?{" "}
              <a href={sup.call} target="_blank" rel="noopener" className="text-primary font-medium hover:underline">
                Book a free call with us
              </a>{" "}
              or{" "}
              <a href={`https://wa.me/${sup.phone}`} target="_blank" rel="noopener" className="text-primary font-medium hover:underline">
                ask us on WhatsApp
              </a>
              .
            </p>
          </section>

          <SupportSection {...sup} />

          <p className="text-right">
            <Link href={`${base}/#designs`} className="text-primary inline-flex items-center gap-1.5 font-medium hover:underline">
              See all wedding designs <ArrowRight className="size-4" />
            </Link>
          </p>
        </div>
      </main>
      <BuilderFooter />
    </div>
  );
}
