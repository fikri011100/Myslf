-- =============================================================
-- AIO-Tracker — Skema Database Supabase (PRD §9)
-- Jalankan di Supabase SQL Editor.
-- Mencakup: tabel, trigger profil, dan Row Level Security (RLS)
-- untuk isolasi multi-tenant per company.
-- =============================================================

create extension if not exists "pgcrypto";

-- ─── ENUM ────────────────────────────────────────────────────
do $$ begin
  create type role_type as enum ('member', 'admin', 'super_admin');
exception when duplicate_object then null; end $$;

do $$ begin
  create type task_level as enum ('low', 'medium', 'high');
exception when duplicate_object then null; end $$;

do $$ begin
  create type tx_type as enum ('income', 'expense');
exception when duplicate_object then null; end $$;

-- ─── PROFILES (mirror auth.users) ───────────────────────────
create table if not exists public.profiles (
  id         uuid primary key references auth.users(id) on delete cascade,
  name       text not null default '',
  email      text,
  created_at timestamptz not null default now()
);

-- Trigger: buat profil otomatis saat user baru mendaftar
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, name, email)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'name', ''),
    new.email
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ─── COMPANIES & MEMBERSHIP ─────────────────────────────────
create table if not exists public.companies (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  invite_code text unique not null,
  created_at  timestamptz not null default now()
);

create table if not exists public.company_members (
  company_id uuid not null references public.companies(id) on delete cascade,
  user_id    uuid not null references public.profiles(id) on delete cascade,
  role       role_type not null default 'member',
  created_at timestamptz not null default now(),
  primary key (company_id, user_id)
);

-- Helper: cek keanggotaan (dipakai di RLS, SECURITY DEFINER agar
-- tidak rekursif terhadap policy company_members).
create or replace function public.is_member(cid uuid)
returns boolean
language sql stable security definer set search_path = public
as $$
  select exists (
    select 1 from public.company_members
    where company_id = cid and user_id = auth.uid()
  );
$$;

create or replace function public.is_admin(cid uuid)
returns boolean
language sql stable security definer set search_path = public
as $$
  select exists (
    select 1 from public.company_members
    where company_id = cid and user_id = auth.uid()
      and role in ('admin', 'super_admin')
  );
$$;

-- ─── BOARDS / COLUMNS / TASKS ───────────────────────────────
create table if not exists public.boards (
  id         uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  name       text not null,
  owner_id   uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now()
);

create table if not exists public.board_columns (
  id       uuid primary key default gen_random_uuid(),
  board_id uuid not null references public.boards(id) on delete cascade,
  name     text not null,
  position int not null default 0
);

create table if not exists public.tasks (
  id                      uuid primary key default gen_random_uuid(),
  board_id                uuid not null references public.boards(id) on delete cascade,
  column_id               uuid references public.board_columns(id) on delete set null,
  number                  int,
  title                   text not null,
  description             text,
  customer                text,
  status                  text,
  difficulty              task_level,
  priority                task_level,
  due_date                date,
  assignee_id             uuid references public.profiles(id) on delete set null,
  position                int not null default 0,
  done_at                 timestamptz,
  chatwoot_conversation_id text,
  created_at              timestamptz not null default now(),
  updated_at              timestamptz not null default now()
);

create table if not exists public.task_comments (
  id         uuid primary key default gen_random_uuid(),
  task_id    uuid not null references public.tasks(id) on delete cascade,
  author_id  uuid references public.profiles(id) on delete set null,
  body       text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.task_attachments (
  id         uuid primary key default gen_random_uuid(),
  task_id    uuid not null references public.tasks(id) on delete cascade,
  file_url   text not null,
  created_at timestamptz not null default now()
);

-- ─── COMPANY TASKS ──────────────────────────────────────────
create table if not exists public.company_tasks (
  id          uuid primary key default gen_random_uuid(),
  company_id  uuid not null references public.companies(id) on delete cascade,
  title       text not null,
  description text,
  assignee_id uuid references public.profiles(id) on delete set null,
  status      text default 'open',
  created_at  timestamptz not null default now()
);

-- ─── FINANCE ────────────────────────────────────────────────
create table if not exists public.finance_transactions (
  id         uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  type       tx_type not null,
  category   text not null,
  amount     numeric(14,2) not null check (amount >= 0),
  currency   text not null default 'IDR',
  date       date not null default current_date,
  note       text,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now()
);

-- ─── FORMS ──────────────────────────────────────────────────
create table if not exists public.forms (
  id         uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  title      text not null,
  schema     jsonb not null default '{}'::jsonb,
  is_public  boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.form_submissions (
  id           uuid primary key default gen_random_uuid(),
  form_id      uuid not null references public.forms(id) on delete cascade,
  data         jsonb not null default '{}'::jsonb,
  submitted_by uuid references public.profiles(id) on delete set null,
  created_at   timestamptz not null default now()
);

-- ─── CHAT & FRIENDS ─────────────────────────────────────────
create table if not exists public.friendships (
  id           uuid primary key default gen_random_uuid(),
  requester_id uuid not null references public.profiles(id) on delete cascade,
  addressee_id uuid not null references public.profiles(id) on delete cascade,
  status       text not null default 'pending', -- pending | accepted | rejected
  created_at   timestamptz not null default now(),
  unique (requester_id, addressee_id)
);

create table if not exists public.dm_conversations (
  id         uuid primary key default gen_random_uuid(),
  user_a     uuid not null references public.profiles(id) on delete cascade,
  user_b     uuid not null references public.profiles(id) on delete cascade,
  last_body  text,
  last_at    timestamptz,
  created_at timestamptz not null default now(),
  unique (user_a, user_b)
);

create table if not exists public.dm_messages (
  id              uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.dm_conversations(id) on delete cascade,
  sender_id       uuid not null references public.profiles(id) on delete cascade,
  body            text not null,
  read_at         timestamptz,
  created_at      timestamptz not null default now()
);

-- ─── INDEXES ────────────────────────────────────────────────
create index if not exists idx_members_user   on public.company_members(user_id);
create index if not exists idx_boards_company  on public.boards(company_id);
create index if not exists idx_columns_board   on public.board_columns(board_id);
create index if not exists idx_tasks_board     on public.tasks(board_id);
create index if not exists idx_tasks_column    on public.tasks(column_id);
create index if not exists idx_fin_company     on public.finance_transactions(company_id);
create index if not exists idx_forms_company   on public.forms(company_id);
create index if not exists idx_dm_msg_conv     on public.dm_messages(conversation_id);

-- =============================================================
-- ROW LEVEL SECURITY
-- =============================================================
alter table public.profiles             enable row level security;
alter table public.companies            enable row level security;
alter table public.company_members      enable row level security;
alter table public.boards               enable row level security;
alter table public.board_columns        enable row level security;
alter table public.tasks                enable row level security;
alter table public.task_comments        enable row level security;
alter table public.task_attachments     enable row level security;
alter table public.company_tasks        enable row level security;
alter table public.finance_transactions enable row level security;
alter table public.forms                enable row level security;
alter table public.form_submissions     enable row level security;
alter table public.friendships          enable row level security;
alter table public.dm_conversations     enable row level security;
alter table public.dm_messages          enable row level security;

-- PROFILES: baca semua yang login, update milik sendiri
create policy "profiles_select" on public.profiles
  for select using (auth.role() = 'authenticated');
create policy "profiles_update_own" on public.profiles
  for update using (id = auth.uid());

-- COMPANIES: anggota boleh lihat; admin boleh update
create policy "companies_select_member" on public.companies
  for select using (public.is_member(id));
create policy "companies_update_admin" on public.companies
  for update using (public.is_admin(id));

-- COMPANY_MEMBERS: user lihat baris miliknya / rekan se-company
create policy "members_select" on public.company_members
  for select using (user_id = auth.uid() or public.is_member(company_id));
create policy "members_admin_write" on public.company_members
  for all using (public.is_admin(company_id)) with check (public.is_admin(company_id));

-- BOARDS: anggota company
create policy "boards_rw" on public.boards
  for all using (public.is_member(company_id)) with check (public.is_member(company_id));

-- BOARD_COLUMNS: via board -> company
create policy "columns_rw" on public.board_columns
  for all using (
    exists (select 1 from public.boards b
            where b.id = board_id and public.is_member(b.company_id))
  ) with check (
    exists (select 1 from public.boards b
            where b.id = board_id and public.is_member(b.company_id))
  );

-- TASKS: via board -> company
create policy "tasks_rw" on public.tasks
  for all using (
    exists (select 1 from public.boards b
            where b.id = board_id and public.is_member(b.company_id))
  ) with check (
    exists (select 1 from public.boards b
            where b.id = board_id and public.is_member(b.company_id))
  );

-- TASK_COMMENTS / ATTACHMENTS: via task -> board -> company
create policy "comments_rw" on public.task_comments
  for all using (
    exists (select 1 from public.tasks t join public.boards b on b.id = t.board_id
            where t.id = task_id and public.is_member(b.company_id))
  ) with check (
    exists (select 1 from public.tasks t join public.boards b on b.id = t.board_id
            where t.id = task_id and public.is_member(b.company_id))
  );
create policy "attachments_rw" on public.task_attachments
  for all using (
    exists (select 1 from public.tasks t join public.boards b on b.id = t.board_id
            where t.id = task_id and public.is_member(b.company_id))
  ) with check (
    exists (select 1 from public.tasks t join public.boards b on b.id = t.board_id
            where t.id = task_id and public.is_member(b.company_id))
  );

-- COMPANY_TASKS: member lihat, admin tulis
create policy "ctasks_select" on public.company_tasks
  for select using (public.is_member(company_id));
create policy "ctasks_admin_write" on public.company_tasks
  for all using (public.is_admin(company_id)) with check (public.is_admin(company_id));

-- FINANCE: anggota company
create policy "finance_rw" on public.finance_transactions
  for all using (public.is_member(company_id)) with check (public.is_member(company_id));

-- FORMS: anggota company (atau publik untuk select bila is_public)
create policy "forms_select" on public.forms
  for select using (is_public or public.is_member(company_id));
create policy "forms_write" on public.forms
  for all using (public.is_member(company_id)) with check (public.is_member(company_id));

-- FORM_SUBMISSIONS: anggota company lihat; siapa pun bisa submit ke form publik
create policy "submissions_select" on public.form_submissions
  for select using (
    exists (select 1 from public.forms f
            where f.id = form_id and public.is_member(f.company_id))
  );
create policy "submissions_insert" on public.form_submissions
  for insert with check (
    exists (select 1 from public.forms f
            where f.id = form_id and (f.is_public or public.is_member(f.company_id)))
  );

-- FRIENDSHIPS: hanya pihak terkait
create policy "friends_rw" on public.friendships
  for all using (requester_id = auth.uid() or addressee_id = auth.uid())
  with check (requester_id = auth.uid() or addressee_id = auth.uid());

-- DM CONVERSATIONS: hanya peserta
create policy "dm_conv_rw" on public.dm_conversations
  for all using (user_a = auth.uid() or user_b = auth.uid())
  with check (user_a = auth.uid() or user_b = auth.uid());

-- DM MESSAGES: peserta percakapan
create policy "dm_msg_rw" on public.dm_messages
  for all using (
    exists (select 1 from public.dm_conversations c
            where c.id = conversation_id
              and (c.user_a = auth.uid() or c.user_b = auth.uid()))
  ) with check (
    sender_id = auth.uid() and
    exists (select 1 from public.dm_conversations c
            where c.id = conversation_id
              and (c.user_a = auth.uid() or c.user_b = auth.uid()))
  );

-- =============================================================
-- SELESAI. Aktifkan Realtime untuk dm_messages & tasks via
-- Supabase Dashboard > Database > Replication bila diperlukan.
-- =============================================================
