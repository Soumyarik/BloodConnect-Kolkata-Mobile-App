-- Limit donor directory queries to a matching open request owned by the caller.
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
    p.donor_available
  from public.profiles as p
  where p.id <> auth.uid()
    and p.donor_available = true
    and p.blood_group = any(p_blood_groups)
    and lower(trim(split_part(coalesce(p.city, ''), ',', 1))) =
        lower(trim(split_part(coalesce(p_city, ''), ',', 1)))
    and exists (
      select 1
      from public.blood_requests as br
      where br.requester_id = auth.uid()
        and br.status = 'open'
        and p_blood_groups = public.bc_compatible_donor_groups(br.blood_group)
        and lower(trim(split_part(br.city, ',', 1))) =
            lower(trim(split_part(coalesce(p_city, ''), ',', 1)))
    )
  order by p.area nulls last, p.full_name;
$$;

revoke all on function public.get_available_donors(text[], text) from public, anon;
grant execute on function public.get_available_donors(text[], text) to authenticated;

-- This helper is only for other trusted database functions. Authenticated users
-- must not be able to create arbitrary notifications for other accounts.
revoke all on function public.bc_create_notification(uuid, text, text, text, uuid, uuid)
  from public, anon, authenticated;
