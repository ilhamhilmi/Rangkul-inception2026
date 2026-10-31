-- Bucket penyimpanan foto postingan Jelajahi.
-- Publik untuk dibaca (cover timeline + carousel detail), tetapi unggah/hapus
-- hanya boleh dilakukan pemilik folder `<user_id>/...` lewat sesi Supabase.
-- Idempoten: aman dijalankan ulang di lingkungan yang sudah punya bucket.

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'place-photos',
  'place-photos',
  true,
  5242880,
  array['image/jpeg', 'image/png', 'image/webp']
)
on conflict (id) do nothing;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'storage'
      and tablename = 'objects'
      and policyname = 'place_photos_select_own'
  ) then
    create policy "place_photos_select_own"
      on storage.objects for select to authenticated
      using (bucket_id = 'place-photos' and owner = auth.uid());
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'storage'
      and tablename = 'objects'
      and policyname = 'place_photos_insert_own'
  ) then
    create policy "place_photos_insert_own"
      on storage.objects for insert to authenticated
      with check (bucket_id = 'place-photos' and owner = auth.uid());
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'storage'
      and tablename = 'objects'
      and policyname = 'place_photos_delete_own'
  ) then
    create policy "place_photos_delete_own"
      on storage.objects for delete to authenticated
      using (bucket_id = 'place-photos' and owner = auth.uid());
  end if;
end $$;
