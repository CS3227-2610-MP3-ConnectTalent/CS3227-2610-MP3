begin;
create extension if not exists pgtap with schema extensions;
set local search_path = public, extensions;

insert into auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at)
values
  ('30000000-0000-4000-8000-000000000a01', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'sched-applicant@example.test', '', now()),
  ('30000000-0000-4000-8000-000000000a02', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'sched-hr@example.test', '', now());

insert into public.applicant_profiles(user_id, full_name, phone)
values ('30000000-0000-4000-8000-000000000a01', 'Sched Applicant', '+6591234567')
on conflict(user_id) do nothing;

update public.profiles set role = 'hr' where user_id = '30000000-0000-4000-8000-000000000a02';

select plan(11);

-- Check new functions exist
select has_function('public', 'unpublish_hr_job', array['uuid'], 'unpublish RPC exists');

-- Verify CHECK constraint: closes_at must be after opens_at
select throws_ok(
  $$insert into public.jobs (title, team, category, description, requirements, status, opens_at, closes_at)
    values ('Invalid Window', 'Team', 'engineering', 'Desc', 'Req', 'draft', now() + interval '2 days', now() + interval '1 day')$$,
  '23514',
  null,
  'closing time before opening time violates table constraint'
);

-- HR creates a draft with future opening and closing schedule
set local role authenticated;
select set_config('request.jwt.claim.sub', '30000000-0000-4000-8000-000000000a02', true);

select lives_ok(
  $$select public.create_hr_job_draft('Future Role', 'Engineering', 'engineering', 'Desc', 'Req', now() + interval '1 day', now() + interval '5 days')$$,
  'HR can create draft with scheduled times'
);

select set_config('test.future_job_id', (select id::text from public.jobs where title = 'Future Role'), true);

-- HR publishes the future job
select lives_ok(
  $$select public.publish_hr_job(current_setting('test.future_job_id')::uuid)$$,
  'HR can publish job scheduled for future'
);

-- Public / Anonymous should NOT see the future-scheduled job
set local role anon;
select is(
  (select count(*) from public.jobs where id = current_setting('test.future_job_id')::uuid),
  0::bigint,
  'Anonymous visitor cannot see future scheduled job under RLS'
);

-- Applicant should NOT see the future-scheduled job
set local role authenticated;
select set_config('request.jwt.claim.sub', '30000000-0000-4000-8000-000000000a01', true);
select is(
  (select count(*) from public.jobs where id = current_setting('test.future_job_id')::uuid),
  0::bigint,
  'Applicant cannot see future scheduled job under RLS'
);

-- Applicant cannot submit to a future-scheduled job
select throws_ok(
  $$select public.submit_application_details_v3(current_setting('test.future_job_id')::uuid, 'Letter', 'Applicant', '+6591234567', null, null, null)$$,
  'P0001',
  'Job is not open for applications',
  'Applicant cannot submit to future-scheduled job'
);

-- HR can revert the scheduled job to draft before opens_at
select set_config('request.jwt.claim.sub', '30000000-0000-4000-8000-000000000a02', true);
select lives_ok(
  $$select public.unpublish_hr_job(current_setting('test.future_job_id')::uuid)$$,
  'HR can unpublish scheduled job back to draft before opening'
);

select is(
  (select status from public.jobs where id = current_setting('test.future_job_id')::uuid),
  'draft',
  'Job status is restored to draft after unpublish'
);

-- An expired job (closes_at in past) is not visible and rejects applications
reset role;
insert into public.jobs (id, title, team, category, description, requirements, status, published_at, opens_at, closes_at)
values ('30000000-0000-4000-8000-000000000b01', 'Expired Role', 'Engineering', 'engineering', 'Desc', 'Req', 'published', now() - interval '2 days', now() - interval '2 days', now() - interval '1 hour');

set local role anon;
select is(
  (select count(*) from public.jobs where id = '30000000-0000-4000-8000-000000000b01'),
  0::bigint,
  'Anonymous visitor cannot see expired job under RLS'
);

set local role authenticated;
select set_config('request.jwt.claim.sub', '30000000-0000-4000-8000-000000000a01', true);
select throws_ok(
  $$select public.submit_application_details_v3('30000000-0000-4000-8000-000000000b01'::uuid, 'Letter', 'Applicant', '+6591234567', null, null, null)$$,
  'P0001',
  'Job is not open for applications',
  'Applicant cannot submit to expired job'
);

rollback;
