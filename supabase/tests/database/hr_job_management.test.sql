begin;
create extension if not exists pgtap with schema extensions;
set local search_path = public, extensions;

insert into auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at)
values
  ('20000000-0000-4000-8000-000000000a01', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'job8-applicant@example.test', '', now()),
  ('20000000-0000-4000-8000-000000000a02', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'job8-hr@example.test', '', now()),
  ('20000000-0000-4000-8000-000000000a03', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'job8-unverified@example.test', '', null);
-- Completed synthetic profile fixtures for #52; no real-data backfill.
insert into public.applicant_profiles(user_id,full_name,phone) values ('20000000-0000-4000-8000-000000000a01','Fixture Applicant','+6591234567'),('20000000-0000-4000-8000-000000000a02','Fixture Applicant','+6591234567'),('20000000-0000-4000-8000-000000000a03','Fixture Applicant','+6591234567') on conflict(user_id) do nothing;
update public.profiles set role = 'hr' where user_id in
  ('20000000-0000-4000-8000-000000000a02', '20000000-0000-4000-8000-000000000a03');

insert into public.jobs (id, title, team, category, description, requirements, status, published_at)
values
  ('20000000-0000-4000-8000-000000000b01', 'Existing role', 'Engineering', 'engineering', 'Description', 'Requirements', 'published', now()),
  ('20000000-0000-4000-8000-000000000b02', 'Private draft', 'Engineering', 'engineering', 'Description', 'Requirements', 'draft', null);

select plan(35);
select has_function('public', 'create_hr_job_draft', array['text','text','text','text','text'], 'HR draft creator exists');
select has_function('public', 'edit_hr_job_draft', array['uuid','text','text','text','text','text'], 'HR draft editor exists');
select has_function('public', 'publish_hr_job', array['uuid'], 'explicit publish action exists');
select has_function('public', 'close_hr_job', array['uuid'], 'explicit close action exists');
select ok(not has_table_privilege('authenticated', 'public.jobs', 'INSERT'), 'authenticated clients cannot insert jobs directly');
select ok(not has_table_privilege('authenticated', 'public.jobs', 'UPDATE'), 'authenticated clients cannot update jobs directly');
select ok(not has_function_privilege('anon', to_regprocedure('public.create_hr_job_draft(text,text,text,text,text)'), 'EXECUTE'), 'anonymous cannot execute draft creator');
select ok(not has_function_privilege('anon', to_regprocedure('public.edit_hr_job_draft(uuid,text,text,text,text,text)'), 'EXECUTE'), 'anonymous cannot execute draft editor');
select ok(not has_function_privilege('anon', to_regprocedure('public.publish_hr_job(uuid)'), 'EXECUTE'), 'anonymous cannot execute publish');
select ok(not has_function_privilege('anon', to_regprocedure('public.close_hr_job(uuid)'), 'EXECUTE'), 'anonymous cannot execute close');

set local role authenticated;
select set_config('request.jwt.claim.sub', '20000000-0000-4000-8000-000000000a01', true);
select throws_ok($$select public.create_hr_job_draft('Attack', 'Team', 'engineering', 'Description', 'Requirements')$$, '42501', 'Verified HR account required', 'Applicant cannot create draft');
select throws_ok($$select public.edit_hr_job_draft('20000000-0000-4000-8000-000000000b02', 'Attack', 'Team', 'engineering', 'Changed', 'Changed')$$, '42501', 'Verified HR account required', 'Applicant cannot edit draft');
select throws_ok($$select public.publish_hr_job('20000000-0000-4000-8000-000000000b02')$$, '42501', 'Verified HR account required', 'Applicant cannot publish draft');
select throws_ok($$select public.close_hr_job('20000000-0000-4000-8000-000000000b01')$$, '42501', 'Verified HR account required', 'Applicant cannot close job');
select is((select count(*) from public.jobs where status = 'draft'), 0::bigint, 'Applicant cannot see any drafts');
select set_config('request.jwt.claim.sub', '20000000-0000-4000-8000-000000000a03', true);
select throws_ok($$select public.create_hr_job_draft('Attack', 'Team', 'engineering', 'Description', 'Requirements')$$, '42501', 'Verified HR account required', 'unverified HR cannot create draft');
select throws_ok($$select public.edit_hr_job_draft('20000000-0000-4000-8000-000000000b02', 'Attack', 'Team', 'engineering', 'Changed', 'Changed')$$, '42501', 'Verified HR account required', 'unverified HR cannot edit draft');
select throws_ok($$select public.publish_hr_job('20000000-0000-4000-8000-000000000b02')$$, '42501', 'Verified HR account required', 'unverified HR cannot publish draft');
select throws_ok($$select public.close_hr_job('20000000-0000-4000-8000-000000000b01')$$, '42501', 'Verified HR account required', 'unverified HR cannot close job');

reset role;
select is((select status || ':' || title || ':' || description from public.jobs where id = '20000000-0000-4000-8000-000000000b02'), 'draft:Private draft:Description', 'denied writes leave private draft status and content unchanged');
select is((select status from public.jobs where id = '20000000-0000-4000-8000-000000000b01'), 'published', 'denied close leaves published job open');

set local role authenticated;
select set_config('request.jwt.claim.sub', '20000000-0000-4000-8000-000000000a02', true);
select throws_ok($$select public.create_hr_job_draft('Invalid', 'Team', 'unknown', 'Description', 'Requirements')$$, '22023', 'Invalid job fields', 'invalid category is rejected');
select lives_ok($$select public.create_hr_job_draft('New role', 'Platform', 'engineering', 'Draft description', 'Draft requirements')$$, 'HR creates draft');
select set_config('job8.draft_id', (select id::text from public.jobs where title = 'New role'), true);
select is((select count(*) from public.jobs where id = current_setting('job8.draft_id')::uuid and status = 'draft'), 1::bigint, 'HR sees own draft');
select lives_ok($$select public.edit_hr_job_draft(current_setting('job8.draft_id')::uuid, 'Revised role', 'Platform', 'engineering', 'Revised description', 'Revised requirements')$$, 'HR edits draft');
select lives_ok($$select public.publish_hr_job(current_setting('job8.draft_id')::uuid)$$, 'HR explicitly publishes draft');
select throws_ok($$select public.edit_hr_job_draft(current_setting('job8.draft_id')::uuid, 'Tampered', 'Platform', 'engineering', 'Changed', 'Changed')$$, 'P0001', 'Draft job not found', 'published content cannot be edited');
select set_config('request.jwt.claim.sub', '20000000-0000-4000-8000-000000000a01', true);
select lives_ok($$select public.submit_application_details_v2(current_setting('job8.draft_id')::uuid, 'Synthetic submitted letter','Synthetic Applicant','+6591234567',null, null)$$, 'Applicant can submit while job is published');
select set_config('request.jwt.claim.sub', '20000000-0000-4000-8000-000000000a02', true);
select lives_ok($$select public.close_hr_job(current_setting('job8.draft_id')::uuid)$$, 'HR explicitly closes job');
select throws_ok($$select public.publish_hr_job(current_setting('job8.draft_id')::uuid)$$, 'P0001', 'Draft job not found', 'closed job cannot be republished');
select is((select count(*) from public.jobs where id = current_setting('job8.draft_id')::uuid and status = 'closed'), 1::bigint, 'HR can still read closed job');
select is((select count(*) from public.applications where job_id = current_setting('job8.draft_id')::uuid and submission_state = 'submitted'), 1::bigint, 'HR still reads submitted application after closure');
select set_config('request.jwt.claim.sub', '20000000-0000-4000-8000-000000000a01', true);
select is((select count(*) from public.applications where job_id = current_setting('job8.draft_id')::uuid), 1::bigint, 'Applicant still reads own application after closure');
select throws_ok($$select public.edit_submitted_letter(current_setting('job8.draft_id')::uuid, 'Late edit', 1)$$, '42501', 'permission denied for function edit_submitted_letter', 'Applicants cannot call the submitted-letter edit RPC after the freeze is enabled');
set local role anon;
select is((select count(*) from public.jobs where id = current_setting('job8.draft_id')::uuid), 0::bigint, 'closed job is hidden from public reads');

select * from finish();
rollback;
