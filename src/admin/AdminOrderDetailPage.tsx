import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAppStore } from '../store';
import { useSEO } from '../lib/useSEO';
import { formatINR } from '../lib/pricing';
import { Card } from '../components/Card';
import { Badge } from '../components/Badge';
import { Button } from '../components/Button';
import { Modal } from '../components/Modal';
import type { OrderStatus, InsuranceClaim } from '../data/types';
import {
  ArrowLeft,
  ExternalLink,
  CheckCircle2,
  Clock,
  Truck,
  ShieldCheck,
  FileText,
  Download,
  AlertTriangle,
  Upload,
  Printer,
  Building2,
  Boxes,
  FileCheck,
  CreditCard,
  Lock,
} from 'lucide-react';

export const AdminOrderDetailPage: React.FC = () => {
  const { id = '' } = useParams<{ id: string }>();
  const {
    orders,
    adminUser,
    activeRole,
    advanceOrderStatus,
    attachErpInvoice,
    dispatchOrder,
    fileInsuranceClaim,
    simulateDuplicateWebhook,
  } = useAppStore();

  const currentActor = adminUser?.name || 'Vikram Sharma';
  const canManageOrders = activeRole === 'Super Admin' || activeRole === 'Warehouse' || activeRole === 'Finance';

  // Find order by ID or orderNumber
  const order = orders.find((o) => o.id === id || o.orderNumber === id) || orders[0];

  useSEO({
    title: order ? `Order Fulfilment #${order.orderNumber}` : 'Order Fulfilment',
    description: 'Custody progression, invoice-gated dispatch verification, payment webhook simulation, and insured courier logistics.',
    canonicalPath: `/admin/orders/${order?.id || ''}`,
  });

  // ERP Invoice Form State
  const [erpInvoiceNo, setErpInvoiceNo] = useState(order?.erpInvoiceNumber || 'INV-ERP-2026-8891');
  const [erpFileAttached, setErpFileAttached] = useState(order?.erpInvoiceAttached || false);
  const [erpError, setErpError] = useState<string | null>(null);

  // Dispatch Modal State
  const [dispatchModalOpen, setDispatchModalOpen] = useState(false);
  const [selectedCourier, setSelectedCourier] = useState(order?.courierName || 'Sequel Secure Precious Logistics');
  const [awbNumber, setAwbNumber] = useState(order?.trackingNumber || `SEQP-${Math.floor(10000 + Math.random() * 90000)}-MUM`);
  const [dispatchNotes, setDispatchNotes] = useState('High-value armoured air transit with OTP delivery verification');
  const [dispatchProofUploaded, setDispatchProofUploaded] = useState(false);

  // Packing Slip Modal State
  const [packingSlipModalOpen, setPackingSlipModalOpen] = useState(false);

  // Insurance Claim Modal State
  const [claimModalOpen, setClaimModalOpen] = useState(false);
  const [claimReason, setClaimReason] = useState('Transit tamper seal anomaly detected during hub sorting');

  // Duplicate Webhook Feedback
  const [webhookFeedback, setWebhookFeedback] = useState<string | null>(null);

  // Global action banner
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  if (!order) {
    return (
      <div className="p-8 text-center space-y-3">
        <p className="text-sm font-semibold text-[#5A4630]">Order not found</p>
        <Link to="/admin/orders">
          <Button variant="primary" size="sm">Back to Orders</Button>
        </Link>
      </div>
    );
  }

  // Next Fulfilment Step logic
  const canPick = ['Placed', 'Payment confirmed'].includes(order.status);
  const canPack = order.status === 'Picked';
  const canQC = order.status === 'Packed';
  // CRITICAL RULE: Invoice-gated dispatch - strictly blocked until ERP invoice is attached
  const canDispatch = order.erpInvoiceAttached && ['Quality checked', 'Invoice issued'].includes(order.status);

  // Step Action Handlers
  const handlePick = () => {
    advanceOrderStatus(order.id, 'Picked', currentActor, 'Vault articles picked from physical high-security trays');
    setActionNotice(`Order #${order.orderNumber} marked as Picked.`);
    setTimeout(() => setActionNotice(null), 3000);
  };

  const handlePack = () => {
    advanceOrderStatus(order.id, 'Packed', currentActor, 'Tamper-evident assay casket sealed with security barcode');
    setActionNotice(`Order #${order.orderNumber} marked as Packed.`);
    setTimeout(() => setActionNotice(null), 3000);
  };

  const handleQC = () => {
    advanceOrderStatus(order.id, 'Quality checked', currentActor, 'Laser micro-inscription and NABL weight tolerance verified');
    setActionNotice(`Order #${order.orderNumber} Quality Checked.`);
    setTimeout(() => setActionNotice(null), 3000);
  };

  // ERP Invoice Attach Handler
  const handleAttachInvoice = (e: React.FormEvent) => {
    e.preventDefault();
    if (!erpInvoiceNo.trim() || !erpFileAttached) {
      setErpError('Both ERP Invoice Number and PDF file attachment are mandatory for statutory issuance.');
      return;
    }

    setErpError(null);
    attachErpInvoice(
      order.id,
      erpInvoiceNo.trim(),
      `https://aurum.internal/invoices/${erpInvoiceNo.trim()}.pdf`,
      currentActor
    );
    setActionNotice(`Legal Tax Invoice #${erpInvoiceNo} attached and issued. Transit dispatch unblocked!`);
    setTimeout(() => setActionNotice(null), 4000);
  };

  // Dispatch Confirmation Handler
  const handleConfirmDispatch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!order.erpInvoiceAttached) {
      alert('Error: Dispatch blocked until ERP invoice is attached.');
      return;
    }

    dispatchOrder(order.id, selectedCourier, awbNumber, currentActor, dispatchNotes);
    setDispatchModalOpen(false);
    setActionNotice(`Order #${order.orderNumber} dispatched with ${selectedCourier} (AWB: ${awbNumber}).`);
    setTimeout(() => setActionNotice(null), 4000);
  };

  // File Insurance Claim Handler
  const handleFileClaim = (e: React.FormEvent) => {
    e.preventDefault();
    const newClaim: InsuranceClaim = {
      id: `CLM-2026-${Math.floor(100 + Math.random() * 900)}`,
      orderId: order.id,
      orderNumber: order.orderNumber,
      courierName: order.courierName || selectedCourier,
      trackingNumber: order.trackingNumber || awbNumber,
      claimAmount: order.totalAmount,
      reason: claimReason,
      status: 'Filed',
      createdAt: new Date().toISOString(),
      filedBy: currentActor,
    };

    fileInsuranceClaim(newClaim, currentActor);
    setClaimModalOpen(false);
    setActionNotice(`Insurance claim #${newClaim.id} filed for ₹${order.totalAmount.toLocaleString('en-IN')}.`);
    setTimeout(() => setActionNotice(null), 4000);
  };

  // Simulate Duplicate Webhook Handler
  const handleSimulateDuplicateWebhook = () => {
    const res = simulateDuplicateWebhook(order.id, currentActor);
    setWebhookFeedback(res.message);
    setTimeout(() => setWebhookFeedback(null), 6000);
  };

  // Export Billing Worksheet (CSV)
  const handleExportBillingWorksheet = () => {
    const headers = [
      'Order Number',
      'Order Date',
      'Customer Name',
      'Customer Email',
      'Customer Phone',
      'Shipping City',
      'Pincode',
      'SKU',
      'Item Title',
      'Quantity',
      'Unit Price INR',
      'Rate Per Gram Snapshot',
      'Making Charges INR',
      'GST Amount INR',
      'Total Amount INR',
      'Payment Method',
      'Transaction ID',
    ];

    const rows = order.items.map((item) => [
      `"${order.orderNumber}"`,
      `"${order.createdAt}"`,
      `"${order.customerName}"`,
      `"${order.customerEmail}"`,
      `"${order.customerPhone}"`,
      `"${order.shippingAddress.city}"`,
      `"${order.shippingAddress.pincode}"`,
      `"${item.sku}"`,
      `"${item.name.replace(/"/g, '""')}"`,
      item.quantity,
      item.unitPrice,
      item.ratePerGramSnapshot || 'N/A',
      item.makingCharges || 0,
      item.gstAmount,
      order.totalAmount,
      `"${order.paymentMethod}"`,
      `"${order.paymentTransactionId || 'TXN-HDFC-991204'}"`,
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `BILLING-WORKSHEET-${order.orderNumber}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setActionNotice(`Billing worksheet exported for Order #${order.orderNumber}. Ready for ERP ingest.`);
    setTimeout(() => setActionNotice(null), 3000);
  };

  // Helper for status badge
  const getStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case 'Placed':
      case 'Payment confirmed':
        return <Badge variant="neutral" size="sm">{status}</Badge>;
      case 'Picked':
      case 'Packed':
      case 'Quality checked':
        return <Badge variant="amber" size="sm">{status}</Badge>;
      case 'Invoice issued':
        return <Badge variant="gold" size="sm">{status}</Badge>;
      case 'Dispatched':
        return <Badge variant="sage" size="sm">{status}</Badge>;
      case 'Delivered':
        return <Badge variant="sage" size="sm">{status}</Badge>;
      case 'Cancelled':
        return <Badge variant="neutral" size="sm">{status}</Badge>;
      case 'Return requested':
      case 'Returned':
        return <Badge variant="coral" size="sm">{status}</Badge>;
      default:
        return <Badge variant="neutral" size="sm">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. TOP BREADCRUMB & ORDER TITLE BAR */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-[#EADFC8]">
        <div>
          <div className="flex items-center gap-2 text-xs text-[#7A6A55] mb-1">
            <Link to="/admin/orders" className="hover:text-[#C9A24B] flex items-center gap-1">
              <ArrowLeft className="w-3.5 h-3.5" /> All Orders
            </Link>
            <span>/</span>
            <span className="font-mono text-[#5A4630] font-semibold">{order.orderNumber}</span>
          </div>

          <div className="flex items-center gap-3">
            <h1 className="font-serif text-2xl font-bold text-[#5A4630]">
              Consignment Fulfilment: #{order.orderNumber}
            </h1>
            {getStatusBadge(order.status)}
            <Badge variant="gold" size="sm">Phase 9 Active</Badge>
          </div>
          <p className="text-xs text-[#7A6A55] mt-1">
            Placed on {new Date(order.createdAt).toLocaleString()} by <strong>{order.customerName}</strong> ({order.customerEmail})
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <Button
            variant="outline"
            size="sm"
            onClick={handleExportBillingWorksheet}
            leftIcon={<Download className="w-3.5 h-3.5" />}
          >
            Export Billing Worksheet (CSV)
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setPackingSlipModalOpen(true)}
            leftIcon={<Printer className="w-3.5 h-3.5" />}
          >
            Packing Slip
          </Button>

          <Link to={`/order/${order.id}`} target="_blank" rel="noopener noreferrer">
            <Button variant="ghost" size="sm" rightIcon={<ExternalLink className="w-3.5 h-3.5" />}>
              Customer View
            </Button>
          </Link>
        </div>
      </div>

      {/* Global Feedback Banner */}
      {actionNotice && (
        <div className="p-3 bg-[#EBF3E8] border border-[#2D5A27]/20 rounded-xl text-[#2D5A27] text-xs flex items-center justify-between shadow-sm animate-fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{actionNotice}</span>
          </div>
        </div>
      )}

      {/* Duplicate Webhook Simulation Banner */}
      {webhookFeedback && (
        <div className="p-3.5 bg-[#FFFBF3] border-2 border-[#C9A24B] rounded-xl text-[#5A4630] text-xs flex items-center justify-between shadow-sm animate-fade-in">
          <div className="flex items-center gap-2.5">
            <ShieldCheck className="w-5 h-5 text-[#C9A24B] shrink-0" />
            <div>
              <div className="font-bold text-[#5A4630]">Duplicate Webhook Received & Handled:</div>
              <div className="text-[11px] text-[#7A6A55] mt-0.5">{webhookFeedback}</div>
            </div>
          </div>
          <Badge variant="sage" size="sm">Idempotent 200 OK</Badge>
        </div>
      )}

      {/* 2. MAIN 2-COLUMN GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* LEFT / MAIN COLUMN: CUSTODY PROGRESSION, ITEMS, TIMELINE (2 COLS) */}
        <div className="lg:col-span-2 space-y-6">
          {/* CUSTODY FULFILMENT STEPPER CARD */}
          <Card className="p-5 bg-white border-[#EADFC8] space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#EADFC8]">
              <div>
                <h2 className="font-serif text-base font-bold text-[#5A4630] flex items-center gap-2">
                  <Boxes className="w-4 h-4 text-[#C9A24B]" />
                  Sequential Custody Progression
                </h2>
                <p className="text-xs text-[#7A6A55]">
                  Step-by-step custody authorization. Each step appends an immutable timeline and audit entry.
                </p>
              </div>
              <span className="text-xs font-mono text-[#5A4630] font-semibold">
                Current: {order.status}
              </span>
            </div>

            {/* Stepper Buttons Row */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {/* 1. Pick */}
              <Button
                variant={order.status === 'Picked' ? 'primary' : 'outline'}
                size="sm"
                onClick={handlePick}
                disabled={!canManageOrders || !canPick}
                leftIcon={<Boxes className="w-3.5 h-3.5" />}
                className="justify-center"
              >
                1. Pick Articles
              </Button>

              {/* 2. Pack */}
              <Button
                variant={order.status === 'Packed' ? 'primary' : 'outline'}
                size="sm"
                onClick={handlePack}
                disabled={!canManageOrders || !canPack}
                leftIcon={<FileCheck className="w-3.5 h-3.5" />}
                className="justify-center"
              >
                2. Pack & Seal
              </Button>

              {/* 3. QC */}
              <Button
                variant={order.status === 'Quality checked' ? 'primary' : 'outline'}
                size="sm"
                onClick={handleQC}
                disabled={!canManageOrders || !canQC}
                leftIcon={<CheckCircle2 className="w-3.5 h-3.5" />}
                className="justify-center"
              >
                3. Quality Check
              </Button>

              {/* 4. Dispatch (Invoice-Gated) */}
              <Button
                variant={order.status === 'Dispatched' ? 'primary' : 'outline'}
                size="sm"
                onClick={() => setDispatchModalOpen(true)}
                disabled={!canManageOrders || !canDispatch}
                title={!order.erpInvoiceAttached ? 'Attach ERP invoice first' : 'Authorize Insured Dispatch'}
                leftIcon={!order.erpInvoiceAttached ? <Lock className="w-3.5 h-3.5 text-[#A83232]" /> : <Truck className="w-3.5 h-3.5" />}
                className={`justify-center ${
                  !order.erpInvoiceAttached
                    ? 'border-[#A83232]/40 text-[#A83232] bg-[#FDF2F2]/40'
                    : 'border-[#2D5A27] text-[#2D5A27] bg-[#EBF3E8]/40'
                }`}
              >
                4. Transit Dispatch
              </Button>
            </div>

            {/* INVOICE-GATED DISPATCH ADVISORY NOTIFICATION */}
            {!order.erpInvoiceAttached && (
              <div className="p-3 bg-[#FDF2F2] border border-[#A83232]/30 rounded-xl flex items-center justify-between text-xs text-[#A83232]">
                <div className="flex items-center gap-2">
                  <Lock className="w-4 h-4 shrink-0" />
                  <span>
                    <strong>Invoice-Gated Dispatch Active:</strong> Dispatch button is locked. Attach the legal ERP invoice number and PDF in the ERP Handoff panel to enable shipping.
                  </span>
                </div>
                <Badge variant="coral" size="sm">Gated</Badge>
              </div>
            )}

            {order.erpInvoiceAttached && order.status !== 'Dispatched' && (
              <div className="p-3 bg-[#EBF3E8] border border-[#2D5A27]/30 rounded-xl flex items-center justify-between text-xs text-[#2D5A27]">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>
                    <strong>ERP Invoice Synchronized ({order.erpInvoiceNumber}):</strong> Order is cleared for insured armoured transit handoff.
                  </span>
                </div>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => setDispatchModalOpen(true)}
                  className="text-xs h-7"
                >
                  Authorize Dispatch Now
                </Button>
              </div>
            )}
          </Card>

          {/* ORDER ITEMS & PRICE SNAPSHOT TABLE */}
          <Card className="overflow-hidden border-[#EADFC8] bg-white">
            <div className="p-3.5 bg-[#F8EFD9] border-b border-[#EADFC8] flex items-center justify-between">
              <div>
                <h3 className="font-serif text-sm font-bold text-[#5A4630]">
                  Consignment Line Items & Statutory Tax Snapshot
                </h3>
                <p className="text-[11px] text-[#7A6A55]">
                  Locked rates and tax breakdown captured at checkout authorization
                </p>
              </div>
              <span className="text-xs text-[#7A6A55]">
                {order.items.length} article(s)
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-[#FFFBF3] text-[#7A6A55] border-b border-[#EADFC8]">
                    <th className="py-2.5 px-4 font-semibold">Article & SKU</th>
                    <th className="py-2.5 px-3 font-semibold text-center">Qty</th>
                    <th className="py-2.5 px-3 font-semibold text-right">Locked Spot Rate</th>
                    <th className="py-2.5 px-3 font-semibold text-right">Unit Price</th>
                    <th className="py-2.5 px-3 font-semibold text-right">3% GST</th>
                    <th className="py-2.5 px-4 font-semibold text-right">Total INR</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#EADFC8]/60 text-[#5A4630]">
                  {order.items.map((item, idx) => (
                    <tr key={idx} className="hover:bg-[#FFFBF3]">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg overflow-hidden border border-[#EADFC8] bg-[#FAF6EE] shrink-0 shadow-2xs">
                            <img
                              src={`/products/${item.productId}.jpg`}
                              alt={item.name}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div>
                            <div className="font-semibold text-[#5A4630]">{item.name}</div>
                            <div className="font-mono text-[10px] text-[#7A6A55] mt-0.5">
                              SKU: {item.sku} • Category: <span className="capitalize">{item.category}</span>
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-3 text-center font-mono font-semibold">
                        {item.quantity}
                      </td>
                      <td className="py-3 px-3 text-right font-mono text-[11px] text-[#7A6A55]">
                        {item.ratePerGramSnapshot ? `₹${item.ratePerGramSnapshot.toLocaleString('en-IN')}/g` : 'Fixed Model'}
                      </td>
                      <td className="py-3 px-3 text-right font-mono tabular-nums text-[#7A6A55]">
                        {formatINR(item.unitPrice)}
                      </td>
                      <td className="py-3 px-3 text-right font-mono tabular-nums text-[#7A6A55]">
                        {formatINR(item.gstAmount)}
                      </td>
                      <td className="py-3 px-4 text-right font-mono font-bold text-[#5A4630] tabular-nums">
                        {formatINR(item.totalPrice)}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="bg-[#F8EFD9]/50 border-t border-[#EADFC8] text-xs">
                    <td colSpan={4} className="py-3 px-4 font-bold text-[#5A4630] text-right">
                      Subtotal:
                    </td>
                    <td className="py-3 px-3 text-right font-mono text-[#7A6A55]">
                      {formatINR(order.gstTotal)}
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-bold text-sm text-[#5A4630]">
                      {formatINR(order.totalAmount)}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </Card>

          {/* CHRONOLOGICAL CUSTODY TIMELINE */}
          <Card className="p-5 bg-white border-[#EADFC8] space-y-4">
            <h3 className="font-serif text-sm font-bold text-[#5A4630] flex items-center gap-2">
              <Clock className="w-4 h-4 text-[#C9A24B]" />
              Immutable Custody Timeline & Chain of Custody
            </h3>

            <div className="relative border-l-2 border-[#EADFC8] ml-3 pl-6 space-y-5 py-1">
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
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-bold text-[#5A4630] font-serif">
                          {step.status}
                        </span>
                        <span className="text-[10px] text-[#7A6A55] font-mono">
                          {new Date(step.timestamp).toLocaleString()}
                        </span>
                      </div>
                      <p className="text-xs text-[#7A6A55]">
                        Authorized by: <strong>{step.actor}</strong>
                        {step.note && <span className="italic ml-1">({step.note})</span>}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        </div>

        {/* RIGHT COLUMN: PAYMENT VERIFICATION, ERP HANDOFF, SHIPPING (1 COL) */}
        <div className="space-y-6">
          {/* PAYMENT & GATEWAY VERIFICATION PANEL */}
          <Card className="p-4 bg-white border-[#EADFC8] space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-[#EADFC8]">
              <div className="flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-[#C9A24B]" />
                <h3 className="font-serif text-sm font-bold text-[#5A4630]">
                  Payment Gateway Panel
                </h3>
              </div>
              <Badge
                variant={order.paymentStatus === 'Success' ? 'sage' : 'coral'}
                size="sm"
              >
                {order.paymentStatus}
              </Badge>
            </div>

            <div className="space-y-2 text-xs text-[#5A4630]">
              <div className="flex justify-between">
                <span className="text-[#7A6A55]">Payment Method:</span>
                <span className="font-semibold">{order.paymentMethod}</span>
              </div>

              <div className="flex justify-between">
                <span className="text-[#7A6A55]">Transaction Reference:</span>
                <span className="font-mono text-[11px] font-bold">
                  {order.paymentTransactionId || 'TXN-HDFC-991204'}
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-[#7A6A55]">Amount Capture Check:</span>
                <span className="font-mono text-[#2D5A27] font-semibold">
                  ✓ {formatINR(order.totalAmount)} (Matched)
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-[#7A6A55]">HMAC Signature Check:</span>
                <span className="font-mono text-[#2D5A27] font-semibold">
                  ✓ Verified (SHA-256)
                </span>
              </div>

              <div className="p-2.5 bg-[#FFFBF3] border border-[#EADFC8] rounded-lg flex items-center justify-between text-[11px]">
                <span className="text-[#7A6A55]">Idempotency Guard:</span>
                <span className="text-[#2D5A27] font-semibold flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" /> Duplicate event protection: ON
                </span>
              </div>

              <div className="pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleSimulateDuplicateWebhook}
                  disabled={!canManageOrders}
                  className="w-full text-xs text-[#7A6A55]"
                >
                  Simulate Duplicate Webhook
                </Button>
                <p className="text-[10px] text-[#7A6A55] mt-1 text-center">
                  Tests gateway idempotency guard. Verifies second webhook is ignored without double-crediting.
                </p>
              </div>
            </div>
          </Card>

          {/* ERP LEGAL TAX INVOICE HANDOFF PANEL */}
          <Card className="p-4 bg-white border-[#EADFC8] space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-[#EADFC8]">
              <div className="flex items-center gap-2">
                <Building2 className="w-4 h-4 text-[#C9A24B]" />
                <h3 className="font-serif text-sm font-bold text-[#5A4630]">
                  ERP Invoice Handoff
                </h3>
              </div>
              {order.erpInvoiceAttached ? (
                <Badge variant="sage" size="sm">Issued</Badge>
              ) : (
                <Badge variant="coral" size="sm">Pending</Badge>
              )}
            </div>

            <div className="p-2.5 bg-[#FFFBF3] border border-[#EADFC8] rounded-lg text-[11px] text-[#7A6A55] space-y-1">
              <div>
                <strong>Statutory Notice:</strong> "ERP is the legal invoice system of record. Handoff is manual."
              </div>
              <div className="italic">
                "Open: ERP bill import or external price acceptance (kept separate)."
              </div>
            </div>

            <form onSubmit={handleAttachInvoice} className="space-y-3 text-xs text-[#5A4630]">
              {erpError && (
                <div className="p-2 bg-[#FDF2F2] border border-[#A83232]/20 rounded text-[#A83232] text-[11px] flex items-center gap-1">
                  <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                  <span>{erpError}</span>
                </div>
              )}

              <div>
                <label className="block text-[11px] font-semibold text-[#7A6A55] mb-1">
                  ERP Invoice Number *
                </label>
                <input
                  type="text"
                  required
                  value={erpInvoiceNo}
                  onChange={(e) => setErpInvoiceNo(e.target.value)}
                  placeholder="e.g. INV-ERP-2026-8891"
                  className="w-full px-3 py-1.5 text-xs font-mono bg-white border border-[#EADFC8] rounded-lg"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-[#7A6A55] mb-1">
                  Signed Tax Invoice PDF *
                </label>
                <div className="flex items-center gap-2 p-2 bg-[#FFFBF3] border border-dashed border-[#C9A24B] rounded-lg">
                  <FileText className="w-4 h-4 text-[#C9A24B] shrink-0" />
                  <span className="text-[11px] text-[#5A4630] truncate flex-1">
                    {erpFileAttached ? `${erpInvoiceNo}.pdf (Signed ERP Tax Invoice)` : 'No PDF attached'}
                  </span>
                  <button
                    type="button"
                    onClick={() => setErpFileAttached(true)}
                    className="px-2 py-0.5 text-[10px] font-semibold bg-white border border-[#EADFC8] rounded hover:bg-[#F8EFD9]"
                  >
                    Simulate Attach
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                variant="primary"
                size="sm"
                disabled={!canManageOrders || !erpInvoiceNo.trim() || !erpFileAttached}
                className="w-full text-xs"
                leftIcon={<FileCheck className="w-3.5 h-3.5" />}
              >
                {order.erpInvoiceAttached ? 'Update Legal ERP Invoice' : 'Issue ERP Invoice & Clear for Transit'}
              </Button>
            </form>
          </Card>

          {/* SHIPPING & INSURED LOGISTICS PANEL */}
          <Card className="p-4 bg-white border-[#EADFC8] space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-[#EADFC8]">
              <div className="flex items-center gap-2">
                <Truck className="w-4 h-4 text-[#C9A24B]" />
                <h3 className="font-serif text-sm font-bold text-[#5A4630]">
                  Shipping & Armoured Logistics
                </h3>
              </div>
              <Badge variant="gold" size="sm">100% Insured</Badge>
            </div>

            <div className="space-y-2 text-xs text-[#5A4630]">
              <div className="flex justify-between">
                <span className="text-[#7A6A55]">Corridor Serviceability:</span>
                <span className="text-[#2D5A27] font-semibold">
                  ✓ Verified ({order.shippingAddress.pincode})
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-[#7A6A55]">Assigned Courier:</span>
                <span className="font-semibold">{order.courierName || selectedCourier}</span>
              </div>

              <div className="flex justify-between">
                <span className="text-[#7A6A55]">Consignment AWB:</span>
                <span className="font-mono text-[11px] font-bold">
                  {order.trackingNumber || 'Pending Dispatch'}
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-[#7A6A55]">Insured Transit Value:</span>
                <span className="font-mono font-bold text-[#5A4630]">
                  {formatINR(order.totalAmount)}
                </span>
              </div>

              <div className="pt-2 flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setClaimModalOpen(true)}
                  disabled={!canManageOrders}
                  className="w-full text-xs text-[#A83232] border-[#A83232]/30 hover:bg-[#FDF2F2]"
                >
                  File Underwriter Claim
                </Button>
              </div>
            </div>
          </Card>

          {/* CUSTOMER DESTINATION CARD */}
          <Card className="p-4 bg-white border-[#EADFC8] space-y-2 text-xs text-[#5A4630]">
            <h4 className="font-serif text-xs font-bold text-[#5A4630]">
              Consignment Destination & Customer
            </h4>
            <div className="font-semibold">{order.shippingAddress.name || order.customerName}</div>
            <div className="text-[#7A6A55]">
              {order.shippingAddress.street}, {order.shippingAddress.city}, {order.shippingAddress.state} - {order.shippingAddress.pincode}
            </div>
            <div className="text-[11px] text-[#7A6A55] pt-1">
              Phone: <strong>{order.customerPhone}</strong> (OTP Verified)
            </div>
          </Card>
        </div>
      </div>

      {/* 3. MODAL: DISPATCH AUTHORIZATION */}
      <Modal
        isOpen={dispatchModalOpen}
        onClose={() => setDispatchModalOpen(false)}
        title={`Authorize Armoured Transit Dispatch: #${order.orderNumber}`}
        maxWidth="md"
      >
        <form onSubmit={handleConfirmDispatch} className="space-y-4 text-xs text-[#5A4630]">
          <div className="p-3 bg-[#FFFBF3] border border-[#EADFC8] rounded-xl space-y-1">
            <div className="font-semibold text-[#5A4630]">Consignment #{order.orderNumber}</div>
            <div className="text-[11px] text-[#7A6A55]">
              Destination: {order.shippingAddress.city} ({order.shippingAddress.pincode}) • Insured Value: <strong>{formatINR(order.totalAmount)}</strong>
            </div>
            <div className="text-[11px] text-[#2D5A27] font-semibold pt-1">
              ✓ ERP Invoice #{order.erpInvoiceNumber} Verified Attached
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-[#7A6A55] mb-1">
              Armoured Courier Partner *
            </label>
            <select
              value={selectedCourier}
              onChange={(e) => setSelectedCourier(e.target.value)}
              className="w-full px-3 py-1.5 text-xs bg-white border border-[#EADFC8] rounded-lg"
            >
              <option value="Sequel Secure Precious Logistics">Sequel Secure Precious Logistics</option>
              <option value="BVC Logistics Armoured Vaulting">BVC Logistics Armoured Vaulting</option>
              <option value="BlueDart Apex Gold Insured">BlueDart Apex Gold Insured</option>
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-[#7A6A55] mb-1">
              Consignment Air Waybill (AWB) # *
            </label>
            <input
              type="text"
              required
              value={awbNumber}
              onChange={(e) => setAwbNumber(e.target.value)}
              className="w-full px-3 py-1.5 text-xs font-mono bg-white border border-[#EADFC8] rounded-lg"
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-[#7A6A55] mb-1">
              Transit Dispatch Handover Proof (Fake Upload)
            </label>
            <div className="flex items-center gap-2 p-2 bg-[#FFFBF3] border border-dashed border-[#C9A24B] rounded-lg">
              <Upload className="w-4 h-4 text-[#C9A24B] shrink-0" />
              <span className="text-[11px] text-[#5A4630] truncate flex-1">
                {dispatchProofUploaded ? 'tamper_proof_bag_manifest.jpg (Courier Handover Receipt)' : 'No receipt attached'}
              </span>
              <button
                type="button"
                onClick={() => setDispatchProofUploaded(true)}
                className="px-2 py-0.5 text-[10px] font-semibold bg-white border border-[#EADFC8] rounded hover:bg-[#F8EFD9]"
              >
                Simulate Proof
              </button>
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-[#7A6A55] mb-1">
              Dispatch Instructions
            </label>
            <textarea
              rows={2}
              value={dispatchNotes}
              onChange={(e) => setDispatchNotes(e.target.value)}
              className="w-full px-3 py-1.5 text-xs bg-white border border-[#EADFC8] rounded-lg"
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-[#EADFC8]">
            <Button type="button" variant="outline" size="sm" onClick={() => setDispatchModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm" leftIcon={<Truck className="w-4 h-4" />}>
              Confirm Dispatch & Update Store View
            </Button>
          </div>
        </form>
      </Modal>

      {/* 4. MODAL: PACKING SLIP PREVIEW */}
      <Modal
        isOpen={packingSlipModalOpen}
        onClose={() => setPackingSlipModalOpen(false)}
        title={`Armoured Vault Packing Slip: #${order.orderNumber}`}
        maxWidth="lg"
      >
        <div className="p-6 bg-white border border-[#EADFC8] rounded-xl space-y-4 text-xs text-[#5A4630]">
          <div className="flex justify-between items-start border-b border-[#EADFC8] pb-4">
            <div>
              <h3 className="font-serif text-lg font-bold text-[#5A4630]">AURUM & CO VAULT PACKING SLIP</h3>
              <p className="text-[11px] text-[#7A6A55]">Tamper-Evident Security Bag ID: <strong>BAG-SEC-2026-99124</strong></p>
            </div>
            <div className="text-right">
              <span className="font-mono font-bold text-sm">{order.orderNumber}</span>
              <p className="text-[11px] text-[#7A6A55]">Custody: Central High-Security Vault</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 text-xs bg-[#FFFBF3] p-3 rounded-lg border border-[#EADFC8]">
            <div>
              <span className="font-semibold text-[#5A4630]">Consignee:</span>
              <p>{order.customerName}</p>
              <p>{order.shippingAddress.street}, {order.shippingAddress.city} - {order.shippingAddress.pincode}</p>
            </div>
            <div className="text-right">
              <span className="font-semibold text-[#5A4630]">Carrier:</span>
              <p>{order.courierName || selectedCourier}</p>
              <p className="font-mono">AWB: {order.trackingNumber || 'Pending'}</p>
            </div>
          </div>

          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-[#F8EFD9] text-[#5A4630] border-b border-[#EADFC8]">
                <th className="py-2 px-3">SKU</th>
                <th className="py-2 px-3">Item Description</th>
                <th className="py-2 px-3 text-center">Qty</th>
                <th className="py-2 px-3 text-center">QC Check</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EADFC8]/60">
              {order.items.map((item, idx) => (
                <tr key={idx}>
                  <td className="py-2.5 px-3 font-mono text-[11px]">{item.sku}</td>
                  <td className="py-2.5 px-3 font-medium">{item.name}</td>
                  <td className="py-2.5 px-3 text-center font-bold">{item.quantity}</td>
                  <td className="py-2.5 px-3 text-center text-[#2D5A27] font-semibold">✓ Verified</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="pt-3 border-t border-[#EADFC8] flex justify-between items-center text-[11px] text-[#7A6A55]">
            <div>Assayer Signature: <strong>V. Sharma (Principal Vault Officer)</strong></div>
            <div>Legal Metrology Declared: Net Fine Weight Conforming</div>
          </div>
        </div>
      </Modal>

      {/* 5. MODAL: FILE INSURANCE CLAIM */}
      <Modal
        isOpen={claimModalOpen}
        onClose={() => setClaimModalOpen(false)}
        title={`File Underwriter Claim: Order #${order.orderNumber}`}
        maxWidth="md"
      >
        <form onSubmit={handleFileClaim} className="space-y-4 text-xs text-[#5A4630]">
          <div className="p-3 bg-[#FFFBF3] border border-[#EADFC8] rounded-xl space-y-1">
            <div className="font-semibold text-[#5A4630]">Order #{order.orderNumber}</div>
            <div className="flex justify-between text-[11px] text-[#7A6A55]">
              <span>Carrier:</span>
              <strong>{order.courierName || selectedCourier}</strong>
            </div>
            <div className="flex justify-between text-[11px] text-[#7A6A55]">
              <span>Total Insured Transit Claim:</span>
              <strong className="font-mono text-[#A83232] font-bold">
                {formatINR(order.totalAmount)}
              </strong>
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-[#7A6A55] mb-1">
              Claim Justification & Loss Reason *
            </label>
            <textarea
              rows={3}
              required
              value={claimReason}
              onChange={(e) => setClaimReason(e.target.value)}
              className="w-full px-3 py-1.5 text-xs bg-white border border-[#EADFC8] rounded-lg"
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-[#EADFC8]">
            <Button type="button" variant="outline" size="sm" onClick={() => setClaimModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm">
              Submit Insurance Claim
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
