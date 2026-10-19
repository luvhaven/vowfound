-- =============================================================================
-- 0013_proof_and_followup.sql
--
-- 1. stories: real client words, published only with signed consent and a
--    staff approval. The public can read approved rows and nothing else.
-- 2. Follow-up state on readiness_checks, so the three-email sequence knows
--    what it has sent and respects an unsubscribe.
-- Additive only.
-- =============================================================================

create table if not exists public.stories (
  id uuid primary key default gen_random_uuid(),
  quote text not null check (char_length(quote) between 20 and 600),
  first_name text not null,
  detail text,                      -- e.g. "Lagos · Ready"
  consent_signed_at timestamptz not null,
  approved boolean not null default false,
  created_at timestamptz not null default now()
);

alter table public.stories enable row level security;

drop policy if exists stories_public_select on public.stories;
create policy stories_public_select on public.stories
  for select using (approved);

drop policy if exists stories_staff_all on public.stories;
create policy stories_staff_all on public.stories
  for all using (public.vf_is_staff()) with check (public.vf_is_staff());

alter table public.readiness_checks
  add column if not exists followups_sent integer not null default 0,
  add column if not exists last_followup_at timestamptz,
  add column if not exists unsubscribed boolean not null default false;

create index if not exists readiness_checks_followup_idx
  on public.readiness_checks (followups_sent, created_at)
  where email is not null and unsubscribed = false;
