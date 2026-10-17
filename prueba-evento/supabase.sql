-- Galería compartida de "Prueba de Evento"
-- Pégalo en Supabase → SQL Editor → New query → Run

-- 1) Carpeta pública "galeria": máx. 50 MB por archivo, solo fotos y videos
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('galeria', 'galeria', true, 52428800,
        array['image/jpeg','image/png','image/webp','video/mp4','video/webm','video/quicktime'])
on conflict (id) do nothing;

-- 2) Cualquiera puede ver la galería
create policy "galeria: ver" on storage.objects
  for select to anon using (bucket_id = 'galeria');

-- 3) Cualquiera puede subir (pero no borrar ni reemplazar)
create policy "galeria: subir" on storage.objects
  for insert to anon with check (bucket_id = 'galeria');
