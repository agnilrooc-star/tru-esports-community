-- Public image buckets. Files remain protected for writes by the policies below.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  ('profile-images', 'profile-images', true, 5242880, array['image/jpeg', 'image/png', 'image/webp']),
  ('team-images', 'team-images', true, 5242880, array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "Public profile images" on storage.objects;
create policy "Public profile images"
on storage.objects for select
using (bucket_id = 'profile-images');

drop policy if exists "Users upload own profile image" on storage.objects;
create policy "Users upload own profile image"
on storage.objects for insert to authenticated
with check (
  bucket_id = 'profile-images'
  and (storage.foldername(name))[1] = auth.uid()::text
);

drop policy if exists "Users update own profile image" on storage.objects;
create policy "Users update own profile image"
on storage.objects for update to authenticated
using (
  bucket_id = 'profile-images'
  and (storage.foldername(name))[1] = auth.uid()::text
)
with check (
  bucket_id = 'profile-images'
  and (storage.foldername(name))[1] = auth.uid()::text
);

drop policy if exists "Users delete own profile image" on storage.objects;
create policy "Users delete own profile image"
on storage.objects for delete to authenticated
using (
  bucket_id = 'profile-images'
  and (storage.foldername(name))[1] = auth.uid()::text
);

drop policy if exists "Public team images" on storage.objects;
create policy "Public team images"
on storage.objects for select
using (bucket_id = 'team-images');

drop policy if exists "Team leaders upload team image" on storage.objects;
create policy "Team leaders upload team image"
on storage.objects for insert to authenticated
with check (
  bucket_id = 'team-images'
  and exists (
    select 1 from public.team_members tm
    where tm.team_id::text = (storage.foldername(name))[1]
      and tm.profile_id = auth.uid()
      and tm.role in ('captain', 'manager')
  )
);

drop policy if exists "Team leaders update team image" on storage.objects;
create policy "Team leaders update team image"
on storage.objects for update to authenticated
using (
  bucket_id = 'team-images'
  and exists (
    select 1 from public.team_members tm
    where tm.team_id::text = (storage.foldername(name))[1]
      and tm.profile_id = auth.uid()
      and tm.role in ('captain', 'manager')
  )
)
with check (
  bucket_id = 'team-images'
  and exists (
    select 1 from public.team_members tm
    where tm.team_id::text = (storage.foldername(name))[1]
      and tm.profile_id = auth.uid()
      and tm.role in ('captain', 'manager')
  )
);

drop policy if exists "Team leaders delete team image" on storage.objects;
create policy "Team leaders delete team image"
on storage.objects for delete to authenticated
using (
  bucket_id = 'team-images'
  and exists (
    select 1 from public.team_members tm
    where tm.team_id::text = (storage.foldername(name))[1]
      and tm.profile_id = auth.uid()
      and tm.role in ('captain', 'manager')
  )
);

drop policy if exists "Team leaders update team profile" on public.teams;
create policy "Team leaders update team profile"
on public.teams for update to authenticated
using (
  exists (
    select 1 from public.team_members tm
    where tm.team_id = teams.id
      and tm.profile_id = auth.uid()
      and tm.role in ('captain', 'manager')
  )
)
with check (
  exists (
    select 1 from public.team_members tm
    where tm.team_id = teams.id
      and tm.profile_id = auth.uid()
      and tm.role in ('captain', 'manager')
  )
);
