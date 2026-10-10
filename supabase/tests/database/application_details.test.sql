begin;
create extension if not exists pgtap with schema extensions;
set local search_path = public, extensions;
select no_plan();
select ok(not application_private.valid_portfolio_url('https://999.999.999.999.'), 'portfolio rejects invalid IPv4 with trailing dot');
select ok(not application_private.valid_portfolio_url('https://0x999999999.'), 'portfolio rejects malformed numeric host with trailing dot');
select ok(not application_private.valid_portfolio_url('https://%'), 'portfolio rejects malformed percent authority');
select ok(not application_private.valid_portfolio_url('https://999.999.999.999'), 'portfolio rejects invalid IPv4');
select ok(not application_private.valid_portfolio_url('http://@example.test'), 'portfolio rejects empty credential authority');
select ok(not application_private.valid_portfolio_url('https://0x999999999'), 'portfolio rejects nonstandard numeric host');
select ok(application_private.valid_portfolio_url('https://example.test:'), 'portfolio accepts safe empty port');
insert into auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at) values
 ('39000000-0000-4000-8000-000000000001','00000000-0000-0000-0000-000000000000','authenticated','authenticated','form39-owner@example.test','',now()),
 ('39000000-0000-4000-8000-000000000002','00000000-0000-0000-0000-000000000000','authenticated','authenticated','form39-other@example.test','',now()),
 ('39000000-0000-4000-8000-000000000003','00000000-0000-0000-0000-000000000000','authenticated','authenticated','form39-hr@example.test','',now()),
 ('39000000-0000-4000-8000-000000000004','00000000-0000-0000-0000-000000000000','authenticated','authenticated','form39-unverified@example.test','',null);
-- Completed synthetic profile fixtures for #52; no real-data backfill.
insert into public.applicant_profiles(user_id,full_name,phone) values ('39000000-0000-4000-8000-000000000001','Fixture Applicant','+6591234567'),('39000000-0000-4000-8000-000000000002','Fixture Applicant','+6591234567'),('39000000-0000-4000-8000-000000000003','Fixture Applicant','+6591234567'),('39000000-0000-4000-8000-000000000004','Fixture Applicant','+6591234567') on conflict(user_id) do nothing;
update public.profiles set role='hr' where user_id='39000000-0000-4000-8000-000000000003';
insert into public.jobs (id,title,team,category,description,requirements,status,published_at) values
 ('39000000-0000-4000-8000-000000000101','Contact role','Platform','engineering','Synthetic','Synthetic','published',now()),
 ('39000000-0000-4000-8000-000000000102','Private role','Platform','engineering','Synthetic','Synthetic','published',now()),
 ('39000000-0000-4000-8000-000000000103','Legacy role','Platform','engineering','Synthetic','Synthetic','published',now());
select set_config('request.jwt.claim.sub','39000000-0000-4000-8000-000000000001',true);
-- Simulate a pre-#52 legacy row only; restore the new guard immediately afterward.
alter table public.applications disable trigger z_applications_required_profile;
insert into public.applications (applicant_id,job_id,job_title,submission_state,cover_letter,original_submitted_letter,submitted_at,review_status,review_revision)
 values ('39000000-0000-4000-8000-000000000001','39000000-0000-4000-8000-000000000103','Legacy role','submitted','Legacy letter','Legacy letter',now(),'submitted',1);
alter table public.applications enable trigger z_applications_required_profile;
select is((select full_name from public.applications where job_title='Legacy role'),null::text,'legacy submitted rows are not backfilled');
select ok(not has_function_privilege('anon','public.submit_application_details_v2(uuid,text,text,text,text,integer)','EXECUTE'),'anonymous cannot execute new submission');
select ok(not has_schema_privilege('authenticated','application_private','USAGE'),'private implementation is not available to signed-in roles');
select ok(not has_table_privilege('authenticated','public.applications','UPDATE'),'direct table updates remain denied');
set local role authenticated;
select set_config('request.jwt.claim.sub','39000000-0000-4000-8000-000000000004',true);
select throws_ok($$select public.submit_application_details_v2('39000000-0000-4000-8000-000000000101','Letter','Name','+6591234567',null,null)$$,'42501','Verified Applicant account required','unverified user cannot submit');
select set_config('request.jwt.claim.sub','39000000-0000-4000-8000-000000000001',true);
select throws_ok($$select public.submit_application_details_v2('39000000-0000-4000-8000-000000000101','Letter',chr(160)||chr(8195),'+6591234567',null,null)$$,'22023','Enter a valid full name','Unicode whitespace cannot bypass required name');
select lives_ok($$select public.save_application_details_v2('39000000-0000-4000-8000-000000000101','Partial','',null,null,null)$$,'partial draft has optional name');
select is((select submitted_email from public.applications where job_title='Contact role'),null::text,'draft does not snapshot email');
select throws_ok($$select public.submit_application_details_v2('39000000-0000-4000-8000-000000000101','Letter','','+6591234567',null,1)$$,'22023','Enter a valid full name','submit requires name');
select throws_ok($$select public.save_application_details_v2('39000000-0000-4000-8000-000000000101','Letter',repeat('x',121),null,null,1)$$,'22023','Enter a valid full name','database bounds name');
select throws_ok($$select public.save_application_details_v2('39000000-0000-4000-8000-000000000101','Letter','Name',repeat('x',41),null,1)$$,'22023','Enter a valid phone','database bounds phone');
select throws_ok($$select public.save_application_details_v2('39000000-0000-4000-8000-000000000101','Letter','Name',E'12\t34',null,1)$$,'22023','Enter a valid phone','database rejects controls');
select throws_ok($$select public.save_application_details_v2('39000000-0000-4000-8000-000000000101','Letter','Name',null,'javascript:alert(1)',1)$$,'22023','Enter a valid portfolio URL','database rejects unsafe schemes');
select throws_ok($$select public.save_application_details_v2('39000000-0000-4000-8000-000000000101','Letter','Name',null,'https://user:secret@example.test',1)$$,'22023','Enter a valid portfolio URL','database rejects embedded credentials');
select is((select revision from public.applications where job_title='Contact role'),1,'invalid writes do not change revision');
select lives_ok($$select public.save_application_details_v2('39000000-0000-4000-8000-000000000101','Ready','  Synthetic Name  ',' +6591234567 ',' https://example.test/work ',1)$$,'draft fields save together');
select is((select full_name||':'||phone||':'||portfolio_url from public.applications where job_title='Contact role'),'Synthetic Name:+6591234567:https://example.test/work','normalized details persist together');
select throws_ok($$select public.submit_application_details_v2('39000000-0000-4000-8000-000000000101','Letter','Name','+6591234567',null,1)$$,'P0001','Application changed; reload before submitting','stale submission does not overwrite draft');
select lives_ok($$select public.submit_application_details_v2('39000000-0000-4000-8000-000000000101','Frozen letter','Synthetic Name','+6591234567','https://example.test/work',2)$$,'complete application submits atomically');
select is((select submitted_email from public.applications where job_title='Contact role'),'form39-owner@example.test','email comes from verified Auth user');
select is((select revision from public.applications where job_title='Contact role'),3,'submission advances one complete revision');
select throws_ok($$select public.save_application_details_v2('39000000-0000-4000-8000-000000000101','Different','Different',null,null,3)$$,'P0001','Application already submitted','submitted details cannot be overwritten via save RPC');
select throws_ok($$select public.submit_application_details_v2('39000000-0000-4000-8000-000000000101','Different','Different','+6591234567',null,3)$$,'P0001','Application already submitted','duplicate submit cannot mutate fields');
select lives_ok($$select public.save_application_details_v2('39000000-0000-4000-8000-000000000102','Private','Private Name','+6591234567','https://example.test/private',null)$$,'owner retains another private draft');
select set_config('request.jwt.claim.sub','39000000-0000-4000-8000-000000000002',true);
select is((select count(*) from public.applications where job_id in ('39000000-0000-4000-8000-000000000101','39000000-0000-4000-8000-000000000102')),0::bigint,'other Applicant cannot read contact fields');
select set_config('request.jwt.claim.sub','39000000-0000-4000-8000-000000000003',true);
select is((select count(*) from public.applications where job_id='39000000-0000-4000-8000-000000000102'),0::bigint,'HR cannot read draft contacts');
select is((select full_name from public.applications where job_title='Contact role'),'Synthetic Name','HR can read submitted contact snapshot');
select throws_ok($$select public.save_application_details_v2('39000000-0000-4000-8000-000000000102','Attack','HR',null,null,null)$$,'42501','Verified Applicant account required','HR cannot invoke Applicant writes');
select is((select count(*) from public.application_submission_events where application_id=(select id from public.applications where job_title='Contact role')),1::bigint,'submission writes one audit event');
select ok(not exists(select 1 from public.application_submission_events e where e.application_id=(select id from public.applications where job_title='Contact role') and row_to_json(e)::text ~ 'Synthetic Name|form39-owner|example.test/work'),'audit contains no structured contact values');
reset role;
select throws_ok($$update public.applications set full_name='Changed' where job_title='Contact role'$$,'42501','Submitted applications are locked','freeze also prevents accidental privileged contact edits');
select throws_ok($$update public.applications set submitted_email='spoof@example.test' where job_title='Contact role'$$,'42501','Submitted applications are locked','snapshot email cannot be changed');
update public.jobs set status='closed' where id='39000000-0000-4000-8000-000000000102';
set local role authenticated;
select set_config('request.jwt.claim.sub','39000000-0000-4000-8000-000000000001',true);
select throws_ok($$select public.save_application_details_v2('39000000-0000-4000-8000-000000000102','Changed','Name',null,null,1)$$,'P0001','Job is not open for applications','closed job rejects draft details');
select throws_ok($$select public.submit_application_details_v2('39000000-0000-4000-8000-000000000102','Changed','Name','+6591234567',null,1)$$,'P0001','Job is not open for applications','closed job rejects submission');
select is((select full_name from public.applications where job_title='Private role'),'Private Name','closed draft remains unchanged and readable by owner');
reset role;
select * from finish();
rollback;
