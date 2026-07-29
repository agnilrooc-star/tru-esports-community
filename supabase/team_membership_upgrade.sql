-- Tru V1 team invitations and self-service membership.

create unique index if not exists one_team_per_player
on public.team_members (profile_id);

create unique index if not exists one_pending_invite_per_team_player
on public.team_invites (team_id, invited_profile_id)
where status = 'pending';

create or replace function public.invite_player_to_my_team(
  target_identity text,
  target_role public.team_member_role default 'player'
)
returns public.team_invites
language plpgsql
security definer
set search_path = public
as $$
declare
  caller_team uuid;
  target_profile uuid;
  saved public.team_invites;
begin
  if auth.uid() is null then raise exception 'You must be logged in.'; end if;
  if target_role not in ('player', 'substitute') then raise exception 'Invites may only assign player or substitute roles.'; end if;

  select tm.team_id into caller_team
  from public.team_members tm
  where tm.profile_id = auth.uid()
    and tm.role in ('captain', 'manager')
  limit 1;
  if caller_team is null then raise exception 'Only a captain or manager can invite players.'; end if;

  select p.id into target_profile
  from public.profiles p
  where lower(coalesce(p.username, '')) = lower(trim(leading '@' from target_identity))
     or lower(p.display_name) = lower(trim(target_identity))
  order by case when lower(coalesce(p.username, '')) = lower(trim(leading '@' from target_identity)) then 0 else 1 end
  limit 1;

  if target_profile is null then raise exception 'No Tru player was found with that username or display name.'; end if;
  if target_profile = auth.uid() then raise exception 'You cannot invite yourself.'; end if;
  if exists (select 1 from public.team_members where profile_id = target_profile) then
    raise exception 'That player is already on a team.';
  end if;

  insert into public.team_invites (team_id, invited_profile_id, invited_by, role, status)
  values (caller_team, target_profile, auth.uid(), target_role, 'pending')
  on conflict (team_id, invited_profile_id) do update set
    invited_by = excluded.invited_by,
    role = excluded.role,
    status = 'pending',
    created_at = now()
  returning * into saved;
  return saved;
end;
$$;

grant execute on function public.invite_player_to_my_team(text, public.team_member_role) to authenticated;

create or replace function public.respond_to_team_invite(
  target_invite uuid,
  accept_invite boolean
)
returns public.team_invites
language plpgsql
security definer
set search_path = public
as $$
declare
  selected public.team_invites;
begin
  select * into selected
  from public.team_invites
  where id = target_invite
    and invited_profile_id = auth.uid()
    and status = 'pending'
  for update;

  if selected.id is null then raise exception 'This invitation is no longer available.'; end if;

  if accept_invite then
    if exists (select 1 from public.team_members where profile_id = auth.uid()) then
      raise exception 'Leave your current team before accepting another invitation.';
    end if;
    insert into public.team_members (team_id, profile_id, role, is_active_lineup)
    values (
      selected.team_id,
      auth.uid(),
      case when selected.role in ('player', 'substitute') then selected.role else 'player' end,
      selected.role = 'player'
    );
    update public.team_invites set status = 'accepted' where id = selected.id returning * into selected;
    update public.team_invites
      set status = 'cancelled'
      where invited_profile_id = auth.uid()
        and id <> selected.id
        and status = 'pending';
  else
    update public.team_invites set status = 'declined' where id = selected.id returning * into selected;
  end if;
  return selected;
end;
$$;

grant execute on function public.respond_to_team_invite(uuid, boolean) to authenticated;

create or replace function public.leave_my_team()
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  membership public.team_members;
  team_owner uuid;
begin
  select * into membership
  from public.team_members
  where profile_id = auth.uid()
  limit 1;
  if membership.profile_id is null then raise exception 'You are not currently on a team.'; end if;

  select owner_id into team_owner from public.teams where id = membership.team_id;
  if team_owner = auth.uid() then
    raise exception 'The team owner cannot leave. Transfer ownership or delete the team first.';
  end if;

  if membership.role in ('captain', 'manager') and not exists (
    select 1 from public.team_members
    where team_id = membership.team_id
      and profile_id <> auth.uid()
      and role in ('captain', 'manager')
  ) then
    raise exception 'Assign another captain or manager before leaving.';
  end if;

  delete from public.team_members
  where team_id = membership.team_id and profile_id = auth.uid();
end;
$$;

grant execute on function public.leave_my_team() to authenticated;

drop policy if exists "Managers create invites" on public.team_invites;
drop policy if exists "Invitees update invites" on public.team_invites;

-- Writes go through the security-definer functions above.
