-- Additive review data. This migration must remain compatible with the older Applicant app on develop.
alter table public.applications
  add column review_status text,
  add column review_revision integer not null default 0;

update public.applications
  set review_status = 'submitted', review_revision = 1
  where submission_state = 'submitted';

alter table public.applications
  add constraint applications_review_shape check (
    (submission_state = 'draft' and review_status is null and review_revision = 0)
    or (submission_state = 'submitted' and review_status in
      ('submitted', 'in_review', 'shortlisted', 'rejected') and review_revision > 0)
  );

create index applications_review_queue_idx on public.applications (submitted_at desc)
  where submission_state = 'submitted';

create table public.application_notes (
  id uuid primary key default gen_random_uuid(),
  application_id uuid not null references public.applications(id) on delete cascade,
  author_id uuid not null references public.profiles(user_id),
  body text not null check (char_length(btrim(body)) between 1 and 2000),
  created_at timestamptz not null default now()
);
create index application_notes_application_idx on public.application_notes (application_id, created_at, id);

create table public.application_status_events (
  id uuid primary key default gen_random_uuid(),
  application_id uuid not null references public.applications(id) on delete cascade,
  actor_id uuid not null references public.profiles(user_id),
  from_status text not null check (from_status in ('submitted', 'in_review', 'shortlisted', 'rejected')),
  to_status text not null check (to_status in ('in_review', 'shortlisted', 'rejected')),
  outcome text not null default 'changed' check (outcome = 'changed'),
  created_at timestamptz not null default now()
);
create index application_status_events_application_idx on public.application_status_events (application_id, created_at, id);

alter table public.application_notes enable row level security;
alter table public.application_status_events enable row level security;
revoke all on table public.application_notes, public.application_status_events from public, anon, authenticated;
grant select on table public.application_notes, public.application_status_events to authenticated;

create or replace function public.current_user_is_hr()
returns boolean language sql stable security definer set search_path = '' as $$
  select exists (
    select 1 from public.profiles p join auth.users u on u.id = p.user_id
    where p.user_id = (select auth.uid()) and p.role = 'hr'
      and u.email_confirmed_at is not null
  );
$$;

create function public.current_user_is_applicant()
returns boolean language sql stable security definer set search_path = '' as $$
  select exists (
    select 1 from public.profiles p join auth.users u on u.id = p.user_id
    where p.user_id = (select auth.uid()) and p.role = 'applicant'
      and u.email_confirmed_at is not null
  );
$$;
revoke all on function public.current_user_is_applicant() from public, anon;
grant execute on function public.current_user_is_applicant() to authenticated;

drop policy "Owners read their applications and HR reads submitted applications" on public.applications;
create policy "Verified Applicants read own applications; HR reads submitted"
  on public.applications for select to authenticated using (
    (applicant_id = (select auth.uid()) and (select public.current_user_is_applicant()))
    or (submission_state = 'submitted' and (select public.current_user_is_hr()))
  );

create policy "HR reads private application notes" on public.application_notes
  for select to authenticated using ((select public.current_user_is_hr()));
create policy "HR reads application status events" on public.application_status_events
  for select to authenticated using ((select public.current_user_is_hr()));

create function public.require_verified_hr()
returns uuid language plpgsql stable security definer set search_path = '' as $$
declare v_user_id uuid := auth.uid();
begin
  if v_user_id is null or not public.current_user_is_hr() then
    raise exception 'Verified HR account required' using errcode = '42501';
  end if;
  return v_user_id;
end;
$$;
revoke all on function public.require_verified_hr() from public, anon, authenticated;

create function public.append_hr_application_note(p_application_id uuid, p_body text)
returns uuid language plpgsql security definer set search_path = '' as $$
declare
  v_actor uuid := public.require_verified_hr();
  v_id uuid;
begin
  if p_body is null or char_length(pg_catalog.btrim(p_body)) = 0 or char_length(p_body) > 2000 then
    raise exception 'Invalid HR note' using errcode = '22023';
  end if;
  perform 1 from public.applications
    where id = p_application_id and submission_state = 'submitted' for update;
  if not found then
    raise exception 'Submitted application not found' using errcode = 'P0001';
  end if;
  insert into public.application_notes (application_id, author_id, body)
    values (p_application_id, v_actor, p_body) returning id into v_id;
  return v_id;
end;
$$;

create function public.change_hr_application_status(
  p_application_id uuid, p_status text, p_expected_revision integer
) returns integer language plpgsql security definer set search_path = '' as $$
declare
  v_actor uuid := public.require_verified_hr();
  v_application public.applications%rowtype;
  v_revision integer;
begin
  if p_status is null or p_status not in ('in_review', 'shortlisted', 'rejected') then
    raise exception 'Invalid review status' using errcode = '22023';
  end if;
  select * into v_application from public.applications
    where id = p_application_id and submission_state = 'submitted' for update;
  if not found then
    raise exception 'Submitted application not found' using errcode = 'P0001';
  end if;
  if p_expected_revision is distinct from v_application.review_revision
    or p_status = v_application.review_status then
    raise exception 'Application changed; reload before updating status' using errcode = 'P0001';
  end if;
  update public.applications set review_status = p_status,
    review_revision = review_revision + 1, updated_at = now()
    where id = p_application_id returning review_revision into v_revision;
  insert into public.application_status_events
    (application_id, actor_id, from_status, to_status)
    values (p_application_id, v_actor, v_application.review_status, p_status);
  return v_revision;
end;
$$;

revoke all on function public.append_hr_application_note(uuid, text),
  public.change_hr_application_status(uuid, text, integer) from public, anon;
grant execute on function public.append_hr_application_note(uuid, text),
  public.change_hr_application_status(uuid, text, integer) to authenticated;

-- Keep the existing RPC signature so the deployed develop app remains compatible.
create or replace function public.submit_application(
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
      submitted_at = now(), updated_at = now(), revision = revision + 1,
      review_status = 'submitted', review_revision = 1
      where id = v_existing.id returning id into v_id;
  else
    if p_expected_revision is not null then
      raise exception 'Application changed; reload before submitting' using errcode = 'P0001';
    end if;
    insert into public.applications (
      applicant_id, job_id, job_title, submission_state, cover_letter,
      original_submitted_letter, submitted_at, review_status, review_revision
    ) values (
      v_user_id, p_job_id, v_job.title, 'submitted', p_cover_letter,
      p_cover_letter, now(), 'submitted', 1
    ) returning id into v_id;
  end if;
  return v_id;
end;
$$;
