"use client";

import { useTransition } from "react";
import { Check, X } from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { respondFriendRequest } from "@/app/actions/chat";

export function FriendRequests({
  requests,
}: {
  requests: { id: string; from: { name: string; email: string } }[];
}) {
  const [pending, startTransition] = useTransition();

  return (
    <div className="flex flex-col gap-2">
      {requests.map((r) => (
        <div
          key={r.id}
          className="flex items-center justify-between rounded-xl border border-border p-3"
        >
          <div className="flex items-center gap-3">
            <Avatar name={r.from.name} className="h-8 w-8 text-xs" />
            <div>
              <p className="text-sm font-medium">{r.from.name}</p>
              <p className="text-xs text-muted-foreground">{r.from.email}</p>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              disabled={pending}
              onClick={() => startTransition(() => void respondFriendRequest(r.id, true))}
              className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-green/15 text-brand-green hover:bg-brand-green/25"
            >
              <Check className="h-4 w-4" />
            </button>
            <button
              disabled={pending}
              onClick={() => startTransition(() => void respondFriendRequest(r.id, false))}
              className="flex h-8 w-8 items-center justify-center rounded-lg bg-destructive/15 text-destructive hover:bg-destructive/25"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
