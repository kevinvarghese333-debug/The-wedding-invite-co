import Link from "next/link";
import { ExternalLink, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/landing/art";
import { requireAdmin } from "@/lib/auth";
import { STUDIO } from "@/lib/config";
import { logout } from "@/app/admin/actions";

export const dynamic = "force-dynamic";
export const metadata = { title: `Leads · ${STUDIO}`, robots: { index: false } };

export default async function DashLayout({ children }: { children: React.ReactNode }) {
  await requireAdmin();
  return (
    <div className="bg-muted min-h-dvh">
      <header className="bg-card sticky top-0 z-30 border-b">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-3 px-4 sm:px-6">
          <Link href="/admin" aria-label="Leads home">
            <Logo name={STUDIO} />
          </Link>
          <div className="flex items-center gap-1.5">
            <Button variant="ghost" size="sm" asChild className="max-sm:hidden">
              <a href="/" target="_blank" rel="noopener">
                <ExternalLink /> View site
              </a>
            </Button>
            <form action={logout}>
              <Button variant="outline" size="sm" type="submit">
                <LogOut /> Log out
              </Button>
            </form>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6">{children}</main>
    </div>
  );
}
