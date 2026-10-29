"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { checkPassword, endSession, rateLimited, requireAdmin, startSession } from "@/lib/auth";
import { addEvent, deleteLead, getLead, isStatus, setNotifyStatus, updateLead, type Lead } from "@/lib/db";
import { notifyNewLead } from "@/lib/notify";

export async function login(_prev: { error?: string } | undefined, formData: FormData) {
  const h = await headers();
  const ip = (h.get("x-forwarded-for") || "").split(",")[0].trim() || "local";
  if (rateLimited(`login:${ip}`, 8, 15 * 60 * 1000)) return { error: "Too many attempts. Try again in 15 minutes." };
  if (!checkPassword(String(formData.get("password") || ""))) return { error: "That password isn't right." };
  await startSession();
  redirect("/admin");
}

export async function logout() {
  await endSession();
  redirect("/admin/login");
}

const idOf = (fd: FormData) => Number(fd.get("id"));

export async function saveLead(formData: FormData) {
  await requireAdmin();
  const id = idOf(formData);
  const status = String(formData.get("status") || "");
  const follow = String(formData.get("follow_up") || "").trim();
  const amountRaw = String(formData.get("amount") || "").replace(/[^\d]/g, "");
  updateLead(id, {
    status: isStatus(status) ? status : undefined,
    follow_up: /^\d{4}-\d{2}-\d{2}$/.test(follow) ? follow : null,
    amount: amountRaw ? Number(amountRaw) : null,
  });
  revalidatePath("/admin");
  redirect(`/admin/leads/${id}?saved=1`);
}

export async function addNote(formData: FormData) {
  await requireAdmin();
  const id = idOf(formData);
  const text = String(formData.get("note") || "").trim().slice(0, 2000);
  if (text) addEvent(id, "note", text);
  redirect(`/admin/leads/${id}`);
}

export async function quickStatus(formData: FormData) {
  await requireAdmin();
  const id = idOf(formData);
  const status = String(formData.get("status") || "");
  if (isStatus(status)) updateLead(id, { status });
  revalidatePath("/admin");
  redirect(`/admin/leads/${id}`);
}

export async function removeLead(formData: FormData) {
  await requireAdmin();
  const id = idOf(formData);
  if (formData.get("confirm") !== "yes") redirect(`/admin/leads/${id}?confirm=1`);
  deleteLead(id);
  revalidatePath("/admin");
  redirect("/admin?deleted=1");
}

export async function resendNotify(formData: FormData) {
  await requireAdmin();
  const id = idOf(formData);
  const lead = getLead(id);
  if (lead) {
    const r = await notifyNewLead(lead);
    setNotifyStatus(id, r.email, r.whatsapp);
  }
  redirect(`/admin/leads/${id}?notified=1`);
}

export async function sendTest() {
  await requireAdmin();
  const now = new Date().toISOString();
  const sample: Lead = {
    id: 0,
    created_at: now,
    updated_at: now,
    name: "Test Couple",
    phone: "919999999999",
    email: "test@example.com",
    wedding_date: "2027-02-06",
    location: "Kochi",
    package: "story",
    functions: "3",
    message: "This is a test notification from your lead dashboard.",
    source: "test",
    status: "new",
    follow_up: null,
    amount: null,
    email_status: null,
    whatsapp_status: null,
  };
  const r = await notifyNewLead(sample);
  redirect(`/admin?test=${encodeURIComponent(`Email: ${r.email} · WhatsApp: ${r.whatsapp}`)}`);
}
