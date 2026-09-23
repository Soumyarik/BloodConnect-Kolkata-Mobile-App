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


-- Post-acceptance donation workflow
-- The workflow keeps donor response status separate from the selected donor's
-- real-world donation progress. Medical screening/eligibility remain hospital decisions.

create table if not exists public.donation_workflows (
  id uuid primary key default gen_random_uuid(),
  request_id uuid not null unique references public.blood_requests(id) on delete cascade,
  donor_response_id uuid not null unique references public.donor_responses(id) on delete restrict,
  donor_id uuid not null references public.profiles(id) on delete restrict,
  stage text not null default 'accepted'
    check (stage = any (array[
      'accepted'::text,
      'coming_to_hospital'::text,
      'arrived'::text,
      'screening'::text,
      'eligible'::text,
      'donating'::text,
      'completed'::text
    ])),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  completed_at timestamptz
);

create table if not exists public.donation_workflow_events (
  id uuid primary key default gen_random_uuid(),
  workflow_id uuid not null references public.donation_workflows(id) on delete cascade,
  from_stage text,
  to_stage text not null,
  actor_id uuid not null references public.profiles(id) on delete restrict,
  created_at timestamptz not null default now()
);

create index if not exists donation_workflows_donor_id_idx
  on public.donation_workflows(donor_id);
create index if not exists donation_workflow_events_workflow_id_idx
  on public.donation_workflow_events(workflow_id, created_at);

alter table public.donation_workflows enable row level security;
alter table public.donation_workflow_events enable row level security;

drop policy if exists "Requesters and selected donors can view donation workflows" on public.donation_workflows;
create policy "Requesters and selected donors can view donation workflows"
on public.donation_workflows
for select
to authenticated
using (
  donor_id = auth.uid()
  or exists (
    select 1
    from public.blood_requests br
    where br.id = donation_workflows.request_id
      and br.requester_id = auth.uid()
  )
);

drop policy if exists "Requesters and selected donors can view workflow events" on public.donation_workflow_events;
create policy "Requesters and selected donors can view workflow events"
on public.donation_workflow_events
for select
to authenticated
using (
  exists (
    select 1
    from public.donation_workflows dw
    join public.blood_requests br on br.id = dw.request_id
    where dw.id = donation_workflow_events.workflow_id
      and (dw.donor_id = auth.uid() or br.requester_id = auth.uid())
  )
);

create or replace function public.select_donor_for_request(
  p_request_id uuid,
  p_donor_response_id uuid
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_request public.blood_requests%rowtype;
  v_response public.donor_responses%rowtype;
  v_existing public.donation_workflows%rowtype;
  v_workflow_id uuid;
begin
  if auth.uid() is null then
    raise exception 'You must be signed in.';
  end if;

  select * into v_request
  from public.blood_requests
  where id = p_request_id
    and requester_id = auth.uid();

  if not found then
    raise exception 'Blood request not found or you are not the requester.';
  end if;

  if v_request.status in ('cancelled', 'fulfilled') then
    raise exception 'This blood request is no longer active.';
  end if;

  select * into v_response
  from public.donor_responses
  where id = p_donor_response_id
    and request_id = p_request_id;

  if not found then
    raise exception 'Donor response not found for this request.';
  end if;

  if v_response.status <> 'accepted' then
    raise exception 'Only an accepted donor can be selected for the donation workflow.';
  end if;

  select * into v_existing
  from public.donation_workflows
  where request_id = p_request_id;

  if found then
    if v_existing.donor_response_id <> p_donor_response_id then
      raise exception 'A donor is already selected for this request.';
    end if;
    return v_existing.id;
  end if;

  insert into public.donation_workflows (
    request_id,
    donor_response_id,
    donor_id,
    stage
  )
  values (
    p_request_id,
    p_donor_response_id,
    v_response.donor_id,
    'accepted'
  )
  returning id into v_workflow_id;

  update public.blood_requests
  set status = 'matched',
      updated_at = now()
  where id = p_request_id;

  insert into public.donation_workflow_events (
    workflow_id,
    from_stage,
    to_stage,
    actor_id
  )
  values (
    v_workflow_id,
    null,
    'accepted',
    auth.uid()
  );

  return v_workflow_id;
end;
$$;

create or replace function public.advance_donation_workflow(
  p_workflow_id uuid,
  p_next_stage text
)
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  v_workflow public.donation_workflows%rowtype;
  v_request public.blood_requests%rowtype;
  v_allowed boolean := false;
  v_is_requester boolean := false;
  v_is_donor boolean := false;
begin
  if auth.uid() is null then
    raise exception 'You must be signed in.';
  end if;

  select * into v_workflow
  from public.donation_workflows
  where id = p_workflow_id
  for update;

  if not found then
    raise exception 'Donation workflow not found.';
  end if;

  select * into v_request
  from public.blood_requests
  where id = v_workflow.request_id;

  if not found then
    raise exception 'Blood request not found.';
  end if;

  if v_request.status = 'cancelled' then
    raise exception 'This blood request has been cancelled.';
  end if;

  if v_workflow.stage = 'completed' then
    raise exception 'Donation workflow is already completed.';
  end if;

  v_is_requester := v_request.requester_id = auth.uid();
  v_is_donor := v_workflow.donor_id = auth.uid();

  v_allowed :=
    (v_workflow.stage = 'accepted' and p_next_stage = 'coming_to_hospital' and v_is_donor)
    or (v_workflow.stage = 'coming_to_hospital' and p_next_stage = 'arrived' and v_is_donor)
    or (v_workflow.stage = 'arrived' and p_next_stage = 'screening' and v_is_requester)
    or (v_workflow.stage = 'screening' and p_next_stage = 'eligible' and v_is_requester)
    or (v_workflow.stage = 'eligible' and p_next_stage = 'donating' and v_is_donor)
    or (v_workflow.stage = 'donating' and p_next_stage = 'completed' and (v_is_donor or v_is_requester));

  if not v_allowed then
    raise exception 'This workflow step is not available for your role or the current stage.';
  end if;

  update public.donation_workflows
  set stage = p_next_stage,
      updated_at = now(),
      completed_at = case when p_next_stage = 'completed' then now() else completed_at end
  where id = p_workflow_id;

  insert into public.donation_workflow_events (
    workflow_id,
    from_stage,
    to_stage,
    actor_id
  )
  values (
    p_workflow_id,
    v_workflow.stage,
    p_next_stage,
    auth.uid()
  );

  if p_next_stage = 'completed' then
    update public.blood_requests
    set status = 'fulfilled',
        updated_at = now()
    where id = v_workflow.request_id;
  end if;

  return p_next_stage;
end;
$$;

revoke all on function public.select_donor_for_request(uuid, uuid) from public;
grant execute on function public.select_donor_for_request(uuid, uuid) to authenticated;

revoke all on function public.advance_donation_workflow(uuid, text) from public;
grant execute on function public.advance_donation_workflow(uuid, text) to authenticated;
