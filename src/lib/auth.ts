import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

/** Ambil user dari session (null bila belum login). */
export async function getUser() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}

/** Wajib login; redirect ke /login bila tidak ada session. */
export async function requireUser() {
  const user = await getUser();
  if (!user) redirect("/login");
  return user;
}

/** Ambil profil (public.profiles) milik user yang login. */
export async function getProfile() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data } = await supabase
    .from("profiles")
    .select("id, name, email")
    .eq("id", user.id)
    .single();

  return data;
}
