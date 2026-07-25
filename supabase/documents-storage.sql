-- ============================================================
-- PERMISOS STORAGE — bucket "documents"
-- Supabase Dashboard → SQL Editor → pegar TODO → Run
-- ============================================================

-- 1) Crear o actualizar el bucket (nombre exacto: documents)
insert into storage.buckets (id, name, public, file_size_limit)
values ('documents', 'documents', false, 52428800)
on conflict (id) do update
set public = false, file_size_limit = 52428800;

-- 2) Quitar políticas viejas (si existen)
drop policy if exists "Documents: users upload own files" on storage.objects;
drop policy if exists "Documents: users read own files" on storage.objects;
drop policy if exists "Documents: users update own files" on storage.objects;
drop policy if exists "Documents: users delete own files" on storage.objects;
drop policy if exists "documents_insert_own_folder" on storage.objects;
drop policy if exists "documents_select_own_folder" on storage.objects;
drop policy if exists "documents_update_own_folder" on storage.objects;
drop policy if exists "documents_delete_own_folder" on storage.objects;

-- 3) Políticas: cada usuario solo en su carpeta {user_id}/archivo.pdf
--    (auth.jwt()->>'sub' = tu user id cuando estás logueado)

create policy "documents_insert_own_folder"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'documents'
    and (storage.foldername(name))[1] = (select auth.jwt() ->> 'sub')
  );

create policy "documents_select_own_folder"
  on storage.objects for select
  to authenticated
  using (
    bucket_id = 'documents'
    and (storage.foldername(name))[1] = (select auth.jwt() ->> 'sub')
  );

create policy "documents_update_own_folder"
  on storage.objects for update
  to authenticated
  using (
    bucket_id = 'documents'
    and (storage.foldername(name))[1] = (select auth.jwt() ->> 'sub')
  )
  with check (
    bucket_id = 'documents'
    and (storage.foldername(name))[1] = (select auth.jwt() ->> 'sub')
  );

create policy "documents_delete_own_folder"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'documents'
    and (storage.foldername(name))[1] = (select auth.jwt() ->> 'sub')
  );

-- 4) Verificar (debe mostrar 4 filas "documents_...")
select policyname, cmd, roles
from pg_policies
where tablename = 'objects'
  and schemaname = 'storage'
  and policyname like 'documents_%';
