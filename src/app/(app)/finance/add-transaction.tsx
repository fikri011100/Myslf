"use client";

import { useState, useTransition } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { addTransaction } from "@/app/actions/finance";

export function AddTransaction() {
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();

  return (
    <>
      <Button onClick={() => setOpen(true)}>
        <Plus className="h-4 w-4" /> Transaksi
      </Button>

      {open && (
        <div className="fixed inset-0 z-30 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-sm rounded-2xl border border-border bg-card p-6 shadow-soft">
            <h2 className="mb-4 font-display text-lg font-semibold">
              Transaksi Baru
            </h2>
            <form
              action={(fd) => {
                startTransition(() => void addTransaction(fd));
                setOpen(false);
              }}
              className="flex flex-col gap-3"
            >
              <select
                name="type"
                className="h-11 rounded-xl border border-input bg-card px-3 text-sm"
                defaultValue="expense"
              >
                <option value="income">Pemasukan</option>
                <option value="expense">Pengeluaran</option>
              </select>
              <Input name="category" placeholder="Kategori (mis. Project)" />
              <Input
                name="amount"
                type="number"
                min="0"
                step="1000"
                placeholder="Jumlah (Rp)"
                required
              />
              <Input name="date" type="date" defaultValue={new Date().toISOString().slice(0, 10)} />
              <Input name="note" placeholder="Catatan (opsional)" />
              <div className="flex justify-end gap-2">
                <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
                  Batal
                </Button>
                <Button type="submit" disabled={pending}>
                  {pending ? "Menyimpan…" : "Simpan"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
