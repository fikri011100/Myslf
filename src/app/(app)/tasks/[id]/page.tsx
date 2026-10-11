import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import { CommentForm } from "./comment-form";

const PRIORITY: Record<string, "green" | "amber" | "red"> = {
  low: "green",
  medium: "amber",
  high: "red",
};

export default async function TaskDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const supabase = createClient();

  const { data: task } = await supabase
    .from("tasks")
    .select(
      "id, board_id, number, title, description, customer, status, priority, difficulty, due_date, done_at, assignee_id, profiles:assignee_id(name)"
    )
    .eq("id", params.id)
    .maybeSingle();

  if (!task) notFound();

  const { data: comments } = await supabase
    .from("task_comments")
    .select("id, body, created_at, profiles:author_id(name)")
    .eq("task_id", params.id)
    .order("created_at", { ascending: true });

  const assigneeName =
    (task.profiles as unknown as { name?: string } | null)?.name ?? "Belum ditetapkan";

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Link href={`/boards/${task.board_id}`} className="hover:text-foreground">
          Board
        </Link>
        <span>/</span>
        <span className="font-medium text-foreground">
          {task.number ? `#${task.number}` : "Task"}
        </span>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-wrap items-center gap-2">
            {task.priority && (
              <Badge variant={PRIORITY[task.priority]}>{task.priority}</Badge>
            )}
            {task.difficulty && (
              <Badge variant="violet">{task.difficulty} difficulty</Badge>
            )}
            {task.customer && <Badge variant="cyan">{task.customer}</Badge>}
            {task.done_at && <Badge variant="green">Done</Badge>}
          </div>
          <CardTitle className="mt-2 text-2xl">{task.title}</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <section>
            <h3 className="mb-1 font-display text-sm font-semibold">Deskripsi</h3>
            <div
              className="prose prose-sm max-w-none text-sm text-muted-foreground"
              dangerouslySetInnerHTML={{
                __html: task.description || "<p>Tidak ada deskripsi.</p>",
              }}
            />
          </section>

          <section className="grid grid-cols-2 gap-4 rounded-xl bg-muted/40 p-4 text-sm">
            <div>
              <p className="text-muted-foreground">Status</p>
              <p className="font-medium">{task.status ?? (task.done_at ? "Done" : "Open")}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Assignee</p>
              <p className="font-medium">{assigneeName}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Due Date</p>
              <p className="font-medium">{task.due_date ?? "—"}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Customer</p>
              <p className="font-medium">{task.customer ?? "—"}</p>
            </div>
          </section>

          <section>
            <h3 className="mb-2 font-display text-sm font-semibold">
              Komentar ({comments?.length ?? 0})
            </h3>
            <div className="flex flex-col gap-3">
              {(comments ?? []).map((c) => {
                const author =
                  (c.profiles as unknown as { name?: string } | null)?.name ?? "User";
                return (
                  <div key={c.id} className="flex gap-3">
                    <Avatar name={author} className="h-7 w-7 text-[10px]" />
                    <div className="flex-1 rounded-xl bg-muted/40 p-3">
                      <p className="text-xs font-medium">{author}</p>
                      <p className="text-sm">{c.body}</p>
                    </div>
                  </div>
                );
              })}
              {(comments?.length ?? 0) === 0 && (
                <p className="text-sm text-muted-foreground">Belum ada komentar.</p>
              )}
            </div>
            <div className="mt-3">
              <CommentForm taskId={task.id} />
            </div>
          </section>
        </CardContent>
      </Card>
    </div>
  );
}
