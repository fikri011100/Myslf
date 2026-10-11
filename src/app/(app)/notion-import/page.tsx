import { PageStub } from "@/components/page-stub";
import { Download } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function NotionImportPage() {
  return (
    <PageStub
      title="Notion Import"
      description="Impor halaman/konten dari Notion menjadi board/task."
      icon={Download}
      color="text-brand-amber"
      bg="bg-brand-amber/10"
    >
      <Card>
        <CardHeader>
          <CardTitle>Segera hadir</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-3 text-sm text-muted-foreground">
          <p>
            Fitur impor Notion akan menghubungkan integration token Notion Anda,
            lalu memetakan database/halaman menjadi board & task AIO-Tracker.
          </p>
          <ol className="list-decimal space-y-1 pl-5">
            <li>Buat integration di notion.so/my-integrations.</li>
            <li>Bagikan halaman/database ke integration tersebut.</li>
            <li>Tempel token & pilih database untuk diimpor.</li>
          </ol>
          <div className="rounded-xl border border-dashed border-border bg-muted/40 p-6 text-center">
            Integrasi penuh dijadwalkan pada rilis berikutnya.
          </div>
        </CardContent>
      </Card>
    </PageStub>
  );
}
