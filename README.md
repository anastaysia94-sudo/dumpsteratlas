# Dumpster Atlas

A legal-resource map for public recycling, CRV, food-assistance, reuse, and useful-material locations around San Jose and Santa Clara County.

**Live app:** https://nqcshihyfhthywpseilx.supabase.co/functions/v1/dumpster-atlas

## What this repo is

This is the canonical source for Dumpster Atlas.

The product deliberately separates two kinds of location data:

1. **Verified curated resources** — source-checked records maintained by Dumpster Atlas.
2. **Community OpenStreetMap data** — live recycling records loaded from OpenStreetMap/Overpass and clearly labeled as not individually verified by Dumpster Atlas.

That distinction is part of the product, not decorative copy.

## Current shipped MVP

- Interactive Leaflet/OpenStreetMap map.
- Search and category filters.
- 2 / 5 / 10 / 15 / 20 mile radius options.
- Optional browser geolocation for on-device distance calculations.
- Five seeded, source-checked public resources.
- Optional live OpenStreetMap recycling layer.
- Directions and original-source links.
- Privacy-light analytics that does **not** record GPS coordinates or search text.
- SEO/AEO metadata and `WebApplication` structured data.

## Repository layout

- `supabase/functions/dumpster-atlas/` - public app, resource API, analytics receiver, and OSM proxy.
- `supabase/migrations/` - database schema and curated seed data.
- `data/verified-resources.json` - human-readable mirror of the curated seed set.
- `docs/DATA-TRUST.md` - rules for what can be labeled verified vs community data.
- `.github/workflows/quality.yml` - automated source/live checks.

## Plain-English glossary

- **Leaflet:** the small JavaScript mapping library that draws and controls the map.
- **OpenStreetMap (OSM):** a community-maintained geographic database.
- **Overpass:** a query service that lets Dumpster Atlas ask OSM for recycling records inside the visible map area.
- **Bounding box:** the north/south/east/west rectangle currently visible on a map.
- **CI (continuous integration):** automated checks GitHub runs after changes so broken code gets rejected before it becomes a public scavenger hunt.

## Safety boundary

Dumpster Atlas is a public-resource finder. It does not grant permission to enter private property, gated enclosures, locked trash areas, or restricted facilities.

Location availability, business hours, accepted materials, prices, eligibility, and access rules can change. Curated records therefore carry source URLs and verification dates.

## Deployment

Production currently runs on Supabase project `nqcshihyfhthywpseilx`.

```bash
supabase functions deploy dumpster-atlas --project-ref nqcshihyfhthywpseilx --no-verify-jwt
```

The endpoint is intentionally public. The service-role database key remains server-side and is never shipped to the browser.
