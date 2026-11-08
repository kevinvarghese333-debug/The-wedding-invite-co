import { Logo } from "@/components/landing/art";
import { STUDIO } from "@/lib/config";

export const metadata = { title: { absolute: `Privacy · ${STUDIO}` }, description: "How The Wedding Invite Co. stores guest names, numbers and RSVPs." };

export default function Privacy() {
  const sections: [string, string[]][] = [
    ["What we collect", ["From couples: your names, WhatsApp number and anything you choose to tell us about the wedding.", "From your guests, through the RSVP on your invitation: the name they type, their reply for each function, headcount and answers to any questions you add."]],
    ["Where it is stored", ["On our own server, in a private database. It is not kept in public spreadsheets or shared documents.", "Only the two of you and our small team can see your guest list and replies."]],
    ["What we never do", ["We never sell, rent or share your details or your guests' details.", "We don't add guests to mailing lists or message them for marketing."]],
    ["Deleting it", ["Ask us on WhatsApp after the wedding and we delete the guest list and replies for good.", "You can also download everything to Excel before you ask."]],
    ["Photos and words you share", ["Photos and words from couples appear on this website only with their permission, and come down when they ask."]],
  ];
  return (
    <main className="min-h-dvh bg-[#F8F1EA] px-4 py-10 sm:py-16">
      <div className="mx-auto max-w-[680px]">
        <a href="/" className="inline-block">
          <Logo name={STUDIO} />
        </a>
        <h1 className="heading mt-10 text-[clamp(36px,6vw,52px)] leading-[1.02]">
          Your guests&apos; details, <em className="text-clay-ink font-normal">kept private.</em>
        </h1>
        {sections.map(([h, ps]) => (
          <section key={h} className="mt-8">
            <h2 className="text-lg font-semibold">{h}</h2>
            {ps.map((p) => (
              <p key={p} className="text-muted-foreground mt-2 leading-relaxed">{p}</p>
            ))}
          </section>
        ))}
      </div>
    </main>
  );
}
