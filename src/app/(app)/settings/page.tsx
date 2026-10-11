import { createClient } from "@/lib/supabase/server";
import { getActiveCompany } from "@/lib/company";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import { InviteCode } from "./invite-code";

export default async function SettingsPage() {
  const supabase = createClient();
  const active = await getActiveCompany();

  const { data: members } = active
    ? await supabase
        .from("company_members")
        .select("role, profiles:user_id(name, email)")
        .eq("company_id", active.id)
    : { data: [] };

  return (
    <div className="flex flex-col gap-6">
      <h1 className="font-display text-2xl font-bold">Settings</h1>

      <Card>
        <CardHeader>
          <CardTitle>Perusahaan</CardTitle>
          <CardDescription>Informasi & kode undangan</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div>
            <p className="text-sm text-muted-foreground">Nama</p>
            <p className="font-medium">{active?.name}</p>
          </div>
          <div>
            <p className="mb-1 text-sm text-muted-foreground">Kode Undangan</p>
            <InviteCode code={active?.invite_code ?? ""} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Anggota ({members?.length ?? 0})</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-2">
          {(members ?? []).map((m, i) => {
            const p = m.profiles as unknown as { name?: string; email?: string } | null;
            const name = p?.name || p?.email || "User";
            return (
              <div
                key={i}
                className="flex items-center justify-between rounded-xl border border-border p-3"
              >
                <div className="flex items-center gap-3">
                  <Avatar name={name} className="h-8 w-8 text-xs" />
                  <div>
                    <p className="text-sm font-medium">{name}</p>
                    <p className="text-xs text-muted-foreground">{p?.email}</p>
                  </div>
                </div>
                <Badge variant={m.role === "super_admin" ? "pink" : m.role === "admin" ? "violet" : "cyan"}>
                  {m.role}
                </Badge>
              </div>
            );
          })}
        </CardContent>
      </Card>
    </div>
  );
}
