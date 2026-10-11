import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { LucideIcon } from "lucide-react";

export function PageStub({
  title,
  description,
  icon: Icon,
  color = "text-brand-indigo",
  bg = "bg-brand-indigo/10",
  children,
}: {
  title: string;
  description: string;
  icon: LucideIcon;
  color?: string;
  bg?: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-4">
        <span className={`flex h-12 w-12 items-center justify-center rounded-2xl ${bg}`}>
          <Icon className={`h-6 w-6 ${color}`} />
        </span>
        <div>
          <h1 className="font-display text-2xl font-bold">{title}</h1>
          <p className="text-muted-foreground">{description}</p>
        </div>
      </div>

      {children ?? (
        <Card>
          <CardHeader>
            <CardTitle>Segera hadir</CardTitle>
            <CardDescription>
              Halaman ini adalah stub terstruktur. Hubungkan ke Supabase untuk
              mengaktifkan fitur sesuai PRD.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-xl border border-dashed border-border bg-muted/40 p-8 text-center text-sm text-muted-foreground">
              Belum ada data.
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
