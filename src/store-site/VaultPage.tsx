import React from 'react';
import { Link } from 'react-router-dom';
import { useSEO } from '../lib/useSEO';
import { Card } from '../components/Card';
import { Badge } from '../components/Badge';
import {
  Coins,
  ShieldCheck,
  RotateCcw,
  History,
  Lock,
  ChevronRight,
  ArrowRight,
  Layers,
} from 'lucide-react';

export const VaultPage: React.FC = () => {
  useSEO({
    title: 'Digital Gold Vault (Coming Soon)',
    description: 'Upcoming digital gold custody, SIP accumulation, instant sell-back, and physical redemption.',
    canonicalPath: '/vault',
  });

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      {/* Breadcrumb */}
      <nav aria-label="Breadcrumb" className="text-xs text-[#7A6A55] flex items-center gap-1.5 flex-wrap">
        <Link to="/" className="hover:text-[#C9A24B]">Home</Link>
        <ChevronRight className="w-3.5 h-3.5 text-[#EADFC8]" />
        <span className="text-[#5A4630] font-medium">Digital Gold Vault</span>
      </nav>

      {/* Header */}
      <div className="border-b border-[#EADFC8] pb-6 space-y-3">
        <div className="flex items-center gap-2">
          <Badge variant="gold" size="sm">Proposed Capability</Badge>
          <Badge variant="neutral" size="sm">Coming Soon • Non-Clickable</Badge>
        </div>
        <h1 className="font-serif text-3xl sm:text-4xl font-bold text-[#5A4630] flex items-center gap-3">
          <Lock className="w-8 h-8 text-[#C9A24B]" />
          Digital Gold Vault: Coming Soon
        </h1>
        <p className="text-xs sm:text-sm text-[#7A6A55] max-w-2xl leading-relaxed">
          Accumulate 24K 999.9 pure gold starting from ₹100. Backed 1:1 by physical allocated bullion bars stored in insured institutional vaults.
        </p>
      </div>

      {/* Regulatory & Institutional Assurance Box */}
      <div className="p-4 bg-[#F8EFD9] border border-[#C9A24B] rounded-xl text-xs text-[#5A4630] space-y-1.5">
        <div className="flex items-center gap-2 font-bold">
          <ShieldCheck className="w-4 h-4 text-[#C9A24B]" />
          <span>Institutional Custody & Governance Framework (Prerequisites in Progress)</span>
        </div>
        <p className="leading-relaxed text-[#7A6A55]">
          Digital Gold Vault functionality is parked pending final written legal opinion, designated third-party trustee appointment, and physical vault audit synchronization. The features below represent our upcoming Phase 2 roadmap.
        </p>
      </div>

      {/* 4 Non-Clickable Feature Previews (TAGGED) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Module 1: Wallet Balance */}
        <Card variant="surface" className="p-6 border-[#EADFC8] space-y-3 opacity-90 cursor-not-allowed">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-bold text-[#5A4630] uppercase">
              <Coins className="w-4 h-4 text-[#C9A24B]" />
              <span>Digital Gold Wallet</span>
            </div>
            <Badge variant="neutral" size="sm">Proposed</Badge>
          </div>
          <div className="pt-2">
            <span className="text-xs text-[#7A6A55]">Sample Vault Allocation</span>
            <div className="text-2xl font-serif font-bold text-[#5A4630] tabular-nums">
              14.8500 <span className="text-sm font-sans font-normal text-[#7A6A55]">grams (24K 999.9)</span>
            </div>
            <div className="text-xs text-[#7A6A55] mt-1">
              Estimated Value: <strong>₹1,93,050</strong> (Live Spot Basis)
            </div>
          </div>
          <p className="text-[11px] text-[#7A6A55] pt-2 border-t border-[#EADFC8]">
            Accumulate gold in fractions. Each milligram allocated to serial-numbered bullion bars.
          </p>
        </Card>

        {/* Module 2: Transaction History */}
        <Card variant="surface" className="p-6 border-[#EADFC8] space-y-3 opacity-90 cursor-not-allowed">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-bold text-[#5A4630] uppercase">
              <History className="w-4 h-4 text-[#C9A24B]" />
              <span>Transaction Ledger</span>
            </div>
            <Badge variant="neutral" size="sm">Proposed</Badge>
          </div>
          <div className="space-y-2 pt-2 text-xs">
            <div className="flex justify-between p-2 bg-[#FFFBF3] rounded border border-[#EADFC8]">
              <span>SIP Buy (+2.500g)</span>
              <span className="font-mono font-semibold text-[#5A4630]">10 Oct 2026</span>
            </div>
            <div className="flex justify-between p-2 bg-[#FFFBF3] rounded border border-[#EADFC8]">
              <span>Festival Bonus (+0.500g)</span>
              <span className="font-mono font-semibold text-[#5A4630]">02 Oct 2026</span>
            </div>
          </div>
          <p className="text-[11px] text-[#7A6A55] pt-2 border-t border-[#EADFC8]">
            Cryptographically signed passbook ledger recording every buy, gift, and redemption.
          </p>
        </Card>

        {/* Module 3: Physical Redemption */}
        <Card variant="surface" className="p-6 border-[#EADFC8] space-y-3 opacity-90 cursor-not-allowed">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-bold text-[#5A4630] uppercase">
              <Layers className="w-4 h-4 text-[#C9A24B]" />
              <span>Physical Coin Redemption</span>
            </div>
            <Badge variant="neutral" size="sm">Proposed</Badge>
          </div>
          <div className="space-y-1.5 pt-2 text-xs text-[#7A6A55]">
            <p>Convert accumulated digital grams into certified 24K minted coins (1g, 5g, 10g, 50g) or 22K hallmark jewellery.</p>
            <p>Delivered to your doorstep in tamper-evident certicards via armoured courier.</p>
          </div>
          <p className="text-[11px] text-[#7A6A55] pt-2 border-t border-[#EADFC8]">
            Pay only nominal minting and transit insurance at the time of redemption.
          </p>
        </Card>

        {/* Module 4: Instant Sell-Back */}
        <Card variant="surface" className="p-6 border-[#EADFC8] space-y-3 opacity-90 cursor-not-allowed">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-bold text-[#5A4630] uppercase">
              <RotateCcw className="w-4 h-4 text-[#C9A24B]" />
              <span>Instant Bank Sell-Back</span>
            </div>
            <Badge variant="neutral" size="sm">Proposed</Badge>
          </div>
          <div className="space-y-1.5 pt-2 text-xs text-[#7A6A55]">
            <p>Liquidate digital gold grams 24/7 at real-time market spot bid rates without physical assay deductions.</p>
            <p>Proceeds credited directly to your verified bank account via instant IMPS / UPI.</p>
          </div>
          <p className="text-[11px] text-[#7A6A55] pt-2 border-t border-[#EADFC8]">
            Zero physical wear-and-tear or purity depreciation on vault-held bullion.
          </p>
        </Card>
      </div>

      {/* Return to Physical Storefront CTA */}
      <div className="text-center pt-4">
        <Link
          to="/c/gold"
          className="inline-flex items-center gap-2 text-xs font-medium text-[#C9A24B] hover:underline"
        >
          <span>Browse physical 24K gold investment coins currently in stock</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
};
