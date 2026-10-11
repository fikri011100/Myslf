import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

// Stub kolom + task — ganti dengan query Supabase + dnd-kit drag & drop.
const COLUMNS = [
  { id: "c1", name: "To Do", accent: "border-t-brand-amber" },
  { id: "c2", name: "In Progress", accent: "border-t-brand-indigo" },
  { id: "c3", name: "Done", accent: "border-t-brand-green" },
];

const TASKS: Record<
  string,
  { id: string; number: number; title: string; customer: string; priority: "low" | "medium" | "high" }[]
> = {
  c1: [
    { id: "t1", number: 15, title: "Siapkan evidence demo", customer: "Internal", priority: "medium" },
  ],
  c2: [
    { id: "t2", number: 16, title: "Integrasi API klien", customer: "BRI", priority: "high" },
  ],
  c3: [
    { id: "t3", number: 14, title: "PoC Bank Raya", customer: "Bank Raya", priority: "medium" },
  ],
};

const PRIORITY: Record<string, "green" | "amber" | "red"> = {
  low: "green",
  medium: "amber",
  high: "red",
};

const PRIORITY_STRIP: Record<string, string> = {
  low: "border-l-brand-green",
  medium: "border-l-brand-amber",
  high: "border-l-brand-red",
};

export default function BoardDetailPage({ params }: { params: { id: string } }) {
  return (
    <div className="flex h-full flex-col gap-6">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Link href="/boards" className="hover:text-foreground">
          Boards
        </Link>
        <span>/</span>
        <span className="font-medium text-foreground">Board {params.id}</span>
      </div>

      <h1 className="font-display text-2xl font-bold">Daily Report</h1>

      <div className="flex flex-1 gap-4 overflow-x-auto pb-4">
        {COLUMNS.map((col) => (
          <div
            key={col.id}
            className={cn(
              "flex w-80 shrink-0 flex-col gap-3 rounded-2xl border border-t-4 border-border bg-muted/40 p-3",
              col.accent
            )}
          >
            <div className="flex items-center justify-between px-1">
              <span className="font-display text-sm font-semibold">{col.name}</span>
              <span className="rounded-full bg-card px-2 py-0.5 text-xs text-muted-foreground">
                {TASKS[col.id]?.length ?? 0}
              </span>
            </div>

            {(TASKS[col.id] ?? []).map((t) => (
              <Link key={t.id} href={`/tasks/${t.id}`}>
                <div
                  className={cn(
                    "flex flex-col gap-2 rounded-xl border border-l-4 border-border bg-card p-3 shadow-card transition-transform hover:-translate-y-0.5",
                    PRIORITY_STRIP[t.priority]
                  )}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">#{t.number}</span>
                    <Badge variant={PRIORITY[t.priority]}>{t.priority}</Badge>
                  </div>
                  <p className="text-sm font-medium">{t.title}</p>
                  <div className="flex items-center justify-between">
                    <Badge variant="cyan">{t.customer}</Badge>
                    <Avatar name={t.customer} className="h-5 w-5 text-[9px]" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
