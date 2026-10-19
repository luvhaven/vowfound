-- =============================================================================
-- 0012_rebuild.sql — the schema for the rebuilt VowFound.
--
-- Additive by design. Every table here is new and none of the earlier tables
-- is altered or dropped, so the live database keeps its history (old
-- assessments, leads and the content overrides) and the previous app could
-- still run against it. Dropping the old tables is a separate, deliberate
-- step once the rebuild is live.
-- =============================================================================

-- --- members -----------------------------------------------------------------
create table if not exists public.members (
  id uuid primary key references auth.users (id) on delete cascade,
  email text not null,
  full_name text,
  role text not null default 'member' check (role in ('member', 'staff', 'admin')),
  created_at timestamptz not null default now()
);

create or replace function public.vf_is_staff()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.members
    where id = auth.uid() and role in ('staff', 'admin')
  );
$$;

-- Every new auth user gets a member row.
create or replace function public.vf_handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.members (id, email, full_name)
  values (new.id, new.email, new.raw_user_meta_data ->> 'full_name')
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists vf_on_auth_user_created on auth.users;
create trigger vf_on_auth_user_created
  after insert on auth.users
  for each row execute function public.vf_handle_new_user();

-- Backfill existing users, carrying administrators across from the old roles.
insert into public.members (id, email, full_name, role)
select
  u.id,
  u.email,
  u.raw_user_meta_data ->> 'full_name',
  case
    when exists (
      select 1 from public.user_roles r
      where r.user_id = u.id and r.role::text in ('administrator', 'super_administrator')
    ) then 'admin'
    else 'member'
  end
from auth.users u
on conflict (id) do nothing;

-- --- readiness checks ----------------------------------------------------------
-- Written by the server (anonymous visitors have no session), read by the
-- member who owns it once they claim it by signing in.
create table if not exists public.readiness_checks (
  id uuid primary key default gen_random_uuid(),
  member_id uuid references public.members (id) on delete set null,
  email text,
  first_name text,
  answers jsonb not null,
  scores jsonb not null,
  recommended text not null,
  created_at timestamptz not null default now()
);

create index if not exists readiness_checks_member_idx on public.readiness_checks (member_id);

-- --- orders ------------------------------------------------------------------
create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  member_id uuid references public.members (id) on delete set null,
  email text not null,
  product text not null,
  currency text not null check (currency in ('NGN', 'USD')),
  amount_minor bigint not null check (amount_minor > 0),
  status text not null default 'pending' check (status in ('pending', 'paid', 'failed', 'refunded')),
  provider text not null default 'flutterwave',
  tx_ref text not null unique,
  provider_tx_id text,
  created_at timestamptz not null default now(),
  paid_at timestamptz
);

create index if not exists orders_member_idx on public.orders (member_id);
create index if not exists orders_email_idx on public.orders (lower(email));

-- --- applications (Private) ----------------------------------------------------
create table if not exists public.applications (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  email text not null,
  city text,
  timeline text,
  about text not null,
  status text not null default 'new' check (status in ('new', 'reviewing', 'accepted', 'declined')),
  created_at timestamptz not null default now()
);

-- --- enquiries (contact) -------------------------------------------------------
create table if not exists public.enquiries (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  message text not null,
  handled boolean not null default false,
  created_at timestamptz not null default now()
);

-- --- row level security ------------------------------------------------------
alter table public.members          enable row level security;
alter table public.readiness_checks enable row level security;
alter table public.orders           enable row level security;
alter table public.applications     enable row level security;
alter table public.enquiries        enable row level security;

drop policy if exists members_self_select on public.members;
create policy members_self_select on public.members
  for select using (id = auth.uid() or public.vf_is_staff());

drop policy if exists members_self_update on public.members;
create policy members_self_update on public.members
  for update using (id = auth.uid())
  with check (id = auth.uid() and role = (select m.role from public.members m where m.id = auth.uid()));

drop policy if exists checks_owner_select on public.readiness_checks;
create policy checks_owner_select on public.readiness_checks
  for select using (member_id = auth.uid() or public.vf_is_staff());

drop policy if exists orders_owner_select on public.orders;
create policy orders_owner_select on public.orders
  for select using (member_id = auth.uid() or public.vf_is_staff());

drop policy if exists applications_staff_all on public.applications;
create policy applications_staff_all on public.applications
  for all using (public.vf_is_staff()) with check (public.vf_is_staff());

drop policy if exists enquiries_staff_all on public.enquiries;
create policy enquiries_staff_all on public.enquiries
  for all using (public.vf_is_staff()) with check (public.vf_is_staff());
