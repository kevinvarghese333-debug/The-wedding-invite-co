import fs from "node:fs";
import path from "node:path";
import { MUSIC_RE, musicDir } from "@/lib/builder/server";

export const runtime = "nodejs";

const TYPES: Record<string, string> = { mp3: "audio/mpeg", m4a: "audio/mp4", ogg: "audio/ogg" };

/* Songs couples uploaded and tracks added in Admin → Music. Supports Range requests, which iPhones need to play audio. */
export async function GET(req: Request, { params }: { params: Promise<{ file: string }> }) {
  const { file } = await params;
  if (!MUSIC_RE.test(file)) return new Response("Not found", { status: 404 });
  const p = path.join(musicDir(), file);
  if (!fs.existsSync(p)) return new Response("Not found", { status: 404 });
  const size = fs.statSync(p).size;
  const type = TYPES[file.split(".").pop()!] || "application/octet-stream";
  const base = { "Content-Type": type, "Accept-Ranges": "bytes", "Cache-Control": "public, max-age=31536000, immutable" };
  const range = /bytes=(\d*)-(\d*)/.exec(req.headers.get("range") || "");
  if (range) {
    let start = range[1] ? Number(range[1]) : 0;
    let end = range[2] ? Number(range[2]) : size - 1;
    if (!range[1] && range[2]) {
      start = Math.max(0, size - Number(range[2]));
      end = size - 1;
    }
    if (start >= size || end < start) return new Response(null, { status: 416, headers: { "Content-Range": `bytes */${size}` } });
    end = Math.min(end, size - 1);
    const buf = Buffer.alloc(end - start + 1);
    const fd = fs.openSync(p, "r");
    try {
      fs.readSync(fd, buf, 0, buf.length, start);
    } finally {
      fs.closeSync(fd);
    }
    return new Response(buf, { status: 206, headers: { ...base, "Content-Range": `bytes ${start}-${end}/${size}`, "Content-Length": String(buf.length) } });
  }
  return new Response(fs.readFileSync(p), { headers: { ...base, "Content-Length": String(size) } });
}
