# The Wedding Invite Co.

Landing page and lead manager for The Wedding Invite Co. One Docker container:

- **Website** at `/` (Next.js + shadcn/ui, Botanical Romance theme)
- **Enquiry form** (dialog from every "Plan / Choose / Ask" button, plus the form at the bottom)
- **Alerts** for every enquiry: an email and a WhatsApp message, sent the moment it arrives
- **Lead dashboard** at `/admin`: statuses (New, Contacted, Quoted, Booked, Lost), follow-up dates,
  amounts, notes, reply-on-WhatsApp, CSV export, and a "Send test notification" button
- Leads live in SQLite inside a Docker volume, so rebuilding never loses them
- **Invitation builder** at `build.<domain>` (and `<domain>/build`): couples pick a design, make it theirs,
  and pay to publish. See [Do-it-yourself builder](#do-it-yourself-builder) below.

It runs behind the Traefik proxy already on the VPS (network `traefik_default`, entrypoint
`websecure`, cert resolver `letsencrypt`, the same as the Keerthy & Rosheel invite).

---

## 1. Point the domain at the VPS

Pick the address, for example `weddinginvite.kavitha.cloud` or a domain of its own.
In the DNS panel (Hostinger for kavitha.cloud), add an **A record** for that name pointing to the
VPS IP (`200.234.34.123`). Wait until `ping <your domain>` shows that IP.

## 2. Put the code on the VPS

```bash
# with git (recommended, makes updates one command)
git clone <repo-url> /opt/wedding-invite-co
cd /opt/wedding-invite-co

# or copy the zip from your laptop
scp wedding-invite-co.zip root@200.234.34.123:/opt/
ssh root@200.234.34.123 "cd /opt && unzip -o wedding-invite-co.zip"
```

## 3. Fill in the settings

```bash
cd /opt/wedding-invite-co
cp .env.example .env
echo "SESSION_SECRET=$(openssl rand -base64 32)" >> .env
nano .env
```

Set at least `DOMAIN`, `SITE_URL`, `ADMIN_PASSWORD`, and the email and WhatsApp lines (steps 5 and 6).

## 4. Start it

```bash
docker compose up -d --build
docker compose ps                          # should say "healthy" after ~30 seconds
curl http://127.0.0.1:3030/api/health      # → {"ok":true}
```

Open `https://<your domain>` for the site and `https://<your domain>/admin` for the dashboard.
In the dashboard, press **Send test notification**. It shows what happened with email and WhatsApp.

## 5. Email alerts (Gmail)

1. Turn on 2-Step Verification on the Google account.
2. Create an App Password at <https://myaccount.google.com/apppasswords> (name it "Wedding Invite Co.").
3. Put the 16 letters, without spaces, in `SMTP_PASS`. Keep `SMTP_HOST=smtp.gmail.com` and `SMTP_PORT=465`.
4. `NOTIFY_EMAIL` is where alerts go. Separate several addresses with commas.

Any other mailbox works too (Hostinger Email, Zoho): use its SMTP host, port, user and password.

## 6. WhatsApp alerts

Pick one and set `WHATSAPP_PROVIDER`. `NOTIFY_WHATSAPP` is the number that receives the alerts.

**Option A · CallMeBot (free, 2 minutes, nothing extra to run)**
1. Open <https://www.callmebot.com/blog/free-api-whatsapp-messages/> and save the bot's number it shows.
2. From the phone that should get alerts, WhatsApp it: `I allow callmebot to send me messages`
3. It replies with an API key. Put it in `CALLMEBOT_API_KEY` and set `WHATSAPP_PROVIDER=callmebot`.

Alerts then arrive from CallMeBot's number. It is a free community service, so if it is ever slow,
the email still arrives and the dashboard shows what failed.

**Option B · WAHA (alerts come from your own spare number)**
1. Set `WHATSAPP_PROVIDER=waha` and a strong `WAHA_API_KEY` in `.env`.
2. `docker compose --profile whatsapp up -d`
3. From your laptop: `ssh -L 3031:127.0.0.1:3031 root@200.234.34.123`, then open
   <http://localhost:3031/dashboard> (user `admin`, password = `WAHA_API_KEY`).
4. Start the `default` session and scan the QR code with the spare WhatsApp number
   (WhatsApp → Linked devices). Messages then go from that number to `NOTIFY_WHATSAPP`.

This uses WhatsApp Web, the unofficial route, like your Hermes relay. Keep it to alerts to yourself.

**Option C · webhook** sends `{"to": "...", "text": "..."}` as JSON to `WHATSAPP_WEBHOOK_URL`
(with `Authorization: Bearer <WHATSAPP_WEBHOOK_TOKEN>` if set), for example to your own Hermes relay.

After changing `.env`, run `docker compose up -d` again and press **Send test notification**.

## Do-it-yourself builder

Couples design their own invitation from our templates, for a lower price than a custom one.

**How it works for a couple**

1. Open `https://build.<domain>`, pick one of five designs (Thamara, Verse, Peony, Midnight, Edition) and a colour.
2. Edit in the browser with a live phone preview: names, families, verse, wording, date and celebrations
   (venue, address, Google Maps link, note), cover photo, story chapters, gallery, colours (palette or
   their own), fonts for names / headings / text, text size, opening animation, falling petals, music
   (built-in tracks or their own MP3), RSVP and closing words. Everything autosaves.
3. Designing is free and needs no account. The draft preview is visible only to them.
   "Save my design" emails them a private link to continue on any device; it also creates a lead
   (package "Do-it-yourself") in the dashboard, so you can follow up.
4. **Publish**: they choose the address (`<domain>/i/anna-weds-joel`), leave name, WhatsApp and email,
   and pay. Only then does the link work for guests.
5. Guests open the link from WhatsApp, tap to open, music starts, and they RSVP on the page.
   The couple sees every reply at **My designs → Replies** and can download a spreadsheet.
6. They can keep editing; changes go live when they press **Update live invitation**.

**Set it up**

1. DNS: add an **A record** for `build` (so `build.theweddinginviteco.xyz`) pointing to the VPS, like step 1.
   Until it resolves, the builder still works at `https://<domain>/build`.
2. In `.env` set `BUILDER_DOMAIN=build.theweddinginviteco.xyz` and `BUILDER_URL=https://build.theweddinginviteco.xyz`,
   then `docker compose up -d`. Traefik gets a separate certificate for the subdomain.
3. Set the price in **Admin → Settings → Prices** (default ₹1,999).

**Payments (Razorpay)**

1. In the Razorpay Dashboard, create API keys (start with Test mode) and put them in `RAZORPAY_KEY_ID` and
   `RAZORPAY_KEY_SECRET`.
2. Dashboard → Webhooks → add `https://<domain>/api/build/razorpay`, events `order.paid` and
   `payment.captured`, choose a secret and put it in `RAZORPAY_WEBHOOK_SECRET`. The webhook publishes the
   invitation even if the couple closes the page before Checkout returns.
3. `docker compose up -d`. Try a test payment with Razorpay's test card or UPI `success@razorpay`,
   then switch to live keys.

**Without Razorpay** (keys empty), couples pay you directly by UPI:

1. In **Admin → Settings → Builder payments**, enter your UPI ID (for example `name@kotakbank`) and the
   name on the account.
2. On "Publish", the couple sees a UPI QR code with the amount already filled in (and a "Pay with a UPI app"
   button on phones), pays from any UPI app, and enters the transaction ID (UTR) under "I've paid".
3. You get an email and WhatsApp alert with that transaction ID. Check it in your bank app, then open
   **Admin → Builder**, find them ("Says paid · check UPI") and press **Mark paid and publish**.
   They get an email with their live link.

If no UPI ID is set, couples are asked to message you on WhatsApp for payment details instead.

**Prices, add-ons and guest links**

Every design card shows the price (₹1,999). A crossed-out "original price" only appears if you set one in Admin,
and should only be a real earlier price. Tapping a design opens its page (`build.<domain>/d/<design>`): the sample in a phone, the price, the add-ons, a demo of
guest links, what every plan includes, what happens next, "book a free call" and the support section.

| Add-on | Default | What happens |
| --- | --- | --- |
| A personal link for every guest | ₹999 | Up to 50 links instead of 3. Each opens with "Dear Sharma family" and shows only the functions chosen for them. Automatic. |
| Your own web address | ₹1,599 | **By hand,** subject to availability: the alert says "TO DO". Buy the domain they want and point it at the invitation. |
| One more year live | ₹499 | Live for 2 years instead of 1. Automatic. |

- Couples can tick add-ons on the design page and change them on the publish page. The total is charged by
  Razorpay or put in the UPI QR, and is the default amount under "Mark paid and publish".
- Every plan has 3 guest links (for example family sees every function, friends see three, office sees only
  the reception). Couples make them at **Guest links** in the editor; each reply shows which link it came from.
- An invitation stays live for a year from payment (two with the add-on). After that guests see a short note.
  Change the date or the add-ons on the invitation's page in **Admin → Builder → Plan**.
- All prices are in **Admin → Settings → Builder payments**.
- "We build it from your WhatsApp messages" is no longer sold; couples who want our team to set it up are sent to
  **The Studio**. Invitations that already bought it still show it in Admin.
- **Admin → Settings → Support** sets the WhatsApp/phone number, hours and email shown in the support
  section. "Book a free call" opens WhatsApp, or a booking page if you add a link (Calendly, Cal.com…).

**Packages on the main site** (`#pricing`). Three cards, one open at a time, with a phone preview beside them:

| Package | Price | Who makes it | Button |
| --- | --- | --- | --- |
| The Collection | builder price (₹1,999) | The couple, in the builder | Opens the chosen design's page in the builder |
| The Studio | ₹4,999 | Our team, on one of our designs | Enquiry form "Set it up with our team", with the design noted on the lead |
| The Signature | from ₹8,490 | Our team, around their story | Enquiry form "Start your creative brief", with a box for their story |

The Studio and The Signature stay live until a week after the last function. Their extras (one more year ₹399,
personal links for up to 15 special guests ₹999, own web address ₹1,599, save-the-date pages, Malayalam wording)
are in **Admin → Settings → Prices**. The card copy is in `app/page.tsx` (`packageList`) and the cards are in
`components/landing/packages.tsx`. Links like `/#studio` open that package.

**Admin → Builder** lists every design with its status (draft, wants to publish, live, paused), contact
details, opens and RSVP counts. On each one you can preview, edit as the studio, mark paid, publish the
latest edits, change the address, take it offline, send the couple a fresh edit link, or delete it.
**Admin → Music** adds tracks to the builder's music list (only music you're licensed to use).

**Studio designs** are invitations we made for couples, offered as templates. Each one is the original site in
`public/builder/designs/<id>/` with its settings file (`config.js`) taken out; the builder shows a form made from
those settings and puts the couple's version in its place. The sample settings are in `lib/builder/designs/<id>.json`
and the list (names, descriptions, which settings hold the names and date) is `lib/builder/designs.ts`. Real
clients' names, families, phone numbers and photos were replaced with sample ones on import, and any song was
swapped for one of our own tracks. Gallery pictures are `public/builder/designs/_thumbs/<id>.jpg`.

**Adding or changing designs**

| What | Where |
| --- | --- |
| Templates, palettes, sample wording | `lib/builder/templates.ts` |
| Drawings (lotus, lamps, doves, peonies, moon) | `lib/builder/art.ts` |
| Layout and styles of the invitation | `lib/builder/render.ts` |
| Opening, music, countdown, RSVP behaviour | `lib/builder/runtime.ts` |
| Fonts couples can pick | `lib/builder/fonts.ts` |
| Built-in music | `public/builder/music/` (regenerate with `node scripts/make-music.mjs`) |
| Share images when there's no cover photo | `public/builder/og/<template>.jpg` |

Uploaded photos and songs are stored in the same Docker volume as the database (`photos/` and `music/`).

## Updating

```bash
cd /opt/wedding-invite-co
git pull               # or unzip the new version over it (your .env stays)
docker compose up -d --build
```

## Backing up leads

```bash
docker exec wedding-invite-co node -e "require('better-sqlite3')('/app/data/leads.db').backup('/app/data/backup.db').then(()=>console.log('ok'))"
docker cp wedding-invite-co:/app/data/backup.db ./leads-$(date +%F).db
```

Or use **Export CSV** in the dashboard any time. The same `leads.db` holds builder invitations and RSVPs;
photos and songs couples upload are in `/app/data/photos` and `/app/data/music`
(`docker cp wedding-invite-co:/app/data ./data-backup` copies everything).

## Changing things

| What | Where |
| --- | --- |
| Prices, package contents | `app/page.tsx` (search for ₹) and `lib/config.ts` |
| Colours (shadcn theme tokens) | top of `app/globals.css` |
| Photos and videos | `public/media/` |
| Enquiry form fields | `components/landing/enquiry.tsx` and `app/api/enquiries/route.ts` |
| Alert wording | `lib/notify.ts` |

## Local development

```bash
npm install
cp .env.example .env    # set ADMIN_PASSWORD at least
npm run dev             # http://localhost:3000
```
