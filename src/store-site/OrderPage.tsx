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
} from 'lucide-react';

export const OrderPage: React.FC = () => {
  const { id = '' } = useParams<{ id: string }>();
  const { orders } = useAppStore();

  const order = orders.find((o) => o.id === id || o.orderNumber === id);

  useSEO({
    title: order ? `Order ${order.orderNumber}` : 'Order Detail',
    description: order
      ? `Status and tracking timeline for order ${order.orderNumber}. Insured delivery via authorized armoured logistics.`
      : 'Order tracking and verification.',
    canonicalPath: `/order/${id}`,
  });

  const [invoiceModalOpen, setInvoiceModalOpen] = useState(false);

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

  const paymentBadgeVariant =
    order.paymentStatus === 'Success'
      ? 'sage'
      : order.paymentStatus === 'Failed'
      ? 'coral'
      : 'amber';

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

      {/* Order Header Card */}
      <Card variant="surface" className="p-6 sm:p-8 border-[#EADFC8] space-y-6 shadow-[0_4px_24px_rgba(90,70,48,0.06)]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#EADFC8]">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="text-xs font-bold text-[#5A4630] uppercase tracking-wider">
                Order Reference
              </span>
              <Badge variant={paymentBadgeVariant} size="sm">
                Payment: {order.paymentStatus}
              </Badge>
              <Badge variant="gold" size="sm">
                Status: {order.status}
              </Badge>
            </div>
            <h1 className="font-serif text-3xl font-bold text-[#5A4630] font-mono">
              {order.orderNumber}
            </h1>
            <p className="text-xs text-[#7A6A55] mt-0.5">
              Placed on {formatFullDateTime(order.createdAt)} • Payment Method: <strong>{order.paymentMethod}</strong>
            </p>
          </div>

          <div className="text-left sm:text-right">
            <span className="text-xs text-[#7A6A55]">Total Amount Paid</span>
            <div className="font-serif text-3xl font-bold text-[#5A4630] tabular-nums">
              {formatINR(order.totalAmount)}
            </div>
            <span className="text-[11px] text-[#7A6A55]">(Inclusive of 3% GST)</span>
          </div>
        </div>

        {/* Client Note: COD Not Applicable */}
        <div className="p-3 bg-[#FFFBF3] border border-[#EADFC8] rounded-lg text-xs text-[#5A4630] flex items-center justify-between">
          <span className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-[#C9A24B]" />
            <strong>Regulatory Notice:</strong> Cash on Delivery (COD) is not applicable on high-value precious bullion & certified jewellery.
          </span>
          <span className="text-[11px] text-[#7A6A55] hidden sm:inline">100% Insured Transit</span>
        </div>

        {/* Status Timeline */}
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
                  {/* Step Dot */}
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

        {/* Tracking & Courier Information */}
        <div className="p-5 bg-[#F8EFD9] rounded-xl border border-[#EADFC8] grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div>
            <span className="text-[#7A6A55] font-medium block mb-1">Armoured Courier Partner</span>
            <span className="font-bold text-[#5A4630] flex items-center gap-1.5 text-sm">
              <Truck className="w-4 h-4 text-[#C9A24B]" />
              {order.courierName || 'Sequel Secure Precious Logistics'}
            </span>
          </div>

          <div>
            <span className="text-[#7A6A55] font-medium block mb-1">Insured Consignment AWB</span>
            <span className="font-mono font-bold text-[#5A4630] text-sm">
              {order.trackingNumber || 'Pending Dispatch Assignment'}
            </span>
          </div>

          <div>
            <span className="text-[#7A6A55] font-medium block mb-1">Delivery Estimate</span>
            <span className="font-bold text-[#5A4630] text-sm">
              2–4 Business Days (OTP Required)
            </span>
          </div>
        </div>

        {/* Items Summary Table */}
        <div className="space-y-3">
          <h2 className="font-serif text-lg font-bold text-[#5A4630] flex items-center gap-2">
            <Package className="w-4 h-4 text-[#C9A24B]" />
            Ordered Articles ({order.items.length})
          </h2>

          <div className="border border-[#EADFC8] rounded-xl overflow-hidden">
            <table className="w-full text-left text-xs border-collapse">
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
                  <tr key={idx} className="hover:bg-[#FFFBF3]/40">
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
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* ERP Invoice & Documentation Area */}
        <div className="p-5 bg-[#FFFFFF] border border-[#EADFC8] rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <FileText className="w-5 h-5 text-[#C9A24B] shrink-0 mt-0.5" />
            <div className="text-xs space-y-0.5">
              <strong className="font-semibold text-[#5A4630]">Tax Invoice Status:</strong>
              {order.erpInvoiceAttached ? (
                <p className="text-[#2D5A27]">
                  ERP Invoice <strong>#{order.erpInvoiceNumber}</strong> has been issued and linked.
                </p>
              ) : (
                <p className="text-[#7A6A55]">
                  Invoice will be available after it is issued by the legal billing system.
                </p>
              )}
            </div>
          </div>

          {order.erpInvoiceAttached ? (
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setInvoiceModalOpen(true)}
              leftIcon={<Download className="w-3.5 h-3.5 text-[#C9A24B]" />}
            >
              Download Invoice
            </Button>
          ) : (
            <span className="text-[11px] text-[#7A6A55] italic bg-[#FFFBF3] px-3 py-1.5 rounded border border-[#EADFC8]">
              Awaiting ERP Billing Handoff
            </span>
          )}
        </div>

        {/* Support & Concierge Link */}
        <div className="pt-2 border-t border-[#EADFC8] flex flex-col sm:flex-row items-center justify-between text-xs text-[#7A6A55] gap-3">
          <span>Need assistance with this consignment?</span>
          <Link
            to="/support"
            className="text-[#C9A24B] hover:underline font-semibold flex items-center gap-1.5"
          >
            <Headphones className="w-4 h-4" />
            <span>Contact Customer Concierge</span>
          </Link>
        </div>
      </Card>

      {/* Invoice Document Modal */}
      {order.erpInvoiceAttached && (
        <Modal
          isOpen={invoiceModalOpen}
          onClose={() => setInvoiceModalOpen(false)}
          title={`Legal Tax Invoice #${order.erpInvoiceNumber}`}
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
              </div>
              <div className="text-right">
                <span className="font-mono font-bold text-sm">{order.erpInvoiceNumber}</span>
                <p className="text-[11px] text-[#7A6A55]">Date: {formatFullDateTime(order.updatedAt)}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs bg-[#FFFBF3] p-3 rounded-lg border border-[#EADFC8]">
              <div>
                <span className="font-semibold text-[#5A4630]">Billed To:</span>
                <p>{order.customerName}</p>
                <p>{order.customerEmail}</p>
                <p>{order.shippingAddress.street}, {order.shippingAddress.city} - {order.shippingAddress.pincode}</p>
              </div>
              <div className="text-right">
                <span className="font-semibold text-[#5A4630]">Order Reference:</span>
                <p className="font-mono">{order.orderNumber}</p>
                <p>Status: Tax Invoice Issued</p>
              </div>
            </div>

            <div className="border border-[#EADFC8] rounded-lg overflow-hidden">
              <table className="w-full text-left text-xs">
                <tr className="bg-[#F8EFD9] text-[#5A4630] font-semibold">
                  <th className="p-2.5">Description</th>
                  <th className="p-2.5">HSN Code</th>
                  <th className="p-2.5 text-right">Amount</th>
                </tr>
                {order.items.map((it, idx) => (
                  <tr key={idx} className="border-t border-[#EADFC8]">
                    <td className="p-2.5">{it.name} (Qty: {it.quantity})</td>
                    <td className="p-2.5 font-mono">711319</td>
                    <td className="p-2.5 text-right font-serif font-bold">{formatINR(it.totalPrice)}</td>
                  </tr>
                ))}
              </table>
            </div>

            <div className="flex justify-between items-baseline pt-2 border-t border-[#EADFC8]">
              <span className="font-serif font-bold text-sm">Invoice Grand Total (INR)</span>
              <span className="font-serif font-bold text-2xl text-[#5A4630] tabular-nums">
                {formatINR(order.totalAmount)}
              </span>
            </div>

            <div className="text-center pt-2">
              <Button
                variant="primary"
                size="sm"
                onClick={() => {
                  alert(`Invoice #${order.erpInvoiceNumber} downloaded successfully (simulated PDF export).`);
                  setInvoiceModalOpen(false);
                }}
                leftIcon={<Download className="w-3.5 h-3.5" />}
              >
                Download PDF Copy
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
