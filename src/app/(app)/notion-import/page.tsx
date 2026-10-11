import { PageStub } from "@/components/page-stub";
import { Download } from "lucide-react";

export default function NotionImportPage() {
  return (
    <PageStub
      title="Notion Import"
      description="Impor halaman/konten dari Notion menjadi board/task."
      icon={Download}
      color="text-brand-amber"
      bg="bg-brand-amber/10"
    />
  );
}
