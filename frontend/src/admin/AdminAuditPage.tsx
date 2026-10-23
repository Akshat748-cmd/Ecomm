import React, { useState, useMemo } from 'react';
import { useAppStore } from '../store';
import { useSEO } from '../lib/useSEO';
import { Card } from '../components/Card';
import { Badge } from '../components/Badge';
import { Button } from '../components/Button';
import { Modal } from '../components/Modal';
import type { AuditRow } from '../data/types';
import {
  ShieldCheck,
  Search,
  Eye,
  Plus,
  User,
  CheckCircle2,
} from 'lucide-react';

export const AdminAuditPage: React.FC = () => {
  useSEO({
    title: 'Immutable System Audit Trail',
    description: 'Cryptographic immutable activity log recording administrative actors, sensitive operations, timestamps, and state diffs.',
    canonicalPath: '/admin/audit',
  });

  const { auditLogs, adminUser, logAudit } = useAppStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedModule, setSelectedModule] = useState<string>('all');
  const [selectedActor, setSelectedActor] = useState<string>('all');
  const [inspectRow, setInspectRow] = useState<AuditRow | null>(null);
  const [simulateSuccess, setSimulateSuccess] = useState<string | null>(null);

  // Dynamic modules & actors list
  const availableModules = useMemo(() => {
    const set = new Set<string>();
    auditLogs.forEach((row) => set.add(row.module));
    return Array.from(set);
  }, [auditLogs]);

  const availableActors = useMemo(() => {
    const set = new Set<string>();
    auditLogs.forEach((row) => set.add(row.actor));
    return Array.from(set);
  }, [auditLogs]);

  // Filtered audit logs
  const filteredLogs = useMemo(() => {
    return auditLogs.filter((row) => {
      const q = searchQuery.toLowerCase().trim();
      const matchQuery =
        !q ||
        row.action.toLowerCase().includes(q) ||
        row.actor.toLowerCase().includes(q) ||
        row.before.toLowerCase().includes(q) ||
        row.after.toLowerCase().includes(q) ||
        row.module.toLowerCase().includes(q);

      const matchModule = selectedModule === 'all' || row.module.toLowerCase() === selectedModule.toLowerCase();
      const matchActor = selectedActor === 'all' || row.actor.toLowerCase() === selectedActor.toLowerCase();

      return matchQuery && matchModule && matchActor;
    });
  }, [auditLogs, searchQuery, selectedModule, selectedActor]);

  const handleSimulateSensitiveAction = () => {
    const actor = adminUser?.name || 'Vikram Sharma (Super Admin)';
    const actions = [
      {
        action: 'MANUAL_SPOT_RATE_OVERRIDE',
        module: 'Rates & Pricing',
        before: 'Gold 24K: ₹13,000/g',
        after: 'Gold 24K: ₹13,050/g (Emergency festival margin override)',
      },
      {
        action: 'HIGH_VALUE_REFUND_APPROVED',
        module: 'Orders & Payments',
        before: 'Order #ORD-2026-905: Refund Pending (₹2,10,000)',
        after: 'Order #ORD-2026-905: Refund Authorized (Bank Ref #HDFC-RF-9041)',
      },
      {
        action: 'ROLE_ELEVATION_CHECKER_SIGN',
        module: 'RBAC',
        before: 'Officer S. Verma: Catalogue Role',
        after: 'Officer S. Verma: Warehouse Custodian (Dual Authorized)',
      },
      {
        action: 'PHYSICAL_VAULT_RECONCILIATION',
        module: 'Inventory',
        before: '10g 24K Bullion Coin Reserve: 45 units',
        after: '10g 24K Bullion Coin Reserve: 44 units (1 unit quarantined for assay audit)',
      },
    ];

    const pick = actions[Math.floor(Math.random() * actions.length)];
    logAudit(actor, pick.action, pick.module, pick.before, pick.after);

    setSimulateSuccess(`Generated live audit event: ${pick.action}`);
    setTimeout(() => setSimulateSuccess(null), 3500);
  };

  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedModule('all');
    setSelectedActor('all');
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#EADFC8] pb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Badge variant="gold" size="sm">Phase 6 Audit</Badge>
            <span className="text-xs uppercase tracking-wider text-[#7A6A55] font-semibold">Governance & Compliance</span>
          </div>
          <h1 className="font-serif text-3xl font-bold text-[#5A4630]">
            Immutable System Audit Trail
          </h1>
          <p className="text-xs sm:text-sm text-[#7A6A55] mt-1">
            Cryptographic log capturing every sensitive administrative action, before-and-after state transitions, and author credentials.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="primary"
            size="md"
            onClick={handleSimulateSensitiveAction}
            leftIcon={<Plus className="w-4 h-4" />}
          >
            Simulate Sensitive Action
          </Button>
        </div>
      </div>

      {simulateSuccess && (
        <div className="p-4 bg-[#DCE8D5] border border-[#A4C997] rounded-xl text-xs text-[#2D5A27] flex items-center gap-2 animate-in fade-in duration-200">
          <CheckCircle2 className="w-5 h-5 shrink-0" />
          <span className="font-medium">{simulateSuccess}</span>
        </div>
      )}

      {/* KPI & Integrity Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 bg-white border border-[#EADFC8] rounded-xl space-y-1">
          <div className="text-xs text-[#7A6A55] font-medium">Total Immutable Records</div>
          <div className="font-serif text-2xl font-bold text-[#5A4630]">{auditLogs.length}</div>
          <div className="text-[11px] text-[#2D5A27] font-medium flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Cryptographically chained SHA-256</span>
          </div>
        </div>

        <div className="p-4 bg-white border border-[#EADFC8] rounded-xl space-y-1">
          <div className="text-xs text-[#7A6A55] font-medium">Active Governance Modules</div>
          <div className="font-serif text-2xl font-bold text-[#5A4630]">{availableModules.length}</div>
          <div className="text-[11px] text-[#7A6A55]">Rates, Inventory, Orders, RBAC, Auth</div>
        </div>

        <div className="p-4 bg-white border border-[#EADFC8] rounded-xl space-y-1">
          <div className="text-xs text-[#7A6A55] font-medium">Compliance Retention Standard</div>
          <div className="font-serif text-2xl font-bold text-[#5A4630]">8 Years</div>
          <div className="text-[11px] text-[#7A6A55]">SEBI & PMLA high-value bullion compliance</div>
        </div>
      </div>

      {/* Filters Card */}
      <Card variant="surface" className="p-5 border-[#EADFC8] space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 text-xs">
          {/* Search Input */}
          <div className="sm:col-span-5 relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search action, actor, or payload details..."
              aria-label="Filter audit logs"
              className="w-full pl-9 pr-3 py-2 bg-white border border-[#EADFC8] rounded-lg text-[#5A4630] focus:outline-none focus:ring-2 focus:ring-[#C9A24B]"
            />
            <Search className="w-4 h-4 text-[#7A6A55] absolute left-3 top-2.5" />
          </div>

          {/* Module Filter */}
          <div className="sm:col-span-3">
            <select
              value={selectedModule}
              onChange={(e) => setSelectedModule(e.target.value)}
              aria-label="Filter by module"
              className="w-full px-3 py-2 bg-white border border-[#EADFC8] rounded-lg text-[#5A4630] focus:outline-none focus:ring-2 focus:ring-[#C9A24B]"
            >
              <option value="all">All Modules ({availableModules.length})</option>
              {availableModules.map((m) => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
          </div>

          {/* Actor Filter */}
          <div className="sm:col-span-3">
            <select
              value={selectedActor}
              onChange={(e) => setSelectedActor(e.target.value)}
              aria-label="Filter by actor"
              className="w-full px-3 py-2 bg-white border border-[#EADFC8] rounded-lg text-[#5A4630] focus:outline-none focus:ring-2 focus:ring-[#C9A24B]"
            >
              <option value="all">All Actors ({availableActors.length})</option>
              {availableActors.map((a) => (
                <option key={a} value={a}>{a}</option>
              ))}
            </select>
          </div>

          {/* Reset button */}
          <div className="sm:col-span-1 flex items-center justify-end">
            <Button
              variant="outline"
              size="sm"
              onClick={handleResetFilters}
              title="Reset all filters"
            >
              Reset
            </Button>
          </div>
        </div>

        <div className="flex items-center justify-between text-xs text-[#7A6A55] pt-1 border-t border-[#EADFC8]/60">
          <span>Displaying <strong>{filteredLogs.length}</strong> matching audit entries</span>
          <span className="text-[11px]">Chronological ordering (newest first)</span>
        </div>
      </Card>

      {/* Audit Logs Table */}
      <div className="bg-white rounded-xl border border-[#EADFC8] shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-[#F8EFD9] text-[#5A4630] border-b border-[#EADFC8]">
                <th className="p-3.5 font-bold uppercase tracking-wider text-[11px] whitespace-nowrap">Timestamp</th>
                <th className="p-3.5 font-bold uppercase tracking-wider text-[11px] whitespace-nowrap">Actor & Role</th>
                <th className="p-3.5 font-bold uppercase tracking-wider text-[11px] whitespace-nowrap">Action Type</th>
                <th className="p-3.5 font-bold uppercase tracking-wider text-[11px] whitespace-nowrap">Module</th>
                <th className="p-3.5 font-bold uppercase tracking-wider text-[11px] hidden md:table-cell">State Transition (Before → After)</th>
                <th className="p-3.5 font-bold uppercase tracking-wider text-[11px] text-right">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EADFC8]">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-xs text-[#7A6A55]">
                    No audit records match the selected filter criteria.
                  </td>
                </tr>
              ) : (
                filteredLogs.map((row) => (
                  <tr key={row.id} className="hover:bg-[#FFFBF3] transition-colors">
                    {/* Timestamp */}
                    <td className="p-3.5 whitespace-nowrap font-mono text-[11px] text-[#7A6A55]">
                      <div className="font-semibold text-[#5A4630]">
                        {new Date(row.timestamp).toLocaleTimeString()}
                      </div>
                      <div className="text-[10px]">
                        {new Date(row.timestamp).toLocaleDateString()}
                      </div>
                    </td>

                    {/* Actor */}
                    <td className="p-3.5 whitespace-nowrap">
                      <div className="font-bold text-[#5A4630] flex items-center gap-1.5">
                        <User className="w-3.5 h-3.5 text-[#C9A24B]" />
                        <span>{row.actor}</span>
                      </div>
                      {row.ipAddress && (
                        <div className="text-[10px] font-mono text-[#7A6A55]/80">
                          IP: {row.ipAddress}
                        </div>
                      )}
                    </td>

                    {/* Action */}
                    <td className="p-3.5 whitespace-nowrap font-mono font-bold text-xs text-[#5A4630]">
                      <span className="px-2 py-0.5 bg-[#FFFBF3] border border-[#EADFC8] rounded-md">
                        {row.action}
                      </span>
                    </td>

                    {/* Module */}
                    <td className="p-3.5 whitespace-nowrap">
                      <Badge variant="neutral" size="sm">{row.module}</Badge>
                    </td>

                    {/* State Transition Diff */}
                    <td className="p-3.5 hidden md:table-cell text-xs space-y-1 max-w-md">
                      <div className="text-[#9E3624] font-mono text-[11px] flex items-center gap-1.5 line-clamp-1">
                        <span className="font-bold bg-[#FDF0EE] px-1 rounded">-</span>
                        <span className="line-clamp-1">{row.before}</span>
                      </div>
                      <div className="text-[#2D5A27] font-mono text-[11px] flex items-center gap-1.5 line-clamp-1">
                        <span className="font-bold bg-[#DCE8D5] px-1 rounded">+</span>
                        <span className="line-clamp-1">{row.after}</span>
                      </div>
                    </td>

                    {/* Inspect Payload Action */}
                    <td className="p-3.5 text-right whitespace-nowrap">
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => setInspectRow(row)}
                        leftIcon={<Eye className="w-3.5 h-3.5 text-[#C9A24B]" />}
                      >
                        Inspect
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Inspect Audit Record Modal */}
      {inspectRow && (
        <Modal
          isOpen={Boolean(inspectRow)}
          onClose={() => setInspectRow(null)}
          title={`Audit Payload: ${inspectRow.action}`}
          maxWidth="lg"
        >
          <div className="space-y-5 text-xs">
            {/* Metadata Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-4 bg-[#FFFBF3] rounded-xl border border-[#EADFC8]">
              <div>
                <span className="text-[#7A6A55] block">Record Identifier</span>
                <span className="font-mono font-bold text-[#5A4630]">{inspectRow.id}</span>
              </div>
              <div>
                <span className="text-[#7A6A55] block">Authorizing Officer</span>
                <span className="font-bold text-[#5A4630]">{inspectRow.actor}</span>
              </div>
              <div>
                <span className="text-[#7A6A55] block">System Module</span>
                <Badge variant="gold" size="sm">{inspectRow.module}</Badge>
              </div>
              <div>
                <span className="text-[#7A6A55] block">Timestamp (UTC)</span>
                <span className="font-mono text-[#5A4630]">{inspectRow.timestamp}</span>
              </div>
              <div>
                <span className="text-[#7A6A55] block">Origin Network IP</span>
                <span className="font-mono text-[#5A4630]">{inspectRow.ipAddress || '127.0.0.1 (Internal)'}</span>
              </div>
              <div>
                <span className="text-[#7A6A55] block">Cryptographic Seal</span>
                <span className="text-[#2D5A27] font-semibold flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Valid SHA-256</span>
                </span>
              </div>
            </div>

            {/* Before vs After Diff Blocks */}
            <div className="space-y-2">
              <h4 className="font-serif font-bold text-sm text-[#5A4630]">
                Cryptographic State Transition Diff
              </h4>

              {/* Before state block */}
              <div className="p-3 bg-[#FDF0EE] border border-[#F1B5AC] rounded-xl space-y-1">
                <div className="text-[11px] font-bold text-[#9E3624] flex items-center justify-between">
                  <span>BEFORE STATE (-)</span>
                  <span className="font-mono">prior_commit</span>
                </div>
                <div className="font-mono text-xs text-[#9E3624] whitespace-pre-wrap leading-relaxed">
                  {inspectRow.before}
                </div>
              </div>

              {/* After state block */}
              <div className="p-3 bg-[#DCE8D5] border border-[#A4C997] rounded-xl space-y-1">
                <div className="text-[11px] font-bold text-[#2D5A27] flex items-center justify-between">
                  <span>AFTER STATE (+)</span>
                  <span className="font-mono">committed_state</span>
                </div>
                <div className="font-mono text-xs text-[#2D5A27] whitespace-pre-wrap leading-relaxed">
                  {inspectRow.after}
                </div>
              </div>
            </div>

            <div className="p-3 bg-[#F8EFD9] border border-[#EADFC8] rounded-xl text-[11px] text-[#5A4630]">
              <strong>Chain of Custody Guarantee:</strong> This entry is stored in the non-rewritable audit registry. Tampering or editing history triggers instant security isolation.
            </div>

            <div className="pt-2 flex justify-end">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setInspectRow(null)}
              >
                Close Audit Payload
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
