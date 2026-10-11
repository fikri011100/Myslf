import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";

export const ACTIVE_COMPANY_COOKIE = "active_company";

export interface CompanyWithRole {
  id: string;
  name: string;
  invite_code: string;
  role: "member" | "admin" | "super_admin";
}

/** Semua company tempat user menjadi anggota, beserta role-nya. */
export async function getUserCompanies(): Promise<CompanyWithRole[]> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from("company_members")
    .select("role, companies ( id, name, invite_code )")
    .eq("user_id", user.id);

  if (error || !data) return [];

  return data
    .filter((row) => row.companies)
    .map((row) => {
      const c = row.companies as unknown as {
        id: string;
        name: string;
        invite_code: string;
      };
      return {
        id: c.id,
        name: c.name,
        invite_code: c.invite_code,
        role: row.role,
      };
    });
}

/**
 * Company aktif berdasarkan cookie `active_company`.
 * Fallback ke company pertama bila cookie kosong/invalid.
 * Return null bila user belum punya company (perlu onboarding).
 */
export async function getActiveCompany(): Promise<CompanyWithRole | null> {
  const companies = await getUserCompanies();
  if (companies.length === 0) return null;

  const cookieVal = cookies().get(ACTIVE_COMPANY_COOKIE)?.value;
  const found = companies.find((c) => c.id === cookieVal);
  return found ?? companies[0];
}

/** Daftar + aktif sekaligus (hemat satu query untuk layout). */
export async function getCompanyContext() {
  const companies = await getUserCompanies();
  if (companies.length === 0) {
    return { companies, active: null as CompanyWithRole | null };
  }
  const cookieVal = cookies().get(ACTIVE_COMPANY_COOKIE)?.value;
  const active = companies.find((c) => c.id === cookieVal) ?? companies[0];
  return { companies, active };
}
