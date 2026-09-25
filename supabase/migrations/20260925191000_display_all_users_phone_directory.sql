-- Ensure Find Donor directory displays all registered users, their phone numbers, and coordinates for proximity sorting.
-- Supports 'ALL' or specific blood groups and returns contact phone numbers and lat/lon for distance calculation.

drop function if exists public.get_available_donors(text[], text);

create or replace function public.get_available_donors(
  p_blood_groups text[],
  p_city text default ''
)
returns table(
  id uuid,
  full_name text,
  blood_group text,
  city text,
  area text,
  phone text,
  donor_available boolean,
  latitude double precision,
  longitude double precision
)
language sql
security definer
set search_path to ''
as $function$
  select
    p.id,
    coalesce(nullif(trim(p.full_name), ''), 'BloodConnect Donor') as full_name,
    coalesce(nullif(trim(p.blood_group), ''), 'Unknown') as blood_group,
    coalesce(p.city, 'Kolkata') as city,
    coalesce(p.area, '') as area,
    coalesce(p.phone, '') as phone,
    coalesce(p.donor_available, true) as donor_available,
    p.latitude,
    p.longitude
  from public.profiles p
  where coalesce(p.is_test_account, false) = false
    and p.blood_group is not null
    and (
      p_blood_groups is null
      or cardinality(p_blood_groups) = 0
      or p.blood_group = any(p_blood_groups)
    )
    and (
      p_city is null
      or trim(p_city) = ''
      or lower(trim(split_part(coalesce(nullif(p.city, ''), p_city, ''), ',', 1))) =
         lower(trim(split_part(coalesce(p_city, ''), ',', 1)))
      or lower(coalesce(p.city, '')) like '%' || lower(trim(split_part(coalesce(p_city, ''), ',', 1))) || '%'
    )
  order by
    case when p.phone is not null and trim(p.phone) <> '' then 0 else 1 end,
    case when p.donor_available = true then 0 else 1 end,
    p.area nulls last,
    p.full_name;
$function$;

revoke all on function public.get_available_donors(text[], text) from public, anon;
grant execute on function public.get_available_donors(text[], text) to authenticated;
