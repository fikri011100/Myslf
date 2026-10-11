"use client";

import { useState, useTransition } from "react";
import { UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { sendFriendRequest } from "@/app/actions/chat";

export function AddFriend() {
  const [msg, setMsg] = useState<{ ok?: boolean; text: string } | null>(null);
  const [pending, startTransition] = useTransition();

  return (
    <form
      action={(fd) => {
        const email = String(fd.get("email") ?? "");
        if (!email.trim()) return;
        startTransition(async () => {
          const res = await sendFriendRequest(email);
          setMsg(
            res?.error
              ? { ok: false, text: res.error }
              : { ok: true, text: "Permintaan terkirim ✓" }
          );
        });
      }}
      className="flex flex-wrap items-center gap-2"
    >
      <Input
        name="email"
        type="email"
        placeholder="Email teman…"
        className="max-w-xs flex-1"
        required
      />
      <Button type="submit" disabled={pending}>
        <UserPlus className="h-4 w-4" /> Tambah Teman
      </Button>
      {msg && (
        <span
          className={`text-sm ${msg.ok ? "text-brand-green" : "text-destructive"}`}
        >
          {msg.text}
        </span>
      )}
    </form>
  );
}
