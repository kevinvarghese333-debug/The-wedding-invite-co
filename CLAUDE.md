# The Wedding Invite Co. (TWIC): context for Claude

One Next.js app serves **two sites** from one Docker container on Kev's Hostinger VPS:

| Site | Address | Code |
| --- | --- | --- |
| Main site, lead manager and admin | https://theweddinginviteco.xyz (`/admin`) | `app/page.tsx`, `app/[audience]`, `app/admin`, `components/landing` |
| Do-it-yourself invitation builder | https://build.theweddinginviteco.xyz (also `/build` on the main domain) | `app/build`, `components/builder`, `lib/builder`, `public/builder` |
| Published couple invitations | `https://theweddinginviteco.xyz/i/<slug>` | `app/i/[slug]`, `lib/builder/render.ts`, `lib/builder/runtime.ts` |

`middleware.ts` rewrites every request on the `build.` host to `/build/...`. The old address
`theweddinginviteco.theinsiderfinds.com` permanently redirects to the new domain (Traefik labels in
`docker-compose.yml`). `README.md` has the full setup, builder, payments and admin guide.

## The business
- Founders: Kevin Varghese and Greeny Saju. Tagline "More than an invitation." Brand: maroon and gold,
  TWIC wax seal logo (`public/media/seal.webp`), fonts Cormorant Garamond (headings), DM Sans (body),
  Mrs Saint Delafield (script), Anton (hero dot-matrix headline).
- Packages on the main site (`components/landing/packages.tsx`, copy in `app/page.tsx` `packageList`):
  - **The Collection**: couples make it themselves in the builder, ₹1,999 simpler designs, ₹2,999 studio designs.
  - **The Studio**: ₹4,999, our team sets up one of our designs.
  - **The Signature**: from ₹8,490, designed around the couple's story.
- Builder: 16 studio designs (`lib/builder/designs/*.json`, list in `lib/builder/designs.ts`) plus 5 simpler
  templates (Thamara, Verse, Peony, Midnight, Edition in `lib/builder/templates.ts`). Free to design, no account;
  pay to publish via Razorpay or UPI QR. Add-ons: guest links ₹999, own domain ₹1,599, extra year ₹499.
- Main CTA is WhatsApp ("Get a free preview on WhatsApp"); the form button is an A/B test
  ("Check my date" vs "See my free preview", `components/landing/cta.tsx`). Meta Pixel events in `lib/track.ts`.

## Data
- SQLite at `DATA_DIR/leads.db` (Docker volume `leads-data`): leads, couple words (shown as
  "What our happily married couples say"), settings, builder sites, RSVPs. Photos in `DATA_DIR/photos`.
- Business facts (prices, add-ons, terms, stats, founders, support, UPI) are edited in **Admin → Settings**
  (`lib/settings.ts`) and appear on the site only when filled in.
- Live sample invitations are listed in `lib/samples.ts` and linked through `/i/<slug>`.

## Rules Kev has set
- Copy: no em dashes, no stock AI phrasing. Never say "testimonial" on the site.
- Never show Keerthy and Rosheel's faces (Kev's sister's wedding); the site is not centred on it.
- Anjana & Josbin is not shown as a sample. Reviews and numbers must be real.
- Ask whether a monogram intro animation is wanted before building any new invite.

## Working on it
- `npm run dev` locally (needs `.env.local` with `ADMIN_PASSWORD`, `SESSION_SECRET`, `SITE_URL`).
- Deploy: push to `main`, then on the VPS: `cd /opt/wedding-invite-co && git pull && docker compose up -d --build`.
- Claude cannot reach the VPS; give Kev the commands to paste, one per block.
- Check pages at desktop (1440) and phone (390) widths before pushing.
