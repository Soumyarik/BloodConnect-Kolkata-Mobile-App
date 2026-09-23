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
