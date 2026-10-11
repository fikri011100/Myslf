"use client";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils";
import { Plus, ArrowUpRight, ArrowDownRight } from "lucide-react";
import {
  Area,
  AreaChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
} from "recharts";

// Stub — ganti dengan /finance/transactions & /finance/summary dari Supabase.
const TREND = [
  { month: "Jun", income: 12_000_000, expense: 7_000_000 },
  { month: "Jul", income: 15_000_000, expense: 9_000_000 },
  { month: "Aug", income: 9_000_000, expense: 11_000_000 },
  { month: "Sep", income: 18_000_000, expense: 8_000_000 },
];

const TX = [
  { id: 1, note: "Pembayaran klien BRI", type: "income", amount: 18_000_000, category: "Project" },
  { id: 2, note: "Langganan server", type: "expense", amount: 1_200_000, category: "Infra" },
];

export default function FinancePage() {
  const income = TX.filter((t) => t.type === "income").reduce((a, t) => a + t.amount, 0);
  const expense = TX.filter((t) => t.type === "expense").reduce((a, t) => a + t.amount, 0);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold">Finance</h1>
          <p className="text-muted-foreground">Pemasukan & pengeluaran perusahaan</p>
        </div>
        <Button>
          <Plus className="h-4 w-4" /> Transaksi
        </Button>
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
          <CardTitle>Tren 4 Bulan</CardTitle>
        </CardHeader>
        <CardContent className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={TREND}>
              <defs>
                <linearGradient id="inc" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#22C55E" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#22C55E" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="exp" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#EF4444" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#EF4444" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="month" tickLine={false} axisLine={false} />
              <Tooltip
                formatter={(v: number) => formatCurrency(v)}
                contentStyle={{ borderRadius: 12, border: "1px solid #e5e7eb" }}
              />
              <Area type="monotone" dataKey="income" stroke="#22C55E" fill="url(#inc)" strokeWidth={2} />
              <Area type="monotone" dataKey="expense" stroke="#EF4444" fill="url(#exp)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Transaksi Terbaru</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-2">
          {TX.map((t) => (
            <div
              key={t.id}
              className="flex items-center justify-between rounded-xl border border-border p-3"
            >
              <div className="flex items-center gap-3">
                <Badge variant={t.type === "income" ? "green" : "red"}>
                  {t.category}
                </Badge>
                <span className="text-sm">{t.note}</span>
              </div>
              <span
                className={
                  t.type === "income"
                    ? "font-medium text-brand-green"
                    : "font-medium text-brand-red"
                }
              >
                {t.type === "income" ? "+" : "-"}
                {formatCurrency(t.amount)}
              </span>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
