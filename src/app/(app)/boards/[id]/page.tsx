import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { KanbanBoard } from "./kanban-board";

export default async function BoardDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const supabase = createClient();

  const { data: board } = await supabase
    .from("boards")
    .select("id, name")
    .eq("id", params.id)
    .maybeSingle();

  if (!board) notFound();

  const [{ data: columns }, { data: tasks }] = await Promise.all([
    supabase
      .from("board_columns")
      .select("id, name, position")
      .eq("board_id", params.id)
      .order("position"),
    supabase
      .from("tasks")
      .select(
        "id, column_id, number, title, customer, priority, difficulty, due_date, position"
      )
      .eq("board_id", params.id)
      .order("position"),
  ]);

  return (
    <div className="flex h-full flex-col gap-6">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Link href="/boards" className="hover:text-foreground">
          Boards
        </Link>
        <span>/</span>
        <span className="font-medium text-foreground">{board.name}</span>
      </div>

      <h1 className="font-display text-2xl font-bold">{board.name}</h1>

      <KanbanBoard
        boardId={board.id}
        columns={columns ?? []}
        tasks={tasks ?? []}
      />
    </div>
  );
}
