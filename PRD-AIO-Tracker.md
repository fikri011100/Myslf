# PRD — AIO-Tracker (All-In-One Workspace)

**Versi:** 1.0
**Tanggal:** 2026-10-11
**Pemilik Produk:** fikri
**Status:** Draft untuk implementasi ulang (rebuild)

---

## 1. Ringkasan Eksekutif

AIO-Tracker adalah aplikasi **workspace produktivitas all-in-one berbasis perusahaan (multi-tenant)**. Satu akun pengguna bisa tergabung di beberapa perusahaan, dan setiap perusahaan punya ruang kerjanya sendiri: papan Kanban, manajemen tugas, pencatatan keuangan, form builder, impor dari Notion, serta komunikasi real-time (DM & chat tim).

Dokumen ini adalah PRD untuk **membangun ulang (rebuild)** aplikasi dengan:
- **Deployment open-source friendly**: Frontend di **Vercel**, Backend + Database + Auth + Realtime di **Supabase**.
- **Tema baru**: lebih **bright & colorful** (bukan lagi dark/minimalis Inter-only).

> Catatan analisis: Aplikasi referensi (`https://aiot.loyalty.my.id`) saat ini dibangun dengan **Vue 3 + Pinia + Vue Router + Socket.io + Axios** (frontend) dan **Express.js + PostgreSQL** (backend) dengan JWT auth. PRD ini mengusulkan arsitektur baru yang lebih sesuai target deployment Vercel + Supabase.

---

## 2. Tujuan & Sasaran

### 2.1 Tujuan Produk
- Menyatukan tool produktivitas tim (task, finance, form, chat) dalam satu aplikasi per perusahaan.
- Mendukung kolaborasi real-time antar anggota tim.
- Mudah di-deploy dengan stack open-source berbiaya rendah (Vercel free tier + Supabase free tier).

### 2.2 Sasaran yang Terukur (Success Metrics)
| Metrik | Target |
|---|---|
| Waktu load halaman utama (LCP) | < 2.5 detik |
| Latensi update Kanban (drag-drop → tersimpan) | < 300 ms (optimistic UI) |
| Latensi pesan chat terkirim → tampil di penerima | < 1 detik |
| Uptime | ≥ 99.5% |
| Cakupan role-based access | 100% endpoint terproteksi |

---

## 3. Persona & Role Pengguna

Dari data aktual sistem, terdapat 3 role:

| Role | Deskripsi | Hak Akses Utama |
|---|---|---|
| `super_admin` | Pemilik platform / owner tertinggi | Akses penuh termasuk manajemen seluruh user (`/users`) |
| `admin` | Admin perusahaan | Kelola company tasks, user perusahaan, pengaturan |
| `member` | Anggota tim biasa | Buat/kelola board & task pribadi, finance, form, chat, DM |

**Persona contoh:**
- **Fikri (member)** — anggota tim Stealien, membuat board "Daily Report", mencatat progres PoC klien (mis. "PoC Bank Raya").
- **Loyalty (super_admin)** — owner, memantau seluruh tim & user.
- **Diah / Nugroho / Dona (member)** — kontributor harian.

---

## 4. Konsep Inti: Multi-Tenancy

- Satu **User** dapat tergabung di banyak **Company**.
- Setiap request yang terkait data perusahaan **wajib** menyertakan konteks perusahaan aktif (pada sistem lama: header `x-company-id`).
- Perusahaan punya `invite_code` (mis. `STEAL-001`) untuk mengundang anggota baru.
- **Isolasi data**: semua tabel data (boards, tasks, finance, forms) ter-scope ke `company_id`.

**Implikasi di Supabase:** gunakan **Row Level Security (RLS)** agar isolasi antar perusahaan ditegakkan di level database, bukan hanya aplikasi.

---

## 5. Fitur & Requirement Detail

### 5.1 Autentikasi & Akun
**User story:** Sebagai pengguna, saya ingin login/register dan berpindah antar perusahaan.

Requirement:
- Register (nama, email, password), Login (email + password).
- Session berbasis token (lama: JWT; baru: **Supabase Auth** session/JWT).
- `GET /auth/me` → profil user + daftar companies.
- Rate limiting pada endpoint login (lama: 10 request / 15 menit).
- Switch company aktif (menyimpan company terpilih di state + dikirim ke setiap query).

Acceptance criteria:
- Login salah → pesan error jelas, tidak membocorkan apakah email ada.
- Token kedaluwarsa → auto redirect ke `/login`.
- Register otomatis membuat/menautkan ke company via invite code (opsional).

---

### 5.2 Boards (Kanban)
**User story:** Sebagai member, saya ingin mengelola pekerjaan dalam papan Kanban drag-and-drop.

Struktur data (dari API aktual):
- **Board**: `id`, `company_id`, `name`, `owner_id`, `owner_name`, `created_at`.
- **Column**: `id`, `board_id`, `name` (contoh: To Do / In Progress / Done), `position`.
- **Task**: `id`, `column_id`, `board_id`, `number` (nomor urut), `title`, `description` (rich text/HTML), `customer`, `status`, `difficulty` (low/medium/high), `priority` (low/medium/high), `due_date`, `assignee_id` + `assignee_name`, `position`, `created_at`, `updated_at`, `done_at`, `chatwoot_conversation_id`.

Requirement:
- CRUD board, column, task.
- Drag-and-drop task antar kolom dan reorder (update `position` & `column_id`).
- Rich text editor untuk deskripsi task (lama: TipTap/ProseMirror-style HTML).
- Filter/label: priority, difficulty, assignee, customer.
- Detail task (`/tasks/:id` & `/boards/:id`): komentar, lampiran (attachment).
- Tandai selesai → set `done_at`.
- Integrasi opsional Chatwoot (`chatwoot_conversation_id`) — *nice to have*.

Acceptance criteria:
- Drag-drop memakai **optimistic update** lalu sinkron ke server.
- Reorder konsisten setelah refresh.

---

### 5.3 Company Tasks
**User story:** Sebagai admin, saya ingin mengelola tugas level perusahaan.

Requirement:
- Daftar & kelola tugas perusahaan (`/company-tasks`), terproteksi `Admin access required`.
- Assign tugas ke anggota perusahaan.
- Status & progres tugas.

Acceptance criteria:
- Member biasa tidak dapat mengakses manajemen company task (hanya view bila diizinkan).

---

### 5.4 Finance
**User story:** Sebagai pengguna perusahaan, saya ingin mencatat pemasukan & pengeluaran dan melihat ringkasannya.

Struktur (dari API `/finance/transactions`, `/finance/summary`):
- **Transaction**: income/expense, kategori, jumlah, tanggal, deskripsi (paginated: `rows`, `total`, `page`, `limit`).
- **Summary**: `breakdown` (per kategori), `totals`, `trend` (time series).

Requirement:
- CRUD transaksi dengan pagination (default limit 50).
- Dashboard ringkasan: total pemasukan/pengeluaran, breakdown per kategori, grafik tren.
- Filter rentang tanggal.

Acceptance criteria:
- Grafik tren & breakdown update otomatis saat transaksi berubah.

---

### 5.5 Forms (Form Builder)
**User story:** Sebagai pengguna, saya ingin membuat form dan mengumpulkan respons.

Requirement (`/forms`):
- Builder field dinamis (text, number, select, date, dll).
- Kumpulkan & lihat submission.
- Bagikan form (public/internal).

Acceptance criteria:
- Form dapat dibuat, dipublikasikan, dan menerima submission.

---

### 5.6 Notion Import
**User story:** Sebagai pengguna, saya ingin mengimpor konten dari Notion.

Requirement (`/notion-import`):
- Impor halaman/konten Notion menjadi task/board/catatan.

Acceptance criteria:
- Konten Notion terpetakan ke struktur AIO-Tracker.

---

### 5.7 Chat & DM (Real-time)
**User story:** Sebagai anggota tim, saya ingin chat real-time dengan rekan & teman.

Struktur (dari API):
- **Friends**: `/friends`, `/friends/requests`, `/friends/sent`, `POST /friends/request`.
- **DM Conversations**: `/dm/conversations` → `id`, `name`, `email`, `last_body`, `last_at`, `unread`.
- Realtime via WebSocket (lama: **Socket.io**).

Requirement:
- Daftar percakapan dengan preview pesan terakhir & badge unread.
- Kirim/terima pesan real-time.
- Sistem pertemanan: kirim/terima/tolak request.
- Indikator typing & read receipt (*nice to have*).

Acceptance criteria:
- Pesan muncul real-time tanpa refresh.
- Unread count akurat.

---

### 5.8 Users & Settings
Requirement:
- `/users` (super_admin): kelola seluruh user platform.
- `/company/users`: daftar anggota perusahaan (id, name, email, role).
- `/settings`: pengaturan perusahaan & profil.
- `/profile`: edit profil pribadi.
- `/invitations`: undangan masuk perusahaan.

Acceptance criteria:
- Hanya role sesuai yang dapat mengubah pengaturan sensitif.

---

## 6. Peta Routing (dari aplikasi aktual)

| Path | Nama | Deskripsi |
|---|---|---|
| `/` | Home | Dashboard ringkasan |
| `/login` | Login | Masuk |
| `/register` | Register | Daftar |
| `/boards` | Boards | Daftar papan |
| `/boards/:id` | Board | Detail papan Kanban |
| `/company-tasks` | CompanyTasks | Tugas perusahaan |
| `/tasks/:id` | TaskDetail | Detail tugas |
| `/finance` | Finance | Keuangan |
| `/forms` | Forms | Form builder |
| `/settings` | Settings | Pengaturan |
| `/notion-import` | NotionImport | Impor Notion |
| `/profile` | Profile | Profil |
| `/users` | Users | Manajemen user (super_admin) |

---

## 7. Rekomendasi Tech Stack (REBUILD)

### 7.1 Rekomendasi Utama — **Next.js + Supabase** (deploy Vercel + Supabase)

Karena target deployment adalah **Vercel + Supabase**, framework paling optimal adalah **Next.js (App Router)**. Vercel adalah pembuat Next.js, sehingga integrasi, build, edge functions, dan DX-nya paling mulus.

**Frontend**
| Komponen | Pilihan | Alasan |
|---|---|---|
| Framework | **Next.js 14+ (App Router, React 18/19)** | First-class di Vercel, SSR/ISR/edge, API routes built-in |
| Bahasa | **TypeScript** | Type-safety untuk data model kompleks |
| Styling | **Tailwind CSS** | Cepat membangun tema bright & colorful + konsistensi |
| UI Components | **shadcn/ui** + Radix | Komponen accessible, mudah dikustom warna |
| State (client) | **Zustand** atau **TanStack Query** | Query untuk server-state, Zustand untuk UI-state |
| Drag & Drop | **@dnd-kit/core** | Kanban modern & accessible |
| Rich Text | **TipTap** (React) | Sama seperti sistem lama, dukung HTML description |
| Grafik Finance | **Recharts** atau **Chart.js** | Breakdown & trend chart |
| Form Builder | **React Hook Form + Zod** | Validasi & dynamic fields |

**Backend / Data (Supabase)**
| Komponen | Pilihan | Alasan |
|---|---|---|
| Database | **Supabase Postgres** | Relasional, cocok untuk multi-tenant |
| Auth | **Supabase Auth** | Email/password, JWT, pengganti JWT custom lama |
| Realtime | **Supabase Realtime** (Postgres changes / Broadcast) | Pengganti Socket.io untuk chat & live Kanban |
| Storage | **Supabase Storage** | Lampiran task & aset |
| API | **Next.js Route Handlers** + **Supabase client** / **RPC (Postgres functions)** | Logika bisnis & operasi role-based |
| Row Security | **Supabase RLS** | Isolasi multi-tenant di level DB |
| Background jobs | **Supabase Edge Functions / Vercel Cron** | Notion import, agregasi finance |

**Mengapa Next.js dan bukan tetap Vue/Nuxt?**
- Nuxt juga bisa di Vercel, tapi **Next.js adalah warga kelas satu Vercel** → build, caching, edge, dan dukungan komunitas Supabase (`@supabase/ssr`, contoh resmi) paling lengkap untuk Next.js.
- Ekosistem UI colorful (shadcn/ui, Tailwind, dnd-kit, TipTap React) paling matang di React.

> **Alternatif jika Anda ingin tetap di Vue:** **Nuxt 3 + Supabase (`@nuxtjs/supabase`)** — tetap deploy di Vercel. Valid dan nyaman bila tim sudah kuat di Vue (sistem lama memang Vue). Namun untuk greenfield + colorful UI + ekosistem Supabase, **Next.js lebih direkomendasikan.**

### 7.2 Ringkasan Keputusan
> **Pilih: Next.js (App Router) + TypeScript + Tailwind + shadcn/ui + TanStack Query + dnd-kit + TipTap + Recharts**, dengan **Supabase (Postgres + Auth + Realtime + Storage + RLS)**, deploy **frontend & API di Vercel**, **database/auth/realtime di Supabase**.

---

## 8. Arsitektur Deployment

```
┌──────────────────────────────┐        ┌──────────────────────────────┐
│            VERCEL             │        │           SUPABASE            │
│  ┌────────────────────────┐  │        │  ┌────────────────────────┐  │
│  │  Next.js App (SSR/CSR)  │  │  HTTPS │  │  Postgres + RLS         │  │
│  │  + Route Handlers (API) │◄─┼────────┼─►│  Supabase Auth (JWT)    │  │
│  │  + Edge/Cron            │  │        │  │  Realtime (WS)          │  │
│  └────────────────────────┘  │        │  │  Storage (attachments)  │  │
└──────────────────────────────┘        │  │  Edge Functions         │  │
                                         │  └────────────────────────┘  │
                                         └──────────────────────────────┘
```

- **Auth flow**: Supabase Auth mengeluarkan JWT; Next.js `@supabase/ssr` mengelola session via cookie.
- **Realtime chat/Kanban**: client subscribe ke channel Supabase Realtime (pengganti Socket.io).
- **Secrets**: `SUPABASE_URL`, `SUPABASE_ANON_KEY` (public), `SUPABASE_SERVICE_ROLE_KEY` (server-only, Vercel env).
- **Biaya**: Vercel Hobby (gratis) + Supabase Free tier cukup untuk MVP.

---

## 9. Model Data (Skema Supabase — ringkas)

```sql
-- companies
companies(id uuid pk, name text, invite_code text unique, created_at timestamptz)

-- users ditangani Supabase auth.users; profil tambahan:
profiles(id uuid pk ref auth.users, name text, email text, created_at timestamptz)

-- keanggotaan (multi-tenant)
company_members(company_id uuid, user_id uuid, role text check in('member','admin','super_admin'),
                primary key(company_id,user_id))

-- boards
boards(id uuid pk, company_id uuid, name text, owner_id uuid, created_at timestamptz)
board_columns(id uuid pk, board_id uuid, name text, position int)
tasks(id uuid pk, board_id uuid, column_id uuid, number int, title text, description text,
      customer text, status text, difficulty text, priority text, due_date date,
      assignee_id uuid, position int, done_at timestamptz,
      chatwoot_conversation_id text, created_at timestamptz, updated_at timestamptz)
task_comments(id uuid pk, task_id uuid, author_id uuid, body text, created_at timestamptz)
task_attachments(id uuid pk, task_id uuid, file_url text, created_at timestamptz)

-- company tasks
company_tasks(id uuid pk, company_id uuid, title text, assignee_id uuid, status text, ...)

-- finance
finance_transactions(id uuid pk, company_id uuid, type text check in('income','expense'),
                     category text, amount numeric, currency text, date date, note text,
                     created_at timestamptz)

-- forms
forms(id uuid pk, company_id uuid, title text, schema jsonb, is_public bool, created_at timestamptz)
form_submissions(id uuid pk, form_id uuid, data jsonb, submitted_by uuid, created_at timestamptz)

-- chat & friends
friendships(id uuid pk, requester_id uuid, addressee_id uuid, status text, created_at timestamptz)
dm_conversations(id uuid pk, user_a uuid, user_b uuid, last_body text, last_at timestamptz)
dm_messages(id uuid pk, conversation_id uuid, sender_id uuid, body text, read_at timestamptz, created_at timestamptz)
```

> Semua tabel ber-`company_id` wajib punya **RLS policy**: user hanya bisa akses baris pada company tempat dia menjadi `company_members`.

---

## 10. Desain Tema — "Bright & Colorful"

Permintaan: tema lebih cerah & berwarna (kontras dengan desain lama yang gelap/minimalis).

### 10.1 Prinsip Visual
- **Light-first**, latar putih/krem lembut, aksen warna cerah penuh energi.
- Permukaan kartu dengan **soft shadow** & **sudut membulat (rounded-2xl)**.
- Aksen **gradient** pada tombol utama & header.
- Setiap modul punya warna identitas (color-coded) agar mudah dibedakan.

### 10.2 Palet Warna (usulan)
| Token | Hex | Penggunaan |
|---|---|---|
| Primary / Indigo-Violet | `#6366F1` → `#8B5CF6` (gradient) | Tombol utama, link aktif |
| Accent Pink | `#EC4899` | Highlight, badge |
| Success Green | `#22C55E` | Status Done, income |
| Warning Amber | `#F59E0B` | Priority medium |
| Danger Red | `#EF4444` | Expense, delete, priority high |
| Info Cyan | `#06B6D4` | Chat/notif |
| Surface | `#FFFFFF` / `#F8FAFC` | Kartu & background |
| Text | `#0F172A` (slate-900) | Teks utama |

**Color-coding modul:**
- Boards → Indigo
- Finance → Emerald/Green
- Forms → Cyan
- Chat/DM → Pink
- Company/Admin → Violet

**Priority badges:** Low = hijau, Medium = amber, High = merah.
**Difficulty:** Low = cyan, Medium = indigo, High = pink.

### 10.3 Tipografi
- Headings: **Poppins** / **Plus Jakarta Sans** (lebih playful & bulat).
- Body: **Inter** (dipertahankan dari sistem lama untuk keterbacaan).

### 10.4 Komponen Khas
- Kartu Kanban berwarna strip kiri sesuai priority.
- Dashboard finance dengan grafik warna-warni (donut breakdown + area trend).
- Avatar anggota dengan warna latar otomatis dari inisial.
- Dark mode opsional (toggle) sebagai *nice to have*.

---

## 11. Non-Functional Requirements

- **Keamanan**: RLS di semua tabel, service-role key hanya di server, validasi input (Zod), rate limit login.
- **Performa**: optimistic UI untuk Kanban & chat, pagination finance, caching TanStack Query.
- **Aksesibilitas**: komponen Radix/shadcn (WCAG AA), kontras warna memadai meski "colorful".
- **Responsif**: mobile-first, Kanban scroll horizontal di mobile.
- **i18n**: siap Bahasa Indonesia & Inggris (string terpisah).
- **Observability**: logging error (mis. Sentry), Vercel Analytics.

---

## 12. Rencana Rilis (Milestones)

| Fase | Lingkup | Durasi estimasi |
|---|---|---|
| **M0 — Setup** | Repo Next.js, Supabase project, skema DB + RLS, Auth, deploy pipeline Vercel | 1 minggu |
| **M1 — Core** | Multi-company, Boards + Kanban drag-drop, Task detail | 2 minggu |
| **M2 — Finance & Forms** | Transaksi + dashboard chart, Form builder | 2 minggu |
| **M3 — Realtime** | Chat/DM realtime + Friends (Supabase Realtime) | 1.5 minggu |
| **M4 — Admin & Polish** | Users/Settings/Profile, Notion import, tema colorful final, QA | 1.5 minggu |

---

## 13. Risiko & Mitigasi

| Risiko | Dampak | Mitigasi |
|---|---|---|
| Realtime Supabase berbeda model dari Socket.io | Refactor chat | Pakai Broadcast + Postgres changes, uji dini di M0/M3 |
| RLS salah konfigurasi → kebocoran data antar company | Tinggi | Review policy + test otomatis per role |
| Vercel serverless cold start untuk API berat | Latensi | Edge runtime untuk endpoint ringan, cache query |
| Migrasi data dari sistem lama (Express/Postgres) | Downtime | Skrip migrasi + import `invite_code`/users |
| Integrasi Chatwoot & Notion kompleks | Delay | Jadikan opsional (fase akhir) |

---

## 14. Out of Scope (MVP)
- Mobile native app (hanya web responsif).
- Billing/subscription perusahaan.
- Analitik lanjutan / BI.
- Integrasi Chatwoot & Notion penuh (hanya dasar bila sempat).

---

## 15. Lampiran — Inventori Endpoint Sistem Lama (hasil analisis)

Base URL: `/api` · Auth: `Authorization: Bearer <JWT>` · Konteks: header `x-company-id`

```
POST   /auth/login            POST   /auth/register        GET  /auth/me
GET    /boards                GET    /boards/:id
GET    /company/users         GET    /company/tasks (admin)
GET    /finance/transactions  GET    /finance/summary
GET    /forms                 GET    /notion-import
GET    /invitations           GET    /users (super_admin)
GET    /friends               GET    /friends/requests     GET  /friends/sent
POST   /friends/request       GET    /dm/conversations
WebSocket: socket.io (realtime chat)
```

Role terdeteksi: `member`, `admin`, `super_admin`.
```
```
