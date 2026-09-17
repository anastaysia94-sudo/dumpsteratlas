# Dumpster Atlas Data Trust Rules

Dumpster Atlas has two deliberately separate trust levels.

## 1. Verified curated resource

A location may be shown as a **verified curated resource** only when all of the following are true:

- It is a public-facing legal resource, business, nonprofit, or official program.
- A source URL has been checked.
- The displayed address and basic purpose match the source.
- The record has a `verified_at` date.
- We do not claim current prices, inventory, hours, eligibility, or accepted materials unless the source explicitly supports them.
- The record includes an access note telling the user to confirm changing details before travel where appropriate.

Green map styling is reserved for this class.

## 2. Community OpenStreetMap resource

Live records returned from OpenStreetMap / Overpass are useful discovery data, but Dumpster Atlas has **not** individually checked each one.

Requirements:

- Amber styling only.
- The UI must say `Community OSM data` or equivalent.
- OSM records must link to their OpenStreetMap source record.
- The application must not silently convert live community records into verified Dumpster Atlas records.
- OSM/Overpass failure must not break the verified curated layer.

## Privacy boundary

- Precise browser location is used on-device for distance calculations.
- Analytics does not store GPS coordinates.
- Search analytics stores query length and result count, not the search text.
- Loading the optional OSM layer sends the visible map bounding box, not the user's exact GPS point.

## Access / legality boundary

Dumpster Atlas does not tell users that they have permission to enter private property, locked trash areas, gated facilities, employee-only areas, or restricted sites.

A public map pin is not permission. A source URL is not permission. A mysterious unlocked gate is, astonishingly, also not permission.

## Updating a curated record

When a record changes:

1. Re-check the source URL.
2. Update the record in `data/verified-resources.json`.
3. Update the idempotent seed/upsert in the Supabase migration or create a new data migration.
4. Set a new `verified_at` date.
5. Run CI and verify the production resource API before calling the change complete.
