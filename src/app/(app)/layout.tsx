import { redirect } from "next/navigation";
import { Sidebar } from "@/components/layout/sidebar";
import { Topbar } from "@/components/layout/topbar";
import { requireUser, getProfile } from "@/lib/auth";
import { getCompanyContext } from "@/lib/company";

/**
 * Layout area aplikasi (butuh auth): guard session + company context.
 * - Belum login -> requireUser() redirect /login.
 * - Belum punya company -> redirect /onboarding.
 */
export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireUser();
  const profile = await getProfile();
  const { companies, active } = await getCompanyContext();

  if (!active) redirect("/onboarding");

  const roles = companies.reduce<Record<string, string>>((acc, c) => {
    acc[c.id] = c.role;
    return acc;
  }, {});

  return (
    <div className="flex min-h-screen">
      <Sidebar activeRole={roles[active.id]} />
      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar
          userName={profile?.name || profile?.email || "User"}
          companies={companies}
          active={active}
        />
        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  );
}
