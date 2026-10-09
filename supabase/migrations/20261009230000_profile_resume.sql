-- #44 private profiles and optional application PDF lifecycle. No historical backfill.
create function application_private.valid_background(p_text text)
returns boolean language sql immutable set search_path = '' as $$
 select p_text is null or (char_length(p_text) <= 2000 and
   regexp_replace(p_text, E'[\n\r\t]', '', 'g') !~ '[[:cntrl:]]');
$$;
revoke all on function application_private.valid_background(text) from public, anon, authenticated;

create table public.applicant_profiles (
 user_id uuid primary key references auth.users(id) on delete cascade,
 full_name text, phone text, portfolio_url text, education text, work_experience text,
 updated_at timestamptz not null default now(),
 check (full_name is null or (char_length(full_name)<=120 and full_name !~ '[[:cntrl:]]')),
 check (phone is null or (char_length(phone)<=40 and phone !~ '[[:cntrl:]]')),
 check (application_private.valid_portfolio_url(portfolio_url)),
 check (application_private.valid_background(education)),
 check (application_private.valid_background(work_experience))
);
alter table public.applicant_profiles enable row level security;
revoke all on public.applicant_profiles from public, anon, authenticated;
grant select on public.applicant_profiles to authenticated;
create policy applicant_profile_owner on public.applicant_profiles for select to authenticated
 using (user_id=(select auth.uid()) and (select public.current_user_is_applicant()));

create function public.save_applicant_profile(p_full_name text, p_phone text, p_portfolio_url text, p_education text, p_work_experience text)
returns void language plpgsql security definer set search_path = '' as $$
declare v_actor uuid := public.require_verified_applicant();
begin
 if coalesce(p_full_name,'') ~ '[[:cntrl:]]' or coalesce(p_phone,'') ~ '[[:cntrl:]]'
  or coalesce(p_portfolio_url,'') ~ '[[:cntrl:]]' then raise exception 'Enter valid profile contact fields' using errcode='22023'; end if;
 insert into public.applicant_profiles(user_id,full_name,phone,portfolio_url,education,work_experience)
 values(v_actor, nullif(application_private.trim_field(p_full_name),''),nullif(application_private.trim_field(p_phone),''),
 nullif(application_private.trim_field(p_portfolio_url),''),nullif(application_private.trim_field(p_education),''),nullif(application_private.trim_field(p_work_experience),''))
 on conflict(user_id) do update set full_name=excluded.full_name,phone=excluded.phone,portfolio_url=excluded.portfolio_url,
 education=excluded.education,work_experience=excluded.work_experience,updated_at=now();
end;
$$;
revoke all on function public.save_applicant_profile(text,text,text,text,text) from public,anon,authenticated;
grant execute on function public.save_applicant_profile(text,text,text,text,text) to authenticated;

alter table public.applications add column education text, add column work_experience text, add column resume_id uuid,
 add constraint education_bound check(application_private.valid_background(education)),
 add constraint work_experience_bound check(application_private.valid_background(work_experience));

create table public.application_resume_objects (
 id uuid primary key,
 application_id uuid not null references public.applications(id) on delete cascade,
 applicant_id uuid not null references auth.users(id) on delete restrict,
 object_path text not null unique,
 filename text not null check(char_length(filename) between 1 and 120 and filename !~ '[[:cntrl:]]'),
 byte_size integer not null check(byte_size between 1 and 1048576),
 sha256 text not null check(sha256 ~ '^[0-9a-f]{64}$'),
 expected_revision integer not null check(expected_revision>0),
 state text not null default 'pending' check(state in ('pending','ready','retired','deleting','deleted')),
 created_at timestamptz not null default now(),
 check(object_path=application_id::text||'/'||id::text||'.pdf')
);
create index resume_application on public.application_resume_objects(application_id);
create unique index resume_one_pending on public.application_resume_objects(application_id) where state='pending';
create index resume_cleanup on public.application_resume_objects(created_at) where state in ('retired','deleting');
alter table public.applications add constraint application_resume_reference foreign key(resume_id) references public.application_resume_objects(id);
alter table public.application_resume_objects enable row level security;
revoke all on public.application_resume_objects from public,anon,authenticated;
grant select on public.application_resume_objects to authenticated;
create policy finalized_resume_visible on public.application_resume_objects for select to authenticated using (
 state='ready' and exists(select 1 from public.applications a where a.id=application_resume_objects.application_id and a.resume_id=application_resume_objects.id)
);

insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types)
 values('application-resumes','application-resumes',false,1048576,array['application/pdf'])
 on conflict(id) do update set public=false,file_size_limit=1048576,allowed_mime_types=array['application/pdf'];
create policy finalized_resume_download on storage.objects for select to authenticated using (
 bucket_id='application-resumes' and exists(select 1 from public.application_resume_objects r where r.object_path=name and r.state='ready')
);
-- There are no browser INSERT/UPDATE/DELETE policies for this bucket.

create function application_private.verified_resume_actor(p_actor uuid)
returns void language plpgsql security definer set search_path = '' as $$
begin
 if not exists(select 1 from auth.users u join public.profiles p on p.user_id=u.id
  where u.id=p_actor and u.email_confirmed_at is not null and p.role='applicant') then
  raise exception 'Verified Applicant account required' using errcode='42501';
 end if;
end;
$$;
revoke all on function application_private.verified_resume_actor(uuid) from public,anon,authenticated;

-- Every mutation shares the same advisory -> job -> application lock order as application writes.
create function application_private.lock_resume_draft(p_actor uuid,p_job uuid,p_revision integer)
returns public.applications language plpgsql security definer set search_path = '' as $$
declare v_app public.applications; v_status text;
begin
 perform application_private.verified_resume_actor(p_actor);
 perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended(p_actor::text||p_job::text,0));
 select status into v_status from public.jobs where id=p_job for update;
 if v_status is distinct from 'published' then raise exception 'Job is not open for applications'; end if;
 select * into v_app from public.applications where applicant_id=p_actor and job_id=p_job for update;
 if not found or v_app.submission_state<>'draft' then raise exception 'Editable saved draft required'; end if;
 if v_app.revision is distinct from p_revision then raise exception 'Application changed; reload before saving'; end if;
 return v_app;
end;
$$;
revoke all on function application_private.lock_resume_draft(uuid,uuid,integer) from public,anon,authenticated;

create function public.reserve_application_resume(p_actor uuid,p_job uuid,p_revision integer,p_operation uuid,p_filename text,p_size integer,p_sha256 text)
returns text language plpgsql security definer set search_path = '' as $$
declare v_app public.applications; v_old public.application_resume_objects; v_path text;
begin
 v_app:=application_private.lock_resume_draft(p_actor,p_job,p_revision);
 select * into v_old from public.application_resume_objects where id=p_operation;
 if found then
  if v_old.application_id=v_app.id and v_old.applicant_id=p_actor and v_old.state='pending' and v_old.sha256=p_sha256
   and v_old.filename=p_filename and v_old.byte_size=p_size then return v_old.object_path; end if;
  raise exception 'Upload operation cannot be reused';
 end if;
 v_path:=v_app.id::text||'/'||p_operation::text||'.pdf';
 insert into public.application_resume_objects(id,application_id,applicant_id,object_path,filename,byte_size,sha256,expected_revision)
 values(p_operation,v_app.id,p_actor,v_path,p_filename,p_size,p_sha256,p_revision);
 return v_path;
end;
$$;

create function public.finalize_application_resume(p_actor uuid,p_job uuid,p_revision integer,p_operation uuid)
returns uuid language plpgsql security definer set search_path = '' as $$
declare v_app public.applications; v_obj public.application_resume_objects;
begin
 perform application_private.verified_resume_actor(p_actor);
 perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended(p_actor::text||p_job::text,0));
 perform 1 from public.jobs where id=p_job for update;
 select * into v_app from public.applications where applicant_id=p_actor and job_id=p_job for update;
 select * into v_obj from public.application_resume_objects where id=p_operation for update;
 -- Reconcile only this immutable object after a lost committed response, including after submission/closure.
 if v_obj.state='ready' and v_app.resume_id=v_obj.id and v_obj.application_id=v_app.id and v_obj.applicant_id=p_actor then return v_obj.id; end if;
 v_app:=application_private.lock_resume_draft(p_actor,p_job,p_revision);
 if v_obj.state is distinct from 'pending' or v_obj.application_id is distinct from v_app.id or v_obj.applicant_id is distinct from p_actor
  or v_obj.expected_revision is distinct from p_revision then raise exception 'Upload cannot be finalized'; end if;
 if not exists(select 1 from storage.objects where bucket_id='application-resumes' and name=v_obj.object_path) then raise exception 'Upload is incomplete'; end if;
 update public.application_resume_objects set state='retired' where id=v_app.resume_id;
 update public.application_resume_objects set state='ready' where id=v_obj.id;
 update public.applications set resume_id=v_obj.id,revision=revision+1,updated_at=now() where id=v_app.id;
 return v_obj.id;
end;
$$;

create function public.remove_application_resume(p_actor uuid,p_job uuid,p_revision integer)
returns void language plpgsql security definer set search_path = '' as $$
declare v_app public.applications;
begin
 v_app:=application_private.lock_resume_draft(p_actor,p_job,p_revision);
 if exists(select 1 from public.application_resume_objects where application_id=v_app.id and state='pending') then raise exception 'An upload is pending'; end if;
 update public.applications set resume_id=null,revision=revision+1,updated_at=now() where id=v_app.id;
 update public.application_resume_objects set state='retired' where id=v_app.resume_id;
end;
$$;

create function public.cancel_application_resume(p_actor uuid,p_job uuid,p_operation uuid default null)
returns void language plpgsql security definer set search_path = '' as $$
declare v_app public.applications;
begin
 perform application_private.verified_resume_actor(p_actor);
 perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended(p_actor::text||p_job::text,0));
 perform 1 from public.jobs where id=p_job for update;
 select * into v_app from public.applications where applicant_id=p_actor and job_id=p_job for update;
 if not found then raise exception 'Application unavailable'; end if;
 update public.application_resume_objects set state='retired' where application_id=v_app.id and applicant_id=p_actor
 and state='pending' and (p_operation is null or id=p_operation);
end;
$$;

-- Claim makes an object permanently ineligible for finalization before the Storage DELETE.
create function public.claim_resume_cleanup(p_actor uuid,p_job uuid)
returns table(id uuid,object_path text) language plpgsql security definer set search_path = '' as $$
declare v_app public.applications;
begin
 perform application_private.verified_resume_actor(p_actor);
 perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended(p_actor::text||p_job::text,0));
 perform 1 from public.jobs where public.jobs.id=p_job for update;
 select * into v_app from public.applications where applicant_id=p_actor and job_id=p_job for update;
 if not found then return; end if;
 return query update public.application_resume_objects r set state='deleting' where r.application_id=v_app.id and r.applicant_id=p_actor
 and r.state in ('retired','deleting') and not exists(select 1 from public.applications a where a.resume_id=r.id)
 returning r.id,r.object_path;
end;
$$;

create function application_private.freeze_resume_background()
returns trigger language plpgsql set search_path = '' as $$
begin
 if old.submission_state='submitted' and (new.education is distinct from old.education or new.work_experience is distinct from old.work_experience
 or new.resume_id is distinct from old.resume_id) then raise exception 'Submitted applications are locked' using errcode='42501'; end if;
 if new.resume_id is not null and not exists(select 1 from public.application_resume_objects r
  where r.id=new.resume_id and r.application_id=new.id and r.applicant_id=new.applicant_id and r.state='ready') then
  raise exception 'Invalid attachment reference' using errcode='42501'; end if;
 if old.submission_state='draft' and new.submission_state='submitted' and exists(select 1 from public.application_resume_objects
  where application_id=old.id and state='pending') then raise exception 'Finish or cancel the pending upload before submitting'; end if;
 return new;
end;
$$;
revoke all on function application_private.freeze_resume_background() from public,anon,authenticated;
create trigger applications_freeze_resume_background before update on public.applications for each row execute function application_private.freeze_resume_background();

revoke all on function public.reserve_application_resume(uuid,uuid,integer,uuid,text,integer,text),
 public.finalize_application_resume(uuid,uuid,integer,uuid), public.remove_application_resume(uuid,uuid,integer),
 public.cancel_application_resume(uuid,uuid,uuid),public.claim_resume_cleanup(uuid,uuid) from public,anon,authenticated;
grant execute on function public.reserve_application_resume(uuid,uuid,integer,uuid,text,integer,text),
 public.finalize_application_resume(uuid,uuid,integer,uuid), public.remove_application_resume(uuid,uuid,integer),
 public.cancel_application_resume(uuid,uuid,uuid),public.claim_resume_cleanup(uuid,uuid) to service_role;
create function application_private.write_application_details_v3(
  p_job_id uuid, p_cover_letter text, p_full_name text, p_phone text,
  p_portfolio_url text, p_education text, p_work_experience text, p_expected_revision integer, p_submit boolean
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
  if not found or v_job.status <> 'published' then
    raise exception 'Job is not open for applications' using errcode = 'P0001';
  end if;
  select * into v_existing from public.applications where applicant_id = v_user_id and job_id = p_job_id for update;
  if found then
    if v_existing.submission_state <> 'draft' then raise exception 'Application already submitted' using errcode = 'P0001'; end if;
    if p_expected_revision is distinct from v_existing.revision then
      raise exception '%', case when p_submit then 'Application changed; reload before submitting' else 'Application changed; reload before saving' end using errcode = 'P0001';
    end if;
    update public.applications set cover_letter = p_cover_letter, full_name = v_name, phone = v_phone, portfolio_url = v_url,
      education = nullif(application_private.trim_field(p_education), ''), work_experience = nullif(application_private.trim_field(p_work_experience), ''), submitted_email = v_email, submission_state = case when p_submit then 'submitted' else 'draft' end,
      original_submitted_letter = case when p_submit then p_cover_letter else null end,
      submitted_at = case when p_submit then now() else null end,
      review_status = case when p_submit then 'submitted' else null end,
      review_revision = case when p_submit then 1 else review_revision end,
      revision = revision + 1, updated_at = now()
      where id = v_existing.id returning id into v_id;
  else
    if p_expected_revision is not null then raise exception '%', case when p_submit then 'Application changed; reload before submitting' else 'Application changed; reload before saving' end using errcode = 'P0001'; end if;
    insert into public.applications (applicant_id, job_id, job_title, cover_letter, full_name, phone, portfolio_url,
      education, work_experience, submitted_email, submission_state, original_submitted_letter, submitted_at, review_status, review_revision)
    values (v_user_id, p_job_id, v_job.title, p_cover_letter, v_name, v_phone, v_url, nullif(application_private.trim_field(p_education), ''), nullif(application_private.trim_field(p_work_experience), ''), v_email,
      case when p_submit then 'submitted' else 'draft' end, case when p_submit then p_cover_letter else null end,
      case when p_submit then now() else null end, case when p_submit then 'submitted' else null end,
      case when p_submit then 1 else 0 end) returning id into v_id;
  end if;
  return v_id;
end;
$$;
revoke all on function application_private.write_application_details_v3(uuid,text,text,text,text,text,text,integer,boolean) from public, anon, authenticated;


create function public.save_application_details_v3(p_job_id uuid,p_cover_letter text,p_full_name text,p_phone text,p_portfolio_url text,p_education text,p_work_experience text,p_expected_revision integer default null)
returns uuid language sql security definer set search_path='' as $$
 select application_private.write_application_details_v3(p_job_id,p_cover_letter,p_full_name,p_phone,p_portfolio_url,p_education,p_work_experience,p_expected_revision,false);
$$;
create function public.submit_application_details_v3(p_job_id uuid,p_cover_letter text,p_full_name text,p_phone text,p_portfolio_url text,p_education text,p_work_experience text,p_expected_revision integer default null)
returns uuid language sql security definer set search_path='' as $$
 select application_private.write_application_details_v3(p_job_id,p_cover_letter,p_full_name,p_phone,p_portfolio_url,p_education,p_work_experience,p_expected_revision,true);
$$;
revoke all on function public.save_application_details_v3(uuid,text,text,text,text,text,text,integer),public.submit_application_details_v3(uuid,text,text,text,text,text,text,integer) from public,anon,authenticated;
grant execute on function public.save_application_details_v3(uuid,text,text,text,text,text,text,integer),public.submit_application_details_v3(uuid,text,text,text,text,text,text,integer) to authenticated;
-- v2 clients preserve optional background already stored; pending-upload submission is guarded by the trigger.
create or replace function public.save_application_details_v2(p_job_id uuid,p_cover_letter text,p_full_name text,p_phone text,p_portfolio_url text,p_expected_revision integer default null)
returns uuid language sql security definer set search_path='' as $$
 select application_private.write_application_details_v3(p_job_id,p_cover_letter,p_full_name,p_phone,p_portfolio_url,
  (select education from public.applications where applicant_id=auth.uid() and job_id=p_job_id),
  (select work_experience from public.applications where applicant_id=auth.uid() and job_id=p_job_id),p_expected_revision,false);
$$;
create or replace function public.submit_application_details_v2(p_job_id uuid,p_cover_letter text,p_full_name text,p_phone text,p_portfolio_url text,p_expected_revision integer default null)
returns uuid language sql security definer set search_path='' as $$
 select application_private.write_application_details_v3(p_job_id,p_cover_letter,p_full_name,p_phone,p_portfolio_url,
  (select education from public.applications where applicant_id=auth.uid() and job_id=p_job_id),
  (select work_experience from public.applications where applicant_id=auth.uid() and job_id=p_job_id),p_expected_revision,true);
$$;
