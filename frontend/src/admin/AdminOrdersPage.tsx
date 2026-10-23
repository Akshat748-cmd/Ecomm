import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useAppStore } from '../store';
import { useSEO } from '../lib/useSEO';
import { formatINR } from '../lib/pricing';
import { Card } from '../components/Card';
import { Badge } from '../components/Badge';
import { Button } from '../components/Button';
import { Modal } from '../components/Modal';
import type { Order, OrderStatus } from '../data/types';
import {
  ShoppingBag,
  Search,
  CheckCircle2,
  Clock,
  RotateCcw,
  ExternalLink,
  ShieldCheck,
  Building2,
  KeyRound,
  AlertTriangle,
  Filter,
} from 'lucide-react';

export const AdminOrdersPage: React.FC = () => {
  useSEO({
    title: 'Order Fulfilment & Gateway Settlements',
    description: 'Manage order custody progression, ERP invoice handoffs, insured courier dispatches, and gateway settlement reconciliations.',
    canonicalPath: '/admin/orders',
  });

  const {
    orders,
    settlements,
    claims,
    adminUser,
    activeRole,
    resolveReturnRequest,
    markSettlementReconciled,
    reauthenticateAdmin,
  } = useAppStore();

  const currentActor = adminUser?.name || 'Vikram Sharma';
  const canManageOrders = activeRole === 'Super Admin' || activeRole === 'Warehouse' || activeRole === 'Support' || activeRole === 'Finance';
  const canApproveRefunds = activeRole === 'Super Admin' || activeRole === 'Finance';

  // Queue tab selection
  const [activeTab, setActiveTab] = useState<'all' | 'unpaid' | 'returns' | 'settlements' | 'claims'>('all');

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [paymentFilter, setPaymentFilter] = useState<string>('all');

  // Re-auth modal for refund approvals
  const [refundModalOpen, setRefundModalOpen] = useState(false);
  const [selectedReturnOrder, setSelectedReturnOrder] = useState<Order | null>(null);
  const [refundResolution, setRefundResolution] = useState<'Approved' | 'Rejected'>('Approved');
  const [refundResolutionNote, setRefundResolutionNote] = useState('Approved following tamper-evident vault return verification');
  const [reauthPassword, setReauthPassword] = useState('');
  const [reauthError, setReauthError] = useState<string | null>(null);

  // Global notice banner
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  // Filtered Orders
  const filteredOrders = useMemo(() => {
    return orders.filter((o) => {
      const matchesSearch =
        searchQuery === '' ||
        o.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        o.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        o.customerEmail.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (o.trackingNumber || '').toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus = statusFilter === 'all' || o.status === statusFilter;
      const matchesPayment = paymentFilter === 'all' || o.paymentStatus === paymentFilter;

      return matchesSearch && matchesStatus && matchesPayment;
    });
  }, [orders, searchQuery, statusFilter, paymentFilter]);

  // Specific Queues
  const unpaidOrders = useMemo(() => {
    return orders.filter((o) => o.paymentStatus !== 'Success');
  }, [orders]);

  const returnQueueOrders = useMemo(() => {
    return orders.filter((o) => o.returnRequest || o.status === 'Return requested' || o.status === 'Returned');
  }, [orders]);

  // Aggregate Metrics
  const metrics = useMemo(() => {
    let pendingFulfillment = 0;
    let invoicePending = 0;
    let inTransit = 0;
    let returnsCount = 0;

    orders.forEach((o) => {
      if (['Placed', 'Payment confirmed', 'Picked', 'Packed', 'Quality checked'].includes(o.status)) {
        pendingFulfillment++;
      }
      if (o.status === 'Quality checked' && !o.erpInvoiceAttached) {
        invoicePending++;
      }
      if (o.status === 'Dispatched') {
        inTransit++;
      }
      if (o.returnRequest && o.returnRequest.status === 'Pending') {
        returnsCount++;
      }
    });

    return {
      total: orders.length,
      pendingFulfillment,
      invoicePending,
      inTransit,
      returnsCount,
    };
  }, [orders]);

  // Handle start refund resolution
  const handleOpenRefundModal = (order: Order, resolution: 'Approved' | 'Rejected') => {
    setSelectedReturnOrder(order);
    setRefundResolution(resolution);
    setRefundResolutionNote(
      resolution === 'Approved'
        ? 'Refund approved following custody verification and bullion purity re-assay.'
        : 'Refund declined: Item bullion seal opened / non-compliant with buyback terms.'
    );
    setReauthPassword('');
    setReauthError(null);
    setRefundModalOpen(true);
  };

  // Handle submit refund re-auth
  const handleConfirmRefund = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedReturnOrder) return;

    if (refundResolution === 'Approved') {
      const isValid = reauthenticateAdmin(reauthPassword);
      if (!isValid) {
        setReauthError('Invalid administrative passphrase. Dual-authorization failed.');
        return;
      }
    }

    resolveReturnRequest(selectedReturnOrder.id, refundResolution, refundResolutionNote, currentActor);
    setActionNotice(
      `Return request for Order #${selectedReturnOrder.orderNumber} ${refundResolution.toLowerCase()} successfully.`
    );
    setRefundModalOpen(false);
    setTimeout(() => setActionNotice(null), 3500);
  };

  // Handle Mark Reconciled
  const handleReconcileSettlement = (id: string, txnId: string) => {
    markSettlementReconciled(id, currentActor);
    setActionNotice(`Settlement transaction ${txnId} marked as Reconciled.`);
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
      {/* 1. HEADER & METRICS */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-[#EADFC8]">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-serif text-2xl font-bold text-[#5A4630]">
              Orders, Fulfilment & Gateway Settlements
            </h1>
            <Badge variant="gold" size="sm">Phase 9 Complete</Badge>
          </div>
          <p className="text-xs text-[#7A6A55] mt-1">
            Custody progression, invoice-gated dispatch, payment webhook idempotency, and settlement reconciliation.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link to="/c/gold" target="_blank" rel="noopener noreferrer">
            <Button variant="outline" size="sm" rightIcon={<ExternalLink className="w-3.5 h-3.5" />}>
              Open Storefront
            </Button>
          </Link>
        </div>
      </div>

      {/* KPI Tiles */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <div className="p-3 bg-white border border-[#EADFC8] rounded-xl shadow-sm">
          <div className="text-[11px] text-[#7A6A55]">Total Orders</div>
          <div className="text-lg font-bold text-[#5A4630] font-mono tabular-nums mt-0.5">
            {metrics.total}
          </div>
          <div className="text-[10px] text-[#7A6A55] mt-0.5">Storefront + Vault orders</div>
        </div>

        <div className="p-3 bg-white border border-[#EADFC8] rounded-xl shadow-sm">
          <div className="text-[11px] text-[#7A6A55]">Pending Fulfilment</div>
          <div className="text-lg font-bold text-[#C9A24B] font-mono tabular-nums mt-0.5">
            {metrics.pendingFulfillment}
          </div>
          <div className="text-[10px] text-[#7A6A55] mt-0.5">Pick, Pack & QC stages</div>
        </div>

        <div className="p-3 bg-white border border-[#EADFC8] rounded-xl shadow-sm">
          <div className="text-[11px] text-[#7A6A55]">ERP Invoice Pending</div>
          <div className="text-lg font-bold text-[#A83232] font-mono tabular-nums mt-0.5">
            {metrics.invoicePending}
          </div>
          <div className="text-[10px] text-[#A83232] mt-0.5">Blocks transit dispatch</div>
        </div>

        <div className="p-3 bg-white border border-[#EADFC8] rounded-xl shadow-sm">
          <div className="text-[11px] text-[#7A6A55]">In Armoured Transit</div>
          <div className="text-lg font-bold text-[#2D5A27] font-mono tabular-nums mt-0.5">
            {metrics.inTransit}
          </div>
          <div className="text-[10px] text-[#2D5A27] mt-0.5">Sequel & BVC couriers</div>
        </div>

        <div className="p-3 bg-white border border-[#EADFC8] rounded-xl shadow-sm">
          <div className="text-[11px] text-[#7A6A55]">Returns / Refund Queue</div>
          <div className="text-lg font-bold text-[#A83232] font-mono tabular-nums mt-0.5">
            {metrics.returnsCount}
          </div>
          <div className="text-[10px] text-[#7A6A55] mt-0.5">Requires re-auth approval</div>
        </div>
      </div>

      {/* Action Notification Banner */}
      {actionNotice && (
        <div className="p-3 bg-[#EBF3E8] border border-[#2D5A27]/20 rounded-xl text-[#2D5A27] text-xs flex items-center justify-between shadow-sm animate-fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{actionNotice}</span>
          </div>
        </div>
      )}

      {/* 2. QUEUE NAVIGATION TABS */}
      <div className="flex items-center gap-2 border-b border-[#EADFC8] overflow-x-auto">
        <button
          onClick={() => setActiveTab('all')}
          className={`px-4 py-2.5 text-xs font-semibold border-b-2 transition-colors flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'all'
              ? 'border-[#C9A24B] text-[#5A4630] bg-[#F8EFD9]/40'
              : 'border-transparent text-[#7A6A55] hover:text-[#5A4630]'
          }`}
        >
          <ShoppingBag className="w-4 h-4 text-[#C9A24B]" />
          <span>All Orders</span>
          <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-white border border-[#EADFC8] text-[#5A4630]">
            {orders.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('unpaid')}
          className={`px-4 py-2.5 text-xs font-semibold border-b-2 transition-colors flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'unpaid'
              ? 'border-[#C9A24B] text-[#5A4630] bg-[#F8EFD9]/40'
              : 'border-transparent text-[#7A6A55] hover:text-[#5A4630]'
          }`}
        >
          <Clock className="w-4 h-4 text-[#A83232]" />
          <span>Pending & Failed Payments</span>
          {unpaidOrders.length > 0 && (
            <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-[#FDF2F2] border border-[#A83232]/20 text-[#A83232]">
              {unpaidOrders.length}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('returns')}
          className={`px-4 py-2.5 text-xs font-semibold border-b-2 transition-colors flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'returns'
              ? 'border-[#C9A24B] text-[#5A4630] bg-[#F8EFD9]/40'
              : 'border-transparent text-[#7A6A55] hover:text-[#5A4630]'
          }`}
        >
          <RotateCcw className="w-4 h-4 text-[#C9A24B]" />
          <span>Returns & Refunds Queue</span>
          {returnQueueOrders.length > 0 && (
            <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-[#FBE7B8] border border-[#E8C26E] text-[#7A5310] font-bold">
              {returnQueueOrders.length}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('settlements')}
          className={`px-4 py-2.5 text-xs font-semibold border-b-2 transition-colors flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'settlements'
              ? 'border-[#C9A24B] text-[#5A4630] bg-[#F8EFD9]/40'
              : 'border-transparent text-[#7A6A55] hover:text-[#5A4630]'
          }`}
        >
          <Building2 className="w-4 h-4 text-[#C9A24B]" />
          <span>Settlement Reconciliation</span>
          <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-white border border-[#EADFC8] text-[#7A6A55]">
            {settlements.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('claims')}
          className={`px-4 py-2.5 text-xs font-semibold border-b-2 transition-colors flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'claims'
              ? 'border-[#C9A24B] text-[#5A4630] bg-[#F8EFD9]/40'
              : 'border-transparent text-[#7A6A55] hover:text-[#5A4630]'
          }`}
        >
          <ShieldCheck className="w-4 h-4 text-[#C9A24B]" />
          <span>Insurance Claims</span>
          <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-white border border-[#EADFC8] text-[#7A6A55]">
            {claims.length}
          </span>
        </button>
      </div>

      {/* ============================================================== */}
      {/* TAB 1: ALL ORDERS TABLE                                        */}
      {/* ============================================================== */}
      {activeTab === 'all' && (
        <div className="space-y-4">
          {/* Search & Filter Card */}
          <Card className="p-4 bg-white border-[#EADFC8]">
            <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
              <div className="relative flex-1">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#7A6A55]" />
                <input
                  type="text"
                  placeholder="Filter by Order #, Customer, Email, or Courier AWB..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 text-xs bg-[#FFFBF3] border border-[#EADFC8] rounded-lg text-[#5A4630]"
                />
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                <div className="flex items-center gap-1 text-xs text-[#7A6A55]">
                  <Filter className="w-3.5 h-3.5 text-[#C9A24B]" />
                  <span>Status:</span>
                </div>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  aria-label="Filter orders by fulfillment status"
                  className="px-2.5 py-1.5 text-xs bg-[#FFFBF3] border border-[#EADFC8] rounded-lg text-[#5A4630]"
                >
                  <option value="all">All Fulfilment Stages</option>
                  <option value="Placed">Placed</option>
                  <option value="Payment confirmed">Payment confirmed</option>
                  <option value="Picked">Picked</option>
                  <option value="Packed">Packed</option>
                  <option value="Quality checked">Quality checked</option>
                  <option value="Invoice issued">Invoice issued</option>
                  <option value="Dispatched">Dispatched</option>
                  <option value="Delivered">Delivered</option>
                  <option value="Return requested">Return requested</option>
                </select>

                <div className="flex items-center gap-1 text-xs text-[#7A6A55] ml-2">
                  <span>Payment:</span>
                </div>
                <select
                  value={paymentFilter}
                  onChange={(e) => setPaymentFilter(e.target.value)}
                  aria-label="Filter orders by payment status"
                  className="px-2.5 py-1.5 text-xs bg-[#FFFBF3] border border-[#EADFC8] rounded-lg text-[#5A4630]"
                >
                  <option value="all">All Payment Results</option>
                  <option value="Success">Success (Paid)</option>
                  <option value="Pending">Pending Verification</option>
                  <option value="Failed">Failed / Declined</option>
                  <option value="Timeout">Session Timeout</option>
                </select>
              </div>
            </div>
          </Card>

          {/* Orders Table */}
          <Card className="overflow-hidden border-[#EADFC8] bg-white">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-[#F8EFD9] text-[#5A4630] border-b border-[#EADFC8]">
                    <th className="py-3 px-4 font-semibold">Order Reference & Date</th>
                    <th className="py-3 px-3 font-semibold">Investor Profile</th>
                    <th className="py-3 px-3 font-semibold">Consignment Articles</th>
                    <th className="py-3 px-3 font-semibold text-right">Grand Total</th>
                    <th className="py-3 px-3 font-semibold text-center">Payment Result</th>
                    <th className="py-3 px-3 font-semibold text-center">Custody Stage</th>
                    <th className="py-3 px-3 font-semibold text-center">ERP Invoice</th>
                    <th className="py-3 px-4 font-semibold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#EADFC8]/60 text-[#5A4630]">
                  {filteredOrders.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-8 text-center text-[#7A6A55]">
                        No orders match the current filter criteria.
                      </td>
                    </tr>
                  ) : (
                    filteredOrders.map((o) => (
                      <tr key={o.id} className="hover:bg-[#FFFBF3] transition-colors">
                        <td className="py-3 px-4">
                          <Link
                            to={`/admin/orders/${o.id}`}
                            className="font-mono font-bold text-[#5A4630] hover:text-[#C9A24B] hover:underline"
                          >
                            {o.orderNumber}
                          </Link>
                          <div className="text-[10px] text-[#7A6A55] mt-0.5">
                            {new Date(o.createdAt).toLocaleString()}
                          </div>
                        </td>

                        <td className="py-3 px-3">
                          <div className="font-semibold text-[#5A4630]">{o.customerName}</div>
                          <div className="text-[10px] text-[#7A6A55]">
                            {o.shippingAddress.city} • Pin: {o.shippingAddress.pincode}
                          </div>
                        </td>

                        <td className="py-3 px-3 text-[#5A4630]">
                          <div className="truncate max-w-[200px]" title={o.items.map((i) => `${i.quantity}x ${i.name}`).join(', ')}>
                            {o.items.map((i) => `${i.quantity}x ${i.name}`).join(', ')}
                          </div>
                          <div className="text-[10px] text-[#7A6A55]">
                            {o.items.length} unique line item(s)
                          </div>
                        </td>

                        <td className="py-3 px-3 text-right font-mono font-bold text-[#5A4630] tabular-nums">
                          {formatINR(o.totalAmount)}
                        </td>

                        <td className="py-3 px-3 text-center">
                          <Badge
                            variant={
                              o.paymentStatus === 'Success'
                                ? 'sage'
                                : o.paymentStatus === 'Pending'
                                ? 'amber'
                                : 'coral'
                            }
                            size="sm"
                          >
                            {o.paymentStatus}
                          </Badge>
                          <div className="text-[10px] text-[#7A6A55] mt-0.5">{o.paymentMethod}</div>
                        </td>

                        <td className="py-3 px-3 text-center">
                          {getStatusBadge(o.status)}
                          {o.trackingNumber && (
                            <div className="text-[10px] font-mono text-[#7A6A55] mt-0.5">
                              AWB: {o.trackingNumber}
                            </div>
                          )}
                        </td>

                        <td className="py-3 px-3 text-center">
                          {o.erpInvoiceAttached ? (
                            <span className="inline-flex items-center gap-1 font-mono text-[10px] text-[#2D5A27] bg-[#EBF3E8] px-2 py-0.5 rounded">
                              ✓ {o.erpInvoiceNumber}
                            </span>
                          ) : (
                            <span className="text-[10px] text-[#A83232] font-semibold">
                              Pending Attach
                            </span>
                          )}
                        </td>

                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <Link to={`/admin/orders/${o.id}`}>
                              <Button variant="primary" size="sm" className="text-[11px] h-7 px-2.5">
                                Fulfil & Inspect
                              </Button>
                            </Link>

                            <Link
                              to={`/order/${o.id}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-1.5 rounded hover:bg-[#F8EFD9] text-[#7A6A55]"
                              title="Inspect Customer Store View"
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                            </Link>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      )}

      {/* ============================================================== */}
      {/* TAB 2: PENDING & FAILED PAYMENTS QUEUE                         */}
      {/* ============================================================== */}
      {activeTab === 'unpaid' && (
        <Card className="overflow-hidden border-[#EADFC8] bg-white">
          <div className="p-3.5 bg-[#F8EFD9] border-b border-[#EADFC8] flex items-center justify-between">
            <h3 className="font-serif text-sm font-bold text-[#5A4630]">
              Incomplete, Pending & Failed Payment Exceptions
            </h3>
            <span className="text-xs text-[#7A6A55]">
              Orders stalled at gateway authorization or webhook timeout
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[650px] text-left text-xs border-collapse">
            <thead>
              <tr className="bg-[#FFFBF3] text-[#7A6A55] border-b border-[#EADFC8]">
                <th className="py-2.5 px-4 font-semibold">Order Reference</th>
                <th className="py-2.5 px-3 font-semibold">Customer</th>
                <th className="py-2.5 px-3 font-semibold text-right">Attempted Amount</th>
                <th className="py-2.5 px-3 font-semibold">Gateway Method</th>
                <th className="py-2.5 px-3 font-semibold text-center">Exception State</th>
                <th className="py-2.5 px-4 font-semibold text-right">Resolution</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EADFC8]/60 text-[#5A4630]">
              {unpaidOrders.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-[#7A6A55]">
                    No payment exceptions recorded. All orders authorized successfully.
                  </td>
                </tr>
              ) : (
                unpaidOrders.map((o) => (
                  <tr key={o.id} className="hover:bg-[#FFFBF3]">
                    <td className="py-3 px-4 font-mono font-semibold text-[#5A4630]">
                      {o.orderNumber}
                      <div className="text-[10px] text-[#7A6A55] font-sans">
                        {new Date(o.createdAt).toLocaleTimeString()}
                      </div>
                    </td>
                    <td className="py-3 px-3 text-[#5A4630]">
                      <div>{o.customerName}</div>
                      <div className="text-[10px] text-[#7A6A55]">{o.customerEmail}</div>
                    </td>
                    <td className="py-3 px-3 text-right font-mono font-bold tabular-nums text-[#5A4630]">
                      {formatINR(o.totalAmount)}
                    </td>
                    <td className="py-3 px-3 text-[#5A4630]">
                      {o.paymentMethod}
                    </td>
                    <td className="py-3 px-3 text-center">
                      <Badge variant="coral" size="sm">
                        {o.paymentStatus}
                      </Badge>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <Link to={`/admin/orders/${o.id}`}>
                        <Button variant="outline" size="sm" className="text-[11px]">
                          Inspect Webhook Log
                        </Button>
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
          </div>
        </Card>
      )}

      {/* ============================================================== */}
      {/* TAB 3: RETURNS & REFUNDS QUEUE                                 */}
      {/* ============================================================== */}
      {activeTab === 'returns' && (
        <Card className="overflow-hidden border-[#EADFC8] bg-white">
          <div className="p-3.5 bg-[#F8EFD9] border-b border-[#EADFC8] flex items-center justify-between">
            <div>
              <h3 className="font-serif text-sm font-bold text-[#5A4630]">
                Customer Return, Cancellation & Buyback Queue
              </h3>
              <p className="text-[11px] text-[#7A6A55]">
                Requests submitted via customer account portal. Bullion buyback policies and re-assay verification apply.
              </p>
            </div>
            <Badge variant="amber" size="sm">Dual-Auth Required for Refunds</Badge>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[650px] text-left text-xs border-collapse">
            <thead>
              <tr className="bg-[#FFFBF3] text-[#7A6A55] border-b border-[#EADFC8]">
                <th className="py-2.5 px-4 font-semibold">Order #</th>
                <th className="py-2.5 px-3 font-semibold">Customer</th>
                <th className="py-2.5 px-3 font-semibold text-right">Refund Amount</th>
                <th className="py-2.5 px-3 font-semibold">Customer Stated Reason</th>
                <th className="py-2.5 px-3 font-semibold text-center">Queue Status</th>
                <th className="py-2.5 px-4 font-semibold text-right">Officer Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EADFC8]/60 text-[#5A4630]">
              {returnQueueOrders.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-[#7A6A55]">
                    No return or cancellation requests currently pending.
                  </td>
                </tr>
              ) : (
                returnQueueOrders.map((o) => {
                  const req = o.returnRequest;
                  const isPending = req?.status === 'Pending' || o.status === 'Return requested';

                  return (
                    <tr key={o.id} className="hover:bg-[#FFFBF3]">
                      <td className="py-3 px-4 font-mono font-semibold text-[#5A4630]">
                        <Link to={`/admin/orders/${o.id}`} className="hover:underline text-[#C9A24B]">
                          {o.orderNumber}
                        </Link>
                      </td>
                      <td className="py-3 px-3 text-[#5A4630]">
                        <div className="font-semibold">{o.customerName}</div>
                        <div className="text-[10px] text-[#7A6A55]">{o.customerPhone}</div>
                      </td>
                      <td className="py-3 px-3 text-right font-mono font-bold text-[#5A4630] tabular-nums">
                        {formatINR(o.totalAmount)}
                      </td>
                      <td className="py-3 px-3 text-[#7A6A55] max-w-xs">
                        <div className="italic">"{req?.reason || 'Customer requested return prior to dispatch'}"</div>
                        {req?.resolutionNote && (
                          <div className="text-[10px] text-[#2D5A27] mt-0.5">
                            Resolution: {req.resolutionNote}
                          </div>
                        )}
                      </td>
                      <td className="py-3 px-3 text-center">
                        <Badge
                          variant={
                            req?.status === 'Approved'
                              ? 'sage'
                              : req?.status === 'Rejected'
                              ? 'coral'
                              : 'amber'
                          }
                          size="sm"
                        >
                          {req?.status || 'Pending Review'}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 text-right">
                        {isPending ? (
                          <div className="flex items-center justify-end gap-1.5">
                            <Button
                              variant="primary"
                              size="sm"
                              onClick={() => handleOpenRefundModal(o, 'Approved')}
                              disabled={!canApproveRefunds}
                              className="text-[11px] h-7 px-2.5"
                            >
                              Approve Refund (Re-Auth)
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleOpenRefundModal(o, 'Rejected')}
                              disabled={!canManageOrders}
                              className="text-[11px] h-7 px-2 text-[#A83232] border-[#A83232]/30 hover:bg-[#FDF2F2]"
                            >
                              Reject
                            </Button>
                          </div>
                        ) : (
                          <span className="text-[11px] text-[#7A6A55]">
                            Resolved ({o.status})
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
          </div>
        </Card>
      )}

      {/* ============================================================== */}
      {/* TAB 4: SETTLEMENT RECONCILIATION                               */}
      {/* ============================================================== */}
      {activeTab === 'settlements' && (
        <Card className="overflow-hidden border-[#EADFC8] bg-white">
          <div className="p-3.5 bg-[#F8EFD9] border-b border-[#EADFC8] flex items-center justify-between">
            <div>
              <h3 className="font-serif text-sm font-bold text-[#5A4630]">
                Payment Gateway Settlement Reconciliation Matrix
              </h3>
              <p className="text-[11px] text-[#7A6A55]">
                Banking ledger reconciliation between captured store GMV and credited nodal bank settlements.
              </p>
            </div>
            <span className="text-xs text-[#7A6A55]">
              HSBC / HDFC Nodal Settlement Sync
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[700px] text-left text-xs border-collapse">
            <thead>
              <tr className="bg-[#FFFBF3] text-[#7A6A55] border-b border-[#EADFC8]">
                <th className="py-2.5 px-4 font-semibold">Transaction ID</th>
                <th className="py-2.5 px-3 font-semibold">Order Reference</th>
                <th className="py-2.5 px-3 font-semibold text-right">Gross GMV</th>
                <th className="py-2.5 px-3 font-semibold text-right">MDR Gateway Fee</th>
                <th className="py-2.5 px-3 font-semibold text-right">Net Credited</th>
                <th className="py-2.5 px-3 font-semibold text-center">Status</th>
                <th className="py-2.5 px-4 font-semibold text-right">Reconciliation Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EADFC8]/60 text-[#5A4630]">
              {settlements.map((s) => (
                <tr key={s.id} className="hover:bg-[#FFFBF3]">
                  <td className="py-3 px-4 font-mono font-semibold text-[#5A4630]">
                    {s.transactionId}
                    {s.settledAt && (
                      <div className="text-[10px] text-[#7A6A55] font-sans">
                        Settled: {new Date(s.settledAt).toLocaleDateString()}
                      </div>
                    )}
                  </td>
                  <td className="py-3 px-3 font-mono text-[#5A4630]">
                    {s.orderNumber}
                    <div className="text-[10px] text-[#7A6A55] font-sans">{s.customerName}</div>
                  </td>
                  <td className="py-3 px-3 text-right font-mono tabular-nums text-[#5A4630]">
                    {formatINR(s.amount)}
                  </td>
                  <td className="py-3 px-3 text-right font-mono tabular-nums text-[#A83232]">
                    {s.gatewayFee > 0 ? `-${formatINR(s.gatewayFee)}` : '₹0 (UPI)'}
                  </td>
                  <td className="py-3 px-3 text-right font-mono font-bold tabular-nums text-[#2D5A27]">
                    {formatINR(s.netSettlement)}
                  </td>
                  <td className="py-3 px-3 text-center">
                    <Badge
                      variant={
                        s.reconciliationStatus === 'Reconciled' || s.reconciliationStatus === 'Matched'
                          ? 'sage'
                          : 'coral'
                      }
                      size="sm"
                    >
                      {s.reconciliationStatus}
                    </Badge>
                  </td>
                  <td className="py-3 px-4 text-right">
                    {s.reconciliationStatus === 'Unmatched' ? (
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => handleReconcileSettlement(s.id, s.transactionId)}
                        disabled={!canManageOrders}
                        className="text-[11px] h-7 px-2.5"
                      >
                        Mark Reconciled
                      </Button>
                    ) : (
                      <span className="text-[11px] text-[#2D5A27] font-semibold flex items-center justify-end gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Reconciled
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          </div>
        </Card>
      )}

      {/* ============================================================== */}
      {/* TAB 5: INSURANCE CLAIMS                                        */}
      {/* ============================================================== */}
      {activeTab === 'claims' && (
        <Card className="overflow-hidden border-[#EADFC8] bg-white">
          <div className="p-3.5 bg-[#F8EFD9] border-b border-[#EADFC8] flex items-center justify-between">
            <div>
              <h3 className="font-serif text-sm font-bold text-[#5A4630]">
                High-Value Armoured Courier Insurance Claims
              </h3>
              <p className="text-[11px] text-[#7A6A55]">
                100% full transit insurance claims filed with Sequel Logistics and BVC Vaulting underwriter syndicates.
              </p>
            </div>
            <span className="text-xs text-[#7A6A55]">
              Transit Policy #T-SEC-99201-IND
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[650px] text-left text-xs border-collapse">
            <thead>
              <tr className="bg-[#FFFBF3] text-[#7A6A55] border-b border-[#EADFC8]">
                <th className="py-2.5 px-4 font-semibold">Claim ID</th>
                <th className="py-2.5 px-3 font-semibold">Order Reference</th>
                <th className="py-2.5 px-3 font-semibold">Courier & AWB</th>
                <th className="py-2.5 px-3 font-semibold text-right">Claimed Value</th>
                <th className="py-2.5 px-3 font-semibold">Reason / Investigation Note</th>
                <th className="py-2.5 px-4 font-semibold text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EADFC8]/60 text-[#5A4630]">
              {claims.map((c) => (
                <tr key={c.id} className="hover:bg-[#FFFBF3]">
                  <td className="py-3 px-4 font-mono font-semibold text-[#5A4630]">
                    {c.id}
                    <div className="text-[10px] text-[#7A6A55] font-sans">
                      {new Date(c.createdAt).toLocaleDateString()}
                    </div>
                  </td>
                  <td className="py-3 px-3 font-mono font-semibold text-[#5A4630]">
                    <Link to={`/admin/orders/${c.orderId}`} className="hover:underline text-[#C9A24B]">
                      {c.orderNumber}
                    </Link>
                  </td>
                  <td className="py-3 px-3 text-[#5A4630]">
                    <div className="font-semibold">{c.courierName}</div>
                    <div className="font-mono text-[10px] text-[#7A6A55]">AWB: {c.trackingNumber}</div>
                  </td>
                  <td className="py-3 px-3 text-right font-mono font-bold text-[#A83232] tabular-nums">
                    {formatINR(c.claimAmount)}
                  </td>
                  <td className="py-3 px-3 text-[11px] text-[#7A6A55] max-w-xs">
                    {c.reason}
                    <div className="text-[10px] text-[#5A4630] mt-0.5">Filed by: {c.filedBy}</div>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <Badge variant="amber" size="sm">
                      {c.status}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          </div>
        </Card>
      )}

      {/* 3. TAGGED PROPOSED CAPABILITIES */}
      <Card className="p-4 bg-[#FFFBF3] border-[#EADFC8] space-y-2">
        <div className="flex items-center gap-2">
          <Badge variant="gold" size="sm">TAGGED Proposed</Badge>
          <span className="font-serif text-xs font-bold text-[#5A4630]">
            Advanced Institutional Logistics & Fulfilment Capabilities
          </span>
        </div>
        <p className="text-[11px] text-[#7A6A55] leading-relaxed">
          The following features are designed in accordance with enterprise jewellery ERP specifications and marked for Phase 2:
        </p>
        <div className="grid grid-cols-2 md:grid-cols-6 gap-2 pt-1 text-[11px] text-[#5A4630]">
          <span className="p-2 bg-white border border-[#EADFC8] rounded text-center">
            • Partial Shipment / Split Line
          </span>
          <span className="p-2 bg-white border border-[#EADFC8] rounded text-center">
            • Automated Exchange Desk
          </span>
          <span className="p-2 bg-white border border-[#EADFC8] rounded text-center">
            • Bespoke Gift Hamper Pack
          </span>
          <span className="p-2 bg-white border border-[#EADFC8] rounded text-center">
            • Manual Phone Order Intake
          </span>
          <span className="p-2 bg-white border border-[#EADFC8] rounded text-center">
            • Executive Concierge Escalation
          </span>
          <span className="p-2 bg-white border border-[#EADFC8] rounded text-center">
            • Reverse Return Transit Pickup
          </span>
        </div>
      </Card>

      {/* 4. MODAL: RE-AUTHENTICATE FOR REFUND APPROVAL */}
      <Modal
        isOpen={refundModalOpen}
        onClose={() => setRefundModalOpen(false)}
        title={
          refundResolution === 'Approved'
            ? 'Dual-Authorization: Approve Refund'
            : 'Confirm Return Request Rejection'
        }
        maxWidth="md"
      >
        <form onSubmit={handleConfirmRefund} className="space-y-4 text-xs text-[#5A4630]">
          <div className="p-3 bg-[#FFFBF3] border border-[#EADFC8] rounded-xl space-y-1">
            <div className="font-semibold text-[#5A4630]">
              Order #{selectedReturnOrder?.orderNumber} • {selectedReturnOrder?.customerName}
            </div>
            <div className="flex justify-between text-[11px] text-[#7A6A55]">
              <span>Customer Stated Reason:</span>
              <strong className="text-[#5A4630]">"{selectedReturnOrder?.returnRequest?.reason}"</strong>
            </div>
            <div className="flex justify-between text-[11px] text-[#7A6A55] pt-1">
              <span>Total Refund Consideration:</span>
              <strong className="font-mono text-[#A83232]">
                {formatINR(selectedReturnOrder?.totalAmount || 0)}
              </strong>
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-[#7A6A55] mb-1">
              Officer Resolution Notes *
            </label>
            <textarea
              rows={2}
              required
              value={refundResolutionNote}
              onChange={(e) => setRefundResolutionNote(e.target.value)}
              className="w-full px-3 py-1.5 text-xs bg-white border border-[#EADFC8] rounded-lg"
            />
          </div>

          {refundResolution === 'Approved' && (
            <div className="p-3 bg-[#FDF2F2] border border-[#A83232]/20 rounded-xl space-y-2">
              <div className="flex items-center gap-1.5 text-[#A83232] font-semibold text-[11px]">
                <KeyRound className="w-3.5 h-3.5" />
                Administrative Passphrase Re-Authentication
              </div>
              <p className="text-[10px] text-[#7A6A55]">
                High-value precious bullion refunds require cryptographic officer verification. Enter your password to seal this reversal.
              </p>
              <input
                type="password"
                required
                value={reauthPassword}
                onChange={(e) => {
                  setReauthPassword(e.target.value);
                  setReauthError(null);
                }}
                placeholder="Enter admin password (e.g. admin123 or any string in demo)"
                className="w-full px-3 py-1.5 text-xs bg-white border border-[#EADFC8] rounded-lg"
              />
              {reauthError && (
                <div className="text-[11px] text-[#A83232] flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3" />
                  <span>{reauthError}</span>
                </div>
              )}
            </div>
          )}

          <div className="flex justify-end gap-2 pt-3 border-t border-[#EADFC8]">
            <Button type="button" variant="outline" size="sm" onClick={() => setRefundModalOpen(false)}>
              Cancel
            </Button>
            <Button
              type="submit"
              variant={refundResolution === 'Approved' ? 'primary' : 'outline'}
              size="sm"
            >
              {refundResolution === 'Approved' ? 'Confirm & Execute Refund' : 'Confirm Rejection'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
