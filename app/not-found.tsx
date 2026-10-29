import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <main className="grid min-h-dvh place-items-center px-4 text-center">
      <div>
        <p className="heading text-6xl">Not found</p>
        <p className="text-muted-foreground mt-3">That page doesn&apos;t exist.</p>
        <Button asChild className="mt-6">
          <Link href="/">Go to the home page</Link>
        </Button>
      </div>
    </main>
  );
}
