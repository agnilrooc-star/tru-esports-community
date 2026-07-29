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

create table public.post_likes (
  post_id uuid not null references public.posts(id) on delete cascade,
  profile_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (post_id, profile_id)
);

create table public.post_comments (
  id bigint generated always as identity primary key,
  post_id uuid not null references public.posts(id) on delete cascade,
  author_id uuid not null references public.profiles(id) on delete cascade,
  body text not null check (char_length(body) between 1 and 1000),
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
  room_code text,
  room_password text,
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
alter table public.post_likes enable row level security;
alter table public.post_comments enable row level security;
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
create policy "Likes are public" on public.post_likes for select using (true);
create policy "Users like posts" on public.post_likes for insert to authenticated with check (profile_id = auth.uid());
create policy "Users remove own likes" on public.post_likes for delete using (profile_id = auth.uid());
create policy "Comments are public" on public.post_comments for select using (true);
create policy "Users create comments" on public.post_comments for insert to authenticated with check (author_id = auth.uid());
create policy "Authors delete comments" on public.post_comments for delete using (author_id = auth.uid());
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

create or replace function public.accept_scrim(target_scrim uuid, challenger_team uuid)
returns public.scrims
language plpgsql
security definer
set search_path = public
as $$
declare
  accepted_scrim public.scrims;
begin
  if auth.uid() is null then
    raise exception 'You must be logged in.';
  end if;

  if not exists (
    select 1 from public.team_members
    where team_id = challenger_team
      and profile_id = auth.uid()
      and role in ('captain', 'manager')
  ) then
    raise exception 'Only a captain or manager can challenge another team.';
  end if;

  update public.scrims
  set opponent_team_id = challenger_team,
      status = 'accepted'
  where id = target_scrim
    and status = 'open'
    and opponent_team_id is null
    and host_team_id <> challenger_team
  returning * into accepted_scrim;

  if accepted_scrim.id is null then
    raise exception 'This scrim is no longer available.';
  end if;
  return accepted_scrim;
end;
$$;

grant execute on function public.accept_scrim(uuid, uuid) to authenticated;

create or replace function public.submit_scrim_result(
  target_scrim uuid,
  winning_team uuid,
  host_maps integer,
  opponent_maps integer
)
returns public.match_results
language plpgsql
security definer
set search_path = public
as $$
declare
  target public.scrims;
  caller_team uuid;
  saved public.match_results;
  losing_team uuid;
begin
  select * into target from public.scrims where id = target_scrim;
  if target.id is null or target.opponent_team_id is null then raise exception 'Match not found.'; end if;
  if winning_team not in (target.host_team_id, target.opponent_team_id) then raise exception 'Invalid winner.'; end if;
  if host_maps < 0 or opponent_maps < 0 or host_maps = opponent_maps then raise exception 'Invalid score.'; end if;

  select tm.team_id into caller_team
  from public.team_members tm
  where tm.profile_id = auth.uid()
    and tm.team_id in (target.host_team_id, target.opponent_team_id)
    and tm.role in ('captain', 'manager')
  limit 1;
  if caller_team is null then raise exception 'Only a captain or manager can confirm results.'; end if;

  select * into saved from public.match_results where scrim_id = target_scrim;
  if saved.id is null then
    insert into public.match_results (
      scrim_id, winner_team_id, host_score, opponent_score, submitted_by,
      host_confirmed, opponent_confirmed
    ) values (
      target_scrim, winning_team, host_maps, opponent_maps, auth.uid(),
      caller_team = target.host_team_id, caller_team = target.opponent_team_id
    ) returning * into saved;
  else
    if saved.winner_team_id <> winning_team or saved.host_score <> host_maps or saved.opponent_score <> opponent_maps then
      raise exception 'The submitted result does not match. Ask the original captain to correct it.';
    end if;
    update public.match_results set
      host_confirmed = host_confirmed or caller_team = target.host_team_id,
      opponent_confirmed = opponent_confirmed or caller_team = target.opponent_team_id
    where id = saved.id returning * into saved;
  end if;

  if saved.host_confirmed and saved.opponent_confirmed and not saved.elo_processed then
    losing_team := case when winning_team = target.host_team_id then target.opponent_team_id else target.host_team_id end;
    update public.teams set elo = elo + 25, wins = wins + 1 where id = winning_team;
    update public.teams set elo = greatest(0, elo - 25), losses = losses + 1 where id = losing_team;
    update public.match_results set elo_processed = true where id = saved.id returning * into saved;
    update public.scrims set status = 'completed' where id = target_scrim;
  else
    update public.scrims set status = 'awaiting_confirmation' where id = target_scrim;
  end if;
  return saved;
end;
$$;

grant execute on function public.submit_scrim_result(uuid, uuid, integer, integer) to authenticated;

alter publication supabase_realtime add table public.match_messages;
