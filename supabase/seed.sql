-- =============================================================
-- AIO-Tracker — Seed data (opsional, untuk pengembangan lokal)
-- Dijalankan otomatis oleh `supabase db reset` / `supabase start`.
--
-- CATATAN: user auth (auth.users) sebaiknya dibuat lewat Auth
-- (signUp) agar password ter-hash benar. Seed ini hanya mengisi
-- data non-auth (company + invite_code) sebagai contoh.
-- =============================================================

insert into public.companies (id, name, invite_code)
values ('68f8075b-f159-4843-9c1e-f31905669099', 'Stealien', 'STEAL-001')
on conflict (invite_code) do nothing;

-- Setelah mendaftar via UI, tautkan user ke company dengan:
--   insert into public.company_members (company_id, user_id, role)
--   values ('<company_id>', '<auth_user_id>', 'member');
