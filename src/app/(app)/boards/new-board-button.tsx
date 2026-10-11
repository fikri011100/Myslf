"use client";

import { useState, useTransition } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createBoard } from "@/app/actions/boards";

export function NewBoardButton() {
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();

  return (
    <>
      <Button onClick={() => setOpen(true)}>
        <Plus className="h-4 w-4" /> Board Baru
      </Button>

      {open && (
        <div className="fixed inset-0 z-30 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-sm rounded-2xl border border-border bg-card p-6 shadow-soft">
            <h2 className="mb-4 font-display text-lg font-semibold">Board Baru</h2>
            <form
              action={(fd) => startTransition(() => void createBoard(fd))}
              className="flex flex-col gap-4"
            >
              <Input name="name" placeholder="Nama board" autoFocus required />
              <div className="flex justify-end gap-2">
                <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
                  Batal
                </Button>
                <Button type="submit" disabled={pending}>
                  {pending ? "Membuat…" : "Buat"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
