"use server";

import { revalidatePath } from "next/cache";
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

export async function createCompanyTask(formData: FormData) {
  const title = String(formData.get("title") ?? "").trim();
  if (!title) return;
  const assignee = String(formData.get("assignee_id") ?? "") || null;

  const companyId = await activeCompanyId();
  if (!companyId) return;

  const supabase = createClient();
  await supabase.from("company_tasks").insert({
    company_id: companyId,
    title,
    assignee_id: assignee,
    status: "open",
  });
  revalidatePath("/company-tasks");
}

export async function toggleCompanyTask(id: string, done: boolean) {
  const supabase = createClient();
  await supabase
    .from("company_tasks")
    .update({ status: done ? "done" : "open" })
    .eq("id", id);
  revalidatePath("/company-tasks");
}

export async function deleteCompanyTask(id: string) {
  const supabase = createClient();
  await supabase.from("company_tasks").delete().eq("id", id);
  revalidatePath("/company-tasks");
}
