import Database from "better-sqlite3";
import fs from "node:fs";
import path from "node:path";
import { fmtDate } from "@/lib/format";

export const STATUSES = [
  { id: "new", label: "New" },
  { id: "contacted", label: "Contacted" },
  { id: "quoted", label: "Quoted" },
  { id: "booked", label: "Booked" },
  { id: "lost", label: "Lost" },
] as const;
export type StatusId = (typeof STATUSES)[number]["id"];
export const isStatus = (s: unknown): s is StatusId => STATUSES.some((x) => x.id === s);
export const statusLabel = (s: string) => STATUSES.find((x) => x.id === s)?.label ?? s;

export type Lead = {
  id: number;
  created_at: string;
  updated_at: string;
  name: string;
  phone: string;
  email: string | null;
  wedding_date: string | null;
  location: string | null;
  package: string | null;
  functions: string | null;
  message: string | null;
  source: string | null;
  status: StatusId;
  follow_up: string | null;
  amount: number | null;
  email_status: string | null;
  whatsapp_status: string | null;
};

export type LeadEvent = { id: number; lead_id: number; at: string; kind: string; text: string };

let db: Database.Database | null = null;

export function getDb() {
  if (db) return db;
  const dir = process.env.DATA_DIR || path.join(process.cwd(), "data");
  fs.mkdirSync(dir, { recursive: true });
  db = new Database(path.join(dir, "leads.db"));
  db.pragma("journal_mode = WAL");
  db.pragma("foreign_keys = ON");
  db.exec(`
    CREATE TABLE IF NOT EXISTS leads (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
      updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
      name TEXT NOT NULL,
      phone TEXT NOT NULL,
      email TEXT,
      wedding_date TEXT,
      location TEXT,
      package TEXT,
      functions TEXT,
      message TEXT,
      source TEXT,
      status TEXT NOT NULL DEFAULT 'new',
      follow_up TEXT,
      amount INTEGER,
      email_status TEXT,
      whatsapp_status TEXT
    );
    CREATE INDEX IF NOT EXISTS idx_leads_status ON leads(status);
    CREATE INDEX IF NOT EXISTS idx_leads_created ON leads(created_at);
    CREATE TABLE IF NOT EXISTS lead_events (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      lead_id INTEGER NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
      at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
      kind TEXT NOT NULL,
      text TEXT NOT NULL
    );
    CREATE INDEX IF NOT EXISTS idx_events_lead ON lead_events(lead_id);
  `);
  return db;
}

export type NewLead = Pick<Lead, "name" | "phone" | "email" | "wedding_date" | "location" | "package" | "functions" | "message" | "source">;

export function createLead(input: NewLead): Lead {
  const d = getDb();
  const info = d
    .prepare(
      `INSERT INTO leads (name, phone, email, wedding_date, location, package, functions, message, source)
       VALUES (@name, @phone, @email, @wedding_date, @location, @package, @functions, @message, @source)`
    )
    .run(input);
  const id = Number(info.lastInsertRowid);
  addEvent(id, "created", "Enquiry received from the website");
  return getLead(id)!;
}

export function getLead(id: number): Lead | undefined {
  return getDb().prepare("SELECT * FROM leads WHERE id = ?").get(id) as Lead | undefined;
}

export function listLeads(opts: { status?: string; q?: string } = {}): Lead[] {
  const where: string[] = [];
  const params: Record<string, string> = {};
  if (opts.status === "open") where.push("status IN ('new','contacted','quoted')");
  else if (opts.status === "followup") where.push("follow_up IS NOT NULL AND follow_up <= date('now','localtime') AND status NOT IN ('booked','lost')");
  else if (opts.status && isStatus(opts.status)) {
    where.push("status = @status");
    params.status = opts.status;
  }
  if (opts.q) {
    where.push("(name LIKE @q OR phone LIKE @q OR email LIKE @q OR location LIKE @q OR message LIKE @q)");
    params.q = `%${opts.q}%`;
  }
  const sql = `SELECT * FROM leads ${where.length ? "WHERE " + where.join(" AND ") : ""} ORDER BY created_at DESC LIMIT 1000`;
  return getDb().prepare(sql).all(params) as Lead[];
}

export function updateLead(id: number, patch: { status?: StatusId; follow_up?: string | null; amount?: number | null }) {
  const before = getLead(id);
  if (!before) return;
  const next = { ...before, ...patch };
  getDb()
    .prepare(
      `UPDATE leads SET status=@status, follow_up=@follow_up, amount=@amount, updated_at=strftime('%Y-%m-%dT%H:%M:%fZ','now') WHERE id=@id`
    )
    .run({ id, status: next.status, follow_up: next.follow_up, amount: next.amount });
  if (patch.status && patch.status !== before.status) addEvent(id, "status", `Status changed to ${statusLabel(patch.status)}`);
  if (patch.follow_up !== undefined && patch.follow_up !== before.follow_up)
    addEvent(id, "follow_up", patch.follow_up ? `Follow-up set for ${fmtDate(patch.follow_up)}` : "Follow-up cleared");
  if (patch.amount !== undefined && patch.amount !== before.amount && patch.amount !== null)
    addEvent(id, "amount", `Amount set to ₹${patch.amount.toLocaleString("en-IN")}`);
}

export function setNotifyStatus(id: number, email: string, whatsapp: string) {
  getDb().prepare("UPDATE leads SET email_status=?, whatsapp_status=? WHERE id=?").run(email, whatsapp, id);
  addEvent(id, "notify", `Email: ${email} · WhatsApp: ${whatsapp}`);
}

export function deleteLead(id: number) {
  getDb().prepare("DELETE FROM leads WHERE id = ?").run(id);
}

export function addEvent(leadId: number, kind: string, text: string) {
  getDb().prepare("INSERT INTO lead_events (lead_id, kind, text) VALUES (?, ?, ?)").run(leadId, kind, text);
}

export function listEvents(leadId: number): LeadEvent[] {
  return getDb().prepare("SELECT * FROM lead_events WHERE lead_id = ? ORDER BY at DESC, id DESC").all(leadId) as LeadEvent[];
}

export function getStats() {
  const d = getDb();
  const one = (sql: string) => (d.prepare(sql).get() as { n: number | null }).n ?? 0;
  return {
    total: one("SELECT COUNT(*) n FROM leads"),
    fresh: one("SELECT COUNT(*) n FROM leads WHERE status='new'"),
    open: one("SELECT COUNT(*) n FROM leads WHERE status IN ('new','contacted','quoted')"),
    booked: one("SELECT COUNT(*) n FROM leads WHERE status='booked'"),
    bookedValue: one("SELECT SUM(amount) n FROM leads WHERE status='booked'"),
    thisMonth: one("SELECT COUNT(*) n FROM leads WHERE strftime('%Y-%m', created_at, 'localtime') = strftime('%Y-%m','now','localtime')"),
    followUps: one("SELECT COUNT(*) n FROM leads WHERE follow_up IS NOT NULL AND follow_up <= date('now','localtime') AND status NOT IN ('booked','lost')"),
  };
}
