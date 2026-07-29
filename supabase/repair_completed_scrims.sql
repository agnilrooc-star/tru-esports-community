-- Repairs matches whose ELO was processed but whose room was later changed
-- back to "live" by an already-open browser session.
update public.scrims as s
set status = 'completed'
where exists (
  select 1
  from public.match_results as r
  where r.scrim_id = s.id
    and r.elo_processed = true
)
and s.status <> 'completed';
