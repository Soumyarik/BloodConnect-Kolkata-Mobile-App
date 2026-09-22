create extension if not exists pgcrypto;

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text,
  phone text,
  blood_group text,
  date_of_birth date,
  gender text,
  city text,
  area text,
  latitude double precision,
  longitude double precision,
  donor_available boolean not null default false,
  emergency_contact_name text,
  emergency_contact_phone text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint profiles_blood_group_check check (blood_group is null or blood_group in ('A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'))
);

create table public.blood_requests (
  id uuid primary key default gen_random_uuid(),
  requester_id uuid not null references public.profiles (id) on delete cascade,
  patient_name text not null,
  blood_group text not null,
  units_required integer not null default 1 check (units_required > 0),
  hospital_name text not null,
  hospital_address text,
  city text not null,
  area text,
  latitude double precision,
  longitude double precision,
  required_date date,
  required_time time,
  is_emergency boolean not null default false,
  contact_phone text not null,
  status text not null default 'open' check (status in ('open', 'matched', 'fulfilled', 'cancelled')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint blood_requests_blood_group_check check (blood_group in ('A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'))
);

create table public.donor_responses (
  id uuid primary key default gen_random_uuid(),
  request_id uuid not null references public.blood_requests (id) on delete cascade,
  donor_id uuid not null references public.profiles (id) on delete cascade,
  status text not null default 'pending' check (status in ('pending', 'accepted', 'declined', 'withdrawn')),
  responded_at timestamptz,
  created_at timestamptz not null default now(),
  constraint donor_responses_unique_donor_request unique (request_id, donor_id)
);

create table public.emergency_contacts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  name text not null,
  phone text not null,
  relationship text not null,
  created_at timestamptz not null default now()
);

create table public.donation_history (
  id uuid primary key default gen_random_uuid(),
  donor_id uuid not null references public.profiles (id) on delete cascade,
  donation_date date not null,
  hospital_name text not null,
  blood_group text,
  notes text,
  created_at timestamptz not null default now(),
  constraint donation_history_blood_group_check check (blood_group is null or blood_group in ('A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'))
);

create index profiles_blood_group_idx on public.profiles (blood_group);
create index profiles_city_idx on public.profiles (city);
create index profiles_donor_available_idx on public.profiles (donor_available);
create index blood_requests_blood_group_idx on public.blood_requests (blood_group);
create index blood_requests_city_idx on public.blood_requests (city);
create index blood_requests_status_idx on public.blood_requests (status);
create index blood_requests_requester_id_idx on public.blood_requests (requester_id);
create index donor_responses_request_id_idx on public.donor_responses (request_id);
create index donor_responses_donor_id_idx on public.donor_responses (donor_id);
create index emergency_contacts_user_id_idx on public.emergency_contacts (user_id);
create index donation_history_donor_id_idx on public.donation_history (donor_id);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
security invoker
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_set_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();

create trigger blood_requests_set_updated_at
before update on public.blood_requests
for each row execute function public.set_updated_at();

create or replace function public.is_request_owner(request_uuid uuid)
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.blood_requests
    where id = request_uuid
      and requester_id = (select auth.uid())
  );
$$;

create or replace function public.is_accepted_donor(request_uuid uuid)
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.donor_responses
    where request_id = request_uuid
      and donor_id = (select auth.uid())
      and status = 'accepted'
  );
$$;

revoke execute on function public.is_request_owner(uuid) from public;
revoke execute on function public.is_accepted_donor(uuid) from public;
grant execute on function public.is_request_owner(uuid) to authenticated;
grant execute on function public.is_accepted_donor(uuid) to authenticated;

alter table public.profiles enable row level security;
alter table public.blood_requests enable row level security;
alter table public.donor_responses enable row level security;
alter table public.emergency_contacts enable row level security;
alter table public.donation_history enable row level security;

create policy profiles_select_own
on public.profiles for select
to authenticated
using (id = (select auth.uid()));

create policy profiles_insert_own
on public.profiles for insert
to authenticated
with check (id = (select auth.uid()));

create policy profiles_update_own
on public.profiles for update
to authenticated
using (id = (select auth.uid()))
with check (id = (select auth.uid()));

create policy profiles_delete_own
on public.profiles for delete
to authenticated
using (id = (select auth.uid()));

create policy blood_requests_select_authorized
on public.blood_requests for select
to authenticated
using (
  requester_id = (select auth.uid())
  or public.is_accepted_donor(id)
);

create policy blood_requests_insert_own
on public.blood_requests for insert
to authenticated
with check (requester_id = (select auth.uid()));

create policy blood_requests_update_own
on public.blood_requests for update
to authenticated
using (requester_id = (select auth.uid()))
with check (requester_id = (select auth.uid()));

create policy blood_requests_delete_own
on public.blood_requests for delete
to authenticated
using (requester_id = (select auth.uid()));

create policy donor_responses_select_authorized
on public.donor_responses for select
to authenticated
using (
  donor_id = (select auth.uid())
  or public.is_request_owner(request_id)
);

create policy donor_responses_insert_own
on public.donor_responses for insert
to authenticated
with check (donor_id = (select auth.uid()));

create policy donor_responses_update_own
on public.donor_responses for update
to authenticated
using (donor_id = (select auth.uid()))
with check (donor_id = (select auth.uid()));

create policy donor_responses_delete_own
on public.donor_responses for delete
to authenticated
using (donor_id = (select auth.uid()));

create policy emergency_contacts_select_own
on public.emergency_contacts for select
to authenticated
using (user_id = (select auth.uid()));

create policy emergency_contacts_insert_own
on public.emergency_contacts for insert
to authenticated
with check (user_id = (select auth.uid()));

create policy emergency_contacts_update_own
on public.emergency_contacts for update
to authenticated
using (user_id = (select auth.uid()))
with check (user_id = (select auth.uid()));

create policy emergency_contacts_delete_own
on public.emergency_contacts for delete
to authenticated
using (user_id = (select auth.uid()));

create policy donation_history_select_own
on public.donation_history for select
to authenticated
using (donor_id = (select auth.uid()));

create policy donation_history_insert_own
on public.donation_history for insert
to authenticated
with check (donor_id = (select auth.uid()));

create policy donation_history_update_own
on public.donation_history for update
to authenticated
using (donor_id = (select auth.uid()))
with check (donor_id = (select auth.uid()));

create policy donation_history_delete_own
on public.donation_history for delete
to authenticated
using (donor_id = (select auth.uid()));