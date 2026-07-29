-- Run this once in Supabase SQL Editor after the original schema.sql.
-- It upgrades an existing Tru database for the live Scrims V1.

alter table public.scrims
  add column if not exists room_code text,
  add column if not exists room_password text;

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
    select 1
    from public.team_members
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

do $$
begin
  if not exists (
    select 1
    from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'scrims'
  ) then
    alter publication supabase_realtime add table public.scrims;
  end if;
end $$;
