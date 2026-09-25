-- Fix Find Donor directory to use live profiles without test data or request hacks.
-- A donor must explicitly be available and must have a matching city.
-- Test accounts can be flagged with profiles.is_test_account=true.

alter table public.profiles
  add column if not exists is_test_account boolean not null default false;

drop function if exists public.get_available_donors(text[], text);

create or replace function public.get_available_donors(
  p_blood_groups text[],
  p_city text default 'Kolkata'
)
returns table(
  id uuid,
  full_name text,
  blood_group text,
  city text,
  area text,
  phone text,
  donor_available boolean
)
language sql
security definer
set search_path = ''
as $$
  select
    p.id,
    coalesce(p.full_name, 'BloodConnect Donor') as full_name,
    p.blood_group,
    coalesce(p.city, '') as city,
    coalesce(p.area, '') as area,
    coalesce(p.phone, '') as phone,
    p.donor_available
  from public.profiles p
  where p.id <> auth.uid()
    and coalesce(p.is_test_account, false) = false
    and p.donor_available = true
    and (
      p_blood_groups is null
      or cardinality(p_blood_groups) = 0
      or p.blood_group = any(p_blood_groups)
    )
    and (
      p_city is null
      or trim(p_city) = ''
      or lower(trim(split_part(coalesce(p.city, ''), ',', 1))) =
         lower(trim(split_part(coalesce(p_city, ''), ',', 1)))
    )
  order by p.area nulls last, p.full_name;
$$;

revoke all on function public.get_available_donors(text[], text) from public, anon;
grant execute on function public.get_available_donors(text[], text) to authenticated;
