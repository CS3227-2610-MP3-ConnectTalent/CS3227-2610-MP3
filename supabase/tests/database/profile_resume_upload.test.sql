begin;
create extension if not exists pgtap with schema extensions;
set search_path = public, extensions;
select no_plan();
select has_table('public','profile_resume_objects','profile PDF lifecycle exists');
select has_column('public','applicant_profiles','resume_id','profile has private attachment reference');
select has_function('public','prepare_application_resume',array['uuid','uuid','integer','uuid','text','integer','text'],'upload can allocate private draft atomically');
select has_function('public','reserve_profile_resume',array['uuid','uuid','text','integer','text','uuid'],'profile upload reservation exists');
select is((select public from storage.buckets where id='profile-resumes'),false,'profile bucket stays private');
select ok(not has_function_privilege('authenticated','public.prepare_application_resume(uuid,uuid,integer,uuid,text,integer,text)','EXECUTE'),'browser cannot allocate privileged upload');
select ok(not has_function_privilege('authenticated','public.reserve_profile_resume(uuid,uuid,text,integer,text,uuid)','EXECUTE'),'browser cannot reserve unvalidated profile bytes');
insert into auth.users(id,instance_id,aud,role,email,encrypted_password,email_confirmed_at) values
 ('53000000-0000-4000-8000-000000000001','00000000-0000-0000-0000-000000000000','authenticated','authenticated','resume53-owner@example.test','',now()),
 ('53000000-0000-4000-8000-000000000002','00000000-0000-0000-0000-000000000000','authenticated','authenticated','resume53-other@example.test','',now()),
 ('53000000-0000-4000-8000-000000000003','00000000-0000-0000-0000-000000000000','authenticated','authenticated','resume53-hr@example.test','',now()),
 ('53000000-0000-4000-8000-000000000004','00000000-0000-0000-0000-000000000000','authenticated','authenticated','resume53-unverified@example.test','',null);
-- Completed synthetic profile fixtures for #52; no real-data backfill.
insert into public.applicant_profiles(user_id,full_name,phone) values ('53000000-0000-4000-8000-000000000001','Fixture Applicant','+6591234567'),('53000000-0000-4000-8000-000000000002','Fixture Applicant','+6591234567'),('53000000-0000-4000-8000-000000000003','Fixture Applicant','+6591234567'),('53000000-0000-4000-8000-000000000004','Fixture Applicant','+6591234567') on conflict(user_id) do nothing;
update public.profiles set role='hr' where user_id='53000000-0000-4000-8000-000000000003';
insert into public.jobs(id,title,team,category,description,requirements,status,published_at)
 values('53000000-0000-4000-8000-000000000101','Resume first role','Synthetic','engineering','Synthetic','Synthetic','published',now());
select throws_ok($$select public.prepare_application_resume('53000000-0000-4000-8000-000000000004','53000000-0000-4000-8000-000000000101',null,'53000000-0000-4000-8000-000000000201','sample.pdf',10,repeat('a',64))$$,'42501',null,'unverified cannot allocate');
select throws_ok($$select public.prepare_application_resume('53000000-0000-4000-8000-000000000003','53000000-0000-4000-8000-000000000101',null,'53000000-0000-4000-8000-000000000201','sample.pdf',10,repeat('a',64))$$,'42501',null,'HR cannot allocate');
select lives_ok($$select public.prepare_application_resume('53000000-0000-4000-8000-000000000001','53000000-0000-4000-8000-000000000101',null,'53000000-0000-4000-8000-000000000201','sample.pdf',10,repeat('a',64))$$,'fresh upload allocates without manual save');
select is((select cover_letter from public.applications where applicant_id='53000000-0000-4000-8000-000000000001'),'','only blank placeholder, no unsaved letter');
select is((select submission_state from public.applications where applicant_id='53000000-0000-4000-8000-000000000001'),'draft','upload does not submit');
select is((select full_name from public.applications where applicant_id='53000000-0000-4000-8000-000000000001'),null::text,'unsaved name not persisted');
select lives_ok($$select public.prepare_application_resume('53000000-0000-4000-8000-000000000001','53000000-0000-4000-8000-000000000101',null,'53000000-0000-4000-8000-000000000201','sample.pdf',10,repeat('a',64))$$,'lost reservation response retry idempotent');
select is((select count(*) from public.applications where applicant_id='53000000-0000-4000-8000-000000000001'),1::bigint,'one private application');
select throws_ok($$select public.prepare_application_resume('53000000-0000-4000-8000-000000000002','53000000-0000-4000-8000-000000000101',null,'53000000-0000-4000-8000-000000000201','sample.pdf',10,repeat('a',64))$$,'P0001',null,'foreign operation cannot be reused');
select throws_ok($$select public.prepare_application_resume('53000000-0000-4000-8000-000000000001','53000000-0000-4000-8000-000000000101',null,'53000000-0000-4000-8000-000000000202','sample.pdf',10,repeat('a',64))$$,'P0001',null,'stale first-form version cannot overwrite saved draft');
select lives_ok($$select public.reserve_profile_resume('53000000-0000-4000-8000-000000000001','53000000-0000-4000-8000-000000000301','profile.pdf',10,repeat('b',64),null)$$,'profile PDF allocates without text save');
select is((select full_name from public.applicant_profiles where user_id='53000000-0000-4000-8000-000000000001'),'Fixture Applicant'::text,'profile text untouched');
select throws_ok($$select public.finalize_profile_resume('53000000-0000-4000-8000-000000000001','53000000-0000-4000-8000-000000000301')$$,'P0001',null,'missing bytes cannot finalize');
insert into storage.objects(bucket_id,name)values('profile-resumes','53000000-0000-4000-8000-000000000301.pdf');
select lives_ok($$select public.finalize_profile_resume('53000000-0000-4000-8000-000000000001','53000000-0000-4000-8000-000000000301')$$,'profile finalizes');
select lives_ok($$select public.finalize_profile_resume('53000000-0000-4000-8000-000000000001','53000000-0000-4000-8000-000000000301')$$,'finalize retry idempotent');
set local role authenticated;
select set_config('request.jwt.claim.sub','53000000-0000-4000-8000-000000000001',true);
select is((select count(*) from public.profile_resume_objects),1::bigint,'owner sees finalized profile metadata');
select is((select count(*) from storage.objects where bucket_id='profile-resumes'),1::bigint,'owner sees profile Storage object');
select throws_ok($$select public.reserve_profile_resume('53000000-0000-4000-8000-000000000001','53000000-0000-4000-8000-000000000302','profile.pdf',10,repeat('b',64),null)$$,'42501',null,'direct reservation denied');
select throws_ok($$update public.applicant_profiles set resume_id=null$$,'42501',null,'direct reference writes denied');
select set_config('request.jwt.claim.sub','53000000-0000-4000-8000-000000000002',true);
select is((select count(*) from public.profile_resume_objects),0::bigint,'foreign profile bytes metadata hidden');
select is((select count(*) from storage.objects where bucket_id='profile-resumes'),0::bigint,'foreign Storage hidden');
select set_config('request.jwt.claim.sub','53000000-0000-4000-8000-000000000003',true);
select is((select count(*) from public.profile_resume_objects),0::bigint,'HR profile files hidden');
select is((select count(*) from public.applications where job_id='53000000-0000-4000-8000-000000000101'),0::bigint,'HR upload placeholder hidden');
reset role;
select throws_ok($$select public.retire_profile_resume('53000000-0000-4000-8000-000000000001',null,false)$$,'P0001',null,'stale profile removal denied');
select lives_ok($$select public.retire_profile_resume('53000000-0000-4000-8000-000000000001','53000000-0000-4000-8000-000000000301',false)$$,'owner profile removal retires file');
select is((select resume_id from public.applicant_profiles where user_id='53000000-0000-4000-8000-000000000001'),null::uuid,'profile pointer cleared only');
select throws_ok($$select public.finalize_profile_resume('53000000-0000-4000-8000-000000000001','53000000-0000-4000-8000-000000000301')$$,'P0001',null,'retired profile cannot resurrect');
update public.jobs set status='closed' where id='53000000-0000-4000-8000-000000000101';
select throws_ok($$select public.prepare_application_resume('53000000-0000-4000-8000-000000000002','53000000-0000-4000-8000-000000000101',null,'53000000-0000-4000-8000-000000000202','sample.pdf',10,repeat('a',64))$$,'P0001',null,'closed first upload cannot allocate');
select * from finish();
rollback;
