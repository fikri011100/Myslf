import { PageStub } from "@/components/page-stub";
import { MessagesSquare } from "lucide-react";

export default function ChatPage() {
  return (
    <PageStub
      title="Chat & DM"
      description="Pesan realtime antar anggota (Supabase Realtime)."
      icon={MessagesSquare}
      color="text-brand-pink"
      bg="bg-brand-pink/10"
    />
  );
}
