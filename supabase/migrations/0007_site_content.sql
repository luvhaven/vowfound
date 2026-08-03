-- =============================================================================
-- 0007_site_content.sql — editable front-end copy
--
-- Every editable string on the public site is one row here, keyed by a stable
-- identifier the code asks for. A missing row is not an error: the code
-- carries a default for every key, so the site renders correctly on a fresh
-- database and an editor is always changing something rather than creating it
-- from nothing.
--
-- What is deliberately NOT editable: the guarantee wording, and anything that
-- would let a CMS field introduce a promise of marriage. The save path
-- rejects those phrases, so this table cannot become the hole in the ten
-- non-negotiables.
-- =============================================================================

create table public.site_content (
  key text primary key,
  value text not null,
  -- Kept so an editor can always see, and revert to, what shipped.
  default_value text,
  updated_by uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index site_content_updated_idx on public.site_content (updated_at desc);

create trigger site_content_touch
  before update on public.site_content
  for each row execute function public.touch_updated_at();

alter table public.site_content enable row level security;

-- The public site reads this on every render, including for signed-out
-- visitors. It holds marketing copy and nothing private.
create policy site_content_public_read on public.site_content
  for select to anon, authenticated using (true);

-- Writing is a content-editor or administrator action.
create policy site_content_editor_write on public.site_content
  for all to authenticated
  using (public.has_role('content_editor') or public.is_admin())
  with check (public.has_role('content_editor') or public.is_admin());

-- --- Revision history --------------------------------------------------------
-- Copy changes are the easiest thing to get wrong and the hardest to notice,
-- so every save keeps the previous value.

create table public.site_content_revisions (
  id bigserial primary key,
  key text not null,
  previous_value text,
  new_value text not null,
  changed_by uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now()
);

create index site_content_revisions_key_idx
  on public.site_content_revisions (key, created_at desc);

alter table public.site_content_revisions enable row level security;

create policy site_content_revisions_read on public.site_content_revisions
  for select to authenticated
  using (public.has_role('content_editor') or public.is_admin());

create policy site_content_revisions_insert on public.site_content_revisions
  for insert to authenticated
  with check (public.has_role('content_editor') or public.is_admin());

create or replace function public.record_content_revision()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  if tg_op = 'UPDATE' and new.value is not distinct from old.value then
    return new;
  end if;

  insert into public.site_content_revisions (key, previous_value, new_value, changed_by)
  values (
    new.key,
    case when tg_op = 'UPDATE' then old.value else null end,
    new.value,
    new.updated_by
  );

  return new;
end;
$$;

create trigger site_content_revision
  after insert or update on public.site_content
  for each row execute function public.record_content_revision();
