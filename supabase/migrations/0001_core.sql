-- =============================================================================
-- 0001_core.sql — types, identity, roles, consent, audit
--
-- Role checks are enforced here, at the database layer, not only in the UI.
-- Every table below has RLS enabled. A table with RLS enabled and no policy
-- denies everything, which is the failure mode we want.
-- =============================================================================

create extension if not exists "pgcrypto";
create extension if not exists "citext";

-- --- Types -------------------------------------------------------------------

create type app_role as enum (
  'applicant',
  'member',
  'coach',
  'matchmaker',
  'safety_reviewer',
  'support_agent',
  'content_editor',
  'administrator',
  'super_administrator'
);

create type consent_kind as enum (
  'terms',
  'privacy',
  'age_confirmation',
  'photography_use',
  'introductions',
  'background_check',
  'marketing'
);

create type currency_code as enum ('NGN', 'USD');

create type verification_status as enum (
  'unverified',
  'pending',
  'verified',
  'rejected',
  'expired'
);

-- --- updated_at --------------------------------------------------------------

create or replace function public.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- --- profiles ----------------------------------------------------------------

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email citext not null,
  full_name text,
  preferred_name text,
  phone text,
  date_of_birth date,
  country_code text check (country_code ~ '^[A-Z]{2}$'),
  city text,
  timezone text,
  preferred_currency currency_code,
  marriage_timeline text,
  email_verified_at timestamptz,
  phone_verified_at timestamptz,
  age_confirmed_at timestamptz,
  onboarding_completed_at timestamptz,
  -- Nothing here is browsable by other members. This flag only ever governs
  -- whether assigned staff may see the record, never public visibility.
  visible_to_assigned_staff boolean not null default true,
  is_demo boolean not null default false,
  deleted_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint adults_only check (
    date_of_birth is null
    or date_of_birth <= (current_date - interval '18 years')
  )
);

create index profiles_email_idx on public.profiles (email);
create index profiles_deleted_idx on public.profiles (deleted_at) where deleted_at is null;

create trigger profiles_touch
  before update on public.profiles
  for each row execute function public.touch_updated_at();

-- --- user_roles --------------------------------------------------------------

create table public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  role app_role not null,
  granted_by uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now(),
  unique (user_id, role)
);

create index user_roles_user_idx on public.user_roles (user_id);

-- --- Role helpers ------------------------------------------------------------
-- security definer so a policy can ask "what roles does the caller hold?"
-- without the caller needing select on user_roles. search_path is pinned.

create or replace function public.has_role(check_role app_role)
returns boolean
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select exists (
    select 1 from public.user_roles
    where user_id = auth.uid() and role = check_role
  );
$$;

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select exists (
    select 1 from public.user_roles
    where user_id = auth.uid()
      and role in ('administrator', 'super_administrator')
  );
$$;

create or replace function public.is_super_admin()
returns boolean
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select exists (
    select 1 from public.user_roles
    where user_id = auth.uid() and role = 'super_administrator'
  );
$$;

create or replace function public.is_staff()
returns boolean
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select exists (
    select 1 from public.user_roles
    where user_id = auth.uid()
      and role in (
        'coach', 'matchmaker', 'safety_reviewer', 'support_agent',
        'content_editor', 'administrator', 'super_administrator'
      )
  );
$$;

-- --- New user bootstrap ------------------------------------------------------

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
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

  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- --- consent_records ---------------------------------------------------------
-- Each consent is separate, timestamped and independently revocable.

create table public.consent_records (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  kind consent_kind not null,
  granted boolean not null,
  granted_at timestamptz not null default now(),
  revoked_at timestamptz,
  policy_version text not null default 'v1',
  evidence jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index consent_user_kind_idx on public.consent_records (user_id, kind, granted_at desc);

-- --- audit_logs --------------------------------------------------------------
-- Every read of another user's private data is written here. Append only:
-- no update or delete policy exists for anyone, including administrators.

create table public.audit_logs (
  id bigserial primary key,
  actor_id uuid references public.profiles (id) on delete set null,
  actor_role app_role,
  action text not null,
  subject_table text,
  subject_id text,
  subject_user_id uuid references public.profiles (id) on delete set null,
  ip_hash text,
  user_agent text,
  detail jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index audit_actor_idx on public.audit_logs (actor_id, created_at desc);
create index audit_subject_user_idx on public.audit_logs (subject_user_id, created_at desc);
create index audit_created_idx on public.audit_logs (created_at desc);

-- --- data_deletion_requests --------------------------------------------------

create table public.data_deletion_requests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  reason text,
  status text not null default 'pending'
    check (status in ('pending', 'processing', 'completed', 'cancelled')),
  requested_at timestamptz not null default now(),
  completed_at timestamptz,
  processed_by uuid references public.profiles (id) on delete set null
);

create index deletion_user_idx on public.data_deletion_requests (user_id);

-- --- leads -------------------------------------------------------------------
-- Pre-account interest. Written by the server only.

create table public.leads (
  id uuid primary key default gen_random_uuid(),
  email citext,
  full_name text,
  marriage_timeline text,
  source text,
  assessment_id uuid,
  converted_user_id uuid references public.profiles (id) on delete set null,
  is_demo boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index leads_email_idx on public.leads (email);

create trigger leads_touch
  before update on public.leads
  for each row execute function public.touch_updated_at();

-- =============================================================================
-- RLS
-- =============================================================================

alter table public.profiles              enable row level security;
alter table public.user_roles            enable row level security;
alter table public.consent_records       enable row level security;
alter table public.audit_logs            enable row level security;
alter table public.data_deletion_requests enable row level security;
alter table public.leads                 enable row level security;

-- profiles --------------------------------------------------------------------

create policy profiles_self_select on public.profiles
  for select to authenticated
  using (id = auth.uid());

create policy profiles_self_update on public.profiles
  for update to authenticated
  using (id = auth.uid())
  with check (id = auth.uid());

create policy profiles_admin_select on public.profiles
  for select to authenticated
  using (public.is_admin());

create policy profiles_admin_update on public.profiles
  for update to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- Coaches and matchmakers are granted profile access per assignment in
-- 0004_delivery.sql, once the assignment tables exist. There is deliberately
-- no blanket staff policy here: staff cannot browse the member base.

-- user_roles ------------------------------------------------------------------

create policy user_roles_self_select on public.user_roles
  for select to authenticated
  using (user_id = auth.uid());

create policy user_roles_admin_select on public.user_roles
  for select to authenticated
  using (public.is_admin());

-- Only a super administrator may change who holds a role.
create policy user_roles_super_write on public.user_roles
  for all to authenticated
  using (public.is_super_admin())
  with check (public.is_super_admin());

-- consent_records -------------------------------------------------------------

create policy consent_self_select on public.consent_records
  for select to authenticated
  using (user_id = auth.uid());

create policy consent_self_insert on public.consent_records
  for insert to authenticated
  with check (user_id = auth.uid());

-- Revoking is an update of revoked_at on your own record.
create policy consent_self_revoke on public.consent_records
  for update to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

create policy consent_admin_select on public.consent_records
  for select to authenticated
  using (public.is_admin());

-- audit_logs ------------------------------------------------------------------
-- Readable by administrators and by the subject of the record. Append only.

create policy audit_admin_select on public.audit_logs
  for select to authenticated
  using (public.is_admin());

create policy audit_subject_select on public.audit_logs
  for select to authenticated
  using (subject_user_id = auth.uid());

create policy audit_insert on public.audit_logs
  for insert to authenticated
  with check (actor_id = auth.uid());

-- No update policy. No delete policy. Deliberate.

-- data_deletion_requests ------------------------------------------------------

create policy deletion_self_select on public.data_deletion_requests
  for select to authenticated
  using (user_id = auth.uid());

create policy deletion_self_insert on public.data_deletion_requests
  for insert to authenticated
  with check (user_id = auth.uid());

create policy deletion_admin_all on public.data_deletion_requests
  for all to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- leads -----------------------------------------------------------------------
-- No client role may read leads. Server-side writes only.

create policy leads_admin_select on public.leads
  for select to authenticated
  using (public.is_admin());
