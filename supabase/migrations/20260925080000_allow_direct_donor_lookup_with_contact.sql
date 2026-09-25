-- Allow authenticated users to browse available donors of any blood group in their city,
-- returning contact information (phone) so users can contact nearby donors directly.

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
  from public.profiles as p
  where p.id <> auth.uid()
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
         lower(trim(split_part(p_city, ',', 1)))
      or lower(coalesce(p.city, '')) like '%' || lower(trim(split_part(p_city, ',', 1))) || '%'
    )
  order by
    case when p.phone is not null and p.phone <> '' then 0 else 1 end,
    p.area nulls last,
    p.full_name;
$$;

revoke all on function public.get_available_donors(text[], text) from public, anon;
grant execute on function public.get_available_donors(text[], text) to authenticated;

-- Also allow authenticated users to view profiles of available donors directly
drop policy if exists "profiles_select_available_donors" on public.profiles;
create policy "profiles_select_available_donors"
on public.profiles for select
to authenticated
using (donor_available = true or id = auth.uid());
