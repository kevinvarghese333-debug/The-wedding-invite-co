"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth";
import { SETTING_FIELDS, getSettings, setSetting } from "@/lib/settings";
import { deletePhoto, savePhoto } from "@/lib/couples";

export async function saveSettings(fd: FormData) {
  await requireAdmin();
  for (const f of SETTING_FIELDS) {
    if (f.type === "toggle") {
      setSetting(f.key, fd.get(f.key) === "on" ? "on" : "off");
      continue;
    }
    const v = String(fd.get(f.key) ?? "").trim().slice(0, f.type === "textarea" ? 1200 : 300);
    setSetting(f.key, v || null);
  }
  const file = fd.get("founder_photo");
  const old = getSettings().founder_photo;
  if (file instanceof File && file.size > 0) {
    try {
      const name = await savePhoto(file);
      setSetting("founder_photo", name);
      deletePhoto(old ?? null);
    } catch (e) {
      redirect("/admin/settings?error=" + encodeURIComponent((e as Error).message));
    }
  } else if (fd.get("remove_founder_photo") === "yes") {
    deletePhoto(old ?? null);
    setSetting("founder_photo", null);
  }
  revalidatePath("/", "layout");
  redirect("/admin/settings?saved=1");
}
