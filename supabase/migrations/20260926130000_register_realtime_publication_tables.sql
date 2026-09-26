-- Register required workflow and request tables in supabase_realtime publication
-- to enable push updates for donation workflows, responses, and requests.

do $$
begin
  if not exists (
    select 1
    from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'donor_responses'
  ) then
    execute 'alter publication supabase_realtime add table public.donor_responses';
  end if;

  if not exists (
    select 1
    from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'donation_workflows'
  ) then
    execute 'alter publication supabase_realtime add table public.donation_workflows';
  end if;

  if not exists (
    select 1
    from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'donation_workflow_events'
  ) then
    execute 'alter publication supabase_realtime add table public.donation_workflow_events';
  end if;

  if not exists (
    select 1
    from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'blood_requests'
  ) then
    execute 'alter publication supabase_realtime add table public.blood_requests';
  end if;
end;
$$;
