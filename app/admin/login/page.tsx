import { redirect } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Logo } from "@/components/landing/art";
import { isAdmin } from "@/lib/auth";
import { STUDIO } from "@/lib/config";
import { LoginForm } from "./login-form";

export const dynamic = "force-dynamic";
export const metadata = { title: `Sign in · ${STUDIO}`, robots: { index: false } };

export default async function LoginPage() {
  if (await isAdmin()) redirect("/admin");
  return (
    <main className="bg-muted grid min-h-dvh place-items-center px-4 py-10">
      <div className="w-full max-w-sm">
        <div className="mb-6 flex justify-center">
          <Logo name={STUDIO} />
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Lead dashboard</CardTitle>
            <CardDescription>Sign in to see and manage enquiries.</CardDescription>
          </CardHeader>
          <CardContent>
            <LoginForm />
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
