import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAppStore } from '../store';
import { useSEO } from '../lib/useSEO';
import { formatINR, formatFullDateTime } from '../lib/pricing';
import { Card } from '../components/Card';
import { Badge } from '../components/Badge';
import { Button } from '../components/Button';
import { Modal } from '../components/Modal';
import {
  Gift,
  ChevronRight,
  CheckCircle2,
  Building2,
  FileText,
  Clock,
  ShieldCheck,
  Plus,
  Upload,
  AlertTriangle,
  Send,
  Download,
  Users,
} from 'lucide-react';
import type { CorporateEnquiry, CorporateRecipient } from '../data/types';

export const GiftingEnquiryPage: React.FC = () => {
  useSEO({
    title: 'Corporate Treasury & Bespoke Gifting Desk',
    description: 'Custom-minted 24K gold and 999 silver coins, institutional milestone awards, and multi-recipient split delivery logistics.',
    canonicalPath: '/corporate-gifting',
  });

  const {
    corporateQuotes,
    submitCorporateEnquiry,
    acceptCorporateQuote,
    requestCorporateQuoteRevision,
  } = useAppStore();

  // Active view tab
  const [activeTab, setActiveTab] = useState<'enquiry' | 'quotes' | 'recipients'>('enquiry');

  // Enquiry Form State
  const [companyName, setCompanyName] = useState('Reliance Capital Treasury Group');
  const [contactPerson, setContactPerson] = useState('Anand Mehta');
  const [email, setEmail] = useState('anand.mehta@reliance-treasury.in');
  const [phone, setPhone] = useState('+91 98200 44101');
  const [gstin, setGstin] = useState('27AABCR9912B1Z4');
  const [occasion, setOccasion] = useState('Executive Annual Diwali Commemoration');
  const [quantity, setQuantity] = useState(250);
  const [budgetPerRecipient, setBudgetPerRecipient] = useState(35000);
  const [preferences, setPreferences] = useState('Custom laser engraved 10g 24K gold coins with company emblem on reverse.');
  const [brandingRequired, setBrandingRequired] = useState(true);
  const [deliverySchedule, setDeliverySchedule] = useState('2026-11-05');
  const [packagingType, setPackagingType] = useState('Handcrafted Velvet Rosewood Presentation Casket');
  const [remarks, setRemarks] = useState('Requires individual tamper-evident presentation certicards and split dispatch across Mumbai and Delhi offices.');
  const [attachedFileName, setAttachedFileName] = useState<string | null>('reliance_treasury_crest_vector.ai');
  const [formError, setFormError] = useState<string | null>(null);
  const [submittedEnquiry, setSubmittedEnquiry] = useState<CorporateEnquiry | null>(null);

  // Quote Revision Modal
  const [revisionModalQuoteId, setRevisionModalQuoteId] = useState<string | null>(null);
  const [revisionNotes, setRevisionNotes] = useState('');
  const [quoteActionMessage, setQuoteActionMessage] = useState<string | null>(null);

  // Multi-Recipient Sample Data
  const [recipients, setRecipients] = useState<CorporateRecipient[]>([
    {
      id: 'rec-01',
      quoteId: 'QUO-CORP-2026-01',
      name: 'Vikramaditya Singhania',
      phone: '+91 98200 11223',
      email: 'vikram.singhania@reliance.in',
      address: '72 Altamount Road, Cumballa Hill',
      pincode: '400026',
      giftVariant: '10g 24K Gold Coin (Crest Minted)',
      customMessage: 'In celebration of exceptional leadership and dedication.',
      shipmentGroupId: 'Mumbai Nariman Point HQ',
      deliveryStatus: 'Pending',
    },
    {
      id: 'rec-02',
      quoteId: 'QUO-CORP-2026-01',
      name: 'Sunita Mehra (VP Commercial)',
      phone: '+91 98101 22334',
      email: 'sunita.mehra@reliance.in',
      address: 'Plot 4, Barakhamba Road, Connaught Place',
      pincode: '110001',
      giftVariant: '10g 24K Gold Coin (Crest Minted)',
      customMessage: 'With deep gratitude for steering milestone operations.',
      shipmentGroupId: 'New Delhi Connaught Hub',
      deliveryStatus: 'Pending',
    },
    {
      id: 'rec-03',
      quoteId: 'QUO-CORP-2026-01',
      name: 'Karthik Raman (Director Treasury)',
      phone: '+91 98450 33445',
      email: 'karthik.raman@reliance.in',
      address: 'Level 12, Trinity Circle, MG Road',
      pincode: '560001',
      giftVariant: '10g 24K Gold Coin (Crest Minted)',
      customMessage: 'Honouring financial excellence and treasury stewardship.',
      shipmentGroupId: 'Bengaluru MG Road Facility',
      deliveryStatus: 'Pending',
    },
  ]);

  // Recipient Modal State
  const [recipientModalOpen, setRecipientModalOpen] = useState(false);
  const [newRecName, setNewRecName] = useState('');
  const [newRecPhone, setNewRecPhone] = useState('');
  const [newRecAddress, setNewRecAddress] = useState('');
  const [newRecPincode, setNewRecPincode] = useState('');
  const [newRecGroup, setNewRecGroup] = useState('Mumbai Nariman Point HQ');
  const [newRecMessage, setNewRecMessage] = useState('');
  const [recError, setRecError] = useState<string | null>(null);

  // Handle Enquiry Submit
  const handleEnquirySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    // GSTIN format validation
    if (gstin.trim()) {
      const gstinRegex = /^\d{2}[A-Z]{5}\d{4}[A-Z]{1}[A-Z\d]{1}[Z]{1}[A-Z\d]{1}$/;
      if (!gstinRegex.test(gstin.trim().toUpperCase())) {
        setFormError('Invalid Corporate GSTIN format. Must match standard 15-character GST identification (e.g. 27AABCR9912B1Z4).');
        return;
      }
    }

    if (quantity < 10) {
      setFormError('Minimum institutional order quantity is 10 units for bespoke corporate minting.');
      return;
    }

    const created = submitCorporateEnquiry({
      companyName: companyName.trim(),
      contactPerson: contactPerson.trim(),
      email: email.trim(),
      phone: phone.trim(),
      gstin: gstin.trim().toUpperCase() || undefined,
      occasion,
      quantity,
      budgetPerRecipient,
      preferences: `${preferences} (Packaging: ${packagingType})`,
      brandingRequired,
      deliverySchedule,
      recipientCount: quantity,
      remarks,
      leadSource: 'Storefront Corporate Desk',
    });

    setSubmittedEnquiry(created);
  };

  // Handle Quote Acceptance
  const handleAcceptQuote = (quoteId: string) => {
    const res = acceptCorporateQuote(quoteId);
    setQuoteActionMessage(res.message);
    setTimeout(() => setQuoteActionMessage(null), 6000);
  };

  // Handle Quote Revision Request
  const handleRevisionSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!revisionModalQuoteId || !revisionNotes.trim()) return;

    const res = requestCorporateQuoteRevision(revisionModalQuoteId, revisionNotes.trim());
    setQuoteActionMessage(res.message);
    setRevisionModalQuoteId(null);
    setRevisionNotes('');
    setTimeout(() => setQuoteActionMessage(null), 6000);
  };

  // Add Recipient Handler
  const handleAddRecipient = (e: React.FormEvent) => {
    e.preventDefault();
    setRecError(null);

    if (newRecPincode.trim().startsWith('9')) {
      setRecError('Pincodes starting with 9 are outside our high-value armoured transit routes.');
      return;
    }

    const newRec: CorporateRecipient = {
      id: `rec-${Date.now()}`,
      quoteId: 'QUO-CORP-2026-01',
      name: newRecName.trim(),
      phone: newRecPhone.trim(),
      address: newRecAddress.trim(),
      pincode: newRecPincode.trim(),
      giftVariant: '10g 24K Gold Coin (Crest Minted)',
      customMessage: newRecMessage.trim() || undefined,
      shipmentGroupId: newRecGroup,
      deliveryStatus: 'Pending',
    };

    setRecipients([...recipients, newRec]);
    setRecipientModalOpen(false);
    setNewRecName('');
    setNewRecPhone('');
    setNewRecAddress('');
    setNewRecPincode('');
    setNewRecMessage('');
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Breadcrumb */}
      <nav aria-label="Breadcrumb" className="text-xs text-[#7A6A55] flex items-center gap-1.5 flex-wrap">
        <Link to="/" className="hover:text-[#C9A24B]">Home</Link>
        <ChevronRight className="w-3.5 h-3.5 text-[#EADFC8]" />
        <Link to="/c/gifting" className="hover:text-[#C9A24B]">Gifting Collections</Link>
        <ChevronRight className="w-3.5 h-3.5 text-[#EADFC8]" />
        <span className="text-[#5A4630] font-medium">Corporate Treasury & Bespoke Minting</span>
      </nav>

      {/* Header Banner */}
      <div className="border-b border-[#EADFC8] pb-6 space-y-3">
        <div className="flex items-center gap-2 flex-wrap">
          <Badge variant="gold" size="sm">Institutional Treasury Services</Badge>
          <Badge variant="sage" size="sm">BIS Hallmarked & 100% Insured</Badge>
        </div>
        <h1 className="font-serif text-3xl sm:text-4xl font-bold text-[#5A4630] flex items-center gap-3">
          <Gift className="w-8 h-8 text-[#C9A24B]" />
          Corporate & Institutional Gifting Desk
        </h1>
        <p className="text-xs sm:text-sm text-[#7A6A55] leading-relaxed max-w-3xl">
          Commission custom-minted 24K investment gold and 999 fine silver coins embossed with corporate insignias, serialized tamper-evident certicards, and automated split-delivery logistics across multi-city enterprise offices.
        </p>

        {/* Tab Selector */}
        <div className="flex items-center gap-3 pt-3 border-t border-[#EADFC8] text-xs font-semibold overflow-x-auto">
          <button
            onClick={() => setActiveTab('enquiry')}
            className={`pb-2 px-1 border-b-2 transition-colors flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'enquiry'
                ? 'border-[#C9A24B] text-[#5A4630]'
                : 'border-transparent text-[#7A6A55] hover:text-[#5A4630]'
            }`}
          >
            <Building2 className="w-4 h-4" />
            <span>New Bespoke Requisition</span>
          </button>

          <button
            onClick={() => setActiveTab('quotes')}
            className={`pb-2 px-1 border-b-2 transition-colors flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'quotes'
                ? 'border-[#C9A24B] text-[#5A4630]'
                : 'border-transparent text-[#7A6A55] hover:text-[#5A4630]'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Active Corporate Quotes ({corporateQuotes.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('recipients')}
            className={`pb-2 px-1 border-b-2 transition-colors flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'recipients'
                ? 'border-[#C9A24B] text-[#5A4630]'
                : 'border-transparent text-[#7A6A55] hover:text-[#5A4630]'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Multi-Recipient & Split Dispatch</span>
          </button>
        </div>
      </div>

      {quoteActionMessage && (
        <div className="p-4 bg-[#DCE8D5] border border-[#A4C997] rounded-xl text-xs text-[#2D5A27] flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 shrink-0" />
          <span>{quoteActionMessage}</span>
        </div>
      )}

      {/* TAB 1: BESPOKE REQUISITION FORM */}
      {activeTab === 'enquiry' && (
        <>
          {submittedEnquiry ? (
            <Card variant="surface" className="p-8 text-center max-w-lg mx-auto space-y-4 border-[#A4C997] bg-[#FAFDF9]">
              <div className="w-14 h-14 rounded-full bg-[#DCE8D5] border border-[#A4C997] flex items-center justify-center mx-auto text-[#2D5A27]">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h2 className="font-serif text-2xl font-bold text-[#2D5A27]">
                Bespoke Requisition Registered
              </h2>
              <div className="p-4 bg-white border border-[#EADFC8] rounded-xl text-xs text-left space-y-1.5 text-[#5A4630]">
                <p>Enquiry Reference: <strong className="font-mono">{submittedEnquiry.id}</strong></p>
                <p>Company: <strong>{submittedEnquiry.companyName}</strong></p>
                <p>Requisition: <strong>{submittedEnquiry.quantity} Units</strong> for {submittedEnquiry.occasion}</p>
                <p>Target Schedule: <strong>{submittedEnquiry.deliverySchedule}</strong></p>
                <p className="text-[#2D5A27] text-[11px] pt-1">
                  ✓ Treasury Relationship Manager Assigned • SLA: Formal quote within 24 hours
                </p>
              </div>
              <p className="text-xs text-[#7A6A55]">
                An official acknowledgement has been recorded in the corporate audit ledger.
              </p>
              <div className="flex justify-center gap-3 pt-2">
                <Button variant="primary" size="sm" onClick={() => setActiveTab('quotes')}>
                  View Active Quotes
                </Button>
                <Button variant="secondary" size="sm" onClick={() => setSubmittedEnquiry(null)}>
                  Submit Another Requisition
                </Button>
              </div>
            </Card>
          ) : (
            <Card variant="surface" className="p-6 sm:p-8 border-[#EADFC8] space-y-6">
              <div className="flex items-center justify-between pb-3 border-b border-[#EADFC8]">
                <span className="text-xs font-bold text-[#5A4630] uppercase tracking-wider">
                  Bespoke Corporate Minting Specification Form
                </span>
                <span className="text-[11px] text-[#7A6A55]">
                  Minimum order: 10 units for custom die tooling
                </span>
              </div>

              {formError && (
                <div className="p-3.5 bg-[#F7D4CF] border border-[#E89E95] rounded-lg text-xs text-[#8C2E24] flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{formError}</span>
                </div>
              )}

              <form onSubmit={handleEnquirySubmit} className="space-y-5 text-xs">
                {/* Enterprise Details */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[#5A4630] font-medium mb-1">Company / Institution Legal Name</label>
                    <input
                      type="text"
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      required
                      placeholder="e.g. Tata Consultancy Services Ltd"
                      className="w-full px-3 py-2 bg-white border border-[#EADFC8] rounded-md text-[#5A4630]"
                    />
                  </div>

                  <div>
                    <label className="block text-[#5A4630] font-medium mb-1">Contact Officer Name & Designation</label>
                    <input
                      type="text"
                      value={contactPerson}
                      onChange={(e) => setContactPerson(e.target.value)}
                      required
                      placeholder="e.g. Anand Mehta (VP Treasury)"
                      className="w-full px-3 py-2 bg-white border border-[#EADFC8] rounded-md text-[#5A4630]"
                    />
                  </div>

                  <div>
                    <label className="block text-[#5A4630] font-medium mb-1">Corporate Email Address</label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      placeholder="officer@company.com"
                      className="w-full px-3 py-2 bg-white border border-[#EADFC8] rounded-md text-[#5A4630]"
                    />
                  </div>

                  <div>
                    <label className="block text-[#5A4630] font-medium mb-1">Contact Mobile Number</label>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      required
                      placeholder="+91 98200 44101"
                      className="w-full px-3 py-2 bg-white border border-[#EADFC8] rounded-md text-[#5A4630]"
                    />
                  </div>

                  <div>
                    <label className="block text-[#5A4630] font-medium mb-1">Company GSTIN (Statutory 15-character ID)</label>
                    <input
                      type="text"
                      value={gstin}
                      onChange={(e) => setGstin(e.target.value.toUpperCase())}
                      maxLength={15}
                      required
                      placeholder="e.g. 27AABCR9912B1Z4"
                      className="w-full px-3 py-2 bg-white border border-[#EADFC8] rounded-md text-[#5A4630] font-mono uppercase"
                    />
                  </div>

                  <div>
                    <label className="block text-[#5A4630] font-medium mb-1">Gifting Occasion / Milestone</label>
                    <input
                      type="text"
                      value={occasion}
                      onChange={(e) => setOccasion(e.target.value)}
                      required
                      placeholder="e.g. Annual Diwali Gala, 25-Year Long Service"
                      className="w-full px-3 py-2 bg-white border border-[#EADFC8] rounded-md text-[#5A4630]"
                    />
                  </div>
                </div>

                {/* Scope & Volumes */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 border-t border-[#EADFC8]">
                  <div>
                    <label className="block text-[#5A4630] font-medium mb-1">Estimated Quantity (Units)</label>
                    <input
                      type="number"
                      value={quantity}
                      onChange={(e) => setQuantity(Number(e.target.value))}
                      min={10}
                      step={10}
                      required
                      className="w-full px-3 py-2 bg-white border border-[#EADFC8] rounded-md text-[#5A4630] font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-[#5A4630] font-medium mb-1">Target Budget per Recipient (INR)</label>
                    <input
                      type="number"
                      value={budgetPerRecipient}
                      onChange={(e) => setBudgetPerRecipient(Number(e.target.value))}
                      min={5000}
                      step={1000}
                      required
                      className="w-full px-3 py-2 bg-white border border-[#EADFC8] rounded-md text-[#5A4630] font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-[#5A4630] font-medium mb-1">Required Delivery Schedule</label>
                    <input
                      type="date"
                      value={deliverySchedule}
                      onChange={(e) => setDeliverySchedule(e.target.value)}
                      required
                      className="w-full px-3 py-2 bg-white border border-[#EADFC8] rounded-md text-[#5A4630]"
                    />
                  </div>
                </div>

                {/* Packaging & Minting Specifications */}
                <div className="space-y-3 pt-2 border-t border-[#EADFC8]">
                  <label className="block text-[#5A4630] font-medium">Packaging & Presentation Preference</label>
                  <select
                    value={packagingType}
                    onChange={(e) => setPackagingType(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-[#EADFC8] rounded-md text-[#5A4630]"
                  >
                    <option value="Handcrafted Velvet Rosewood Presentation Casket">Handcrafted Velvet Rosewood Presentation Casket</option>
                    <option value="Tamper-Evident Holographic Assayer Certipack Card">Tamper-Evident Holographic Assayer Certipack Card</option>
                    <option value="Sovereign Silk-Lined Gold Foil Presentation Box">Sovereign Silk-Lined Gold Foil Presentation Box</option>
                    <option value="Executive Eco-Luxe Minimalist Leatherette Case">Executive Eco-Luxe Minimalist Leatherette Case</option>
                  </select>

                  <div>
                    <label className="block text-[#5A4630] font-medium mb-1">Minting Inscription & Reverse Crest Requirements</label>
                    <textarea
                      value={preferences}
                      onChange={(e) => setPreferences(e.target.value)}
                      rows={2}
                      placeholder="Specify custom emblems, obverse/reverse engraving, purity standard (24K Gold 999.9 vs 999 Silver)..."
                      className="w-full px-3 py-2 bg-white border border-[#EADFC8] rounded-md text-[#5A4630]"
                    />
                  </div>

                  <div className="pt-1">
                    <label className="flex items-center gap-2 cursor-pointer text-xs text-[#5A4630]">
                      <input
                        type="checkbox"
                        checked={brandingRequired}
                        onChange={(e) => setBrandingRequired(e.target.checked)}
                        className="rounded text-[#C9A24B] focus:ring-[#C9A24B]"
                      />
                      <span className="font-medium">Custom Institutional Die Tooling & Laser Branding Required</span>
                    </label>
                  </div>

                  {/* Simulated Vector File Upload */}
                  <div>
                    <label className="block text-[#5A4630] font-medium mb-1">Corporate Emblem / Vector Logo (Simulated Upload)</label>
                    <div className="p-4 border-2 border-dashed border-[#EADFC8] rounded-xl flex items-center justify-between bg-[#FFFBF3]">
                      <div className="flex items-center gap-3">
                        <Upload className="w-5 h-5 text-[#C9A24B]" />
                        <div>
                          <p className="font-medium text-[#5A4630]">{attachedFileName || 'No file selected'}</p>
                          <p className="text-[10px] text-[#7A6A55]">Accepted formats: AI, EPS, SVG, High-Res PNG (Max 25MB)</p>
                        </div>
                      </div>
                      <Button
                        type="button"
                        variant="secondary"
                        size="sm"
                        onClick={() => {
                          setAttachedFileName('custom_crest_vector_2026.ai');
                          alert('Corporate vector logo attached successfully for die design proofing.');
                        }}
                      >
                        {attachedFileName ? 'Replace Logo' : 'Select File'}
                      </Button>
                    </div>
                  </div>

                  {/* Multi-Location Dispatch Notice */}
                  <div>
                    <label className="block text-[#5A4630] font-medium mb-1">Multi-City Dispatch & Split Delivery Notes</label>
                    <textarea
                      value={remarks}
                      onChange={(e) => setRemarks(e.target.value)}
                      rows={2}
                      placeholder="Note required delivery destinations (e.g. 100 units Mumbai, 100 units Bangalore, 50 units Delhi)..."
                      className="w-full px-3 py-2 bg-white border border-[#EADFC8] rounded-md text-[#5A4630]"
                    />
                  </div>
                </div>

                <div className="pt-3 border-t border-[#EADFC8] flex justify-end">
                  <Button type="submit" variant="primary" size="md" leftIcon={<Send className="w-4 h-4" />}>
                    Submit Treasury Requisition
                  </Button>
                </div>
              </form>
            </Card>
          )}
        </>
      )}

      {/* TAB 2: ACTIVE CORPORATE QUOTES & APPROVAL */}
      {activeTab === 'quotes' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="font-serif text-xl font-bold text-[#5A4630]">
              Active Institutional Treasury Quotes
            </h2>
            <span className="text-xs text-[#7A6A55]">
              Guaranteed spot rates with statutory margin floors
            </span>
          </div>

          <div className="space-y-4">
            {corporateQuotes.map((quote) => {
              const isAccepted = quote.status === 'Accepted';
              const isExpired = new Date(quote.expiresAt).getTime() < Date.now();
              const isMarginApproved = quote.isMarginApproved;
              const hasCreditTerms =
                quote.paymentTerms?.toLowerCase().includes('credit') ||
                quote.paymentTerms?.toLowerCase().includes('net');

              return (
                <Card key={quote.id} variant="surface" className="p-6 border-[#EADFC8] space-y-4 shadow-2xs">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#EADFC8]">
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-mono font-bold text-sm text-[#5A4630]">{quote.quoteNumber}</span>
                        <Badge variant={isAccepted ? 'sage' : isExpired ? 'coral' : isMarginApproved ? 'gold' : 'amber'} size="sm">
                          {isMarginApproved ? quote.status.replace('_', ' ') : 'Quote under review'}
                        </Badge>
                        {isMarginApproved ? (
                          <Badge variant="sage" size="sm">
                            Approved ({Math.round(quote.marginPercent * 100)}%)
                          </Badge>
                        ) : (
                          <Badge variant="amber" size="sm">
                            Quote under review
                          </Badge>
                        )}
                        {hasCreditTerms && (
                          <Badge variant="neutral" size="sm">
                            Corporate Credit Terms
                          </Badge>
                        )}
                      </div>
                      <p className="text-[11px] text-[#7A6A55] mt-1">
                        Client: <strong>Reliance Capital Treasury Group</strong> • Payment Terms: <strong>{quote.paymentTerms}</strong>
                      </p>
                    </div>

                    <div className="text-right">
                      <span className="text-[11px] text-[#7A6A55]">Grand Total (incl. 3% GST)</span>
                      <div className="font-serif font-bold text-2xl text-[#5A4630] tabular-nums">
                        {formatINR(quote.total)}
                      </div>
                    </div>
                  </div>

                  {/* Quote Review Advisory */}
                  {!isMarginApproved && (
                    <div className="p-3 bg-[#FFF9ED] border border-[#E5C158] rounded-lg text-xs text-[#7A6A55] flex items-start gap-2.5">
                      <AlertTriangle className="w-4 h-4 text-[#C9A24B] shrink-0 mt-0.5" />
                      <div>
                        <strong className="text-[#5A4630] font-semibold">Quote under review: </strong>
                        <span>
                          Our institutional desk is reviewing this quote. Once finalized, you will be able to accept the quote and authorize die tooling directly from this portal.
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Items list */}
                  <div className="border border-[#EADFC8] rounded-lg overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead>
                        <tr className="bg-[#F8EFD9] text-[#5A4630] font-semibold">
                          <th className="p-2.5">Article Specification</th>
                          <th className="p-2.5">Quantity</th>
                          <th className="p-2.5">Unit Price</th>
                          <th className="p-2.5">Customization</th>
                          <th className="p-2.5 text-right">Subtotal</th>
                        </tr>
                      </thead>
                      <tbody>
                        {quote.items.map((it, idx) => (
                          <tr key={idx} className="border-t border-[#EADFC8]">
                            <td className="p-2.5 font-medium">{it.name}</td>
                            <td className="p-2.5 font-bold">{it.quantity}</td>
                            <td className="p-2.5 tabular-nums">{formatINR(it.unitPrice)}</td>
                            <td className="p-2.5 tabular-nums">{formatINR(it.customizationCost)}</td>
                            <td className="p-2.5 text-right font-serif font-bold tabular-nums">
                              {formatINR((it.unitPrice + it.customizationCost) * it.quantity)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Proof and Validity strip */}
                  <div className="p-3 bg-[#FFFBF3] border border-[#EADFC8] rounded-md text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-[#C9A24B]" />
                      <span>Valid until: <strong>{formatFullDateTime(quote.expiresAt)}</strong></span>
                    </div>

                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => alert('Downloading official die minting proof PDF.')}
                        className="text-[#C9A24B] hover:underline flex items-center gap-1 font-semibold"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>View Die Minting Proof</span>
                      </button>
                    </div>
                  </div>

                  {/* Action row */}
                  <div className="pt-2 border-t border-[#EADFC8] flex items-center justify-end gap-3 flex-wrap">
                    {!isAccepted && !isExpired ? (
                      <>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setRevisionModalQuoteId(quote.id)}
                        >
                          Request Revision
                        </Button>
                        <Button
                          variant={isMarginApproved ? 'primary' : 'secondary'}
                          size="sm"
                          disabled={!isMarginApproved}
                          title={!isMarginApproved ? 'Quote under review' : 'Accept quote'}
                          onClick={() => handleAcceptQuote(quote.id)}
                          leftIcon={<ShieldCheck className="w-4 h-4" />}
                        >
                          {isMarginApproved ? 'Accept Quote & Authorize Die Tooling' : 'Quote under review'}
                        </Button>
                      </>
                    ) : isAccepted ? (
                      <span className="text-xs font-bold text-[#2D5A27] flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4 text-[#2D5A27]" />
                        <span>Quote Accepted — Proceeding with Multi-Recipient Split Dispatch</span>
                      </span>
                    ) : (
                      <span className="text-xs text-[#8C2E24] font-medium">Quote Expired</span>
                    )}
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 3: MULTI-RECIPIENT & SPLIT DISPATCH */}
      {activeTab === 'recipients' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="font-serif text-xl font-bold text-[#5A4630]">
                Enterprise Multi-Recipient & Split Dispatch
              </h2>
              <p className="text-xs text-[#7A6A55]">
                Upload recipient manifests and allocate delivery groups with automated PIN code validation.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => alert('Simulated CSV bulk upload completed: 50 recipient records loaded into manifest.')}
                leftIcon={<Upload className="w-3.5 h-3.5" />}
              >
                Upload Recipient CSV
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={() => setRecipientModalOpen(true)}
                leftIcon={<Plus className="w-3.5 h-3.5" />}
              >
                Add Recipient
              </Button>
            </div>
          </div>

          {/* Grouping Summary */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {[
              { group: 'Mumbai Nariman Point HQ', count: 120, status: 'Manifest Prepared' },
              { group: 'New Delhi Connaught Hub', count: 80, status: 'Air Express Group' },
              { group: 'Bengaluru MG Road Facility', count: 50, status: 'Vault Courier Transit' },
            ].map((g, idx) => (
              <div key={idx} className="p-4 bg-white border border-[#EADFC8] rounded-xl space-y-1 text-xs">
                <span className="font-bold text-[#5A4630] block">{g.group}</span>
                <p className="text-[#7A6A55]">Allocation: <strong>{g.count} Units</strong></p>
                <Badge variant="sage" size="sm">{g.status}</Badge>
              </div>
            ))}
          </div>

          {/* Recipients Table */}
          <div className="border border-[#EADFC8] rounded-xl overflow-x-auto bg-white">
            <table className="w-full min-w-[640px] text-left text-xs border-collapse">
              <thead>
                <tr className="bg-[#F8EFD9] text-[#5A4630] font-semibold">
                  <th className="py-3 px-4">Recipient Name</th>
                  <th className="py-3 px-4">Delivery Destination</th>
                  <th className="py-3 px-4">PIN Code</th>
                  <th className="py-3 px-4">Dispatch Group</th>
                  <th className="py-3 px-4">Custom Message</th>
                  <th className="py-3 px-4 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EADFC8]">
                {recipients.map((rec) => (
                  <tr key={rec.id} className="hover:bg-[#FFFBF3]">
                    <td className="py-3 px-4">
                      <div className="font-semibold text-[#5A4630]">{rec.name}</div>
                      <div className="text-[10px] text-[#7A6A55]">{rec.phone}</div>
                    </td>
                    <td className="py-3 px-4 text-[#7A6A55]">{rec.address}</td>
                    <td className="py-3 px-4 font-mono font-bold text-[#5A4630]">{rec.pincode}</td>
                    <td className="py-3 px-4 font-medium text-[#5A4630]">{rec.shipmentGroupId}</td>
                    <td className="py-3 px-4 italic text-[11px] text-[#7A6A55] max-w-[200px] truncate">
                      "{rec.customMessage}"
                    </td>
                    <td className="py-3 px-4 text-center">
                      <Badge variant="neutral" size="sm">{rec.deliveryStatus}</Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Quote Revision Request Modal */}
      <Modal
        isOpen={!!revisionModalQuoteId}
        onClose={() => setRevisionModalQuoteId(null)}
        title="Request Quote Revision"
        maxWidth="md"
      >
        <form onSubmit={handleRevisionSubmit} className="space-y-4 text-xs">
          <p className="text-[#7A6A55]">
            Specify required adjustments to unit count, metal purity, customized presentation caskets, or target pricing:
          </p>
          <textarea
            value={revisionNotes}
            onChange={(e) => setRevisionNotes(e.target.value)}
            required
            rows={4}
            placeholder="e.g. Please revise quotation for 300 units of 5g pure gold coins instead of 250 units of 10g..."
            className="w-full px-3 py-2 bg-white border border-[#EADFC8] rounded-md text-[#5A4630]"
          />
          <div className="pt-2 flex justify-end gap-2">
            <Button variant="outline" size="sm" type="button" onClick={() => setRevisionModalQuoteId(null)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" type="submit">
              Submit Revision to Treasury
            </Button>
          </div>
        </form>
      </Modal>

      {/* Add Recipient Modal */}
      <Modal
        isOpen={recipientModalOpen}
        onClose={() => setRecipientModalOpen(false)}
        title="Add Recipient to Split Dispatch Manifest"
        maxWidth="md"
      >
        <form onSubmit={handleAddRecipient} className="space-y-4 text-xs">
          {recError && (
            <div className="p-3 bg-[#F7D4CF] border border-[#E89E95] rounded-md text-xs text-[#8C2E24] flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{recError}</span>
            </div>
          )}

          <div>
            <label className="block text-[#5A4630] font-medium mb-1">Recipient Full Name</label>
            <input
              type="text"
              value={newRecName}
              onChange={(e) => setNewRecName(e.target.value)}
              required
              placeholder="e.g. Rohini Sharma"
              className="w-full px-3 py-2 bg-white border border-[#EADFC8] rounded-md text-[#5A4630]"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[#5A4630] font-medium mb-1">Recipient Mobile (for Courier OTP)</label>
              <input
                type="tel"
                value={newRecPhone}
                onChange={(e) => setNewRecPhone(e.target.value)}
                required
                placeholder="+91 98200 55667"
                className="w-full px-3 py-2 bg-white border border-[#EADFC8] rounded-md text-[#5A4630]"
              />
            </div>
            <div>
              <label className="block text-[#5A4630] font-medium mb-1">Postal Pincode</label>
              <input
                type="text"
                value={newRecPincode}
                onChange={(e) => setNewRecPincode(e.target.value)}
                maxLength={6}
                required
                placeholder="e.g. 400001"
                className="w-full px-3 py-2 bg-white border border-[#EADFC8] rounded-md text-[#5A4630] font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block text-[#5A4630] font-medium mb-1">Destination Address / Office Suite</label>
            <input
              type="text"
              value={newRecAddress}
              onChange={(e) => setNewRecAddress(e.target.value)}
              required
              placeholder="Building, Street, Landmark"
              className="w-full px-3 py-2 bg-white border border-[#EADFC8] rounded-md text-[#5A4630]"
            />
          </div>

          <div>
            <label className="block text-[#5A4630] font-medium mb-1">Dispatch Group</label>
            <select
              value={newRecGroup}
              onChange={(e) => setNewRecGroup(e.target.value)}
              className="w-full px-3 py-2 bg-white border border-[#EADFC8] rounded-md text-[#5A4630]"
            >
              <option value="Mumbai Nariman Point HQ">Mumbai Nariman Point HQ</option>
              <option value="New Delhi Connaught Hub">New Delhi Connaught Hub</option>
              <option value="Bengaluru MG Road Facility">Bengaluru MG Road Facility</option>
            </select>
          </div>

          <div>
            <label className="block text-[#5A4630] font-medium mb-1">Personal Inscription Message (Optional)</label>
            <input
              type="text"
              value={newRecMessage}
              onChange={(e) => setNewRecMessage(e.target.value)}
              placeholder="Message printed on certificate jacket"
              className="w-full px-3 py-2 bg-white border border-[#EADFC8] rounded-md text-[#5A4630]"
            />
          </div>

          <div className="pt-2 flex justify-end gap-2 border-t border-[#EADFC8]">
            <Button variant="outline" size="sm" type="button" onClick={() => setRecipientModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" type="submit">
              Add to Manifest
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
