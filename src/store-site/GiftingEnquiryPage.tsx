import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useSEO } from '../lib/useSEO';
import { Card } from '../components/Card';
import { Badge } from '../components/Badge';
import { Button } from '../components/Button';
import {
  Gift,
  ChevronRight,
  CheckCircle2,
} from 'lucide-react';

export const GiftingEnquiryPage: React.FC = () => {
  useSEO({
    title: 'Corporate & Bespoke Gifting Enquiry',
    description: 'Custom minted gold and silver coins, luxury festive presentation hampers, and institutional gifting.',
    canonicalPath: '/gifting-enquiry',
  });

  const [submitted, setSubmitted] = useState(false);

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      {/* Breadcrumb */}
      <nav aria-label="Breadcrumb" className="text-xs text-[#7A6A55] flex items-center gap-1.5 flex-wrap">
        <Link to="/" className="hover:text-[#C9A24B]">Home</Link>
        <ChevronRight className="w-3.5 h-3.5 text-[#EADFC8]" />
        <Link to="/c/gifting" className="hover:text-[#C9A24B]">Gifting</Link>
        <ChevronRight className="w-3.5 h-3.5 text-[#EADFC8]" />
        <span className="text-[#5A4630] font-medium">Corporate Enquiry</span>
      </nav>

      {/* Header */}
      <div className="border-b border-[#EADFC8] pb-6 space-y-2">
        <div className="flex items-center gap-2">
          <Badge variant="gold" size="sm">Institutional Gifting Desk</Badge>
          <Badge variant="neutral" size="sm">Proposed Service</Badge>
        </div>
        <h1 className="font-serif text-3xl sm:text-4xl font-bold text-[#5A4630] flex items-center gap-3">
          <Gift className="w-8 h-8 text-[#C9A24B]" />
          Corporate & Bespoke Gifting Enquiry
        </h1>
        <p className="text-xs sm:text-sm text-[#7A6A55] leading-relaxed max-w-2xl">
          Commission custom minted 24K gold or 999 silver coins embossed with corporate crests, personalized laser serials, and handcrafted satin-lined wooden presentation hampers.
        </p>
      </div>

      {submitted ? (
        <Card variant="surface" className="p-8 text-center max-w-md mx-auto space-y-4 border-[#A4C997] bg-[#FAFDF9]">
          <div className="w-14 h-14 rounded-full bg-[#DCE8D5] border border-[#A4C997] flex items-center justify-center mx-auto text-[#2D5A27]">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <h2 className="font-serif text-2xl font-bold text-[#2D5A27]">Enquiry Received</h2>
          <p className="text-xs text-[#7A6A55] leading-relaxed">
            Thank you. Our bespoke gifting relationship manager will connect within 1 business day with sample minting mockups and tiered institutional pricing.
          </p>
          <Button variant="secondary" size="sm" onClick={() => setSubmitted(false)}>
            Submit Another Request
          </Button>
        </Card>
      ) : (
        <Card variant="surface" className="p-6 sm:p-8 border-[#EADFC8] space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-[#EADFC8]">
            <span className="text-xs font-bold text-[#5A4630] uppercase tracking-wider">
              Bespoke Treasury Requisition Form
            </span>
            <Badge variant="neutral" size="sm">Proposed Workflow</Badge>
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              setSubmitted(true);
            }}
            className="space-y-4 text-xs"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[#5A4630] font-medium mb-1">Company / Organization Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Tata Consultancy Services, HDFC Bank"
                  className="w-full px-3 py-2 bg-[#FFFBF3] border border-[#EADFC8] rounded-md text-[#5A4630]"
                />
              </div>

              <div>
                <label className="block text-[#5A4630] font-medium mb-1">Contact Officer Name & Designation</label>
                <input
                  type="text"
                  required
                  placeholder="Full Name, Title"
                  className="w-full px-3 py-2 bg-[#FFFBF3] border border-[#EADFC8] rounded-md text-[#5A4630]"
                />
              </div>

              <div>
                <label className="block text-[#5A4630] font-medium mb-1">Corporate Email Address</label>
                <input
                  type="email"
                  required
                  placeholder="procurement@company.com"
                  className="w-full px-3 py-2 bg-[#FFFBF3] border border-[#EADFC8] rounded-md text-[#5A4630]"
                />
              </div>

              <div>
                <label className="block text-[#5A4630] font-medium mb-1">Direct Phone / WhatsApp</label>
                <input
                  type="tel"
                  required
                  placeholder="+91 98200 XXXXX"
                  className="w-full px-3 py-2 bg-[#FFFBF3] border border-[#EADFC8] rounded-md text-[#5A4630]"
                />
              </div>

              <div>
                <label className="block text-[#5A4630] font-medium mb-1">Estimated Unit Volume</label>
                <select className="w-full px-3 py-2 bg-[#FFFBF3] border border-[#EADFC8] rounded-md text-[#5A4630]">
                  <option>10 to 50 sets</option>
                  <option>50 to 250 sets</option>
                  <option>250 to 1,000 sets</option>
                  <option>1,000+ institutional sets</option>
                </select>
              </div>

              <div>
                <label className="block text-[#5A4630] font-medium mb-1">Budget Allocation per Unit</label>
                <select className="w-full px-3 py-2 bg-[#FFFBF3] border border-[#EADFC8] rounded-md text-[#5A4630]">
                  <option>₹5,000 to ₹15,000 (Silver Coins & Hampers)</option>
                  <option>₹15,000 to ₹50,000 (Gold Coins & Fine Sets)</option>
                  <option>₹50,000+ (Executive Bullion Ingot Chests)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-[#5A4630] font-medium mb-1">Custom Minting & Branding Requirements</label>
              <textarea
                rows={3}
                placeholder="Mention custom logo engraving, specific purity requirements, or target delivery dates..."
                className="w-full px-3 py-2 bg-[#FFFBF3] border border-[#EADFC8] rounded-md text-[#5A4630]"
              />
            </div>

            <Button type="submit" variant="primary" size="md">
              Submit Gifting Consultation Request
            </Button>
          </form>
        </Card>
      )}
    </div>
  );
};
