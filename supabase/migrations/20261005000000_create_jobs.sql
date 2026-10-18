create table public.jobs (
  id uuid primary key default gen_random_uuid(),
  title text not null check (char_length(btrim(title)) between 1 and 160),
  team text not null check (char_length(btrim(team)) between 1 and 120),
  description text not null check (char_length(btrim(description)) between 1 and 10000),
  requirements text not null check (char_length(btrim(requirements)) between 1 and 10000),
  category text not null check (category in ('engineering', 'human_resources', 'legal', 'sales', 'other')),
  status text not null default 'draft' check (status in ('draft', 'published', 'closed')),
  created_at timestamptz not null default now(),
  published_at timestamptz,
  constraint jobs_publication_time check (
    (status = 'draft' and published_at is null)
    or (status in ('published', 'closed') and published_at is not null)
  )
);

create index jobs_published_category_date_idx
  on public.jobs (category, published_at desc)
  where status = 'published';

alter table public.jobs enable row level security;

-- A publishable key may read public postings but cannot write jobs.
revoke all on table public.jobs from anon, authenticated;
grant select on table public.jobs to anon, authenticated;

create policy "Published jobs are publicly readable"
  on public.jobs
  for select
  to anon, authenticated
  using (status = 'published');
