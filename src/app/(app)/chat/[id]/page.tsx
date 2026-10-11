import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getUser } from "@/lib/auth";
import { ConversationView } from "./conversation-view";

export default async function ConversationPage({
  params,
}: {
  params: { id: string };
}) {
  const supabase = createClient();
  const user = await getUser();
  if (!user) return null;

  const { data: conv } = await supabase
    .from("dm_conversations")
    .select("id, user_a, user_b")
    .eq("id", params.id)
    .maybeSingle();

  if (!conv) notFound();

  const otherId = conv.user_a === user.id ? conv.user_b : conv.user_a;
  const { data: other } = await supabase
    .from("profiles")
    .select("name, email")
    .eq("id", otherId)
    .maybeSingle();

  const { data: messages } = await supabase
    .from("dm_messages")
    .select("id, sender_id, body, created_at")
    .eq("conversation_id", params.id)
    .order("created_at", { ascending: true });

  return (
    <div className="mx-auto flex h-[calc(100vh-7rem)] max-w-2xl flex-col gap-4">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Link href="/chat" className="hover:text-foreground">
          Chat
        </Link>
        <span>/</span>
        <span className="font-medium text-foreground">
          {other?.name ?? other?.email ?? "Percakapan"}
        </span>
      </div>

      <ConversationView
        conversationId={params.id}
        currentUserId={user.id}
        otherName={other?.name ?? other?.email ?? "User"}
        initialMessages={messages ?? []}
      />
    </div>
  );
}
