import React, { useState, useMemo } from 'react';
import { useAppStore } from '../store';
import { useSEO } from '../lib/useSEO';
import { formatINR, calculatePrice } from '../lib/pricing';
import { Card } from '../components/Card';
import { Badge } from '../components/Badge';
import { Button } from '../components/Button';
import {
  Download,
  DollarSign,
  Boxes,
  TrendingUp,
  CreditCard,
  Truck,
  Users,
  Headphones,
  RotateCcw,
  Building2,
  ShieldCheck,
  Sparkles,
  FileSpreadsheet,
} from 'lucide-react';
import { maskPan, maskPhone, maskTextPII } from '../lib/masking';

type ReportTab =
  | 'sales'
  | 'inventory'
  | 'rates'
  | 'payments'
  | 'fulfilment'
  | 'customers'
  | 'support'
  | 'returns'
  | 'suppliers'
  | 'security';

export const AdminReportsPage: React.FC = () => {
  useSEO({
    title: 'Financial & Operational Reports Analytics',
    description: 'Executive revenue intelligence, inventory asset ageing, bullion rate volatility, settlement reconciliation, and exportable CSV ledgers.',
    canonicalPath: '/admin/reports',
  });

  const {
    orders,
    products,
    customers,
    settlements,
    claims,
    purchaseRecords,
    auditLogs,
    events,
    priceHistory,
    rates,
    pricingConfig,
    activeRole,
  } = useAppStore();

  const [activeTab, setActiveTab] = useState<ReportTab>('sales');
  const [downloadNotice, setDownloadNotice] = useState<string | null>(null);

  // Helper to trigger clean CSV download
  const downloadCSV = (filename: string, headers: string[], rows: (string | number)[][]) => {
    const csvContent = [
      headers.join(','),
      ...rows.map((row) =>
        row
          .map((cell) => {
            const str = String(cell ?? '');
            if (str.includes(',') || str.includes('"') || str.includes('\n')) {
              return `"${str.replace(/"/g, '""')}"`;
            }
            return str;
          })
          .join(',')
      ),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    setDownloadNotice(`Downloaded report: ${filename}`);
    setTimeout(() => setDownloadNotice(null), 3500);
  };

  // --- TAB 1: SALES REPORT DATA ---
  const salesData = useMemo(() => {
    let grossRevenue = 0;
    let netSalesExGst = 0;
    let totalGstCollected = 0;
    let cancelledAmount = 0;

    const rows = orders.map((o) => {
      const isCancelled = o.status === 'Cancelled';
      if (isCancelled) {
        cancelledAmount += o.totalAmount;
      } else {
        grossRevenue += o.totalAmount;
        netSalesExGst += o.subtotal;
        totalGstCollected += o.gstTotal;
      }

      // Estimate gross margin: subtotal * 8%
      const grossMarginEst = isCancelled ? 0 : Math.round(o.subtotal * 0.082);

      return {
        orderNumber: o.orderNumber,
        customerName: o.customerName,
        date: new Date(o.createdAt).toLocaleDateString('en-IN'),
        grossTotal: o.totalAmount,
        netExGst: o.subtotal,
        gstTotal: o.gstTotal,
        grossMargin: grossMarginEst,
        status: o.status,
      };
    });

    return {
      grossRevenue,
      netSalesExGst,
      totalGstCollected,
      cancelledAmount,
      blendedMargin: netSalesExGst > 0 ? ((netSalesExGst * 0.082) / netSalesExGst) * 100 : 0,
      rows,
    };
  }, [orders]);

  const handleExportSalesCSV = () => {
    const headers = [
      'Order Ref',
      'Customer',
      'Date',
      'Net Sales (Excl GST)',
      'GST Collected (3%)',
      'Gross Total (INR)',
      'Est Gross Margin (INR)',
      'Status',
    ];
    const rows = salesData.rows.map((r) => [
      r.orderNumber,
      r.customerName,
      r.date,
      r.netExGst,
      r.gstTotal,
      r.grossTotal,
      r.grossMargin,
      r.status,
    ]);
    downloadCSV(`precious_sales_report_${new Date().toISOString().split('T')[0]}.csv`, headers, rows);
  };

  // --- TAB 2: INVENTORY REPORT DATA ---
  const inventoryData = useMemo(() => {
    let totalVaultValue = 0;
    let totalOnHandUnits = 0;

    const categoryBreakdown: Record<string, { units: number; value: number }> = {};

    const rows = products.map((p) => {
      const onHand = p.stock;
      const priceObj = calculatePrice(p, rates, pricingConfig);
      const unitValue = priceObj.total;
      const totalAssetValue = onHand * unitValue;

      totalVaultValue += totalAssetValue;
      totalOnHandUnits += onHand;

      if (!categoryBreakdown[p.category]) {
        categoryBreakdown[p.category] = { units: 0, value: 0 };
      }
      categoryBreakdown[p.category].units += onHand;
      categoryBreakdown[p.category].value += totalAssetValue;

      return {
        sku: p.sku,
        name: p.name,
        category: p.category,
        onHand,
        reserved: p.reserved || 0,
        available: Math.max(0, onHand - (p.reserved || 0)),
        damaged: p.damaged || 0,
        quarantined: p.quarantined || 0,
        unitValue,
        totalAssetValue,
        ageingCategory: p.category === 'gold' ? '15–30 Days' : '45–90 Days',
      };
    });

    return {
      totalVaultValue,
      totalOnHandUnits,
      categoryBreakdown,
      rows,
    };
  }, [products, rates, pricingConfig]);

  const handleExportInventoryCSV = () => {
    const headers = [
      'SKU',
      'Product Name',
      'Category',
      'On Hand Physical',
      'Reserved Pool',
      'Available for Sale',
      'Damaged / Quarantined',
      'Unit Valuation (INR)',
      'Total Asset Value (INR)',
      'Ageing Bracket',
    ];
    const rows = inventoryData.rows.map((r) => [
      r.sku,
      r.name,
      r.category,
      r.onHand,
      r.reserved,
      r.available,
      r.damaged + r.quarantined,
      r.unitValue,
      r.totalAssetValue,
      r.ageingCategory,
    ]);
    downloadCSV(`precious_inventory_valuation_${new Date().toISOString().split('T')[0]}.csv`, headers, rows);
  };

  // --- TAB 3: RATES & VOLATILITY DATA ---
  const ratesData = useMemo(() => {
    return {
      currentGold24k: rates.gold24k,
      currentGold22k: rates.gold22k,
      currentSilver999: rates.silver999,
      history: priceHistory,
      staleEvents: events.filter((e) => e.type === 'product_view' && e.details.includes('STALE')),
      rateTicks: events.filter((e) => e.details.includes('Rate') || e.details.includes('rate')),
    };
  }, [rates, priceHistory, events]);

  const handleExportRatesCSV = () => {
    const headers = ['Version Code', 'Effective Timestamp', 'Authorizing Officer', 'Formula & Spread Changes', 'Status'];
    const rows = ratesData.history.map((h) => [h.version, h.timestamp, h.actor, h.changes, h.status]);
    downloadCSV(`precious_rates_volatility_audit_${new Date().toISOString().split('T')[0]}.csv`, headers, rows);
  };

  // --- TAB 4: PAYMENTS & SETTLEMENTS DATA ---
  const handleExportPaymentsCSV = () => {
    const headers = ['Transaction Ref', 'Order Number', 'Customer', 'Gross Amount', 'Gateway Fee', 'Net Settlement', 'Gateway Status', 'Reconciliation'];
    const rows = settlements.map((s) => [
      s.transactionId,
      s.orderNumber,
      s.customerName,
      s.amount,
      s.gatewayFee,
      s.netSettlement,
      s.gatewayStatus,
      s.reconciliationStatus,
    ]);
    downloadCSV(`precious_settlements_reconciliation_${new Date().toISOString().split('T')[0]}.csv`, headers, rows);
  };

  // --- TAB 5: FULFILMENT DATA ---
  const handleExportFulfilmentCSV = () => {
    const headers = ['Order Ref', 'Customer', 'Courier Partner', 'AWB Number', 'ERP Invoice Attached', 'Custody Status', 'Delivery Estimate'];
    const rows = orders.map((o) => [
      o.orderNumber,
      o.customerName,
      o.courierName || 'Sequel Logistics',
      o.trackingNumber || 'Pending AWB',
      o.erpInvoiceAttached ? 'Yes' : 'No',
      o.status,
      o.shippingAddress.city,
    ]);
    downloadCSV(`precious_fulfilment_sla_${new Date().toISOString().split('T')[0]}.csv`, headers, rows);
  };

  // --- TAB 6: CUSTOMER REPORT DATA ---
  const handleExportCustomerCSV = () => {
    const headers = ['Customer ID', 'Full Name', 'Email', 'Phone', 'PAN', 'KYC Verified', 'Orders Placed', 'Total Spent (INR)', 'Fraud Risk Flag', 'Registered Date'];
    const rows = customers.map((c) => [
      c.id,
      c.name,
      c.email,
      maskPhone(c.phone, activeRole),
      maskPan(c.pan || c.panNumber, activeRole),
      c.isVerified ? 'Verified' : 'Pending',
      c.totalOrders,
      c.totalSpent,
      c.fraudFlag ? 'FLAGGED' : 'Clean',
      c.createdAt,
    ]);
    downloadCSV(`precious_customer_intelligence_${new Date().toISOString().split('T')[0]}.csv`, headers, rows);
  };

  // --- TAB 7: SUPPORT DATA ---
  const supportInteractions = useMemo(() => {
    const list: any[] = [];
    customers.forEach((c) => {
      (c.supportHistory || []).forEach((sh) => {
        list.push({ ...sh, customerName: c.name, customerEmail: c.email });
      });
    });
    return list;
  }, [customers]);

  const handleExportSupportCSV = () => {
    const headers = ['Ticket ID', 'Customer Name', 'Channel', 'Subject', 'Status', 'Concierge Officer', 'Logged At'];
    const rows = supportInteractions.map((si) => [
      si.id,
      si.customerName,
      si.channel,
      maskTextPII(si.subject, activeRole),
      si.status,
      si.officer,
      si.createdAt,
    ]);
    downloadCSV(`precious_support_concierge_${new Date().toISOString().split('T')[0]}.csv`, headers, rows);
  };

  // --- TAB 8: RETURNS & DISPUTES DATA ---
  const handleExportReturnsCSV = () => {
    const headers = ['Claim / Return ID', 'Order Number', 'Courier / Reason', 'Claim Amount (INR)', 'Status', 'Filed By / Requested At'];
    const claimRows = claims.map((c) => [c.id, c.orderNumber, `${c.courierName}: ${c.reason}`, c.claimAmount, c.status, c.filedBy]);
    const returnRows = orders
      .filter((o) => o.returnRequest || o.status === 'Return requested')
      .map((o) => [
        `RET-${o.orderNumber}`,
        o.orderNumber,
        o.returnRequest?.reason || 'Bead / specification preference',
        o.totalAmount,
        o.returnRequest?.status || 'Pending',
        o.customerName,
      ]);
    downloadCSV(`precious_returns_disputes_${new Date().toISOString().split('T')[0]}.csv`, headers, [...claimRows, ...returnRows]);
  };

  // --- TAB 9: SUPPLIERS DATA ---
  const handleExportSuppliersCSV = () => {
    const headers = ['PO Invoice', 'Supplier Name', 'Category / Metal', 'Lot Batch #', 'Quantity Received', 'Unit Cost Basis', 'Total Cost Basis (INR)', 'Status'];
    const rows = purchaseRecords.map((p) => [
      p.purchaseInvoiceNo,
      p.supplierName,
      p.metalPurityGrade,
      p.lotNumber,
      p.quantityReceived,
      p.unitCostBasis,
      p.totalCostBasis,
      p.status,
    ]);
    downloadCSV(`precious_suppliers_procurement_${new Date().toISOString().split('T')[0]}.csv`, headers, rows);
  };

  // --- TAB 10: SECURITY OPERATIONS DATA ---
  const handleExportSecurityCSV = () => {
    const headers = ['Audit ID', 'Officer / Actor', 'Action', 'Module', 'Before State', 'After State', 'Timestamp'];
    const rows = auditLogs.map((a) => [a.id, a.actor, a.action, a.module, a.before, a.after, a.timestamp]);
    downloadCSV(`precious_security_audit_ledger_${new Date().toISOString().split('T')[0]}.csv`, headers, rows);
  };

  // Tabs Definition
  const tabs: { id: ReportTab; label: string; icon: any }[] = [
    { id: 'sales', label: 'Sales & Margins', icon: DollarSign },
    { id: 'inventory', label: 'Inventory Valuation', icon: Boxes },
    { id: 'rates', label: 'Rates & Volatility', icon: TrendingUp },
    { id: 'payments', label: 'Payments & Gateway', icon: CreditCard },
    { id: 'fulfilment', label: 'Fulfilment & SLA', icon: Truck },
    { id: 'customers', label: 'Customer Cohorts', icon: Users },
    { id: 'support', label: 'Support & Concierge', icon: Headphones },
    { id: 'returns', label: 'Returns & Disputes', icon: RotateCcw },
    { id: 'suppliers', label: 'Suppliers & PO', icon: Building2 },
    { id: 'security', label: 'Security & Audit (SIM)', icon: ShieldCheck },
  ];

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-serif font-bold text-[#5A4630]">
              Financial Reports & Operational Analytics
            </h1>
            <Badge variant="gold">Phase 10</Badge>
          </div>
          <p className="text-sm text-[#7A6A55] mt-1">
            Real-time multi-dimensional reports across gross sales, stock ageing, bullion ticks, gateway settlements, and security ledgers.
          </p>
        </div>

        {/* Global CSV Download Notice */}
        {downloadNotice && (
          <div className="p-3 bg-[#E8F3E6] border border-[#A3D9A5] rounded-lg text-xs text-[#2D5A27] font-semibold flex items-center gap-2 animate-fade-in shadow-xs">
            <FileSpreadsheet className="w-4 h-4 shrink-0 text-[#2D5A27]" />
            <span>{downloadNotice}</span>
          </div>
        )}
      </div>

      {/* 10 Navigation Tabs */}
      <div className="border-b border-[#EADFC8] bg-[#FFFFFF] p-1.5 rounded-xl shadow-xs">
        <div className="flex items-center gap-1 overflow-x-auto no-scrollbar">
          {tabs.map((t) => {
            const Icon = t.icon;
            const isActive = activeTab === t.id;
            return (
              <button
                key={t.id}
                onClick={() => setActiveTab(t.id)}
                className={`flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg whitespace-nowrap transition-all cursor-pointer ${
                  isActive
                    ? 'bg-[#C9A24B] text-white shadow-xs'
                    : 'text-[#7A6A55] hover:text-[#5A4630] hover:bg-[#F8EFD9]'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{t.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* TAB CONTENT 1: SALES & MARGINS */}
      {activeTab === 'sales' && (
        <div className="space-y-5">
          {/* Metrics Tiles */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="p-4 space-y-1">
              <span className="text-[11px] text-[#7A6A55] font-medium">Net Sales (Excl. 3% GST)</span>
              <div className="text-xl font-serif font-bold text-[#5A4630]">
                {formatINR(salesData.netSalesExGst)}
              </div>
              <span className="text-[10px] text-[#2D5A27] font-medium">Base metal & making realization</span>
            </Card>

            <Card className="p-4 space-y-1">
              <span className="text-[11px] text-[#7A6A55] font-medium">Gross Total Revenue</span>
              <div className="text-xl font-serif font-bold text-[#C9A24B]">
                {formatINR(salesData.grossRevenue)}
              </div>
              <span className="text-[10px] text-[#7A6A55]">Across {orders.length} custody orders</span>
            </Card>

            <Card className="p-4 space-y-1">
              <span className="text-[11px] text-[#7A6A55] font-medium">Statutory 3% GST Collected</span>
              <div className="text-xl font-serif font-bold text-[#5A4630]">
                {formatINR(salesData.totalGstCollected)}
              </div>
              <span className="text-[10px] text-[#7A6A55]">Remitted under HSN 7108 / 7106 / 7103</span>
            </Card>

            <Card className="p-4 space-y-1">
              <span className="text-[11px] text-[#7A6A55] font-medium">Cancellations & Refunds</span>
              <div className="text-xl font-serif font-bold text-[#9E2A2B]">
                {formatINR(salesData.cancelledAmount)}
              </div>
              <span className="text-[10px] text-[#7A6A55]">Protected via 100% advance digital lock</span>
            </Card>
          </div>

          {/* Light Visual Chart + Table Card */}
          <Card className="p-5 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3 border-b border-[#EADFC8]">
              <div>
                <h3 className="text-sm font-semibold text-[#5A4630]">
                  Itemized Order Sales Ledger (Net of Tax & Custody)
                </h3>
                <p className="text-xs text-[#7A6A55]">
                  Statutory sales realization breakdown per fiscal invoice.
                </p>
              </div>
              <Button
                variant="primary"
                size="sm"
                onClick={handleExportSalesCSV}
                className="text-xs flex items-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5" /> Export Sales CSV
              </Button>
            </div>

            {/* Light SVG Revenue vs Tax Breakdown Chart */}
            <div className="p-4 bg-[#FFFBF3] border border-[#EADFC8] rounded-xl space-y-2">
              <div className="text-xs font-semibold text-[#5A4630] flex items-center justify-between">
                <span>Revenue Composition Breakdown</span>
                <span className="text-[10px] text-[#7A6A55]">Net Sales vs GST Component</span>
              </div>
              <div className="h-6 w-full bg-[#EADFC8] rounded-full overflow-hidden flex">
                <div
                  style={{ width: `${salesData.grossRevenue > 0 ? (salesData.netSalesExGst / salesData.grossRevenue) * 100 : 97}%` }}
                  className="bg-[#C9A24B] h-full flex items-center justify-center text-[10px] font-bold text-white px-2"
                  title="Net Sales Excl GST"
                >
                  Net Realization (97.1%)
                </div>
                <div
                  style={{ width: `${salesData.grossRevenue > 0 ? (salesData.totalGstCollected / salesData.grossRevenue) * 100 : 3}%` }}
                  className="bg-[#5A4630] h-full flex items-center justify-center text-[10px] font-bold text-white px-2"
                  title="3% GST Component"
                >
                  GST (2.9%)
                </div>
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-[#5A4630]">
                <thead>
                  <tr className="border-b border-[#EADFC8] text-[#7A6A55] bg-[#FFFBF3]">
                    <th className="py-2.5 px-3 font-semibold">Order Ref</th>
                    <th className="py-2.5 px-3 font-semibold">Customer</th>
                    <th className="py-2.5 px-3 font-semibold">Date</th>
                    <th className="py-2.5 px-3 font-semibold">Net Ex-GST</th>
                    <th className="py-2.5 px-3 font-semibold">GST (3%)</th>
                    <th className="py-2.5 px-3 font-semibold">Gross Total</th>
                    <th className="py-2.5 px-3 font-semibold">Est Margin</th>
                    <th className="py-2.5 px-3 font-semibold text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#EADFC8]">
                  {salesData.rows.map((r, i) => (
                    <tr key={i} className="hover:bg-[#FFFDF9]">
                      <td className="py-2.5 px-3 font-mono font-medium">{r.orderNumber}</td>
                      <td className="py-2.5 px-3">{r.customerName}</td>
                      <td className="py-2.5 px-3 text-[#7A6A55]">{r.date}</td>
                      <td className="py-2.5 px-3 font-serif">{formatINR(r.netExGst)}</td>
                      <td className="py-2.5 px-3 font-serif text-[#7A6A55]">{formatINR(r.gstTotal)}</td>
                      <td className="py-2.5 px-3 font-serif font-bold text-[#5A4630]">{formatINR(r.grossTotal)}</td>
                      <td className="py-2.5 px-3 font-serif text-[#2D5A27]">+{formatINR(r.grossMargin)}</td>
                      <td className="py-2.5 px-3 text-right">
                        <Badge
                          variant={r.status === 'Delivered' ? 'sage' : r.status === 'Cancelled' ? 'rose' : 'gold'}
                          className="text-[10px]"
                        >
                          {r.status}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      )}

      {/* TAB CONTENT 2: INVENTORY VALUATION & AGEING */}
      {activeTab === 'inventory' && (
        <div className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Card className="p-4 space-y-1">
              <span className="text-[11px] text-[#7A6A55] font-medium">Total Physical Vault Valuation</span>
              <div className="text-xl font-serif font-bold text-[#C9A24B]">
                {formatINR(inventoryData.totalVaultValue)}
              </div>
              <span className="text-[10px] text-[#7A6A55]">Liquid value at live mark-to-market spot rates</span>
            </Card>

            <Card className="p-4 space-y-1">
              <span className="text-[11px] text-[#7A6A55] font-medium">Total Physical Units on Hand</span>
              <div className="text-xl font-serif font-bold text-[#5A4630]">
                {inventoryData.totalOnHandUnits} Units
              </div>
              <span className="text-[10px] text-[#2D5A27] font-medium">Segregated online stock pool</span>
            </Card>

            <Card className="p-4 space-y-1">
              <span className="text-[11px] text-[#7A6A55] font-medium">Average Stock Ageing</span>
              <div className="text-xl font-serif font-bold text-[#5A4630]">
                24.5 Days
              </div>
              <span className="text-[10px] text-[#7A6A55]">High bullion liquidity turnover</span>
            </Card>
          </div>

          <Card className="p-5 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3 border-b border-[#EADFC8]">
              <div>
                <h3 className="text-sm font-semibold text-[#5A4630]">
                  Stock Valuation & Ageing Register
                </h3>
                <p className="text-xs text-[#7A6A55]">
                  Detailed physical ledger with on-hand, reservation buffers, and estimated turnover brackets.
                </p>
              </div>
              <Button
                variant="primary"
                size="sm"
                onClick={handleExportInventoryCSV}
                className="text-xs flex items-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5" /> Export Inventory CSV
              </Button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-[#5A4630]">
                <thead>
                  <tr className="border-b border-[#EADFC8] text-[#7A6A55] bg-[#FFFBF3]">
                    <th className="py-2.5 px-3 font-semibold">SKU & Item</th>
                    <th className="py-2.5 px-3 font-semibold">Category</th>
                    <th className="py-2.5 px-3 font-semibold">On Hand</th>
                    <th className="py-2.5 px-3 font-semibold">Reserved</th>
                    <th className="py-2.5 px-3 font-semibold">Available</th>
                    <th className="py-2.5 px-3 font-semibold">Unit Value</th>
                    <th className="py-2.5 px-3 font-semibold">Total Asset Value</th>
                    <th className="py-2.5 px-3 font-semibold text-right">Ageing</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#EADFC8]">
                  {inventoryData.rows.map((r, i) => (
                    <tr key={i} className="hover:bg-[#FFFDF9]">
                      <td className="py-2.5 px-3 max-w-xs">
                        <div className="font-semibold">{r.name}</div>
                        <div className="text-[10px] font-mono text-[#7A6A55]">{r.sku}</div>
                      </td>
                      <td className="py-2.5 px-3 capitalize">{r.category}</td>
                      <td className="py-2.5 px-3 font-bold">{r.onHand}</td>
                      <td className="py-2.5 px-3 text-[#C9A24B]">{r.reserved}</td>
                      <td className="py-2.5 px-3 font-semibold text-[#2D5A27]">{r.available}</td>
                      <td className="py-2.5 px-3 font-serif">{formatINR(r.unitValue)}</td>
                      <td className="py-2.5 px-3 font-serif font-bold">{formatINR(r.totalAssetValue)}</td>
                      <td className="py-2.5 px-3 text-right">
                        <Badge variant="neutral" className="text-[10px]">
                          {r.ageingCategory}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      )}

      {/* TAB CONTENT 3: RATES & VOLATILITY */}
      {activeTab === 'rates' && (
        <div className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Card className="p-4 space-y-1">
              <span className="text-[11px] text-[#7A6A55] font-medium">Current Gold 24K Benchmark</span>
              <div className="text-xl font-serif font-bold text-[#C9A24B]">
                {formatINR(ratesData.currentGold24k)} /g
              </div>
              <span className="text-[10px] text-[#2D5A27] font-medium">99.99% refinery grade standard</span>
            </Card>

            <Card className="p-4 space-y-1">
              <span className="text-[11px] text-[#7A6A55] font-medium">Current Silver 999 Benchmark</span>
              <div className="text-xl font-serif font-bold text-[#5A4630]">
                {formatINR(ratesData.currentSilver999)} /g
              </div>
              <span className="text-[10px] text-[#7A6A55]">Fine bullion trade benchmark</span>
            </Card>

            <Card className="p-4 space-y-1">
              <span className="text-[11px] text-[#7A6A55] font-medium">Feed Availability SLA</span>
              <div className="text-xl font-serif font-bold text-[#2D5A27]">
                99.98%
              </div>
              <span className="text-[10px] text-[#7A6A55]">Dual IBJA/MCX redundant gateway</span>
            </Card>
          </div>

          <Card className="p-5 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3 border-b border-[#EADFC8]">
              <div>
                <h3 className="text-sm font-semibold text-[#5A4630]">
                  Pricing Formula & Spread Adjustment History
                </h3>
                <p className="text-xs text-[#7A6A55]">
                  Chronological record of formula revisions, making charge adjustments, and officer authorizations.
                </p>
              </div>
              <Button
                variant="primary"
                size="sm"
                onClick={handleExportRatesCSV}
                className="text-xs flex items-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5" /> Export Rates Audit CSV
              </Button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-[#5A4630]">
                <thead>
                  <tr className="border-b border-[#EADFC8] text-[#7A6A55] bg-[#FFFBF3]">
                    <th className="py-2.5 px-3 font-semibold">Formula Version</th>
                    <th className="py-2.5 px-3 font-semibold">Effective Timestamp</th>
                    <th className="py-2.5 px-3 font-semibold">Approving Officer</th>
                    <th className="py-2.5 px-3 font-semibold">Parameter Changes</th>
                    <th className="py-2.5 px-3 font-semibold text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#EADFC8]">
                  {ratesData.history.map((h, i) => (
                    <tr key={i} className="hover:bg-[#FFFDF9]">
                      <td className="py-2.5 px-3 font-mono font-bold text-[#C9A24B]">{h.version}</td>
                      <td className="py-2.5 px-3 text-[#7A6A55]">{new Date(h.timestamp).toLocaleString('en-IN')}</td>
                      <td className="py-2.5 px-3 font-medium">{h.actor}</td>
                      <td className="py-2.5 px-3 text-[#5A4630]">{h.changes}</td>
                      <td className="py-2.5 px-3 text-right">
                        <Badge variant={h.status === 'Active' ? 'sage' : 'neutral'} className="text-[10px]">
                          {h.status}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      )}

      {/* TAB CONTENT 4: PAYMENTS & SETTLEMENTS */}
      {activeTab === 'payments' && (
        <Card className="p-5 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3 border-b border-[#EADFC8]">
            <div>
              <h3 className="text-sm font-semibold text-[#5A4630]">
                Payment Gateway Settlement & Fee Reconciliation
              </h3>
              <p className="text-xs text-[#7A6A55]">
                HDFC, Razorpay, and UPI net disbursements, gateway MDR charges, and bank clearance status.
              </p>
            </div>
            <Button
              variant="primary"
              size="sm"
              onClick={handleExportPaymentsCSV}
              className="text-xs flex items-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5" /> Export Settlements CSV
            </Button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-[#5A4630]">
              <thead>
                <tr className="border-b border-[#EADFC8] text-[#7A6A55] bg-[#FFFBF3]">
                  <th className="py-2.5 px-3 font-semibold">Txn Reference</th>
                  <th className="py-2.5 px-3 font-semibold">Order #</th>
                  <th className="py-2.5 px-3 font-semibold">Customer</th>
                  <th className="py-2.5 px-3 font-semibold">Gross Amount</th>
                  <th className="py-2.5 px-3 font-semibold">MDR Gateway Fee</th>
                  <th className="py-2.5 px-3 font-semibold">Net Disbursed</th>
                  <th className="py-2.5 px-3 font-semibold">Gateway Status</th>
                  <th className="py-2.5 px-3 font-semibold text-right">Reconciliation</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EADFC8]">
                {settlements.map((s) => (
                  <tr key={s.id} className="hover:bg-[#FFFDF9]">
                    <td className="py-2.5 px-3 font-mono">{s.transactionId}</td>
                    <td className="py-2.5 px-3 font-mono font-medium">{s.orderNumber}</td>
                    <td className="py-2.5 px-3">{s.customerName}</td>
                    <td className="py-2.5 px-3 font-serif font-semibold">{formatINR(s.amount)}</td>
                    <td className="py-2.5 px-3 font-serif text-[#9E2A2B]">-{formatINR(s.gatewayFee)}</td>
                    <td className="py-2.5 px-3 font-serif font-bold text-[#2D5A27]">{formatINR(s.netSettlement)}</td>
                    <td className="py-2.5 px-3">
                      <Badge variant={s.gatewayStatus === 'Settled' ? 'sage' : s.gatewayStatus === 'Failed' ? 'rose' : 'amber'} className="text-[10px]">
                        {s.gatewayStatus}
                      </Badge>
                    </td>
                    <td className="py-2.5 px-3 text-right">
                      <Badge variant={s.reconciliationStatus === 'Matched' || s.reconciliationStatus === 'Reconciled' ? 'sage' : 'amber'} className="text-[10px]">
                        {s.reconciliationStatus}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* TAB CONTENT 5: FULFILMENT & SLA */}
      {activeTab === 'fulfilment' && (
        <Card className="p-5 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3 border-b border-[#EADFC8]">
            <div>
              <h3 className="text-sm font-semibold text-[#5A4630]">
                Armoured Transit Fulfilment & Carrier SLAs
              </h3>
              <p className="text-xs text-[#7A6A55]">
                Sequel Secure Logistics & BVC Vaulting delivery performance with OTP sign-off tracking.
              </p>
            </div>
            <Button
              variant="primary"
              size="sm"
              onClick={handleExportFulfilmentCSV}
              className="text-xs flex items-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5" /> Export Fulfilment CSV
            </Button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-[#5A4630]">
              <thead>
                <tr className="border-b border-[#EADFC8] text-[#7A6A55] bg-[#FFFBF3]">
                  <th className="py-2.5 px-3 font-semibold">Order Ref</th>
                  <th className="py-2.5 px-3 font-semibold">Customer & Destination</th>
                  <th className="py-2.5 px-3 font-semibold">Carrier Partner</th>
                  <th className="py-2.5 px-3 font-semibold">AWB Tracking #</th>
                  <th className="py-2.5 px-3 font-semibold">ERP Invoice</th>
                  <th className="py-2.5 px-3 font-semibold text-right">Custody Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EADFC8]">
                {orders.map((o) => (
                  <tr key={o.id} className="hover:bg-[#FFFDF9]">
                    <td className="py-2.5 px-3 font-mono font-medium">{o.orderNumber}</td>
                    <td className="py-2.5 px-3">
                      <div>{o.customerName}</div>
                      <div className="text-[10px] text-[#7A6A55]">{o.shippingAddress.city}, {o.shippingAddress.state}</div>
                    </td>
                    <td className="py-2.5 px-3 font-medium">{o.courierName || 'Sequel Logistics'}</td>
                    <td className="py-2.5 px-3 font-mono text-[#C9A24B]">{o.trackingNumber || 'Pending Dispatch'}</td>
                    <td className="py-2.5 px-3">
                      {o.erpInvoiceAttached ? (
                        <Badge variant="sage" className="text-[10px]">Attached ({o.erpInvoiceNumber})</Badge>
                      ) : (
                        <Badge variant="amber" className="text-[10px]">Gated / Missing</Badge>
                      )}
                    </td>
                    <td className="py-2.5 px-3 text-right">
                      <Badge variant={o.status === 'Delivered' ? 'sage' : o.status === 'Dispatched' ? 'gold' : 'neutral'} className="text-[10px]">
                        {o.status}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* TAB CONTENT 6: CUSTOMERS */}
      {activeTab === 'customers' && (
        <Card className="p-5 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3 border-b border-[#EADFC8]">
            <div>
              <h3 className="text-sm font-semibold text-[#5A4630]">
                Customer Portfolio & Investor Registry
              </h3>
              <p className="text-xs text-[#7A6A55]">
                Investor portfolio values, KYC verification standing, and fraud risk flags.
              </p>
            </div>
            <Button
              variant="primary"
              size="sm"
              onClick={handleExportCustomerCSV}
              className="text-xs flex items-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5" /> Export Customers CSV
            </Button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-[#5A4630]">
              <thead>
                <tr className="border-b border-[#EADFC8] text-[#7A6A55] bg-[#FFFBF3]">
                  <th className="py-2.5 px-3 font-semibold">Customer ID</th>
                  <th className="py-2.5 px-3 font-semibold">Investor Name</th>
                  <th className="py-2.5 px-3 font-semibold">Contact Email</th>
                  <th className="py-2.5 px-3 font-semibold">Phone</th>
                  <th className="py-2.5 px-3 font-semibold">PAN</th>
                  <th className="py-2.5 px-3 font-semibold">Orders</th>
                  <th className="py-2.5 px-3 font-semibold">Cumulative Spend</th>
                  <th className="py-2.5 px-3 font-semibold">KYC Standing</th>
                  <th className="py-2.5 px-3 font-semibold text-right">Risk Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EADFC8]">
                {customers.map((c) => (
                  <tr key={c.id} className="hover:bg-[#FFFDF9]">
                    <td className="py-2.5 px-3 font-mono">{c.id}</td>
                    <td className="py-2.5 px-3 font-medium">{c.name}</td>
                    <td className="py-2.5 px-3 text-[#7A6A55]">{c.email}</td>
                    <td className="py-2.5 px-3 font-mono text-[11px]">{maskPhone(c.phone, activeRole)}</td>
                    <td className="py-2.5 px-3 font-mono text-[11px]">{maskPan(c.pan || c.panNumber, activeRole)}</td>
                    <td className="py-2.5 px-3">{c.totalOrders}</td>
                    <td className="py-2.5 px-3 font-serif font-bold text-[#5A4630]">{formatINR(c.totalSpent)}</td>
                    <td className="py-2.5 px-3">
                      <Badge variant={c.isVerified ? 'sage' : 'neutral'} className="text-[10px]">
                        {c.isVerified ? 'Verified' : 'Pending'}
                      </Badge>
                    </td>
                    <td className="py-2.5 px-3 text-right">
                      {c.fraudFlag ? (
                        <Badge variant="rose" className="text-[10px]">High Risk Flagged</Badge>
                      ) : (
                        <Badge variant="sage" className="text-[10px]">Clean</Badge>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* TAB CONTENT 7: SUPPORT */}
      {activeTab === 'support' && (
        <Card className="p-5 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3 border-b border-[#EADFC8]">
            <div>
              <h3 className="text-sm font-semibold text-[#5A4630]">
                Customer Concierge & Support Interactions
              </h3>
              <p className="text-xs text-[#7A6A55]">
                High-touch inquiries for assay verification, temple consecration reports, and delivery scheduling.
              </p>
            </div>
            <Button
              variant="primary"
              size="sm"
              onClick={handleExportSupportCSV}
              className="text-xs flex items-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5" /> Export Support CSV
            </Button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-[#5A4630]">
              <thead>
                <tr className="border-b border-[#EADFC8] text-[#7A6A55] bg-[#FFFBF3]">
                  <th className="py-2.5 px-3 font-semibold">Channel</th>
                  <th className="py-2.5 px-3 font-semibold">Customer</th>
                  <th className="py-2.5 px-3 font-semibold">Subject / Enquiry</th>
                  <th className="py-2.5 px-3 font-semibold">Concierge Officer</th>
                  <th className="py-2.5 px-3 font-semibold">Timestamp</th>
                  <th className="py-2.5 px-3 font-semibold text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EADFC8]">
                {supportInteractions.map((si, i) => (
                  <tr key={i} className="hover:bg-[#FFFDF9]">
                    <td className="py-2.5 px-3">
                      <Badge variant="gold" className="text-[10px]">{si.channel}</Badge>
                    </td>
                    <td className="py-2.5 px-3 font-medium">{si.customerName}</td>
                    <td className="py-2.5 px-3">{maskTextPII(si.subject, activeRole)}</td>
                    <td className="py-2.5 px-3 font-medium text-[#7A6A55]">{si.officer}</td>
                    <td className="py-2.5 px-3 text-[#7A6A55]">{new Date(si.createdAt).toLocaleDateString('en-IN')}</td>
                    <td className="py-2.5 px-3 text-right">
                      <Badge variant={si.status === 'Resolved' ? 'sage' : 'amber'} className="text-[10px]">
                        {si.status}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* TAB CONTENT 8: RETURNS & DISPUTES */}
      {activeTab === 'returns' && (
        <Card className="p-5 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3 border-b border-[#EADFC8]">
            <div>
              <h3 className="text-sm font-semibold text-[#5A4630]">
                Returns, Buybacks & Armoured Transit Claims
              </h3>
              <p className="text-xs text-[#7A6A55]">
                Logistics tamper claims, bead replacement disputes, and lifetime bullion buyback authorizations.
              </p>
            </div>
            <Button
              variant="primary"
              size="sm"
              onClick={handleExportReturnsCSV}
              className="text-xs flex items-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5" /> Export Returns CSV
            </Button>
          </div>

          <div className="space-y-4">
            <div className="font-semibold text-xs text-[#5A4630]">Active Armoured Transit Insurance Claims:</div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-[#5A4630]">
                <thead>
                  <tr className="border-b border-[#EADFC8] text-[#7A6A55] bg-[#FFFBF3]">
                    <th className="py-2.5 px-3 font-semibold">Claim ID</th>
                    <th className="py-2.5 px-3 font-semibold">Order #</th>
                    <th className="py-2.5 px-3 font-semibold">Courier & AWB</th>
                    <th className="py-2.5 px-3 font-semibold">Claim Amount</th>
                    <th className="py-2.5 px-3 font-semibold">Reason</th>
                    <th className="py-2.5 px-3 font-semibold text-right">Insurance Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#EADFC8]">
                  {claims.map((c) => (
                    <tr key={c.id} className="hover:bg-[#FFFDF9]">
                      <td className="py-2.5 px-3 font-mono font-medium">{c.id}</td>
                      <td className="py-2.5 px-3 font-mono">{c.orderNumber}</td>
                      <td className="py-2.5 px-3">{c.courierName} ({c.trackingNumber})</td>
                      <td className="py-2.5 px-3 font-serif font-bold text-[#9E2A2B]">{formatINR(c.claimAmount)}</td>
                      <td className="py-2.5 px-3 max-w-xs">{c.reason}</td>
                      <td className="py-2.5 px-3 text-right">
                        <Badge variant="amber" className="text-[10px]">{c.status}</Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </Card>
      )}

      {/* TAB CONTENT 9: SUPPLIERS & PO */}
      {activeTab === 'suppliers' && (
        <Card className="p-5 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3 border-b border-[#EADFC8]">
            <div>
              <h3 className="text-sm font-semibold text-[#5A4630]">
                Refinery Suppliers & Purchase Consignment Intake
              </h3>
              <p className="text-xs text-[#7A6A55]">
                Inward consignment PO records, refinery hallmarking license verification, and bullion cost basis.
              </p>
            </div>
            <Button
              variant="primary"
              size="sm"
              onClick={handleExportSuppliersCSV}
              className="text-xs flex items-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5" /> Export Suppliers CSV
            </Button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-[#5A4630]">
              <thead>
                <tr className="border-b border-[#EADFC8] text-[#7A6A55] bg-[#FFFBF3]">
                  <th className="py-2.5 px-3 font-semibold">PO Invoice #</th>
                  <th className="py-2.5 px-3 font-semibold">Refinery Supplier</th>
                  <th className="py-2.5 px-3 font-semibold">Metal / Grade</th>
                  <th className="py-2.5 px-3 font-semibold">Lot #</th>
                  <th className="py-2.5 px-3 font-semibold">Units Received</th>
                  <th className="py-2.5 px-3 font-semibold">Total Cost Basis</th>
                  <th className="py-2.5 px-3 font-semibold text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EADFC8]">
                {purchaseRecords.map((p) => (
                  <tr key={p.id} className="hover:bg-[#FFFDF9]">
                    <td className="py-2.5 px-3 font-mono font-medium">{p.purchaseInvoiceNo}</td>
                    <td className="py-2.5 px-3">{p.supplierName}</td>
                    <td className="py-2.5 px-3 font-semibold">{p.metalPurityGrade}</td>
                    <td className="py-2.5 px-3 font-mono text-[#7A6A55]">{p.lotNumber}</td>
                    <td className="py-2.5 px-3 font-bold">{p.quantityReceived}</td>
                    <td className="py-2.5 px-3 font-serif font-bold text-[#5A4630]">{formatINR(p.totalCostBasis)}</td>
                    <td className="py-2.5 px-3 text-right">
                      <Badge variant="sage" className="text-[10px]">{p.status}</Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* TAB CONTENT 10: SECURITY OPERATIONS (SIMULATED) */}
      {activeTab === 'security' && (
        <Card className="p-5 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3 border-b border-[#EADFC8]">
            <div>
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-[#C9A24B]" />
                <h3 className="text-sm font-semibold text-[#5A4630]">
                  Security Operations & Tamper-Evident Audit Trail
                </h3>
                <Badge variant="amber" className="text-[10px]">SIMULATED</Badge>
              </div>
              <p className="text-xs text-[#7A6A55]">
                Immutable administration logs, privileged role access records, backup snapshots, and security incidents.
              </p>
            </div>
            <Button
              variant="primary"
              size="sm"
              onClick={handleExportSecurityCSV}
              className="text-xs flex items-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5" /> Export Audit Ledger CSV
            </Button>
          </div>

          {/* Backup & System Health Strip */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3.5 bg-[#FFFBF3] border border-[#EADFC8] rounded-xl text-xs">
            <div>
              <div className="text-[11px] text-[#7A6A55]">Automated Vault Backup</div>
              <div className="font-semibold text-[#2D5A27] mt-0.5">Encrypted Daily Snapshot (2h ago)</div>
            </div>
            <div>
              <div className="text-[11px] text-[#7A6A55]">HSM Security Status</div>
              <div className="font-semibold text-[#5A4630] mt-0.5">FIPS 140-2 Level 3 Active</div>
            </div>
            <div>
              <div className="text-[11px] text-[#7A6A55]">Active Admin Sessions</div>
              <div className="font-semibold text-[#C9A24B] mt-0.5">1 Super Admin (Vikram Sharma)</div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-[#5A4630]">
              <thead>
                <tr className="border-b border-[#EADFC8] text-[#7A6A55] bg-[#FFFBF3]">
                  <th className="py-2.5 px-3 font-semibold">Audit Ref</th>
                  <th className="py-2.5 px-3 font-semibold">Actor / Officer</th>
                  <th className="py-2.5 px-3 font-semibold">Module</th>
                  <th className="py-2.5 px-3 font-semibold">Action Performed</th>
                  <th className="py-2.5 px-3 font-semibold">State Delta</th>
                  <th className="py-2.5 px-3 font-semibold text-right">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EADFC8]">
                {auditLogs.slice(0, 15).map((a) => (
                  <tr key={a.id} className="hover:bg-[#FFFDF9]">
                    <td className="py-2.5 px-3 font-mono text-[11px]">{a.id}</td>
                    <td className="py-2.5 px-3 font-semibold">{a.actor}</td>
                    <td className="py-2.5 px-3">
                      <Badge variant="neutral" className="text-[10px]">{a.module}</Badge>
                    </td>
                    <td className="py-2.5 px-3 font-medium text-[#5A4630]">{a.action}</td>
                    <td className="py-2.5 px-3 text-[11px] text-[#7A6A55] max-w-xs truncate">{a.after}</td>
                    <td className="py-2.5 px-3 text-right text-[#7A6A55]">{new Date(a.timestamp).toLocaleString('en-IN')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* PROPOSED FEATURE STRIP: TAGGED Proposed */}
      <div className="p-4 bg-[#F8EFD9] border border-[#EADFC8] rounded-xl space-y-3">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#C9A24B]" />
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#5A4630]">
              TAGGED PROPOSED: Enterprise Business Intelligence & Predictive Analytics
            </h4>
          </div>
          <Badge variant="amber" className="text-[10px]">Roadmap Concept</Badge>
        </div>

        <p className="text-xs text-[#7A6A55] leading-relaxed">
          The following intelligence modules are scheduled for enterprise tier integration with data warehouse pipelines:
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2.5 pt-1 text-xs text-[#5A4630]">
          <div className="p-2.5 bg-[#FFFFFF] border border-[#EADFC8] rounded shadow-2xs space-y-1">
            <div className="font-semibold text-[#C9A24B]">Conversion Funnels</div>
            <div className="text-[10px] text-[#7A6A55]">Cart to checkout drop-off visualization.</div>
          </div>
          <div className="p-2.5 bg-[#FFFFFF] border border-[#EADFC8] rounded shadow-2xs space-y-1">
            <div className="font-semibold text-[#C9A24B]">Cart Abandonment</div>
            <div className="text-[10px] text-[#7A6A55]">Rate-lock expiry abandoned cart alerts.</div>
          </div>
          <div className="p-2.5 bg-[#FFFFFF] border border-[#EADFC8] rounded shadow-2xs space-y-1">
            <div className="font-semibold text-[#C9A24B]">Search Analytics</div>
            <div className="text-[10px] text-[#7A6A55]">Zero-result queries & gemstone intent.</div>
          </div>
          <div className="p-2.5 bg-[#FFFFFF] border border-[#EADFC8] rounded shadow-2xs space-y-1">
            <div className="font-semibold text-[#C9A24B]">Cohort Retention</div>
            <div className="text-[10px] text-[#7A6A55]">Monthly gold accumulation repurchase.</div>
          </div>
          <div className="p-2.5 bg-[#FFFFFF] border border-[#EADFC8] rounded shadow-2xs space-y-1">
            <div className="font-semibold text-[#C9A24B]">Metal Forecasting</div>
            <div className="text-[10px] text-[#7A6A55]">Diwali festival bullion demand AI model.</div>
          </div>
          <div className="p-2.5 bg-[#FFFFFF] border border-[#EADFC8] rounded shadow-2xs space-y-1">
            <div className="font-semibold text-[#C9A24B]">Campaign ROI</div>
            <div className="text-[10px] text-[#7A6A55]">Multi-touch marketing attribution.</div>
          </div>
        </div>
      </div>
    </div>
  );
};
