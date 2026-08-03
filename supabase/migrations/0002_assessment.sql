-- =============================================================================
-- 0002_assessment.sql — the assessment, the readiness map, and requirements
--
-- An assessment may begin before an account exists. Anonymous runs are keyed
-- by anon_key and are only ever written server-side; no anon RLS policy grants
-- browser access to them. On signup the run is claimed by setting user_id.
-- =============================================================================

create type assessment_status as enum ('in_progress', 'completed', 'abandoned');

create type readiness_band as enum (
  'not_yet',        -- real work needed before meeting anyone
  'emerging',       -- moving, with a named obstacle in the way
  'workable',       -- sound, with specifics to sharpen
  'ready'           -- ready for introductions on this dimension
);

create type constraint_strength as enum ('hard', 'flexible');

-- --- readiness_dimensions ----------------------------------------------------
-- Reference data. Public read: the map's dimensions are not a secret, and the
-- marketing site explains them.

create table public.readiness_dimensions (
  key text primary key,
  name text not null,
  ordinal integer not null,
  description text not null,
  -- What a low band means, and what to do first about it.
  obstacle_prompt text not null,
  first_action text not null,
  created_at timestamptz not null default now()
);

-- --- assessments -------------------------------------------------------------

create table public.assessments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles (id) on delete cascade,
  anon_key text unique,
  status assessment_status not null default 'in_progress',
  current_step integer not null default 0 check (current_step >= 0),
  marriage_timeline text,
  timeline_deferred boolean not null default false,
  contact_email citext,
  contact_name text,
  locale text not null default 'en',
  started_at timestamptz not null default now(),
  completed_at timestamptz,
  is_demo boolean not null default false,
  deleted_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint assessment_owner_present check (user_id is not null or anon_key is not null)
);

create index assessments_user_idx on public.assessments (user_id, created_at desc);
create index assessments_status_idx on public.assessments (status);

create trigger assessments_touch
  before update on public.assessments
  for each row execute function public.touch_updated_at();

-- --- assessment_answers ------------------------------------------------------
-- Every answer is stored verbatim. The free-text answers in particular are the
-- highest-value data in the product and are never summarised on write.

create table public.assessment_answers (
  id uuid primary key default gen_random_uuid(),
  assessment_id uuid not null references public.assessments (id) on delete cascade,
  question_key text not null,
  value jsonb not null,
  answered_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (assessment_id, question_key)
);

create index answers_assessment_idx on public.assessment_answers (assessment_id);

create trigger answers_touch
  before update on public.assessment_answers
  for each row execute function public.touch_updated_at();

-- --- readiness_results -------------------------------------------------------
-- One row per assessment, holding the whole map. No single score, ever:
-- bands is a jsonb map of dimension key -> { band, note, first_action }.

create table public.readiness_results (
  id uuid primary key default gen_random_uuid(),
  assessment_id uuid not null unique references public.assessments (id) on delete cascade,
  user_id uuid references public.profiles (id) on delete cascade,
  bands jsonb not null default '{}'::jsonb,
  strengths text[] not null default '{}',
  obstacles text[] not null default '{}',
  recommended_product text,
  summary text,
  engine_version text not null default 'v1',
  pdf_path text,
  emailed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index results_user_idx on public.readiness_results (user_id, created_at desc);

create trigger results_touch
  before update on public.readiness_results
  for each row execute function public.touch_updated_at();

-- --- partner_preferences -----------------------------------------------------

create table public.partner_preferences (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references public.profiles (id) on delete cascade,
  age_min integer check (age_min >= 18),
  age_max integer check (age_max >= 18),
  locations text[] not null default '{}',
  open_to_relocation boolean,
  faith text,
  faith_importance smallint check (faith_importance between 0 and 5),
  wants_children text,
  accepts_existing_children boolean,
  education_preference text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint age_range_ordered check (age_min is null or age_max is null or age_min <= age_max)
);

create trigger partner_preferences_touch
  before update on public.partner_preferences
  for each row execute function public.touch_updated_at();

-- --- hard_constraints --------------------------------------------------------
-- Stage one of matching removes any candidate failing either party's hard
-- constraints. Mutual, absolute, never scored.

create table public.hard_constraints (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  attribute text not null,
  operator text not null check (operator in ('eq', 'neq', 'in', 'not_in', 'gte', 'lte', 'between', 'bool')),
  value jsonb not null,
  rationale text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, attribute)
);

create index hard_constraints_user_idx on public.hard_constraints (user_id);

create trigger hard_constraints_touch
  before update on public.hard_constraints
  for each row execute function public.touch_updated_at();

-- --- flexible_preferences ----------------------------------------------------

create table public.flexible_preferences (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  attribute text not null,
  value jsonb not null,
  weight numeric(4, 3) not null default 0.5 check (weight >= 0 and weight <= 1),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, attribute)
);

create index flexible_preferences_user_idx on public.flexible_preferences (user_id);

create trigger flexible_preferences_touch
  before update on public.flexible_preferences
  for each row execute function public.touch_updated_at();

-- =============================================================================
-- RLS
-- =============================================================================

alter table public.readiness_dimensions   enable row level security;
alter table public.assessments            enable row level security;
alter table public.assessment_answers     enable row level security;
alter table public.readiness_results      enable row level security;
alter table public.partner_preferences    enable row level security;
alter table public.hard_constraints       enable row level security;
alter table public.flexible_preferences   enable row level security;

-- readiness_dimensions: reference data, readable by anyone.
create policy dimensions_public_select on public.readiness_dimensions
  for select to anon, authenticated using (true);

create policy dimensions_admin_write on public.readiness_dimensions
  for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

-- assessments -----------------------------------------------------------------

create policy assessments_self_select on public.assessments
  for select to authenticated
  using (user_id = auth.uid());

create policy assessments_self_write on public.assessments
  for all to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

create policy assessments_admin_select on public.assessments
  for select to authenticated
  using (public.is_admin());

-- assessment_answers ----------------------------------------------------------

create policy answers_self_all on public.assessment_answers
  for all to authenticated
  using (
    exists (
      select 1 from public.assessments a
      where a.id = assessment_id and a.user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.assessments a
      where a.id = assessment_id and a.user_id = auth.uid()
    )
  );

create policy answers_admin_select on public.assessment_answers
  for select to authenticated
  using (public.is_admin());

-- readiness_results -----------------------------------------------------------

create policy results_self_select on public.readiness_results
  for select to authenticated
  using (user_id = auth.uid());

create policy results_admin_select on public.readiness_results
  for select to authenticated
  using (public.is_admin());

-- Results are written by the scoring engine server-side, never by the browser.

-- partner_preferences / hard_constraints / flexible_preferences ---------------

create policy prefs_self_all on public.partner_preferences
  for all to authenticated
  using (user_id = auth.uid()) with check (user_id = auth.uid());

create policy prefs_admin_select on public.partner_preferences
  for select to authenticated using (public.is_admin());

create policy hard_self_all on public.hard_constraints
  for all to authenticated
  using (user_id = auth.uid()) with check (user_id = auth.uid());

create policy hard_admin_select on public.hard_constraints
  for select to authenticated using (public.is_admin());

create policy flex_self_all on public.flexible_preferences
  for all to authenticated
  using (user_id = auth.uid()) with check (user_id = auth.uid());

create policy flex_admin_select on public.flexible_preferences
  for select to authenticated using (public.is_admin());
