begin;
create extension if not exists pgtap with schema extensions;
set local search_path = public, extensions;

insert into auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at)
values
  ('00000000-0000-4000-8000-000000000a01', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'applicant-a@example.test', '', now()),
  ('00000000-0000-4000-8000-000000000a02', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'applicant-b@example.test', '', now()),
  ('00000000-0000-4000-8000-000000000a03', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'hr@example.test', '', now()),
  ('00000000-0000-4000-8000-000000000a04', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'unverified@example.test', '', null);
insert into auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, raw_user_meta_data)
values ('00000000-0000-4000-8000-000000000a05', '00000000-0000-0000-0000-000000000000',
  'authenticated', 'authenticated', 'metadata-attack@example.test', '', now(), '{"role":"hr"}'::jsonb);
update public.profiles set role = 'hr' where user_id = '00000000-0000-4000-8000-000000000a03';

insert into public.jobs (id, title, team, category, description, requirements, status, published_at)
values
  ('00000000-0000-4000-8000-000000000b01', 'Open role', 'Engineering', 'engineering', 'Description', 'Requirements', 'published', now()),
  ('00000000-0000-4000-8000-000000000b02', 'Draft role', 'Engineering', 'engineering', 'Description', 'Requirements', 'draft', null),
  ('00000000-0000-4000-8000-000000000b03', 'Closed role', 'Engineering', 'engineering', 'Description', 'Requirements', 'closed', now()),
  ('00000000-0000-4000-8000-000000000b04', 'Second open role', 'Engineering', 'engineering', 'Description', 'Requirements', 'published', now());

select plan(30);
select is((select role from public.profiles where user_id = '00000000-0000-4000-8000-000000000a01'),
  'applicant', 'public signup creates Applicant profile');
select is((select role from public.profiles where user_id = '00000000-0000-4000-8000-000000000a05'),
  'applicant', 'signup metadata cannot grant HR');
select ok(not has_table_privilege('authenticated', 'public.profiles', 'UPDATE'), 'applicant cannot grant an HR role');
select ok(not has_table_privilege('authenticated', 'public.applications', 'UPDATE'), 'application writes require narrow functions');
select ok(not has_function_privilege('anon', 'public.submit_application_details_v2(uuid,text,text,text,text,integer)', 'EXECUTE'), 'anon cannot submit');
select ok(not has_table_privilege('anon', 'public.applications', 'SELECT'), 'anon cannot read letters');

set local role authenticated;
select set_config('request.jwt.claim.sub', '00000000-0000-4000-8000-000000000a04', true);
select throws_ok(
  $$select public.save_application_details_v2('00000000-0000-4000-8000-000000000b01', 'Unverified','Synthetic Applicant',null,null, null)$$,
  '42501', 'Verified Applicant account required', 'unverified account cannot save a draft'
);

select set_config('request.jwt.claim.sub', '00000000-0000-4000-8000-000000000a01', true);
select throws_ok(
  $$select public.submit_application_details_v2('00000000-0000-4000-8000-000000000b02', 'Letter','Synthetic Applicant',null,null, null)$$,
  'P0001', 'Job is not open for applications', 'draft job rejects direct submission'
);
select throws_ok(
  $$select public.submit_application_details_v2('00000000-0000-4000-8000-000000000b03', 'Letter','Synthetic Applicant',null,null, null)$$,
  'P0001', 'Job is not open for applications', 'closed job rejects direct submission'
);
select throws_ok(
  $$select public.submit_application_details_v2('00000000-0000-4000-8000-000000000b01', repeat('x', 5001),'Synthetic Applicant',null,null, null)$$,
  '22023', 'Enter a cover letter of at most 5,000 characters', 'direct RPC enforces length limit'
);
select lives_ok(
  $$select public.save_application_details_v2('00000000-0000-4000-8000-000000000b01', 'First draft','Synthetic Applicant',null,null, null)$$,
  'Applicant saves a private draft'
);
select is((select submission_state from public.applications where job_id = '00000000-0000-4000-8000-000000000b01'),
  'draft', 'save does not submit');
select is((select count(*) from public.applications where job_id = '00000000-0000-4000-8000-000000000b01'),
  1::bigint, 'only one application row exists');
select throws_ok(
  $$select public.submit_application_details_v2('00000000-0000-4000-8000-000000000b01', 'Letter','Synthetic Applicant',null,null, 9)$$,
  'P0001', 'Application changed; reload before submitting', 'stale revision cannot overwrite draft'
);
select lives_ok(
  $$select public.submit_application_details_v2('00000000-0000-4000-8000-000000000b01', 'Original letter','Synthetic Applicant',null,null, 1)$$,
  'explicit submission succeeds'
);
select throws_ok(
  $$select public.submit_application_details_v2('00000000-0000-4000-8000-000000000b01', 'Again','Synthetic Applicant',null,null, 2)$$,
  'P0001', 'Application already submitted', 'duplicate submission denied'
);
select ok(not has_function_privilege('authenticated', 'public.edit_submitted_letter(uuid,text,integer)', 'EXECUTE'),
  'authenticated users cannot execute the submitted-letter edit RPC');
select throws_ok(
  $$select public.edit_submitted_letter('00000000-0000-4000-8000-000000000b01', 'Current letter', 2)$$,
  '42501', 'permission denied for function edit_submitted_letter',
  'Applicant cannot edit a submitted application');
select is((select original_submitted_letter from public.applications where job_id = '00000000-0000-4000-8000-000000000b01'),
  'Original letter', 'first submitted version remains immutable');
select is((select cover_letter from public.applications where job_id = '00000000-0000-4000-8000-000000000b01'),
  'Original letter', 'submitted cover letter remains unchanged');
select is((select submission_state from public.applications where job_id = '00000000-0000-4000-8000-000000000b01'),
  'submitted', 'denied edit cannot change application state');
select is((select revision from public.applications where job_id = '00000000-0000-4000-8000-000000000b01'),
  2, 'denied edit cannot advance application revision');

select set_config('request.jwt.claim.sub', '00000000-0000-4000-8000-000000000a02', true);
select is((select count(*) from public.applications where job_id = '00000000-0000-4000-8000-000000000b01'),
  0::bigint, 'other Applicant cannot read submission');
select throws_ok(
  $$select public.edit_submitted_letter('00000000-0000-4000-8000-000000000b01', 'Attack', 3)$$,
  '42501', 'permission denied for function edit_submitted_letter',
  'other Applicant cannot invoke submitted-letter edit RPC'
);
select lives_ok(
  $$select public.save_application_details_v2('00000000-0000-4000-8000-000000000b04', 'Private draft','Synthetic Applicant',null,null, null)$$,
  'second Applicant has a separate saved draft'
);

select set_config('request.jwt.claim.sub', '00000000-0000-4000-8000-000000000a03', true);
select is((select count(*) from public.applications where job_id = '00000000-0000-4000-8000-000000000b01'),
  1::bigint, 'HR can read a submitted application');
select is((select count(*) from public.applications where job_id = '00000000-0000-4000-8000-000000000b04'),
  0::bigint, 'HR cannot read an unsubmitted draft');
select throws_ok(
  $$select public.submit_application_details_v2('00000000-0000-4000-8000-000000000b04', 'HR attack','Synthetic Applicant',null,null, 1)$$,
  '42501', 'Verified Applicant account required', 'HR cannot invoke Applicant submit function'
);

reset role;
update public.jobs set status = 'closed' where id = '00000000-0000-4000-8000-000000000b01';
set local role authenticated;
select set_config('request.jwt.claim.sub', '00000000-0000-4000-8000-000000000a01', true);
select throws_ok(
  $$select public.edit_submitted_letter('00000000-0000-4000-8000-000000000b01', 'Too late', 3)$$,
  '42501', 'permission denied for function edit_submitted_letter',
  'submitted-letter edit stays disabled after job closure'
);
select is((select count(*) from public.applications where job_id = '00000000-0000-4000-8000-000000000b01'),
  1::bigint, 'owner still reads application after closure');

select * from finish();
rollback;
