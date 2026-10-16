begin;
create extension if not exists pgtap with schema extensions;
set local search_path = public, extensions;
select plan(12);

select has_index('public', 'applications', 'applications_one_active_per_applicant_job', array['applicant_id', 'job_id'], 'partial unique index exists for active applications');

-- Setup test users
insert into auth.users(id, instance_id, aud, role, email, encrypted_password, email_confirmed_at) values
 ('60000000-0000-4000-8000-000000000001', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'reapply-applicant@example.test', '', now()),
 ('60000000-0000-4000-8000-000000000002', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'reapply-hr@example.test', '', now());

insert into public.applicant_profiles(user_id, full_name, phone) values
 ('60000000-0000-4000-8000-000000000001', 'Reapply Applicant', '+6591234567'),
 ('60000000-0000-4000-8000-000000000002', 'HR Reviewer', '+6591234568')
 on conflict(user_id) do nothing;
update public.profiles set role = 'hr' where user_id = '60000000-0000-4000-8000-000000000002';

-- Setup open published job
insert into public.jobs(id, title, team, category, description, requirements, status, published_at) values
 ('60000000-0000-4000-8000-000000000101', 'Reapply role', 'Core Eng', 'engineering', 'Description', 'Requirements', 'published', now());

-- First application submission by applicant
set local role authenticated;
select set_config('request.jwt.claim.sub', '60000000-0000-4000-8000-000000000001', true);
select lives_ok(
  $$select public.submit_application_details_v3('60000000-0000-4000-8000-000000000101', 'First submission letter', 'Reapply Applicant', '+6591234567', null, 'First education', 'First experience', null)$$,
  'initial application submits successfully'
);

reset role;
select set_config('test.app1_id', (select id::text from public.applications where job_id = '60000000-0000-4000-8000-000000000101'), true);

-- Applicant withdraws first application
set local role authenticated;
select set_config('request.jwt.claim.sub', '60000000-0000-4000-8000-000000000001', true);
select lives_ok(
  $$select public.withdraw_application(current_setting('test.app1_id')::uuid)$$,
  'applicant withdraws first application'
);

-- Applicant saves a new draft for the same job after withdrawal
select lives_ok(
  $$select public.save_application_details_v3('60000000-0000-4000-8000-000000000101', 'Second draft letter', 'Reapply Applicant', '+6591234567', null, 'Second education', 'Second experience', null)$$,
  'applicant saves new draft after withdrawal'
);

-- Applicant submits second application
select lives_ok(
  $$select public.submit_application_details_v3('60000000-0000-4000-8000-000000000101', 'Second submission letter', 'Reapply Applicant', '+6591234567', null, 'Second education', 'Second experience', 1)$$,
  'applicant submits second application'
);

reset role;
-- Check total applications for applicant on this job is 2 (1 withdrawn, 1 active submitted)
select is(
  (select count(*) from public.applications where applicant_id = '60000000-0000-4000-8000-000000000001' and job_id = '60000000-0000-4000-8000-000000000101'),
  2::bigint,
  'both historical withdrawn and active applications exist'
);

-- First application remains withdrawn and frozen
select ok(
  (select withdrawn_at is not null and cover_letter = 'First submission letter' from public.applications where id = current_setting('test.app1_id')::uuid),
  'first application retains withdrawn timestamp and original letter'
);

-- Second application is active and submitted
select ok(
  (select withdrawn_at is null and submission_state = 'submitted' and cover_letter = 'Second submission letter' from public.applications where id <> current_setting('test.app1_id')::uuid and applicant_id = '60000000-0000-4000-8000-000000000001'),
  'second application is active and submitted'
);

-- Attempting third application while second is active must fail
set local role authenticated;
select set_config('request.jwt.claim.sub', '60000000-0000-4000-8000-000000000001', true);
select throws_ok(
  $$select public.submit_application_details_v3('60000000-0000-4000-8000-000000000101', 'Third letter', 'Reapply Applicant', '+6591234567', null, 'Education', 'Experience', null)$$,
  'P0001',
  'Application already submitted',
  'third application while second is active is rejected'
);

-- Check HR can view both applications
reset role;
set local role authenticated;
select set_config('request.jwt.claim.sub', '60000000-0000-4000-8000-000000000002', true);
select is(
  (select count(*) from public.applications where job_id = '60000000-0000-4000-8000-000000000101' and submission_state = 'submitted'),
  2::bigint,
  'HR can read both submitted applications'
);

-- Reapplying after job closes is rejected
reset role;
update public.jobs set status = 'closed' where id = '60000000-0000-4000-8000-000000000101';
-- Withdraw second application after closure
set local role authenticated;
select set_config('request.jwt.claim.sub', '60000000-0000-4000-8000-000000000001', true);
select lives_ok(
  $$select public.withdraw_application((select id from public.applications where id <> current_setting('test.app1_id')::uuid and applicant_id = '60000000-0000-4000-8000-000000000001'))$$,
  'applicant withdraws second application after job closed'
);
-- Attempting to reapply to closed job
select throws_ok(
  $$select public.save_application_details_v3('60000000-0000-4000-8000-000000000101', 'Draft to closed job', 'Reapply Applicant', '+6591234567', null, null, null, null)$$,
  'P0001',
  'Job is not open for applications',
  'reapplying to closed job is rejected'
);

select * from finish();
rollback;

