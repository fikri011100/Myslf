import Link from "next/link";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function TaskDetailPage({ params }: { params: { id: string } }) {
  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Link href="/boards" className="hover:text-foreground">
          Boards
        </Link>
        <span>/</span>
        <span className="font-medium text-foreground">Task {params.id}</span>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Badge variant="amber">medium</Badge>
            <Badge variant="violet">medium difficulty</Badge>
            <Badge variant="cyan">Bank Raya</Badge>
          </div>
          <CardTitle className="mt-2 text-2xl">PoC Bank Raya</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <section>
            <h3 className="mb-1 font-display text-sm font-semibold">Deskripsi</h3>
            <p className="text-sm text-muted-foreground">
              PoC Bank Raya, show evidence. (Rich text akan dirender via TipTap.)
            </p>
          </section>

          <section className="grid grid-cols-2 gap-4 rounded-xl bg-muted/40 p-4 text-sm">
            <div>
              <p className="text-muted-foreground">Status</p>
              <Badge variant="green">Done</Badge>
            </div>
            <div>
              <p className="text-muted-foreground">Assignee</p>
              <p className="font-medium">Belum ditetapkan</p>
            </div>
            <div>
              <p className="text-muted-foreground">Due Date</p>
              <p className="font-medium">—</p>
            </div>
            <div>
              <p className="text-muted-foreground">Customer</p>
              <p className="font-medium">Bank Raya</p>
            </div>
          </section>

          <section>
            <h3 className="mb-2 font-display text-sm font-semibold">Komentar</h3>
            <p className="text-sm text-muted-foreground">
              Placeholder — hubungkan ke tabel task_comments.
            </p>
          </section>
        </CardContent>
      </Card>
    </div>
  );
}
