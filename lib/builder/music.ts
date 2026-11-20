/* Music a couple can choose. Built-in tracks ship in public/builder/music. More can be added in Admin → Music,
   and couples can upload their own song. Track ids: "lib:<id>" for the library, "up:<file>" for an upload. */
export type Track = { id: string; title: string; by: string; src: string };

export const BUILT_IN: Track[] = [
  { id: "canon", title: "Canon in D", by: "Pachelbel · music box", src: "/builder/music/canon.mp3" },
  { id: "gymnopedie", title: "Gymnopédie No. 1", by: "Satie · soft piano", src: "/builder/music/gymnopedie.mp3" },
  { id: "first-light", title: "First Light", by: "Soft piano", src: "/builder/music/first-light.mp3" },
  { id: "lanterns", title: "Lanterns", by: "Music box and strings", src: "/builder/music/lanterns.mp3" },
];

export const uploadSrc = (file: string) => `/api/build/music/${file}`;

/** Where the browser loads a track from, or "" when there's no music. */
export function trackSrc(track: string, library: Track[]) {
  if (!track) return "";
  if (track.startsWith("up:")) return uploadSrc(track.slice(3));
  const t = library.find((x) => `lib:${x.id}` === track);
  return t ? t.src : "";
}
