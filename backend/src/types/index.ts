export type ProductCategory =
  | 'gold'
  | 'silver'
  | 'gemstones'
  | 'coloured-stones'
  | 'rudraksha'
  | 'gifting';

export type ProductType = 'rateLinked' | 'fixed';

export interface CertificateInfo {
  issuer: string;
  number: string;
  status: 'Verified' | 'Not Found' | 'Pending';
  linkedLot?: string;
  issueDate?: string;
  documentUrl?: string;
}

export interface BullionAttributes {
  metal: 'Gold' | 'Silver';
  purity: string; // e.g. "999.9", "999", "916"
  fineWeightG: number;
  batch: string;
  serialNumber?: string;
  assayManufacturer: string;
}

export interface GemstoneAttributes {
  variety: string; // Ruby, Emerald, Blue Sapphire, Yellow Sapphire
  caratWeight: number;
  dimensions: string; // e.g. "8.2 x 6.1 x 4.0 mm"
  cut: string; // Cushion Mixed Cut, Oval Brilliant
  color: string; // Pigeon Blood Red, Vivid Green
  clarity: string; // Eye Clean, Slightly Included
  treatment: string; // Unheated / Untreated
  origin: string; // Burma, Colombia, Ceylon
  lotNumber: string;
}

export interface RudrakshaAttributes {
  mukhi: number | string; // 5 Mukhi, 7 Mukhi, Collector Mukhi
  beadCount?: number; // e.g. 108 + 1 for mala, 1 for single
  sizeMm?: number; // e.g. 18mm
  thread: string; // Red Silk, Sacred Cotton, Silver Wire
  metalCapping?: string; // Pure Silver 925, 22K Gold Capped, None
  supplierLot: string;
  provenance: string; // Nepal, Java, Haridwar
}

export interface Product {
  id: string;
  slug: string;
  name: string;
  category: ProductCategory;
  type: ProductType;
  sku: string;
  brand: string;
  description: string;
  imageUrl?: string;
  images?: string[];
  netWeightG: number;
  grossWeightG: number;
  purity: number; // e.g. 0.999, 0.9167 for 22K, 0.999 for silver
  metal?: 'Gold 24K' | 'Gold 22K' | 'Silver 999';
  stock: number;
  reserved: number;
  lotBatchSerial: string;
  certificate: CertificateInfo;
  mrp: number; // Maximum Retail Price
  makingPercent: number; // e.g. 0.08 for 8%
  fixedPrice?: number; // For type: "fixed"
  packagingCost?: number;
  insuranceCost?: number;
  status?: 'Active' | 'Draft' | 'Delisted';
  variant?: string;
  barcode?: string;
  launchScheduledAt?: string;
  isDelisted?: boolean;
  damaged?: number;
  quarantined?: number;
  reorderThreshold?: number;
  attributes: {
    bullion?: BullionAttributes;
    gemstone?: GemstoneAttributes;
    rudraksha?: RudrakshaAttributes;
    general?: Record<string, string>;
  };
}

export type OrderStatus =
  | 'Placed'
  | 'Payment confirmed'
  | 'Picked'
  | 'Packed'
  | 'Quality checked'
  | 'Invoice issued'
  | 'Dispatched'
  | 'Delivered'
  | 'Cancelled'
  | 'Return requested'
  | 'Returned';

export interface OrderTimelineEntry {
  status: OrderStatus;
  timestamp: string; // ISO UTC
  actor: string;
  note?: string;
}

export interface OrderItem {
  productId: string;
  sku: string;
  name: string;
  category: ProductCategory;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  ratePerGramSnapshot?: number;
  makingCharges?: number;
  gstAmount: number;
  personalization?: any;
}

export interface Order {
  id: string;
  orderNumber: string;
  customerId?: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  shippingAddress: {
    name: string;
    street: string;
    city: string;
    state: string;
    pincode: string;
    country: string;
  };
  items: OrderItem[];
  subtotal: number;
  gstTotal: number;
  totalAmount: number;
  panNumber?: string;
  paymentStatus: 'Success' | 'Failed' | 'Pending' | 'Timeout';
  paymentMethod: string;
  paymentTransactionId?: string;
  status: OrderStatus;
  timeline: OrderTimelineEntry[];
  courierName?: string;
  trackingNumber?: string;
  erpInvoiceNumber?: string;
  erpInvoiceAttached: boolean;
  erpInvoiceUrl?: string;
  returnRequest?: {
    reason: string;
    requestedAt: string;
    status: 'Pending' | 'Approved' | 'Rejected';
    resolutionNote?: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  isVerified: boolean;
  totalOrders: number;
  totalSpent: number;
  addresses: {
    id: string;
    type: 'Home' | 'Office';
    street: string;
    city: string;
    state: string;
    pincode: string;
    isDefault: boolean;
  }[];
  consents: {
    marketing: boolean;
    smsAlerts: boolean;
    whatsappUpdates: boolean;
  };
  notes: string[];
  orderNotes?: CustomerOrderNote[];
  supportHistory?: CustomerSupportInteraction[];
  fraudFlag: boolean;
  createdAt: string;
}

export interface CustomerOrderNote {
  id: string;
  customerId: string;
  orderId?: string;
  orderNumber?: string;
  note: string;
  author: string;
  createdAt: string;
}

export interface CustomerSupportInteraction {
  id: string;
  customerId: string;
  orderId?: string;
  orderNumber?: string;
  channel: 'Email' | 'Phone Concierge' | 'WhatsApp' | 'In-Vault Consultation';
  subject: string;
  status: 'Open' | 'Resolved' | 'In Review';
  summary: string;
  officer: string;
  createdAt: string;
  resolvedAt?: string;
}

export interface Quote {
  id: string;
  customerId?: string;
  productId: string;
  productName: string;
  quantity: number;
  ratePerGramSnapshot: number;
  metalPurity: string;
  priceBreakdown: {
    metalValue: number;
    making: number;
    packaging: number;
    insurance: number;
    subtotal: number;
    gst: number;
    total: number;
  };
  createdAt: string; // UTC ISO
  expiresAt: string; // UTC ISO
  status: 'Active' | 'Accepted' | 'Expired' | 'Cancelled';
}

export interface Alert {
  id: string;
  type: 'rate_failure' | 'payment_mismatch' | 'stock_issue' | 'refund_ageing' | 'shipment_delay' | 'security_event' | 'parked';
  severity: 'high' | 'medium' | 'low';
  title: string;
  description: string;
  timestamp: string;
  isParked?: boolean;
  resolved: boolean;
}

export interface PriceHistoryRow {
  id: string;
  version: string;
  timestamp: string;
  actor: string;
  changes: string;
  status: 'Active' | 'Superseded';
}

export interface AuditRow {
  id: string;
  actor: string;
  action: string;
  timestamp: string; // UTC ISO
  module: string;
  before: string;
  after: string;
  ipAddress?: string;
}

export interface CourierPartner {
  id: string;
  name: string;
  code: string;
  serviceType: string;
  insuredTransit: boolean;
  contactNumber: string;
  status: 'Active' | 'Maintenance';
}

export interface SupplierRecord {
  id: string;
  name: string;
  category: ProductCategory;
  hallmarkingLicenseNo: string;
  gstin: string;
  city: string;
  contactPerson: string;
  status: 'Active' | 'Audit Due';
}

export interface PurchaseRecord {
  id: string;
  purchaseInvoiceNo: string;
  supplierId: string;
  supplierName: string;
  lotNumber: string;
  receivedDate: string;
  metalPurityGrade: string;
  quantityReceived: number;
  unitCostBasis: number;
  totalCostBasis: number;
  status: 'Received' | 'Assayed & Accepted' | 'Under Inspection' | 'Rejected';
}

export type InventoryActionType = 'Receipt' | 'Reservation Release' | 'Adjustment' | 'Reconciliation';

export interface InventoryLog {
  id: string;
  timestamp: string; // ISO UTC
  productId: string;
  productName: string;
  sku: string;
  action: InventoryActionType;
  actor: string;
  delta: number;
  onHandAfter: number;
  reservedAfter: number;
  availableAfter: number;
  notes: string;
  lotBatch?: string;
}

export interface LiveRates {
  gold24k: number; // Rs per gram
  gold22k: number; // Rs per gram (24K * 0.9167)
  silver999: number; // Rs per gram
  lastUpdated: string; // UTC ISO
}

export type ProviderState = 'ok' | 'primaryFailed' | 'bothDown';

export interface PricingCostComponents {
  makingPercentBullion: number; // e.g. 0.04
  makingPercentJewellery: number; // e.g. 0.12
  assayCertificateCost: number; // Rs 350
  packagingCost: number; // Rs 250
  insuranceCost: number; // Rs 450
  gstPercent: number; // 0.03
  roundingRule: 'round' | 'ceil' | 'floor';
  marginPercentBullion: number; // 0.015
  marginPercentJewellery: number; // 0.05
}

export interface PricingConfig {
  formulaVersion: string;
  costComponents: PricingCostComponents;
  pricingModelPerCategory: Record<ProductCategory, 'Dynamic' | 'Fixed' | 'Hybrid'>;
}

export interface StoreEvent {
  id: string;
  type: 'product_view' | 'search' | 'add_to_cart' | 'checkout_start' | 'payment_result' | 'support_request' | 'return_request';
  details: string;
  timestamp: string; // UTC ISO
  metadata?: Record<string, any>;
}

export type AdminRole =
  | 'Super Admin'
  | 'Pricing'
  | 'Catalogue'
  | 'Warehouse'
  | 'Support'
  | 'Finance'
  | 'Auditor';

export interface AdminUser {
  name: string;
  email: string;
  role: AdminRole;
  isAuthenticated: boolean;
  mfaVerified: boolean;
  lastActive: number;
}

export interface MakerCheckerItem {
  id: string;
  title: string;
  module: string;
  actionType?: string;
  initiator: string;
  approver?: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  details: string;
  payload?: any;
  createdAt: string;
  resolvedAt?: string;
}

export interface InsuranceClaim {
  id: string;
  orderId: string;
  orderNumber: string;
  courierName: string;
  trackingNumber: string;
  claimAmount: number;
  reason: string;
  status: 'Filed' | 'Under Investigation' | 'Approved' | 'Settled';
  createdAt: string;
  filedBy: string;
}

export interface SettlementRecord {
  id: string;
  transactionId: string;
  orderNumber: string;
  customerName: string;
  amount: number;
  gatewayFee: number;
  netSettlement: number;
  gatewayStatus: 'Settled' | 'Pending' | 'Failed';
  reconciliationStatus: 'Matched' | 'Unmatched' | 'Reconciled';
  settledAt?: string;
}

export interface ComplianceChecklistItem {
  id: string;
  category: 'GST & Legal Metrology' | 'BIS Hallmark & Assay' | 'Product Claims & Certs' | 'Returns & Disclosures' | 'Data Privacy & DPDP';
  title: string;
  description: string;
  statutoryReference: string;
  isCompliant: boolean;
  lastAuditDate: string;
  auditedBy: string;
  riskLevel: 'Low' | 'Medium' | 'Critical';
}

export interface DocumentVersionRecord {
  id: string;
  title: string;
  code: string;
  currentVersion: string;
  effectiveDate: string;
  approvedBy: string;
  status: 'Effective' | 'Pending Review' | 'Superseded';
  reviewCycle: string;
  notes: string;
}

