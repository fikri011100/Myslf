import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getUser } from "@/lib/auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { MessagesSquare } from "lucide-react";
import { AddFriend } from "./add-friend";
import { FriendRequests } from "./friend-requests";
import { OpenConversation } from "./open-conversation";

export default async function ChatPage() {
  const supabase = createClient();
  const user = await getUser();
  if (!user) return null;

  // Teman (accepted) di kedua arah
  const { data: friendships } = await supabase
    .from("friendships")
    .select(
      "id, status, requester_id, addressee_id, req:requester_id(id,name,email), add:addressee_id(id,name,email)"
    )
    .or(`requester_id.eq.${user.id},addressee_id.eq.${user.id}`);

  const all = friendships ?? [];

  const friends = all
    .filter((f) => f.status === "accepted")
    .map((f) => {
      const other =
        f.requester_id === user.id
          ? (f.add as unknown as { id: string; name: string; email: string })
          : (f.req as unknown as { id: string; name: string; email: string });
      return other;
    });

  const incoming = all
    .filter((f) => f.status === "pending" && f.addressee_id === user.id)
    .map((f) => ({
      id: f.id,
      from: f.req as unknown as { name: string; email: string },
    }));

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-4">
        <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-pink/10">
          <MessagesSquare className="h-6 w-6 text-brand-pink" />
        </span>
        <div>
          <h1 className="font-display text-2xl font-bold">Chat & DM</h1>
          <p className="text-muted-foreground">Pesan realtime antar anggota</p>
        </div>
      </div>

      <AddFriend />

      {incoming.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Permintaan Pertemanan ({incoming.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <FriendRequests requests={incoming} />
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Teman ({friends.length})</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-2">
          {friends.length === 0 && (
            <p className="py-6 text-center text-sm text-muted-foreground">
              Belum ada teman. Tambahkan lewat email di atas.
            </p>
          )}
          {friends.map((f) => (
            <OpenConversation key={f.id} userId={f.id} name={f.name} email={f.email} />
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
