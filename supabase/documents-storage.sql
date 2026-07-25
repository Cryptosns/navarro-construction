-- Permisos de Storage para el bucket "documents"
-- Ejecutar en Supabase Dashboard → SQL Editor DESPUÉS de crear el bucket "documents"

-- Asegura que el bucket existe (privado)
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'documents',
  'documents',
  false,
  52428800, -- 50 MB
  null      -- todos los tipos permitidos
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit;

-- Borra políticas previas si re-ejecutas este script
drop policy if exists "Documents: users upload own files" on storage.objects;
drop policy if exists "Documents: users read own files" on storage.objects;
drop policy if exists "Documents: users update own files" on storage.objects;
drop policy if exists "Documents: users delete own files" on storage.objects;

-- Subir: solo a su carpeta {user_id}/...
create policy "Documents: users upload own files"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'documents'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- Leer / descargar
create policy "Documents: users read own files"
  on storage.objects for select
  to authenticated
  using (
    bucket_id = 'documents'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- Actualizar (reemplazar archivo)
create policy "Documents: users update own files"
  on storage.objects for update
  to authenticated
  using (
    bucket_id = 'documents'
    and (storage.foldername(name))[1] = auth.uid()::text
  )
  with check (
    bucket_id = 'documents'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- Eliminar
create policy "Documents: users delete own files"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'documents'
    and (storage.foldername(name))[1] = auth.uid()::text
  );
