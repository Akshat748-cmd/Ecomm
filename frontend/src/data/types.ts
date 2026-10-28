export type ProductCategory =
  | 'gold'
  | 'silver'
  | 'gemstones'
  | 'coloured-stones'
  | 'rudraksha'
  | 'gifting';

export type ProductType = 'rateLinked' | 'fixed';

export interface CertificateInfo {
  type?: string; // e.g. "BIS Hallmark", "GIA Dossier", "IGI Identification"
  issuer: string;
  number: string;
  status: 'Verified' | 'Not Found' | 'Pending';
  linkedLot?: string;
  issueDate?: string;
  documentUrl?: string;
  assayingCentre?: string;
  fileUrl?: string;
  certNumber?: string;
  agency?: string;
  assayer?: string;
  certificateNumber?: string;
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
  subcategory?: string;
  type: ProductType;
  sku: string;
  brand: string;
  description: string;
  imageUrl?: string;
  images?: string[];
  unit?: 'g' | 'kg' | 'carat' | 'piece';
  dimensions?: string;
  origin?: string;
  stoneType?: string;
  rudrakshMukhi?: number | string;
  tags?: string[];
  variant?: string;
  netWeightG: number;
  grossWeightG: number;
  purity: number; // e.g. 0.9999, 0.9167 for 22K, 0.999 for silver
  metal?: 'Gold 24K' | 'Gold 22K' | 'Silver 999';
  stock: number;
  reserved: number;
  lotBatchSerial: string;
  hsn?: string;
  gstRate?: number; // e.g. 0.03
  isLiveRate?: boolean;
  markupPercent?: number; // retail markup
  premiumPercent?: number; // minting/making premium
  makingPercent: number; // e.g. 0.04
  fixedCharges?: number;
  fixedPrice?: number; // For type: "fixed"
  mrp: number; // Maximum Retail Price
  calculatedMrp?: number;
  hallmarkStatus?: 'Certified' | 'Exempt' | 'Pending';
  huid?: string; // 6-digit alphanumeric BIS Hallmark Unique Identifier
  bisReference?: string; // BIS refinery/assayer license
  certificate: CertificateInfo;
  packagingCost?: number;
  insuranceCost?: number;
  status?: 'Active' | 'Draft' | 'Delisted';
  visibility?: 'Public' | 'Unlisted' | 'Private';
  isFeatured?: boolean;
  approvalState?: 'draft' | 'validated' | 'submitted' | 'approved' | 'rejected' | 'published';
  updatedDate?: string;
  personalizationEligible?: boolean;
  personalizationCharge?: number;
  backorderEligible?: boolean;
  rating?: number;
  barcode?: string;
  launchScheduledAt?: string;
  isDelisted?: boolean;
  damaged?: number;
  quarantined?: number;
  reorderThreshold?: number;
  seoTitle?: string;
  seoDescription?: string;
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
  | 'Returned'
  | 'Held'; // KYC Hold or payment mismatch hold

export interface OrderTimelineEntry {
  status: OrderStatus;
  timestamp: string; // ISO UTC
  actor: string;
  note?: string;
}

export interface PersonalizationDetails {
  engravingText: string;
  recipientName?: string;
  giftMessage?: string;
  occasion?: string;
  packagingOption: string;
  customizationCharge: number;
  languageLimit?: string;
  symbolLimit?: string;
  previewUrl?: string;
  productionStage: 'Proofing' | 'Engraving' | 'QA_Inspection' | 'Packing' | 'Ready_For_Dispatch';
  artworkApproved: boolean;
  qaPassed: boolean;
  qaNotes?: string;
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
  personalization?: PersonalizationDetails;
}

export interface CreditDebitNote {
  id: string;
  type: 'CreditNote' | 'DebitNote';
  originalInvoiceNumber: string;
  orderId: string;
  adjustmentAmount: number;
  taxAdjustment: number;
  reason: string;
  irn?: string;
  createdAt: string;
  approver?: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  customerId: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  customerPan?: string;
  customerGstin?: string;
  kycRequired?: boolean;
  kycVerified?: boolean;
  holdReason?: string;
  shippingAddress: {
    name: string;
    street: string;
    city: string;
    state: string;
    pincode: string;
    country: string;
  };
  isStorePickup?: boolean;
  pickupLocation?: string;
  items: OrderItem[];
  subtotal: number;
  discountAmount?: number;
  couponCode?: string;
  taxSplit?: {
    cgst: number;
    sgst: number;
    igst: number;
  };
  gstTotal: number;
  totalAmount: number;
  lockedPriceRef?: string;
  priceLockExpiresAt?: string;
  paymentStatus: 'Success' | 'Failed' | 'Pending' | 'Timeout';
  paymentMethod: string;
  paymentTransactionId?: string;
  gatewayReference?: string;
  webhookStatus?: 'Pending' | 'Verified' | 'Duplicate_Ignored' | 'Failed';
  offlinePaymentApproval?: boolean;
  settlementReference?: string;
  status: OrderStatus;
  timeline: OrderTimelineEntry[];
  courierName?: string;
  trackingNumber?: string;
  declaredValue?: number;
  insuranceRequired?: boolean;
  proofOfDeliveryUrl?: string;
  erpInvoiceNumber?: string;
  erpInvoiceAttached: boolean;
  erpInvoiceUrl?: string;
  immutablePdfUrl?: string;
  emailStatus?: 'Pending' | 'Sent' | 'Failed_Retrying' | 'Delivered';
  emailRetryCount?: number;
  irn?: string;
  qrCode?: string;
  creditDebitNotes?: CreditDebitNote[];
  returnRequest?: {
    reason: string;
    requestedAt: string;
    status: 'Pending' | 'Approved' | 'Rejected';
    resolutionNote?: string;
    refundAmount?: number;
  };
  createdAt: string;
  updatedAt: string;
}

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  dateOfBirth?: string;
  anniversary?: string;
  gstin?: string;
  pan?: string;
  panNumber?: string;
  panVerified?: boolean;
  kycStatus: 'Pending' | 'Verified' | 'Exempt' | 'Rejected' | 'pending' | 'verified';
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
  channelConsent?: {
    email: boolean;
    sms: boolean;
    whatsapp: boolean;
    push: boolean;
  };
  preferredLanguage?: string;
  recentSearches?: string[];
  savedForLater?: string[];
  riskFlags?: string[];
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

export interface PriceLockConfig {
  durationSeconds: number; // Duration must be > 0
  eligibleProductTypes: string[];
  expiryBehaviour: 'block_payment_force_reprice';
}

export interface Offer {
  id: string;
  name: string;
  code: string;
  type: 'percent' | 'flat';
  discountValue: number;
  minOrderValue: number;
  categoryOrSku: string;
  customerSegment?: string;
  usageLimitTotal: number;
  usageLimitPerCustomer: number;
  usedCount: number;
  startDate: string;
  endDate: string;
  combinable: boolean;
  approvalStatus: 'Draft' | 'Approved' | 'Active' | 'Paused' | 'Expired';
  marginGuardrailPercent: number; // Disallows coupon if bullion gross margin drops below guardrail
}

export interface CorporateEnquiry {
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
  brandingRequired: boolean;
  deliverySchedule: string;
  recipientCount: number;
  remarks: string;
  leadSource: string;
  status: 'New' | 'Qualified' | 'Quoted' | 'Approved' | 'Fulfillment' | 'Closed';
  createdAt: string;
}

export interface CorporateQuote {
  id: string;
  enquiryId: string;
  quoteNumber: string;
  items: {
    productId: string;
    name: string;
    quantity: number;
    unitPrice: number;
    customizationCost: number;
  }[];
  subtotal: number;
  tax: number;
  total: number;
  marginPercent: number;
  isMarginApproved: boolean;
  marginApprover?: string;
  expiresAt: string;
  paymentTerms: string;
  brandingProofUrl?: string;
  status: 'Draft' | 'Submitted' | 'Margin_Approved' | 'Accepted' | 'Expired';
}

export interface CorporateRecipient {
  id: string;
  quoteId: string;
  name: string;
  phone: string;
  email?: string;
  address: string;
  pincode: string;
  giftVariant: string;
  customMessage?: string;
  shipmentGroupId: string;
  deliveryStatus: 'Pending' | 'Dispatched' | 'Delivered';
}

export interface CorporateShipmentGroup {
  id: string;
  quoteId: string;
  name: string;
  courier: string;
  trackingNumber?: string;
  recipientCount: number;
  status: 'Pending' | 'Dispatched' | 'Delivered';
}

export interface SupportTicket {
  id: string;
  ticketNumber: string;
  orderId?: string;
  customerId: string;
  customerName: string;
  issueType: 'Return' | 'Cancellation' | 'Damage' | 'Delivery_Delay' | 'General';
  priority: 'High' | 'Medium' | 'Low';
  slaHours: number;
  assignee: string;
  status: 'Open' | 'In_Progress' | 'Pending_Evidence' | 'Resolved' | 'Closed';
  subject: string;
  message: string;
  attachments?: string[];
  resolutionNotes?: string;
  creditDebitNoteId?: string;
  createdAt: string;
  resolvedAt?: string;
}

export type ApprovalType =
  | 'price_override'
  | 'high_value_refund'
  | 'stock_adjustment'
  | 'compliance_edit'
  | 'low_margin_quote'
  | 'credit_terms';

export interface ApprovalRequest {
  id: string;
  type: ApprovalType;
  title: string;
  entityId: string;
  requester: string;
  approver?: string;
  amount?: number;
  reason: string;
  beforeState?: any;
  afterState?: any;
  status: 'Pending' | 'Approved' | 'Rejected';
  createdAt: string;
  resolvedAt?: string;
  approvalLimit?: number;
}

export type CommunicationChannel = 'email' | 'sms' | 'whatsapp' | 'push' | 'in_app';

export interface CommunicationEvent {
  id: string;
  channel: CommunicationChannel;
  eventType: string; // e.g. "otp", "order_confirmation", "invoice_issued", "shipment_dispatched", "refund_approved"
  template: string;
  version: string;
  language: string;
  recipientContact: string;
  consentChecked: boolean;
  priorityFallback?: string;
  retryCount: number;
  deliveryStatus: 'Queued' | 'Sent' | 'Delivered' | 'Failed';
  failureReason?: string;
  timestamp: string;
}

export interface PricingLedgerEntry {
  id: string;
  timestamp: string;
  source: string; // MCX India, LBMA London
  metal: string;
  baseRate: number;
  purityConversion: number;
  markupPercent: number;
  premiumCharges: number;
  packagingInsurance: number;
  gst: number;
  lockedPrice?: number;
  overrideReason?: string;
  approvedBy?: string;
}

export interface OrderLedgerEntry {
  id: string;
  timestamp: string;
  orderId: string;
  orderNumber: string;
  paymentWebhookId?: string;
  lockedPriceRef?: string;
  stockReservationDelta: number;
  invoiceNumber?: string;
  shipmentTracking?: string;
  refundCreditNoteId?: string;
  communicationEventIds: string[];
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
  type:
    | 'product_view'
    | 'search'
    | 'add_to_cart'
    | 'checkout_start'
    | 'payment_result'
    | 'support_request'
    | 'return_request'
    | 'cart_save_for_later'
    | 'coupon_applied'
    | 'otp_requested'
    | 'customer_registered'
    | 'customer_login'
    | 'customer_logout'
    | 'customer_profile_update'
    | 'order_address_updated'
    | 'corporate_enquiry_submitted'
    | 'corporate_quote_accepted'
    | 'support_ticket_created'
    | 'admin_action';
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
  status?: 'Active' | 'Inactive';
}

export interface MakerCheckerItem {
  id: string;
  title: string;
  module: string;
  initiator: string;
  approver?: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  details: string;
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

export interface Testimonial {
  id: string;
  quote: string;
  customerName: string;
  permissionGranted: boolean;
  productName: string;
  productSku: string;
  rating: number;
  approvalStatus: 'Approved' | 'Pending' | 'Rejected';
  city: string;
  date: string;
}

