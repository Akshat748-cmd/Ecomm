# Precious Commerce Platform — Architecture Decision Record (ADR)

**Document**: `docs/ARCHITECTURE.md`  
**Status**: APPROVED & ADOPTED  
**Author**: Engineering Team  
**Date**: October 2026  
**Context**: Bullion and Gifting Ecommerce Platform Specification (Latest Mind Map)

---

## 1. Context & Business Domain

The Precious Commerce Platform operates in a high-value, heavily regulated ecommerce domain covering:
1. **Investment-Grade Bullion**: 24K 999.9 & 22K 916 gold coins/bars, 999 fine silver with real-time spot pricing, 10-minute rate locks, and volatile inventory.
2. **Fine Jewellery & Consecrated Artefacts**: Natural certified gemstones (Burmese Rubies, Colombian Emeralds), consecrated Nepali Rudraksha, and festive gifting sets.
3. **Statutory Indian Regulatory Environment**: 
   - **GST & Legal Metrology**: 3% GST (HSN 7108 for gold, 7106 for silver, 7103 for gemstones), mandatory BIS Hallmarking and HUID tracking.
   - **PMLA (Prevention of Money Laundering Act)**: Mandatory collection and verification of PAN for transactions exceeding ₹200,000 (₹2 Lakhs).
   - **Cash-on-Delivery (COD) Prohibition**: Prohibited for high-value precious consignments.
   - **Digital Personal Data Protection (DPDP) Act 2023**: Explicit consent capture and audited communication preferences.
   - **Armoured Logistics**: Custody-tracked transit with carriers such as Sequel Secure Logistics and BVC Logistics; mandatory tax invoice gating before dispatch.

---

## 2. Core Architectural Principles & Production-Critical Rules

1. **Zero Client Trust**: Client-side prices, stock levels, order totals, and role checks are treated strictly as presentation conveniences. All business math, stock reservations, permissions, and payment statuses are validated and authoritatively decided on the server.
2. **ACID Transactional Integrity**: Stock reservation and order transitions utilize database transactions with row-level locking (`SELECT ... FOR UPDATE`) to eliminate overselling and race conditions.
3. **Server-Enforced Rate Locks**: 10-minute rate quotes are generated and stamped by the backend pricing engine. Checkout requests with expired quotes (`expiresAt <= NOW()`) are rejected with an explicit HTTP 409 Conflict, requiring re-pricing.
4. **Idempotent Financial Operations**: Payment gateway webhooks require HMAC signature validation and persist idempotency records to prevent replay attacks and duplicate order status advancement.
5. **Maker-Checker Segregation**: High-risk operations (manual spot rate overrides, large inventory write-offs, sensitive refund authorizations) enforce server-side dual authorization (the initiator cannot approve their own action).
6. **Immutable Audit Ledger**: All administrative actions produce append-only audit records storing before/after state diffs, timestamps, actor IDs, and IP addresses.

---

## 3. Technology Stack Decision

```
┌─────────────────────────────────────────────────────────────┐
│             Storefront & Admin Web Application              │
│       React 19 + TypeScript + Vite + Tailwind CSS v4       │
│             React Router v7 + Zustand State Cache           │
└──────────────────────────────┬──────────────────────────────┘
                               │ HTTP / JSON REST APIs
                               │ Proxy: /api -> :3001
┌──────────────────────────────▼──────────────────────────────┐
│                    Node.js / Express API                    │
│      TypeScript + Zod Validation + JWT Auth + RBAC          │
├─────────────────────────────────────────────────────────────┤
│  Controllers & Business Services:                           │
│  - Pricing & Rate Engine      - Quote & Lock Service        │
│  - Inventory & Reservations   - Order & Checkout Engine     │
│  - Payment Webhook & Idempotency - Admin & Maker-Checker    │
│  - Logistics & PIN Validator  - Corporate Gifting Workflow  │
└──────────────────────────────┬──────────────────────────────┘
                               │ PostgreSQL Driver / Pool
┌──────────────────────────────▼──────────────────────────────┐
│               PostgreSQL Relational Database                │
│    - ACID Transactions & Row-Level Locking                  │
│    - Products, Batches & Serialized Inventory               │
│    - Orders, Invoices & Payment Webhook Idempotency         │
│    - Append-Only Audit Logs & Compliance Ledger             │
│    (With embedded SQLite / memory driver for dev & CI tests)│
└─────────────────────────────────────────────────────────────┘
```

### 3.1 Backend Service: Node.js + Express + TypeScript
- **Rationale**:
  - **Single Language Ecosystem**: Sharing types (`Product`, `Quote`, `PricingConfig`, `Order`, `calculatePrice`) across client and server eliminates contract drift.
  - **Maintainability & Speed**: Clear separation into modular routes, controllers, middleware, and domain services.
  - **No Unnecessary Framework Churn**: Preserves the approved React + Vite frontend completely, avoiding full-stack rewrite overhead.
  - **Dev Proxy Integration**: In local development, Vite proxies `/api` to the Express backend port, eliminating CORS complications.

### 3.2 Data Persistence: PostgreSQL Relational Database
- **Rationale**:
  - **Strict Relational Integrity**: Essential for financial ledgers, order lines, stock balances, and serial numbers (HUID, certificates).
  - **Concurrency Controls**: Supports `SELECT FOR UPDATE` and transactional isolation levels to ensure safe stock decrement during high-concurrency bullion drops.
  - **JSONB Flexibility**: Allows storing category-adaptive attributes (Gemstone 4Cs, Rudraksha Mukhi count) alongside strict relational columns.
  - **Developer Experience & Test Portability**: Schema is defined with SQL DDL migrations. The database access layer abstracts connections to support production PostgreSQL (`pg` connection pool) while enabling fast in-memory or SQLite execution during automated CI tests.

---

## 4. Database Schema Design

### Core Tables:

1. **`users`**:
   - `id` (UUID PK), `email`, `password_hash`, `role` (`Super Admin`, `Pricing`, `Catalogue`, `Warehouse`, `Support`, `Finance`, `Auditor`), `name`, `is_active`, `mfa_enabled`, `created_at`, `updated_at`.
2. **`customers`**:
   - `id` (UUID PK), `name`, `email`, `phone`, `pan_number`, `is_verified`, `marketing_consent`, `sms_consent`, `whatsapp_consent`, `fraud_flag`, `created_at`.
3. **`customer_addresses`**:
   - `id` (UUID PK), `customer_id` (FK), `type` (`Home` | `Office`), `street`, `city`, `state`, `pincode`, `is_default`.
4. **`products`**:
   - `id` (UUID PK), `slug` (UNIQUE), `sku` (UNIQUE), `name`, `category`, `type` (`rateLinked` | `fixed`), `net_weight_g`, `gross_weight_g`, `purity`, `metal`, `stock_on_hand`, `stock_reserved`, `mrp`, `making_percent`, `packaging_cost`, `insurance_cost`, `status` (`Active` | `Draft` | `Delisted`), `attributes` (JSONB), `created_at`, `updated_at`.
5. **`bullion_rates`**:
   - `id` (UUID PK), `gold_24k`, `gold_22k`, `silver_999`, `source`, `status`, `timestamp`.
6. **`quotes`**:
   - `id` (UUID PK), `product_id` (FK), `customer_id`, `quantity`, `locked_rate_per_g`, `price_breakdown` (JSONB), `status` (`Active` | `Accepted` | `Expired` | `Cancelled`), `created_at`, `expires_at`.
7. **`orders`**:
   - `id` (UUID PK), `order_number` (UNIQUE), `customer_id` (FK), `customer_name`, `customer_email`, `customer_phone`, `shipping_address` (JSONB), `subtotal`, `gst_total`, `total_amount`, `pan_number`, `payment_status` (`Pending` | `Success` | `Failed` | `Timeout`), `payment_method`, `payment_transaction_id`, `status` (`Placed` -> `Delivered`), `courier_name`, `tracking_number`, `erp_invoice_number`, `erp_invoice_url`, `created_at`, `updated_at`.
8. **`order_items`**:
   - `id` (UUID PK), `order_id` (FK), `product_id` (FK), `sku`, `name`, `quantity`, `unit_price`, `total_price`, `rate_snapshot`, `gst_amount`, `personalization` (JSONB).
9. **`payment_webhooks`**:
   - `id` (UUID PK), `idempotency_key` (UNIQUE), `gateway`, `transaction_id`, `event_type`, `payload` (JSONB), `processed_at`.
10. **`maker_checker_requests`**:
    - `id` (UUID PK), `module`, `action_type`, `initiator_id` (FK), `approver_id` (FK), `status` (`Pending` | `Approved` | `Rejected`), `payload` (JSONB), `justification`, `created_at`, `resolved_at`.
11. **`inventory_logs`**:
    - `id` (UUID PK), `product_id` (FK), `action` (`Receipt` | `Reservation Release` | `Adjustment` | `Reconciliation`), `delta`, `on_hand_after`, `reserved_after`, `actor_id`, `notes`, `created_at`.
12. **`audit_logs`**:
    - `id` (UUID PK), `actor`, `module`, `action`, `before_state` (JSONB), `after_state` (JSONB), `ip_address`, `timestamp`.
13. **`corporate_enquiries`**:
    - `id` (UUID PK), `company_name`, `contact_name`, `email`, `phone`, `occasion`, `budget_per_recipient`, `recipient_count`, `customization_notes`, `status`, `created_at`.

---

## 5. Security Architecture

1. **Authentication**:
   - JSON Web Tokens (JWT) signed with high-entropy secret (`HS256` or `RS256`).
   - Tokens contain claims: `sub` (user ID), `role`, `email`, `iat`, `exp` (15-minute standard expiration).
   - Inactivity timeout: After 15 minutes of inactivity, token refresh requires credentials.
2. **Server-Side Role-Based Access Control (RBAC)**:
   - Evaluated by `authorizeRole([...allowedRoles])` middleware on every administrative endpoint.
   - `Super Admin`: Full system access.
   - `Pricing`: Live rate management and formula editing.
   - `Catalogue`: Product creation and media publishing.
   - `Warehouse`: Inward goods receipt, inventory adjustments, and dispatch fulfillment.
   - `Support`: Customer records, tickets, and order tracking.
   - `Finance`: Settlements, tax invoices, and accounting exports.
   - `Auditor`: Strict read-only access across all modules.
3. **Maker-Checker Segregation**:
   - A staff member with the `Pricing` role who proposes a spot rate override cannot approve their own override. A secondary officer must approve it with password re-authentication.

---

## 6. Integration Boundaries & Resilience

1. **Bullion Market Feeds**: Dual-provider architecture (Primary: MCX India, Backup: LBMA London via Refinitiv). If both fail, rates are marked stale after 20 seconds, disabling checkout quote locks.
2. **Payment Gateways**: Sandbox integration supporting UPI, NetBanking, and Cards. Webhook processing verifies HMAC signatures and enforces unique idempotency keys.
3. **Logistics & Armoured Couriers**: Serviceability checked via PIN code rules (e.g. Sequel/BVC coverage). Dispatch is gated by ERP tax invoice generation.
4. **Gold Vault Custody Partner**: Gated informational/MVP boundary; digital buy/sell operations require independent audit certificates and 100% physical vault backing before activation.
