# Feature recovery and delivery status

The archived conversation `Android App for Recycling` dated May 27–28, 2026 mentions growth from 200 to 300, 400, and 500 features. Its 16 messages do **not** include a numbered feature specification or the underlying implementation. A count of 400 shipped features cannot be substantiated from this archive.

| Archived concept | Current status | Evidence / next step |
| --- | --- | --- |
| GPS and 2, 5, 10, 15, 20 mile radius | Implemented | Browser location is optional; radius and resource filters in `page.ts`. |
| Source-checked redemption and recycling map | Implemented | Curated public resources and separate community OpenStreetMap layer. |
| CRV profit estimation | Implemented in this branch | Collector workshop computes an estimate from eligible container counts. |
| Collection routes | Partly implemented in this branch | Save up to 10 verified stops and open walking directions in saved order; no optimization or travel-cost model. |
| Actual collector earnings | Implemented in this branch | Local trip receipts show paid, expense, net, minutes, net per hour, and CSV export. |
| Bulk alerts, community reports, AI earnings prediction, survival tools, multilingual support, guilds, AR scanning, mutual aid, city activity predictions | Mentioned, unimplemented | Require specific requirements, reliable data and review before being presented as real capabilities. |
| Admin moderation, anti-fraud and safety | Mentioned, unimplemented | Design a permission and verification process for proposed pickup listings. |
| Permission-based business pickups | Unimplemented | Secure one participating business, explicit access terms, pickup scheduling and repeat payment evidence before publishing a pickup. |

Source: recovered `conversations/038 - Android App for Recycling.md` from the ChatGPT export backup. These are categories present in the conversation, not a reconstructed 400-item list. No recovered project-specific image was found in either inspected backup image inventory.

## New prioritized 250-item roadmap

`TOP_250_PRODUCT_ROADMAP.csv` contains 250 newly prioritized, specific product candidates across 25 themes. This is a proposed ranking inferred from the recovered themes and the present business model, **not** the missing historical 400+ list. Its `status` column distinguishes controls present in the local branch from ideas that are not implemented. Even rows marked implemented describe small behaviors within the MVP; they do not represent 48 separately shipped systems. The next major revenue proof remains one business paying for repeated, authorized pickups and measured net earnings for participating collectors.

The new visual direction draws on the recovered Dumpster Atlas mobile mockup and the SmartPickShop ecosystem reference: compass emblem, San José silhouette, deep blue-green panels, copper/gold details, and mint highlights. The interface uses a 1.1 KB SVG skyline and an inline SVG emblem; it does not load the large mockup as a background image.

## Illustrated interface asset

`dumpster-atlas-neon-san-jose.webp` is new artwork generated from the earlier Dumpster Atlas concept and SmartPickShop visual references. It is now the hero and supporting panel imagery; the headline and controls stay as accessible HTML. The image is locally hosted and compressed to about 196 KB at 1440 × 810, down from the roughly 2.5 MB source. This is a new image, not a recovered historic draft.
