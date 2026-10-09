-- Freeze submitted letters for authenticated Applicants and keep metadata-only audit trails.
revoke execute on function public.edit_submitted_letter(uuid, text, integer) from public, anon, authenticated;

create table public.application_submission_events (
  id uuid primary key default gen_random_uuid(),
  application_id uuid not null references public.applications(id) on delete cascade,
  actor_id uuid not null,
  created_at timestamptz not null default clock_timestamp()
);
create index application_submission_events_application_created_idx
  on public.application_submission_events (application_id, created_at desc);

alter table public.application_submission_events enable row level security;
revoke all on table public.application_submission_events from public, anon, authenticated;
grant select on table public.application_submission_events to authenticated;
create policy "HR reads submission metadata"
  on public.application_submission_events for select to authenticated
  using ((select public.current_user_is_hr()));

create table public.ai_invocations (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid not null,
  operation text not null check (operation in ('applicant_draft', 'hr_summary')),
  target_id uuid not null,
  created_at timestamptz not null,
  completed_at timestamptz,
  outcome text not null default 'started' check (outcome in ('started', 'success', 'failure')),
  constraint ai_invocations_terminal_shape check (
    (outcome = 'started' and completed_at is null)
    or (outcome in ('success', 'failure') and completed_at is not null)
  )
);
create index ai_invocations_created_idx on public.ai_invocations (created_at desc);
create index ai_invocations_actor_created_idx on public.ai_invocations (actor_id, created_at desc);

alter table public.ai_invocations enable row level security;
revoke all on table public.ai_invocations from public, anon, authenticated;
grant select on table public.ai_invocations to authenticated;
create policy "HR reads AI invocation metadata"
  on public.ai_invocations for select to authenticated
  using ((select public.current_user_is_hr()));

create function public.record_application_submission()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_actor_id uuid := auth.uid();
begin
  if new.submission_state = 'submitted'
    and (tg_op = 'INSERT' or old.submission_state is distinct from new.submission_state) then
    if v_actor_id is null then
      raise exception 'Authenticated Applicant required for submission audit' using errcode = '42501';
    end if;
    insert into public.application_submission_events (application_id, actor_id)
      values (new.id, v_actor_id);
  end if;
  return new;
end;
$$;
revoke all on function public.record_application_submission() from public, anon, authenticated;
create trigger applications_record_submission
  after insert or update on public.applications
  for each row execute function public.record_application_submission();

create function public.reserve_ai_invocation(p_operation text, p_target_id uuid)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_actor_id uuid := auth.uid();
  v_role text;
  v_email_confirmed_at timestamptz;
  v_now timestamptz;
  v_user_count integer;
  v_global_count integer;
  v_invocation_id uuid;
begin
  if v_actor_id is null or p_target_id is null then
    raise exception 'Authenticated user and AI target required' using errcode = '42501';
  end if;
  if p_operation is null or p_operation not in ('applicant_draft', 'hr_summary') then
    raise exception 'Invalid AI operation' using errcode = '22023';
  end if;

  select p.role, u.email_confirmed_at
    into v_role, v_email_confirmed_at
    from public.profiles p
    join auth.users u on u.id = p.user_id
    where p.user_id = v_actor_id;
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

  -- One transaction lock serializes all reservations, making both rolling-window counts atomic.
  perform pg_catalog.pg_advisory_xact_lock(
    pg_catalog.hashtextextended('public.ai_invocations.global_quota', 0)
  );
  v_now := clock_timestamp();

  select count(*) into v_user_count
    from public.ai_invocations i
    where i.actor_id = v_actor_id and i.created_at > v_now - interval '1 minute';
  if v_user_count >= 3 then
    raise exception 'AI request limit exceeded' using errcode = 'P0001';
  end if;

  select count(*) into v_global_count
    from public.ai_invocations i
    where i.created_at > v_now - interval '1 minute';
  if v_global_count >= 60 then
    raise exception 'AI request limit exceeded' using errcode = 'P0001';
  end if;

  insert into public.ai_invocations (actor_id, operation, target_id, created_at)
    values (v_actor_id, p_operation, p_target_id, v_now)
    returning id into v_invocation_id;
  return v_invocation_id;
end;
$$;
revoke all on function public.reserve_ai_invocation(text, uuid) from public, anon, authenticated;
grant execute on function public.reserve_ai_invocation(text, uuid) to authenticated;

create function public.finalize_ai_invocation(p_invocation_id uuid, p_outcome text)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_actor_id uuid := auth.uid();
begin
  if v_actor_id is null then
    raise exception 'Authenticated user required' using errcode = '42501';
  end if;
  if p_outcome not in ('success', 'failure') then
    raise exception 'Invalid AI outcome' using errcode = '22023';
  end if;

  update public.ai_invocations
    set outcome = p_outcome, completed_at = clock_timestamp()
    where id = p_invocation_id and actor_id = v_actor_id and outcome = 'started';
  return found;
end;
$$;
revoke all on function public.finalize_ai_invocation(uuid, text) from public, anon, authenticated;
grant execute on function public.finalize_ai_invocation(uuid, text) to authenticated;
