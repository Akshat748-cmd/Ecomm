import React, { useState } from 'react';
import { useAppStore } from '../store';
import { useSEO } from '../lib/useSEO';
import { formatINR } from '../lib/pricing';
import { Card } from '../components/Card';
import { Badge } from '../components/Badge';
import { Button } from '../components/Button';
import { Modal } from '../components/Modal';
import {
  ShieldAlert,
  AlertTriangle,
  RefreshCw,
  Sliders,
  Activity,
  KeyRound,
  CheckCircle2,
  Info,
} from 'lucide-react';

export const AdminRatesPage: React.FC = () => {
  useSEO({
    title: 'Bullion Rates & Pricing Engine',
    description: 'Real-time market feed ingestion, failover simulation, manual rate overrides, and formula cost components editor.',
    canonicalPath: '/admin/rates',
  });

  const {
    rates,
    providerState,
    isFeedStale,
    pricingConfig,
    priceHistory,
    makerCheckerRequests,
    adminUser,
    activeRole,
    setProviderState,
    applyRateOverride,
    updateCostComponents,
    createMakerCheckerRequest,
    approveMakerCheckerRequest,
    rejectMakerCheckerRequest,
  } = useAppStore();

  const currentActor = adminUser?.name || 'Vikram Sharma';
  const canManageRates = activeRole === 'Super Admin' || activeRole === 'Pricing' || activeRole === 'Finance';

  // Manual Override Form State
  const [overrideMetal, setOverrideMetal] = useState<'gold24k' | 'silver999'>('gold24k');
  const [overrideValue, setOverrideValue] = useState<number>(rates.gold24k + 50);
  const [overrideReason, setOverrideReason] = useState('Dhanteras evening volatility spread buffer');
  const [overrideStatusMessage, setOverrideStatusMessage] = useState<string | null>(null);
  const [overrideError, setOverrideError] = useState<string | null>(null);

  // Re-auth Modal state for approving override
  const [reauthModalOpen, setReauthModalOpen] = useState(false);
  const [pendingApprovalId, setPendingApprovalId] = useState<string | null>(null);
  const [reauthPassword, setReauthPassword] = useState('');
  const [reauthError, setReauthError] = useState<string | null>(null);

  // Cost Components Editor State
  const [makingBullion, setMakingBullion] = useState(pricingConfig.costComponents.makingPercentBullion * 100);
  const [makingJewellery, setMakingJewellery] = useState(pricingConfig.costComponents.makingPercentJewellery * 100);
  const [assayCost, setAssayCost] = useState(pricingConfig.costComponents.assayCertificateCost);
  const [packagingCost, setPackagingCost] = useState(pricingConfig.costComponents.packagingCost);
  const [insuranceCost, setInsuranceCost] = useState(pricingConfig.costComponents.insuranceCost);
  const [marginBullion, setMarginBullion] = useState(pricingConfig.costComponents.marginPercentBullion * 100);
  const [marginJewellery, setMarginJewellery] = useState(pricingConfig.costComponents.marginPercentJewellery * 100);
  const [roundingRule, setRoundingRule] = useState<'round' | 'ceil' | 'floor'>(pricingConfig.costComponents.roundingRule);
  const [costSavedNotice, setCostSavedNotice] = useState<string | null>(null);

  // Provider Failover Handlers
  const handleSimulatePrimaryFail = () => {
    setProviderState('primaryFailed');
  };

  const handleSimulateBothDown = () => {
    setProviderState('bothDown');
  };

  const handleRestoreFeeds = () => {
    setProviderState('ok');
  };

  // Submit Override Request (Maker)
  const handleInitiateOverride = (e: React.FormEvent) => {
    e.preventDefault();
    if (overrideValue <= 0) return;

    createMakerCheckerRequest(
      `Manual Spot Rate Override (${overrideMetal === 'gold24k' ? 'Gold 24K' : 'Silver 999'}: ₹${overrideValue}/g)`,
      'Rates and Pricing',
      `Proposed overriding ${overrideMetal} rate from ₹${rates[overrideMetal]}/g to ₹${overrideValue}/g. Reason: ${overrideReason}`,
      currentActor
    );

    setOverrideStatusMessage('Override submitted to Maker-Checker queue. Awaiting independent officer approval.');
    setOverrideError(null);
    setTimeout(() => setOverrideStatusMessage(null), 5000);
  };

  // Trigger Approval (opens re-auth modal)
  const handleStartApproval = (reqId: string) => {
    setOverrideError(null);
    const req = makerCheckerRequests.find((r) => r.id === reqId);
    if (!req) return;

    // Maker-checker check: Initiator cannot approve!
    if (req.initiator.toLowerCase().includes(currentActor.toLowerCase()) || currentActor.toLowerCase().includes(req.initiator.toLowerCase())) {
      setOverrideError(`Maker-Checker Violation: You cannot approve an override you initiated (${req.initiator}). Another officer must approve.`);
      return;
    }

    setPendingApprovalId(reqId);
    setReauthPassword('');
    setReauthError(null);
    setReauthModalOpen(true);
  };

  // Confirm Re-auth & Execute Override Approval
  const handleConfirmReauthApproval = (e: React.FormEvent) => {
    e.preventDefault();
    if (reauthPassword.trim().length < 4) {
      setReauthError('Invalid credentials. Password must be at least 4 characters.');
      return;
    }

    if (!pendingApprovalId) return;

    const req = makerCheckerRequests.find((r) => r.id === pendingApprovalId);
    if (!req) return;

    const result = approveMakerCheckerRequest(pendingApprovalId, currentActor);
    if (!result.success) {
      setReauthError(result.error || 'Approval failed.');
      return;
    }

    // Parse metal and rate from request title/details
    const isSilver = req.title.toLowerCase().includes('silver');
    const metal = isSilver ? 'silver999' : 'gold24k';
    const match = req.details.match(/to ₹(\d+)/);
    const newRate = match ? Number(match[1]) : overrideValue;

    // Apply live override immediately to store!
    applyRateOverride(metal, newRate, currentActor);

    setReauthModalOpen(false);
    setPendingApprovalId(null);
    setOverrideStatusMessage(`Override approved and applied immediately to live storefront! (${metal}: ₹${newRate}/g)`);
    setTimeout(() => setOverrideStatusMessage(null), 5000);
  };

  // Save Cost Components
  const handleSaveCostComponents = (e: React.FormEvent) => {
    e.preventDefault();
    updateCostComponents(
      {
        makingPercentBullion: makingBullion / 100,
        makingPercentJewellery: makingJewellery / 100,
        assayCertificateCost: Number(assayCost),
        packagingCost: Number(packagingCost),
        insuranceCost: Number(insuranceCost),
        marginPercentBullion: marginBullion / 100,
        marginPercentJewellery: marginJewellery / 100,
        roundingRule,
      },
      currentActor
    );

    setCostSavedNotice(`Pricing parameters saved successfully! Formula version incremented to ${pricingConfig.formulaVersion}. Storefront prices recalculated live.`);
    setTimeout(() => setCostSavedNotice(null), 5000);
  };

  // Rate overrides from maker checker requests
  const pendingOverrides = makerCheckerRequests.filter(
    (r) => r.module === 'Rates and Pricing'
  );

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* 1. Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#EADFC8] pb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Badge variant="gold" size="sm">Phase 7 Pricing Engine</Badge>
            <span className="text-xs uppercase tracking-wider text-[#7A6A55] font-semibold">Institutional Bullion Engine</span>
          </div>
          <h1 className="font-serif text-3xl font-bold text-[#5A4630]">
            Rates Management & Dynamic Pricing Engine
          </h1>
          <p className="text-xs sm:text-sm text-[#7A6A55] mt-1">
            Real-time socket feeds, dual-failover simulations, manual spot overrides, and live formula cost components.
          </p>
        </div>

        {/* Formula Version Capsule */}
        <div className="flex items-center gap-3">
          <div className="p-2.5 px-4 bg-white border border-[#EADFC8] rounded-xl text-xs space-y-0.5 shadow-xs">
            <div className="text-[10px] text-[#7A6A55] font-semibold uppercase">Formula Version</div>
            <div className="font-mono font-bold text-sm text-[#5A4630] flex items-center gap-1.5">
              <span>{pricingConfig.formulaVersion}</span>
              <Badge variant="sage" size="sm">Active</Badge>
            </div>
          </div>
        </div>
      </div>

      {/* Statutory / Operational Client Notes Banner */}
      <div className="p-4 bg-[#FFFBF3] border border-[#C9A24B]/60 rounded-xl text-xs text-[#5A4630] space-y-1 shadow-xs">
        <div className="flex items-center gap-2 font-bold">
          <Info className="w-4 h-4 text-[#C9A24B]" />
          <span>Operational Architecture Notes:</span>
        </div>
        <div className="text-[#7A6A55] pl-6 space-y-0.5 leading-relaxed">
          <div>• <strong>Override Approver:</strong> Override approver is an automated process based on live rates (client note).</div>
          <div>• <strong>Integration Status:</strong> Open: override approver and store/web rate synchronization.</div>
        </div>
      </div>

      {/* Failover Alert Banners */}
      {providerState === 'primaryFailed' && (
        <div className="p-4 bg-[#FAF1DB] border border-[#E8D4A2] rounded-xl text-xs text-[#7A5310] flex items-center justify-between gap-3 animate-in fade-in duration-200">
          <div className="flex items-center gap-2.5">
            <AlertTriangle className="w-5 h-5 text-[#C9A24B] shrink-0" />
            <div>
              <strong>Using Backup Provider:</strong> Primary MCX Socket disconnected. BullionAPI Global Enterprise has seamlessly assumed rate leadership.
            </div>
          </div>
          <Button variant="secondary" size="sm" onClick={handleRestoreFeeds} className="bg-white">
            Restore MCX Primary
          </Button>
        </div>
      )}

      {providerState === 'bothDown' && (
        <div className={`p-4 rounded-xl text-xs flex items-center justify-between gap-3 border animate-in fade-in duration-200 ${
          isFeedStale
            ? 'bg-[#FDF0EE] border-[#F1B5AC] text-[#9E3624]'
            : 'bg-[#FAF1DB] border-[#E8D4A2] text-[#7A5310]'
        }`}>
          <div className="flex items-center gap-2.5">
            <AlertTriangle className="w-5 h-5 text-[#9E3624] shrink-0" />
            <div>
              <strong>{isFeedStale ? 'FEED STALE ALERT:' : 'ALL RATE PROVIDERS DOWN:'}</strong>{' '}
              {isFeedStale
                ? 'Feed marked STALE after 20 seconds. Storefront rate strip turned amber and Get Quote button is paused.'
                : 'Primary and backup feeds disconnected. Stale threshold will trigger in 20 seconds if not restored.'}
            </div>
          </div>
          <Button variant="primary" size="sm" onClick={handleRestoreFeeds}>
            Restore Normal Feeds
          </Button>
        </div>
      )}

      {overrideStatusMessage && (
        <div className="p-4 bg-[#DCE8D5] border border-[#A4C997] rounded-xl text-xs text-[#2D5A27] flex items-center gap-2 animate-in fade-in duration-200">
          <CheckCircle2 className="w-5 h-5 shrink-0" />
          <span className="font-medium">{overrideStatusMessage}</span>
        </div>
      )}

      {overrideError && (
        <div className="p-4 bg-[#FDF0EE] border-2 border-[#F1B5AC] rounded-xl text-xs text-[#9E3624] flex items-start gap-2.5 animate-in fade-in duration-200">
          <ShieldAlert className="w-5 h-5 shrink-0 mt-0.5" />
          <div>
            <strong>Dual-Custody Enforcement:</strong> {overrideError}
          </div>
        </div>
      )}

      {costSavedNotice && (
        <div className="p-4 bg-[#DCE8D5] border border-[#A4C997] rounded-xl text-xs text-[#2D5A27] flex items-center gap-2 animate-in fade-in duration-200">
          <CheckCircle2 className="w-5 h-5 shrink-0" />
          <span className="font-medium">{costSavedNotice}</span>
        </div>
      )}

      {/* 2. PROVIDERS & INGESTION TELEMETRY TABLE */}
      <Card variant="surface" className="p-6 border-[#EADFC8] space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#EADFC8]">
          <div>
            <h2 className="font-serif text-lg font-bold text-[#5A4630] flex items-center gap-2">
              <Activity className="w-5 h-5 text-[#C9A24B]" />
              Market Rate Providers & Socket Ingestion
            </h2>
            <p className="text-xs text-[#7A6A55]">
              Real-time spot price connectivity, failover endpoints, and simulated disconnection triggers.
            </p>
          </div>

          {/* Failover Switch Controls */}
          <div className="flex items-center gap-2 flex-wrap">
            <Button
              variant={providerState === 'primaryFailed' ? 'primary' : 'outline'}
              size="sm"
              onClick={handleSimulatePrimaryFail}
              title="Simulate MCX socket disconnect"
            >
              Simulate Primary Failure
            </Button>
            <Button
              variant={providerState === 'bothDown' ? 'primary' : 'outline'}
              size="sm"
              onClick={handleSimulateBothDown}
              title="Disconnect all providers (triggers 20s stale failsafe)"
            >
              Simulate Both Down
            </Button>
            {providerState !== 'ok' && (
              <Button
                variant="secondary"
                size="sm"
                onClick={handleRestoreFeeds}
                className="bg-white"
                leftIcon={<RefreshCw className="w-3.5 h-3.5 text-[#2D5A27]" />}
              >
                Restore Normal Feeds
              </Button>
            )}
          </div>
        </div>

        {/* Providers Table */}
        <div className="overflow-x-auto rounded-xl border border-[#EADFC8]">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#F8EFD9] text-[#5A4630] border-b border-[#EADFC8]">
              <tr>
                <th className="p-3">Provider Tier</th>
                <th className="p-3">Gateway Name</th>
                <th className="p-3">Simulated Ingestion Endpoint</th>
                <th className="p-3">Protocol / Heartbeat</th>
                <th className="p-3">Status</th>
                <th className="p-3">Last Heartbeat</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EADFC8] bg-white">
              {/* Primary Provider */}
              <tr className="hover:bg-[#FFFBF3]">
                <td className="p-3">
                  <Badge variant="gold" size="sm">Primary</Badge>
                </td>
                <td className="p-3 font-bold text-[#5A4630]">MCX India Precious Metals Gateway</td>
                <td className="p-3 font-mono text-[11px] text-[#7A6A55]">wss://feed.mcxindia.internal/bullion/v2</td>
                <td className="p-3 font-mono text-[11px]">WebSocket / 500ms</td>
                <td className="p-3">
                  {providerState === 'ok' ? (
                    <Badge variant="sage" size="sm">Active / Healthy</Badge>
                  ) : (
                    <Badge variant="coral" size="sm">Disconnected</Badge>
                  )}
                </td>
                <td className="p-3 text-[11px] text-[#7A6A55]">
                  {providerState === 'ok' ? new Date().toLocaleTimeString() : 'Packet timeout'}
                </td>
              </tr>

              {/* Backup Provider */}
              <tr className="hover:bg-[#FFFBF3]">
                <td className="p-3">
                  <Badge variant="neutral" size="sm">Backup</Badge>
                </td>
                <td className="p-3 font-bold text-[#5A4630]">BullionAPI Global Enterprise</td>
                <td className="p-3 font-mono text-[11px] text-[#7A6A55]">https://api.bullionapi.internal/v1/spot</td>
                <td className="p-3 font-mono text-[11px]">REST HTTPS / 1000ms</td>
                <td className="p-3">
                  {providerState === 'primaryFailed' ? (
                    <Badge variant="sage" size="sm">Active (Assumed Feed)</Badge>
                  ) : providerState === 'bothDown' ? (
                    <Badge variant="coral" size="sm">Disconnected</Badge>
                  ) : (
                    <Badge variant="neutral" size="sm">Standby / Hot Sync</Badge>
                  )}
                </td>
                <td className="p-3 text-[11px] text-[#7A6A55]">
                  {providerState !== 'bothDown' ? new Date().toLocaleTimeString() : 'Packet timeout'}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </Card>

      {/* 3. LIVE RATE DATA TABLE */}
      <Card variant="surface" className="p-6 border-[#EADFC8] space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-[#EADFC8]">
          <div>
            <h2 className="font-serif text-lg font-bold text-[#5A4630]">
              Normalized Spot Rate Matrix
            </h2>
            <p className="text-xs text-[#7A6A55]">
              Real-time commodities pricing normalized across purity benchmarks and weight denominations.
            </p>
          </div>
          <span className="text-xs text-[#7A6A55]">
            Freshness: <strong className={isFeedStale ? 'text-[#9E3624]' : 'text-[#2D5A27]'}>{isFeedStale ? 'STALE (Feeds Down)' : 'LIVE (< 5s)'}</strong>
          </span>
        </div>

        <div className="overflow-x-auto rounded-xl border border-[#EADFC8]">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#F8EFD9] text-[#5A4630] border-b border-[#EADFC8]">
              <tr>
                <th className="p-3">Precious Commodity</th>
                <th className="p-3">Currency</th>
                <th className="p-3">Purity Basis</th>
                <th className="p-3">Normalized Value (Per Gram)</th>
                <th className="p-3">Standard Bullion Lot</th>
                <th className="p-3">Last Ingestion</th>
                <th className="p-3">Freshness</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EADFC8] bg-white">
              {/* Gold 24K */}
              <tr className="hover:bg-[#FFFBF3]">
                <td className="p-3 font-serif font-bold text-[#5A4630]">Gold 24K Sovereign</td>
                <td className="p-3 font-mono">INR (₹)</td>
                <td className="p-3">999.9 Fine Purity</td>
                <td className="p-3 font-mono font-bold text-sm text-[#5A4630]">
                  {formatINR(rates.gold24k)}
                </td>
                <td className="p-3 text-[#7A6A55]">10g = <strong>{formatINR(rates.gold24k * 10)}</strong></td>
                <td className="p-3 font-mono text-[11px] text-[#7A6A55]">{new Date(rates.lastUpdated).toLocaleTimeString()}</td>
                <td className="p-3">
                  <Badge variant={isFeedStale ? 'coral' : 'sage'} size="sm">
                    {isFeedStale ? 'Stale' : 'Live Fresh'}
                  </Badge>
                </td>
              </tr>

              {/* Gold 22K */}
              <tr className="hover:bg-[#FFFBF3]">
                <td className="p-3 font-serif font-bold text-[#5A4630]">Gold 22K Hallmark</td>
                <td className="p-3 font-mono">INR (₹)</td>
                <td className="p-3">916 Hallmark (91.67%)</td>
                <td className="p-3 font-mono font-bold text-sm text-[#5A4630]">
                  {formatINR(rates.gold22k)}
                </td>
                <td className="p-3 text-[#7A6A55]">10g = <strong>{formatINR(rates.gold22k * 10)}</strong></td>
                <td className="p-3 font-mono text-[11px] text-[#7A6A55]">{new Date(rates.lastUpdated).toLocaleTimeString()}</td>
                <td className="p-3">
                  <Badge variant={isFeedStale ? 'coral' : 'sage'} size="sm">
                    {isFeedStale ? 'Stale' : 'Live Fresh'}
                  </Badge>
                </td>
              </tr>

              {/* Silver 999 */}
              <tr className="hover:bg-[#FFFBF3]">
                <td className="p-3 font-serif font-bold text-[#5A4630]">Silver 999 Bullion</td>
                <td className="p-3 font-mono">INR (₹)</td>
                <td className="p-3">999.0 Fine Purity</td>
                <td className="p-3 font-mono font-bold text-sm text-[#5A4630]">
                  {formatINR(rates.silver999)}
                </td>
                <td className="p-3 text-[#7A6A55]">1 kg Bar = <strong>{formatINR(rates.silver999 * 1000)}</strong></td>
                <td className="p-3 font-mono text-[11px] text-[#7A6A55]">{new Date(rates.lastUpdated).toLocaleTimeString()}</td>
                <td className="p-3">
                  <Badge variant={isFeedStale ? 'coral' : 'sage'} size="sm">
                    {isFeedStale ? 'Stale' : 'Live Fresh'}
                  </Badge>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </Card>

      {/* 4. MANUAL OVERRIDE & MAKER-CHECKER SECTION */}
      <Card variant="surface" className="p-6 border-[#EADFC8] space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#EADFC8]">
          <div>
            <div className="flex items-center gap-2">
              <KeyRound className="w-5 h-5 text-[#C9A24B]" />
              <h2 className="font-serif text-lg font-bold text-[#5A4630]">
                Manual Rate Override (Dual-Custody Maker-Checker)
              </h2>
            </div>
            <p className="text-xs text-[#7A6A55]">
              Emergency spot price overrides require two officers: Maker proposes, Checker re-authenticates and approves.
            </p>
          </div>

          <Badge variant="gold" size="sm">Maker-Checker Enforced</Badge>
        </div>

        {/* Override Form */}
        <form onSubmit={handleInitiateOverride} className="p-4 bg-white border border-[#EADFC8] rounded-xl space-y-4 text-xs">
          <div className="font-serif font-bold text-sm text-[#5A4630]">
            Propose Manual Rate Override (Maker Step)
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div>
              <label className="block text-[#5A4630] font-semibold mb-1">Target Metal</label>
              <select
                value={overrideMetal}
                onChange={(e) => {
                  const m = e.target.value as 'gold24k' | 'silver999';
                  setOverrideMetal(m);
                  setOverrideValue(rates[m] + (m === 'gold24k' ? 50 : 2));
                }}
                className="w-full px-3 py-2 bg-[#FFFBF3] border border-[#EADFC8] rounded-lg text-[#5A4630] focus:ring-1 focus:ring-[#C9A24B]"
              >
                <option value="gold24k">Gold 24K (Current: ₹{rates.gold24k}/g)</option>
                <option value="silver999">Silver 999 (Current: ₹{rates.silver999}/g)</option>
              </select>
            </div>

            <div>
              <label className="block text-[#5A4630] font-semibold mb-1">Proposed Spot Rate (₹/g)</label>
              <input
                type="number"
                value={overrideValue}
                onChange={(e) => setOverrideValue(Number(e.target.value))}
                min={1}
                required
                className="w-full px-3 py-2 bg-[#FFFBF3] border border-[#EADFC8] rounded-lg text-[#5A4630] font-mono font-bold focus:ring-1 focus:ring-[#C9A24B]"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-[#5A4630] font-semibold mb-1">Justification / Reason</label>
              <input
                type="text"
                value={overrideReason}
                onChange={(e) => setOverrideReason(e.target.value)}
                placeholder="State reason for overriding exchange market spot..."
                required
                className="w-full px-3 py-2 bg-[#FFFBF3] border border-[#EADFC8] rounded-lg text-[#5A4630] focus:ring-1 focus:ring-[#C9A24B]"
              />
            </div>
          </div>

          <div className="flex justify-between items-center pt-2 border-t border-[#EADFC8]/60">
            <span className="text-[11px] text-[#7A6A55]">
              Initiator: <strong>{currentActor}</strong> ({activeRole})
            </span>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              disabled={!canManageRates}
            >
              Submit Override for Dual Approval
            </Button>
          </div>
        </form>

        {/* Pending Overrides Queue */}
        <div className="space-y-3">
          <div className="text-xs font-bold text-[#5A4630] uppercase tracking-wider">
            Pending Rate Override Approvals ({pendingOverrides.filter((o) => o.status === 'Pending').length})
          </div>

          {pendingOverrides.length === 0 ? (
            <div className="p-4 bg-white border border-[#EADFC8] rounded-xl text-center text-xs text-[#7A6A55]">
              No rate override requests currently pending.
            </div>
          ) : (
            pendingOverrides.map((req) => {
              const isMaker =
                req.initiator.toLowerCase().includes(currentActor.toLowerCase()) ||
                currentActor.toLowerCase().includes(req.initiator.toLowerCase());

              return (
                <div
                  key={req.id}
                  className="p-4 bg-white border border-[#EADFC8] rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                >
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-[#5A4630]">{req.title}</span>
                      <Badge
                        variant={req.status === 'Approved' ? 'sage' : req.status === 'Rejected' ? 'coral' : 'amber'}
                        size="sm"
                      >
                        {req.status}
                      </Badge>
                    </div>
                    <div className="text-[11px] text-[#7A6A55]">
                      Initiated by: <strong>{req.initiator}</strong> • {new Date(req.createdAt).toLocaleString()}
                    </div>
                    <p className="text-[11px] text-[#7A6A55] pt-0.5">{req.details}</p>
                  </div>

                  {req.status === 'Pending' && (
                    <div className="flex items-center gap-2 shrink-0">
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => handleStartApproval(req.id)}
                        disabled={!canManageRates}
                        title={isMaker ? 'Maker-Checker Violation: Initiator cannot approve' : 'Review & Approve'}
                      >
                        Approve (Re-Auth)
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => rejectMakerCheckerRequest(req.id, currentActor, 'Declined by Checker')}
                        disabled={!canManageRates}
                      >
                        Reject
                      </Button>
                    </div>
                  )}

                  {req.status !== 'Pending' && (
                    <div className="text-right text-[11px] text-[#7A6A55]">
                      <div>Checker: <strong>{req.approver || 'Super Admin'}</strong></div>
                      {req.resolvedAt && <div>{new Date(req.resolvedAt).toLocaleTimeString()}</div>}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </Card>

      {/* 5. PRICING MODEL PER CATEGORY */}
      <Card variant="surface" className="p-6 border-[#EADFC8] space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-[#EADFC8]">
          <div>
            <h2 className="font-serif text-lg font-bold text-[#5A4630]">
              Category Pricing Models & Valuation Strategy
            </h2>
            <p className="text-xs text-[#7A6A55]">
              Dynamic live metal formula vs Fixed appraisal & Hybrid presentation models.
            </p>
          </div>
          <Badge variant="gold" size="sm">Precious Matrix</Badge>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          {/* Gold & Silver */}
          <div className="p-4 bg-white border border-[#EADFC8] rounded-xl space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-[#5A4630]">Gold & Silver Bullion</span>
              <Badge variant="gold" size="sm">Dynamic (Live Spot)</Badge>
            </div>
            <p className="text-[11px] text-[#7A6A55] leading-relaxed">
              Price = (Fine Weight × Live Spot Rate) + Making Charges + Assay Cert + Protective Packaging + 100% Transit Insurance + 3% GST. Recalculates every 5 seconds.
            </p>
            <div className="text-[10px] text-[#2D5A27] font-semibold pt-1">
              ✓ 10-Minute Cryptographic Quote Lock Eligible
            </div>
          </div>

          {/* Gemstones & Rudraksha */}
          <div className="p-4 bg-white border border-[#EADFC8] rounded-xl space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-[#5A4630]">Gemstones & Rudraksha</span>
              <Badge variant="neutral" size="sm">Fixed Catalog Price</Badge>
            </div>
            <p className="text-[11px] text-[#7A6A55] leading-relaxed">
              Price = Natural Rarity Carat / Bead Valuation + Independent Lab Certification (GIA/IGI) + Sacred Consecration Casket + 3% GST. Immune to bullion spot movement.
            </p>
            <div className="text-[10px] text-[#7A6A55] font-semibold pt-1">
              ✓ Instant Add-to-Cart without Rate Lock required
            </div>
          </div>

          {/* Jewellery & Gifting */}
          <div className="p-4 bg-white border border-[#EADFC8] rounded-xl space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-[#5A4630]">Fine Jewellery & Gifting</span>
              <Badge variant="sage" size="sm">Hybrid Model</Badge>
            </div>
            <p className="text-[11px] text-[#7A6A55] leading-relaxed">
              Price = Live Metal Grammage Snapshot (22K Hallmark / 999 Fine) + Artisan Handcrafted Making % + Fixed Presentation Trunk + 3% GST.
            </p>
            <div className="text-[10px] text-[#2D5A27] font-semibold pt-1">
              ✓ 10-Minute Rate Lock Eligible on checkout
            </div>
          </div>
        </div>
      </Card>

      {/* 6. COST COMPONENTS EDITOR & GUARDRAILS */}
      <Card variant="surface" className="p-6 border-[#EADFC8] space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#EADFC8]">
          <div>
            <div className="flex items-center gap-2">
              <Sliders className="w-5 h-5 text-[#C9A24B]" />
              <h2 className="font-serif text-lg font-bold text-[#5A4630]">
                Live Cost Components Editor & Pricing Formula Guardrails
              </h2>
            </div>
            <p className="text-xs text-[#7A6A55]">
              Adjust making fees, packaging, and margins. Modifying parameters immediately recalculates storefront prices live and increments formula version.
            </p>
          </div>

          <Badge variant="sage" size="sm">Formula: {pricingConfig.formulaVersion}</Badge>
        </div>

        <form onSubmit={handleSaveCostComponents} className="space-y-6 text-xs">
          {/* Inputs Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 bg-white border border-[#EADFC8] rounded-xl space-y-1.5">
              <label className="block text-[#5A4630] font-semibold">
                Bullion Making Fee (%)
              </label>
              <input
                type="number"
                step="0.1"
                min="0"
                max="20"
                value={makingBullion}
                onChange={(e) => setMakingBullion(Number(e.target.value))}
                className="w-full px-3 py-2 bg-[#FFFBF3] border border-[#EADFC8] rounded-lg text-[#5A4630] font-bold"
              />
              <span className="text-[10px] text-[#7A6A55]">Coins & Bars minting allowance</span>
            </div>

            <div className="p-4 bg-white border border-[#EADFC8] rounded-xl space-y-1.5">
              <label className="block text-[#5A4630] font-semibold">
                Jewellery Making Fee (%)
              </label>
              <input
                type="number"
                step="0.5"
                min="0"
                max="35"
                value={makingJewellery}
                onChange={(e) => setMakingJewellery(Number(e.target.value))}
                className="w-full px-3 py-2 bg-[#FFFBF3] border border-[#EADFC8] rounded-lg text-[#5A4630] font-bold"
              />
              <span className="text-[10px] text-[#7A6A55]">Hallmark 22K artisan fabrication</span>
            </div>

            <div className="p-4 bg-white border border-[#EADFC8] rounded-xl space-y-1.5">
              <label className="block text-[#5A4630] font-semibold">
                Assay Certificate Fee (₹)
              </label>
              <input
                type="number"
                min="0"
                value={assayCost}
                onChange={(e) => setAssayCost(Number(e.target.value))}
                className="w-full px-3 py-2 bg-[#FFFBF3] border border-[#EADFC8] rounded-lg text-[#5A4630] font-bold"
              />
              <span className="text-[10px] text-[#7A6A55]">BIS Hallmark & NABL assay certicard</span>
            </div>

            <div className="p-4 bg-white border border-[#EADFC8] rounded-xl space-y-1.5">
              <label className="block text-[#5A4630] font-semibold">
                Luxury Velvet Packaging (₹)
              </label>
              <input
                type="number"
                min="0"
                value={packagingCost}
                onChange={(e) => setPackagingCost(Number(e.target.value))}
                className="w-full px-3 py-2 bg-[#FFFBF3] border border-[#EADFC8] rounded-lg text-[#5A4630] font-bold"
              />
              <span className="text-[10px] text-[#7A6A55]">Tamper-proof seal capsule & velvet box</span>
            </div>

            <div className="p-4 bg-white border border-[#EADFC8] rounded-xl space-y-1.5">
              <label className="block text-[#5A4630] font-semibold">
                Armoured Transit Insurance (₹)
              </label>
              <input
                type="number"
                min="0"
                value={insuranceCost}
                onChange={(e) => setInsuranceCost(Number(e.target.value))}
                className="w-full px-3 py-2 bg-[#FFFBF3] border border-[#EADFC8] rounded-lg text-[#5A4630] font-bold"
              />
              <span className="text-[10px] text-[#7A6A55]">100% Lloyd's policy transit cover</span>
            </div>

            <div className="p-4 bg-white border border-[#EADFC8] rounded-xl space-y-1.5">
              <label className="block text-[#5A4630] font-semibold">
                Bullion Margin Spread (%)
              </label>
              <input
                type="number"
                step="0.1"
                min="1.0"
                max="10.0"
                value={marginBullion}
                onChange={(e) => setMarginBullion(Number(e.target.value))}
                className="w-full px-3 py-2 bg-[#FFFBF3] border border-[#EADFC8] rounded-lg text-[#5A4630] font-bold"
              />
              <span className="text-[10px] text-[#7A6A55]">Guardrail: 1.0% Min – 10.0% Max</span>
            </div>

            <div className="p-4 bg-white border border-[#EADFC8] rounded-xl space-y-1.5">
              <label className="block text-[#5A4630] font-semibold">
                Jewellery Margin Spread (%)
              </label>
              <input
                type="number"
                step="0.5"
                min="1.0"
                max="25.0"
                value={marginJewellery}
                onChange={(e) => setMarginJewellery(Number(e.target.value))}
                className="w-full px-3 py-2 bg-[#FFFBF3] border border-[#EADFC8] rounded-lg text-[#5A4630] font-bold"
              />
              <span className="text-[10px] text-[#7A6A55]">Guardrail: 1.0% Min – 25.0% Max</span>
            </div>

            <div className="p-4 bg-white border border-[#EADFC8] rounded-xl space-y-1.5">
              <label className="block text-[#5A4630] font-semibold">
                Calculation Rounding Rule
              </label>
              <select
                value={roundingRule}
                onChange={(e) => setRoundingRule(e.target.value as any)}
                className="w-full px-3 py-2 bg-[#FFFBF3] border border-[#EADFC8] rounded-lg text-[#5A4630] font-bold"
              >
                <option value="round">Math Round (Nearest Rupee)</option>
                <option value="ceil">Ceil (Round Up)</option>
                <option value="floor">Floor (Round Down)</option>
              </select>
              <span className="text-[10px] text-[#7A6A55]">Final consumer price rounding</span>
            </div>
          </div>

          {/* Statutory Tax & HSN Reference Strip */}
          <div className="p-3.5 bg-white border border-[#EADFC8] rounded-xl flex items-center justify-between text-xs text-[#7A6A55] flex-wrap gap-2">
            <div>
              <strong>Statutory Tax:</strong> 3.0% GST (CGST 1.5% + SGST 1.5%) • <strong>HSN 7108</strong> Gold • <strong>HSN 7106</strong> Silver • <strong>HSN 7103</strong> Gemstones
            </div>
            <div className="text-[11px] text-[#2D5A27] font-semibold">
              ✓ Automated Legal Metrology & Tax Invoice Synchronized
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <Button
              type="submit"
              variant="primary"
              size="md"
              disabled={!canManageRates}
              leftIcon={<CheckCircle2 className="w-4 h-4" />}
            >
              Save Parameters & Recalculate Store Prices Live
            </Button>
          </div>
        </form>

        {/* 7. PRICE HISTORY TABLE */}
        <div className="pt-4 border-t border-[#EADFC8] space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-serif text-sm font-bold text-[#5A4630]">
              Pricing Formula Adjustment History
            </h3>
            <span className="text-xs text-[#7A6A55]">Audit trail of parameter shifts</span>
          </div>

          <div className="overflow-x-auto rounded-xl border border-[#EADFC8]">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F8EFD9] text-[#5A4630] border-b border-[#EADFC8]">
                <tr>
                  <th className="p-3">Formula Version</th>
                  <th className="p-3">Effective Timestamp</th>
                  <th className="p-3">Authorizing Officer</th>
                  <th className="p-3">Cost Adjustments Applied</th>
                  <th className="p-3">Lifecycle State</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EADFC8] bg-white">
                {priceHistory.map((row) => (
                  <tr key={row.id} className="hover:bg-[#FFFBF3]">
                    <td className="p-3 font-mono font-bold text-[#5A4630]">{row.version}</td>
                    <td className="p-3 font-mono text-[11px] text-[#7A6A55]">
                      {new Date(row.timestamp).toLocaleString()}
                    </td>
                    <td className="p-3 font-bold text-[#5A4630]">{row.actor}</td>
                    <td className="p-3 text-[11px] text-[#7A6A55] font-mono">{row.changes}</td>
                    <td className="p-3">
                      <Badge variant={row.status === 'Active' ? 'sage' : 'neutral'} size="sm">
                        {row.status}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </Card>

      {/* 8. RE-AUTHENTICATION MODAL FOR SENSITIVE OVERRIDE APPROVAL */}
      <Modal
        isOpen={reauthModalOpen}
        onClose={() => {
          setReauthModalOpen(false);
          setPendingApprovalId(null);
        }}
        title="Authorize Manual Rate Override"
        maxWidth="md"
      >
        <form onSubmit={handleConfirmReauthApproval} className="space-y-4 text-xs">
          <div className="p-3 bg-[#FAF1DB] border border-[#E8D4A2] rounded-xl text-xs text-[#7A5310] flex items-start gap-2.5">
            <ShieldAlert className="w-4 h-4 text-[#C9A24B] shrink-0 mt-0.5" />
            <div>
              <strong>High-Privilege Bullion Override:</strong> Approving this request will modify live consumer storefront spot rates immediately and write a cryptographic entry to the immutable audit trail.
            </div>
          </div>

          <div>
            <label className="block text-[#5A4630] font-semibold mb-1">
              Checker Security Passphrase
            </label>
            <input
              type="password"
              value={reauthPassword}
              onChange={(e) => setReauthPassword(e.target.value)}
              placeholder="Enter security passphrase"
              autoFocus
              required
              className="w-full px-3 py-2 bg-white border border-[#EADFC8] rounded-lg text-[#5A4630] focus:ring-1 focus:ring-[#C9A24B]"
            />
          </div>

          {reauthError && (
            <div className="p-2 bg-[#FDF0EE] text-[#9E3624] text-[11px] rounded border border-[#F1B5AC]">
              {reauthError}
            </div>
          )}

          <div className="pt-2 flex justify-end gap-2 border-t border-[#EADFC8]">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                setReauthModalOpen(false);
                setPendingApprovalId(null);
              }}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              leftIcon={<CheckCircle2 className="w-3.5 h-3.5" />}
            >
              Confirm Re-Auth & Apply Live Override
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
