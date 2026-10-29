"use client";

import * as React from "react";
import { useCountdown, SAMPLE_DATE } from "@/components/landing/countdown";

const LEAF_STYLES: React.CSSProperties[] = [
  { left: "5%", animationDelay: "0s" },
  { left: "17%", animationDelay: "1.2s", background: "#C5A18A" },
  { left: "29%", animationDelay: "2.7s", width: 9, height: 6 },
  { left: "41%", animationDelay: ".5s", background: "#A9B49F" },
  { left: "53%", animationDelay: "3.5s", background: "#C5A18A" },
  { left: "65%", animationDelay: "1.9s", width: 10, height: 6 },
  { left: "77%", animationDelay: "4.3s", background: "#D9C1AE" },
  { left: "89%", animationDelay: ".9s" },
  { left: "23%", animationDelay: "5s", background: "#A9B49F" },
  { left: "71%", animationDelay: "2.3s", background: "#C5A18A" },
];

function Vine({ flip = false }: { flip?: boolean }) {
  return (
    <svg aria-hidden viewBox="0 0 280 96" width="280" height="96" className="flex-none" style={flip ? { transform: "scaleY(-1)" } : undefined} fill="none" stroke="#879581" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round">
      <path d="M-6 8C36 18 66 48 108 92" />
      <path d="M286 8C244 18 214 48 172 92" />
      <path d="M30 18C26 8 30 0 38 -2C40 8 36 15 30 18Z" />
      <path d="M54 34C56 22 64 16 74 16C70 27 63 33 54 34Z" />
      <path d="M74 54C68 44 70 34 78 28C83 38 80 48 74 54Z" />
      <path d="M250 18C254 8 250 0 242 -2C240 8 244 15 250 18Z" />
      <path d="M226 34C224 22 216 16 206 16C210 27 217 33 226 34Z" />
      <path d="M206 54C212 44 210 34 202 28C197 38 200 48 206 54Z" />
      {!flip && <circle cx="96" cy="78" r="4" fill="#C5A18A" stroke="none" />}
      {!flip && <circle cx="184" cy="78" r="4" fill="#C5A18A" stroke="none" />}
    </svg>
  );
}

export function SampleInvite() {
  const [opened, setOpened] = React.useState(false);
  const [reply, setReply] = React.useState<"" | "yes" | "no">("");
  const c = useCountdown(SAMPLE_DATE);
  const label = "text-[9px] font-medium tracking-[0.28em] uppercase";

  return (
    <div className="flex flex-col items-center gap-3.5">
      <div className="w-[300px] rounded-[48px] bg-[#26302A] p-2.5 shadow-[0_40px_80px_rgba(55,70,60,0.28)]">
        <div className="relative h-[600px] overflow-hidden rounded-[38px] bg-[#F7F3ED] text-[#37463C]">
          {!opened ? (
            <div className="absolute inset-0 flex flex-col items-center justify-between">
              <Vine />
              <div className="px-5 text-center">
                <p className="mb-3.5 text-[10px] font-medium tracking-[0.3em] text-[#56634F] uppercase">The wedding of</p>
                <p className="heading text-[50px] leading-[0.95]">Anna</p>
                <p className="heading my-0.5 text-[30px] leading-none text-[#7E5C47] italic">&amp;</p>
                <p className="heading text-[50px] leading-[0.95]">Joel</p>
                <p className="mt-4 text-xs tracking-[0.28em] text-[#4E5B49]">06 · 02 · 2027</p>
                <button
                  type="button"
                  onClick={() => setOpened(true)}
                  aria-label="Open the sample invitation"
                  className="seal pulse heading mx-auto mt-7 grid size-[82px] cursor-pointer place-items-center rounded-full border-0 text-[22px] font-semibold tracking-[0.12em] text-[#FFFDF9]"
                  style={{ background: "radial-gradient(circle at 35% 30%, #D8BBA6, #B08A71 60%, #8E6C56)" }}
                >
                  A J
                </button>
                <p className="mt-4 text-[10px] font-medium tracking-[0.26em] text-[#4E5B49] uppercase">Tap the seal to open</p>
              </div>
              <Vine flip />
            </div>
          ) : (
            <>
              <div className="no-scrollbar absolute inset-0 overflow-y-auto">
                <div className="rise bg-[#ECE9DE] px-5 pt-11 pb-6 text-center">
                  <p className={`${label} mb-3 text-[#56634F]`}>Together with their families</p>
                  <p className="heading text-[42px] leading-none">
                    Anna <em className="text-[30px] font-normal text-[#7E5C47]">&amp;</em> Joel
                  </p>
                  <p className="mt-3.5 text-[10px] tracking-[0.22em] text-[#4E5B49] uppercase">Saturday · 6 February 2027</p>
                  <p className="heading mt-1.5 text-[17px] text-[#4E5B49] italic">Kochi, Kerala</p>
                </div>
                <p className="heading mx-5 mt-4 text-center text-[17px] leading-snug text-[#4E5B49] italic">
                  By the grace of God and with the blessings of our families, we invite you to celebrate our wedding.
                </p>
                <div className="mx-4 my-4 rounded-2xl bg-[#E4E2D5] px-2.5 py-4 text-center">
                  <p className={`${label} mb-2.5 text-[#4E5B49]`}>Counting down</p>
                  <div className="grid grid-cols-4 gap-1">
                    {([[c.d, "Days"], [c.h, "Hours"], [c.m, "Mins"], [c.s, "Secs"]] as const).map(([v, l]) => (
                      <div key={l}>
                        <p className="heading text-[28px] leading-none tabular-nums">{v}</p>
                        <p className="mt-1.5 text-[8px] tracking-[0.18em] text-[#4E5B49] uppercase">{l}</p>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="px-4 pt-1">
                  <p className="heading mb-3 text-center text-2xl">
                    The <em className="font-normal text-[#7E5C47]">celebrations</em>
                  </p>
                  {[
                    { when: "Sat · 30 January", what: "Engagement", lines: ["5:00 PM · Parish Church, Kochi"] },
                    { when: "Sat · 6 February · The wedding", what: "Holy Matrimony", lines: ["3:00 PM · Parish Church, Kochi", "6:30 PM · Reception, Kochi"] },
                  ].map((e) => (
                    <div key={e.what} className="mb-2.5 rounded-[14px] border border-[#E4E1D6] bg-[#FFFDF9] p-3.5 text-left">
                      <p className={`${label} tracking-[0.2em] text-[#56634F]`}>{e.when}</p>
                      <p className="heading mt-1 mb-0.5 text-xl font-semibold">{e.what}</p>
                      {e.lines.map((l) => (
                        <p key={l} className="text-[13px] text-[#4E5B49]">{l}</p>
                      ))}
                    </div>
                  ))}
                </div>
                <div className="mx-4 mt-5 mb-3 rounded-2xl bg-[#E4E2D5] px-4 py-5 text-center">
                  <p className={`${label} mb-1 text-[#4E5B49]`}>Kindly respond</p>
                  <p className="heading mb-3.5 text-2xl">
                    Will you <em className="font-normal text-[#755540]">join us?</em>
                  </p>
                  {reply === "" ? (
                    <div className="grid grid-cols-2 gap-2">
                      <button type="button" onClick={() => setReply("yes")} className="min-h-11 cursor-pointer rounded-xl border border-[#37463C] bg-[#37463C] text-[13px] font-medium text-[#F7F3ED]">
                        Joyfully accept
                      </button>
                      <button type="button" onClick={() => setReply("no")} className="min-h-11 cursor-pointer rounded-xl border border-[#A9B49F] bg-[#FFFDF9] text-[13px] font-medium">
                        Can&apos;t make it
                      </button>
                    </div>
                  ) : (
                    <>
                      <p className="rise heading text-[19px] leading-snug" role="status">
                        {reply === "yes" ? "Thank you! Anna and Joel can't wait to see you." : "We'll miss you. Thank you for letting us know."}
                      </p>
                      <button type="button" onClick={() => setReply("")} className="mt-2 min-h-11 cursor-pointer px-3 text-[11px] tracking-[0.14em] uppercase underline">
                        Change reply
                      </button>
                    </>
                  )}
                </div>
                <div className="pt-0.5 pb-6 text-center">
                  <button
                    type="button"
                    onClick={() => {
                      setOpened(false);
                      setReply("");
                    }}
                    className="min-h-11 cursor-pointer px-4 text-[10px] tracking-[0.2em] text-[#4E5B49] uppercase"
                  >
                    Close and replay
                  </button>
                </div>
              </div>
              <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
                {LEAF_STYLES.map((s, i) => (
                  <span key={i} className="leaf" style={s} />
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
