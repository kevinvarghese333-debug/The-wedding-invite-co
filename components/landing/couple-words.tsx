/* eslint-disable @next/next/no-img-element */
import { listCoupleWords, monthLabel } from "@/lib/couples";

/* "What our happily married couples say": only words marked "On the website" in /admin/couples.
   Renders nothing until there is at least one. */
export function CoupleWords() {
  let words: ReturnType<typeof listCoupleWords> = [];
  try {
    words = listCoupleWords("published").slice(0, 12);
  } catch {
    return null;
  }
  if (!words.length) return null;
  const few = words.length < 3;

  return (
    <section id="couples" aria-labelledby="couples-h" className="pc-section py-[clamp(64px,8vw,110px)]">
      <div className="pc-wrap">
        <div className="pc-head">
          <p className="pc-eyebrow">Happily ever after</p>
          <h2 id="couples-h">
            What our happily married <em>couples say.</em>
          </h2>
        </div>
        <ul
          className={`mt-12 flex items-start snap-x snap-mandatory gap-6 overflow-x-auto pb-6 [scrollbar-width:none] md:grid md:overflow-visible md:pb-0 ${few ? "md:mx-auto md:max-w-[820px] md:grid-cols-2" : "md:grid-cols-3"}`}
        >
          {words.map((w, i) => (
            <li key={w.id} className="w-[84%] flex-none snap-center md:w-auto">
              <figure className={`flex h-full flex-col bg-[#FFFAF5] p-4 shadow-[0_1px_0_rgba(60,10,16,.08),0_14px_30px_rgba(60,10,16,.12)] ${i % 2 ? "md:rotate-[1deg]" : "md:-rotate-[1deg]"}`}>
                {w.photo ? (
                  <div className="relative">
                    <span aria-hidden className="absolute -top-3 left-1/2 z-10 h-5 w-16 -translate-x-1/2 -rotate-3 bg-[#EAD9CD]/85" />
                    <img src={`/api/photos/${w.photo}`} alt={`${w.names} on their wedding day`} loading="lazy" className="aspect-[4/3] w-full object-cover" />
                  </div>
                ) : null}
                <blockquote className="relative mt-5 flex-1 px-1">
                  <span aria-hidden className="heading absolute -top-4 -left-1 text-5xl leading-none text-[#B8893A]/60">&ldquo;</span>
                  <p className="heading pl-5 text-[19px] leading-snug whitespace-pre-line text-[#3A0D12]">{w.quote}</p>
                </blockquote>
                <figcaption className="mt-4 border-t border-[#EAD9CD] px-1 pt-3">
                  <span className="block text-[30px] leading-none text-[#6B1420]" style={{ fontFamily: "'Mrs Saint Delafield', cursive" }}>
                    {w.names}
                  </span>
                  {w.place || w.wedding_month ? (
                    <span className="text-muted-foreground mt-1 block text-[12px] tracking-[0.16em] uppercase">
                      {[w.place, monthLabel(w.wedding_month)].filter(Boolean).join(" · ")}
                    </span>
                  ) : null}
                </figcaption>
              </figure>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
