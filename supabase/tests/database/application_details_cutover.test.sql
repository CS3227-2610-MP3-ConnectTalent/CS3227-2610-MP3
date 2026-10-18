begin;
create extension if not exists pgtap with schema extensions;
set local search_path = public, extensions;
select plan(2);
select ok(not has_function_privilege('authenticated', 'public.save_application_draft(uuid,text,integer)', 'EXECUTE'), 'legacy draft writes cannot bypass contact-field contract');
select ok(not has_function_privilege('authenticated', 'public.submit_application(uuid,text,integer)', 'EXECUTE'), 'legacy submission cannot bypass required full name');
select * from finish();
rollback;
