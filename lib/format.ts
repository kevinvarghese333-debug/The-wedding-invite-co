const TZ = "Asia/Kolkata";

export function fmtDateTime(iso?: string | null) {
  if (!iso) return "";
  const d = new Date(iso);
  return d.toLocaleString("en-IN", { day: "numeric", month: "short", year: "numeric", hour: "numeric", minute: "2-digit", timeZone: TZ });
}

export function fmtDate(iso?: string | null) {
  if (!iso) return "";
  const d = new Date(iso.length === 10 ? iso + "T00:00:00+05:30" : iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric", timeZone: TZ });
}

export function ago(iso: string) {
  const s = Math.round((Date.now() - new Date(iso).getTime()) / 1000);
  if (s < 60) return "just now";
  const m = Math.round(s / 60);
  if (m < 60) return `${m} min ago`;
  const h = Math.round(m / 60);
  if (h < 24) return `${h} hr ago`;
  const d = Math.round(h / 24);
  if (d < 30) return `${d} day${d === 1 ? "" : "s"} ago`;
  return fmtDate(iso);
}

export function daysUntil(dateOnly?: string | null) {
  if (!dateOnly) return null;
  const today = new Date(new Date().toLocaleDateString("en-CA", { timeZone: TZ }) + "T00:00:00Z").getTime();
  const t = new Date(dateOnly + "T00:00:00Z").getTime();
  return Math.round((t - today) / 86_400_000);
}

export function todayIso() {
  return new Date().toLocaleDateString("en-CA", { timeZone: TZ });
}

export const rupees = (n?: number | null) => (n == null ? "" : `₹${n.toLocaleString("en-IN")}`);

/** +91 98765 43210 for Indian numbers, +<digits> otherwise. */
export function fmtPhone(digits?: string | null) {
  const d = (digits || "").replace(/\D/g, "");
  if (d.length === 12 && d.startsWith("91")) return `+91 ${d.slice(2, 7)} ${d.slice(7)}`;
  return d ? `+${d}` : "";
}
