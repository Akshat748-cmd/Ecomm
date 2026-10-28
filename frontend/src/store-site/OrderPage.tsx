import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAppStore } from '../store';
import { useSEO } from '../lib/useSEO';
import { formatINR, formatFullDateTime } from '../lib/pricing';
import { Card } from '../components/Card';
import { Badge } from '../components/Badge';
import { Button } from '../components/Button';
import { Modal } from '../components/Modal';
import {
  Clock,
  Truck,
  FileText,
  Download,
  Headphones,
  ChevronRight,
  ShieldCheck,
  Package,
  Store,
  MapPin,
  Edit2,
  AlertTriangle,
  CheckCircle2,
  Mail,
  QrCode,
  Lock,
  Sparkles,
} from 'lucide-react';

export const OrderPage: React.FC = () => {
  const { id = '' } = useParams<{ id: string }>();
  const { orders, updateOrderShippingAddress } = useAppStore();

  const order = orders.find(
    (o) =>
      o.id.toLowerCase() === id?.toLowerCase() ||
      o.orderNumber.toLowerCase() === id?.toLowerCase() ||
      ((id === 'ORD-2026-001' || id === 'ORD-2026-901' || id === 'AUR-ORD-901') &&
        (o.id === 'ORD-2026-001' || o.id === 'ORD-2026-901'))
  );

  useSEO({
    title: order ? `Order ${order.orderNumber}` : 'Order Detail',
    description: order
      ? `Status and tracking timeline for order ${order.orderNumber}. Insured delivery via authorized armoured logistics.`
      : 'Order tracking and verification.',
    canonicalPath: `/order/${id}`,
  });

  const [invoiceModalOpen, setInvoiceModalOpen] = useState(false);
  const [addressModalOpen, setAddressModalOpen] = useState(false);
  const [emailSentToast, setEmailSentToast] = useState<string | null>(null);

  // Address edit fields
  const [editStreet, setEditStreet] = useState(order?.shippingAddress?.street || '');
  const [editCity, setEditCity] = useState(order?.shippingAddress?.city || '');
  const [editState, setEditState] = useState(order?.shippingAddress?.state || '');
  const [editPincode, setEditPincode] = useState(order?.shippingAddress?.pincode || '');
  const [addressUpdateResult, setAddressUpdateResult] = useState<{ success: boolean; message: string } | null>(null);

  if (!order) {
    return (
      <div className="py-16 text-center space-y-4 max-w-md mx-auto">
        <h1 className="font-serif text-3xl font-bold text-[#5A4630]">Order Not Found</h1>
        <p className="text-xs text-[#7A6A55]">
          Could not locate any order matching reference identifier #{id}.
        </p>
        <Link to="/account">
          <Button variant="primary" size="md">View Account Order History</Button>
        </Link>
      </div>
    );
  }

  // Statutory rule: lock address edits after dispatch
  const isDispatchedOrDelivered = order.status === 'Dispatched' || order.status === 'Delivered';

  const handleOpenAddressModal = () => {
    setEditStreet(order.shippingAddress?.street || '');
    setEditCity(order.shippingAddress?.city || '');
    setEditState(order.shippingAddress?.state || '');
    setEditPincode(order.shippingAddress?.pincode || '');
    setAddressUpdateResult(null);
    setAddressModalOpen(true);
  };

  const handleSaveAddress = (e: React.FormEvent) => {
    e.preventDefault();
    if (isDispatchedOrDelivered) return;

    if (editPincode.trim().startsWith('9')) {
      setAddressUpdateResult({
        success: false,
        message: 'Pincodes starting with 9 are outside our high-value armoured transit routes.',
      });
      return;
    }

    const res = updateOrderShippingAddress(order.id, {
      ...order.shippingAddress,
      street: editStreet,
      city: editCity,
      state: editState,
      pincode: editPincode,
    });

    setAddressUpdateResult(res);
    if (res.success) {
      setTimeout(() => setAddressModalOpen(false), 1500);
    }
  };

  const handleResendInvoice = () => {
    setEmailSentToast(`Tax invoice for ${order.orderNumber} dispatched to ${order.customerEmail}.`);
    setTimeout(() => setEmailSentToast(null), 5000);
  };

  const paymentBadgeVariant =
    order.paymentStatus === 'Success'
      ? 'sage'
      : order.paymentStatus === 'Failed'
      ? 'coral'
      : 'amber';

  const invoiceNumber = order.erpInvoiceNumber || `INV-2026-${order.orderNumber.replace(/\D/g, '').slice(-4)}`;

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Breadcrumb */}
      <nav aria-label="Breadcrumb" className="text-xs text-[#7A6A55] flex items-center gap-1.5 flex-wrap">
        <Link to="/" className="hover:text-[#C9A24B]">Home</Link>
        <ChevronRight className="w-3.5 h-3.5 text-[#EADFC8]" />
        <Link to="/account" className="hover:text-[#C9A24B]">Account</Link>
        <ChevronRight className="w-3.5 h-3.5 text-[#EADFC8]" />
        <span className="text-[#5A4630] font-medium font-mono">{order.orderNumber}</span>
      </nav>

      {/* Notifications */}
      {emailSentToast && (
        <div className="p-3.5 bg-[#DCE8D5] border border-[#A4C997] rounded-lg text-xs text-[#2D5A27] flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{emailSentToast}</span>
        </div>
      )}

      {/* Order Header Card */}
      <Card variant="surface" className="p-6 sm:p-8 border-[#EADFC8] space-y-6 shadow-[0_4px_24px_rgba(90,70,48,0.06)]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#EADFC8]">
          <div>
            <div className="flex items-center gap-2 mb-1.5 flex-wrap">
              <span className="text-xs font-bold text-[#5A4630] uppercase tracking-wider">
                Order Reference
              </span>
              <Badge variant={paymentBadgeVariant} size="sm">
                Payment: {order.paymentStatus}
              </Badge>
              <Badge variant="gold" size="sm">
                Status: {order.status}
              </Badge>
              {order.isStorePickup && (
                <Badge variant="sage" size="sm">
                  Store Vault Pickup
                </Badge>
              )}
            </div>
            <h1 className="font-serif text-3xl font-bold text-[#5A4630] font-mono">
              {order.orderNumber}
            </h1>
            <p className="text-xs text-[#7A6A55] mt-0.5">
              Placed on {formatFullDateTime(order.createdAt)} • Payment Method: <strong>{order.paymentMethod}</strong>
            </p>
          </div>

          <div className="text-left sm:text-right">
            <span className="text-xs text-[#7A6A55]">Total Payable Amount</span>
            <div className="font-serif text-3xl font-bold text-[#5A4630] tabular-nums">
              {formatINR(order.totalAmount)}
            </div>
            <span className="text-[11px] text-[#7A6A55]">(Inclusive of 3% Statutory GST)</span>
          </div>
        </div>

        {/* KYC Hold Notice if applicable */}
        {order.status === 'Held' && (
          <div className="p-4 bg-[#FBE7B8] border border-[#E8C26E] rounded-xl text-xs text-[#7A5310] space-y-1">
            <div className="flex items-center gap-1.5 font-bold">
              <AlertTriangle className="w-4 h-4 text-[#7A5310]" />
              <span>Compliance Notice: Order Held Under Statutory KYC Mandate</span>
            </div>
            <p>
              {order.holdReason || 'Statutory PAN verification is required for transactions exceeding ₹2,00,000 under Rule 114B. Please upload or verify your PAN in the Account section to release this order to dispatch.'}
            </p>
          </div>
        )}

        {/* Regulatory Notice Banner */}
        <div className="p-3 bg-[#FFFBF3] border border-[#EADFC8] rounded-lg text-xs text-[#5A4630] flex items-center justify-between flex-wrap gap-2">
          <span className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-[#C9A24B]" />
            <strong>Regulatory Custody Notice:</strong> Insured under global bullion underwriter transit policy. COD is strictly prohibited.
          </span>
          <span className="text-[11px] text-[#7A6A55]">100% Insured Value: {formatINR(order.totalAmount)}</span>
        </div>

        {/* Fulfilment & Custody Timeline */}
        <div className="space-y-4">
          <h2 className="font-serif text-lg font-bold text-[#5A4630] flex items-center gap-2">
            <Clock className="w-4 h-4 text-[#C9A24B]" />
            Fulfilment & Custody Timeline
          </h2>

          <div className="relative border-l-2 border-[#EADFC8] ml-4 pl-6 space-y-6 py-2">
            {order.timeline.map((step, idx) => {
              const isLast = idx === order.timeline.length - 1;
              return (
                <div key={idx} className="relative group">
                  <span
                    className={`absolute -left-[31px] top-0.5 w-4 h-4 rounded-full border-2 ${
                      isLast
                        ? 'bg-[#C9A24B] border-[#5A4630] ring-4 ring-[#F1E3BD]'
                        : 'bg-[#DCE8D5] border-[#A4C997]'
                    }`}
                  />
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-[#5A4630] font-serif">
                        {step.status}
                      </span>
                      <span className="text-[10px] text-[#7A6A55] font-mono">
                        {formatFullDateTime(step.timestamp)}
                      </span>
                    </div>
                    <p className="text-xs text-[#7A6A55]">
                      Logged by: <strong>{step.actor}</strong>
                      {step.note && <span className="italic ml-1">({step.note})</span>}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Fulfilment Destination Card (Delivery vs Store Pickup) */}
        <div className="p-5 bg-[#F8EFD9] rounded-xl border border-[#EADFC8] space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-[#EADFC8]">
            <span className="font-serif font-bold text-sm text-[#5A4630] flex items-center gap-2">
              {order.isStorePickup ? (
                <>
                  <Store className="w-4 h-4 text-[#C9A24B]" />
                  <span>Sovereign Vault Collection Lounge</span>
                </>
              ) : (
                <>
                  <MapPin className="w-4 h-4 text-[#C9A24B]" />
                  <span>Insured Delivery Address</span>
                </>
              )}
            </span>

            {/* Address Edit Action with statutory lock rule */}
            {!order.isStorePickup && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleOpenAddressModal}
                leftIcon={isDispatchedOrDelivered ? <Lock className="w-3.5 h-3.5" /> : <Edit2 className="w-3.5 h-3.5" />}
              >
                {isDispatchedOrDelivered ? 'Address Locked' : 'Modify Address'}
              </Button>
            )}
          </div>

          {order.isStorePickup ? (
            <div className="text-xs text-[#5A4630] space-y-1">
              <p className="font-bold text-sm">{order.pickupLocation || 'Mumbai Sovereign Vault, Fort'}</p>
              <p className="text-[#7A6A55]">Hours: Monday–Saturday, 10:30 AM – 7:30 PM</p>
              <p className="text-[11px] text-[#7A6A55]">
                Verification Required: Please carry government photo ID (PAN / Aadhaar) and this order confirmation reference.
              </p>
            </div>
          ) : (
            <div className="text-xs text-[#5A4630] space-y-1">
              <p className="font-semibold">{order.shippingAddress?.name || order.customerName}</p>
              <p>{order.shippingAddress?.street}</p>
              <p>{order.shippingAddress?.city}, {order.shippingAddress?.state} - {order.shippingAddress?.pincode}</p>
              <p className="text-[#7A6A55]">Recipient Phone: {order.customerPhone}</p>
            </div>
          )}
        </div>

        {/* Tracking & Courier Logistics Information */}
        {!order.isStorePickup && (
          <div className="p-5 bg-[#FFFBF3] rounded-xl border border-[#EADFC8] grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div>
              <span className="text-[#7A6A55] font-medium block mb-1">Armoured Logistics Partner</span>
              <span className="font-bold text-[#5A4630] flex items-center gap-1.5 text-sm">
                <Truck className="w-4 h-4 text-[#C9A24B]" />
                {order.courierName || 'Sequel Secure Precious Logistics'}
              </span>
            </div>

            <div>
              <span className="text-[#7A6A55] font-medium block mb-1">Insured Consignment AWB</span>
              <span className="font-mono font-bold text-[#5A4630] text-sm">
                {order.trackingNumber || 'Pending Courier Manifest Assignment'}
              </span>
            </div>

            <div>
              <span className="text-[#7A6A55] font-medium block mb-1">Transit Protection & ETA</span>
              <span className="font-bold text-[#5A4630] text-sm">
                2–4 Business Days (OTP Required)
              </span>
            </div>
          </div>
        )}

        {/* Items Summary Table */}
        <div className="space-y-3">
          <h2 className="font-serif text-lg font-bold text-[#5A4630] flex items-center gap-2">
            <Package className="w-4 h-4 text-[#C9A24B]" />
            Ordered Articles ({order.items.length})
          </h2>

          <div className="border border-[#EADFC8] rounded-xl overflow-x-auto">
            <table className="w-full min-w-[540px] text-left text-xs border-collapse">
              <thead>
                <tr className="bg-[#FFFBF3] border-b border-[#EADFC8] text-[#5A4630] font-semibold">
                  <th className="py-3 px-4">SKU / Item</th>
                  <th className="py-3 px-4">Qty</th>
                  <th className="py-3 px-4">Rate Snapshot</th>
                  <th className="py-3 px-4">GST (3%)</th>
                  <th className="py-3 px-4 text-right">Total (INR)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EADFC8]">
                {order.items.map((it, idx) => (
                  <React.Fragment key={idx}>
                    <tr className="hover:bg-[#FFFBF3]/40">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-lg overflow-hidden border border-[#EADFC8] bg-[#FAF6EE] shrink-0 shadow-2xs">
                            <img
                              src={`/products/${it.productId}.jpg`}
                              alt={it.name}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div>
                            <div className="font-medium text-[#5A4630]">{it.name}</div>
                            <div className="text-[10px] font-mono text-[#7A6A55]">SKU: {it.sku}</div>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4 font-bold text-[#5A4630]">{it.quantity}</td>
                      <td className="py-3 px-4 text-[#7A6A55] tabular-nums">
                        {it.ratePerGramSnapshot ? `${formatINR(it.ratePerGramSnapshot)}/g` : 'Fixed'}
                      </td>
                      <td className="py-3 px-4 text-[#7A6A55] tabular-nums">
                        {formatINR(it.gstAmount)}
                      </td>
                      <td className="py-3 px-4 text-right font-serif font-bold text-[#5A4630] tabular-nums">
                        {formatINR(it.totalPrice)}
                      </td>
                    </tr>

                    {/* Bespoke Personalization Details & 5-Step Production Tracker */}
                    {it.personalization && (
                      <tr className="bg-[#FAF6EE]/70">
                        <td colSpan={5} className="py-4 px-6 border-b border-[#EADFC8]">
                          <div className="space-y-4">
                            {/* Personalization Details Card */}
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 bg-white border border-[#EADFC8] rounded-xl shadow-xs">
                              <div className="space-y-1">
                                <div className="flex items-center gap-2">
                                  <span className="text-[10px] font-bold uppercase tracking-wider bg-[#F1E3BD] text-[#5A4630] px-2 py-0.5 rounded">
                                    Bespoke Personalization
                                  </span>
                                  {it.personalization.occasion && (
                                    <span className="text-[10px] font-medium text-[#7A6A55] border border-[#EADFC8] px-2 py-0.5 rounded">
                                      Occasion: {it.personalization.occasion}
                                    </span>
                                  )}
                                </div>
                                <div className="text-xs text-[#5A4630] flex items-center gap-2">
                                  <span className="text-[#7A6A55]">Laser Inscription:</span>
                                  <strong className="font-serif italic text-sm text-[#C9A24B]">"{it.personalization.engravingText}"</strong>
                                </div>
                                {it.personalization.giftMessage && (
                                  <div className="text-xs text-[#7A6A55] italic">
                                    Card Message: "{it.personalization.giftMessage}"
                                  </div>
                                )}
                              </div>
                              <div className="text-left sm:text-right text-xs">
                                <span className="text-[#7A6A55] block text-[11px]">Packaging & Casing:</span>
                                <span className="font-semibold text-[#5A4630]">{it.personalization.packagingOption}</span>
                                {it.personalization.qaPassed && (
                                  <div className="mt-1">
                                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-[#2D5A27] bg-[#DCE8D5] px-2 py-0.5 rounded">
                                      <CheckCircle2 className="w-3 h-3" /> QA Inspected & Passed
                                    </span>
                                  </div>
                                )}
                              </div>
                            </div>

                            {/* 5-Step Custom Production Stage Tracker */}
                            <div className="p-4 bg-white border border-[#EADFC8] rounded-xl space-y-3">
                              <div className="flex items-center justify-between">
                                <span className="text-xs font-bold text-[#5A4630] flex items-center gap-1.5 uppercase tracking-wide">
                                  <Sparkles className="w-4 h-4 text-[#C9A24B]" />
                                  Bespoke Artisan Production Progress
                                </span>
                                <span className="text-[11px] text-[#7A6A55]">
                                  Current Stage:{' '}
                                  <strong className="text-[#C9A24B] capitalize">
                                    {it.personalization.productionStage.replace(/_/g, ' ')}
                                  </strong>
                                </span>
                              </div>

                              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 pt-2">
                                {[
                                  { stage: 'Proofing', label: '1. Proofing', desc: 'Typesetting & Vector Proof' },
                                  { stage: 'Engraving', label: '2. Engraving', desc: 'Fiber Laser Micro-Etch' },
                                  { stage: 'QA_Inspection', label: '3. QA Inspection', desc: 'Assay & Optical Check' },
                                  { stage: 'Packing', label: '4. Packing', desc: 'Velvet Seal & Encasing' },
                                  { stage: 'Ready_For_Dispatch', label: '5. Ready', desc: 'Armoured Transit Handoff' },
                                ].map((step, sIdx) => {
                                  const stageOrder = ['Proofing', 'Engraving', 'QA_Inspection', 'Packing', 'Ready_For_Dispatch'];
                                  const currentIdx = stageOrder.indexOf(it.personalization!.productionStage);
                                  const isPassed = sIdx < currentIdx;
                                  const isCurrent = sIdx === currentIdx;

                                  return (
                                    <div key={step.stage} className="text-center space-y-1 relative">
                                      <div className="flex items-center justify-center">
                                        <div
                                          className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                                            isPassed
                                              ? 'bg-[#2D5A27] text-white shadow-xs'
                                              : isCurrent
                                              ? 'bg-[#C9A24B] text-white ring-4 ring-[#F1E3BD] shadow-xs'
                                              : 'bg-[#F8EFD9] text-[#7A6A55] border border-[#EADFC8]'
                                          }`}
                                        >
                                          {isPassed ? <CheckCircle2 className="w-4 h-4" /> : sIdx + 1}
                                        </div>
                                      </div>
                                      <div
                                        className={`text-[11px] font-bold ${
                                          isCurrent ? 'text-[#C9A24B]' : isPassed ? 'text-[#2D5A27]' : 'text-[#7A6A55]'
                                        }`}
                                      >
                                        {step.label}
                                      </div>
                                      <div className="text-[9px] text-[#7A6A55] hidden sm:block leading-tight">
                                        {step.desc}
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Legal Tax Invoice Area */}
        <div className="p-5 bg-[#FFFFFF] border border-[#EADFC8] rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <FileText className="w-5 h-5 text-[#C9A24B] shrink-0 mt-0.5" />
            <div className="text-xs space-y-0.5">
              <strong className="font-semibold text-[#5A4630]">Legal Tax Invoice Status:</strong>
              {order.paymentStatus === 'Success' || order.erpInvoiceAttached ? (
                <p className="text-[#2D5A27]">
                  Tax Invoice <strong>#{invoiceNumber}</strong> has been issued and IRN digitally signed.
                </p>
              ) : (
                <p className="text-[#7A6A55]">
                  Invoice will be generated upon payment settlement and authorization.
                </p>
              )}
            </div>
          </div>

          {order.paymentStatus === 'Success' || order.erpInvoiceAttached ? (
            <div className="flex items-center gap-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setInvoiceModalOpen(true)}
                leftIcon={<FileText className="w-3.5 h-3.5 text-[#C9A24B]" />}
              >
                View Tax Invoice
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleResendInvoice}
                leftIcon={<Mail className="w-3.5 h-3.5" />}
              >
                Email Copy
              </Button>
            </div>
          ) : (
            <span className="text-[11px] text-[#7A6A55] italic bg-[#FFFBF3] px-3 py-1.5 rounded border border-[#EADFC8]">
              Awaiting Payment Confirmation
            </span>
          )}
        </div>

        {/* Concierge Support Link */}
        <div className="pt-2 border-t border-[#EADFC8] flex flex-col sm:flex-row items-center justify-between text-xs text-[#7A6A55] gap-3">
          <span>Have inquiries regarding this bullion consignment?</span>
          <Link
            to="/support"
            className="text-[#C9A24B] hover:underline font-semibold flex items-center gap-1.5"
          >
            <Headphones className="w-4 h-4" />
            <span>Connect with Client Concierge</span>
          </Link>
        </div>
      </Card>

      {/* Address Edit Modal with Statutory Lock Enforcement */}
      <Modal
        isOpen={addressModalOpen}
        onClose={() => setAddressModalOpen(false)}
        title="Modify Insured Delivery Destination"
        maxWidth="md"
      >
        <form onSubmit={handleSaveAddress} className="space-y-4 text-xs">
          {/* Statutory Lock Warning */}
          {isDispatchedOrDelivered ? (
            <div className="p-4 bg-[#F7D4CF] border border-[#E89E95] rounded-xl text-xs text-[#8C2E24] space-y-2">
              <div className="flex items-center gap-2 font-bold">
                <Lock className="w-4 h-4 text-[#8C2E24]" />
                <span>Statutory Lock: Delivery Destination Modification Disabled</span>
              </div>
              <p className="leading-relaxed">
                Under precious bullion logistics underwriting protocols, consignment destination addresses are strictly locked once the parcel has been <strong>Dispatched</strong> or <strong>Delivered</strong> to prevent hijacking and maintain transit custody insurance.
              </p>
              <p className="text-[11px]">
                If you require emergency address redirection, please contact our administrative concierge immediately.
              </p>
            </div>
          ) : (
            <p className="text-[#7A6A55]">
              Address modification is permitted prior to courier manifest handover. Updated destinations must be serviceable by armoured logistics.
            </p>
          )}

          {addressUpdateResult && (
            <div className={`p-3 rounded-md text-xs flex items-center gap-2 ${
              addressUpdateResult.success ? 'bg-[#DCE8D5] text-[#2D5A27]' : 'bg-[#F7D4CF] text-[#8C2E24]'
            }`}>
              {addressUpdateResult.success ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <AlertTriangle className="w-4 h-4 shrink-0" />}
              <span>{addressUpdateResult.message}</span>
            </div>
          )}

          <div>
            <label className="block text-[#5A4630] font-medium mb-1">Street Address</label>
            <input
              type="text"
              value={editStreet}
              onChange={(e) => setEditStreet(e.target.value)}
              disabled={isDispatchedOrDelivered}
              required
              className="w-full px-3 py-2 bg-white border border-[#EADFC8] rounded-md text-[#5A4630] disabled:bg-gray-100 disabled:cursor-not-allowed"
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-[#5A4630] font-medium mb-1">City</label>
              <input
                type="text"
                value={editCity}
                onChange={(e) => setEditCity(e.target.value)}
                disabled={isDispatchedOrDelivered}
                required
                className="w-full px-3 py-2 bg-white border border-[#EADFC8] rounded-md text-[#5A4630] disabled:bg-gray-100 disabled:cursor-not-allowed"
              />
            </div>
            <div>
              <label className="block text-[#5A4630] font-medium mb-1">State</label>
              <input
                type="text"
                value={editState}
                onChange={(e) => setEditState(e.target.value)}
                disabled={isDispatchedOrDelivered}
                required
                className="w-full px-3 py-2 bg-white border border-[#EADFC8] rounded-md text-[#5A4630] disabled:bg-gray-100 disabled:cursor-not-allowed"
              />
            </div>
            <div>
              <label className="block text-[#5A4630] font-medium mb-1">Postal Pincode</label>
              <input
                type="text"
                value={editPincode}
                onChange={(e) => setEditPincode(e.target.value)}
                disabled={isDispatchedOrDelivered}
                maxLength={6}
                required
                className="w-full px-3 py-2 bg-white border border-[#EADFC8] rounded-md text-[#5A4630] disabled:bg-gray-100 disabled:cursor-not-allowed font-mono"
              />
            </div>
          </div>

          <div className="pt-3 flex justify-end gap-2 border-t border-[#EADFC8]">
            <Button variant="outline" size="sm" type="button" onClick={() => setAddressModalOpen(false)}>
              Close
            </Button>
            {!isDispatchedOrDelivered && (
              <Button variant="primary" size="sm" type="submit">
                Save Address Update
              </Button>
            )}
          </div>
        </form>
      </Modal>

      {/* Tax Invoice Document Modal */}
      <Modal
        isOpen={invoiceModalOpen}
        onClose={() => setInvoiceModalOpen(false)}
        title={`Legal Tax Invoice #${invoiceNumber}`}
        maxWidth="lg"
        footer={
          <Button variant="secondary" size="sm" onClick={() => setInvoiceModalOpen(false)}>
            Close
          </Button>
        }
      >
        <div className="p-6 bg-[#FFFFFF] border border-[#EADFC8] rounded-xl space-y-4 text-xs text-[#5A4630]">
          <div className="flex justify-between items-start border-b border-[#EADFC8] pb-4">
            <div>
              <h3 className="font-serif text-xl font-bold text-[#5A4630]">AURUM & CO PRECIOUS LTD</h3>
              <p className="text-[11px] text-[#7A6A55]">GSTIN: 27AAACA1234F1Z8 • BIS Hallmark Ref: HM/L-7890123</p>
              <p className="text-[10px] text-[#7A6A55] font-mono mt-0.5">IRN: e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855</p>
            </div>
            <div className="text-right">
              <span className="font-mono font-bold text-sm block">{invoiceNumber}</span>
              <p className="text-[11px] text-[#7A6A55]">Date: {formatFullDateTime(order.updatedAt || order.createdAt)}</p>
              <div className="inline-flex items-center gap-1 mt-1 text-[10px] text-[#2D5A27] bg-[#DCE8D5] px-1.5 py-0.5 rounded font-mono">
                <QrCode className="w-3 h-3" />
                <span>NIC e-Invoice QR Code</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 text-xs bg-[#FFFBF3] p-3 rounded-lg border border-[#EADFC8]">
            <div>
              <span className="font-semibold text-[#5A4630]">Billed To:</span>
              <p>{order.customerName}</p>
              <p>{order.customerEmail}</p>
              {order.customerPan && <p className="font-mono">PAN: {order.customerPan}</p>}
              <p>{order.shippingAddress?.street}, {order.shippingAddress?.city} - {order.shippingAddress?.pincode}</p>
            </div>
            <div className="text-right">
              <span className="font-semibold text-[#5A4630]">Consignment Reference:</span>
              <p className="font-mono">{order.orderNumber}</p>
              <p>Payment: Confirmed ({order.paymentMethod})</p>
              <p>Tax Structure: Statutory CGST 1.5% + SGST 1.5%</p>
            </div>
          </div>

          <div className="border border-[#EADFC8] rounded-lg overflow-x-auto">
            <table className="w-full min-w-[340px] text-left text-xs">
              <thead>
                <tr className="bg-[#F8EFD9] text-[#5A4630] font-semibold">
                  <th className="p-2.5">Article Description</th>
                  <th className="p-2.5">HSN Code</th>
                  <th className="p-2.5 text-center">GST Rate</th>
                  <th className="p-2.5 text-right">Amount (INR)</th>
                </tr>
              </thead>
              <tbody>
                {order.items.map((it, idx) => (
                  <tr key={idx} className="border-t border-[#EADFC8]">
                    <td className="p-2.5 font-medium">{it.name} (Qty: {it.quantity})</td>
                    <td className="p-2.5 font-mono">{it.category === 'gold' ? '710812' : '711319'}</td>
                    <td className="p-2.5 text-center text-[#7A6A55]">3% (CGST 1.5% + SGST 1.5%)</td>
                    <td className="p-2.5 text-right font-serif font-bold">{formatINR(it.totalPrice)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex justify-between items-baseline pt-2 border-t border-[#EADFC8]">
            <span className="font-serif font-bold text-sm">Invoice Grand Total (INR)</span>
            <span className="font-serif font-bold text-2xl text-[#5A4630] tabular-nums">
              {formatINR(order.totalAmount)}
            </span>
          </div>

          <div className="text-center pt-2 flex justify-center gap-3">
            <Button
              variant="primary"
              size="sm"
              onClick={() => {
                alert(`Invoice #${invoiceNumber} downloaded successfully as a digitally signed PDF.`);
                setInvoiceModalOpen(false);
              }}
              leftIcon={<Download className="w-3.5 h-3.5" />}
            >
              Download PDF Copy
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => {
                handleResendInvoice();
                setInvoiceModalOpen(false);
              }}
              leftIcon={<Mail className="w-3.5 h-3.5" />}
            >
              Email to Investor
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
