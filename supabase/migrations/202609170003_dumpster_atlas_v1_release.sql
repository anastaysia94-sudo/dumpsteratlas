-- Dumpster Atlas v1 release: moderated community reporting and owner/moderator access.
-- Direct browser access is denied; the public Edge Function performs validation and moderation through the service role.

create table if not exists public.dumpster_atlas_reports (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  moderated_at timestamptz,
  status text not null default 'pending' check (status in ('pending','approved','rejected')),
  session_id text not null,
  name text not null,
  category text not null check (category in ('recycling','food','reuse','electronics','useful-materials','community')),
  tags text[] not null default '{}',
  address text not null,
  city text not null default 'San Jose',
  latitude double precision,
  longitude double precision,
  description text not null default '',
  access_note text not null default '',
  source_url text,
  access_type text not null default 'public_resource' check (access_type in ('public_resource','public_dropoff','business_program','public_event','other_public')),
  public_access_confirmed boolean not null default false,
  moderator_note text not null default ''
);

create index if not exists dumpster_atlas_reports_status_created_idx
  on public.dumpster_atlas_reports(status, created_at desc);
create index if not exists dumpster_atlas_reports_city_idx
  on public.dumpster_atlas_reports(city);

alter table public.dumpster_atlas_reports enable row level security;
revoke all on public.dumpster_atlas_reports from anon, authenticated;

create table if not exists public.dumpster_atlas_admin_keys (
  id text primary key,
  label text not null,
  key_hash text not null unique,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  last_used_at timestamptz
);
alter table public.dumpster_atlas_admin_keys enable row level security;
revoke all on public.dumpster_atlas_admin_keys from anon, authenticated;

-- Raw owner/moderator keys are never committed. Provision key hashes out-of-band.

create table if not exists public.dumpster_atlas_moderation_log (
  id bigint generated always as identity primary key,
  report_id uuid not null references public.dumpster_atlas_reports(id) on delete cascade,
  action text not null check (action in ('approved','rejected','reopened')),
  admin_key_id text not null,
  note text not null default '',
  created_at timestamptz not null default now()
);
create index if not exists dumpster_atlas_moderation_log_report_idx
  on public.dumpster_atlas_moderation_log(report_id, created_at desc);
alter table public.dumpster_atlas_moderation_log enable row level security;
revoke all on public.dumpster_atlas_moderation_log from anon, authenticated;

comment on table public.dumpster_atlas_reports is 'Public-resource suggestions submitted through Dumpster Atlas. All submissions start pending and are never treated as curated records.';
comment on table public.dumpster_atlas_admin_keys is 'SHA-256 hashes of out-of-band owner/moderator access keys. Raw keys are never stored.';