create table if not exists public.sps_analytics_events (
  id bigint generated always as identity primary key,
  site text not null check (site in ('snarky-how-to','dumpster-atlas')),
  event_name text not null check (char_length(event_name) between 1 and 80),
  session_id text not null check (char_length(session_id) between 8 and 100),
  path text,
  resource_id text,
  meta jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists sps_analytics_events_site_created_idx
  on public.sps_analytics_events(site, created_at desc);

alter table public.sps_analytics_events enable row level security;
revoke all on table public.sps_analytics_events from anon, authenticated;

create table if not exists public.dumpster_atlas_resources (
  id text primary key,
  name text not null,
  category text not null,
  tags text[] not null default '{}',
  address text not null,
  city text not null,
  latitude double precision not null,
  longitude double precision not null,
  description text not null,
  access_note text not null,
  source_url text not null,
  verified_at date not null,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists dumpster_atlas_resources_category_idx
  on public.dumpster_atlas_resources(category);

alter table public.dumpster_atlas_resources enable row level security;
revoke all on table public.dumpster_atlas_resources from anon, authenticated;

insert into public.dumpster_atlas_resources
(id,name,category,tags,address,city,latitude,longitude,description,access_note,source_url,verified_at,active)
values
('ranch-town','Ranch Town Recycling Center', 'recycling', array['cans','bottles','crv','metal','recycling'], '775 Lincoln Ave, San Jose, CA 95126', 'San Jose', 37.31554, -121.90698, 'CRV beverage-container redemption plus non-ferrous metal recycling.', 'Public recycling/buyback location. Confirm current accepted materials and pricing before travel.', 'https://www.ranchtownrecycling.com/contact-us', '2026-09-16', true),
('danny-recycling','Danny''s Recycling', 'recycling', array['cans','bottles','crv','cardboard','metal','recycling'], '1745 Walsh Ave, Santa Clara, CA 95050', 'Santa Clara', 37.3702039, -121.9578875, 'Residential drop-off for CRV containers, cardboard and scrap metal.', 'Public recycling location. Confirm current hours and material rules before travel.', 'https://recyclestuff.org/company/danny-recycling-95050', '2026-09-16', true),
('lighthouse-food','Lighthouse Food Rescue & Distribution', 'food', array['food','groceries','free-food','community'], '309 N 17th St, San Jose, CA 95112', 'San Jose', 37.34829, -121.877914, 'Free farmer''s-market-style food distribution with changing daily selection.', 'Public community food resource. Hours and food availability can change; check the source before travel.', 'https://www.lfoodrescue.org/contact', '2026-09-16', true),
('second-harvest-curtner','Second Harvest of Silicon Valley — Curtner Center', 'food', array['food','food-assistance','donations','community'], '750 Curtner Ave, San Jose, CA 95125', 'San Jose', 37.29168, -121.87721, 'Regional hunger-relief organization and food-assistance resource hub.', 'Use Second Harvest''s current food-finder/contact guidance for recipient services; this location also supports operations and donations.', 'https://www.shfb.org/about-us/contact-us/', '2026-09-16', true),
('habitat-restore','Habitat for Humanity ReStore San Jose', 'reuse', array['reuse','furniture','building-materials','appliances','useful-materials','clothing'], '1608 Las Plumas Ave, San Jose, CA 95133', 'San Jose', 37.35986, -121.86782, 'Nonprofit reuse store and donation center for furniture, building materials, appliances and other usable goods.', 'Public retail/donation resource. Confirm donation acceptance before bringing large or unusual items.', 'https://www.habitat.org/restores', '2026-09-16', true)
on conflict (id) do update set
  name=excluded.name,
  category=excluded.category,
  tags=excluded.tags,
  address=excluded.address,
  city=excluded.city,
  latitude=excluded.latitude,
  longitude=excluded.longitude,
  description=excluded.description,
  access_note=excluded.access_note,
  source_url=excluded.source_url,
  verified_at=excluded.verified_at,
  active=excluded.active,
  updated_at=now();
