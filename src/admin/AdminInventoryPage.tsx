import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useAppStore } from '../store';
import { useSEO } from '../lib/useSEO';
import { formatINR } from '../lib/pricing';
import { Card } from '../components/Card';
import { Badge } from '../components/Badge';
import { Button } from '../components/Button';
import { Modal } from '../components/Modal';
import type { Product, Quote } from '../data/types';
import {
  Boxes,
  RotateCcw,
  Sliders,
  CheckCircle2,
  Clock,
  FileText,
  RefreshCw,
  ShieldAlert,
  Search,
  Filter,
  Check,
  X,
  ShieldCheck,
} from 'lucide-react';

export const AdminInventoryPage: React.FC = () => {
  useSEO({
    title: 'Separate Online Stock Pool & Active Quotes',
    description: 'Manage dedicated online stock pools, stock receipts, reservation releases, damaged/quarantine adjustments, and live customer quote locks.',
    canonicalPath: '/admin/inventory',
  });

  const {
    products,
    quotes,
    inventoryLogs,
    isFeedStale,
    rates,
    adminUser,
    activeRole,
    inventoryReceipt,
    releaseReservation,
    inventoryAdjustment,
    reconcileStock,
    cancelQuote,
    requote,
  } = useAppStore();

  const currentActor = adminUser?.name || 'Vikram Sharma';
  const canManageInventory = activeRole === 'Super Admin' || activeRole === 'Warehouse';
  const canManageQuotes = activeRole === 'Super Admin' || activeRole === 'Pricing' || activeRole === 'Warehouse';

  // Active Main Tab
  const [activeTab, setActiveTab] = useState<'stock' | 'quotes' | 'staleQueue' | 'logs'>('stock');

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [stockStatusFilter, setStockStatusFilter] = useState<string>('all');
  const [quoteStatusFilter, setQuoteStatusFilter] = useState<string>('all');

  // Modals State
  const [receiptModalOpen, setReceiptModalOpen] = useState(false);
  const [releaseModalOpen, setReleaseModalOpen] = useState(false);
  const [adjustmentModalOpen, setAdjustmentModalOpen] = useState(false);
  const [reconcileModalOpen, setReconcileModalOpen] = useState(false);
  const [activeProduct, setActiveProduct] = useState<Product | null>(null);

  // Form Fields: Receipt Modal
  const [receiptQty, setReceiptQty] = useState<number>(10);
  const [receiptLot, setReceiptLot] = useState('LOT-AU24-2026-INW-01');
  const [receiptSupplier, setReceiptSupplier] = useState('MMTC-PAMP India Pvt Ltd');
  const [receiptNotes, setReceiptNotes] = useState('Festive season stock replenishment');

  // Form Fields: Reservation Release Modal
  const [releaseQty, setReleaseQty] = useState<number>(1);
  const [releaseReason, setReleaseReason] = useState('Abandoned quote lock expired / phone enquiry cancellation');

  // Form Fields: Adjustment Modal
  const [adjType, setAdjType] = useState<'onHand' | 'damaged' | 'quarantined'>('onHand');
  const [adjDelta, setAdjDelta] = useState<number>(-1);
  const [adjReason, setAdjReason] = useState('Assay seal minor flaw detected during secondary inspection');

  // Form Fields: Reconciliation Modal
  const [physicalCount, setPhysicalCount] = useState<number>(0);
  const [reconcileNotes, setReconcileNotes] = useState('Quarterly high-security physical vault verification');

  // Feedback notifications
  const [feedbackNotice, setFeedbackNotice] = useState<string | null>(null);

  // Filtered Products
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchesSearch =
        searchQuery === '' ||
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.lotBatchSerial.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesCategory = categoryFilter === 'all' || p.category === categoryFilter;

      const available = Math.max(0, p.stock - p.reserved);
      let status = 'in_stock';
      if (available === 0) status = 'out_of_stock';
      else if (available <= (p.reorderThreshold || 5)) status = 'low_stock';

      const matchesStatus = stockStatusFilter === 'all' || status === stockStatusFilter;

      return matchesSearch && matchesCategory && matchesStatus;
    });
  }, [products, searchQuery, categoryFilter, stockStatusFilter]);

  // Filtered Quotes
  const filteredQuotes = useMemo(() => {
    return quotes.filter((q) => {
      const matchesSearch =
        searchQuery === '' ||
        q.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        q.productName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (q.customerId || '').toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus = quoteStatusFilter === 'all' || q.status === quoteStatusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [quotes, searchQuery, quoteStatusFilter]);

  // Stale-Rate Requote Queue
  // Quotes created or active that may have locked stale rates when isFeedStale is true, or quotes marked Expired during downtime
  const staleQuotesQueue = useMemo(() => {
    return quotes.filter((q) => {
      return (
        (isFeedStale && q.status === 'Active') ||
        (q.status === 'Expired' && new Date(q.expiresAt).getTime() > Date.now() - 3600000 * 24)
      );
    });
  }, [quotes, isFeedStale]);

  // Aggregate Metrics
  const metrics = useMemo(() => {
    let totalOnHand = 0;
    let totalReserved = 0;
    let totalDamaged = 0;
    let totalQuarantined = 0;
    let lowStockCount = 0;

    products.forEach((p) => {
      totalOnHand += p.stock;
      totalReserved += p.reserved;
      totalDamaged += p.damaged || 0;
      totalQuarantined += p.quarantined || 0;
      const available = Math.max(0, p.stock - p.reserved);
      if (available <= (p.reorderThreshold || 5)) {
        lowStockCount++;
      }
    });

    const activeQuotesCount = quotes.filter((q) => q.status === 'Active').length;

    return {
      totalOnHand,
      totalReserved,
      totalAvailable: Math.max(0, totalOnHand - totalReserved),
      totalDamaged,
      totalQuarantined,
      lowStockCount,
      activeQuotesCount,
    };
  }, [products, quotes]);

  // Action Handlers
  const openReceiptModal = (p: Product) => {
    setActiveProduct(p);
    setReceiptQty(5);
    setReceiptLot(p.lotBatchSerial || 'LOT-INW-2026-001');
    setReceiptSupplier('MMTC-PAMP India Pvt Ltd');
    setReceiptNotes(`Standard replenishment for ${p.sku}`);
    setReceiptModalOpen(true);
  };

  const handleConfirmReceipt = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeProduct) return;
    inventoryReceipt(
      activeProduct.id,
      Number(receiptQty),
      receiptLot,
      receiptSupplier,
      receiptNotes,
      currentActor
    );
    setFeedbackNotice(`Stock receipt confirmed: +${receiptQty} units added to ${activeProduct.name}`);
    setReceiptModalOpen(false);
    setTimeout(() => setFeedbackNotice(null), 3000);
  };

  const openReleaseModal = (p: Product) => {
    setActiveProduct(p);
    setReleaseQty(p.reserved > 0 ? 1 : 0);
    setReleaseReason('Customer cancelled lock / expired checkout hold');
    setReleaseModalOpen(true);
  };

  const handleConfirmRelease = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeProduct) return;
    releaseReservation(
      activeProduct.id,
      Number(releaseQty),
      currentActor,
      releaseReason
    );
    setFeedbackNotice(`Reservation released: ${releaseQty} units unlocked for ${activeProduct.name}`);
    setReleaseModalOpen(false);
    setTimeout(() => setFeedbackNotice(null), 3000);
  };

  const openAdjustmentModal = (p: Product) => {
    setActiveProduct(p);
    setAdjType('onHand');
    setAdjDelta(-1);
    setAdjReason('Inspection discrepancy / minor packaging damage');
    setAdjustmentModalOpen(true);
  };

  const handleConfirmAdjustment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeProduct) return;
    inventoryAdjustment(
      activeProduct.id,
      adjType,
      Number(adjDelta),
      adjReason,
      currentActor
    );
    setFeedbackNotice(`Stock adjustment completed for ${activeProduct.name}: ${adjDelta > 0 ? '+' : ''}${adjDelta} (${adjType})`);
    setAdjustmentModalOpen(false);
    setTimeout(() => setFeedbackNotice(null), 3000);
  };

  const openReconcileModal = (p: Product) => {
    setActiveProduct(p);
    setPhysicalCount(p.stock);
    setReconcileNotes('Vault physical bar audit by Warehouse In-charge');
    setReconcileModalOpen(true);
  };

  const handleConfirmReconcile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeProduct) return;
    reconcileStock(
      activeProduct.id,
      Number(physicalCount),
      reconcileNotes,
      currentActor
    );
    setFeedbackNotice(`Stock reconciliation recorded for ${activeProduct.name}. System count set to ${physicalCount}`);
    setReconcileModalOpen(false);
    setTimeout(() => setFeedbackNotice(null), 3000);
  };

  // Quote Actions
  const handleCancelQuote = (quote: Quote) => {
    cancelQuote(quote.id);
    setFeedbackNotice(`Quote ${quote.id} cancelled. ${quote.quantity} units released back to available pool.`);
    setTimeout(() => setFeedbackNotice(null), 3000);
  };

  const handleRequoteLive = (quote: Quote) => {
    const updated = requote(quote.id);
    if (updated) {
      setFeedbackNotice(`Quote ${quote.id} refreshed at latest market rate: ${formatINR(updated.priceBreakdown.total)}.`);
    } else {
      setFeedbackNotice(`Unable to requote: Market feed is currently stale or item unavailable.`);
    }
    setTimeout(() => setFeedbackNotice(null), 3000);
  };

  return (
    <div className="space-y-6">
      {/* 1. SEPARATE ONLINE STOCK POOL BANNER & METRICS */}
      <div className="p-4 bg-white border border-[#EADFC8] rounded-2xl shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-[#EADFC8]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#F8EFD9] flex items-center justify-center text-[#C9A24B] shrink-0">
              <Boxes className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-serif text-lg font-bold text-[#5A4630]">
                  Separate Online Stock Pool
                </span>
                <Badge variant="gold" size="sm">Dedicated Buffer</Badge>
                {isFeedStale && (
                  <Badge variant="coral" size="sm" className="animate-pulse">
                    Feed Stale: Quotes Paused
                  </Badge>
                )}
              </div>
              <p className="text-xs text-[#7A6A55]">
                Physical segregation from retail counters. Dedicated e-commerce vault reserves ensuring real-time lock fulfillment.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link to="/admin/catalogue">
              <Button variant="outline" size="sm">
                View Catalogue SKUs
              </Button>
            </Link>
            <Link to="/c/gold" target="_blank" rel="noopener noreferrer">
              <Button variant="ghost" size="sm">
                Storefront Pool
              </Button>
            </Link>
          </div>
        </div>

        {/* 5 KPI Metric Tiles */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          <div className="p-3 bg-[#FFFBF3] border border-[#EADFC8] rounded-xl">
            <div className="text-[11px] text-[#7A6A55]">On-Hand Physical</div>
            <div className="text-lg font-bold text-[#5A4630] font-mono tabular-nums mt-0.5">
              {metrics.totalOnHand} <span className="text-xs font-normal">units</span>
            </div>
            <div className="text-[10px] text-[#7A6A55] mt-0.5">Total in central vault</div>
          </div>

          <div className="p-3 bg-[#FFFBF3] border border-[#EADFC8] rounded-xl">
            <div className="text-[11px] text-[#7A6A55]">Reserved (Quotes/Cart)</div>
            <div className="text-lg font-bold text-[#C9A24B] font-mono tabular-nums mt-0.5">
              {metrics.totalReserved} <span className="text-xs font-normal">units</span>
            </div>
            <div className="text-[10px] text-[#7A6A55] mt-0.5">{metrics.activeQuotesCount} active quote holds</div>
          </div>

          <div className="p-3 bg-[#FFFBF3] border border-[#EADFC8] rounded-xl">
            <div className="text-[11px] text-[#7A6A55]">Available for Sale</div>
            <div className="text-lg font-bold text-[#2D5A27] font-mono tabular-nums mt-0.5">
              {metrics.totalAvailable} <span className="text-xs font-normal">units</span>
            </div>
            <div className="text-[10px] text-[#2D5A27] mt-0.5">Instant checkout ready</div>
          </div>

          <div className="p-3 bg-[#FFFBF3] border border-[#EADFC8] rounded-xl">
            <div className="text-[11px] text-[#7A6A55]">Damaged & Quarantine</div>
            <div className="text-lg font-bold text-[#A83232] font-mono tabular-nums mt-0.5">
              {metrics.totalDamaged + metrics.totalQuarantined} <span className="text-xs font-normal">units</span>
            </div>
            <div className="text-[10px] text-[#7A6A55] mt-0.5">Requires assay triage</div>
          </div>

          <div className="p-3 bg-[#FFFBF3] border border-[#EADFC8] rounded-xl">
            <div className="text-[11px] text-[#7A6A55]">Low Stock Warnings</div>
            <div className="text-lg font-bold text-[#C9A24B] font-mono tabular-nums mt-0.5">
              {metrics.lowStockCount} <span className="text-xs font-normal">SKUs</span>
            </div>
            <div className="text-[10px] text-[#7A6A55] mt-0.5">Below reorder threshold</div>
          </div>
        </div>
      </div>

      {/* Global Feedback Banner */}
      {feedbackNotice && (
        <div className="p-3 bg-[#EBF3E8] border border-[#2D5A27]/20 rounded-xl text-[#2D5A27] text-xs flex items-center justify-between shadow-sm animate-fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-[#2D5A27]" />
            <span>{feedbackNotice}</span>
          </div>
          <button onClick={() => setFeedbackNotice(null)} className="text-[#2D5A27] hover:opacity-75">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* 2. TAB CONTROLS */}
      <div className="flex items-center gap-2 border-b border-[#EADFC8]">
        <button
          onClick={() => setActiveTab('stock')}
          className={`px-4 py-2.5 text-xs font-semibold border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === 'stock'
              ? 'border-[#C9A24B] text-[#5A4630] bg-[#F8EFD9]/40'
              : 'border-transparent text-[#7A6A55] hover:text-[#5A4630]'
          }`}
        >
          <Boxes className="w-4 h-4 text-[#C9A24B]" />
          <span>Online Stock Pool Table</span>
          <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-white border border-[#EADFC8] text-[#5A4630]">
            {products.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('quotes')}
          className={`px-4 py-2.5 text-xs font-semibold border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === 'quotes'
              ? 'border-[#C9A24B] text-[#5A4630] bg-[#F8EFD9]/40'
              : 'border-transparent text-[#7A6A55] hover:text-[#5A4630]'
          }`}
        >
          <Clock className="w-4 h-4 text-[#C9A24B]" />
          <span>Customer Quotes & Rate Locks</span>
          <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-white border border-[#EADFC8] text-[#5A4630]">
            {quotes.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('staleQueue')}
          className={`px-4 py-2.5 text-xs font-semibold border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === 'staleQueue'
              ? 'border-[#C9A24B] text-[#5A4630] bg-[#F8EFD9]/40'
              : 'border-transparent text-[#7A6A55] hover:text-[#5A4630]'
          }`}
        >
          <ShieldAlert className="w-4 h-4 text-[#A83232]" />
          <span>Stale-Rate Requote Queue</span>
          {staleQuotesQueue.length > 0 && (
            <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-[#FDF2F2] border border-[#A83232]/20 text-[#A83232] font-bold">
              {staleQuotesQueue.length}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('logs')}
          className={`px-4 py-2.5 text-xs font-semibold border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === 'logs'
              ? 'border-[#C9A24B] text-[#5A4630] bg-[#F8EFD9]/40'
              : 'border-transparent text-[#7A6A55] hover:text-[#5A4630]'
          }`}
        >
          <FileText className="w-4 h-4 text-[#C9A24B]" />
          <span>Inventory Movement Logs</span>
          <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-white border border-[#EADFC8] text-[#7A6A55]">
            {inventoryLogs.length}
          </span>
        </button>
      </div>

      {/* ============================================================== */}
      {/* TAB 1: STOCK POOL TABLE                                        */}
      {/* ============================================================== */}
      {activeTab === 'stock' && (
        <div className="space-y-4">
          {/* Search & Filter Header */}
          <Card className="p-4 bg-white border-[#EADFC8]">
            <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
              <div className="relative flex-1">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#7A6A55]" />
                <input
                  type="text"
                  placeholder="Filter by SKU, Product Name, or Lot Number..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 text-xs bg-[#FFFBF3] border border-[#EADFC8] rounded-lg focus:outline-none focus:border-[#C9A24B] text-[#5A4630]"
                />
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                <div className="flex items-center gap-1 text-xs text-[#7A6A55]">
                  <Filter className="w-3.5 h-3.5 text-[#C9A24B]" />
                  <span>Category:</span>
                </div>
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="px-2.5 py-1.5 text-xs bg-[#FFFBF3] border border-[#EADFC8] rounded-lg text-[#5A4630]"
                >
                  <option value="all">All Categories</option>
                  <option value="gold">Gold</option>
                  <option value="silver">Silver</option>
                  <option value="gemstones">Gemstones</option>
                  <option value="rudraksha">Rudraksha</option>
                  <option value="gifting">Gifting</option>
                </select>

                <div className="flex items-center gap-1 text-xs text-[#7A6A55] ml-2">
                  <span>Stock Status:</span>
                </div>
                <select
                  value={stockStatusFilter}
                  onChange={(e) => setStockStatusFilter(e.target.value)}
                  className="px-2.5 py-1.5 text-xs bg-[#FFFBF3] border border-[#EADFC8] rounded-lg text-[#5A4630]"
                >
                  <option value="all">All Levels</option>
                  <option value="in_stock">In Stock (&gt; 5)</option>
                  <option value="low_stock">Low Stock (≤ 5)</option>
                  <option value="out_of_stock">Out of Stock (0)</option>
                </select>
              </div>
            </div>
          </Card>

          {/* Stock Table */}
          <Card className="overflow-hidden border-[#EADFC8] bg-white">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-[#F8EFD9] text-[#5A4630] border-b border-[#EADFC8]">
                    <th className="py-3 px-4 font-semibold">SKU & Item Name</th>
                    <th className="py-3 px-3 font-semibold">Lot / Batch</th>
                    <th className="py-3 px-3 font-semibold text-right">On-Hand</th>
                    <th className="py-3 px-3 font-semibold text-right">Reserved</th>
                    <th className="py-3 px-3 font-semibold text-right">Available</th>
                    <th className="py-3 px-3 font-semibold text-center">Damaged / Qty</th>
                    <th className="py-3 px-3 font-semibold text-center">Reorder Lvl</th>
                    <th className="py-3 px-3 font-semibold text-center">Availability</th>
                    <th className="py-3 px-4 font-semibold text-right">Stock Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#EADFC8]/60 text-[#5A4630]">
                  {filteredProducts.map((p) => {
                    const available = Math.max(0, p.stock - p.reserved);
                    const threshold = p.reorderThreshold || 5;
                    const isLow = available > 0 && available <= threshold;
                    const isOut = available === 0;

                    return (
                      <tr key={p.id} className="hover:bg-[#FFFBF3] transition-colors">
                        <td className="py-3 px-4">
                          <div className="font-semibold text-[#5A4630]">{p.name}</div>
                          <div className="font-mono text-[11px] text-[#7A6A55] mt-0.5">
                            {p.sku} • <span className="capitalize">{p.category}</span>
                          </div>
                        </td>

                        <td className="py-3 px-3 font-mono text-[11px] text-[#7A6A55]">
                          {p.lotBatchSerial}
                        </td>

                        <td className="py-3 px-3 text-right font-mono font-bold text-[#5A4630] tabular-nums">
                          {p.stock}
                        </td>

                        <td className="py-3 px-3 text-right font-mono tabular-nums text-[#C9A24B] font-semibold">
                          {p.reserved}
                        </td>

                        <td className="py-3 px-3 text-right font-mono font-bold tabular-nums">
                          <span
                            className={
                              isOut
                                ? 'text-[#A83232]'
                                : isLow
                                ? 'text-[#C9A24B]'
                                : 'text-[#2D5A27]'
                            }
                          >
                            {available}
                          </span>
                        </td>

                        <td className="py-3 px-3 text-center text-[11px] text-[#7A6A55]">
                          {(p.damaged || 0) + (p.quarantined || 0) > 0 ? (
                            <span className="text-[#A83232] font-semibold">
                              {p.damaged || 0} dmg / {p.quarantined || 0} quar
                            </span>
                          ) : (
                            <span className="text-gray-400">0</span>
                          )}
                        </td>

                        <td className="py-3 px-3 text-center font-mono text-[11px] text-[#7A6A55]">
                          {threshold}
                        </td>

                        <td className="py-3 px-3 text-center">
                          {isOut ? (
                            <Badge variant="coral" size="sm">Out of Stock</Badge>
                          ) : isLow ? (
                            <Badge variant="amber" size="sm">Low Stock</Badge>
                          ) : (
                            <Badge variant="sage" size="sm">In Stock</Badge>
                          )}
                        </td>

                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => openReceiptModal(p)}
                              title="Goods Inward (Receipt)"
                              className="text-[11px] px-2 py-1 text-[#2D5A27] hover:bg-[#EBF3E8]"
                              disabled={!canManageInventory}
                            >
                              + Receipt
                            </Button>

                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => openReleaseModal(p)}
                              title="Force Release Expired Reservation"
                              className="text-[11px] px-2 py-1 text-[#C9A24B] hover:bg-[#F8EFD9]"
                              disabled={!canManageInventory || p.reserved === 0}
                            >
                              Release
                            </Button>

                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => openAdjustmentModal(p)}
                              title="Damaged / Quarantine Adjustment"
                              className="text-[11px] px-2 py-1 text-[#A83232] hover:bg-[#FDF2F2]"
                              disabled={!canManageInventory}
                            >
                              Adjust
                            </Button>

                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => openReconcileModal(p)}
                              title="Physical Audit Count Reconciliation"
                              className="text-[11px] px-2 py-1 text-[#5A4630] hover:bg-[#F8EFD9]"
                              disabled={!canManageInventory}
                            >
                              Reconcile
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="p-3 bg-[#F8EFD9]/40 border-t border-[#EADFC8] flex items-center justify-between text-xs text-[#7A6A55]">
              <div>
                Displaying <strong>{filteredProducts.length}</strong> items in separate online stock pool.
              </div>
              <div className="text-[11px] text-[#2D5A27] font-semibold">
                ✓ Adjustments update storefront checkout availability in real time
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* ============================================================== */}
      {/* TAB 2: ACTIVE CUSTOMER QUOTES TABLE                            */}
      {/* ============================================================== */}
      {activeTab === 'quotes' && (
        <div className="space-y-4">
          <Card className="p-4 bg-white border-[#EADFC8]">
            <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
              <div className="relative flex-1">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#7A6A55]" />
                <input
                  type="text"
                  placeholder="Search by Quote ID, Product Name, or Customer ID..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 text-xs bg-[#FFFBF3] border border-[#EADFC8] rounded-lg text-[#5A4630]"
                />
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs text-[#7A6A55]">Quote Status:</span>
                <select
                  value={quoteStatusFilter}
                  onChange={(e) => setQuoteStatusFilter(e.target.value)}
                  className="px-2.5 py-1.5 text-xs bg-[#FFFBF3] border border-[#EADFC8] rounded-lg text-[#5A4630]"
                >
                  <option value="all">All Statuses</option>
                  <option value="Active">Active (Locked)</option>
                  <option value="Accepted">Accepted (Ordered)</option>
                  <option value="Expired">Expired</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
              </div>
            </div>
          </Card>

          <Card className="overflow-hidden border-[#EADFC8] bg-white">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-[#F8EFD9] text-[#5A4630] border-b border-[#EADFC8]">
                    <th className="py-3 px-4 font-semibold">Quote ID</th>
                    <th className="py-3 px-3 font-semibold">Customer / Account</th>
                    <th className="py-3 px-3 font-semibold">Reserved Product</th>
                    <th className="py-3 px-3 font-semibold text-right">Locked Spot Rate</th>
                    <th className="py-3 px-3 font-semibold text-right">Grand Total (INR)</th>
                    <th className="py-3 px-3 font-semibold text-center">Lock Expiry Window</th>
                    <th className="py-3 px-3 font-semibold text-center">Status</th>
                    <th className="py-3 px-4 font-semibold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#EADFC8]/60 text-[#5A4630]">
                  {filteredQuotes.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-8 text-center text-[#7A6A55]">
                        No quotes match the current filter.
                      </td>
                    </tr>
                  ) : (
                    filteredQuotes.map((q) => {
                      const isExpired = new Date(q.expiresAt).getTime() <= Date.now() || q.status === 'Expired';
                      const currentSpot = rates.gold24k;
                      const variance = ((currentSpot - q.ratePerGramSnapshot) / q.ratePerGramSnapshot) * 100;

                      return (
                        <tr key={q.id} className="hover:bg-[#FFFBF3]">
                          <td className="py-3 px-4 font-mono font-semibold text-[#5A4630]">
                            {q.id}
                            <div className="text-[10px] text-[#7A6A55] font-sans">
                              {new Date(q.createdAt).toLocaleTimeString()}
                            </div>
                          </td>

                          <td className="py-3 px-3 text-[#5A4630]">
                            <div className="font-medium">{q.customerId ? `Investor #${q.customerId}` : 'Guest Visitor'}</div>
                            <div className="text-[10px] text-[#7A6A55]">Online Store Checkout</div>
                          </td>

                          <td className="py-3 px-3 text-[#5A4630]">
                            <div className="font-medium">{q.productName}</div>
                            <div className="text-[10px] text-[#7A6A55]">
                              Qty: <strong>{q.quantity}</strong> unit(s) • {q.metalPurity}
                            </div>
                          </td>

                          <td className="py-3 px-3 text-right">
                            <div className="font-mono font-semibold tabular-nums text-[#5A4630]">
                              ₹{q.ratePerGramSnapshot.toLocaleString('en-IN')}/g
                            </div>
                            <div className="text-[10px] text-[#7A6A55]">
                              {variance === 0 ? (
                                'Matches Live Rate'
                              ) : (
                                <span className={variance > 0 ? 'text-[#2D5A27]' : 'text-[#A83232]'}>
                                  {variance > 0 ? `+${variance.toFixed(2)}%` : `${variance.toFixed(2)}%`} vs Live
                                </span>
                              )}
                            </div>
                          </td>

                          <td className="py-3 px-3 text-right font-mono font-bold text-[#5A4630] tabular-nums">
                            {formatINR(q.priceBreakdown.total)}
                            <div className="text-[10px] text-[#7A6A55] font-sans">
                              Tax: {formatINR(q.priceBreakdown.gst)}
                            </div>
                          </td>

                          <td className="py-3 px-3 text-center text-[11px]">
                            {q.status === 'Active' && !isExpired ? (
                              <div className="inline-flex items-center gap-1 text-[#2D5A27] font-semibold bg-[#EBF3E8] px-2 py-0.5 rounded-full">
                                <Clock className="w-3 h-3" />
                                <span>Expires {new Date(q.expiresAt).toLocaleTimeString()}</span>
                              </div>
                            ) : (
                              <span className="text-[#7A6A55]">
                                Expired at {new Date(q.expiresAt).toLocaleTimeString()}
                              </span>
                            )}
                          </td>

                          <td className="py-3 px-3 text-center">
                            {q.status === 'Active' && !isExpired ? (
                              <Badge variant="sage" size="sm">Active (Locked)</Badge>
                            ) : q.status === 'Accepted' ? (
                              <Badge variant="gold" size="sm">Accepted</Badge>
                            ) : q.status === 'Cancelled' ? (
                              <Badge variant="neutral" size="sm">Cancelled</Badge>
                            ) : (
                              <Badge variant="coral" size="sm">Expired</Badge>
                            )}
                          </td>

                          <td className="py-3 px-4 text-right">
                            <div className="flex items-center justify-end gap-1">
                              {q.status === 'Active' && !isExpired ? (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleCancelQuote(q)}
                                  className="text-[11px] text-[#A83232] border-[#A83232]/30 hover:bg-[#FDF2F2]"
                                  disabled={!canManageQuotes}
                                >
                                  Cancel & Release
                                </Button>
                              ) : (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleRequoteLive(q)}
                                  className="text-[11px] text-[#C9A24B] hover:bg-[#F8EFD9]"
                                  disabled={!canManageQuotes || isFeedStale}
                                  leftIcon={<RefreshCw className="w-3 h-3" />}
                                >
                                  Requote Live
                                </Button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      )}

      {/* ============================================================== */}
      {/* TAB 3: STALE-RATE REQUOTE QUEUE                                */}
      {/* ============================================================== */}
      {activeTab === 'staleQueue' && (
        <div className="space-y-4">
          <Card className="p-4 bg-white border-[#EADFC8] space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-[#FDF2F2] flex items-center justify-center text-[#A83232]">
                <ShieldAlert className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-serif text-base font-bold text-[#5A4630]">
                  Stale-Rate Requote Queue & Feed Disruption Buffer
                </h3>
                <p className="text-xs text-[#7A6A55]">
                  Lists customer quotes paused or affected during market feed downtime. Prevents arbitrage or negative margins when rates resume.
                </p>
              </div>
            </div>

            <div className="p-3 bg-[#FFFBF3] border border-[#EADFC8] rounded-xl flex items-center justify-between text-xs text-[#7A6A55]">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-[#5A4630]">Current Feed Status:</span>
                {isFeedStale ? (
                  <Badge variant="coral" size="sm">Stale Feed Triggered (Locks Paused)</Badge>
                ) : (
                  <Badge variant="sage" size="sm">✓ Live Feed Operational</Badge>
                )}
              </div>
              <div className="text-[11px]">
                Active Benchmark: <strong>₹{rates.gold24k.toLocaleString('en-IN')}/g</strong> (Gold 24K)
              </div>
            </div>
          </Card>

          <Card className="overflow-hidden border-[#EADFC8] bg-white">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[700px] text-left text-xs border-collapse">
              <thead>
                <tr className="bg-[#F8EFD9] text-[#5A4630] border-b border-[#EADFC8]">
                  <th className="py-3 px-4 font-semibold">Quote ID</th>
                  <th className="py-3 px-3 font-semibold">Customer</th>
                  <th className="py-3 px-3 font-semibold">Product Title</th>
                  <th className="py-3 px-3 font-semibold text-right">Locked Rate</th>
                  <th className="py-3 px-3 font-semibold text-right">Current Live Benchmark</th>
                  <th className="py-3 px-3 font-semibold text-center">Variance Alert</th>
                  <th className="py-3 px-4 font-semibold text-right">Pricing Desk Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EADFC8]/60 text-[#5A4630]">
                {staleQuotesQueue.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-[#7A6A55]">
                      <div className="max-w-xs mx-auto space-y-1">
                        <ShieldCheck className="w-7 h-7 text-[#2D5A27] mx-auto" />
                        <p className="font-semibold text-[#2D5A27]">No quotes in stale requote queue</p>
                        <p className="text-[11px] text-[#7A6A55]">
                          All customer quotes are synchronized with active feed ticks.
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  staleQuotesQueue.map((q) => {
                    const variance = ((rates.gold24k - q.ratePerGramSnapshot) / q.ratePerGramSnapshot) * 100;

                    return (
                      <tr key={q.id} className="hover:bg-[#FFFBF3]">
                        <td className="py-3 px-4 font-mono font-semibold text-[#5A4630]">
                          {q.id}
                        </td>
                        <td className="py-3 px-3 text-[#5A4630]">
                          {q.customerId || 'Guest Customer'}
                        </td>
                        <td className="py-3 px-3 text-[#5A4630]">
                          {q.productName}
                        </td>
                        <td className="py-3 px-3 text-right font-mono font-semibold text-[#5A4630]">
                          ₹{q.ratePerGramSnapshot.toLocaleString('en-IN')}/g
                        </td>
                        <td className="py-3 px-3 text-right font-mono font-semibold text-[#2D5A27]">
                          ₹{rates.gold24k.toLocaleString('en-IN')}/g
                        </td>
                        <td className="py-3 px-3 text-center">
                          <span
                            className={`font-semibold px-2 py-0.5 rounded text-[10px] ${
                              Math.abs(variance) > 2
                                ? 'bg-[#FDF2F2] text-[#A83232]'
                                : 'bg-[#EBF3E8] text-[#2D5A27]'
                            }`}
                          >
                            {variance >= 0 ? `+${variance.toFixed(2)}%` : `${variance.toFixed(2)}%`}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <Button
                            variant="primary"
                            size="sm"
                            onClick={() => handleRequoteLive(q)}
                            disabled={!canManageQuotes || isFeedStale}
                            leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
                          >
                            Re-issue at Live Rate
                          </Button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
            </div>
          </Card>
        </div>
      )}

      {/* ============================================================== */}
      {/* TAB 4: INVENTORY MOVEMENT LOGS                                 */}
      {/* ============================================================== */}
      {activeTab === 'logs' && (
        <Card className="overflow-hidden border-[#EADFC8] bg-white">
          <div className="p-3.5 bg-[#F8EFD9] border-b border-[#EADFC8] flex items-center justify-between">
            <h3 className="font-serif text-sm font-bold text-[#5A4630]">
              Inventory Custody & Audit Movement Ledger
            </h3>
            <span className="text-xs text-[#7A6A55]">
              Real-time audit log of Receipts, Releases, Adjustments, and Reconciliations
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[700px] text-left text-xs border-collapse">
            <thead>
              <tr className="bg-[#FFFBF3] text-[#7A6A55] border-b border-[#EADFC8]">
                <th className="py-2.5 px-4 font-semibold">Timestamp</th>
                <th className="py-2.5 px-3 font-semibold">Action Type</th>
                <th className="py-2.5 px-3 font-semibold">Product SKU</th>
                <th className="py-2.5 px-3 font-semibold text-right">Delta</th>
                <th className="py-2.5 px-3 font-semibold text-right">Available After</th>
                <th className="py-2.5 px-3 font-semibold">Notes / Reason</th>
                <th className="py-2.5 px-4 font-semibold">Officer / System</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EADFC8]/60 text-[#5A4630]">
              {inventoryLogs.map((log) => (
                <tr key={log.id} className="hover:bg-[#FFFBF3]">
                  <td className="py-3 px-4 font-mono text-[11px] text-[#7A6A55]">
                    {new Date(log.timestamp).toLocaleString()}
                  </td>
                  <td className="py-3 px-3">
                    <Badge
                      variant={
                        log.action === 'Receipt'
                          ? 'sage'
                          : log.action === 'Reservation Release'
                          ? 'gold'
                          : log.action === 'Adjustment'
                          ? 'coral'
                          : 'neutral'
                      }
                      size="sm"
                    >
                      {log.action}
                    </Badge>
                  </td>
                  <td className="py-3 px-3">
                    <div className="font-medium text-[#5A4630]">{log.productName}</div>
                    <div className="text-[10px] font-mono text-[#7A6A55]">{log.sku}</div>
                  </td>
                  <td className="py-3 px-3 text-right font-mono font-bold tabular-nums">
                    <span
                      className={
                        log.delta > 0
                          ? 'text-[#2D5A27]'
                          : log.delta < 0
                          ? 'text-[#A83232]'
                          : 'text-[#7A6A55]'
                      }
                    >
                      {log.delta > 0 ? `+${log.delta}` : log.delta}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-right font-mono tabular-nums text-[#5A4630]">
                    {log.availableAfter}
                  </td>
                  <td className="py-3 px-3 text-[11px] text-[#7A6A55]">
                    {log.notes}
                  </td>
                  <td className="py-3 px-4 text-[11px] text-[#5A4630]">
                    {log.actor}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          </div>
        </Card>
      )}

      {/* ============================================================== */}
      {/* 3. MODAL: GOODS RECEIPT (INWARD)                                */}
      {/* ============================================================== */}
      <Modal
        isOpen={receiptModalOpen}
        onClose={() => setReceiptModalOpen(false)}
        title={`Inward Goods Receipt: ${activeProduct?.name || ''}`}
        maxWidth="md"
      >
        <form onSubmit={handleConfirmReceipt} className="space-y-4 text-xs text-[#5A4630]">
          <div className="p-3 bg-[#FFFBF3] border border-[#EADFC8] rounded-xl space-y-1">
            <div className="font-semibold text-[#5A4630]">{activeProduct?.name}</div>
            <div className="text-[11px] text-[#7A6A55]">
              SKU: {activeProduct?.sku} • Current On-Hand: <strong>{activeProduct?.stock}</strong> units
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-[#7A6A55] mb-1">
              Quantity to Receive (Units) *
            </label>
            <input
              type="number"
              min="1"
              required
              value={receiptQty}
              onChange={(e) => setReceiptQty(Number(e.target.value))}
              className="w-full px-3 py-1.5 text-xs font-mono bg-white border border-[#EADFC8] rounded-lg"
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-[#7A6A55] mb-1">
              Lot / Inward Ingestion Ref *
            </label>
            <input
              type="text"
              required
              value={receiptLot}
              onChange={(e) => setReceiptLot(e.target.value)}
              className="w-full px-3 py-1.5 text-xs font-mono bg-white border border-[#EADFC8] rounded-lg"
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-[#7A6A55] mb-1">
              Supplier / Refinery Source
            </label>
            <input
              type="text"
              value={receiptSupplier}
              onChange={(e) => setReceiptSupplier(e.target.value)}
              className="w-full px-3 py-1.5 text-xs bg-white border border-[#EADFC8] rounded-lg"
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-[#7A6A55] mb-1">
              Receipt Notes / Inward PO Ref
            </label>
            <textarea
              rows={2}
              value={receiptNotes}
              onChange={(e) => setReceiptNotes(e.target.value)}
              className="w-full px-3 py-1.5 text-xs bg-white border border-[#EADFC8] rounded-lg"
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-[#EADFC8]">
            <Button type="button" variant="outline" size="sm" onClick={() => setReceiptModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm" leftIcon={<Check className="w-4 h-4" />}>
              Confirm Inward Receipt
            </Button>
          </div>
        </form>
      </Modal>

      {/* ============================================================== */}
      {/* 4. MODAL: RESERVATION RELEASE                                  */}
      {/* ============================================================== */}
      <Modal
        isOpen={releaseModalOpen}
        onClose={() => setReleaseModalOpen(false)}
        title={`Release Customer Reservation: ${activeProduct?.name || ''}`}
        maxWidth="md"
      >
        <form onSubmit={handleConfirmRelease} className="space-y-4 text-xs text-[#5A4630]">
          <div className="p-3 bg-[#FFFBF3] border border-[#EADFC8] rounded-xl space-y-1">
            <div className="font-semibold text-[#5A4630]">{activeProduct?.name}</div>
            <div className="text-[11px] text-[#7A6A55]">
              Currently Held in Reserve: <strong className="text-[#C9A24B]">{activeProduct?.reserved}</strong> units
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-[#7A6A55] mb-1">
              Quantity to Release (Max {activeProduct?.reserved}) *
            </label>
            <input
              type="number"
              min="1"
              max={activeProduct?.reserved || 1}
              required
              value={releaseQty}
              onChange={(e) => setReleaseQty(Number(e.target.value))}
              className="w-full px-3 py-1.5 text-xs font-mono bg-white border border-[#EADFC8] rounded-lg"
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-[#7A6A55] mb-1">
              Reason for Release *
            </label>
            <input
              type="text"
              required
              value={releaseReason}
              onChange={(e) => setReleaseReason(e.target.value)}
              className="w-full px-3 py-1.5 text-xs bg-white border border-[#EADFC8] rounded-lg"
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-[#EADFC8]">
            <Button type="button" variant="outline" size="sm" onClick={() => setReleaseModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm" leftIcon={<RotateCcw className="w-4 h-4" />}>
              Release into Available Pool
            </Button>
          </div>
        </form>
      </Modal>

      {/* ============================================================== */}
      {/* 5. MODAL: ADJUSTMENT (DAMAGED / QUARANTINE / CORRECTION)        */}
      {/* ============================================================== */}
      <Modal
        isOpen={adjustmentModalOpen}
        onClose={() => setAdjustmentModalOpen(false)}
        title={`Inventory Adjustment: ${activeProduct?.name || ''}`}
        maxWidth="md"
      >
        <form onSubmit={handleConfirmAdjustment} className="space-y-4 text-xs text-[#5A4630]">
          <div className="p-3 bg-[#FFFBF3] border border-[#EADFC8] rounded-xl space-y-1">
            <div className="font-semibold text-[#5A4630]">{activeProduct?.name}</div>
            <div className="text-[11px] text-[#7A6A55]">
              On-Hand: {activeProduct?.stock} • Damaged: {activeProduct?.damaged || 0} • Quarantined: {activeProduct?.quarantined || 0}
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-[#7A6A55] mb-1">
              Adjustment Pool *
            </label>
            <select
              value={adjType}
              onChange={(e) => setAdjType(e.target.value as any)}
              className="w-full px-3 py-1.5 text-xs bg-white border border-[#EADFC8] rounded-lg"
            >
              <option value="onHand">On-Hand Physical Stock (+/-)</option>
              <option value="damaged">Damaged Stock (+/-)</option>
              <option value="quarantined">Quarantined Stock (+/-)</option>
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-[#7A6A55] mb-1">
              Adjustment Delta Quantity (+ / -) *
            </label>
            <input
              type="number"
              required
              value={adjDelta}
              onChange={(e) => setAdjDelta(Number(e.target.value))}
              className="w-full px-3 py-1.5 text-xs font-mono bg-white border border-[#EADFC8] rounded-lg"
            />
            <span className="text-[10px] text-[#7A6A55]">
              Use negative numbers (e.g. -2) to write off or positive to add back.
            </span>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-[#7A6A55] mb-1">
              Statutory Justification / Audit Reason *
            </label>
            <input
              type="text"
              required
              value={adjReason}
              onChange={(e) => setAdjReason(e.target.value)}
              className="w-full px-3 py-1.5 text-xs bg-white border border-[#EADFC8] rounded-lg"
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-[#EADFC8]">
            <Button type="button" variant="outline" size="sm" onClick={() => setAdjustmentModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm" leftIcon={<Sliders className="w-4 h-4" />}>
              Save Adjustment
            </Button>
          </div>
        </form>
      </Modal>

      {/* ============================================================== */}
      {/* 6. MODAL: RECONCILIATION                                       */}
      {/* ============================================================== */}
      <Modal
        isOpen={reconcileModalOpen}
        onClose={() => setReconcileModalOpen(false)}
        title={`Physical Vault Count Reconciliation: ${activeProduct?.name || ''}`}
        maxWidth="md"
      >
        <form onSubmit={handleConfirmReconcile} className="space-y-4 text-xs text-[#5A4630]">
          <div className="p-3 bg-[#FFFBF3] border border-[#EADFC8] rounded-xl space-y-1">
            <div className="font-semibold text-[#5A4630]">{activeProduct?.name}</div>
            <div className="flex justify-between text-[11px] text-[#7A6A55]">
              <span>System On-Hand Count:</span>
              <strong className="font-mono text-[#5A4630]">{activeProduct?.stock} units</strong>
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-[#7A6A55] mb-1">
              Actual Physical Count Audited in Vault *
            </label>
            <input
              type="number"
              min="0"
              required
              value={physicalCount}
              onChange={(e) => setPhysicalCount(Number(e.target.value))}
              className="w-full px-3 py-1.5 text-xs font-mono bg-white border border-[#EADFC8] rounded-lg text-[#5A4630]"
            />
          </div>

          {activeProduct && (
            <div className="p-2.5 bg-white border border-[#EADFC8] rounded-lg flex items-center justify-between text-xs">
              <span className="text-[#7A6A55]">Audit Variance:</span>
              <span
                className={`font-mono font-bold ${
                  Number(physicalCount) - activeProduct.stock === 0
                    ? 'text-[#2D5A27]'
                    : 'text-[#A83232]'
                }`}
              >
                {Number(physicalCount) - activeProduct.stock === 0
                  ? '0 (Zero Variance - Balanced)'
                  : `${Number(physicalCount) - activeProduct.stock > 0 ? '+' : ''}${
                      Number(physicalCount) - activeProduct.stock
                    } units`}
              </span>
            </div>
          )}

          <div>
            <label className="block text-[11px] font-semibold text-[#7A6A55] mb-1">
              Auditor Verification Notes & Witness *
            </label>
            <textarea
              rows={2}
              required
              value={reconcileNotes}
              onChange={(e) => setReconcileNotes(e.target.value)}
              className="w-full px-3 py-1.5 text-xs bg-white border border-[#EADFC8] rounded-lg"
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-[#EADFC8]">
            <Button type="button" variant="outline" size="sm" onClick={() => setReconcileModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm" leftIcon={<CheckCircle2 className="w-4 h-4" />}>
              Confirm Reconciliation
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
