-- #39: nullable fields preserve legacy data; signed-in writes use the complete-field API.
create schema if not exists application_private;
revoke all on schema application_private from public, anon, authenticated;

alter table public.applications
  add column full_name text,
  add column submitted_email text,
  add column phone text,
  add column portfolio_url text,
  add constraint application_name_bound check (full_name is null or
    (char_length(full_name) <= 120 and full_name !~ '[[:cntrl:]]')),
  add constraint application_phone_bound check (phone is null or
    (char_length(phone) <= 40 and phone !~ '[[:cntrl:]]')),
  add constraint application_portfolio_bound check (portfolio_url is null or char_length(portfolio_url) <= 2048);

-- This validator is shared by the write RPC and table constraint, never fetched over HTTP.
create function application_private.valid_portfolio_url(p_url text)
returns boolean language plpgsql immutable set search_path = '' as $$
declare v_authority text; v_host text; v_port text;
begin
  if p_url is null then return true; end if;
  if char_length(p_url) > 2048 or p_url ~ '[[:space:][:cntrl:]]' or position(chr(92) in p_url) > 0 then return false; end if;
  if p_url !~* '^https?://' then return false; end if;
  v_authority := split_part(split_part(split_part(regexp_replace(p_url, '^https?://', '', 'i'), '/', 1), '?', 1), '#', 1);
  if v_authority = '' or position('@' in v_authority) > 0 then return false; end if;
  if v_authority like '[%' then
    if v_authority !~ '^\[[0-9a-fA-F:]+\](:[0-9]{0,5})?$' then return false; end if;
    v_host := split_part(substr(v_authority, 2), ']', 1);
    if position(':' in v_host) = 0 then return false; end if;
    begin perform v_host::inet; exception when invalid_text_representation then return false; end;
    v_port := nullif(split_part(v_authority, ']:', 2), '');
  else
    if v_authority !~ '^[[:alnum:]_.-]+(:[0-9]{0,5})?$' then return false; end if;
    v_host := rtrim(split_part(v_authority, ':', 1), '.');
    if substring(v_host from '[^.]+$') ~* '^([0-9]+|0x[0-9a-f]+)$' then
      if v_host !~ '^((0|[1-9][0-9]{0,2})\.){3}(0|[1-9][0-9]{0,2})$' then return false; end if;
      begin perform v_host::inet; exception when invalid_text_representation then return false; end;
    end if;
    v_port := nullif(split_part(v_authority, ':', 2), '');
  end if;
  if v_port is not null and v_port::integer > 65535 then return false; end if;
  return true;
end;
$$;
revoke all on function application_private.valid_portfolio_url(text) from public, anon, authenticated;
alter table public.applications add constraint application_portfolio_safe
  check (application_private.valid_portfolio_url(portfolio_url));

-- Freeze all submitted identity/contact and letter data, including privileged accidental edits.
create function application_private.freeze_submitted_application_details()
returns trigger language plpgsql set search_path = '' as $$
begin
  if old.submission_state = 'submitted' and (
    new.full_name is distinct from old.full_name or new.submitted_email is distinct from old.submitted_email
    or new.phone is distinct from old.phone or new.portfolio_url is distinct from old.portfolio_url
    or new.cover_letter is distinct from old.cover_letter
    or new.original_submitted_letter is distinct from old.original_submitted_letter
    or new.submission_state is distinct from old.submission_state
  ) then raise exception 'Submitted applications are locked' using errcode = '42501'; end if;
  return new;
end;
$$;
revoke all on function application_private.freeze_submitted_application_details() from public, anon, authenticated;
create trigger applications_freeze_submitted_details before update on public.applications
  for each row execute function application_private.freeze_submitted_application_details();

-- Match server String.trim whitespace so whitespace-only names cannot bypass submission validation.
create function application_private.trim_field(p_value text)
returns text language sql immutable set search_path = '' as $$
  select pg_catalog.btrim(p_value, pg_catalog.chr(9) || pg_catalog.chr(10) || pg_catalog.chr(11) || pg_catalog.chr(12) || pg_catalog.chr(13) || pg_catalog.chr(32) || pg_catalog.chr(160) || pg_catalog.chr(5760) || pg_catalog.chr(8192) || pg_catalog.chr(8193) || pg_catalog.chr(8194) || pg_catalog.chr(8195) || pg_catalog.chr(8196) || pg_catalog.chr(8197) || pg_catalog.chr(8198) || pg_catalog.chr(8199) || pg_catalog.chr(8200) || pg_catalog.chr(8201) || pg_catalog.chr(8202) || pg_catalog.chr(8232) || pg_catalog.chr(8233) || pg_catalog.chr(8239) || pg_catalog.chr(8287) || pg_catalog.chr(12288) || pg_catalog.chr(65279));
$$;
revoke all on function application_private.trim_field(text) from public, anon, authenticated;

-- One private implementation keeps locks, validation, ownership and persistence together.
create function application_private.write_application_details(
  p_job_id uuid, p_cover_letter text, p_full_name text, p_phone text,
  p_portfolio_url text, p_expected_revision integer, p_submit boolean
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
      submitted_email = v_email, submission_state = case when p_submit then 'submitted' else 'draft' end,
      original_submitted_letter = case when p_submit then p_cover_letter else null end,
      submitted_at = case when p_submit then now() else null end,
      review_status = case when p_submit then 'submitted' else null end,
      review_revision = case when p_submit then 1 else review_revision end,
      revision = revision + 1, updated_at = now()
      where id = v_existing.id returning id into v_id;
  else
    if p_expected_revision is not null then raise exception '%', case when p_submit then 'Application changed; reload before submitting' else 'Application changed; reload before saving' end using errcode = 'P0001'; end if;
    insert into public.applications (applicant_id, job_id, job_title, cover_letter, full_name, phone, portfolio_url,
      submitted_email, submission_state, original_submitted_letter, submitted_at, review_status, review_revision)
    values (v_user_id, p_job_id, v_job.title, p_cover_letter, v_name, v_phone, v_url, v_email,
      case when p_submit then 'submitted' else 'draft' end, case when p_submit then p_cover_letter else null end,
      case when p_submit then now() else null end, case when p_submit then 'submitted' else null end,
      case when p_submit then 1 else 0 end) returning id into v_id;
  end if;
  return v_id;
end;
$$;
revoke all on function application_private.write_application_details(uuid,text,text,text,text,integer,boolean) from public, anon, authenticated;

create function public.save_application_details_v2(
  p_job_id uuid, p_cover_letter text, p_full_name text, p_phone text, p_portfolio_url text,
  p_expected_revision integer default null
) returns uuid language sql security definer set search_path = '' as $$
  select application_private.write_application_details(p_job_id, p_cover_letter, p_full_name, p_phone, p_portfolio_url, p_expected_revision, false);
$$;
create function public.submit_application_details_v2(
  p_job_id uuid, p_cover_letter text, p_full_name text, p_phone text, p_portfolio_url text,
  p_expected_revision integer default null
) returns uuid language sql security definer set search_path = '' as $$
  select application_private.write_application_details(p_job_id, p_cover_letter, p_full_name, p_phone, p_portfolio_url, p_expected_revision, true);
$$;
revoke all on function public.save_application_details_v2(uuid,text,text,text,text,integer),
  public.submit_application_details_v2(uuid,text,text,text,text,integer) from public, anon, authenticated;
grant execute on function public.save_application_details_v2(uuid,text,text,text,text,integer),
  public.submit_application_details_v2(uuid,text,text,text,text,integer) to authenticated;
revoke execute on function public.save_application_draft(uuid,text,integer), public.submit_application(uuid,text,integer)
  from public, anon, authenticated;
