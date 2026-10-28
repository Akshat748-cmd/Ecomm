import React, { useState } from 'react';
import {
  Sliders,
  ShieldCheck,
  RefreshCw,
  Clock,
  Sparkles,
  Database,
  AlertTriangle,
  CheckCircle2,
  Download,
  Building,
  Coins,
  Lock,
  Layers,
  ArrowRight,
} from 'lucide-react';
import { useAppStore } from '../store';
import { formatINR } from '../lib/pricing';
import { Link } from 'react-router-dom';

export const AdminSettingsPage: React.FC = () => {
  const {
    demoMode,
    setDemoMode,
    quoteLockSeconds,
    setQuoteLockSeconds,
    sessionTimeoutSeconds,
    kycThreshold,
    pricingConfig,
    resetDemoData,
    events,
    auditLogs,
    orders,
    products,
    logAudit,
    adminUser,
  } = useAppStore();

  const [customQuoteLock, setCustomQuoteLock] = useState<number>(quoteLockSeconds);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [resetSuccessMessage, setResetSuccessMessage] = useState<string | null>(null);
  const [savedNotice, setSavedNotice] = useState<string | null>(null);

  const actor = adminUser?.name || 'Super Admin';

  const handleQuoteLockChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseInt(e.target.value, 10);
    if (!isNaN(val) && val >= 30 && val <= 3600) {
      setCustomQuoteLock(val);
      setQuoteLockSeconds(val);
      logAudit(actor, 'SETTINGS_UPDATE', 'System Settings', `QuoteLock: ${quoteLockSeconds}s`, `QuoteLock: ${val}s`);
      showSaveNotice(`Quote lock duration updated to ${val} seconds (${Math.round(val / 60)} min).`);
    }
  };

  const handleDemoToggle = () => {
    const next = !demoMode;
    setDemoMode(next);
    logAudit(actor, 'DEMO_MODE_TOGGLED', 'System Settings', `DemoMode: ${demoMode}`, `DemoMode: ${next}`);
    showSaveNotice(
      next
        ? 'Demo Mode ENABLED: Quote lock reduced to 60s and session timeout to 60s for rapid reviewer evaluation.'
        : 'Demo Mode DISABLED: Restored standard production timeouts (10m quote lock, 15m session timeout).'
    );
  };

  const handleResetData = () => {
    resetDemoData();
    setShowResetConfirm(false);
    logAudit(actor, 'DATABASE_RESET', 'System Settings', 'Store modified', 'Reset to initial mock state');
    setResetSuccessMessage('Demo state, orders, catalogue, and telemetry have been reset to factory baseline.');
    setTimeout(() => {
      setResetSuccessMessage(null);
    }, 4000);
  };

  const handleClearCache = () => {
    try {
      localStorage.removeItem('aurum_commerce_storage_v2');
      showSaveNotice('Local cache flushed. Reloading fresh store state from baseline.');
      setTimeout(() => {
        window.location.reload();
      }, 800);
    } catch {
      showSaveNotice('Session cache cleared.');
    }
  };

  const handleExportConfig = () => {
    const configExport = {
      exportedAt: new Date().toISOString(),
      brand: 'AURUM & CO',
      demoMode,
      quoteLockSeconds,
      sessionTimeoutSeconds,
      kycThreshold,
      gstPercent: pricingConfig.costComponents.gstPercent,
      baseMakingCharges: pricingConfig.costComponents.makingPercentBullion,
      stats: {
        totalProducts: products.length,
        totalOrders: orders.length,
        totalEvents: events.length,
        totalAuditLogs: auditLogs.length,
      },
    };

    const blob = new Blob([JSON.stringify(configExport, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `aurum-platform-settings-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showSaveNotice('Platform configuration exported to JSON file.');
  };

  const showSaveNotice = (msg: string) => {
    setSavedNotice(msg);
    setTimeout(() => {
      setSavedNotice(null);
    }, 4000);
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-16">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#EADFC8] pb-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#C9A24B] mb-1">
            <Sliders className="w-4 h-4" />
            <span>Platform Governance</span>
          </div>
          <h1 className="text-2xl lg:text-3xl font-serif text-[#5A4630] font-bold">
            Global Settings & Runtime Controls
          </h1>
          <p className="text-sm text-[#7A6A55] mt-1">
            Configure quote lock lifecycles, demo evaluation mode, statutory thresholds, and platform cache.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleExportConfig}
            className="flex items-center gap-2 px-4 py-2 border border-[#EADFC8] rounded text-xs font-medium text-[#5A4630] hover:bg-[#F4ECE1] transition-colors shadow-sm"
          >
            <Download className="w-3.5 h-3.5 text-[#C9A24B]" />
            Export Config
          </button>
          <button
            onClick={() => setShowResetConfirm(true)}
            className="flex items-center gap-2 px-4 py-2 bg-red-50 border border-red-200 text-red-700 rounded text-xs font-medium hover:bg-red-100 transition-colors shadow-sm"
          >
            <RefreshCw className="w-3.5 h-3.5 text-red-600" />
            Reset Demo Data
          </button>
        </div>
      </div>

      {/* Notifications */}
      {savedNotice && (
        <div className="bg-[#FAF5EC] border-l-4 border-[#C9A24B] p-4 rounded-r shadow-sm flex items-center justify-between animate-fadeIn">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-[#C9A24B] shrink-0" />
            <p className="text-xs font-medium text-[#5A4630]">{savedNotice}</p>
          </div>
          <button
            onClick={() => setSavedNotice(null)}
            className="text-xs text-[#7A6A55] hover:text-[#5A4630]"
          >
            ✕
          </button>
        </div>
      )}

      {resetSuccessMessage && (
        <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-md shadow-sm flex items-center gap-3">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <p className="text-xs font-medium text-emerald-800">{resetSuccessMessage}</p>
        </div>
      )}

      {/* Demo Mode Master Callout */}
      <div
        className={`p-6 rounded-lg border transition-all ${
          demoMode
            ? 'bg-amber-50/70 border-amber-300 shadow-sm'
            : 'bg-white border-[#EADFC8] shadow-sm'
        }`}
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <span
                className={`px-2.5 py-0.5 text-[11px] font-bold uppercase rounded-full ${
                  demoMode ? 'bg-amber-200 text-amber-900' : 'bg-stone-100 text-stone-600'
                }`}
              >
                {demoMode ? 'Demo Mode Active' : 'Production Mode'}
              </span>
              <h2 className="text-lg font-serif font-bold text-[#5A4630] flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#C9A24B]" />
                Rapid Reviewer Demo Speed
              </h2>
            </div>
            <p className="text-xs text-[#7A6A55] max-w-2xl leading-relaxed">
              When Demo Mode is toggled on, the bullion price lock is compressed from standard 10 minutes (600s) to <strong>60 seconds</strong>, and the admin session idle timeout is set to <strong>60 seconds</strong>. This allows reviewers to experience real-time expiry, automatic requoting, and MFA re-authentication flows instantly without waiting.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={demoMode}
                onChange={handleDemoToggle}
                className="sr-only peer"
                id="demo-mode-toggle"
              />
              <div className="w-14 h-7 bg-stone-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[4px] after:bg-white after:border-stone-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-[#C9A24B]"></div>
            </label>
            <span className="text-xs font-semibold text-[#5A4630]">
              {demoMode ? 'Enabled' : 'Disabled'}
            </span>
          </div>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Section 1: Quote Lock & Engine Lifecycle */}
        <div className="bg-white border border-[#EADFC8] rounded-lg p-6 shadow-sm space-y-6">
          <div className="flex items-center gap-2 border-b border-[#F4ECE1] pb-3">
            <Clock className="w-5 h-5 text-[#C9A24B]" />
            <h3 className="font-serif font-bold text-[#5A4630] text-base">
              Quote Lock Lifecycle Configuration
            </h3>
          </div>

          <div className="space-y-4">
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-xs font-semibold text-[#5A4630]">
                  Bullion Price Lock Window
                </label>
                <span className="text-xs font-mono font-bold text-[#C9A24B] bg-[#FAF5EC] px-2 py-0.5 rounded border border-[#EADFC8]">
                  {quoteLockSeconds}s ({Math.round(quoteLockSeconds / 60)} min)
                </span>
              </div>
              <input
                type="range"
                min="30"
                max="1800"
                step="30"
                value={customQuoteLock}
                onChange={handleQuoteLockChange}
                disabled={demoMode}
                className="w-full accent-[#C9A24B] cursor-pointer disabled:opacity-50"
              />
              <div className="flex justify-between text-[10px] text-[#7A6A55] mt-1 font-mono">
                <span>30s (Min)</span>
                <span>600s (Default: 10m)</span>
                <span>1800s (30m Max)</span>
              </div>
              {demoMode && (
                <p className="text-[11px] text-amber-700 bg-amber-50 p-2 rounded mt-2 border border-amber-200">
                  ⚠️ Slider is locked to 60s while Demo Mode is active. Disable Demo Mode above to set custom durations.
                </p>
              )}
            </div>

            <div className="p-4 bg-[#FAF5EC] rounded border border-[#EADFC8] text-xs space-y-2">
              <h4 className="font-bold text-[#5A4630] flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-[#C9A24B]" />
                Fixed-Lock Assurance Mechanics
              </h4>
              <p className="text-[#7A6A55] leading-relaxed">
                During this window, the customer’s checkout rate per gram is immutable. If the timer reaches 0:00 before payment confirmation, the cart requires one-click requote with the latest MCX/LBMA spot feed to eliminate merchant inventory slippage.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <div className="border border-[#EADFC8] p-3 rounded">
                <span className="text-[11px] text-[#7A6A55] block">Admin Session Idle</span>
                <span className="text-sm font-bold font-mono text-[#5A4630]">
                  {sessionTimeoutSeconds}s ({Math.round(sessionTimeoutSeconds / 60)} min)
                </span>
              </div>
              <div className="border border-[#EADFC8] p-3 rounded">
                <span className="text-[11px] text-[#7A6A55] block">Tick Refresh Interval</span>
                <span className="text-sm font-bold font-mono text-[#5A4630]">3,000 ms</span>
              </div>
            </div>
          </div>
        </div>

        {/* Section 2: Brand & Statutory Standards */}
        <div className="bg-white border border-[#EADFC8] rounded-lg p-6 shadow-sm space-y-6">
          <div className="flex items-center gap-2 border-b border-[#F4ECE1] pb-3">
            <Building className="w-5 h-5 text-[#C9A24B]" />
            <h3 className="font-serif font-bold text-[#5A4630] text-base">
              Brand Identity & Statutory Compliance
            </h3>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-[11px] font-semibold text-[#7A6A55] block uppercase tracking-wider mb-1">
                  Brand Name Constant
                </label>
                <div className="p-2.5 bg-[#FAF5EC] rounded border border-[#EADFC8] text-xs font-serif font-bold text-[#5A4630]">
                  AURUM & CO.
                </div>
              </div>
              <div>
                <label className="text-[11px] font-semibold text-[#7A6A55] block uppercase tracking-wider mb-1">
                  Currency Standard
                </label>
                <div className="p-2.5 bg-[#FAF5EC] rounded border border-[#EADFC8] text-xs font-mono font-bold text-[#5A4630]">
                  INR (₹) - 2 Decimals
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-[11px] font-semibold text-[#7A6A55] block uppercase tracking-wider mb-1">
                  Bullion GST Rate
                </label>
                <div className="p-2.5 bg-[#FAF5EC] rounded border border-[#EADFC8] text-xs font-mono font-bold text-[#5A4630]">
                  {(pricingConfig.costComponents.gstPercent * 100).toFixed(0)}% (Statutory)
                </div>
              </div>
              <div>
                <label className="text-[11px] font-semibold text-[#7A6A55] block uppercase tracking-wider mb-1">
                  High-Value KYC Threshold
                </label>
                <div className="p-2.5 bg-[#FAF5EC] rounded border border-[#EADFC8] text-xs font-mono font-bold text-[#5A4630]">
                  {formatINR(kycThreshold)} (PAN Mandate)
                </div>
              </div>
            </div>

            <div className="p-4 bg-[#FAF5EC] rounded border border-[#EADFC8] text-xs space-y-2">
              <h4 className="font-bold text-[#5A4630] flex items-center gap-1.5">
                <Coins className="w-3.5 h-3.5 text-[#C9A24B]" />
                Tax Calculation Standard
              </h4>
              <p className="text-[#7A6A55] leading-relaxed">
                Taxes are calculated as 3% GST on (Spot Metal Weight Value + Making Charges + Premium). Rounding is strictly applied to 2 decimal places using server-side bankers rounding.
              </p>
            </div>
          </div>
        </div>

        {/* Section 3: Data Integrity & Storage Management */}
        <div className="bg-white border border-[#EADFC8] rounded-lg p-6 shadow-sm space-y-6">
          <div className="flex items-center gap-2 border-b border-[#F4ECE1] pb-3">
            <Database className="w-5 h-5 text-[#C9A24B]" />
            <h3 className="font-serif font-bold text-[#5A4630] text-base">
              Storage & Cache Flush
            </h3>
          </div>

          <div className="space-y-4">
            <p className="text-xs text-[#7A6A55] leading-relaxed">
              Platform state is persisted across browser sessions via versioned client storage (<code className="bg-[#FAF5EC] px-1 py-0.5 rounded text-[#5A4630] font-mono">aurum_commerce_storage_v2</code>). You can flush cached session states or re-initialize to test cold start behaviors.
            </p>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 bg-[#FAF5EC] rounded border border-[#EADFC8]">
                <span className="text-[#7A6A55] block text-[11px]">Audit Rows Recorded</span>
                <span className="font-bold font-mono text-[#5A4630] text-sm">{auditLogs.length}</span>
              </div>
              <div className="p-3 bg-[#FAF5EC] rounded border border-[#EADFC8]">
                <span className="text-[#7A6A55] block text-[11px]">Telemetry Events</span>
                <span className="font-bold font-mono text-[#5A4630] text-sm">{events.length}</span>
              </div>
            </div>

            <div className="pt-2 flex flex-col sm:flex-row gap-3">
              <button
                onClick={handleClearCache}
                className="flex items-center justify-center gap-2 px-4 py-2.5 border border-[#EADFC8] hover:bg-[#FAF5EC] text-[#5A4630] rounded text-xs font-semibold transition-colors"
              >
                <RefreshCw className="w-3.5 h-3.5 text-[#C9A24B]" />
                Flush Browser Storage & Reload
              </button>
              <Link
                to="/admin/audit"
                className="flex items-center justify-center gap-2 px-4 py-2.5 bg-[#FAF5EC] hover:bg-[#F4ECE1] text-[#5A4630] rounded text-xs font-semibold transition-colors border border-[#EADFC8]"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-[#C9A24B]" />
                View Audit Trail
              </Link>
            </div>
          </div>
        </div>

        {/* Section 4: System Architecture & Integrations Quick Link */}
        <div className="bg-white border border-[#EADFC8] rounded-lg p-6 shadow-sm space-y-6">
          <div className="flex items-center gap-2 border-b border-[#F4ECE1] pb-3">
            <Layers className="w-5 h-5 text-[#C9A24B]" />
            <h3 className="font-serif font-bold text-[#5A4630] text-base">
              Platform & Microservices Topology
            </h3>
          </div>

          <div className="space-y-4 text-xs">
            <p className="text-[#7A6A55] leading-relaxed">
              Explore the end-to-end multi-tier microservice architecture, push notification dispatchers, enterprise ERP & Logistics connector status, and live QA Test Suite runner in the Platform Integrations console.
            </p>

            <div className="p-3.5 bg-[#FAF5EC] rounded border border-[#EADFC8] space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-[#7A6A55]">Microservices Status</span>
                <span className="text-emerald-700 font-semibold flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  5 / 5 Operational
                </span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-[#7A6A55]">Enterprise Gateways</span>
                <span className="text-emerald-700 font-semibold">4 Connected (1 Idempotent)</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-[#7A6A55]">QA Regression Suites</span>
                <span className="text-[#C9A24B] font-semibold">21 Automated Tests</span>
              </div>
            </div>

            <Link
              to="/admin/platform"
              className="inline-flex items-center justify-center gap-2 w-full py-2.5 bg-[#5A4630] hover:bg-[#463624] text-white rounded text-xs font-semibold transition-colors shadow-sm"
            >
              Open Platform Integrations & QA Console
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>

      {/* Reset Confirmation Modal */}
      {showResetConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 animate-fadeIn">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6 border border-[#EADFC8] space-y-4">
            <div className="flex items-center gap-3 text-red-600">
              <AlertTriangle className="w-6 h-6 shrink-0" />
              <h3 className="font-serif font-bold text-lg text-[#5A4630]">
                Confirm Demo Data Reset
              </h3>
            </div>

            <p className="text-xs text-[#7A6A55] leading-relaxed">
              This action will reset all modified orders, product inventory counts, quotes, mock support tickets, and pricing parameters back to their factory demo baseline.
            </p>

            <div className="bg-red-50 border border-red-200 rounded p-3 text-xs text-red-800">
              ⚠️ Any newly created orders or products during your testing session will be replaced by initial demo sets.
            </div>

            <div className="flex items-center justify-end gap-3 pt-3">
              <button
                onClick={() => setShowResetConfirm(false)}
                className="px-4 py-2 border border-[#EADFC8] rounded text-xs font-medium text-[#5A4630] hover:bg-[#FAF5EC] transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleResetData}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded text-xs font-semibold transition-colors shadow-sm"
              >
                Yes, Reset All Data
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
