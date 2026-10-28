import React, { useState, useMemo } from 'react';
import { useAppStore } from '../store';
import { useSEO } from '../lib/useSEO';
import { Card } from '../components/Card';
import { Badge } from '../components/Badge';
import { Button } from '../components/Button';
import { Modal } from '../components/Modal';
import type { DocumentVersionRecord, Product } from '../data/types';
import {
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Scale,
  FileCheck,
  Building2,
  Clock,
  Edit,
  Award,
  ShieldAlert,
} from 'lucide-react';

export const AdminCompliancePage: React.FC = () => {
  useSEO({
    title: 'Statutory Compliance & Legal Governance Checklist',
    description: 'GST/HSN tax rules, Legal Metrology declarations, BIS Hallmarking review, return/refund policy safeguards, and data consent audit trails.',
    canonicalPath: '/admin/compliance',
  });

  const {
    complianceChecklist,
    documentVersions,
    products,
    adminUser,
    activeRole,
    createApprovalRequest,
  } = useAppStore();

  const currentActor = adminUser?.name || 'Vikram Sharma';

  // Category filter for checklist
  const [activeCategory, setActiveCategory] = useState<string>('All');

  // Action Notice Toast
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  // Edit Document Version Modal
  const [editDocModalOpen, setEditDocModalOpen] = useState(false);
  const [selectedDoc, setSelectedDoc] = useState<DocumentVersionRecord | null>(null);
  const [newVersionString, setNewVersionString] = useState('');
  const [newStatus, setNewStatus] = useState<DocumentVersionRecord['status']>('Effective');
  const [docNotes, setDocNotes] = useState('');

  // Edit Hallmark / HUID / Certificate / BIS Modal
  const [editHallmarkModalOpen, setEditHallmarkModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [editHallmarkStatus, setEditHallmarkStatus] = useState<'Certified' | 'Exempt' | 'Pending'>('Certified');
  const [editHuid, setEditHuid] = useState('');
  const [editBisRef, setEditBisRef] = useState('');
  const [editAssayer, setEditAssayer] = useState('');
  const [editCertNum, setEditCertNum] = useState('');
  const [editReason, setEditReason] = useState('');

  // Categories
  const categories = [
    'All',
    'GST & Legal Metrology',
    'BIS Hallmark & Assay',
    'Product Claims & Certs',
    'Returns & Disclosures',
    'Data Privacy & DPDP',
  ];

  // Filtered Checklist
  const filteredChecklist = useMemo(() => {
    if (activeCategory === 'All') return complianceChecklist;
    return complianceChecklist.filter((item) => item.category === activeCategory);
  }, [complianceChecklist, activeCategory]);

  // Overall Health Metrics
  const totalItems = complianceChecklist.length;
  const compliantItems = complianceChecklist.filter((i) => i.isCompliant).length;
  const healthPercent = Math.round((compliantItems / (totalItems || 1)) * 100);

  // Checkbox toggle handler -> Routes to Dual-Custody Approval Queue
  const handleToggle = (id: string, title: string) => {
    const item = complianceChecklist.find((i) => i.id === id);
    if (!item) return;

    createApprovalRequest({
      type: 'compliance_edit',
      title: `Checklist Sign-off: ${item.title}`,
      entityId: item.id,
      requester: currentActor,
      reason: `Sign-off request: Change control status to ${!item.isCompliant ? 'Compliant' : 'Non-Compliant'} under ${item.statutoryReference}`,
      beforeState: {
        itemId: item.id,
        title: item.title,
        isCompliant: item.isCompliant,
      },
      afterState: {
        itemId: item.id,
        title: item.title,
        isCompliant: !item.isCompliant,
        statutoryReference: item.statutoryReference,
      },
    });

    setActionNotice(`Dual-Custody Request Submitted: Checklist edit for "${title}" sent to Maker-Checker Approval Queue. Control will NOT mutate until approved by an independent officer.`);
    setTimeout(() => setActionNotice(null), 5000);
  };

  // Document version edit handlers -> Routes to Dual-Custody Approval Queue
  const handleOpenEditDoc = (doc: DocumentVersionRecord) => {
    setSelectedDoc(doc);
    setNewVersionString(doc.currentVersion);
    setNewStatus(doc.status);
    setDocNotes(doc.notes);
    setEditDocModalOpen(true);
  };

  const handleSaveDocVersion = () => {
    if (!selectedDoc) return;

    createApprovalRequest({
      type: 'compliance_edit',
      title: `Policy Version Revision: ${selectedDoc.title} (${newVersionString})`,
      entityId: selectedDoc.id,
      requester: currentActor,
      reason: docNotes.trim(),
      beforeState: {
        docId: selectedDoc.id,
        title: selectedDoc.title,
        currentVersion: selectedDoc.currentVersion,
        status: selectedDoc.status,
      },
      afterState: {
        docId: selectedDoc.id,
        title: selectedDoc.title,
        currentVersion: newVersionString.trim(),
        status: newStatus,
        notes: docNotes.trim(),
        effectiveDate: new Date().toISOString().split('T')[0],
        approvedBy: `${currentActor} (${activeRole})`,
      },
    });

    setEditDocModalOpen(false);
    setActionNotice(`Dual-Custody Request Submitted: Document revision for "${selectedDoc.title}" sent to Approval Queue. Version remains ${selectedDoc.currentVersion} until approved.`);
    setTimeout(() => setActionNotice(null), 5000);
  };

  // Hallmark / HUID / BIS Record handlers -> Routes to Dual-Custody Approval Queue
  const handleOpenEditHallmark = (p: Product) => {
    setSelectedProduct(p);
    setEditHallmarkStatus(p.hallmarkStatus || 'Certified');
    setEditHuid(p.huid || '');
    setEditBisRef(p.bisReference || 'BIS-L-7200192');
    setEditAssayer(p.certificate?.assayer || 'MMTC-PAMP India Central Assay');
    setEditCertNum(p.certificate?.certificateNumber || 'CERT-BIS-9912');
    setEditReason('Annual assayer accreditation renewal and BIS laser-marking audit verification');
    setEditHallmarkModalOpen(true);
  };

  const handleSaveHallmarkRecord = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProduct) return;

    createApprovalRequest({
      type: 'compliance_edit',
      title: `BIS Hallmark & HUID Update: ${selectedProduct.name} (${selectedProduct.sku})`,
      entityId: selectedProduct.id,
      requester: currentActor,
      reason: editReason.trim(),
      beforeState: {
        productId: selectedProduct.id,
        productName: selectedProduct.name,
        hallmarkStatus: selectedProduct.hallmarkStatus,
        huid: selectedProduct.huid,
        bisReference: selectedProduct.bisReference,
        certificate: selectedProduct.certificate,
      },
      afterState: {
        productId: selectedProduct.id,
        productName: selectedProduct.name,
        hallmarkStatus: editHallmarkStatus,
        huid: editHuid.trim().toUpperCase(),
        bisReference: editBisRef.trim(),
        certificate: {
          ...selectedProduct.certificate,
          assayer: editAssayer.trim(),
          certificateNumber: editCertNum.trim(),
        },
      },
    });

    setEditHallmarkModalOpen(false);
    setActionNotice(`Dual-Custody Request Submitted: BIS/HUID record for "${selectedProduct.name}" sent to Approval Queue. Purity certifications will NOT mutate until approved.`);
    setTimeout(() => setActionNotice(null), 5000);
  };

  return (
    <div className="space-y-6">
      {/* Page Title & KPI Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-serif font-bold text-[#5A4630]">
              Statutory Compliance & Regulatory Governance
            </h1>
            <Badge variant="gold">Phase 10</Badge>
          </div>
          <p className="text-sm text-[#7A6A55] mt-1">
            Mandatory GST/HSN rules, Legal Metrology, BIS hallmarking, return policy safeguards, and statutory document version audit.
          </p>
        </div>

        {/* Compliance Health Score Tile */}
        <div className="flex items-center gap-3 p-3 bg-[#FFFFFF] border border-[#EADFC8] rounded-xl shadow-xs">
          <div className="w-10 h-10 rounded-full bg-[#E8F3E6] border border-[#A3D9A5] flex items-center justify-center text-[#2D5A27]">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <div className="text-[11px] text-[#7A6A55] font-medium">Compliance Health Score</div>
            <div className="flex items-center gap-2">
              <span className="text-lg font-serif font-bold text-[#5A4630]">{healthPercent}%</span>
              <span className="text-xs text-[#2D5A27] font-semibold">({compliantItems}/{totalItems} Controls Passed)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Action Notice */}
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

      {/* AMBER "OPEN" STATUTORY ADVISORY NOTES */}
      <div className="p-5 bg-[#FFF9ED] border-2 border-[#E5C158] rounded-xl space-y-4 shadow-xs">
        <div className="flex items-center justify-between pb-2 border-b border-[#EADFC8]">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-[#C9A24B]" />
            <h2 className="text-sm font-bold text-[#5A4630] uppercase tracking-wider">
              Statutory Advisory: Open Regulatory Items & Jurisdictional Interpretations
            </h2>
          </div>
          <Badge variant="amber" className="text-xs font-semibold">4 Open Review Notes</Badge>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Note 1: Rudraksha & Hampers */}
          <div className="p-3.5 bg-[#FFFFFF] border border-[#EADFC8] rounded-lg space-y-2 shadow-2xs">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 font-semibold text-xs text-[#5A4630]">
                <Scale className="w-4 h-4 text-[#C9A24B]" />
                1. GST/HSN Classification: Rudraksha, Malas & Hampers
              </div>
              <Badge variant="amber" className="text-[10px]">Tax Ambiguity</Badge>
            </div>
            <p className="text-[11px] text-[#7A6A55] leading-relaxed">
              <strong>Statutory Conflict:</strong> Raw botanical seeds (HSN 9602 / 1211) enjoy agricultural/handicraft exemptions, whereas silver/gold-capped malas and mixed hampers fall under Precious Jewellery (HSN 7113 / 7117) attracting 3% GST.
            </p>
            <div className="p-2 bg-[#FFFBF3] border border-[#EADFC8] rounded text-[10px] text-[#5A4630]">
              <strong>Standard Operational Ruling:</strong> All consecrated malas and corporate hampers containing precious components are invoiced under unified 3% GST (HSN 7117 / 7113) with itemized component valuations to prevent tax classification disputes.
            </div>
          </div>

          {/* Note 2: Cash on Delivery (COD) */}
          <div className="p-3.5 bg-[#FFFFFF] border border-[#EADFC8] rounded-lg space-y-2 shadow-2xs">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 font-semibold text-xs text-[#5A4630]">
                <Building2 className="w-4 h-4 text-[#C9A24B]" />
                2. Cash-on-Delivery (COD) Statutory Prohibition
              </div>
              <Badge variant="rose" className="text-[10px]">PMLA Rule</Badge>
            </div>
            <p className="text-[11px] text-[#7A6A55] leading-relaxed">
              <strong>PMLA & Courier Mandate:</strong> Under the Prevention of Money Laundering Act (PMLA) 2002 and RBI high-value transaction guidelines, cash settlements for un-assayed deliveries pose severe anti-money laundering and courier transit hijacking exposure.
            </p>
            <div className="p-2 bg-[#FFFBF3] border border-[#EADFC8] rounded text-[10px] text-[#5A4630]">
              <strong>Standard Operational Ruling:</strong> COD is permanently disabled storewide for precious bullion, coins, and jewellery above ₹10,000. All orders must complete 100% advance digital settlement via RTGS, NetBanking, or UPI.
            </div>
          </div>

          {/* Note 3: Bullion Returns & Buyback */}
          <div className="p-3.5 bg-[#FFFFFF] border border-[#EADFC8] rounded-lg space-y-2 shadow-2xs">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 font-semibold text-xs text-[#5A4630]">
                <Clock className="w-4 h-4 text-[#C9A24B]" />
                3. Bullion Returns & Volatility Risk Buyback Protocol
              </div>
              <Badge variant="amber" className="text-[10px]">Market Exemption</Badge>
            </div>
            <p className="text-[11px] text-[#7A6A55] leading-relaxed">
              <strong>Consumer Protection Exemption:</strong> Standard statutory 7-day "no-questions" e-commerce returns cannot apply to investment-grade bullion due to continuous intraday spot market price fluctuations (Consumer Protection Rules 2020, Rule 5).
            </p>
            <div className="p-2 bg-[#FFFBF3] border border-[#EADFC8] rounded text-[10px] text-[#5A4630]">
              <strong>Standard Operational Ruling:</strong> Orders are non-cancellable once payment is confirmed. Post-delivery returns are routed through our Guaranteed Lifetime Buyback Protocol based on prevailing live spot rates less refining spread.
            </div>
          </div>

          {/* Note 4: Additional Languages */}
          <div className="p-3.5 bg-[#FFFFFF] border border-[#EADFC8] rounded-lg space-y-2 shadow-2xs">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 font-semibold text-xs text-[#5A4630]">
                <FileCheck className="w-4 h-4 text-[#C9A24B]" />
                4. Statutory Disclosures in Additional Vernacular Languages
              </div>
              <Badge variant="neutral" className="text-[10px]">Phase 11 Sprint</Badge>
            </div>
            <p className="text-[11px] text-[#7A6A55] leading-relaxed">
              <strong>Consumer Rights Provision:</strong> The Consumer Protection Act 2019 stipulates that mandatory weight disclosures, BIS hallmarking guides, and consumer grievance contact points be available in prominent regional languages.
            </p>
            <div className="p-2 bg-[#FFFBF3] border border-[#EADFC8] rounded text-[10px] text-[#5A4630]">
              <strong>Standard Operational Ruling:</strong> Digital PDF disclosures are currently English and Hindi compliant. Phase 11 localization sprint will incorporate Marathi, Gujarati, and Tamil consumer charters.
            </div>
          </div>
        </div>
      </div>

      {/* COMPLIANCE CHECKLIST SECTION */}
      <Card className="p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3 border-b border-[#EADFC8]">
          <div>
            <h2 className="text-base font-serif font-bold text-[#5A4630]">
              Statutory Governance Controls Checklist
            </h2>
            <p className="text-xs text-[#7A6A55] mt-0.5">
              Click individual checkmarks to record live audit sign-offs. All modifications are immutably logged in the system audit trail.
            </p>
          </div>

          {/* Category Filter Chips */}
          <div className="flex flex-wrap items-center gap-1.5 text-xs">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-2.5 py-1 rounded-full text-xs font-medium transition-colors cursor-pointer ${
                  activeCategory === cat
                    ? 'bg-[#C9A24B] text-white shadow-xs'
                    : 'bg-[#F8EFD9] text-[#7A6A55] hover:text-[#5A4630]'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Checklist Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-[#5A4630]">
            <thead>
              <tr className="border-b border-[#EADFC8] text-[#7A6A55] bg-[#FFFBF3]">
                <th className="py-2.5 px-3 font-semibold w-12 text-center">Status</th>
                <th className="py-2.5 px-3 font-semibold">Governance Area & Control</th>
                <th className="py-2.5 px-3 font-semibold">Statutory Reference</th>
                <th className="py-2.5 px-3 font-semibold">Risk Level</th>
                <th className="py-2.5 px-3 font-semibold">Last Audited</th>
                <th className="py-2.5 px-3 font-semibold text-right">Auditor</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EADFC8]">
              {filteredChecklist.map((item) => (
                <tr
                  key={item.id}
                  className={`transition-colors ${
                    item.isCompliant ? 'hover:bg-[#FFFDF9]' : 'bg-[#FFF6F6] hover:bg-[#FDECEC]'
                  }`}
                >
                  <td className="py-3 px-3 text-center">
                    <button
                      onClick={() => handleToggle(item.id, item.title)}
                      className="cursor-pointer focus:outline-hidden p-0.5 rounded transition-transform active:scale-95"
                      title={item.isCompliant ? 'Click to mark as non-compliant' : 'Click to mark as compliant'}
                    >
                      {item.isCompliant ? (
                        <CheckCircle2 className="w-5 h-5 text-[#2D5A27]" />
                      ) : (
                        <div className="w-5 h-5 rounded-full border-2 border-[#9E2A2B] flex items-center justify-center">
                          <span className="w-2.5 h-2.5 rounded-full bg-[#9E2A2B]" />
                        </div>
                      )}
                    </button>
                  </td>

                  <td className="py-3 px-3 max-w-sm">
                    <div className="font-semibold text-xs text-[#5A4630]">{item.title}</div>
                    <div className="text-[11px] text-[#7A6A55] mt-0.5 leading-relaxed">{item.description}</div>
                    <div className="text-[10px] text-[#C9A24B] font-medium mt-1">Category: {item.category}</div>
                  </td>

                  <td className="py-3 px-3">
                    <span className="font-mono text-[11px] text-[#5A4630] bg-[#FFFBF3] px-2 py-0.5 rounded border border-[#EADFC8]">
                      {item.statutoryReference}
                    </span>
                  </td>

                  <td className="py-3 px-3">
                    <Badge
                      variant={
                        item.riskLevel === 'Critical'
                          ? 'rose'
                          : item.riskLevel === 'Medium'
                          ? 'amber'
                          : 'neutral'
                      }
                      className="text-[10px]"
                    >
                      {item.riskLevel}
                    </Badge>
                  </td>

                  <td className="py-3 px-3 text-[#7A6A55]">
                    {item.lastAuditDate}
                  </td>

                  <td className="py-3 px-3 text-right font-medium text-[#5A4630]">
                    {item.auditedBy}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* DOCUMENT VERSION RECORDS TABLE */}
      <Card className="p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3 border-b border-[#EADFC8]">
          <div>
            <div className="flex items-center gap-2">
              <FileCheck className="w-4 h-4 text-[#C9A24B]" />
              <h2 className="text-base font-serif font-bold text-[#5A4630]">
                Statutory Document & Policy Version Records
              </h2>
            </div>
            <p className="text-xs text-[#7A6A55] mt-0.5">
              Official legal charters, terms, privacy frameworks, and assay quality SOPs with approved version history.
            </p>
          </div>

          <Badge variant="neutral" className="text-xs">
            {documentVersions.length} Controlled Documents
          </Badge>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-[#5A4630]">
            <thead>
              <tr className="border-b border-[#EADFC8] text-[#7A6A55] bg-[#FFFBF3]">
                <th className="py-2.5 px-3 font-semibold">Document Title & Code</th>
                <th className="py-2.5 px-3 font-semibold">Version</th>
                <th className="py-2.5 px-3 font-semibold">Effective Date</th>
                <th className="py-2.5 px-3 font-semibold">Approved By</th>
                <th className="py-2.5 px-3 font-semibold">Status</th>
                <th className="py-2.5 px-3 font-semibold">Review Cycle</th>
                <th className="py-2.5 px-3 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EADFC8]">
              {documentVersions.map((doc) => (
                <tr key={doc.id} className="hover:bg-[#FFFDF9]">
                  <td className="py-3 px-3 max-w-xs">
                    <div className="font-semibold text-xs text-[#5A4630]">{doc.title}</div>
                    <div className="text-[10px] font-mono text-[#7A6A55] mt-0.5">{doc.code}</div>
                    <div className="text-[10px] text-[#7A6A55] italic mt-1">{doc.notes}</div>
                  </td>

                  <td className="py-3 px-3">
                    <span className="font-mono font-bold text-[#C9A24B] bg-[#FFFBF3] px-2 py-0.5 rounded border border-[#EADFC8]">
                      {doc.currentVersion}
                    </span>
                  </td>

                  <td className="py-3 px-3 text-[#7A6A55]">
                    {doc.effectiveDate}
                  </td>

                  <td className="py-3 px-3 font-medium text-[#5A4630]">
                    {doc.approvedBy}
                  </td>

                  <td className="py-3 px-3">
                    <Badge
                      variant={
                        doc.status === 'Effective'
                          ? 'sage'
                          : doc.status === 'Pending Review'
                          ? 'amber'
                          : 'neutral'
                      }
                      className="text-[10px]"
                    >
                      {doc.status}
                    </Badge>
                  </td>

                  <td className="py-3 px-3 text-[#7A6A55]">
                    {doc.reviewCycle}
                  </td>

                  <td className="py-3 px-3 text-right">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleOpenEditDoc(doc)}
                      className="text-xs py-1 px-2.5 flex items-center gap-1 inline-flex"
                    >
                      <Edit className="w-3 h-3" /> Bump Version
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* BIS HALLMARK, HUID & ASSAYER CERTIFICATION REGISTRY */}
      <Card className="p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3 border-b border-[#EADFC8]">
          <div>
            <div className="flex items-center gap-2">
              <Award className="w-4 h-4 text-[#C9A24B]" />
              <h2 className="text-base font-serif font-bold text-[#5A4630]">
                BIS Hallmark, HUID & Assayer Certification Registry
              </h2>
              <Badge variant="gold" size="sm">Dual-Custody Gated</Badge>
            </div>
            <p className="text-xs text-[#7A6A55] mt-0.5">
              Governs 6-digit laser-engraved HUIDs, Bureau of Indian Standards refinery licenses, and assay certificates. Any modifications route to the Dual-Custody Approval Queue.
            </p>
          </div>

          <Badge variant="neutral" className="text-xs">
            {products.filter((p) => p.hallmarkStatus || p.huid || p.bisReference).length} Certified Products
          </Badge>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-[#5A4630]">
            <thead>
              <tr className="border-b border-[#EADFC8] text-[#7A6A55] bg-[#FFFBF3]">
                <th className="py-2.5 px-3 font-semibold">Article & SKU</th>
                <th className="py-2.5 px-3 font-semibold">Metal & Purity</th>
                <th className="py-2.5 px-3 font-semibold">Hallmark Status</th>
                <th className="py-2.5 px-3 font-semibold">BIS HUID</th>
                <th className="py-2.5 px-3 font-semibold">BIS License Reference</th>
                <th className="py-2.5 px-3 font-semibold">Assayer & Cert #</th>
                <th className="py-2.5 px-3 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EADFC8]">
              {products
                .filter((p) => p.category === 'gold' || p.category === 'silver' || p.huid || p.hallmarkStatus)
                .slice(0, 8)
                .map((prod) => (
                  <tr key={prod.id} className="hover:bg-[#FFFDF9]">
                    <td className="py-3 px-3">
                      <div className="font-semibold text-xs text-[#5A4630]">{prod.name}</div>
                      <div className="text-[10px] font-mono text-[#7A6A55]">{prod.sku}</div>
                    </td>

                    <td className="py-3 px-3">
                      <span className="font-medium text-[#5A4630]">{prod.metal || prod.category.toUpperCase()}</span>
                      <div className="text-[10px] text-[#7A6A55]">{prod.purity * 100}% purity</div>
                    </td>

                    <td className="py-3 px-3">
                      <Badge
                        variant={
                          prod.hallmarkStatus === 'Certified'
                            ? 'sage'
                            : prod.hallmarkStatus === 'Exempt'
                            ? 'neutral'
                            : 'amber'
                        }
                        className="text-[10px]"
                      >
                        {prod.hallmarkStatus || 'Certified'}
                      </Badge>
                    </td>

                    <td className="py-3 px-3">
                      <span className="font-mono font-bold text-[#C9A24B] bg-[#FFFBF3] px-2 py-0.5 rounded border border-[#EADFC8]">
                        {prod.huid || '—'}
                      </span>
                    </td>

                    <td className="py-3 px-3 font-mono text-[11px] text-[#7A6A55]">
                      {prod.bisReference || 'BIS-L-7200192'}
                    </td>

                    <td className="py-3 px-3">
                      <div className="text-[11px] font-medium text-[#5A4630]">
                        {prod.certificate?.assayer || 'MMTC-PAMP India Central Assay'}
                      </div>
                      <div className="text-[10px] font-mono text-[#7A6A55]">
                        {prod.certificate?.certificateNumber || 'CERT-BIS-9912'}
                      </div>
                    </td>

                    <td className="py-3 px-3 text-right">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleOpenEditHallmark(prod)}
                        className="text-xs py-1 px-2.5 flex items-center gap-1 inline-flex"
                      >
                        <Edit className="w-3 h-3" /> Edit BIS Record
                      </Button>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* MODAL 1: Bump Document Version */}
      <Modal
        isOpen={editDocModalOpen}
        onClose={() => setEditDocModalOpen(false)}
        title={`Update Version: ${selectedDoc?.title || ''}`}
        maxWidth="md"
      >
        <div className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-[#5A4630] mb-1">
              New Version Descriptor *
            </label>
            <input
              type="text"
              value={newVersionString}
              onChange={(e) => setNewVersionString(e.target.value)}
              placeholder="e.g. v3.3.0"
              className="w-full p-2 bg-[#FFFBF3] border border-[#EADFC8] rounded-md font-mono text-[#5A4630] focus:outline-hidden focus:border-[#C9A24B]"
            />
          </div>

          <div>
            <label className="block font-semibold text-[#5A4630] mb-1">Status</label>
            <select
              value={newStatus}
              onChange={(e) => setNewStatus(e.target.value as any)}
              className="w-full p-2 bg-[#FFFBF3] border border-[#EADFC8] rounded-md text-[#5A4630]"
            >
              <option value="Effective">Effective</option>
              <option value="Pending Review">Pending Review</option>
              <option value="Superseded">Superseded</option>
            </select>
          </div>

          <div>
            <label className="block font-semibold text-[#5A4630] mb-1">
              Revision Summary & Statutory Notes *
            </label>
            <textarea
              rows={3}
              value={docNotes}
              onChange={(e) => setDocNotes(e.target.value)}
              placeholder="Describe amendments made to the legal text or review triggers..."
              className="w-full p-2.5 bg-[#FFFBF3] border border-[#EADFC8] rounded-md focus:outline-hidden focus:border-[#C9A24B] text-[#5A4630]"
            />
          </div>

          <div className="p-2.5 bg-[#FFF9ED] border border-[#E5C158] rounded text-[11px] text-[#7A6A55] flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-[#C9A24B] shrink-0" />
            <span>Dual-Custody Gate: Submitting will create a pending request in Maker-Checker queue. An independent officer must approve before version is effective.</span>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#EADFC8]">
            <Button variant="outline" size="sm" onClick={() => setEditDocModalOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              disabled={!newVersionString.trim() || !docNotes.trim()}
              onClick={handleSaveDocVersion}
            >
              Submit for Checker Approval
            </Button>
          </div>
        </div>
      </Modal>

      {/* MODAL 2: Edit BIS Hallmark & HUID Record */}
      <Modal
        isOpen={editHallmarkModalOpen}
        onClose={() => setEditHallmarkModalOpen(false)}
        title={`Edit BIS Hallmark & HUID: ${selectedProduct?.name || ''}`}
        maxWidth="md"
      >
        <form onSubmit={handleSaveHallmarkRecord} className="space-y-4 text-xs text-[#5A4630]">
          <div className="p-3 bg-[#FFFBF3] border border-[#EADFC8] rounded-xl space-y-1">
            <div className="font-semibold text-[#5A4630]">{selectedProduct?.name}</div>
            <div className="text-[11px] text-[#7A6A55]">
              SKU: {selectedProduct?.sku} • Current HUID: {selectedProduct?.huid || 'None'}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-[#5A4630] mb-1">
                Hallmark Status *
              </label>
              <select
                value={editHallmarkStatus}
                onChange={(e) => setEditHallmarkStatus(e.target.value as any)}
                className="w-full p-2 bg-white border border-[#EADFC8] rounded-md text-[#5A4630]"
              >
                <option value="Certified">Certified</option>
                <option value="Pending">Pending</option>
                <option value="Exempt">Exempt</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-[#5A4630] mb-1">
                6-Digit BIS HUID *
              </label>
              <input
                type="text"
                required
                maxLength={10}
                value={editHuid}
                onChange={(e) => setEditHuid(e.target.value.toUpperCase())}
                placeholder="e.g. HM8812"
                className="w-full p-2 bg-white border border-[#EADFC8] rounded-md font-mono uppercase text-[#5A4630]"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-[#5A4630] mb-1">
              BIS Refinery / Assayer License Reference *
            </label>
            <input
              type="text"
              required
              value={editBisRef}
              onChange={(e) => setEditBisRef(e.target.value)}
              placeholder="e.g. BIS-L-7200192"
              className="w-full p-2 bg-white border border-[#EADFC8] rounded-md font-mono text-[#5A4630]"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-[#5A4630] mb-1">
                Assayer Name *
              </label>
              <input
                type="text"
                required
                value={editAssayer}
                onChange={(e) => setEditAssayer(e.target.value)}
                placeholder="e.g. MMTC-PAMP India"
                className="w-full p-2 bg-white border border-[#EADFC8] rounded-md text-[#5A4630]"
              />
            </div>

            <div>
              <label className="block font-semibold text-[#5A4630] mb-1">
                Certificate Number *
              </label>
              <input
                type="text"
                required
                value={editCertNum}
                onChange={(e) => setEditCertNum(e.target.value)}
                placeholder="e.g. CERT-BIS-9912"
                className="w-full p-2 bg-white border border-[#EADFC8] rounded-md font-mono text-[#5A4630]"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-[#5A4630] mb-1">
              Justification / Reason for Modification *
            </label>
            <textarea
              rows={2}
              required
              value={editReason}
              onChange={(e) => setEditReason(e.target.value)}
              placeholder="State the audit finding or re-assay calibration reference..."
              className="w-full p-2 bg-white border border-[#EADFC8] rounded-md text-[#5A4630]"
            />
          </div>

          <div className="p-2.5 bg-[#FFF9ED] border border-[#E5C158] rounded text-[11px] text-[#7A6A55] flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-[#C9A24B] shrink-0" />
            <span>Dual-Custody Gate: This statutory record will NOT mutate until an independent compliance officer or administrator approves.</span>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#EADFC8]">
            <Button type="button" variant="outline" size="sm" onClick={() => setEditHallmarkModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm" leftIcon={<Award className="w-4 h-4" />}>
              Submit for Dual-Custody Approval
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
