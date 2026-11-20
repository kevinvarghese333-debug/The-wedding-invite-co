import { clean, editable, json } from "@/lib/builder/api";
import { getOrder, markOrderPaid } from "@/lib/builder/sites";
import { verifyPayment } from "@/lib/builder/razorpay";
import { completePayment } from "@/lib/builder/publish";
import { liveUrl } from "@/lib/builder/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/* Razorpay Checkout's success handler posts here. We only publish once the signature checks out. */
export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { site, error } = await editable(id);
  if (error) return error;
  const b = (await req.json().catch(() => ({}))) as Record<string, unknown>;
  const orderId = clean(b.razorpay_order_id, 60);
  const paymentId = clean(b.razorpay_payment_id, 60);
  const signature = clean(b.razorpay_signature, 200);
  const order = getOrder(orderId);
  if (!order || order.site_id !== site.id) return json({ ok: false, error: "We couldn't match that payment. If money was taken, message us and we'll sort it out." }, 400);
  if (!verifyPayment(orderId, paymentId, signature)) return json({ ok: false, error: "We couldn't confirm that payment. If money was taken, message us and we'll sort it out." }, 400);
  markOrderPaid(orderId, paymentId);
  const s = await completePayment(site.id, { amount: order.amount, ref: paymentId, method: "razorpay" });
  return json({ ok: true, url: s?.slug ? liveUrl(s.slug) : "" });
}
