/* Razorpay: create an order on our server, let the couple pay in Razorpay Checkout, then verify the
   signature before publishing. The webhook (order.paid) publishes too, in case the browser closes mid-way.
   Docs: https://razorpay.com/docs/payments/server-integration/nodejs/ */
import crypto from "node:crypto";

export const razorpayReady = () => !!(process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET);
export const razorpayKeyId = () => process.env.RAZORPAY_KEY_ID || "";

export async function createRazorpayOrder(amountRupees: number, receipt: string, notes: Record<string, string>) {
  const auth = Buffer.from(`${process.env.RAZORPAY_KEY_ID}:${process.env.RAZORPAY_KEY_SECRET}`).toString("base64");
  const res = await fetch("https://api.razorpay.com/v1/orders", {
    method: "POST",
    headers: { Authorization: `Basic ${auth}`, "Content-Type": "application/json" },
    body: JSON.stringify({ amount: Math.round(amountRupees * 100), currency: "INR", receipt: receipt.slice(0, 40), notes }),
    signal: AbortSignal.timeout(15_000),
  });
  const body = (await res.json().catch(() => ({}))) as { id?: string; amount?: number; error?: { description?: string } };
  if (!res.ok || !body.id) throw new Error(body.error?.description || `Razorpay returned ${res.status}`);
  return { id: body.id, amount: body.amount ?? Math.round(amountRupees * 100) };
}

function hmacHex(secret: string, payload: string) {
  return crypto.createHmac("sha256", secret).update(payload).digest("hex");
}

function sameHex(a: string, b: string) {
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(Buffer.from(a), Buffer.from(b));
}

/** Checkout's handler returns these three; the signature proves the payment is for our order. */
export function verifyPayment(orderId: string, paymentId: string, signature: string) {
  const secret = process.env.RAZORPAY_KEY_SECRET;
  if (!secret || !orderId || !paymentId || !signature) return false;
  return sameHex(hmacHex(secret, `${orderId}|${paymentId}`), signature);
}

export function verifyWebhook(rawBody: string, signature: string | null) {
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
  if (!secret || !signature) return false;
  return sameHex(hmacHex(secret, rawBody), signature);
}
