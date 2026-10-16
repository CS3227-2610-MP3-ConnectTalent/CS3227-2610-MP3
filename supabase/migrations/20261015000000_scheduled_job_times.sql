-- #88: HR Scheduled job opening and closing times
alter table public.jobs
  add column opens_at timestamptz,
  add column closes_at timestamptz,
  add constraint jobs_schedule_window check (
    closes_at is null or opens_at is null or closes_at > opens_at
  );

drop policy "Published jobs are publicly readable" on public.jobs;
create policy "Published jobs are publicly readable"
  on public.jobs
  for select
  to anon, authenticated
  using (
    status = 'published'
    and (opens_at is null or opens_at <= clock_timestamp())
    and (closes_at is null or closes_at > clock_timestamp())
  );

create or replace function private.validate_hr_job_fields(
  p_title text, p_team text, p_category text, p_description text, p_requirements text,
  p_opens_at timestamptz, p_closes_at timestamptz
) returns void language plpgsql immutable set search_path = '' as $$
begin
  if p_title is null or pg_catalog.char_length(pg_catalog.btrim(p_title)) not between 1 and 160
    or p_team is null or pg_catalog.char_length(pg_catalog.btrim(p_team)) not between 1 and 120
    or p_description is null or pg_catalog.char_length(pg_catalog.btrim(p_description)) not between 1 and 10000
    or p_requirements is null or pg_catalog.char_length(pg_catalog.btrim(p_requirements)) not between 1 and 10000
    or p_category is null or p_category not in ('engineering', 'human_resources', 'legal', 'sales', 'other') then
    raise exception 'Invalid job fields' using errcode = '22023';
  end if;
  if p_opens_at is not null and p_closes_at is not null and p_closes_at <= p_opens_at then
    raise exception 'Closing time must be after opening time' using errcode = '22023';
  end if;
end;
$$;

create or replace function private.validate_hr_job_fields(
  p_title text, p_team text, p_category text, p_description text, p_requirements text
) returns void language sql immutable set search_path = '' as $$
  select private.validate_hr_job_fields(p_title, p_team, p_category, p_description, p_requirements, null::timestamptz, null::timestamptz);
$$;

create or replace function private.create_hr_job_draft(
  p_title text, p_team text, p_category text, p_description text, p_requirements text,
  p_opens_at timestamptz, p_closes_at timestamptz
) returns uuid language plpgsql security definer set search_path = '' as $$
declare v_id uuid;
begin
  perform public.require_verified_hr();
  perform private.validate_hr_job_fields(p_title, p_team, p_category, p_description, p_requirements, p_opens_at, p_closes_at);
  insert into public.jobs (title, team, category, description, requirements, status, opens_at, closes_at)
    values (pg_catalog.btrim(p_title), pg_catalog.btrim(p_team), p_category,
      pg_catalog.btrim(p_description), pg_catalog.btrim(p_requirements), 'draft', p_opens_at, p_closes_at)
    returning id into v_id;
  return v_id;
end;
$$;

create or replace function private.create_hr_job_draft(
  p_title text, p_team text, p_category text, p_description text, p_requirements text
) returns uuid language sql security definer set search_path = '' as $$
  select private.create_hr_job_draft(p_title, p_team, p_category, p_description, p_requirements, null::timestamptz, null::timestamptz);
$$;

create or replace function private.edit_hr_job_draft(
  p_job_id uuid, p_title text, p_team text, p_category text, p_description text, p_requirements text,
  p_opens_at timestamptz, p_closes_at timestamptz
) returns uuid language plpgsql security definer set search_path = '' as $$
begin
  perform public.require_verified_hr();
  perform private.validate_hr_job_fields(p_title, p_team, p_category, p_description, p_requirements, p_opens_at, p_closes_at);
  perform 1 from public.jobs where id = p_job_id and status = 'draft' for update;
  if not found then
    raise exception 'Draft job not found' using errcode = 'P0001';
  end if;
  update public.jobs set title = pg_catalog.btrim(p_title), team = pg_catalog.btrim(p_team),
    category = p_category, description = pg_catalog.btrim(p_description),
    requirements = pg_catalog.btrim(p_requirements),
    opens_at = p_opens_at, closes_at = p_closes_at
    where id = p_job_id;
  return p_job_id;
end;
$$;

create or replace function private.edit_hr_job_draft(
  p_job_id uuid, p_title text, p_team text, p_category text, p_description text, p_requirements text
) returns uuid language sql security definer set search_path = '' as $$
  select private.edit_hr_job_draft(p_job_id, p_title, p_team, p_category, p_description, p_requirements, null::timestamptz, null::timestamptz);
$$;

create or replace function private.unpublish_hr_job(p_job_id uuid)
returns uuid language plpgsql security definer set search_path = '' as $$
declare v_job public.jobs%rowtype;
begin
  perform public.require_verified_hr();
  select * into v_job from public.jobs where id = p_job_id and status = 'published' for update;
  if not found then
    raise exception 'Published job not found' using errcode = 'P0001';
  end if;
  if v_job.opens_at is null or v_job.opens_at <= clock_timestamp() then
    raise exception 'Cannot revert a job that has already opened' using errcode = 'P0001';
  end if;
  update public.jobs set status = 'draft', published_at = null where id = p_job_id;
  return p_job_id;
end;
$$;

revoke all on function private.validate_hr_job_fields(text, text, text, text, text),
  private.validate_hr_job_fields(text, text, text, text, text, timestamptz, timestamptz),
  private.create_hr_job_draft(text, text, text, text, text),
  private.create_hr_job_draft(text, text, text, text, text, timestamptz, timestamptz),
  private.edit_hr_job_draft(uuid, text, text, text, text, text),
  private.edit_hr_job_draft(uuid, text, text, text, text, text, timestamptz, timestamptz),
  private.unpublish_hr_job(uuid) from public, anon, authenticated;
grant execute on function private.create_hr_job_draft(text, text, text, text, text),
  private.create_hr_job_draft(text, text, text, text, text, timestamptz, timestamptz),
  private.edit_hr_job_draft(uuid, text, text, text, text, text),
  private.edit_hr_job_draft(uuid, text, text, text, text, text, timestamptz, timestamptz),
  private.unpublish_hr_job(uuid) to authenticated;

-- Public invoker wrappers
create or replace function public.create_hr_job_draft(
  p_title text, p_team text, p_category text, p_description text, p_requirements text,
  p_opens_at timestamptz, p_closes_at timestamptz
) returns uuid language sql security invoker set search_path = '' as $$
  select private.create_hr_job_draft(p_title, p_team, p_category, p_description, p_requirements, p_opens_at, p_closes_at);
$$;

create or replace function public.create_hr_job_draft(
  p_title text, p_team text, p_category text, p_description text, p_requirements text
) returns uuid language sql security invoker set search_path = '' as $$
  select private.create_hr_job_draft(p_title, p_team, p_category, p_description, p_requirements, null::timestamptz, null::timestamptz);
$$;

create or replace function public.edit_hr_job_draft(
  p_job_id uuid, p_title text, p_team text, p_category text, p_description text, p_requirements text,
  p_opens_at timestamptz, p_closes_at timestamptz
) returns uuid language sql security invoker set search_path = '' as $$
  select private.edit_hr_job_draft(p_job_id, p_title, p_team, p_category, p_description, p_requirements, p_opens_at, p_closes_at);
$$;

create or replace function public.edit_hr_job_draft(
  p_job_id uuid, p_title text, p_team text, p_category text, p_description text, p_requirements text
) returns uuid language sql security invoker set search_path = '' as $$
  select private.edit_hr_job_draft(p_job_id, p_title, p_team, p_category, p_description, p_requirements, null::timestamptz, null::timestamptz);
$$;

create or replace function public.unpublish_hr_job(p_job_id uuid)
returns uuid language sql security invoker set search_path = '' as $$
  select private.unpublish_hr_job(p_job_id);
$$;

revoke all on function public.create_hr_job_draft(text, text, text, text, text),
  public.create_hr_job_draft(text, text, text, text, text, timestamptz, timestamptz),
  public.edit_hr_job_draft(uuid, text, text, text, text, text),
  public.edit_hr_job_draft(uuid, text, text, text, text, text, timestamptz, timestamptz),
  public.unpublish_hr_job(uuid) from public, anon, authenticated;
grant execute on function public.create_hr_job_draft(text, text, text, text, text),
  public.create_hr_job_draft(text, text, text, text, text, timestamptz, timestamptz),
  public.edit_hr_job_draft(uuid, text, text, text, text, text),
  public.edit_hr_job_draft(uuid, text, text, text, text, text, timestamptz, timestamptz),
  public.unpublish_hr_job(uuid) to authenticated;

-- Update application submission/drafting to enforce active schedule window
create or replace function application_private.write_application_details_v3(
  p_job_id uuid, p_cover_letter text, p_full_name text, p_phone text, p_portfolio_url text,
  p_education text, p_work_experience text, p_expected_revision integer, p_submit boolean
) returns uuid language plpgsql security definer set search_path = '' as $$
declare
  v_user_id uuid := public.require_verified_applicant();
  v_job public.jobs%rowtype;
  v_existing public.applications%rowtype;
  v_id uuid;
  v_email text;
  v_name text := application_private.trim_field(coalesce(p_full_name, ''));
  v_phone text := nullif(application_private.trim_field(p_phone), '');
  v_url text := nullif(application_private.trim_field(p_portfolio_url), '');
begin
  if p_cover_letter is null or char_length(p_cover_letter) > 5000
    or (p_submit and char_length(application_private.trim_field(p_cover_letter)) = 0) then
    raise exception 'Enter a cover letter of at most 5,000 characters' using errcode = '22023';
  end if;
  if char_length(v_name) > 120 or coalesce(p_full_name, '') ~ '[[:cntrl:]]'
    or (p_submit and v_name = '') then
    raise exception 'Enter a valid full name' using errcode = '22023';
  end if;
  if char_length(v_phone) > 40 or p_phone ~ '[[:cntrl:]]' then
    raise exception 'Enter a valid phone' using errcode = '22023';
  end if;
  if p_portfolio_url ~ '[[:cntrl:]]' or not application_private.valid_portfolio_url(v_url) then
    raise exception 'Enter a valid portfolio URL' using errcode = '22023';
  end if;
  if not application_private.valid_background(p_education) or not application_private.valid_background(p_work_experience) then raise exception 'Enter background of at most 2,000 characters' using errcode='22023'; end if;
  if p_submit then
    select email into v_email from auth.users where id = v_user_id and email_confirmed_at is not null;
    if v_email is null or v_email = '' then raise exception 'Verified account email required' using errcode = '42501'; end if;
  end if;
  perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended(v_user_id::text || p_job_id::text, 0));
  select * into v_job from public.jobs where id = p_job_id for update;
  if not found or v_job.status <> 'published'
     or (v_job.opens_at is not null and v_job.opens_at > clock_timestamp())
     or (v_job.closes_at is not null and v_job.closes_at <= clock_timestamp()) then
    raise exception 'Job is not open for applications' using errcode = 'P0001';
  end if;
  select * into v_existing from public.applications where applicant_id = v_user_id and job_id = p_job_id for update;
  if found then
    if v_existing.submission_state <> 'draft' then raise exception 'Application already submitted' using errcode = 'P0001'; end if;
    if p_expected_revision is distinct from v_existing.revision then
      raise exception '%', case when p_submit then 'Application changed; reload before submitting' else 'Application changed; reload before saving' end using errcode = 'P0001';
    end if;
    update public.applications set cover_letter = p_cover_letter, full_name = v_name, phone = v_phone, portfolio_url = v_url,
      education = nullif(application_private.trim_field(p_education), ''), work_experience = nullif(application_private.trim_field(p_work_experience), ''),
      submitted_email = v_email, submission_state = case when p_submit then 'submitted' else 'draft' end,
      original_submitted_letter = case when p_submit then p_cover_letter else null end,
      submitted_at = case when p_submit then now() else null end,
      review_status = case when p_submit then 'submitted' else null end,
      review_revision = case when p_submit then 1 else review_revision end,
      revision = revision + 1, updated_at = now()
      where id = v_existing.id returning id into v_id;
  else
    if p_expected_revision is not null then
      raise exception '%', case when p_submit then 'Application changed; reload before submitting' else 'Application changed; reload before saving' end using errcode = 'P0001';
    end if;
    insert into public.applications (applicant_id, job_id, job_title, cover_letter, full_name, phone, portfolio_url,
      education, work_experience, submitted_email, submission_state, original_submitted_letter, submitted_at, review_status, review_revision)
    values (v_user_id, p_job_id, v_job.title, p_cover_letter, v_name, v_phone, v_url,
      nullif(application_private.trim_field(p_education), ''), nullif(application_private.trim_field(p_work_experience), ''), v_email,
      case when p_submit then 'submitted' else 'draft' end, case when p_submit then p_cover_letter else null end,
      case when p_submit then now() else null end, case when p_submit then 'submitted' else null end,
      case when p_submit then 1 else 0 end) returning id into v_id;
  end if;
  return v_id;
end;
$$;
