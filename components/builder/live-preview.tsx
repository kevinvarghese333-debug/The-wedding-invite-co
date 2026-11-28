"use client";
/* eslint-disable @next/next/no-img-element */
import * as React from "react";
import { Play } from "lucide-react";

/* The design page's phone. It shows a still picture of the design first and loads the live,
   animated invitation only when someone taps, so the page opens fast and doesn't jump on phones. */
export function LivePreview({ src, poster, title }: { src: string; poster?: string; title: string }) {
  const [live, setLive] = React.useState(!poster);
  if (live) return <iframe src={src} title={title} className="size-full border-0" allow="autoplay" />;
  return (
    <button type="button" onClick={() => setLive(true)} className="group relative block size-full cursor-pointer text-left" aria-label={`See it live: ${title}`}>
      <img src={poster} alt="" width={390} height={760} fetchPriority="high" className="size-full object-cover object-top" />
      <span className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-black/55 to-transparent" aria-hidden />
      <span className="absolute inset-x-0 bottom-7 flex justify-center">
        <span className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-3 text-[15px] font-semibold text-[#3A0D12] shadow-lg transition-transform group-hover:scale-[1.04]">
          <Play className="size-4 fill-current" aria-hidden /> See it live
        </span>
      </span>
    </button>
  );
}
