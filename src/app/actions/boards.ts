"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { ACTIVE_COMPANY_COOKIE } from "@/lib/company";

async function activeCompanyId(): Promise<string | null> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const cookieVal = cookies().get(ACTIVE_COMPANY_COOKIE)?.value;
  const { data } = await supabase
    .from("company_members")
    .select("company_id")
    .eq("user_id", user.id);
  if (!data || data.length === 0) return null;
  const ids = data.map((d) => d.company_id);
  return cookieVal && ids.includes(cookieVal) ? cookieVal : ids[0];
}

export async function createBoard(formData: FormData) {
  const name = String(formData.get("name") ?? "").trim();
  if (!name) return;

  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const companyId = await activeCompanyId();
  if (!user || !companyId) return;

  const { data: board } = await supabase
    .from("boards")
    .insert({ name, company_id: companyId, owner_id: user.id })
    .select("id")
    .single();

  // Kolom default
  if (board) {
    await supabase.from("board_columns").insert([
      { board_id: board.id, name: "To Do", position: 0 },
      { board_id: board.id, name: "In Progress", position: 1 },
      { board_id: board.id, name: "Done", position: 2 },
    ]);
  }

  revalidatePath("/boards");
  if (board) redirect(`/boards/${board.id}`);
}

export async function deleteBoard(boardId: string) {
  const supabase = createClient();
  await supabase.from("boards").delete().eq("id", boardId);
  revalidatePath("/boards");
  redirect("/boards");
}

export async function createColumn(boardId: string, name: string) {
  const supabase = createClient();
  const { data: cols } = await supabase
    .from("board_columns")
    .select("position")
    .eq("board_id", boardId)
    .order("position", { ascending: false })
    .limit(1);
  const nextPos = (cols?.[0]?.position ?? -1) + 1;

  await supabase
    .from("board_columns")
    .insert({ board_id: boardId, name, position: nextPos });
  revalidatePath(`/boards/${boardId}`);
}

export async function createTask(
  boardId: string,
  columnId: string,
  title: string
) {
  const supabase = createClient();
  const { data: tasks } = await supabase
    .from("tasks")
    .select("position")
    .eq("column_id", columnId)
    .order("position", { ascending: false })
    .limit(1);
  const nextPos = (tasks?.[0]?.position ?? -1) + 1;

  await supabase.from("tasks").insert({
    board_id: boardId,
    column_id: columnId,
    title,
    position: nextPos,
    priority: "medium",
  });
  revalidatePath(`/boards/${boardId}`);
}

/** Pindahkan task ke kolom + posisi tertentu (dipanggil saat drag-drop). */
export async function moveTask(
  taskId: string,
  columnId: string,
  position: number,
  boardId: string
) {
  const supabase = createClient();
  const patch: { column_id: string; position: number; done_at?: string | null } = {
    column_id: columnId,
    position,
  };
  await supabase.from("tasks").update(patch).eq("id", taskId);
  revalidatePath(`/boards/${boardId}`);
}

export async function updateTask(
  taskId: string,
  boardId: string,
  patch: {
    title?: string;
    description?: string | null;
    customer?: string | null;
    priority?: "low" | "medium" | "high";
    difficulty?: "low" | "medium" | "high";
    due_date?: string | null;
    assignee_id?: string | null;
  }
) {
  const supabase = createClient();
  await supabase
    .from("tasks")
    .update({ ...patch, updated_at: new Date().toISOString() })
    .eq("id", taskId);
  revalidatePath(`/boards/${boardId}`);
  revalidatePath(`/tasks/${taskId}`);
}

export async function deleteTask(taskId: string, boardId: string) {
  const supabase = createClient();
  await supabase.from("tasks").delete().eq("id", taskId);
  revalidatePath(`/boards/${boardId}`);
}

export async function addComment(taskId: string, body: string) {
  const trimmed = body.trim();
  if (!trimmed) return;
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;
  await supabase
    .from("task_comments")
    .insert({ task_id: taskId, author_id: user.id, body: trimmed });
  revalidatePath(`/tasks/${taskId}`);
}
