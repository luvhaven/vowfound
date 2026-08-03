-- =============================================================================
-- 0006_bootstrap_admin.sql — first-administrator bootstrap
--
-- A fresh project has no administrator, and nobody can grant the first role
-- because granting roles requires being a super administrator already.
--
-- This resolves it without anyone handling a password out of band: list an
-- email here, and when that person signs up through the normal flow they are
-- granted super_administrator once. The row is consumed on use, so the same
-- address cannot be re-elevated by re-registering later.
-- =============================================================================

create table public.bootstrap_admins (
  email citext primary key,
  note text,
  claimed_at timestamptz,
  claimed_by uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now()
);

alter table public.bootstrap_admins enable row level security;

-- Readable only by administrators. The signup path reads it through a
-- security-definer trigger, which does not consult RLS.
create policy bootstrap_admins_admin_read on public.bootstrap_admins
  for select to authenticated
  using (public.is_admin());

create policy bootstrap_admins_super_write on public.bootstrap_admins
  for all to authenticated
  using (public.is_super_admin())
  with check (public.is_super_admin());

-- Extend the signup handler. Everything the original did still happens.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  is_bootstrap boolean;
begin
  insert into public.profiles (id, email, full_name)
  values (
    new.id,
    new.email,
    nullif(new.raw_user_meta_data ->> 'full_name', '')
  )
  on conflict (id) do nothing;

  insert into public.user_roles (user_id, role)
  values (new.id, 'applicant')
  on conflict do nothing;

  -- Claim the bootstrap row atomically: the update only matches while
  -- claimed_at is null, so two simultaneous signups cannot both succeed.
  update public.bootstrap_admins
    set claimed_at = now(), claimed_by = new.id
    where email = new.email and claimed_at is null
    returning true into is_bootstrap;

  if is_bootstrap then
    insert into public.user_roles (user_id, role)
    values (new.id, 'super_administrator'), (new.id, 'administrator')
    on conflict do nothing;

    insert into public.audit_logs (actor_id, action, subject_table, subject_user_id, detail)
    values (
      new.id,
      'role.bootstrap_granted',
      'user_roles',
      new.id,
      jsonb_build_object('roles', array['super_administrator', 'administrator'])
    );
  end if;

  return new;
end;
$$;

-- Change this address, or add rows, before the first signup.
insert into public.bootstrap_admins (email, note)
values ('vowfound@gmail.com', 'Project owner. Granted on first signup.')
on conflict (email) do nothing;
