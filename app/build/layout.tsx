import type { Metadata } from "next";
import { BaseProvider } from "@/components/builder/base";
import { getBase } from "@/lib/builder/server";
import { builderUrl } from "@/lib/config";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: { default: "Make your own wedding invitation website", template: "%s · Wedding invitation builder" },
  description: "Design your wedding invitation website yourself: pick a design, add your names, events, photos and music, and share one link on WhatsApp. Free to design, pay only to publish.",
  alternates: { canonical: builderUrl() },
};

export default async function BuildLayout({ children }: { children: React.ReactNode }) {
  const base = await getBase();
  return <BaseProvider base={base}>{children}</BaseProvider>;
}
