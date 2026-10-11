"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [inviteCode, setInviteCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setInfo(null);

    const supabase = createClient();
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { name, invite_code: inviteCode || null },
      },
    });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }
    setInfo("Pendaftaran berhasil. Cek email untuk verifikasi, lalu masuk.");
    setLoading(false);
  }

  return (
    <Card className="shadow-soft">
      <CardHeader className="items-center text-center">
        <span className="mb-2 flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-brand text-xl font-bold text-white">
          A
        </span>
        <CardTitle className="text-2xl">
          Buat akun <span className="text-gradient-brand">AIO-Tracker</span>
        </CardTitle>
        <CardDescription>Mulai kelola tim & pekerjaan Anda</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={onSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="name" className="text-sm font-medium">
              Nama
            </label>
            <Input
              id="name"
              placeholder="Nama lengkap"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label htmlFor="email" className="text-sm font-medium">
              Email
            </label>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              placeholder="nama@perusahaan.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label htmlFor="password" className="text-sm font-medium">
              Password
            </label>
            <Input
              id="password"
              type="password"
              autoComplete="new-password"
              placeholder="Minimal 8 karakter"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              minLength={8}
              required
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label htmlFor="invite" className="text-sm font-medium">
              Kode Undangan Perusahaan{" "}
              <span className="text-muted-foreground">(opsional)</span>
            </label>
            <Input
              id="invite"
              placeholder="mis. STEAL-001"
              value={inviteCode}
              onChange={(e) => setInviteCode(e.target.value)}
            />
          </div>

          {error && (
            <p className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {error}
            </p>
          )}
          {info && (
            <p className="rounded-lg bg-brand-green/10 px-3 py-2 text-sm text-brand-green">
              {info}
            </p>
          )}

          <Button type="submit" size="lg" disabled={loading}>
            {loading ? "Memproses…" : "Daftar"}
          </Button>
        </form>

        <p className="mt-4 text-center text-sm text-muted-foreground">
          Sudah punya akun?{" "}
          <Link href="/login" className="font-medium text-primary hover:underline">
            Masuk
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}
