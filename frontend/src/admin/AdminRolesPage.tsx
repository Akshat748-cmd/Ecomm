import React, { useState, useMemo } from 'react';
import { useAppStore } from '../store';
import { useSEO } from '../lib/useSEO';
import { formatINR } from '../lib/pricing';
import { Card } from '../components/Card';
import { Badge } from '../components/Badge';
import { Button } from '../components/Button';
import { Modal } from '../components/Modal';
import { ADMIN_MODULES } from '../lib/adminPermissions';
import type { AdminRole, ApprovalType } from '../data/types';
import { maskDataPayload, maskTextPII } from '../lib/masking';
import {
  KeyRound,
  ShieldCheck,
  ShieldAlert,
  Check,
  X,
  CheckCircle2,
  Plus,
  AlertTriangle,
  Boxes,
  FileCheck,
  CreditCard,
  DollarSign,
  TrendingDown,
  UserX,
  UserCheck,
  Search,
  Filter,
} from 'lucide-react';

const ALL_ROLES: AdminRole[] = [
  'Super Admin',
  'Pricing',
  'Catalogue',
  'Warehouse',
  'Support',
  'Finance',
  'Auditor',
];

const APPROVAL_TYPE_CONFIG: Record<
  ApprovalType,
  { label: string; icon: React.ReactNode; badgeVariant: 'gold' | 'coral' | 'sage' | 'neutral' | 'amber' }
> = {
  price_override: {
    label: 'Price Override',
    icon: <DollarSign className="w-3.5 h-3.5" />,
    badgeVariant: 'gold',
  },
  high_value_refund: {
    label: 'High-Value Refund',
    icon: <TrendingDown className="w-3.5 h-3.5" />,
    badgeVariant: 'coral',
  },
  stock_adjustment: {
    label: 'Stock Adjustment',
    icon: <Boxes className="w-3.5 h-3.5" />,
    badgeVariant: 'amber',
  },
  compliance_edit: {
    label: 'Compliance Edit',
    icon: <FileCheck className="w-3.5 h-3.5" />,
    badgeVariant: 'neutral',
  },
  low_margin_quote: {
    label: 'Low-Margin Quote',
    icon: <AlertTriangle className="w-3.5 h-3.5" />,
    badgeVariant: 'coral',
  },
  credit_terms: {
    label: 'Credit Terms',
    icon: <CreditCard className="w-3.5 h-3.5" />,
    badgeVariant: 'sage',
  },
};

export const AdminRolesPage: React.FC = () => {
  useSEO({
    title: 'Roles & Permissions (RBAC Matrix)',
    description: 'Module × Action permissions matrix and maker-checker segregation protocols for institutional security.',
    canonicalPath: '/admin/roles',
  });

  const {
    adminUser,
    activeRole,
    approvals,
    setActiveRole,
    setAdminUserStatus,
    createApprovalRequest,
    approveApprovalRequest,
    rejectApprovalRequest,
  } = useAppStore();

  const [selectedRole, setSelectedRole] = useState<AdminRole>(activeRole);
  const [makerCheckerModalOpen, setMakerCheckerModalOpen] = useState(false);
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [targetRejectId, setTargetRejectId] = useState<string | null>(null);
  const [rejectReasonText, setRejectReasonText] = useState('');

  // Form Fields for New Request Modal
  const [reqType, setReqType] = useState<ApprovalType>('stock_adjustment');
  const [reqTitle, setReqTitle] = useState('');
  const [reqEntityId, setReqEntityId] = useState('');
  const [reqAmount, setReqAmount] = useState<number | ''>('');
  const [reqReason, setReqReason] = useState('');
  const [reqDetails, setReqDetails] = useState('');

  // Filter & Search State
  const [typeFilter, setTypeFilter] = useState<'all' | ApprovalType>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'Pending' | 'Approved' | 'Rejected'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Notices
  const [makerCheckerError, setMakerCheckerError] = useState<string | null>(null);
  const [makerCheckerSuccess, setMakerCheckerSuccess] = useState<string | null>(null);

  const currentActor = adminUser?.name || 'Vikram Sharma';
  const currentUserEmail = adminUser?.email || 'v.sharma@precious.internal';
  const isUserInactive = adminUser?.status === 'Inactive';

  // Filtered Approvals
  const filteredApprovals = useMemo(() => {
    return approvals.filter((a) => {
      const matchesType = typeFilter === 'all' || a.type === typeFilter;
      const matchesStatus = statusFilter === 'all' || a.status === statusFilter;
      const matchesSearch =
        !searchQuery.trim() ||
        a.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        a.entityId.toLowerCase().includes(searchQuery.toLowerCase()) ||
        a.requester.toLowerCase().includes(searchQuery.toLowerCase()) ||
        a.reason.toLowerCase().includes(searchQuery.toLowerCase());

      return matchesType && matchesStatus && matchesSearch;
    });
  }, [approvals, typeFilter, statusFilter, searchQuery]);

  // Counts for filters
  const pendingCount = approvals.filter((a) => a.status === 'Pending').length;
  const approvedCount = approvals.filter((a) => a.status === 'Approved').length;
  const rejectedCount = approvals.filter((a) => a.status === 'Rejected').length;

  const handleCreateRequest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reqTitle.trim() || !reqReason.trim()) return;

    createApprovalRequest({
      type: reqType,
      title: reqTitle.trim(),
      entityId: reqEntityId.trim() || `GEN-${Date.now().toString().slice(-4)}`,
      requester: currentActor,
      amount: reqAmount ? Number(reqAmount) : undefined,
      reason: reqReason.trim(),
      beforeState: { notes: 'Baseline state prior to modification' },
      afterState: { notes: reqDetails.trim() || 'Proposed state after dual-custody approval' },
    });

    setReqTitle('');
    setReqEntityId('');
    setReqAmount('');
    setReqReason('');
    setReqDetails('');
    setMakerCheckerModalOpen(false);
    setMakerCheckerSuccess('Dual-custody request initiated. Added to pending approval queue.');
    setTimeout(() => setMakerCheckerSuccess(null), 4000);
  };

  const handleApprove = (reqId: string) => {
    setMakerCheckerError(null);
    setMakerCheckerSuccess(null);
    const result = approveApprovalRequest(reqId, currentActor);
    if (!result.success) {
      setMakerCheckerError(result.error || 'Approval failed.');
    } else {
      setMakerCheckerSuccess('Request approved successfully and logged to Immutable Audit Trail.');
      setTimeout(() => setMakerCheckerSuccess(null), 4000);
    }
  };

  const handleOpenRejectModal = (reqId: string) => {
    setTargetRejectId(reqId);
    setRejectReasonText('Declined under dual-custody secondary inspection.');
    setRejectModalOpen(true);
  };

  const handleConfirmReject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetRejectId) return;
    setMakerCheckerError(null);
    setMakerCheckerSuccess(null);
    const result = rejectApprovalRequest(targetRejectId, currentActor, rejectReasonText.trim());
    if (!result.success) {
      setMakerCheckerError(result.error || 'Rejection failed.');
    } else {
      setMakerCheckerSuccess('Request marked as rejected and logged to Immutable Audit Trail.');
      setTimeout(() => setMakerCheckerSuccess(null), 4000);
    }
    setRejectModalOpen(false);
    setTargetRejectId(null);
  };

  const toggleAccountStatus = () => {
    const nextStatus = isUserInactive ? 'Active' : 'Inactive';
    setAdminUserStatus(nextStatus);
    if (nextStatus === 'Inactive') {
      setMakerCheckerError('Your administrator account is now INACTIVE. Dual-custody approvals and rejections are blocked.');
    } else {
      setMakerCheckerSuccess('Administrator account restored to ACTIVE status.');
      setMakerCheckerError(null);
      setTimeout(() => setMakerCheckerSuccess(null), 3000);
    }
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#EADFC8] pb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Badge variant="gold" size="sm">Phase 6 RBAC</Badge>
            <span className="text-xs uppercase tracking-wider text-[#7A6A55] font-semibold">Security Governance</span>
          </div>
          <h1 className="font-serif text-3xl font-bold text-[#5A4630]">
            Dual-Custody Approval Queue & RBAC Matrix
          </h1>
          <p className="text-xs sm:text-sm text-[#7A6A55] mt-1">
            Mandatory segregation of duties across all 6 high-risk operational types with immutable audit trails.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="primary"
            size="md"
            onClick={() => setMakerCheckerModalOpen(true)}
            leftIcon={<Plus className="w-4 h-4" />}
          >
            Initiate Dual Request
          </Button>
        </div>
      </div>

      {/* Maker-Checker Alert Banner */}
      {makerCheckerError && (
        <div className="p-4 bg-[#FDF0EE] border-2 border-[#F1B5AC] rounded-xl text-xs text-[#9E3624] flex items-start gap-3 animate-in fade-in duration-200">
          <ShieldAlert className="w-5 h-5 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <strong className="text-sm font-serif">Dual Authorization Rule Enforced</strong>
            <p className="leading-relaxed">{makerCheckerError}</p>
          </div>
        </div>
      )}

      {makerCheckerSuccess && (
        <div className="p-4 bg-[#DCE8D5] border border-[#A4C997] rounded-xl text-xs text-[#2D5A27] flex items-center gap-2 animate-in fade-in duration-200">
          <CheckCircle2 className="w-5 h-5 shrink-0" />
          <span className="font-medium">{makerCheckerSuccess}</span>
        </div>
      )}

      {/* 1. DUAL-CUSTODY WORKFLOW QUEUE */}
      <Card variant="surface" className="p-6 border-[#EADFC8] space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#EADFC8]">
          <div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-[#C9A24B]" />
              <h2 className="font-serif text-lg font-bold text-[#5A4630]">
                Dual-Custody Approval Queue
              </h2>
              <Badge variant="gold" size="sm">6 Approval Types</Badge>
            </div>
            <p className="text-xs text-[#7A6A55] mt-0.5">
              Governs price overrides, high-value refunds, stock adjustments, compliance edits, low-margin quotes, and credit terms.
            </p>
          </div>

          {/* Active Officer & Inactive User Toggle */}
          <div className="flex items-center gap-3 flex-wrap">
            <div className="text-xs text-[#5A4630] font-semibold bg-[#FFFBF3] px-3 py-1.5 rounded-lg border border-[#EADFC8] flex items-center gap-2">
              <span>Active Officer:</span>
              <span className="text-[#C9A24B] font-bold">{currentActor}</span>
              <span className="text-[#7A6A55]">({activeRole})</span>
              <Badge variant={isUserInactive ? 'coral' : 'sage'} size="sm">
                {isUserInactive ? 'Inactive' : 'Active'}
              </Badge>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={toggleAccountStatus}
              leftIcon={isUserInactive ? <UserCheck className="w-3.5 h-3.5 text-[#2D5A27]" /> : <UserX className="w-3.5 h-3.5 text-[#9E3624]" />}
              className="text-xs"
              title="Toggle active/inactive status to test inactive user blocked rule"
            >
              {isUserInactive ? 'Activate Account' : 'Simulate Inactive Block'}
            </Button>
          </div>
        </div>

        {/* Filter Controls Bar */}
        <div className="space-y-3">
          {/* Type Filter Chips */}
          <div className="flex items-center gap-1.5 flex-wrap text-xs">
            <span className="text-[#7A6A55] font-semibold mr-1 flex items-center gap-1">
              <Filter className="w-3.5 h-3.5" /> Type:
            </span>
            <button
              type="button"
              onClick={() => setTypeFilter('all')}
              className={`px-2.5 py-1 rounded-lg font-medium transition-all cursor-pointer ${
                typeFilter === 'all'
                  ? 'bg-[#5A4630] text-white shadow-xs'
                  : 'bg-white border border-[#EADFC8] text-[#5A4630] hover:bg-[#F8EFD9]'
              }`}
            >
              All Types ({approvals.length})
            </button>
            {(Object.keys(APPROVAL_TYPE_CONFIG) as ApprovalType[]).map((t) => {
              const cfg = APPROVAL_TYPE_CONFIG[t];
              const count = approvals.filter((a) => a.type === t).length;
              return (
                <button
                  key={t}
                  type="button"
                  onClick={() => setTypeFilter(t)}
                  className={`px-2.5 py-1 rounded-lg font-medium transition-all flex items-center gap-1.5 cursor-pointer ${
                    typeFilter === t
                      ? 'bg-[#C9A24B] text-white shadow-xs'
                      : 'bg-white border border-[#EADFC8] text-[#5A4630] hover:bg-[#F8EFD9]'
                  }`}
                >
                  {cfg.icon}
                  <span>{cfg.label}</span>
                  <span className="text-[10px] opacity-80">({count})</span>
                </button>
              );
            })}
          </div>

          {/* Status Filter & Search */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
            <div className="flex items-center gap-1.5 flex-wrap text-xs">
              <span className="text-[#7A6A55] font-semibold mr-1">Status:</span>
              <button
                type="button"
                onClick={() => setStatusFilter('all')}
                className={`px-2 py-0.5 rounded-md text-xs font-semibold ${
                  statusFilter === 'all' ? 'bg-[#5A4630] text-white' : 'text-[#7A6A55] hover:text-[#5A4630]'
                }`}
              >
                All ({approvals.length})
              </button>
              <button
                type="button"
                onClick={() => setStatusFilter('Pending')}
                className={`px-2 py-0.5 rounded-md text-xs font-semibold ${
                  statusFilter === 'Pending' ? 'bg-[#C9A24B] text-white' : 'text-[#7A6A55] hover:text-[#5A4630]'
                }`}
              >
                Pending ({pendingCount})
              </button>
              <button
                type="button"
                onClick={() => setStatusFilter('Approved')}
                className={`px-2 py-0.5 rounded-md text-xs font-semibold ${
                  statusFilter === 'Approved' ? 'bg-[#2D5A27] text-white' : 'text-[#7A6A55] hover:text-[#5A4630]'
                }`}
              >
                Approved ({approvedCount})
              </button>
              <button
                type="button"
                onClick={() => setStatusFilter('Rejected')}
                className={`px-2 py-0.5 rounded-md text-xs font-semibold ${
                  statusFilter === 'Rejected' ? 'bg-[#9E3624] text-white' : 'text-[#7A6A55] hover:text-[#5A4630]'
                }`}
              >
                Rejected ({rejectedCount})
              </button>
            </div>

            <div className="relative w-full sm:w-64">
              <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-[#7A6A55]" />
              <input
                type="text"
                placeholder="Search requests, entities..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 text-xs bg-white border border-[#EADFC8] rounded-lg text-[#5A4630] focus:outline-none focus:ring-1 focus:ring-[#C9A24B]"
              />
            </div>
          </div>
        </div>

        {/* Requests List */}
        <div className="space-y-4">
          {filteredApprovals.length === 0 ? (
            <div className="p-8 text-center text-xs text-[#7A6A55] bg-white rounded-xl border border-[#EADFC8]">
              No approval requests match the selected filters.
            </div>
          ) : (
            filteredApprovals.map((req) => {
              const cfg = APPROVAL_TYPE_CONFIG[req.type] || {
                label: req.type,
                icon: <ShieldCheck className="w-3.5 h-3.5" />,
                badgeVariant: 'neutral' as const,
              };

              const reqNorm = req.requester.trim().toLowerCase();
              const actorNorm = currentActor.trim().toLowerCase();
              const emailNorm = currentUserEmail.trim().toLowerCase();
              const isInitiator =
                reqNorm === actorNorm ||
                reqNorm === emailNorm ||
                reqNorm.includes(actorNorm) ||
                actorNorm.includes(reqNorm);

              const canApproveOrReject =
                req.status === 'Pending' &&
                !isInitiator &&
                activeRole !== 'Auditor' &&
                !isUserInactive;

              return (
                <div
                  key={req.id}
                  className="p-5 rounded-xl border border-[#EADFC8] bg-white space-y-3.5 hover:border-[#C9A24B] transition-colors shadow-2xs"
                >
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-mono text-xs text-[#7A6A55] bg-[#FFFBF3] px-2 py-0.5 rounded border border-[#EADFC8]">
                          {req.id}
                        </span>
                        <span className="font-serif text-sm font-bold text-[#5A4630]">
                          {maskTextPII(req.title, activeRole)}
                        </span>
                        <Badge variant={cfg.badgeVariant} size="sm" className="flex items-center gap-1">
                          {cfg.icon}
                          <span>{cfg.label}</span>
                        </Badge>
                        <Badge
                          variant={
                            req.status === 'Approved'
                              ? 'sage'
                              : req.status === 'Rejected'
                              ? 'coral'
                              : 'amber'
                          }
                          size="sm"
                        >
                          {req.status}
                        </Badge>
                        {req.amount !== undefined && (
                          <span className="font-mono font-bold text-xs text-[#5A4630] bg-[#FFFBF3] px-2 py-0.5 rounded border border-[#EADFC8]">
                            Amount: {formatINR(req.amount)}
                          </span>
                        )}
                      </div>

                      <div className="text-xs text-[#7A6A55] flex items-center gap-3 flex-wrap">
                        <span>Initiated by: <strong>{req.requester}</strong></span>
                        <span>•</span>
                        <span>Entity: <strong className="font-mono">{req.entityId}</strong></span>
                        <span>•</span>
                        <span>Created: {new Date(req.createdAt).toLocaleString()}</span>
                      </div>
                    </div>

                    {/* Pending Action Buttons */}
                    {req.status === 'Pending' && (
                      <div className="flex items-center gap-2 shrink-0 pt-2 sm:pt-0">
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={() => handleApprove(req.id)}
                          disabled={!canApproveOrReject}
                          title={
                            isUserInactive
                              ? 'Blocked: Your account is marked Inactive'
                              : isInitiator
                              ? 'Maker-Checker Violation: Initiator cannot approve their own request'
                              : activeRole === 'Auditor'
                              ? 'Auditor role is strictly read-only'
                              : 'Approve dual-custody request'
                          }
                        >
                          Approve
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleOpenRejectModal(req.id)}
                          disabled={!canApproveOrReject}
                          title={
                            isUserInactive
                              ? 'Blocked: Your account is marked Inactive'
                              : isInitiator
                              ? 'Maker-Checker Violation: Initiator cannot reject their own request'
                              : activeRole === 'Auditor'
                              ? 'Auditor role is strictly read-only'
                              : 'Reject dual-custody request'
                          }
                        >
                          Reject
                        </Button>
                      </div>
                    )}

                    {/* Decided Info */}
                    {req.status !== 'Pending' && (
                      <div className="text-xs text-[#7A6A55] sm:text-right shrink-0">
                        <div>Decided by: <strong>{req.approver || 'Super Admin'}</strong></div>
                        {req.resolvedAt && (
                          <div className="text-[11px] text-[#7A6A55]/80">
                            {new Date(req.resolvedAt).toLocaleString()}
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Reason text */}
                  <div className="p-3 bg-[#FFFBF3] rounded-lg border border-[#EADFC8]/60 text-xs text-[#7A6A55] space-y-1">
                    <div className="font-semibold text-[#5A4630]">Audit Justification / Operational Reason:</div>
                    <p className="leading-relaxed">{maskTextPII(req.reason, activeRole)}</p>
                  </div>

                  {/* Before / After State Diff */}
                  {(req.beforeState || req.afterState) && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                      <div className="p-2.5 rounded-lg bg-[#FAF7F2] border border-[#EADFC8]">
                        <span className="font-bold text-[#7A6A55] text-[11px] uppercase tracking-wider block mb-1">
                          Before State (Audit Baseline)
                        </span>
                        <pre className="text-[11px] font-mono text-[#5A4630] whitespace-pre-wrap overflow-x-auto max-h-28">
                          {JSON.stringify(maskDataPayload(req.beforeState || {}, activeRole), null, 2)}
                        </pre>
                      </div>

                      <div className="p-2.5 rounded-lg bg-[#FAF7F2] border border-[#EADFC8]">
                        <span className="font-bold text-[#7A6A55] text-[11px] uppercase tracking-wider block mb-1">
                          After State (Proposed / Applied Change)
                        </span>
                        <pre className="text-[11px] font-mono text-[#5A4630] whitespace-pre-wrap overflow-x-auto max-h-28">
                          {JSON.stringify(maskDataPayload(req.afterState || {}, activeRole), null, 2)}
                        </pre>
                      </div>
                    </div>
                  )}

                  {/* Anti-Self-Approval Warning */}
                  {isInitiator && req.status === 'Pending' && (
                    <div className="p-2.5 bg-[#FDF0EE] border border-[#F1B5AC] rounded-lg text-xs text-[#9E3624] font-medium flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 shrink-0 text-[#9E3624]" />
                      <span>
                        Maker-Checker Rule: You initiated this request ({req.requester}). Dual-custody policy strictly prohibits you from approving it. An independent authorized officer must sign off.
                      </span>
                    </div>
                  )}

                  {/* Inactive User Warning */}
                  {isUserInactive && req.status === 'Pending' && !isInitiator && (
                    <div className="p-2.5 bg-[#FDF0EE] border border-[#F1B5AC] rounded-lg text-xs text-[#9E3624] font-medium flex items-center gap-2">
                      <ShieldAlert className="w-4 h-4 shrink-0 text-[#9E3624]" />
                      <span>
                        Security Violation: Your user profile is currently set to Inactive. Dual-custody approvals are blocked until re-activated.
                      </span>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </Card>

      {/* 2. MODULE × ACTION PERMISSION MATRIX */}
      <Card variant="surface" className="p-6 border-[#EADFC8] space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#EADFC8]">
          <div>
            <h2 className="font-serif text-xl font-bold text-[#5A4630] flex items-center gap-2">
              <KeyRound className="w-5 h-5 text-[#C9A24B]" />
              Module × Action Permissions Matrix
            </h2>
            <p className="text-xs text-[#7A6A55] mt-0.5">
              Inspect granular capabilities (View, Create, Edit, Approve) across all 7 operational roles.
            </p>
          </div>

          {/* Quick Role Inspector Tabs */}
          <div className="flex items-center gap-1.5 flex-wrap">
            {ALL_ROLES.map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => setSelectedRole(r)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  selectedRole === r
                    ? 'bg-[#C9A24B] text-white shadow-xs'
                    : 'bg-white border border-[#EADFC8] text-[#5A4630] hover:bg-[#F8EFD9]'
                }`}
              >
                {r}
              </button>
            ))}
          </div>
        </div>

        {/* Selected Role Summary Bar */}
        <div className="p-4 bg-[#FFFBF3] border border-[#EADFC8] rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="space-y-0.5">
            <div className="font-bold text-[#5A4630] text-sm flex items-center gap-2">
              <span>Inspecting Role: {selectedRole}</span>
              {selectedRole === 'Auditor' && (
                <Badge variant="neutral" size="sm">Strictly Read-Only</Badge>
              )}
              {selectedRole === activeRole && (
                <Badge variant="gold" size="sm">Current Active Role</Badge>
              )}
            </div>
            <div className="text-[#7A6A55]">
              {selectedRole === 'Super Admin' && 'Unrestricted root clearance across bullion pricing, dispatch, audit, and settings. Cannot self-approve own requests.'}
              {selectedRole === 'Pricing' && 'Governs spot rate feeds, manual spreads, and dynamic formulas.'}
              {selectedRole === 'Catalogue' && 'Manages product specifications, purity certificates, and gemstone imagery.'}
              {selectedRole === 'Warehouse' && 'Supervises physical vault inventory, reservations, and dispatch custody.'}
              {selectedRole === 'Support' && 'Manages customer profiles, address books, and cancellation requests.'}
              {selectedRole === 'Finance' && 'Authorizes ERP tax invoice attachment, bullion refunds, and accounting reconciliation.'}
              {selectedRole === 'Auditor' && 'Read-only supervisory inspection across all transaction logs and custody vaults.'}
            </div>
          </div>

          {selectedRole !== activeRole && (
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setActiveRole(selectedRole)}
              className="bg-white shrink-0"
            >
              Switch Active Role to {selectedRole}
            </Button>
          )}
        </div>

        {/* The Matrix Table */}
        <div className="overflow-x-auto rounded-xl border border-[#EADFC8]">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-[#F8EFD9] text-[#5A4630] border-b border-[#EADFC8]">
                <th className="p-3.5 font-bold uppercase tracking-wider text-[11px]">System Module</th>
                <th className="p-3.5 font-bold uppercase tracking-wider text-[11px] text-center w-24">View</th>
                <th className="p-3.5 font-bold uppercase tracking-wider text-[11px] text-center w-24">Create</th>
                <th className="p-3.5 font-bold uppercase tracking-wider text-[11px] text-center w-24">Edit</th>
                <th className="p-3.5 font-bold uppercase tracking-wider text-[11px] text-center w-24">Approve</th>
                <th className="p-3.5 font-bold uppercase tracking-wider text-[11px] hidden md:table-cell">Module Scope</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EADFC8] bg-white">
              {ADMIN_MODULES.map((mod) => {
                const perms = mod.permissions[selectedRole];
                return (
                  <tr key={mod.moduleName} className="hover:bg-[#FFFBF3] transition-colors">
                    <td className="p-3.5 font-serif font-bold text-[#5A4630]">
                      {mod.moduleName}
                    </td>

                    {/* View */}
                    <td className="p-3.5 text-center">
                      {perms.view ? (
                        <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-[#DCE8D5] text-[#2D5A27]">
                          <Check className="w-3.5 h-3.5 stroke-[3]" />
                        </span>
                      ) : (
                        <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-[#FDF0EE] text-[#9E3624]">
                          <X className="w-3.5 h-3.5 stroke-[2.5]" />
                        </span>
                      )}
                    </td>

                    {/* Create */}
                    <td className="p-3.5 text-center">
                      {perms.create ? (
                        <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-[#DCE8D5] text-[#2D5A27]">
                          <Check className="w-3.5 h-3.5 stroke-[3]" />
                        </span>
                      ) : (
                        <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-[#FDF0EE] text-[#9E3624]">
                          <X className="w-3.5 h-3.5 stroke-[2.5]" />
                        </span>
                      )}
                    </td>

                    {/* Edit */}
                    <td className="p-3.5 text-center">
                      {perms.edit ? (
                        <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-[#DCE8D5] text-[#2D5A27]">
                          <Check className="w-3.5 h-3.5 stroke-[3]" />
                        </span>
                      ) : (
                        <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-[#FDF0EE] text-[#9E3624]">
                          <X className="w-3.5 h-3.5 stroke-[2.5]" />
                        </span>
                      )}
                    </td>

                    {/* Approve */}
                    <td className="p-3.5 text-center">
                      {perms.approve ? (
                        <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-[#DCE8D5] text-[#2D5A27]">
                          <Check className="w-3.5 h-3.5 stroke-[3]" />
                        </span>
                      ) : (
                        <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-[#FDF0EE] text-[#9E3624]">
                          <X className="w-3.5 h-3.5 stroke-[2.5]" />
                        </span>
                      )}
                    </td>

                    {/* Description */}
                    <td className="p-3.5 text-[11px] text-[#7A6A55] hidden md:table-cell">
                      {mod.description}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>

      {/* 3. INITIATE DUAL-CUSTODY REQUEST MODAL */}
      <Modal
        isOpen={makerCheckerModalOpen}
        onClose={() => setMakerCheckerModalOpen(false)}
        title="Initiate Dual-Custody Approval Request"
        maxWidth="md"
      >
        <form onSubmit={handleCreateRequest} className="space-y-4 text-xs">
          <div className="p-3 bg-[#FFFBF3] border border-[#EADFC8] rounded-xl text-[#5A4630] space-y-1">
            <div><strong>Maker (Requester):</strong> {currentActor} ({activeRole})</div>
            <div className="text-[11px] text-[#7A6A55]">
              Under dual-custody segregation of duties, you will be prohibited from approving your own request.
            </div>
          </div>

          <div>
            <label className="block text-[#5A4630] font-semibold mb-1">
              Approval Type (All 6 Types Supported) *
            </label>
            <select
              value={reqType}
              onChange={(e) => setReqType(e.target.value as ApprovalType)}
              className="w-full px-3 py-2 bg-white border border-[#EADFC8] rounded-lg text-[#5A4630] focus:outline-none focus:ring-2 focus:ring-[#C9A24B]"
            >
              <option value="price_override">Price Override (Spot Rate Feed Latency / Spread)</option>
              <option value="high_value_refund">High-Value Refund (&gt; ₹1,00,000 Secondary Sign-off)</option>
              <option value="stock_adjustment">Stock Adjustment (Delta × Cost &gt; ₹1,00,000)</option>
              <option value="compliance_edit">Compliance Edit (BIS Hallmark / HUID / Certificate / Checklist)</option>
              <option value="low_margin_quote">Low-Margin Quote (Gross Margin &lt; 10% Floor)</option>
              <option value="credit_terms">Credit Terms (Corporate Net Settlement Terms)</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[#5A4630] font-semibold mb-1">
                Entity Identifier *
              </label>
              <input
                type="text"
                value={reqEntityId}
                onChange={(e) => setReqEntityId(e.target.value)}
                placeholder="e.g. SKU-AU24-01 or ORD-2026-004"
                required
                className="w-full px-3 py-2 bg-white border border-[#EADFC8] rounded-lg text-[#5A4630] font-mono focus:outline-none focus:ring-2 focus:ring-[#C9A24B]"
              />
            </div>

            <div>
              <label className="block text-[#5A4630] font-semibold mb-1">
                Financial Amount (₹, optional)
              </label>
              <input
                type="number"
                value={reqAmount}
                onChange={(e) => setReqAmount(e.target.value ? Number(e.target.value) : '')}
                placeholder="e.g. 150000"
                className="w-full px-3 py-2 bg-white border border-[#EADFC8] rounded-lg text-[#5A4630] font-mono focus:outline-none focus:ring-2 focus:ring-[#C9A24B]"
              />
            </div>
          </div>

          <div>
            <label className="block text-[#5A4630] font-semibold mb-1">
              Request Title / Action Summary *
            </label>
            <input
              type="text"
              value={reqTitle}
              onChange={(e) => setReqTitle(e.target.value)}
              placeholder="e.g. Stock Write-Off 2 units 50g Gold Bars"
              required
              className="w-full px-3 py-2 bg-white border border-[#EADFC8] rounded-lg text-[#5A4630] focus:outline-none focus:ring-2 focus:ring-[#C9A24B]"
            />
          </div>

          <div>
            <label className="block text-[#5A4630] font-semibold mb-1">
              Audit Reason & Justification *
            </label>
            <textarea
              rows={2}
              value={reqReason}
              onChange={(e) => setReqReason(e.target.value)}
              placeholder="State the audit justification, reference ticket, or physical inspection notes..."
              required
              className="w-full px-3 py-2 bg-white border border-[#EADFC8] rounded-lg text-[#5A4630] focus:outline-none focus:ring-2 focus:ring-[#C9A24B]"
            />
          </div>

          <div>
            <label className="block text-[#5A4630] font-semibold mb-1">
              Proposed Change Details
            </label>
            <textarea
              rows={2}
              value={reqDetails}
              onChange={(e) => setReqDetails(e.target.value)}
              placeholder="Details on proposed stock change, margin percent, or certificate reference..."
              className="w-full px-3 py-2 bg-white border border-[#EADFC8] rounded-lg text-[#5A4630] focus:outline-none focus:ring-2 focus:ring-[#C9A24B]"
            />
          </div>

          <div className="pt-2 flex justify-end gap-2 border-t border-[#EADFC8]">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setMakerCheckerModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              leftIcon={<Plus className="w-3.5 h-3.5" />}
            >
              Submit for Checker Approval
            </Button>
          </div>
        </form>
      </Modal>

      {/* 4. REJECT MODAL */}
      <Modal
        isOpen={rejectModalOpen}
        onClose={() => setRejectModalOpen(false)}
        title="Decline Dual-Custody Request"
        maxWidth="sm"
      >
        <form onSubmit={handleConfirmReject} className="space-y-4 text-xs">
          <p className="text-[#7A6A55]">
            Please provide a mandatory audit justification for declining this request. This reason will be immutably recorded in the system audit trail.
          </p>

          <div>
            <label className="block text-[#5A4630] font-semibold mb-1">
              Rejection Reason *
            </label>
            <textarea
              rows={3}
              required
              value={rejectReasonText}
              onChange={(e) => setRejectReasonText(e.target.value)}
              className="w-full px-3 py-2 bg-white border border-[#EADFC8] rounded-lg text-[#5A4630] focus:outline-none focus:ring-2 focus:ring-[#9E3624]"
            />
          </div>

          <div className="pt-2 flex justify-end gap-2 border-t border-[#EADFC8]">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setRejectModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="secondary"
              size="sm"
              className="bg-[#9E3624] text-white hover:bg-[#802213]"
            >
              Confirm Rejection
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
