-- HR may read only the requirements tied to one submitted application, including after job closure.
create function public.get_submitted_application_requirements(p_application_id uuid)
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
      and j.published_at is not null;
  if not found then
    raise exception 'Submitted application not found' using errcode = 'P0001';
  end if;
  return v_requirements;
end;
$$;
revoke all on function public.get_submitted_application_requirements(uuid) from public, anon, authenticated;
grant execute on function public.get_submitted_application_requirements(uuid) to authenticated;
