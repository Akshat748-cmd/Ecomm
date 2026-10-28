<USER_REQUEST>
# MASTER PROMPT v2: Bullion and Gifting Ecommerce Platform (Green + Orange scope)

You are a senior product designer and front-end engineer. The client approved our first clickable prototype and has sent a detailed **Screen and Component Specification**. Your job is to **extend the existing prototype** in this repository so it matches that specification for the **GREEN and ORANGE** items only. Fake data only, no real backend.

## HOW YOU MUST WORK (read first)

1. This document has **Phases 0 to 13**. Build **ONE phase at a time**, in order.
2. When I paste this document, **do NOT start building**. Reply only: "Ready. Say NEXT to start Phase 0."
3. When I say **NEXT**, do only the next phase. Do not build ahead, skip, or add features that are not in the phase.
4. At the end of each phase: run `npm run build` and fix errors; open this phase's routes and fix console errors; tick every **DONE WHEN** item; update `docs/PROGRESS.md`; reply with a summary of max 10 lines; STOP and wait for NEXT.
5. **FIX: <problem>** means fix only that problem.
6. Do not rewrite working files from earlier phases. **Extend** them. Before each phase read `docs/PROGRESS.md`, `docs/GAP-ANALYSIS.md` and the current phase text only.
7. If something is unclear, choose the simplest reasonable option, write it in `docs/PROGRESS.md` under "Assumptions", and continue.
8. Never claim something works unless you ran it.

## SCOPE RULES

- **GREEN** = MVP required. **ORANGE** = validate next. **Both are in scope** and are marked (G) or (A) below.
- **GREY = later phase. Do NOT build, extend or touch anything grey.** Grey items are: Gold Vault (every screen, widget, journey, admin module, partner, report, balance and workflow), Loyalty/wallet/referrals/gift cards, Recommendations and recently viewed, Marketing automation and communications module, AI insights and automation, Marketing widget, Corporate gifting widget on dashboard, AI insights and system health widget, "Vault and custody partners" integration, Gold Vault transaction type or reconciliation inside any filter, report or screen.
- The existing "Gold Vault: Coming soon" placeholder from the first prototype stays exactly as it is. Add nothing to it. In the new admin navigation do not show grey modules.
- Where a green or orange field list mentions a grey item (for example "Gold Vault holdings" or "reward balances"), **leave that part out**.
- Do not build the Customer Mobile App.

## GLOBAL RULES

- **LIGHT theme only.** No black, no dark blue, no dark backgrounds. Keep the existing design tokens (ivory `#FFFBF3`, soft gold `#C9A24B`, warm brown headings `#5A4630`, body `#7A6A55`, border `#EADFC8`, surface-alt `#F8EFD9`, amber `#FBE7B8`, coral `#F7D4CF`, sage `#DCE8D5`, rose `#F3D9D2`). Fonts: Cormorant Garamond for headings, Inter for body and numbers.
- Same stack as the existing project (Vite, React, TypeScript, Tailwind, React Router, Zustand, lucide-react). One shared store for store and admin.
- Fake data only. No external APIs or images. No real card or personal data. No lorem ipsum.
- Every list has an empty state, every form has validation and error messages, every slow action has a loading state. 404 page for wrong URLs. Reload must work on every route. Clean up timers.
- Responsive at 375, 768, 1024, 1440. Visible focus rings. Labels on inputs.
- **Business rules from the specification are binding.** Every "Rules:" line below must actually be enforced in the UI behaviour, not just shown as text.
- Status tags: WORKING (real behaviour), SIMULATED (fake behaviour), no TAGGED items are needed in this version because grey is excluded.

## KEY RULES THAT MUST HOLD EVERYWHERE
- Bullion price always comes from the one pricing function and the latest valid rate. Stale rate is never shown as live. An expired price lock forces repricing and renewed customer confirmation, and **blocks payment**.
- Order is confirmed **only** after verified payment success (via simulated gateway webhook, idempotent) or approved offline payment.
- Invoice PDF is immutable. Corrections only through credit/debit note.
- Maker-checker for high-value refunds, high-value stock adjustments, price override, compliance edit, low-margin quote, credit terms.
- Audit every sensitive change (actor, action, entity, before/after, time, reason, approver).
- Mask sensitive data by role. Documents and records must belong to the authenticated customer.
- High-value bullion is insured. Declared value matches invoice. COD is disabled unless approved.
- Admin sees only what their role allows.

---

# PHASES

## PHASE 0: Audit and gap analysis (no feature code)
1. Read the whole repository and `docs/PROGRESS.md`, `docs/COVERAGE.md`.
2. Create `docs/GAP-ANALYSIS.md`: for every screen and component in Phases 2 to 12 of this document, write one row: **Exists / Partial / Missing**, where it lives (route or file), and what must change. Do not skip any component.
3. List the data model fields that are missing (see Phase 1).
4. Do not change any app code in this phase.
DONE WHEN: `docs/GAP-ANALYSIS.md` covers every component named in this document and `npm run build` still passes.

## PHASE 1: Data model and logic extensions (no new design)
Extend the store and `src/lib`; keep existing behaviour. Add:
1. **Product fields:** subcategory, unit, dimensions, origin, stone type, rudraksh mukhi, tags, variant, HSN, GST rate, live-rate flag, markup %, premium/making %, fixed charges, calculated MRP, hallmark status, HUID, BIS reference, certificate type/number/issuer/assaying centre/file, SEO title/description, visibility, featured flag, approval state (draft, validated, submitted, approved, rejected, published), updated date, personalization eligibility and charge, backorder flag, rating.
2. **Customer fields:** date of birth, anniversary, GSTIN, PAN, KYC status, consent per channel, preferred language, recent searches, saved-for-later items, risk flags.
3. **KYC rule (assumption, configurable in Settings):** if an order total is above Rs 2,00,000, PAN/KYC is required before payment. Orders with missing KYC are held.
4. **Price lock config:** duration, eligible products, expiry behaviour. Lock must have duration greater than zero.
5. **Payment:** methods (UPI, cards, net banking, wallet, EMI/BNPL flag), status, gateway reference, webhook status, idempotent webhook handler, offline payment approval, settlement reference.
6. **Invoice:** invoice number, immutable PDF reference, email status (retry), CGST/SGST/IGST split, IRN/QR (simulated, only where applicable), credit/debit note records linked to an original invoice.
7. **Shipping:** serviceability response (PIN, courier, method, ETA, restriction), declared value, insurance required, COD eligibility (default off), store pickup flag and pickup location.
8. **Offers:** offer entity (name, type, discount type/value, minimum order, category/SKU, segment, coupon code, usage limit, per-customer usage, dates, combinability, approval status) and a coupon engine with margin guardrail for bullion.
9. **Corporate gifting:** enquiry, quote (with margin approval status, expiry, payment terms), branding proof, recipient list, shipment groups.
10. **Personalization:** engraving text, language and symbol limits, preview, production stage, artwork approval, QA status.
11. **Support:** tickets (SLA, assignee, status), return/cancellation requests, credit/debit note links.
12. **Approvals:** approval request entity with types (price override, high-value refund, stock adjustment, compliance edit, low-margin quote, credit terms), maker-checker enforcement, approval limit per role.
13. **Communication events:** event log with channel (email, SMS, WhatsApp, push, in-app), template, version, language, consent check, priority/fallback, retry count, delivery status, failure reason.
14. **Ledgers:** Pricing ledger (source/timestamp, purity conversion, markup/premium, charges, GST, lock, overrides, approvals) and Order ledger (order, payment webhook, locked price, stock reservation, invoice, shipment, refund, messages linked by IDs).
15. Sample data for all of the above (at least 16 products, 8 orders in different states, 6 customers, 5 enquiries, 4 corporate quotes, 6 tickets, 5 offers, 10 approvals, 20 events). Keep unit tests passing and add tests for the KYC rule, lock expiry and idempotent webhook.
DONE WHEN: `npm test` and `npm run build` pass; a hidden `/debug` page prints the new data; no console errors.

## PHASE 2: Storefront header, homepage and footer
Build or extend:
1. **Header and navigation (G):** logo; menu: Bullion, Gold Coins/Bars, Silver Coins/Bars, Gems and Coloured Stones, Rudraksh, Gifts, Corporate Gifting. Search: keyword input, autocomplete suggestions, recent searches. Customer controls: login/profile, wishlist, cart count, **language selector** (English only enabled, others shown as "coming later"), support. Rules: show only published categories; cart count reflects the active cart.
2. **Live metal-rate strip (G):** gold rate, silver rate, reference market/city, purity/unit, currency, last refreshed timestamp, feed status. Actions: view rate details, browse bullion. Rules: show timestamp; flag stale feed; never present stale rates as live.
3. **Hero banner (G):** headline, supporting copy, desktop/mobile image, CTA label, CTA destination, schedule, active status. Actions: shop now, explore collection, request corporate quote. Rules: hide expired banners; validate CTA destination.
4. **Category tiles (G):** category name, image/icon, destination URL, display order, active status; categories: gold coins/bars, silver coins/bars, gems/stones, rudraksh, gifts, corporate gifting. Action: open category listing.
5. **Featured and bestseller products (G):** card fields image, name, SKU, current price, purity/weight where relevant, offer badge, stock status, rating, wishlist control. Actions: quick view, product detail, wishlist, add to cart when eligible. Rules: active in-stock SKUs only unless backorder is explicitly enabled.
6. **Festival and curated collections (A):** collection name, occasion, banner, mapped SKUs, start/end dates, display order. Actions: explore collection, shop products. Rules: hide expired collections and unavailable products.
7. **Offers carousel (A):** offer title, coupon, eligibility summary, start/end date, terms link. Actions: view offer, copy/apply coupon. Rules: active offers only; clearly disclose exclusions.
8. **Corporate gifting entry (G):** corporate value proposition, curated kits, quantity/budget prompts, branding and split-delivery benefits; CTA, minimum quantity if configured, enquiry destination. Actions: request a quote, explore gift kits.
9. **Trust and education (G):** purity and hallmark explanation, HUID/certificates, secure insured shipping, invoice and support links; trust badge, explanatory copy, destination URL, evidence/source reference. Rule: claims must match product and compliance records.
10. **Testimonials and footer (G):** testimonial fields quote, customer display name/permission, product, approval status; only approved testimonials show. Footer: contact, policies, FAQs, shipping/returns, privacy, terms, social links, newsletter consent recorded separately from other consent.
DONE WHEN: every component above works with its rules at 375px and 1440px, expired banners and collections disappear, stale feed shows amber, no console errors.

## PHASE 3: Listing, search, product detail, price lock
Build or extend:
1. **Search and result summary (G):** keyword, autocomplete, result count, category, no-results state. Actions: search, clear query, browse suggested categories.
2. **Filter panel (G):** price range, metal, purity, weight, stone type, rudraksh mukhi, origin, occasion, availability, rating, personalization, offer, delivery PIN code. Actions: apply, clear, remove individual filter. Rules: filters return active/visible products; bullion prices use the latest valid calculated price.
3. **Sort and product grid (G):** sort by relevance, price low/high, newest, popularity, rating. Card: image, name, SKU, price, old price if valid, discount badge, purity, weight, availability, rating. Actions: detail, quick view (modal), wishlist, compare (simple 2-3 item compare drawer), add to cart where allowed.
4. **Delivery checker (G):** PIN code, serviceability result, estimated delivery date, shipping restriction. Rules: use the current serviceability response; do not promise an unsupported ETA (pincodes starting with 9 are not serviceable).
5. **Product detail (G):**
   - Media gallery: image set, video where available, alt text, sequence, zoom.
   - Identity and specifications: name, SKU, category, description, dimensions, weight/unit, metal, purity/fineness, stone type/origin, rudraksh mukhi, care instructions. Rule: show category-specific attributes only.
   - Price and price breakup: current price, live metal rate, purity conversion, weight, markup/premium, making charge, packaging/insurance where applicable, GST, total, last refresh time. Actions: view breakup, refresh rate. Rule: price must match the pricing engine; show timestamp and applicable taxes/charges.
   - Authenticity and certificates: hallmark status, HUID, BIS reference where applicable, certificate type/number, issuer/assaying centre, certificate image/PDF. Actions: view/download certificate. Rule: show only verified and applicable claims.
   - Availability and delivery: stock status, quantity, PIN code, serviceability, ETA, shipping/insurance message. Actions: check PIN, select quantity.
   - **Personalization widget (A):** eligibility, engraving text, recipient name, gift message, occasion, packaging, personalization charge, lead time, preview. Rules: enforce character/language limits; show the changed cancellation/return rules.
   - **Offers, reviews and related items (A):** eligible offers, coupon terms, rating, review text/media, FAQs, related SKU list. Actions: apply offer, ask question, share, wishlist, compare.
   - Purchase actions (G): add to cart, buy now. Rule: disable purchase when unavailable; validate quantity, price and eligibility.
6. **Live pricing and price lock (G):**
   - Rate display: metal, purity, rate/unit, reference market, source, timestamp, stale status.
   - Checkout lock: locked rate, locked price, lock start/end, countdown, order/cart reference. Actions: lock price, refresh/recalculate, continue payment. Rule: **expired lock forces repricing and renewed customer confirmation.**
DONE WHEN: all rules enforced, quote/lock expiry works, personalization limits work, compare and quick view work, no console errors.

## PHASE 4: Account, cart, checkout, payment, invoice, tracking
Build or extend:
1. **Registration and login (A):** mobile/email, OTP, full name, password where applicable, consent preferences. Actions: request OTP, verify, resend, login, logout (any 6-digit OTP works). Rules: validate contact; rate-limit OTP (max 3 per minute); record consent and security events.
2. **Profile and address book (G):** name, mobile, email, date of birth, anniversary, billing/shipping addresses, PIN, GSTIN, PAN/KYC status, preferences. Actions: edit profile, add/edit address, verify sensitive changes (OTP). Rules: validate supplied tax IDs (GSTIN and PAN format); protect sensitive fields (masked display).
3. **Account history (G):** orders, invoices, certificates, wishlist, saved items, support tickets; order/transaction IDs, status, date, amount, document links. Rule: records and documents must belong to the logged-in customer.
4. **Cart and saved items (A):** line items (SKU, product, variant, quantity, current/locked price, personalization, stock status; actions change quantity, remove, save for later) and cost summary (subtotal, discount, coupon, GST, shipping, insurance, packaging, total payable; actions apply/remove coupon, view terms, proceed to checkout). Rules: refresh bullion pricing unless a valid lock exists; enforce stock and offer eligibility.
5. **Checkout (G):**
   - Customer and address: login/guest status, contact, billing/shipping address, PIN, GSTIN, delivery instructions. Actions: select/add address, validate serviceability. **Store pickup option:** choose pickup instead of delivery, with a pickup location list.
   - Order review and compliance: products, quantities, locked rate/timer, tax breakup, coupon, gift message, PAN/KYC trigger (Phase 1 rule), terms acceptance. Actions: confirm order details, accept applicable terms. Rule: complete address and serviceability required before payment.
   - Payment selection: gateway, UPI, cards, net banking, wallet, EMI/BNPL if enabled, payable amount. Actions: pay, retry failed payment. Rules: expired price lock blocks payment; confirm through gateway webhook.
6. **Payment status (G):** transaction ID, gateway reference, status, amount, timestamp, retry link. Rules: idempotent webhook processing; order confirmed only after verified success or approved offline payment. Keep the `?demo=1` selector for Success, Failed, Pending, Timeout and add "Duplicate webhook".
7. **Invoice and receipt (G):** invoice number, order ID, customer/GSTIN, addresses, product/HSN, taxable value, CGST/SGST/IGST, total, payment reference, PDF reference, email status, IRN/QR where applicable. Actions: download invoice, resend email. Rules: immutable PDF; correct via credit/debit note; retry failed email/storage.
8. **Confirmation page (G):** order ID, payment status, delivery address, order summary, invoice status, next steps. Actions: view order, track order, continue shopping.
9. **Shipping tracking and delivery (G):** tracking page (courier, tracking ID, shipment status, ETA, insured status, package value, recipient/address summary, proof of delivery; actions track shipment, contact support; rules restrict sensitive logistics details, **lock address edits after dispatch**) and delivery exceptions (failure reason, latest event, support ticket, next action, revised ETA; actions raise issue, reschedule where supported).
DONE WHEN: guest and logged-in checkout both work, KYC hold works above the threshold, expired lock blocks payment, duplicate webhook is ignored, invoice appears only after payment, address edits lock after dispatch, no console errors.

## PHASE 5: Corporate gifting, personalization journey, support, content
Build:
1. **Corporate landing and enquiry form (G):** company, contact person, mobile/email, GSTIN if available, occasion, quantity, budget per recipient, product preferences, branding, delivery schedule, recipient count, remarks, lead source. Actions: submit enquiry, upload logo/brief (fake file, validate type and size). Rules: company/contact, quantity and budget required; send acknowledgement (communication event).
2. **Quote review and approval (A):** quote ID, curated products, unit price, customization, shipping, taxes, total, margin-approved status, expiry, payment terms. Actions: accept quote, request revision, approve branding proof. (Quote must show "margin approved" before the customer can accept.)
3. **Recipient and delivery details (A):** recipient name, phone/email where needed, address/PIN, gift variant/message, delivery date, shipment grouping. Rules: validate addresses; support split delivery and privacy controls.
4. **Personalization order journey (A):** setup (eligible SKU, engraving text, recipient, message, language, symbols, packaging, preview, charge, production lead time; actions preview, confirm customization) and production/delivery status (production stage, artwork approval, quality check, packaging, dispatch and tracking). Rule: disclose non-returnable/restricted cancellation terms **before payment** (customer must tick acceptance).
5. **Support request form (G):** ticket ID, order ID, issue type, message, attachments, contact channel. Actions: submit, add evidence, view status.
6. **Eligibility and resolution (G):** return/cancellation window, product type, reason, approval, pickup, refund/replacement, SLA, resolution notes. Rules: bullion/customized/corporate policies vary; verify order ownership; refund tied to payment.
7. **Help and policy content (G):** policy version, FAQ, expected resolution time, escalation contact.
8. **Content, SEO and education (A):** content page template with title, slug, meta title, meta description, body, FAQ, related products, images, publish status. Content types: buying guides, purity, hallmarking, gemstone certificates, rudraksh guidance, gifting guides, FAQs, policies, blogs, festival collections. Rules: unique URLs; claims match backend; version policy pages. Create at least one page of each type.
DONE WHEN: an enquiry becomes a quote that the customer can accept, a personalized order shows production status, a return request shows its resolution state, content pages have unique URLs and meta tags, no console errors.

## PHASE 6: Admin foundation: login, navigation, settings, dashboard
Build or extend:
1. **Admin login (G):** login form (username/email, password, remember device, risk-triggered CAPTCHA after 3 failures, MFA OTP; actions login, show/hide password, forgot password, resend OTP, contact administrator; rules rate-limit attempts, restrict inactive users, record login/security events). **Password reset (A):** registered email/mobile, OTP/reset link, new password, confirmation; rules token expiry, password strength/history and match, revoke sessions after reset. **Security events (A):** successful/failed login, suspicious device, password reset/change, MFA challenge, lockout, timeout; communications for reset link/OTP and suspicious-login alert.
2. **Main navigation (G):** Dashboard, Catalog, Pricing, Inventory, Orders, Payments/Refunds, Fulfillment, CRM, Corporate Gifting, Offers, Compliance, Invoices/Tax, Reports, Support, Integrations, Roles, Audit Logs, Settings. (No grey modules.)
3. **Settings screens (A):** store settings, tax settings, payment settings, shipping settings (incl. pickup locations), communication templates, approval workflows, password policy, API keys (masked), data retention, legal policies, plus KYC threshold and demo toggles. Rules: restrict configuration by role; audit sensitive changes.
4. **Dashboard:**
   - Global filters (A): date range, warehouse, category, sales channel, payment status, order status, customer segment, campaign, corporate account. Actions: refresh, export, drill down, assign exception, approve task, view audit trail. Rules: date range required; role-based visibility; show data-sync warnings.
   - Revenue and margin widgets (A): total revenue, bullion revenue, non-bullion revenue, gross margin, average order value, period comparison; date range, currency, source status, drill-down to orders and reports.
   - Orders widget (G): orders today, total orders, pending confirmation, cancelled orders, order status counts; status, date, product type, owner, link to filtered order list.
   - Payments and refunds widget (G): failed payments, payment mismatch, pending refunds, refund status; gateway, transaction reference, amount, age, exception link.
   - Live metal rates widget (G): gold rate, silver rate, rate movement, last refresh, provider status; actions open pricing screen, inspect rate log; rules stale-rate alert, abnormal movement alert.
   - Inventory widget (G): inventory value, low-stock SKUs, reserved stock, damaged stock, stockout risk; SKU, warehouse, available/reserved quantity, reorder level.
   - Support and approval widgets (G): open tickets, SLA breaches, pending approvals, high-value refunds, pricing overrides; priority, age, assigned owner, approval limit, escalation action.
   - Dashboard data integrity (G): figures reconcile to order/payment state; unauthorized widgets hidden; negative values require a valid return/refund context.
DONE WHEN: login with MFA, CAPTCHA after 3 failures, lockout and reset all work; dashboard numbers match order and payment data; widgets hide by role; no console errors.

## PHASE 7: Admin catalogue, live rates and pricing
Build or extend:
1. **Product list (G):** SKU, name, category, metal, purity, weight, stock, calculated MRP, status, visibility, approval state, updated date. Actions: search, filter, add, edit, duplicate, archive, bulk select.
2. **Product editor, core details (G):** name, product type, category/subcategory, SKU, unit, dimensions, origin, stone type, rudraksh mukhi, tags, descriptions.
3. **Product editor, pricing and tax (G):** HSN, GST rate, live-rate flag, metal, purity, weight, markup %, premium/making %, fixed charges, calculated MRP. Rules: unique SKU; bullion requires metal, purity, weight and rule; positive weight; tax and price logic required.
4. **Product editor, compliance and media (G):** images, video, certificate upload, hallmark/HUID, certificate status, SEO title/description, visibility, featured flag. Rules: active product requires image and valid selling-price logic; certified item requires its certificate.
5. **Product approval and publishing (G):** flow draft, validate, preview, submit approval, approve/reject, publish. Fields: submitter, reviewer, reason, approval status, timestamp, before/after values.
6. **Bulk upload and update (A):** batch ID, CSV/XLSX file, selected SKUs/category, update type, validation errors, impact preview, approver, publish status. Flow: select, upload/edit, validate, preview, approve, publish, audit. Rules: preserve before/after history; high-value price changes require approval.
7. **Provider setup and rate monitor (G):** provider, metal, purity, base rate, reference market/city, unit conversion, refresh interval, last refresh, provider health, fallback source. Actions: test connection, refresh, switch fallback, inspect logs.
8. **Pricing rules (G):** category/product markup %, premium type/value, making charge, packaging, insurance, GST, effective dates. Rules: formula and tax base must be confirmed with finance (show a "Finance confirmation" checkbox required before publish); preview before publish.
9. **Price lock configuration (G):** duration, lock start/end, eligible products, expiry behaviour. Rules: duration greater than zero; expired lock requires recalculation.
10. **Manual override and bulk publish (G):** override flag, reason, requested value, approver, batch ID, affected SKU count, before/after price. Actions: simulate, submit approval, publish, roll back where supported. Rules: reason and approver mandatory; audit every change.
11. **Rate audit and alerts (G):** timestamp, source, old/new rate, movement %, stale status, alert status, resolution. Events: feed failure, stale rate, abnormal movement (more than 2% in one update), failed bulk publish.
DONE WHEN: a new product goes draft to published through approval and appears in the store, bulk upload preview and rollback work, price lock config changes store behaviour, abnormal movement raises an alert, no console errors.

## PHASE 8: Admin inventory, orders, payments, fulfilment
Build or extend:
1. **Inventory overview (G):** SKU, warehouse, available, reserved, sold, damaged, reorder level, procurement cost, status. Actions: receive, transfer, reserve, release, adjust, mark damaged.
2. **Serialized and batch inventory (G):** batch number, serial number, HUID/certificate number, unit identifier, location. Rules: unique serial per unit; no negative stock; reserved stock expires with cart/payment timeout.
3. **Stock adjustment approval (G):** reason, quantity delta, evidence, requester, approver, audit record. Rule: high-value adjustments require maker-checker.
4. **Order list and queues (G):** queues all, pending confirmation, payment failed, customized, high-value, cancellation/return, refund queue, exceptions; fields order ID, customer, amount, product type, payment, invoice, fulfilment, delivery, risk flag, date, owner.
5. **Order detail (G):** customer profile, line items, locked rate/expiry, price breakup, payment reference, billing/shipping address, PAN/KYC flag, personalization, courier, tracking, notes. Actions: verify, assign, hold, cancel where eligible, refund request, open shipment.
6. **Order processing workflow (G):** verify payment, generate invoice, reserve stock, pick/pack checklist, allocate courier/insurance, dispatch, track, deliver, close. **Rules: processing stops on payment mismatch, expired lock, missing KYC, invoice/PDF failure, stock failure or insurance mismatch** (each shows a clear blocking reason).
7. **Payment transactions (G):** transaction ID, order ID, gateway, method, amount, status, webhook status, settlement reference, timestamps. Actions: inspect, retry supported operation, reconcile.
8. **Refund queue (G):** order/payment ID, paid amount, requested refund, reason, eligibility, approver, gateway status, settlement status. Rules: refund cannot exceed paid amount; high-value refunds require maker-checker.
9. **Financial reconciliation (G):** gateway transactions, orders, invoices, refunds, settlements; expected amount, actual amount, variance, status, owner, resolution note.
10. **Shipping rules (G):** serviceable PIN code, courier, method, declared value, insurance required, packaging, pickup location, COD eligibility. Actions: configure, test serviceability, assign courier.
11. **Shipment operations (G):** order ID, courier, tracking ID, ETA, shipment status, package value, insurance status, proof of delivery, failure reason. Actions: print checklist, dispatch, track, resolve exception. Rules: high-value bullion insured; declared value matches invoice; COD disabled unless approved.
12. **Corporate split delivery (G):** recipient list, delivery address/PIN, package allocation, dispatch group, tracking, delivery outcome. Rule: validate recipient addresses before dispatch.
DONE WHEN: each blocking rule in item 6 stops processing with a reason, high-value refund and adjustment need a second approver, store orders and admin stay in sync, no console errors.

## PHASE 9: Admin compliance, invoices and tax, CRM and support
Build:
1. **Compliance record (G):** BIS registration reference, hallmark status, HUID, purity grade, assaying centre, certificate number/file, GSTIN, PAN/KYC flag, notes. Actions: upload, verify, approve, renew/expire, publish customer copy. Rules: authorized roles only; require applicable hallmark/HUID and certificates.
2. **Compliance review queue (G):** record/SKU, missing data, risk level, reviewer, decision, timestamp, audit history.
3. **Invoice generation (G):** invoice number, order, customer/GSTIN, addresses, HSN, taxable value, tax rates/amounts, discount, shipping, insurance, total, payment reference. Actions: generate PDF, store copy, email, retry, download. Rules: only after verified payment or approved offline payment; totals reconcile to paid amount.
4. **Credit/debit notes and e-invoice (G):** original invoice, adjustment reason, taxable adjustment, tax adjustment, IRN/QR where applicable, status. Rules: invoice is immutable; corrections through credit/debit note; e-invoice only where legally applicable.
5. **Customer list and profile (G):** customer ID, name, mobile/email, addresses, GSTIN/PAN, KYC, orders, lifetime value, preferences, consent, tickets, risk flags. Actions: search, review duplicate, view timeline, segment, update permitted fields. Rules: validate contacts/IDs; flag duplicates; mask sensitive data by role.
6. **Customer consent and segmentation (G):** channel consent, purpose, timestamp, source, segment criteria, membership status. Rules: marketing only to opted-in customers; honour opt-out.
7. **Support ticket queue (G):** ticket ID, order ID, issue, priority, SLA, assignee, message, attachments, resolution, refund/replacement action, status. Actions: assign, request evidence, resolve, escalate, close. Rules: verify identity/order ownership; flag SLA breach.
DONE WHEN: an invoice can be issued only after verified payment, a credit note corrects an invoice without changing the PDF, opted-out customers are excluded from marketing events, SLA breaches are flagged, no console errors.

## PHASE 10: Admin corporate gifting, personalization production, offers
Build:
1. **Enquiry and qualification (A):** company, contact, source, occasion, budget, quantity, product preferences, timeline, owner, lead stage. Actions: qualify, assign, schedule consultation.
2. **Quote builder (A):** quote ID, products/kits, quantities, unit prices, customization, packaging, shipping, tax, total, margin, expiry, payment terms. Actions: generate, revise, submit approval, send quote. Rule: margin threshold and credit terms require approval (goes to the approval queue).
3. **Branding and personalization approval (A):** logo file, artwork proof, engraving text, packaging option, approver, revision, approval status. Actions: preview, approve, request revision.
4. **Recipient import and dispatch (A):** recipient file, name, contact, address/PIN, item, gift message, shipment group, delivery date. Actions: upload, validate, split shipments, track. Rules: validate format and addresses; preserve recipient privacy.
5. **Campaign completion report (A):** corporate account, campaign/occasion, quantity ordered/delivered, on-time delivery, exceptions, spend, quote value, ROI inputs, renewal date.
6. **Personalization production queue (A):** order/SKU, engraving text, recipient, packaging, artwork proof, stage, due date, lead time, QA status, exception. Actions: approve proof, start production, QA, pack, dispatch. Rules: **QA failure blocks dispatch**; track delay and packaging shortage.
7. **Offer builder (A):** name, type, discount type/value, minimum order, category/SKU, segment, coupon, usage limit, dates, combinability, approval status. Actions: create, preview, approve, schedule, pause, report. Rules: unique code; valid dates; margin guardrails for bullion; enforce per-customer usage. **Offer performance (A):** impressions, redemptions, orders, revenue, discount cost, margin impact, segment, channel. (Ignore the empty "Subtopic 3" node.)
DONE WHEN: a storefront enquiry flows through qualification, quote, approval, branding proof, recipient import and split dispatch; QA failure blocks dispatch; an offer created here works as a coupon in the store and respects its usage limits; no console errors.

## PHASE 11: Admin reports, audit, roles, approvals
Build:
1. **Report builder (A):** report name/type, date range, filters, export format, generated by/time. Reports: sales/margin, orders/payments/refunds, inventory, rate history, compliance, customer, campaign ROI, corporate gifting. Actions: generate, preview, export, save/schedule. Rules: date range required; role-based access; mask sensitive data; audit exports.
2. **Audit log viewer (A):** actor, action, entity, before/after values, timestamp, reason, approver, source/IP where permitted. Rule: logs are immutable and access-controlled.
3. **Role editor (A):** role name, modules, view/create/edit/delete/approve rights, approval limit, status.
4. **Admin user management (A):** name, email, mobile, role, status, last login, MFA, activity log. Actions: invite, assign role, deactivate, review activity.
5. **Approval queue (A):** types price override, high-value refund, stock adjustment, compliance edit, low-margin quote, credit terms; fields request, requester, amount/value, reason, approver, decision, timestamp. Rules: maker-checker; inactive users blocked; super-admin access restricted.
DONE WHEN: every approval type from earlier phases appears here and can be approved by a different user only, deactivated users cannot log in, exports are audited, no console errors.

## PHASE 12: Integrations and system health, communication framework, governance
Build:
1. **Integrations and system health (G):** one page with these cards (SIMULATED):
   - Payment gateway (A): capabilities UPI, cards, net banking, wallets, EMI/BNPL if enabled, refunds, settlements, payment links, webhooks, reconciliation; fields provider, environment, credentials reference, webhook health, last sync, retry queue.
   - Metal-rate provider (A): gold/silver rate, purity mapping, refresh, fallback, abnormal-movement alert, rate logs.
   - Shipping and insurance (A): PIN serviceability, courier allocation, tracking, proof of delivery, declared value, insurance confirmation.
   - GST, accounting and e-invoice (A): invoice PDF, accounting export, credit/debit notes, IRP/IRN and QR where applicable.
   - KYC, identity and risk (A): PAN, bank verification, KYC/AML, device/IP risk, velocity, restricted-party screening.
   - Messaging, CRM and analytics (A): email, SMS, WhatsApp, push, OTP, delivery logs, CRM, ad attribution, analytics.
   - Integration monitoring (A): provider, environment, status, last successful sync, error, retry count, fallback, alert owner. Actions: test, retry, disable, switch fallback, inspect logs.
2. **Shared data and pricing rules (G):** a read-only "Ledgers" view showing the Product master (unique SKU, attributes, HSN/GST, weight/purity, media, SEO, certificates, visibility), Pricing ledger and Order ledger from Phase 1.
3. **Communication event framework (A):** channels email, SMS, WhatsApp, push, in-app; template fields (event, template/version, language, tokens, consent, priority/fallback, retry, delivery status, failure reason); transactional events (OTP, account, payment, invoice, order, shipment, support, return, refund) fired by real actions in the prototype; marketing events (cart recovery, price alert, festival, birthday/anniversary, loyalty, win-back) shown as configurable templates only where they do not depend on grey features. Rules: consent/opt-out for marketing; log timestamp, channel, template version, retries and delivery.
4. **Legal and release gates (G):** a checklist page with: "Confirm Indian GST/tax treatment and legal wording with qualified counsel before launch" and the **release tests** as runnable rows with pass/fail: pricing/stale feed/lock expiry; catalog/certificates/tax; payment webhook/refund reconciliation; shipping/insurance/split delivery; invoice archive/email retry; consent/frequency caps. (Leave out every Gold Vault gate and the Gold Vault test.)
DONE WHEN: every transactional event creates a log row with channel, template and delivery status, release test rows run and show pass/fail, no console errors.

## PHASE 13: Final polish, verification and coverage report
Do NOT add features. Fix and verify only.
1. Empty, loading and error states everywhere. Check 375px and 1440px on Home, Listing, Product, Cart, Checkout, Account, Corporate enquiry, Admin Dashboard, Admin Orders. No horizontal page scroll.
2. Confirm **no dark colours** and that **no grey-scope feature was added or changed**.
3. `npm run build` with zero errors; zero console errors on every route.
4. Run these end-to-end flows and fix whatever breaks:
   - **Physical purchase:** browse, listing, product, PIN check, cart, lock price, checkout (with KYC above the threshold), payment (all outcomes including duplicate webhook), confirmation, invoice, admin verify, pick/pack/insure, dispatch, tracking, delivery.
   - **Expired lock:** lock expires, payment is blocked, reprice and reconfirm.
   - **Corporate gifting:** enquiry, qualify, quote with margin approval, branding proof, recipient import, split dispatch, campaign report.
   - **Personalization:** customize, accept terms, pay, production queue, QA fail blocks dispatch, fix, dispatch.
   - **Returns:** ticket, verify, policy check, approve, refund (high-value needs maker-checker), credit note, notify customer, close.
   - **Admin governance:** price override and bulk upload need approval from a different user, stock adjustment maker-checker, audit shows every change.
   - **Rate feed:** provider fails, fallback works, stale feed pauses quotes and shows amber, abnormal movement alert.
5. Produce `docs/COVERAGE-V2.md`: a table of every component in Phases 2 to 12 with status (Done / Partial / Missing), route where it can be seen, and any assumption. List honestly anything missing.
6. Final report: how to run, routes, assumptions (KYC threshold, OTP behaviour, language selector), known issues, results of every check.
DONE WHEN: every check passes or is listed honestly as a known issue.

---

When you have read everything, reply only: **"Ready. Say NEXT to start Phase 0."**
</USER_REQUEST>
<ADDITIONAL_METADATA>
The current local time is: 2026-10-26T15:13:37+05:30.

The user's current state is as follows:
Active Document: d:\Ecomm\README.md (LANGUAGE_MARKDOWN)
Cursor is on line: 1
Other open documents:
- d:\Ecomm\README.md (LANGUAGE_MARKDOWN)
- d:\Ecomm\backend\src\controllers\ratesController.ts (LANGUAGE_TYPESCRIPT)
</ADDITIONAL_METADATA>