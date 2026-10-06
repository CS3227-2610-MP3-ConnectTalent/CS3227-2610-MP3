-- Synthetic postings for local development. HR posting controls are a later feature.
insert into public.jobs (id, title, team, category, description, requirements, status, published_at)
values
  (
    '00000000-0000-4000-8000-000000000101',
    'Software Engineer',
    'Digital Products',
    'engineering',
    'Build accessible web tools that help people complete everyday tasks. Work with designers and teammates to turn clear requirements into reliable features.',
    'Experience with TypeScript and React. Ability to design APIs, write tests, and explain technical choices to teammates.',
    'published',
    now() - interval '2 days'
  ),
  (
    '00000000-0000-4000-8000-000000000102',
    'People Operations Associate',
    'People Operations',
    'human_resources',
    'Support recruitment and onboarding processes. Keep candidate communications clear and handle personal information carefully.',
    'Strong written communication, attention to detail, and experience coordinating work across teams.',
    'published',
    now() - interval '1 day'
  ),
  (
    '00000000-0000-4000-8000-000000000103',
    'Sales Operations Analyst',
    'Revenue Operations',
    'sales',
    'Improve the tools and reporting used by the sales team. Turn operational data into practical recommendations.',
    'Comfort with spreadsheets or SQL, careful data handling, and clear communication with stakeholders.',
    'published',
    now()
  ),
  (
    '00000000-0000-4000-8000-000000000104',
    'Legal Counsel',
    'Legal',
    'legal',
    'Sample draft posting, intentionally hidden from the public careers site.',
    'Sample draft requirements.',
    'draft',
    null
  ),
  (
    '00000000-0000-4000-8000-000000000105',
    'Product Designer',
    'Design',
    'other',
    'Sample closed posting, intentionally hidden from the public careers site.',
    'Sample closed requirements.',
    'closed',
    now() - interval '30 days'
  )
on conflict (id) do nothing;
