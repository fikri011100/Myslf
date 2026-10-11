"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { ACTIVE_COMPANY_COOKIE } from "@/lib/company";

function slugCode(name: string) {
  const base = name.replace(/[^a-zA-Z0-9]/g, "").toUpperCase().slice(0, 5) || "COMP";
  const rand = Math.floor(100 + Math.random() * 900);
  return `${base}-${rand}`;
}

export type ActionResult = { error?: string };

/** Buat company baru; pembuat jadi super_admin & langsung aktif. */
export async function createCompany(formData: FormData): Promise<ActionResult> {
  const name = String(formData.get("name") ?? "").trim();
  if (!name) return { error: "Nama perusahaan wajib diisi." };

  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Sesi tidak valid." };

  // Insert privileged pakai admin client (bypass RLS) — user sudah
  // diverifikasi login di atas.
  const admin = createAdminClient();
  const { data: company, error: cErr } = await admin
    .from("companies")
    .insert({ name, invite_code: slugCode(name) })
    .select("id")
    .single();

  if (cErr || !company) {
    return { error: cErr?.message ?? "Gagal membuat perusahaan." };
  }

  const { error: mErr } = await admin.from("company_members").insert({
    company_id: company.id,
    user_id: user.id,
    role: "super_admin",
  });
  if (mErr) return { error: mErr.message };

  cookies().set(ACTIVE_COMPANY_COOKIE, company.id, {
    path: "/",
    httpOnly: true,
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 365,
  });

  revalidatePath("/", "layout");
  redirect("/");
}

/** Gabung ke company lewat invite_code; jadi member. */
export async function joinCompany(formData: FormData): Promise<ActionResult> {
  const code = String(formData.get("invite_code") ?? "").trim().toUpperCase();
  if (!code) return { error: "Kode undangan wajib diisi." };

  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Sesi tidak valid." };

  const admin = createAdminClient();
  const { data: company, error: cErr } = await admin
    .from("companies")
    .select("id")
    .eq("invite_code", code)
    .maybeSingle();

  if (cErr) return { error: cErr.message };
  if (!company) return { error: "Kode undangan tidak ditemukan." };

  const { error: mErr } = await admin
    .from("company_members")
    .insert({ company_id: company.id, user_id: user.id, role: "member" });

  if (mErr) {
    if (mErr.code === "23505") return { error: "Anda sudah menjadi anggota." };
    return { error: mErr.message };
  }

  cookies().set(ACTIVE_COMPANY_COOKIE, company.id, {
    path: "/",
    httpOnly: true,
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 365,
  });

  revalidatePath("/", "layout");
  redirect("/");
}
