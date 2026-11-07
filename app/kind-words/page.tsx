import { Logo } from "@/components/landing/art";
import { KindWordsForm } from "@/components/landing/kind-words-form";
import { STUDIO } from "@/lib/config";

export const metadata = {
  title: `Share your words · ${STUDIO}`,
  description: "Tell us how your invitation went. We'd love to share it with couples who are planning theirs.",
  robots: { index: false },
};

export default function KindWordsPage() {
  return (
    <main className="min-h-dvh bg-[#F8F1EA] px-4 py-10 sm:py-16">
      <div className="mx-auto max-w-[560px]">
        <a href="/" className="inline-block">
          <Logo name={STUDIO} />
        </a>
        <h1 className="heading mt-10 text-[clamp(36px,6vw,52px)] leading-[1.02]">
          Congratulations, <em className="text-clay-ink font-normal">you two.</em>
        </h1>
        <p className="text-muted-foreground mt-4 text-[17px] leading-relaxed">
          We loved making your invitation. If you have a minute, tell us how it went: what your guests said, what you loved, anything at all. With your permission, we&apos;ll share it with couples who are planning theirs.
        </p>
        <div className="bg-card mt-8 rounded-2xl border p-5 shadow-sm sm:p-7">
          <KindWordsForm />
        </div>
      </div>
    </main>
  );
}
