-- Show the patient name to authenticated donors who are compatible and in the
-- same city, without exposing other blood requests through direct table access.
create or replace function public.get_open_blood_requests_with_patient_for_donor()
returns table (
  id uuid,
  patient_name text,
  blood_group text,
  units_required integer,
  hospital_name text,
  city text,
  area text,
  required_date date,
  required_time time,
  is_emergency boolean,
  status text,
  created_at timestamptz
)
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  v_donor public.profiles%rowtype;
  v_recipient_groups text[];
  v_donor_city text;
begin
  if auth.uid() is null then
    raise exception 'You must be signed in to view open blood requests.';
  end if;

  select * into v_donor
  from public.profiles
  where profiles.id = auth.uid();

  if not found then
    return;
  end if;

  select array_agg(recipient_group)
  into v_recipient_groups
  from unnest(array['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']::text[]) as groups(recipient_group)
  where v_donor.blood_group = any(public.bc_compatible_donor_groups(recipient_group));

  v_donor_city := lower(trim(split_part(coalesce(nullif(trim(v_donor.city), ''), 'Kolkata'), ',', 1)));

  return query
  select
    br.id,
    br.patient_name,
    br.blood_group,
    br.units_required,
    br.hospital_name,
    br.city,
    br.area,
    br.required_date,
    br.required_time,
    br.is_emergency,
    br.status,
    br.created_at
  from public.blood_requests as br
  where br.status = 'open'
    and br.requester_id <> auth.uid()
    and lower(trim(split_part(br.city, ',', 1))) = v_donor_city
    and br.blood_group = any(coalesce(v_recipient_groups, array[]::text[]))
    and not exists (
      select 1
      from public.donor_responses as dr
      where dr.request_id = br.id
        and dr.donor_id = auth.uid()
        and dr.status in ('pending', 'accepted')
    )
  order by br.is_emergency desc, br.required_date asc nulls last, br.created_at desc;
end;
$$;

revoke all on function public.get_open_blood_requests_with_patient_for_donor() from public, anon;
grant execute on function public.get_open_blood_requests_with_patient_for_donor() to authenticated;
