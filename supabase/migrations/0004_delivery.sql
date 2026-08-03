-- =============================================================================
-- 0004_delivery.sql — the V2 delivery platform.
--
-- Every table here exists now, empty, with its policies, so that building the
-- V2 interfaces is not a migration. V1 writes to none of them.
--
-- Two rules are enforced structurally rather than in application code:
--   1. Coaches and matchmakers see only their assigned members.
--   2. Nothing about an introduction is visible to either party until both
--      have accepted.
-- =============================================================================

create type introduction_status as enum (
  'draft',            -- matchmaker is preparing it
  'proposed',         -- sent to both parties, awaiting responses
  'mutual_accepted',  -- both accepted; identities may now be exchanged
  'declined',         -- at least one party declined
  'expired',
  'withdrawn'
);

create type introduction_response as enum ('pending', 'accepted', 'declined');

create type recommendation_decision as enum (
  'pending', 'accepted', 'rejected', 'overridden'
);

create type report_status as enum ('open', 'investigating', 'actioned', 'dismissed');

create type ticket_status as enum ('open', 'pending', 'resolved', 'closed');

-- --- staff and assignment ----------------------------------------------------

create table public.coaches (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references public.profiles (id) on delete cascade,
  display_name text not null,
  bio text,
  specialisms text[] not null default '{}',
  accepting_clients boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.matchmakers (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references public.profiles (id) on delete cascade,
  display_name text not null,
  bio text,
  regions text[] not null default '{}',
  accepting_clients boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- The single source of truth for "which staff may see this member".
create table public.staff_assignments (
  id uuid primary key default gen_random_uuid(),
  member_id uuid not null references public.profiles (id) on delete cascade,
  staff_id uuid not null references public.profiles (id) on delete cascade,
  capacity app_role not null check (capacity in ('coach', 'matchmaker', 'support_agent')),
  assigned_by uuid references public.profiles (id) on delete set null,
  started_at timestamptz not null default now(),
  ended_at timestamptz,
  unique (member_id, staff_id, capacity)
);

create index staff_assignments_staff_idx on public.staff_assignments (staff_id) where ended_at is null;
create index staff_assignments_member_idx on public.staff_assignments (member_id) where ended_at is null;

create or replace function public.is_assigned_to(member uuid)
returns boolean
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select exists (
    select 1 from public.staff_assignments
    where member_id = member
      and staff_id = auth.uid()
      and ended_at is null
  );
$$;

-- Coaches and matchmakers may read a member profile only while assigned.
create policy profiles_assigned_staff_select on public.profiles
  for select to authenticated
  using (public.is_assigned_to(id));

-- --- coaching ----------------------------------------------------------------

create table public.coaching_sessions (
  id uuid primary key default gen_random_uuid(),
  member_id uuid not null references public.profiles (id) on delete cascade,
  coach_id uuid not null references public.profiles (id) on delete restrict,
  scheduled_for timestamptz not null,
  duration_minutes integer not null default 60 check (duration_minutes > 0),
  status appointment_status not null default 'confirmed',
  agenda text,
  member_summary text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index coaching_sessions_member_idx on public.coaching_sessions (member_id, scheduled_for desc);

-- Private notes are readable only by their author and by administrators.
-- Not by the member, not by other staff, not by the assigned matchmaker.
create table public.private_notes (
  id uuid primary key default gen_random_uuid(),
  author_id uuid not null references public.profiles (id) on delete cascade,
  subject_user_id uuid not null references public.profiles (id) on delete cascade,
  body text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index private_notes_subject_idx on public.private_notes (subject_user_id, created_at desc);

-- --- matchmaking -------------------------------------------------------------

create table public.matchmaking_profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references public.profiles (id) on delete cascade,
  headline text,
  narrative text,
  photo_paths text[] not null default '{}',
  attributes jsonb not null default '{}'::jsonb,
  is_searchable boolean not null default false,
  -- Never public, never indexed, never browsable. Present for clarity so no
  -- future column is mistaken for a visibility switch.
  activated_at timestamptz,
  paused_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.verification_records (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  kind text not null check (kind in ('email', 'phone', 'government_id', 'background_check', 'employment')),
  status verification_status not null default 'pending',
  evidence_path text,
  reviewed_by uuid references public.profiles (id) on delete set null,
  reviewed_at timestamptz,
  expires_at timestamptz,
  created_at timestamptz not null default now(),
  unique (user_id, kind)
);

create table public.candidate_shortlists (
  id uuid primary key default gen_random_uuid(),
  member_id uuid not null references public.profiles (id) on delete cascade,
  matchmaker_id uuid not null references public.profiles (id) on delete restrict,
  label text,
  weights_version text not null default 'v1',
  created_at timestamptz not null default now()
);

-- Stage two output. Ranked, explained, and never acted on automatically.
create table public.match_recommendations (
  id uuid primary key default gen_random_uuid(),
  shortlist_id uuid not null references public.candidate_shortlists (id) on delete cascade,
  member_id uuid not null references public.profiles (id) on delete cascade,
  candidate_id uuid not null references public.profiles (id) on delete cascade,
  rank integer not null check (rank > 0),
  score numeric(6, 4) not null check (score >= 0 and score <= 1),
  dimension_scores jsonb not null default '{}'::jsonb,
  -- The written reason this candidate surfaced. Shown to the matchmaker, and
  -- in an edited form to the member if an introduction is proposed.
  explanation text not null,
  decision recommendation_decision not null default 'pending',
  decided_by uuid references public.profiles (id) on delete set null,
  decided_at timestamptz,
  -- Required whenever a human overrules the ranking.
  override_reason text,
  created_at timestamptz not null default now(),
  unique (shortlist_id, candidate_id),
  constraint override_reason_required check (
    decision <> 'overridden' or (override_reason is not null and length(override_reason) > 0)
  ),
  constraint no_self_match check (member_id <> candidate_id)
);

create index recommendations_member_idx on public.match_recommendations (member_id, rank);

-- --- introductions -----------------------------------------------------------

create table public.introductions (
  id uuid primary key default gen_random_uuid(),
  recommendation_id uuid references public.match_recommendations (id) on delete set null,
  matchmaker_id uuid not null references public.profiles (id) on delete restrict,
  party_a uuid not null references public.profiles (id) on delete cascade,
  party_b uuid not null references public.profiles (id) on delete cascade,
  status introduction_status not null default 'draft',
  reason_for_a text,
  reason_for_b text,
  proposed_at timestamptz,
  resolved_at timestamptz,
  expires_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint distinct_parties check (party_a <> party_b)
);

create index introductions_a_idx on public.introductions (party_a, status);
create index introductions_b_idx on public.introductions (party_b, status);

create table public.introduction_responses (
  id uuid primary key default gen_random_uuid(),
  introduction_id uuid not null references public.introductions (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  response introduction_response not null default 'pending',
  responded_at timestamptz,
  -- Never shown to the other party.
  private_reason text,
  unique (introduction_id, user_id)
);

-- An introduction reaches mutual_accepted only when both responses accept.
create or replace function public.sync_introduction_status()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  accepted_count integer;
  declined_count integer;
begin
  select
    count(*) filter (where response = 'accepted'),
    count(*) filter (where response = 'declined')
  into accepted_count, declined_count
  from public.introduction_responses
  where introduction_id = new.introduction_id;

  if declined_count > 0 then
    update public.introductions
      set status = 'declined', resolved_at = now()
      where id = new.introduction_id and status = 'proposed';
  elsif accepted_count >= 2 then
    update public.introductions
      set status = 'mutual_accepted', resolved_at = now()
      where id = new.introduction_id and status = 'proposed';
  end if;

  return new;
end;
$$;

create trigger introduction_response_sync
  after insert or update on public.introduction_responses
  for each row execute function public.sync_introduction_status();

create table public.dates (
  id uuid primary key default gen_random_uuid(),
  introduction_id uuid not null references public.introductions (id) on delete cascade,
  occurred_at timestamptz,
  location text,
  created_at timestamptz not null default now()
);

create table public.date_feedback (
  id uuid primary key default gen_random_uuid(),
  date_id uuid not null references public.dates (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  would_meet_again boolean,
  -- Read by the matchmaker to adjust the search. Never shown to the other party.
  private_notes text,
  what_worked text,
  what_did_not text,
  created_at timestamptz not null default now(),
  unique (date_id, user_id)
);

-- --- conversations -----------------------------------------------------------
-- Only opened once an introduction is mutually accepted.

create table public.conversations (
  id uuid primary key default gen_random_uuid(),
  introduction_id uuid not null unique references public.introductions (id) on delete cascade,
  opened_at timestamptz not null default now(),
  closed_at timestamptz
);

create table public.messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.conversations (id) on delete cascade,
  sender_id uuid not null references public.profiles (id) on delete cascade,
  body text not null,
  sent_at timestamptz not null default now(),
  read_at timestamptz,
  flagged_at timestamptz
);

create index messages_conversation_idx on public.messages (conversation_id, sent_at);

create or replace function public.in_conversation(conversation uuid)
returns boolean
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select exists (
    select 1
    from public.conversations c
    join public.introductions i on i.id = c.introduction_id
    where c.id = conversation
      and c.closed_at is null
      and i.status = 'mutual_accepted'
      and auth.uid() in (i.party_a, i.party_b)
  );
$$;

-- --- safety and support ------------------------------------------------------

create table public.safety_reports (
  id uuid primary key default gen_random_uuid(),
  reporter_id uuid references public.profiles (id) on delete set null,
  reported_user_id uuid references public.profiles (id) on delete set null,
  introduction_id uuid references public.introductions (id) on delete set null,
  category text not null,
  detail text not null,
  status report_status not null default 'open',
  reviewed_by uuid references public.profiles (id) on delete set null,
  reviewed_at timestamptz,
  outcome_note text,
  created_at timestamptz not null default now()
);

create index safety_reports_status_idx on public.safety_reports (status, created_at desc);

create table public.blocks (
  id uuid primary key default gen_random_uuid(),
  blocker_id uuid not null references public.profiles (id) on delete cascade,
  blocked_id uuid not null references public.profiles (id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (blocker_id, blocked_id),
  constraint no_self_block check (blocker_id <> blocked_id)
);

create table public.support_tickets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  subject text not null,
  body text not null,
  status ticket_status not null default 'open',
  assigned_to uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- --- matching weights, versioned and admin-configurable ----------------------

create table public.match_weights (
  id uuid primary key default gen_random_uuid(),
  version text not null unique,
  weights jsonb not null,
  is_active boolean not null default false,
  created_by uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now()
);

create unique index match_weights_single_active
  on public.match_weights ((true)) where is_active;

-- =============================================================================
-- RLS
-- =============================================================================

alter table public.coaches               enable row level security;
alter table public.matchmakers           enable row level security;
alter table public.staff_assignments     enable row level security;
alter table public.coaching_sessions     enable row level security;
alter table public.private_notes         enable row level security;
alter table public.matchmaking_profiles  enable row level security;
alter table public.verification_records  enable row level security;
alter table public.candidate_shortlists  enable row level security;
alter table public.match_recommendations enable row level security;
alter table public.introductions         enable row level security;
alter table public.introduction_responses enable row level security;
alter table public.dates                 enable row level security;
alter table public.date_feedback         enable row level security;
alter table public.conversations         enable row level security;
alter table public.messages              enable row level security;
alter table public.safety_reports        enable row level security;
alter table public.blocks                enable row level security;
alter table public.support_tickets       enable row level security;
alter table public.match_weights         enable row level security;

-- staff directories: staff themselves and administrators.
create policy coaches_self_select on public.coaches
  for select to authenticated using (user_id = auth.uid() or public.is_admin());

create policy matchmakers_self_select on public.matchmakers
  for select to authenticated using (user_id = auth.uid() or public.is_admin());

create policy staff_assignments_visible on public.staff_assignments
  for select to authenticated
  using (staff_id = auth.uid() or member_id = auth.uid() or public.is_admin());

create policy staff_assignments_admin_write on public.staff_assignments
  for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

-- coaching
create policy coaching_sessions_visible on public.coaching_sessions
  for select to authenticated
  using (member_id = auth.uid() or coach_id = auth.uid() or public.is_admin());

-- private notes: author and administrators. Nobody else, including the subject.
create policy private_notes_author on public.private_notes
  for all to authenticated
  using (author_id = auth.uid()) with check (author_id = auth.uid());

create policy private_notes_admin_select on public.private_notes
  for select to authenticated using (public.is_admin());

-- matchmaking profiles: the owner, assigned staff, administrators.
-- There is no policy that lets one member read another member's profile.
create policy matchmaking_profiles_self on public.matchmaking_profiles
  for all to authenticated
  using (user_id = auth.uid()) with check (user_id = auth.uid());

create policy matchmaking_profiles_assigned on public.matchmaking_profiles
  for select to authenticated
  using (public.is_assigned_to(user_id) or public.is_admin());

create policy verification_self_select on public.verification_records
  for select to authenticated using (user_id = auth.uid());

create policy verification_reviewer_all on public.verification_records
  for all to authenticated
  using (public.has_role('safety_reviewer') or public.is_admin())
  with check (public.has_role('safety_reviewer') or public.is_admin());

-- shortlists and recommendations: matchmaker-facing only. A member never sees
-- that they were ranked, or against whom.
create policy shortlists_matchmaker on public.candidate_shortlists
  for all to authenticated
  using (matchmaker_id = auth.uid() or public.is_admin())
  with check (matchmaker_id = auth.uid() or public.is_admin());

create policy recommendations_matchmaker on public.match_recommendations
  for all to authenticated
  using (
    public.is_admin()
    or exists (
      select 1 from public.candidate_shortlists s
      where s.id = shortlist_id and s.matchmaker_id = auth.uid()
    )
  )
  with check (
    public.is_admin()
    or exists (
      select 1 from public.candidate_shortlists s
      where s.id = shortlist_id and s.matchmaker_id = auth.uid()
    )
  );

-- introductions: each party sees their own, and only from 'proposed' onward.
-- A draft is invisible to both.
create policy introductions_party_select on public.introductions
  for select to authenticated
  using (
    auth.uid() in (party_a, party_b)
    and status <> 'draft'
  );

create policy introductions_matchmaker_all on public.introductions
  for all to authenticated
  using (matchmaker_id = auth.uid() or public.is_admin())
  with check (matchmaker_id = auth.uid() or public.is_admin());

-- A response is yours alone. Neither party can read the other's.
create policy introduction_responses_self on public.introduction_responses
  for all to authenticated
  using (user_id = auth.uid()) with check (user_id = auth.uid());

create policy introduction_responses_matchmaker_select on public.introduction_responses
  for select to authenticated
  using (
    public.is_admin()
    or exists (
      select 1 from public.introductions i
      where i.id = introduction_id and i.matchmaker_id = auth.uid()
    )
  );

create policy dates_party_select on public.dates
  for select to authenticated
  using (
    exists (
      select 1 from public.introductions i
      where i.id = introduction_id
        and auth.uid() in (i.party_a, i.party_b)
    )
    or public.is_admin()
  );

-- Feedback is private to its author, the assigned matchmaker and admins.
create policy date_feedback_self on public.date_feedback
  for all to authenticated
  using (user_id = auth.uid()) with check (user_id = auth.uid());

create policy date_feedback_matchmaker_select on public.date_feedback
  for select to authenticated
  using (
    public.is_admin()
    or exists (
      select 1
      from public.dates d
      join public.introductions i on i.id = d.introduction_id
      where d.id = date_id and i.matchmaker_id = auth.uid()
    )
  );

-- conversations and messages: only after mutual acceptance.
create policy conversations_party_select on public.conversations
  for select to authenticated using (public.in_conversation(id));

create policy messages_party_select on public.messages
  for select to authenticated using (public.in_conversation(conversation_id));

create policy messages_party_insert on public.messages
  for insert to authenticated
  with check (sender_id = auth.uid() and public.in_conversation(conversation_id));

-- safety
create policy safety_reports_self_insert on public.safety_reports
  for insert to authenticated with check (reporter_id = auth.uid());

create policy safety_reports_self_select on public.safety_reports
  for select to authenticated using (reporter_id = auth.uid());

create policy safety_reports_reviewer_all on public.safety_reports
  for all to authenticated
  using (public.has_role('safety_reviewer') or public.is_admin())
  with check (public.has_role('safety_reviewer') or public.is_admin());

create policy blocks_self_all on public.blocks
  for all to authenticated
  using (blocker_id = auth.uid()) with check (blocker_id = auth.uid());

create policy blocks_reviewer_select on public.blocks
  for select to authenticated
  using (public.has_role('safety_reviewer') or public.is_admin());

-- support
create policy tickets_self_all on public.support_tickets
  for all to authenticated
  using (user_id = auth.uid()) with check (user_id = auth.uid());

create policy tickets_agent_all on public.support_tickets
  for all to authenticated
  using (public.has_role('support_agent') or public.is_admin())
  with check (public.has_role('support_agent') or public.is_admin());

-- weights
create policy match_weights_staff_select on public.match_weights
  for select to authenticated
  using (public.has_role('matchmaker') or public.is_admin());

create policy match_weights_admin_write on public.match_weights
  for all to authenticated
  using (public.is_admin()) with check (public.is_admin());
