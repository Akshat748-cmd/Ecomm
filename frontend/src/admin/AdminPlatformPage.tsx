import React, { useState } from 'react';
import { useAppStore } from '../store';
import { useSEO } from '../lib/useSEO';
import { Card } from '../components/Card';
import { Badge } from '../components/Badge';
import { Button } from '../components/Button';
import {
  Cpu,
  Server,
  Layers,
  ShieldCheck,
  Activity,
  CheckCircle2,
  Send,
  Bell,
  Smartphone,
  Globe,
  Lock,
  RefreshCw,
  Play,
  Check,
  X,
  Sparkles,
  Clock,
} from 'lucide-react';
import { maskTextPII } from '../lib/masking';

interface QaCheckItem {
  id: string;
  name: string;
  category: 'Core Pricing' | 'Custody & Inventory' | 'Security & Auth' | 'Integrations';
  status: 'passed' | 'failed' | 'pending';
  lastRun?: string;
  details: string;
  isProposed?: boolean;
}

const INITIAL_QA_CHECKS: QaCheckItem[] = [
  {
    id: 'qa-1',
    name: 'Cross-Channel Quote Consistency',
    category: 'Core Pricing',
    status: 'passed',
    lastRun: 'Just now',
    details: 'Verifies matching spot formulas across web, mobile, and administrative quote engines.',
  },
  {
    id: 'qa-2',
    name: 'Rate-Change Real-Time Ingestion',
    category: 'Core Pricing',
    status: 'passed',
    lastRun: 'Just now',
    details: 'MCX Mumbai socket ticks push updates every 5 seconds to active quote locks.',
  },
  {
    id: 'qa-3',
    name: 'Stale Feed Failsafe & Fixed-Rate Handling',
    category: 'Core Pricing',
    status: 'passed',
    lastRun: 'Just now',
    details: 'Outage exceeding 20 seconds pauses new quote generation and turns UI amber.',
  },
  {
    id: 'qa-4',
    name: 'Expired Quote Auto-Release',
    category: 'Custody & Inventory',
    status: 'passed',
    lastRun: 'Just now',
    details: 'Unpaid quote locks automatically release physical bullion back to the separate online pool.',
  },
  {
    id: 'qa-5',
    name: 'Requote Acceptance & Delta Check',
    category: 'Core Pricing',
    status: 'passed',
    lastRun: 'Just now',
    details: 'Expired quotes requote against live spot rate with statutory customer confirmation.',
  },
  {
    id: 'qa-6',
    name: 'Statutory Tax & MRP Compliance (HSN 7108)',
    category: 'Core Pricing',
    status: 'passed',
    lastRun: 'Just now',
    details: 'Validates 3% GST split (1.5% CGST + 1.5% SGST or 3% IGST) across all precious articles.',
  },
  {
    id: 'qa-7',
    name: 'Zero-Overselling Concurrency Protection',
    category: 'Custody & Inventory',
    status: 'passed',
    lastRun: 'Just now',
    details: 'Simultaneous checkout holds reject requests exceeding central vault on-hand reserves.',
  },
  {
    id: 'qa-8',
    name: 'Gateway Duplicate Webhook Idempotency',
    category: 'Security & Auth',
    status: 'passed',
    lastRun: 'Just now',
    details: 'Replayed transaction webhooks are recognized by transaction ID and ignored without double-crediting.',
  },
  {
    id: 'qa-9',
    name: 'Idle Session Timeout Recovery',
    category: 'Security & Auth',
    status: 'passed',
    lastRun: 'Just now',
    details: '15-minute idle expiration securely presents re-login modal without data loss.',
  },
  {
    id: 'qa-10',
    name: 'Refund & Return Dual-Custody Approval',
    category: 'Security & Auth',
    status: 'passed',
    lastRun: 'Just now',
    details: 'Maker-checker segregation blocks self-approval and requires re-authentication password.',
  },
  {
    id: 'qa-11',
    name: 'Least-Privilege RBAC Permissions Matrix',
    category: 'Security & Auth',
    status: 'passed',
    lastRun: 'Just now',
    details: 'Auditor role is restricted to read-only; unpermitted navigation routes lock with visual warnings.',
  },
  {
    id: 'qa-12',
    name: 'Cryptographic Backup & State Restoration',
    category: 'Integrations',
    status: 'passed',
    lastRun: 'Just now',
    details: 'Simulated hourly vault snapshot restoration validates state integrity.',
  },
  {
    id: 'qa-13',
    name: 'Assay Certificate Laboratory Linkage',
    category: 'Integrations',
    status: 'passed',
    lastRun: 'Just now',
    details: 'BIS Hallmark HUID and GIA cert numbers resolve to verified laboratory records.',
  },
  // TAGGED Proposed Checks
  {
    id: 'qa-p1',
    name: 'Statutory Coupon Threshold Guardrails',
    category: 'Core Pricing',
    status: 'passed',
    lastRun: 'Just now',
    details: 'Enforces min cart value and margin floors on discount codes.',
    isProposed: true,
  },
  {
    id: 'qa-p2',
    name: 'Abandoned Cart Recovery Dispatch',
    category: 'Integrations',
    status: 'passed',
    lastRun: 'Just now',
    details: 'Automated high-ticket reminder push notification triggers after 30 minutes.',
    isProposed: true,
  },
  {
    id: 'qa-p3',
    name: 'Verified Collector Review Moderation',
    category: 'Integrations',
    status: 'passed',
    lastRun: 'Just now',
    details: 'Restricts review authoring exclusively to verified delivered order holders.',
    isProposed: true,
  },
  {
    id: 'qa-p4',
    name: 'Automated PMLA High-Value Fraud Heuristics',
    category: 'Security & Auth',
    status: 'passed',
    lastRun: 'Just now',
    details: 'Automated risk flag trigger for rapid multi-city split orders exceeding ₹10,00,000.',
    isProposed: true,
  },
  {
    id: 'qa-p5',
    name: 'Concierge SLA Auto-Escalation',
    category: 'Integrations',
    status: 'passed',
    lastRun: 'Just now',
    details: 'Tickets exceeding 4-hour high-priority SLA automatically escalate to Senior Custodian.',
    isProposed: true,
  },
  {
    id: 'qa-p6',
    name: 'Canonical SEO Schema & Microdata Validation',
    category: 'Integrations',
    status: 'passed',
    lastRun: 'Just now',
    details: 'Validates Product and BreadcrumbList schema on catalog and educational pages.',
    isProposed: true,
  },
  {
    id: 'qa-p7',
    name: 'APNs & FCM Dual Push Channel Delivery',
    category: 'Integrations',
    status: 'passed',
    lastRun: 'Just now',
    details: 'Synchronous dispatch across iOS and Android device tokens.',
    isProposed: true,
  },
  {
    id: 'qa-p8',
    name: 'ERP Mass Billing Worksheet Bulk Importer',
    category: 'Integrations',
    status: 'passed',
    lastRun: 'Just now',
    details: 'Two-way SAP/Tally automated clearing house sync for corporate minting requisitions.',
    isProposed: true,
  },
];

interface NotificationLogEntry {
  id: string;
  title: string;
  message: string;
  channel: 'Apple APNs (iOS)' | 'Firebase FCM (Android)';
  recipientGroup: string;
  status: 'Delivered' | 'Pending';
  timestamp: string;
}

export const AdminPlatformPage: React.FC = () => {
  useSEO({
    title: 'Platform Architecture & Integrations',
    description: 'Shared backend microservices topology, external rate & payment gateways, push notification dispatch, telemetry stream, and automated QA suites.',
    canonicalPath: '/admin/platform',
  });

  const {
    rates,
    providerState,
    isFeedStale,
    events,
    adminUser,
    activeRole,
    logEvent,
    logAudit,
  } = useAppStore();

  const currentActor = adminUser?.name || 'Vikram Sharma';

  // Section 2: Push Notification State
  const [testNotificationTitle, setTestNotificationTitle] = useState('MCX Gold Spot Alert: ₹12,947/g');
  const [testNotificationMessage, setTestNotificationMessage] = useState('Festive rate-lock window open. Lock today’s Dhanteras bullion rate for 10 minutes.');
  const [testNotificationChannel, setTestNotificationChannel] = useState<'Apple APNs (iOS)' | 'Firebase FCM (Android)'>('Apple APNs (iOS)');
  const [notificationLogs, setNotificationLogs] = useState<NotificationLogEntry[]>([
    {
      id: 'notif-01',
      title: 'Order Dispatched with Sequel Armoured',
      message: 'Consignment #ORD-2026-001 has been handed over to Sequel Logistics. OTP verification required upon delivery.',
      channel: 'Apple APNs (iOS)',
      recipientGroup: 'Customer: Vikramaditya Singhania',
      status: 'Delivered',
      timestamp: new Date(Date.now() - 3600000 * 4).toLocaleTimeString(),
    },
    {
      id: 'notif-02',
      title: 'Quote Lock Active: 10g Gold Coin',
      message: 'Spot rate ₹13,000/g locked for 10 minutes. Complete checkout to finalize custody order.',
      channel: 'Firebase FCM (Android)',
      recipientGroup: 'Customer: Dr. Meenakshi Sundaram',
      status: 'Delivered',
      timestamp: new Date(Date.now() - 3600000 * 8).toLocaleTimeString(),
    },
  ]);
  const [notifSentNotice, setNotifSentNotice] = useState<string | null>(null);

  // Section 5: QA Checklist State
  const [qaChecks, setQaChecks] = useState<QaCheckItem[]>(INITIAL_QA_CHECKS);
  const [qaRunning, setQaRunning] = useState(false);
  const [qaSuccessNotice, setQaSuccessNotice] = useState<string | null>(null);

  // Handle Send Test Notification
  const handleSendTestNotification = (e: React.FormEvent) => {
    e.preventDefault();
    if (!testNotificationTitle.trim() || !testNotificationMessage.trim()) return;

    const newLog: NotificationLogEntry = {
      id: `notif-${Date.now().toString().slice(-4)}`,
      title: testNotificationTitle.trim(),
      message: testNotificationMessage.trim(),
      channel: testNotificationChannel,
      recipientGroup: 'Active Storefront App Tokens (Simulated)',
      status: 'Delivered',
      timestamp: new Date().toLocaleTimeString(),
    };

    setNotificationLogs([newLog, ...notificationLogs]);
    logEvent('admin_action', `Dispatched test push notification: "${testNotificationTitle}" via ${testNotificationChannel}`);
    logAudit(currentActor, 'PUSH_NOTIFICATION', 'Integrations Console', 'Draft notification', `Sent: ${testNotificationTitle}`);

    setNotifSentNotice(`Test push notification dispatched via ${testNotificationChannel}! Logged to system stream.`);
    setTimeout(() => setNotifSentNotice(null), 4000);
  };

  // Handle Run All QA Tests
  const handleRunAllQa = () => {
    setQaRunning(true);
    setQaSuccessNotice(null);

    setTimeout(() => {
      setQaChecks((prev) =>
        prev.map((c) => ({
          ...c,
          status: 'passed',
          lastRun: new Date().toLocaleTimeString(),
        }))
      );
      setQaRunning(false);
      setQaSuccessNotice(`All 21 comprehensive QA test suites executed with 100% pass rate! Zero regression anomalies.`);
      logEvent('admin_action', 'Executed automated platform QA test suite (21/21 passed)');
      logAudit(currentActor, 'QA_SUITE_RUN', 'QA Console', 'Pending QA', '21/21 passed');
      setTimeout(() => setQaSuccessNotice(null), 5000);
    }, 1200);
  };

  // Toggle single QA check
  const handleToggleCheck = (id: string) => {
    setQaChecks((prev) =>
      prev.map((c) => {
        if (c.id === id) {
          const next = c.status === 'passed' ? 'failed' : 'passed';
          return { ...c, status: next, lastRun: 'Just now' };
        }
        return c;
      })
    );
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#EADFC8] pb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Badge variant="gold" size="sm">Phase 11 Platform</Badge>
            <span className="text-xs uppercase tracking-wider text-[#7A6A55] font-semibold">
              Simulated for prototype
            </span>
          </div>
          <h1 className="font-serif text-3xl font-bold text-[#5A4630] flex items-center gap-3">
            <Cpu className="w-8 h-8 text-[#C9A24B]" />
            Platform Architecture & External Integrations
          </h1>
          <p className="text-xs sm:text-sm text-[#7A6A55] mt-1 max-w-3xl leading-relaxed">
            Shared high-performance backend architecture serving consumer web, native mobile apps, and administrative console. Comprehensive inspection of external gateway connectors, security primitives, and automated test runners.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <Badge variant="sage" size="md" className="flex items-center gap-1.5 px-3 py-1.5 font-bold">
            <span className="w-2 h-2 rounded-full bg-[#2D5A27] animate-pulse" />
            Backend API: Healthy
          </Badge>
          <Badge variant="neutral" size="md">Production Prototype</Badge>
        </div>
      </div>

      {/* SECTION 1: ARCHITECTURE TOPOLOGY DIAGRAM */}
      <Card variant="surface" className="p-6 border-[#EADFC8] space-y-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-[#EADFC8]">
          <div>
            <h2 className="font-serif text-lg font-bold text-[#5A4630] flex items-center gap-2">
              <Server className="w-5 h-5 text-[#C9A24B]" />
              1. Shared Omnichannel Microservices Topology
            </h2>
            <p className="text-xs text-[#7A6A55]">
              Unified GraphQL & REST Gateway serving responsive web, mobile apps, and administrative console with zero channel pricing discrepancies.
            </p>
          </div>
          <Badge variant="gold" size="sm">Central Node Topology</Badge>
        </div>

        {/* Visual Architecture Diagram Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
          {/* Client Channels */}
          <div className="p-5 bg-white border border-[#EADFC8] rounded-xl space-y-3 flex flex-col justify-between shadow-2xs">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#5A4630] uppercase tracking-wider">
                  Client Channels
                </span>
                <Badge variant="neutral" size="sm">Consumers & Staff</Badge>
              </div>
              <div className="space-y-2 pt-1 text-xs">
                <div className="p-3 bg-[#FFFBF3] border border-[#EADFC8] rounded-lg flex items-center gap-3 font-semibold text-[#5A4630]">
                  <Globe className="w-4 h-4 text-[#C9A24B]" />
                  <span>Consumer Web App (React 19 / Vite)</span>
                </div>
                <div className="p-3 bg-[#FFFBF3] border border-[#EADFC8] rounded-lg flex items-center gap-3 font-semibold text-[#5A4630]">
                  <Smartphone className="w-4 h-4 text-[#C9A24B]" />
                  <span>Native Mobile Client (iOS / Android)</span>
                </div>
                <div className="p-3 bg-[#FFFBF3] border border-[#EADFC8] rounded-lg flex items-center gap-3 font-semibold text-[#5A4630]">
                  <Lock className="w-4 h-4 text-[#C9A24B]" />
                  <span>Institutional Admin Console (Staff Portal)</span>
                </div>
              </div>
            </div>
            <div className="p-2.5 bg-[#FAF6EE] rounded-lg text-[11px] text-[#7A6A55] text-center border border-[#EADFC8]">
              HTTPS TLS 1.3 • WebSockets • HMAC Signature Verification
            </div>
          </div>

          {/* Central API Gateway & Core Microservices */}
          <div className="p-5 bg-[#FAF6EE] border-2 border-[#C9A24B] rounded-xl space-y-3 flex flex-col justify-between shadow-sm relative">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#5A4630] uppercase tracking-wider flex items-center gap-1.5">
                  <Cpu className="w-4 h-4 text-[#C9A24B]" />
                  Unified Backend API Gateway
                </span>
                <Badge variant="gold" size="sm">Single Authority</Badge>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs pt-1">
                <div className="p-2.5 bg-white border border-[#EADFC8] rounded-lg space-y-1">
                  <div className="font-bold text-[#5A4630] text-[11px]">1. Rates & Pricing Engine</div>
                  <div className="text-[10px] text-[#7A6A55]">Ingestion, formula calculate, 10m lock</div>
                </div>
                <div className="p-2.5 bg-white border border-[#EADFC8] rounded-lg space-y-1">
                  <div className="font-bold text-[#5A4630] text-[11px]">2. Catalogue & Assay</div>
                  <div className="text-[10px] text-[#7A6A55]">BIS HUID, GIA/IGI, lot tracking</div>
                </div>
                <div className="p-2.5 bg-white border border-[#EADFC8] rounded-lg space-y-1">
                  <div className="font-bold text-[#5A4630] text-[11px]">3. Online Stock Buffer</div>
                  <div className="text-[10px] text-[#7A6A55]">Physical segregation, reservations</div>
                </div>
                <div className="p-2.5 bg-white border border-[#EADFC8] rounded-lg space-y-1">
                  <div className="font-bold text-[#5A4630] text-[11px]">4. Identity & Consent</div>
                  <div className="text-[10px] text-[#7A6A55]">DPDP 2023, KYC Rule 114B, PAN</div>
                </div>
                <div className="p-2.5 bg-white border border-[#EADFC8] rounded-lg space-y-1 sm:col-span-2">
                  <div className="font-bold text-[#5A4630] text-[11px]">5. Custody Fulfilment & Payments</div>
                  <div className="text-[10px] text-[#7A6A55]">Idempotent webhooks, ERP handoff, armoured courier AWB</div>
                </div>
              </div>
            </div>
            <div className="p-2 bg-white rounded-lg text-[10px] text-[#2D5A27] font-semibold text-center border border-[#A4C997]">
              ✓ Server-side authority for pricing, taxes, stock, and locking
            </div>
          </div>

          {/* External Enterprise Integrations */}
          <div className="p-5 bg-white border border-[#EADFC8] rounded-xl space-y-3 flex flex-col justify-between shadow-2xs">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#5A4630] uppercase tracking-wider">
                  External Connectors
                </span>
                <Badge variant="sage" size="sm">5 Connected</Badge>
              </div>
              <div className="space-y-1.5 pt-1 text-xs">
                <div className="p-2.5 bg-[#FFFBF3] border border-[#EADFC8] rounded-lg flex items-center justify-between">
                  <span className="text-[#5A4630] font-medium">MCX Mumbai / LBMA Socket</span>
                  <Badge variant="sage" size="sm">Live Feed</Badge>
                </div>
                <div className="p-2.5 bg-[#FFFBF3] border border-[#EADFC8] rounded-lg flex items-center justify-between">
                  <span className="text-[#5A4630] font-medium">HDFC / Razorpay Gateway</span>
                  <Badge variant="sage" size="sm">Idempotent</Badge>
                </div>
                <div className="p-2.5 bg-[#FFFBF3] border border-[#EADFC8] rounded-lg flex items-center justify-between">
                  <span className="text-[#5A4630] font-medium">Sequel & BVC Armoured Logistics</span>
                  <Badge variant="sage" size="sm">API Tracked</Badge>
                </div>
                <div className="p-2.5 bg-[#FFFBF3] border border-[#EADFC8] rounded-lg flex items-center justify-between">
                  <span className="text-[#5A4630] font-medium">SAP / Tally ERP Billing Handoff</span>
                  <Badge variant="gold" size="sm">Worksheet CSV</Badge>
                </div>
                <div className="p-2.5 bg-[#FFFBF3] border border-[#EADFC8] rounded-lg flex items-center justify-between">
                  <span className="text-[#5A4630] font-medium">Apple APNs & Firebase FCM</span>
                  <Badge variant="sage" size="sm">Connected</Badge>
                </div>
              </div>
            </div>
            <div className="text-[10px] text-[#7A6A55] text-center pt-1">
              Encrypted REST Webhooks • ISO 20022 Financial Formats
            </div>
          </div>
        </div>
      </Card>

      {/* SECTION 2: INTEGRATIONS & PUSH NOTIFICATION DISPATCH */}
      <Card variant="surface" className="p-6 border-[#EADFC8] space-y-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-[#EADFC8]">
          <div>
            <h2 className="font-serif text-lg font-bold text-[#5A4630] flex items-center gap-2">
              <Layers className="w-5 h-5 text-[#C9A24B]" />
              2. External Gateway Integrations & Push Notifications
            </h2>
            <p className="text-xs text-[#7A6A55]">
              Real-time connectivity statuses, primary/backup failover state, and interactive multi-platform push notification dispatch.
            </p>
          </div>
          <Badge variant="gold" size="sm">Live Handshake</Badge>
        </div>

        {/* Live Integrations Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
          {/* Rate Provider */}
          <div className="p-4 bg-white border border-[#EADFC8] rounded-xl space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-[#5A4630]">Market Rate Feed</span>
              <Badge variant={providerState === 'ok' ? 'sage' : 'amber'} size="sm">
                {providerState === 'ok' ? 'MCX Primary' : providerState === 'primaryFailed' ? 'LBMA Backup' : 'Stale Feed'}
              </Badge>
            </div>
            <div className="text-[#7A6A55] space-y-1 text-[11px]">
              <div>Endpoint: <span className="font-mono">wss://mcx.aurum.internal/v2/spot</span></div>
              <div>Gold 24K: <strong className="text-[#5A4630]">₹{rates.gold24k}/g</strong></div>
              <div>Status: <span className="text-[#2D5A27] font-semibold">{isFeedStale ? 'Failsafe Paused' : 'Active 5s Ingestion'}</span></div>
            </div>
          </div>

          {/* Payment Gateway */}
          <div className="p-4 bg-white border border-[#EADFC8] rounded-xl space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-[#5A4630]">Payment Gateway</span>
              <Badge variant="sage" size="sm">Webhook Verified</Badge>
            </div>
            <div className="text-[#7A6A55] space-y-1 text-[11px]">
              <div>Provider: <span className="font-medium text-[#5A4630]">HDFC SmartGateway & UPI</span></div>
              <div>HMAC Algorithm: <span className="font-mono text-[#5A4630]">SHA256-Signature</span></div>
              <div>Duplicate Replay: <span className="text-[#2D5A27] font-semibold">Idempotency ON</span></div>
            </div>
          </div>

          {/* Logistics */}
          <div className="p-4 bg-white border border-[#EADFC8] rounded-xl space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-[#5A4630]">Armoured Logistics</span>
              <Badge variant="sage" size="sm">OTP Mandatory</Badge>
            </div>
            <div className="text-[#7A6A55] space-y-1 text-[11px]">
              <div>Partners: <span className="font-medium text-[#5A4630]">Sequel, BVC, BlueDart</span></div>
              <div>Transit Cover: <span className="text-[#2D5A27] font-semibold">100% Insured (Lloyd's)</span></div>
              <div>Proof of Delivery: <span className="font-mono text-[#5A4630]">Biometric / OTP</span></div>
            </div>
          </div>

          {/* ERP Handoff */}
          <div className="p-4 bg-white border border-[#EADFC8] rounded-xl space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-[#5A4630]">ERP Accounting</span>
              <Badge variant="gold" size="sm">Worksheet Ready</Badge>
            </div>
            <div className="text-[#7A6A55] space-y-1 text-[11px]">
              <div>Platform: <span className="font-medium text-[#5A4630]">SAP S/4HANA / Tally Prime</span></div>
              <div>Handoff Method: <span className="font-mono text-[#5A4630]">Manual Billing CSV</span></div>
              <div>Statutory Invoicing: <span className="text-[#2D5A27] font-semibold">Dispatch Gated</span></div>
            </div>
          </div>
        </div>

        {/* Tagged Proposed Enterprise Integrations */}
        <div className="p-3.5 bg-[#FAF6EE] border border-[#EADFC8] rounded-xl flex items-center justify-between text-xs flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#C9A24B]" />
            <strong className="text-[#5A4630]">TAGGED Proposed Connectors:</strong>
            <span className="text-[#7A6A55]">Salesforce CRM, WhatsApp Business API (Automated Delivery OTPs), and Marketing Automation.</span>
          </div>
          <Badge variant="neutral" size="sm">Proposed Feature</Badge>
        </div>

        {/* Push Notification Dispatcher Form */}
        <div className="p-5 bg-white border border-[#EADFC8] rounded-xl space-y-4 shadow-xs">
          <div className="flex items-center justify-between pb-3 border-b border-[#EADFC8]">
            <div className="flex items-center gap-2">
              <Bell className="w-5 h-5 text-[#C9A24B]" />
              <h3 className="font-serif text-sm font-bold text-[#5A4630]">
                Push Notification Dispatch Console (FCM Android / Apple APNs)
              </h3>
            </div>
            <Badge variant="sage" size="sm">Direct Device Link</Badge>
          </div>

          {notifSentNotice && (
            <div className="p-3 bg-[#DCE8D5] border border-[#A4C997] rounded-lg text-xs text-[#2D5A27] flex items-center gap-2 font-medium">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{notifSentNotice}</span>
            </div>
          )}

          <form onSubmit={handleSendTestNotification} className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-[#5A4630] font-semibold mb-1">
                  Target Notification Channel
                </label>
                <select
                  value={testNotificationChannel}
                  onChange={(e) => setTestNotificationChannel(e.target.value as any)}
                  className="w-full px-3 py-2 bg-[#FFFBF3] border border-[#EADFC8] rounded-lg text-[#5A4630] font-medium"
                >
                  <option value="Apple APNs (iOS)">Apple APNs (Native iOS Tokens)</option>
                  <option value="Firebase FCM (Android)">Firebase FCM (Android Device Tokens)</option>
                </select>
              </div>

              <div>
                <label className="block text-[#5A4630] font-semibold mb-1">
                  Notification Title
                </label>
                <input
                  type="text"
                  value={testNotificationTitle}
                  onChange={(e) => setTestNotificationTitle(e.target.value)}
                  required
                  placeholder="e.g. Rate Lock Active"
                  className="w-full px-3 py-2 bg-[#FFFBF3] border border-[#EADFC8] rounded-lg text-[#5A4630]"
                />
              </div>

              <div>
                <label className="block text-[#5A4630] font-semibold mb-1">
                  Recipient Audience
                </label>
                <input
                  type="text"
                  readOnly
                  value="All Authenticated App Devices (1,420 Active Tokens)"
                  className="w-full px-3 py-2 bg-[#FAF6EE] border border-[#EADFC8] rounded-lg text-[#7A6A55] font-mono text-[11px]"
                />
              </div>
            </div>

            <div>
              <label className="block text-[#5A4630] font-semibold mb-1">
                Notification Message Body
              </label>
              <input
                type="text"
                value={testNotificationMessage}
                onChange={(e) => setTestNotificationMessage(e.target.value)}
                required
                placeholder="Enter alert copy dispatched to mobile devices..."
                className="w-full px-3 py-2 bg-[#FFFBF3] border border-[#EADFC8] rounded-lg text-[#5A4630]"
              />
            </div>

            <div className="flex justify-end pt-1">
              <Button
                type="submit"
                variant="primary"
                size="sm"
                leftIcon={<Send className="w-3.5 h-3.5" />}
              >
                Send Test Push Notification
              </Button>
            </div>
          </form>

          {/* Notification Dispatch History Table */}
          <div className="space-y-2 pt-2 border-t border-[#EADFC8]">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#7A6A55]">
              Dispatched Push Notifications Log
            </span>
            <div className="overflow-x-auto rounded-xl border border-[#EADFC8]">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#FAF6EE] text-[#5A4630] border-b border-[#EADFC8]">
                  <tr>
                    <th className="p-2.5">Time</th>
                    <th className="p-2.5">Channel</th>
                    <th className="p-2.5">Title & Message</th>
                    <th className="p-2.5">Audience</th>
                    <th className="p-2.5 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#EADFC8] bg-white">
                  {notificationLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-[#FFFBF3]">
                      <td className="p-2.5 font-mono text-[11px] text-[#7A6A55]">{log.timestamp}</td>
                      <td className="p-2.5 font-semibold text-[#5A4630]">{log.channel}</td>
                      <td className="p-2.5">
                        <div className="font-semibold text-[#5A4630]">{maskTextPII(log.title, activeRole)}</div>
                        <div className="text-[11px] text-[#7A6A55] line-clamp-1">{maskTextPII(log.message, activeRole)}</div>
                      </td>
                      <td className="p-2.5 text-[11px] text-[#7A6A55]">{maskTextPII(log.recipientGroup, activeRole)}</td>
                      <td className="p-2.5 text-right">
                        <Badge variant="sage" size="sm">{log.status}</Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </Card>

      {/* SECTION 3: SECURITY, RELIABILITY & DATA PRIMITIVES */}
      <Card variant="surface" className="p-6 border-[#EADFC8] space-y-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-[#EADFC8]">
          <div>
            <h2 className="font-serif text-lg font-bold text-[#5A4630] flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-[#C9A24B]" />
              3. Security Standards, Data Governance & Environmental Separation
            </h2>
            <p className="text-xs text-[#7A6A55]">
              Cryptographic controls, statutory data privacy safeguards, UTC timestamps with localized formatting, and staging/production separation.
            </p>
          </div>
          <Badge variant="sage" size="sm">SIMULATED Primitives</Badge>
        </div>

        {/* Security Status Chips Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 text-xs">
          {[
            { label: 'Transport Layer Security', val: 'HTTPS / TLS 1.3', status: 'Active' },
            { label: 'Session Management', val: 'AES-256 JWT & 15m Timeout', status: 'Enforced' },
            { label: 'Server Authority', val: 'Price, Tax & Stock Server-Side', status: 'Enforced' },
            { label: 'Fixed Precision Currency', val: 'Fixed 2-Decimal INR Standards', status: 'Active' },
            { label: 'Webhook Idempotency', val: 'Transaction Hash Replay Guard', status: 'Active' },
            { label: 'Cardholder Data Storage', val: 'Zero PCI Data Stored (Tokenized)', status: 'Compliant' },
            { label: 'Encrypted Vault Backups', val: 'Hourly AES-GCM Snapshots', status: 'Active' },
            { label: 'Environment Tier', val: 'Production Prototype Separation', status: 'Isolated' },
          ].map((chip, idx) => (
            <div key={idx} className="p-3 bg-white border border-[#EADFC8] rounded-xl space-y-1">
              <div className="flex items-center justify-between text-[10px] text-[#7A6A55]">
                <span>{chip.label}</span>
                <span className="w-2 h-2 rounded-full bg-[#2D5A27]" />
              </div>
              <div className="font-bold text-[#5A4630] text-[11px]">{chip.val}</div>
              <Badge variant="sage" size="sm">{chip.status}</Badge>
            </div>
          ))}
        </div>

        {/* Real Example of Historical UTC Snapshot with Local IST Display */}
        <div className="p-4 bg-[#FAF6EE] border border-[#EADFC8] rounded-xl space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#5A4630] flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-[#C9A24B]" />
              Real Example: Immutable UTC Timestamp Ingestion & Local Display
            </span>
            <Badge variant="gold" size="sm">Audit Standard</Badge>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs pt-1">
            <div className="p-2.5 bg-white border border-[#EADFC8] rounded-lg">
              <span className="text-[10px] text-[#7A6A55] block">Raw Storage Timestamp (ISO 8601 UTC)</span>
              <span className="font-mono font-bold text-[#5A4630] text-[11px]">
                {new Date().toISOString()}
              </span>
            </div>
            <div className="p-2.5 bg-white border border-[#EADFC8] rounded-lg">
              <span className="text-[10px] text-[#7A6A55] block">Localized Display (Asia/Kolkata IST)</span>
              <span className="font-mono font-bold text-[#2D5A27] text-[11px]">
                {new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })} IST
              </span>
            </div>
            <div className="p-2.5 bg-white border border-[#EADFC8] rounded-lg">
              <span className="text-[10px] text-[#7A6A55] block">Cryptographic Hash Seal</span>
              <span className="font-mono font-bold text-[#C9A24B] text-[11px] truncate block">
                SHA256:7f9a2b8e4c1d683a...
              </span>
            </div>
          </div>
        </div>

        {/* Tagged Proposed Security Controls */}
        <div className="p-3.5 bg-white border border-[#EADFC8] rounded-xl flex items-center justify-between text-xs flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#C9A24B]" />
            <strong className="text-[#5A4630]">TAGGED Proposed Security Modules:</strong>
            <span className="text-[#7A6A55]">Cloudflare WAF Bot Protection, Automated Daily Penetration Testing, Corporate IP Whitelisting, and Hardware Token Device Trust.</span>
          </div>
          <Badge variant="neutral" size="sm">Proposed Feature</Badge>
        </div>
      </Card>

      {/* SECTION 4: REAL-TIME TELEMETRY & ANALYTICS STREAM */}
      <Card variant="surface" className="p-6 border-[#EADFC8] space-y-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-[#EADFC8]">
          <div>
            <h2 className="font-serif text-lg font-bold text-[#5A4630] flex items-center gap-2">
              <Activity className="w-5 h-5 text-[#C9A24B]" />
              4. Live Storefront Event Stream & System Health Telemetry
            </h2>
            <p className="text-xs text-[#7A6A55]">
              Real-time audit stream capturing live customer actions across product views, search queries, cart mutations, and checkout steps.
            </p>
          </div>
          <Badge variant="sage" size="sm">Real Store Data</Badge>
        </div>

        {/* Monitoring Card (SIMULATED) */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 text-xs">
          <div className="p-3.5 bg-white border border-[#EADFC8] rounded-xl space-y-1">
            <span className="text-[#7A6A55] text-[11px]">System Availability</span>
            <div className="text-xl font-serif font-bold text-[#2D5A27]">99.98%</div>
            <span className="text-[10px] text-[#7A6A55]">Last 30 days uptime</span>
          </div>
          <div className="p-3.5 bg-white border border-[#EADFC8] rounded-xl space-y-1">
            <span className="text-[#7A6A55] text-[11px]">p95 API Latency</span>
            <div className="text-xl font-serif font-bold text-[#5A4630]">142ms</div>
            <span className="text-[10px] text-[#2D5A27]">Within 200ms SLA target</span>
          </div>
          <div className="p-3.5 bg-white border border-[#EADFC8] rounded-xl space-y-1">
            <span className="text-[#7A6A55] text-[11px]">Unhandled Exceptions</span>
            <div className="text-xl font-serif font-bold text-[#2D5A27]">0</div>
            <span className="text-[10px] text-[#7A6A55]">Zero production crash anomalies</span>
          </div>
          <div className="p-3.5 bg-white border border-[#EADFC8] rounded-xl space-y-1">
            <span className="text-[#7A6A55] text-[11px]">Active Storefront Events</span>
            <div className="text-xl font-serif font-bold text-[#C9A24B]">{events.length}</div>
            <span className="text-[10px] text-[#7A6A55]">Logged in memory stream</span>
          </div>
        </div>

        {/* Live Event Stream Table */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#5A4630] uppercase tracking-wider">
              Live Ingested Storefront Action Ledger
            </span>
            <span className="text-[11px] text-[#7A6A55]">Showing latest {events.length} events</span>
          </div>

          <div className="overflow-x-auto rounded-xl border border-[#EADFC8] max-h-72">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#FAF6EE] text-[#5A4630] border-b border-[#EADFC8] sticky top-0 z-10">
                <tr>
                  <th className="p-2.5">Time</th>
                  <th className="p-2.5">Event Type</th>
                  <th className="p-2.5">Action Details</th>
                  <th className="p-2.5 text-right">Integrity</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EADFC8] bg-white">
                {events.slice(0, 15).map((evt) => (
                  <tr key={evt.id} className="hover:bg-[#FFFBF3]">
                    <td className="p-2.5 font-mono text-[11px] text-[#7A6A55] whitespace-nowrap">
                      {new Date(evt.timestamp).toLocaleTimeString()}
                    </td>
                    <td className="p-2.5">
                      <Badge variant="neutral" size="sm">{evt.type}</Badge>
                    </td>
                    <td className="p-2.5 font-medium text-[#5A4630]">{maskTextPII(evt.details, activeRole)}</td>
                    <td className="p-2.5 text-right font-mono text-[10px] text-[#2D5A27]">
                      ✓ Verified
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </Card>

      {/* SECTION 5: AUTOMATED QA TEST CHECKLIST & RUNNER */}
      <Card variant="surface" className="p-6 border-[#EADFC8] space-y-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-[#EADFC8]">
          <div>
            <h2 className="font-serif text-lg font-bold text-[#5A4630] flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-[#C9A24B]" />
              5. Automated Platform QA Suite & Verification Runner
            </h2>
            <p className="text-xs text-[#7A6A55]">
              Interactive test suites verifying price consistency, stale feed timeouts, zero-overselling locks, and regulatory compliance.
            </p>
          </div>

          <Button
            variant="primary"
            size="md"
            onClick={handleRunAllQa}
            disabled={qaRunning}
            leftIcon={qaRunning ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
          >
            {qaRunning ? 'Running Platform QA Suites...' : 'Run All QA Suites (21 Tests)'}
          </Button>
        </div>

        {qaSuccessNotice && (
          <div className="p-3.5 bg-[#DCE8D5] border border-[#A4C997] rounded-xl text-xs text-[#2D5A27] font-semibold flex items-center gap-2 animate-fade-in shadow-xs">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{qaSuccessNotice}</span>
          </div>
        )}

        {/* QA Test Matrix Table */}
        <div className="overflow-x-auto rounded-xl border border-[#EADFC8]">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#FAF6EE] text-[#5A4630] border-b border-[#EADFC8]">
              <tr>
                <th className="p-3">Status</th>
                <th className="p-3">Test Scenario</th>
                <th className="p-3">Domain Category</th>
                <th className="p-3">Verification Details</th>
                <th className="p-3">Last Executed</th>
                <th className="p-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EADFC8] bg-white">
              {qaChecks.map((check) => (
                <tr key={check.id} className="hover:bg-[#FFFBF3]">
                  <td className="p-3">
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        check.status === 'passed'
                          ? 'bg-[#DCE8D5] text-[#2D5A27]'
                          : check.status === 'failed'
                          ? 'bg-[#FDF0EE] text-[#9E3624]'
                          : 'bg-[#F8EFD9] text-[#7A6A55]'
                      }`}
                    >
                      {check.status === 'passed' ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
                      <span className="capitalize">{check.status}</span>
                    </span>
                  </td>
                  <td className="p-3">
                    <div className="font-bold text-[#5A4630] flex items-center gap-1.5">
                      <span>{check.name}</span>
                      {check.isProposed && (
                        <Badge variant="neutral" size="sm">Proposed Check</Badge>
                      )}
                    </div>
                  </td>
                  <td className="p-3">
                    <span className="text-[11px] text-[#7A6A55]">{check.category}</span>
                  </td>
                  <td className="p-3 text-[11px] text-[#7A6A55] max-w-md">{check.details}</td>
                  <td className="p-3 font-mono text-[11px] text-[#7A6A55]">{check.lastRun || 'Pending'}</td>
                  <td className="p-3 text-right">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleToggleCheck(check.id)}
                      className="text-[10px] py-1 px-2"
                    >
                      {check.status === 'passed' ? 'Retest' : 'Resolve'}
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};
