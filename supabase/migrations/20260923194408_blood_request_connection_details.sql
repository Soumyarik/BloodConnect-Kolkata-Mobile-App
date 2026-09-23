-- Private request connection data is available only to its requester or an
-- authenticated donor who has an accepted response for this request.
create or replace function public.get_blood_request_connection_details(p_request_id uuid)
returns table (
  request_id uuid,
  patient_name text,
  blood_group text,
  units_required integer,
  hospital_name text,
  hospital_address text,
  city text,
  area text,
  required_date date,
  required_time time,
  is_emergency boolean,
  status text,
  requester_phone text,
  is_requester boolean,
  accepted_donor_id uuid,
  donor_name text,
  donor_phone text,
  donor_blood_group text,
  donor_city text,
  donor_area text
)
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  v_user_id uuid := auth.uid();
  v_requester_id uuid;
  v_is_requester boolean;
begin
  if v_user_id is null then
    raise exception 'You must be signed in to view request connection details.';
  end if;

  select br.requester_id
  into v_requester_id
  from public.blood_requests as br
  where br.id = p_request_id;

  if not found then
    raise exception 'Blood request not found.';
  end if;

  v_is_requester := v_requester_id = v_user_id;

  if not v_is_requester and not exists (
    select 1
    from public.donor_responses as dr
    where dr.request_id = p_request_id
      and dr.donor_id = v_user_id
      and dr.status = 'accepted'
  ) then
    raise exception 'Connection details are available only to the requester and an accepted donor.';
  end if;

  return query
  select
    br.id,
    case when v_is_requester then br.patient_name else null end,
    br.blood_group,
    br.units_required,
    br.hospital_name,
    br.hospital_address,
    br.city,
    br.area,
    br.required_date,
    br.required_time,
    br.is_emergency,
    br.status,
    br.contact_phone,
    v_is_requester,
    case when v_is_requester and selected_dr.id is not null then selected_dr.donor_id else null end,
    case when v_is_requester then donor.full_name else null end,
    case when v_is_requester then donor.phone else null end,
    case when v_is_requester then donor.blood_group else null end,
    case when v_is_requester then donor.city else null end,
    case when v_is_requester then donor.area else null end
  from public.blood_requests as br
  left join public.donation_workflows as workflow
    on workflow.request_id = br.id
  left join public.donor_responses as selected_dr
    on selected_dr.id = workflow.donor_response_id
    and selected_dr.request_id = br.id
    and selected_dr.donor_id = workflow.donor_id
    and selected_dr.status = 'accepted'
  left join public.profiles as donor
    on donor.id = selected_dr.donor_id
  where br.id = p_request_id;
end;
$$;

revoke all on function public.get_blood_request_connection_details(uuid) from public, anon;
grant execute on function public.get_blood_request_connection_details(uuid) to authenticated;
