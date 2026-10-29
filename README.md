# The Wedding Invite Co.

Landing page and lead manager for The Wedding Invite Co. One Docker container:

- **Website** at `/` (Next.js + shadcn/ui, Botanical Romance theme)
- **Enquiry form** (dialog from every "Plan / Choose / Ask" button, plus the form at the bottom)
- **Alerts** for every enquiry: an email and a WhatsApp message, sent the moment it arrives
- **Lead dashboard** at `/admin`: statuses (New, Contacted, Quoted, Booked, Lost), follow-up dates,
  amounts, notes, reply-on-WhatsApp, CSV export, and a "Send test notification" button
- Leads live in SQLite inside a Docker volume, so rebuilding never loses them

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

Or use **Export CSV** in the dashboard any time.

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
