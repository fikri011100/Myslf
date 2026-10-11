import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { KanbanSquare, Wallet, FileText, MessagesSquare } from "lucide-react";

const STATS = [
  { label: "Boards Aktif", value: "2", icon: KanbanSquare, color: "text-brand-indigo", bg: "bg-brand-indigo/10" },
  { label: "Saldo Bulan Ini", value: "Rp0", icon: Wallet, color: "text-brand-green", bg: "bg-brand-green/10" },
  { label: "Forms", value: "0", icon: FileText, color: "text-brand-cyan", bg: "bg-brand-cyan/10" },
  { label: "Pesan Belum Dibaca", value: "0", icon: MessagesSquare, color: "text-brand-pink", bg: "bg-brand-pink/10" },
];

export default function DashboardPage() {
  return (
    <div className="flex flex-col gap-6">
      <div className="rounded-2xl bg-gradient-brand p-6 text-white shadow-soft">
        <h1 className="font-display text-2xl font-bold">Selamat datang 👋</h1>
        <p className="mt-1 text-white/80">
          Ringkasan workspace Anda hari ini.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {STATS.map(({ label, value, icon: Icon, color, bg }) => (
          <Card key={label}>
            <CardContent className="flex items-center gap-4 p-5">
              <span className={`flex h-12 w-12 items-center justify-center rounded-xl ${bg}`}>
                <Icon className={`h-6 w-6 ${color}`} />
              </span>
              <div>
                <p className="text-sm text-muted-foreground">{label}</p>
                <p className="font-display text-xl font-bold">{value}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Aktivitas Terbaru</CardTitle>
          <CardDescription>
            Placeholder — hubungkan ke Supabase untuk data nyata.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          <div className="flex items-center justify-between rounded-xl border border-border p-3">
            <span className="text-sm">Task &quot;PoC Bank Raya&quot; dipindah ke Done</span>
            <Badge variant="green">Done</Badge>
          </div>
          <div className="flex items-center justify-between rounded-xl border border-border p-3">
            <span className="text-sm">Board &quot;Daily Report August&quot; dibuat</span>
            <Badge variant="violet">Board</Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
