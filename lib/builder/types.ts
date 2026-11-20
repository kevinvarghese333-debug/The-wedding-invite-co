/* What a couple fills in. Stored as JSON in sites.data (the working copy) and sites.live_data (what guests see).
   Shared by the server and the editor, so keep this file free of Node imports. */
import { isFont } from "@/lib/builder/fonts";

export type InviteEvent = {
  id: string;
  name: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:MM, 24h
  venue: string;
  address: string;
  map: string; // a Google Maps link
  note: string; // dress code, lunch to follow, etc.
};

export type StoryChapter = { id: string; when: string; title: string; text: string; photo: string };

export type Colors = { bg: string; ink: string; accent: string; soft: string };

export type InviteData = {
  one: string; // first name shown, e.g. "Anna"
  two: string;
  families: { one: string; two: string }; // "Daughter of Mr. Thomas & Mrs. Mary Varghese"
  blessing: string; // the line above everything: a verse, a sloka, "Shri Ganeshaya Namah"
  blessingRef: string; // e.g. "1 Corinthians 13:7"
  eyebrow: string; // "Together with their families"
  headline: string; // "are getting married"
  invite: string; // the invitation paragraph
  date: string; // main day, drives the countdown
  time: string;
  city: string;
  events: InviteEvent[];
  storyTitle: string;
  story: StoryChapter[];
  cover: string; // photo file name
  galleryTitle: string;
  gallery: string[];
  rsvp: { on: boolean; deadline: string; whatsapp: string; note: string };
  closing: string;
  signoff: string;
  hashtag: string;
  show: { opening: boolean; countdown: boolean; story: boolean; gallery: boolean; effects: boolean };
  style: { palette: string; colors: Colors | null; script: string; heading: string; body: string; scale: number };
  music: { track: string; title: string }; // track: "lib:<id>" | "up:<file>" | ""
};

export const LIMITS = { events: 8, story: 6, gallery: 12 } as const;

const PHOTO = /^[a-f0-9]{24}\.(webp|jpg)$/;
const MUSIC = /^(lib:[a-z0-9-]{1,40}|up:[a-f0-9]{24}\.(mp3|m4a|ogg))$/;
const HEX = /^#[0-9a-f]{6}$/i;

const str = (v: unknown, max: number) =>
  typeof v === "string" ? v.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, "").slice(0, max) : "";
const bool = (v: unknown, d: boolean) => (typeof v === "boolean" ? v : d);
const date = (v: unknown) => (typeof v === "string" && /^\d{4}-\d{2}-\d{2}$/.test(v) ? v : "");
const time = (v: unknown) => (typeof v === "string" && /^([01]\d|2[0-3]):[0-5]\d$/.test(v) ? v : "");
const id = (v: unknown) => (typeof v === "string" && /^[a-z0-9]{4,16}$/i.test(v) ? v : Math.random().toString(36).slice(2, 10));
const url = (v: unknown) => {
  const s = str(v, 600).trim();
  if (!s) return "";
  try {
    const u = new URL(s);
    return u.protocol === "https:" || u.protocol === "http:" ? u.toString() : "";
  } catch {
    return "";
  }
};
const obj = (v: unknown): Record<string, unknown> => (v && typeof v === "object" && !Array.isArray(v) ? (v as Record<string, unknown>) : {});
const arr = (v: unknown): unknown[] => (Array.isArray(v) ? v : []);

/** Cleans anything that came from a browser into a valid InviteData. Unknown keys are dropped. */
export function normalize(input: unknown, fallback: InviteData): InviteData {
  const d = obj(input);
  const fam = obj(d.families);
  const rsvp = obj(d.rsvp);
  const show = obj(d.show);
  const style = obj(d.style);
  const music = obj(d.music);
  const c = obj(style.colors);
  const colors: Colors | null =
    HEX.test(String(c.bg)) && HEX.test(String(c.ink)) && HEX.test(String(c.accent)) && HEX.test(String(c.soft))
      ? { bg: String(c.bg), ink: String(c.ink), accent: String(c.accent), soft: String(c.soft) }
      : null;
  const scale = Number(style.scale);
  const track = String(music.track ?? "");
  return {
    one: str(d.one, 40),
    two: str(d.two, 40),
    families: { one: str(fam.one, 200), two: str(fam.two, 200) },
    blessing: str(d.blessing, 300),
    blessingRef: str(d.blessingRef, 80),
    eyebrow: str(d.eyebrow, 120),
    headline: str(d.headline, 120),
    invite: str(d.invite, 1200),
    date: date(d.date),
    time: time(d.time),
    city: str(d.city, 80),
    events: arr(d.events)
      .slice(0, LIMITS.events)
      .map((e) => {
        const o = obj(e);
        return { id: id(o.id), name: str(o.name, 80), date: date(o.date), time: time(o.time), venue: str(o.venue, 120), address: str(o.address, 300), map: url(o.map), note: str(o.note, 300) };
      }),
    storyTitle: str(d.storyTitle, 80),
    story: arr(d.story)
      .slice(0, LIMITS.story)
      .map((e) => {
        const o = obj(e);
        return { id: id(o.id), when: str(o.when, 40), title: str(o.title, 100), text: str(o.text, 1500), photo: PHOTO.test(String(o.photo)) ? String(o.photo) : "" };
      }),
    cover: PHOTO.test(String(d.cover)) ? String(d.cover) : "",
    galleryTitle: str(d.galleryTitle, 80),
    gallery: arr(d.gallery)
      .filter((p) => PHOTO.test(String(p)))
      .slice(0, LIMITS.gallery)
      .map(String),
    rsvp: {
      on: bool(rsvp.on, fallback.rsvp.on),
      deadline: date(rsvp.deadline),
      whatsapp: str(rsvp.whatsapp, 20).replace(/\D/g, ""),
      note: str(rsvp.note, 300),
    },
    closing: str(d.closing, 400),
    signoff: str(d.signoff, 120),
    hashtag: str(d.hashtag, 40).replace(/\s+/g, ""),
    show: {
      opening: bool(show.opening, true),
      countdown: bool(show.countdown, true),
      story: bool(show.story, true),
      gallery: bool(show.gallery, true),
      effects: bool(show.effects, true),
    },
    style: {
      palette: str(style.palette, 30) || fallback.style.palette,
      colors,
      script: isFont(style.script, "script") ? style.script : fallback.style.script,
      heading: isFont(style.heading, "heading") ? style.heading : fallback.style.heading,
      body: isFont(style.body, "body") ? style.body : fallback.style.body,
      scale: Number.isFinite(scale) ? Math.min(1.3, Math.max(0.85, Math.round(scale * 100) / 100)) : 1,
    },
    music: { track: MUSIC.test(track) ? track : "", title: str(music.title, 80) },
  };
}

export const newId = () => Math.random().toString(36).slice(2, 10);
