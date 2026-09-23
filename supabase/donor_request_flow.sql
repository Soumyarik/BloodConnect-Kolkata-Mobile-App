-- BloodConnect donor request flow
-- Run this migration once in the Supabase SQL Editor for the BloodConnect project.

create or replace function public.bc_compatible_donor_groups(recipient_group text)
returns text[]
language sql
immutable
as $$
  select case upper(trim(recipient_group))
    when 'O+' then array['O+', 'O-']
    when 'O-' then array['O-']
    when 'A+' then array['A+', 'A-', 'O+', 'O-']
    when 'A-' then array['A-', 'O-']
    when 'B+' then array['B+', 'B-', 'O+', 'O-']
    when 'B-' then array['B-', 'O-']
    when 'AB+' then array['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']
    when 'AB-' then array['A-', 'B-', 'AB-', 'O-']
    else array[upper(trim(recipient_group))]
  end;
$$;

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
set search_path = public
as $$
  select
    p.id,
    coalesce(p.full_name, 'BloodConnect Donor') as full_name,
    p.blood_group,
    coalesce(p.city, '') as city,
    coalesce(p.area, '') as area,
    p.donor_available
  from public.profiles p
  where p.id <> auth.uid()
    and p.donor_available = true
    and p.blood_group = any(p_blood_groups)
    and (
      p_city is null
      or p_city = ''
      or lower(coalesce(p.city, '')) = lower(p_city)
    )
  order by p.area nulls last, p.full_name;
$$;

create or replace function public.send_donor_request(
  p_request_id uuid,
  p_donor_id uuid
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_request public.blood_requests%rowtype;
  v_donor public.profiles%rowtype;
  v_existing public.donor_responses%rowtype;
  v_response_id uuid;
begin
  if auth.uid() is null then
    raise exception 'You must be signed in to send a donor request.';
  end if;

  select *
  into v_request
  from public.blood_requests
  where id = p_request_id
    and requester_id = auth.uid();

  if not found then
    raise exception 'Blood request not found or you are not the requester.';
  end if;

  if v_request.status in ('cancelled', 'fulfilled') then
    raise exception 'This blood request is no longer open.';
  end if;

  select *
  into v_donor
  from public.profiles
  where id = p_donor_id;

  if not found then
    raise exception 'Donor profile not found.';
  end if;

  if not coalesce(v_donor.donor_available, false) then
    raise exception 'This donor is not currently available.';
  end if;

  if not (
    v_donor.blood_group = any(public.bc_compatible_donor_groups(v_request.blood_group))
  ) then
    raise exception 'This donor is not compatible with the requested blood group.';
  end if;

  select *
  into v_existing
  from public.donor_responses
  where request_id = p_request_id
    and donor_id = p_donor_id;

  if found and v_existing.status = 'accepted' then
    return v_existing.id;
  end if;

  if found then
    update public.donor_responses
    set status = 'pending',
        responded_at = null
    where id = v_existing.id
    returning id into v_response_id;
  else
    insert into public.donor_responses (
      request_id,
      donor_id,
      status
    )
    values (
      p_request_id,
      p_donor_id,
      'pending'
    )
    returning id into v_response_id;
  end if;

  return v_response_id;
end;
$$;

create or replace function public.get_donor_inbox()
returns table(
  response_id uuid,
  request_id uuid,
  patient_name text,
  blood_group text,
  units_required integer,
  hospital_name text,
  city text,
  area text,
  required_date date,
  required_time time,
  is_emergency boolean,
  request_status text,
  response_status text,
  created_at timestamptz
)
language sql
security definer
set search_path = public
as $$
  select
    dr.id,
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
    dr.status,
    dr.created_at
  from public.donor_responses dr
  join public.blood_requests br on br.id = dr.request_id
  where dr.donor_id = auth.uid()
    and br.status <> 'cancelled'
  order by dr.created_at desc;
$$;

revoke all on function public.get_available_donors(text[], text) from public;
grant execute on function public.get_available_donors(text[], text) to authenticated;

revoke all on function public.send_donor_request(uuid, uuid) from public;
grant execute on function public.send_donor_request(uuid, uuid) to authenticated;

revoke all on function public.get_donor_inbox() from public;
grant execute on function public.get_donor_inbox() to authenticated;
