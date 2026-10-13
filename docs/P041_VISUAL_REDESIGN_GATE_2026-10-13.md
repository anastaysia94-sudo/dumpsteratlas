# P041 visual redesign — owner feedback gate (2026-10-13)
**Record:** [ChatGPT - anastaysia94] [2026-10-13 PT]  
**Disposition:** CURRENT VISUALS NOT OWNER-APPROVED. Do not infer approval of the existing illustrated/neon collector UI from successful GitHub CI, merge status, or prior deploy.
**Scope:** Design brief / proposed creative direction only. No screenshot, mockup, production code change, asset replacement, site deployment or owner sign-off is asserted by this file.

## Owner feedback
Owner dislikes visuals seen so far and requests what comes next. Treat this as rejection of the existing presentation, not a cancellation of Dumpster Atlas's working functionality. Preserve existing source/art as historical reversible assets; do not destroy design before replacement has been approved.

## Recommended sequence: one actual map-first prototype before any system-wide reskin
1. Audit the current **separate** interfaces: repository static GitHub/Supabase map app and private Fieldbook Site. Do not assume visual fixes to one affect the other.
2. Request owner choice between a new design direction or visual references. Proposed nonbinding options: (A) **Urban Field Guide** — tactile map/cream/olive/copper/rust, (B) **Midnight Navigator** — charcoal/teal/amber high-contrast navigation, (C) **Clean City Explorer** — editorial cream/forest/terracotta minimalist map. No option is approved yet.
3. Produce one *actual Dumpster Atlas mobile home/map screen* in the chosen direction, using concrete content and map/list controls. Present at 390px mobile and 1440px desktop without replacing deployed app or data.
4. UX priorities: map and nearby public resources first; high-contrast clear search, 2/5/10/15/20-mile radius options, category chips, visible source trust badges (verified curated vs community OSM), one-tap directions, browse list fallback, offline/local-note status and accessible navigation. One-handed reach, clear language, readable sunlight contrast, WCAG 2.2 AA targets. Avoid decorative hero dominating viewport.
5. Validate with owner feedback on layout, palette, typography and artwork. Only then build shared design tokens/components, separately adapt the source app and Fieldbook, stage QA (phone/map/source/data), and publish with rollback plan after owner approval.

## Data/ethics constraints
For recycler and assistance users, do not obscure directions, accuracy/verification dates, access warnings, source trust or costs. No invented private dumpsters, unauthorized entry claims, payouts or live location pins. Gracefully degrade without geolocation/network access. Respect owner scope and don't publish screenshots of user's coordinates or notes.

## Unchanged technical gates
The source and prior GitHub CI passing do not verify host/browser behavior. Private Fieldbook Edit/backup validation/offline cache and Samsung Galaxy A17 runtime QA are still open. No public launch, authorized pickup business, revenue or payment evidence verified. See docs/P041_EXECUTION_HANDOFF_2026-10-13.md.
