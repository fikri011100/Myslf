import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar } from "@/components/ui/avatar";
import { KanbanSquare } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getActiveCompany } from "@/lib/company";
import { NewBoardButton } from "./new-board-button";

export default async function BoardsPage() {
  const supabase = createClient();
  const active = await getActiveCompany();

  const { data: boards } = active
    ? await supabase
        .from("boards")
        .select("id, name, owner_id, created_at, profiles:owner_id(name)")
        .eq("company_id", active.id)
        .order("created_at", { ascending: false })
    : { data: [] };

  const list = boards ?? [];

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold">Boards</h1>
          <p className="text-muted-foreground">Papan Kanban tim Anda</p>
        </div>
        <NewBoardButton />
      </div>

      {list.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border bg-muted/40 p-12 text-center">
          <KanbanSquare className="mx-auto mb-3 h-10 w-10 text-brand-indigo/60" />
          <p className="font-medium">Belum ada board</p>
          <p className="text-sm text-muted-foreground">
            Buat board pertama Anda untuk mulai mengatur pekerjaan.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {list.map((b) => {
            const ownerName =
              (b.profiles as unknown as { name?: string } | null)?.name ?? "—";
            return (
              <Link key={b.id} href={`/boards/${b.id}`}>
                <Card className="transition-transform hover:-translate-y-1 hover:shadow-soft">
                  <CardHeader>
                    <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-indigo/10">
                      <KanbanSquare className="h-5 w-5 text-brand-indigo" />
                    </span>
                    <CardTitle className="mt-2">{b.name}</CardTitle>
                  </CardHeader>
                  <CardContent className="flex items-center gap-2">
                    <Avatar name={ownerName} className="h-6 w-6 text-[10px]" />
                    <span className="text-sm text-muted-foreground">
                      {ownerName}
                    </span>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
