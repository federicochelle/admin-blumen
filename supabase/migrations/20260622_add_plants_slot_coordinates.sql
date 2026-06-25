alter table public.plants
add column if not exists row_index integer,
add column if not exists column_index integer;

alter table public.plants
drop constraint if exists plants_bed_id_row_index_column_index_key;

alter table public.plants
add constraint plants_bed_id_row_index_column_index_key
unique (bed_id, row_index, column_index);
