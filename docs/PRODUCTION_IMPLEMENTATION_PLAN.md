# Precious Commerce Platform — Production Implementation Plan & Traceability Matrix

**Source of Truth**: `Copy of Bullion and Gifting Ecommerce Platform - Screen and Component Specification` (Latest Mind Map & Component Specification PDF, extracted October 2026).

---

## 1. Executive Summary & Audit Baseline

- **Current Architecture**: React 19 + TypeScript 5.8 + Vite 8 + Tailwind CSS v4 + Zustand 5 + React Router v7.
- **Baseline Test/Build Status**:
  - `npm test`: 3 passing unit tests (pricing engine).
  - `npm run build`: Successful clean build (`tsc -b && vite build`) in ~900ms.
  - `npm run lint`: Clean passing (`oxlint` with 0 errors).
- **Target Architecture**: Modular Node.js/Express + TypeScript backend service with PostgreSQL relational persistence, ACID transaction controls for stock reservation and order creation, cryptographic webhook idempotency, server-side rate locking, maker-checker dual authorization, and JWT/RBAC security.

---

## 2. Status Label Definitions

- **`IMPLEMENTED`**: Feature UI and server-side production logic, validation, persistence, and automated tests are fully operational and verified.
- **`PARTIALLY IMPLEMENTED`**: UI is rendered and functional with state, but lacks full server-side validation, relational persistence, or edge-case handling.
- **`MOCK/SIMULATED`**: Feature exists in the frontend prototype with simulated delays, mock datasets, or client-side storage only.
- **`MISSING`**: Required by the latest mind map but not yet present in the codebase.
- **`BLOCKED/NEEDS CLARIFICATION`**: Dependent on third-party legal decisions, external banking credentials, or physical custody partner contracts.

---

## 3. Requirements Traceability Matrix

### 3.1 Website Screens & Storefront

| Mind Map Section / Requirement | Relevant Route / Component / File | Current Status | Required Production Change | Dependencies & Risks | Acceptance Criteria | Priority |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Header & Nav**: Logo, categories (Bullion, Coins/Bars, Silver, Gems, Rudraksha, Gifts, Corporate Gifting, Gold Vault), search, user controls | `src/store-site/StoreLayout.tsx`, `Header.tsx` | `PARTIALLY IMPLEMENTED` | Connect category tree to backend catalog API; sync dynamic cart count and customer profile with backend session. | None. | Nav displays published categories from backend; cart badge reflects server cart session; responsive drawer works smoothly. | P0 |
| **Hero Banner**: Headline, CTAs (Shop now, explore collection, corporate quote), schedule check | `src/store-site/HomePage.tsx` | `IMPLEMENTED` | Ensure CTA links navigate to correct active routes without page reload; support scheduled banner metadata. | Banner asset integrity. | Banner renders correctly; buttons navigate to `/c/gold`, `/gifting-enquiry`, and `/c/silver`. | P1 |
| **Live Metal-Rate Strip**: 24K, 22K Gold, 999 Silver, reference market (MCX/LBMA), timestamp, stale feed amber indicator | `src/store-site/StoreLayout.tsx`, `src/lib/useRateHeartbeat.ts`, `src/lib/pricing.ts` | `MOCK/SIMULATED` | Switch from client-only ticker to backend rate provider endpoint (`GET /api/rates`) with server-stamped timestamps and stale-feed detection. | Bullion rate API upstream connectivity. | Displays live rates with per-gram pricing; amber warning activates if feed exceeds 20s without update; quote generation locks when stale. | P0 |
| **Product Listing & Search**: Autocomplete, multi-attribute filter (metal, purity, weight, stone, mukhi, PIN), sort, delivery checker | `src/store-site/CategoryPage.tsx`, `src/store-site/SearchPage.tsx` | `PARTIALLY IMPLEMENTED` | Back listing and search with indexed PostgreSQL queries (`GET /api/products`); server-side PIN code serviceability check (`POST /api/logistics/pincode-check`). | Pincode master data from courier partners. | Multi-filter works without UI lag; bullion prices reflect live server formula; out-of-perimeter PIN codes (e.g. starting with 9) show non-serviceable notice. | P0 |
| **Product Detail Page (PDP)**: Media gallery, specs by category, itemized price breakup, authenticity/certificates, stock badge, purchase actions | `src/store-site/ProductPage.tsx` | `PARTIALLY IMPLEMENTED` | Fetch verified product specs and certificates from backend; validate available unreserved stock from server. | None. | PDP shows verified category attributes (Bullion, Gemstone, Rudraksha, Gift); itemized price breakup displays metal value, making %, packaging, insurance, and 3% GST. | P0 |
| **Live Bullion Quote Lock**: 10-minute rate lock countdown, delta calculation, quote expiry, server-enforced requote | `src/store-site/ProductPage.tsx`, `src/lib/pricing.ts`, `src/store/index.ts` | `MOCK/SIMULATED` | Enforce rate lock on backend (`POST /api/quotes/lock`); reject checkout if quote expired (`expiresAt <= NOW()`); requote at current spot rate. | Market feed volatility during checkout. | Quote lock generates unique token; timer syncs with server; expired quote forces re-quote before payment handoff; server rejects expired quote tokens. | P0 |
| **Authenticity & Certificates**: BIS Hallmark HUID, GIA/IGI cert numbers, verify certicard modal | `src/store-site/VerifyCertPage.tsx`, `src/store-site/ProductPage.tsx` | `PARTIALLY IMPLEMENTED` | Connect certificate search to backend database (`GET /api/certificates/:certNo`); download official verification report. | Certifying authority data consistency. | Valid certificate returns verified issuer, lot number, purity, and assay date; invalid numbers show clear advisory. | P1 |
| **Personalization Widget**: Engraving text, recipient name, gift message, custom lead time, non-returnable notice | `src/store-site/ProductPage.tsx`, `src/store-site/CartPage.tsx` | `PARTIALLY IMPLEMENTED` | Add engraving input validation (character count, regex), store custom fields in order line items, enforce non-returnable terms notice. | Production lead-time constraints. | Customer can enter up to 25 chars engraving; preview renders text; cart notes personalization charge and statutory non-returnable terms. | P1 |
| **Cart & Saved Items**: Quantity steppers, stock-reservation check, spot rate movement warning, cost summary | `src/store-site/CartPage.tsx`, `src/store-site/WishlistPage.tsx` | `PARTIALLY IMPLEMENTED` | Server-side cart validation (`POST /api/cart/validate`); alert when spot rate changes since item was added; move-to-cart from wishlist. | Concurrent customer reservations. | Cart displays line items, transparent shipping/insurance/3% GST breakdown; amber banner prompts acceptance if spot price moved. | P0 |
| **Checkout (Physical Products)**: Pincode check, customer/guest profile, PAN requirement for >=₹2L, carrier selection, order review | `src/store-site/CheckoutPage.tsx` | `PARTIALLY IMPLEMENTED` | Server-side order creation (`POST /api/orders`) inside database transaction; PMLA PAN collection requirement for orders exceeding ₹200,000. | Payment gateway sandbox account. | Validates address; enforces PMLA PAN threshold; blocks checkout if rate lock expired or PIN non-serviceable; returns order reference. | P0 |
| **Payment Status & Webhook Confirmation**: Gateway handoff, idempotent webhook processing, order status transitions | `src/store-site/CheckoutPage.tsx`, `src/store-site/OrderPage.tsx` | `MOCK/SIMULATED` | Implement backend payment webhook endpoint (`POST /api/payments/webhook`) with HMAC signature verification and idempotency keys. | Payment gateway API keys (sandbox). | Webhook transitions order from `Placed` to `Payment confirmed`; duplicate webhook retries are rejected safely without duplicate status updates. | P0 |
| **Order Confirmation, Invoices & Tracking**: Chronological custody timeline, ERP invoice download, armoured courier tracking | `src/store-site/OrderPage.tsx` | `PARTIALLY IMPLEMENTED` | Dynamic custody timeline (`Placed` -> `Payment confirmed` -> `Picked` -> `Packed` -> `Quality checked` -> `Invoice issued` -> `Dispatched` -> `Delivered`); printable tax invoice PDF. | ERP invoice integration boundary. | Displays order summary, payment badge, courier tracking AWB; disables dispatch until ERP invoice attached; generates GST tax invoice. | P0 |
| **Customer Portal & Account**: Profile, address book, consent management (DPDP Act 2023), order history, return request submission | `src/store-site/AccountPage.tsx` | `PARTIALLY IMPLEMENTED` | Backend endpoints for user profile, address CRUD, consent updates, and return ticket filing with reason and photo evidence. | None. | Customer can edit addresses, toggle consent preferences with audit trail, view order history, and submit return requests. | P1 |
| **Corporate Gifting Journey**: Landing, enquiry form, quote builder, branding proof approval, recipient import, split dispatch | `src/store-site/GiftingEnquiryPage.tsx`, `src/admin/AdminCataloguePage.tsx` | `PARTIALLY IMPLEMENTED` | Build complete end-to-end corporate gifting workflow: enquiry submission, admin quote generation, client quote review/approval, recipient CSV upload. | Multi-address logistics dispatch rules. | Corporate client can submit detailed enquiry (budget, count, occasion); admin issues formal quote; client approves; recipient address batch imported. | P1 |
| **Digital Gold Vault (MVP)**: Buy gold, sell gold, account balance, custody disclosure, daily reconciliation | `src/store-site/VaultPage.tsx`, `src/admin/AdminPlatformPage.tsx` | `MOCK/SIMULATED` | Gate legally dependent buy/sell operations with prominent statutory disclosures (no guaranteed returns, 100% physical backing required) per mind map release gates. | Regulatory licenses, third-party vault custody partner (Augmont/MMTC/SafeGold). | Displays transparent buy/sell rates, spread, partner custody disclosures; keeps physical redemption disabled for MVP per mind map rules. | P2 (Gated) |

---

### 3.2 Admin Screens & Operations

| Mind Map Section / Requirement | Relevant Route / Component / File | Current Status | Required Production Change | Dependencies & Risks | Acceptance Criteria | Priority |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Admin Authentication & Dual-Factor MFA**: Staff login, TOTP verification, session timeout, role assignment | `src/admin/AdminLoginPage.tsx`, `src/admin/AdminLayout.tsx` | `PARTIALLY IMPLEMENTED` | Server-side password hashing (Bcrypt), JWT auth tokens with role claims, TOTP/MFA validation, idle session revocation. | Staff user credential store. | Admin cannot access protected routes without valid JWT; session times out after 15 minutes of inactivity; MFA verified server-side. | P0 |
| **Executive Operations Dashboard**: GMV, net revenue, vault reserve weights, rate-lock telemetry, operational alerts | `src/admin/AdminDashboardPage.tsx` | `PARTIALLY IMPLEMENTED` | Aggregate real-time telemetry from PostgreSQL database (`GET /api/admin/dashboard-stats`); live alerts with resolve actions. | Database query indexing. | Dashboard displays live KPIs calculated from database orders and stock; alerts can be resolved and logged to audit trail. | P1 |
| **Live Rates & Pricing Administration**: Feed monitoring, MCX/LBMA failover, maker-checker spot rate override, formula editor | `src/admin/AdminRatesPage.tsx`, `src/lib/pricing.ts` | `PARTIALLY IMPLEMENTED` | Backend rates engine (`GET/POST /api/admin/rates`); maker-checker enforcement (initiator cannot approve their own override); formula version bump. | Live feed provider API. | Secondary officer must approve rate override with password re-auth; formula update updates `formulaVersion` and logs to price history. | P0 |
| **Product Catalogue Administration**: Master table, dynamic category form (Bullion, Gemstones, Rudraksha, Gifts), certificate link, publish/delist | `src/admin/AdminCataloguePage.tsx` | `PARTIALLY IMPLEMENTED` | Backend catalog CRUD (`/api/admin/products`); category-adaptive validation; certificate attachment; delist toggle. | Media storage for images/certs. | Admin can create and edit products with specific category fields (e.g. carat, origin, mukhi, fineness); delist hides product from storefront. | P0 |
| **Separate Online Stock Pool & Inventory Control**: Physical vs reserved stock, Goods Inward, Reservation Release, Adjustment with audit | `src/admin/AdminInventoryPage.tsx` | `PARTIALLY IMPLEMENTED` | Relational inventory management (`/api/admin/inventory`) with atomic transactions; automated release of expired rate-lock reservations. | Concurrency during high-traffic drops. | Stock operations (receipt, adjustment, release, reconciliation) update available stock atomically and write to `InventoryLog`. | P0 |
| **Order Management & Fulfillment Desk**: Queues (All, Failed Payments, Returns, Settlements, Insurance), custody stepper, invoice-gated dispatch | `src/admin/AdminOrdersPage.tsx`, `src/admin/AdminOrderDetailPage.tsx` | `PARTIALLY IMPLEMENTED` | Server-enforced custody transitions (`POST /api/admin/orders/:id/status`); **Strict Invoice-Gated Dispatch**: dispatch disabled until ERP invoice attached. | Courier partner API integration. | Dispatch action is disabled and rejected by server unless ERP invoice number and document are attached; generates vault packing slip. | P0 |
| **Settlement Reconciliation & Webhook Idempotency**: Payment transaction reconciliation, duplicate webhook simulation | `src/admin/AdminOrdersPage.tsx`, `src/admin/AdminOrderDetailPage.tsx` | `MOCK/SIMULATED` | Server-side webhook deduplication ledger (`payment_webhooks` table); settlement variance flags (`amount - gatewayFee`). | Gateway settlement reports. | Duplicate webhook payloads with same transaction ID log duplicate event but do not re-advance order status or duplicate stock deductions. | P0 |
| **Customer Intelligence & CRM**: Searchable investor directory, KYC/PAN status, fraud risk toggle, order-linked service notes | `src/admin/AdminCustomersPage.tsx` | `PARTIALLY IMPLEMENTED` | Backend CRM endpoints (`/api/admin/customers`); customer order history; fraud flag toggle blocking customer checkout. | DPDP Act compliance. | Staff can view customer profile, inspect order history, add timestamped notes, and toggle fraud flag which immediately blocks checkout. | P1 |
| **Statutory Compliance & Legal Checklist**: 12 statutory tick-box controls, amber open advisory review notes, document version records | `src/admin/AdminCompliancePage.tsx` | `PARTIALLY IMPLEMENTED` | Store compliance checklist states and document versions in database; audit log updates when compliance items are toggled. | Statutory counsel sign-off. | Interactive checkboxes update compliance status in DB; amber review notes display legal metrology and tax advisories; version bump modal works. | P1 |
| **Financial & Operational Reports**: 10 functional report tabs (Sales, Inventory Valuation, Rates, Settlements, SLAs, Cohorts, CSV exports) | `src/admin/AdminReportsPage.tsx` | `PARTIALLY IMPLEMENTED` | Backend report aggregation queries; CSV export endpoint returning RFC-4180 formatted data. | Large dataset query performance. | All 10 report tabs display dynamic data; "Export CSV" generates valid downloadable CSV with correct headers and sums. | P1 |
| **Roles, Permissions & Approvals**: 7 roles x 12 modules matrix, Maker-Checker queue, session security | `src/admin/AdminRolesPage.tsx`, `src/lib/adminPermissions.ts` | `PARTIALLY IMPLEMENTED` | Server-side RBAC middleware checking permissions for every admin API route; dual-authorization approval queue. | Officer directory. | Server blocks unauthorized actions (e.g. Auditor editing prices); initiator cannot approve their own maker-checker request. | P0 |
| **Immutable Audit Trail**: Chronological audit table, SHA-256 seal metadata, before/after diff modals | `src/admin/AdminAuditPage.tsx` | `PARTIALLY IMPLEMENTED` | Append-only database table (`audit_logs`) populated by backend service actions with actor, IP, timestamp, and JSON before/after snapshots. | Tamper-proof storage. | Every sensitive administrative action (pricing change, refund, stock adjustment, role change) creates an unalterable audit log entry. | P0 |

---

## 4. Implementation Phasing & Dependency Roadmap

1. **Phase 1: Foundation (Current)**
   - Configuration & `.env.example`
   - Relational Database Schema & Migrations
   - Standardized API contracts, validation (Zod), and error handling
   - JWT Authentication & Server-Side RBAC Middleware
   - Backend automated tests

2. **Phase 2: Core Commerce Engine**
   - Server Bullion Rates & Feed Monitoring Engine
   - 10-Minute Quote Lock & Server Expiry Enforcement
   - Concurrency-safe Stock Reservation & Product Catalog
   - Server-validated Cart & Order Creation with PMLA PAN rules
   - Payment Webhook Handler with HMAC signature & Idempotency
   - Invoice-Gated Dispatch Enforcement

3. **Phase 3: Admin & Operations Governance**
   - Live Maker-Checker Approval System
   - Immutable Audit Logging
   - Customer CRM & Compliance Checklist Persistence
   - Inventory Movement Ledger

4. **Phase 4: Corporate Gifting & Additional Capabilities**
   - Corporate Gifting Workflow (Enquiry, Quote, Proof Approval, Recipient Batch Upload)
   - Gold Vault MVP Boundary Disclosures & Gating

---

## 5. Definition of Done

A feature is complete only when:
- It matches the latest mind map.
- Its UI is connected to backend services and real business logic.
- Input validation and defensive error handling are implemented.
- Security-sensitive rules (pricing, stock locks, roles, permissions) are enforced server-side.
- Automated tests pass.
- Approved frontend design is preserved with 0 styling regressions.
