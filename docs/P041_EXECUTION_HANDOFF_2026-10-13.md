# P041 Dumpster Atlas — Verified Execution and Cross-LLM Handoff
**Author:** [ChatGPT - anastaysia94] | **As of:** 2026-10-13 (Pacific)  
**Project:** P041 / XW0040 | **Company:** SmartPickShop USA Holdings, LLC

## Implementation identity — DO NOT MERGE THESE
1. **GitHub/Supabase map application (canonical repository):** https://github.com/anastaysia94-sudo/dumpsteratlas — production API endpoint declared in README: https://nqcshihyfhthywpseilx.supabase.co/functions/v1/dumpster-atlas . Source includes Leaflet/OpenStreetMap map, public curated resources, separate community OSM layer, search/categories and 2/5/10/15/20-mile radius, local collector trip receipts/CRV estimates and saved-stop planning. Static frontend artifact lives at docs/index.html. API endpoint was not independently rendered during this pass, and published static-host URL remains unknown.
2. **Private ChatGPT Site Fieldbook:** https://dumpster-atlas-fieldbook.anastaysia94.chatgpt.site . Previously deployed personal field notebook. Prior feature-presence record says save places, location, radius, category, earnings and export/import UI. Device persistence/edit/import validation/install/offline cache functionality remains UNPROVEN. Do not assume its source is the GitHub repository, and do not claim a fix to this site from repo edits.
3. **No official public or commercial launch is verified.** No receipts from repeat authorized paid pickups; $0 revenue verified.

## Verified evidence this pass
- GitHub main at the start: `eb59c0903106639e357f60f37b5fd9c969677a86` (Oct 10). On October 4, PR #3 merged illustrated collector/UI changes as `77c44ff472e3cfcf2af23acb508482f24232646a`.
- GitHub Actions quality run #13 against Oct 10 head: completed **success**. A separate backup workflow run completed **skipped**; do not label skipped a successful backup. No evidence of restore drill or Drive cleanup.
- `data/verified-resources.json` has curated source URLs and `verified_at: 2026-09-16` values; file presence is not a fresh October check of hours/eligibility/permission. Curated records and community OSM must remain visually and legally separate. No private dumpsters/gated spaces without written permission.
- Both live URLs could not be fetched as rendered pages by the available web environment; this is access-inconclusive, not proof of outage. Opera connector reported browser not connected.
- Prior Drive asset folder `P041 Dumpster Atlas`: https://drive.google.com/drive/folders/1q2M1TrjVZMf5AQS-NGWvGY_z_fJyGNqt . Contains SVG logo/hero concepts and earlier A17 handoff. Handoff https://drive.google.com/file/d/1hTvexb_FBiMHHmU-vrX9e8LGITb7_4Rl/view is already shared writer to anastaysia98@gmail.com and anastaysia487@gmail.com.
- Current canonical Google ledger: https://docs.google.com/spreadsheets/d/1pbhUGktco-Esh7n_HLFzt5KdUJ-BevXM1h0udUjLrrk/edit . Newer MASTER Project Ledger: https://docs.google.com/spreadsheets/d/1oKl4pezipjnp5EeiwpJo0NqUQAOSf8nc5y4rekwT7ng/edit . MASTER Project Register: https://docs.google.com/spreadsheets/d/13w0IhkQZGmVQlfXjQtHVD9wTkp5Y37_wh76yciSATiI/edit . Preserve historical rows, contributor prefixes and source versions.

## Active blockers and evidence required
| Gate | State | Exact proof to close |
|---|---|---|
| Static hosting/production map | OPEN | Host docs/index.html and image with correct HTML MIME; capture accessible public URL, screenshot at phone & desktop widths, run search/radius/source links against resource API, inspect CORS/network errors. Do not claim this was completed because CI is green. |
| 2026 curated data freshness | OPEN | Click/check each source page for address/service, avoid inventing acceptance/hours/payouts, date each check, reconcile JSON plus Supabase migration/live rowset. |
| Fieldbook source/patch | OPEN | Recover exact deployed source/version from Sites. Confirm edit feature; inspect validation of backup JSON/CSV, duplicate behavior and current service worker cache version. If absent, patch in a staging copy and run controlled tests; publish only after success and owner publication approval as applicable. No Site-edit tool connected in this pass. |
| A17 device acceptance | OPEN | On Samsung Galaxy A17, deny/allow geolocation; radius filters 2/5/10/15/20; category; save/edit/delete in isolation; directions; controlled earnings; export/import restore and duplicate handling; install, offline reopen and recovery. Record Android/Chrome version and screenshots without private GPS details. |
| Community/moderation and pickups | OPEN | Written property/business consent, terms, source status workflow and abuse handling, pilot with real consenting business before offering restricted pickups. |
| Commerce/rewards/cash-out | NOT SHIPPED | Payment agreements, verified settlement, anti-fraud, consent, legal/safety vetting, owner approval and receipts. |

## Safe next steps for the receiving assistant
1. Read the repo files `AGENTS.md`, `.ai/STATE.md`, `.ai/HANDOFF.md`, `STATUS.md`, `README.md`, `docs/DATA-TRUST.md`, plus existing A17 Drive handoff.
2. Inspect main head & CI again; never rely on cached heads. If browser integration available, verify static-frontend render and resource API response; document proof, not assumptions.
3. If Site authoring tool becomes accessible, read existing deployed Site project first, take non-destructive backup, repair edit/import/offline cache, and test; avoid altering GitHub map app to pretend Fieldbook was fixed.
4. Ask for one controlled A17 test result at a time. Do not mark device tests passed without screenshots/results. Do not clear the user's browser storage.
5. Record every verified change in P041's canonical launch row, P041 Device QA tab, newer MASTER Ledger and MASTER Project Register as dated append-only evidence. Upload assets into the P041 folder and grant editor access to exact known Anastaysia Google addresses only.
6. Preserve contributor prefix `[ChatGPT - anastaysia94] [2026-10-13 PT]` for new records, and keep unverifiable gates explicitly open.
7. No claims of 100% completion, launch, public permission, customer acceptance, or profits without evidence.

## Closing status
**SOURCE-CODE / CI: verified. BROWSER / SITE PATCH / PHONE / HOST / SOURCE FRESHNESS / COMMERCIAL: open.** No live app deployment or production publishing performed this pass.
