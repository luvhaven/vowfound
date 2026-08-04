-- =============================================================================
-- 0008_analytics.sql — privacy-conscious product and conversion analytics
--
-- Events are written by the server only. They deliberately contain no email,
-- name, assessment answer, message body, or full referrer URL. A session id
-- lives in sessionStorage and disappears when the browser session ends.
-- =============================================================================

create table public.analytics_events (
  id bigserial primary key,
  session_id uuid not null,
  event_name text not null check (char_length(event_name) between 1 and 48),
  path text not null check (char_length(path) between 1 and 300),
  referrer_host text,
  utm_source text,
  utm_medium text,
  utm_campaign text,
  properties jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index analytics_event_time_idx
  on public.analytics_events (event_name, created_at desc);
create index analytics_session_time_idx
  on public.analytics_events (session_id, created_at desc);
create index analytics_path_time_idx
  on public.analytics_events (path, created_at desc);

alter table public.analytics_events enable row level security;

-- Browsers have no insert policy. The /api/analytics server route validates,
-- rate-limits, sanitises, and writes through the service client.
create policy analytics_admin_select on public.analytics_events
  for select to authenticated
  using (public.is_admin());

revoke insert, update, delete on public.analytics_events from anon, authenticated;
grant select on public.analytics_events to authenticated;
