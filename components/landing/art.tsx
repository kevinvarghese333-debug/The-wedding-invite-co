import { cn } from "@/lib/utils";

/** Line-drawn sprig used as decoration. */
export function Sprig({ className, stroke = "#879581" }: { className?: string; stroke?: string }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 120 200" className={cn("pointer-events-none", className)} fill="none" stroke={stroke} strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M60 198C57 150 63 96 60 8" />
      <path d="M60 168C42 160 30 146 27 128C45 133 56 148 60 168Z" />
      <path d="M60 168C78 160 90 146 93 128C75 133 64 148 60 168Z" />
      <path d="M60 128C44 120 34 107 32 91C48 96 57 110 60 128Z" />
      <path d="M60 128C76 120 86 107 88 91C72 96 63 110 60 128Z" />
      <path d="M60 90C47 83 39 72 38 58C51 62 58 74 60 90Z" />
      <path d="M60 90C73 83 81 72 82 58C69 62 62 74 60 90Z" />
      <path d="M60 54C51 48 46 39 46 29C55 33 59 42 60 54Z" />
      <path d="M60 54C69 48 74 39 74 29C65 33 61 42 60 54Z" />
      <ellipse cx="60" cy="12" rx="4" ry="7" />
    </svg>
  );
}

/** Small leaf mark used in the logo and on the design-picker card. */
export function LeafMark({ className, stroke = "currentColor", strokeWidth = 1.6 }: { className?: string; stroke?: string; strokeWidth?: number }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className={className} fill="none" stroke={stroke} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22V5" />
      <path d="M12 17c-3.5-.5-5.5-2.6-6-5.5 3.2.2 5.4 2.2 6 5.5z" />
      <path d="M12 17c3.5-.5 5.5-2.6 6-5.5-3.2.2-5.4 2.2-6 5.5z" />
      <path d="M12 11c-2.6-.6-4-2.3-4.2-4.6 2.5.3 4 2 4.2 4.6z" />
      <path d="M12 11c2.6-.6 4-2.3 4.2-4.6-2.5.3-4 2-4.2 4.6z" />
    </svg>
  );
}

export function Logo({ name }: { name: string }) {
  return (
    <span className="flex items-center gap-2.5">
      <span aria-hidden className="bg-primary grid size-8 place-items-center rounded-lg">
        <LeafMark className="size-[18px]" stroke="#F7F3ED" />
      </span>
      <span className="heading text-[19px] font-semibold tracking-normal whitespace-nowrap sm:text-[22px]">{name}</span>
    </span>
  );
}

export function RouteMap({ className }: { className?: string }) {
  return (
    <svg role="img" aria-label="Map with a dashed route from the church to the reception venue" viewBox="0 0 420 320" className={className}>
      <g fill="none" stroke="#E2E0D3" strokeWidth="7" strokeLinecap="round">
        <path d="M-10 70L430 40" /><path d="M-10 180L430 150" /><path d="M-10 280L430 260" />
        <path d="M70 -10L110 330" /><path d="M210 -10L230 330" /><path d="M340 -10L330 330" />
      </g>
      <g fill="none" stroke="#ECEAE0" strokeWidth="3" strokeLinecap="round">
        <path d="M-10 120L430 98" /><path d="M-10 230L430 205" /><path d="M150 -10L165 330" />
        <path d="M280 -10L285 330" /><path d="M20 20L180 160" /><path d="M250 180L410 310" />
      </g>
      <path d="M118 92C190 100 250 120 236 170C222 218 140 206 160 250C176 284 260 262 300 236" fill="none" stroke="#B08A71" strokeWidth="3.5" strokeDasharray="9 9" strokeLinecap="round" />
      <path d="M118 92c-12-14-18-24-18-33a18 18 0 0 1 36 0c0 9-6 19-18 33z" fill="#37463C" />
      <circle cx="118" cy="59" r="6.5" fill="#F7F3ED" />
      <path d="M300 236c-12-14-18-24-18-33a18 18 0 0 1 36 0c0 9-6 19-18 33z" fill="#879581" />
      <circle cx="300" cy="203" r="6.5" fill="#F7F3ED" />
      <g fontFamily="DM Sans, system-ui, sans-serif" fontSize="14" fontWeight="500" fill="#37463C">
        <rect x="140" y="40" width="94" height="30" rx="8" fill="#FFFDF9" stroke="#E2DFD4" />
        <text x="187" y="60" textAnchor="middle">Church</text>
        <rect x="210" y="266" width="104" height="30" rx="8" fill="#FFFDF9" stroke="#E2DFD4" />
        <text x="262" y="286" textAnchor="middle">Reception</text>
      </g>
    </svg>
  );
}
