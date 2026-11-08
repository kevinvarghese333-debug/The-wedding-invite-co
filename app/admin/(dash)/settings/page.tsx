/* eslint-disable @next/next/no-img-element */
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { SETTING_FIELDS, getSettings } from "@/lib/settings";
import { saveSettings } from "@/app/admin/settings-actions";

export const dynamic = "force-dynamic";

const GROUPS: [string, string[]][] = [
  ["Prices", ["offer_ends", "addon_domain", "addon_language", "addon_chapters", "addon_pages", "bundle_price", "bundle_note"]],
  ["Good to know (shown under the packages)", ["turnaround", "payment_terms", "revisions", "refund_policy"]],
  ["Numbers", ["stats_invites", "stats_guests"]],
  ["Founder and social", ["founder_name", "founder_story", "instagram_url"]],
  ["Enquiries", ["autoreply"]],
];

export default async function SettingsPage({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const sp = await searchParams;
  const s = getSettings();
  const byKey = Object.fromEntries(SETTING_FIELDS.map((f) => [f.key, f]));
  return (
    <div className="grid gap-6">
      <div>
        <h1 className="heading text-4xl">Settings</h1>
        <p className="text-muted-foreground mt-1">Facts about your business that appear on the website. Anything left empty is simply not shown.</p>
      </div>
      {sp.saved ? <p className="rounded-lg bg-emerald-50 px-4 py-3 text-sm text-emerald-800">Saved. The website is updated.</p> : null}
      {sp.error ? <p className="bg-destructive/10 text-destructive rounded-lg px-4 py-3 text-sm">{sp.error}</p> : null}
      <form action={saveSettings} className="grid gap-6">
        {GROUPS.map(([title, keys]) => (
          <Card key={title} className="gap-5 p-5">
            <h2 className="text-lg font-semibold">{title}</h2>
            {keys.map((k) => {
              const f = byKey[k];
              const id = `s-${k}`;
              const help = "help" in f ? f.help : "";
              if (f.type === "toggle")
                return (
                  <label key={k} className="flex items-start gap-3 text-sm">
                    <input type="checkbox" name={k} defaultChecked={s[f.key] !== "off"} className="accent-primary mt-0.5 size-4" />
                    <span>
                      <span className="font-medium">{f.label}</span>
                      {help ? <span className="text-muted-foreground block">{help}</span> : null}
                    </span>
                  </label>
                );
              return (
                <div key={k} className="grid gap-2">
                  <Label htmlFor={id}>{f.label}</Label>
                  {f.type === "textarea" ? (
                    <Textarea id={id} name={k} rows={3} defaultValue={s[f.key] ?? ""} />
                  ) : (
                    <Input id={id} name={k} type={f.type} defaultValue={s[f.key] ?? ""} />
                  )}
                  {help ? <p className="text-muted-foreground text-xs">{help}</p> : null}
                </div>
              );
            })}
            {title.startsWith("Founder") ? (
              <div className="grid gap-2">
                <Label htmlFor="s-photo">Founder photo</Label>
                <div className="flex items-center gap-4">
                  {s.founder_photo ? <img src={`/api/photos/${s.founder_photo}`} alt="" className="size-16 rounded-full object-cover" /> : null}
                  <Input id="s-photo" name="founder_photo" type="file" accept="image/*" />
                </div>
                {s.founder_photo ? (
                  <label className="text-muted-foreground flex items-center gap-2 text-sm">
                    <input type="checkbox" name="remove_founder_photo" value="yes" className="accent-primary" /> Remove the photo
                  </label>
                ) : null}
              </div>
            ) : null}
          </Card>
        ))}
        <div>
          <Button type="submit" size="lg">Save settings</Button>
        </div>
      </form>
    </div>
  );
}
