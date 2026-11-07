/* Kind words from married couples: stored in the same SQLite database as the leads,
   with photos saved (resized) to DATA_DIR/photos. */
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { getDb } from "@/lib/db";

export type CoupleWord = {
  id: number;
  created_at: string;
  names: string;
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

export function createCoupleWord(w: Pick<CoupleWord, "names" | "quote" | "status" | "source"> & Partial<Pick<CoupleWord, "place" | "wedding_month" | "photo" | "contact">>) {
  const r = db()
    .prepare("INSERT INTO couple_words (names, place, wedding_month, quote, photo, status, source, contact) VALUES (?, ?, ?, ?, ?, ?, ?, ?)")
    .run(w.names, w.place || null, w.wedding_month || null, w.quote, w.photo || null, w.status, w.source, w.contact || null);
  return Number(r.lastInsertRowid);
}

export function updateCoupleWord(id: number, w: Partial<Pick<CoupleWord, "names" | "place" | "wedding_month" | "quote" | "photo" | "status" | "sort">>) {
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
