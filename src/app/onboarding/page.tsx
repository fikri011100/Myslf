"use client";

import { useState, useTransition } from "react";
import { createCompany, joinCompany } from "@/app/actions/company";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Building2, UserPlus } from "lucide-react";

export default function OnboardingPage() {
  const [tab, setTab] = useState<"create" | "join">("create");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function submit(action: (fd: FormData) => Promise<{ error?: string }>) {
    return (fd: FormData) => {
      setError(null);
      startTransition(async () => {
        const res = await action(fd);
        if (res?.error) setError(res.error);
      });
    };
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden p-4">
      <div className="pointer-events-none absolute -left-20 -top-20 h-72 w-72 rounded-full bg-brand-indigo/20 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 -right-16 h-80 w-80 rounded-full bg-brand-pink/20 blur-3xl" />

      <Card className="relative z-10 w-full max-w-md shadow-soft">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">
            Selamat datang di <span className="text-gradient-brand">AIO-Tracker</span>
          </CardTitle>
          <CardDescription>
            Buat perusahaan baru atau gabung dengan kode undangan.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-4 grid grid-cols-2 gap-2 rounded-xl bg-muted p-1">
            <button
              onClick={() => setTab("create")}
              className={`flex items-center justify-center gap-2 rounded-lg py-2 text-sm font-medium transition-colors ${
                tab === "create" ? "bg-card shadow-card" : "text-muted-foreground"
              }`}
            >
              <Building2 className="h-4 w-4" /> Buat
            </button>
            <button
              onClick={() => setTab("join")}
              className={`flex items-center justify-center gap-2 rounded-lg py-2 text-sm font-medium transition-colors ${
                tab === "join" ? "bg-card shadow-card" : "text-muted-foreground"
              }`}
            >
              <UserPlus className="h-4 w-4" /> Gabung
            </button>
          </div>

          {tab === "create" ? (
            <form action={submit(createCompany)} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label htmlFor="name" className="text-sm font-medium">
                  Nama Perusahaan
                </label>
                <Input id="name" name="name" placeholder="mis. Stealien" required />
              </div>
              {error && (
                <p className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
                  {error}
                </p>
              )}
              <Button type="submit" size="lg" disabled={pending}>
                {pending ? "Membuat…" : "Buat Perusahaan"}
              </Button>
            </form>
          ) : (
            <form action={submit(joinCompany)} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label htmlFor="invite_code" className="text-sm font-medium">
                  Kode Undangan
                </label>
                <Input
                  id="invite_code"
                  name="invite_code"
                  placeholder="mis. STEAL-001"
                  required
                />
              </div>
              {error && (
                <p className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
                  {error}
                </p>
              )}
              <Button type="submit" size="lg" disabled={pending}>
                {pending ? "Bergabung…" : "Gabung"}
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
