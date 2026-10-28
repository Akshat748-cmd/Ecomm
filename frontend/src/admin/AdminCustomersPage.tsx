import React, { useState, useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useAppStore } from '../store';
import { useSEO } from '../lib/useSEO';
import { formatINR } from '../lib/pricing';
import { Card } from '../components/Card';
import { Badge } from '../components/Badge';
import { Button } from '../components/Button';
import { Modal } from '../components/Modal';
import type { Customer, CustomerSupportInteraction } from '../data/types';
import {
  Users,
  Search,
  ShieldCheck,
  ShieldAlert,
  Mail,
  MapPin,
  Calendar,
  CheckCircle2,
  XCircle,
  FileText,
  Headphones,
  Plus,
  AlertTriangle,
  ExternalLink,
  Sparkles,
  MessageSquare,
  TrendingUp,
  Eye,
  EyeOff,
} from 'lucide-react';
import { maskPan, maskPhone, maskTextPII, canRevealPII, formatRevealAuditEntry } from '../lib/masking';

export const AdminCustomersPage: React.FC = () => {
  useSEO({
    title: 'Customer Directory & High-Value Investor Intelligence',
    description: 'Investor profiles, statutory communication consent records, order custody logs, service notes, and fraud risk flags.',
    canonicalPath: '/admin/customers',
  });

  const [searchParams, setSearchParams] = useSearchParams();
  const selectedCustomerIdFromUrl = searchParams.get('id');

  const {
    customers,
    orders,
    adminUser,
    activeRole,
    logAudit,
    addCustomerNote,
    toggleCustomerFraudFlag,
    updateCustomerConsents,
    addCustomerSupportInteraction,
  } = useAppStore();

  const currentActor = adminUser?.name || 'Vikram Sharma';
  const canManageCustomers = activeRole === 'Super Admin' || activeRole === 'Support' || activeRole === 'Finance';

  // Search & Filter State
  const [searchTerm, setSearchTerm] = useState('');
  const [verifiedFilter, setVerifiedFilter] = useState<'All' | 'Verified' | 'Unverified'>('All');
  const [riskFilter, setRiskFilter] = useState<'All' | 'Flagged' | 'Clean'>('All');

  // Selected Customer (default to URL param, or first customer)
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>(
    selectedCustomerIdFromUrl || customers[0]?.id || ''
  );

  const selectedCustomer = useMemo(() => {
    return customers.find((c) => c.id === selectedCustomerId) || customers[0];
  }, [customers, selectedCustomerId]);

  // Update URL param when customer selected
  const handleSelectCustomer = (id: string) => {
    setSelectedCustomerId(id);
    setSearchParams({ id });
  };

  // Filtered Customers List
  const filteredCustomers = useMemo(() => {
    return customers.filter((c) => {
      const matchSearch =
        c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.phone.includes(searchTerm) ||
        c.addresses.some((a) => a.city.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchVerified =
        verifiedFilter === 'All' ||
        (verifiedFilter === 'Verified' && c.isVerified) ||
        (verifiedFilter === 'Unverified' && !c.isVerified);

      const matchRisk =
        riskFilter === 'All' ||
        (riskFilter === 'Flagged' && c.fraudFlag) ||
        (riskFilter === 'Clean' && !c.fraudFlag);

      return matchSearch && matchVerified && matchRisk;
    });
  }, [customers, searchTerm, verifiedFilter, riskFilter]);

  // Customer's Orders
  const customerOrders = useMemo(() => {
    if (!selectedCustomer) return [];
    return orders.filter(
      (o) =>
        o.customerId === selectedCustomer.id ||
        o.customerEmail.toLowerCase() === selectedCustomer.email.toLowerCase()
    );
  }, [orders, selectedCustomer]);

  // Action Notice Toast
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  // Modal: Add Note
  const [addNoteModalOpen, setAddNoteModalOpen] = useState(false);
  const [newNoteText, setNewNoteText] = useState('');
  const [selectedOrderForNote, setSelectedOrderForNote] = useState('');

  // Modal: Log Support Interaction
  const [supportModalOpen, setSupportModalOpen] = useState(false);
  const [supportChannel, setSupportChannel] = useState<CustomerSupportInteraction['channel']>('Phone Concierge');
  const [supportSubject, setSupportSubject] = useState('');
  const [supportSummary, setSupportSummary] = useState('');
  const [supportStatus, setSupportStatus] = useState<CustomerSupportInteraction['status']>('Resolved');

  // Modal: Fraud Flag Confirmation
  const [fraudModalOpen, setFraudModalOpen] = useState(false);
  const [fraudReason, setFraudReason] = useState('Manual risk officer discretion: Suspicious high-value velocity pattern');

  // PII Reveal State (Super Admin & Finance only)
  const [revealedFields, setRevealedFields] = useState<Record<string, boolean>>({});

  const handleReveal = (customerId: string, customerName: string, field: 'PAN' | 'Phone') => {
    if (!canRevealPII(activeRole)) return;
    const key = `${customerId}-${field.toLowerCase()}`;
    const isCurrentlyRevealed = !!revealedFields[key];

    if (!isCurrentlyRevealed) {
      const audit = formatRevealAuditEntry(currentActor, customerName, field);
      logAudit(audit.actor, audit.action, audit.module, audit.before, audit.after);
      setActionNotice(`[AUDIT LOGGED] PII revealed for ${customerName} (${field}). Recorded in Immutable Audit Trail.`);
      setTimeout(() => setActionNotice(null), 4000);
    }

    setRevealedFields((prev) => ({
      ...prev,
      [key]: !isCurrentlyRevealed,
    }));
  };

  // Handlers
  const handleSaveNote = () => {
    if (!newNoteText.trim() || !selectedCustomer) return;
    const targetOrder = customerOrders.find((o) => o.id === selectedOrderForNote || o.orderNumber === selectedOrderForNote);
    addCustomerNote(
      selectedCustomer.id,
      newNoteText.trim(),
      currentActor,
      targetOrder?.id,
      targetOrder?.orderNumber
    );
    setNewNoteText('');
    setSelectedOrderForNote('');
    setAddNoteModalOpen(false);
    setActionNotice(`Note added to ${selectedCustomer.name}'s profile.`);
    setTimeout(() => setActionNotice(null), 3000);
  };

  const handleToggleFraud = () => {
    if (!selectedCustomer) return;
    toggleCustomerFraudFlag(selectedCustomer.id, currentActor, fraudReason);
    setFraudModalOpen(false);
    setActionNotice(
      `Fraud Flag ${!selectedCustomer.fraudFlag ? 'ENABLED' : 'CLEARED'} for ${selectedCustomer.name}.`
    );
    setTimeout(() => setActionNotice(null), 3000);
  };

  const handleSaveSupport = () => {
    if (!supportSubject.trim() || !supportSummary.trim() || !selectedCustomer) return;
    addCustomerSupportInteraction(selectedCustomer.id, {
      customerId: selectedCustomer.id,
      channel: supportChannel,
      subject: supportSubject.trim(),
      status: supportStatus,
      summary: supportSummary.trim(),
      officer: currentActor,
    });
    setSupportSubject('');
    setSupportSummary('');
    setSupportModalOpen(false);
    setActionNotice(`Support interaction logged for ${selectedCustomer.name}.`);
    setTimeout(() => setActionNotice(null), 3000);
  };

  const handleConsentToggle = (key: keyof Customer['consents']) => {
    if (!selectedCustomer || !canManageCustomers) return;
    const newConsents = {
      ...selectedCustomer.consents,
      [key]: !selectedCustomer.consents[key],
    };
    updateCustomerConsents(selectedCustomer.id, newConsents, currentActor);
    setActionNotice(`Consent preference "${key}" updated for ${selectedCustomer.name}.`);
    setTimeout(() => setActionNotice(null), 3000);
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-serif font-bold text-[#5A4630]">
              Customer Directory & High-Value Intelligence
            </h1>
            <Badge variant="gold">Phase 10</Badge>
          </div>
          <p className="text-sm text-[#7A6A55] mt-1">
            Verified investor profiles, DPDP communication consent logs, order custody history, and fraud risk monitoring.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Badge variant="neutral" className="text-xs">
            {customers.length} Registered Accounts
          </Badge>
          <Badge variant="rose" className="text-xs">
            {customers.filter((c) => c.fraudFlag).length} Flagged
          </Badge>
        </div>
      </div>

      {/* Global Action Banner */}
      {actionNotice && (
        <div className="p-3.5 bg-[#E8F3E6] border border-[#A3D9A5] rounded-lg text-sm text-[#2D5A27] font-medium flex items-center justify-between animate-fade-in shadow-xs">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-[#2D5A27]" />
            <span>{actionNotice}</span>
          </div>
          <button
            onClick={() => setActionNotice(null)}
            className="text-xs text-[#2D5A27] underline cursor-pointer hover:opacity-80"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Main Split Layout: Left Customer List, Right Customer Detail */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Customer Directory List (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <Card className="p-4 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-[#EADFC8]">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-[#C9A24B]" />
                <span className="text-sm font-semibold text-[#5A4630]">Investor Registry</span>
              </div>
              <span className="text-xs text-[#7A6A55]">{filteredCustomers.length} of {customers.length}</span>
            </div>

            {/* Search Input */}
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-[#7A6A55]" />
              <input
                type="text"
                placeholder="Search investor, email, phone, city..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 text-xs bg-[#FFFBF3] border border-[#EADFC8] rounded-md focus:outline-hidden focus:border-[#C9A24B] text-[#5A4630]"
              />
            </div>

            {/* Quick Filter Chips */}
            <div className="flex flex-wrap items-center gap-1.5 text-xs">
              <span className="text-[11px] text-[#7A6A55] font-medium mr-1">Status:</span>
              {(['All', 'Verified', 'Unverified'] as const).map((vf) => (
                <button
                  key={vf}
                  onClick={() => setVerifiedFilter(vf)}
                  className={`px-2 py-0.5 rounded-full text-[11px] font-medium transition-colors cursor-pointer ${
                    verifiedFilter === vf
                      ? 'bg-[#C9A24B] text-white shadow-xs'
                      : 'bg-[#F8EFD9] text-[#7A6A55] hover:text-[#5A4630]'
                  }`}
                >
                  {vf}
                </button>
              ))}

              <span className="text-[11px] text-[#7A6A55] font-medium ml-2 mr-1">Risk:</span>
              {(['All', 'Clean', 'Flagged'] as const).map((rf) => (
                <button
                  key={rf}
                  onClick={() => setRiskFilter(rf)}
                  className={`px-2 py-0.5 rounded-full text-[11px] font-medium transition-colors cursor-pointer ${
                    riskFilter === rf
                      ? rf === 'Flagged' ? 'bg-[#9E2A2B] text-white' : 'bg-[#C9A24B] text-white'
                      : 'bg-[#F8EFD9] text-[#7A6A55] hover:text-[#5A4630]'
                  }`}
                >
                  {rf}
                </button>
              ))}
            </div>

            {/* Customer List Items */}
            <div className="space-y-2 max-h-[640px] overflow-y-auto pr-1">
              {filteredCustomers.length === 0 ? (
                <div className="py-8 text-center text-xs text-[#7A6A55]">
                  No customers found matching filter criteria.
                </div>
              ) : (
                filteredCustomers.map((c) => {
                  const isSelected = selectedCustomer?.id === c.id;
                  const primaryCity = c.addresses[0]?.city || 'India';
                  return (
                    <div
                      key={c.id}
                      onClick={() => handleSelectCustomer(c.id)}
                      className={`p-3 rounded-lg border text-left cursor-pointer transition-all ${
                        isSelected
                          ? 'bg-[#FFFDF9] border-[#C9A24B] shadow-sm ring-1 ring-[#C9A24B]'
                          : 'bg-[#FFFFFF] border-[#EADFC8] hover:border-[#C9A24B]/60 hover:bg-[#FFFBF3]'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="font-semibold text-xs text-[#5A4630] truncate">{c.name}</span>
                            {c.isVerified && (
                              <span title="KYC Verified" className="inline-flex">
                                <ShieldCheck className="w-3.5 h-3.5 text-[#2D5A27] shrink-0" />
                              </span>
                            )}
                            {c.fraudFlag && (
                              <Badge variant="rose" className="text-[10px] py-0 px-1.5">
                                Fraud Flag
                              </Badge>
                            )}
                          </div>
                          <div className="text-[11px] text-[#7A6A55] truncate mt-0.5">{c.email}</div>
                          <div className="text-[10px] text-[#7A6A55] mt-1 flex items-center gap-2">
                            <span className="font-mono">{maskPhone(c.phone, activeRole, revealedFields[`${c.id}-phone`])}</span>
                            <span>•</span>
                            <span>{primaryCity}</span>
                          </div>
                        </div>

                        <div className="text-right shrink-0">
                          <div className="text-xs font-serif font-bold text-[#5A4630]">
                            {formatINR(c.totalSpent)}
                          </div>
                          <div className="text-[10px] text-[#7A6A55] mt-0.5">
                            {c.totalOrders} {c.totalOrders === 1 ? 'order' : 'orders'}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </Card>
        </div>

        {/* Right Column: Detailed Customer Profile & Tabs (7 cols) */}
        <div className="lg:col-span-7 space-y-5">
          {selectedCustomer ? (
            <>
              {/* Profile Header Card */}
              <Card className="p-5 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3 border-b border-[#EADFC8]">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h2 className="text-lg font-serif font-bold text-[#5A4630]">
                        {selectedCustomer.name}
                      </h2>
                      {selectedCustomer.isVerified ? (
                        <Badge variant="sage" className="text-xs flex items-center gap-1">
                          <ShieldCheck className="w-3 h-3" /> Verified Investor
                        </Badge>
                      ) : (
                        <Badge variant="neutral" className="text-xs">
                          Unverified
                        </Badge>
                      )}
                      {selectedCustomer.fraudFlag && (
                        <Badge variant="rose" className="text-xs flex items-center gap-1">
                          <ShieldAlert className="w-3 h-3" /> Flagged for Fraud Risk
                        </Badge>
                      )}
                    </div>
                    <div className="text-xs text-[#7A6A55] mt-1 flex items-center gap-3">
                      <span>ID: <strong className="text-[#5A4630] font-mono">{selectedCustomer.id}</strong></span>
                      <span>•</span>
                      <span>Customer since {new Date(selectedCustomer.createdAt).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })}</span>
                    </div>
                  </div>

                  {/* Top Customer Actions */}
                  <div className="flex items-center gap-2 flex-wrap">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setAddNoteModalOpen(true)}
                      className="text-xs flex items-center gap-1.5"
                    >
                      <Plus className="w-3.5 h-3.5" /> Add Note
                    </Button>
                    <Button
                      variant={selectedCustomer.fraudFlag ? 'primary' : 'outline'}
                      size="sm"
                      onClick={() => setFraudModalOpen(true)}
                      className={`text-xs flex items-center gap-1.5 ${
                        !selectedCustomer.fraudFlag ? 'border-[#9E2A2B] text-[#9E2A2B] hover:bg-[#FBEBEB]' : ''
                      }`}
                    >
                      {selectedCustomer.fraudFlag ? (
                        <>
                          <ShieldCheck className="w-3.5 h-3.5" /> Clear Fraud Flag
                        </>
                      ) : (
                        <>
                          <ShieldAlert className="w-3.5 h-3.5" /> Flag as Fraud
                        </>
                      )}
                    </Button>
                  </div>
                </div>

                {/* KPI Metrics Strip */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="p-3 bg-[#FFFBF3] border border-[#EADFC8] rounded-md">
                    <div className="text-[11px] text-[#7A6A55]">Total Portfolio Value</div>
                    <div className="text-sm font-serif font-bold text-[#5A4630] mt-0.5">
                      {formatINR(selectedCustomer.totalSpent)}
                    </div>
                  </div>
                  <div className="p-3 bg-[#FFFBF3] border border-[#EADFC8] rounded-md">
                    <div className="text-[11px] text-[#7A6A55]">Completed Orders</div>
                    <div className="text-sm font-serif font-bold text-[#5A4630] mt-0.5">
                      {selectedCustomer.totalOrders}
                    </div>
                  </div>
                  <div className="p-3 bg-[#FFFBF3] border border-[#EADFC8] rounded-md">
                    <div className="text-[11px] text-[#7A6A55]">Risk Status</div>
                    <div className="text-xs font-semibold mt-1">
                      {selectedCustomer.fraudFlag ? (
                        <span className="text-[#9E2A2B]">High Risk Flagged</span>
                      ) : (
                        <span className="text-[#2D5A27]">Clean / Standing OK</span>
                      )}
                    </div>
                  </div>
                  <div className="p-3 bg-[#FFFBF3] border border-[#EADFC8] rounded-md">
                    <div className="text-[11px] text-[#7A6A55]">Support Logs</div>
                    <div className="text-sm font-serif font-bold text-[#5A4630] mt-0.5">
                      {selectedCustomer.supportHistory?.length || 0} Tickets
                    </div>
                  </div>
                </div>

                {/* Verified Contacts & Addresses */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                  <div className="p-3.5 bg-[#FFFBF3] border border-[#EADFC8] rounded-md space-y-2">
                    <div className="text-xs font-semibold text-[#5A4630] flex items-center gap-1.5 pb-1 border-b border-[#EADFC8]">
                      <Mail className="w-3.5 h-3.5 text-[#C9A24B]" /> Verified Contacts
                    </div>
                    <div className="text-xs text-[#5A4630] space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-[#7A6A55]">Email:</span>
                        <span className="font-medium">{selectedCustomer.email}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-[#7A6A55]">Mobile Phone:</span>
                        <div className="flex items-center gap-1.5 font-mono">
                          <span className="font-medium">
                            {maskPhone(
                              selectedCustomer.phone,
                              activeRole,
                              revealedFields[`${selectedCustomer.id}-phone`]
                            )}
                          </span>
                          {canRevealPII(activeRole) && (
                            <button
                              type="button"
                              onClick={() => handleReveal(selectedCustomer.id, selectedCustomer.name, 'Phone')}
                              className="inline-flex items-center gap-1 text-[10px] text-[#C9A24B] hover:text-[#5A4630] font-sans font-medium px-1.5 py-0.5 rounded border border-[#EADFC8] hover:bg-[#F8EFD9] transition-colors"
                              title="Super Admin / Finance: Click to toggle and log audit row"
                            >
                              {revealedFields[`${selectedCustomer.id}-phone`] ? (
                                <>
                                  <EyeOff className="w-2.5 h-2.5" /> Hide
                                </>
                              ) : (
                                <>
                                  <Eye className="w-2.5 h-2.5" /> Reveal
                                </>
                              )}
                            </button>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-[#7A6A55]">Customer PAN:</span>
                        <div className="flex items-center gap-1.5 font-mono">
                          <span className="font-medium">
                            {maskPan(
                              selectedCustomer.pan || selectedCustomer.panNumber || 'ABCDE1234F',
                              activeRole,
                              revealedFields[`${selectedCustomer.id}-pan`]
                            )}
                          </span>
                          {canRevealPII(activeRole) && (
                            <button
                              type="button"
                              onClick={() => handleReveal(selectedCustomer.id, selectedCustomer.name, 'PAN')}
                              className="inline-flex items-center gap-1 text-[10px] text-[#C9A24B] hover:text-[#5A4630] font-sans font-medium px-1.5 py-0.5 rounded border border-[#EADFC8] hover:bg-[#F8EFD9] transition-colors"
                              title="Super Admin / Finance: Click to toggle and log audit row"
                            >
                              {revealedFields[`${selectedCustomer.id}-pan`] ? (
                                <>
                                  <EyeOff className="w-2.5 h-2.5" /> Hide
                                </>
                              ) : (
                                <>
                                  <Eye className="w-2.5 h-2.5" /> Reveal
                                </>
                              )}
                            </button>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-[#7A6A55]">KYC Verification:</span>
                        <span className="font-semibold text-[#2D5A27] flex items-center gap-1">
                          {selectedCustomer.isVerified ? 'Completed' : 'Pending Upload'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="p-3.5 bg-[#FFFBF3] border border-[#EADFC8] rounded-md space-y-2">
                    <div className="text-xs font-semibold text-[#5A4630] flex items-center gap-1.5 pb-1 border-b border-[#EADFC8]">
                      <MapPin className="w-3.5 h-3.5 text-[#C9A24B]" /> Registered Destinations
                    </div>
                    <div className="space-y-1.5 max-h-28 overflow-y-auto pr-1">
                      {selectedCustomer.addresses.map((addr) => (
                        <div key={addr.id} className="text-xs text-[#5A4630] bg-[#FFFFFF] p-2 rounded border border-[#EADFC8]">
                          <div className="flex items-center justify-between">
                            <span className="font-semibold text-[11px]">{addr.type} Address</span>
                            {addr.isDefault && (
                              <Badge variant="gold" className="text-[9px] py-0 px-1">Default</Badge>
                            )}
                          </div>
                          <div className="text-[#7A6A55] text-[11px] mt-0.5">
                            {addr.street}, {addr.city}, {addr.state} - {addr.pincode}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Statutory DPDP Consent Audit Trail */}
                <div className="p-3.5 bg-[#FDF9F0] border border-[#EADFC8] rounded-md space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="text-xs font-semibold text-[#5A4630] flex items-center gap-1.5">
                      <ShieldCheck className="w-3.5 h-3.5 text-[#C9A24B]" /> DPDP Act 2023 Digital Consent Audit
                    </div>
                    <span className="text-[10px] text-[#7A6A55]">Click toggle to update customer records</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1">
                    <div
                      onClick={() => handleConsentToggle('marketing')}
                      className="p-2.5 bg-[#FFFFFF] border border-[#EADFC8] rounded flex items-center justify-between cursor-pointer hover:border-[#C9A24B]"
                    >
                      <div>
                        <div className="text-xs font-medium text-[#5A4630]">Market Briefings</div>
                        <div className="text-[10px] text-[#7A6A55]">Weekly spot reports</div>
                      </div>
                      {selectedCustomer.consents.marketing ? (
                        <CheckCircle2 className="w-4 h-4 text-[#2D5A27]" />
                      ) : (
                        <XCircle className="w-4 h-4 text-[#9E2A2B]" />
                      )}
                    </div>

                    <div
                      onClick={() => handleConsentToggle('smsAlerts')}
                      className="p-2.5 bg-[#FFFFFF] border border-[#EADFC8] rounded flex items-center justify-between cursor-pointer hover:border-[#C9A24B]"
                    >
                      <div>
                        <div className="text-xs font-medium text-[#5A4630]">SMS Notifications</div>
                        <div className="text-[10px] text-[#7A6A55]">OTP & dispatch alerts</div>
                      </div>
                      {selectedCustomer.consents.smsAlerts ? (
                        <CheckCircle2 className="w-4 h-4 text-[#2D5A27]" />
                      ) : (
                        <XCircle className="w-4 h-4 text-[#9E2A2B]" />
                      )}
                    </div>

                    <div
                      onClick={() => handleConsentToggle('whatsappUpdates')}
                      className="p-2.5 bg-[#FFFFFF] border border-[#EADFC8] rounded flex items-center justify-between cursor-pointer hover:border-[#C9A24B]"
                    >
                      <div>
                        <div className="text-xs font-medium text-[#5A4630]">WhatsApp Tracking</div>
                        <div className="text-[10px] text-[#7A6A55]">Live courier link & PDF</div>
                      </div>
                      {selectedCustomer.consents.whatsappUpdates ? (
                        <CheckCircle2 className="w-4 h-4 text-[#2D5A27]" />
                      ) : (
                        <XCircle className="w-4 h-4 text-[#9E2A2B]" />
                      )}
                    </div>
                  </div>
                </div>
              </Card>

              {/* Order History Section */}
              <Card className="p-5 space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-[#EADFC8]">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-[#C9A24B]" />
                    <h3 className="text-sm font-semibold text-[#5A4630]">
                      Custody Order History ({customerOrders.length})
                    </h3>
                  </div>
                  <Link to="/admin/orders" className="text-xs text-[#C9A24B] hover:underline flex items-center gap-1">
                    All Orders Queue <ExternalLink className="w-3 h-3" />
                  </Link>
                </div>

                {customerOrders.length === 0 ? (
                  <div className="py-6 text-center text-xs text-[#7A6A55]">
                    No placed orders found for this customer profile yet.
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs text-[#5A4630]">
                      <thead>
                        <tr className="border-b border-[#EADFC8] text-[#7A6A55] bg-[#FFFBF3]">
                          <th className="py-2 px-3 font-semibold">Order Ref</th>
                          <th className="py-2 px-3 font-semibold">Date</th>
                          <th className="py-2 px-3 font-semibold">Items</th>
                          <th className="py-2 px-3 font-semibold">Amount</th>
                          <th className="py-2 px-3 font-semibold">Payment</th>
                          <th className="py-2 px-3 font-semibold">Custody Status</th>
                          <th className="py-2 px-3 font-semibold text-right">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#EADFC8]">
                        {customerOrders.map((ord) => (
                          <tr key={ord.id} className="hover:bg-[#FFFDF9]">
                            <td className="py-2.5 px-3 font-mono font-medium text-[#5A4630]">
                              {ord.orderNumber}
                            </td>
                            <td className="py-2.5 px-3 text-[#7A6A55]">
                              {new Date(ord.createdAt).toLocaleDateString('en-IN', {
                                day: '2-digit',
                                month: 'short',
                                year: 'numeric',
                              })}
                            </td>
                            <td className="py-2.5 px-3">
                              {ord.items.map((i) => `${i.name} (×${i.quantity})`).join(', ')}
                            </td>
                            <td className="py-2.5 px-3 font-serif font-bold">
                              {formatINR(ord.totalAmount)}
                            </td>
                            <td className="py-2.5 px-3">
                              <Badge
                                variant={
                                  ord.paymentStatus === 'Success'
                                    ? 'sage'
                                    : ord.paymentStatus === 'Pending'
                                    ? 'amber'
                                    : 'rose'
                                }
                                className="text-[10px]"
                              >
                                {ord.paymentStatus}
                              </Badge>
                            </td>
                            <td className="py-2.5 px-3">
                              <Badge
                                variant={
                                  ord.status === 'Delivered'
                                    ? 'sage'
                                    : ord.status === 'Dispatched'
                                    ? 'gold'
                                    : 'neutral'
                                }
                                className="text-[10px]"
                              >
                                {ord.status}
                              </Badge>
                            </td>
                            <td className="py-2.5 px-3 text-right">
                              <Link to={`/admin/orders/${ord.id}`}>
                                <Button variant="outline" size="sm" className="text-[11px] py-1 px-2">
                                  Fulfilment
                                </Button>
                              </Link>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </Card>

              {/* Order-Linked Internal Service Notes */}
              <Card className="p-5 space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-[#EADFC8]">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-[#C9A24B]" />
                    <h3 className="text-sm font-semibold text-[#5A4630]">
                      Internal Service & Order-Linked Notes
                    </h3>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setAddNoteModalOpen(true)}
                    className="text-xs flex items-center gap-1 py-1"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add Note
                  </Button>
                </div>

                {/* Structured Order Notes */}
                <div className="space-y-2.5">
                  {selectedCustomer.orderNotes && selectedCustomer.orderNotes.length > 0 ? (
                    selectedCustomer.orderNotes.map((on) => (
                      <div
                        key={on.id}
                        className="p-3 bg-[#FFFBF3] border border-[#EADFC8] rounded-md text-xs space-y-1"
                      >
                        <div className="flex items-center justify-between text-[11px] text-[#7A6A55]">
                          <span className="font-semibold text-[#5A4630]">{on.author}</span>
                          <span>{new Date(on.createdAt).toLocaleString('en-IN')}</span>
                        </div>
                        <p className="text-[#5A4630]">{maskTextPII(on.note, activeRole)}</p>
                        {on.orderNumber && (
                          <div className="pt-1 text-[10px] text-[#C9A24B]">
                            Linked to Order #{on.orderNumber}
                          </div>
                        )}
                      </div>
                    ))
                  ) : (
                    <div className="text-xs text-[#7A6A55] italic">No structured order notes yet.</div>
                  )}

                  {/* General Freeform Customer Notes */}
                  {selectedCustomer.notes && selectedCustomer.notes.length > 0 && (
                    <div className="pt-2 border-t border-[#EADFC8] space-y-1.5">
                      <div className="text-[11px] font-semibold text-[#7A6A55]">Historical Advisory Notes:</div>
                      {selectedCustomer.notes.map((note, idx) => (
                        <div
                          key={idx}
                          className="p-2.5 bg-[#FFFFFF] border border-[#EADFC8] rounded text-xs text-[#5A4630]"
                        >
                          • {maskTextPII(note, activeRole)}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </Card>

              {/* Support & Concierge History */}
              <Card className="p-5 space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-[#EADFC8]">
                  <div className="flex items-center gap-2">
                    <Headphones className="w-4 h-4 text-[#C9A24B]" />
                    <h3 className="text-sm font-semibold text-[#5A4630]">
                      Customer Support & Consultation History ({selectedCustomer.supportHistory?.length || 0})
                    </h3>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSupportModalOpen(true)}
                    className="text-xs flex items-center gap-1 py-1"
                  >
                    <Plus className="w-3.5 h-3.5" /> Log Interaction
                  </Button>
                </div>

                {selectedCustomer.supportHistory && selectedCustomer.supportHistory.length > 0 ? (
                  <div className="space-y-2.5">
                    {selectedCustomer.supportHistory.map((sh) => (
                      <div
                        key={sh.id}
                        className="p-3 bg-[#FFFBF3] border border-[#EADFC8] rounded-md text-xs space-y-1.5"
                      >
                        <div className="flex items-center justify-between flex-wrap gap-2">
                          <div className="flex items-center gap-2">
                            <Badge variant="gold" className="text-[10px]">
                              {sh.channel}
                            </Badge>
                            <span className="font-semibold text-[#5A4630]">{maskTextPII(sh.subject, activeRole)}</span>
                          </div>
                          <Badge
                            variant={sh.status === 'Resolved' ? 'sage' : 'amber'}
                            className="text-[10px]"
                          >
                            {sh.status}
                          </Badge>
                        </div>
                        <p className="text-[#5A4630] text-[11px]">{maskTextPII(sh.summary, activeRole)}</p>
                        <div className="flex items-center justify-between text-[10px] text-[#7A6A55] pt-1 border-t border-[#EADFC8]/60">
                          <span>Officer: <strong>{sh.officer}</strong></span>
                          <span>Logged: {new Date(sh.createdAt).toLocaleString('en-IN')}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="py-4 text-center text-xs text-[#7A6A55]">
                    No support interactions recorded for this customer yet.
                  </div>
                )}
              </Card>
            </>
          ) : (
            <Card className="p-8 text-center text-sm text-[#7A6A55]">
              Select a customer profile from the left registry to inspect verified records.
            </Card>
          )}
        </div>
      </div>

      {/* PROPOSED FEATURE STRIP: TAGGED Proposed */}
      <div className="p-4 bg-[#F8EFD9] border border-[#EADFC8] rounded-xl space-y-3">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#C9A24B]" />
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#5A4630]">
              TAGGED PROPOSED: Enterprise Customer Intelligence & Concierge CRM
            </h4>
          </div>
          <Badge variant="amber" className="text-[10px]">Roadmap Concept</Badge>
        </div>

        <p className="text-xs text-[#7A6A55] leading-relaxed">
          The following modules are planned for subsequent expansion to serve high-net-worth bullion investors and corporate gifting accounts:
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2.5 pt-1 text-xs text-[#5A4630]">
          <div className="p-2.5 bg-[#FFFFFF] border border-[#EADFC8] rounded shadow-2xs space-y-1">
            <div className="font-semibold flex items-center gap-1 text-[#C9A24B]">
              <TrendingUp className="w-3.5 h-3.5" /> Segmentation & CLV
            </div>
            <div className="text-[10px] text-[#7A6A55]">Predictive lifetime value, RFM scoring & churn models.</div>
          </div>
          <div className="p-2.5 bg-[#FFFFFF] border border-[#EADFC8] rounded shadow-2xs space-y-1">
            <div className="font-semibold flex items-center gap-1 text-[#C9A24B]">
              <ShieldCheck className="w-3.5 h-3.5" /> VIP Investor Tier Tags
            </div>
            <div className="text-[10px] text-[#7A6A55]">Sovereign Bullion Club, Diamond HNW & Corporate Trust tiers.</div>
          </div>
          <div className="p-2.5 bg-[#FFFFFF] border border-[#EADFC8] rounded shadow-2xs space-y-1">
            <div className="font-semibold flex items-center gap-1 text-[#C9A24B]">
              <MessageSquare className="w-3.5 h-3.5" /> Omnichannel Live Chat
            </div>
            <div className="text-[10px] text-[#7A6A55]">In-app encrypted chat with designated bullion desk dealers.</div>
          </div>
          <div className="p-2.5 bg-[#FFFFFF] border border-[#EADFC8] rounded shadow-2xs space-y-1">
            <div className="font-semibold flex items-center gap-1 text-[#C9A24B]">
              <AlertTriangle className="w-3.5 h-3.5" /> Disputes & SLA Monitor
            </div>
            <div className="text-[10px] text-[#7A6A55]">Automated 4-hour SLA timers for payment decline reconciliations.</div>
          </div>
          <div className="p-2.5 bg-[#FFFFFF] border border-[#EADFC8] rounded shadow-2xs space-y-1">
            <div className="font-semibold flex items-center gap-1 text-[#C9A24B]">
              <FileText className="w-3.5 h-3.5" /> Knowledge Base & AI
            </div>
            <div className="text-[10px] text-[#7A6A55]">Precious metals taxation FAQ, HUID lookups & assay guides.</div>
          </div>
        </div>
      </div>

      {/* MODAL: Add Order-Linked Customer Note */}
      <Modal
        isOpen={addNoteModalOpen}
        onClose={() => setAddNoteModalOpen(false)}
        title={`Add Service Note for ${selectedCustomer?.name || 'Customer'}`}
        maxWidth="md"
      >
        <div className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-[#5A4630] mb-1">
              Note Content *
            </label>
            <textarea
              rows={3}
              value={newNoteText}
              onChange={(e) => setNewNoteText(e.target.value)}
              placeholder="e.g. Investor confirmed preferred delivery time window or requested physical assay report copy..."
              className="w-full p-2.5 bg-[#FFFBF3] border border-[#EADFC8] rounded-md focus:outline-hidden focus:border-[#C9A24B] text-[#5A4630]"
            />
          </div>

          <div>
            <label className="block font-semibold text-[#5A4630] mb-1">
              Link to Customer Order (Optional)
            </label>
            <select
              value={selectedOrderForNote}
              onChange={(e) => setSelectedOrderForNote(e.target.value)}
              className="w-full p-2 bg-[#FFFBF3] border border-[#EADFC8] rounded-md text-[#5A4630] focus:outline-hidden focus:border-[#C9A24B]"
            >
              <option value="">-- No specific order link (General Account Note) --</option>
              {customerOrders.map((o) => (
                <option key={o.id} value={o.id}>
                  Order #{o.orderNumber} ({formatINR(o.totalAmount)} - {o.status})
                </option>
              ))}
            </select>
          </div>

          <div className="p-2.5 bg-[#F8EFD9] border border-[#EADFC8] rounded text-[11px] text-[#7A6A55]">
            Author: <strong>{currentActor}</strong>. This entry will be appended to the customer profile and recorded in the system audit log.
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#EADFC8]">
            <Button variant="outline" size="sm" onClick={() => setAddNoteModalOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              disabled={!newNoteText.trim()}
              onClick={handleSaveNote}
            >
              Save Note
            </Button>
          </div>
        </div>
      </Modal>

      {/* MODAL: Toggle Fraud Risk Flag */}
      <Modal
        isOpen={fraudModalOpen}
        onClose={() => setFraudModalOpen(false)}
        title={selectedCustomer?.fraudFlag ? 'Clear Fraud Risk Flag' : 'Flag Customer for Fraud Risk'}
        maxWidth="md"
      >
        <div className="space-y-4 text-xs">
          <div className={`p-3 rounded-lg border flex items-start gap-2.5 ${
            selectedCustomer?.fraudFlag
              ? 'bg-[#E8F3E6] border-[#A3D9A5] text-[#2D5A27]'
              : 'bg-[#FBEBEB] border-[#F0A9A9] text-[#9E2A2B]'
          }`}>
            <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
            <div>
              <div className="font-semibold">
                {selectedCustomer?.fraudFlag
                  ? 'Reinstating Account Privileges'
                  : 'High-Value Fraud Lockout Action'}
              </div>
              <div className="text-[11px] mt-0.5">
                {selectedCustomer?.fraudFlag
                  ? 'Clearing this flag will unblock online checkout privileges for this customer and record an audit entry.'
                  : 'Flagging this customer will block high-value bullion checkout privileges and alert the AML & risk compliance officer.'}
              </div>
            </div>
          </div>

          <div>
            <label className="block font-semibold text-[#5A4630] mb-1">
              Officer Risk Justification *
            </label>
            <textarea
              rows={3}
              value={fraudReason}
              onChange={(e) => setFraudReason(e.target.value)}
              placeholder="State statutory reason for risk status modification..."
              className="w-full p-2.5 bg-[#FFFBF3] border border-[#EADFC8] rounded-md focus:outline-hidden focus:border-[#C9A24B] text-[#5A4630]"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#EADFC8]">
            <Button variant="outline" size="sm" onClick={() => setFraudModalOpen(false)}>
              Cancel
            </Button>
            <Button
              variant={selectedCustomer?.fraudFlag ? 'primary' : 'outline'}
              size="sm"
              onClick={handleToggleFraud}
              className={!selectedCustomer?.fraudFlag ? 'border-[#9E2A2B] text-[#9E2A2B] hover:bg-[#FBEBEB]' : ''}
            >
              Confirm {selectedCustomer?.fraudFlag ? 'Clear Flag' : 'Flag Account'}
            </Button>
          </div>
        </div>
      </Modal>

      {/* MODAL: Log Support Interaction */}
      <Modal
        isOpen={supportModalOpen}
        onClose={() => setSupportModalOpen(false)}
        title={`Log Support Ticket for ${selectedCustomer?.name || 'Customer'}`}
        maxWidth="md"
      >
        <div className="space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-[#5A4630] mb-1">Channel *</label>
              <select
                value={supportChannel}
                onChange={(e) => setSupportChannel(e.target.value as any)}
                className="w-full p-2 bg-[#FFFBF3] border border-[#EADFC8] rounded-md text-[#5A4630]"
              >
                <option value="Phone Concierge">Phone Concierge</option>
                <option value="Email">Email</option>
                <option value="WhatsApp">WhatsApp</option>
                <option value="In-Vault Consultation">In-Vault Consultation</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-[#5A4630] mb-1">Status *</label>
              <select
                value={supportStatus}
                onChange={(e) => setSupportStatus(e.target.value as any)}
                className="w-full p-2 bg-[#FFFBF3] border border-[#EADFC8] rounded-md text-[#5A4630]"
              >
                <option value="Resolved">Resolved</option>
                <option value="Open">Open</option>
                <option value="In Review">In Review</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block font-semibold text-[#5A4630] mb-1">Subject / Enquiry Title *</label>
            <input
              type="text"
              value={supportSubject}
              onChange={(e) => setSupportSubject(e.target.value)}
              placeholder="e.g. Assay certicard inquiry or delivery rescheduling..."
              className="w-full p-2 bg-[#FFFBF3] border border-[#EADFC8] rounded-md text-[#5A4630] focus:outline-hidden focus:border-[#C9A24B]"
            />
          </div>

          <div>
            <label className="block font-semibold text-[#5A4630] mb-1">Interaction Summary *</label>
            <textarea
              rows={3}
              value={supportSummary}
              onChange={(e) => setSupportSummary(e.target.value)}
              placeholder="Record summary of consultation, customer preferences, or action items..."
              className="w-full p-2.5 bg-[#FFFBF3] border border-[#EADFC8] rounded-md focus:outline-hidden focus:border-[#C9A24B] text-[#5A4630]"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#EADFC8]">
            <Button variant="outline" size="sm" onClick={() => setSupportModalOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              disabled={!supportSubject.trim() || !supportSummary.trim()}
              onClick={handleSaveSupport}
            >
              Log Ticket
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
