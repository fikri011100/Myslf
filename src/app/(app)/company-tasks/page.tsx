import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getActiveCompany } from "@/lib/company";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import { ListChecks } from "lucide-react";
import { CompanyTaskManager } from "./company-task-manager";

export default async function CompanyTasksPage() {
  const active = await getActiveCompany();
  if (!active) redirect("/onboarding");
  // Guard role: hanya admin / super_admin
  if (active.role !== "admin" && active.role !== "super_admin") {
    return (
      <div className="rounded-2xl border border-dashed border-border bg-muted/40 p-12 text-center">
        <p className="font-medium">Akses ditolak</p>
        <p className="text-sm text-muted-foreground">
          Hanya admin perusahaan yang dapat mengakses halaman ini.
        </p>
      </div>
    );
  }

  const supabase = createClient();
  const [{ data: tasks }, { data: members }] = await Promise.all([
    supabase
      .from("company_tasks")
      .select("id, title, status, assignee_id, profiles:assignee_id(name)")
      .eq("company_id", active.id)
      .order("created_at", { ascending: false }),
    supabase
      .from("company_members")
      .select("profiles:user_id(id, name)")
      .eq("company_id", active.id),
  ]);

  const memberOptions = (members ?? [])
    .map((m) => m.profiles as unknown as { id: string; name: string } | null)
    .filter((p): p is { id: string; name: string } => !!p);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-4">
        <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-violet/10">
          <ListChecks className="h-6 w-6 text-brand-violet" />
        </span>
        <div>
          <h1 className="font-display text-2xl font-bold">Company Tasks</h1>
          <p className="text-muted-foreground">Tugas level perusahaan</p>
        </div>
      </div>

      <CompanyTaskManager members={memberOptions} />

      <Card>
        <CardHeader>
          <CardTitle>Daftar Tugas ({tasks?.length ?? 0})</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-2">
          {(tasks?.length ?? 0) === 0 && (
            <p className="py-6 text-center text-sm text-muted-foreground">
              Belum ada tugas perusahaan.
            </p>
          )}
          {(tasks ?? []).map((t) => {
            const assignee =
              (t.profiles as unknown as { name?: string } | null)?.name ?? null;
            return (
              <div
                key={t.id}
                className="flex items-center justify-between rounded-xl border border-border p-3"
              >
                <div className="flex items-center gap-3">
                  {assignee && <Avatar name={assignee} className="h-7 w-7 text-[10px]" />}
                  <span className="text-sm font-medium">{t.title}</span>
                </div>
                <Badge variant={t.status === "done" ? "green" : "amber"}>
                  {t.status}
                </Badge>
              </div>
            );
          })}
        </CardContent>
      </Card>
    </div>
  );
}
