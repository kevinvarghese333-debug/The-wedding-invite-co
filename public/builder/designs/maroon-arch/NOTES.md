# Neha & Ashutosh: the monogram invite

A real couple. Sunday 28 February 2027, Rawla Lohgarh, Kota. A Western invitation with a Rajasthani touch: an ivory letterpress card, Pinyon Script and Playfair Display, wax seal, laurel crest, with jharokha arches, a marigold toran, paisleys, a kalash and Shri Ganeshaya Namah. It has every feature of the Keerthy & Rosheel invite.

Palette: ivory `#f8f1e4`, oxblood `#5a1820`, antique gold `#c39a4b`, sage leaves, marigold. Type: Pinyon Script (names), Playfair Display (headings), Libre Caslon Text (body), Sahitya (Devanagari).

Run locally with the `neha-ashutosh` entry in `.claude/launch.json` (port 4183).

## Sections

1. **Cover:** an oxblood card with a drifting paisley pattern. A gold jharokha arch draws itself, then the names and the wax seal (N A) appear. Tapping the seal starts the music, and a round window opens out from the seal.
2. **Monogram reveal** (pinned, scroll-driven, 420vh):
   - The crest draws: a ring, a laurel wreath with mango leaves and marigold buds, a chhatri crown, and a ribbon with the date in Roman numerals. Then a gold N and A write themselves in, interlocked.
   - As you scroll, the crest spreads out and fades. The N and A glide to their places and become the first letters of **Neha** and **Ashutosh**, with the remaining letters arriving one by one.
   - Then the date and venue rise in and the marigold toran drops and sways. Scrolling up reverses all of it.
3. **Portrait** in a jharokha: the gold frame draws with scroll, the photo drifts, and the line "Two hearts, one forever" arrives letter by letter.
4. **Invitation** on oxblood: the kalash draws, then Shri Ganeshaya Namah, the wording, and names letter by letter. Paisley corners turn with scroll.
5. **Countdown** in arch tiles; the mandala behind it turns with scroll.
6. **Events:** a gold vine fills with scroll and a marigold blooms at each event. Each oxblood arch card draws its border, then its icon (garland with sacred fire; lanterns with a moon). Each card has Directions and Add to calendar (Google, or an .ics file for Apple and Outlook).
7. **Venue:** a line drawing of the Rawla draws itself against a sunset, then fills in as a silhouette while the sun sinks. A button opens directions.
8. **Gallery:** six arched frames rise in, with a lightbox (swipe, arrow keys) once real photos are in.
9. **RSVP:** name, accept or decline, number of guests (up to 6), wishes. A wax seal stamps down on the thank-you, and "Change my reply" brings the form back. The guest's reply is remembered on their device.
10. **Footer:** the crest with an N A monogram, and the sign-off.

Marigold and rose petals fall gently after the seal is opened. A personal link adds a greeting on the cover: `?to=The Mehta Family`.

## Files

- `js/config.js`: every word, date, link and photo path
- `js/art.js`: all line art, drawn in code as SVG (crest, toran, kalash, mandala, Rawla skyline, icons, seal)
- `js/main.js`: behaviour
- `css/style.css`

## RSVP

- With `rsvp.endpoint` set to a Google Sheet web app (see `../rsvp-google-sheet.gs`), replies go to the sheet. The sheet then works as the admin view: total guests, attending or not, messages, and CSV download.
- With `endpoint` empty, the reply opens in WhatsApp, ready to send (to `rsvp.whatsapp` if set; otherwise the guest picks a chat).

## Before real guests see it

- [ ] Parents' lines (`invitation.brideParents`, `groomParents`); they are hidden while empty
- [ ] Blessing line and wording approved by the family
- [ ] Portrait (`portrait.src`) and six gallery photos; placeholders show until then
- [ ] RSVP: Google Sheet endpoint or WhatsApp number, plus a reply-by date (`rsvp.by`)
- [ ] Exact Google Maps pin for Rawla Lohgarh (now a search link)
- [ ] Music file (`music`); the button stays hidden until it is set
- [ ] `assets/og.jpg` for the WhatsApp preview (not made yet)
- [ ] Try it on a real iPhone and Android phone. Testing so far: the built-in browser at 375x812 and 1440x900

## Deploy

From inside this folder only, never the repo root (the root is the live Ross & Rachel site). Not deployed yet.

```bash
cd neha-ashutosh
vercel link --yes --project neha-ashutosh
cat .vercel/project.json
vercel --prod
```
