# AIO-Tracker

Workspace produktivitas **all-in-one** multi-tenant (per perusahaan): Kanban board, manajemen tugas, finance, form builder, impor Notion, dan chat/DM realtime.

Dibangun sesuai [`PRD-AIO-Tracker.md`](./PRD-AIO-Tracker.md) dengan stack open-source yang di-deploy ke **Vercel** (frontend + API) dan **Supabase** (database, auth, realtime, storage).

## Tech Stack

| Lapisan | Teknologi |
|---|---|
| Framework | Next.js 14 (App Router) + React 18 + TypeScript |
| Styling | Tailwind CSS (tema *bright & colorful*) + `tailwindcss-animate` |
| State server | TanStack Query |
| Drag & Drop | `@dnd-kit` (untuk Kanban) |
| Chart | Recharts |
| Form & Validasi | React Hook Form + Zod |
| Icon | lucide-react |
| Backend | Supabase (Postgres + Auth + Realtime + Storage + RLS) |
| Deploy | Vercel + Supabase |

## Struktur Proyek

```
src/
├── app/
│   ├── (auth)/            # login, register (layout dekoratif)
│   ├── (app)/             # area butuh auth: dashboard, boards, finance, dll
│   ├── layout.tsx         # root layout (font Inter + Poppins, Providers)
│   └── globals.css        # token tema bright & colorful (CSS vars)
├── components/
│   ├── ui/                # Button, Card, Input, Badge, Avatar
│   ├── layout/            # Sidebar (color-coded), Topbar
│   ├── providers.tsx      # TanStack Query provider
│   └── page-stub.tsx      # placeholder halaman terstruktur
├── lib/
│   ├── supabase/          # client, server, middleware (@supabase/ssr)
│   ├── types.ts           # tipe domain (Task, Board, dll)
│   └── utils.ts           # cn, formatCurrency, initials
└── middleware.ts          # proteksi route berbasis session
supabase/
└── schema.sql             # skema DB + RLS (jalankan di SQL Editor)
```

## Setup Lokal

### 1. Prasyarat
- Node.js 18+ dan npm.
- Akun [Supabase](https://supabase.com) dan [Vercel](https://vercel.com) (keduanya punya free tier).

### 2. Install dependency
```bash
npm install
```

### 3. Buat project Supabase & jalankan skema
1. Buat project baru di dashboard Supabase.
2. Buka **SQL Editor** → tempel isi [`supabase/schema.sql`](./supabase/schema.sql) → **Run**.
3. (Opsional) Aktifkan Realtime: **Database → Replication** untuk tabel `dm_messages` dan `tasks`.
4. Ambil kredensial di **Project Settings → API**:
   - `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
   - `anon public` key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `service_role` key → `SUPABASE_SERVICE_ROLE_KEY` (server-only, rahasia)

### 4. Konfigurasi environment
Salin `.env.example` menjadi `.env.local` lalu isi kredensial Supabase:
```bash
cp .env.example .env.local
```
```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...   # jangan commit / ekspos ke client
```

### 5. Jalankan dev server
```bash
npm run dev
```
Buka http://localhost:3000 — Anda akan diarahkan ke `/login` bila belum masuk.

## Perintah

| Perintah | Fungsi |
|---|---|
| `npm run dev` | Jalankan dev server |
| `npm run build` | Build produksi |
| `npm run start` | Jalankan hasil build |
| `npm run lint` | ESLint |
| `npm run typecheck` | Pengecekan tipe TypeScript |

## Deploy ke Vercel

1. Push repo ini ke GitHub/GitLab.
2. Di Vercel: **Add New → Project** → import repo. Framework terdeteksi otomatis sebagai **Next.js**.
3. Tambahkan Environment Variables (Production & Preview):
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `NEXT_PUBLIC_SITE_URL` (mis. `https://your-app.vercel.app`)
4. **Deploy**.
5. Di Supabase **Authentication → URL Configuration**, tambahkan domain Vercel ke **Site URL** dan **Redirect URLs** agar email verifikasi/redirect auth berfungsi.

## Status Implementasi

Ini adalah **scaffolding**: struktur, routing, tema, komponen UI, integrasi auth Supabase, dan skema DB sudah siap. Halaman inti menampilkan data **stub** dan perlu dihubungkan ke query Supabase sesuai PRD:

- [ ] Boards & Kanban: CRUD + drag-and-drop (`@dnd-kit`) tersambung ke tabel `boards/board_columns/tasks`
- [ ] Task detail: komentar & lampiran
- [ ] Finance: query `finance_transactions` + agregasi summary
- [ ] Forms: builder dinamis + submissions
- [ ] Chat/DM: Supabase Realtime
- [ ] Company switcher & role-based UI
- [ ] Notion import

## Tema (Bright & Colorful)

Token warna didefinisikan sebagai CSS variables di `src/app/globals.css` dan dipetakan di `tailwind.config.ts`. Palet brand: Indigo `#6366F1`, Violet `#8B5CF6`, Pink `#EC4899`, Green `#22C55E`, Amber `#F59E0B`, Red `#EF4444`, Cyan `#06B6D4`. Setiap modul punya warna identitas (color-coding) dan tersedia dukungan dark mode via class `.dark`.
