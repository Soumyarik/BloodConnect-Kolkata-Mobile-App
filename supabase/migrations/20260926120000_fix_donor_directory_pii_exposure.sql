-- SECURITY FIX / DRIFT RECONCILIATION
--
-- This repo's supabase/migrations folder had diverged from the live
-- Supabase project. In particular, 20260925191000_display_all_users_phone_directory.sql
-- and 20260925080000_allow_direct_donor_lookup_with_contact.sql, both still
-- present earlier in this folder, define get_available_donors() WITHOUT the
-- donor_available=true filter and WITHOUT excluding the caller's own row.
-- If either of those files is ever replayed (supabase db push on a fresh
-- project, disaster recovery, a new staging environment, migration repair),
-- it would expose every registered user's phone number, blood group and
-- GPS coordinates to any authenticated user, regardless of donor status.
--
-- Verified via the live Supabase project's actual function definition that
-- production currently already has the correct, safe filters (this was
-- applied out-of-band at some point and never reflected back into this
-- migrations folder under a matching filename). This migration makes the
-- repo's tracked history match that safe, live definition, so replaying
-- migrations from this folder in order always converges on the safe state.
--
-- Guards restored:
--   - caller must be authenticated
--   - donor_available = true required (a person's phone/location is only
--     returned if they explicitly opted into being found)
--   - a user is never shown their own row
--   - flagged test accounts (is_test_account = true) are excluded

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
set search_path to ''
as $function$
  select
    p.id,
    coalesce(p.full_name, 'BloodConnect Donor') as full_name,
    p.blood_group,
    coalesce(p.city, '') as city,
    coalesce(p.area, '') as area,
    coalesce(p.phone, '') as phone,
    p.donor_available
  from public.profiles p
  where auth.uid() is not null
    and p.id <> auth.uid()
    and coalesce(p.is_test_account, false) = false
    and p.donor_available = true
    and (
      p_blood_groups is null
      or cardinality(p_blood_groups) = 0
      or p.blood_group = any(p_blood_groups)
    )
    and (
      p_city is null
      or trim(p_city) = ''
      or lower(trim(split_part(coalesce(nullif(p.city, ''), p_city, ''), ',', 1))) =
         lower(trim(split_part(coalesce(p_city, ''), ',', 1)))
    )
  order by p.area nulls last, p.full_name;
$function$;

revoke all on function public.get_available_donors(text[], text) from public, anon;
grant execute on function public.get_available_donors(text[], text) to authenticated;

comment on function public.get_available_donors(text[], text) is
  'Returns donor directory rows. Phone/location must only be visible for profiles with donor_available = true, excluding the caller and test accounts. Do not remove these filters.';
