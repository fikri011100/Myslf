"use client";

import { useTransition } from "react";
import { Trash2 } from "lucide-react";
import { deleteTransaction } from "@/app/actions/finance";

export function DeleteTxButton({ id }: { id: string }) {
  const [pending, startTransition] = useTransition();
  return (
    <button
      onClick={() => startTransition(() => void deleteTransaction(id))}
      disabled={pending}
      className="text-muted-foreground hover:text-destructive"
      aria-label="Hapus transaksi"
    >
      <Trash2 className="h-4 w-4" />
    </button>
  );
}
