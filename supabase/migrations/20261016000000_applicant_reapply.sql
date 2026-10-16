-- #90: Allow applicants to withdraw and reapply without deleting application records
-- Replace whole-table unique constraint with partial unique index enforcing one active application per applicant per job

alter table public.applications
  drop constraint if exists applications_one_per_applicant_job;

create unique index if not exists applications_one_active_per_applicant_job
  on public.applications (applicant_id, job_id)
  where (withdrawn_at is null);

-- Update write_application_details_v3 to check active (non-withdrawn) application
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
  if v_job.id is null or v_job.status <> 'published'
     or (v_job.opens_at is not null and v_job.opens_at > clock_timestamp())
     or (v_job.closes_at is not null and v_job.closes_at <= clock_timestamp()) then
    raise exception 'Job is not open for applications' using errcode = 'P0001';
  end if;
  select * into v_existing from public.applications where applicant_id = v_user_id and job_id = p_job_id and withdrawn_at is null for update;
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

-- Update lock_resume_draft to lock active (non-withdrawn) application
create or replace function application_private.lock_resume_draft(p_actor uuid, p_job uuid, p_revision integer)
returns public.applications language plpgsql security definer set search_path = '' as $$
declare v_app public.applications; v_job public.jobs;
begin
 perform application_private.verified_resume_actor(p_actor);
 perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended(p_actor::text || p_job::text, 0));
 select * into v_job from public.jobs where id = p_job for update;
 if v_job.id is null or v_job.status <> 'published'
    or (v_job.opens_at is not null and v_job.opens_at > clock_timestamp())
    or (v_job.closes_at is not null and v_job.closes_at <= clock_timestamp()) then
   raise exception 'Job is not open for applications';
 end if;
 select * into v_app from public.applications where applicant_id = p_actor and job_id = p_job and withdrawn_at is null for update;
 if not found or v_app.submission_state <> 'draft' then raise exception 'Editable saved draft required'; end if;
 if v_app.revision is distinct from p_revision then raise exception 'Application changed; reload before saving'; end if;
 return v_app;
end;
$$;

-- Update prepare_application_resume to find active (non-withdrawn) application
create or replace function public.prepare_application_resume(
  p_actor uuid, p_job uuid, p_revision integer, p_operation uuid,
  p_filename text, p_size integer, p_sha256 text
) returns jsonb language plpgsql security definer set search_path = '' as $$
declare v_app public.applications; v_obj public.application_resume_objects; v_job public.jobs; v_path text;
begin
 perform application_private.verified_resume_actor(p_actor);
 perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended(p_actor::text || p_job::text, 0));
 select * into v_job from public.jobs where id = p_job for update;
 select * into v_app from public.applications where applicant_id = p_actor and job_id = p_job and withdrawn_at is null for update;
 select * into v_obj from public.application_resume_objects where id = p_operation;
 if found then
  if v_obj.application_id is distinct from v_app.id or v_obj.applicant_id is distinct from p_actor
   or v_obj.filename is distinct from p_filename or v_obj.byte_size is distinct from p_size or v_obj.sha256 is distinct from p_sha256 then
   raise exception 'Upload operation cannot be reused'; end if;
  if v_obj.state = 'ready' and v_app.resume_id = v_obj.id then
   return jsonb_build_object('id', v_app.id, 'revision', v_app.revision, 'object_path', v_obj.object_path, 'state', 'ready');
  end if;
  if v_obj.state = 'pending' and (p_revision is null or p_revision = v_obj.expected_revision) then p_revision := v_obj.expected_revision; end if;
 end if;
 if v_job.id is null or v_job.status <> 'published'
    or (v_job.opens_at is not null and v_job.opens_at > clock_timestamp())
    or (v_job.closes_at is not null and v_job.closes_at <= clock_timestamp()) then
   raise exception 'Job is not open for applications';
 end if;
 if v_app.id is null then
  if p_revision is not null then raise exception 'Application changed; reload before uploading'; end if;
  insert into public.applications (applicant_id, job_id, job_title, cover_letter, submission_state)
   values (p_actor, p_job, v_job.title, '', 'draft') returning * into v_app;
  p_revision := v_app.revision;
 end if;
 v_path := public.reserve_application_resume(p_actor, p_job, p_revision, p_operation, p_filename, p_size, p_sha256);
 return jsonb_build_object('id', v_app.id, 'revision', p_revision, 'object_path', v_path, 'state', 'pending');
end;
$$;

-- Update finalize_application_resume to select active (non-withdrawn) application
create or replace function public.finalize_application_resume(p_actor uuid, p_job uuid, p_revision integer, p_operation uuid)
returns uuid language plpgsql security definer set search_path = '' as $$
declare v_app public.applications; v_obj public.application_resume_objects;
begin
 perform application_private.verified_resume_actor(p_actor);
 perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended(p_actor::text || p_job::text, 0));
 perform 1 from public.jobs where id = p_job for update;
 select * into v_app from public.applications where applicant_id = p_actor and job_id = p_job and withdrawn_at is null for update;
 select * into v_obj from public.application_resume_objects where id = p_operation for update;
 -- Reconcile only this immutable object after a lost committed response, including after submission/closure.
 if v_obj.state = 'ready' and v_app.resume_id = v_obj.id and v_obj.application_id = v_app.id and v_obj.applicant_id = p_actor then return v_obj.id; end if;
 v_app := application_private.lock_resume_draft(p_actor, p_job, p_revision);
 if v_obj.state is distinct from 'pending' or v_obj.application_id is distinct from v_app.id or v_obj.applicant_id is distinct from p_actor
  or v_obj.expected_revision is distinct from p_revision then raise exception 'Upload cannot be finalized'; end if;
 if not exists(select 1 from storage.objects where bucket_id = 'application-resumes' and name = v_obj.object_path) then raise exception 'Upload is incomplete'; end if;
 update public.application_resume_objects set state = 'retired' where id = v_app.resume_id;
 update public.application_resume_objects set state = 'ready' where id = v_obj.id;
 update public.applications set resume_id = v_obj.id, revision = revision + 1, updated_at = now() where id = v_app.id;
 return v_obj.id;
end;
$$;

-- Update cancel_application_resume to select active (non-withdrawn) application
create or replace function public.cancel_application_resume(p_actor uuid, p_job uuid, p_operation uuid default null)
returns void language plpgsql security definer set search_path = '' as $$
declare v_app public.applications;
begin
 perform application_private.verified_resume_actor(p_actor);
 perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended(p_actor::text || p_job::text, 0));
 perform 1 from public.jobs where id = p_job for update;
 select * into v_app from public.applications where applicant_id = p_actor and job_id = p_job and withdrawn_at is null for update;
 if not found then raise exception 'Application unavailable'; end if;
 update public.application_resume_objects set state = 'retired' where application_id = v_app.id and applicant_id = p_actor
  and state = 'pending' and (p_operation is null or id = p_operation);
end;
$$;

-- Update claim_resume_cleanup to select active (non-withdrawn) application
create or replace function public.claim_resume_cleanup(p_actor uuid, p_job uuid)
returns table(id uuid, object_path text) language plpgsql security definer set search_path = '' as $$
declare v_app public.applications;
begin
 perform application_private.verified_resume_actor(p_actor);
 perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended(p_actor::text || p_job::text, 0));
 perform 1 from public.jobs where public.jobs.id = p_job for update;
 select * into v_app from public.applications where applicant_id = p_actor and job_id = p_job and withdrawn_at is null for update;
 if not found then return; end if;
 return query update public.application_resume_objects r set state = 'deleting' where r.application_id = v_app.id and r.applicant_id = p_actor
  and r.state in ('retired', 'deleting') and not exists(select 1 from public.applications a where a.resume_id = r.id)
  returning r.id, r.object_path;
end;
$$;

revoke all on function public.finalize_application_resume(uuid, uuid, integer, uuid),
 public.cancel_application_resume(uuid, uuid, uuid),
 public.claim_resume_cleanup(uuid, uuid) from public, anon, authenticated;
grant execute on function public.finalize_application_resume(uuid, uuid, integer, uuid),
 public.cancel_application_resume(uuid, uuid, uuid),
 public.claim_resume_cleanup(uuid, uuid) to service_role;

-- Update legacy v2 wrappers to query active (non-withdrawn) application
create or replace function public.save_application_details_v2(p_job_id uuid, p_cover_letter text, p_full_name text, p_phone text, p_portfolio_url text, p_expected_revision integer default null)
returns uuid language sql security definer set search_path = '' as $$
 select application_private.write_application_details_v3(p_job_id, p_cover_letter, p_full_name, p_phone, p_portfolio_url,
  (select education from public.applications where applicant_id = auth.uid() and job_id = p_job_id and withdrawn_at is null),
  (select work_experience from public.applications where applicant_id = auth.uid() and job_id = p_job_id and withdrawn_at is null), p_expected_revision, false);
$$;

create or replace function public.submit_application_details_v2(p_job_id uuid, p_cover_letter text, p_full_name text, p_phone text, p_portfolio_url text, p_expected_revision integer default null)
returns uuid language sql security definer set search_path = '' as $$
 select application_private.write_application_details_v3(p_job_id, p_cover_letter, p_full_name, p_phone, p_portfolio_url,
  (select education from public.applications where applicant_id = auth.uid() and job_id = p_job_id and withdrawn_at is null),
  (select work_experience from public.applications where applicant_id = auth.uid() and job_id = p_job_id and withdrawn_at is null), p_expected_revision, true);
$$;

revoke all on function public.save_application_details_v2(uuid, text, text, text, text, integer),
 public.submit_application_details_v2(uuid, text, text, text, text, integer) from public, anon;
grant execute on function public.save_application_details_v2(uuid, text, text, text, text, integer),
 public.submit_application_details_v2(uuid, text, text, text, text, integer) to authenticated;

