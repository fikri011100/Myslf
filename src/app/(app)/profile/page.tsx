import { PageStub } from "@/components/page-stub";
import { User } from "lucide-react";

export default function ProfilePage() {
  return (
    <PageStub
      title="Profile"
      description="Edit profil pribadi Anda."
      icon={User}
      color="text-muted-foreground"
      bg="bg-muted"
    />
  );
}
