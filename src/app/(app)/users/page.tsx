import { PageStub } from "@/components/page-stub";
import { Users } from "lucide-react";

export default function UsersPage() {
  return (
    <PageStub
      title="Users"
      description="Manajemen seluruh user platform (super_admin)."
      icon={Users}
      color="text-brand-violet"
      bg="bg-brand-violet/10"
    />
  );
}
