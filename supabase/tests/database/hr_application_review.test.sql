begin;
create extension if not exists pgtap with schema extensions;
set local search_path = public, extensions;

insert into auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at)
values
  ('10000000-0000-4000-8000-000000000a01', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'hr9-applicant@example.test', '', now()),
  ('10000000-0000-4000-8000-000000000a02', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'hr9-other@example.test', '', now()),
  ('10000000-0000-4000-8000-000000000a03', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'hr9-hr@example.test', '', now()),
  ('10000000-0000-4000-8000-000000000a04', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'hr9-unverified@example.test', '', null);
update public.profiles set role = 'hr' where user_id in
  ('10000000-0000-4000-8000-000000000a03', '10000000-0000-4000-8000-000000000a04');

insert into public.jobs (id, title, team, category, description, requirements, status, published_at)
values
  ('10000000-0000-4000-8000-000000000b01', 'HR review role', 'Engineering', 'engineering', 'Description', 'Requirements', 'published', now()),
  ('10000000-0000-4000-8000-000000000b02', 'HR draft role', 'Engineering', 'engineering', 'Description', 'Requirements', 'published', now());

select plan(38);
select has_column('public', 'applications', 'review_status', 'review status is stored on application');
select has_column('public', 'applications', 'review_revision', 'review revision is stored on application');
select has_table('public', 'application_notes', 'private notes table exists');
select has_table('public', 'application_status_events', 'status history table exists');
select ok(not has_table_privilege('authenticated', 'public.application_notes', 'INSERT'), 'browser role has no direct note insert');
select ok(not has_table_privilege('authenticated', 'public.application_notes', 'UPDATE'), 'notes cannot be edited directly');
select ok(not has_table_privilege('authenticated', 'public.application_notes', 'DELETE'), 'notes cannot be deleted directly');
select ok(not has_table_privilege('authenticated', 'public.application_status_events', 'INSERT'), 'browser role has no direct status-event insert');
select ok(not has_table_privilege('anon', 'public.application_notes', 'SELECT'), 'anonymous users cannot read notes');

set local role authenticated;
select set_config('request.jwt.claim.sub', '10000000-0000-4000-8000-000000000a01', true);
select lives_ok($$select public.save_application_draft('10000000-0000-4000-8000-000000000b02', 'Private draft', null)$$, 'Applicant saves draft');
select set_config('hr9.draft_id', (select id::text from public.applications where job_id = '10000000-0000-4000-8000-000000000b02'), true);
select lives_ok($$select public.submit_application('10000000-0000-4000-8000-000000000b01', 'Original', null)$$, 'Applicant submits');
select set_config('hr9.submitted_id', (select id::text from public.applications where job_id = '10000000-0000-4000-8000-000000000b01'), true);
select is((select review_status from public.applications where job_id = '10000000-0000-4000-8000-000000000b01'), 'submitted', 'submission initializes review status');
select throws_ok($$select public.append_hr_application_note((select id from public.applications where job_id = '10000000-0000-4000-8000-000000000b01'), 'attack')$$, '42501', 'Verified HR account required', 'Applicant cannot add HR note');
select throws_ok($$select public.change_hr_application_status((select id from public.applications where job_id = '10000000-0000-4000-8000-000000000b01'), 'rejected', 1)$$, '42501', 'Verified HR account required', 'Applicant cannot change status');
select is((select count(*) from public.application_notes), 0::bigint, 'Applicant sees no notes');
select is((select count(*) from public.application_status_events), 0::bigint, 'Applicant sees no history');
select set_config('request.jwt.claim.sub', '10000000-0000-4000-8000-000000000a02', true);
select is((select count(*) from public.applications where id = current_setting('hr9.submitted_id')::uuid), 0::bigint, 'other Applicant sees no review status');
select set_config('request.jwt.claim.sub', '10000000-0000-4000-8000-000000000a04', true);
select throws_ok($$select public.change_hr_application_status(current_setting('hr9.submitted_id')::uuid, 'rejected', 1)$$, '42501', 'Verified HR account required', 'unverified HR cannot change status');

select set_config('request.jwt.claim.sub', '10000000-0000-4000-8000-000000000a03', true);
select is((select count(*) from public.applications where job_id = '10000000-0000-4000-8000-000000000b02'), 0::bigint, 'HR cannot read draft');
select throws_ok($$select public.append_hr_application_note(current_setting('hr9.draft_id')::uuid, 'attack')$$, 'P0001', 'Submitted application not found', 'HR cannot add note to draft by guessed ID');
select throws_ok($$select public.append_hr_application_note(current_setting('hr9.submitted_id')::uuid, repeat('a', 2001))$$, '22023', 'Invalid HR note', 'database rejects oversized notes');
select lives_ok($$select public.append_hr_application_note((select id from public.applications where job_id = '10000000-0000-4000-8000-000000000b01'), 'Private note')$$, 'HR adds note');
select is((select count(*) from public.application_notes where application_id = current_setting('hr9.submitted_id')::uuid), 1::bigint, 'HR sees authored note');
select is((select author_id from public.application_notes where application_id = current_setting('hr9.submitted_id')::uuid limit 1), '10000000-0000-4000-8000-000000000a03'::uuid, 'note records HR author');
select ok((select created_at is not null from public.application_notes where application_id = current_setting('hr9.submitted_id')::uuid limit 1), 'note records creation time');
select lives_ok($$select public.change_hr_application_status((select id from public.applications where job_id = '10000000-0000-4000-8000-000000000b01'), 'in_review', 1)$$, 'HR changes status explicitly');
select throws_ok($$select public.change_hr_application_status((select id from public.applications where job_id = '10000000-0000-4000-8000-000000000b01'), 'rejected', 1)$$, 'P0001', 'Application changed; reload before updating status', 'stale status action denied');
select throws_ok($$select public.change_hr_application_status((select id from public.applications where job_id = '10000000-0000-4000-8000-000000000b01'), 'submitted', 2)$$, '22023', 'Invalid review status', 'HR cannot revert to submitted');
select is((select count(*) from public.application_status_events where application_id = current_setting('hr9.submitted_id')::uuid), 1::bigint, 'only committed status change has event');
select set_config('request.jwt.claim.sub', '10000000-0000-4000-8000-000000000a01', true);
select is((select count(*) from public.application_notes), 0::bigint, 'Applicant cannot read a populated HR note table');
select is((select count(*) from public.application_status_events), 0::bigint, 'Applicant cannot read a populated status-history table');
reset role;
set local role anon;
select throws_ok($$select count(*) from public.application_notes$$, '42501', 'permission denied for table application_notes', 'anonymous direct note query is denied');
select throws_ok($$select count(*) from public.application_status_events$$, '42501', 'permission denied for table application_status_events', 'anonymous direct history query is denied');

reset role;
update public.jobs set status = 'closed' where id = '10000000-0000-4000-8000-000000000b01';
set local role authenticated;
select set_config('request.jwt.claim.sub', '10000000-0000-4000-8000-000000000a03', true);
select lives_ok($$select public.change_hr_application_status((select id from public.applications where job_id = '10000000-0000-4000-8000-000000000b01'), 'shortlisted', 2)$$, 'HR can review submitted application after job closes');
select lives_ok($$select public.append_hr_application_note(current_setting('hr9.submitted_id')::uuid, 'Post-closure note')$$, 'HR can add note after job closes');
select is((select count(*) from public.application_notes where application_id = current_setting('hr9.submitted_id')::uuid), 2::bigint, 'HR notes survive job closure');
select is((select review_status from public.applications where id = current_setting('hr9.submitted_id')::uuid), 'shortlisted', 'status survives job closure');
reset role;
update public.profiles set role = 'hr' where user_id = '10000000-0000-4000-8000-000000000a01';
set local role authenticated;
select set_config('request.jwt.claim.sub', '10000000-0000-4000-8000-000000000a01', true);
select is((select count(*) from public.applications where id = current_setting('hr9.draft_id')::uuid), 0::bigint, 'promoted former owner cannot read old draft');

select * from finish();
rollback;
