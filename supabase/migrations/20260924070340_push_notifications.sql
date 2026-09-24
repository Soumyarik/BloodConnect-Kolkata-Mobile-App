create table public.device_push_tokens (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  expo_push_token text not null unique,
  platform text not null check (platform in ('ios', 'android')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index device_push_tokens_user_id_idx on public.device_push_tokens(user_id);
alter table public.device_push_tokens enable row level security;

create policy device_push_tokens_select_own on public.device_push_tokens
  for select to authenticated using (user_id = (select auth.uid()));
create policy device_push_tokens_insert_own on public.device_push_tokens
  for insert to authenticated with check (user_id = (select auth.uid()));
create policy device_push_tokens_update_own on public.device_push_tokens
  for update to authenticated using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));
create policy device_push_tokens_delete_own on public.device_push_tokens
  for delete to authenticated using (user_id = (select auth.uid()));

create or replace function public.get_blood_request_push_targets(p_request_id uuid)
returns table (expo_push_token text, blood_group text, city text)
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  v_request public.blood_requests%rowtype;
begin
  if auth.uid() is null then raise exception 'You must be signed in.'; end if;

  select * into v_request from public.blood_requests where id = p_request_id;
  if not found or v_request.requester_id <> auth.uid() then
    raise exception 'Blood request not found or you are not the requester.';
  end if;
  if v_request.status <> 'open' then
    raise exception 'This blood request is no longer open.';
  end if;

  return query
  select token.expo_push_token, v_request.blood_group, v_request.city
  from public.profiles as donor
  join public.device_push_tokens as token on token.user_id = donor.id
  where donor.id <> auth.uid()
    and donor.donor_available = true
    and donor.blood_group = any(public.bc_compatible_donor_groups(v_request.blood_group))
    and lower(trim(split_part(coalesce(nullif(trim(donor.city), ''), 'Kolkata'), ',', 1))) =
        lower(trim(split_part(v_request.city, ',', 1)));
end;
$$;

create or replace function public.get_workflow_push_targets(p_workflow_id uuid)
returns table (expo_push_token text, request_id uuid, title text, message text)
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  v_workflow public.donation_workflows%rowtype;
  v_requester_id uuid;
  v_recipient_id uuid;
begin
  if auth.uid() is null then raise exception 'You must be signed in.'; end if;
  select * into v_workflow from public.donation_workflows where id = p_workflow_id;
  if not found then raise exception 'Donation workflow not found.'; end if;
  select requester_id into v_requester_id from public.blood_requests where id = v_workflow.request_id;
  if auth.uid() = v_workflow.donor_id then
    v_recipient_id := v_requester_id;
  elsif auth.uid() = v_requester_id then
    v_recipient_id := v_workflow.donor_id;
  else
    raise exception 'Only participants can notify each other about this workflow.';
  end if;

  return query
  select token.expo_push_token, v_workflow.request_id,
    case v_workflow.stage
      when 'accepted' then 'You were selected as the donor'
      when 'coming_to_hospital' then 'Donor is on the way'
      when 'arrived' then 'Donor arrived at hospital'
      when 'screening' then 'Medical screening started'
      when 'eligible' then 'Hospital confirmed donor eligibility'
      when 'donating' then 'Donation is in progress'
      when 'completed' then 'Donation completed'
      else 'Donation workflow updated'
    end,
    case v_workflow.stage
      when 'accepted' then 'You were selected to donate. Open BloodConnect to view the donation progress.'
      when 'coming_to_hospital' then 'The selected donor has started travelling to the hospital.'
      when 'arrived' then 'The donor has reported arrival at the hospital.'
      when 'screening' then 'Medical screening has started.'
      when 'eligible' then 'Hospital staff confirmed the donor is eligible.'
      when 'donating' then 'Donation is in progress.'
      when 'completed' then 'The donation was reported complete.'
      else 'The donation workflow has changed.'
    end
  from public.device_push_tokens as token
  where token.user_id = v_recipient_id;
end;
$$;

revoke all on function public.get_blood_request_push_targets(uuid) from public, anon;
revoke all on function public.get_workflow_push_targets(uuid) from public, anon;
grant execute on function public.get_blood_request_push_targets(uuid) to authenticated;
grant execute on function public.get_workflow_push_targets(uuid) to authenticated;
