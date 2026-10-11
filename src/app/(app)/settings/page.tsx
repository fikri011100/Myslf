import { PageStub } from "@/components/page-stub";
import { Settings } from "lucide-react";

export default function SettingsPage() {
  return (
    <PageStub
      title="Settings"
      description="Pengaturan perusahaan & preferensi."
      icon={Settings}
      color="text-muted-foreground"
      bg="bg-muted"
    />
  );
}
