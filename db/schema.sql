-- ============================================================================
--  elyse-blogs — Supabase schema, Row-Level Security and seed data
--  Run this once in the Supabase SQL editor (Dashboard -> SQL -> New query).
--  It is safe to re-run: every statement is idempotent.
-- ============================================================================

create extension if not exists "pgcrypto";

-- ─── Profiles (admin allow-list) ────────────────────────────────────────────
-- Every auth user gets a row here. Only rows with is_admin = true may manage
-- content. Creating an account is NOT enough to become an admin.
create table if not exists public.profiles (
  id         uuid primary key references auth.users (id) on delete cascade,
  email      text,
  is_admin   boolean not null default false,
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

drop policy if exists "profiles: read own" on public.profiles;
create policy "profiles: read own"
  on public.profiles for select
  to authenticated
  using (auth.uid() = id);

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and is_admin = true
  );
$$;

grant execute on function public.is_admin() to authenticated;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email)
  values (new.id, new.email)
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ─── Projects ───────────────────────────────────────────────────────────────
create table if not exists public.projects (
  id          uuid primary key default gen_random_uuid(),
  title       text not null,
  description text not null default '',
  tags        text[] not null default '{}',
  image_url   text,
  link        text not null default '#',
  sort_order  int not null default 0,
  published   boolean not null default true,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

alter table public.projects enable row level security;

drop policy if exists "projects: public read published" on public.projects;
create policy "projects: public read published"
  on public.projects for select
  to anon, authenticated
  using (published = true);

drop policy if exists "projects: admin all" on public.projects;
create policy "projects: admin all"
  on public.projects for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- ─── Skills ─────────────────────────────────────────────────────────────────
create table if not exists public.skills (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  category    text not null default 'Other',
  level       int not null default 50 check (level between 0 and 100),
  description text not null default '',
  sort_order  int not null default 0,
  created_at  timestamptz not null default now()
);

alter table public.skills enable row level security;

drop policy if exists "skills: public read" on public.skills;
create policy "skills: public read"
  on public.skills for select
  to anon, authenticated
  using (true);

drop policy if exists "skills: admin all" on public.skills;
create policy "skills: admin all"
  on public.skills for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- ─── Blog posts ─────────────────────────────────────────────────────────────
create table if not exists public.posts (
  id           uuid primary key default gen_random_uuid(),
  slug         text not null unique,
  title        text not null,
  excerpt      text not null default '',
  body         text not null default '',
  cover_url    text,
  published    boolean not null default false,
  published_at timestamptz,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

alter table public.posts enable row level security;

drop policy if exists "posts: public read published" on public.posts;
create policy "posts: public read published"
  on public.posts for select
  to anon, authenticated
  using (published = true);

drop policy if exists "posts: admin all" on public.posts;
create policy "posts: admin all"
  on public.posts for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- ─── Guest book ─────────────────────────────────────────────────────────────
create table if not exists public.guestbook_entries (
  id         uuid primary key default gen_random_uuid(),
  name       text not null,
  message    text not null,
  approved   boolean not null default true,
  created_at timestamptz not null default now()
);

alter table public.guestbook_entries enable row level security;

drop policy if exists "guestbook: public read approved" on public.guestbook_entries;
create policy "guestbook: public read approved"
  on public.guestbook_entries for select
  to anon, authenticated
  using (approved = true);

drop policy if exists "guestbook: public insert" on public.guestbook_entries;
create policy "guestbook: public insert"
  on public.guestbook_entries for insert
  to anon, authenticated
  with check (char_length(name) between 1 and 80 and char_length(message) between 1 and 500);

drop policy if exists "guestbook: admin all" on public.guestbook_entries;
create policy "guestbook: admin all"
  on public.guestbook_entries for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- ─── Contact messages (private) ─────────────────────────────────────────────
create table if not exists public.contact_messages (
  id         uuid primary key default gen_random_uuid(),
  name       text not null,
  email      text not null,
  message    text not null,
  read       boolean not null default false,
  created_at timestamptz not null default now()
);

alter table public.contact_messages enable row level security;

drop policy if exists "contact: public insert" on public.contact_messages;
create policy "contact: public insert"
  on public.contact_messages for insert
  to anon, authenticated
  with check (char_length(name) between 1 and 120 and char_length(message) between 1 and 4000);

drop policy if exists "contact: admin read" on public.contact_messages;
create policy "contact: admin read"
  on public.contact_messages for select
  to authenticated
  using (public.is_admin());

drop policy if exists "contact: admin update" on public.contact_messages;
create policy "contact: admin update"
  on public.contact_messages for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists "contact: admin delete" on public.contact_messages;
create policy "contact: admin delete"
  on public.contact_messages for delete
  to authenticated
  using (public.is_admin());

-- ─── Site settings (JSON key/value) ─────────────────────────────────────────
create table if not exists public.site_settings (
  key        text primary key,
  value      jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

alter table public.site_settings enable row level security;

drop policy if exists "settings: public read" on public.site_settings;
create policy "settings: public read"
  on public.site_settings for select
  to anon, authenticated
  using (true);

drop policy if exists "settings: admin all" on public.site_settings;
create policy "settings: admin all"
  on public.site_settings for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- ─── updated_at trigger ─────────────────────────────────────────────────────
create or replace function public.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists projects_touch on public.projects;
create trigger projects_touch
  before update on public.projects
  for each row execute function public.touch_updated_at();

drop trigger if exists posts_touch on public.posts;
create trigger posts_touch
  before update on public.posts
  for each row execute function public.touch_updated_at();

-- ─── Grants for the anon / authenticated roles ──────────────────────────────
grant usage on schema public to anon, authenticated;
grant select on public.projects, public.skills, public.posts,
  public.guestbook_entries, public.site_settings to anon, authenticated;
grant insert on public.guestbook_entries, public.contact_messages to anon, authenticated;
grant all on public.projects, public.skills, public.posts, public.guestbook_entries,
  public.contact_messages, public.site_settings, public.profiles to authenticated;

-- ============================================================================
--  Seed data (only inserts when the tables are still empty)
-- ============================================================================
insert into public.projects (title, description, tags, image_url, link, sort_order)
select * from (values
  (
    'E-Commerce Platform',
    'A full-featured online store with product catalog, shopping cart, secure checkout via Stripe, and an admin dashboard for managing inventory and orders.',
    array['react','node.js','stripe','mongodb'],
    'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=600&h=400&fit=crop',
    '#', 0
  ),
  (
    'Task Manager Pro',
    'A collaborative project management tool with real-time updates, drag-and-drop Kanban boards, team chat, and deadline tracking.',
    array['next.js','socket.io','postgresql','redis'],
    'https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=600&h=400&fit=crop',
    '#', 1
  ),
  (
    'Weather Dashboard',
    'An interactive weather forecasting app with 7-day forecasts, radar maps, location-based alerts, and beautiful data visualizations.',
    array['react','d3.js','openweather api','mapbox'],
    'https://images.unsplash.com/photo-1504608524841-42fe6f032b4b?w=600&h=400&fit=crop',
    '#', 2
  ),
  (
    'Mobile Banking App',
    'A cross-platform mobile banking application featuring transaction history, QR code payments, and biometric authentication.',
    array['flutter','firebase','rest api','kotlin'],
    'https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?w=600&h=400&fit=crop',
    '#', 3
  )
) as seed(title, description, tags, image_url, link, sort_order)
where not exists (select 1 from public.projects);

insert into public.skills (name, category, level, description, sort_order)
select * from (values
  ('HTML', 'Languages', 92, 'Semantic markup that keeps pages structured, accessible and search-engine friendly.', 0),
  ('CSS', 'Languages', 88, 'Styling the web — responsive layouts, motion and polished design systems.', 1),
  ('JavaScript', 'Languages', 90, 'Core language for modern web apps, powering interactive UI logic and full-stack APIs.', 2),
  ('React', 'Frontend', 88, 'Component-based library for building fast, reusable and interactive interfaces.', 3),
  ('Next.js', 'Frontend', 78, 'Full-stack React framework with SSR and static generation for performance.', 4),
  ('PHP', 'Backend', 80, 'Server-side scripting for reliable, maintainable web backends.', 5),
  ('Laravel', 'Backend', 75, 'Elegant PHP framework for rapid, testable application development.', 6),
  ('Node.js', 'Backend', 82, 'JavaScript on the server for fast, event-driven APIs and tooling.', 7),
  ('MySQL', 'Backend', 76, 'Relational database design, modeling and optimization at scale.', 8),
  ('Git', 'Tools', 85, 'Version control for tracking changes, collaboration and confident shipping.', 9)
) as seed(name, category, level, description, sort_order)
where not exists (select 1 from public.skills);

insert into public.posts (slug, title, excerpt, body, published, published_at)
select
  'hello-world',
  'Hello, world',
  'The first post on my new blog. A short note about why I am writing and what to expect.',
  'Welcome to my blog! I will use this space to share what I am building, the tools I am learning, and the lessons that come with shipping software in Kigali and beyond.' || E'\n\n' ||
  'Expect short, practical write-ups about React, full-stack development, and the small details that make products feel good to use.',
  true,
  now()
where not exists (select 1 from public.posts);

insert into public.site_settings (key, value)
values ('site', '{"name":"Elyse","tagline":"Software Developer building simple, useful and reliable digital experiences."}'::jsonb)
on conflict (key) do nothing;

-- ============================================================================
--  FINAL STEP — make yourself an admin
--  Create your user first (Dashboard -> Authentication -> Users -> Add user,
--  or sign up once), then run this with your email address:
--
--    insert into public.profiles (id, email, is_admin)
--    select id, email, true from auth.users where email = 'you@example.com'
--    on conflict (id) do update set is_admin = true;
--
--  Finally, disable public sign-ups: Dashboard -> Authentication -> Providers
--  -> Email -> turn off "Allow new users to sign up".
-- ============================================================================
