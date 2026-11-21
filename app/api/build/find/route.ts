import { after } from "next/server";
import { clean, emailOk, json } from "@/lib/builder/api";
import { listByEmail, siteSummary } from "@/lib/builder/sites";
import { clientIp, editLink } from "@/lib/builder/server";
import { sendMailTo, simpleEmail } from "@/lib/notify";
import { rateLimited } from "@/lib/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/* "Email me my links": always answers the same way, so it never reveals which emails have designs. */
export async function POST(req: Request) {
  const b = (await req.json().catch(() => ({}))) as Record<string, unknown>;
  const email = clean(b.email, 120).toLowerCase();
  if (!emailOk(email)) return json({ ok: false, error: "Please enter the email you used." }, 422);
  if (rateLimited(`find:${clientIp(req)}`, 5, 30 * 60 * 1000) || rateLimited(`find:${email}`, 3, 30 * 60 * 1000))
    return json({ ok: false, error: "Please wait a few minutes before asking again." }, 429);
  after(async () => {
    const sites = listByEmail(email);
    if (!sites.length) return;
    const lines = sites.map((s) => `${siteSummary(s).names}: ${editLink(s)}`);
    await sendMailTo(
      email,
      "Your invitation links",
      `Here ${sites.length === 1 ? "is the link" : "are the links"} to your invitation${sites.length === 1 ? "" : "s"}:\n\n${lines.join("\n")}\n\nKeep these to yourself: anyone with a link can edit that invitation.`,
      simpleEmail("Your invitation links", [`Here ${sites.length === 1 ? "is the link" : "are the links"} to edit your invitation${sites.length === 1 ? "" : "s"}.`, ...lines, "Keep these to yourself: anyone with a link can edit that invitation."])
    );
  });
  return json({ ok: true });
}
