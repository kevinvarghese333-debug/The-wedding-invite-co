"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth";
import { cleanSlug, deleteSite, getSite, publishChanges, revokeLinks, setAddons, setLiveUntil, setSlug, setStatus, siteSummary, slugProblem, suggestSlug, addLibraryTrack, deleteLibraryTrack } from "@/lib/builder/sites";
import { cleanAddons, parseAddons, totalFor } from "@/lib/builder/addons";
import { completePayment } from "@/lib/builder/publish";
import { musicDir, prices, saveMusic, MUSIC_RE } from "@/lib/builder/server";
import fs from "node:fs";
import path from "node:path";

const str = (fd: FormData, k: string, max: number) => String(fd.get(k) || "").trim().slice(0, max);
const back = (id: string, q = "") => {
  revalidatePath(`/admin/sites/${id}`);
  redirect(`/admin/sites/${id}${q}`);
};

/* Payment taken outside Razorpay (UPI, cash, or free for friends): publish it. */
export async function markPaidAction(fd: FormData) {
  await requireAdmin();
  const id = str(fd, "id", 20);
  const s = getSite(id);
  if (!s) redirect("/admin/sites");
  let slug = cleanSlug(str(fd, "slug", 60)) || s.slug || suggestSlug(siteSummary(s), s.id);
  const problem = slugProblem(slug, s.id);
  if (problem) back(id, "?error=" + encodeURIComponent(`Web address: ${problem}`));
  setSlug(s.id, slug);
  const method = fd.get("method") === "free" ? "free" : "manual";
  const amount = method === "free" ? 0 : Math.max(0, Number.parseInt(str(fd, "amount", 10), 10) || totalFor(prices(), parseAddons(s.addons)));
  await completePayment(s.id, { amount, ref: str(fd, "ref", 80), method });
  back(id, "?saved=" + encodeURIComponent("Marked paid and published."));
}

/* Add-ons and how long it stays live: for upgrades paid on WhatsApp, or a favour. */
export async function setPlanAction(fd: FormData) {
  await requireAdmin();
  const id = str(fd, "id", 20);
  const s = getSite(id);
  if (!s) redirect("/admin/sites");
  setAddons(id, cleanAddons(fd.getAll("addons"), true));
  const until = str(fd, "live_until", 10);
  setLiveUntil(id, /^\d{4}-\d{2}-\d{2}$/.test(until) ? until : null);
  back(id, "?saved=" + encodeURIComponent("Plan saved."));
}

export async function setSlugAction(fd: FormData) {
  await requireAdmin();
  const id = str(fd, "id", 20);
  const slug = cleanSlug(str(fd, "slug", 60));
  const problem = slugProblem(slug, id);
  if (problem) back(id, "?error=" + encodeURIComponent(problem));
  setSlug(id, slug);
  back(id, "?saved=" + encodeURIComponent("Web address changed. The old link no longer works."));
}

export async function setStatusAction(fd: FormData) {
  await requireAdmin();
  const id = str(fd, "id", 20);
  const status = fd.get("status") === "paused" ? "paused" : "live";
  setStatus(id, status);
  back(id, "?saved=" + encodeURIComponent(status === "paused" ? "Taken offline. Guests see a short note instead." : "Back online."));
}

export async function publishChangesAction(fd: FormData) {
  await requireAdmin();
  const id = str(fd, "id", 20);
  publishChanges(id);
  back(id, "?saved=" + encodeURIComponent("Latest edits are live."));
}

export async function revokeAction(fd: FormData) {
  await requireAdmin();
  const id = str(fd, "id", 20);
  revokeLinks(id);
  back(id, "?saved=" + encodeURIComponent("Old edit links stopped working. Send the couple the new one below."));
}

export async function deleteSiteAction(fd: FormData) {
  await requireAdmin();
  const id = str(fd, "id", 20);
  if (fd.get("confirm") !== "DELETE") back(id, "?error=" + encodeURIComponent('Type DELETE to confirm.'));
  deleteSite(id);
  revalidatePath("/admin/sites");
  redirect("/admin/sites?deleted=1");
}

/* Music library */
export async function addTrackAction(fd: FormData) {
  await requireAdmin();
  const title = str(fd, "title", 80);
  const by = str(fd, "by", 80);
  const file = fd.get("file");
  if (!title || !(file instanceof File) || !file.size) redirect("/admin/music?error=" + encodeURIComponent("Add a title and choose an MP3."));
  let name = "";
  try {
    name = await saveMusic(file as File);
  } catch (e) {
    redirect("/admin/music?error=" + encodeURIComponent((e as Error).message));
  }
  addLibraryTrack({ title, by, file: name });
  revalidatePath("/admin/music");
  redirect("/admin/music?saved=1");
}

export async function deleteTrackAction(fd: FormData) {
  await requireAdmin();
  const t = deleteLibraryTrack(str(fd, "id", 20));
  if (t && MUSIC_RE.test(t.file)) {
    try {
      fs.unlinkSync(path.join(musicDir(), t.file));
    } catch {}
  }
  revalidatePath("/admin/music");
  redirect("/admin/music");
}
