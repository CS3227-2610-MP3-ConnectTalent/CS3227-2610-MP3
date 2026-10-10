-- #49/#50: retained terminal withdrawal and explicit draft upload recovery.
alter table public.applications
 add column withdrawn_at timestamptz,
 add column withdrawn_by uuid references public.profiles(user_id),
 add constraint applications_withdrawal_shape check (
  (withdrawn_at is null and withdrawn_by is null) or
  (submission_state='submitted' and withdrawn_at is not null and withdrawn_by=applicant_id)
 );

create schema application_lifecycle_private;
revoke all on schema application_lifecycle_private from public,anon,authenticated;
-- Only the checked private RPC implementation is callable; this schema is not exposed by PostgREST.
grant usage on schema application_lifecycle_private to authenticated;

create function application_private.guard_application_withdrawal()
returns trigger language plpgsql set search_path='' as $$
begin
 if tg_op='INSERT' then
  if new.withdrawn_at is not null or new.withdrawn_by is not null then raise exception 'Use confirmed withdrawal' using errcode='42501'; end if;
  return new;
 end if;
 if old.withdrawn_at is not null then
  if to_jsonb(new) is distinct from to_jsonb(old) then raise exception 'Withdrawn applications are locked' using errcode='42501'; end if;
 elsif new.withdrawn_at is not null or new.withdrawn_by is not null then
  if old.submission_state<>'submitted' or new.withdrawn_by is distinct from old.applicant_id
   or new.withdrawn_by is distinct from auth.uid() or not public.current_user_is_applicant()
   or (to_jsonb(new)-'withdrawn_at'-'withdrawn_by'-'updated_at') is distinct from (to_jsonb(old)-'withdrawn_at'-'withdrawn_by'-'updated_at') then
   raise exception 'Only the owner can withdraw a submitted application' using errcode='42501';
  end if;
 end if;
 return new;
end;
$$;
revoke all on function application_private.guard_application_withdrawal() from public,anon,authenticated;
create trigger applications_guard_withdrawal before insert or update on public.applications
 for each row execute function application_private.guard_application_withdrawal();

create function application_lifecycle_private.withdraw_application(p_application_id uuid)
returns uuid language plpgsql security definer set search_path='' as $$
declare v_actor uuid:=public.require_verified_applicant(); v_app public.applications; v_job uuid;
begin
 select job_id into v_job from public.applications where id=p_application_id and applicant_id=v_actor and submission_state='submitted';
 if not found then raise exception 'Submitted application unavailable' using errcode='42501'; end if;
 perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended(v_actor::text||v_job::text,0));
 perform 1 from public.jobs where id=v_job for update;
 select * into v_app from public.applications where id=p_application_id and applicant_id=v_actor and submission_state='submitted' for update;
 if not found then raise exception 'Submitted application unavailable' using errcode='42501'; end if;
 if v_app.withdrawn_at is null then
  update public.applications set withdrawn_at=clock_timestamp(), withdrawn_by=v_actor, updated_at=clock_timestamp() where id=v_app.id;
 end if;
 return v_app.id;
end;
$$;
revoke all on function application_lifecycle_private.withdraw_application(uuid) from public,anon,authenticated;
grant execute on function application_lifecycle_private.withdraw_application(uuid) to authenticated;
create function public.withdraw_application(p_application_id uuid)
returns uuid language sql security invoker set search_path='' as $$
 select application_lifecycle_private.withdraw_application(p_application_id);
$$;
revoke all on function public.withdraw_application(uuid) from public,anon,authenticated;
grant execute on function public.withdraw_application(uuid) to authenticated;

-- Notes insertion shares the application lock with withdrawal; retained notes remain readable.
create function application_private.guard_active_hr_note()
returns trigger language plpgsql security definer set search_path='' as $$
begin
 perform 1 from public.applications where id=new.application_id and submission_state='submitted' and withdrawn_at is null for update;
 if not found then raise exception 'Withdrawn applications cannot be processed' using errcode='42501'; end if;
 return new;
end;
$$;
revoke all on function application_private.guard_active_hr_note() from public,anon,authenticated;
create trigger notes_guard_active_application before insert on public.application_notes
 for each row execute function application_private.guard_active_hr_note();

-- Service-role quota reservations cannot authorize an already withdrawn HR target.
create function application_private.guard_active_hr_invocation()
returns trigger language plpgsql security definer set search_path='' as $$
begin
 if new.operation='hr_summary' then
  perform 1 from public.applications where id=new.target_id and submission_state='submitted' and withdrawn_at is null for update;
  if not found then raise exception 'AI target not available' using errcode='P0001'; end if;
 end if;
 return new;
end;
$$;
revoke all on function application_private.guard_active_hr_invocation() from public,anon,authenticated;
create trigger ai_invocations_guard_active_application before insert on public.ai_invocations
 for each row execute function application_private.guard_active_hr_invocation();

-- Retry does not grant general cancellation: revision/role/owner/job state are checked atomically.
create function public.recover_pending_application_resume(p_actor uuid,p_job uuid,p_revision integer)
returns void language plpgsql security definer set search_path='' as $$
declare v_app public.applications;
begin
 v_app:=application_private.lock_resume_draft(p_actor,p_job,p_revision);
 update public.application_resume_objects set state='retired'
  where application_id=v_app.id and applicant_id=p_actor and state='pending';
end;
$$;
revoke all on function public.recover_pending_application_resume(uuid,uuid,integer) from public,anon,authenticated,service_role;
grant execute on function public.recover_pending_application_resume(uuid,uuid,integer) to service_role;

-- HR may read only the requirements tied to one submitted application, including after job closure.
create or replace function public.get_submitted_application_requirements(p_application_id uuid)
returns text
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  v_actor_id uuid := auth.uid();
  v_role text;
  v_email_confirmed_at timestamptz;
  v_requirements text;
begin
  if v_actor_id is null then
    raise exception 'Verified HR account required' using errcode = '42501';
  end if;

  select p.role, u.email_confirmed_at
    into v_role, v_email_confirmed_at
    from public.profiles p
    join auth.users u on u.id = p.user_id
    where p.user_id = v_actor_id;
  if not found or v_role <> 'hr' or v_email_confirmed_at is null then
    raise exception 'Verified HR account required' using errcode = '42501';
  end if;

  select j.requirements into v_requirements
    from public.applications a
    join public.jobs j on j.id = a.job_id
    where a.id = p_application_id
      and a.submission_state = 'submitted'
      and a.withdrawn_at is null
      and j.published_at is not null;
  if not found then
    raise exception 'Submitted application not found' using errcode = 'P0001';
  end if;
  return v_requirements;
end;
$$;
revoke all on function public.get_submitted_application_requirements(uuid) from public, anon, authenticated;
grant execute on function public.get_submitted_application_requirements(uuid) to authenticated;

notify pgrst, 'reload schema';
