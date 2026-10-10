-- #52: derived profile readiness. Preserve legacy records and optional profile files.
create function application_private.profile_ready(p_actor uuid)
returns boolean language sql stable security definer set search_path='' as $$
 select exists(select 1 from public.applicant_profiles a
 join public.profiles p on p.user_id=a.user_id join auth.users u on u.id=a.user_id
 where a.user_id=p_actor and p.role='applicant' and u.email_confirmed_at is not null
 and nullif(application_private.trim_field(u.email),'') is not null
 and nullif(application_private.trim_field(a.full_name),'') is not null
 and char_length(a.full_name)<=120 and a.full_name !~ '[[:cntrl:]]'
 and a.phone ~ '^\+[1-9][0-9]{6,14}$');
$$;
revoke all on function application_private.profile_ready(uuid) from public,anon,authenticated;

create function application_private.require_ready_profile(p_actor uuid)
returns void language plpgsql stable security definer set search_path='' as $$
begin
 if not application_private.profile_ready(p_actor) then
  raise exception 'Complete your profile before continuing' using errcode='42501';
 end if;
end;
$$;
revoke all on function application_private.require_ready_profile(uuid) from public,anon,authenticated;

create or replace function public.save_applicant_profile(p_full_name text,p_phone text,p_portfolio_url text,p_education text,p_work_experience text)
returns void language plpgsql security definer set search_path='' as $$
declare v_actor uuid:=public.require_verified_applicant();
begin
 if coalesce(p_full_name,'') ~ '[[:cntrl:]]' or coalesce(p_phone,'') ~ '[[:cntrl:]]'
 or coalesce(p_portfolio_url,'') ~ '[[:cntrl:]]' then
  raise exception 'Enter valid profile contact fields' using errcode='22023';
 end if;
 if nullif(application_private.trim_field(p_full_name),'') is null
 or not coalesce(p_phone ~ '^\+[1-9][0-9]{6,14}$',false) then
  raise exception 'Complete your full name and international phone number' using errcode='22023';
 end if;
 insert into public.applicant_profiles(user_id,full_name,phone,portfolio_url,education,work_experience)
 values(v_actor,application_private.trim_field(p_full_name),p_phone,
 nullif(application_private.trim_field(p_portfolio_url),''),nullif(application_private.trim_field(p_education),''),nullif(application_private.trim_field(p_work_experience),''))
 on conflict(user_id) do update set full_name=excluded.full_name,phone=excluded.phone,portfolio_url=excluded.portfolio_url,
 education=excluded.education,work_experience=excluded.work_experience,updated_at=now();
end;
$$;
revoke all on function public.save_applicant_profile(text,text,text,text,text) from public,anon,authenticated;
grant execute on function public.save_applicant_profile(text,text,text,text,text) to authenticated;

create function application_private.guard_required_profile_fields()
returns trigger language plpgsql security definer set search_path='' as $$
begin
 -- Empty shells are necessary for optional profile file upload during onboarding.
 -- Unrelated resume-pointer updates must not count as profile completion.
 if tg_op='INSERT' then
  if new.full_name is null and new.phone is null and new.portfolio_url is null
   and new.education is null and new.work_experience is null then return new; end if;
 elsif row(new.full_name,new.phone,new.portfolio_url,new.education,new.work_experience)
  is not distinct from row(old.full_name,old.phone,old.portfolio_url,old.education,old.work_experience) then return new;
 end if;
 if nullif(application_private.trim_field(new.full_name),'') is null
 or not coalesce(new.phone ~ '^\+[1-9][0-9]{6,14}$',false) then
  raise exception 'Complete your full name and international phone number' using errcode='22023';
 end if;
 return new;
end;
$$;
revoke all on function application_private.guard_required_profile_fields() from public,anon,authenticated;
create trigger applicant_profile_required_fields before insert or update on public.applicant_profiles
 for each row execute function application_private.guard_required_profile_fields();

create function application_private.guard_application_profile_readiness()
returns trigger language plpgsql security definer set search_path='' as $$
begin
 if tg_op='INSERT' then
  perform application_private.require_ready_profile(new.applicant_id);
 elsif row(new.cover_letter,new.full_name,new.phone,new.portfolio_url,new.education,new.work_experience,new.resume_id,new.submission_state,new.withdrawn_at,new.revision)
  is not distinct from row(old.cover_letter,old.full_name,old.phone,old.portfolio_url,old.education,old.work_experience,old.resume_id,old.submission_state,old.withdrawn_at,old.revision) then return new;
 else perform application_private.require_ready_profile(new.applicant_id);
 end if;
 -- Validate new/draft content without rejecting unchanged frozen legacy snapshots on withdrawal.
 if (tg_op='INSERT' or old.submission_state='draft')
 and new.phone is not null and not (new.phone ~ '^\+[1-9][0-9]{6,14}$') then
  raise exception 'Enter a valid international phone number' using errcode='22023';
 end if;
 if new.submission_state='submitted' and (tg_op='INSERT' or old.submission_state='draft')
 and (nullif(application_private.trim_field(new.full_name),'') is null
 or not coalesce(new.phone ~ '^\+[1-9][0-9]{6,14}$',false)) then
  raise exception 'Full name and international phone are required before submitting' using errcode='22023';
 end if;
 return new;
end;
$$;
revoke all on function application_private.guard_application_profile_readiness() from public,anon,authenticated;
create trigger z_applications_required_profile before insert or update on public.applications
 for each row execute function application_private.guard_application_profile_readiness();

create function application_private.guard_application_file_readiness()
returns trigger language plpgsql security definer set search_path='' as $$
begin
 perform application_private.require_ready_profile(new.applicant_id);
 return new;
end;
$$;
revoke all on function application_private.guard_application_file_readiness() from public,anon,authenticated;
create trigger application_file_required_profile before insert on public.application_resume_objects
 for each row execute function application_private.guard_application_file_readiness();
notify pgrst,'reload schema';
