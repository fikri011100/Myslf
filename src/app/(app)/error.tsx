"use client";

import { Button } from "@/components/ui/button";

export default function AppError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-destructive/10 text-2xl">
        ⚠️
      </div>
      <div>
        <h2 className="font-display text-xl font-bold">Terjadi kesalahan</h2>
        <p className="max-w-md text-sm text-muted-foreground">
          {error.message || "Gagal memuat halaman. Silakan coba lagi."}
        </p>
      </div>
      <Button onClick={reset}>Coba Lagi</Button>
    </div>
  );
}
