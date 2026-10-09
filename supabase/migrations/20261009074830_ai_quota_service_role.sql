-- Only trusted server routes may reserve or finalize shared AI quota/audit records.
-- Applicant/HR content reads remain on the caller's RLS-scoped session client.
drop function public.reserve_ai_invocation(text, uuid);
drop function public.finalize_ai_invocation(uuid, text);

create function public.reserve_ai_invocation(p_actor_id uuid, p_operation text, p_target_id uuid)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_role text;
  v_email_confirmed_at timestamptz;
  v_now timestamptz;
  v_user_count integer;
  v_global_count integer;
  v_invocation_id uuid;
begin
  if p_actor_id is null or p_target_id is null then
    raise exception 'Authenticated user and AI target required' using errcode = '42501';
  end if;
  if p_operation is null or p_operation not in ('applicant_draft', 'hr_summary') then
    raise exception 'Invalid AI operation' using errcode = '22023';
  end if;

  select p.role, u.email_confirmed_at
    into v_role, v_email_confirmed_at
    from public.profiles p
    join auth.users u on u.id = p.user_id
    where p.user_id = p_actor_id;
  if not found or v_email_confirmed_at is null then
    raise exception 'Verified account required' using errcode = '42501';
  end if;
  if p_operation = 'applicant_draft' and v_role <> 'applicant' then
    raise exception 'Applicant role required' using errcode = '42501';
  elsif p_operation = 'hr_summary' and v_role <> 'hr' then
    raise exception 'HR role required' using errcode = '42501';
  end if;

  if p_operation = 'applicant_draft' and not exists (
    select 1 from public.jobs j where j.id = p_target_id and j.status = 'published'
  ) then
    raise exception 'AI target not available' using errcode = 'P0001';
  elsif p_operation = 'hr_summary' and not exists (
    select 1 from public.applications a where a.id = p_target_id and a.submission_state = 'submitted'
  ) then
    raise exception 'AI target not available' using errcode = 'P0001';
  end if;

  -- One transaction lock serializes both rolling-window counts across app instances.
  perform pg_catalog.pg_advisory_xact_lock(
    pg_catalog.hashtextextended('public.ai_invocations.global_quota', 0)
  );
  v_now := clock_timestamp();

  select count(*) into v_user_count
    from public.ai_invocations i
    where i.actor_id = p_actor_id and i.created_at > v_now - interval '1 minute';
  if v_user_count >= 3 then
    raise exception 'AI request limit exceeded' using errcode = 'P0001';
  end if;

  select count(*) into v_global_count
    from public.ai_invocations i
    where i.created_at > v_now - interval '1 minute';
  if v_global_count >= 24 then
    raise exception 'AI request limit exceeded' using errcode = 'P0001';
  end if;

  insert into public.ai_invocations (actor_id, operation, target_id, created_at)
    values (p_actor_id, p_operation, p_target_id, v_now)
    returning id into v_invocation_id;
  return v_invocation_id;
end;
$$;
revoke all on function public.reserve_ai_invocation(uuid, text, uuid) from public, anon, authenticated, service_role;
grant execute on function public.reserve_ai_invocation(uuid, text, uuid) to service_role;

create function public.finalize_ai_invocation(p_actor_id uuid, p_invocation_id uuid, p_outcome text)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
begin
  if p_actor_id is null or p_invocation_id is null then
    raise exception 'Authenticated user and AI invocation required' using errcode = '42501';
  end if;
  if p_outcome not in ('success', 'failure') then
    raise exception 'Invalid AI outcome' using errcode = '22023';
  end if;

  update public.ai_invocations
    set outcome = p_outcome, completed_at = clock_timestamp()
    where id = p_invocation_id and actor_id = p_actor_id and outcome = 'started';
  return found;
end;
$$;
revoke all on function public.finalize_ai_invocation(uuid, uuid, text) from public, anon, authenticated, service_role;
grant execute on function public.finalize_ai_invocation(uuid, uuid, text) to service_role;
