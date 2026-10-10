begin;
create extension if not exists pgtap with schema extensions;
set local search_path = public, extensions;
select no_plan();
select has_column('public','applications','withdrawn_at','withdrawal timestamp exists');
select has_column('public','applications','withdrawn_by','withdrawal actor exists');
select has_function('public','withdraw_application',array['uuid'],'controlled owner withdrawal exists');
select has_function('public','recover_pending_application_resume',array['uuid','uuid','integer'],'retry recovery checks current draft revision');

insert into auth.users(id,instance_id,aud,role,email,encrypted_password,email_confirmed_at) values
 ('50000000-0000-4000-8000-000000000001','00000000-0000-0000-0000-000000000000','authenticated','authenticated','withdraw-owner@example.test','',now()),
 ('50000000-0000-4000-8000-000000000002','00000000-0000-0000-0000-000000000000','authenticated','authenticated','withdraw-other@example.test','',now()),
 ('50000000-0000-4000-8000-000000000003','00000000-0000-0000-0000-000000000000','authenticated','authenticated','withdraw-hr@example.test','',now()),
 ('50000000-0000-4000-8000-000000000004','00000000-0000-0000-0000-000000000000','authenticated','authenticated','withdraw-unverified@example.test','',null);
-- Completed synthetic profile fixtures for #52; no real-data backfill.
insert into public.applicant_profiles(user_id,full_name,phone) values ('50000000-0000-4000-8000-000000000001','Fixture Applicant','+6591234567'),('50000000-0000-4000-8000-000000000002','Fixture Applicant','+6591234567'),('50000000-0000-4000-8000-000000000003','Fixture Applicant','+6591234567'),('50000000-0000-4000-8000-000000000004','Fixture Applicant','+6591234567') on conflict(user_id) do nothing;
update public.profiles set role='hr' where user_id='50000000-0000-4000-8000-000000000003';
insert into public.jobs(id,title,team,category,description,requirements,status,published_at) values
 ('50000000-0000-4000-8000-000000000101','Withdrawal role','Synthetic','engineering','Synthetic','Synthetic requirements','published',now()),
 ('50000000-0000-4000-8000-000000000102','Withdrawal draft','Synthetic','engineering','Synthetic','Synthetic requirements','published',now());
set local role authenticated;
select set_config('request.jwt.claim.sub','50000000-0000-4000-8000-000000000001',true);
select public.submit_application_details_v3('50000000-0000-4000-8000-000000000101','Original synthetic letter','Synthetic owner','+6591234567',null,'Synthetic education','Synthetic experience',null);
select public.save_application_details_v3('50000000-0000-4000-8000-000000000102','Private draft','Synthetic owner',null,null,null,null,null);
select throws_ok($$select public.withdraw_application((select id from public.applications where job_title='Withdrawal draft'))$$,'42501','Submitted application unavailable','draft withdrawal denied');
reset role;
-- Read fixture IDs without bypassing the actor checks on the invoked operation.
select set_config('test.submitted_application',(select id::text from public.applications where job_title='Withdrawal role'),true);
select set_config('test.draft_application',(select id::text from public.applications where job_title='Withdrawal draft'),true);
set local role authenticated;
select set_config('request.jwt.claim.sub','50000000-0000-4000-8000-000000000002',true);
select throws_ok($$select public.withdraw_application(current_setting('test.submitted_application')::uuid)$$,'42501','Submitted application unavailable','other Applicant cannot withdraw');
select is((select count(*) from public.applications where job_title='Withdrawal role'),0::bigint,'other Applicant cannot view submission');
select set_config('request.jwt.claim.sub','50000000-0000-4000-8000-000000000004',true);
select throws_ok($$select public.withdraw_application(current_setting('test.submitted_application')::uuid)$$,'42501','Verified Applicant account required','unverified withdrawal denied');
select set_config('request.jwt.claim.sub','50000000-0000-4000-8000-000000000003',true);
select throws_ok($$select public.withdraw_application(current_setting('test.submitted_application')::uuid)$$,'42501','Verified Applicant account required','HR cannot withdraw');
select lives_ok($$select public.append_hr_application_note(current_setting('test.submitted_application')::uuid,'Retained synthetic note')$$,'HR note before withdrawal succeeds');
select lives_ok($$select public.change_hr_application_status(current_setting('test.submitted_application')::uuid,'in_review',1)$$,'HR decision before withdrawal succeeds');
select is((select count(*) from public.applications where job_title='Withdrawal draft'),0::bigint,'HR cannot read private draft');
reset role;
set local role anon;
select throws_ok($$select public.withdraw_application(current_setting('test.submitted_application')::uuid)$$,'42501',null,'anonymous RPC denied');
reset role;
-- Withdrawal deliberately works after job closure.
update public.jobs set status='closed' where id='50000000-0000-4000-8000-000000000101';
set local role authenticated;
select set_config('request.jwt.claim.sub','50000000-0000-4000-8000-000000000001',true);
select lives_ok($$select public.withdraw_application(current_setting('test.submitted_application')::uuid)$$,'owner withdraws submitted closed-job application');
select ok((select withdrawn_at is not null from public.applications where job_title='Withdrawal role'),'withdrawal timestamp recorded');
select is((select withdrawn_by::text from public.applications where job_title='Withdrawal role'),'50000000-0000-4000-8000-000000000001','withdrawal actor is immutable owner');
select is((select review_status from public.applications where job_title='Withdrawal role'),'in_review','previous HR review status retained');
select is((select submission_state from public.applications where job_title='Withdrawal role'),'submitted','submitted history is not deleted/reclassified');
select is((select cover_letter from public.applications where job_title='Withdrawal role'),'Original synthetic letter','frozen current letter retained');
select is((select original_submitted_letter from public.applications where job_title='Withdrawal role'),'Original synthetic letter','original snapshot retained');
select is((select education from public.applications where job_title='Withdrawal role'),'Synthetic education','background snapshot retained');
select set_config('test.withdrawn_at',(select withdrawn_at::text from public.applications where job_title='Withdrawal role'),true);
select lives_ok($$select public.withdraw_application(current_setting('test.submitted_application')::uuid)$$,'repeat withdrawal is idempotent');
select is((select withdrawn_at::text from public.applications where job_title='Withdrawal role'),current_setting('test.withdrawn_at'),'retry does not change original time');
select throws_ok($$update public.applications set withdrawn_at=null,withdrawn_by=null where job_title='Withdrawal role'$$,'42501',null,'browser cannot restore via direct update');
select throws_ok($$delete from public.applications where job_title='Withdrawal role'$$,'42501',null,'browser cannot erase retained record');
select is((select count(*) from public.application_notes),0::bigint,'Applicant cannot read HR notes after withdrawal');
select set_config('request.jwt.claim.sub','50000000-0000-4000-8000-000000000003',true);
select is((select count(*) from public.applications where job_title='Withdrawal role'),1::bigint,'HR retains withdrawn submitted history');
select is((select count(*) from public.application_notes where application_id=current_setting('test.submitted_application')::uuid),1::bigint,'HR retains earlier note');
select is((select count(*) from public.application_status_events where application_id=current_setting('test.submitted_application')::uuid),1::bigint,'HR retains earlier status event');
select throws_ok($$select public.append_hr_application_note(current_setting('test.submitted_application')::uuid,'Forbidden new note')$$,'42501','Withdrawn applications cannot be processed','HR note after withdrawal denied');
select throws_ok($$select public.change_hr_application_status(current_setting('test.submitted_application')::uuid,'shortlisted',2)$$,'42501','Withdrawn applications are locked','HR status after withdrawal denied');
select throws_ok($$select public.get_submitted_application_requirements(current_setting('test.submitted_application')::uuid)$$,'P0001','Submitted application not found','HR summary requirements blocked');
select throws_ok($$select public.recover_pending_application_resume('50000000-0000-4000-8000-000000000001','50000000-0000-4000-8000-000000000102',1)$$,'42501',null,'browser cannot invoke privileged upload recovery');
reset role;
select throws_ok($$select public.reserve_ai_invocation('50000000-0000-4000-8000-000000000003','hr_summary',current_setting('test.submitted_application')::uuid)$$,'P0001','AI target not available','trusted AI reservation cannot process withdrawn target');
select throws_ok($$update public.applications set withdrawn_at=null,withdrawn_by=null where job_title='Withdrawal role'$$,'42501','Withdrawn applications are locked','even privileged accidental reinstatement blocked');
select throws_ok($$update public.applications set cover_letter='Replacement' where job_title='Withdrawal role'$$,'42501',null,'privileged frozen-letter mutation blocked');
select lives_ok($$select public.reserve_application_resume('50000000-0000-4000-8000-000000000001','50000000-0000-4000-8000-000000000102',1,'50000000-0000-4000-8000-000000000201','synthetic.pdf',512,repeat('a',64))$$,'draft upload reservation for recovery');
select throws_ok($$select public.recover_pending_application_resume('50000000-0000-4000-8000-000000000001','50000000-0000-4000-8000-000000000102',99)$$,'P0001',null,'stale recovery cannot cancel pending upload');
select is((select state from public.application_resume_objects where id='50000000-0000-4000-8000-000000000201'),'pending','stale recovery leaves operation intact');
select lives_ok($$select public.recover_pending_application_resume('50000000-0000-4000-8000-000000000001','50000000-0000-4000-8000-000000000102',1)$$,'explicit trusted recovery succeeds');
select is((select state from public.application_resume_objects where id='50000000-0000-4000-8000-000000000201'),'retired','only pending owned operation retired');
select is((select cover_letter from public.applications where job_title='Withdrawal draft'),'Private draft','upload recovery preserves form content');
select * from finish();
rollback;
