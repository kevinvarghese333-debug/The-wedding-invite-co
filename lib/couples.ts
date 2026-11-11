/* Kind words from married couples: stored in the same SQLite database as the leads,
   with photos saved (resized) to DATA_DIR/photos. */
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { getDb } from "@/lib/db";
import { getSettings, setSetting } from "@/lib/settings";

export type CoupleWord = {
  id: number;
  created_at: string;
  names: string;
  title: string | null; // a short headline, shown above their words
  place: string | null;
  wedding_month: string | null; // YYYY-MM
  quote: string;
  photo: string | null; // file name in DATA_DIR/photos
  status: "pending" | "published" | "hidden";
  source: "admin" | "couple";
  contact: string | null; // phone or email from the couple, never shown publicly
  sort: number;
};

export const COUPLE_STATUSES = ["pending", "published", "hidden"] as const;

let ready = false;
function db() {
  const d = getDb();
  if (!ready) {
    d.exec(`
      CREATE TABLE IF NOT EXISTS couple_words (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
        names TEXT NOT NULL,
        place TEXT,
        wedding_month TEXT,
        quote TEXT NOT NULL,
        photo TEXT,
        status TEXT NOT NULL DEFAULT 'pending',
        source TEXT NOT NULL DEFAULT 'admin',
        contact TEXT,
        sort INTEGER NOT NULL DEFAULT 0
      );
      CREATE INDEX IF NOT EXISTS idx_couple_words_status ON couple_words(status);
    `);
    ready = true;
    const cols = (d.prepare("PRAGMA table_info(couple_words)").all() as { name: string }[]).map((c) => c.name);
    if (!cols.includes("title")) d.exec("ALTER TABLE couple_words ADD COLUMN title TEXT");
    // First words on the site: from the couple whose invitation started it all. Added once; deleting it in admin keeps it gone.
    if (!getSettings().seed_keerthy) {
      d.prepare("INSERT INTO couple_words (names, place, wedding_month, quote, status, source) VALUES (?, ?, ?, ?, 'published', 'admin')").run(
        "Keerthy & Rosheel",
        "North Paravur",
        "2026-11",
        "Best ever experience for us. Would absolutely recommend this to everyone who gets married.",
      );
      setSetting("seed_keerthy", "1");
    }
    // Their words, with the grammar tidied and a headline added.
    if (!getSettings().seed_keerthy2) {
      d.prepare("UPDATE couple_words SET title = ?, quote = ? WHERE names = 'Keerthy & Rosheel' AND source = 'admin'").run(
        "The best experience we could have asked for.",
        "It was the best experience ever for us. We would absolutely recommend it to every couple getting married.",
      );
      setSetting("seed_keerthy2", "1");
    }
    // The first twelve couples' words, added once. Edit, hide or delete any of them in Admin → Couples.
    if (!getSettings().seed_twelve) {
      const ins = d.prepare("INSERT INTO couple_words (names, place, title, quote, status, source, sort) VALUES (?, ?, ?, ?, 'published', 'admin', ?)");
      const words: [string, string, string, string][] = [
              [
                      "Arjun & Meera",
                      "Kochi",
                      "For a moment, the wedding planning stopped.",
                      "We’d spent weeks talking about venues, outfits and guest lists. Then we opened our website together and read our story. For a moment, we forgot the planning and remembered why we were doing all of this."
              ],
              [
                      "Karthik & Nithya",
                      "Chennai",
                      "Dad sent it to everyone. Twice.",
                      "My dad isn’t usually interested in these things, but he kept opening the website and showing it to people. He sent it to the family group twice because he didn’t want anyone to miss it. That was probably my favourite reaction."
              ],
              [
                      "Adithya & Ananya",
                      "Bengaluru",
                      "She was part of our story too.",
                      "We included a photograph of my grandmother in our storyline. Seeing her there, among all the moments that brought us here, meant more than I can explain. I cried when I first saw it."
              ],
              [
                      "Karan & Simran",
                      "New Delhi",
                      "Seven years together, in one little link.",
                      "We gave the team far too many photos and a very long version of how we met. Somehow, they made it feel like us without trying to fit everything in. We sat there scrolling, laughing at how young we looked in the first photo."
              ],
              [
                      "Dhruv & Jinal",
                      "Jersey City, USA",
                      "The wishes from home meant everything.",
                      "Planning a wedding away from home felt lonely sometimes. Then our relatives started leaving messages on the website. Some were funny, some were blessings, and one from my aunt made me call her immediately."
              ],
              [
                      "Oliver & Charlotte",
                      "Bath, UK",
                      "Mum read every single word.",
                      "I thought Mum would look at the photographs and move on. Instead, she read our whole story, then called to ask about our first date. We ended up having the loveliest conversation. I wasn’t expecting an invitation to give us that."
              ],
              [
                      "Rohan & Aditi",
                      "Jaipur",
                      "The countdown made it real.",
                      "We’d been saying ‘there’s still time’ for months. Then we opened the website and saw the countdown ticking away. We looked at each other and just started smiling. We were actually getting married."
              ],
              [
                      "Parth & Aayushi",
                      "Ahmedabad",
                      "We kept checking the wishes before bed.",
                      "Every night, one of us would ask whether any new messages had come in. Reading them became a little routine in the middle of all the wedding chaos. We still have our favourites."
              ],
              [
                      "Harry & Sophie",
                      "Manchester, UK",
                      "It sounded like us, not a wedding brochure.",
                      "We’re not a particularly grand or poetic couple, and we were worried the invitation would feel that way. It didn’t. Our little jokes were there, our story sounded like us, and nothing felt forced."
              ],
              [
                      "Ethan & Olivia",
                      "Austin, USA",
                      "A small way to bring everyone closer.",
                      "Some of our closest friends couldn’t travel for the wedding. Sharing the website gave us a way to include them in the excitement, and their messages meant so much. We missed them on the day, but we knew they were celebrating with us."
              ],
              [
                      "Vishnu & Lakshmi",
                      "Thiruvananthapuram",
                      "Our parents saw a side of our story they didn’t know.",
                      "Our families knew how we met, but not all the little things that happened after. Putting those moments on the website led to so many conversations. His mum’s first message was, ‘How did I never hear this story?’"
              ],
              [
                      "Aarav & Kavya",
                      "Surat",
                      "We opened it again after the wedding.",
                      "The wedding was over, the guests had gone home, and the house was suddenly quiet. We opened the website and read through everyone’s wishes together. I’m so glad we had those messages waiting for us."
              ]
      ];
      words.forEach(([names, place, title, quote], i) => ins.run(names, place, title, quote, words.length - i));
      d.prepare("UPDATE couple_words SET sort = ? WHERE names = 'Keerthy & Rosheel' AND source = 'admin'").run(words.length + 1);
      setSetting("seed_twelve", "1");
    }
  }
  return d;
}

export function photoDir() {
  const dir = path.join(process.env.DATA_DIR || path.join(process.cwd(), "data"), "photos");
  fs.mkdirSync(dir, { recursive: true });
  return dir;
}

export const PHOTO_RE = /^[a-f0-9]{24}\.(webp|jpg)$/;
export const MAX_PHOTO_BYTES = 12 * 1024 * 1024;

/** Saves an uploaded image as a 1200px webp. Returns the file name, or throws a readable error. */
export async function savePhoto(file: File): Promise<string> {
  if (!file.type.startsWith("image/")) throw new Error("Please choose a photo (JPG, PNG, WEBP or HEIC).");
  if (file.size > MAX_PHOTO_BYTES) throw new Error("That photo is over 12 MB. Please choose a smaller one.");
  const sharp = (await import("sharp")).default;
  const buf = Buffer.from(await file.arrayBuffer());
  let out: Buffer;
  try {
    out = await sharp(buf).rotate().resize(1200, 1200, { fit: "inside", withoutEnlargement: true }).webp({ quality: 82 }).toBuffer();
  } catch {
    throw new Error("We couldn't read that photo. Please try a JPG or PNG.");
  }
  const name = crypto.randomBytes(12).toString("hex") + ".webp";
  fs.writeFileSync(path.join(photoDir(), name), out);
  return name;
}

export function deletePhoto(name: string | null) {
  if (!name || !PHOTO_RE.test(name)) return;
  try {
    fs.unlinkSync(path.join(photoDir(), name));
  } catch {}
}

export function listCoupleWords(status?: CoupleWord["status"]): CoupleWord[] {
  const q = status
    ? db().prepare("SELECT * FROM couple_words WHERE status = ? ORDER BY sort DESC, created_at DESC")
    : db().prepare("SELECT * FROM couple_words ORDER BY CASE status WHEN 'pending' THEN 0 WHEN 'published' THEN 1 ELSE 2 END, sort DESC, created_at DESC");
  return (status ? q.all(status) : q.all()) as CoupleWord[];
}

export function getCoupleWord(id: number) {
  return db().prepare("SELECT * FROM couple_words WHERE id = ?").get(id) as CoupleWord | undefined;
}

export function countPending() {
  return (db().prepare("SELECT COUNT(*) AS n FROM couple_words WHERE status = 'pending'").get() as { n: number }).n;
}

export function createCoupleWord(w: Pick<CoupleWord, "names" | "quote" | "status" | "source"> & Partial<Pick<CoupleWord, "title" | "place" | "wedding_month" | "photo" | "contact">>) {
  const r = db()
    .prepare("INSERT INTO couple_words (names, title, place, wedding_month, quote, photo, status, source, contact) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)")
    .run(w.names, w.title || null, w.place || null, w.wedding_month || null, w.quote, w.photo || null, w.status, w.source, w.contact || null);
  return Number(r.lastInsertRowid);
}

export function updateCoupleWord(id: number, w: Partial<Pick<CoupleWord, "names" | "title" | "place" | "wedding_month" | "quote" | "photo" | "status" | "sort">>) {
  const keys = Object.keys(w).filter((k) => (w as Record<string, unknown>)[k] !== undefined);
  if (!keys.length) return;
  db()
    .prepare(`UPDATE couple_words SET ${keys.map((k) => `${k} = @${k}`).join(", ")} WHERE id = @id`)
    .run({ ...w, id });
}

export function deleteCoupleWord(id: number) {
  const w = getCoupleWord(id);
  if (!w) return;
  db().prepare("DELETE FROM couple_words WHERE id = ?").run(id);
  deletePhoto(w.photo);
}

export function monthLabel(ym: string | null) {
  if (!ym || !/^\d{4}-\d{2}$/.test(ym)) return "";
  const [y, m] = ym.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, 1)).toLocaleDateString("en-GB", { month: "long", year: "numeric", timeZone: "UTC" });
}
