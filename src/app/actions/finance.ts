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

export async function addTransaction(formData: FormData) {
  const type = String(formData.get("type") ?? "expense") as "income" | "expense";
  const category = String(formData.get("category") ?? "").trim() || "Lainnya";
  const amount = Number(formData.get("amount") ?? 0);
  const date = String(formData.get("date") ?? "") || new Date().toISOString().slice(0, 10);
  const note = String(formData.get("note") ?? "").trim() || null;

  if (!amount || amount <= 0) return;

  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const companyId = await activeCompanyId();
  if (!user || !companyId) return;

  await supabase.from("finance_transactions").insert({
    company_id: companyId,
    type,
    category,
    amount,
    date,
    note,
    created_by: user.id,
  });
  revalidatePath("/finance");
}

export async function deleteTransaction(id: string) {
  const supabase = createClient();
  await supabase.from("finance_transactions").delete().eq("id", id);
  revalidatePath("/finance");
}
