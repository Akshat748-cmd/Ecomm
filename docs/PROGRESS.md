# Project Progress & Status Tracker

## Phase 0: Setup, Design System, Empty Routes
### Status: Complete
- **Scaffold**: Vite + React 19 + TypeScript + Tailwind CSS v4 + React Router v7 + Zustand + Lucide React.
- **Design System**: Light theme (`#FFFBF3` ivory, `#C9A24B` gold, `#5A4630` heading, `#7A6A55` body, `#EADFC8` border).
- **Shared Components**: `Button`, `Card`, `Badge`, `Chip`, `Modal`, `Toast`, `EmptyState`, `RouteStub`.
- **Routes**: All 27 store and admin routes scaffolded with title, category, and light layout.

---

## Phase 1: Data and Logic (No New Design)
### Status: Complete
- **16 Mock Products**: Gold bullion/chain, silver bullion/idol, natural gemstones (Burmese Ruby, Muzo Emerald, Basra Pearl), coloured sapphires, consecrated Nepali Rudraksha, and gift sets.
- **Core Datasets**: 6 orders in full lifecycle states, 5 customers, 4 quotes, 8 alerts, 10 audit rows, 3 certificates, 3 insured couriers, and suppliers.
- **Single Price Function `calculatePrice`**: `fineWeight = netWeightG × purity`, `metalValue`, `making`, `packaging`, `insurance`, and 3% GST. Indian Rupee formatting (`formatINR`).
- **Zustand Store & Rate Engine**: Shared store with localStorage fallback, 5s ticker (+/-0.05% to 0.15%), `ok`/`primaryFailed`/`bothDown` states with 20s stale threshold, stock reservations, order lifecycle, event logging, and audit tracking.
- **Diagnostics & Testing**: `/debug` route active with live rate engine and complete 16-product price matrix.
- **Validation**: `npm test` passed 3/3 tests; `npm run build` passed with zero errors.

---

## Phase 2: Store Shell, Home, Category, Search
### Status: Complete
- **Rate Strip & Shell**: Gold 24K, 22K & Silver 999 with "Live" pulsating dot, flash on rate tick, and amber stale alert. Full responsive header with mobile drawer, trust row, and consent-gated newsletter footer.
- **Home Page (`/`)**: Hero section with CTAs, 3 live spot rate cards, 6 curated luxury category modules, featured live-priced products, and trust commitment pillars.
- **Category Page (`/c/:category`)**: Category title, breadcrumbs, 2-line intro, desktop filters sidebar & mobile bottom sheet (purity, price, weight, availability), sorting, active chips, pagination, and empty state.
- **Search Page (`/search?q=`)**: Query echo, matched category chips, multi-attribute search, and "Did you mean..." fuzzy suggestions.
- **SEO**: Dynamic route `<title>`, meta description, canonical tags, `robots.txt`, and `sitemap.xml`.

---

## Phase 3: Product Page, Quote Lock, Certificate, Wishlist
### Status: Complete
- **Product Page (`/p/:slug`)**: 3-image gallery with category-tinted placeholder tiles, specifications table by category, stock availability badge, quantity stepper, and delivery/return notices.
- **Price Breakdown Card**: Itemized metal value, making %, packaging, insurance, 3% GST, total in INR, and live rate reference string.
- **Dynamic Quote Lock Box**: Real-time 10-minute rate lock (`mm:ss` countdown and shrinking bar), live vs locked rate comparison, amber expiry state with working **Requote** button, and stale-feed quote pause.
- **Certificate Verification (`/verify/:certNo`)**: Valid certificates (`B24-999-5481`, `GIA-6421990412`) show verified credentials and open an official certicard modal; invalid numbers show an advisory state with sample search chips.
- **Wishlist (`/wishlist`)**: Saved products list with specs, live prices, availability, active quote badges, and working **Move to Cart** action (persists across reloads).

---

## Phase 4: Cart, Checkout, Order, Account, Returns
### Status: Complete

### What Works
- **Shopping Cart (`/cart`)**:
  - Line items with product thumbnail, title, SKU, specs, and stock-guarded quantity steppers.
  - Transparent totals: Subtotal, complimentary armoured shipping, packaging, 3% GST, and grand total in INR.
  - Amber banner `"Price updated since you added this"` when spot rates change, with an **Accept new price** button that unblocks checkout.
  - Clear entire cart action and illustrated empty state.
- **Secure Checkout (`/checkout`)**:
  - Guest vs Registered customer profile toggle (pre-fills verified investor details).
  - Pincode serviceability validator: pincodes starting with `9` trigger an immediate `"Pincode not serviceable for armoured transit"` advisory and block the order button; valid pincodes show green serviceability confirmation.
  - Insured carrier selection: Sequel Secure Logistics vs BVC Armoured Vaulting.
  - Cosmetic payment method selector: NetBanking, UPI / QR, Credit Card, RTGS Wire.
  - Order review with terms and returns policy links.
  - **4 Payment Outcomes Simulation**:
    - `?demo=1` query parameter unlocks a visible simulation dropdown (`Success`, `Failed`, `Pending`, `Timeout`). Default is `Success`.
    - `Success`: Creates order with full price/rate/tax snapshots, updates stock reservations to permanent sales, clears cart, logs store event, and redirects to `/order/:id`.
    - `Failed`: Bank decline screen with retry option.
    - `Pending`: Verification pending screen with view order link.
    - `Timeout`: Session timeout screen with contact concierge link.
- **Order Confirmation & Detail (`/order/:id`)**:
  - Order reference number, payment status badge, item breakdown, and delivery estimate.
  - Status Timeline showing chronological custody lifecycle: `Placed` → `Payment confirmed` → `Picked` → `Packed` → `Quality checked` → `Invoice issued` → `Dispatched` → `Delivered`.
  - Armoured courier tracking AWB and partner name.
  - Invoice section: Displays `"Invoice will be available after it is issued"` until ERP invoice is attached, then provides a working **Download Invoice** button and modal preview.
  - Regulatory notice: `"COD is not applicable for high-value precious bullion & jewellery."`
- **Customer Account (`/account`)**:
  - Verified investor profile summary and cumulative portfolio tracker.
  - Address book: Add, edit, delete addresses, and select default delivery destination.
  - Communication & consent preferences: Marketing briefings, transactional SMS, and WhatsApp tracking toggles.
  - Order history tab with direct links to view order details and tracking.
  - **Cancel / Return / Refund Request Form**:
    - Order selector with status and amount.
    - Bullion advisory banner: `"Bullion return and buyback terms are being finalised (client note: lifetime buyback: check policies)."`
    - Reason textarea and submit action that saves the request directly onto the order in the shared Zustand store, populating the Admin return queues.

### What is Simulated
- Payment gateway handoff simulates HDFC/Razorpay/UPI banking protocols and webhook status responses.
- PDF tax invoice download generates a complete printable tax invoice modal with GSTIN, HSN codes, and itemized billing.

### What is a Placeholder
- Carrier AWB numbers are realistic mock tracking codes linked to Sequel / BVC formats.

### Assumptions
- Pincodes beginning with digit `9` are designated as out-of-perimeter for armoured logistics serviceability testing.

### Known Issues
- None. `npm test` passes 3/3 tests. `npm run build` succeeds with zero errors and zero warnings.

---

## Phase 5: Store Policies, Content, Vault, Proposed Items
### Status: Complete

### What Works
- **10 Realistic Policy & Support Pages**:
  - `/terms`, `/privacy`, `/shipping`, `/returns`, `/authenticity`, `/consumer-disclosures`, `/grievance`, `/faq`, `/contact`, `/support`.
  - Realistic statutory disclosures, Legal Metrology declarations, BIS Hallmarking standards, transit insurance, and Grievance Nodal Officer credentials.
  - Prominent client notes displayed: `"COD is not applicable for high-value precious bullion & jewellery"` and `"Lifetime buyback: check policies"`.
- **Digital Gold Vault (`/vault`)**:
  - Informational "Digital Gold Vault: Coming Soon" page detailing upcoming digital wallet balance, micro-savings, physical redemption, and 24/7 sell-back (non-clickable, TAGGED Proposed).
- **Auspicious Occasions & Festivals Guide (`/occasions`, `/festivals`)**:
  - Vedic Muhurat calendar for Dhanteras, Akshaya Tritiya, Shaadi & Vivaha wedding collections, and Shravan Rudraksha sadhana (TAGGED Proposed).
- **Knowledge Hub (`/knowledge`)**:
  - 3 comprehensive buying guides (24K vs 22K Hallmarking, Untreated Natural Gemstones, Himalayan Rudraksha Identification) and specialized gemstone & sacred bead care instructions (TAGGED Proposed).
- **Corporate & Festive Gifting Enquiry (`/gifting-enquiry`)**:
  - Bespoke quotation form for custom-minted coins, institutional hampers, and personalized hallmark presentation boxes (TAGGED Proposed).
- **Editorial Blog (`/blog`)**:
  - 3 rich educational articles on gold vs paper gold, astrological gemstone suitability, and sacred Nepali Rudraksha origins (TAGGED Proposed).
- **TAGGED "Proposed" Elements across Storefront**:
  - **Home**: Auspicious Diwali/Dhanteras festival campaign banner and personalized recommendation strip.
  - **Category**: Per-card "Compare" checkbox, floating multi-item comparison drawer, Curated Recommendations row, Recently Viewed articles row, and tabbed Verified Collector Reviews & Astrological Q&A.
  - **Search**: Interactive autocomplete dropdown with static suggestions ("24K Gold Coin 10g", "Burmese Ruby Natural", "5 Mukhi Nepali Rudraksha", etc.).
  - **Product**: 4K Video & interactive 360° turntable inspection tab, institutional trust badges (tamper-evident seal, assayer signature, vault custody), collapsible Product FAQ accordion, and "Frequently Acquired Together" cross-sell row.
  - **Certificate Verification**: Optical camera QR validation scanner box and Institutional Certificate Download Center banner.

### What is Simulated
- 360° viewer simulates turntable rotation from 0° to 360°.
- QR code camera scanner and batch certificate downloads trigger informative capability advisories.

### What is a Placeholder
- Vault balances and digital liquidation are placeholder previews.

### Assumptions
- Every footer and header link resolves to an active, designed page with zero 404 or console errors.

### Known Issues
- None. `npm test` passes 3/3 tests. `npm run build` succeeds with zero errors.

---

## Phase 6: Admin Shell, Login, Roles, Audit
### Status: Complete

### What Works
- **Admin Shell & Light Sidebar (`/admin`)**:
  - Light sidebar (`#F8EFD9` surface-alt) routing all 12 modules: Dashboard, Rates and Pricing, Catalogue, Inventory and Quotes, Orders, Customers and Support, Compliance, Reports, Roles, Audit, Platform, and Settings.
  - Top bar featuring active role switcher, authenticated officer profile ("Vikram Sharma, Principal Officer"), live session timeout countdown, demo mode toggle, storefront portal link, and sign-out.
  - Least privilege enforcement: unauthorized modules are locked with visual lock icons and access restriction messages; Auditor role enforces strict read-only mode across all modules.
- **Admin Authentication & Dual-Factor MFA (`/admin/login`)**:
  - Two-stage login: Step 1 collects staff email, role, and security passphrase with statutory security notice: `"Admin identity is separate from customer accounts."`
  - Step 2 dual-factor authentication (MFA) prompts for 6-digit TOTP token (accepts any 6 digits for testing with quick-fill demo button) and logs verified session to audit trail.
- **Roles & Permissions (`/admin/roles`)**:
  - Complete 7-role × 12-module matrix displaying granular permissions (View, Create, Edit, Approve) across `Super Admin`, `Pricing`, `Catalogue`, `Warehouse`, `Support`, `Finance`, and `Auditor`.
  - **Maker-Checker Segregation**: Working dual-authorization queue. Prevents the initiator from approving their own request (`"Maker-Checker Violation: You cannot approve a request that you initiated. Another authorized officer must approve."`), while allowing other officers to approve/reject and write to the audit log.
- **Session Security & Timeout**:
  - Inactivity idle timer running at 15 minutes (or 60 seconds in demo mode).
  - Expiration triggers full-screen session expired overlay requiring passphrase re-entry or relogin.
- **Re-Authentication Modal**:
  - Password confirmation modal for sensitive administrative actions (rate overrides, refunds, role elevations).
- **Immutable Audit Trail (`/admin/audit`)**:
  - Chronological audit table with columns: Timestamp, Actor, Action Type, Module, Before/After State transitions, and Inspect action.
  - Filter by Actor, Filter by Module, and free-text search across actions and state diffs.
  - "Simulate Sensitive Action" button dynamically writes live audit rows with SHA-256 integrity seal and opens structured before/after diff modals.

### What is Simulated
- TOTP token generates a 6-digit verification accepted by the prototype.
- SHA-256 seal metadata simulates cryptographic hash chaining.

### What is a Placeholder
- IP addresses default to internal subnet ranges (`10.0.4.x`, `127.0.0.1`).

### Assumptions
- In demo mode, session timeout accelerates to 60 seconds for rapid evaluator verification.

### Known Issues
- None. `npm test` passes 3/3 tests. `npm run build` succeeds with zero errors.

---

## Phase 7: Admin Dashboard, Rates and Pricing
### Status: Complete

### What Works
- **Executive Operations Dashboard (`/admin`)**:
  - 4 tab views: **Executive Overview**, **Orders & Payments Telemetry**, **Rates & Bullion Exposure**, and **Inventory & Vault Reserves**.
  - Light-themed SVG telemetry charts: 7-day revenue velocity curve, inventory category distribution breakdown, and bullion price movement graph.
  - Real KPI telemetry computed dynamically from the Zustand store: Today's GMV, Net Revenue, Orders Pending Custody Fulfillment, Active Customer Rate-Locks, and Vault-Reserved Reserve Weight.
  - Live bullion spot rate cards with pulsating provider status, real-time variance, and amber feed stale warnings.
  - Interactive Operations Alert Center: Categorized operational alerts (Critical, Warning, Info) with a working **Resolve** action, plus parked institutional items (`TAGGED Proposed`) such as BIS Hallmarking Sync and High-Velocity Transit Watch.
- **Bullion Rates & Pricing Engine (`/admin/rates`)**:
  - **Market Feed Providers Table**: Monitors MCX India (Primary) and LBMA London via Refinitiv (Backup) with live ping latencies and active status badges.
  - **Failover Controls**:
    - **Simulate Primary Failure**: Automatically shifts routing to the LBMA backup provider.
    - **Simulate Both Providers Down**: Cuts external feeds; after 20 seconds of outage, marks the feed stale (`isFeedStale: true`), turning the storefront rate strip amber and disabling the customer "Get Quote" button.
    - **Restore Normal Operations**: Instantly recovers feeds back to `ok` and clears stale locks.
  - **Normalized Spot Rates**: Displays Gold 24K 999, Gold 22K 916, and Silver 999 with current INR/g, tick frequency, and percentage change.
  - **Manual Spot Rate Override with Maker-Checker**:
    - Form to propose manual rates for Gold 24K or Silver 999 with mandatory statutory justification.
    - Queues proposal into the dual-authorization engine.
    - Maker-Checker enforcement: Prevents self-approval (`"Maker-Checker Violation: Initiator cannot approve"`).
    - Requires password re-authentication modal before checker approval; immediately updates live store rates and generates an immutable audit record.
  - **Transparent Category Pricing Models**: Visual summary of dynamic bullion, fixed gemstone, and consecrated sacred bead pricing mechanics.
  - **Live Cost Components Formula Editor**:
    - Editable making charges (Bullion & Jewellery %), assay certificate fees, tamper-proof packaging costs, armoured transit insurance rates, margins, and rounding rules.
    - Form submission increments formula version (e.g. `v1.0` -> `v1.1`), logs to `PriceHistory`, and dynamically recalculates live product prices across the entire catalog in real time.
  - **Pricing Formula Adjustment History**:
    - Chronological table tracking formula versions, adjustment parameters, effective timestamps, and approving officers.
  - Statutory Tax & HSN Reference Strip (HSN 7108, HSN 7106, HSN 7103, 3% GST).

### What is Simulated
- Feed provider pings and network latencies are simulated with realistic millisecond timing.
- Failover switches reflect real architectural state machines in the Zustand store.

### What is a Placeholder
- Live MCX tick socket is driven by the internal 5-second market simulation ticker.

### Assumptions
- Pricing formula changes apply immediately across all dynamic bullion calculations without requiring store restart.

### Known Issues
- None. `npm test` passes 3/3 tests. `npm run build` succeeds with zero errors.

---

## Phase 8: Admin Catalogue, Inventory, Quotes
### Status: Complete

### What Works
- **Product Catalogue Management (`/admin/catalogue`)**:
  - **Master Product Table**: Comprehensive list with live search (by Title, SKU, Lot, Cert #), category tabs/filters (Gold, Silver, Gemstones, Coloured Stones, Rudraksha, Gifting), and publication status filters (Active, Draft, Delisted).
  - **Dynamic Product Form Modal**:
    - Universal core attributes: Name, auto-slug, SKU, category, brand, description, variant descriptor, EAN-13 barcode, and launch scheduling.
    - **Category-Adaptive Parameter Fields**:
      - *Bullion (Gold/Silver)*: Metal standard (24K 999.9, 22K 916, Silver 999), net weight in grams, fine purity, making charge %, assay batch #, laser serial number, and refinery manufacturer.
      - *Gemstones*: Variety, carat weight, provenance/origin (e.g. Mogok Burma, Muzo Colombia, Ceylon), cut & facet style, color grade, clarity, and natural treatment status.
      - *Rudraksha*: Mukhi face count, Himalayan origin, bead diameter (mm), capping/thread, and temple consecration credentials.
      - *Gifting*: Packaging casket fee and base composition.
    - **Certificate & Assay Ingestion**: Certifying authority (BIS Hallmark, GIA, IGI, IRL), certificate number, linked lot reference, verification status (`Verified`, `Pending`, `Not Found`), and simulated digital PDF assay upload.
    - **Storefront Publication & Delist Toggle**: Saving immediately publishes or updates the product in the storefront (`/c/:category`, `/search`, `/p/:slug`) in real time. Delist toggle hides product without breaking order history.
  - **Suppliers & Purchase Consignments**:
    - Approved Refineries & Artisanal Trusts table with BIS hallmarking license numbers, GSTIN, and principal contacts. Modal to register new suppliers.
    - Inward Consignment Purchase Records (PO logs) with invoice numbers, lots, metal purity grades, received quantities, and cost basis calculations.
- **Separate Online Stock Pool & Inventory Control (`/admin/inventory`)**:
  - Prominent **"Separate online stock pool"** label with dedicated buffer badge reflecting physical segregation from retail counters.
  - 5 real-time aggregate KPI tiles: On-Hand Physical, Reserved in Active Locks/Cart, Available for Sale, Damaged/Quarantine, and Low Stock Warnings.
  - **Granular Stock Control Table**: Displays on-hand, reserved, available (`onHand - reserved`), damaged, quarantined, lot/batch/serial, reorder thresholds, and status badges (`In Stock`, `Low Stock`, `Out of Stock`).
  - **4 Working Stock Operations with Audit Logging**:
    1. **Receipt (Goods Inward)**: Replenishes on-hand inventory, links supplier and batch reference, and increments available stock.
    2. **Reservation Release**: Force-releases expired or abandoned customer reservations back to the available pool.
    3. **Adjustment**: Adjusts counts for on-hand, damaged, or quarantined stock with mandatory statutory justifications.
    4. **Reconciliation**: Physical vault audit count comparison against system records, auto-calculating variance.
    *All actions update store availability immediately and generate immutable ledger entries in the Inventory Movement Log.*
- **Customer Quotes & Rate Locks**:
  - **Quotes Table**: Displays Quote ID, customer ID/guest, reserved product, locked spot rate vs live benchmark (with variance indicator), total INR, tax breakdown, live countdown window, and status (`Active`, `Accepted`, `Expired`, `Cancelled`).
  - Real-time reactivity: Storefront rate-locks appear live here. Expired or cancelled quotes automatically release reserved stock.
  - **Stale-Rate Requote Queue**: Dedicated queue tracking quotes affected during market feed downtime or stale feed triggers, with a working **Re-issue at Live Rate** action.
  - **Inventory Movement Log**: Chronological ledger of all receipts, releases, adjustments, and reconciliations with delta, available balance after, and authorized officer.

### What is Simulated
- PDF assay certificates simulate file upload and preview.
- PO consignment intake creates internal purchase records linked to inventory balances.

### What is a Placeholder
- Barcode scanner input uses standard alphanumeric EAN-13 inputs.

### Assumptions
- New products created in the admin console are instantly available for purchase in their assigned storefront category.

### Known Issues
- None. `npm test` passes 3/3 tests. `npm run build` succeeds with zero errors.

---

## Phase 9: Admin Orders, Invoices, Returns
### Status: Complete

### What Works
- **Order Management & Fulfillment Queue (`/admin/orders`)**:
  - **KPI Dashboard**: 5 live operational metric tiles (Total Active Orders, Gated Awaiting ERP Invoice, Armoured In-Transit, Returns Pending Approval, and Settlements Needing Audit).
  - **5 Dedicated Functional Queues**:
    1. *All Orders Queue*: Full table with search (order #, customer, email, AWB), status badges, payment badge, value, ERP invoice indicator, and direct fulfilment links.
    2. *Pending & Failed Payments Queue*: Tracks unverified or failed gateway handoffs with manual re-trigger payment link and verify status actions.
    3. *Returns & Refunds Queue*: Displays return requests submitted from customer account (`/account`) with reason, bullion return advisory, and a working **Dual-Auth Re-Authorisation Modal** requiring officer password and justification before approving refund.
    4. *Settlement Reconciliation Queue*: Tracks HDFC/Razorpay/UPI net settlements, MDR gateway fees, and variance flags with working **Mark Reconciled** action.
    5. *Insurance Claims Queue*: High-value armoured courier loss/tamper claims with claim reference, carrier, AWB, claim amount, and insurance status.
  - **Proposed Feature Strip**: Displays TAGGED PROPOSED banner for 14-day bullion buyback protocol & physical branch counter delivery handoffs.
- **Order Fulfilment & Custody Stepper (`/admin/orders/:id`)**:
  - **Custody Progression Stepper**: Visual multi-stage tracker through Placed → Payment Confirmed → Picked → Packed → Quality Checked → Invoice Issued → Dispatched → Delivered.
  - **Invoice-Gated Dispatch Enforcement**:
    - **Strict rule enforced**: The Dispatch action is legally blocked and disabled until the SAP/Tally ERP invoice number and PDF attachment are linked.
    - Attempting to dispatch prior to ERP attachment shows clear lockout state and guidance banner.
    - Once attached, Dispatch opens a high-security dispatch modal with courier partner selection (Sequel Secure, BVC Logistics, BlueDart Apex), AWB auto-generation, security dispatch notes, and proof-of-dispatch checkbox.
  - **Storefront Linkage**: Attaching an ERP invoice and dispatching immediately updates the storefront order page (`/order/:id`), enabling the **Download Invoice** button and displaying the carrier tracking banner in real time.
  - **Payment & Webhook Idempotency Panel**:
    - Displays gateway reference ID, transaction method, payment timestamp, and verified HMAC signature check.
    - **Simulate Duplicate Webhook Action**: Safely simulates an incoming gateway webhook retry, confirming idempotent processing by logging the replay in store event ledger without double-crediting or duplicate status advancement.
  - **ERP Invoice Handoff Panel**:
    - Form to record external ERP / Tally voucher number and attach official tax invoice document.
    - **Export Billing Worksheet (CSV)**: Generates and downloads an itemized billing CSV with order metadata, HSN codes, and itemized tax breakdowns.
  - **Printable Vault Packing Slip Modal**: Complete high-security packing slip with tamper-evident seal barcodes, line-item serial numbers, weight verification signatures, and vault inspector sign-offs.
  - **File Insurance Claim Modal**: Fast-track transit anomaly and seal tamper claim filing with insurer.

### What is Simulated
- ERP tax invoice PDF linking and CSV worksheet download simulate external SAP/Tally accounting connectors.
- Gateway webhook HMAC verification and duplicate replay prevention are simulated with real-time audit ledger logging.

### What is a Placeholder
- High-security dispatch barcode scanner input uses standard alphanumeric strings.

### Assumptions
- In accordance with statutory bullion logistics, no precious metal shipment may leave vault premises without an attached GST tax invoice.

### Known Issues
- None. `npm test` passes 3/3 tests. `npm run build` succeeds with zero errors.

---

## Phase 10: Admin Customers, Compliance, Reports
### Status: Complete

### What Works
- **Customer Intelligence & Support Directory (`/admin/customers`)**:
  - **Investor Registry**: Searchable directory (name, email, phone, city) with verified KYC status chips and fraud risk filters.
  - **Comprehensive Detail View**:
    - Verified contacts: Email, mobile phone, and KYC verification badge.
    - Registered shipping destinations (Home/Office with default indicator).
    - **DPDP Act 2023 Digital Consent Audit**: Interactive toggles for Market Briefings, SMS Notifications, and WhatsApp Tracking that immediately update store preferences with audit logging.
    - **Custody Order History**: Tabular view of all customer orders, item breakdown, total INR, payment status, and direct link to `/admin/orders/:id`.
    - **Internal Service & Order-Linked Notes**: Structured notes linked to specific orders plus general account advisory notes with working **Add Note Modal**.
    - **Customer Actions & Fraud Risk Toggle**: Working modal to enable/clear fraud risk flags with mandatory officer justification, immediately blocking or unblocking checkout privileges.
    - **Customer Support Logs**: Channel-specific interaction logs (Phone Concierge, Email, WhatsApp, In-Vault Consultation) with working **Log Support Ticket Modal**.
  - **TAGGED Proposed Feature Strip**: Customer segmentation, predictive CLV, VIP investor tier tags, omnichannel live chat, and automated SLA monitors.
- **Statutory Compliance & Legal Governance Checklist (`/admin/compliance`)**:
  - **Interactive Tick-Box Checklist**:
    - 12 comprehensive statutory controls across 5 categories (GST & Legal Metrology, BIS Hallmark & Assay, Product Claims & Certs, Returns & Disclosures, Data Privacy & DPDP).
    - Working checkboxes that toggle compliance state, update auditor name and timestamp, and record entries in the audit trail.
    - Statutory citations: CGST Act 2017, Legal Metrology Amendment Rules 2022, BIS Hallmarking Regulations 2018, CIBJO Gemstone Standards, PMLA 2002, and DPDP Act 2023.
  - **4 Amber "Open" Advisory Review Notes**:
    1. *GST/HSN for Rudraksha, Malas & Mixed Gift Hampers* (tax classification ambiguity between raw handicraft vs precious jewellery; unified 3% GST operational policy).
    2. *Cash-on-Delivery (COD) Prohibition* (statutory anti-money laundering and courier transit protection).
    3. *Bullion Returns & Price Volatility Buyback* (Consumer Protection e-commerce exemption; lifetime buyback formula).
    4. *Additional Vernacular Languages* (statutory consumer disclosure translations scheduled for Phase 11).
  - **Document Version Records Table**: Master Terms of Service, Privacy Policy, Buyback & Cancellation, BIS QA SOP, Armoured Courier SOP, and Gemstone Certification Framework, with working **Bump Version Modal**.
- **Financial & Operational Reports Analytics (`/admin/reports`)**:
  - **10 Functional Tabs with Working Data Tables & Visual Charts**:
    1. *Sales & Margins*: Net sales (excluding 3% GST), gross revenue, tax collected, cancellations, gross margin realization, and interactive revenue composition progress bar chart.
    2. *Inventory Valuation & Ageing*: Total vault asset value, on-hand units, category asset breakdown, and ageing brackets.
    3. *Rates & Volatility*: Real-time gold 24K, gold 22K, silver 999 benchmarks, feed SLA, and chronological pricing formula revisions.
    4. *Payments & Settlements*: HDFC/Razorpay/UPI net settlements, MDR fees, and bank clearance status.
    5. *Fulfilment & Carrier SLAs*: Sequel and BVC tracking numbers, delivery destinations, and ERP invoice gating status.
    6. *Customer Cohorts*: Cumulative spend, KYC verification, order frequency, and risk status.
    7. *Support & Concierge*: Inquiries by channel, subject, resolution status, and assigned concierge officer.
    8. *Returns & Disputes*: High-value armoured transit insurance claims and return disputes.
    9. *Suppliers & Consignments*: Refinery intake PO invoices, purity grades, and cost basis.
    10. *Security Operations (SIMULATED)*: Tamper-evident admin action ledger, automated snapshot status, and HSM encryption state.
  - **Working Export CSV on Every Tab**: Generates and downloads real client-side CSV files formatted with tab-specific headers.
  - **TAGGED Proposed Feature Strip**: Conversion funnels, cart abandonment heatmaps, search analytics, cohort retention, and precious metal demand forecasting.

### What is Simulated
- Security operations automated daily vault backup and HSM status are simulated.
- Client-side CSV generator formats live store records into standard RFC-4180 CSV files.

### What is a Placeholder
- Vernacular language PDFs for consumer disclosures link to English/Hindi master documents.

### Assumptions
- In compliance with statutory bullion taxation, all composite gifts containing precious metals are assessed under unified 3% GST.

### Known Issues
- None. `npm test` passes 3/3 tests. `npm run build` succeeds with zero errors.




