-- Bucket penyimpanan untuk logo komunitas, cover kegiatan, dan dokumen
-- verifikasi penyelenggara.
--
-- community-logos dan event-covers bersifat publik untuk dibaca. Unggah dan
-- hapus dibatasi ke folder milik pengguna yang sedang login:
--   community/<user_id>/...
--   events/<user_id>/...
--
-- verification-docs bersifat privat. Pemilik folder boleh mengunggah, sedangkan
-- admin boleh membaca lewat signed URL. Akses tetap dicek di Server Action.
--
-- Idempoten: aman dijalankan ulang.

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  (
    'community-logos',
    'community-logos',
    true,
    5242880,
    array['image/jpeg', 'image/png', 'image/webp']
  ),
  (
    'event-covers',
    'event-covers',
    true,
    5242880,
    array['image/jpeg', 'image/png', 'image/webp']
  ),
  (
    'verification-docs',
    'verification-docs',
    false,
    5242880,
    array['image/jpeg', 'image/png', 'image/webp', 'application/pdf']
  )
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

do $$
begin
  -- Logo komunitas: baca publik, tulis hanya di folder sendiri.
  if not exists (
    select 1 from pg_policies
    where schemaname = 'storage'
      and tablename = 'objects'
      and policyname = 'community_logos_select_public'
  ) then
    create policy "community_logos_select_public"
      on storage.objects for select to anon, authenticated
      using (bucket_id = 'community-logos');
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'storage'
      and tablename = 'objects'
      and policyname = 'community_logos_insert_own'
  ) then
    create policy "community_logos_insert_own"
      on storage.objects for insert to authenticated
      with check (
        bucket_id = 'community-logos'
        and (storage.foldername(name))[1] = 'community'
        and (storage.foldername(name))[2] = auth.uid()::text
      );
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'storage'
      and tablename = 'objects'
      and policyname = 'community_logos_update_own'
  ) then
    create policy "community_logos_update_own"
      on storage.objects for update to authenticated
      using (
        bucket_id = 'community-logos'
        and (storage.foldername(name))[1] = 'community'
        and (storage.foldername(name))[2] = auth.uid()::text
      )
      with check (
        bucket_id = 'community-logos'
        and (storage.foldername(name))[1] = 'community'
        and (storage.foldername(name))[2] = auth.uid()::text
      );
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'storage'
      and tablename = 'objects'
      and policyname = 'community_logos_delete_own'
  ) then
    create policy "community_logos_delete_own"
      on storage.objects for delete to authenticated
      using (
        bucket_id = 'community-logos'
        and (storage.foldername(name))[1] = 'community'
        and (storage.foldername(name))[2] = auth.uid()::text
      );
  end if;

  -- Cover kegiatan: baca publik, tulis hanya di folder sendiri.
  if not exists (
    select 1 from pg_policies
    where schemaname = 'storage'
      and tablename = 'objects'
      and policyname = 'event_covers_select_public'
  ) then
    create policy "event_covers_select_public"
      on storage.objects for select to anon, authenticated
      using (bucket_id = 'event-covers');
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'storage'
      and tablename = 'objects'
      and policyname = 'event_covers_insert_own'
  ) then
    create policy "event_covers_insert_own"
      on storage.objects for insert to authenticated
      with check (
        bucket_id = 'event-covers'
        and (storage.foldername(name))[1] = 'events'
        and (storage.foldername(name))[2] = auth.uid()::text
      );
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'storage'
      and tablename = 'objects'
      and policyname = 'event_covers_update_own'
  ) then
    create policy "event_covers_update_own"
      on storage.objects for update to authenticated
      using (
        bucket_id = 'event-covers'
        and (storage.foldername(name))[1] = 'events'
        and (storage.foldername(name))[2] = auth.uid()::text
      )
      with check (
        bucket_id = 'event-covers'
        and (storage.foldername(name))[1] = 'events'
        and (storage.foldername(name))[2] = auth.uid()::text
      );
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'storage'
      and tablename = 'objects'
      and policyname = 'event_covers_delete_own'
  ) then
    create policy "event_covers_delete_own"
      on storage.objects for delete to authenticated
      using (
        bucket_id = 'event-covers'
        and (storage.foldername(name))[1] = 'events'
        and (storage.foldername(name))[2] = auth.uid()::text
      );
  end if;

  -- Dokumen verifikasi: privat. Pemilik folder dan admin boleh membaca.
  if not exists (
    select 1 from pg_policies
    where schemaname = 'storage'
      and tablename = 'objects'
      and policyname = 'verification_docs_select_own_or_admin'
  ) then
    create policy "verification_docs_select_own_or_admin"
      on storage.objects for select to authenticated
      using (
        bucket_id = 'verification-docs'
        and (
          (storage.foldername(name))[2] = auth.uid()::text
          or public.is_admin()
        )
      );
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'storage'
      and tablename = 'objects'
      and policyname = 'verification_docs_insert_own'
  ) then
    create policy "verification_docs_insert_own"
      on storage.objects for insert to authenticated
      with check (
        bucket_id = 'verification-docs'
        and (storage.foldername(name))[1] = 'organizer'
        and (storage.foldername(name))[2] = auth.uid()::text
      );
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'storage'
      and tablename = 'objects'
      and policyname = 'verification_docs_delete_own_or_admin'
  ) then
    create policy "verification_docs_delete_own_or_admin"
      on storage.objects for delete to authenticated
      using (
        bucket_id = 'verification-docs'
        and (
          (storage.foldername(name))[2] = auth.uid()::text
          or public.is_admin()
        )
      );
  end if;
end $$;
