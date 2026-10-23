import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useAppStore } from '../store';
import { useSEO } from '../lib/useSEO';
import { formatINR } from '../lib/pricing';
import { Card } from '../components/Card';
import { Badge } from '../components/Badge';
import { Button } from '../components/Button';
import {
  TrendingUp,
  ShoppingBag,
  Boxes,
  ShieldAlert,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Coins,
  Check,
  DollarSign,
  Activity,
} from 'lucide-react';

export const AdminDashboardPage: React.FC = () => {
  useSEO({
    title: 'Executive Operations Dashboard',
    description: 'Executive KPI telemetry, live bullion spot rates, order fulfillment stages, inventory reserves, and operational alerts.',
    canonicalPath: '/admin',
  });

  const {
    orders,
    products,
    rates,
    providerState,
    isFeedStale,
    alerts,
    quotes,
    resolveAlert,
  } = useAppStore();

  const [activeTab, setActiveTab] = useState<'executive' | 'orders' | 'rates' | 'inventory'>('executive');
  const [resolvedNotice, setResolvedNotice] = useState<string | null>(null);

  // Executive Metrics computed from real store data
  const metrics = useMemo(() => {
    const totalOrders = orders.length;
    const successfulOrders = orders.filter((o) => o.paymentStatus === 'Success');
    const grossRevenue = successfulOrders.reduce((sum, o) => sum + o.totalAmount, 0);
    const avgOrderValue = totalOrders > 0 ? Math.round(grossRevenue / (successfulOrders.length || 1)) : 0;
    const pendingDispatches = orders.filter((o) => o.status === 'Packed' || o.status === 'Invoice issued' || o.status === 'Picked').length;
    const activeReturnRequests = orders.filter((o) => o.status === 'Return requested' || o.returnRequest?.status === 'Pending').length;

    // Inventory counts
    const totalAvailableStock = products.reduce((sum, p) => sum + Math.max(0, p.stock - p.reserved), 0);
    const totalReservedStock = products.reduce((sum, p) => sum + p.reserved, 0);

    // Active quotes
    const activeQuotesCount = quotes.filter((q) => q.status === 'Active').length;

    return {
      grossRevenue,
      totalOrders,
      avgOrderValue,
      pendingDispatches,
      activeReturnRequests,
      totalAvailableStock,
      totalReservedStock,
      activeQuotesCount,
    };
  }, [orders, products, quotes]);

  const handleResolveAlert = (alertId: string, alertTitle: string) => {
    resolveAlert(alertId);
    setResolvedNotice(`Alert marked as resolved: "${alertTitle}"`);
    setTimeout(() => setResolvedNotice(null), 3500);
  };

  // Group alerts: Operational vs Parked
  const operationalAlerts = alerts.filter((a) => !a.isParked);
  const parkedAlerts = alerts.filter((a) => a.isParked);

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* 1. Page Header with Ticker Summary */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#EADFC8] pb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Badge variant="gold" size="sm">Phase 7 Dashboard</Badge>
            <span className="text-xs uppercase tracking-wider text-[#7A6A55] font-semibold">Real-Time Ops Center</span>
          </div>
          <h1 className="font-serif text-3xl font-bold text-[#5A4630]">
            Executive Operations Dashboard
          </h1>
          <p className="text-xs sm:text-sm text-[#7A6A55] mt-1">
            Aggregated institutional telemetry across precious bullion liquidity, order custody lifecycles, and vault inventory.
          </p>
        </div>

        {/* Live spot quick reference badge */}
        <div className="flex items-center gap-3">
          <div className="p-2.5 px-3.5 bg-white border border-[#EADFC8] rounded-xl text-xs space-y-0.5 shadow-xs">
            <div className="flex items-center gap-1.5 text-[#5A4630] font-semibold">
              <span className={`w-2 h-2 rounded-full ${isFeedStale ? 'bg-[#9E3624]' : 'bg-[#2D5A27] animate-pulse'}`}></span>
              <span>24K: <strong>{formatINR(rates.gold24k)}/g</strong></span>
              <span className="text-[#7A6A55]/60">•</span>
              <span>Ag: <strong>{formatINR(rates.silver999)}/g</strong></span>
            </div>
            <div className="text-[10px] text-[#7A6A55]">
              Provider: <strong>{providerState === 'ok' ? 'MCX Primary' : providerState === 'primaryFailed' ? 'BullionAPI Backup' : 'Feeds Down'}</strong>
            </div>
          </div>

          <Link to="/admin/rates">
            <Button variant="secondary" size="md" className="bg-white">
              Rates Engine →
            </Button>
          </Link>
        </div>
      </div>

      {resolvedNotice && (
        <div className="p-3.5 bg-[#DCE8D5] border border-[#A4C997] rounded-xl text-xs text-[#2D5A27] flex items-center gap-2 animate-in fade-in duration-200">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span className="font-medium">{resolvedNotice}</span>
        </div>
      )}

      {/* 2. Top-Level KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 bg-white border border-[#EADFC8] rounded-xl shadow-xs space-y-2">
          <div className="flex items-center justify-between text-xs text-[#7A6A55]">
            <span className="font-medium">Gross Sales Revenue</span>
            <span className="p-1.5 rounded-lg bg-[#FAF1DB] text-[#C9A24B]">
              <DollarSign className="w-4 h-4" />
            </span>
          </div>
          <div className="font-serif text-2xl font-bold text-[#5A4630]">
            {formatINR(metrics.grossRevenue)}
          </div>
          <div className="text-[11px] text-[#2D5A27] font-medium flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>+14.2% MoM growth</span>
          </div>
        </div>

        <div className="p-5 bg-white border border-[#EADFC8] rounded-xl shadow-xs space-y-2">
          <div className="flex items-center justify-between text-xs text-[#7A6A55]">
            <span className="font-medium">Order Custody Lifecycle</span>
            <span className="p-1.5 rounded-lg bg-[#FAF1DB] text-[#C9A24B]">
              <ShoppingBag className="w-4 h-4" />
            </span>
          </div>
          <div className="font-serif text-2xl font-bold text-[#5A4630]">
            {metrics.totalOrders} <span className="text-sm font-sans font-normal text-[#7A6A55]">Total</span>
          </div>
          <div className="text-[11px] text-[#7A6A55]">
            {metrics.pendingDispatches} pending dispatch • {metrics.activeReturnRequests} return requests
          </div>
        </div>

        <div className="p-5 bg-white border border-[#EADFC8] rounded-xl shadow-xs space-y-2">
          <div className="flex items-center justify-between text-xs text-[#7A6A55]">
            <span className="font-medium">Vault Physical Reserves</span>
            <span className="p-1.5 rounded-lg bg-[#FAF1DB] text-[#C9A24B]">
              <Boxes className="w-4 h-4" />
            </span>
          </div>
          <div className="font-serif text-2xl font-bold text-[#5A4630]">
            {metrics.totalAvailableStock} <span className="text-sm font-sans font-normal text-[#7A6A55]">Available</span>
          </div>
          <div className="text-[11px] text-[#C9A24B] font-medium">
            {metrics.totalReservedStock} units locked in active quotes & checkouts
          </div>
        </div>

        <div className="p-5 bg-white border border-[#EADFC8] rounded-xl shadow-xs space-y-2">
          <div className="flex items-center justify-between text-xs text-[#7A6A55]">
            <span className="font-medium">Average Order Value</span>
            <span className="p-1.5 rounded-lg bg-[#FAF1DB] text-[#C9A24B]">
              <Coins className="w-4 h-4" />
            </span>
          </div>
          <div className="font-serif text-2xl font-bold text-[#5A4630]">
            {formatINR(metrics.avgOrderValue)}
          </div>
          <div className="text-[11px] text-[#7A6A55]">
            High-ticket investor tier
          </div>
        </div>
      </div>

      {/* 3. 4 TABS NAVIGATION */}
      <div className="border-b border-[#EADFC8]">
        <nav className="flex items-center gap-4 sm:gap-8 overflow-x-auto text-xs sm:text-sm font-bold">
          <button
            type="button"
            onClick={() => setActiveTab('executive')}
            className={`pb-3 border-b-2 transition-all flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'executive'
                ? 'border-[#C9A24B] text-[#5A4630]'
                : 'border-transparent text-[#7A6A55] hover:text-[#5A4630]'
            }`}
          >
            <Activity className="w-4 h-4 text-[#C9A24B]" />
            <span>Executive View</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('orders')}
            className={`pb-3 border-b-2 transition-all flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'orders'
                ? 'border-[#C9A24B] text-[#5A4630]'
                : 'border-transparent text-[#7A6A55] hover:text-[#5A4630]'
            }`}
          >
            <ShoppingBag className="w-4 h-4 text-[#C9A24B]" />
            <span>Orders & Payments ({orders.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('rates')}
            className={`pb-3 border-b-2 transition-all flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'rates'
                ? 'border-[#C9A24B] text-[#5A4630]'
                : 'border-transparent text-[#7A6A55] hover:text-[#5A4630]'
            }`}
          >
            <TrendingUp className="w-4 h-4 text-[#C9A24B]" />
            <span>Rates & Feeds ({providerState})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('inventory')}
            className={`pb-3 border-b-2 transition-all flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'inventory'
                ? 'border-[#C9A24B] text-[#5A4630]'
                : 'border-transparent text-[#7A6A55] hover:text-[#5A4630]'
            }`}
          >
            <Boxes className="w-4 h-4 text-[#C9A24B]" />
            <span>Vault Inventory ({products.length} articles)</span>
          </button>
        </nav>
      </div>

      {/* 4. TAB CONTENTS */}

      {/* TAB 1: EXECUTIVE VIEW */}
      {activeTab === 'executive' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* 7-Day Revenue Trend Light SVG Chart (7 cols) */}
            <Card variant="surface" className="lg:col-span-7 p-6 border-[#EADFC8] space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-serif text-base font-bold text-[#5A4630]">
                    7-Day Gross Sales Trajectory
                  </h3>
                  <p className="text-xs text-[#7A6A55]">
                    Realized settlements across bullion and fine jewellery
                  </p>
                </div>
                <Badge variant="gold" size="sm">₹ INR Daily Total</Badge>
              </div>

              {/* Inline SVG Chart */}
              <div className="h-48 w-full pt-2">
                <svg className="w-full h-full overflow-visible" viewBox="0 0 500 160">
                  <defs>
                    <linearGradient id="goldGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#C9A24B" stopOpacity="0.35" />
                      <stop offset="100%" stopColor="#C9A24B" stopOpacity="0.02" />
                    </linearGradient>
                  </defs>

                  {/* Horizontal Grid lines */}
                  <line x1="0" y1="30" x2="500" y2="30" stroke="#EADFC8" strokeDasharray="3 3" />
                  <line x1="0" y1="75" x2="500" y2="75" stroke="#EADFC8" strokeDasharray="3 3" />
                  <line x1="0" y1="120" x2="500" y2="120" stroke="#EADFC8" strokeDasharray="3 3" />

                  {/* Area fill */}
                  <polygon
                    fill="url(#goldGradient)"
                    points="30,120 30,105 100,85 175,95 250,55 330,70 410,40 480,25 480,140 30,140"
                  />

                  {/* Line path */}
                  <polyline
                    fill="none"
                    stroke="#C9A24B"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    points="30,105 100,85 175,95 250,55 330,70 410,40 480,25"
                  />

                  {/* Data Points */}
                  {[
                    { x: 30, y: 105, val: '₹1.8L' },
                    { x: 100, y: 85, val: '₹2.4L' },
                    { x: 175, y: 95, val: '₹2.1L' },
                    { x: 250, y: 55, val: '₹3.9L' },
                    { x: 330, y: 70, val: '₹3.2L' },
                    { x: 410, y: 40, val: '₹4.8L' },
                    { x: 480, y: 25, val: '₹5.6L' },
                  ].map((pt, i) => (
                    <g key={i}>
                      <circle cx={pt.x} cy={pt.y} r="4" fill="#FFFFFF" stroke="#C9A24B" strokeWidth="2.5" />
                      <text x={pt.x} y={pt.y - 10} textAnchor="middle" fontSize="10" fill="#5A4630" fontWeight="bold">
                        {pt.val}
                      </text>
                    </g>
                  ))}

                  {/* X Axis labels */}
                  <text x="30" y="155" textAnchor="middle" fontSize="10" fill="#7A6A55">Thu</text>
                  <text x="100" y="155" textAnchor="middle" fontSize="10" fill="#7A6A55">Fri</text>
                  <text x="175" y="155" textAnchor="middle" fontSize="10" fill="#7A6A55">Sat</text>
                  <text x="250" y="155" textAnchor="middle" fontSize="10" fill="#7A6A55">Sun</text>
                  <text x="330" y="155" textAnchor="middle" fontSize="10" fill="#7A6A55">Mon</text>
                  <text x="410" y="155" textAnchor="middle" fontSize="10" fill="#7A6A55">Tue</text>
                  <text x="480" y="155" textAnchor="middle" fontSize="10" fill="#7A6A55">Today</text>
                </svg>
              </div>
            </Card>

            {/* Category Revenue Distribution (5 cols) */}
            <Card variant="surface" className="lg:col-span-5 p-6 border-[#EADFC8] space-y-4">
              <div>
                <h3 className="font-serif text-base font-bold text-[#5A4630]">
                  Category Volume Distribution
                </h3>
                <p className="text-xs text-[#7A6A55]">
                  Portfolio breakdown by product family
                </p>
              </div>

              <div className="space-y-3 pt-1 text-xs">
                {[
                  { name: '24K & 22K Gold Bullion', share: '62%', color: 'bg-[#C9A24B]', amount: '₹14.8M' },
                  { name: '999 Fine Silver Bullion', share: '18%', color: 'bg-[#8C9BA5]', amount: '₹4.3M' },
                  { name: 'Certified Natural Gemstones', share: '12%', color: 'bg-[#4D7C45]', amount: '₹2.8M' },
                  { name: 'Consecrated Nepali Rudraksha', share: '5%', color: 'bg-[#A85848]', amount: '₹1.2M' },
                  { name: 'Corporate & Festive Sets', share: '3%', color: 'bg-[#C9A24B]/60', amount: '₹0.7M' },
                ].map((cat) => (
                  <div key={cat.name} className="space-y-1">
                    <div className="flex justify-between font-medium">
                      <span className="text-[#5A4630]">{cat.name}</span>
                      <span className="font-bold text-[#5A4630]">{cat.amount} ({cat.share})</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-[#FFFBF3] border border-[#EADFC8] overflow-hidden">
                      <div className={`h-full ${cat.color} rounded-full`} style={{ width: cat.share }} />
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>
      )}

      {/* TAB 2: ORDERS & PAYMENTS */}
      {activeTab === 'orders' && (
        <Card variant="surface" className="p-6 border-[#EADFC8] space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-[#EADFC8]">
            <div>
              <h3 className="font-serif text-lg font-bold text-[#5A4630]">
                Fulfillment Custody Pipeline
              </h3>
              <p className="text-xs text-[#7A6A55]">
                Real-time tracking of active orders across dispatch, QC and ERP invoice milestones.
              </p>
            </div>
            <Link to="/admin/orders">
              <Button variant="secondary" size="sm" className="bg-white">
                View All Orders →
              </Button>
            </Link>
          </div>

          {/* Lifecycle Stages Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3 text-center text-xs">
            {[
              { stage: 'Placed', count: orders.filter((o) => o.status === 'Placed').length, color: 'border-[#EADFC8]' },
              { stage: 'Payment confirmed', count: orders.filter((o) => o.status === 'Payment confirmed').length, color: 'border-[#A4C997]' },
              { stage: 'Picked', count: orders.filter((o) => o.status === 'Picked').length, color: 'border-[#EADFC8]' },
              { stage: 'Packed', count: orders.filter((o) => o.status === 'Packed').length, color: 'border-[#EADFC8]' },
              { stage: 'Quality checked', count: orders.filter((o) => o.status === 'Quality checked').length, color: 'border-[#EADFC8]' },
              { stage: 'Invoice issued', count: orders.filter((o) => o.status === 'Invoice issued').length, color: 'border-[#C9A24B]' },
              { stage: 'Dispatched', count: orders.filter((o) => o.status === 'Dispatched').length, color: 'border-[#A4C997]' },
              { stage: 'Delivered', count: orders.filter((o) => o.status === 'Delivered').length, color: 'border-[#A4C997]' },
            ].map((st) => (
              <div key={st.stage} className={`p-3 bg-white border ${st.color} rounded-xl shadow-xs space-y-1`}>
                <div className="text-[11px] text-[#7A6A55] font-medium leading-tight h-7 flex items-center justify-center">
                  {st.stage}
                </div>
                <div className="font-serif text-xl font-bold text-[#5A4630]">
                  {st.count}
                </div>
              </div>
            ))}
          </div>

          {/* Orders Table */}
          <div className="overflow-x-auto rounded-xl border border-[#EADFC8]">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F8EFD9] text-[#5A4630] border-b border-[#EADFC8]">
                <tr>
                  <th className="p-3">Order #</th>
                  <th className="p-3">Customer</th>
                  <th className="p-3">Total Amount</th>
                  <th className="p-3">Payment</th>
                  <th className="p-3">Lifecycle Status</th>
                  <th className="p-3">Invoice</th>
                  <th className="p-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EADFC8] bg-white">
                {orders.map((o) => (
                  <tr key={o.id} className="hover:bg-[#FFFBF3]">
                    <td className="p-3 font-mono font-bold text-[#5A4630]">{o.orderNumber}</td>
                    <td className="p-3">{o.customerName}</td>
                    <td className="p-3 font-bold text-[#5A4630]">{formatINR(o.totalAmount)}</td>
                    <td className="p-3">
                      <Badge variant={o.paymentStatus === 'Success' ? 'sage' : 'coral'} size="sm">
                        {o.paymentStatus}
                      </Badge>
                    </td>
                    <td className="p-3">
                      <Badge variant="gold" size="sm">{o.status}</Badge>
                    </td>
                    <td className="p-3 text-[#7A6A55]">
                      {o.erpInvoiceAttached ? (
                        <span className="text-[#2D5A27] font-medium flex items-center gap-1">
                          <Check className="w-3.5 h-3.5" />
                          <span>{o.erpInvoiceNumber}</span>
                        </span>
                      ) : (
                        <span className="text-[#9E3624]">Pending ERP</span>
                      )}
                    </td>
                    <td className="p-3 text-right">
                      <Link to={`/admin/orders/${o.id}`} className="text-[#C9A24B] hover:underline font-semibold">
                        Inspect →
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* TAB 3: RATES & FEEDS */}
      {activeTab === 'rates' && (
        <Card variant="surface" className="p-6 border-[#EADFC8] space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#EADFC8]">
            <div>
              <h3 className="font-serif text-lg font-bold text-[#5A4630]">
                Bullion Rates & Socket Telemetry
              </h3>
              <p className="text-xs text-[#7A6A55]">
                Feed health, normalization algorithms, and socket failover controls.
              </p>
            </div>
            <Link to="/admin/rates">
              <Button variant="primary" size="sm">
                Open Full Rates & Pricing Center →
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-5 bg-white border border-[#EADFC8] rounded-xl space-y-2">
              <div className="text-xs text-[#7A6A55] font-semibold uppercase tracking-wider">
                Gold 24K (999.9 Purity)
              </div>
              <div className="font-serif text-2xl font-bold text-[#5A4630]">
                {formatINR(rates.gold24k)} <span className="text-xs font-sans font-normal text-[#7A6A55]">/ gram</span>
              </div>
              <div className="text-xs text-[#7A6A55]">
                10g Bullion Equivalent: <strong>{formatINR(rates.gold24k * 10)}</strong>
              </div>
            </div>

            <div className="p-5 bg-white border border-[#EADFC8] rounded-xl space-y-2">
              <div className="text-xs text-[#7A6A55] font-semibold uppercase tracking-wider">
                Gold 22K (916 Hallmark)
              </div>
              <div className="font-serif text-2xl font-bold text-[#5A4630]">
                {formatINR(rates.gold22k)} <span className="text-xs font-sans font-normal text-[#7A6A55]">/ gram</span>
              </div>
              <div className="text-xs text-[#7A6A55]">
                Purity Factor: <strong>91.67% fine gold</strong>
              </div>
            </div>

            <div className="p-5 bg-white border border-[#EADFC8] rounded-xl space-y-2">
              <div className="text-xs text-[#7A6A55] font-semibold uppercase tracking-wider">
                999 Fine Silver Bullion
              </div>
              <div className="font-serif text-2xl font-bold text-[#5A4630]">
                {formatINR(rates.silver999)} <span className="text-xs font-sans font-normal text-[#7A6A55]">/ gram</span>
              </div>
              <div className="text-xs text-[#7A6A55]">
                1 kg Silver Bar Equivalent: <strong>{formatINR(rates.silver999 * 1000)}</strong>
              </div>
            </div>
          </div>

          <div className="p-4 bg-[#FFFBF3] border border-[#EADFC8] rounded-xl flex items-center justify-between text-xs text-[#5A4630]">
            <div className="flex items-center gap-3">
              <span className={`w-3 h-3 rounded-full ${isFeedStale ? 'bg-[#9E3624]' : 'bg-[#2D5A27] animate-pulse'}`}></span>
              <div>
                <strong>Ingestion State:</strong> {providerState === 'ok' ? 'Healthy (MCX Primary Socket)' : providerState === 'primaryFailed' ? 'Backup Provider Engaged (BullionAPI)' : 'All Providers Down'}
              </div>
            </div>
            <span className="text-[#7A6A55]">
              Last rate heartbeat: {new Date(rates.lastUpdated).toLocaleTimeString()}
            </span>
          </div>
        </Card>
      )}

      {/* TAB 4: VAULT INVENTORY */}
      {activeTab === 'inventory' && (
        <Card variant="surface" className="p-6 border-[#EADFC8] space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#EADFC8]">
            <div>
              <h3 className="font-serif text-lg font-bold text-[#5A4630]">
                Vault Inventory & Reserve Pools
              </h3>
              <p className="text-xs text-[#7A6A55]">
                Physical reserves, active quote allocations, and serialized bar registries.
              </p>
            </div>
            <Link to="/admin/inventory">
              <Button variant="secondary" size="sm" className="bg-white">
                Inventory Ledger →
              </Button>
            </Link>
          </div>

          <div className="overflow-x-auto rounded-xl border border-[#EADFC8]">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F8EFD9] text-[#5A4630] border-b border-[#EADFC8]">
                <tr>
                  <th className="p-3">Product Name</th>
                  <th className="p-3">SKU</th>
                  <th className="p-3">Category</th>
                  <th className="p-3">Total Vault Stock</th>
                  <th className="p-3">Reserved</th>
                  <th className="p-3">Available</th>
                  <th className="p-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EADFC8] bg-white">
                {products.map((p) => {
                  const avail = p.stock - p.reserved;
                  return (
                    <tr key={p.id} className="hover:bg-[#FFFBF3]">
                      <td className="p-3 font-serif font-bold text-[#5A4630]">{p.name}</td>
                      <td className="p-3 font-mono text-[#7A6A55]">{p.sku}</td>
                      <td className="p-3 uppercase text-[10px] font-semibold text-[#7A6A55]">{p.category}</td>
                      <td className="p-3">{p.stock}</td>
                      <td className="p-3 font-medium text-[#C9A24B]">{p.reserved}</td>
                      <td className="p-3 font-bold text-[#5A4630]">{avail}</td>
                      <td className="p-3">
                        <Badge variant={avail <= 0 ? 'coral' : avail <= 2 ? 'amber' : 'sage'} size="sm">
                          {avail <= 0 ? 'Out of Stock' : avail <= 2 ? 'Low Stock' : 'Optimal'}
                        </Badge>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* 5. ALERTS PANEL (Operational + Parked) */}
      <Card variant="surface" className="p-6 border-[#EADFC8] space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#EADFC8]">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-[#C9A24B]" />
            <h2 className="font-serif text-lg font-bold text-[#5A4630]">
              Operational Governance Alerts ({operationalAlerts.filter((a) => !a.resolved).length} active)
            </h2>
          </div>
          <span className="text-xs text-[#7A6A55]">
            Real-time triggers for rate failures, stock reorders, and payment reconciliation
          </span>
        </div>

        {/* Active Operational Alerts */}
        <div className="space-y-3">
          {operationalAlerts.map((al) => (
            <div
              key={al.id}
              className={`p-4 rounded-xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                al.resolved
                  ? 'bg-[#FFFBF3]/50 border-[#EADFC8]/60 opacity-60'
                  : al.severity === 'high'
                  ? 'bg-[#FDF0EE]/80 border-[#F1B5AC]'
                  : 'bg-white border-[#EADFC8]'
              }`}
            >
              <div className="flex items-start gap-3">
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${
                    al.resolved
                      ? 'bg-[#EAEFF5] text-[#7A6A55]'
                      : al.severity === 'high'
                      ? 'bg-[#FDF0EE] text-[#9E3624]'
                      : 'bg-[#FAF1DB] text-[#C9A24B]'
                  }`}
                >
                  <AlertTriangle className="w-4 h-4" />
                </div>
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-serif font-bold text-xs sm:text-sm text-[#5A4630]">
                      {al.title}
                    </span>
                    <Badge variant={al.severity === 'high' ? 'coral' : 'gold'} size="sm">
                      {al.severity.toUpperCase()}
                    </Badge>
                    {al.resolved && (
                      <Badge variant="sage" size="sm">Resolved</Badge>
                    )}
                  </div>
                  <p className="text-xs text-[#7A6A55] leading-relaxed">
                    {al.description}
                  </p>
                  <div className="text-[10px] text-[#7A6A55]/70 pt-0.5">
                    Triggered: {new Date(al.timestamp).toLocaleString()}
                  </div>
                </div>
              </div>

              {!al.resolved && (
                <div className="flex items-center gap-2 shrink-0">
                  <Button
                    variant="secondary"
                    size="sm"
                    className="bg-white text-xs"
                    onClick={() => handleResolveAlert(al.id, al.title)}
                    leftIcon={<Check className="w-3.5 h-3.5 text-[#2D5A27]" />}
                  >
                    Resolve Alert
                  </Button>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* 6. PARKED ALERTS GROUP (TAGGED Proposed) */}
        <div className="pt-6 border-t border-[#EADFC8] space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-[#7A6A55]" />
              <h3 className="font-serif text-sm font-bold text-[#5A4630]">
                Parked Alerts (Upcoming Capabilities)
              </h3>
              <Badge variant="neutral" size="sm">Proposed / Phase 2</Badge>
            </div>
            <span className="text-[11px] text-[#7A6A55]">Informational queue</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {parkedAlerts.map((pa) => (
              <div
                key={pa.id}
                className="p-3.5 rounded-xl border border-[#EADFC8] bg-[#F8EFD9]/40 text-xs space-y-1.5 opacity-75"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-[#5A4630]">{pa.title}</span>
                  <Badge variant="neutral" size="sm">Parked</Badge>
                </div>
                <p className="text-[11px] text-[#7A6A55] leading-relaxed">
                  {pa.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </Card>
    </div>
  );
};
