import React, { useState } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { useSEO } from '../lib/useSEO';
import { Card } from '../components/Card';
import { Badge } from '../components/Badge';
import { Button } from '../components/Button';
import {
  ShieldCheck,
  ChevronRight,
  Mail,
  Phone,
  MapPin,
  ChevronDown,
  ChevronUp,
  Truck,
  CheckCircle2,
  RotateCcw,
} from 'lucide-react';

export const PolicyPage: React.FC = () => {
  const location = useLocation();
  const path = location.pathname;

  // FAQ Accordion state
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  // Contact form state
  const [contactSubmitted, setContactSubmitted] = useState(false);

  const getPolicyContent = () => {
    switch (path) {
      case '/terms':
        return {
          title: 'Terms of Sale & Platform Service',
          category: 'Legal Governance',
          metaDesc: 'Standard legal terms governing purchase of investment bullion, fine jewellery, and certified gemstones.',
          content: (
            <div className="space-y-6 text-xs text-[#7A6A55] leading-relaxed">
              <section className="space-y-2">
                <h2 className="font-serif text-lg font-bold text-[#5A4630]">1. Introduction and Platform Authority</h2>
                <p>
                  These Terms of Service govern the access, browsing, and purchase of precious articles on AURUM & CO. By placing an order, requesting a rate lock quote, or accessing digital vaults, the customer enters into an agreement under the Indian Contract Act, 1872 and Information Technology Act, 2000.
                </p>
              </section>

              <section className="space-y-2">
                <h2 className="font-serif text-lg font-bold text-[#5A4630]">2. Real-Time Precious Metal Pricing</h2>
                <p>
                  Precious bullion (24K Gold, 22K Gold, 999 Fine Silver) prices are dynamically derived from spot commodity exchange feeds. All prices include transparent itemization of fine metal weight, making charges, transit insurance, and applicable GST (3%). Rates fluctuate continuously until a price lock quote is secured.
                </p>
              </section>

              <section className="space-y-2">
                <h2 className="font-serif text-lg font-bold text-[#5A4630]">3. 10-Minute Quote Lock Facility</h2>
                <p>
                  Clicking "Get Quote" creates an immutable cryptographic price snapshot valid for exactly 10 minutes (60 seconds in demo speed). During this window, physical inventory is temporarily reserved. If checkout is not completed before quote expiry, the reservation dissolves and live spot rates apply.
                </p>
              </section>

              <section className="space-y-2">
                <h2 className="font-serif text-lg font-bold text-[#5A4630]">4. Payment Conditions & Exclusion of Cash on Delivery</h2>
                <p>
                  Due to high-value transit security regulations and anti-money laundering (PMLA) directives, Cash on Delivery (COD) is strictly not applicable for bullion, gemstones, and precious jewellery orders. All transactions must be completed via authorized digital payment gateways or RTGS bank wires.
                </p>
              </section>
            </div>
          ),
        };

      case '/privacy':
        return {
          title: 'Privacy & Data Protection Policy',
          category: 'Statutory Compliance',
          metaDesc: 'Digital personal data protection policy detailing customer consent, encryption, and KYC security.',
          content: (
            <div className="space-y-6 text-xs text-[#7A6A55] leading-relaxed">
              <section className="space-y-2">
                <h2 className="font-serif text-lg font-bold text-[#5A4630]">1. Data Collection & Purpose Limitation</h2>
                <p>
                  AURUM & CO respects customer confidentiality under the Digital Personal Data Protection Act (DPDPA), 2023. We collect only requisite delivery addresses, phone numbers for OTP dispatch, and PAN records where legally mandated for high-value transactions exceeding statutory thresholds.
                </p>
              </section>

              <section className="space-y-2">
                <h2 className="font-serif text-lg font-bold text-[#5A4630]">2. No Storage of Payment Credentials</h2>
                <p>
                  We do not collect, view, or retain customer credit card numbers, CVVs, or NetBanking passwords. All payment transactions hand off directly to RBI-authorized payment aggregators with 256-bit TLS encryption and tokenized signature checks.
                </p>
              </section>

              <section className="space-y-2">
                <h2 className="font-serif text-lg font-bold text-[#5A4630]">3. Granular Communication Consents</h2>
                <p>
                  Customers retain complete control over communication preferences. Transactional notifications (OTP, dispatch, invoice) are strictly segregated from optional marketing briefings. Consents may be toggled at any time from your customer account dashboard.
                </p>
              </section>
            </div>
          ),
        };

      case '/shipping':
        return {
          title: 'Insured Armoured Shipping & Delivery Policy',
          category: 'Logistics & Custody',
          metaDesc: 'Comprehensive delivery policies for high-value precious bullion with 100% transit insurance cover.',
          content: (
            <div className="space-y-6 text-xs text-[#7A6A55] leading-relaxed">
              <section className="space-y-2">
                <h2 className="font-serif text-lg font-bold text-[#5A4630]">1. 100% Insured Transit Protection</h2>
                <p>
                  Every consignment dispatched by AURUM & CO is covered by comprehensive door-to-door transit insurance against theft, damage, or in-transit loss. Risk transfers to the recipient only upon successful physical handover and OTP delivery verification.
                </p>
              </section>

              <section className="space-y-2">
                <h2 className="font-serif text-lg font-bold text-[#5A4630]">2. Specialized Precious Logistics Partners</h2>
                <p>
                  Consignments are transported exclusively through specialized precious logistics carriers (Sequel Secure Logistics and BVC Armoured Vaulting) utilizing tamper-evident secure envelopes with barcoded serial seals.
                </p>
              </section>

              <section className="space-y-2">
                <h2 className="font-serif text-lg font-bold text-[#5A4630]">3. Pincode Serviceability & Delivery Timelines</h2>
                <p>
                  Metro and tier-1 destinations are delivered within 2–4 business days. Certain remote postal zones (such as test pincodes starting with digit 9) are designated outside the armoured perimeter and cannot be serviced.
                </p>
              </section>
            </div>
          ),
        };

      case '/returns':
        return {
          title: 'Cancellation, Return & Buyback Policy',
          category: 'Customer Protection',
          metaDesc: 'Transparent returns guidelines, bullion buyback policies, and COD non-applicability notes.',
          content: (
            <div className="space-y-6 text-xs text-[#7A6A55] leading-relaxed">
              {/* Highlight Client Notes */}
              <div className="p-4 bg-[#F8EFD9] border border-[#C9A24B] rounded-xl space-y-1.5 text-[#5A4630]">
                <div className="flex items-center gap-1.5 font-bold">
                  <ShieldCheck className="w-4 h-4 text-[#C9A24B]" />
                  <span>Key Policy Notice (Client Notes)</span>
                </div>
                <div className="text-xs space-y-1 font-medium">
                  <p>• <strong>COD is not applicable:</strong> Cash on Delivery is strictly excluded for precious metals and jewellery.</p>
                  <p>• <strong>Lifetime buyback: check policies:</strong> Bullion return and buyback terms are currently being finalised under statutory legal review.</p>
                </div>
              </div>

              <section className="space-y-2">
                <h2 className="font-serif text-lg font-bold text-[#5A4630]">1. 7-Day Inspection for Jewellery & Gemstones</h2>
                <p>
                  Certified gemstones, sacred Rudraksha malas, and fine gold chains carry an unconditional 7-day inspection and exchange period provided the article is returned in original unmounted condition with laboratory certificates and tamper tags intact.
                </p>
              </section>

              <section className="space-y-2">
                <h2 className="font-serif text-lg font-bold text-[#5A4630]">2. Bullion Coins & Cast Bars Policy</h2>
                <p>
                  Because bullion prices are linked directly to fluctuating international spot commodities, standard e-commerce cancellation does not apply to open market fluctuations once minted. Sealed assay cards must remain unopened for buyback inspection.
                </p>
              </section>

              <section className="space-y-2">
                <h2 className="font-serif text-lg font-bold text-[#5A4630]">3. Refund Processing & Method</h2>
                <p>
                  Approved refunds are credited directly to the original bank source account via NEFT/RTGS within 3–5 working days following laboratory assay verification.
                </p>
              </section>
            </div>
          ),
        };

      case '/authenticity':
        return {
          title: 'Authenticity, Hallmarking & Certification Assurance',
          category: 'Assay Standards',
          metaDesc: 'BIS Hallmarking, NABL assay laboratory accreditation, and international GIA/IGI gemstone grading credentials.',
          content: (
            <div className="space-y-6 text-xs text-[#7A6A55] leading-relaxed">
              <section className="space-y-2">
                <h2 className="font-serif text-lg font-bold text-[#5A4630]">1. Bureau of Indian Standards (BIS) Hallmarking</h2>
                <p>
                  Every article of gold sold by AURUM & CO is legally hallmarked in compliance with BIS mandatory hallmarking guidelines, featuring the BIS logo, Karat/Purity mark (24K / 999.9 or 22K / 916), and 6-digit alphanumeric HUID (Hallmark Unique Identification).
                </p>
              </section>

              <section className="space-y-2">
                <h2 className="font-serif text-lg font-bold text-[#5A4630]">2. Laboratory Gemstone Grading (GIA & IGI)</h2>
                <p>
                  All natural rubies, emeralds, and sapphires are authenticated by world-recognized gemological laboratories (Gemological Institute of America and International Gemological Institute). We strictly declare all treatments, cuts, and origins.
                </p>
              </section>

              <section className="space-y-2">
                <h2 className="font-serif text-lg font-bold text-[#5A4630]">3. Sacred Rudraksha Consecration Standards</h2>
                <p>
                  Our Rudraksha beads are independently verified by botanical research laboratories to confirm natural mukhi furrows, absence of artificial carving or glue lines, and genuine Himalayan provenance.
                </p>
              </section>
            </div>
          ),
        };

      case '/consumer-disclosures':
        return {
          title: 'Consumer Disclosures & Legal Metrology Declarations',
          category: 'Statutory Disclosures',
          metaDesc: 'Mandatory declarations under Legal Metrology Act, 2009 and Consumer Protection (E-Commerce) Rules, 2020.',
          content: (
            <div className="space-y-6 text-xs text-[#7A6A55] leading-relaxed">
              <section className="space-y-2">
                <h2 className="font-serif text-lg font-bold text-[#5A4630]">1. Mandatory Legal Metrology Declarations</h2>
                <p>
                  In accordance with the Legal Metrology (Packaged Commodities) Rules, 2011, every product page clearly discloses the net weight in grams (to 4 decimal places), gross weight, purity fraction, manufacturer identity, and country of origin.
                </p>
              </section>

              <section className="space-y-2">
                <h2 className="font-serif text-lg font-bold text-[#5A4630]">2. Entity & Registration Information</h2>
                <div className="p-4 bg-[#FFFBF3] border border-[#EADFC8] rounded-lg space-y-1 font-mono text-[11px] text-[#5A4630]">
                  <p>Legal Entity: AURUM & CO PRECIOUS MERCHANDISE PRIVATE LIMITED</p>
                  <p>Corporate Identity Number (CIN): U36911MH2026PTC881902</p>
                  <p>GSTIN: 27AAACA1234F1Z8 (Maharashtra State Registration)</p>
                  <p>BIS License Number: HM/L-7890123</p>
                </div>
              </section>
            </div>
          ),
        };

      case '/grievance':
        return {
          title: 'Grievance Redressal Mechanism & Nodal Contacts',
          category: 'Consumer Protection',
          metaDesc: 'Designated Nodal Officer and escalation matrix under Consumer Protection E-Commerce Rules.',
          content: (
            <div className="space-y-6 text-xs text-[#7A6A55] leading-relaxed">
              <section className="space-y-2">
                <h2 className="font-serif text-lg font-bold text-[#5A4630]">Designated Grievance Redressal Officer</h2>
                <p>
                  In compliance with Rule 5(6) of the Consumer Protection (E-Commerce) Rules, 2020, AURUM & CO has appointed a designated Grievance Officer:
                </p>

                <div className="p-5 bg-[#F8EFD9] border border-[#EADFC8] rounded-xl space-y-2 text-xs text-[#5A4630]">
                  <p><strong>Name:</strong> Shri Raghavendra Kulkarni</p>
                  <p><strong>Designation:</strong> Chief Grievance & Compliance Officer</p>
                  <p><strong>Direct Email:</strong> grievance.officer@aurum.internal</p>
                  <p><strong>Contact Desk:</strong> +91 (022) 6789 4400 (Mon–Fri, 10:00 AM – 6:00 PM IST)</p>
                  <p><strong>Office Address:</strong> Level 14, Tower B, Peninsula Business Park, Lower Parel, Mumbai 400013</p>
                </div>
              </section>

              <section className="space-y-2">
                <h2 className="font-serif text-lg font-bold text-[#5A4630]">Escalation & Resolution Timelines</h2>
                <p>
                  1. Acknowledgement of consumer grievance within 48 hours of receipt.<br />
                  2. Formal investigation and resolution within 30 days of ticket generation.
                </p>
              </section>
            </div>
          ),
        };

      case '/faq':
        return {
          title: 'Frequently Asked Questions (FAQ)',
          category: 'Customer Knowledge',
          metaDesc: 'Answers to common questions regarding live bullion rates, quote locks, assay certificates, and deliveries.',
          content: (
            <div className="space-y-3">
              {[
                {
                  q: 'How does the 10-Minute Rate Lock quote work?',
                  a: 'When you click "Get Quote", our rate engine captures the current spot bullion price and locks it for exactly 10 minutes (60 seconds in demo speed). Your selected item is reserved from stock. Even if market rates rise, your checkout price remains locked.',
                },
                {
                  q: 'Why is Cash on Delivery (COD) not offered?',
                  a: 'Due to safety regulations, high transit valuations, and statutory AML guidelines for precious metals, all orders require secure digital pre-payment or verified bank transfers.',
                },
                {
                  q: 'How do I verify the authenticity of my gold or gemstone?',
                  a: 'Every bullion coin and bar arrives inside a tamper-evident certicard carrying a laser-etched certificate number. You can verify this number on our /verify/:certNo page or scan the QR code to view the official assay report.',
                },
                {
                  q: 'What happens if the market rate feed is delayed or stale?',
                  a: 'If external commodity providers disconnect for longer than 20 seconds, quote generation is automatically paused to safeguard customer and platform integrity.',
                },
                {
                  q: 'Are consignments fully insured during shipping?',
                  a: 'Yes. 100% of transit risk is underwritten by our insurers. Consignments travel exclusively via armoured carriers (Sequel and BVC) and are released only upon recipient OTP signature.',
                },
              ].map((item, idx) => (
                <div key={idx} className="border border-[#EADFC8] rounded-xl overflow-hidden bg-white">
                  <button
                    onClick={() => setOpenFaqIndex(openFaqIndex === idx ? null : idx)}
                    className="w-full p-4 flex items-center justify-between text-left hover:bg-[#FFFBF3] transition-colors"
                  >
                    <span className="font-serif text-sm font-bold text-[#5A4630]">{item.q}</span>
                    {openFaqIndex === idx ? (
                      <ChevronUp className="w-4 h-4 text-[#C9A24B] shrink-0" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-[#7A6A55] shrink-0" />
                    )}
                  </button>
                  {openFaqIndex === idx && (
                    <div className="px-4 pb-4 pt-1 text-xs text-[#7A6A55] leading-relaxed border-t border-[#EADFC8] bg-[#FFFBF3]/40">
                      {item.a}
                    </div>
                  )}
                </div>
              ))}
            </div>
          ),
        };

      case '/contact':
        return {
          title: 'Contact Customer Concierge',
          category: 'Customer Care',
          metaDesc: 'Reach our precious jewellery and bullion concierge desk via phone, email or private appointment.',
          content: (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-xs text-[#7A6A55]">
              <div className="space-y-5">
                <p className="leading-relaxed">
                  Our private client concierge team is at your disposal for bullion portfolio advice, bespoke jewellery consultations, and certificate verification assistance.
                </p>

                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <Phone className="w-5 h-5 text-[#C9A24B] shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-[#5A4630] block">Toll-Free Concierge Desk</strong>
                      <span>+91 1800 209 8800 (Mon–Sat, 9:00 AM – 8:00 PM IST)</span>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Mail className="w-5 h-5 text-[#C9A24B] shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-[#5A4630] block">Client Relations Email</strong>
                      <span>concierge@aurum.internal</span>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <MapPin className="w-5 h-5 text-[#C9A24B] shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-[#5A4630] block">Corporate Vault & Head Office</strong>
                      <span>Level 14, Peninsula Business Park, Lower Parel, Mumbai 400013</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick Inquiry Form */}
              <div className="p-6 bg-white border border-[#EADFC8] rounded-xl space-y-4">
                <h3 className="font-serif text-base font-bold text-[#5A4630]">
                  Send a Direct Message
                </h3>

                {contactSubmitted ? (
                  <div className="p-4 bg-[#DCE8D5] border border-[#A4C997] rounded-lg text-xs text-[#2D5A27] flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 shrink-0" />
                    <span>Your message has been received. Our concierge will respond within 4 hours.</span>
                  </div>
                ) : (
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      setContactSubmitted(true);
                    }}
                    className="space-y-3"
                  >
                    <div>
                      <label className="block text-[#5A4630] font-medium mb-1">Your Name</label>
                      <input
                        type="text"
                        required
                        placeholder="Full Name"
                        className="w-full px-3 py-2 bg-[#FFFBF3] border border-[#EADFC8] rounded-md text-[#5A4630]"
                      />
                    </div>
                    <div>
                      <label className="block text-[#5A4630] font-medium mb-1">Email Address</label>
                      <input
                        type="email"
                        required
                        placeholder="name@domain.com"
                        className="w-full px-3 py-2 bg-[#FFFBF3] border border-[#EADFC8] rounded-md text-[#5A4630]"
                      />
                    </div>
                    <div>
                      <label className="block text-[#5A4630] font-medium mb-1">Subject / Inquiry</label>
                      <textarea
                        required
                        rows={3}
                        placeholder="How can we assist you today?"
                        className="w-full px-3 py-2 bg-[#FFFBF3] border border-[#EADFC8] rounded-md text-[#5A4630]"
                      />
                    </div>
                    <Button type="submit" variant="primary" size="sm" className="w-full">
                      Submit Inquiry
                    </Button>
                  </form>
                )}
              </div>
            </div>
          ),
        };

      case '/support':
      default:
        return {
          title: 'Customer Service & Support Center',
          category: 'Customer Care',
          metaDesc: 'Help center for order status, shipment tracking, certificate verification, and returns.',
          content: (
            <div className="space-y-6 text-xs text-[#7A6A55] leading-relaxed">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-5 bg-white border border-[#EADFC8] rounded-xl space-y-2 text-center">
                  <Truck className="w-7 h-7 text-[#C9A24B] mx-auto" />
                  <h3 className="font-serif font-bold text-sm text-[#5A4630]">Delivery & Tracking</h3>
                  <p className="text-[11px] text-[#7A6A55]">Track your armoured transit AWB and OTP delivery status.</p>
                  <Link to="/account" className="text-[#C9A24B] hover:underline block pt-1 font-semibold">View Order Status →</Link>
                </div>

                <div className="p-5 bg-white border border-[#EADFC8] rounded-xl space-y-2 text-center">
                  <ShieldCheck className="w-7 h-7 text-[#C9A24B] mx-auto" />
                  <h3 className="font-serif font-bold text-sm text-[#5A4630]">Assay Verification</h3>
                  <p className="text-[11px] text-[#7A6A55]">Validate BIS hallmark and gem lab certificates online.</p>
                  <Link to="/verify/B24-999-5481" className="text-[#C9A24B] hover:underline block pt-1 font-semibold">Verify Assay Cert →</Link>
                </div>

                <div className="p-5 bg-white border border-[#EADFC8] rounded-xl space-y-2 text-center">
                  <RotateCcw className="w-7 h-7 text-[#C9A24B] mx-auto" />
                  <h3 className="font-serif font-bold text-sm text-[#5A4630]">Returns & Exchanges</h3>
                  <p className="text-[11px] text-[#7A6A55]">Submit return requests or request buyback evaluation.</p>
                  <Link to="/account" className="text-[#C9A24B] hover:underline block pt-1 font-semibold">Return Request Form →</Link>
                </div>
              </div>
            </div>
          ),
        };
    }
  };

  const policy = getPolicyContent();

  useSEO({
    title: policy.title,
    description: policy.metaDesc,
    canonicalPath: path,
  });

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      {/* Breadcrumb */}
      <nav aria-label="Breadcrumb" className="text-xs text-[#7A6A55] flex items-center gap-1.5 flex-wrap">
        <Link to="/" className="hover:text-[#C9A24B]">Home</Link>
        <ChevronRight className="w-3.5 h-3.5 text-[#EADFC8]" />
        <span>Policies & Information</span>
        <ChevronRight className="w-3.5 h-3.5 text-[#EADFC8]" />
        <span className="text-[#5A4630] font-medium">{policy.title}</span>
      </nav>

      {/* Header */}
      <div className="border-b border-[#EADFC8] pb-6 space-y-2">
        <div className="flex items-center gap-2">
          <Badge variant="gold" size="sm">{policy.category}</Badge>
          <Badge variant="neutral" size="sm">Active Regulatory Policy</Badge>
        </div>
        <h1 className="font-serif text-3xl sm:text-4xl font-bold text-[#5A4630]">
          {policy.title}
        </h1>
        <p className="text-xs text-[#7A6A55]">
          Last reviewed: October 2026 • Valid for all transactions on AURUM & CO.
        </p>
      </div>

      {/* Policy Card Body */}
      <Card variant="surface" className="p-6 sm:p-8 border-[#EADFC8] shadow-[0_4px_24px_rgba(90,70,48,0.06)]">
        {policy.content}
      </Card>
    </div>
  );
};
