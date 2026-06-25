alter table public.plant_events
add column if not exists event_data jsonb;
