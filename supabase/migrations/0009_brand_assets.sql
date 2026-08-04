-- =============================================================================
-- 0009_brand_assets.sql — administrator-managed public identity assets
-- =============================================================================

create table public.brand_assets (
  id boolean primary key default true check (id),
  logo_url text,
  favicon_url text,
  apple_icon_url text,
  updated_by uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger brand_assets_touch
  before update on public.brand_assets
  for each row execute function public.touch_updated_at();

alter table public.brand_assets enable row level security;

create policy brand_assets_public_read on public.brand_assets
  for select to anon, authenticated using (true);

create policy brand_assets_admin_write on public.brand_assets
  for all to authenticated
  using (public.is_admin())
  with check (public.is_admin());

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'brand-assets',
  'brand-assets',
  true,
  1572864,
  array['image/png', 'image/webp', 'image/svg+xml', 'image/x-icon', 'image/vnd.microsoft.icon']
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

create policy brand_assets_admin_insert on storage.objects
  for insert to authenticated
  with check (bucket_id = 'brand-assets' and public.is_admin());

create policy brand_assets_admin_update on storage.objects
  for update to authenticated
  using (bucket_id = 'brand-assets' and public.is_admin())
  with check (bucket_id = 'brand-assets' and public.is_admin());

create policy brand_assets_admin_delete on storage.objects
  for delete to authenticated
  using (bucket_id = 'brand-assets' and public.is_admin());
