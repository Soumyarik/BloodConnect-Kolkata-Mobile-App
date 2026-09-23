-- Narrow donor feed: return only the fields donors need before responding.
-- SECURITY DEFINER is required because blood_requests RLS intentionally hides
-- requests from users who are neither the requester nor an accepted donor.
create or replace function public.get_open_blood_requests_for_donor()
returns table (
  id uuid,
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

  if coalesce(trim(v_donor.city), '') = '' then
    v_donor.city := 'Kolkata';
  end if;

  return query
  select
    br.id,
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
    and lower(trim(br.city)) = lower(trim(v_donor.city))
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

revoke all on function public.get_open_blood_requests_for_donor() from public, anon;
grant execute on function public.get_open_blood_requests_for_donor() to authenticated;

-- A donor can volunteer directly from the open feed. The request row lock
-- serializes this with requester-side donor selection/cancellation updates.
create or replace function public.respond_to_open_blood_request(p_request_id uuid)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_donor_id uuid := auth.uid();
  v_donor public.profiles%rowtype;
  v_request public.blood_requests%rowtype;
  v_response public.donor_responses%rowtype;
  v_response_id uuid;
  v_compatible boolean;
begin
  if v_donor_id is null then
    raise exception 'You must be signed in to respond to a blood request.';
  end if;

  select * into v_donor
  from public.profiles
  where profiles.id = v_donor_id;

  if not found then
    raise exception 'Your donor profile could not be found.';
  end if;

  select * into v_request
  from public.blood_requests
  where blood_requests.id = p_request_id
  for update;

  if not found or v_request.requester_id = v_donor_id then
    raise exception 'Open blood request not found.';
  end if;

  if v_request.status <> 'open' then
    raise exception 'This blood request is no longer open.';
  end if;

  if lower(trim(v_request.city)) <> lower(trim(coalesce(nullif(trim(v_donor.city), ''), 'Kolkata'))) then
    raise exception 'This blood request is outside your city.';
  end if;

  select exists (
    select 1
    from unnest(array['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']::text[]) as groups(recipient_group)
    where groups.recipient_group = v_request.blood_group
      and v_donor.blood_group = any(public.bc_compatible_donor_groups(groups.recipient_group))
  ) into v_compatible;

  if not coalesce(v_compatible, false) then
    raise exception 'Your blood group is not compatible with this request.';
  end if;

  select * into v_response
  from public.donor_responses
  where donor_responses.request_id = p_request_id
    and donor_responses.donor_id = v_donor_id
  for update;

  if found and v_response.status = 'accepted' then
    return v_response.id;
  elsif found then
    update public.donor_responses
    set status = 'accepted', responded_at = now()
    where donor_responses.id = v_response.id
    returning donor_responses.id into v_response_id;
  else
    insert into public.donor_responses (request_id, donor_id, status, responded_at)
    values (p_request_id, v_donor_id, 'accepted', now())
    returning donor_responses.id into v_response_id;
  end if;

  perform public.bc_create_notification(
    v_request.requester_id,
    'donor_response_accepted',
    'A donor can help',
    'A compatible donor volunteered for your open blood request.',
    v_request.id,
    v_response_id
  );

  return v_response_id;
end;
$$;

revoke all on function public.respond_to_open_blood_request(uuid) from public, anon;
grant execute on function public.respond_to_open_blood_request(uuid) to authenticated;
