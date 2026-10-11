"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { ACTIVE_COMPANY_COOKIE } from "@/lib/company";

/** Logout: hapus session Supabase + cookie company, lalu ke /login. */
export async function signOut() {
  const supabase = createClient();
  await supabase.auth.signOut();
  cookies().delete(ACTIVE_COMPANY_COOKIE);
  redirect("/login");
}

/** Ganti company aktif (dipakai Company Switcher). */
export async function setActiveCompany(companyId: string) {
  cookies().set(ACTIVE_COMPANY_COOKIE, companyId, {
    path: "/",
    httpOnly: true,
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 365,
  });
  revalidatePath("/", "layout");
}
