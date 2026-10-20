-- #125: optimistic concurrency identifies the record as well as its revision.
-- Keep the old implementations for internal reuse, but remove external access.
create function application_private.check_application_identity(
  p_actor uuid, p_job uuid, p_application uuid, p_revision integer,
  p_create boolean default false, p_operation uuid default null
) returns void language plpgsql security definer set search_path = '' as $$
declare v_app public.applications;
begin
  perform application_private.verified_resume_actor(p_actor);
  perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended(p_actor::text || p_job::text, 0));
  perform 1 from public.jobs where id = p_job for update;
  select * into v_app from public.applications
    where applicant_id = p_actor and job_id = p_job and withdrawn_at is null for update;
  if p_application is not null and p_application = v_app.id then return; end if;
  if p_application is null and p_revision is null and p_create then
    if v_app.id is null then return; end if;
    -- A lost first-upload response can resolve only its original operation.
    if p_operation is not null and exists (
      select 1 from public.application_resume_objects r
      where r.id = p_operation and r.application_id = v_app.id and r.applicant_id = p_actor
        and r.state in ('pending', 'ready')
    ) then return; end if;
  end if;
  raise exception 'Application changed; reload before saving' using errcode = 'P0001';
end;
$$;
revoke all on function application_private.check_application_identity(uuid,uuid,uuid,integer,boolean,uuid)
  from public,anon,authenticated,service_role;

-- New overloads require an explicit expected application identity. PostgREST
-- selects them using p_application; old clients fail closed after this cutover.
do $$
declare v_name text; v_signature text; v_arguments text; v_call text;
begin
  foreach v_name in array array['save_application_details_v3','submit_application_details_v3',
    'save_application_details_v2','submit_application_details_v2'] loop
    if v_name like '%v3' then
      v_signature := 'uuid,text,text,text,text,text,text,integer';
      v_arguments := 'p_job_id uuid,p_cover_letter text,p_full_name text,p_phone text,p_portfolio_url text,p_education text,p_work_experience text,p_expected_revision integer default null';
      v_call := 'p_job_id,p_cover_letter,p_full_name,p_phone,p_portfolio_url,p_education,p_work_experience,p_expected_revision';
    else
      v_signature := 'uuid,text,text,text,text,integer';
      v_arguments := 'p_job_id uuid,p_cover_letter text,p_full_name text,p_phone text,p_portfolio_url text,p_expected_revision integer default null';
      v_call := 'p_job_id,p_cover_letter,p_full_name,p_phone,p_portfolio_url,p_expected_revision';
    end if;
    execute format('create function public.%I(p_application uuid,%s) returns uuid language plpgsql security definer set search_path = '''' as $fn$ begin
      perform application_private.check_application_identity(public.require_verified_applicant(),p_job_id,p_application,p_expected_revision,true);
      return public.%I(%s); end; $fn$', v_name,v_arguments,v_name,v_call);
    execute format('revoke all on function public.%I(%s) from public,anon,authenticated,service_role',v_name,v_signature);
    execute format('revoke all on function public.%I(uuid,%s) from public,anon,authenticated,service_role',v_name,v_signature);
    execute format('grant execute on function public.%I(uuid,%s) to authenticated',v_name,v_signature);
  end loop;
end;
$$;

create function public.prepare_application_resume(
 p_application uuid,p_actor uuid,p_job uuid,p_revision integer,p_operation uuid,
 p_filename text,p_size integer,p_sha256 text
) returns jsonb language plpgsql security definer set search_path = '' as $$
begin
 perform application_private.check_application_identity(p_actor,p_job,p_application,p_revision,true,p_operation);
 return public.prepare_application_resume(p_actor,p_job,p_revision,p_operation,p_filename,p_size,p_sha256);
end;
$$;
create function public.finalize_application_resume(
 p_application uuid,p_actor uuid,p_job uuid,p_revision integer,p_operation uuid
) returns uuid language plpgsql security definer set search_path = '' as $$
begin
 perform application_private.check_application_identity(p_actor,p_job,p_application,p_revision);
 return public.finalize_application_resume(p_actor,p_job,p_revision,p_operation);
end;
$$;
create function public.remove_application_resume(p_application uuid,p_actor uuid,p_job uuid,p_revision integer)
returns void language plpgsql security definer set search_path = '' as $$
begin
 perform application_private.check_application_identity(p_actor,p_job,p_application,p_revision);
 perform public.remove_application_resume(p_actor,p_job,p_revision);
end;
$$;
create function public.recover_pending_application_resume(p_application uuid,p_actor uuid,p_job uuid,p_revision integer)
returns void language plpgsql security definer set search_path = '' as $$
begin
 perform application_private.check_application_identity(p_actor,p_job,p_application,p_revision);
 perform public.recover_pending_application_resume(p_actor,p_job,p_revision);
end;
$$;

-- Cleanup/cancellation must target the original record, even after withdrawal.
-- They may retire pending objects, never the finalized attachment of any record.
create function public.cancel_application_resume(p_application uuid,p_actor uuid,p_job uuid,p_operation uuid default null)
returns void language plpgsql security definer set search_path = '' as $$
begin
 perform application_private.verified_resume_actor(p_actor);
 perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended(p_actor::text || p_job::text, 0));
 perform 1 from public.jobs where id=p_job for update;
 perform 1 from public.applications where id=p_application and applicant_id=p_actor and job_id=p_job for update;
 if not found then raise exception 'Application changed; reload before saving'; end if;
 update public.application_resume_objects set state='retired'
 where application_id=p_application and applicant_id=p_actor and state='pending'
   and (p_operation is null or id=p_operation);
end;
$$;
create function public.claim_resume_cleanup(p_application uuid,p_actor uuid,p_job uuid)
returns table(id uuid,object_path text) language plpgsql security definer set search_path = '' as $$
begin
 perform application_private.verified_resume_actor(p_actor);
 perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended(p_actor::text || p_job::text, 0));
 perform 1 from public.jobs where public.jobs.id=p_job for update;
 perform 1 from public.applications where public.applications.id=p_application and applicant_id=p_actor and job_id=p_job for update;
 if not found then return; end if;
 return query update public.application_resume_objects r set state='deleting'
 where r.application_id=p_application and r.applicant_id=p_actor and r.state in ('retired','deleting')
   and not exists(select 1 from public.applications a where a.resume_id=r.id)
 returning r.id,r.object_path;
end;
$$;

-- Revoke all identity-less privileged entry points, including reservation.
revoke all on function public.reserve_application_resume(uuid,uuid,integer,uuid,text,integer,text),
 public.prepare_application_resume(uuid,uuid,integer,uuid,text,integer,text),
 public.finalize_application_resume(uuid,uuid,integer,uuid),
 public.remove_application_resume(uuid,uuid,integer),
 public.recover_pending_application_resume(uuid,uuid,integer),
 public.cancel_application_resume(uuid,uuid,uuid),public.claim_resume_cleanup(uuid,uuid)
 from public,anon,authenticated,service_role;

revoke all on function public.prepare_application_resume(uuid,uuid,uuid,integer,uuid,text,integer,text),
 public.finalize_application_resume(uuid,uuid,uuid,integer,uuid),
 public.remove_application_resume(uuid,uuid,uuid,integer),
 public.recover_pending_application_resume(uuid,uuid,uuid,integer),
 public.cancel_application_resume(uuid,uuid,uuid,uuid),public.claim_resume_cleanup(uuid,uuid,uuid)
 from public,anon,authenticated,service_role;
grant execute on function public.prepare_application_resume(uuid,uuid,uuid,integer,uuid,text,integer,text),
 public.finalize_application_resume(uuid,uuid,uuid,integer,uuid),
 public.remove_application_resume(uuid,uuid,uuid,integer),
 public.recover_pending_application_resume(uuid,uuid,uuid,integer),
 public.cancel_application_resume(uuid,uuid,uuid,uuid),public.claim_resume_cleanup(uuid,uuid,uuid)
 to service_role;
notify pgrst,'reload schema';
