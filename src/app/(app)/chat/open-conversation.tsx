"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Avatar } from "@/components/ui/avatar";
import { getOrCreateConversation } from "@/app/actions/chat";

export function OpenConversation({
  userId,
  name,
  email,
}: {
  userId: string;
  name: string;
  email: string;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  return (
    <button
      disabled={pending}
      onClick={() =>
        startTransition(async () => {
          const id = await getOrCreateConversation(userId);
          if (id) router.push(`/chat/${id}`);
        })
      }
      className="flex items-center gap-3 rounded-xl border border-border p-3 text-left hover:bg-muted/40"
    >
      <Avatar name={name} className="h-9 w-9 text-xs" />
      <div>
        <p className="text-sm font-medium">{name}</p>
        <p className="text-xs text-muted-foreground">
          {pending ? "Membuka…" : email}
        </p>
      </div>
    </button>
  );
}
