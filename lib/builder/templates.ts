/* The designs a couple can start from. A template is a look (art, opening, effects, palettes, fonts)
   plus sample wording, which becomes the couple's first draft. Add a template here and it appears in the gallery. */
import type { InviteData } from "@/lib/builder/types";

export type Palette = { id: string; label: string; bg: string; ink: string; accent: string; soft: string; extra?: Record<string, string> };
export type Cover = "doors" | "envelope" | "night" | "card";
export type Effect = "marigold" | "petals" | "stars" | "none";

export type Template = {
  id: string;
  name: string;
  blurb: string;
  tags: string[];
  cover: Cover;
  effect: Effect;
  palettes: Palette[];
  sample: InviteData;
};

const base = (o: Partial<InviteData> & Pick<InviteData, "one" | "two" | "style">): InviteData => ({
  families: { one: "", two: "" },
  blessing: "",
  blessingRef: "",
  eyebrow: "Together with their families",
  headline: "are getting married",
  invite: "We would love for you to join us as we begin our forever. Your presence will make our day complete.",
  date: "2027-02-14",
  time: "16:00",
  city: "Kochi",
  events: [],
  storyTitle: "Our story",
  story: [],
  cover: "",
  galleryTitle: "Moments",
  gallery: [],
  rsvp: { on: true, deadline: "", whatsapp: "", note: "" },
  closing: "Your presence is the greatest gift. We can't wait to celebrate with you.",
  signoff: "With love",
  hashtag: "",
  show: { opening: true, countdown: true, story: true, gallery: true, effects: true },
  music: { track: "lib:canon", title: "" },
  ...o,
});

export const TEMPLATES: Template[] = [
  {
    id: "thamara",
    name: "Thamara",
    blurb: "A lotus on still water, brass lamps and a toran of mango leaves. Opens with carved temple doors.",
    tags: ["Hindu", "Kerala", "Traditional"],
    cover: "doors",
    effect: "marigold",
    palettes: [
      { id: "temple", label: "Temple maroon", bg: "#fbf3e8", ink: "#4a1018", accent: "#b8862f", soft: "#f2d9c4", extra: { "--flower": "#eba6b4", "--flower-deep": "#cf6f86" } },
      { id: "kasavu", label: "Kasavu gold", bg: "#fffaf0", ink: "#3d2f1c", accent: "#c49a3a", soft: "#f3e6c8", extra: { "--flower": "#f1b9c2", "--flower-deep": "#d77f92" } },
      { id: "peacock", label: "Peacock", bg: "#f4f7f2", ink: "#0f3b3a", accent: "#b28a32", soft: "#d8e7df", extra: { "--flower": "#efafbd", "--flower-deep": "#c96a83", "--leaf": "#5d8a62", "--leaf-deep": "#2f5a3c" } },
      { id: "night-lamp", label: "Lamplight", bg: "#2b0d12", ink: "#fbe9d4", accent: "#d9a94a", soft: "#5a1d25", extra: { "--flower": "#e98fa3", "--flower-deep": "#b8506c", "--paper": "#3a141a", "--door": "#1d0a0c" } },
    ],
    sample: base({
      one: "Nandana",
      two: "Adarsh",
      blessing: "Shri Ganeshaya Namah",
      eyebrow: "With the blessings of our elders",
      families: { one: "Daughter of Smt. Sreeja & Sri. Rajeev Menon, Thrissur", two: "Son of Smt. Latha & Sri. Suresh Nair, Kochi" },
      invite: "We joyfully invite you and your family to our wedding. Your presence and blessings will make our day complete.",
      date: "2027-01-24",
      time: "10:30",
      city: "Guruvayur",
      events: [
        { id: "haldi", name: "Haldi", date: "2027-01-22", time: "10:00", venue: "Menon Tharavad", address: "Ayyanthole, Thrissur", map: "", note: "Wear something yellow" },
        { id: "wedding", name: "The Wedding", date: "2027-01-24", time: "10:30", venue: "Sree Krishna Temple", address: "East Nada, Guruvayur", map: "", note: "Muhurtham 10:30 to 11:00 AM · Sadhya to follow" },
        { id: "reception", name: "Reception", date: "2027-01-24", time: "18:30", venue: "Grand Hyatt", address: "Bolgatty Island, Kochi", map: "", note: "Dinner to follow" },
      ],
      story: [
        { id: "s1", when: "2019", title: "A friend's wedding", text: "We were seated at the same table at a friend's wedding in Kochi, and spent the evening arguing about the best sadhya in Thrissur.", photo: "" },
        { id: "s2", when: "2025", title: "The question", text: "Six years and many long drives later, he asked by the backwaters at sunset. She said yes before he finished.", photo: "" },
      ],
      rsvp: { on: true, deadline: "2027-01-10", whatsapp: "", note: "" },
      style: { palette: "temple", colors: null, script: "great-vibes", heading: "cormorant", body: "jost", scale: 1 },
    }),
  },
  {
    id: "verse",
    name: "Verse",
    blurb: "An ivory church arch with doves and olive branches, for a Holy Mass and reception. Opens from a sealed envelope.",
    tags: ["Christian", "Church", "Elegant"],
    cover: "envelope",
    effect: "petals",
    palettes: [
      { id: "ivory", label: "Ivory and sage", bg: "#fbf8f1", ink: "#2f3a2c", accent: "#a88a4a", soft: "#e9eadb", extra: { "--flower": "#f4ece2", "--flower-deep": "#e2cdb8", "--seal": "#5e6b45", "--seal-light": "#7f8c62" } },
      { id: "blush", label: "Blush and gold", bg: "#fdf6f3", ink: "#4a2a2e", accent: "#b6904f", soft: "#f4dfd9", extra: { "--flower": "#f7dcd6", "--flower-deep": "#e2a9a4" } },
      { id: "navy", label: "Navy and white", bg: "#f6f7fa", ink: "#1d2c4a", accent: "#9a8452", soft: "#dde3ee", extra: { "--flower": "#ffffff", "--flower-deep": "#cfd8e8", "--seal": "#1d2c4a", "--seal-light": "#33466d" } },
    ],
    sample: base({
      one: "Treesa",
      two: "Alan",
      blessing: "Love bears all things, believes all things, hopes all things, endures all things.",
      blessingRef: "1 Corinthians 13:7",
      families: { one: "Daughter of Mr. Thomas & Mrs. Mary Kurian, Kottayam", two: "Son of Mr. George & Mrs. Annie Mathew, Ernakulam" },
      invite: "Request the pleasure of your company at the Holy Mass and the celebration of our marriage.",
      date: "2027-04-17",
      time: "11:00",
      city: "Kottayam",
      events: [
        { id: "betrothal", name: "Betrothal", date: "2027-03-28", time: "15:00", venue: "St. Mary's Church", address: "Kudamaloor, Kottayam", map: "", note: "" },
        { id: "mass", name: "Holy Mass", date: "2027-04-17", time: "11:00", venue: "St. Mary's Church", address: "Kudamaloor, Kottayam", map: "", note: "" },
        { id: "reception", name: "Reception", date: "2027-04-17", time: "18:00", venue: "Windsor Castle", address: "MC Road, Kottayam", map: "", note: "Dinner to follow" },
      ],
      story: [
        { id: "s1", when: "2018", title: "Choir practice", text: "She sang alto, he was told he could not sing at all. He kept coming to practice anyway.", photo: "" },
        { id: "s2", when: "2026", title: "Yes", text: "On the steps of the same church, on a rainy June evening, with both families hiding round the corner.", photo: "" },
      ],
      rsvp: { on: true, deadline: "2027-04-01", whatsapp: "", note: "" },
      style: { palette: "ivory", colors: null, script: "pinyon", heading: "cormorant", body: "lora", scale: 1 },
    }),
  },
  {
    id: "peony",
    name: "Peony",
    blurb: "Soft peonies and leaves in the corners, a script for your names and gently falling petals.",
    tags: ["Floral", "Classic", "Romantic"],
    cover: "envelope",
    effect: "petals",
    palettes: [
      { id: "blush", label: "Blush", bg: "#fdf8f5", ink: "#4d3536", accent: "#c08a7d", soft: "#f6e0dc", extra: { "--flower": "#f2b8bd", "--flower-deep": "#d97e8a", "--seal": "#9b3f4c", "--seal-light": "#c25d6b" } },
      { id: "lavender", label: "Lavender", bg: "#faf8fc", ink: "#3c3350", accent: "#9b86b8", soft: "#ebe4f3", extra: { "--flower": "#d8c5ec", "--flower-deep": "#a689c9", "--seal": "#5d4a80", "--seal-light": "#7a66a0" } },
      { id: "peach", label: "Peach", bg: "#fffaf5", ink: "#4a3426", accent: "#d39a6a", soft: "#fae6d6", extra: { "--flower": "#f8c9a8", "--flower-deep": "#e59870", "--seal": "#a35a33", "--seal-light": "#c77a52" } },
      { id: "garden", label: "Garden white", bg: "#f7f8f3", ink: "#2e3a2e", accent: "#8a9a74", soft: "#e6ebdc", extra: { "--flower": "#ffffff", "--flower-deep": "#e7d9cf", "--seal": "#55684a", "--seal-light": "#748a66" } },
    ],
    sample: base({
      one: "Sara",
      two: "Nikhil",
      eyebrow: "Together with their families",
      date: "2027-03-06",
      time: "17:00",
      city: "Bengaluru",
      events: [
        { id: "mehendi", name: "Mehendi", date: "2027-03-05", time: "16:00", venue: "The Courtyard", address: "Indiranagar, Bengaluru", map: "", note: "" },
        { id: "wedding", name: "The Wedding", date: "2027-03-06", time: "17:00", venue: "The Tamarind Tree", address: "Kanakapura Road, Bengaluru", map: "", note: "Garden ceremony, dinner to follow" },
      ],
      story: [
        { id: "s1", when: "2020", title: "A shared umbrella", text: "A sudden downpour on Church Street, one umbrella and a very slow walk to the metro.", photo: "" },
        { id: "s2", when: "2026", title: "Forever", text: "He proposed in the garden where we had our very first picnic.", photo: "" },
      ],
      style: { palette: "blush", colors: null, script: "great-vibes", heading: "playfair", body: "lato", scale: 1 },
    }),
  },
  {
    id: "midnight",
    name: "Midnight",
    blurb: "A golden moon on a night sky full of twinkling stars. For evening weddings and receptions.",
    tags: ["Evening", "Modern", "NRI"],
    cover: "night",
    effect: "stars",
    palettes: [
      { id: "navy", label: "Midnight navy", bg: "#0d1530", ink: "#f4ead3", accent: "#d6b26a", soft: "#1c2850", extra: { "--paper": "#121c3d", "--star": "#fff8e3" } },
      { id: "plum", label: "Plum night", bg: "#1f0f26", ink: "#f6e8e2", accent: "#e0b177", soft: "#34193f", extra: { "--paper": "#28132f", "--star": "#ffeedd" } },
      { id: "emerald", label: "Emerald night", bg: "#0b211c", ink: "#efe8d4", accent: "#d4b46f", soft: "#143a31", extra: { "--paper": "#0f2a23", "--star": "#fbf6e2" } },
    ],
    sample: base({
      one: "Diya",
      two: "Aaron",
      eyebrow: "Under the same moon, with our families",
      headline: "are getting married",
      invite: "Join us for an evening of vows, dinner and dancing under the stars.",
      date: "2026-12-31",
      time: "19:00",
      city: "Fort Kochi",
      events: [
        { id: "ceremony", name: "The Ceremony", date: "2026-12-31", time: "19:00", venue: "Brunton Boatyard", address: "Calvetty Road, Fort Kochi", map: "", note: "" },
        { id: "party", name: "New Year's party", date: "2026-12-31", time: "21:30", venue: "Brunton Boatyard Lawns", address: "Calvetty Road, Fort Kochi", map: "", note: "Black tie, dancing shoes" },
      ],
      story: [{ id: "s1", when: "2021", title: "One night in Dubai", text: "A delayed flight, an airport café and a conversation that went on until boarding.", photo: "" }],
      rsvp: { on: true, deadline: "2026-12-15", whatsapp: "", note: "" },
      music: { track: "lib:lanterns", title: "" },
      style: { palette: "navy", colors: null, script: "italiana", heading: "italiana", body: "jost", scale: 1 },
    }),
  },
  {
    id: "minimal",
    name: "Edition",
    blurb: "Clean and editorial: big type, fine lines and lots of space. Lets a beautiful photo speak.",
    tags: ["Modern", "Minimal", "Photo"],
    cover: "card",
    effect: "none",
    palettes: [
      { id: "paper", label: "Paper", bg: "#f7f4ee", ink: "#1f1d1a", accent: "#8c7b62", soft: "#ebe5da" },
      { id: "stone", label: "Stone", bg: "#eeece8", ink: "#262626", accent: "#6f6a60", soft: "#e0ddd6" },
      { id: "terracotta", label: "Terracotta", bg: "#f8f1ea", ink: "#3a2218", accent: "#b5603b", soft: "#f0dccd" },
      { id: "ink", label: "Ink", bg: "#151515", ink: "#f1ede6", accent: "#c8b591", soft: "#262626", extra: { "--paper": "#1c1c1c" } },
    ],
    sample: base({
      one: "Ishita",
      two: "Kabir",
      eyebrow: "Save the date",
      headline: "are getting married",
      invite: "Two people, one very long guest list, and a day we'd love to share with you.",
      date: "2027-11-20",
      time: "17:30",
      city: "Jaipur",
      events: [
        { id: "sangeet", name: "Sangeet", date: "2027-11-19", time: "19:00", venue: "Rambagh Palace", address: "Bhawani Singh Road, Jaipur", map: "", note: "" },
        { id: "wedding", name: "Wedding", date: "2027-11-20", time: "17:30", venue: "Rambagh Palace", address: "Bhawani Singh Road, Jaipur", map: "", note: "Pheras at sunset" },
      ],
      story: [],
      music: { track: "lib:first-light", title: "" },
      style: { palette: "paper", colors: null, script: "bodoni", heading: "bodoni", body: "jost", scale: 1 },
    }),
  },
];

export const findTemplate = (id: string) => TEMPLATES.find((t) => t.id === id);
export const templateOrDefault = (id: string) => findTemplate(id) ?? TEMPLATES[0];

/** The colours in use: custom colours if the couple set them, else the chosen palette. */
export function paletteFor(t: Template, style: InviteData["style"]): Palette {
  const p = t.palettes.find((x) => x.id === style.palette) ?? t.palettes[0];
  if (!style.colors) return p;
  return { ...p, ...style.colors };
}

/** True when a colour is dark, so we can pick light text for it. */
export function isDark(hex: string) {
  const n = parseInt(hex.slice(1), 16);
  const [r, g, b] = [(n >> 16) & 255, (n >> 8) & 255, n & 255];
  return 0.2126 * r + 0.7152 * g + 0.0722 * b < 110;
}
