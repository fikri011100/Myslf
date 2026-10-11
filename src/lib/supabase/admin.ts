import { createClient as createAdminClientBase } from "@supabase/supabase-js";
import type { Database } from "@/lib/database.types";

/**
 * Supabase ADMIN client (service role) — HANYA untuk server actions /
 * route handlers tepercaya. Mem-bypass RLS, jadi JANGAN pernah
 * diekspos ke client. Selalu validasi otorisasi sebelum memakainya.
 */
export function createAdminClient() {
  return createAdminClientBase<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false, autoRefreshToken: false } }
  );
}
