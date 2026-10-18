begin;

create extension if not exists pgtap with schema extensions;
set local search_path = public, extensions;

insert into public.jobs (id, title, team, category, description, requirements, status, published_at)
values
  ('00000000-0000-4000-8000-000000000901', 'Public Engineer', 'Engineering', 'engineering', 'Visible.', 'Requirements.', 'published', now()),
  ('00000000-0000-4000-8000-000000000902', 'Public Sales', 'Sales', 'sales', 'Visible.', 'Requirements.', 'published', now()),
  ('00000000-0000-4000-8000-000000000903', 'Draft Lawyer', 'Legal', 'legal', 'Hidden.', 'Requirements.', 'draft', null),
  ('00000000-0000-4000-8000-000000000904', 'Closed Designer', 'Design', 'other', 'Hidden.', 'Requirements.', 'closed', now());

select plan(7);

set local role anon;
select is(
  (select count(*) from public.jobs where id::text like '00000000-0000-4000-8000-00000000090%'),
  2::bigint,
  'anonymous visitors see only published jobs'
);
select is(
  (select count(*) from public.jobs where id = '00000000-0000-4000-8000-000000000903'),
  0::bigint,
  'a draft job cannot be read by direct ID'
);
select is(
  (select count(*) from public.jobs where id = '00000000-0000-4000-8000-000000000904'),
  0::bigint,
  'a closed job cannot be read by direct ID'
);
select is(
  (select count(*) from public.jobs where id::text like '00000000-0000-4000-8000-00000000090%' and category = 'engineering'),
  1::bigint,
  'category filtering keeps only matching published jobs'
);
select ok(
  not has_table_privilege('anon', 'public.jobs', 'INSERT'),
  'anonymous visitors cannot insert jobs'
);

set local role authenticated;
select is(
  (select count(*) from public.jobs where id::text like '00000000-0000-4000-8000-00000000090%'),
  2::bigint,
  'signed-in applicants also see only published jobs'
);
select ok(
  not has_table_privilege('authenticated', 'public.jobs', 'UPDATE'),
  'applicants cannot edit jobs'
);

select * from finish();
rollback;
