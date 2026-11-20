import { editable, json } from "@/lib/builder/api";
import { cleanSlug, slugProblem } from "@/lib/builder/sites";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/* Is this web address free? */
export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { site, error } = await editable(id);
  if (error) return error;
  const slug = cleanSlug(new URL(req.url).searchParams.get("s") || "");
  const problem = slugProblem(slug, site.id);
  return json({ ok: !problem, slug, problem });
}
