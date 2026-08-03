-- =============================================================================
-- 0005_content.sql — journal, stories, and private storage
-- =============================================================================

create type publish_status as enum ('draft', 'review', 'published', 'archived');

create table public.articles (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  standfirst text,
  body_md text not null default '',
  author_name text,
  status publish_status not null default 'draft',
  published_at timestamptz,
  reading_minutes integer check (reading_minutes > 0),
  tags text[] not null default '{}',
  is_demo boolean not null default false,
  created_by uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index articles_status_idx on public.articles (status, published_at desc);

create trigger articles_touch
  before update on public.articles
  for each row execute function public.touch_updated_at();

-- --- testimonials ------------------------------------------------------------
-- A story may only be published with a recorded written release. The constraint
-- is here, not in the admin form, so nothing can be published without one.

create table public.testimonials (
  id uuid primary key default gen_random_uuid(),
  author_first_name text not null,
  body text not null,
  context text,
  status publish_status not null default 'draft',
  -- Evidence of a signed release. Required to publish.
  release_reference text,
  release_signed_at timestamptz,
  consent_record_id uuid references public.consent_records (id) on delete set null,
  is_demo boolean not null default false,
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint published_requires_release check (
    status <> 'published'
    or (release_reference is not null and release_signed_at is not null)
  ),
  -- Demonstration content can never be published to the public site.
  constraint demo_never_published check (not (is_demo and status = 'published'))
);

create trigger testimonials_touch
  before update on public.testimonials
  for each row execute function public.touch_updated_at();

alter table public.articles     enable row level security;
alter table public.testimonials enable row level security;

create policy articles_public_select on public.articles
  for select to anon, authenticated
  using (status = 'published' and not is_demo);

create policy articles_editor_all on public.articles
  for all to authenticated
  using (public.has_role('content_editor') or public.is_admin())
  with check (public.has_role('content_editor') or public.is_admin());

create policy testimonials_public_select on public.testimonials
  for select to anon, authenticated
  using (status = 'published' and not is_demo);

create policy testimonials_editor_all on public.testimonials
  for all to authenticated
  using (public.has_role('content_editor') or public.is_admin())
  with check (public.has_role('content_editor') or public.is_admin());

-- =============================================================================
-- Storage — private buckets only. Every file is served through a signed,
-- expiring URL. There is no public bucket in this project.
-- =============================================================================

insert into storage.buckets (id, name, public)
values
  ('member-documents', 'member-documents', false),
  ('verification-evidence', 'verification-evidence', false),
  ('readiness-maps', 'readiness-maps', false)
on conflict (id) do nothing;

-- Members read and write only within a folder named for their own user id.
create policy member_documents_own on storage.objects
  for all to authenticated
  using (
    bucket_id = 'member-documents'
    and (storage.foldername(name))[1] = auth.uid()::text
  )
  with check (
    bucket_id = 'member-documents'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy readiness_maps_own on storage.objects
  for select to authenticated
  using (
    bucket_id = 'readiness-maps'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- Verification evidence is write-only for the member and readable only by
-- safety reviewers and administrators.
create policy verification_evidence_upload on storage.objects
  for insert to authenticated
  with check (
    bucket_id = 'verification-evidence'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy verification_evidence_review on storage.objects
  for select to authenticated
  using (
    bucket_id = 'verification-evidence'
    and (public.has_role('safety_reviewer') or public.is_admin())
  );
