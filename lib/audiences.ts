/* Landing pages for specific searches. Each has its own title, copy, samples and FAQ. */
import type { Sample } from "@/lib/samples";

export type Audience = {
  slug: string;
  nav: string;
  tag: Sample["tags"][number];
  title: string; // <title>
  description: string; // meta description
  h1: string;
  h1Accent: string;
  intro: string;
  malayalam?: string;
  points: [string, string][];
  faq: [string, string][];
};

export const AUDIENCES: Audience[] = [
  {
    slug: "kerala-christian-wedding-invitation",
    nav: "Kerala Christian wedding invitations",
    tag: "christian",
    title: "Kerala Christian Wedding Invitation Website | Church Wedding E-Invite with RSVP",
    description:
      "Custom Kerala Christian wedding invitation websites: Holy Mass, Manasammatham and reception in one link, with church maps, RSVP and WhatsApp sharing. From ₹4,999.",
    h1: "Kerala Christian wedding invitations,",
    h1Accent: "in one link.",
    intro:
      "The Manasammatham, the Holy Mass, the reception. Different guests, different churches and halls, one beautiful invitation. We design it with your Bible verse, your parents' names in the family's own wording, and directions to every venue.",
    points: [
      ["Every function in its place", "Betrothal, Manasammatham, wedding Mass and reception, each with its time, venue, map and add-to-calendar."],
      ["Bride's side and groom's side", "Two versions with each family's wording, so both sides can send the invitation as their own."],
      ["Separate guest links", "Parish friends see the Mass and reception. Close family sees everything. Each link has its own RSVP."],
      ["Your verse, your story", "Open with the verse you chose and tell how you met, in chapters your guests scroll through."],
    ],
    faq: [
      ["Can it include our Bible verse and the church details?", "Yes. We add your verse, the church and parish names, Mass timings and a map button that opens directions straight to the church."],
      ["Can both families send their own version?", "Yes. We make a bride's side and a groom's side version with each family's wording, and both lead to the same RSVP list."],
      ["Do elders need to install anything?", "No. It opens from WhatsApp in the phone's browser, like any link."],
    ],
  },
  {
    slug: "hindu-wedding-invitation-kerala",
    nav: "Kerala Hindu wedding invitations",
    tag: "hindu",
    title: "Hindu Wedding Invitation Website in Kerala | Temple Wedding E-Invite with RSVP",
    description:
      "Custom Hindu wedding invitation websites from Kerala: muhurtham, temple venue, reception and every function in one link, with maps, RSVP and WhatsApp sharing. From ₹4,999.",
    h1: "Hindu wedding invitations from Kerala,",
    h1Accent: "made for every function.",
    intro:
      "The muhurtham at the temple, the sadhya, the reception. We design an invitation with the auspicious time front and centre, the lamp and lotus you love, and directions to every venue, so no one calls to ask the time again.",
    points: [
      ["Muhurtham up front", "The auspicious time and temple shown first, with a countdown and add-to-calendar."],
      ["Traditional, never dated", "Lotus, brass, jasmine and temple bells, designed to feel like your family, not a template."],
      ["Every function, one link", "Haldi, mehendi, the wedding and the reception, each with its own time, venue and RSVP."],
      ["Separate guest links", "Office friends see the reception, family sees every function, each with its own RSVP."],
    ],
    faq: [
      ["Can the muhurtham time be shown clearly?", "Yes. We put the muhurtham and temple first, with a live countdown and an add-to-calendar button."],
      ["Can we add a sloka or a blessing?", "Yes. We open with the verse or blessing your family uses, in Malayalam, Sanskrit or English."],
      ["Do guests need to download anything?", "No. It opens from WhatsApp in the browser on any phone."],
    ],
  },
  {
    slug: "nri-wedding-invitation",
    nav: "NRI wedding invitations",
    tag: "nri",
    title: "NRI Wedding Invitation Website | Kerala Wedding E-Invite for Guests Abroad",
    description:
      "Wedding invitation websites for NRI families: one WhatsApp link for guests in the Gulf, UK and beyond, with every function, maps, RSVP and time zones. From ₹4,999.",
    h1: "Half your guests live abroad.",
    h1Accent: "Give them one link with everything.",
    intro:
      "Relatives in Dubai, Doha, London and Toronto shouldn't have to piece together a wedding from forwarded PDFs. One link shows every function, venue and time, and lets them reply in a tap, from anywhere.",
    points: [
      ["Works on any phone, anywhere", "Opens from WhatsApp in the browser. Nothing to install, nothing blocked by country."],
      ["Every venue on the map", "Guests flying in tap once and get directions from the airport or hotel."],
      ["RSVP from abroad", "Headcounts per function, including who's travelling, with answers to your own questions like stay needed."],
      ["Planned on WhatsApp", "We plan it with you on WhatsApp from wherever you are, across time zones."],
    ],
    faq: [
      ["We're abroad. Can we plan it remotely?", "Yes. Everything happens on WhatsApp: you send details and photos, we send a preview to your phone."],
      ["Can guests tell us if they need a stay or a pickup?", "Yes. We add your own RSVP questions, such as travel dates, stay needed or meal preference."],
      ["Will it work for guests in the Gulf?", "Yes. It's a normal web link that opens in any phone's browser, straight from WhatsApp."],
    ],
  },
  {
    slug: "malayalam-wedding-invitation",
    nav: "Malayalam wedding invitations",
    tag: "malayalam",
    title: "Malayalam Wedding Invitation Website | വിവാഹ ക്ഷണം, Bilingual E-Invite with RSVP",
    description:
      "Malayalam and bilingual wedding invitation websites from Kerala, with your family's wording, every function, maps and RSVP, sent on WhatsApp. From ₹4,999.",
    h1: "Malayalam wedding invitations,",
    h1Accent: "in your family's own words.",
    intro:
      "Elders read the invitation in Malayalam, friends read it in English, and everyone gets the same venues, times and RSVP. We set the wording the way your family says it.",
    malayalam: "വിവാഹ ക്ഷണം, ഒരു ലിങ്കിൽ. എല്ലാ ചടങ്ങുകളും, മാപ്പും, RSVP-യും ഒരിടത്ത്.",
    points: [
      ["Malayalam, English or both", "Fully Malayalam, fully English, or side by side, so every generation reads it comfortably."],
      ["Your family's wording", "We follow the wording your family uses on printed cards, not a translation tool."],
      ["Every function, one link", "Each function with its time, venue, map and RSVP."],
      ["Shared on WhatsApp", "Your names and date show in the WhatsApp preview, so it looks like an invitation, not a bare link."],
    ],
    faq: [
      ["Can the whole invitation be in Malayalam?", "Yes. Fully Malayalam, fully English, or bilingual side by side."],
      ["Who writes the Malayalam wording?", "We set it from the wording your family uses, and you check every line in the preview before it goes out."],
      ["Do guests need to download anything?", "No. It opens from WhatsApp in the browser on any phone."],
    ],
  },
];

export const findAudience = (slug: string) => AUDIENCES.find((a) => a.slug === slug);
