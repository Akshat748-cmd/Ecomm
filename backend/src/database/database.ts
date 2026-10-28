import { MOCK_PRODUCTS } from './mockProducts';
import {
  INITIAL_RATES,
  INITIAL_PRICING_CONFIG,
  MOCK_ORDERS,
  MOCK_CUSTOMERS,
  MOCK_ALERTS,
  MOCK_AUDIT_LOGS,
  MOCK_SUPPLIERS,
  MOCK_COURIERS,
  MOCK_COMPLIANCE_CHECKLIST,
  MOCK_DOCUMENT_VERSIONS,
  MOCK_CERTIFICATES,
} from './mockData';
import type {
  Product,
  Order,
  Customer,
  Quote,
  LiveRates,
  PricingConfig,
  AuditRow,
  MakerCheckerItem,
  ComplianceChecklistItem,
  DocumentVersionRecord,
  SupplierRecord,
  CourierPartner,
  InventoryLog,
  OrderStatus,
  AdminRole,
} from '../types';
import bcrypt from 'bcryptjs';
import { config } from '../config';

export interface AdminUserRecord {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  role: AdminRole;
  isActive: boolean;
  isLocked?: boolean;
  failedLoginAttempts?: number;
  mfaEnabled: boolean;
  mfaSecret: string;
  lastActive: string;
}

export interface PaymentWebhookRecord {
  id: string;
  idempotencyKey: string;
  gateway: string;
  transactionId: string;
  eventType: string;
  payload: any;
  processedAt: string;
}

export interface CorporateEnquiryRecord {
  id: string;
  companyName: string;
  contactName: string;
  email: string;
  phone: string;
  gstin?: string;
  occasion: string;
  budgetPerRecipient: number;
  recipientCount: number;
  productPreferences?: string;
  deliverySchedule?: string;
  customizationNotes?: string;
  status: 'Received' | 'Under Review' | 'Quote Issued' | 'Approved' | 'Fulfillment' | 'Completed';
  assignedOfficer?: string;
  quoteData?: any;
  createdAt: string;
  updatedAt: string;
}

export class DatabaseService {
  private products: Map<string, Product> = new Map();
  private orders: Map<string, Order> = new Map();
  private customers: Map<string, Customer> = new Map();
  private quotes: Map<string, Quote> = new Map();
  private rates: LiveRates = { ...INITIAL_RATES };
  private providerState: 'ok' | 'primaryFailed' | 'bothDown' = 'ok';
  private pricingConfig: PricingConfig = { ...INITIAL_PRICING_CONFIG };
  private auditLogs: AuditRow[] = [];
  private makerCheckerQueue: MakerCheckerItem[] = [];
  private inventoryLogs: InventoryLog[] = [];
  private paymentWebhooks: Map<string, PaymentWebhookRecord> = new Map();
  private corporateEnquiries: Map<string, CorporateEnquiryRecord> = new Map();
  private complianceChecklist: ComplianceChecklistItem[] = [];
  private documentVersions: DocumentVersionRecord[] = [];
  private suppliers: SupplierRecord[] = [];
  private couriers: CourierPartner[] = [];
  private users: Map<string, AdminUserRecord> = new Map();
  private certificates: Record<string, any> = { ...MOCK_CERTIFICATES };

  // Mutex locks per product for strict concurrency control during reservation
  private productLocks: Map<string, Promise<void>> = new Map();

  constructor() {
    this.seed();
  }

  private async acquireProductLock(productId: string): Promise<() => void> {
    while (this.productLocks.has(productId)) {
      await this.productLocks.get(productId);
    }
    let releaseLock: () => void;
    const lockPromise = new Promise<void>((resolve) => {
      releaseLock = resolve;
    });
    this.productLocks.set(productId, lockPromise);
    return () => {
      this.productLocks.delete(productId);
      releaseLock();
    };
  }

  private seed() {
    // 1. Seed Products
    MOCK_PRODUCTS.forEach((p) => this.products.set(p.id, { ...p }));

    // 2. Seed Orders
    MOCK_ORDERS.forEach((o) => this.orders.set(o.id, { ...o }));

    // 3. Seed Customers
    MOCK_CUSTOMERS.forEach((c) => this.customers.set(c.id, { ...c }));

    // 4. Seed Audit
    this.auditLogs = [...MOCK_AUDIT_LOGS];

    // 5. Seed Compliance
    this.complianceChecklist = [...MOCK_COMPLIANCE_CHECKLIST];
    this.documentVersions = [...MOCK_DOCUMENT_VERSIONS];
    this.suppliers = [...MOCK_SUPPLIERS];
    this.couriers = [...MOCK_COURIERS];

    // 6. Seed Admin Users (password comes from env)
    const seedPassword = process.env.SEED_USER_PASSWORD || process.env.SEED_ADMIN_PASSWORD || config.seedUserPassword || 'VaultPass@2026';
    const defaultPasswordHash = bcrypt.hashSync(seedPassword, 10);
    const seedStaff: AdminUserRecord[] = [
      {
        id: 'usr-1',
        name: 'Vikram Sharma',
        email: 'vikram.sharma@preciouscommerce.internal',
        passwordHash: defaultPasswordHash,
        role: 'Super Admin',
        isActive: true,
        isLocked: false,
        failedLoginAttempts: 0,
        mfaEnabled: true,
        mfaSecret: '748291',
        lastActive: new Date().toISOString(),
      },
      {
        id: 'usr-2',
        name: 'Ananya Deshmukh',
        email: 'ananya.deshmukh@preciouscommerce.internal',
        passwordHash: defaultPasswordHash,
        role: 'Pricing',
        isActive: true,
        isLocked: false,
        failedLoginAttempts: 0,
        mfaEnabled: true,
        mfaSecret: '748291',
        lastActive: new Date().toISOString(),
      },
      {
        id: 'usr-3',
        name: 'Rajesh Mehra',
        email: 'rajesh.mehra@preciouscommerce.internal',
        passwordHash: defaultPasswordHash,
        role: 'Warehouse',
        isActive: true,
        isLocked: false,
        failedLoginAttempts: 0,
        mfaEnabled: true,
        mfaSecret: '748291',
        lastActive: new Date().toISOString(),
      },
      {
        id: 'usr-4',
        name: 'Sunita Rao',
        email: 'sunita.rao@preciouscommerce.internal',
        passwordHash: defaultPasswordHash,
        role: 'Auditor',
        isActive: true,
        isLocked: false,
        failedLoginAttempts: 0,
        mfaEnabled: true,
        mfaSecret: '748291',
        lastActive: new Date().toISOString(),
      },
    ];
    seedStaff.forEach((u) => this.users.set(u.email.toLowerCase(), u));

    // 7. Seed Initial Corporate Enquiries
    const seedEnquiries: CorporateEnquiryRecord[] = [
      {
        id: 'CORP-ENQ-2026-101',
        companyName: 'Tata Consultancy Services',
        contactName: 'Rohit Verma',
        email: 'rohit.verma@tcs.com',
        phone: '+91 98200 11223',
        gstin: '27AAACT2727Q1ZW',
        occasion: 'Diwali Executive Memento & Annual Leadership Gala',
        budgetPerRecipient: 35000,
        recipientCount: 150,
        productPreferences: 'Custom 10g 24K Gold Coin with Laser Etched Company Emblem in Velvet Box',
        deliverySchedule: '2026-10-30',
        customizationNotes: 'Dual hallmark seal, executive velvet casket, individual recipient letters.',
        status: 'Quote Issued',
        assignedOfficer: 'Vikram Sharma',
        quoteData: {
          quoteId: 'CORP-QT-2026-889',
          unitPrice: 34200,
          totalAmount: 5130000,
          taxAmount: 153900,
          grandTotal: 5283900,
          validUntil: new Date(Date.now() + 86400000 * 7).toISOString(),
        },
        createdAt: '2026-10-18T10:30:00Z',
        updatedAt: '2026-10-19T14:20:00Z',
      },
    ];
    seedEnquiries.forEach((e) => this.corporateEnquiries.set(e.id, e));
  }

  // --- PRODUCTS ---
  async getProducts(filter?: { category?: string; query?: string }): Promise<Product[]> {
    let list = Array.from(this.products.values());
    if (filter?.category && filter.category !== 'all') {
      list = list.filter((p) => p.category === filter.category);
    }
    if (filter?.query) {
      const q = filter.query.toLowerCase();
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.sku.toLowerCase().includes(q) ||
          p.brand.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q)
      );
    }
    return list;
  }

  async getProductById(id: string): Promise<Product | null> {
    return this.products.get(id) || null;
  }

  async getProductBySlug(slug: string): Promise<Product | null> {
    for (const p of this.products.values()) {
      if (p.slug === slug) return p;
    }
    return null;
  }

  async createProduct(product: Product): Promise<Product> {
    this.products.set(product.id, { ...product });
    return product;
  }

  async updateProduct(id: string, updates: Partial<Product>): Promise<Product | null> {
    const existing = this.products.get(id);
    if (!existing) return null;
    const updated = { ...existing, ...updates, updatedAt: new Date().toISOString() };
    this.products.set(id, updated);
    return updated;
  }

  // --- ATOMIC STOCK RESERVATION (CONCURRENCY SAFE) ---
  async reserveStock(productId: string, quantity: number, actor: string = 'System (Checkout)'): Promise<boolean> {
    const unlock = await this.acquireProductLock(productId);
    try {
      const product = this.products.get(productId);
      if (!product) throw new Error(`Product ${productId} not found`);

      const available = product.stock - product.reserved;
      if (available < quantity) {
        throw new Error(`Insufficient available stock for ${product.name}. Available: ${available}, Requested: ${quantity}`);
      }

      product.reserved += quantity;
      this.products.set(productId, product);

      // Log movement
      this.inventoryLogs.unshift({
        id: `LOG-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        timestamp: new Date().toISOString(),
        productId: product.id,
        productName: product.name,
        sku: product.sku,
        action: 'Adjustment',
        actor,
        delta: quantity,
        onHandAfter: product.stock,
        reservedAfter: product.reserved,
        availableAfter: product.stock - product.reserved,
        notes: `Stock reserved for checkout quote (${quantity} units)`,
      });

      return true;
    } finally {
      unlock();
    }
  }

  async releaseStock(productId: string, quantity: number, actor: string = 'System (Expiry)'): Promise<boolean> {
    const unlock = await this.acquireProductLock(productId);
    try {
      const product = this.products.get(productId);
      if (!product) return false;

      product.reserved = Math.max(0, product.reserved - quantity);
      this.products.set(productId, product);

      this.inventoryLogs.unshift({
        id: `LOG-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        timestamp: new Date().toISOString(),
        productId: product.id,
        productName: product.name,
        sku: product.sku,
        action: 'Reservation Release',
        actor,
        delta: -quantity,
        onHandAfter: product.stock,
        reservedAfter: product.reserved,
        availableAfter: product.stock - product.reserved,
        notes: `Released ${quantity} units from reserved stock`,
      });

      return true;
    } finally {
      unlock();
    }
  }

  async commitStockSale(productId: string, quantity: number, orderNumber: string): Promise<boolean> {
    const unlock = await this.acquireProductLock(productId);
    try {
      const product = this.products.get(productId);
      if (!product) return false;

      product.stock = Math.max(0, product.stock - quantity);
      product.reserved = Math.max(0, product.reserved - quantity);
      this.products.set(productId, product);

      this.inventoryLogs.unshift({
        id: `LOG-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        timestamp: new Date().toISOString(),
        productId: product.id,
        productName: product.name,
        sku: product.sku,
        action: 'Adjustment',
        actor: 'Vault Operator',
        delta: -quantity,
        onHandAfter: product.stock,
        reservedAfter: product.reserved,
        availableAfter: product.stock - product.reserved,
        notes: `Fulfilled order ${orderNumber}`,
      });

      return true;
    } finally {
      unlock();
    }
  }

  // --- RATES & PRICING ---
  async getRates(): Promise<{ rates: LiveRates; providerState: 'ok' | 'primaryFailed' | 'bothDown'; pricingConfig: PricingConfig }> {
    return {
      rates: { ...this.rates },
      providerState: this.providerState,
      pricingConfig: { ...this.pricingConfig },
    };
  }

  async updateRates(gold24k: number, silver999: number, source: string = 'Manual Override', actor: string = 'Admin'): Promise<LiveRates> {
    const oldRates = { ...this.rates };
    this.rates = {
      gold24k,
      gold22k: Math.round(gold24k * 0.9167),
      silver999,
      lastUpdated: new Date().toISOString(),
    };

    this.addAuditLog(
      actor,
      'Rates and Pricing',
      `Manual Spot Rate Override (${source})`,
      JSON.stringify(oldRates),
      JSON.stringify(this.rates)
    );

    return { ...this.rates };
  }

  async setProviderState(state: 'ok' | 'primaryFailed' | 'bothDown'): Promise<void> {
    this.providerState = state;
  }

  async updatePricingFormula(config: Partial<PricingConfig>, actor: string): Promise<PricingConfig> {
    const oldConfig = { ...this.pricingConfig };
    this.pricingConfig = {
      ...this.pricingConfig,
      ...config,
      formulaVersion: `v${(parseFloat(this.pricingConfig.formulaVersion.replace('v', '')) + 0.1).toFixed(1)}`,
    };

    this.addAuditLog(
      actor,
      'Rates and Pricing',
      `Pricing Formula Adjustment ${this.pricingConfig.formulaVersion}`,
      JSON.stringify(oldConfig),
      JSON.stringify(this.pricingConfig)
    );

    return { ...this.pricingConfig };
  }

  // --- 10-MINUTE QUOTE LOCKS ---
  async createQuote(productId: string, quantity: number, customerId?: string): Promise<Quote> {
    const product = this.products.get(productId);
    if (!product) throw new Error(`Product ${productId} not found`);

    // Reserve stock atomically
    await this.reserveStock(productId, quantity, customerId ? `Customer ${customerId}` : 'Guest Investor');

    const spotRate = product.category === 'silver' ? this.rates.silver999 : this.rates.gold24k;
    const fineWeight = product.netWeightG * product.purity;
    const metalValue = Math.round(fineWeight * spotRate);
    const making = Math.round(metalValue * (product.makingPercent || 0.08));
    const packaging = product.packagingCost || 250;
    const insurance = product.insuranceCost || 450;
    const subtotal = (metalValue + making + packaging + insurance) * quantity;
    const gst = Math.round(subtotal * 0.03);
    const total = subtotal + gst;

    const now = Date.now();
    const quote: Quote = {
      id: `QT-${now}-${Math.floor(Math.random() * 1000)}`,
      customerId,
      productId: product.id,
      productName: product.name,
      quantity,
      ratePerGramSnapshot: spotRate,
      metalPurity: product.attributes.bullion?.purity || '999.9',
      priceBreakdown: {
        metalValue: metalValue * quantity,
        making: making * quantity,
        packaging: packaging * quantity,
        insurance: insurance * quantity,
        subtotal,
        gst,
        total,
      },
      createdAt: new Date(now).toISOString(),
      expiresAt: new Date(now + 10 * 60 * 1000).toISOString(), // Exactly 10 minutes
      status: 'Active',
    };

    this.quotes.set(quote.id, quote);
    return quote;
  }

  async getQuote(id: string): Promise<Quote | null> {
    const quote = this.quotes.get(id);
    if (!quote) return null;

    // Check expiry
    if (quote.status === 'Active' && new Date(quote.expiresAt).getTime() <= Date.now()) {
      quote.status = 'Expired';
      this.quotes.set(id, quote);
      // Release reservation
      await this.releaseStock(quote.productId, quote.quantity, 'System (Quote Expiration)');
    }

    return quote;
  }

  // --- ORDERS ---
  async getOrders(): Promise<Order[]> {
    return Array.from(this.orders.values()).sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  async getOrderById(id: string): Promise<Order | null> {
    return this.orders.get(id) || null;
  }

  async createOrder(orderData: Omit<Order, 'id' | 'orderNumber' | 'createdAt' | 'updatedAt' | 'timeline'>): Promise<Order> {
    const now = new Date().toISOString();
    const orderNumber = `ORD-2026-${Math.floor(100000 + Math.random() * 900000)}`;
    const id = `ord-${Date.now()}`;

    // Verify stock availability and commit sales
    for (const item of orderData.items) {
      await this.commitStockSale(item.productId, item.quantity, orderNumber);
    }

    const order: Order = {
      ...orderData,
      id,
      orderNumber,
      timeline: [
        {
          status: 'Placed',
          timestamp: now,
          actor: 'Customer Web Checkout',
          note: 'Order confirmed and registered in vault custody system',
        },
      ],
      createdAt: now,
      updatedAt: now,
    };

    this.orders.set(id, order);

    // Update customer stats if customer exists
    if (order.customerId && this.customers.has(order.customerId)) {
      const customer = this.customers.get(order.customerId)!;
      customer.totalOrders += 1;
      customer.totalSpent += order.totalAmount;
      this.customers.set(order.customerId, customer);
    }

    this.addAuditLog(
      order.customerName,
      'Orders',
      `Order Created: ${order.orderNumber}`,
      '',
      `Total: INR ${order.totalAmount}`
    );

    return order;
  }

  async updateOrderStatus(id: string, newStatus: OrderStatus, actor: string, note?: string): Promise<Order | null> {
    const order = this.orders.get(id);
    if (!order) return null;

    // Strict Invoice-Gated Dispatch check!
    if (newStatus === 'Dispatched' && !order.erpInvoiceAttached) {
      throw new Error('Invoice-Gated Dispatch Violation: Dispatch is legally locked until ERP GST tax invoice is attached.');
    }

    const oldStatus = order.status;
    order.status = newStatus;
    order.updatedAt = new Date().toISOString();
    order.timeline.push({
      status: newStatus,
      timestamp: new Date().toISOString(),
      actor,
      note: note || `Order advanced to ${newStatus}`,
    });

    this.orders.set(id, order);

    this.addAuditLog(actor, 'Orders', `Order ${order.orderNumber} Status: ${oldStatus} -> ${newStatus}`, oldStatus, newStatus);

    return order;
  }

  async attachErpInvoice(id: string, invoiceNumber: string, invoiceUrl: string, actor: string): Promise<Order | null> {
    const order = this.orders.get(id);
    if (!order) return null;

    order.erpInvoiceNumber = invoiceNumber;
    order.erpInvoiceAttached = true;
    order.erpInvoiceUrl = invoiceUrl;
    order.updatedAt = new Date().toISOString();

    if (order.status === 'Packed' || order.status === 'Quality checked') {
      order.status = 'Invoice issued';
      order.timeline.push({
        status: 'Invoice issued',
        timestamp: new Date().toISOString(),
        actor,
        note: `ERP Tax Invoice ${invoiceNumber} issued and attached`,
      });
    }

    this.orders.set(id, order);
    this.addAuditLog(actor, 'Orders', `Attached ERP Invoice ${invoiceNumber} to ${order.orderNumber}`, '', invoiceNumber);

    return order;
  }

  // --- PAYMENT WEBHOOKS (IDEMPOTENT) ---
  async processPaymentWebhook(
    idempotencyKey: string,
    gateway: string,
    transactionId: string,
    eventType: string,
    payload: any
  ): Promise<{ status: 'processed' | 'duplicate'; record: PaymentWebhookRecord }> {
    if (this.paymentWebhooks.has(idempotencyKey)) {
      return {
        status: 'duplicate',
        record: this.paymentWebhooks.get(idempotencyKey)!,
      };
    }

    const record: PaymentWebhookRecord = {
      id: `whk-${Date.now()}`,
      idempotencyKey,
      gateway,
      transactionId,
      eventType,
      payload,
      processedAt: new Date().toISOString(),
    };

    this.paymentWebhooks.set(idempotencyKey, record);

    // If payment.captured, update the corresponding order
    if (eventType === 'payment.captured' && payload.orderId) {
      const order = await this.getOrderById(payload.orderId);
      if (order && order.paymentStatus !== 'Success') {
        order.paymentStatus = 'Success';
        order.paymentTransactionId = transactionId;
        order.status = 'Payment confirmed';
        order.timeline.push({
          status: 'Payment confirmed',
          timestamp: new Date().toISOString(),
          actor: `Webhook (${gateway})`,
          note: `Verified bank settlement via ${gateway}. Transaction ID: ${transactionId}`,
        });
        this.orders.set(order.id, order);
      }
    }

    this.addAuditLog(
      `Webhook (${gateway})`,
      'Payments',
      `Processed Payment Webhook: ${eventType} (${transactionId})`,
      '',
      `IdempotencyKey: ${idempotencyKey}`
    );

    return { status: 'processed', record };
  }

  // --- MAKER-CHECKER WORKFLOWS ---
  async createMakerCheckerRequest(
    title: string,
    module: string,
    actionType: string,
    initiator: string,
    details: string,
    payload?: any
  ): Promise<MakerCheckerItem> {
    const item: MakerCheckerItem & { payload?: any } = {
      id: `MC-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      title,
      module,
      actionType,
      initiator,
      status: 'Pending',
      details,
      payload,
      createdAt: new Date().toISOString(),
    };
    this.makerCheckerQueue.unshift(item);

    this.addAuditLog(initiator, module, `Initiated Dual-Auth Request: ${title}`, '', details);
    return item;
  }

  async resolveMakerCheckerRequest(id: string, approver: string, decision: 'Approved' | 'Rejected'): Promise<MakerCheckerItem> {
    const item = this.makerCheckerQueue.find((i) => i.id === id);
    if (!item) throw new Error('Maker-checker item not found');

    // Strict Segregation: Initiator CANNOT approve their own request!
    if (item.initiator.toLowerCase() === approver.toLowerCase()) {
      throw new Error('Maker-Checker Violation: Initiator cannot approve their own proposal. A secondary officer must approve.');
    }

    item.status = decision;
    item.approver = approver;
    item.resolvedAt = new Date().toISOString();

    this.addAuditLog(approver, item.module, `Resolved Dual-Auth Request (${decision}): ${item.title}`, 'Pending', decision);

    return item;
  }

  async getMakerCheckerQueue(): Promise<MakerCheckerItem[]> {
    return [...this.makerCheckerQueue];
  }

  // --- AUDIT LOGS ---
  addAuditLog(actor: string, module: string, action: string, before: string = '', after: string = '', ipAddress?: string): AuditRow {
    const row: AuditRow = {
      id: `AUD-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      actor,
      module,
      action,
      timestamp: new Date().toISOString(),
      before: before || '-',
      after: after || '-',
      ipAddress: ipAddress || '127.0.0.1',
    };
    this.auditLogs.unshift(row);
    return row;
  }

  async getAuditLogs(): Promise<AuditRow[]> {
    return [...this.auditLogs];
  }

  // --- CORPORATE GIFTING ---
  async getCorporateEnquiries(): Promise<CorporateEnquiryRecord[]> {
    return Array.from(this.corporateEnquiries.values()).sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  async createCorporateEnquiry(data: Omit<CorporateEnquiryRecord, 'id' | 'status' | 'createdAt' | 'updatedAt'>): Promise<CorporateEnquiryRecord> {
    const id = `CORP-ENQ-${Date.now()}`;
    const now = new Date().toISOString();
    const record: CorporateEnquiryRecord = {
      ...data,
      id,
      status: 'Received',
      createdAt: now,
      updatedAt: now,
    };
    this.corporateEnquiries.set(id, record);

    this.addAuditLog(
      data.contactName,
      'Corporate Gifting',
      `Corporate Enquiry Created: ${data.companyName} (${data.recipientCount} recipients)`,
      '',
      `Budget: INR ${data.budgetPerRecipient}/recipient`
    );

    return record;
  }

  async updateCorporateEnquiry(id: string, updates: Partial<CorporateEnquiryRecord>, actor: string): Promise<CorporateEnquiryRecord | null> {
    const existing = this.corporateEnquiries.get(id);
    if (!existing) return null;

    const updated = { ...existing, ...updates, updatedAt: new Date().toISOString() };
    this.corporateEnquiries.set(id, updated);

    this.addAuditLog(actor, 'Corporate Gifting', `Updated Enquiry ${id} Status to ${updated.status}`, existing.status, updated.status);
    return updated;
  }

  // --- USERS & AUTH ---
  async getUserByEmail(email: string): Promise<AdminUserRecord | null> {
    return this.users.get(email.toLowerCase()) || null;
  }

  async verifyPassword(email: string, plainText: string): Promise<boolean> {
    const user = await this.getUserByEmail(email);
    if (!user) return false;
    return bcrypt.compareSync(plainText, user.passwordHash);
  }

  recordFailedLogin(email: string): { locked: boolean; attempts: number } {
    const user = this.users.get(email.toLowerCase());
    if (!user) return { locked: false, attempts: 0 };
    user.failedLoginAttempts = (user.failedLoginAttempts || 0) + 1;
    if (user.failedLoginAttempts >= 5) {
      user.isLocked = true;
      this.addAuditLog('System', 'Security', `Account locked after 5 failed login attempts: ${user.email}`, '', 'Account Locked');
      return { locked: true, attempts: user.failedLoginAttempts };
    }
    return { locked: false, attempts: user.failedLoginAttempts };
  }

  resetFailedLogins(email: string): void {
    const user = this.users.get(email.toLowerCase());
    if (user) {
      user.failedLoginAttempts = 0;
    }
  }

  unlockUser(email: string): boolean {
    const user = this.users.get(email.toLowerCase());
    if (!user) return false;
    user.isLocked = false;
    user.failedLoginAttempts = 0;
    this.addAuditLog('System', 'Security', `Account unlocked: ${user.email}`, 'Locked', 'Active');
    return true;
  }

  // --- CERTIFICATES ---
  async getCertificate(certNo: string) {
    return this.certificates[certNo] || null;
  }

  // --- COMPLIANCE ---
  async getComplianceChecklist(): Promise<ComplianceChecklistItem[]> {
    return [...this.complianceChecklist];
  }

  async updateComplianceItem(id: string, isCompliant: boolean, auditor: string): Promise<ComplianceChecklistItem | null> {
    const item = this.complianceChecklist.find((c) => c.id === id);
    if (!item) return null;

    const oldState = item.isCompliant;
    item.isCompliant = isCompliant;
    item.lastAuditDate = new Date().toISOString().split('T')[0];
    item.auditedBy = auditor;

    this.addAuditLog(auditor, 'Compliance', `Toggled compliance for ${item.title}`, String(oldState), String(isCompliant));
    return item;
  }
}

export const db = new DatabaseService();
