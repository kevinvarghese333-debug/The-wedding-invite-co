import { BuilderFooter, BuilderHeader } from "@/components/builder/header";
import { FindForm } from "@/components/builder/find-form";
import { getBase } from "@/lib/builder/server";
import { publicWhatsApp } from "@/lib/config";
import { whatsappHref } from "@/lib/whatsapp";

export const metadata = { title: "Find my design", robots: { index: false } };

export default async function FindPage({ searchParams }: { searchParams: Promise<{ expired?: string }> }) {
  const base = await getBase();
  const sp = await searchParams;
  return (
    <div className="flex min-h-dvh flex-col">
      <BuilderHeader base={base} active="mine" />
      <main className="mx-auto grid w-full max-w-md flex-1 content-start gap-6 px-4 py-14 text-center">
        <div>
          <h1 className="heading text-5xl">Find my design</h1>
          <p className="text-muted-foreground mt-2">We&apos;ll email you a link that opens your invitation on this device.</p>
        </div>
        {sp.expired ? (
          <p role="status" className="bg-clay-soft rounded-lg px-4 py-3 text-sm">
            That link has expired or was replaced. Ask for a fresh one below.
          </p>
        ) : null}
        <FindForm />
        <p className="text-muted-foreground text-sm">
          Didn&apos;t save it with an email?{" "}
          <a href={whatsappHref(publicWhatsApp(), "Hi! I can't find the invitation I made in the builder.")} className="text-foreground underline underline-offset-4" target="_blank" rel="noopener">
            Message us on WhatsApp
          </a>
          .
        </p>
      </main>
      <BuilderFooter />
    </div>
  );
}
