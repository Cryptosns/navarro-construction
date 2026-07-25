-- Ejecutar en Supabase Dashboard → SQL Editor
-- https://supabase.com/dashboard → tu proyecto → SQL Editor

create table if not exists documents (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users not null,
  name text not null,
  project text not null default '',
  type text not null default 'reporte'
    check (type in ('plano', 'contrato', 'permiso', 'reporte')),
  notes text not null default '',
  storage_path text,
  mime_type text,
  size_bytes bigint,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table documents enable row level security;

drop policy if exists "Users manage own documents" on documents;
create policy "Users manage own documents"
  on documents for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create index if not exists documents_user_id_idx on documents (user_id);

-- Storage: Dashboard → Storage → New bucket → name: documents → Private
