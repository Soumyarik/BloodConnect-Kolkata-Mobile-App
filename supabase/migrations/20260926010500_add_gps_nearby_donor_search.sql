create or replace function public.get_available_donors_with_nearby(
  p_blood_groups text[],
  p_city text default 'Kolkata',
  p_user_lat double precision default null,
  p_user_lng double precision default null,
  p_nearby_km double precision default 5
)
returns table(
  id uuid,
  full_name text,
  blood_group text,
  city text,
  area text,
  phone text,
  donor_available boolean,
  is_nearby boolean
)
language sql
security definer
set search_path to ''
as $function$
  select
    p.id,
    coalesce(p.full_name, 'BloodConnect Donor') as full_name,
    p.blood_group,
    coalesce(p.city, '') as city,
    coalesce(p.area, '') as area,
    coalesce(p.phone, '') as phone,
    p.donor_available,
    case
      when p_user_lat is null
        or p_user_lng is null
        or p.latitude is null
        or p.longitude is null
        or p_nearby_km is null
      then false
      else (
        2 * 6371.0 * asin(
          sqrt(
            power(sin(radians(p.latitude - p_user_lat) / 2), 2)
            + cos(radians(p_user_lat))
              * cos(radians(p.latitude))
              * power(sin(radians(p.longitude - p_user_lng) / 2), 2)
          )
        )
      ) <= greatest(p_nearby_km, 0)
    end as is_nearby
  from public.profiles p
  where auth.uid() is not null
    and p.id <> auth.uid()
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
      or lower(trim(split_part(coalesce(nullif(p.city, ''), p_city, ''), ',', 1))) =
         lower(trim(split_part(coalesce(p_city, ''), ',', 1)))
    )
  order by is_nearby desc, p.area nulls last, p.full_name;
$function$;