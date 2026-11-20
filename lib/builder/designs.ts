/* Studio designs: invitations we made for couples, offered as templates. Each one is the original site
   (in public/builder/designs/<id>) plus its settings file, which couples edit in the builder.
   The sample settings live next to this file as JSON; they were cleaned of real clients' details on import.
   Client-safe: no Node imports. */
import hillStation from "@/lib/builder/designs/hill-station.json";
import fortGates from "@/lib/builder/designs/fort-gates.json";
import fourLaavan from "@/lib/builder/designs/four-laavan.json";
import kolam from "@/lib/builder/designs/kolam.json";
import palaceDusk from "@/lib/builder/designs/palace-dusk.json";
import seaLanterns from "@/lib/builder/designs/sea-lanterns.json";
import floralSeal from "@/lib/builder/designs/floral-seal.json";
import himalayan from "@/lib/builder/designs/himalayan.json";
import receipts from "@/lib/builder/designs/receipts.json";
import ganeshaDoors from "@/lib/builder/designs/ganesha-doors.json";
import bougainvillea from "@/lib/builder/designs/bougainvillea.json";

export type Json = string | number | boolean | null | Json[] | { [k: string]: Json };
export type Config = { [k: string]: Json };

export type Design = {
  id: string;
  name: string;
  blurb: string;
  tags: string[];
  /** the global the site reads: window.INVITE or window.CONFIG */
  var: string;
  /** the settings file the site loads, which we replace with the couple's settings */
  file: string;
  sample: Config;
  /** paths into the settings for the summary shown around the builder */
  one: string;
  two: string;
  date: string;
  place?: string;
  /** where RSVPs go: we point it at our endpoint */
  endpoint?: string;
  /** a "this is a demo" switch some designs have, turned off when live */
  demo?: string;
  /** the music file setting */
  music?: string;
  /** settings couples shouldn't see or change */
  hide?: string[];
  /** a short note shown at the top of the editor */
  tip?: string;
};

const D = (d: Omit<Design, "var" | "file" | "sample">, json: { var: string; file: string; config: unknown }): Design => ({
  ...d,
  var: json.var,
  file: json.file,
  sample: json.config as Config,
});

const COMMON_HIDE = ["wedding.timezone", "colours"];

export const DESIGNS: Design[] = [
  D(
    {
      id: "hill-station",
      name: "Hill Station Night",
      blurb: "A navy night over the hills, gilded leaves, a Shiva–Parvati medallion and a hot-air balloon over a cottage on a cloud. Each celebration gets its own painting.",
      tags: ["Hindu", "North Indian", "Illustrated"],
      one: "couple.one.first",
      two: "couple.two.first",
      date: "wedding.start",
      place: "route.venue",
      music: "music",
      hide: COMMON_HIDE,
    },
    hillStation
  ),
  D(
    {
      id: "fort-gates",
      name: "Fort Gates",
      blurb: "Guests scroll to swing open carved Rajasthani gates onto a palace garden at sunset, with falling rose petals and a dancing couple.",
      tags: ["Hindu", "Rajasthani", "Illustrated"],
      one: "couple.one.first",
      two: "couple.two.first",
      date: "wedding.start",
      place: "venue.place",
      music: "music",
      hide: COMMON_HIDE,
    },
    fortGates
  ),
  D(
    {
      id: "four-laavan",
      name: "Four Laavan",
      blurb: "Sky lanterns over a sunset as guests scroll through the four laavan of the Anand Karaj, in Gurmukhi and English.",
      tags: ["Sikh", "Punjabi", "Illustrated"],
      one: "couple.one.first",
      two: "couple.two.first",
      date: "wedding.start",
      place: "venue.place",
      music: "music",
      hide: COMMON_HIDE,
    },
    fourLaavan
  ),
  D(
    {
      id: "kolam",
      name: "Kolam",
      blurb: "A kolam draws itself at the doorstep as guests scroll, then blooms into colour. For South Indian weddings, from Nichayathartham to Muhurtham.",
      tags: ["Tamil", "Hindu", "South Indian"],
      one: "couple.one.first",
      two: "couple.two.first",
      date: "wedding.start",
      place: "venue.name",
      music: "music",
      hide: COMMON_HIDE,
    },
    kolam
  ),
  D(
    {
      id: "palace-dusk",
      name: "Palace at Dusk",
      blurb: "A painted palace under a swirling dusk sky and a vintage car that drives guests in. Ganesha blessing, every event and a route map.",
      tags: ["Hindu", "North Indian", "Illustrated"],
      one: "couple.one.first",
      two: "couple.two.first",
      date: "wedding.start",
      place: "route.venue",
      music: "music",
      hide: COMMON_HIDE,
    },
    palaceDusk
  ),
  D(
    {
      id: "sea-lanterns",
      name: "Lanterns by the Sea",
      blurb: "Guests light a lantern to begin, then walk into a sunset beach ceremony full of floating lanterns. Golden frames for every celebration.",
      tags: ["Christian", "Beach", "Destination"],
      one: "couple.groom",
      two: "couple.bride",
      date: "weddingStart",
      place: "venue.name",
      music: "music",
    },
    seaLanterns
  ),
  D(
    {
      id: "floral-seal",
      name: "Floral Seal",
      blurb: "Break a wax seal to open peonies and roses. A countdown, the day's timeline, your song and RSVP, in several languages.",
      tags: ["Classic", "Floral", "Multilingual"],
      one: "couple.groom.first",
      two: "couple.bride.first",
      date: "event.start",
      place: "event.place",
      endpoint: "rsvp.endpoint",
      music: "music.file",
      hide: ["music.appleTrackId", "music.link", "music.seconds", "rsvp.email", "defaultLanguage"],
    },
    floralSeal
  ),
  D(
    {
      id: "himalayan",
      name: "Himalayan Procession",
      blurb: "Ring a temple bell, then join a painted procession up to a mountain temple. Families, celebrations, a gallery and RSVP.",
      tags: ["Hindu", "Mountains", "Illustrated"],
      one: "bride",
      two: "groom",
      date: "weddingAt",
      place: "map.label",
      music: "music",
    },
    himalayan
  ),
  D(
    {
      id: "receipts",
      name: "We Kept the Receipts",
      blurb: "Untie the bow, watch two lines draw a heart, then print your story as receipts. Playful, hand-drawn and very you.",
      tags: ["Modern", "Playful", "Story"],
      one: "couple.one.first",
      two: "couple.two.first",
      date: "wedding.start",
      place: "wedding.place",
      endpoint: "rsvp.endpoint",
      demo: "rsvp.demo",
      hide: ["wedding.timezone", "rsvp.email"],
    },
    receipts
  ),
  D(
    {
      id: "ganesha-doors",
      name: "Ganesha Doors",
      blurb: "Guests touch carved temple doors to receive Ganesha's blessing with the Vakratunda shloka, then see every ceremony.",
      tags: ["Hindu", "Traditional", "Devotional"],
      one: "couple.bride.first",
      two: "couple.groom.first",
      date: "wedding.start",
      place: "wedding.place",
    },
    ganeshaDoors
  ),
  D(
    {
      id: "bougainvillea",
      name: "Bougainvillea Arch",
      blurb: "Stone pillars wrapped in bougainvillea, your story told in photo chapters, and a heart-shaped trail through the day with a blessings wall.",
      tags: ["Christian", "Church", "Story"],
      one: "groom.name",
      two: "bride.name",
      date: "date",
      place: "welcomePlace",
      endpoint: "sheetUrl",
      music: "music",
      hide: ["info.forecast"],
    },
    bougainvillea
  ),
];

export const findDesign = (id: string) => DESIGNS.find((d) => d.id === id);
export const designThumb = (id: string) => `/builder/designs/_thumbs/${id}.jpg`;
export const designBase = (id: string) => `/builder/designs/${id}/`;
