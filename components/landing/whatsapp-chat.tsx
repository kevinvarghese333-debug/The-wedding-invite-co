/* eslint-disable @next/next/no-img-element */
import { ArrowRight, CheckCheck } from "lucide-react";
import { EnquireButton } from "@/components/landing/enquiry";
import { CtaText } from "@/components/landing/cta";

type Msg =
  | { from: "in" | "out"; text: string; time: string; react?: string }
  | { from: "out"; link: "malavika" | "ishani" | "nila"; time: string };

const LINKS = {
  malavika: { title: "Malavika & Hari", sub: "21 · 02 · 2027 · Guruvayur", url: "theweddinginviteco.theinsiderfinds.com", art: "pc-lotus-art", img: "/media/cut/lotus.webp" },
  ishani: { title: "Ishani & Rudra", sub: "24 · 04 · 2027 · Rudraprayag", url: "theweddinginviteco.theinsiderfinds.com", art: "pc-temple-art", img: "" },
  nila: { title: "Nila & Aaron", sub: "New Year's Eve · Kochi", url: "theweddinginviteco.theinsiderfinds.com", art: "pc-night", img: "" },
};

const CHATS: { name: string; status: string; msgs: Msg[] }[] = [
  {
    name: "Anu",
    status: "online",
    msgs: [
      { from: "in", text: "Hey, is the wedding date fixed?", time: "7:02 pm" },
      { from: "out", text: "Yes! Wait, sending you the invite", time: "7:03 pm" },
      { from: "out", link: "malavika", time: "7:03 pm" },
      { from: "in", text: "Wow, this is beautiful 😍 Who made this?", time: "7:05 pm" },
      { from: "out", text: "The Wedding Invite Co. made it for us", time: "7:05 pm", react: "❤️" },
    ],
  },
  {
    name: "Family 🏡",
    status: "Amma, Achan, Chechi, +14",
    msgs: [
      { from: "in", text: "What time is the muhurtham? And how do we reach the temple?", time: "9:14 am" },
      { from: "out", link: "ishani", time: "9:15 am" },
      { from: "in", text: "Got it, the map opened right there 🙏 RSVP done for the 4 of us", time: "9:21 am", react: "🙏" },
      { from: "out", text: "Perfect, see you there 😊", time: "9:22 am" },
    ],
  },
];

function LinkCard({ k }: { k: keyof typeof LINKS }) {
  const l = LINKS[k];
  return (
    <div className="overflow-hidden rounded-md bg-[#cfeec7]">
      <div className={`art relative aspect-[16/9] overflow-hidden ${l.art}`}>
        {l.img ? <img src={l.img} alt="" className="absolute bottom-[4%] left-[36%] w-[28%]" /> : null}
        <div className="lbl !top-[18%]">
          <b className="!text-[22px]">{l.title}</b>
        </div>
      </div>
      <div className="px-2.5 py-2">
        <p className="text-[13px] font-semibold text-[#111b21]">{l.title}</p>
        <p className="text-[11.5px] text-[#54656f]">{l.sub}</p>
        <p className="text-[11px] text-[#54656f]/80">{l.url}</p>
      </div>
    </div>
  );
}

function Chat({ chat }: { chat: (typeof CHATS)[number] }) {
  return (
    <figure className="w-full max-w-[380px] overflow-hidden rounded-[28px] border-[6px] border-[#2a0a0e] bg-[#efe7de] shadow-[0_30px_60px_rgba(74,15,22,0.22)]">
      <figcaption className="flex items-center gap-3 bg-[#075e54] px-4 py-3 text-white">
        <span aria-hidden className="grid size-9 place-items-center rounded-full bg-white/20 text-sm font-semibold">
          {chat.name.slice(0, 1)}
        </span>
        <span className="min-w-0">
          <span className="block truncate text-[15px] font-medium">{chat.name}</span>
          <span className="block truncate text-[11.5px] text-white/75">{chat.status}</span>
        </span>
      </figcaption>
      <div className="flex flex-col gap-1.5 px-3 py-4 [background-image:radial-gradient(rgba(0,0,0,.035)_1px,transparent_1px)] [background-size:14px_14px]">
        {chat.msgs.map((m, i) => {
          const out = m.from === "out";
          return (
            <div key={i} className={`relative max-w-[82%] rounded-lg px-2 pt-1.5 pb-1 text-[14px] leading-snug text-[#111b21] shadow-[0_1px_0.5px_rgba(0,0,0,0.13)] ${out ? "self-end bg-[#d9fdd3]" : "self-start bg-white"} ${"react" in m && m.react ? "mb-3" : ""}`}>
              {"link" in m ? <LinkCard k={m.link} /> : <p className="px-1">{m.text}</p>}
              <p className="mt-0.5 flex items-center justify-end gap-1 text-[10.5px] text-[#667781]">
                {m.time}
                {out ? <CheckCheck className="size-3.5 text-[#53bdeb]" aria-hidden /> : null}
              </p>
              {"react" in m && m.react ? (
                <span className={`absolute -bottom-3.5 rounded-full bg-white px-1.5 text-[13px] shadow ${out ? "right-2" : "left-2"}`}>{m.react}</span>
              ) : null}
            </div>
          );
        })}
      </div>
    </figure>
  );
}

export function WhatsAppMoment() {
  return (
    <section aria-labelledby="moment-h" className="pc-section py-[clamp(64px,8vw,110px)]">
      <div className="pc-wrap">
        <div className="pc-head">
          <p className="pc-eyebrow">The moment it lands</p>
          <h2 id="moment-h">
            Shared on WhatsApp. <em>Talked about for weeks.</em>
          </h2>
          <p>One link in the chat. Guests open it, find the venue, reply in a tap, and ask who made it.</p>
        </div>
        <div className="mt-12 flex flex-wrap items-start justify-center gap-8 md:gap-12">
          <Chat chat={CHATS[0]} />
          <div className="hidden md:block md:pt-16">
            <Chat chat={CHATS[1]} />
          </div>
        </div>
        <div className="mt-12 flex justify-center">
          <EnquireButton size="lg" origin="whatsapp-moment" className="rounded-full">
            <CtaText /> <ArrowRight />
          </EnquireButton>
        </div>
      </div>
    </section>
  );
}
