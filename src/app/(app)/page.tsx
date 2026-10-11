import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { KanbanSquare, Wallet, FileText, MessagesSquare } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getActiveCompany } from "@/lib/company";
import { getProfile } from "@/lib/auth";
import { formatCurrency } from "@/lib/utils";

export default async function DashboardPage() {
  const supabase = createClient();
  const [active, profile] = await Promise.all([getActiveCompany(), getProfile()]);

  let boardsCount = 0;
  let formsCount = 0;
  let balance = 0;

  if (active) {
    const [{ count: bc }, { count: fc }, { data: txs }] = await Promise.all([
      supabase
        .from("boards")
        .select("id", { count: "exact", head: true })
        .eq("company_id", active.id),
      supabase
        .from("forms")
        .select("id", { count: "exact", head: true })
        .eq("company_id", active.id),
      supabase
        .from("finance_transactions")
        .select("type, amount")
        .eq("company_id", active.id),
    ]);
    boardsCount = bc ?? 0;
    formsCount = fc ?? 0;
    balance = (txs ?? []).reduce(
      (a, t) => a + (t.type === "income" ? Number(t.amount) : -Number(t.amount)),
      0
    );
  }

  const stats = [
    { label: "Boards Aktif", value: String(boardsCount), icon: KanbanSquare, color: "text-brand-indigo", bg: "bg-brand-indigo/10" },
    { label: "Saldo", value: formatCurrency(balance), icon: Wallet, color: "text-brand-green", bg: "bg-brand-green/10" },
    { label: "Forms", value: String(formsCount), icon: FileText, color: "text-brand-cyan", bg: "bg-brand-cyan/10" },
    { label: "Chat", value: "—", icon: MessagesSquare, color: "text-brand-pink", bg: "bg-brand-pink/10" },
  ];

  return (
    <div className="flex flex-col gap-6">
      <div className="rounded-2xl bg-gradient-brand p-6 text-white shadow-soft">
        <h1 className="font-display text-2xl font-bold">
          Selamat datang, {profile?.name || "👋"}
        </h1>
        <p className="mt-1 text-white/80">
          Ringkasan workspace {active?.name ?? "Anda"} hari ini.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map(({ label, value, icon: Icon, color, bg }) => (
          <Card key={label}>
            <CardContent className="flex items-center gap-4 p-5">
              <span className={`flex h-12 w-12 items-center justify-center rounded-xl ${bg}`}>
                <Icon className={`h-6 w-6 ${color}`} />
              </span>
              <div className="min-w-0">
                <p className="text-sm text-muted-foreground">{label}</p>
                <p className="truncate font-display text-xl font-bold">{value}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Mulai Cepat</CardTitle>
          <CardDescription>Langkah untuk memaksimalkan workspace Anda.</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <a href="/boards" className="rounded-xl border border-border p-4 hover:bg-muted/40">
            <KanbanSquare className="mb-2 h-5 w-5 text-brand-indigo" />
            <p className="text-sm font-medium">Buat Board</p>
            <p className="text-xs text-muted-foreground">Atur pekerjaan dengan Kanban.</p>
          </a>
          <a href="/finance" className="rounded-xl border border-border p-4 hover:bg-muted/40">
            <Wallet className="mb-2 h-5 w-5 text-brand-green" />
            <p className="text-sm font-medium">Catat Keuangan</p>
            <p className="text-xs text-muted-foreground">Lacak pemasukan & pengeluaran.</p>
          </a>
          <a href="/forms" className="rounded-xl border border-border p-4 hover:bg-muted/40">
            <FileText className="mb-2 h-5 w-5 text-brand-cyan" />
            <p className="text-sm font-medium">Buat Form</p>
            <p className="text-xs text-muted-foreground">Kumpulkan respons tim.</p>
          </a>
        </CardContent>
      </Card>
    </div>
  );
}
