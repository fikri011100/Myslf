# Setup Supabase — AIO-Tracker

Panduan menghubungkan aplikasi ke Supabase. Tersedia **2 jalur**; pilih salah satu.

---

## Ringkas: SQL Editor vs API vs CLI

- **DDL (buat tabel, RLS, trigger) TIDAK bisa lewat Supabase client API** (anon/service key). API hanya untuk operasi data (select/insert/update baris).
- Untuk membuat **skema**, gunakan **SQL Editor** (paling cepat) atau **Supabase CLI migrations** (paling rapi & version-controlled).

---

## Jalur A — SQL Editor (paling cepat, sekali setup)

1. Buat project di https://supabase.com/dashboard.
2. Buka **SQL Editor** → **New query**.
3. Copy seluruh isi [`supabase/schema.sql`](./schema.sql) → paste → **Run**.
4. (Opsional) Jalankan juga [`supabase/seed.sql`](./seed.sql) untuk contoh company.
5. Ambil kredensial di **Project Settings → API**:
   - `Project URL`      → `NEXT_PUBLIC_SUPABASE_URL`
   - `anon public`      → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `service_role`     → `SUPABASE_SERVICE_ROLE_KEY`
6. Isi `.env.local` (lihat `.env.example`).
7. (Opsional) **Database → Replication**: aktifkan Realtime untuk `dm_messages` & `tasks`.

---

## Jalur B — Supabase CLI (migrations, direkomendasikan jangka panjang)

Tidak perlu instal global; pakai `npx`.

```bash
# 1. Login (buka browser, tempel access token dari dashboard)
npx supabase login

# 2. Tautkan ke project remote (ambil ref di Project Settings > General)
export SUPABASE_PROJECT_REF=your-project-ref
npm run db:link          # == supabase link --project-ref $SUPABASE_PROJECT_REF

# 3. Terapkan migration (membuat semua tabel + RLS di remote)
npm run db:push          # == supabase db push

# 4. (Opsional) Generate TypeScript types dari skema
npm run db:types         # -> src/lib/database.types.ts
```

### Pengembangan lokal penuh (butuh Docker)
```bash
npm run db:start   # menjalankan Postgres + Studio + Auth lokal (Docker)
npm run db:reset   # re-apply migrations + seed.sql
npm run db:stop
```
Studio lokal: http://localhost:54323 · Email testing (Inbucket): http://localhost:54324

---

## Struktur file Supabase

```
supabase/
├── config.toml                         # konfigurasi CLI (port, auth, dll)
├── schema.sql                          # skema utuh (untuk SQL Editor / referensi)
├── seed.sql                            # data contoh (company Stealien)
└── migrations/
    └── 00000000000001_init_schema.sql  # migration awal (= schema.sql)
```

> Jika mengubah skema ke depannya: buat migration baru dengan
> `npx supabase migration new <nama>`, tulis perubahan DDL di file itu,
> lalu `npm run db:push`. Jangan edit migration lama yang sudah diterapkan.

---

## Setelah skema terpasang: tautkan user ke company

User dibuat lewat halaman **Register** (Supabase Auth meng-hash password).
Setelah itu, kaitkan ke company:

```sql
-- Lihat user id:
select id, email from auth.users;

-- Tautkan ke company Stealien sebagai member:
insert into public.company_members (company_id, user_id, role)
values ('68f8075b-f159-4843-9c1e-f31905669099', '<auth_user_id>', 'member');
```

RLS akan otomatis memberi user akses ke data company tersebut.
