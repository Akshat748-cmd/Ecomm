import React, { useState } from 'react';
import { useAppStore } from '../store';
import { useSEO } from '../lib/useSEO';
import { Card } from '../components/Card';
import { Badge } from '../components/Badge';
import { Button } from '../components/Button';
import { Modal } from '../components/Modal';
import { ADMIN_MODULES } from '../lib/adminPermissions';
import type { AdminRole } from '../data/types';
import {
  KeyRound,
  ShieldCheck,
  ShieldAlert,
  Check,
  X,
  CheckCircle2,
  Plus,
  AlertTriangle,
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

export const AdminRolesPage: React.FC = () => {
  useSEO({
    title: 'Roles & Permissions (RBAC Matrix)',
    description: 'Module × Action permissions matrix and maker-checker segregation protocols for institutional security.',
    canonicalPath: '/admin/roles',
  });

  const {
    adminUser,
    activeRole,
    makerCheckerRequests,
    setActiveRole,
    createMakerCheckerRequest,
    approveMakerCheckerRequest,
    rejectMakerCheckerRequest,
  } = useAppStore();

  const [selectedRole, setSelectedRole] = useState<AdminRole>(activeRole);
  const [makerCheckerModalOpen, setMakerCheckerModalOpen] = useState(false);
  const [reqTitle, setReqTitle] = useState('');
  const [reqModule, setReqModule] = useState('Rates and Pricing');
  const [reqDetails, setReqDetails] = useState('');
  const [makerCheckerError, setMakerCheckerError] = useState<string | null>(null);
  const [makerCheckerSuccess, setMakerCheckerSuccess] = useState<string | null>(null);

  const currentActor = adminUser?.name || 'Vikram Sharma';

  const handleCreateRequest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reqTitle.trim() || !reqDetails.trim()) return;

    createMakerCheckerRequest(reqTitle.trim(), reqModule, reqDetails.trim(), currentActor);
    setReqTitle('');
    setReqDetails('');
    setMakerCheckerModalOpen(false);
    setMakerCheckerSuccess('Maker-Checker dual authorization request initiated.');
    setTimeout(() => setMakerCheckerSuccess(null), 4000);
  };

  const handleApprove = (reqId: string) => {
    setMakerCheckerError(null);
    setMakerCheckerSuccess(null);
    const result = approveMakerCheckerRequest(reqId, currentActor);
    if (!result.success) {
      setMakerCheckerError(result.error || 'Approval failed.');
    } else {
      setMakerCheckerSuccess('Request approved successfully and logged to Immutable Audit Trail.');
      setTimeout(() => setMakerCheckerSuccess(null), 4000);
    }
  };

  const handleReject = (reqId: string) => {
    setMakerCheckerError(null);
    setMakerCheckerSuccess(null);
    const result = rejectMakerCheckerRequest(reqId, currentActor, 'Declined during secondary inspection');
    if (!result.success) {
      setMakerCheckerError(result.error || 'Rejection failed.');
    } else {
      setMakerCheckerSuccess('Request marked as rejected and logged to Audit Trail.');
      setTimeout(() => setMakerCheckerSuccess(null), 4000);
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
            Role-Based Access Control (RBAC) & Maker-Checker
          </h1>
          <p className="text-xs sm:text-sm text-[#7A6A55] mt-1">
            Least privilege permission matrix and dual-custody authorization for high-value precious commodity operations.
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

      {/* 1. MAKER-CHECKER WORKFLOW QUEUE */}
      <Card variant="surface" className="p-6 border-[#EADFC8] space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#EADFC8]">
          <div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-[#C9A24B]" />
              <h2 className="font-serif text-lg font-bold text-[#5A4630]">
                Maker-Checker Pending Approvals
              </h2>
              <Badge variant="gold" size="sm">Dual Custody</Badge>
            </div>
            <p className="text-xs text-[#7A6A55] mt-0.5">
              Maker-checker rule: Whoever raised a sensitive request cannot approve it. An independent authorized officer must sign off.
            </p>
          </div>

          <div className="text-xs text-[#5A4630] font-semibold bg-[#FFFBF3] px-3 py-1.5 rounded-lg border border-[#EADFC8]">
            Active Officer: <span className="text-[#C9A24B]">{currentActor}</span> ({activeRole})
          </div>
        </div>

        <div className="space-y-3">
          {makerCheckerRequests.map((req) => {
            const isInitiator =
              req.initiator.toLowerCase().includes(currentActor.toLowerCase()) ||
              currentActor.toLowerCase().includes(req.initiator.toLowerCase());

            return (
              <div
                key={req.id}
                className="p-4 rounded-xl border border-[#EADFC8] bg-white space-y-3 hover:border-[#C9A24B] transition-colors"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-serif text-sm font-bold text-[#5A4630]">
                        {req.title}
                      </span>
                      <Badge variant="neutral" size="sm">{req.module}</Badge>
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
                    </div>
                    <div className="text-xs text-[#7A6A55]">
                      Initiated by: <strong>{req.initiator}</strong> • {new Date(req.createdAt).toLocaleString()}
                    </div>
                  </div>

                  {req.status === 'Pending' && (
                    <div className="flex items-center gap-2 pt-2 sm:pt-0">
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => handleApprove(req.id)}
                        disabled={activeRole === 'Auditor'}
                        title={isInitiator ? 'Maker-Checker Violation: Initiator cannot approve' : 'Approve request'}
                      >
                        Approve
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleReject(req.id)}
                        disabled={activeRole === 'Auditor'}
                      >
                        Reject
                      </Button>
                    </div>
                  )}

                  {req.status !== 'Pending' && (
                    <div className="text-xs text-[#7A6A55] sm:text-right">
                      <div>Decided by: <strong>{req.approver || 'Super Admin'}</strong></div>
                      {req.resolvedAt && (
                        <div className="text-[11px] text-[#7A6A55]/80">
                          {new Date(req.resolvedAt).toLocaleTimeString()}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <div className="p-3 bg-[#FFFBF3] rounded-lg border border-[#EADFC8]/60 text-xs text-[#7A6A55]">
                  {req.details}
                </div>

                {isInitiator && req.status === 'Pending' && (
                  <div className="text-[11px] text-[#9E3624] font-medium flex items-center gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    <span>You initiated this request. Maker-checker policy prohibits you from approving it.</span>
                  </div>
                )}
              </div>
            );
          })}
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
              {selectedRole === 'Super Admin' && 'Unrestricted root clearance across bullion pricing, dispatch, audit, and settings.'}
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

      {/* 3. INITIATE MAKER-CHECKER MODAL */}
      <Modal
        isOpen={makerCheckerModalOpen}
        onClose={() => setMakerCheckerModalOpen(false)}
        title="Initiate Dual-Authorization Request"
        maxWidth="md"
      >
        <form onSubmit={handleCreateRequest} className="space-y-4 text-xs">
          <div className="p-3 bg-[#FFFBF3] border border-[#EADFC8] rounded-xl text-[#5A4630] space-y-1">
            <div><strong>Maker:</strong> {currentActor} ({activeRole})</div>
            <div className="text-[11px] text-[#7A6A55]">
              As the initiator (maker), you will be prohibited from approving this request under dual-custody rules.
            </div>
          </div>

          <div>
            <label className="block text-[#5A4630] font-semibold mb-1">
              Operational Module
            </label>
            <select
              value={reqModule}
              onChange={(e) => setReqModule(e.target.value)}
              className="w-full px-3 py-2 bg-white border border-[#EADFC8] rounded-lg text-[#5A4630] focus:outline-none focus:ring-2 focus:ring-[#C9A24B]"
            >
              <option value="Rates and Pricing">Rates and Pricing</option>
              <option value="Orders & Payments">Orders & Payments</option>
              <option value="Inventory">Inventory & Vault</option>
              <option value="Compliance">Compliance & Legal</option>
              <option value="Roles & Permissions">Roles & Permissions</option>
            </select>
          </div>

          <div>
            <label className="block text-[#5A4630] font-semibold mb-1">
              Request Title / Action Summary
            </label>
            <input
              type="text"
              value={reqTitle}
              onChange={(e) => setReqTitle(e.target.value)}
              placeholder="e.g. Manual Bullion Rate Spread Adjustment"
              required
              className="w-full px-3 py-2 bg-white border border-[#EADFC8] rounded-lg text-[#5A4630] focus:outline-none focus:ring-2 focus:ring-[#C9A24B]"
            />
          </div>

          <div>
            <label className="block text-[#5A4630] font-semibold mb-1">
              Justification & Impact Details
            </label>
            <textarea
              rows={3}
              value={reqDetails}
              onChange={(e) => setReqDetails(e.target.value)}
              placeholder="State the justification, amounts involved, and reference documents..."
              required
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
    </div>
  );
};
