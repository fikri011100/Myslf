"use client";

import { useState, useTransition } from "react";
import { LogOut, ChevronDown } from "lucide-react";
import { signOut } from "@/app/actions/auth";
import { Avatar } from "@/components/ui/avatar";

export function UserMenu({ name }: { name: string }) {
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 rounded-xl px-1.5 py-1 hover:bg-muted"
      >
        <Avatar name={name} />
        <span className="hidden text-sm font-medium sm:inline">{name}</span>
        <ChevronDown className="h-4 w-4 text-muted-foreground" />
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute right-0 z-20 mt-1 w-44 overflow-hidden rounded-xl border border-border bg-card shadow-soft">
            <form action={() => startTransition(() => void signOut())}>
              <button
                type="submit"
                disabled={pending}
                className="flex w-full items-center gap-2 px-3 py-2 text-sm text-destructive hover:bg-muted"
              >
                <LogOut className="h-4 w-4" />
                {pending ? "Keluar…" : "Logout"}
              </button>
            </form>
          </div>
        </>
      )}
    </div>
  );
}
