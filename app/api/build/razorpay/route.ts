import { getOrder, markOrderPaid } from "@/lib/builder/sites";
import { verifyWebhook } from "@/lib/builder/razorpay";
import { completePayment } from "@/lib/builder/publish";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/* Razorpay webhook (Dashboard → Webhooks → URL https://<domain>/api/build/razorpay, events order.paid and payment.captured).
   Publishes even if the couple closed the page before Checkout returned. */
export async function POST(req: Request) {
  const raw = await req.text();
  if (!verifyWebhook(raw, req.headers.get("x-razorpay-signature"))) return new Response("bad signature", { status: 400 });
  let evt: { event?: string; payload?: { payment?: { entity?: { id?: string; order_id?: string; status?: string } }; order?: { entity?: { id?: string } } } };
  try {
    evt = JSON.parse(raw);
  } catch {
    return new Response("bad json", { status: 400 });
  }
  if (evt.event !== "order.paid" && evt.event !== "payment.captured") return new Response("ignored");
  const pay = evt.payload?.payment?.entity;
  const orderId = evt.payload?.order?.entity?.id || pay?.order_id || "";
  const order = getOrder(orderId);
  if (!order || !pay?.id) return new Response("unknown order");
  markOrderPaid(order.id, pay.id);
  await completePayment(order.site_id, { amount: order.amount, ref: pay.id, method: "razorpay" });
  return new Response("ok");
}
