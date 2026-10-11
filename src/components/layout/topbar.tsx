import { CompanySwitcher } from "@/components/layout/company-switcher";
import { UserMenu } from "@/components/layout/user-menu";
import type { CompanyWithRole } from "@/lib/company";

export function Topbar({
  userName,
  companies,
  active,
}: {
  userName: string;
  companies: CompanyWithRole[];
  active: CompanyWithRole;
}) {
  return (
    <header className="flex h-16 items-center justify-between border-b border-border bg-card/60 px-6">
      <div className="flex items-center gap-3">
        <span className="hidden font-display text-sm font-semibold sm:inline">
          Workspace
        </span>
        <CompanySwitcher companies={companies} active={active} />
      </div>
      <div className="flex items-center gap-3">
        <UserMenu name={userName} />
      </div>
    </header>
  );
}
