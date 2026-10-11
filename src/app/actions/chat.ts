"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

/** Kirim friend request berdasarkan email. */
export async function sendFriendRequest(email: string) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Sesi tidak valid." };

  const target = email.trim().toLowerCase();
  const { data: addressee } = await supabase
    .from("profiles")
    .select("id")
    .eq("email", target)
    .maybeSingle();

  if (!addressee) return { error: "User tidak ditemukan." };
  if (addressee.id === user.id) return { error: "Tidak bisa menambah diri sendiri." };

  const { error } = await supabase.from("friendships").insert({
    requester_id: user.id,
    addressee_id: addressee.id,
    status: "pending",
  });
  if (error) {
    if (error.code === "23505") return { error: "Permintaan sudah ada." };
    return { error: error.message };
  }
  revalidatePath("/chat");
  return {};
}

export async function respondFriendRequest(
  friendshipId: string,
  accept: boolean
) {
  const supabase = createClient();
  await supabase
    .from("friendships")
    .update({ status: accept ? "accepted" : "rejected" })
    .eq("id", friendshipId);
  revalidatePath("/chat");
}

/** Cari/buat percakapan DM dengan user lain, kembalikan conversation id. */
export async function getOrCreateConversation(otherUserId: string) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const [a, b] = [user.id, otherUserId].sort();

  const { data: existing } = await supabase
    .from("dm_conversations")
    .select("id")
    .eq("user_a", a)
    .eq("user_b", b)
    .maybeSingle();

  if (existing) return existing.id;

  const { data: created } = await supabase
    .from("dm_conversations")
    .insert({ user_a: a, user_b: b })
    .select("id")
    .single();

  return created?.id ?? null;
}

export async function sendMessage(conversationId: string, body: string) {
  const trimmed = body.trim();
  if (!trimmed) return;
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  await supabase.from("dm_messages").insert({
    conversation_id: conversationId,
    sender_id: user.id,
    body: trimmed,
  });
  await supabase
    .from("dm_conversations")
    .update({ last_body: trimmed, last_at: new Date().toISOString() })
    .eq("id", conversationId);

  revalidatePath(`/chat/${conversationId}`);
}
