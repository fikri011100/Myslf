import { createClient } from "@/lib/supabase/server";
import { getActiveCompany } from "@/lib/company";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";

export default async function UsersPage() {
  const active = await getActiveCompany();

  if (!active || active.role !== "super_admin") {
    return (
      <div className="rounded-2xl border border-dashed border-border bg-muted/40 p-12 text-center">
        <p className="font-medium">Akses ditolak</p>
        <p className="text-sm text-muted-foreground">
          Hanya super admin yang dapat mengakses manajemen user.
        </p>
      </div>
    );
  }

  const supabase = createClient();
  const { data: members } = await supabase
    .from("company_members")
    .select("role, profiles:user_id(id, name, email)")
    .eq("company_id", active.id);

  return (
    <div className="flex flex-col gap-6">
      <h1 className="font-display text-2xl font-bold">Users</h1>

      <Card>
        <CardHeader>
          <CardTitle>Anggota Perusahaan ({members?.length ?? 0})</CardTitle>
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
