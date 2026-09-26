alter table public.profiles
  add column if not exists state text;

create index if not exists profiles_state_city_idx
  on public.profiles (state, city);
