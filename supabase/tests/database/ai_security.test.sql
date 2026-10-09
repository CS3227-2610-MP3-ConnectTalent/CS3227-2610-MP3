begin;
create extension if not exists pgtap with schema extensions;
set local search_path = public, extensions;

insert into auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at)
values
  ('20000000-0000-4000-8000-000000000a01', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'ai-applicant@example.test', '', now()),
  ('20000000-0000-4000-8000-000000000a02', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'ai-other@example.test', '', now()),
  ('20000000-0000-4000-8000-000000000a03', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'ai-hr@example.test', '', now()),
  ('20000000-0000-4000-8000-000000000a04', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'ai-unverified-hr@example.test', '', null);
update public.profiles set role = 'hr'
  where user_id in ('20000000-0000-4000-8000-000000000a03', '20000000-0000-4000-8000-000000000a04');
insert into public.jobs (id, title, team, category, description, requirements, status, published_at)
values
  ('20000000-0000-4000-8000-000000000b01', 'AI published role', 'Engineering', 'engineering', 'Synthetic description', 'Synthetic requirements', 'published', now()),
  ('20000000-0000-4000-8000-000000000b02', 'AI draft role', 'Engineering', 'engineering', 'Synthetic description', 'Synthetic requirements', 'draft', null),
  ('20000000-0000-4000-8000-000000000b03', 'AI draft application role', 'Engineering', 'engineering', 'Synthetic description', 'Published requirements only', 'published', now());

select plan(52);

select ok(to_regclass('public.application_submission_events') is not null,
  'submission metadata audit table exists');
select ok(to_regclass('public.ai_invocations') is not null,
  'AI invocation metadata table exists');
select is(coalesce((
  select string_agg(column_name, ',' order by column_name)
  from information_schema.columns
  where table_schema = 'public' and table_name = 'application_submission_events'
), ''), 'actor_id,application_id,created_at,id',
  'submission audit stores only actor, application, timestamp, and event identity');
select is(coalesce((
  select string_agg(column_name, ',' order by column_name)
  from information_schema.columns
  where table_schema = 'public' and table_name = 'ai_invocations'
), ''), 'actor_id,completed_at,created_at,id,operation,outcome,target_id',
  'AI audit stores only actor, operation, target, timestamps, outcome, and event identity');

select ok(to_regprocedure('public.reserve_ai_invocation(uuid,text,uuid)') is not null,
  'quota reservation RPC exists');
select ok(case when to_regprocedure('public.reserve_ai_invocation(uuid,text,uuid)') is null then false
  else not has_function_privilege('authenticated', 'public.reserve_ai_invocation(uuid,text,uuid)', 'EXECUTE') end,
  'browser sessions cannot execute the quota reservation RPC');
select ok(case when to_regprocedure('public.reserve_ai_invocation(uuid,text,uuid)') is null then false
  else has_function_privilege('service_role', 'public.reserve_ai_invocation(uuid,text,uuid)', 'EXECUTE') end,
  'only the server service role can reserve AI invocations');
select ok(case when to_regprocedure('public.reserve_ai_invocation(uuid,text,uuid)') is null then false
  else not has_function_privilege('anon', 'public.reserve_ai_invocation(uuid,text,uuid)', 'EXECUTE') end,
  'anonymous users cannot reserve AI invocations');
select ok(to_regprocedure('public.finalize_ai_invocation(uuid,uuid,text)') is not null,
  'AI audit finalization RPC exists');
select ok(case when to_regprocedure('public.finalize_ai_invocation(uuid,uuid,text)') is null then false
  else not has_function_privilege('authenticated', 'public.finalize_ai_invocation(uuid,uuid,text)', 'EXECUTE') end,
  'browser sessions cannot execute the audit finalization RPC');
select ok(case when to_regprocedure('public.finalize_ai_invocation(uuid,uuid,text)') is null then false
  else has_function_privilege('service_role', 'public.finalize_ai_invocation(uuid,uuid,text)', 'EXECUTE') end,
  'only the server service role can finalize AI invocations');
select ok(case when to_regprocedure('public.finalize_ai_invocation(uuid,uuid,text)') is null then false
  else not has_function_privilege('anon', 'public.finalize_ai_invocation(uuid,uuid,text)', 'EXECUTE') end,
  'anonymous users cannot finalize AI invocations');
select ok(to_regprocedure('public.get_submitted_application_requirements(uuid)') is not null,
  'HR requirements RPC exists');
select ok(case when to_regprocedure('public.get_submitted_application_requirements(uuid)') is null then false
  else (select prosecdef from pg_catalog.pg_proc where oid = to_regprocedure('public.get_submitted_application_requirements(uuid)')) end,
  'requirements RPC uses a checked security-definer boundary');
select ok(case when to_regprocedure('public.get_submitted_application_requirements(uuid)') is null then false
  else has_function_privilege('authenticated', 'public.get_submitted_application_requirements(uuid)', 'EXECUTE') end,
  'authenticated HR sessions can call the checked requirements RPC');
select ok(case when to_regprocedure('public.get_submitted_application_requirements(uuid)') is null then false
  else not has_function_privilege('anon', 'public.get_submitted_application_requirements(uuid)', 'EXECUTE') end,
  'anonymous users cannot call the requirements RPC');

select ok(case when to_regclass('public.ai_invocations') is null then false
  else has_table_privilege('authenticated', 'public.ai_invocations', 'SELECT') end,
  'authenticated HR sessions can query invocation metadata through RLS');
select ok(case when to_regclass('public.ai_invocations') is null then false
  else not has_table_privilege('authenticated', 'public.ai_invocations', 'INSERT') end,
  'browser sessions cannot directly insert invocation metadata');
select ok(case when to_regclass('public.ai_invocations') is null then false
  else not has_table_privilege('authenticated', 'public.ai_invocations', 'UPDATE') end,
  'browser sessions cannot directly edit invocation metadata');
select ok(case when to_regclass('public.ai_invocations') is null then false
  else not has_table_privilege('authenticated', 'public.ai_invocations', 'DELETE') end,
  'browser sessions cannot directly delete invocation metadata');
select ok(case when to_regclass('public.ai_invocations') is null then false
  else not has_table_privilege('anon', 'public.ai_invocations', 'SELECT') end,
  'anonymous users cannot query invocation metadata');
select ok(case when to_regclass('public.application_submission_events') is null then false
  else has_table_privilege('authenticated', 'public.application_submission_events', 'SELECT') end,
  'authenticated HR sessions can query submission metadata through RLS');
select ok(case when to_regclass('public.application_submission_events') is null then false
  else not has_table_privilege('authenticated', 'public.application_submission_events', 'INSERT') end,
  'browser sessions cannot forge submission audit events');

set local role authenticated;
select set_config('request.jwt.claim.sub', '20000000-0000-4000-8000-000000000a01', true);
select lives_ok(
  $$select public.submit_application_details_v2('20000000-0000-4000-8000-000000000b01', 'Synthetic private letter','Synthetic Applicant',null,null, null)$$,
  'Applicant submission succeeds and invokes the audit trigger');
select set_config('ai.test_application_id', (select id::text from public.applications where job_id = '20000000-0000-4000-8000-000000000b01'), true);
select lives_ok(
  $$select public.save_application_details_v2('20000000-0000-4000-8000-000000000b03', 'Synthetic unsubmitted draft','Synthetic Applicant',null,null, null)$$,
  'Applicant creates an unsubmitted draft for another published role');
select set_config('ai.test_draft_application_id', (select id::text from public.applications where job_id = '20000000-0000-4000-8000-000000000b03'), true);
select is((select count(*) from public.application_submission_events), 0::bigint,
  'Applicants cannot read submission audit rows');
select is((select count(*) from public.ai_invocations), 0::bigint,
  'Applicants cannot read AI invocation rows');
select throws_ok(
  $$select public.reserve_ai_invocation('20000000-0000-4000-8000-000000000a01', 'hr_summary', current_setting('ai.test_application_id')::uuid)$$,
  '42501', 'permission denied for function reserve_ai_invocation', 'Applicant cannot call the reservation RPC directly');
select throws_ok(
  $$select public.get_submitted_application_requirements(current_setting('ai.test_application_id')::uuid)$$,
  '42501', 'Verified HR account required', 'Applicant cannot use the HR requirements RPC');
select throws_ok(
  $$select public.reserve_ai_invocation('20000000-0000-4000-8000-000000000a01', 'applicant_draft', '20000000-0000-4000-8000-000000000b01')$$,
  '42501', 'permission denied for function reserve_ai_invocation', 'Applicant cannot consume shared quota through a direct RPC');

reset role;
set local role service_role;
select set_config('request.jwt.claims', '{"role":"service_role"}', true);
select lives_ok(
  $$select set_config('ai.test_applicant_invocation_id', public.reserve_ai_invocation('20000000-0000-4000-8000-000000000a01', 'applicant_draft', '20000000-0000-4000-8000-000000000b01')::text, true)$$,
  'verified Applicant can reserve an authorized published-job draft');
select is(public.finalize_ai_invocation('20000000-0000-4000-8000-000000000a01', current_setting('ai.test_applicant_invocation_id')::uuid, 'success'), true,
  'server finalizes the Applicant invocation');
select is(public.finalize_ai_invocation('20000000-0000-4000-8000-000000000a01', current_setting('ai.test_applicant_invocation_id')::uuid, 'failure'), false,
  'completed invocation cannot be changed a second time');
select throws_ok(
  $$select public.reserve_ai_invocation('20000000-0000-4000-8000-000000000a01', 'applicant_draft', '20000000-0000-4000-8000-000000000b02')$$,
  'P0001', 'AI target not available', 'Applicant cannot reserve a draft for an unpublished job');
select throws_ok(
  $$select public.reserve_ai_invocation('20000000-0000-4000-8000-000000000a03', 'applicant_draft', '20000000-0000-4000-8000-000000000b01')$$,
  '42501', 'Applicant role required', 'server cannot reserve an Applicant draft for an HR actor');

select set_config('request.jwt.claims', '{"role":"service_role","sub":"00000000-0000-0000-0000-000000000000"}', true);
select throws_ok(
  $$select public.reserve_ai_invocation('20000000-0000-4000-8000-000000000a04', 'hr_summary', current_setting('ai.test_application_id')::uuid)$$,
  '42501', 'Verified account required', 'unverified HR account cannot reserve a summary');
reset role;
set local role authenticated;
select set_config('request.jwt.claim.sub', '20000000-0000-4000-8000-000000000a04', true);
select throws_ok(
  $$select public.get_submitted_application_requirements(current_setting('ai.test_application_id')::uuid)$$,
  '42501', 'Verified HR account required', 'unverified HR cannot use the requirements RPC');

reset role;
update public.jobs set status = 'closed' where id = '20000000-0000-4000-8000-000000000b01';
set local role authenticated;
select set_config('request.jwt.claim.sub', '20000000-0000-4000-8000-000000000a03', true);
select is((select count(*) from public.application_submission_events
  where application_id = current_setting('ai.test_application_id')::uuid), 1::bigint,
  'HR can read the submission metadata event');
select is((select actor_id from public.application_submission_events
  where application_id = current_setting('ai.test_application_id')::uuid), '20000000-0000-4000-8000-000000000a01'::uuid,
  'submission audit records the Applicant actor');
select is(public.get_submitted_application_requirements(current_setting('ai.test_application_id')::uuid), 'Synthetic requirements',
  'HR can read the requirements of a closed job for its submitted application');
select throws_ok(
  $$select public.get_submitted_application_requirements(current_setting('ai.test_draft_application_id')::uuid)$$,
  'P0001', 'Submitted application not found', 'HR cannot use the requirements RPC for an unsubmitted application');

select throws_ok(
  $$select public.reserve_ai_invocation('20000000-0000-4000-8000-000000000a03', 'hr_summary', current_setting('ai.test_application_id')::uuid)$$,
  '42501', 'permission denied for function reserve_ai_invocation', 'HR cannot consume shared quota through a direct RPC');
reset role;
set local role service_role;
select set_config('request.jwt.claims', '{"role":"service_role"}', true);
select lives_ok(
  $$select set_config('ai.test_hr_invocation_id', public.reserve_ai_invocation('20000000-0000-4000-8000-000000000a03', 'hr_summary', current_setting('ai.test_application_id')::uuid)::text, true)$$,
  'verified HR can reserve a summary for a submitted application');
select is(public.finalize_ai_invocation('20000000-0000-4000-8000-000000000a03', current_setting('ai.test_hr_invocation_id')::uuid, 'failure'), true,
  'HR can finalize a failed model invocation');
select lives_ok(
  $$select public.reserve_ai_invocation('20000000-0000-4000-8000-000000000a03', 'hr_summary', current_setting('ai.test_application_id')::uuid)$$,
  'second HR request is reserved within the user limit');
select lives_ok(
  $$select public.reserve_ai_invocation('20000000-0000-4000-8000-000000000a03', 'hr_summary', current_setting('ai.test_application_id')::uuid)$$,
  'third HR request is reserved within the user limit');
select throws_ok(
  $$select public.reserve_ai_invocation('20000000-0000-4000-8000-000000000a03', 'hr_summary', current_setting('ai.test_application_id')::uuid)$$,
  'P0001', 'AI request limit exceeded', 'fourth request in one minute is denied');
select is((select count(*) from public.ai_invocations where actor_id = '20000000-0000-4000-8000-000000000a03'), 3::bigint,
  'per-user quota is shared across invocation rows');
select is((select count(*) from public.ai_invocations where actor_id = '20000000-0000-4000-8000-000000000a03' and outcome = 'failure'), 1::bigint,
  'audit row records terminal failure without provider content');

reset role;
set local role authenticated;
select set_config('request.jwt.claims', '{"role":"authenticated","sub":"20000000-0000-4000-8000-000000000a02"}', true);
select set_config('request.jwt.claim.sub', '20000000-0000-4000-8000-000000000a02', true);
select is((select count(*) from public.ai_invocations), 0::bigint,
  'another Applicant cannot read HR or Applicant invocation metadata');
select is((select count(*) from public.application_submission_events), 0::bigint,
  'another Applicant cannot read submission metadata');
select throws_ok(
  $$select public.finalize_ai_invocation('20000000-0000-4000-8000-000000000a02', current_setting('ai.test_hr_invocation_id')::uuid, 'success')$$,
  '42501', 'permission denied for function finalize_ai_invocation', 'browser sessions cannot finalize another user invocation');

select * from finish();
rollback;
