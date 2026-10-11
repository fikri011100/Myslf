import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar } from "@/components/ui/avatar";
import { KanbanSquare, Plus } from "lucide-react";

// Stub data — ganti dengan query Supabase (tabel boards).
const BOARDS = [
  { id: "demo-1", name: "Daily Report August", owner_name: "fikri" },
  { id: "demo-2", name: "Daily Report", owner_name: "fikri" },
];

export default function BoardsPage() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold">Boards</h1>
          <p className="text-muted-foreground">Papan Kanban tim Anda</p>
        </div>
        <Button>
          <Plus className="h-4 w-4" /> Board Baru
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {BOARDS.map((b) => (
          <Link key={b.id} href={`/boards/${b.id}`}>
            <Card className="transition-transform hover:-translate-y-1 hover:shadow-soft">
              <CardHeader>
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-indigo/10">
                  <KanbanSquare className="h-5 w-5 text-brand-indigo" />
                </span>
                <CardTitle className="mt-2">{b.name}</CardTitle>
              </CardHeader>
              <CardContent className="flex items-center gap-2">
                <Avatar name={b.owner_name} className="h-6 w-6 text-[10px]" />
                <span className="text-sm text-muted-foreground">
                  {b.owner_name}
                </span>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
