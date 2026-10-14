import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAppStore } from '../store';
import { useSEO } from '../lib/useSEO';
import { MOCK_CERTIFICATES } from '../data/mockData';
import { Card } from '../components/Card';
import { Badge } from '../components/Badge';
import { Button } from '../components/Button';
import { Modal } from '../components/Modal';
import {
  ShieldCheck,
  ShieldAlert,
  Search,
  FileText,
  ChevronRight,
  Award,
  Calendar,
  Layers,
  ArrowRight,
  QrCode,
  Download,
  Camera,
} from 'lucide-react';

export const VerifyCertPage: React.FC = () => {
  const { certNo = '' } = useParams<{ certNo: string }>();
  const navigate = useNavigate();
  const { products } = useAppStore();

  useSEO({
    title: `Verify Certificate: ${certNo}`,
    description: `Official laboratory assay verification for certificate number ${certNo}. Bureau of Indian Standards (BIS) and GIA/IGI accredited.`,
    canonicalPath: `/verify/${certNo}`,
  });

  const [inputCert, setInputCert] = useState(certNo);
  const [docModalOpen, setDocModalOpen] = useState(false);

  // Look up certificate in MOCK_CERTIFICATES or linked in products
  const certData = MOCK_CERTIFICATES[certNo] || (() => {
    const matchedProd = products.find((p) => p.certificate.number === certNo);
    return matchedProd ? matchedProd.certificate : null;
  })();

  const linkedProduct = products.find((p) => p.certificate.number === certNo);
  const isVerified = certData && certData.status === 'Verified';

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputCert.trim()) {
      navigate(`/verify/${encodeURIComponent(inputCert.trim())}`);
    }
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      {/* Breadcrumb */}
      <nav aria-label="Breadcrumb" className="text-xs text-[#7A6A55] flex items-center gap-1.5 flex-wrap">
        <Link to="/" className="hover:text-[#C9A24B]">Home</Link>
        <ChevronRight className="w-3.5 h-3.5 text-[#EADFC8]" />
        <Link to="/authenticity" className="hover:text-[#C9A24B]">Assay Standards</Link>
        <ChevronRight className="w-3.5 h-3.5 text-[#EADFC8]" />
        <span className="text-[#5A4630] font-medium font-mono">{certNo || 'Search'}</span>
      </nav>

      {/* Page Header */}
      <div className="border-b border-[#EADFC8] pb-6 space-y-2">
        <div className="flex items-center gap-2">
          <Badge variant="gold" size="sm">Laboratory Verification Registry</Badge>
          <Badge variant={isVerified ? 'sage' : 'coral'} size="sm">
            {isVerified ? 'Accredited Issuer' : 'Registry Lookup'}
          </Badge>
        </div>
        <h1 className="font-serif text-3xl sm:text-4xl font-bold text-[#5A4630]">
          Precious Certificate Verification
        </h1>
        <p className="text-xs sm:text-sm text-[#7A6A55] leading-relaxed">
          Verify BIS Hallmarking, NABL Refinery Assays, and GIA/IGI Gemological credentials directly against our secure laboratory lot ledger.
        </p>

        {/* Certificate Number Search Form & Proposed QR Code Validation Box */}
        <div className="pt-3 grid grid-cols-1 md:grid-cols-12 gap-4 items-start">
          <form onSubmit={handleSearchSubmit} className="md:col-span-7 flex gap-2">
            <div className="relative flex-1">
              <input
                type="text"
                value={inputCert}
                onChange={(e) => setInputCert(e.target.value)}
                placeholder="e.g. B24-999-5481, GIA-6421990412"
                aria-label="Certificate number"
                className="w-full text-xs sm:text-sm pl-9 pr-3 py-2.5 bg-white border border-[#EADFC8] rounded-lg text-[#5A4630] focus:outline-none focus:ring-2 focus:ring-[#C9A24B]"
              />
              <Search className="w-4 h-4 text-[#7A6A55] absolute left-3 top-3" />
            </div>
            <Button type="submit" variant="primary" size="md">
              Verify
            </Button>
          </form>

          {/* PROPOSED: QR Validation Box */}
          <div className="md:col-span-5 p-3 bg-white border border-[#EADFC8] rounded-xl flex items-center justify-between gap-3 shadow-xs">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-lg bg-[#F8EFD9] border border-[#EADFC8] flex items-center justify-center shrink-0 text-[#C9A24B]">
                <QrCode className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-bold text-[#5A4630]">Scan Assay QR</span>
                  <Badge variant="neutral" size="sm">Proposed</Badge>
                </div>
                <p className="text-[11px] text-[#7A6A55]">Camera validation</p>
              </div>
            </div>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => alert('Assay QR Scanning is a Proposed Capability for Phase 2+.')}
              leftIcon={<Camera className="w-3.5 h-3.5 text-[#C9A24B]" />}
            >
              Scan
            </Button>
          </div>
        </div>
      </div>

      {/* Verification Result Card */}
      {isVerified ? (
        <Card variant="surface" className="p-6 sm:p-8 space-y-6 border-[#EADFC8]">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#EADFC8]">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-full bg-[#DCE8D5] border border-[#A4C997] flex items-center justify-center shrink-0 text-[#2D5A27]">
                <ShieldCheck className="w-7 h-7" />
              </div>
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#2D5A27] bg-[#DCE8D5] px-2.5 py-0.5 rounded-full inline-block mb-1">
                  Official Assay Authenticated
                </span>
                <h2 className="font-serif text-2xl font-bold text-[#5A4630] font-mono">
                  {certNo}
                </h2>
                <div className="text-xs text-[#7A6A55] mt-0.5">
                  Issued by: <strong>{certData.issuer}</strong>
                </div>
              </div>
            </div>

            <Button
              variant="secondary"
              size="sm"
              onClick={() => setDocModalOpen(true)}
              leftIcon={<FileText className="w-3.5 h-3.5 text-[#C9A24B]" />}
            >
              View Document Card
            </Button>
          </div>

          {/* Verification Details Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 text-xs">
            <div className="p-4 bg-[#FFFBF3] rounded-lg border border-[#EADFC8] space-y-1">
              <span className="text-[#7A6A55] flex items-center gap-1.5 font-medium">
                <Award className="w-3.5 h-3.5 text-[#C9A24B]" />
                Laboratory Issuer
              </span>
              <p className="font-bold text-[#5A4630] text-sm">
                {certData.issuer}
              </p>
              <p className="text-[11px] text-[#7A6A55]">
                Accredited Testing Facility
              </p>
            </div>

            <div className="p-4 bg-[#FFFBF3] rounded-lg border border-[#EADFC8] space-y-1">
              <span className="text-[#7A6A55] flex items-center gap-1.5 font-medium">
                <Calendar className="w-3.5 h-3.5 text-[#C9A24B]" />
                Date of Issuance
              </span>
              <p className="font-bold text-[#5A4630] text-sm">
                {certData.issueDate || '2026-09-15'}
              </p>
              <p className="text-[11px] text-[#7A6A55]">
                Seal validity: Perpetual
              </p>
            </div>

            <div className="p-4 bg-[#FFFBF3] rounded-lg border border-[#EADFC8] space-y-1">
              <span className="text-[#7A6A55] flex items-center gap-1.5 font-medium">
                <Layers className="w-3.5 h-3.5 text-[#C9A24B]" />
                Linked Lot Reference
              </span>
              <p className="font-bold text-[#5A4630] text-sm font-mono">
                {certData.linkedLot || 'LOT-PRECIOUS-2026'}
              </p>
              <p className="text-[11px] text-[#7A6A55]">
                Traceable to refinery melt batch
              </p>
            </div>
          </div>

          {/* Linked Product Block if exists */}
          {linkedProduct && (
            <div className="pt-4 border-t border-[#EADFC8]">
              <span className="text-xs font-bold text-[#5A4630] uppercase tracking-wider block mb-3">
                Certified Piece Linked to This Document
              </span>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 bg-[#F8EFD9] border border-[#EADFC8] rounded-lg">
                <div className="space-y-1">
                  <h3 className="font-serif text-base font-bold text-[#5A4630]">
                    {linkedProduct.name}
                  </h3>
                  <div className="text-xs text-[#7A6A55] font-mono">
                    SKU: {linkedProduct.sku} • Net Wt: {linkedProduct.netWeightG}g
                  </div>
                </div>
                <Link to={`/p/${linkedProduct.slug}`}>
                  <Button variant="primary" size="sm" rightIcon={<ArrowRight className="w-3.5 h-3.5" />}>
                    View Product Page
                  </Button>
                </Link>
              </div>
            </div>
          )}
        </Card>
      ) : (
        /* Certificate Not Found State */
        <Card variant="surface" className="p-6 sm:p-8 space-y-6 border-[#EADFC8]">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-full bg-[#F7D4CF] border border-[#E89E95] flex items-center justify-center shrink-0 text-[#8C2E24]">
              <ShieldAlert className="w-7 h-7" />
            </div>
            <div className="space-y-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#8C2E24] bg-[#F7D4CF] px-2.5 py-0.5 rounded-full inline-block">
                Certificate Status: Not Found
              </span>
              <h2 className="font-serif text-2xl font-bold text-[#5A4630]">
                Certificate #{certNo || 'Unknown'} Not Found in Registry
              </h2>
              <p className="text-xs sm:text-sm text-[#7A6A55] leading-relaxed max-w-xl">
                The specified certificate number does not match any authenticated assay or laboratory records in our registry. Please check for typographical errors or test with our sample certified numbers below.
              </p>
            </div>
          </div>

          {/* Sample Valid Certificate Numbers */}
          <div className="pt-4 border-t border-[#EADFC8] space-y-3">
            <span className="text-xs font-semibold text-[#5A4630]">
              Try searching one of these active sample certificates:
            </span>
            <div className="flex flex-wrap gap-2">
              <Link to="/verify/B24-999-5481">
                <Badge variant="gold" size="md" className="cursor-pointer hover:bg-[#ebd8a7]">
                  B24-999-5481 (24K Gold Coin BIS Assay)
                </Badge>
              </Link>
              <Link to="/verify/GIA-6421990412">
                <Badge variant="gold" size="md" className="cursor-pointer hover:bg-[#ebd8a7]">
                  GIA-6421990412 (Burmese Ruby GIA Cert)
                </Badge>
              </Link>
              <Link to="/verify/INVALID-9999">
                <Badge variant="neutral" size="md" className="cursor-pointer">
                  INVALID-9999 (Sample Unverified)
                </Badge>
              </Link>
            </div>
          </div>
        </Card>
      )}

      {/* Document Placeholder Modal */}
      {isVerified && (
        <Modal
          isOpen={docModalOpen}
          onClose={() => setDocModalOpen(false)}
          title={`Official Assay Certicard: ${certNo}`}
          maxWidth="lg"
          footer={
            <Button variant="secondary" size="sm" onClick={() => setDocModalOpen(false)}>
              Close Document
            </Button>
          }
        >
          <div className="p-6 bg-gradient-to-br from-[#FFFDF7] to-[#FAF1DB] border-2 border-dashed border-[#C9A24B] rounded-xl text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-white mx-auto flex items-center justify-center border border-[#EADFC8] shadow-sm text-[#C9A24B]">
              <Award className="w-8 h-8" />
            </div>

            <div className="space-y-1">
              <span className="text-[10px] uppercase tracking-widest font-bold text-[#C9A24B]">
                Official Sealed Laboratory Document
              </span>
              <h3 className="font-serif text-xl font-bold text-[#5A4630]">
                Certificate of Assay & Hallmark Authenticity
              </h3>
              <p className="text-xs text-[#7A6A55]">
                Accreditation Registry Code: <strong>{certNo}</strong>
              </p>
            </div>

            <div className="max-w-md mx-auto text-left bg-white/90 p-4 rounded-lg border border-[#EADFC8] text-xs space-y-2">
              <div className="flex justify-between border-b border-[#EADFC8] pb-1.5">
                <span className="text-[#7A6A55]">Issuing Authority:</span>
                <span className="font-bold text-[#5A4630]">{certData?.issuer}</span>
              </div>
              <div className="flex justify-between border-b border-[#EADFC8] pb-1.5">
                <span className="text-[#7A6A55]">Melt Lot Identification:</span>
                <span className="font-mono text-[#5A4630]">{certData?.linkedLot}</span>
              </div>
              <div className="flex justify-between border-b border-[#EADFC8] pb-1.5">
                <span className="text-[#7A6A55]">Assay Standard:</span>
                <span className="text-[#5A4630]">NABL ISO/IEC 17025 Compliant</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#7A6A55]">Hallmark Hologram:</span>
                <span className="text-[#2D5A27] font-semibold">Active & Tamper-Evident</span>
              </div>
            </div>

            <p className="text-[11px] text-[#7A6A55] italic">
              This document card confirms laboratory registry custody for prototype demonstration.
            </p>
          </div>
        </Modal>
      )}

      {/* PROPOSED: Certificate Download Center Link */}
      <div className="p-5 bg-gradient-to-r from-[#F8EFD9] via-[#FAF3E2] to-[#F1E3BD] border border-[#C9A24B]/40 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shrink-0 border border-[#EADFC8] text-[#C9A24B]">
            <Download className="w-5 h-5 text-[#C9A24B]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-serif font-bold text-sm text-[#5A4630]">
                Institutional Certificate Download Center
              </h3>
              <Badge variant="neutral" size="sm">Proposed</Badge>
            </div>
            <p className="text-xs text-[#7A6A55] mt-0.5">
              Export cryptographic PDF reports and laboratory assay registries in bulk for family offices, vault custodians, and corporate audits.
            </p>
          </div>
        </div>
        <Button
          variant="secondary"
          size="sm"
          className="bg-white shrink-0"
          onClick={() => alert('Batch Certificate Download Center is a Proposed Institutional Feature.')}
          leftIcon={<Download className="w-3.5 h-3.5 text-[#C9A24B]" />}
        >
          Open Download Center
        </Button>
      </div>
    </div>
  );
};
