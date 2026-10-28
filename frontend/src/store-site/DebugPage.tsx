import React, { useState } from 'react';
import { useAppStore } from '../store';
import { calculatePrice, formatINR, formatDateTime } from '../lib/pricing';
import { evaluateOrderKyc } from '../lib/kyc';
import { evaluatePriceLock, canProceedToPaymentWithLock } from '../lib/priceLock';
import { handlePaymentWebhook, type GatewayWebhookPayload, type WebhookHandlerResult } from '../lib/webhook';
import { Card } from '../components/Card';
import { Badge } from '../components/Badge';
import { Button } from '../components/Button';
import {
  Activity,
  RefreshCw,
  ShieldCheck,
  Clock,
  Webhook,
  Package,
  ShoppingCart,
  Users,
  Briefcase,
  LifeBuoy,
  CheckSquare,
  FileText,
  AlertTriangle,
  CheckCircle2,
  Percent,
} from 'lucide-react';

type DebugTab =
  | 'simulators'
  | 'products'
  | 'orders'
  | 'customers'
  | 'corporate'
  | 'offers'
  | 'tickets_comms'
  | 'approvals'
  | 'ledgers';

export const DebugPage: React.FC = () => {
  const {
    rates,
    providerState,
    isFeedStale,
    pricingConfig,
    products,
    orders,
    customers,
    offers,
    corporateEnquiries,
    corporateQuotes,
    supportTickets,
    approvals,
    communicationEvents,
    pricingLedger,
    orderLedger,
    processedWebhookEventIds,
    priceLockConfig,
    tickRates,
    setProviderState,
    applyRateOverride,
    resetDemoData,
  } = useAppStore();

  const [activeTab, setActiveTab] = useState<DebugTab>('simulators');

  // Interactive KYC Simulator state
  const [simKycAmount, setSimKycAmount] = useState<number>(245000);
  const [simKycPan, setSimKycPan] = useState<string>('AAAPA1234K');
  const [simKycStatus, setSimKycStatus] = useState<'Pending' | 'Verified' | 'Exempt' | 'Rejected'>('Pending');

  // Interactive Price Lock Simulator state
  const [simLockTimestamp, setSimLockTimestamp] = useState<string>(new Date().toISOString());
  const [simLockDuration, setSimLockDuration] = useState<number>(priceLockConfig?.durationSeconds || 600);

  // Interactive Webhook Simulator state
  const [simWebhookEventId, setSimWebhookEventId] = useState<string>('evt_manual_test_001');
  const [simWebhookOrder, setSimWebhookOrder] = useState<string>('ORD-2026-001');
  const [simWebhookAmount, setSimWebhookAmount] = useState<number>(140225);
  const [simWebhookResult, setSimWebhookResult] = useState<WebhookHandlerResult | null>(null);

  // Evaluate simulated rules live
  const kycResult = evaluateOrderKyc(simKycAmount, simKycPan, simKycStatus);
  const lockResult = evaluatePriceLock(simLockTimestamp, simLockDuration);
  const checkoutGuard = canProceedToPaymentWithLock(simLockTimestamp, simLockDuration);

  const handleTestWebhook = () => {
    const payload: GatewayWebhookPayload = {
      eventId: simWebhookEventId,
      orderId: simWebhookOrder,
      transactionId: `TXN-${Date.now().toString().slice(-6)}`,
      amount: simWebhookAmount,
      status: 'PAYMENT_SUCCESS',
      signature: `sha256_${Date.now()}_mock_signature`,
      timestamp: new Date().toISOString(),
    };
    const res = handlePaymentWebhook(payload, processedWebhookEventIds || [], simWebhookAmount);
    setSimWebhookResult(res);
  };

  const tabs: { id: DebugTab; label: string; count?: number; icon: React.ReactNode }[] = [
    { id: 'simulators', label: 'Interactive Rule Simulators', icon: <Activity className="w-4 h-4" /> },
    { id: 'products', label: 'Products (27+ Fields)', count: products.length, icon: <Package className="w-4 h-4" /> },
    { id: 'orders', label: 'Orders & KYC Gating', count: orders.length, icon: <ShoppingCart className="w-4 h-4" /> },
    { id: 'customers', label: 'Customers & KYC', count: customers.length, icon: <Users className="w-4 h-4" /> },
    { id: 'corporate', label: 'B2B Quotes & Enquiries', count: corporateQuotes.length, icon: <Briefcase className="w-4 h-4" /> },
    { id: 'offers', label: 'Offers & Margin Floor', count: offers.length, icon: <Percent className="w-4 h-4" /> },
    { id: 'tickets_comms', label: 'Support & Comms', count: supportTickets.length, icon: <LifeBuoy className="w-4 h-4" /> },
    { id: 'approvals', label: 'Maker-Checker Approvals', count: approvals.length, icon: <CheckSquare className="w-4 h-4" /> },
    { id: 'ledgers', label: 'Audit Ledgers', count: pricingLedger.length + orderLedger.length, icon: <FileText className="w-4 h-4" /> },
  ];

  return (
    <div className="py-6 space-y-6 max-w-7xl mx-auto px-4 sm:px-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#EADFC8]">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Badge variant="gold" size="sm">Phase 1 Diagnostic</Badge>
            <Badge variant={isFeedStale ? 'amber' : 'sage'} size="sm">
              {isFeedStale ? 'FEED STALE (>20s)' : 'ENGINE ACTIVE'}
            </Badge>
            <Badge variant="neutral" size="sm">Monorepo / Prototype v2</Badge>
          </div>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-[#5A4630] flex items-center gap-2">
            <Activity className="w-7 h-7 text-[#C9A24B]" />
            Data Model & Statutory Logic Inspector (/debug)
          </h1>
          <p className="text-xs text-[#7A6A55] mt-1">
            Real-time inspection of 27+ product fields, KYC limits, spot price locks, idempotent webhooks, and ledger entries.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <Button
            variant="primary"
            size="sm"
            onClick={() => tickRates()}
            leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
          >
            Force Rate Tick
          </Button>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => resetDemoData()}
          >
            Reset Mock Data
          </Button>
        </div>
      </div>

      {/* Spot Metal Ticker Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card variant="surface" className="p-4 border-[#EADFC8]">
          <div className="text-[11px] text-[#7A6A55] uppercase font-bold tracking-wider mb-1">
            Gold 24K (999.9) Spot
          </div>
          <div className="text-2xl font-serif font-bold text-[#5A4630] tabular-nums">
            {formatINR(rates.gold24k)}
            <span className="text-xs font-sans text-[#7A6A55] font-normal"> / g</span>
          </div>
          <div className="text-[11px] text-[#7A6A55] mt-2 flex items-center justify-between">
            <span>Tick: {formatDateTime(rates.lastUpdated).slice(11)}</span>
            <button
              onClick={() => applyRateOverride('gold24k', rates.gold24k + 100, 'Debug Inspector')}
              className="text-[#C9A24B] hover:underline font-semibold"
            >
              +₹100
            </button>
          </div>
        </Card>

        <Card variant="surface" className="p-4 border-[#EADFC8]">
          <div className="text-[11px] text-[#7A6A55] uppercase font-bold tracking-wider mb-1">
            Gold 22K (916) Hallmark
          </div>
          <div className="text-2xl font-serif font-bold text-[#5A4630] tabular-nums">
            {formatINR(rates.gold22k)}
            <span className="text-xs font-sans text-[#7A6A55] font-normal"> / g</span>
          </div>
          <div className="text-[11px] text-[#7A6A55] mt-2">
            Basis: 24K × 0.9167
          </div>
        </Card>

        <Card variant="surface" className="p-4 border-[#EADFC8]">
          <div className="text-[11px] text-[#7A6A55] uppercase font-bold tracking-wider mb-1">
            Silver 999 Fine Bullion
          </div>
          <div className="text-2xl font-serif font-bold text-[#5A4630] tabular-nums">
            {formatINR(rates.silver999)}
            <span className="text-xs font-sans text-[#7A6A55] font-normal"> / g</span>
          </div>
          <div className="text-[11px] text-[#7A6A55] mt-2 flex items-center justify-between">
            <span>Tick: {formatDateTime(rates.lastUpdated).slice(11)}</span>
            <button
              onClick={() => applyRateOverride('silver999', rates.silver999 + 5, 'Debug Inspector')}
              className="text-[#C9A24B] hover:underline font-semibold"
            >
              +₹5
            </button>
          </div>
        </Card>

        <Card variant="surface-alt" className="p-4 border-[#EADFC8]">
          <div className="text-[11px] text-[#5A4630] uppercase font-bold tracking-wider mb-2 flex items-center justify-between">
            <span>Provider Engine</span>
            <Badge variant={providerState === 'ok' ? 'sage' : 'coral'} size="sm">{providerState}</Badge>
          </div>
          <div className="grid grid-cols-3 gap-1">
            <button
              onClick={() => setProviderState('ok')}
              className={`text-[10px] py-1 px-1 rounded font-medium border text-center transition-colors ${
                providerState === 'ok' ? 'bg-[#DCE8D5] border-[#A4C997] text-[#2D5A27]' : 'bg-white border-[#EADFC8] text-[#5A4630]'
              }`}
            >
              Normal
            </button>
            <button
              onClick={() => setProviderState('primaryFailed')}
              className={`text-[10px] py-1 px-1 rounded font-medium border text-center transition-colors ${
                providerState === 'primaryFailed' ? 'bg-[#FBE7B8] border-[#E8C26E] text-[#7A5310]' : 'bg-white border-[#EADFC8] text-[#5A4630]'
              }`}
            >
              Fail 1st
            </button>
            <button
              onClick={() => setProviderState('bothDown')}
              className={`text-[10px] py-1 px-1 rounded font-medium border text-center transition-colors ${
                providerState === 'bothDown' ? 'bg-[#F7D4CF] border-[#E89E95] text-[#8C2E24]' : 'bg-white border-[#EADFC8] text-[#5A4630]'
              }`}
            >
              Fail Both
            </button>
          </div>
          <div className="text-[10px] text-[#7A6A55] pt-2">
            GST: <strong>3%</strong> | Statutory Threshold: <strong>₹2,00,000</strong>
          </div>
        </Card>
      </div>

      {/* Navigation Tabs */}
      <div className="border-b border-[#EADFC8] overflow-x-auto">
        <nav className="flex space-x-2 pb-2 min-w-max">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-3 py-2 text-xs font-medium rounded-md transition-colors ${
                activeTab === tab.id
                  ? 'bg-[#C9A24B] text-white shadow-sm'
                  : 'bg-[#F8EFD9] text-[#5A4630] hover:bg-[#EADFC8]'
              }`}
            >
              {tab.icon}
              <span>{tab.label}</span>
              {tab.count !== undefined && (
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                    activeTab === tab.id ? 'bg-white/20 text-white' : 'bg-[#EADFC8] text-[#5A4630]'
                  }`}
                >
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab 1: Interactive Rule Simulators */}
      {activeTab === 'simulators' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Statutory KYC Rule Simulator */}
          <Card variant="surface" className="p-5 border-[#EADFC8] space-y-4">
            <div className="flex items-center justify-between border-b border-[#EADFC8] pb-3">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-[#C9A24B]" />
                <h3 className="font-serif font-bold text-[#5A4630]">1. Statutory KYC Rule</h3>
              </div>
              <Badge variant={kycResult.compliant ? 'sage' : 'coral'} size="sm">
                {kycResult.compliant ? 'Compliant' : 'Order Held'}
              </Badge>
            </div>
            <p className="text-xs text-[#7A6A55]">
              Mandatory PMLA compliance: Transactions strictly &gt; ₹2,00,000 require valid PAN and verified KYC.
            </p>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-[#5A4630] font-semibold mb-1">Order Total (₹)</label>
                <input
                  type="number"
                  value={simKycAmount}
                  onChange={(e) => setSimKycAmount(Number(e.target.value))}
                  className="w-full px-3 py-1.5 bg-white border border-[#EADFC8] rounded text-[#5A4630] focus:outline-[#C9A24B]"
                />
              </div>

              <div>
                <label className="block text-[#5A4630] font-semibold mb-1">Customer PAN</label>
                <input
                  type="text"
                  value={simKycPan}
                  onChange={(e) => setSimKycPan(e.target.value.toUpperCase())}
                  placeholder="e.g. AAAPA1234K"
                  className="w-full px-3 py-1.5 bg-white border border-[#EADFC8] rounded text-[#5A4630] font-mono focus:outline-[#C9A24B]"
                />
              </div>

              <div>
                <label className="block text-[#5A4630] font-semibold mb-1">Customer KYC Status</label>
                <select
                  value={simKycStatus}
                  onChange={(e) => setSimKycStatus(e.target.value as any)}
                  className="w-full px-3 py-1.5 bg-white border border-[#EADFC8] rounded text-[#5A4630] focus:outline-[#C9A24B]"
                >
                  <option value="Pending">Pending</option>
                  <option value="Verified">Verified</option>
                  <option value="Exempt">Exempt</option>
                  <option value="Rejected">Rejected</option>
                </select>
              </div>

              <div className="pt-2 border-t border-[#EADFC8] space-y-2">
                <div className="flex justify-between">
                  <span className="text-[#7A6A55]">KYC Required (&gt; ₹2L):</span>
                  <span className="font-semibold text-[#5A4630]">{kycResult.required ? 'YES' : 'NO (Exempt)'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#7A6A55]">Order Allowed to Checkout:</span>
                  <span className={`font-semibold ${kycResult.compliant ? 'text-[#2D5A27]' : 'text-[#8C2E24]'}`}>
                    {kycResult.compliant ? 'APPROVED' : 'HELD ON KYC'}
                  </span>
                </div>
                {kycResult.holdReason && (
                  <div className="p-2.5 bg-[#F7D4CF] border border-[#E89E95] text-[#8C2E24] rounded text-[11px] leading-tight">
                    <AlertTriangle className="w-3.5 h-3.5 inline mr-1" />
                    <strong>Hold Reason:</strong> {kycResult.holdReason}
                  </div>
                )}
              </div>
            </div>
          </Card>

          {/* Spot Price Lock Simulator */}
          <Card variant="surface" className="p-5 border-[#EADFC8] space-y-4">
            <div className="flex items-center justify-between border-b border-[#EADFC8] pb-3">
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-[#C9A24B]" />
                <h3 className="font-serif font-bold text-[#5A4630]">2. Price Lock Expiry Guard</h3>
              </div>
              <Badge variant={lockResult.isValid ? 'sage' : 'coral'} size="sm">
                {lockResult.isValid ? 'Lock Active' : 'Expired'}
              </Badge>
            </div>
            <p className="text-xs text-[#7A6A55]">
              Guaranteed spot rate window (10 min). Once expired, checkout payment is strictly blocked until requoted.
            </p>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-[#5A4630] font-semibold mb-1">Configured Duration (Seconds &gt; 0)</label>
                <input
                  type="number"
                  value={simLockDuration}
                  onChange={(e) => setSimLockDuration(Math.max(1, Number(e.target.value)))}
                  className="w-full px-3 py-1.5 bg-white border border-[#EADFC8] rounded text-[#5A4630] focus:outline-[#C9A24B]"
                />
              </div>

              <div className="flex gap-2">
                <Button
                  variant="secondary"
                  size="sm"
                  className="flex-1 text-[11px]"
                  onClick={() => setSimLockTimestamp(new Date().toISOString())}
                >
                  Reset Fresh Lock
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  className="flex-1 text-[11px]"
                  onClick={() => setSimLockTimestamp(new Date(Date.now() - (simLockDuration + 10) * 1000).toISOString())}
                >
                  Force Expire
                </Button>
              </div>

              <div className="pt-2 border-t border-[#EADFC8] space-y-2">
                <div className="flex justify-between">
                  <span className="text-[#7A6A55]">Remaining Seconds:</span>
                  <span className="font-bold text-[#5A4630] tabular-nums">{lockResult.remainingSeconds}s</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#7A6A55]">Payment Guardrail Status:</span>
                  <span className={`font-semibold ${checkoutGuard.allowed ? 'text-[#2D5A27]' : 'text-[#8C2E24]'}`}>
                    {checkoutGuard.allowed ? 'PAYMENT PERMITTED' : 'CHECKOUT BLOCKED'}
                  </span>
                </div>
                {checkoutGuard.blockingReason && (
                  <div className="p-2.5 bg-[#FBE7B8] border border-[#E8C26E] text-[#7A5310] rounded text-[11px] leading-tight">
                    <AlertTriangle className="w-3.5 h-3.5 inline mr-1" />
                    <strong>Guardrail:</strong> {checkoutGuard.blockingReason}
                  </div>
                )}
              </div>
            </div>
          </Card>

          {/* Gateway Webhook Idempotency Tester */}
          <Card variant="surface" className="p-5 border-[#EADFC8] space-y-4">
            <div className="flex items-center justify-between border-b border-[#EADFC8] pb-3">
              <div className="flex items-center gap-2">
                <Webhook className="w-5 h-5 text-[#C9A24B]" />
                <h3 className="font-serif font-bold text-[#5A4630]">3. Webhook Idempotency</h3>
              </div>
              <Badge variant="gold" size="sm">
                {(processedWebhookEventIds || []).length} Logged
              </Badge>
            </div>
            <p className="text-xs text-[#7A6A55]">
              Replaying identical gateway webhook payloads safely ignores duplicates without mutating order status or creating duplicate invoices.
            </p>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-[#5A4630] font-semibold mb-1">Gateway Event ID</label>
                <input
                  type="text"
                  value={simWebhookEventId}
                  onChange={(e) => setSimWebhookEventId(e.target.value)}
                  className="w-full px-3 py-1.5 bg-white border border-[#EADFC8] rounded text-[#5A4630] font-mono focus:outline-[#C9A24B]"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[#5A4630] font-semibold mb-1">Target Order</label>
                  <select
                    value={simWebhookOrder}
                    onChange={(e) => setSimWebhookOrder(e.target.value)}
                    className="w-full px-2 py-1.5 bg-white border border-[#EADFC8] rounded text-[#5A4630]"
                  >
                    {orders.map((o) => (
                      <option key={o.id} value={o.id}>
                        {o.id} ({formatINR(o.totalAmount)})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[#5A4630] font-semibold mb-1">Payload Amount</label>
                  <input
                    type="number"
                    value={simWebhookAmount}
                    onChange={(e) => setSimWebhookAmount(Number(e.target.value))}
                    className="w-full px-3 py-1.5 bg-white border border-[#EADFC8] rounded text-[#5A4630]"
                  />
                </div>
              </div>

              <Button
                variant="primary"
                size="sm"
                className="w-full"
                onClick={handleTestWebhook}
              >
                Fire Gateway Webhook Payload
              </Button>

              {simWebhookResult && (
                <div
                  className={`p-3 rounded text-[11px] border leading-tight ${
                    simWebhookResult.status === 'Verified'
                      ? 'bg-[#DCE8D5] border-[#A4C997] text-[#2D5A27]'
                      : simWebhookResult.status === 'Duplicate_Ignored'
                      ? 'bg-[#FBE7B8] border-[#E8C26E] text-[#7A5310]'
                      : 'bg-[#F7D4CF] border-[#E89E95] text-[#8C2E24]'
                  }`}
                >
                  <div className="font-bold flex items-center gap-1 mb-1">
                    {simWebhookResult.status === 'Verified' ? (
                      <CheckCircle2 className="w-3.5 h-3.5" />
                    ) : (
                      <AlertTriangle className="w-3.5 h-3.5" />
                    )}
                    Outcome: {simWebhookResult.status}
                  </div>
                  <p>{simWebhookResult.message}</p>
                </div>
              )}
            </div>
          </Card>
        </div>
      )}

      {/* Tab 2: Products (27+ Extended Fields) */}
      {activeTab === 'products' && (
        <Card variant="surface" className="p-0 border-[#EADFC8] overflow-hidden">
          <div className="p-4 bg-[#F8EFD9] border-b border-[#EADFC8] flex justify-between items-center">
            <div>
              <h2 className="font-serif font-bold text-[#5A4630]">Products Catalogue (27+ Extended Fields)</h2>
              <p className="text-xs text-[#7A6A55]">
                Includes HSN, HUID, Hallmark (BIS), Approval State, Min/Max Order Units, Dimensions, and Origin.
              </p>
            </div>
            <Badge variant="gold" size="sm">{products.length} SKUs</Badge>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-[#EADFC8] bg-[#FFFBF3] text-[#5A4630] font-semibold">
                  <th className="py-2.5 px-3">SKU / Model</th>
                  <th className="py-2.5 px-3">Product Name</th>
                  <th className="py-2.5 px-3">HSN Code</th>
                  <th className="py-2.5 px-3">HUID / Hallmark</th>
                  <th className="py-2.5 px-3">Dimensions</th>
                  <th className="py-2.5 px-3">Approval State</th>
                  <th className="py-2.5 px-3">Unit</th>
                  <th className="py-2.5 px-3">Origin</th>
                  <th className="py-2.5 px-3 text-right">Computed Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EADFC8]">
                {products.map((p) => {
                  const calc = calculatePrice(p, rates, pricingConfig);
                  return (
                    <tr key={p.id} className="hover:bg-[#FFFBF3]/80">
                      <td className="py-2.5 px-3 font-mono text-[11px] text-[#7A6A55]">{p.sku}</td>
                      <td className="py-2.5 px-3">
                        <div className="font-medium text-[#5A4630]">{p.name}</div>
                        <div className="text-[10px] text-[#7A6A55]">{p.category} • {p.metal || 'N/A'}</div>
                      </td>
                      <td className="py-2.5 px-3 font-mono">{p.hsn || '71189000'}</td>
                      <td className="py-2.5 px-3">
                        <div className="font-mono text-[11px] font-semibold text-[#5A4630]">{p.huid || '—'}</div>
                        <div className="text-[10px] text-[#7A6A55]">{p.bisReference || 'BIS Hallmark'}</div>
                      </td>
                      <td className="py-2.5 px-3 text-[11px] text-[#7A6A55]">
                        {p.dimensions || '—'}
                      </td>
                      <td className="py-2.5 px-3">
                        <Badge
                          variant={p.approvalState === 'approved' ? 'sage' : p.approvalState === 'draft' ? 'neutral' : 'amber'}
                          size="sm"
                        >
                          {p.approvalState || 'approved'}
                        </Badge>
                      </td>
                      <td className="py-2.5 px-3 text-[11px]">{p.unit || 'g'}</td>
                      <td className="py-2.5 px-3 text-[11px]">{p.origin || 'India'}</td>
                      <td className="py-2.5 px-3 text-right font-bold text-[#5A4630] tabular-nums">
                        {formatINR(calc.total)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Tab 3: Orders & KYC Gating */}
      {activeTab === 'orders' && (
        <Card variant="surface" className="p-0 border-[#EADFC8] overflow-hidden">
          <div className="p-4 bg-[#F8EFD9] border-b border-[#EADFC8] flex justify-between items-center">
            <div>
              <h2 className="font-serif font-bold text-[#5A4630]">Orders & Statutory KYC Verification Status</h2>
              <p className="text-xs text-[#7A6A55]">
                Includes KYC required flag, KYC compliance check, ledger references, and ERP invoice numbers.
              </p>
            </div>
            <Badge variant="gold" size="sm">{orders.length} Orders</Badge>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-[#EADFC8] bg-[#FFFBF3] text-[#5A4630] font-semibold">
                  <th className="py-2.5 px-3">Order ID</th>
                  <th className="py-2.5 px-3">Customer</th>
                  <th className="py-2.5 px-3">Total Amount</th>
                  <th className="py-2.5 px-3">KYC Required / Verified</th>
                  <th className="py-2.5 px-3">Order Status</th>
                  <th className="py-2.5 px-3">Payment</th>
                  <th className="py-2.5 px-3">Locked Price Ref</th>
                  <th className="py-2.5 px-3">Hold Reason</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EADFC8]">
                {orders.map((o) => (
                  <tr key={o.id} className="hover:bg-[#FFFBF3]/80">
                    <td className="py-2.5 px-3 font-mono font-bold text-[#5A4630]">{o.id}</td>
                    <td className="py-2.5 px-3">
                      <div className="font-medium text-[#5A4630]">{o.customerName}</div>
                      <div className="text-[10px] text-[#7A6A55]">{o.customerEmail}</div>
                    </td>
                    <td className="py-2.5 px-3 font-bold text-[#5A4630] tabular-nums">{formatINR(o.totalAmount)}</td>
                    <td className="py-2.5 px-3">
                      <Badge
                        variant={o.kycVerified ? 'sage' : o.kycRequired ? 'amber' : 'neutral'}
                        size="sm"
                      >
                        {o.kycRequired ? (o.kycVerified ? 'Verified' : 'Pending PAN') : 'Under ₹2L'}
                      </Badge>
                    </td>
                    <td className="py-2.5 px-3">
                      <Badge
                        variant={
                          o.status === 'Held' ? 'coral' : o.status === 'Delivered' ? 'sage' : 'gold'
                        }
                        size="sm"
                      >
                        {o.status}
                      </Badge>
                    </td>
                    <td className="py-2.5 px-3">
                      <div className="font-semibold">{o.paymentStatus}</div>
                      <div className="text-[10px] text-[#7A6A55]">{o.paymentMethod}</div>
                    </td>
                    <td className="py-2.5 px-3 font-mono text-[11px] text-[#7A6A55]">{o.lockedPriceRef || 'LEDGER-001'}</td>
                    <td className="py-2.5 px-3 text-[11px] text-[#8C2E24] max-w-xs">
                      {o.holdReason || '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Tab 4: Customers & Statutory Fields */}
      {activeTab === 'customers' && (
        <Card variant="surface" className="p-0 border-[#EADFC8] overflow-hidden">
          <div className="p-4 bg-[#F8EFD9] border-b border-[#EADFC8] flex justify-between items-center">
            <div>
              <h2 className="font-serif font-bold text-[#5A4630]">Customers with Statutory Compliance Fields</h2>
              <p className="text-xs text-[#7A6A55]">
                Includes PAN, GSTIN, DOB, Anniversary, KYC verification status, channel consents, and preferred language.
              </p>
            </div>
            <Badge variant="gold" size="sm">{customers.length} Profiles</Badge>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-[#EADFC8] bg-[#FFFBF3] text-[#5A4630] font-semibold">
                  <th className="py-2.5 px-3">ID / Name</th>
                  <th className="py-2.5 px-3">Contact</th>
                  <th className="py-2.5 px-3">PAN</th>
                  <th className="py-2.5 px-3">GSTIN</th>
                  <th className="py-2.5 px-3">KYC Status</th>
                  <th className="py-2.5 px-3">DOB / Anniversary</th>
                  <th className="py-2.5 px-3">Language</th>
                  <th className="py-2.5 px-3">Consents</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EADFC8]">
                {customers.map((c) => (
                  <tr key={c.id} className="hover:bg-[#FFFBF3]/80">
                    <td className="py-2.5 px-3">
                      <div className="font-bold text-[#5A4630]">{c.name}</div>
                      <div className="font-mono text-[10px] text-[#7A6A55]">{c.id}</div>
                    </td>
                    <td className="py-2.5 px-3">
                      <div>{c.email}</div>
                      <div className="text-[10px] text-[#7A6A55]">{c.phone}</div>
                    </td>
                    <td className="py-2.5 px-3 font-mono font-semibold">{c.pan || '—'}</td>
                    <td className="py-2.5 px-3 font-mono text-[11px]">{c.gstin || '—'}</td>
                    <td className="py-2.5 px-3">
                      <Badge
                        variant={c.kycStatus === 'Verified' ? 'sage' : c.kycStatus === 'Pending' ? 'amber' : 'coral'}
                        size="sm"
                      >
                        {c.kycStatus}
                      </Badge>
                    </td>
                    <td className="py-2.5 px-3 text-[11px] text-[#7A6A55]">
                      <div>DOB: {c.dateOfBirth || '—'}</div>
                      <div>Anniv: {c.anniversary || '—'}</div>
                    </td>
                    <td className="py-2.5 px-3 uppercase text-[11px] font-semibold">{c.preferredLanguage || 'en'}</td>
                    <td className="py-2.5 px-3 text-[10px]">
                      <div className="flex gap-1 flex-wrap">
                        {c.consents?.whatsappUpdates && <span className="px-1 bg-[#DCE8D5] text-[#2D5A27] rounded">WA</span>}
                        {c.consents?.smsAlerts && <span className="px-1 bg-[#DCE8D5] text-[#2D5A27] rounded">SMS</span>}
                        {c.consents?.marketing && <span className="px-1 bg-[#DCE8D5] text-[#2D5A27] rounded">Mktg</span>}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Tab 5: Corporate Quotes & Enquiries */}
      {activeTab === 'corporate' && (
        <div className="space-y-6">
          <Card variant="surface" className="p-0 border-[#EADFC8] overflow-hidden">
            <div className="p-4 bg-[#F8EFD9] border-b border-[#EADFC8] flex justify-between items-center">
              <div>
                <h2 className="font-serif font-bold text-[#5A4630]">Corporate Quotes (B2B Bulk Orders)</h2>
                <p className="text-xs text-[#7A6A55]">
                  Shows quote number, total valuation, custom margin percentage, and maker-checker margin approval status.
                </p>
              </div>
              <Badge variant="gold" size="sm">{corporateQuotes.length} Quotes</Badge>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-[#EADFC8] bg-[#FFFBF3] text-[#5A4630] font-semibold">
                    <th className="py-2.5 px-3">Quote ID / Number</th>
                    <th className="py-2.5 px-3">Enquiry Ref</th>
                    <th className="py-2.5 px-3">Units</th>
                    <th className="py-2.5 px-3">Total Value</th>
                    <th className="py-2.5 px-3">Custom Margin</th>
                    <th className="py-2.5 px-3">Margin Approval</th>
                    <th className="py-2.5 px-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#EADFC8]">
                  {corporateQuotes.map((cq) => (
                    <tr key={cq.id} className="hover:bg-[#FFFBF3]/80">
                      <td className="py-2.5 px-3 font-mono font-bold text-[#5A4630]">
                        <div>{cq.id}</div>
                        <div className="text-[10px] text-[#7A6A55]">{cq.quoteNumber}</div>
                      </td>
                      <td className="py-2.5 px-3 font-mono text-[11px] text-[#7A6A55]">{cq.enquiryId}</td>
                      <td className="py-2.5 px-3 font-bold">{cq.items.reduce((acc, i) => acc + i.quantity, 0)} pcs</td>
                      <td className="py-2.5 px-3 font-bold text-[#5A4630] tabular-nums">{formatINR(cq.total)}</td>
                      <td className="py-2.5 px-3 font-semibold text-[#C9A24B]">{cq.marginPercent}%</td>
                      <td className="py-2.5 px-3">
                        <Badge
                          variant={cq.isMarginApproved ? 'sage' : 'amber'}
                          size="sm"
                        >
                          {cq.isMarginApproved ? 'Approved' : 'Pending Maker-Checker'}
                        </Badge>
                      </td>
                      <td className="py-2.5 px-3">
                        <Badge variant="neutral" size="sm">{cq.status}</Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>

          <Card variant="surface" className="p-0 border-[#EADFC8] overflow-hidden">
            <div className="p-4 bg-[#F8EFD9] border-b border-[#EADFC8] flex justify-between items-center">
              <div>
                <h2 className="font-serif font-bold text-[#5A4630]">Corporate Inbound Enquiries</h2>
                <p className="text-xs text-[#7A6A55]">Pipeline of corporate gifting and custom minted coin enquiries.</p>
              </div>
              <Badge variant="gold" size="sm">{corporateEnquiries.length} Enquiries</Badge>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-[#EADFC8] bg-[#FFFBF3] text-[#5A4630] font-semibold">
                    <th className="py-2.5 px-3">Enquiry ID</th>
                    <th className="py-2.5 px-3">Company & Contact</th>
                    <th className="py-2.5 px-3">Quantity</th>
                    <th className="py-2.5 px-3">Budget Per Recipient</th>
                    <th className="py-2.5 px-3">Occasion</th>
                    <th className="py-2.5 px-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#EADFC8]">
                  {corporateEnquiries.map((enq) => (
                    <tr key={enq.id} className="hover:bg-[#FFFBF3]/80">
                      <td className="py-2.5 px-3 font-mono font-bold text-[#5A4630]">{enq.id}</td>
                      <td className="py-2.5 px-3">
                        <div className="font-semibold text-[#5A4630]">{enq.companyName}</div>
                        <div className="text-[10px] text-[#7A6A55]">{enq.contactPerson} ({enq.email})</div>
                      </td>
                      <td className="py-2.5 px-3 font-bold">{enq.quantity} pcs</td>
                      <td className="py-2.5 px-3 tabular-nums font-semibold">{formatINR(enq.budgetPerRecipient)}</td>
                      <td className="py-2.5 px-3">{enq.occasion}</td>
                      <td className="py-2.5 px-3">
                        <Badge variant="sage" size="sm">{enq.status}</Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      )}

      {/* Tab 6: Offers & Margin Floor */}
      {activeTab === 'offers' && (
        <Card variant="surface" className="p-0 border-[#EADFC8] overflow-hidden">
          <div className="p-4 bg-[#F8EFD9] border-b border-[#EADFC8] flex justify-between items-center">
            <div>
              <h2 className="font-serif font-bold text-[#5A4630]">Promotional Offers with Bullion Margin Guardrails</h2>
              <p className="text-xs text-[#7A6A55]">
                Offers configure strict statutory margin guardrail percentages to prevent selling bullion below cost.
              </p>
            </div>
            <Badge variant="gold" size="sm">{offers.length} Active Offers</Badge>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-[#EADFC8] bg-[#FFFBF3] text-[#5A4630] font-semibold">
                  <th className="py-2.5 px-3">Code / Name</th>
                  <th className="py-2.5 px-3">Discount</th>
                  <th className="py-2.5 px-3">Min Order Value</th>
                  <th className="py-2.5 px-3">Bullion Margin Floor</th>
                  <th className="py-2.5 px-3">Redemption Limit</th>
                  <th className="py-2.5 px-3">Valid Window</th>
                  <th className="py-2.5 px-3">Approval Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EADFC8]">
                {offers.map((off) => (
                  <tr key={off.id} className="hover:bg-[#FFFBF3]/80">
                    <td className="py-2.5 px-3">
                      <div className="font-mono font-bold text-[#C9A24B]">{off.code}</div>
                      <div className="text-[10px] text-[#7A6A55]">{off.name}</div>
                    </td>
                    <td className="py-2.5 px-3 font-semibold">
                      {off.type === 'percent' ? `${off.discountValue}%` : formatINR(off.discountValue)}
                    </td>
                    <td className="py-2.5 px-3 tabular-nums font-medium">{formatINR(off.minOrderValue)}</td>
                    <td className="py-2.5 px-3 font-bold text-[#5A4630]">
                      {((off.marginGuardrailPercent || 0.005) * 100).toFixed(1)}% floor
                    </td>
                    <td className="py-2.5 px-3 text-[11px] text-[#7A6A55]">
                      {off.usedCount} / {off.usageLimitTotal} (max {off.usageLimitPerCustomer}/cust)
                    </td>
                    <td className="py-2.5 px-3 text-[10px] text-[#7A6A55]">
                      {off.startDate} to {off.endDate}
                    </td>
                    <td className="py-2.5 px-3">
                      <Badge variant={off.approvalStatus === 'Active' ? 'sage' : 'amber'} size="sm">
                        {off.approvalStatus}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Tab 7: Support Tickets & Communication Events */}
      {activeTab === 'tickets_comms' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card variant="surface" className="p-0 border-[#EADFC8] overflow-hidden">
            <div className="p-4 bg-[#F8EFD9] border-b border-[#EADFC8] flex justify-between items-center">
              <div>
                <h3 className="font-serif font-bold text-[#5A4630]">Support Tickets ({supportTickets.length})</h3>
                <p className="text-xs text-[#7A6A55]">Customer service tickets and resolution tracking.</p>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-[#EADFC8] bg-[#FFFBF3] text-[#5A4630] font-semibold">
                    <th className="py-2.5 px-3">Ticket ID</th>
                    <th className="py-2.5 px-3">Customer</th>
                    <th className="py-2.5 px-3">Issue Type / Subject</th>
                    <th className="py-2.5 px-3">Priority</th>
                    <th className="py-2.5 px-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#EADFC8]">
                  {supportTickets.map((t) => (
                    <tr key={t.id} className="hover:bg-[#FFFBF3]/80">
                      <td className="py-2.5 px-3 font-mono font-bold text-[#5A4630]">{t.id}</td>
                      <td className="py-2.5 px-3 font-medium">{t.customerName}</td>
                      <td className="py-2.5 px-3">
                        <div className="font-semibold text-[#5A4630]">{t.subject}</div>
                        <div className="text-[10px] text-[#7A6A55]">{t.issueType}</div>
                      </td>
                      <td className="py-2.5 px-3">
                        <Badge variant={t.priority === 'High' ? 'coral' : t.priority === 'Medium' ? 'amber' : 'neutral'} size="sm">
                          {t.priority}
                        </Badge>
                      </td>
                      <td className="py-2.5 px-3">
                        <Badge variant={t.status === 'Resolved' ? 'sage' : 'amber'} size="sm">{t.status}</Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>

          <Card variant="surface" className="p-0 border-[#EADFC8] overflow-hidden">
            <div className="p-4 bg-[#F8EFD9] border-b border-[#EADFC8] flex justify-between items-center">
              <div>
                <h3 className="font-serif font-bold text-[#5A4630]">Communication Log ({communicationEvents.length})</h3>
                <p className="text-xs text-[#7A6A55]">Multi-channel transactional messages (WhatsApp, SMS, Email, Push).</p>
              </div>
            </div>
            <div className="overflow-x-auto max-h-[400px]">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-[#EADFC8] bg-[#FFFBF3] text-[#5A4630] font-semibold">
                    <th className="py-2.5 px-3">Channel</th>
                    <th className="py-2.5 px-3">Recipient</th>
                    <th className="py-2.5 px-3">Event Type / Template</th>
                    <th className="py-2.5 px-3">Status</th>
                    <th className="py-2.5 px-3">Timestamp</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#EADFC8]">
                  {communicationEvents.map((c) => (
                    <tr key={c.id} className="hover:bg-[#FFFBF3]/80">
                      <td className="py-2 px-3 font-semibold text-[#C9A24B] uppercase text-[10px]">{c.channel}</td>
                      <td className="py-2 px-3 text-[11px] font-mono">{c.recipientContact}</td>
                      <td className="py-2 px-3 text-[11px] text-[#5A4630] truncate max-w-xs">{c.eventType} • {c.template}</td>
                      <td className="py-2 px-3">
                        <Badge variant={c.deliveryStatus === 'Delivered' ? 'sage' : 'neutral'} size="sm">{c.deliveryStatus}</Badge>
                      </td>
                      <td className="py-2 px-3 text-[10px] text-[#7A6A55]">{c.timestamp.slice(11, 19)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      )}

      {/* Tab 8: Maker-Checker Dual Approvals */}
      {activeTab === 'approvals' && (
        <Card variant="surface" className="p-0 border-[#EADFC8] overflow-hidden">
          <div className="p-4 bg-[#F8EFD9] border-b border-[#EADFC8] flex justify-between items-center">
            <div>
              <h2 className="font-serif font-bold text-[#5A4630]">Maker-Checker Dual Governance Queue</h2>
              <p className="text-xs text-[#7A6A55]">
                Strict segregation of duty across 6 approval types: price_override, high_value_refund, stock_adjustment, compliance_edit, low_margin_quote, credit_terms.
              </p>
            </div>
            <Badge variant="gold" size="sm">{approvals.length} Approval Items</Badge>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-[#EADFC8] bg-[#FFFBF3] text-[#5A4630] font-semibold">
                  <th className="py-2.5 px-3">Approval ID</th>
                  <th className="py-2.5 px-3">Approval Type</th>
                  <th className="py-2.5 px-3">Target Entity</th>
                  <th className="py-2.5 px-3">Maker (Requester)</th>
                  <th className="py-2.5 px-3">Checker (Approver)</th>
                  <th className="py-2.5 px-3">Governance Rule</th>
                  <th className="py-2.5 px-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EADFC8]">
                {approvals.map((app) => (
                  <tr key={app.id} className="hover:bg-[#FFFBF3]/80">
                    <td className="py-2.5 px-3 font-mono font-bold text-[#5A4630]">{app.id}</td>
                    <td className="py-2.5 px-3 font-semibold text-[#5A4630]">{app.type}</td>
                    <td className="py-2.5 px-3 font-mono text-[11px] text-[#7A6A55]">{app.entityId}</td>
                    <td className="py-2.5 px-3">
                      <div className="font-medium text-[#5A4630]">{app.requester}</div>
                      <div className="text-[10px] text-[#7A6A55]">{app.reason}</div>
                    </td>
                    <td className="py-2.5 px-3">
                      {app.approver ? (
                        <>
                          <div className="font-medium text-[#5A4630]">{app.approver}</div>
                          <div className="text-[10px] text-[#7A6A55]">{app.resolvedAt?.slice(0, 10)}</div>
                        </>
                      ) : (
                        <span className="text-[#C9A24B] font-semibold">Awaiting Checker</span>
                      )}
                    </td>
                    <td className="py-2.5 px-3 text-[11px] text-[#7A6A55]">
                      {app.requester === app.approver ? (
                        <span className="text-[#8C2E24] font-bold">VIOLATION: Self-approved</span>
                      ) : (
                        <span className="text-[#2D5A27]">Dual-Authorized (Maker ≠ Checker)</span>
                      )}
                    </td>
                    <td className="py-2.5 px-3">
                      <Badge variant={app.status === 'Approved' ? 'sage' : app.status === 'Pending' ? 'amber' : 'coral'} size="sm">
                        {app.status}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Tab 9: Pricing & Order Ledgers */}
      {activeTab === 'ledgers' && (
        <div className="space-y-6">
          <Card variant="surface" className="p-0 border-[#EADFC8] overflow-hidden">
            <div className="p-4 bg-[#F8EFD9] border-b border-[#EADFC8] flex justify-between items-center">
              <div>
                <h2 className="font-serif font-bold text-[#5A4630]">Pricing Ledger (Immutable Spot Audit Trail)</h2>
                <p className="text-xs text-[#7A6A55]">
                  Records every quoted spot rate, formula version, making charge, and GST breakdown for audit reconciliation.
                </p>
              </div>
              <Badge variant="gold" size="sm">{pricingLedger.length} Records</Badge>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-[#EADFC8] bg-[#FFFBF3] text-[#5A4630] font-semibold">
                    <th className="py-2.5 px-3">Ledger ID</th>
                    <th className="py-2.5 px-3">Source & Metal</th>
                    <th className="py-2.5 px-3">Base Rate</th>
                    <th className="py-2.5 px-3">Markup %</th>
                    <th className="py-2.5 px-3">Premium</th>
                    <th className="py-2.5 px-3">Packaging/Ins</th>
                    <th className="py-2.5 px-3">GST</th>
                    <th className="py-2.5 px-3">Locked Price</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#EADFC8]">
                  {pricingLedger.map((pl) => (
                    <tr key={pl.id} className="hover:bg-[#FFFBF3]/80">
                      <td className="py-2.5 px-3 font-mono font-bold text-[#5A4630]">{pl.id}</td>
                      <td className="py-2.5 px-3 font-mono text-[11px] text-[#7A6A55]">{pl.source} • {pl.metal}</td>
                      <td className="py-2.5 px-3 tabular-nums">{formatINR(pl.baseRate)}/g</td>
                      <td className="py-2.5 px-3 tabular-nums">{pl.markupPercent}%</td>
                      <td className="py-2.5 px-3 tabular-nums">{formatINR(pl.premiumCharges)}</td>
                      <td className="py-2.5 px-3 tabular-nums">{formatINR(pl.packagingInsurance)}</td>
                      <td className="py-2.5 px-3 tabular-nums">{formatINR(pl.gst)}</td>
                      <td className="py-2.5 px-3 tabular-nums font-bold text-[#5A4630]">{pl.lockedPrice ? formatINR(pl.lockedPrice) : '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>

          <Card variant="surface" className="p-0 border-[#EADFC8] overflow-hidden">
            <div className="p-4 bg-[#F8EFD9] border-b border-[#EADFC8] flex justify-between items-center">
              <div>
                <h2 className="font-serif font-bold text-[#5A4630]">Order Financial Ledger</h2>
                <p className="text-xs text-[#7A6A55]">Double-entry financial journal tracking settlements, receivables, and taxes.</p>
              </div>
              <Badge variant="gold" size="sm">{orderLedger.length} Entries</Badge>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-[#EADFC8] bg-[#FFFBF3] text-[#5A4630] font-semibold">
                    <th className="py-2.5 px-3">Journal Entry</th>
                    <th className="py-2.5 px-3">Order Ref</th>
                    <th className="py-2.5 px-3">Webhook Ref</th>
                    <th className="py-2.5 px-3">Invoice Number</th>
                    <th className="py-2.5 px-3">Shipment Tracking</th>
                    <th className="py-2.5 px-3">Reservation Delta</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#EADFC8]">
                  {orderLedger.map((ol) => (
                    <tr key={ol.id} className="hover:bg-[#FFFBF3]/80">
                      <td className="py-2.5 px-3 font-mono font-bold text-[#5A4630]">{ol.id}</td>
                      <td className="py-2.5 px-3 font-mono text-[11px]">{ol.orderId} ({ol.orderNumber})</td>
                      <td className="py-2.5 px-3 font-mono text-[11px] text-[#7A6A55]">{ol.paymentWebhookId || '—'}</td>
                      <td className="py-2.5 px-3 font-mono text-[11px] font-semibold">{ol.invoiceNumber || '—'}</td>
                      <td className="py-2.5 px-3 font-mono text-[11px]">{ol.shipmentTracking || '—'}</td>
                      <td className="py-2.5 px-3 font-bold text-[#5A4630]">{ol.stockReservationDelta} units</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};
