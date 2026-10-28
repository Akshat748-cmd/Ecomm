# MASTER PROMPT: Precious Commerce Platform (Phased Prototype)

You are a senior product designer and front-end engineer. You will build a **clickable prototype** of a premium online store for **gold, silver, gemstones, Rudraksha and gifting**, plus its **Admin Console** and a **Platform & Integrations** page. Fake data only, no real backend.

## HOW YOU MUST WORK (read this first, it is the most important part)

1. This document has **Phases 0 to 12**. Build **ONE phase at a time**, in order.
2. When I paste this document, **do NOT start building**. Reply only: "Ready. Say NEXT to start Phase 0."
3. When I say **NEXT**, build only the next phase. Do not build ahead, do not skip, do not add features that are not in the phase.
4. At the end of each phase do this, then STOP and wait:
   - run `npm run build` and fix all errors
   - open the routes of this phase and fix all console errors
   - tick every item in the phase's **DONE WHEN** list
   - update the file `docs/PROGRESS.md` (phase name, what works, what is simulated, what is a placeholder, known issues)
   - reply with a short summary (max 10 lines) and ask me to say NEXT
5. If I say **FIX: <problem>**, fix only that problem and nothing else.
6. Never rewrite or delete working files from earlier phases unless the phase tells you to. Before starting a phase, read `docs/PROGRESS.md` and the current phase text only.
7. If something is unclear, make the simplest reasonable choice, write it in `docs/PROGRESS.md` under "Assumptions", and continue. Do not stop to ask unless the whole phase is blocked.
8. Never claim something works unless you ran it.

## GLOBAL RULES (apply in every phase)

- **LIGHT theme only.** No black, no dark blue, no dark backgrounds, no dark mode, no dark footer or sidebar.
- Fake data only. No external APIs, no hotlinked images. Only Google Fonts are allowed externally.
- Do not collect real card or personal data. Do not use real brand logos.
- No lorem ipsum, no "TODO", no "Text here". Write realistic copy.
- Do not build the Customer Mobile App (its scope was not shared). The store must be fully **responsive** instead.
- Every list has an **empty state**, every form has **validation and error messages**, every action that takes time has a **loading state**.
- Wrong URL shows a friendly 404. Reloading any route must still render it.
- Clean up timers and intervals on unmount.

### Status tags used in this document
- **WORKING** = real behaviour in the prototype
- **SIMULATED** = works with fake or demo behaviour, no real system behind it
- **TAGGED** = visible in the UI with a small "Proposed" or "Phase 2" label, not functional

## TECH STACK (fixed)

Vite + React + TypeScript, Tailwind CSS, React Router, Zustand (one shared store), lucide-react. Fonts: **Cormorant Garamond** for headings, **Inter** for body and numbers (`font-variant-numeric: tabular-nums` on all prices and rates). Persist cart, orders and settings to `localStorage` through Zustand `persist`, inside try/catch with a memory fallback.

Routes: the store lives at `/`, the admin at `/admin`. Both use the **same Zustand store**, so an action in one shows up in the other.

Folders: `src/data`, `src/store`, `src/lib`, `src/components`, `src/store-site`, `src/admin`, `docs`.

## DESIGN SYSTEM (light)

Mood: modern Indian luxury jewellery. Airy, calm, lots of white space, trustworthy. Product is the hero.

| Token | Hex | Use |
|---|---|---|
| bg | #FFFBF3 | page background (warm ivory) |
| surface | #FFFFFF | cards, modals |
| surface-alt | #F8EFD9 | rate strip, footer, admin sidebar, alternate sections |
| gold | #C9A24B | buttons, accents, big rate numbers |
| gold-soft | #F1E3BD | hover, chips, highlights |
| heading | #5A4630 | headings (warm brown) |
| body | #7A6A55 | body text |
| border | #EADFC8 | borders and dividers |
| rose-soft | #F3D9D2 | Rudraksha and gift accents |
| sage-soft | #DCE8D5 | gemstone accents, success |
| amber-soft | #FBE7B8 | stale rate, warnings |
| coral-soft | #F7D4CF | errors |

- Text must stay readable. Use gold only for large numbers, buttons and accents, never for small body text.
- Rounded corners (12px cards, pill chips), soft shadow `0 4px 20px rgba(90,70,48,0.08)`, 1px border. Primary button = gold fill with white text. Secondary = white with gold border.
- Motion only: a gentle flash when a rate changes, the quote countdown bar, soft hover transitions.
- Images: no real photos. Use elegant placeholder tiles (soft gradient tinted by category, simple icon or monogram, product name).
- Brand placeholder name **"AURUM & CO"** kept in one constant.
- Responsive: test at 375, 768, 1024, 1440. Wide tables scroll inside their own container. Visible focus rings, labels on all inputs, alt text on placeholders.

### Reference sites (take the FEEL only, never copy assets, text or logos)
- https://www.tanishq.co.in : rate strip, trust badges, product page, policies
- https://www.caratlane.com : modern light look, cards, filters
- https://www.malabargoldanddiamonds.com : traditional gold trust, certificate and assurance
- https://www.bluestone.com : clean category and price breakdown
- https://www.mmtcpamp.com : bullion coin and bar presentation

## CORE LOGIC (built in Phase 1, used everywhere)

**Rate engine (simulated).** Start rates (dummy): Gold 24K Rs 13,000/g, Gold 22K = 24K x 0.9167, Silver 999 Rs 190/g. Every 5 seconds change each rate by a random +/-0.05% to 0.15% and update the timestamp. Provider state: `ok`, `primaryFailed` (backup takes over, rates keep updating), `bothDown` (updates stop; after 20 seconds the feed is marked **stale**). A stale feed pauses quotes and shows amber everywhere.

**Single price function** `calculatePrice(product, rates, config)`, the ONLY place prices are computed:
```
fineWeight = netWeightG x purity
metalValue = fineWeight x ratePerGram
making     = metalValue x makingPercent
subtotal   = metalValue + making + packaging + insurance (+ other cost components from config)
gst        = subtotal x gstPercent (default 3%)
total      = round(subtotal + gst)
fixed-price items: total = round(fixedPrice x (1 + gst))
```
Format all money in INR with Indian digit grouping. Store all timestamps in UTC (ISO) and display in local time.

**Quote lock.** "Get Quote" creates a quote: id, items, rate snapshot, price snapshot, createdAt, expiresAt = now + `QUOTE_LOCK_SECONDS` (constant, default 600 = 10 minutes; 60 when demo mode is on). While active the price stays fixed even if the live rate moves. At expiry show an amber state with a Requote button. If the feed is stale, Get Quote is disabled with "Rates delayed. Quotes are paused."

**Stock.** Quote or cart reserves stock until expiry. Out of stock blocks add to cart. 3 or fewer shows "Only N left". Successful order converts the reservation to a sale.

**Order lifecycle:** Placed, Payment confirmed, Picked, Packed, Quality checked, Invoice issued, Dispatched, Delivered. Every step writes a timeline entry with time. Store and admin read the same timeline.

**Events.** Every key store action (product view, search, add to cart, checkout start, payment result, support or return request) writes an event to an event log in the store.

**Audit.** Every sensitive admin action writes an audit row (actor, action, time, before, after).

## CLIENT NOTES TO SHOW IN THE UI (small labelled notes, never blockers)
- Lifetime buyback: "check policies". COD: not applicable. Language: English for now, multilingual later.
- Rate protection lock: 10 minutes. Legal structure is being checked by Prabhav.
- Advance booking: parked for later. ERP bill import: kept separate.
- GST/HSN for Rudraksha, malas and mixed hampers: open decision.

---

# PHASES

## PHASE 0: Setup, design system, empty routes
Build:
1. Project scaffold with the tech stack, Tailwind tokens from the design system, fonts, shared `Button`, `Card`, `Badge`, `Chip`, `Modal`, `Toast`, `EmptyState` components in the light style.
2. Route stubs (title only) for every route used in later phases:
   Store: `/`, `/c/:category`, `/search`, `/p/:slug`, `/verify/:certNo`, `/wishlist`, `/cart`, `/checkout`, `/order/:id`, `/account`, `/vault`, `/knowledge`, `/blog`, `/gifting-enquiry`, policy pages (`/terms`, `/privacy`, `/shipping`, `/returns`, `/authenticity`, `/consumer-disclosures`, `/grievance`, `/faq`, `/contact`, `/support`), 404.
   Admin: `/admin/login`, `/admin`, `/admin/rates`, `/admin/catalogue`, `/admin/inventory`, `/admin/orders`, `/admin/orders/:id`, `/admin/customers`, `/admin/compliance`, `/admin/reports`, `/admin/roles`, `/admin/audit`, `/admin/platform`, `/admin/settings`.
3. Create `docs/PROGRESS.md`.
DONE WHEN: `npm run dev` opens, every route shows its title, background is ivory, no dark colours, no console errors.

## PHASE 1: Data and logic (no new design)
Build:
1. Mock data in `src/data`: **16 products**: 3 gold (coin, bar, chain), 2 silver (coin, bar), 2 gemstones (ruby, emerald), 2 coloured stones, 3 Rudraksha (5 mukhi mala, 7 mukhi bead, silver-capped), 2 gift hampers (rate-linked items use `type: "rateLinked"`, others `"fixed"`).
   Fields: id, slug, name, category, sku, brand, description, netWeightG, grossWeightG, purity, stock, reserved, lot/batch/serial, certificate (issuer, number, status, linked lot), mrp, makingPercent, fixedPrice, attributes by category:
   - Bullion: metal, purity, gross/net/fine weight, batch, serial, assay or manufacturer
   - Gemstone: variety, weight (carat), dimensions, cut, colour, clarity, treatment, origin, lot
   - Rudraksha: mukhi, size or bead count, thread, metal, supplier lot, provenance
   Also: 6 sample orders in different statuses, 5 customers, 4 quotes, 8 alerts, 10 audit rows, 3 certificates (2 valid, 1 not found), 3 fake couriers, supplier records.
2. One Zustand store: rates, providerState, config (cost components, gst, rounding, pricing model per category, formula version), products, wishlist, cart, quotes, orders, customers, events, audit, notifications, settings (demo mode, quote lock seconds, session timeout).
3. Rate engine, `calculatePrice`, quote logic, stock reservation, order lifecycle helpers, event and audit helpers (all as described in CORE LOGIC).
4. A hidden `/debug` page printing live rates and every product's price. One unit test for `calculatePrice`.
DONE WHEN: `/debug` shows changing rates and prices, `npm test` passes, build passes.

## PHASE 2: Store shell, Home, Category, Search
Build:
1. **Rate strip** (top, surface-alt): Gold 24K and Silver per gram, unit and purity basis ("per gram, 24K / 999"), green "Live" dot, "Updated hh:mm:ss", light flash on change. Stale feed: amber dot and "Rate delayed, prices paused".
2. **Header:** wordmark, menu (Gold, Silver, Gemstones, Coloured Stones, Rudraksha, Gifting), search box, account, wishlist (with count), cart (with count). Mobile hamburger, keyboard accessible with visible focus.
3. **Trust row:** Authenticity Certified, Insured Fulfilment, Service and Support (each a link).
4. **Footer** (surface-alt): Contact, Grievance, FAQ, Support; Terms, Privacy, Shipping, Returns and Refunds, Authenticity; newsletter field with an unchecked consent checkbox, button disabled until ticked; discreet "Prototype - demo data" label.
5. **SEO and accessibility:** per-route title and meta description, canonical tag, `public/sitemap.xml`, `public/robots.txt`, labelled inputs, alt text.
6. **Home `/`:** hero (headline, one CTA), live rate cards (24K, 22K, Silver with basis and updated time), category modules (Gold, Silver, Gemstones, Rudraksha, Gifting), featured products with trust indicators.
7. **Category `/c/:category`:** breadcrumbs, title, 2-line intro, product grid (placeholder tile, name, weight, purity, live price, availability badge), filters (purity, weight range, price range, availability; bottom sheet on mobile), sort (popularity, price low-high, price high-low, newest), result count, removable active-filter chips, pagination (8 per page), Clear filters, empty state.
8. **Search `/search?q=`:** query echoed, matched categories and products, same filters, empty state with "Did you mean..." (simple fuzzy match on names).
DONE WHEN: all of the above work together at 375px and 1440px, prices follow the live rate, filters/sort/chips/pagination/search work, no console errors.

## PHASE 3: Product page, quote lock, certificate, wishlist
Build:
1. **Product `/p/:slug`:** gallery (3 placeholder tiles), title, SKU, specs table (fields differ by category), availability.
2. **Price breakdown card:** metal value, making, packaging and insurance, GST, total, MRP (struck through when higher), and "Calculated at Rs X/g, updated hh:mm:ss".
3. **Certificate block:** issuer, number, status badge, "Verify certificate" link. Delivery estimate and return eligibility text.
4. Actions: wishlist heart, quantity stepper, **Add to cart** (fixed items) or **Get Quote** (rate-linked).
5. **Quote box:** locked price, mm:ss countdown, shrinking bar, "Live rate now Rs X (your locked rate Rs Y)". Expiry turns it amber with a Requote button. Stale feed disables Get Quote with the message.
6. Collapsible **"How live rates and price lock work"**: rate components, quote duration, requote rules, stale-rate behaviour.
7. **`/verify/:certNo`:** issuer, number, linked product or lot, state (Verified / Not found), "View document" opens a placeholder document card.
8. **`/wishlist`:** saved products with specs, quote status, availability, Move to cart, empty state.
DONE WHEN: locked price stays while the live rate moves, expiry and requote work, certificate links work for valid and invalid numbers, wishlist survives reload, no console errors.

## PHASE 4: Cart, Checkout, Order, Account, Returns
Build:
1. **Cart `/cart`:** line items, quantity, remove, summary (subtotal, shipping, insurance, taxes, total), empty state. If rate or stock changed since adding, show an amber banner "Price updated since you added this" with Accept new price; checkout stays disabled until accepted.
2. **Checkout `/checkout`:** Guest or Registered toggle (no real login); contact, address, pincode serviceability (pincodes starting with 9 show "Not serviceable"); shipping and insurance selection; final order review with policy links; payment method choice (cosmetic) and secure handoff screen. **Payment results:** Success, Failed (Retry), Pending (checking), Timeout (Retry or contact support). A "Demo: payment result" selector shows only when the URL has `?demo=1`; default is Success.
3. On success: create the order (price, rate and tax snapshot, timeline), reduce stock, clear cart, go to `/order/:id`. Write events.
4. **Order `/order/:id`:** order number, payment status, item summary, delivery estimate, status timeline, tracking, support link. Invoice area says "Invoice will be available after it is issued" until the admin attaches the ERP invoice, then shows **Download invoice**. Note: "COD is not applicable".
5. **Account `/account`:** profile, address book (add, edit, delete), consent and communication preference toggles, order history with status, tracking and support link, and a **Cancel / Return / Refund request form** with an eligibility message (bullion shows "Return and buyback terms are being finalised"). Requests are saved to the store for the admin queues.
DONE WHEN: full flow product, quote, cart, checkout, order works; all four payment outcomes work; request form saves; reload works; no console errors.

## PHASE 5: Store policies, content, vault, Proposed items
Build:
1. **Policy pages** with realistic text: Terms, Privacy, Shipping and Delivery, Cancellation/Return/Refund, Authenticity and Certification, Consumer Disclosures, Grievance Contact, FAQ, Contact, Support. Returns page shows "COD is not applicable" and "Lifetime buyback: check policies".
2. **`/vault`:** "Digital Gold Vault: Coming soon" listing wallet, transaction history, redemption, sell-back as upcoming. Nothing clickable. (TAGGED)
3. **TAGGED "Proposed" elements** (visible, non-functional, each with a small Proposed tag):
   - Home: festival campaign banner, personalization strip
   - Category: compare checkbox, recently viewed row, recommended row, reviews and Q&A tab
   - Search: autocomplete dropdown with static suggestions
   - Product: video/360 tab, product FAQ accordion, extra trust widgets, cross-sell and upsell row
   - Certificate: QR validation box, certificate download center link
   - Content: Knowledge Center with 3 buying-guide cards, Gemstone and Rudraksha care guides, festival/occasion page, corporate gifting enquiry form, Blog list
DONE WHEN: every footer and header link opens a real page, every Proposed element is visible with its tag, no console errors.

## PHASE 6: Admin shell, login, roles, audit
Build:
1. **Admin shell:** light sidebar (surface-alt): Dashboard, Rates and Pricing, Catalogue, Inventory and Quotes, Orders, Customers and Support, Compliance, Reports, Roles, Audit, Platform, Settings. Top bar with user menu and role switcher.
2. **`/admin/login`:** email, password, then an MFA step (accept any 6-digit code). Label: "Admin identity is separate from customer accounts."
3. **Roles:** Super Admin, Pricing, Catalogue, Warehouse, Support, Finance, Auditor. **`/admin/roles`** shows a module x action matrix (view, create, edit, approve). Sidebar items and buttons respect the active role (least privilege); Auditor is read-only.
4. **Session timeout:** 15 minutes idle (60 seconds in demo mode), then "Session expired, sign in again".
5. **Re-authentication modal** (password re-entry) for sensitive actions. **Maker-checker:** whoever raised a request cannot approve it, with a clear message.
6. **`/admin/audit`:** table (actor, action, time, before, after) with filters; sensitive actions write rows.
DONE WHEN: login with MFA works, role switch changes what is visible, timeout and re-auth work, audit rows appear, no console errors.

## PHASE 7: Admin Dashboard, Rates and Pricing
Build:
1. **Dashboard `/admin`** with 4 tabs: Executive (sales, orders, revenue, ops overview), Orders and Payments (failures, pending, refunds, mismatches), Rates (provider health, current rate, freshness, stale incidents), Inventory (available, reserved, quarantined, exceptions). Numbers come from real store data. Simple light charts (inline SVG).
2. **Alerts panel:** rate failure, payment mismatch, stock issue, refund ageing, shipment or security event, raised from real actions where possible. A greyed "Parked alerts" group: wallet allocation, settlement, redemption, vault variance. (TAGGED)
3. **`/admin/rates`:**
   - Providers table: Primary and Backup, fake endpoint and configuration, status chip, last update. Switch **"Simulate primary failure"** (backup takes over, banner "Using backup provider") and **"Simulate both providers down"** (feed goes stale after 20 seconds).
   - Rate data table: metal, currency, purity basis, timestamp, normalized value, freshness.
   - **Manual override:** proposed value, reason, approver, effective time. Creates "Pending approval". Approve and Reject visible only to Super Admin or Pricing, never to the maker; approval needs re-auth, changes the store rate immediately, writes audit.
   - Pricing model per category: Dynamic, Fixed or Hybrid.
   - **Cost components editor:** making/minting %, assay, certificate, packaging, shipping, insurance, payment, overhead, margin. Changes recalculate store prices live.
   - MRP, discount, tax and HSN, rounding rule, guardrails (min and max margin), effective dates, **price history** table, **formula version** label that increments on every change.
   - Notes: "Override approver is an automated process based on live rates (client note)". "Open: override approver and store/web rate synchronization."
DONE WHEN: approving an override changes the live store rate; "both down" turns the store strip amber and disables Get Quote, switching off restores it; changing a cost component changes store prices; price history and audit fill up; no console errors.

## PHASE 8: Admin Catalogue, Inventory, Quotes
Build:
1. **`/admin/catalogue`:** product list with search, status, category filters. Product form (modal): title, SKU, category, brand, description, images (placeholder upload), attributes, status, variant, barcode, launch scheduling, delist toggle. Fields change by category (bullion, gemstone, Rudraksha). Certificate fields: issuer, number, file, status, linked product or lot, verification result. Saving adds or edits a product and it appears in the storefront. Supplier and purchase records table.
2. **`/admin/inventory`:** label "Separate online stock pool". Stock table: on-hand, reserved, available, damaged, quarantined, lot/batch/serial, reorder threshold. Actions: receipt, reservation release, adjustment, reconciliation (each updates counts and writes a log row).
3. **Quotes table:** quote id, customer, items, rate and price snapshot, expiry, status (Active, Accepted, Expired, Cancelled). Quotes made in the store appear live. Expired or cancelled quotes release stock. **Stale-rate requote queue** lists quotes paused by a stale feed.
DONE WHEN: a new product appears in the store, a stock adjustment changes store availability, a store quote shows here, no console errors.

## PHASE 9: Admin Orders, payments, ERP handoff, shipping, returns
Build:
1. **`/admin/orders`:** list with status chips, filters. Detail `/admin/orders/:id`: customer, items, amount, payment, status timeline, price and tax snapshot.
2. **Fulfilment steps** as buttons, one at a time: Pick, Pack, Quality check. Each writes a timeline entry. Packing slip (printable card) and dispatch proof (fake file input).
3. **Payment panel:** gateway transaction status, amount check, signature check, "Duplicate event protection: ON", and a **"Simulate duplicate webhook"** button showing the second event is ignored and logged.
4. **Queue tabs:** Pending payments, Failed payments, Unmatched payments, Refunds, Settlement reconciliation (matched or unmatched rows, "Mark reconciled").
5. **ERP invoice handoff:** "Export billing worksheet" (CSV: order, customer, item, price, tax snapshot). Fields: ERP invoice number and PDF attach (fake file input). "Invoice issued" only when both are filled. Notes: "ERP is the legal invoice system of record. Handoff is manual." and "Open: ERP bill import or external price acceptance (kept separate)."
6. **Invoice-gated dispatch:** the Dispatch button is disabled with tooltip "Attach ERP invoice first" until the invoice is issued.
7. **Shipping panel:** serviceability, carrier (3 fake couriers), insured value, tracking number, delivery proof upload, claim button that creates a claim record.
8. **Queues** for Cancellation, Return, Refund, Exception, Claim. Requests made in the store account page appear here with Approve and Reject (refund approval needs re-auth).
9. Link back to the store: after invoice issue, `/order/:id` shows Download invoice; after dispatch it shows Dispatched with tracking.
10. TAGGED Proposed: partial shipment or cancel, exchange, gift order, manual order, escalation, return pickup.
DONE WHEN: a store order appears here, dispatch is blocked until the invoice is attached, store order page updates, duplicate webhook is ignored, a return from the store shows in the queue, no console errors.

## PHASE 10: Admin Customers, Compliance, Reports
Build:
1. **`/admin/customers`:** list and detail: name, verified contacts, addresses, consent, order history, support history, order-linked notes (add note), customer actions, fraud flag toggle. TAGGED Proposed: segmentation, lifetime value, VIP tag, journey timeline, support tickets, live chat, disputes, SLA, knowledge base.
2. **`/admin/compliance`:** tick-box checklist: GST/HSN, taxable value, MRP, Legal Metrology, manufacturer/packer/importer details; BIS/hallmark/assay review; product-claim and certificate controls; return eligibility; data protection and consent records; document version records (table). Amber "Open" notes: GST/HSN for Rudraksha, malas and mixed hampers; COD; bullion returns/refunds; additional languages.
3. **`/admin/reports`:** tabs: Sales (excluding GST, discounts, cancellations/refunds, gross margin), Inventory value and ageing, Rates (uptime, stale events, quote expiry, price changes, margin overrides), Payments and settlements, Fulfilment, Customer, Support, Returns and disputes, Supplier, Security operations (audit logs, admin actions, backup/restore, incidents; SIMULATED). Each tab: table plus a small light chart from real store data where possible. Working **Export CSV**. TAGGED Proposed: funnels, abandonment, product/search analytics, cohorts, CLV, forecasting, attribution, campaign ROI.
DONE WHEN: every tab opens with data, CSV exports download, no console errors.

## PHASE 11: Platform and Integrations page, Settings, remaining Proposed items
Build **`/admin/platform`** labelled "Simulated for prototype", with these sections:
1. **Architecture:** a light diagram of one shared Backend API serving Customer Website, Mobile App, Admin Console. Core services: Catalogue/media/certificates/search; Rate ingestion + price calculation + quote lock; Online inventory + reservations (separate); Customer identity + consent + notifications; Order/payment/shipping/refund/support.
2. **Integrations:** primary and backup rate providers (live state), payment gateway with verified webhooks, courier and insurance providers, ERP manual billing worksheet and invoice/PDF return, push notifications (FCM Android, Apple push iOS) with a "Send test notification" button writing to a notification log. TAGGED Proposed: CRM, messaging, marketing automation.
3. **Security, reliability and data** (status chips, SIMULATED): HTTPS/TLS, secure sessions, secrets, validation, rate limiting; server-side authority for price, tax, quote and inventory; fixed precision and currency standards; idempotency; historical snapshots and UTC timestamps with local display (show one real example); encrypted backups, restoration tests, monitoring, incident response; Development/Staging/Production separation badge; no unnecessary payment-card or identity data stored. TAGGED Proposed: WAF, bot protection, vulnerability scanning, IP allowlist, device trust.
4. **Analytics:** live event log from real store actions (product views, searches, cart, checkout, payment, support). Monitoring card for crash and performance (SIMULATED).
5. **QA checklist** with a Run or tick action and pass/fail per row: cross-channel quote consistency, rate-change, stale and fixed-rate, expired-quote, requote acceptance, tax/MRP, overselling, duplicate webhook, timeout recovery, refund/cancellation, permissions, backup restore, certificate links. TAGGED Proposed checks: coupons, abandoned cart, reviews, fraud rules, support SLA, SEO, push, bulk import.
6. **Gated capability:** Digital Gold Vault, wallet, SIP, gram allocation, custody, redemption, sell-back. Requirements: written legal opinion, named custodian, insurance, audit arrangements, operating controls. Status: not in scope.
7. **Open business decisions** table with the client's comments:
   - Bullion return/refund and buyback legal structure: "lifetime buyback: check policies"
   - COD eligibility and limits: "COD not applicable"
   - Languages beyond English and Hindi: "for now English, later multilingual"
   - GST/HSN for Rudraksha, malas, mixed hampers: no note yet
   - Rate protection and advance booking legal structure: "legal structure is being checked by Prabhav"; "rate protection lock or 10 mins and we will probably use google api"; "advance booking: park it for later"
   - Rate override approver and store/web rate synchronization: "automated process based on the live rates"
   - ERP bill import and external-price capability: "keep this separate"
8. **Remaining admin Proposed items** (one "Proposed features" tab, tagged, non-functional): custom/temporary roles, suspicious activity alerts, session recording; approvals, operational health, SLA, notification center; bulk import/export, expiry/mismatch alerts, QR validation, certificate reissue; margin protection, scheduled revisions, simulation, competitor monitoring, promotional rules, auto-freeze on stale rate; barcode/RFID, ageing, demand forecast, supplier lead time, reorder recommendations.
9. **`/admin/settings`:** quote lock duration (default 10 minutes), **Demo speed toggle** (quote lock 60 seconds, session timeout 60 seconds), wordmark name, **Reset demo data** button.
DONE WHEN: all sections render, test notification and QA rows work, event log updates while I use the store, demo toggle and reset work, no console errors.

## PHASE 12: Final polish, verification and coverage report
Do NOT add features. Fix and verify only.
1. Add any missing empty, loading and error states. Check 375px and 1440px on Home, Category, Product, Cart, Checkout, Account, Admin Dashboard, Admin Orders, Admin Platform: no horizontal page scroll, nothing overlapping.
2. Confirm there is **no dark background, black or dark blue** anywhere.
3. `npm run build` with zero TypeScript errors. Zero console errors and warnings on every route (open each one).
4. Run this **Golden Demo Flow** end to end and fix whatever breaks:
   1. `/` rate strip updates every 5 seconds with a flash.
   2. Open a gold coin, check the price breakdown, click Get Quote, timer starts at 10:00.
   3. In another tab, approve a rate override in `/admin/rates`. The store's live rate changes, the locked price does not.
   4. Let the quote expire (or use Demo speed) and click Requote.
   5. Add to cart, checkout with `?demo=1`, run Success, Failed, Pending and Timeout once each.
   6. Order page shows "Invoice will be available after it is issued".
   7. Admin order exists, Dispatch is disabled, attach ERP invoice, Dispatch enables, dispatch.
   8. Store order page shows Download invoice and Dispatched.
   9. Raise a return request from the store account, see it in the admin queue, approve with re-auth.
   10. Switch on "Both providers down": the store strip turns amber and Get Quote is disabled; switch off, normal again.
   11. Add a new Rudraksha product in Admin Catalogue, it appears in the store.
   12. `/admin/platform` event log shows my store actions.
5. Produce **`docs/COVERAGE.md`**: a table of every feature in Phases 1 to 11 with its tag (WORKING, SIMULATED, TAGGED) and the route where it can be seen. Mark honestly anything that is missing.
6. Final report: how to run (`npm install`, `npm run dev`), list of routes, what is SIMULATED, what is TAGGED, assumptions, any known issues, and the result of every check above.
DONE WHEN: every check passes or is listed honestly as a known issue.

---

When you have read everything, reply only: **"Ready. Say NEXT to start Phase 0."**
