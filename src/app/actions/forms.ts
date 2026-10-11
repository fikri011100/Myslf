"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { ACTIVE_COMPANY_COOKIE } from "@/lib/company";
import type { Json } from "@/lib/database.types";

export interface FormField {
  label: string;
  type: "text" | "number" | "email" | "textarea" | "date";
  required: boolean;
}

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

export async function createForm(title: string, fields: FormField[]) {
  const t = title.trim();
  if (!t) return;
  const companyId = await activeCompanyId();
  if (!companyId) return;

  const supabase = createClient();
  const { data } = await supabase
    .from("forms")
    .insert({
      company_id: companyId,
      title: t,
      schema: { fields } as unknown as Json,
      is_public: true,
    })
    .select("id")
    .single();

  revalidatePath("/forms");
  if (data) redirect(`/forms/${data.id}`);
}

export async function deleteForm(id: string) {
  const supabase = createClient();
  await supabase.from("forms").delete().eq("id", id);
  revalidatePath("/forms");
  redirect("/forms");
}

export async function submitForm(formId: string, data: Record<string, unknown>) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  await supabase.from("form_submissions").insert({
    form_id: formId,
    data: data as Json,
    submitted_by: user?.id ?? null,
  });
  revalidatePath(`/forms/${formId}`);
}
