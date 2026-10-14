import { create } from 'zustand';
import { persist, createJSONStorage, type StateStorage } from 'zustand/middleware';
import type {
  Product,
  LiveRates,
  ProviderState,
  PricingConfig,
  Quote,
  Order,
  OrderStatus,
  Customer,
  Alert,
  AuditRow,
  StoreEvent,
  AdminRole,
  AdminUser,
  MakerCheckerItem,
  PriceHistoryRow,
  SupplierRecord,
  PurchaseRecord,
  InventoryLog,
  InsuranceClaim,
  SettlementRecord,
  ComplianceChecklistItem,
  DocumentVersionRecord,
  CustomerOrderNote,
  CustomerSupportInteraction,
} from '../data/types';
import {
  MOCK_PRODUCTS,
  INITIAL_RATES,
  INITIAL_PRICING_CONFIG,
  MOCK_ORDERS,
  MOCK_CUSTOMERS,
  MOCK_QUOTES,
  MOCK_ALERTS,
  MOCK_AUDIT_LOGS,
  MOCK_SUPPLIERS,
  MOCK_PURCHASE_RECORDS,
  MOCK_INVENTORY_LOGS,
  MOCK_SETTLEMENTS,
  MOCK_CLAIMS,
  MOCK_COMPLIANCE_CHECKLIST,
  MOCK_DOCUMENT_VERSIONS,
} from '../data';
import { calculatePrice } from '../lib/pricing';

// Safe localStorage with in-memory fallback
const memoryStorageMap = new Map<string, string>();
const safeStorage: StateStorage = {
  getItem: (key: string): string | null => {
    try {
      return localStorage.getItem(key);
    } catch {
      return memoryStorageMap.get(key) || null;
    }
  },
  setItem: (key: string, value: string): void => {
    try {
      localStorage.setItem(key, value);
    } catch {
      memoryStorageMap.set(key, value);
    }
  },
  removeItem: (key: string): void => {
    try {
      localStorage.removeItem(key);
    } catch {
      memoryStorageMap.delete(key);
    }
  },
};

export interface CartItem {
  productId: string;
  quantity: number;
  addedPrice: number;
  addedRatePerGram: number;
  requiresReacceptance?: boolean;
}

export interface StoreState {
  // Rates & Engine
  rates: LiveRates;
  providerState: ProviderState;
  isFeedStale: boolean;
  bothDownSince: number | null;
  ratesLastUpdated: number; // ms timestamp

  // Pricing Config
  pricingConfig: PricingConfig;

  // Catalogue & Stock
  products: Product[];
  suppliers: SupplierRecord[];
  purchaseRecords: PurchaseRecord[];
  inventoryLogs: InventoryLog[];

  // Customer & Storefront
  wishlist: string[]; // product IDs
  cart: CartItem[];
  quotes: Quote[];
  orders: Order[];
  customers: Customer[];
  settlements: SettlementRecord[];
  claims: InsuranceClaim[];
  complianceChecklist: ComplianceChecklistItem[];
  documentVersions: DocumentVersionRecord[];

  // Telemetry & Governance
  events: StoreEvent[];
  auditLogs: AuditRow[];
  alerts: Alert[];
  priceHistory: PriceHistoryRow[];

  // Admin & RBAC (Phase 6 & 7)
  adminUser: AdminUser | null;
  activeRole: AdminRole;
  sessionTimedOut: boolean;
  makerCheckerRequests: MakerCheckerItem[];

  // Settings
  demoMode: boolean;
  quoteLockSeconds: number; // default 600 (10 mins); 60 in demo mode
  sessionTimeoutSeconds: number; // default 900 (15 mins); 60 in demo mode

  // Actions: Rates Engine
  tickRates: () => void;
  setProviderState: (state: ProviderState) => void;
  applyRateOverride: (metal: 'gold24k' | 'silver999', newRate: number, actor: string) => void;
  updateCostComponents: (components: Partial<PricingConfig['costComponents']>, actor: string) => void;

  // Actions: Quotes & Stock
  createQuote: (productId: string, quantity?: number, customerId?: string) => Quote | null;
  requote: (quoteId: string) => Quote | null;
  cancelQuote: (quoteId: string) => void;
  checkQuoteExpiries: () => void;

  // Actions: Cart & Wishlist
  toggleWishlist: (productId: string) => void;
  addToCart: (productId: string, quantity?: number) => boolean;
  removeFromCart: (productId: string) => void;
  updateCartQuantity: (productId: string, quantity: number) => void;
  acceptCartPriceUpdate: (productId: string) => void;
  clearCart: () => void;

  // Actions: Orders & Lifecycle
  createOrderFromCart: (
    customerInfo: { name: string; email: string; phone: string; address: any },
    paymentMethod: string,
    demoPaymentResult?: 'Success' | 'Failed' | 'Pending' | 'Timeout'
  ) => Order;
  advanceOrderStatus: (orderId: string, nextStatus: OrderStatus, actor: string, note?: string) => void;
  attachErpInvoice: (orderId: string, erpInvoiceNumber: string, invoiceUrl?: string, actor?: string) => void;
  dispatchOrder: (orderId: string, courierName: string, trackingNumber: string, actor: string, note?: string) => void;
  submitReturnRequest: (orderId: string, reason: string) => void;
  resolveReturnRequest: (orderId: string, resolution: 'Approved' | 'Rejected', note: string, actor: string) => void;
  markSettlementReconciled: (id: string, actor: string) => void;
  fileInsuranceClaim: (claim: InsuranceClaim, actor: string) => void;
  simulateDuplicateWebhook: (orderId: string, actor: string) => { ignored: boolean; message: string };

  // Actions: Products & Stock (Admin)
  addProduct: (product: Product, actor: string) => void;
  updateProduct: (product: Product, actor: string) => void;
  adjustStock: (productId: string, newStock: number, reason: string, actor: string) => void;
  delistProduct: (productId: string, delisted: boolean, actor: string) => void;
  inventoryReceipt: (productId: string, quantity: number, lotNumber: string, supplierName: string, notes: string, actor: string) => void;
  releaseReservation: (productId: string, quantity: number, actor: string, reason?: string) => void;
  inventoryAdjustment: (productId: string, adjustmentType: 'onHand' | 'damaged' | 'quarantined', delta: number, reason: string, actor: string) => void;
  reconcileStock: (productId: string, physicalCount: number, notes: string, actor: string) => void;
  addPurchaseRecord: (record: PurchaseRecord, actor: string) => void;
  addSupplier: (supplier: SupplierRecord, actor: string) => void;

  // Actions: Customers & Compliance (Phase 10)
  addCustomerNote: (customerId: string, note: string, author: string, orderId?: string, orderNumber?: string) => void;
  toggleCustomerFraudFlag: (customerId: string, actor: string, reason?: string) => void;
  updateCustomerConsents: (customerId: string, consents: Partial<Customer['consents']>, actor: string) => void;
  addCustomerSupportInteraction: (customerId: string, interaction: Omit<CustomerSupportInteraction, 'id' | 'createdAt'>) => void;
  toggleComplianceItem: (id: string, actor: string) => void;
  updateDocumentVersion: (id: string, updates: Partial<DocumentVersionRecord>, actor: string) => void;

  // Actions: Telemetry & Alerts
  logEvent: (type: StoreEvent['type'], details: string, metadata?: Record<string, any>) => void;
  logAudit: (actor: string, action: string, module: string, before: string, after: string) => void;
  resolveAlert: (alertId: string) => void;

  // Actions: Admin & RBAC (Phase 6)
  loginAdmin: (email: string, role?: AdminRole) => void;
  verifyMfa: (code: string) => boolean;
  logoutAdmin: () => void;
  setActiveRole: (role: AdminRole) => void;
  touchAdminActivity: () => void;
  triggerSessionTimeout: () => void;
  reauthenticateAdmin: (password: string) => boolean;
  createMakerCheckerRequest: (title: string, module: string, details: string, initiator?: string) => void;
  approveMakerCheckerRequest: (id: string, actor: string) => { success: boolean; error?: string };
  rejectMakerCheckerRequest: (id: string, actor: string, reason: string) => { success: boolean; error?: string };

  // Actions: Settings
  setDemoMode: (enabled: boolean) => void;
  setQuoteLockSeconds: (seconds: number) => void;
  resetDemoData: () => void;
}

export const useAppStore = create<StoreState>()(
  persist(
    (set, get) => ({
      // Initial Rates
      rates: INITIAL_RATES,
      providerState: 'ok',
      isFeedStale: false,
      bothDownSince: null,
      ratesLastUpdated: Date.now(),

      pricingConfig: INITIAL_PRICING_CONFIG,
      products: MOCK_PRODUCTS,
      suppliers: MOCK_SUPPLIERS,
      purchaseRecords: MOCK_PURCHASE_RECORDS,
      inventoryLogs: MOCK_INVENTORY_LOGS,

      wishlist: ['prod-gold-01', 'prod-gem-01'],
      cart: [],
      quotes: MOCK_QUOTES,
      orders: MOCK_ORDERS,
      customers: MOCK_CUSTOMERS,
      settlements: MOCK_SETTLEMENTS,
      claims: MOCK_CLAIMS,
      complianceChecklist: MOCK_COMPLIANCE_CHECKLIST,
      documentVersions: MOCK_DOCUMENT_VERSIONS,

      events: [
        {
          id: 'ev-init-1',
          type: 'product_view',
          details: 'Viewed 24K Pure Gold Investment Coin 10g',
          timestamp: new Date().toISOString(),
        },
      ],
      auditLogs: MOCK_AUDIT_LOGS,
      alerts: MOCK_ALERTS,

      // Admin & RBAC Initial State (Phase 6)
      adminUser: {
        name: 'Vikram Sharma',
        email: 'v.sharma@precious.internal',
        role: 'Super Admin',
        isAuthenticated: true,
        mfaVerified: true,
        lastActive: Date.now(),
      },
      activeRole: 'Super Admin',
      sessionTimedOut: false,
      makerCheckerRequests: [
        {
          id: 'mc-req-101',
          title: 'Overnight Rate Spread Adjustment (+0.25%)',
          module: 'Rates and Pricing',
          initiator: 'R. Kulkarni (Pricing Desk)',
          status: 'Pending',
          details: 'Proposed increasing bullion margin spread from 1.5% to 1.75% ahead of festive volatility.',
          createdAt: new Date(Date.now() - 3600000).toISOString(),
        },
        {
          id: 'mc-req-102',
          title: 'High-Value Bullion Refund Approval (₹4,85,000)',
          module: 'Orders & Payments',
          initiator: 'A. Sen (Support Team)',
          status: 'Pending',
          details: 'Customer requested cancellation prior to armoured dispatch for Order #ORD-2026-9041.',
          createdAt: new Date(Date.now() - 7200000).toISOString(),
        },
        {
          id: 'mc-req-103',
          title: 'Inventory Lot Batch Serial Reclassification',
          module: 'Inventory',
          initiator: 'S. Nambiar (Warehouse Officer)',
          approver: 'Vikram Sharma (Super Admin)',
          status: 'Approved',
          details: 'Updated 50g Cast Bar Lot B24-1002 serial registry to BIS Hallmarked tier.',
          createdAt: new Date(Date.now() - 86400000).toISOString(),
          resolvedAt: new Date(Date.now() - 82000000).toISOString(),
        },
      ],

      priceHistory: [
        {
          id: 'ph-01',
          version: 'v2.4.1',
          timestamp: '2026-10-14T08:00:00Z',
          actor: 'Vikram Sharma (Super Admin)',
          changes: 'Bullion Making % set to 4.0%; Packaging cost set to ₹250; Insurance set to ₹450',
          status: 'Active',
        },
        {
          id: 'ph-02',
          version: 'v2.4.0',
          timestamp: '2026-10-10T11:30:00Z',
          actor: 'R. Kulkarni (Pricing)',
          changes: 'Jewellery Making % adjusted from 11.5% to 12.0%; Assay cert cost ₹350',
          status: 'Superseded',
        },
        {
          id: 'ph-03',
          version: 'v2.3.9',
          timestamp: '2026-10-01T09:15:00Z',
          actor: 'Vikram Sharma (Super Admin)',
          changes: 'Base rate margin guardrail set to 1.5% - 10.0%',
          status: 'Superseded',
        },
      ],

      demoMode: false,
      quoteLockSeconds: 600, // 10 minutes
      sessionTimeoutSeconds: 900, // 15 minutes

      // --- RATES ENGINE ---
      tickRates: () => {
        const state = get();

        // If bothDown: check if 20 seconds elapsed to mark feed stale
        if (state.providerState === 'bothDown') {
          const now = Date.now();
          const downSince = state.bothDownSince || now;
          if (now - downSince >= 20000 && !state.isFeedStale) {
            set({ isFeedStale: true, bothDownSince: downSince });
            get().logEvent('product_view', 'Feed marked STALE: Live rates halted for > 20s');
          }
          return;
        }

        // Random fluctuation +/- 0.05% to 0.15%
        // Random multiplier between 0.0005 and 0.0015
        const pctDelta = 0.0005 + Math.random() * 0.0010;
        const sign = Math.random() > 0.5 ? 1 : -1;
        const goldFactor = 1 + sign * pctDelta;

        const silverPctDelta = 0.0005 + Math.random() * 0.0010;
        const silverSign = Math.random() > 0.5 ? 1 : -1;
        const silverFactor = 1 + silverSign * silverPctDelta;

        const newGold24k = Math.round(state.rates.gold24k * goldFactor);
        const newGold22k = Math.round(newGold24k * 0.9167);
        const newSilver999 = Math.round(state.rates.silver999 * silverFactor);

        const newRates: LiveRates = {
          gold24k: newGold24k,
          gold22k: newGold22k,
          silver999: newSilver999,
          lastUpdated: new Date().toISOString(),
        };

        // Check if any cart items need reacceptance due to rate move
        const updatedCart = state.cart.map((item) => {
          const prod = state.products.find((p) => p.id === item.productId);
          if (!prod || prod.type !== 'rateLinked') return item;
          const currentPrice = calculatePrice(prod, newRates, state.pricingConfig).total;
          if (currentPrice !== item.addedPrice) {
            return { ...item, requiresReacceptance: true };
          }
          return item;
        });

        set({
          rates: newRates,
          isFeedStale: false,
          bothDownSince: null,
          ratesLastUpdated: Date.now(),
          cart: updatedCart,
        });
      },

      setProviderState: (providerState: ProviderState) => {
        const now = Date.now();
        if (providerState === 'bothDown') {
          set({ providerState, bothDownSince: now });
        } else {
          set({ providerState, bothDownSince: null, isFeedStale: false });
        }
        get().logAudit(
          'admin@aurum.internal',
          'PROVIDER_STATE_CHANGED',
          'Rates & Ingestion',
          `State: ${get().providerState}`,
          `State: ${providerState}`
        );
      },

      applyRateOverride: (metal: 'gold24k' | 'silver999', newRate: number, actor: string) => {
        const currentRates = get().rates;
        const beforeStr = `${metal}: ₹${currentRates[metal]}/g`;
        const updatedRates = {
          ...currentRates,
          [metal]: newRate,
          gold22k: metal === 'gold24k' ? Math.round(newRate * 0.9167) : currentRates.gold22k,
          lastUpdated: new Date().toISOString(),
        };

        set({ rates: updatedRates, isFeedStale: false });
        get().logAudit(actor, 'RATE_MANUAL_OVERRIDE', 'Rates & Pricing', beforeStr, `${metal}: ₹${newRate}/g`);
      },

      updateCostComponents: (components: Partial<PricingConfig['costComponents']>, actor: string) => {
        const state = get();
        const currentVersion = state.pricingConfig.formulaVersion;
        const versionParts = currentVersion.replace('v', '').split('.').map(Number);
        versionParts[2] = (versionParts[2] || 0) + 1; // Increment patch version
        const newVersion = `v${versionParts.join('.')}`;

        const updatedConfig: PricingConfig = {
          ...state.pricingConfig,
          formulaVersion: newVersion,
          costComponents: {
            ...state.pricingConfig.costComponents,
            ...components,
          },
        };

        const changedKeys = Object.entries(components)
          .map(([k, v]) => `${k}: ${v}`)
          .join('; ');

        const newHistoryRow: PriceHistoryRow = {
          id: `ph-${Date.now()}`,
          version: newVersion,
          timestamp: new Date().toISOString(),
          actor,
          changes: changedKeys || 'Updated cost parameters',
          status: 'Active',
        };

        const updatedHistory = [
          newHistoryRow,
          ...state.priceHistory.map((h) => ({ ...h, status: 'Superseded' as const })),
        ];

        set({ pricingConfig: updatedConfig, priceHistory: updatedHistory });
        get().logAudit(
          actor,
          'COST_COMPONENTS_UPDATED',
          'Pricing Engine',
          `Version ${currentVersion}`,
          `Version ${newVersion} (${changedKeys})`
        );
      },

      // --- QUOTES & STOCK ---
      createQuote: (productId: string, quantity = 1, customerId = 'cust-01') => {
        const state = get();
        if (state.isFeedStale) {
          return null; // Stale feed pauses quotes
        }

        const product = state.products.find((p) => p.id === productId);
        if (!product || product.stock - product.reserved < quantity) {
          return null; // Out of stock
        }

        const calculation = calculatePrice(product, state.rates, state.pricingConfig);
        const lockDuration = state.demoMode ? 60 : state.quoteLockSeconds;
        const now = new Date();
        const expiresAt = new Date(now.getTime() + lockDuration * 1000);

        const newQuote: Quote = {
          id: `QUO-${Date.now().toString().slice(-6)}`,
          customerId,
          productId: product.id,
          productName: product.name,
          quantity,
          ratePerGramSnapshot: calculation.ratePerGram,
          metalPurity: product.attributes.bullion?.purity || `${product.purity * 100}% Fine`,
          priceBreakdown: {
            metalValue: calculation.metalValue,
            making: calculation.makingCharges,
            packaging: calculation.packagingCharges,
            insurance: calculation.insuranceCharges,
            subtotal: calculation.subtotal,
            gst: calculation.gstAmount,
            total: calculation.total,
          },
          createdAt: now.toISOString(),
          expiresAt: expiresAt.toISOString(),
          status: 'Active',
        };

        // Reserve stock
        const updatedProducts = state.products.map((p) =>
          p.id === productId ? { ...p, reserved: p.reserved + quantity } : p
        );

        set({
          quotes: [newQuote, ...state.quotes],
          products: updatedProducts,
        });

        get().logEvent('product_view', `Locked quote for ${product.name} (10 min rate protection)`);
        return newQuote;
      },

      requote: (quoteId: string) => {
        const state = get();
        const existingQuote = state.quotes.find((q) => q.id === quoteId);
        if (!existingQuote || state.isFeedStale) return null;

        const product = state.products.find((p) => p.id === existingQuote.productId);
        if (!product) return null;

        const calculation = calculatePrice(product, state.rates, state.pricingConfig);
        const lockDuration = state.demoMode ? 60 : state.quoteLockSeconds;
        const now = new Date();
        const expiresAt = new Date(now.getTime() + lockDuration * 1000);

        const updatedQuote: Quote = {
          ...existingQuote,
          ratePerGramSnapshot: calculation.ratePerGram,
          priceBreakdown: {
            metalValue: calculation.metalValue,
            making: calculation.makingCharges,
            packaging: calculation.packagingCharges,
            insurance: calculation.insuranceCharges,
            subtotal: calculation.subtotal,
            gst: calculation.gstAmount,
            total: calculation.total,
          },
          createdAt: now.toISOString(),
          expiresAt: expiresAt.toISOString(),
          status: 'Active',
        };

        set({
          quotes: state.quotes.map((q) => (q.id === quoteId ? updatedQuote : q)),
        });

        get().logEvent('product_view', `Requoted ${product.name} at live rate`);
        return updatedQuote;
      },

      cancelQuote: (quoteId: string) => {
        const state = get();
        const quote = state.quotes.find((q) => q.id === quoteId);
        if (!quote) return;

        // Release stock
        const updatedProducts = state.products.map((p) =>
          p.id === quote.productId ? { ...p, reserved: Math.max(0, p.reserved - quote.quantity) } : p
        );

        set({
          quotes: state.quotes.map((q) => (q.id === quoteId ? { ...q, status: 'Cancelled' } : q)),
          products: updatedProducts,
        });
      },

      checkQuoteExpiries: () => {
        const state = get();
        const now = new Date().getTime();
        let changed = false;
        let stockChanged = false;
        const productsMap = new Map(state.products.map((p) => [p.id, { ...p }]));

        const updatedQuotes = state.quotes.map((q) => {
          if (q.status === 'Active' && new Date(q.expiresAt).getTime() <= now) {
            changed = true;
            const p = productsMap.get(q.productId);
            if (p && p.reserved > 0) {
              p.reserved = Math.max(0, p.reserved - q.quantity);
              stockChanged = true;
            }
            return { ...q, status: 'Expired' as const };
          }
          return q;
        });

        if (changed) {
          set({
            quotes: updatedQuotes,
            ...(stockChanged ? { products: Array.from(productsMap.values()) } : {}),
          });
        }
      },

      // --- CART & WISHLIST ---
      toggleWishlist: (productId: string) => {
        const state = get();
        const exists = state.wishlist.includes(productId);
        const updated = exists
          ? state.wishlist.filter((id) => id !== productId)
          : [...state.wishlist, productId];
        set({ wishlist: updated });
      },

      addToCart: (productId: string, quantity = 1) => {
        const state = get();
        const product = state.products.find((p) => p.id === productId);
        if (!product || product.stock - product.reserved < quantity) return false;

        const currentPrice = calculatePrice(product, state.rates, state.pricingConfig).total;
        const existingItem = state.cart.find((item) => item.productId === productId);

        let updatedCart: CartItem[];
        if (existingItem) {
          updatedCart = state.cart.map((item) =>
            item.productId === productId
              ? { ...item, quantity: item.quantity + quantity, requiresReacceptance: false }
              : item
          );
        } else {
          updatedCart = [
            ...state.cart,
            {
              productId,
              quantity,
              addedPrice: currentPrice,
              addedRatePerGram: state.rates.gold24k,
              requiresReacceptance: false,
            },
          ];
        }

        // Temporarily reserve stock
        const updatedProducts = state.products.map((p) =>
          p.id === productId ? { ...p, reserved: p.reserved + quantity } : p
        );

        set({ cart: updatedCart, products: updatedProducts });
        get().logEvent('add_to_cart', `Added ${quantity}x ${product.name} to cart`);
        return true;
      },

      removeFromCart: (productId: string) => {
        const state = get();
        const item = state.cart.find((c) => c.productId === productId);
        if (!item) return;

        // Release reservation
        const updatedProducts = state.products.map((p) =>
          p.id === productId ? { ...p, reserved: Math.max(0, p.reserved - item.quantity) } : p
        );

        set({
          cart: state.cart.filter((c) => c.productId !== productId),
          products: updatedProducts,
        });
      },

      updateCartQuantity: (productId: string, quantity: number) => {
        const state = get();
        const item = state.cart.find((c) => c.productId === productId);
        if (!item) return;

        const delta = quantity - item.quantity;
        const product = state.products.find((p) => p.id === productId);
        if (!product || (delta > 0 && product.stock - product.reserved < delta)) return;

        const updatedProducts = state.products.map((p) =>
          p.id === productId ? { ...p, reserved: p.reserved + delta } : p
        );

        const updatedCart = state.cart.map((c) =>
          c.productId === productId ? { ...c, quantity } : c
        );

        set({ cart: updatedCart, products: updatedProducts });
      },

      acceptCartPriceUpdate: (productId: string) => {
        const state = get();
        const product = state.products.find((p) => p.id === productId);
        if (!product) return;

        const currentPrice = calculatePrice(product, state.rates, state.pricingConfig).total;
        const updatedCart = state.cart.map((item) =>
          item.productId === productId
            ? { ...item, addedPrice: currentPrice, requiresReacceptance: false }
            : item
        );

        set({ cart: updatedCart });
      },

      clearCart: () => {
        set({ cart: [] });
      },

      // --- ORDERS & LIFECYCLE ---
      createOrderFromCart: (customerInfo, paymentMethod, demoPaymentResult = 'Success') => {
        const state = get();
        const orderId = `ORD-${Date.now().toString().slice(-6)}`;
        const orderNum = `AUR-ORD-${Date.now().toString().slice(-4)}`;
        const now = new Date().toISOString();

        let subtotal = 0;
        let gstTotal = 0;
        let totalAmount = 0;

        const items = state.cart.map((cartItem) => {
          const product = state.products.find((p) => p.id === cartItem.productId)!;
          const calc = calculatePrice(product, state.rates, state.pricingConfig);
          const lineTotal = calc.total * cartItem.quantity;
          const lineGst = calc.gstAmount * cartItem.quantity;
          const lineSub = calc.subtotal * cartItem.quantity;

          subtotal += lineSub;
          gstTotal += lineGst;
          totalAmount += lineTotal;

          return {
            productId: product.id,
            sku: product.sku,
            name: product.name,
            category: product.category,
            quantity: cartItem.quantity,
            unitPrice: calc.total,
            totalPrice: lineTotal,
            ratePerGramSnapshot: calc.ratePerGram,
            makingCharges: calc.makingCharges * cartItem.quantity,
            gstAmount: lineGst,
          };
        });

        // Convert reserved stock to permanent sale on success
        const updatedProducts = state.products.map((prod) => {
          const inCart = state.cart.find((c) => c.productId === prod.id);
          if (inCart) {
            return {
              ...prod,
              stock: Math.max(0, prod.stock - inCart.quantity),
              reserved: Math.max(0, prod.reserved - inCart.quantity),
            };
          }
          return prod;
        });

        const newOrder: Order = {
          id: orderId,
          orderNumber: orderNum,
          customerId: 'cust-01',
          customerName: customerInfo.name,
          customerEmail: customerInfo.email,
          customerPhone: customerInfo.phone,
          shippingAddress: customerInfo.address,
          items,
          subtotal,
          gstTotal,
          totalAmount,
          paymentStatus: demoPaymentResult,
          paymentMethod,
          paymentTransactionId: `TXN-${Date.now()}`,
          status: demoPaymentResult === 'Success' ? 'Payment confirmed' : 'Placed',
          timeline: [
            { status: 'Placed', timestamp: now, actor: 'Customer' },
            ...(demoPaymentResult === 'Success'
              ? [{ status: 'Payment confirmed' as const, timestamp: now, actor: 'Payment Gateway Webhook' }]
              : []),
          ],
          erpInvoiceAttached: false,
          createdAt: now,
          updatedAt: now,
        };

        set({
          orders: [newOrder, ...state.orders],
          products: updatedProducts,
          cart: [], // Clear cart
        });

        get().logEvent('checkout_start', `Order ${orderNum} created with status: ${newOrder.status}`);
        return newOrder;
      },

      advanceOrderStatus: (orderId: string, nextStatus: OrderStatus, actor: string, note?: string) => {
        const state = get();
        const order = state.orders.find((o) => o.id === orderId);
        if (!order) return;

        const now = new Date().toISOString();
        const updatedTimeline = [
          ...order.timeline,
          { status: nextStatus, timestamp: now, actor, note },
        ];

        const updatedOrders = state.orders.map((o) =>
          o.id === orderId ? { ...o, status: nextStatus, timeline: updatedTimeline, updatedAt: now } : o
        );

        set({ orders: updatedOrders });
        get().logAudit(actor, 'ORDER_STATUS_ADVANCE', 'Orders', `Status: ${order.status}`, `Status: ${nextStatus}`);
      },

      attachErpInvoice: (orderId: string, erpInvoiceNumber: string, invoiceUrl = '', actor = 'ERP Handoff') => {
        const state = get();
        const now = new Date().toISOString();

        const updatedOrders = state.orders.map((order) => {
          if (order.id !== orderId) return order;
          const updatedTimeline = [
            ...order.timeline,
            { status: 'Invoice issued' as const, timestamp: now, actor: `${actor} (${erpInvoiceNumber})` },
          ];
          return {
            ...order,
            erpInvoiceNumber,
            erpInvoiceAttached: true,
            erpInvoiceUrl: invoiceUrl || `https://aurum.internal/invoices/${erpInvoiceNumber}.pdf`,
            status: 'Invoice issued' as const,
            timeline: updatedTimeline,
            updatedAt: now,
          };
        });

        set({ orders: updatedOrders });
        get().logAudit(actor, 'ERP_INVOICE_ATTACHED', 'Orders & Billing', `Order #${orderId}`, `Attached ${erpInvoiceNumber}`);
      },

      submitReturnRequest: (orderId: string, reason: string) => {
        const state = get();
        const now = new Date().toISOString();

        const updatedOrders = state.orders.map((o) => {
          if (o.id !== orderId) return o;
          return {
            ...o,
            status: 'Return requested' as const,
            returnRequest: {
              reason,
              requestedAt: now,
              status: 'Pending' as const,
            },
            timeline: [
              ...o.timeline,
              { status: 'Return requested' as const, timestamp: now, actor: 'Customer', note: reason },
            ],
            updatedAt: now,
          };
        });

        set({ orders: updatedOrders });
        get().logEvent('return_request', `Return requested for order #${orderId}: ${reason}`);
      },

      resolveReturnRequest: (orderId: string, resolution: 'Approved' | 'Rejected', note: string, actor: string) => {
        const state = get();
        const now = new Date().toISOString();

        const updatedOrders = state.orders.map((o) => {
          if (o.id !== orderId || !o.returnRequest) return o;
          const finalStatus: OrderStatus = resolution === 'Approved' ? 'Returned' : o.status;
          return {
            ...o,
            status: finalStatus,
            returnRequest: {
              ...o.returnRequest,
              status: resolution,
              resolutionNote: note,
            },
            timeline: [
              ...o.timeline,
              {
                status: finalStatus,
                timestamp: now,
                actor,
                note: `Return request ${resolution.toLowerCase()}: ${note}`,
              },
            ],
            updatedAt: now,
          };
        });

        set({ orders: updatedOrders });
        get().logAudit(actor, 'RETURN_REQUEST_RESOLVED', 'Orders & Returns', `Order #${orderId}`, `Resolution: ${resolution}`);
      },

      dispatchOrder: (
        orderId: string,
        courierName: string,
        trackingNumber: string,
        actor: string,
        note = 'Dispatched via armoured insured transport'
      ) => {
        const state = get();
        const now = new Date().toISOString();

        const updatedOrders = state.orders.map((order) => {
          if (order.id !== orderId) return order;
          const updatedTimeline = [
            ...order.timeline,
            {
              status: 'Dispatched' as const,
              timestamp: now,
              actor,
              note: `${courierName} (AWB: ${trackingNumber}) - ${note}`,
            },
          ];
          return {
            ...order,
            status: 'Dispatched' as const,
            courierName,
            trackingNumber,
            timeline: updatedTimeline,
            updatedAt: now,
          };
        });

        set({ orders: updatedOrders });
        get().logAudit(
          actor,
          'ORDER_DISPATCHED',
          'Fulfilment & Shipping',
          `Order #${orderId} (Invoice Attached)`,
          `Dispatched via ${courierName} (AWB #${trackingNumber})`
        );
      },

      markSettlementReconciled: (id: string, actor: string) => {
        const state = get();
        const record = state.settlements.find((s) => s.id === id);
        if (!record) return;

        const updatedSettlements = state.settlements.map((s) =>
          s.id === id ? { ...s, reconciliationStatus: 'Reconciled' as const } : s
        );

        set({ settlements: updatedSettlements });
        get().logAudit(
          actor,
          'SETTLEMENT_RECONCILED',
          'Finance & Settlements',
          `TXN #${record.transactionId}: ${record.reconciliationStatus}`,
          `TXN #${record.transactionId}: Reconciled`
        );
      },

      fileInsuranceClaim: (claim: InsuranceClaim, actor: string) => {
        set((state) => ({ claims: [claim, ...state.claims] }));
        get().logAudit(
          actor,
          'INSURANCE_CLAIM_FILED',
          'Fulfilment & Claims',
          'None',
          `Claim #${claim.id} for Order #${claim.orderNumber} (₹${claim.claimAmount.toLocaleString('en-IN')})`
        );
      },

      simulateDuplicateWebhook: (orderId: string, actor: string) => {
        const state = get();
        const order = state.orders.find((o) => o.id === orderId);
        const txnId = order?.paymentTransactionId || 'TXN-HDFC-991204';

        get().logAudit(
          actor,
          'DUPLICATE_WEBHOOK_IGNORED',
          'Payment Gateway',
          `Inbound event for ${txnId} (Order #${orderId})`,
          'Ignored duplicate payload. Idempotency key verified: ON'
        );

        return {
          ignored: true,
          message: `Duplicate webhook for ${txnId} was safely ignored. Idempotency protection ON. Zero state mutation.`,
        };
      },

      // --- PRODUCTS & INVENTORY ---
      addProduct: (product: Product, actor: string) => {
        set((state) => ({ products: [product, ...state.products] }));
        get().logAudit(actor, 'PRODUCT_CREATED', 'Catalogue', 'None', `Added ${product.name} (${product.sku})`);
      },

      updateProduct: (product: Product, actor: string) => {
        set((state) => ({
          products: state.products.map((p) => (p.id === product.id ? product : p)),
        }));
        get().logAudit(actor, 'PRODUCT_UPDATED', 'Catalogue', `SKU: ${product.sku}`, `Updated specs and pricing`);
      },

      adjustStock: (productId: string, newStock: number, reason: string, actor: string) => {
        const state = get();
        const prod = state.products.find((p) => p.id === productId);
        if (!prod) return;

        const before = `Stock: ${prod.stock}`;
        const after = `Stock: ${newStock} (${reason})`;

        set({
          products: state.products.map((p) => (p.id === productId ? { ...p, stock: newStock } : p)),
        });

        get().logAudit(actor, 'STOCK_ADJUSTMENT', 'Inventory', before, after);
      },

      delistProduct: (productId: string, delisted: boolean, actor: string) => {
        const state = get();
        const prod = state.products.find((p) => p.id === productId);
        if (!prod) return;
        const newStatus = delisted ? 'Delisted' : 'Active';
        set({
          products: state.products.map((p) =>
            p.id === productId ? { ...p, isDelisted: delisted, status: newStatus } : p
          ),
        });
        get().logAudit(
          actor,
          delisted ? 'PRODUCT_DELISTED' : 'PRODUCT_RELISTED',
          'Catalogue',
          `Status: ${prod.status || 'Active'}`,
          `Status: ${newStatus}`
        );
      },

      inventoryReceipt: (
        productId: string,
        quantity: number,
        lotNumber: string,
        supplierName: string,
        notes: string,
        actor: string
      ) => {
        const state = get();
        const prod = state.products.find((p) => p.id === productId);
        if (!prod) return;

        const onHandAfter = prod.stock + quantity;
        const reservedAfter = prod.reserved;
        const availableAfter = Math.max(0, onHandAfter - reservedAfter);
        const now = new Date().toISOString();

        const logEntry: InventoryLog = {
          id: `inv-log-${Date.now()}-${Math.random().toString(36).slice(2, 5)}`,
          timestamp: now,
          productId: prod.id,
          productName: prod.name,
          sku: prod.sku,
          action: 'Receipt',
          actor,
          delta: quantity,
          onHandAfter,
          reservedAfter,
          availableAfter,
          notes: `${notes || 'Goods receipt inward'} (Supplier: ${supplierName})`,
          lotBatch: lotNumber || prod.lotBatchSerial,
        };

        set({
          products: state.products.map((p) =>
            p.id === productId
              ? {
                  ...p,
                  stock: onHandAfter,
                  lotBatchSerial: lotNumber || p.lotBatchSerial,
                }
              : p
          ),
          inventoryLogs: [logEntry, ...state.inventoryLogs],
        });

        get().logAudit(
          actor,
          'INVENTORY_RECEIPT',
          'Inventory',
          `On-Hand: ${prod.stock}`,
          `On-Hand: ${onHandAfter} (+${quantity} via ${supplierName})`
        );
      },

      releaseReservation: (
        productId: string,
        quantity: number,
        actor: string,
        reason = 'Manual reservation release'
      ) => {
        const state = get();
        const prod = state.products.find((p) => p.id === productId);
        if (!prod) return;

        const releaseQty = Math.min(prod.reserved, quantity);
        const onHandAfter = prod.stock;
        const reservedAfter = Math.max(0, prod.reserved - releaseQty);
        const availableAfter = Math.max(0, onHandAfter - reservedAfter);
        const now = new Date().toISOString();

        const logEntry: InventoryLog = {
          id: `inv-log-${Date.now()}-${Math.random().toString(36).slice(2, 5)}`,
          timestamp: now,
          productId: prod.id,
          productName: prod.name,
          sku: prod.sku,
          action: 'Reservation Release',
          actor,
          delta: releaseQty,
          onHandAfter,
          reservedAfter,
          availableAfter,
          notes: reason,
          lotBatch: prod.lotBatchSerial,
        };

        set({
          products: state.products.map((p) =>
            p.id === productId ? { ...p, reserved: reservedAfter } : p
          ),
          inventoryLogs: [logEntry, ...state.inventoryLogs],
        });

        get().logAudit(
          actor,
          'RESERVATION_RELEASE',
          'Inventory',
          `Reserved: ${prod.reserved}`,
          `Reserved: ${reservedAfter} (-${releaseQty} units released)`
        );
      },

      inventoryAdjustment: (
        productId: string,
        adjustmentType: 'onHand' | 'damaged' | 'quarantined',
        delta: number,
        reason: string,
        actor: string
      ) => {
        const state = get();
        const prod = state.products.find((p) => p.id === productId);
        if (!prod) return;

        let onHandAfter = prod.stock;
        let damagedAfter = prod.damaged || 0;
        let quarantinedAfter = prod.quarantined || 0;

        if (adjustmentType === 'onHand') {
          onHandAfter = Math.max(0, prod.stock + delta);
        } else if (adjustmentType === 'damaged') {
          damagedAfter = Math.max(0, (prod.damaged || 0) + delta);
        } else if (adjustmentType === 'quarantined') {
          quarantinedAfter = Math.max(0, (prod.quarantined || 0) + delta);
        }

        const reservedAfter = prod.reserved;
        const availableAfter = Math.max(0, onHandAfter - reservedAfter);
        const now = new Date().toISOString();

        const logEntry: InventoryLog = {
          id: `inv-log-${Date.now()}-${Math.random().toString(36).slice(2, 5)}`,
          timestamp: now,
          productId: prod.id,
          productName: prod.name,
          sku: prod.sku,
          action: 'Adjustment',
          actor,
          delta,
          onHandAfter,
          reservedAfter,
          availableAfter,
          notes: `${adjustmentType} adjustment: ${reason}`,
          lotBatch: prod.lotBatchSerial,
        };

        set({
          products: state.products.map((p) =>
            p.id === productId
              ? {
                  ...p,
                  stock: onHandAfter,
                  damaged: damagedAfter,
                  quarantined: quarantinedAfter,
                }
              : p
          ),
          inventoryLogs: [logEntry, ...state.inventoryLogs],
        });

        get().logAudit(
          actor,
          'INVENTORY_ADJUSTMENT',
          'Inventory',
          `${adjustmentType}: ${adjustmentType === 'onHand' ? prod.stock : (prod[adjustmentType] || 0)}`,
          `${adjustmentType}: ${adjustmentType === 'onHand' ? onHandAfter : (adjustmentType === 'damaged' ? damagedAfter : quarantinedAfter)} (${reason})`
        );
      },

      reconcileStock: (
        productId: string,
        physicalCount: number,
        notes: string,
        actor: string
      ) => {
        const state = get();
        const prod = state.products.find((p) => p.id === productId);
        if (!prod) return;

        const delta = physicalCount - prod.stock;
        const onHandAfter = physicalCount;
        const reservedAfter = prod.reserved;
        const availableAfter = Math.max(0, onHandAfter - reservedAfter);
        const now = new Date().toISOString();

        const logEntry: InventoryLog = {
          id: `inv-log-${Date.now()}-${Math.random().toString(36).slice(2, 5)}`,
          timestamp: now,
          productId: prod.id,
          productName: prod.name,
          sku: prod.sku,
          action: 'Reconciliation',
          actor,
          delta,
          onHandAfter,
          reservedAfter,
          availableAfter,
          notes: `Physical Count: ${physicalCount} vs System: ${prod.stock}. ${notes}`,
          lotBatch: prod.lotBatchSerial,
        };

        set({
          products: state.products.map((p) =>
            p.id === productId ? { ...p, stock: onHandAfter } : p
          ),
          inventoryLogs: [logEntry, ...state.inventoryLogs],
        });

        get().logAudit(
          actor,
          'INVENTORY_RECONCILIATION',
          'Inventory',
          `Stock: ${prod.stock}`,
          `Stock: ${onHandAfter} (Variance: ${delta >= 0 ? '+' : ''}${delta})`
        );
      },

      addPurchaseRecord: (record: PurchaseRecord, actor: string) => {
        set((state) => ({ purchaseRecords: [record, ...state.purchaseRecords] }));
        get().logAudit(
          actor,
          'PURCHASE_RECORD_CREATED',
          'Procurement',
          'None',
          `PO Invoice #${record.purchaseInvoiceNo} (${record.quantityReceived} units from ${record.supplierName})`
        );
      },

      addSupplier: (supplier: SupplierRecord, actor: string) => {
        set((state) => ({ suppliers: [supplier, ...state.suppliers] }));
        get().logAudit(actor, 'SUPPLIER_ADDED', 'Procurement', 'None', `Added ${supplier.name} (${supplier.category})`);
      },

      // --- CUSTOMERS & COMPLIANCE (Phase 10) ---
      addCustomerNote: (customerId: string, note: string, author: string, orderId?: string, orderNumber?: string) => {
        const newNote: CustomerOrderNote = {
          id: `cn-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
          customerId,
          orderId,
          orderNumber,
          note,
          author,
          createdAt: new Date().toISOString(),
        };

        set((state) => ({
          customers: state.customers.map((c) => {
            if (c.id === customerId) {
              const currentNotes = c.notes || [];
              const currentOrderNotes = c.orderNotes || [];
              return {
                ...c,
                notes: [note, ...currentNotes],
                orderNotes: [newNote, ...currentOrderNotes],
              };
            }
            return c;
          }),
        }));

        get().logAudit(
          author,
          'CUSTOMER_NOTE_ADDED',
          'Customers',
          'Existing Notes',
          `Added note to Customer #${customerId}: "${note.slice(0, 50)}${note.length > 50 ? '...' : ''}"`
        );
      },

      toggleCustomerFraudFlag: (customerId: string, actor: string, reason?: string) => {
        let customerName = '';
        let newFlagState = false;

        set((state) => ({
          customers: state.customers.map((c) => {
            if (c.id === customerId) {
              customerName = c.name;
              newFlagState = !c.fraudFlag;
              const noteEntry = `[FRAUD RISK UPDATE] Fraud flag set to ${newFlagState ? 'ACTIVE' : 'CLEARED'} by ${actor}.${reason ? ` Reason: ${reason}` : ''}`;
              return {
                ...c,
                fraudFlag: newFlagState,
                notes: [noteEntry, ...(c.notes || [])],
              };
            }
            return c;
          }),
        }));

        get().logAudit(
          actor,
          newFlagState ? 'CUSTOMER_FRAUD_FLAG_ENABLED' : 'CUSTOMER_FRAUD_FLAG_CLEARED',
          'Customers',
          `Fraud Flag: ${!newFlagState}`,
          `Customer ${customerName} (${customerId}): Fraud Flag ${newFlagState ? 'ON' : 'OFF'}${reason ? ` (${reason})` : ''}`
        );
      },

      updateCustomerConsents: (customerId: string, consents: Partial<Customer['consents']>, actor: string) => {
        set((state) => ({
          customers: state.customers.map((c) => {
            if (c.id === customerId) {
              return {
                ...c,
                consents: { ...c.consents, ...consents },
              };
            }
            return c;
          }),
        }));

        get().logAudit(
          actor,
          'CUSTOMER_CONSENT_UPDATED',
          'Customers & Compliance',
          'Previous Preferences',
          `Updated consents for Customer #${customerId} (DPDP Act 2023 compliance)`
        );
      },

      addCustomerSupportInteraction: (customerId: string, interaction: Omit<CustomerSupportInteraction, 'id' | 'createdAt'>) => {
        const newInteraction: CustomerSupportInteraction = {
          ...interaction,
          id: `sup-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
          createdAt: new Date().toISOString(),
        };

        set((state) => ({
          customers: state.customers.map((c) => {
            if (c.id === customerId) {
              return {
                ...c,
                supportHistory: [newInteraction, ...(c.supportHistory || [])],
              };
            }
            return c;
          }),
        }));

        get().logAudit(
          interaction.officer,
          'CUSTOMER_SUPPORT_LOGGED',
          'Customer Intelligence',
          'None',
          `Logged ${interaction.channel} ticket: "${interaction.subject}" (Status: ${interaction.status})`
        );
      },

      toggleComplianceItem: (id: string, actor: string) => {
        let itemTitle = '';
        let newState = false;

        set((state) => ({
          complianceChecklist: state.complianceChecklist.map((item) => {
            if (item.id === id) {
              itemTitle = item.title;
              newState = !item.isCompliant;
              return {
                ...item,
                isCompliant: newState,
                lastAuditDate: new Date().toISOString().split('T')[0],
                auditedBy: actor,
              };
            }
            return item;
          }),
        }));

        get().logAudit(
          actor,
          'COMPLIANCE_STATUS_TOGGLED',
          'Regulatory Compliance',
          `Item: ${itemTitle}`,
          `Compliance Checklist ${itemTitle}: Marked ${newState ? 'COMPLIANT' : 'NON-COMPLIANT / UNDER REVIEW'}`
        );
      },

      updateDocumentVersion: (id: string, updates: Partial<DocumentVersionRecord>, actor: string) => {
        set((state) => ({
          documentVersions: state.documentVersions.map((doc) => {
            if (doc.id === id) {
              return { ...doc, ...updates };
            }
            return doc;
          }),
        }));

        get().logAudit(
          actor,
          'DOCUMENT_VERSION_UPDATED',
          'Regulatory Governance',
          `Doc #${id}`,
          `Updated policy document version ${updates.currentVersion || ''} (Status: ${updates.status || 'Updated'})`
        );
      },

      // --- TELEMETRY ---
      logEvent: (type: StoreEvent['type'], details: string, metadata?: Record<string, any>) => {
        const newEvent: StoreEvent = {
          id: `ev-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
          type,
          details,
          timestamp: new Date().toISOString(),
          metadata,
        };
        set((state) => ({ events: [newEvent, ...state.events.slice(0, 99)] }));
      },

      logAudit: (actor: string, action: string, module: string, before: string, after: string) => {
        const newAudit: AuditRow = {
          id: `aud-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
          actor,
          action,
          timestamp: new Date().toISOString(),
          module,
          before,
          after,
        };
        set((state) => ({ auditLogs: [newAudit, ...state.auditLogs.slice(0, 99)] }));
      },

      resolveAlert: (alertId: string) => {
        set((state) => ({
          alerts: state.alerts.map((a) => (a.id === alertId ? { ...a, resolved: true } : a)),
        }));
      },

      // --- ADMIN & RBAC (Phase 6) ---
      loginAdmin: (email: string, role: AdminRole = 'Super Admin') => {
        const user: AdminUser = {
          name: email.split('@')[0].replace('.', ' ').toUpperCase(),
          email,
          role,
          isAuthenticated: true,
          mfaVerified: false,
          lastActive: Date.now(),
        };
        set({ adminUser: user, activeRole: role, sessionTimedOut: false });
      },

      verifyMfa: (code: string) => {
        if (code.length === 6) {
          set((state) => ({
            adminUser: state.adminUser
              ? { ...state.adminUser, mfaVerified: true, lastActive: Date.now() }
              : null,
            sessionTimedOut: false,
          }));
          const actor = get().adminUser?.name || 'Administrator';
          get().logAudit(
            actor,
            'Dual-Factor Authentication (MFA) Verified',
            'Authentication',
            'Pending MFA',
            'MFA Session Active'
          );
          return true;
        }
        return false;
      },

      logoutAdmin: () => {
        const actor = get().adminUser?.name || 'Administrator';
        get().logAudit(actor, 'Administrative Console Logout', 'Authentication', 'Active Session', 'Logged Out');
        set({
          adminUser: null,
          sessionTimedOut: false,
        });
      },

      setActiveRole: (role: AdminRole) => {
        const oldRole = get().activeRole;
        const actor = get().adminUser?.name || 'Administrator';
        set((state) => ({
          activeRole: role,
          adminUser: state.adminUser ? { ...state.adminUser, role } : null,
        }));
        get().logAudit(
          actor,
          `Active Role Switched to ${role}`,
          'RBAC',
          `Role: ${oldRole}`,
          `Role: ${role}`
        );
      },

      touchAdminActivity: () => {
        set((state) => ({
          adminUser: state.adminUser ? { ...state.adminUser, lastActive: Date.now() } : null,
        }));
      },

      triggerSessionTimeout: () => {
        set({ sessionTimedOut: true });
        const actor = get().adminUser?.name || 'Administrator';
        get().logAudit(
          actor,
          'Administrative Session Idle Timeout Triggered',
          'Authentication',
          'Active Session',
          'Session Expired'
        );
      },

      reauthenticateAdmin: (password: string) => {
        if (password.trim().length >= 4) {
          set((state) => ({
            sessionTimedOut: false,
            adminUser: state.adminUser ? { ...state.adminUser, lastActive: Date.now() } : null,
          }));
          const actor = get().adminUser?.name || 'Administrator';
          get().logAudit(
            actor,
            'Re-authentication Password Confirmed for Sensitive Operation',
            'Authentication',
            'Re-auth Required',
            'Re-auth Confirmed'
          );
          return true;
        }
        return false;
      },

      createMakerCheckerRequest: (title: string, module: string, details: string, initiator?: string) => {
        const actor = initiator || get().adminUser?.name || 'Vikram Sharma';
        const newItem: MakerCheckerItem = {
          id: `mc-req-${Date.now()}`,
          title,
          module,
          initiator: actor,
          status: 'Pending',
          details,
          createdAt: new Date().toISOString(),
        };
        set((state) => ({ makerCheckerRequests: [newItem, ...state.makerCheckerRequests] }));
        get().logAudit(
          actor,
          `Initiated Maker-Checker Request: ${title}`,
          module,
          'None',
          `Pending Approval (${newItem.id})`
        );
      },

      approveMakerCheckerRequest: (id: string, actor: string) => {
        const state = get();
        const req = state.makerCheckerRequests.find((r) => r.id === id);
        if (!req) return { success: false, error: 'Request not found.' };

        if (req.initiator.toLowerCase().includes(actor.toLowerCase()) || actor.toLowerCase().includes(req.initiator.toLowerCase())) {
          return {
            success: false,
            error: `Maker-Checker Violation: You cannot approve a request that you initiated (Initiator: ${req.initiator}). Another authorized officer must approve.`,
          };
        }

        set((s) => ({
          makerCheckerRequests: s.makerCheckerRequests.map((r) =>
            r.id === id ? { ...r, status: 'Approved', approver: actor, resolvedAt: new Date().toISOString() } : r
          ),
        }));

        get().logAudit(
          actor,
          `Approved Maker-Checker Request: ${req.title}`,
          req.module,
          `Pending (Initiated by ${req.initiator})`,
          `Approved by ${actor}`
        );

        return { success: true };
      },

      rejectMakerCheckerRequest: (id: string, actor: string, reason: string) => {
        const state = get();
        const req = state.makerCheckerRequests.find((r) => r.id === id);
        if (!req) return { success: false, error: 'Request not found.' };

        if (req.initiator.toLowerCase().includes(actor.toLowerCase()) || actor.toLowerCase().includes(req.initiator.toLowerCase())) {
          return {
            success: false,
            error: `Maker-Checker Violation: You cannot decide on a request that you initiated (Initiator: ${req.initiator}). Another authorized officer must act.`,
          };
        }

        set((s) => ({
          makerCheckerRequests: s.makerCheckerRequests.map((r) =>
            r.id === id ? { ...r, status: 'Rejected', approver: actor, resolvedAt: new Date().toISOString() } : r
          ),
        }));

        get().logAudit(
          actor,
          `Rejected Maker-Checker Request: ${req.title} (${reason})`,
          req.module,
          'Pending',
          `Rejected by ${actor}`
        );

        return { success: true };
      },

      // --- SETTINGS ---
      setDemoMode: (enabled: boolean) => {
        set({
          demoMode: enabled,
          quoteLockSeconds: enabled ? 60 : 600,
          sessionTimeoutSeconds: enabled ? 60 : 900,
        });
      },

      setQuoteLockSeconds: (quoteLockSeconds: number) => {
        set({ quoteLockSeconds });
      },

      resetDemoData: () => {
        set({
          rates: INITIAL_RATES,
          providerState: 'ok',
          isFeedStale: false,
          bothDownSince: null,
          pricingConfig: INITIAL_PRICING_CONFIG,
          products: MOCK_PRODUCTS,
          wishlist: ['prod-gold-01', 'prod-gem-01'],
          cart: [],
          quotes: MOCK_QUOTES,
          orders: MOCK_ORDERS,
          customers: MOCK_CUSTOMERS,
          auditLogs: MOCK_AUDIT_LOGS,
          alerts: MOCK_ALERTS,
        });
      },
    }),
    {
      name: 'aurum_commerce_storage',
      storage: createJSONStorage(() => safeStorage),
      partialize: (state) => ({
        cart: state.cart,
        orders: state.orders,
        wishlist: state.wishlist,
        demoMode: state.demoMode,
        quoteLockSeconds: state.quoteLockSeconds,
      }),
    }
  )
);
