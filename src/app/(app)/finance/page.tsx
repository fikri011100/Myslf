import { createClient } from "@/lib/supabase/server";
import { getActiveCompany } from "@/lib/company";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils";
import { ArrowUpRight, ArrowDownRight } from "lucide-react";
import { FinanceChart } from "./finance-chart";
import { AddTransaction } from "./add-transaction";
import { DeleteTxButton } from "./delete-tx-button";

type Tx = {
  id: string;
  type: "income" | "expense";
  category: string;
  amount: number;
  date: string;
  note: string | null;
};

export default async function FinancePage() {
  const supabase = createClient();
  const active = await getActiveCompany();

  const { data } = active
    ? await supabase
        .from("finance_transactions")
        .select("id, type, category, amount, date, note")
        .eq("company_id", active.id)
        .order("date", { ascending: false })
        .limit(200)
    : { data: [] };

  const txs = (data ?? []) as Tx[];

  const income = txs.filter((t) => t.type === "income").reduce((a, t) => a + Number(t.amount), 0);
  const expense = txs.filter((t) => t.type === "expense").reduce((a, t) => a + Number(t.amount), 0);

  // Agregasi tren per bulan (YYYY-MM)
  const trendMap = new Map<string, { income: number; expense: number }>();
  for (const t of txs) {
    const key = t.date.slice(0, 7);
    const cur = trendMap.get(key) ?? { income: 0, expense: 0 };
    cur[t.type] += Number(t.amount);
    trendMap.set(key, cur);
  }
  const trend = Array.from(trendMap.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .slice(-6)
    .map(([month, v]) => ({ month, ...v }));

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold">Finance</h1>
          <p className="text-muted-foreground">Pemasukan & pengeluaran perusahaan</p>
        </div>
        <AddTransaction />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="flex items-center gap-4 p-5">
            <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-green/10">
              <ArrowUpRight className="h-6 w-6 text-brand-green" />
            </span>
            <div>
              <p className="text-sm text-muted-foreground">Pemasukan</p>
              <p className="font-display text-xl font-bold text-brand-green">
                {formatCurrency(income)}
              </p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 p-5">
            <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-red/10">
              <ArrowDownRight className="h-6 w-6 text-brand-red" />
            </span>
            <div>
              <p className="text-sm text-muted-foreground">Pengeluaran</p>
              <p className="font-display text-xl font-bold text-brand-red">
                {formatCurrency(expense)}
              </p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 p-5">
            <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-indigo/10 font-bold text-brand-indigo">
              =
            </span>
            <div>
              <p className="text-sm text-muted-foreground">Saldo</p>
              <p className="font-display text-xl font-bold text-brand-indigo">
                {formatCurrency(income - expense)}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Tren Bulanan</CardTitle>
        </CardHeader>
        <CardContent className="h-64">
          {trend.length > 0 ? (
            <FinanceChart data={trend} />
          ) : (
            <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
              Belum ada data transaksi.
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Transaksi Terbaru</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-2">
          {txs.length === 0 && (
            <p className="py-6 text-center text-sm text-muted-foreground">
              Belum ada transaksi.
            </p>
          )}
          {txs.slice(0, 50).map((t) => (
            <div
              key={t.id}
              className="flex items-center justify-between rounded-xl border border-border p-3"
            >
              <div className="flex items-center gap-3">
                <Badge variant={t.type === "income" ? "green" : "red"}>
                  {t.category}
                </Badge>
                <span className="text-sm">{t.note ?? "—"}</span>
                <span className="text-xs text-muted-foreground">{t.date}</span>
              </div>
              <div className="flex items-center gap-3">
                <span
                  className={
                    t.type === "income"
                      ? "font-medium text-brand-green"
                      : "font-medium text-brand-red"
                  }
                >
                  {t.type === "income" ? "+" : "-"}
                  {formatCurrency(Number(t.amount))}
                </span>
                <DeleteTxButton id={t.id} />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
