-- #8: only verified HR may manage job state. Existing public SELECT remains published-only.
create policy "Verified HR reads all jobs" on public.jobs
  for select to authenticated using ((select public.current_user_is_hr()));

-- Keep privileged implementations outside the Data API's exposed schemas.
create schema if not exists private;
revoke all on schema private from public, anon;
grant usage on schema private to authenticated;

create function private.validate_hr_job_fields(
  p_title text, p_team text, p_category text, p_description text, p_requirements text
) returns void language plpgsql immutable set search_path = '' as $$
begin
  if p_title is null or pg_catalog.char_length(pg_catalog.btrim(p_title)) not between 1 and 160
    or p_team is null or pg_catalog.char_length(pg_catalog.btrim(p_team)) not between 1 and 120
    or p_description is null or pg_catalog.char_length(pg_catalog.btrim(p_description)) not between 1 and 10000
    or p_requirements is null or pg_catalog.char_length(pg_catalog.btrim(p_requirements)) not between 1 and 10000
    or p_category is null or p_category not in ('engineering', 'human_resources', 'legal', 'sales', 'other') then
    raise exception 'Invalid job fields' using errcode = '22023';
  end if;
end;
$$;

create function private.create_hr_job_draft(
  p_title text, p_team text, p_category text, p_description text, p_requirements text
) returns uuid language plpgsql security definer set search_path = '' as $$
declare v_id uuid;
begin
  perform public.require_verified_hr();
  perform private.validate_hr_job_fields(p_title, p_team, p_category, p_description, p_requirements);
  insert into public.jobs (title, team, category, description, requirements, status)
    values (pg_catalog.btrim(p_title), pg_catalog.btrim(p_team), p_category,
      pg_catalog.btrim(p_description), pg_catalog.btrim(p_requirements), 'draft')
    returning id into v_id;
  return v_id;
end;
$$;

create function private.edit_hr_job_draft(
  p_job_id uuid, p_title text, p_team text, p_category text, p_description text, p_requirements text
) returns uuid language plpgsql security definer set search_path = '' as $$
begin
  perform public.require_verified_hr();
  perform private.validate_hr_job_fields(p_title, p_team, p_category, p_description, p_requirements);
  perform 1 from public.jobs where id = p_job_id and status = 'draft' for update;
  if not found then
    raise exception 'Draft job not found' using errcode = 'P0001';
  end if;
  update public.jobs set title = pg_catalog.btrim(p_title), team = pg_catalog.btrim(p_team),
    category = p_category, description = pg_catalog.btrim(p_description),
    requirements = pg_catalog.btrim(p_requirements)
    where id = p_job_id;
  return p_job_id;
end;
$$;

create function private.publish_hr_job(p_job_id uuid)
returns uuid language plpgsql security definer set search_path = '' as $$
begin
  perform public.require_verified_hr();
  perform 1 from public.jobs where id = p_job_id and status = 'draft' for update;
  if not found then
    raise exception 'Draft job not found' using errcode = 'P0001';
  end if;
  update public.jobs set status = 'published', published_at = now() where id = p_job_id;
  return p_job_id;
end;
$$;

create function private.close_hr_job(p_job_id uuid)
returns uuid language plpgsql security definer set search_path = '' as $$
begin
  perform public.require_verified_hr();
  -- Applicant save/submit/edit RPCs lock this same job row before changing applications.
  perform 1 from public.jobs where id = p_job_id and status = 'published' for update;
  if not found then
    raise exception 'Published job not found' using errcode = 'P0001';
  end if;
  update public.jobs set status = 'closed' where id = p_job_id;
  return p_job_id;
end;
$$;

revoke all on function private.validate_hr_job_fields(text, text, text, text, text),
  private.create_hr_job_draft(text, text, text, text, text),
  private.edit_hr_job_draft(uuid, text, text, text, text, text),
  private.publish_hr_job(uuid), private.close_hr_job(uuid) from public, anon, authenticated;
grant execute on function private.create_hr_job_draft(text, text, text, text, text),
  private.edit_hr_job_draft(uuid, text, text, text, text, text),
  private.publish_hr_job(uuid), private.close_hr_job(uuid) to authenticated;

-- Invoker wrappers are the only Data API endpoints. Private functions enforce HR again.
create function public.create_hr_job_draft(
  p_title text, p_team text, p_category text, p_description text, p_requirements text
) returns uuid language sql security invoker set search_path = '' as $$
  select private.create_hr_job_draft(p_title, p_team, p_category, p_description, p_requirements);
$$;
create function public.edit_hr_job_draft(
  p_job_id uuid, p_title text, p_team text, p_category text, p_description text, p_requirements text
) returns uuid language sql security invoker set search_path = '' as $$
  select private.edit_hr_job_draft(p_job_id, p_title, p_team, p_category, p_description, p_requirements);
$$;
create function public.publish_hr_job(p_job_id uuid)
returns uuid language sql security invoker set search_path = '' as $$
  select private.publish_hr_job(p_job_id);
$$;
create function public.close_hr_job(p_job_id uuid)
returns uuid language sql security invoker set search_path = '' as $$
  select private.close_hr_job(p_job_id);
$$;

revoke all on function public.create_hr_job_draft(text, text, text, text, text),
  public.edit_hr_job_draft(uuid, text, text, text, text, text),
  public.publish_hr_job(uuid), public.close_hr_job(uuid) from public, anon, authenticated;
grant execute on function public.create_hr_job_draft(text, text, text, text, text),
  public.edit_hr_job_draft(uuid, text, text, text, text, text),
  public.publish_hr_job(uuid), public.close_hr_job(uuid) to authenticated;
