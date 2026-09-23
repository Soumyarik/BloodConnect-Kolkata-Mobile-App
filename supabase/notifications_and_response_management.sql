-- BloodConnect notifications and donor response management
-- Already applied to the connected Supabase project.
-- Keep this file in the repository as the migration source of truth.

create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  type text not null,
  title text not null,
  message text not null,
  request_id uuid references public.blood_requests(id) on delete cascade,
  response_id uuid references public.donor_responses(id) on delete set null,
  read_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists notifications_user_created_idx
  on public.notifications(user_id, created_at desc);

create index if not exists notifications_user_unread_idx
  on public.notifications(user_id)
  where read_at is null;

alter table public.notifications enable row level security;

drop policy if exists "Users can view own notifications" on public.notifications;
create policy "Users can view own notifications"
on public.notifications for select to authenticated
using (user_id = auth.uid());

drop policy if exists "Users can mark own notifications read" on public.notifications;
create policy "Users can mark own notifications read"
on public.notifications for update to authenticated
using (user_id = auth.uid())
with check (user_id = auth.uid());

create or replace function public.bc_create_notification(
  p_user_id uuid,
  p_type text,
  p_title text,
  p_message text,
  p_request_id uuid default null,
  p_response_id uuid default null
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_id uuid;
begin
  if p_user_id is null then return null; end if;

  insert into public.notifications (
    user_id, type, title, message, request_id, response_id
  )
  values (
    p_user_id, p_type, p_title, p_message, p_request_id, p_response_id
  )
  returning id into v_id;

  return v_id;
end;
$$;

create or replace function public.respond_to_donor_request(
  p_response_id uuid,
  p_status text
)
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  v_response public.donor_responses%rowtype;
  v_request public.blood_requests%rowtype;
  v_donor public.profiles%rowtype;
begin
  if auth.uid() is null then raise exception 'You must be signed in.'; end if;
  if p_status not in ('accepted', 'declined') then raise exception 'Invalid response status.'; end if;

  select * into v_response
  from public.donor_responses
  where id = p_response_id and donor_id = auth.uid()
  for update;

  if not found then raise exception 'Donor request not found.'; end if;
  if v_response.status <> 'pending' then raise exception 'This donor request has already been answered.'; end if;

  select * into v_request from public.blood_requests where id = v_response.request_id;
  if not found or v_request.status in ('cancelled', 'fulfilled') then
    raise exception 'This blood request is no longer active.';
  end if;

  select * into v_donor from public.profiles where id = auth.uid();

  update public.donor_responses
  set status = p_status, responded_at = now()
  where id = p_response_id;

  perform public.bc_create_notification(
    v_request.requester_id,
    case when p_status = 'accepted' then 'donor_response_accepted' else 'donor_response_declined' end,
    case when p_status = 'accepted' then 'Donor accepted your request' else 'Donor declined your request' end,
    case
      when p_status = 'accepted'
        then coalesce(v_donor.full_name, 'A donor') || ' accepted the blood-help request. You can now select an accepted donor.'
      else coalesce(v_donor.full_name, 'A donor') || ' is unavailable for this request.'
    end,
    v_request.id,
    v_response.id
  );

  return p_status;
end;
$$;

create or replace function public.withdraw_donor_response(p_response_id uuid)
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  v_response public.donor_responses%rowtype;
  v_request public.blood_requests%rowtype;
  v_donor public.profiles%rowtype;
begin
  if auth.uid() is null then raise exception 'You must be signed in.'; end if;

  select * into v_response
  from public.donor_responses
  where id = p_response_id and donor_id = auth.uid()
  for update;

  if not found then raise exception 'Donor response not found.'; end if;
  if v_response.status <> 'accepted' then raise exception 'Only an accepted response can be withdrawn.'; end if;

  if exists (select 1 from public.donation_workflows where donor_response_id = v_response.id) then
    raise exception 'This donor is already in the donation workflow and cannot withdraw here.';
  end if;

  select * into v_request from public.blood_requests where id = v_response.request_id;
  select * into v_donor from public.profiles where id = auth.uid();

  update public.donor_responses
  set status = 'withdrawn', responded_at = now()
  where id = p_response_id;

  perform public.bc_create_notification(
    v_request.requester_id,
    'donor_response_withdrawn',
    'Donor withdrew from the request',
    coalesce(v_donor.full_name, 'A donor') || ' withdrew their acceptance. You can choose another accepted donor.',
    v_request.id,
    v_response.id
  );

  return 'withdrawn';
end;
$$;

-- The existing donor request, donor selection and workflow RPCs should also
-- emit notifications. The live versions are defined in the Supabase project
-- and in supabase/donor_request_flow.sql.

revoke all on function public.bc_create_notification(uuid, text, text, text, uuid, uuid) from public, anon;
revoke all on function public.respond_to_donor_request(uuid, text) from public, anon;
revoke all on function public.withdraw_donor_response(uuid) from public, anon;

grant execute on function public.respond_to_donor_request(uuid, text) to authenticated;
grant execute on function public.withdraw_donor_response(uuid) to authenticated;

do $$
begin
  if not exists (
    select 1
    from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'notifications'
  ) then
    execute 'alter publication supabase_realtime add table public.notifications';
  end if;
end
$$;


-- Re-define the existing workflow RPCs so future migrations also contain the
-- same notification behavior that is already deployed.

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

  select * into v_request
  from public.blood_requests
  where id = p_request_id and requester_id = auth.uid();

  if not found then raise exception 'Blood request not found or you are not the requester.'; end if;
  if v_request.status in ('cancelled', 'fulfilled') then raise exception 'This blood request is no longer open.'; end if;

  select * into v_donor from public.profiles where id = p_donor_id;
  if not found then raise exception 'Donor profile not found.'; end if;
  if not coalesce(v_donor.donor_available, false) then raise exception 'This donor is not currently available.'; end if;
  if not (v_donor.blood_group = any(public.bc_compatible_donor_groups(v_request.blood_group))) then
    raise exception 'This donor is not compatible with the requested blood group.';
  end if;

  select * into v_existing
  from public.donor_responses
  where request_id = p_request_id and donor_id = p_donor_id;

  if found and v_existing.status = 'accepted' then return v_existing.id; end if;

  if found then
    update public.donor_responses
    set status = 'pending', responded_at = null
    where id = v_existing.id
    returning id into v_response_id;
  else
    insert into public.donor_responses (request_id, donor_id, status)
    values (p_request_id, p_donor_id, 'pending')
    returning id into v_response_id;
  end if;

  perform public.bc_create_notification(
    p_donor_id,
    'donor_request',
    'New blood-help request',
    'You have a compatible blood-help request in ' || coalesce(v_request.city, 'Kolkata') || '. Open Requests to respond.',
    v_request.id,
    v_response_id
  );

  return v_response_id;
end;
$$;

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
  if auth.uid() is null then raise exception 'You must be signed in.'; end if;

  select * into v_request
  from public.blood_requests
  where id = p_request_id and requester_id = auth.uid();

  if not found then raise exception 'Blood request not found or you are not the requester.'; end if;
  if v_request.status in ('cancelled', 'fulfilled') then raise exception 'This blood request is no longer active.'; end if;

  select * into v_response
  from public.donor_responses
  where id = p_donor_response_id and request_id = p_request_id;

  if not found then raise exception 'Donor response not found for this request.'; end if;
  if v_response.status <> 'accepted' then raise exception 'Only an accepted donor can be selected for the donation workflow.'; end if;

  select * into v_existing from public.donation_workflows where request_id = p_request_id;

  if found then
    if v_existing.donor_response_id <> p_donor_response_id then
      raise exception 'A donor is already selected for this request.';
    end if;
    return v_existing.id;
  end if;

  insert into public.donation_workflows (request_id, donor_response_id, donor_id, stage)
  values (p_request_id, p_donor_response_id, v_response.donor_id, 'accepted')
  returning id into v_workflow_id;

  update public.blood_requests
  set status = 'matched', updated_at = now()
  where id = p_request_id;

  insert into public.donation_workflow_events (workflow_id, from_stage, to_stage, actor_id)
  values (v_workflow_id, null, 'accepted', auth.uid());

  perform public.bc_create_notification(
    v_response.donor_id,
    'donor_selected',
    'You were selected as the donor',
    'You were selected for the blood request. Use the donation progress card to update your status.',
    p_request_id,
    p_donor_response_id
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
  v_title text;
  v_message text;
begin
  if auth.uid() is null then raise exception 'You must be signed in.'; end if;

  select * into v_workflow
  from public.donation_workflows
  where id = p_workflow_id
  for update;

  if not found then raise exception 'Donation workflow not found.'; end if;

  select * into v_request from public.blood_requests where id = v_workflow.request_id;
  if not found then raise exception 'Blood request not found.'; end if;
  if v_request.status = 'cancelled' then raise exception 'This blood request has been cancelled.'; end if;
  if v_workflow.stage = 'completed' then raise exception 'Donation workflow is already completed.'; end if;

  v_is_requester := v_request.requester_id = auth.uid();
  v_is_donor := v_workflow.donor_id = auth.uid();

  v_allowed :=
    (v_workflow.stage = 'accepted' and p_next_stage = 'coming_to_hospital' and v_is_donor)
    or (v_workflow.stage = 'coming_to_hospital' and p_next_stage = 'arrived' and v_is_donor)
    or (v_workflow.stage = 'arrived' and p_next_stage = 'screening' and v_is_requester)
    or (v_workflow.stage = 'screening' and p_next_stage = 'eligible' and v_is_requester)
    or (v_workflow.stage = 'eligible' and p_next_stage = 'donating' and v_is_donor)
    or (v_workflow.stage = 'donating' and p_next_stage = 'completed' and (v_is_donor or v_is_requester));

  if not v_allowed then raise exception 'This workflow step is not available for your role or the current stage.'; end if;

  update public.donation_workflows
  set stage = p_next_stage,
      updated_at = now(),
      completed_at = case when p_next_stage = 'completed' then now() else completed_at end
  where id = p_workflow_id;

  insert into public.donation_workflow_events (workflow_id, from_stage, to_stage, actor_id)
  values (p_workflow_id, v_workflow.stage, p_next_stage, auth.uid());

  v_title := case p_next_stage
    when 'coming_to_hospital' then 'Donor is on the way'
    when 'arrived' then 'Donor arrived at hospital'
    when 'screening' then 'Medical screening started'
    when 'eligible' then 'Hospital confirmed donor eligibility'
    when 'donating' then 'Donation is in progress'
    when 'completed' then 'Donation completed'
    else 'Donation workflow updated'
  end;

  v_message := case p_next_stage
    when 'coming_to_hospital' then 'The selected donor has started travelling to the hospital.'
    when 'arrived' then 'The selected donor reported arrival at the hospital.'
    when 'screening' then 'The requester reported that hospital medical screening has started.'
    when 'eligible' then 'The requester reported hospital confirmation of donor eligibility.'
    when 'donating' then 'The selected donor reported that donation is in progress.'
    when 'completed' then 'The donation was reported completed. Hospital records remain the source of truth.'
    else 'The donation workflow has changed.'
  end;

  perform public.bc_create_notification(
    case when v_is_donor then v_request.requester_id else v_workflow.donor_id end,
    'workflow_' || p_next_stage,
    v_title,
    v_message,
    v_request.id,
    v_workflow.donor_response_id
  );

  return p_next_stage;
end;
$$;

revoke all on function public.send_donor_request(uuid, uuid) from public, anon;
revoke all on function public.select_donor_for_request(uuid, uuid) from public, anon;
revoke all on function public.advance_donation_workflow(uuid, text) from public, anon;

grant execute on function public.send_donor_request(uuid, uuid) to authenticated;
grant execute on function public.select_donor_for_request(uuid, uuid) to authenticated;
grant execute on function public.advance_donation_workflow(uuid, text) to authenticated;
