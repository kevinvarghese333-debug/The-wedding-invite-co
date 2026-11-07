import { after } from "next/server";
import { rateLimited } from "@/lib/auth";
import { createCoupleWord, savePhoto } from "@/lib/couples";
import { sendWhatsApp } from "@/lib/notify";
import { siteUrl } from "@/lib/config";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const clean = (v: FormDataEntryValue | null, max: number) =>
  typeof v === "string" ? v.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, "").trim().slice(0, max) : "";

/* Couples send their words (and a photo) from /kind-words. Everything lands as "pending" until approved in /admin/couples. */
export async function POST(req: Request) {
  const ip = (req.headers.get("x-forwarded-for") || "").split(",")[0].trim() || "local";
  if (rateLimited(`kind:${ip}`, 5, 30 * 60 * 1000)) {
    return Response.json({ ok: false, error: "Too many submissions from this connection. Please try again later." }, { status: 429 });
  }
  let fd: FormData;
  try {
    fd = await req.formData();
  } catch {
    return Response.json({ ok: false, error: "Something went wrong with the upload. Please try again." }, { status: 400 });
  }
  if (clean(fd.get("website"), 200)) return Response.json({ ok: true }); // honeypot

  const names = clean(fd.get("names"), 80);
  const quote = clean(fd.get("quote"), 900);
  const place = clean(fd.get("place"), 80);
  const month = clean(fd.get("wedding_month"), 7);
  const contact = clean(fd.get("contact"), 120);
  const consent = fd.get("consent") === "yes";

  const errors: Record<string, string> = {};
  if (names.length < 3) errors.names = "Please add your names, for example Anu & Joel.";
  if (quote.length < 15) errors.quote = "Please write a line or two.";
  if (!consent) errors.consent = "Please tick the box so we can share it.";
  if (Object.keys(errors).length) return Response.json({ ok: false, errors }, { status: 422 });

  let photo: string | null = null;
  const file = fd.get("photo");
  if (file instanceof File && file.size > 0) {
    try {
      photo = await savePhoto(file);
    } catch (e) {
      return Response.json({ ok: false, errors: { photo: (e as Error).message } }, { status: 422 });
    }
  }

  const id = createCoupleWord({ names, quote, place, wedding_month: /^\d{4}-\d{2}$/.test(month) ? month : null, photo, contact, status: "pending", source: "couple" });
  after(async () => {
    await sendWhatsApp(`💌 ${names} sent kind words for the website:\n\n"${quote.slice(0, 300)}"\n\nApprove it here: ${siteUrl()}/admin/couples#w${id}`).catch(() => {});
  });
  return Response.json({ ok: true });
}
