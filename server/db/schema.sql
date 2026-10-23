-- Precious Commerce Platform - PostgreSQL Relational Database Schema
-- Version: 1.0.0

-- Enable UUID extension if available
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Users / Staff & RBAC
CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(64) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL CHECK (role IN ('Super Admin', 'Pricing', 'Catalogue', 'Warehouse', 'Support', 'Finance', 'Auditor')),
    is_active BOOLEAN DEFAULT TRUE,
    mfa_enabled BOOLEAN DEFAULT TRUE,
    mfa_secret VARCHAR(64),
    last_active TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Customers & DPDP Consents
CREATE TABLE IF NOT EXISTS customers (
    id VARCHAR(64) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(50) NOT NULL,
    pan_number VARCHAR(20),
    is_verified BOOLEAN DEFAULT FALSE,
    total_orders INTEGER DEFAULT 0,
    total_spent NUMERIC(14, 2) DEFAULT 0.00,
    marketing_consent BOOLEAN DEFAULT FALSE,
    sms_alerts_consent BOOLEAN DEFAULT TRUE,
    whatsapp_updates_consent BOOLEAN DEFAULT TRUE,
    fraud_flag BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. Customer Address Book
CREATE TABLE IF NOT EXISTS customer_addresses (
    id VARCHAR(64) PRIMARY KEY,
    customer_id VARCHAR(64) NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    type VARCHAR(20) DEFAULT 'Home' CHECK (type IN ('Home', 'Office')),
    street TEXT NOT NULL,
    city VARCHAR(100) NOT NULL,
    state VARCHAR(100) NOT NULL,
    pincode VARCHAR(20) NOT NULL,
    is_default BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. Product Catalog Master
CREATE TABLE IF NOT EXISTS products (
    id VARCHAR(64) PRIMARY KEY,
    slug VARCHAR(255) UNIQUE NOT NULL,
    sku VARCHAR(100) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    category VARCHAR(50) NOT NULL CHECK (category IN ('gold', 'silver', 'gemstones', 'coloured-stones', 'rudraksha', 'gifting')),
    type VARCHAR(30) NOT NULL CHECK (type IN ('rateLinked', 'fixed')),
    brand VARCHAR(100) DEFAULT 'Precious Commerce',
    description TEXT,
    image_url TEXT,
    images JSONB DEFAULT '[]'::jsonb,
    net_weight_g NUMERIC(10, 4) NOT NULL,
    gross_weight_g NUMERIC(10, 4) NOT NULL,
    purity NUMERIC(6, 4) NOT NULL,
    metal VARCHAR(50),
    stock INTEGER NOT NULL DEFAULT 0 CHECK (stock >= 0),
    reserved INTEGER NOT NULL DEFAULT 0 CHECK (reserved >= 0),
    damaged INTEGER NOT NULL DEFAULT 0,
    quarantined INTEGER NOT NULL DEFAULT 0,
    reorder_threshold INTEGER DEFAULT 5,
    lot_batch_serial VARCHAR(100),
    mrp NUMERIC(12, 2) NOT NULL,
    making_percent NUMERIC(6, 4) NOT NULL DEFAULT 0.08,
    fixed_price NUMERIC(12, 2),
    packaging_cost NUMERIC(10, 2) DEFAULT 250.00,
    insurance_cost NUMERIC(10, 2) DEFAULT 450.00,
    status VARCHAR(30) DEFAULT 'Active' CHECK (status IN ('Active', 'Draft', 'Delisted')),
    variant VARCHAR(100),
    barcode VARCHAR(100),
    launch_scheduled_at TIMESTAMP WITH TIME ZONE,
    is_delisted BOOLEAN DEFAULT FALSE,
    certificate JSONB DEFAULT '{}'::jsonb,
    attributes JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 5. Bullion Spot Rates
CREATE TABLE IF NOT EXISTS bullion_rates (
    id VARCHAR(64) PRIMARY KEY,
    gold_24k NUMERIC(10, 2) NOT NULL,
    gold_22k NUMERIC(10, 2) NOT NULL,
    silver_999 NUMERIC(10, 2) NOT NULL,
    source VARCHAR(100) DEFAULT 'MCX India (Primary)',
    status VARCHAR(50) DEFAULT 'ok' CHECK (status IN ('ok', 'primaryFailed', 'bothDown')),
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 6. Rate Locks & Quotes
CREATE TABLE IF NOT EXISTS quotes (
    id VARCHAR(64) PRIMARY KEY,
    customer_id VARCHAR(64),
    product_id VARCHAR(64) NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    product_name VARCHAR(255) NOT NULL,
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    rate_per_gram_snapshot NUMERIC(10, 2) NOT NULL,
    metal_purity VARCHAR(50) NOT NULL,
    price_breakdown JSONB NOT NULL,
    status VARCHAR(30) DEFAULT 'Active' CHECK (status IN ('Active', 'Accepted', 'Expired', 'Cancelled')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL
);

-- 7. Orders Master
CREATE TABLE IF NOT EXISTS orders (
    id VARCHAR(64) PRIMARY KEY,
    order_number VARCHAR(100) UNIQUE NOT NULL,
    customer_id VARCHAR(64) REFERENCES customers(id),
    customer_name VARCHAR(255) NOT NULL,
    customer_email VARCHAR(255) NOT NULL,
    customer_phone VARCHAR(50) NOT NULL,
    shipping_address JSONB NOT NULL,
    subtotal NUMERIC(14, 2) NOT NULL,
    gst_total NUMERIC(14, 2) NOT NULL,
    total_amount NUMERIC(14, 2) NOT NULL,
    pan_number VARCHAR(20),
    payment_status VARCHAR(30) DEFAULT 'Pending' CHECK (payment_status IN ('Pending', 'Success', 'Failed', 'Timeout')),
    payment_method VARCHAR(100) NOT NULL,
    payment_transaction_id VARCHAR(255),
    status VARCHAR(50) DEFAULT 'Placed' CHECK (status IN ('Placed', 'Payment confirmed', 'Picked', 'Packed', 'Quality checked', 'Invoice issued', 'Dispatched', 'Delivered', 'Cancelled', 'Return requested', 'Returned')),
    courier_name VARCHAR(100),
    tracking_number VARCHAR(100),
    erp_invoice_number VARCHAR(100),
    erp_invoice_attached BOOLEAN DEFAULT FALSE,
    erp_invoice_url TEXT,
    return_request JSONB,
    timeline JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 8. Order Items
CREATE TABLE IF NOT EXISTS order_items (
    id VARCHAR(64) PRIMARY KEY,
    order_id VARCHAR(64) NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    product_id VARCHAR(64) NOT NULL REFERENCES products(id),
    sku VARCHAR(100) NOT NULL,
    name VARCHAR(255) NOT NULL,
    category VARCHAR(50) NOT NULL,
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    unit_price NUMERIC(12, 2) NOT NULL,
    total_price NUMERIC(14, 2) NOT NULL,
    rate_per_gram_snapshot NUMERIC(10, 2),
    making_charges NUMERIC(12, 2),
    gst_amount NUMERIC(12, 2) NOT NULL,
    personalization JSONB
);

-- 9. Payment Webhooks & Idempotency Ledger
CREATE TABLE IF NOT EXISTS payment_webhooks (
    id VARCHAR(64) PRIMARY KEY,
    idempotency_key VARCHAR(255) UNIQUE NOT NULL,
    gateway VARCHAR(100) NOT NULL,
    transaction_id VARCHAR(255) NOT NULL,
    event_type VARCHAR(100) NOT NULL,
    payload JSONB NOT NULL,
    processed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 10. Maker-Checker Segregation Queue
CREATE TABLE IF NOT EXISTS maker_checker_requests (
    id VARCHAR(64) PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    module VARCHAR(100) NOT NULL,
    action_type VARCHAR(100) NOT NULL,
    initiator VARCHAR(255) NOT NULL,
    approver VARCHAR(255),
    status VARCHAR(30) DEFAULT 'Pending' CHECK (status IN ('Pending', 'Approved', 'Rejected')),
    details TEXT,
    payload JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    resolved_at TIMESTAMP WITH TIME ZONE
);

-- 11. Inventory Movement Audit Ledger
CREATE TABLE IF NOT EXISTS inventory_logs (
    id VARCHAR(64) PRIMARY KEY,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    product_id VARCHAR(64) NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    product_name VARCHAR(255) NOT NULL,
    sku VARCHAR(100) NOT NULL,
    action VARCHAR(50) NOT NULL CHECK (action IN ('Receipt', 'Reservation Release', 'Adjustment', 'Reconciliation')),
    actor VARCHAR(255) NOT NULL,
    delta INTEGER NOT NULL,
    on_hand_after INTEGER NOT NULL,
    reserved_after INTEGER NOT NULL,
    available_after INTEGER NOT NULL,
    notes TEXT,
    lot_batch VARCHAR(100)
);

-- 12. Immutable System Audit Log
CREATE TABLE IF NOT EXISTS audit_logs (
    id VARCHAR(64) PRIMARY KEY,
    actor VARCHAR(255) NOT NULL,
    action VARCHAR(255) NOT NULL,
    module VARCHAR(100) NOT NULL,
    before_state TEXT,
    after_state TEXT,
    ip_address VARCHAR(100),
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 13. Corporate Gifting Enquiries & Quotes
CREATE TABLE IF NOT EXISTS corporate_enquiries (
    id VARCHAR(64) PRIMARY KEY,
    company_name VARCHAR(255) NOT NULL,
    contact_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(50) NOT NULL,
    gstin VARCHAR(50),
    occasion VARCHAR(100) NOT NULL,
    budget_per_recipient NUMERIC(12, 2) NOT NULL,
    recipient_count INTEGER NOT NULL,
    product_preferences TEXT,
    delivery_schedule VARCHAR(100),
    customization_notes TEXT,
    status VARCHAR(50) DEFAULT 'Received' CHECK (status IN ('Received', 'Under Review', 'Quote Issued', 'Approved', 'Fulfillment', 'Completed')),
    assigned_officer VARCHAR(255),
    quote_data JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_products_sku ON products(sku);
CREATE INDEX IF NOT EXISTS idx_orders_customer ON orders(customer_id);
CREATE INDEX IF NOT EXISTS idx_orders_order_number ON orders(order_number);
CREATE INDEX IF NOT EXISTS idx_quotes_expires_at ON quotes(expires_at);
CREATE INDEX IF NOT EXISTS idx_inventory_logs_product ON inventory_logs(product_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_timestamp ON audit_logs(timestamp);
