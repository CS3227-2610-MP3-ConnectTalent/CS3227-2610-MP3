-- #53: first application upload and private optional profile PDFs. No historical backfill.
create function public.prepare_application_resume(p_actor uuid,p_job uuid,p_revision integer,p_operation uuid,p_filename text,p_size integer,p_sha256 text)
returns jsonb language plpgsql security definer set search_path='' as $$
declare v_app public.applications; v_obj public.application_resume_objects; v_job public.jobs; v_path text;
begin
 perform application_private.verified_resume_actor(p_actor);
 perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended(p_actor::text||p_job::text,0));
 select * into v_job from public.jobs where id=p_job for update;
 select * into v_app from public.applications where applicant_id=p_actor and job_id=p_job for update;
 select * into v_obj from public.application_resume_objects where id=p_operation;
 if found then
  if v_obj.application_id is distinct from v_app.id or v_obj.applicant_id is distinct from p_actor
   or v_obj.filename is distinct from p_filename or v_obj.byte_size is distinct from p_size or v_obj.sha256 is distinct from p_sha256 then
   raise exception 'Upload operation cannot be reused'; end if;
  if v_obj.state='ready' and v_app.resume_id=v_obj.id then
   return jsonb_build_object('id',v_app.id,'revision',v_app.revision,'object_path',v_obj.object_path,'state','ready');
  end if;
  if v_obj.state='pending' and (p_revision is null or p_revision=v_obj.expected_revision) then p_revision:=v_obj.expected_revision; end if;
 end if;
 if v_job.status is distinct from 'published' then raise exception 'Job is not open for applications'; end if;
 if v_app.id is null then
  if p_revision is not null then raise exception 'Application changed; reload before uploading'; end if;
  insert into public.applications(applicant_id,job_id,job_title,cover_letter,submission_state)
   values(p_actor,p_job,v_job.title,'','draft') returning * into v_app;
  p_revision:=v_app.revision;
 end if;
 v_path:=public.reserve_application_resume(p_actor,p_job,p_revision,p_operation,p_filename,p_size,p_sha256);
 return jsonb_build_object('id',v_app.id,'revision',p_revision,'object_path',v_path,'state','pending');
end;
$$;
revoke all on function public.prepare_application_resume(uuid,uuid,integer,uuid,text,integer,text) from public,anon,authenticated;
grant execute on function public.prepare_application_resume(uuid,uuid,integer,uuid,text,integer,text) to service_role;

create table public.profile_resume_objects (
 id uuid primary key,
 applicant_id uuid not null references auth.users(id) on delete restrict,
 object_path text unique not null,
 filename text not null check(char_length(filename) between 1 and 120 and filename !~ '[[:cntrl:]]'),
 byte_size integer not null check(byte_size between 1 and 1048576),
 sha256 text not null check(sha256 ~ '^[0-9a-f]{64}$'),
 expected_resume_id uuid,
 state text not null default 'pending' check(state in('pending','ready','retired','deleting')),
 created_at timestamptz not null default now(),
 check(object_path=id::text||'.pdf')
);
create unique index profile_resume_one_pending on public.profile_resume_objects(applicant_id) where state='pending';
create index profile_resume_owner on public.profile_resume_objects(applicant_id);
alter table public.applicant_profiles add column resume_id uuid references public.profile_resume_objects(id);
alter table public.profile_resume_objects enable row level security;
revoke all on public.profile_resume_objects from public,anon,authenticated;
grant select on public.profile_resume_objects to authenticated;
create policy profile_resume_owner_read on public.profile_resume_objects for select to authenticated using (
 applicant_id=(select auth.uid()) and (select public.current_user_is_applicant()) and state='ready'
 and exists(select 1 from public.applicant_profiles p where p.user_id=profile_resume_objects.applicant_id and p.resume_id=profile_resume_objects.id)
);
insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types)
 values('profile-resumes','profile-resumes',false,1048576,array['application/pdf']);
create policy profile_resume_download on storage.objects for select to authenticated using (
 bucket_id='profile-resumes' and exists(select 1 from public.profile_resume_objects r where r.object_path=name and r.state='ready')
);
-- No browser storage writes. The profile policy checks current confirmed role independently.
create function public.reserve_profile_resume(p_actor uuid,p_operation uuid,p_filename text,p_size integer,p_sha256 text,p_expected uuid)
returns text language plpgsql security definer set search_path='' as $$
declare v_current uuid; v_obj public.profile_resume_objects;
begin
 perform application_private.verified_resume_actor(p_actor);
 perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended(p_actor::text||'profile-resume',0));
 insert into public.applicant_profiles(user_id) values(p_actor) on conflict(user_id) do nothing;
 select resume_id into v_current from public.applicant_profiles where user_id=p_actor for update;
 select * into v_obj from public.profile_resume_objects where id=p_operation;
 if found then
  if v_obj.applicant_id=p_actor and v_obj.filename=p_filename and v_obj.byte_size=p_size and v_obj.sha256=p_sha256
   and ((v_obj.state='ready' and v_current=v_obj.id) or (v_obj.state='pending' and v_current is not distinct from v_obj.expected_resume_id)) then return v_obj.object_path; end if;
  raise exception 'Upload operation cannot be reused';
 end if;
 if v_current is distinct from p_expected then raise exception 'Profile resume changed; reload'; end if;
 insert into public.profile_resume_objects(id,applicant_id,object_path,filename,byte_size,sha256,expected_resume_id)
 values(p_operation,p_actor,p_operation::text||'.pdf',p_filename,p_size,p_sha256,p_expected);
 return p_operation::text||'.pdf';
end;
$$;
create function public.finalize_profile_resume(p_actor uuid,p_operation uuid)
returns void language plpgsql security definer set search_path='' as $$
declare v_current uuid; v_obj public.profile_resume_objects;
begin
 perform application_private.verified_resume_actor(p_actor);
 perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended(p_actor::text||'profile-resume',0));
 select resume_id into v_current from public.applicant_profiles where user_id=p_actor for update;
 select * into v_obj from public.profile_resume_objects where id=p_operation for update;
 if v_obj.applicant_id is distinct from p_actor then raise exception 'Upload unavailable'; end if;
 if v_obj.state='ready' and v_current=v_obj.id then return; end if;
 if v_obj.state is distinct from 'pending' or v_current is distinct from v_obj.expected_resume_id then raise exception 'Profile resume changed; reload'; end if;
 if not exists(select 1 from storage.objects where bucket_id='profile-resumes' and name=v_obj.object_path) then raise exception 'Upload incomplete'; end if;
 update public.profile_resume_objects set state='retired' where id=v_current;
 update public.profile_resume_objects set state='ready' where id=p_operation;
 update public.applicant_profiles set resume_id=p_operation,updated_at=now() where user_id=p_actor;
end;
$$;
create function public.retire_profile_resume(p_actor uuid,p_expected uuid,p_pending_only boolean)
returns void language plpgsql security definer set search_path='' as $$
declare v_current uuid;
begin
 perform application_private.verified_resume_actor(p_actor);
 perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended(p_actor::text||'profile-resume',0));
 select resume_id into v_current from public.applicant_profiles where user_id=p_actor for update;
 if v_current is distinct from p_expected then raise exception 'Profile resume changed; reload'; end if;
 update public.profile_resume_objects set state='retired' where applicant_id=p_actor and state='pending';
 if not p_pending_only then
  update public.applicant_profiles set resume_id=null,updated_at=now() where user_id=p_actor;
  update public.profile_resume_objects set state='retired' where id=v_current;
 end if;
end;
$$;
create function public.cancel_profile_resume(p_actor uuid,p_operation uuid)
returns void language plpgsql security definer set search_path='' as $$
begin
 perform application_private.verified_resume_actor(p_actor);
 perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended(p_actor::text||'profile-resume',0));
 update public.profile_resume_objects set state='retired' where id=p_operation and applicant_id=p_actor and state='pending';
end;
$$;
create function public.claim_profile_resume_cleanup(p_actor uuid)
returns table(object_path text) language plpgsql security definer set search_path='' as $$
begin
 perform application_private.verified_resume_actor(p_actor);
 perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended(p_actor::text||'profile-resume',0));
 return query update public.profile_resume_objects r set state='deleting' where r.applicant_id=p_actor and r.state in('retired','deleting')
 and not exists(select 1 from public.applicant_profiles p where p.resume_id=r.id) returning r.object_path;
end;
$$;
create function application_private.guard_profile_resume_reference()
returns trigger language plpgsql set search_path='' as $$
begin
 if new.resume_id is not null and not exists(select 1 from public.profile_resume_objects r where r.id=new.resume_id and r.applicant_id=new.user_id and r.state='ready') then
  raise exception 'Invalid profile attachment reference' using errcode='42501'; end if;
 return new;
end;
$$;
revoke all on function application_private.guard_profile_resume_reference() from public,anon,authenticated;
create trigger profile_resume_reference before insert or update on public.applicant_profiles for each row execute function application_private.guard_profile_resume_reference();
revoke all on function public.reserve_profile_resume(uuid,uuid,text,integer,text,uuid),public.finalize_profile_resume(uuid,uuid),
 public.retire_profile_resume(uuid,uuid,boolean),public.cancel_profile_resume(uuid,uuid),public.claim_profile_resume_cleanup(uuid) from public,anon,authenticated;
grant execute on function public.reserve_profile_resume(uuid,uuid,text,integer,text,uuid),public.finalize_profile_resume(uuid,uuid),
 public.retire_profile_resume(uuid,uuid,boolean),public.cancel_profile_resume(uuid,uuid),public.claim_profile_resume_cleanup(uuid) to service_role;
notify pgrst,'reload schema';
