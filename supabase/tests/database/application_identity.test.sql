begin;
create extension if not exists pgtap with schema extensions;
set local search_path=public,extensions;
select no_plan();
insert into auth.users(id,instance_id,aud,role,email,encrypted_password,email_confirmed_at) values
 ('12500000-0000-4000-8000-000000000001','00000000-0000-0000-0000-000000000000','authenticated','authenticated','identity-owner@example.test','',now()),
 ('12500000-0000-4000-8000-000000000002','00000000-0000-0000-0000-000000000000','authenticated','authenticated','identity-other@example.test','',now());
insert into public.applicant_profiles(user_id,full_name,phone) values
 ('12500000-0000-4000-8000-000000000001','Synthetic Owner','+6591234567'),
 ('12500000-0000-4000-8000-000000000002','Synthetic Other','+6591234568');
insert into public.jobs(id,title,team,category,description,requirements,status,published_at) values
 ('12500000-0000-4000-8000-000000000101','Identity role','Synthetic','engineering','Synthetic','Synthetic','published',now()),
 ('12500000-0000-4000-8000-000000000102','First upload role','Synthetic','engineering','Synthetic','Synthetic','published',now());
set local role authenticated;
select set_config('request.jwt.claim.sub','12500000-0000-4000-8000-000000000001',true);
select set_config('test.old_application',public.save_application_details_v3(null::uuid,'12500000-0000-4000-8000-000000000101','Old draft','Synthetic Owner','+6591234567',null,null,null,null)::text,true);
select public.submit_application_details_v3(current_setting('test.old_application')::uuid,'12500000-0000-4000-8000-000000000101','Old submission','Synthetic Owner','+6591234567',null,null,null,1);
select public.withdraw_application(current_setting('test.old_application')::uuid);
select set_config('test.new_application',public.save_application_details_v3(null::uuid,'12500000-0000-4000-8000-000000000101','New independent draft','Synthetic Owner','+6591234567',null,null,null,null)::text,true);
select is((select revision from public.applications where id=current_setting('test.new_application')::uuid),1,'regression uses the same revision as the old open form');
select throws_ok($$select public.save_application_details_v3(current_setting('test.old_application')::uuid,'12500000-0000-4000-8000-000000000101','Stale overwrite','Synthetic Owner','+6591234567',null,null,null,1)$$,'P0001','Application changed; reload before saving','old Save cannot overwrite the new application');
select throws_ok($$select public.submit_application_details_v3(current_setting('test.old_application')::uuid,'12500000-0000-4000-8000-000000000101','Stale submit','Synthetic Owner','+6591234567',null,null,null,1)$$,'P0001','Application changed; reload before saving','old Submit cannot submit the new application');
select is((select cover_letter from public.applications where id=current_setting('test.new_application')::uuid),'New independent draft','new fields unchanged after stale writes');
select is((select submission_state from public.applications where id=current_setting('test.new_application')::uuid),'draft','new submission state unchanged');
select throws_ok($$select public.save_application_details_v3('12500000-0000-4000-8000-000000000101','Legacy overwrite','Synthetic Owner','+6591234567',null,null,null,1)$$,'42501',null,'identity-less browser API is denied');

reset role;
set local role service_role;
select throws_ok($$select public.prepare_application_resume(current_setting('test.old_application')::uuid,'12500000-0000-4000-8000-000000000001','12500000-0000-4000-8000-000000000101',1,'12500000-0000-4000-8000-000000000201','synthetic.pdf',20,repeat('a',64))$$,'P0001',null,'old upload cannot target the new draft');
select throws_ok($$select public.remove_application_resume(current_setting('test.old_application')::uuid,'12500000-0000-4000-8000-000000000001','12500000-0000-4000-8000-000000000101',1)$$,'P0001',null,'old removal cannot target the new draft');
select throws_ok($$select public.recover_pending_application_resume(current_setting('test.old_application')::uuid,'12500000-0000-4000-8000-000000000001','12500000-0000-4000-8000-000000000101',1)$$,'P0001',null,'old recovery cannot target the new draft');
select throws_ok($$select public.prepare_application_resume('12500000-0000-4000-8000-000000000001','12500000-0000-4000-8000-000000000101',1,'12500000-0000-4000-8000-000000000201','synthetic.pdf',20,repeat('a',64))$$,'42501',null,'identity-less service upload is denied');
select lives_ok($$select public.prepare_application_resume(current_setting('test.new_application')::uuid,'12500000-0000-4000-8000-000000000001','12500000-0000-4000-8000-000000000101',1,'12500000-0000-4000-8000-000000000202','synthetic.pdf',20,repeat('b',64))$$,'current draft can reserve a file');
select lives_ok($$select public.cancel_application_resume(current_setting('test.old_application')::uuid,'12500000-0000-4000-8000-000000000001','12500000-0000-4000-8000-000000000101','12500000-0000-4000-8000-000000000202')$$,'cleanup request stays bound to the old record');
select is((select state from public.application_resume_objects where id='12500000-0000-4000-8000-000000000202'),'pending','old cancellation does not retire the new pending upload');
select is((select count(*) from public.claim_resume_cleanup(current_setting('test.old_application')::uuid,'12500000-0000-4000-8000-000000000001','12500000-0000-4000-8000-000000000101')),0::bigint,'old cleanup cannot claim new objects');
select throws_ok($$select public.finalize_application_resume(current_setting('test.old_application')::uuid,'12500000-0000-4000-8000-000000000001','12500000-0000-4000-8000-000000000101',1,'12500000-0000-4000-8000-000000000202')$$,'P0001',null,'old finalization cannot act on new application');
select throws_ok($$select public.prepare_application_resume(null::uuid,'12500000-0000-4000-8000-000000000001','12500000-0000-4000-8000-000000000101',null,'12500000-0000-4000-8000-000000000203','synthetic.pdf',20,repeat('b',64))$$,'P0001',null,'null identity cannot adopt an unrelated draft');
select lives_ok($$select public.prepare_application_resume(null::uuid,'12500000-0000-4000-8000-000000000001','12500000-0000-4000-8000-000000000102',null,'12500000-0000-4000-8000-000000000204','first.pdf',20,repeat('c',64))$$,'first upload still allocates without Save draft');
select lives_ok($$select public.prepare_application_resume(null::uuid,'12500000-0000-4000-8000-000000000001','12500000-0000-4000-8000-000000000102',null,'12500000-0000-4000-8000-000000000204','first.pdf',20,repeat('c',64))$$,'lost first response reconciles the same operation without reload');
select throws_ok($$select public.prepare_application_resume(null::uuid,'12500000-0000-4000-8000-000000000001','12500000-0000-4000-8000-000000000102',null,'12500000-0000-4000-8000-000000000204','different.pdf',20,repeat('d',64))$$,'P0001',null,'operation reconciliation still validates the file fingerprint');
select throws_ok($$select public.prepare_application_resume(current_setting('test.new_application')::uuid,'12500000-0000-4000-8000-000000000002','12500000-0000-4000-8000-000000000101',1,'12500000-0000-4000-8000-000000000205','foreign.pdf',20,repeat('d',64))$$,'P0001',null,'other owner cannot use the application identity');
reset role;
select is((select cover_letter from public.applications where id=current_setting('test.old_application')::uuid),'Old submission','withdrawn history remains unchanged');
select * from finish();
rollback;
