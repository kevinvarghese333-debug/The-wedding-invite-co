"use client";

import * as React from "react";
import { ArrowRight, MessageCircle } from "lucide-react";
import { EnquireButton } from "@/components/landing/enquiry";
import { track } from "@/lib/track";

/* Short reasons to trust us, right after the live samples. */
export function TrustStrip() {
  const items = ["Designed for you, never a template", "One link for every function", "Opens on any phone, nothing to install", "Every RSVP in one list"];
  return (
    <div className="border-y bg-[#FFFAF5]">
      <ul className="mx-auto flex w-full max-w-[1200px] flex-wrap items-center justify-center gap-x-8 gap-y-2 px-4 py-4 text-[13px] font-medium text-[#6E4A47]">
        {items.map((t) => (
          <li key={t} className="flex items-center gap-2">
            <span aria-hidden className="size-1.5 rounded-full bg-[#B8893A]" />
            {t}
          </li>
        ))}
      </ul>
    </div>
  );
}

/* A soft call to action between sections. */
export function InlineCta({ text, origin }: { text: string; origin: string }) {
  return (
    <div className="mx-auto flex w-full max-w-[1200px] flex-col items-center gap-4 px-4 py-12 text-center sm:flex-row sm:justify-center sm:gap-6">
      <p className="heading text-[clamp(24px,2.6vw,32px)] leading-tight">{text}</p>
      <EnquireButton size="lg" origin={origin} className="rounded-full">
        Check my date <ArrowRight />
      </EnquireButton>
    </div>
  );
}

/* Phones: a bar pinned to the bottom once the hero has scrolled away.
   Desktop: a floating WhatsApp button. Both stay out of the way of the form at the end. */
export function StickyCta({ whatsapp }: { whatsapp: string }) {
  const [show, setShow] = React.useState(false);
  React.useEffect(() => {
    const onScroll = () => {
      const past = window.scrollY > window.innerHeight * 1.2;
      const form = document.getElementById("enquire");
      const atForm = form ? form.getBoundingClientRect().top < window.innerHeight * 0.85 : false;
      setShow(past && !atForm);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <>
      <div
        className={`fixed inset-x-0 bottom-0 z-50 border-t border-[#EAD9CD] bg-[#FFFAF5]/95 px-3 pt-2.5 pb-[calc(10px+env(safe-area-inset-bottom))] backdrop-blur-md transition-transform duration-300 md:hidden ${show ? "translate-y-0" : "translate-y-full"}`}
        aria-hidden={!show}
      >
        <div className="flex gap-2.5">
          <a
            href={whatsapp}
            target="_blank"
            rel="noopener"
            tabIndex={show ? 0 : -1}
            onClick={() => track("Contact", { method: "whatsapp", origin: "sticky-bar" })}
            className="flex h-11 flex-1 items-center justify-center gap-2 rounded-full border border-[#6B1420]/30 text-[15px] font-medium text-[#4A0F16]"
          >
            <MessageCircle className="size-[18px]" aria-hidden /> WhatsApp
          </a>
          <EnquireButton origin="sticky-bar" tabIndex={show ? 0 : -1} className="h-11 flex-[1.4] rounded-full text-[15px]">
            Check my date <ArrowRight />
          </EnquireButton>
        </div>
      </div>

      <a
        href={whatsapp}
        target="_blank"
        rel="noopener"
        aria-label="Chat with us on WhatsApp"
        onClick={() => track("Contact", { method: "whatsapp", origin: "floating" })}
        className={`group fixed right-6 bottom-6 z-50 hidden items-center gap-2 rounded-full bg-[#6B1420] py-3 pr-5 pl-4 text-[15px] font-medium text-[#FBEFE6] shadow-[0_14px_30px_rgba(74,15,22,0.35)] transition-all duration-300 hover:bg-[#55101A] md:flex ${show ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-4 opacity-0"}`}
      >
        <MessageCircle className="size-5" aria-hidden />
        <span>Questions? Chat with us</span>
      </a>
    </>
  );
}
