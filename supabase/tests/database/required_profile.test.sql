begin;
create extension if not exists pgtap with schema extensions;
set local search_path=public,extensions;
select no_plan();
insert into auth.users(id,instance_id,aud,role,email,encrypted_password,email_confirmed_at)
values('52000000-0000-4000-8000-000000000001','00000000-0000-0000-0000-000000000000','authenticated','authenticated','onboarding52@example.test','',now());
insert into public.jobs(id,title,team,category,description,requirements,status,published_at)
values('52000000-0000-4000-8000-000000000101','Onboarding role','Synthetic','engineering','Synthetic','Synthetic','published',now());
select ok(not application_private.profile_ready('52000000-0000-4000-8000-000000000001'),'absent profile is incomplete');
select lives_ok($$select public.reserve_profile_resume('52000000-0000-4000-8000-000000000001','52000000-0000-4000-8000-000000000201','profile.pdf',512,repeat('a',64),null)$$,'optional profile file reservation permitted before text completion');
select ok(not application_private.profile_ready('52000000-0000-4000-8000-000000000001'),'file shell does not complete onboarding');
select throws_ok($$select public.prepare_application_resume('52000000-0000-4000-8000-000000000001','52000000-0000-4000-8000-000000000101',null,'52000000-0000-4000-8000-000000000202','app.pdf',512,repeat('a',64))$$,'42501','Complete your profile before continuing','first application file cannot bypass onboarding');
select ok(not has_function_privilege('authenticated','application_private.profile_ready(uuid)','EXECUTE'),'readiness internals not exposed');
-- Represent a retained pre-onboarding draft; disable only the new guard for fixture setup.
alter table public.applications disable trigger z_applications_required_profile;
insert into public.applications(job_id,applicant_id,job_title,cover_letter,full_name,phone)
values('52000000-0000-4000-8000-000000000101','52000000-0000-4000-8000-000000000001','Onboarding role','Letter','Synthetic','+6591234567');
alter table public.applications enable trigger z_applications_required_profile;
set local role authenticated;
select set_config('request.jwt.claim.sub','52000000-0000-4000-8000-000000000001',true);
select throws_ok($$select public.save_application_details_v3('52000000-0000-4000-8000-000000000101','Letter','Synthetic','+6591234567',null,null,null,1)$$,'42501','Complete your profile before continuing','same-content draft save cannot bypass onboarding');
reset role;
delete from public.applications where applicant_id='52000000-0000-4000-8000-000000000001';
set local role authenticated;
select throws_ok($$select public.save_application_details_v3('52000000-0000-4000-8000-000000000101','Letter','Synthetic','+6591234567',null,null,null,null)$$,'42501','Complete your profile before continuing','direct application write needs a complete profile');
select throws_ok($$select public.save_applicant_profile('Synthetic',null,null,null,null)$$,'22023','Complete your full name and international phone number','missing profile phone denied');
select throws_ok($$select public.save_applicant_profile(' ','+6591234567',null,null,null)$$,'22023','Complete your full name and international phone number','blank name denied');
select throws_ok($$select public.save_applicant_profile('Synthetic','91234567',null,null,null)$$,'22023','Complete your full name and international phone number','unformatted phone denied');
select lives_ok($$select public.save_applicant_profile('Synthetic','+6591234567',null,null,null)$$,'required profile saves');
select throws_ok($$select public.save_applicant_profile('Synthetic','+123',null,null,null)$$,'22023','Complete your full name and international phone number','short international value denied');
select throws_ok($$select public.save_applicant_profile('Synthetic','+1234567890123456',null,null,null)$$,'22023','Complete your full name and international phone number','oversized international value denied');
select throws_ok($$select public.save_application_details_v3('52000000-0000-4000-8000-000000000101','Letter','Synthetic','abc',null,null,null,null)$$,'22023','Enter a valid international phone number','supplied draft phone uses the same format boundary');
select lives_ok($$select public.save_application_details_v3('52000000-0000-4000-8000-000000000101','Letter','Synthetic',null,null,null,null,null)$$,'complete profile may save incomplete draft');
select throws_ok($$select public.submit_application_details_v3('52000000-0000-4000-8000-000000000101','Letter','Synthetic',null,null,null,null,1)$$,'22023','Full name and international phone are required before submitting','submission requires phone despite completed profile');
select is((select submission_state from public.applications where job_id='52000000-0000-4000-8000-000000000101'),'draft','invalid submission leaves saved draft unchanged');
select lives_ok($$select public.submit_application_details_v3('52000000-0000-4000-8000-000000000101','Letter','Synthetic','+6591234567',null,null,null,1)$$,'complete details submit');
reset role;
select ok(application_private.profile_ready('52000000-0000-4000-8000-000000000001'),'valid persisted profile ready');
select throws_ok($$update public.applicant_profiles set phone=null where user_id='52000000-0000-4000-8000-000000000001'$$,'22023','Complete your full name and international phone number','even privileged accidental clear denied');
-- A pre-migration submitted snapshot is immutable and may have an old phone format.
insert into public.jobs(id,title,team,category,description,requirements,status,published_at)
values('52000000-0000-4000-8000-000000000102','Legacy role','Synthetic','engineering','Synthetic','Synthetic','published',now());
alter table public.applications disable trigger z_applications_required_profile;
insert into public.applications(job_id,applicant_id,job_title,cover_letter,original_submitted_letter,submission_state,submitted_at,full_name,phone,submitted_email,review_status,review_revision)
values('52000000-0000-4000-8000-000000000102','52000000-0000-4000-8000-000000000001','Legacy role','Legacy letter','Legacy letter','submitted',now(),'Legacy Applicant','555','onboarding52@example.test','submitted',1);
alter table public.applications enable trigger z_applications_required_profile;
set local role authenticated;
select set_config('request.jwt.claim.sub','52000000-0000-4000-8000-000000000001',true);
select lives_ok($$select public.withdraw_application((select id from public.applications where job_id='52000000-0000-4000-8000-000000000102'))$$,'completed owner can withdraw unchanged legacy phone snapshot');
select is((select phone from public.applications where job_id='52000000-0000-4000-8000-000000000102'),'555','withdrawal does not rewrite legacy phone');
select ok((select withdrawn_at is not null from public.applications where job_id='52000000-0000-4000-8000-000000000102'),'legacy withdrawal is persisted');
reset role;
select * from finish();
rollback;
