-- Tru V1 database schema
-- Run this once in Supabase Dashboard > SQL Editor.

create extension if not exists pgcrypto;

create type public.account_role as enum ('player', 'manager', 'admin');
create type public.team_member_role as enum ('player', 'captain', 'manager', 'substitute');
create type public.scrim_status as enum ('open', 'accepted', 'live', 'awaiting_confirmation', 'completed', 'cancelled');

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null,
  username text unique,
  avatar_url text,
  discord_username text,
  region text default 'Philippines',
  account_role public.account_role not null default 'player',
  bio text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.teams (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles(id) on delete restrict,
  name text not null,
  tag text not null,
  region text not null default 'Philippines',
  goal text not null default 'Competitive',
  logo_url text,
  elo integer not null default 1200 check (elo >= 0),
  wins integer not null default 0,
  losses integer not null default 0,
  created_at timestamptz not null default now(),
  unique (name),
  unique (tag)
);

create table public.team_members (
  team_id uuid not null references public.teams(id) on delete cascade,
  profile_id uuid not null references public.profiles(id) on delete cascade,
  role public.team_member_role not null default 'player',
  game_role text,
  is_active_lineup boolean not null default false,
  joined_at timestamptz not null default now(),
  primary key (team_id, profile_id)
);

create table public.team_invites (
  id uuid primary key default gen_random_uuid(),
  team_id uuid not null references public.teams(id) on delete cascade,
  invited_profile_id uuid not null references public.profiles(id) on delete cascade,
  invited_by uuid not null references public.profiles(id) on delete cascade,
  role public.team_member_role not null default 'player',
  status text not null default 'pending' check (status in ('pending', 'accepted', 'declined', 'cancelled')),
  created_at timestamptz not null default now(),
  unique (team_id, invited_profile_id)
);

create table public.posts (
  id uuid primary key default gen_random_uuid(),
  author_id uuid not null references public.profiles(id) on delete cascade,
  body text not null check (char_length(body) between 1 and 2000),
  post_type text not null default 'general',
  media_url text,
  created_at timestamptz not null default now()
);

create table public.scrims (
  id uuid primary key default gen_random_uuid(),
  host_team_id uuid not null references public.teams(id) on delete cascade,
  opponent_team_id uuid references public.teams(id) on delete set null,
  region text not null,
  format text not null default 'BO3',
  minimum_elo integer,
  scheduled_at timestamptz not null,
  status public.scrim_status not null default 'open',
  created_by uuid not null references public.profiles(id) on delete restrict,
  created_at timestamptz not null default now(),
  check (opponent_team_id is null or opponent_team_id <> host_team_id)
);

create table public.match_messages (
  id bigint generated always as identity primary key,
  scrim_id uuid not null references public.scrims(id) on delete cascade,
  sender_id uuid not null references public.profiles(id) on delete cascade,
  body text not null check (char_length(body) between 1 and 2000),
  created_at timestamptz not null default now()
);

create table public.match_results (
  id uuid primary key default gen_random_uuid(),
  scrim_id uuid not null unique references public.scrims(id) on delete cascade,
  winner_team_id uuid not null references public.teams(id),
  host_score integer not null check (host_score >= 0),
  opponent_score integer not null check (opponent_score >= 0),
  submitted_by uuid not null references public.profiles(id),
  host_confirmed boolean not null default false,
  opponent_confirmed boolean not null default false,
  elo_processed boolean not null default false,
  submitted_at timestamptz not null default now()
);

create function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
begin
  insert into public.profiles (id, display_name, username)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'display_name', split_part(new.email, '@', 1)),
    null
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

create or replace function public.is_scrim_participant(target_scrim uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from scrims s
    join team_members tm
      on tm.team_id in (s.host_team_id, s.opponent_team_id)
    where s.id = target_scrim
      and tm.profile_id = auth.uid()
      and (tm.is_active_lineup or tm.role in ('captain', 'manager'))
  );
$$;

alter table public.profiles enable row level security;
alter table public.teams enable row level security;
alter table public.team_members enable row level security;
alter table public.team_invites enable row level security;
alter table public.posts enable row level security;
alter table public.scrims enable row level security;
alter table public.match_messages enable row level security;
alter table public.match_results enable row level security;

create policy "Profiles are public" on public.profiles for select using (true);
create policy "Users update own profile" on public.profiles for update using (auth.uid() = id);
create policy "Teams are public" on public.teams for select using (true);
create policy "Authenticated users create teams" on public.teams for insert to authenticated with check (auth.uid() = owner_id);
create policy "Owners update teams" on public.teams for update using (auth.uid() = owner_id);
create policy "Team memberships are public" on public.team_members for select using (true);
create policy "Owners manage membership" on public.team_members for all using (
  exists (select 1 from public.teams where teams.id = team_id and teams.owner_id = auth.uid())
);
create policy "Users see their invites" on public.team_invites for select using (
  invited_profile_id = auth.uid() or invited_by = auth.uid()
);
create policy "Managers create invites" on public.team_invites for insert to authenticated with check (invited_by = auth.uid());
create policy "Invitees update invites" on public.team_invites for update using (
  invited_profile_id = auth.uid() or invited_by = auth.uid()
);
create policy "Posts are public" on public.posts for select using (true);
create policy "Users create posts" on public.posts for insert to authenticated with check (author_id = auth.uid());
create policy "Authors manage posts" on public.posts for update using (author_id = auth.uid());
create policy "Authors delete posts" on public.posts for delete using (author_id = auth.uid());
create policy "Scrims are public" on public.scrims for select using (true);
create policy "Team members create scrims" on public.scrims for insert to authenticated with check (
  created_by = auth.uid() and exists (
    select 1 from public.team_members
    where team_id = host_team_id and profile_id = auth.uid()
      and role in ('captain', 'manager')
  )
);
create policy "Participants update scrims" on public.scrims for update using (public.is_scrim_participant(id));
create policy "Private match chat" on public.match_messages for select using (public.is_scrim_participant(scrim_id));
create policy "Participants send match chat" on public.match_messages for insert to authenticated with check (
  sender_id = auth.uid() and public.is_scrim_participant(scrim_id)
);
create policy "Participants see results" on public.match_results for select using (public.is_scrim_participant(scrim_id));
create policy "Participants submit results" on public.match_results for insert to authenticated with check (
  submitted_by = auth.uid() and public.is_scrim_participant(scrim_id)
);
create policy "Participants confirm results" on public.match_results for update using (public.is_scrim_participant(scrim_id));

alter publication supabase_realtime add table public.match_messages;
