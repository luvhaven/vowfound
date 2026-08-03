-- =============================================================================
-- 0003_commerce.sql — plans, enrolments, payments, appointments, notifications
--
-- Money is written server-side only, from verified webhooks. No client role
-- has insert or update on payments, subscriptions or refunds.
-- =============================================================================

create type payment_status as enum (
  'pending', 'succeeded', 'failed', 'refunded', 'partially_refunded', 'cancelled'
);

create type subscription_status as enum (
  'incomplete', 'active', 'past_due', 'paused', 'cancelled', 'completed'
);

create type enrolment_status as enum (
  'pending', 'active', 'paused', 'completed', 'withdrawn'
);

create type appointment_status as enum (
  'requested', 'confirmed', 'rescheduled', 'completed', 'cancelled', 'no_show'
);

create type payment_provider as enum ('stripe', 'paystack');

-- --- plans -------------------------------------------------------------------
-- The catalogue. Prices are held per currency, and a screen only ever renders
-- the currency it resolved for that request.

create table public.plans (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  shape text not null,
  summary text not null,
  price_ngn integer not null check (price_ngn >= 0),
  price_usd integer not null check (price_usd >= 0),
  includes text[] not null default '{}',
  band text not null,
  application_only boolean not null default false,
  is_active boolean not null default true,
  ordinal integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger plans_touch
  before update on public.plans
  for each row execute function public.touch_updated_at();

-- --- programmes and enrolments ----------------------------------------------

create table public.programmes (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  description text,
  duration_days integer check (duration_days > 0),
  plan_id uuid references public.plans (id) on delete set null,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.programme_enrolments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  programme_id uuid not null references public.programmes (id) on delete restrict,
  status enrolment_status not null default 'pending',
  starts_on date,
  ends_on date,
  -- The guarantee is measured against these two numbers and nothing else.
  agreed_introductions integer check (agreed_introductions >= 0),
  introductions_delivered integer not null default 0 check (introductions_delivered >= 0),
  search_extended_until date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, programme_id)
);

create index enrolments_user_idx on public.programme_enrolments (user_id);

create table public.lessons (
  id uuid primary key default gen_random_uuid(),
  programme_id uuid not null references public.programmes (id) on delete cascade,
  slug text not null,
  title text not null,
  body_md text,
  ordinal integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (programme_id, slug)
);

create table public.exercises (
  id uuid primary key default gen_random_uuid(),
  lesson_id uuid not null references public.lessons (id) on delete cascade,
  slug text not null,
  prompt text not null,
  ordinal integer not null default 0,
  created_at timestamptz not null default now(),
  unique (lesson_id, slug)
);

create table public.exercise_submissions (
  id uuid primary key default gen_random_uuid(),
  exercise_id uuid not null references public.exercises (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  body text not null,
  submitted_at timestamptz not null default now(),
  coach_feedback text,
  coach_id uuid references public.profiles (id) on delete set null,
  feedback_at timestamptz,
  unique (exercise_id, user_id)
);

create index submissions_user_idx on public.exercise_submissions (user_id);

-- --- money -------------------------------------------------------------------

create table public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  plan_id uuid not null references public.plans (id) on delete restrict,
  provider payment_provider not null,
  provider_subscription_id text,
  status subscription_status not null default 'incomplete',
  currency currency_code not null,
  started_at timestamptz,
  current_period_end timestamptz,
  cancelled_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (provider, provider_subscription_id)
);

create index subscriptions_user_idx on public.subscriptions (user_id);

create table public.payments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles (id) on delete set null,
  plan_id uuid references public.plans (id) on delete set null,
  subscription_id uuid references public.subscriptions (id) on delete set null,
  provider payment_provider not null,
  provider_reference text not null,
  status payment_status not null default 'pending',
  currency currency_code not null,
  -- Minor units: kobo for NGN, cents for USD.
  amount_minor bigint not null check (amount_minor >= 0),
  email citext,
  paid_at timestamptz,
  failure_reason text,
  raw_event jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (provider, provider_reference)
);

create index payments_user_idx on public.payments (user_id, created_at desc);
create index payments_status_idx on public.payments (status);

create trigger payments_touch
  before update on public.payments
  for each row execute function public.touch_updated_at();

create table public.refunds (
  id uuid primary key default gen_random_uuid(),
  payment_id uuid not null references public.payments (id) on delete cascade,
  provider_reference text,
  amount_minor bigint not null check (amount_minor >= 0),
  reason text,
  created_by uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now()
);

-- --- appointments ------------------------------------------------------------

create table public.appointments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles (id) on delete cascade,
  lead_id uuid references public.leads (id) on delete set null,
  staff_id uuid references public.profiles (id) on delete set null,
  kind text not null default 'consultation',
  status appointment_status not null default 'requested',
  scheduled_for timestamptz,
  duration_minutes integer not null default 60 check (duration_minutes > 0),
  external_provider text,
  external_event_id text,
  join_url text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index appointments_user_idx on public.appointments (user_id, scheduled_for desc);
create index appointments_staff_idx on public.appointments (staff_id, scheduled_for desc);

create trigger appointments_touch
  before update on public.appointments
  for each row execute function public.touch_updated_at();

-- --- notifications -----------------------------------------------------------

create table public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  kind text not null,
  title text not null,
  body text,
  href text,
  read_at timestamptz,
  created_at timestamptz not null default now()
);

create index notifications_user_idx on public.notifications (user_id, created_at desc);

-- =============================================================================
-- RLS
-- =============================================================================

alter table public.plans                enable row level security;
alter table public.programmes           enable row level security;
alter table public.programme_enrolments enable row level security;
alter table public.lessons              enable row level security;
alter table public.exercises            enable row level security;
alter table public.exercise_submissions enable row level security;
alter table public.subscriptions        enable row level security;
alter table public.payments             enable row level security;
alter table public.refunds              enable row level security;
alter table public.appointments         enable row level security;
alter table public.notifications        enable row level security;

-- plans and programmes: catalogue, public read of active rows only.
create policy plans_public_select on public.plans
  for select to anon, authenticated using (is_active);

create policy plans_admin_all on public.plans
  for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

create policy programmes_public_select on public.programmes
  for select to anon, authenticated using (is_active);

create policy programmes_admin_all on public.programmes
  for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

-- enrolments
create policy enrolments_self_select on public.programme_enrolments
  for select to authenticated using (user_id = auth.uid());

create policy enrolments_admin_all on public.programme_enrolments
  for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

-- lessons and exercises: readable only by someone enrolled on the programme.
create policy lessons_enrolled_select on public.lessons
  for select to authenticated
  using (
    exists (
      select 1 from public.programme_enrolments e
      where e.programme_id = lessons.programme_id
        and e.user_id = auth.uid()
        and e.status in ('active', 'completed')
    )
    or public.is_admin()
  );

create policy exercises_enrolled_select on public.exercises
  for select to authenticated
  using (
    exists (
      select 1
      from public.lessons l
      join public.programme_enrolments e on e.programme_id = l.programme_id
      where l.id = exercises.lesson_id
        and e.user_id = auth.uid()
        and e.status in ('active', 'completed')
    )
    or public.is_admin()
  );

create policy exercise_submissions_self_all on public.exercise_submissions
  for all to authenticated
  using (user_id = auth.uid()) with check (user_id = auth.uid());

create policy exercise_submissions_admin_select on public.exercise_submissions
  for select to authenticated using (public.is_admin());

-- money: readable by the payer and by administrators. Written server-side.
create policy subscriptions_self_select on public.subscriptions
  for select to authenticated using (user_id = auth.uid());

create policy subscriptions_admin_select on public.subscriptions
  for select to authenticated using (public.is_admin());

create policy payments_self_select on public.payments
  for select to authenticated using (user_id = auth.uid());

create policy payments_admin_select on public.payments
  for select to authenticated using (public.is_admin());

create policy refunds_admin_select on public.refunds
  for select to authenticated using (public.is_admin());

create policy refunds_self_select on public.refunds
  for select to authenticated
  using (
    exists (
      select 1 from public.payments p
      where p.id = refunds.payment_id and p.user_id = auth.uid()
    )
  );

-- appointments
create policy appointments_self_select on public.appointments
  for select to authenticated using (user_id = auth.uid());

create policy appointments_self_insert on public.appointments
  for insert to authenticated with check (user_id = auth.uid());

create policy appointments_staff_select on public.appointments
  for select to authenticated using (staff_id = auth.uid());

create policy appointments_admin_all on public.appointments
  for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

-- notifications
create policy notifications_self_select on public.notifications
  for select to authenticated using (user_id = auth.uid());

create policy notifications_self_update on public.notifications
  for update to authenticated
  using (user_id = auth.uid()) with check (user_id = auth.uid());

create policy notifications_admin_all on public.notifications
  for all to authenticated
  using (public.is_admin()) with check (public.is_admin());
