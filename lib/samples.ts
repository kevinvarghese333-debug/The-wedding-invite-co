/* Live sample invitations. Cards and previews link to /i/<slug> on our own domain, which forwards to where each invite is hosted.
   When an invite moves to its own address, change `live` here and every link follows. */
export type Sample = { slug: string; names: string; live: string; style: string; tags: ("christian" | "hindu" | "nri" | "malayalam" | "classic" | "signature")[]; frame?: boolean };

export const SAMPLES: Sample[] = [
  { slug: "keerthy-rosheel", names: "Keerthy & Rosheel", live: "https://kavitha.cloud/keerthyandrosheel", style: "Kerala Christian wedding, story in watercolour chapters", tags: ["christian", "signature"], frame: false },
  { slug: "jithin-christina", names: "Jithin & Christina", live: "https://jithin-christina.vercel.app/", style: "Christian wedding under a bougainvillea arch, scratch the gold card for the date", tags: ["christian", "signature"] },
  { slug: "malavika-hari", names: "Malavika & Hari", live: "https://malavika-hari.vercel.app/", style: "Kerala Hindu wedding, lotus on water (Thamara)", tags: ["hindu", "malayalam", "signature"] },
  { slug: "dolly-kapil", names: "Dolly & Kapil", live: "https://theweddinginviteco.xyz/dolly-kapil/?v=11", style: "Two days of celebrations, a gold wax seal on wine red", tags: ["hindu", "signature"] },
  { slug: "ross-rachel", names: "Ross & Rachel", live: "https://ross-and-rachel.vercel.app/", style: "Floral classic, peonies and roses", tags: ["christian", "nri", "classic"] },
  { slug: "nila-aaron", names: "Nila & Aaron", live: "https://nila-aaron.vercel.app/", style: "New Year's Eve in Kochi, moon and midnight", tags: ["christian", "nri", "signature"] },
  { slug: "ishani-rudra", names: "Ishani & Rudra", live: "https://ishani-rudra.vercel.app/", style: "Temple wedding in the mountains", tags: ["hindu", "signature"] },
  { slug: "tara-advait", names: "Tara & Advait", live: "https://tara-advait.vercel.app/", style: "Temple bells in the hills, Rishikesh", tags: ["hindu", "nri", "signature"] },
  { slug: "tara-kabir", names: "Tara & Kabir", live: "https://tara-kabir.vercel.app/", style: "Playful beach wedding in Goa, untie the bow", tags: ["nri", "classic"] },
  { slug: "joel-anna", names: "Joel & Anna", live: "https://abhishek-kanika.vercel.app/", style: "Lantern by the sea, moonlit", tags: ["christian", "nri", "signature"] },
  { slug: "veer-naina", names: "Veer & Naina", live: "https://veer-naina.vercel.app/", style: "A palace at dusk, cinematic scroll", tags: ["hindu", "nri", "signature"] },
  { slug: "amala-lino", names: "Amala & Lino", live: "https://amala-lino-engagement.imagkavitha.chatgpt.site/", style: "Kerala Christian engagement, a blue envelope sealed in gold", tags: ["christian", "classic"] },
  { slug: "meera-aarav", names: "Meera & Aarav", live: "https://theweddinginviteco.xyz/meera-aarav/?v=2", style: "Lakeside wedding in Udaipur, follow the swans", tags: ["hindu", "nri", "signature"] },
];

export const sampleHref = (slug: string) => `/i/${slug}`;
export const findSample = (slug: string) => SAMPLES.find((s) => s.slug === slug);
