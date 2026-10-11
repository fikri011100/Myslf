import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

export function Topbar({
  companyName = "Stealien",
  userName = "fikri",
}: {
  companyName?: string;
  userName?: string;
}) {
  return (
    <header className="flex h-16 items-center justify-between border-b border-border bg-card/60 px-6">
      <div className="flex items-center gap-3">
        <span className="font-display text-sm font-semibold">Workspace</span>
        <Badge variant="violet">{companyName}</Badge>
      </div>
      <div className="flex items-center gap-3">
        <span className="hidden text-sm text-muted-foreground sm:inline">
          {userName}
        </span>
        <Avatar name={userName} />
      </div>
    </header>
  );
}
