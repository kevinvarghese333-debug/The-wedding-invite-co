/* eslint-disable @next/next/no-img-element */
import { listCoupleWords, monthLabel, type CoupleWord } from "@/lib/couples";

/* "What our happily married couples say": words marked "On the website" in /admin/couples.
   With four or more, the cards drift slowly to the left in a continuous loop (pausing on hover).
   With fewer, they sit still in the centre. Renders nothing until there is at least one. */

function initials(names: string) {
  return names
    .split(/\s*(?:&|and)\s*/i)
    .map((n) => n.trim()[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("&");
}

function Card({ w }: { w: CoupleWord }) {
  const where = [w.place, monthLabel(w.wedding_month)].filter(Boolean).join(" · ");
  return (
    <figure className="flex h-full w-[min(84vw,400px)] flex-none flex-col rounded-2xl bg-white p-6 shadow-[0_1px_2px_rgba(60,10,16,.06),0_12px_30px_rgba(60,10,16,.08)] sm:p-7">
      {w.title ? <p className="heading text-[22px] leading-snug text-[#4A0F16]">&ldquo;{w.title}&rdquo;</p> : null}
      <blockquote className={`flex-1 text-[15px] leading-[1.65] text-[#5B3B39] ${w.title ? "mt-3" : ""}`}>
        <p className="line-clamp-5">{w.title ? w.quote : <>&ldquo;{w.quote}&rdquo;</>}</p>
      </blockquote>
      <figcaption className="mt-6 flex items-center gap-3.5">
        {w.photo ? (
          <img src={`/api/photos/${w.photo}`} alt={`${w.names} on their wedding day`} loading="lazy" className="size-12 flex-none rounded-full object-cover" />
        ) : (
          <span aria-hidden className="heading grid size-12 flex-none place-items-center rounded-full bg-[#F4E3D7] text-[15px] text-[#6B1420]">
            {initials(w.names)}
          </span>
        )}
        <span className="min-w-0">
          <span className="block truncate font-medium text-[#3A0D12]">{w.names}</span>
          {where ? <span className="block truncate text-[13px] text-[#8A6B66]">{where}</span> : null}
        </span>
      </figcaption>
    </figure>
  );
}

function Row({ words, seconds, offset = false }: { words: CoupleWord[]; seconds: number; offset?: boolean }) {
  // The list is drawn twice so the loop has no seam; the second copy is hidden from screen readers.
  return (
    <div className="pc-marquee group">
      <div className={`pc-marquee-track ${offset ? "pl-[200px]" : ""}`} style={{ animationDuration: `${seconds}s` }}>
        {[0, 1].map((copy) => (
          <ul key={copy} className="flex gap-6 pr-6" aria-hidden={copy === 1 || undefined}>
            {words.map((w) => (
              <li key={w.id} className="flex">
                <Card w={w} />
              </li>
            ))}
          </ul>
        ))}
      </div>
    </div>
  );
}

export function CoupleWords() {
  let words: CoupleWord[] = [];
  try {
    words = listCoupleWords("published").slice(0, 24);
  } catch {
    return null;
  }
  if (!words.length) return null;

  const moving = words.length >= 4;
  const twoRows = words.length >= 8;
  const half = Math.ceil(words.length / 2);
  const rowA = twoRows ? words.slice(0, half) : words;
  const rowB = twoRows ? words.slice(half) : [];

  return (
    <section id="couples" aria-labelledby="couples-h" className="pc-section overflow-hidden py-[clamp(64px,8vw,110px)]">
      <div className="pc-wrap">
        <div className="pc-head">
          <p className="pc-eyebrow">Happily ever after</p>
          <h2 id="couples-h">
            What our happily married <em>couples say.</em>
          </h2>
        </div>
      </div>
      {moving ? (
        <div className="mt-12 grid gap-6">
          <Row words={rowA} seconds={rowA.length * 11} />
          {rowB.length ? <Row words={rowB} seconds={rowB.length * 13} offset /> : null}
        </div>
      ) : (
        <div className="pc-wrap">
          <ul className="mt-12 flex flex-wrap justify-center gap-6">
            {words.map((w) => (
              <li key={w.id} className="flex">
                <Card w={w} />
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}
