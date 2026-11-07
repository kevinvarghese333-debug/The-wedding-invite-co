"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth";
import { createCoupleWord, deleteCoupleWord, deletePhoto, getCoupleWord, listCoupleWords, savePhoto, updateCoupleWord, COUPLE_STATUSES, type CoupleWord } from "@/lib/couples";

const str = (fd: FormData, k: string, max: number) => String(fd.get(k) || "").trim().slice(0, max);
const month = (v: string) => (/^\d{4}-\d{2}$/.test(v) ? v : null);
const back = (q = "") => {
  revalidatePath("/");
  revalidatePath("/admin/couples");
  redirect(`/admin/couples${q}`);
};

export async function addCoupleWord(fd: FormData) {
  await requireAdmin();
  const names = str(fd, "names", 80);
  const quote = str(fd, "quote", 900);
  if (names.length < 3 || quote.length < 5) back("?error=" + encodeURIComponent("Please add the couple's names and their words."));
  let photo: string | null = null;
  const file = fd.get("photo");
  if (file instanceof File && file.size > 0) {
    try {
      photo = await savePhoto(file);
    } catch (e) {
      back("?error=" + encodeURIComponent((e as Error).message));
    }
  }
  createCoupleWord({
    names,
    quote,
    place: str(fd, "place", 80),
    wedding_month: month(str(fd, "wedding_month", 7)),
    photo,
    status: fd.get("publish") === "yes" ? "published" : "hidden",
    source: "admin",
  });
  back("?added=1");
}

export async function editCoupleWord(fd: FormData) {
  await requireAdmin();
  const id = Number(fd.get("id"));
  const w = getCoupleWord(id);
  if (!w) back();
  const patch: Partial<CoupleWord> = {
    names: str(fd, "names", 80) || w!.names,
    quote: str(fd, "quote", 900) || w!.quote,
    place: str(fd, "place", 80) || null,
    wedding_month: month(str(fd, "wedding_month", 7)),
  };
  const file = fd.get("photo");
  if (file instanceof File && file.size > 0) {
    try {
      patch.photo = await savePhoto(file);
      deletePhoto(w!.photo);
    } catch (e) {
      back("?error=" + encodeURIComponent((e as Error).message));
    }
  } else if (fd.get("remove_photo") === "yes") {
    deletePhoto(w!.photo);
    patch.photo = null;
  }
  updateCoupleWord(id, patch);
  back(`?saved=1#w${id}`);
}

export async function setCoupleStatus(fd: FormData) {
  await requireAdmin();
  const id = Number(fd.get("id"));
  const status = String(fd.get("status")) as CoupleWord["status"];
  if (COUPLE_STATUSES.includes(status)) updateCoupleWord(id, { status });
  back(`#w${id}`);
}

export async function showFirst(fd: FormData) {
  await requireAdmin();
  const id = Number(fd.get("id"));
  const top = Math.max(0, ...listCoupleWords().map((w) => w.sort));
  updateCoupleWord(id, { sort: top + 1 });
  back(`#w${id}`);
}

export async function removeCoupleWord(fd: FormData) {
  await requireAdmin();
  deleteCoupleWord(Number(fd.get("id")));
  back("?deleted=1");
}
