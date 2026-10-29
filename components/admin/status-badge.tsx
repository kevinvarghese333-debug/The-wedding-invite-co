import { Badge } from "@/components/ui/badge";
import { statusLabel } from "@/lib/db";

const VARIANT = {
  new: "default",
  contacted: "secondary",
  quoted: "clay",
  booked: "success",
  lost: "outline",
} as const;

export function StatusBadge({ status }: { status: string }) {
  return <Badge variant={VARIANT[status as keyof typeof VARIANT] ?? "outline"}>{statusLabel(status)}</Badge>;
}
