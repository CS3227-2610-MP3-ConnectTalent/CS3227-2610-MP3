create table public.profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  role text not null default 'applicant' check (role in ('applicant', 'hr')),
  created_at timestamptz not null default now()
);

create function public.create_applicant_profile()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  insert into public.profiles (user_id, role) values (new.id, 'applicant');
  return new;
end;
$$;

revoke all on function public.create_applicant_profile() from public, anon, authenticated;
create trigger create_applicant_profile_after_signup
  after insert on auth.users for each row execute function public.create_applicant_profile();
insert into public.profiles (user_id, role)
  select id, 'applicant' from auth.users on conflict (user_id) do nothing;

create table public.applications (
  id uuid primary key default gen_random_uuid(),
  applicant_id uuid not null references public.profiles(user_id) on delete cascade,
  job_id uuid not null references public.jobs(id),
  job_title text not null,
  submission_state text not null default 'draft' check (submission_state in ('draft', 'submitted')),
  cover_letter text not null default '' check (char_length(cover_letter) <= 5000),
  original_submitted_letter text check (original_submitted_letter is null or char_length(original_submitted_letter) <= 5000),
  submitted_at timestamptz,
  updated_at timestamptz not null default now(),
  revision integer not null default 1 check (revision > 0),
  constraint applications_one_per_applicant_job unique (applicant_id, job_id),
  constraint applications_submission_shape check (
    (submission_state = 'draft' and submitted_at is null and original_submitted_letter is null)
    or (submission_state = 'submitted' and submitted_at is not null
      and original_submitted_letter is not null
      and char_length(btrim(cover_letter)) > 0
      and char_length(btrim(original_submitted_letter)) > 0)
  )
);

create index applications_applicant_updated_idx on public.applications (applicant_id, updated_at desc);
create index applications_submitted_job_idx on public.applications (job_id, submitted_at desc)
  where submission_state = 'submitted';

alter table public.profiles enable row level security;
alter table public.applications enable row level security;
revoke all on table public.profiles, public.applications from anon, authenticated;
grant select on table public.profiles, public.applications to authenticated;

create function public.current_user_is_hr()
returns boolean language sql stable security definer set search_path = '' as $$
  select exists (
    select 1 from public.profiles
    where user_id = (select auth.uid()) and role = 'hr'
  );
$$;
revoke all on function public.current_user_is_hr() from public, anon;
grant execute on function public.current_user_is_hr() to authenticated;

create policy "Users read their own profile" on public.profiles
  for select to authenticated using (user_id = (select auth.uid()));
create policy "Owners read their applications and HR reads submitted applications"
  on public.applications for select to authenticated
  using (applicant_id = (select auth.uid())
    or (submission_state = 'submitted' and (select public.current_user_is_hr())));

create function public.require_verified_applicant()
returns uuid language plpgsql stable security definer set search_path = '' as $$
declare v_user_id uuid := auth.uid();
begin
  if v_user_id is null or not exists (
    select 1 from public.profiles p join auth.users u on u.id = p.user_id
    where p.user_id = v_user_id and p.role = 'applicant' and u.email_confirmed_at is not null
  ) then
    raise exception 'Verified Applicant account required' using errcode = '42501';
  end if;
  return v_user_id;
end;
$$;
revoke all on function public.require_verified_applicant() from public, anon, authenticated;

create function public.save_application_draft(
  p_job_id uuid, p_cover_letter text, p_expected_revision integer default null
) returns uuid language plpgsql security definer set search_path = '' as $$
declare
  v_user_id uuid := public.require_verified_applicant();
  v_job public.jobs%rowtype;
  v_existing public.applications%rowtype;
  v_id uuid;
begin
  if p_cover_letter is null or char_length(p_cover_letter) > 5000 then
    raise exception 'Cover letter must be at most 5,000 characters' using errcode = '22023';
  end if;
  perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended(v_user_id::text || p_job_id::text, 0));
  select * into v_job from public.jobs where id = p_job_id for update;
  if not found or v_job.status <> 'published' then
    raise exception 'Job is not open for applications' using errcode = 'P0001';
  end if;
  select * into v_existing from public.applications
    where applicant_id = v_user_id and job_id = p_job_id for update;
  if found then
    if v_existing.submission_state <> 'draft' then
      raise exception 'Application already submitted' using errcode = 'P0001';
    end if;
    if p_expected_revision is distinct from v_existing.revision then
      raise exception 'Application changed; reload before saving' using errcode = 'P0001';
    end if;
    update public.applications set cover_letter = p_cover_letter,
      revision = revision + 1, updated_at = now()
      where id = v_existing.id returning id into v_id;
  else
    if p_expected_revision is not null then
      raise exception 'Application changed; reload before saving' using errcode = 'P0001';
    end if;
    insert into public.applications (applicant_id, job_id, job_title, cover_letter)
      values (v_user_id, p_job_id, v_job.title, p_cover_letter) returning id into v_id;
  end if;
  return v_id;
end;
$$;

create function public.submit_application(
  p_job_id uuid, p_cover_letter text, p_expected_revision integer default null
) returns uuid language plpgsql security definer set search_path = '' as $$
declare
  v_user_id uuid := public.require_verified_applicant();
  v_job public.jobs%rowtype;
  v_existing public.applications%rowtype;
  v_id uuid;
begin
  if p_cover_letter is null or char_length(pg_catalog.btrim(p_cover_letter)) = 0
    or char_length(p_cover_letter) > 5000 then
    raise exception 'Enter a cover letter of at most 5,000 characters' using errcode = '22023';
  end if;
  perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended(v_user_id::text || p_job_id::text, 0));
  select * into v_job from public.jobs where id = p_job_id for update;
  if not found or v_job.status <> 'published' then
    raise exception 'Job is not open for applications' using errcode = 'P0001';
  end if;
  select * into v_existing from public.applications
    where applicant_id = v_user_id and job_id = p_job_id for update;
  if found then
    if v_existing.submission_state <> 'draft' then
      raise exception 'Application already submitted' using errcode = 'P0001';
    end if;
    if p_expected_revision is distinct from v_existing.revision then
      raise exception 'Application changed; reload before submitting' using errcode = 'P0001';
    end if;
    update public.applications set submission_state = 'submitted',
      cover_letter = p_cover_letter, original_submitted_letter = p_cover_letter,
      submitted_at = now(), updated_at = now(), revision = revision + 1
      where id = v_existing.id returning id into v_id;
  else
    if p_expected_revision is not null then
      raise exception 'Application changed; reload before submitting' using errcode = 'P0001';
    end if;
    insert into public.applications (
      applicant_id, job_id, job_title, submission_state, cover_letter,
      original_submitted_letter, submitted_at
    ) values (
      v_user_id, p_job_id, v_job.title, 'submitted', p_cover_letter,
      p_cover_letter, now()
    ) returning id into v_id;
  end if;
  return v_id;
end;
$$;

create function public.edit_submitted_letter(
  p_job_id uuid, p_cover_letter text, p_expected_revision integer
) returns uuid language plpgsql security definer set search_path = '' as $$
declare
  v_user_id uuid := public.require_verified_applicant();
  v_job public.jobs%rowtype;
  v_existing public.applications%rowtype;
begin
  if p_cover_letter is null or char_length(pg_catalog.btrim(p_cover_letter)) = 0
    or char_length(p_cover_letter) > 5000 then
    raise exception 'Enter a cover letter of at most 5,000 characters' using errcode = '22023';
  end if;
  select * into v_job from public.jobs where id = p_job_id for update;
  if not found or v_job.status <> 'published' then
    raise exception 'Job is not open for edits' using errcode = 'P0001';
  end if;
  select * into v_existing from public.applications
    where applicant_id = v_user_id and job_id = p_job_id for update;
  if not found or v_existing.submission_state <> 'submitted' then
    raise exception 'Submitted application not found' using errcode = 'P0001';
  end if;
  if p_expected_revision is distinct from v_existing.revision then
    raise exception 'Application changed; reload before editing' using errcode = 'P0001';
  end if;
  update public.applications set cover_letter = p_cover_letter,
    updated_at = now(), revision = revision + 1 where id = v_existing.id;
  return v_existing.id;
end;
$$;

revoke all on function public.save_application_draft(uuid, text, integer),
  public.submit_application(uuid, text, integer),
  public.edit_submitted_letter(uuid, text, integer) from public, anon;
grant execute on function public.save_application_draft(uuid, text, integer),
  public.submit_application(uuid, text, integer),
  public.edit_submitted_letter(uuid, text, integer) to authenticated;
