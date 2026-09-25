-- Mark clearly synthetic QA/test profiles so they never appear in the public Find Donor directory.
-- These rows are identified by their explicit test-style display names only.
update public.profiles
set is_test_account = true
where full_name in (
  'Test Full Flow User',
  'Simulated User',
  'Test Tester',
  'Pipeline Tester',
  'Real User Test',
  'Test Fixer 2',
  'Temp Seeker',
  'Test Checker'
);
