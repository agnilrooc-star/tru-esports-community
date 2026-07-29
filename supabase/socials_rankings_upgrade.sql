-- Run once in Supabase SQL Editor after scrims_v1_upgrade.sql.

create table if not exists public.post_likes (
  post_id uuid not null references public.posts(id) on delete cascade,
  profile_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (post_id, profile_id)
);

create table if not exists public.post_comments (
  id bigint generated always as identity primary key,
  post_id uuid not null references public.posts(id) on delete cascade,
  author_id uuid not null references public.profiles(id) on delete cascade,
  body text not null check (char_length(body) between 1 and 1000),
  created_at timestamptz not null default now()
);

alter table public.post_likes enable row level security;
alter table public.post_comments enable row level security;

drop policy if exists "Likes are public" on public.post_likes;
drop policy if exists "Users like posts" on public.post_likes;
drop policy if exists "Users remove own likes" on public.post_likes;
drop policy if exists "Comments are public" on public.post_comments;
drop policy if exists "Users create comments" on public.post_comments;
drop policy if exists "Authors delete comments" on public.post_comments;

create policy "Likes are public" on public.post_likes for select using (true);
create policy "Users like posts" on public.post_likes for insert to authenticated with check (profile_id = auth.uid());
create policy "Users remove own likes" on public.post_likes for delete using (profile_id = auth.uid());
create policy "Comments are public" on public.post_comments for select using (true);
create policy "Users create comments" on public.post_comments for insert to authenticated with check (author_id = auth.uid());
create policy "Authors delete comments" on public.post_comments for delete using (author_id = auth.uid());

do $$
begin
  if not exists (select 1 from pg_publication_tables where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'posts') then
    alter publication supabase_realtime add table public.posts;
  end if;
  if not exists (select 1 from pg_publication_tables where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'post_likes') then
    alter publication supabase_realtime add table public.post_likes;
  end if;
  if not exists (select 1 from pg_publication_tables where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'post_comments') then
    alter publication supabase_realtime add table public.post_comments;
  end if;
end $$;
