import { Badge } from "@/components/ui/badge";
import type { Site } from "@/lib/builder/sites";

export function SiteBadge({ s }: { s: Pick<Site, "paid_at" | "status" | "publish_requested_at"> }) {
  if (s.paid_at) return <Badge variant={s.status === "paused" ? "outline" : "success"}>{s.status === "paused" ? "Paused" : "Live"}</Badge>;
  if (s.publish_requested_at) return <Badge variant="clay">Wants to publish</Badge>;
  return <Badge variant="outline">Draft</Badge>;
}
