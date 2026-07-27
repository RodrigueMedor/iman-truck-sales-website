create extension if not exists pgcrypto;

create table if not exists public.admin_users (
  user_id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);
create table if not exists public.vehicles (
  id uuid primary key default gen_random_uuid(), created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
  name text not null, make text not null, model text not null, year int not null, condition text not null default 'Used',
  vehicle_type text not null, mileage int not null default 0, price numeric, status text not null default 'available',
  image_url text not null default '', description text not null default ''
);
create table if not exists public.site_content (
  id uuid primary key default gen_random_uuid(), created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
  page text not null, content_key text not null, title text not null default '', body text not null default '',
  unique(page, content_key)
);
create table if not exists public.inquiries (
  id uuid primary key default gen_random_uuid(), created_at timestamptz not null default now(),
  first_name text not null, last_name text not null, email text not null, phone text not null default '',
  interest text not null, message text not null, status text not null default 'new'
);

alter table public.admin_users enable row level security;
alter table public.vehicles enable row level security;
alter table public.site_content enable row level security;
alter table public.inquiries enable row level security;

create or replace function public.is_admin() returns boolean language sql stable security definer set search_path = public
as $$ select exists(select 1 from public.admin_users where user_id = auth.uid()) $$;

create policy "public reads visible vehicles" on public.vehicles for select using (status <> 'hidden');
create policy "public reads site content" on public.site_content for select using (true);
create policy "public creates inquiries" on public.inquiries for insert with check (true);
create policy "admins manage vehicles" on public.vehicles for all using (public.is_admin()) with check (public.is_admin());
create policy "admins manage content" on public.site_content for all using (public.is_admin()) with check (public.is_admin());
create policy "admins manage inquiries" on public.inquiries for all using (public.is_admin()) with check (public.is_admin());
create policy "admins read own membership" on public.admin_users for select using (user_id = auth.uid());

