# GAP ANALYSIS: Bullion & Gifting Ecommerce Platform (Green + Orange Scope)

**Specification Authority:** MASTER PROMPT v2 (Green + Orange scope)  
**Date of Audit:** October 26, 2026  
**Auditor:** Antigravity Autonomous Agent  
**Scope Exclusions Enforced (Grey):** Digital Gold Vault (holdings, balance, liquidation, transaction types), Loyalty/rewards/referrals/gift cards, Recommendations/recently viewed algorithms, Marketing automation/AI insights/AI widgets.

---

## 1. Executive Summary

This gap analysis rigorously compares the existing prototype in this repository against every screen and component defined in **Phases 2 to 12** of **MASTER PROMPT v2**.

| Category | Total Components | Exists | Partial | Missing |
|---|---|---|---|---|
| **Phase 2: Storefront Header, Home & Footer** | 10 | 6 | 4 | 0 |
| **Phase 3: Listing, Search, Product Detail, Price Lock** | 6 | 4 | 2 | 0 |
| **Phase 4: Account, Cart, Checkout, Payment, Invoice, Tracking** | 9 | 5 | 4 | 0 |
| **Phase 5: Corporate Gifting, Personalization, Support, Content** | 8 | 2 | 3 | 3 |
| **Phase 6: Admin Foundation: Login, Nav, Settings, Dashboard** | 4 | 2 | 2 | 0 |
| **Phase 7: Admin Catalogue, Live Rates & Pricing** | 11 | 6 | 4 | 1 |
| **Phase 8: Admin Inventory, Orders, Payments, Fulfilment** | 12 | 6 | 4 | 2 |
| **Phase 9: Admin Compliance, Invoices/Tax, CRM & Support** | 7 | 4 | 2 | 1 |
| **Phase 10: Admin Corporate Gifting, Personalization, Offers** | 7 | 0 | 1 | 6 |
| **Phase 11: Admin Reports, Audit, Roles, Approvals** | 5 | 3 | 1 | 1 |
| **Phase 12: Integrations, System Health, Communications, Governance** | 4 | 1 | 1 | 2 |
| **TOTAL** | **83** | **39** | **28** | **16** |

---

## 2. Component Traceability Matrix (Phases 2 to 12)

### Phase 2: Storefront Header, Homepage and Footer

| # | Component Named in v2 | Scope | Status | Where it Lives | What Must Change |
|---|---|---|---|---|---|
| 2.1 | **Header and navigation** | (G) | **Partial** | `frontend/src/store-site/StoreLayout.tsx` | Add explicit language selector (English enabled, others "coming later"); ensure menu matches exact items: Bullion, Gold Coins/Bars, Silver Coins/Bars, Gems and Coloured Stones, Rudraksh, Gifts, Corporate Gifting; bind recent searches and active category filter. |
| 2.2 | **Live metal-rate strip** | (G) | **Exists** | `frontend/src/store-site/StoreLayout.tsx` | Gold/silver rates, reference market/city, purity/unit, INR, timestamp, pulsator, stale feed warning banner. |
| 2.3 | **Hero banner** | (G) | **Partial** | `frontend/src/store-site/HomePage.tsx` | Add schedule start/end validation (hide expired banners); support corporate quote CTA destination in addition to collection links. |
| 2.4 | **Category tiles** | (G) | **Exists** | `frontend/src/store-site/HomePage.tsx` | Gold coins/bars, silver coins/bars, gems/stones, rudraksh, gifts, corporate gifting tiles with display order. |
| 2.5 | **Featured and bestseller products** | (G) | **Partial** | `frontend/src/store-site/HomePage.tsx` | Add quick-view modal, offer badge, ratings, backorder eligibility check. |
| 2.6 | **Festival and curated collections** | (A) | **Partial** | `frontend/src/store-site/HomePage.tsx`, `OccasionsPage.tsx` | Add start/end date schedule enforcement (hide expired collections); bind mapped active SKUs only. |
| 2.7 | **Offers carousel** | (A) | **Exists** | `frontend/src/store-site/HomePage.tsx` | Active coupon codes, eligibility summary, start/end dates, copy coupon action. |
| 2.8 | **Corporate gifting entry** | (G) | **Exists** | `frontend/src/store-site/HomePage.tsx`, `GiftingEnquiryPage.tsx` | Value proposition, kit overview, minimum quantity prompt, CTA to request quote. |
| 2.9 | **Trust and education** | (G) | **Exists** | `frontend/src/store-site/StoreLayout.tsx`, `HomePage.tsx` | Purity/hallmark explanation, HUID/certificates, insured courier guarantees, link to verification. |
| 2.10 | **Testimonials and footer** | (G) | **Exists** | `frontend/src/store-site/StoreLayout.tsx` | Customer quotes with approval status check; footer policies, contact, separate newsletter consent checkbox. |

---

### Phase 3: Listing, Search, Product Detail, Price Lock

| # | Component Named in v2 | Scope | Status | Where it Lives | What Must Change |
|---|---|---|---|---|---|
| 3.1 | **Search and result summary** | (G) | **Exists** | `frontend/src/store-site/SearchPage.tsx` | Keyword search, query summary, result counts, category suggestions, empty state. |
| 3.2 | **Filter panel** | (G) | **Partial** | `frontend/src/store-site/CategoryPage.tsx` | Add missing filter facets: rudraksh mukhi, stone type, origin, occasion, personalization eligibility, offer, and PIN code delivery filter. |
| 3.3 | **Sort and product grid** | (G) | **Exists** | `frontend/src/store-site/CategoryPage.tsx` | Sorting (price, relevance, rating, newest), compare drawer (2-3 items), quick view modal, wishlist toggle. |
| 3.4 | **Delivery checker** | (G) | **Exists** | `frontend/src/store-site/ProductPage.tsx`, `CheckoutPage.tsx` | PIN code serviceability check (rejecting pins starting with 9), ETA display, armoured carrier notice. |
| 3.5 | **Product detail** | (G)/(A) | **Partial** | `frontend/src/store-site/ProductPage.tsx` | Media gallery zoom/video; category attributes; real-time price breakup; authenticity & certificate download; **personalization widget (A)** with engraving text, symbols, preview, charge, lead time, and non-returnable policy notice; **offers & review module (A)**. |
| 3.6 | **Live pricing and price lock** | (G) | **Exists** | `frontend/src/store-site/ProductPage.tsx`, `frontend/src/store/index.ts` | 10-minute rate lock countdown; stale rate quote pause; expired lock forces repricing and customer reconfirmation before checkout. |

---

### Phase 4: Account, Cart, Checkout, Payment, Invoice, Tracking

| # | Component Named in v2 | Scope | Status | Where it Lives | What Must Change |
|---|---|---|---|---|---|
| 4.1 | **Registration and login** | (A) | **Partial** | `frontend/src/store-site/AccountPage.tsx`, `frontend/src/store/index.ts` | Add dedicated customer login/register modal/page with mobile/email OTP simulation, 3 OTPs/min rate limit, consent recording, and security events. |
| 4.2 | **Profile and address book** | (G) | **Partial** | `frontend/src/store-site/AccountPage.tsx` | Add DOB, anniversary, GSTIN, PAN/KYC status fields; format validation for PAN (10-char alphanumeric) and GSTIN; mask sensitive fields. |
| 4.3 | **Account history** | (G) | **Exists** | `frontend/src/store-site/AccountPage.tsx` | Orders, invoices, certificates, saved items, tickets scoped to current customer. |
| 4.4 | **Cart and saved items** | (A) | **Partial** | `frontend/src/store-site/CartPage.tsx` | Add "Save for later" list; line-item personalization notes; coupon application with margin guardrails; dynamic bullion repricing banner. |
| 4.5 | **Checkout** | (G) | **Partial** | `frontend/src/store-site/CheckoutPage.tsx` | Add **Store pickup option** with pickup location selection; enforce **PAN/KYC mandatory trigger for orders > Rs 2,00,000**; lock payment if price lock expires. |
| 4.6 | **Payment status** | (G) | **Exists** | `frontend/src/store-site/CheckoutPage.tsx`, `frontend/src/store/index.ts` | Simulated gateway with `?demo=1` (Success, Failed, Pending, Timeout) and **Duplicate Webhook** simulation; idempotent webhook handler. |
| 4.7 | **Invoice and receipt** | (G) | **Exists** | `frontend/src/store-site/OrderPage.tsx` | Immutable PDF tax invoice modal with CGST/SGST/IGST, HSN, IRN/QR simulation, resend email action. |
| 4.8 | **Confirmation page** | (G) | **Exists** | `frontend/src/store-site/OrderPage.tsx` | Order ID, payment status, delivery address, invoice status, tracking link. |
| 4.9 | **Shipping tracking and delivery** | (G) | **Exists** | `frontend/src/store-site/OrderPage.tsx` | Timeline, carrier AWB, insured status, delivery exception actions, **lock address changes once dispatched**. |

---

### Phase 5: Corporate Gifting, Personalization Journey, Support, Content

| # | Component Named in v2 | Scope | Status | Where it Lives | What Must Change |
|---|---|---|---|---|---|
| 5.1 | **Corporate landing and enquiry form** | (G) | **Partial** | `frontend/src/store-site/GiftingEnquiryPage.tsx` | Company name, contact, GSTIN, occasion, quantity, budget/recipient, file brief upload (simulated), validation, auto-acknowledgement event. |
| 5.2 | **Quote review and approval** | (A) | **Missing** | New route/modal `frontend/src/store-site/QuoteApprovalView.tsx` | Client quote view with curated products, pricing breakdown, margin-approval badge, validity countdown, accept quote / request revision actions. |
| 5.3 | **Recipient and delivery details** | (A) | **Missing** | New component `frontend/src/store-site/CorporateRecipientsModal.tsx` | Recipient list upload/form, address/PIN validation, split delivery grouping, gift messaging. |
| 5.4 | **Personalization order journey** | (A) | **Missing** | `frontend/src/store-site/ProductPage.tsx`, `OrderPage.tsx` | Customization stepper (engraving text, symbols, packaging, preview, fee), non-returnable terms checkbox, post-order production stage tracking. |
| 5.5 | **Support request form** | (G) | **Exists** | `frontend/src/store-site/AccountPage.tsx`, `PolicyPage.tsx` | Ticket ID, order ID, issue type selector, description, attachment upload, status view. |
| 5.6 | **Eligibility and resolution** | (G) | **Partial** | `frontend/src/store-site/AccountPage.tsx` | Add policy-specific eligibility rules (bullion non-returnable, personalized non-returnable); link refund to original payment method. |
| 5.7 | **Help and policy content** | (G) | **Exists** | `frontend/src/store-site/PolicyPage.tsx` | 10 statutory policy pages with versioning, FAQs, escalation contacts, resolution SLAs. |
| 5.8 | **Content, SEO and education** | (A) | **Partial** | `frontend/src/store-site/KnowledgePage.tsx`, `BlogPage.tsx` | Ensure every content type has a distinct URL, meta tags, and matches backend compliance claims. |

---

### Phase 6: Admin Foundation: Login, Navigation, Settings, Dashboard

| # | Component Named in v2 | Scope | Status | Where it Lives | What Must Change |
|---|---|---|---|---|---|
| 6.1 | **Admin login & security events** | (G)/(A) | **Partial** | `frontend/src/admin/AdminLoginPage.tsx` | Add risk-triggered CAPTCHA after 3 failures; password reset workflow with OTP and strength validation; security event logging for suspicious login/lockout. |
| 6.2 | **Main navigation** | (G) | **Exists** | `frontend/src/admin/AdminLayout.tsx` | Ensure sidebar contains all 18 modules without any grey-scope modules (Gold Vault, loyalty, AI modules excluded). |
| 6.3 | **Settings screens** | (A) | **Partial** | `frontend/src/admin/AdminSettingsPage.tsx` | Expand `AdminSettingsPage` from stub to multi-tab settings (Store, Tax, Payment, Shipping/Pickups, Communication Templates, Approvals, Password Policy, KYC threshold). |
| 6.4 | **Dashboard & widgets** | (G)/(A) | **Exists** | `frontend/src/admin/AdminDashboardPage.tsx` | Revenue/margin widgets, Orders widget, Payments/refunds widget, Live metal rates widget, Inventory widget, Support/approval widgets, global filters, and role-based widget visibility. |

---

### Phase 7: Admin Catalogue, Live Rates and Pricing

| # | Component Named in v2 | Scope | Status | Where it Lives | What Must Change |
|---|---|---|---|---|---|
| 7.1 | **Product list** | (G) | **Exists** | `frontend/src/admin/AdminCataloguePage.tsx` | Table with SKU, name, category, metal, purity, weight, stock, calculated MRP, status, visibility, approval state, updated date. |
| 7.2 | **Product editor: core details** | (G) | **Exists** | `frontend/src/admin/AdminCataloguePage.tsx` | Name, product type, category/subcategory, SKU, dimensions, origin, stone type, mukhi, tags, descriptions. |
| 7.3 | **Product editor: pricing and tax** | (G) | **Exists** | `frontend/src/admin/AdminCataloguePage.tsx` | HSN, GST rate, live-rate flag, metal, purity, weight, markup %, making charges, MRP calculation. |
| 7.4 | **Product editor: compliance & media** | (G) | **Exists** | `frontend/src/admin/AdminCataloguePage.tsx` | Certificate upload, hallmark/HUID, SEO fields, visibility toggle. |
| 7.5 | **Product approval and publishing** | (G) | **Partial** | `frontend/src/admin/AdminCataloguePage.tsx` | Multi-step lifecycle: Draft -> Validate -> Preview -> Submit Approval -> Approve/Reject -> Publish with audit logging. |
| 7.6 | **Bulk upload and update** | (A) | **Missing** | `frontend/src/admin/AdminCataloguePage.tsx` | CSV/XLSX bulk upload modal with batch ID, validation errors, impact preview, approval requirement for high-value changes, and rollback. |
| 7.7 | **Provider setup and rate monitor** | (G) | **Exists** | `frontend/src/admin/AdminRatesPage.tsx` | MCX primary, LBMA fallback, latency, refresh intervals, health status, manual failover. |
| 7.8 | **Pricing rules** | (G) | **Partial** | `frontend/src/admin/AdminRatesPage.tsx` | Add mandatory "Finance confirmation" checkbox required before publishing pricing rule changes; formula preview. |
| 7.9 | **Price lock configuration** | (G) | **Exists** | `frontend/src/admin/AdminRatesPage.tsx`, `AdminSettingsPage.tsx` | Lock duration (greater than 0), eligible categories, expiry behavior. |
| 7.10 | **Manual override and bulk publish** | (G) | **Exists** | `frontend/src/admin/AdminRatesPage.tsx` | Maker-checker rate override requiring secondary officer authentication; rollback support. |
| 7.11 | **Rate audit and alerts** | (G) | **Exists** | `frontend/src/admin/AdminRatesPage.tsx` | Feed failure, stale rate alerts, abnormal movement alerts (>2% single update). |

---

### Phase 8: Admin Inventory, Orders, Payments, Fulfilment

| # | Component Named in v2 | Scope | Status | Where it Lives | What Must Change |
|---|---|---|---|---|---|
| 8.1 | **Inventory overview** | (G) | **Exists** | `frontend/src/admin/AdminInventoryPage.tsx` | SKU, warehouse, available, reserved, sold, damaged, reorder level, procurement cost. |
| 8.2 | **Serialized and batch inventory** | (G) | **Exists** | `frontend/src/admin/AdminInventoryPage.tsx` | Batch #, serial #, HUID/certificate #, unit identifier, location. |
| 8.3 | **Stock adjustment approval** | (G) | **Partial** | `frontend/src/admin/AdminInventoryPage.tsx` | Add maker-checker approval queue routing for high-value stock adjustments (> Rs 1,00,000 delta). |
| 8.4 | **Order list and queues** | (G) | **Exists** | `frontend/src/admin/AdminOrdersPage.tsx` | All, pending confirmation, payment failed, customized, high-value, cancellation/return, refund queue, exceptions. |
| 8.5 | **Order detail** | (G) | **Exists** | `frontend/src/admin/AdminOrderDetailPage.tsx` | Customer profile, line items, locked rate snapshot, tax breakup, payment ref, address, KYC status, notes. |
| 8.6 | **Order processing workflow** | (G) | **Partial** | `frontend/src/admin/AdminOrderDetailPage.tsx` | Enforce explicit blocking reasons stopping workflow: payment mismatch, expired lock, missing KYC, invoice failure, stock failure, or insurance mismatch. |
| 8.7 | **Payment transactions** | (G) | **Exists** | `frontend/src/admin/AdminOrdersPage.tsx`, `AdminOrderDetailPage.tsx` | Gateway transactions, webhook logs, settlement reference, retry simulated actions. |
| 8.8 | **Refund queue** | (G) | **Exists** | `frontend/src/admin/AdminOrdersPage.tsx` | Paid amount vs refund amount guard, maker-checker dual authorization for high-value refunds. |
| 8.9 | **Financial reconciliation** | (G) | **Exists** | `frontend/src/admin/AdminOrdersPage.tsx`, `AdminReportsPage.tsx` | Gateway fee, settlement variance, reconciliation status, notes. |
| 8.10 | **Shipping rules** | (G) | **Partial** | `frontend/src/admin/AdminOrdersPage.tsx`, `AdminSettingsPage.tsx` | Configure serviceable PINs, couriers, insurance threshold, pickup counter locations, COD disabled by default. |
| 8.11 | **Shipment operations** | (G) | **Exists** | `frontend/src/admin/AdminOrderDetailPage.tsx` | Packing checklist, high-value bullion insurance check, AWB generation, dispatch proof. |
| 8.12 | **Corporate split delivery** | (G) | **Missing** | `frontend/src/admin/AdminOrderDetailPage.tsx` | Multi-recipient split shipment allocation table, individual dispatch groups, tracking per recipient. |

---

### Phase 9: Admin Compliance, Invoices and Tax, CRM and Support

| # | Component Named in v2 | Scope | Status | Where it Lives | What Must Change |
|---|---|---|---|---|---|
| 9.1 | **Compliance record** | (G) | **Exists** | `frontend/src/admin/AdminCompliancePage.tsx` | BIS registration, hallmark status, HUID, purity grade, assaying centre, certificates, GSTIN, PAN/KYC flags. |
| 9.2 | **Compliance review queue** | (G) | **Exists** | `frontend/src/admin/AdminCompliancePage.tsx` | Missing data flags, risk level, reviewer decisions, document version bumping. |
| 9.3 | **Invoice generation** | (G) | **Exists** | `frontend/src/admin/AdminOrderDetailPage.tsx` | Invoice number, HSN, taxable value, CGST/SGST/IGST, payment ref, only after verified payment. |
| 9.4 | **Credit/debit notes & e-invoice** | (G) | **Missing** | `frontend/src/admin/AdminOrderDetailPage.tsx`, `AdminCompliancePage.tsx` | Credit note creation modal linked to original invoice; immutable original invoice preservation; simulated IRN/QR. |
| 9.5 | **Customer list and profile** | (G) | **Exists** | `frontend/src/admin/AdminCustomersPage.tsx` | Customer ID, contacts, address book, GSTIN/PAN, KYC status, order history, masked sensitive fields. |
| 9.6 | **Customer consent and segmentation** | (G) | **Partial** | `frontend/src/admin/AdminCustomersPage.tsx` | DPDP consent audit; enforce marketing exclusion for opted-out customers in event triggers. |
| 9.7 | **Support ticket queue** | (G) | **Exists** | `frontend/src/admin/AdminCustomersPage.tsx`, `AdminDashboardPage.tsx` | Ticket ID, order ID, priority, SLA badge, assignee, resolution, SLA breach alerts. |

---

### Phase 10: Admin Corporate Gifting, Personalization Production, Offers

| # | Component Named in v2 | Scope | Status | Where it Lives | What Must Change |
|---|---|---|---|---|---|
| 10.1 | **Enquiry and qualification** | (A) | **Missing** | New page `frontend/src/admin/AdminCorporateGiftingPage.tsx` | Corporate leads queue, lead stages (New, Qualified, Proposal, Won, Lost), consultation scheduler. |
| 10.2 | **Quote builder** | (A) | **Missing** | `frontend/src/admin/AdminCorporateGiftingPage.tsx` | Multi-product kit quote builder with margins, customization fees, tax calculations, margin approval check (<10% requires checker approval). |
| 10.3 | **Branding and personalization approval** | (A) | **Missing** | `frontend/src/admin/AdminCorporateGiftingPage.tsx` | Logo proof upload, engraving mockups, proof review & approval workflow. |
| 10.4 | **Recipient import and dispatch** | (A) | **Missing** | `frontend/src/admin/AdminCorporateGiftingPage.tsx` | Recipient CSV upload, address validation, split shipment batching. |
| 10.5 | **Campaign completion report** | (A) | **Missing** | `frontend/src/admin/AdminCorporateGiftingPage.tsx` | Corporate campaign delivery report, on-time delivery %, budget variance, reorder link. |
| 10.6 | **Personalization production queue** | (A) | **Missing** | New page `frontend/src/admin/AdminPersonalizationPage.tsx` | Queue tracking engraving orders: Artwork Proof -> Production -> QA Inspection -> Packing -> Dispatch. **Enforce rule: QA failure blocks dispatch.** |
| 10.7 | **Offer builder and performance** | (A) | **Partial** | New page `frontend/src/admin/AdminOffersPage.tsx` | Offer creation form with coupon code, min order, discount, margin guardrail for bullion; offer performance analytics table. |

---

### Phase 11: Admin Reports, Audit, Roles, Approvals

| # | Component Named in v2 | Scope | Status | Where it Lives | What Must Change |
|---|---|---|---|---|---|
| 11.1 | **Report builder** | (A) | **Partial** | `frontend/src/admin/AdminReportsPage.tsx` | Date range selector, filter panel, CSV export, role-based masking, audit logging on export actions. |
| 11.2 | **Audit log viewer** | (A) | **Exists** | `frontend/src/admin/AdminAuditPage.tsx` | Immutable chronological log: actor, action, entity, before/after values, SHA-256 seal, IP address. |
| 11.3 | **Role editor** | (A) | **Exists** | `frontend/src/admin/AdminRolesPage.tsx` | Role permissions matrix (View, Create, Edit, Approve) across all platform modules. |
| 11.4 | **Admin user management** | (A) | **Exists** | `frontend/src/admin/AdminRolesPage.tsx` | Staff users list, role assignment, active/inactive toggle, MFA status. |
| 11.5 | **Approval queue** | (A) | **Missing** | New dedicated tab/queue in `frontend/src/admin/AdminRolesPage.tsx` or `AdminApprovalsPage.tsx` | Unified Maker-Checker queue supporting all 6 approval types: price override, high-value refund, stock adjustment, compliance edit, low-margin quote, credit terms. Enforce anti-self-approval rule. |

---

### Phase 12: Integrations, System Health, Communication Framework, Governance

| # | Component Named in v2 | Scope | Status | Where it Lives | What Must Change |
|---|---|---|---|---|---|
| 12.1 | **Integrations and system health** | (G)/(A) | **Partial** | `frontend/src/admin/AdminPlatformPage.tsx` | Build simulated integration cards: Payment gateway, Metal-rate provider, Shipping/insurance, GST/e-invoice, KYC/identity/risk, Messaging/CRM, and Integration monitoring with test/retry actions. |
| 12.2 | **Shared data and pricing rules (Ledgers view)** | (G) | **Missing** | `frontend/src/admin/AdminPlatformPage.tsx` | Read-only unified Ledgers view displaying Product Master, Pricing Ledger, and Order Ledger. |
| 12.3 | **Communication event framework** | (A) | **Missing** | `frontend/src/admin/AdminPlatformPage.tsx`, `frontend/src/store/index.ts` | Multi-channel communication log (Email, SMS, WhatsApp, Push, In-app), template library, consent check, retry count, delivery status. |
| 12.4 | **Legal and release gates** | (G) | **Exists** | `frontend/src/admin/AdminPlatformPage.tsx`, `AdminCompliancePage.tsx` | Checklist page with runnable release tests (rate lock, catalog/cert, webhook idempotency, shipping/split delivery, invoice generation, consent gates). Exclude all Gold Vault gates. |

---

## 3. Data Model Fields Gap Analysis (Phase 1 Target)

To support the above screens and business rules, the existing data models in `frontend/src/data/types.ts` and `frontend/src/store/index.ts` must be extended in **Phase 1** with the following fields:

### 3.1 Product Entity Extensions
- `subcategory`: string (fine classification within category)
- `unit`: 'g' | 'kg' | 'carat' | 'piece'
- `dimensions`: string (L x W x H mm)
- `origin`: string (provenance/geographical source)
- `stoneType`: string (gemological variety)
- `rudrakshMukhi`: string | number (face count)
- `tags`: string[] (search & filter tags)
- `variant`: string (weight/size variant descriptor)
- `hsn`: string (e.g. '7108', '7106', '7103')
- `gstRate`: number (default 0.03 / 3%)
- `isLiveRate`: boolean (flag indicating live metal pricing engine dependency)
- `markupPercent`: number (retail markup)
- `premiumPercent`: number (minting/making premium)
- `fixedCharges`: number (packaging + certification)
- `calculatedMrp`: number (dynamically computed ceiling price)
- `hallmarkStatus`: 'Certified' | 'Exempt' | 'Pending'
- `huid`: string (unique 6-digit alphanumeric BIS Hallmark Unique Identifier)
- `bisReference`: string (refinery/assayer license #)
- `certificate`: { type: string; number: string; issuer: string; assayingCentre?: string; fileUrl?: string }
- `seoTitle`: string
- `seoDescription`: string
- `visibility`: 'Public' | 'Unlisted' | 'Private'
- `isFeatured`: boolean
- `approvalState`: 'draft' | 'validated' | 'submitted' | 'approved' | 'rejected' | 'published'
- `updatedDate`: string (ISO UTC)
- `personalizationEligible`: boolean
- `personalizationCharge`: number
- `backorderEligible`: boolean
- `rating`: number (average customer rating 1-5)

### 3.2 Customer Entity Extensions
- `dateOfBirth`: string (YYYY-MM-DD)
- `anniversary`: string (YYYY-MM-DD)
- `gstin`: string (15-character GST identification number)
- `pan`: string (10-character PAN number for high-value tax reporting)
- `kycStatus`: 'Pending' | 'Verified' | 'Exempt' | 'Rejected'
- `channelConsent`: { email: boolean; sms: boolean; whatsapp: boolean; push: boolean }
- `preferredLanguage`: string (default 'en')
- `recentSearches`: string[]
- `savedForLater`: string[] (product IDs)
- `riskFlags`: string[] (e.g. 'high_velocity', 'mismatched_pincode')

### 3.3 Price Lock & Configuration
- `lockDurationSeconds`: number (e.g. 600s / 10 minutes)
- `eligibleProductTypes`: string[]
- `expiryAction`: 'block_payment_force_reprice'

### 3.4 Payment & Gateway Extensions
- `paymentMethodsSupported`: ('UPI' | 'Card' | 'NetBanking' | 'Wallet' | 'EMI_BNPL')[]
- `gatewayReference`: string
- `webhookStatus`: 'Received' | 'Verified' | 'Duplicate_Ignored' | 'Failed'
- `webhookHistory`: { payloadId: string; receivedAt: string; status: string }[]
- `offlinePaymentApproved`: boolean
- `settlementReference`: string

### 3.5 Invoice, Credit/Debit Notes & Tax
- `invoiceNumber`: string (sequential tax invoice)
- `immutablePdfUrl`: string
- `emailDeliveryStatus`: 'Pending' | 'Sent' | 'Failed_Retrying' | 'Delivered'
- `taxSplit`: { cgst: number; sgst: number; igst: number }
- `irnQr`: { irn: string; qrCode: string }
- `creditDebitNotes`: {
    id: string;
    type: 'CreditNote' | 'DebitNote';
    originalInvoiceNumber: string;
    adjustmentAmount: number;
    reason: string;
    createdAt: string;
  }[]

### 3.6 Shipping & Fulfilment
- `serviceabilityResponse`: { pincode: string; courier: string; method: string; etaDays: number; isRestricted: boolean }
- `declaredValue`: number
- `insuranceRequired`: boolean
- `codEligible`: boolean (default false for precious bullion)
- `isStorePickup`: boolean
- `pickupLocation`: string

### 3.7 Offers & Coupon Engine
- `Offer`: {
    id: string;
    name: string;
    code: string;
    type: 'percent' | 'flat';
    discountValue: number;
    minOrderValue: number;
    eligibleCategories: string[];
    usageLimitTotal: number;
    usageLimitPerCustomer: number;
    usedCount: number;
    startDate: string;
    endDate: string;
    marginGuardrailPercent: number; // Disallow coupon if bullion gross margin drops below threshold
    approvalStatus: 'Draft' | 'Approved' | 'Active' | 'Expired';
  }

### 3.8 Corporate Gifting Entities
- `CorporateEnquiry`: {
    id: string;
    companyName: string;
    contactPerson: string;
    email: string;
    phone: string;
    gstin?: string;
    occasion: string;
    quantity: number;
    budgetPerRecipient: number;
    preferences: string;
    status: 'New' | 'Qualified' | 'Quoted' | 'Approved' | 'Fulfillment' | 'Closed';
    createdAt: string;
  }
- `CorporateQuote`: {
    id: string;
    enquiryId: string;
    items: { productId: string; name: string; quantity: number; unitPrice: number; customizationCost: number }[];
    subtotal: number;
    tax: number;
    total: number;
    marginPercent: number;
    isMarginApproved: boolean;
    approver?: string;
    expiresAt: string;
    paymentTerms: string;
    brandingProofUrl?: string;
    status: 'Draft' | 'Submitted' | 'Margin_Approved' | 'Accepted' | 'Expired';
  }
- `CorporateRecipient`: {
    id: string;
    quoteId: string;
    name: string;
    phone: string;
    address: string;
    pincode: string;
    giftVariant: string;
    customMessage: string;
    shipmentGroupId: string;
    deliveryStatus: 'Pending' | 'Dispatched' | 'Delivered';
  }

### 3.9 Personalization Production
- `PersonalizationDetails`: {
    engravingText: string;
    recipientName?: string;
    giftMessage?: string;
    occasion?: string;
    packagingOption: string;
    customizationCharge: number;
    productionStage: 'Proofing' | 'Engraving' | 'QA_Inspection' | 'Packing' | 'Ready_For_Dispatch';
    artworkApproved: boolean;
    qaPassed: boolean;
    qaNotes?: string;
  }

### 3.10 Approvals (Unified Maker-Checker)
- `ApprovalRequest`: {
    id: string;
    type: 'price_override' | 'high_value_refund' | 'stock_adjustment' | 'compliance_edit' | 'low_margin_quote' | 'credit_terms';
    entityId: string;
    requester: string;
    amount?: number;
    reason: string;
    beforeState: any;
    afterState: any;
    status: 'Pending' | 'Approved' | 'Rejected';
    approver?: string;
    createdAt: string;
    resolvedAt?: string;
  }

### 3.11 Communication Event Framework
- `CommunicationEvent`: {
    id: string;
    channel: 'email' | 'sms' | 'whatsapp' | 'push' | 'in_app';
    eventType: 'otp' | 'order_confirmation' | 'invoice_issued' | 'shipment_dispatch' | 'refund_approved' | 'quote_ready' | 'security_alert';
    templateId: string;
    version: string;
    recipientContact: string;
    consentVerified: boolean;
    retryCount: number;
    status: 'Sent' | 'Delivered' | 'Failed';
    failureReason?: string;
    timestamp: string;
  }

### 3.12 Ledgers
- `PricingLedgerEntry`: Records timestamp, metal, spot source, base rate, purity factor, markup/premium, making, packaging, insurance, GST, locked quotes, and override approvals.
- `OrderLedgerEntry`: Records immutable sequence of order creation, locked price reference, payment webhook signature, stock reservation delta, invoice number, courier AWB, refund credit notes, and associated communications.

---

## 4. Verification and Done When Criteria

- [x] Read repository structure, `docs/PROGRESS.md`, and `docs/COVERAGE.md`.
- [x] `docs/GAP-ANALYSIS.md` covers every screen and component in Phases 2 to 12 of MASTER PROMPT v2.
- [x] Every missing data model field for Phase 1 is documented in detail.
- [x] No application code was altered in Phase 0.
- [x] `npm run build` passes with zero errors.
