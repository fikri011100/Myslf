import { PageStub } from "@/components/page-stub";
import { ListChecks } from "lucide-react";

export default function CompanyTasksPage() {
  return (
    <PageStub
      title="Company Tasks"
      description="Manajemen tugas level perusahaan (role admin)."
      icon={ListChecks}
      color="text-brand-violet"
      bg="bg-brand-violet/10"
    />
  );
}
