/* Paying by UPI when Razorpay isn't set up: a QR code with the amount filled in, a "pay with a UPI app"
   link for phones, and the UPI ID to copy. The couple then sends us their transaction ID. Server only. */
import QRCode from "qrcode";
import { getSettings } from "@/lib/settings";

export type Upi = { id: string; name: string; uri: string; qr: string; note: string };

export function upiAccount() {
  const s = getSettings();
  const id = (s.upi_id || process.env.UPI_ID || "").trim();
  const name = (s.upi_name || process.env.UPI_NAME || "").trim();
  return /^[a-zA-Z0-9._-]{2,256}@[a-zA-Z][a-zA-Z0-9.-]{1,64}$/.test(id) ? { id, name } : null;
}

/** The UPI payment for one invitation, or null when no UPI ID is set. */
export async function upiPayment(amount: number, siteId: string): Promise<Upi | null> {
  const acct = upiAccount();
  if (!acct) return null;
  const note = `Invitation ${siteId}`;
  // pa stays as typed (its characters are checked above): UPI apps expect a literal "@" there.
  const uri = `upi://pay?pa=${acct.id}&pn=${encodeURIComponent(acct.name || "The Wedding Invite Co")}&am=${amount.toFixed(2)}&cu=INR&tn=${encodeURIComponent(note)}`;
  const qr = await QRCode.toString(uri, { type: "svg", margin: 1, errorCorrectionLevel: "M", color: { dark: "#2a0a0e", light: "#ffffff" } });
  return { ...acct, uri, qr, note };
}
