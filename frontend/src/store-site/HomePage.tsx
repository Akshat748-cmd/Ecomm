import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useAppStore } from '../store';
import { useSEO } from '../lib/useSEO';
import { formatINR, formatDateTime } from '../lib/pricing';
import { ProductCard } from '../components/ProductCard';
import { Button } from '../components/Button';
import { Badge } from '../components/Badge';
import {
  ShieldCheck,
  TrendingUp,
  Coins,
  ArrowRight,
  Sparkles,
  Truck,
  ChevronRight,
  Gift,
  Building2,
  Copy,
  Check,
  Star,
  Quote as QuoteIcon,
  HelpCircle,
  FileCheck,
} from 'lucide-react';

interface HeroBannerData {
  id: string;
  headline: string;
  supportingCopy: string;
  image: string;
  primaryCtaLabel: string;
  primaryCtaDestination: string;
  secondaryCtaLabel: string;
  secondaryCtaDestination: string;
  startDate: string;
  endDate: string;
  isActive: boolean;
}

const HERO_BANNER_CONFIG: HeroBannerData = {
  id: 'hero-banner-2026',
  headline: 'Timeless Purity in Precious Metals & Sacred Artefacts',
  supportingCopy:
    'India’s premium destination for physical gold & silver bullion, natural certified gemstones, and authentic consecrated Rudraksha. Guaranteed transparent live rates and 10-minute price quote protection.',
  image: '/hero-bg.jpg',
  primaryCtaLabel: 'Explore 24K Bullion & Jewellery',
  primaryCtaDestination: '/c/gold',
  secondaryCtaLabel: 'Request Corporate Quote',
  secondaryCtaDestination: '/corporate-gifting',
  startDate: '2026-01-01',
  endDate: '2026-12-31',
  isActive: true,
};

interface FestivalCollection {
  id: string;
  name: string;
  occasion: string;
  banner: string;
  startDate: string;
  endDate: string;
  description: string;
  mappedSkuList: string[];
  displayOrder: number;
}

const FESTIVAL_COLLECTIONS: FestivalCollection[] = [
  {
    id: 'col-akshaya',
    name: 'Akshaya Tritiya Sovereign Bullion Collection',
    occasion: 'Akshaya Tritiya & Shubh Muhurat',
    banner: '/banners/banner-gold.jpg',
    startDate: '2026-01-01',
    endDate: '2026-12-31',
    description: 'High-relief 24K pure minted coins and 50g cast investment bars for eternal prosperity.',
    mappedSkuList: ['AU-BULL-COIN-10G', 'AU-BULL-BAR-50G', 'AG-BULL-BAR-250G'],
    displayOrder: 1,
  },
  {
    id: 'col-diwali',
    name: 'Sacred Deepavali Lakshmi Ganesh Treasury',
    occasion: 'Diwali & Dhanteras Treasury',
    banner: '/banners/banner-silver.jpg',
    startDate: '2026-01-01',
    endDate: '2026-12-31',
    description: 'Consciously refined 999 Fine Silver Lakshmi Ganesh coins and consecrated heirloom puja idols.',
    mappedSkuList: ['AG-COIN-LAKSHMI-50G', 'AG-IDOL-GANESH-100G', 'GIFT-PUJA-SET-SILVER'],
    displayOrder: 2,
  },
  {
    id: 'col-navaratri',
    name: 'Navaratri Royal Gemstone & Rudraksha Adornment',
    occasion: 'Sacred Vedic Celebrations',
    banner: '/banners/banner-gemstones.jpg',
    startDate: '2026-01-01',
    endDate: '2026-12-31',
    description: 'Natural unheated Burmese rubies and certified Himalayan 7 Mukhi beads energized in silver.',
    mappedSkuList: ['GEM-RUBY-BUR-315', 'GEM-EMER-COL-240', 'RUD-7MUKHI-NEPAL'],
    displayOrder: 3,
  },
];

export const HomePage: React.FC = () => {
  useSEO({
    title: 'Precious Gold, Silver, Natural Gemstones & Rudraksha',
    description:
      'Buy certified 24K gold coins and bars, 999 pure silver bullion, natural untreated Burmese rubies, Colombian emeralds, and authentic Nepali Rudraksha with live rates.',
    canonicalPath: '/',
  });

  const { rates, isFeedStale, products, offers, testimonials } = useAppStore();

  const [copiedCoupon, setCopiedCoupon] = useState<string | null>(null);

  // Validate hero banner schedule
  const isHeroActive = useMemo(() => {
    if (!HERO_BANNER_CONFIG.isActive) return false;
    const now = new Date().toISOString();
    return now >= HERO_BANNER_CONFIG.startDate && now <= HERO_BANNER_CONFIG.endDate;
  }, []);

  // Filter active collections (hide expired)
  const activeFestivalCollections = useMemo(() => {
    const now = new Date().toISOString();
    return FESTIVAL_COLLECTIONS.filter(
      (c) => now >= c.startDate && now <= c.endDate
    ).sort((a, b) => a.displayOrder - b.displayOrder);
  }, []);

  // Filter active offers (hide expired/paused)
  const activeOffers = useMemo(() => {
    const now = new Date().toISOString().slice(0, 10);
    return (offers || []).filter(
      (off) =>
        off.approvalStatus === 'Active' &&
        now >= off.startDate &&
        now <= off.endDate
    );
  }, [offers]);

  // Filter approved testimonials only (strictly enforce rule: only approved show)
  const approvedTestimonials = useMemo(() => {
    return (testimonials || []).filter(
      (t) => t.approvalStatus === 'Approved' && t.permissionGranted
    );
  }, [testimonials]);

  // Featured 4 in-stock items across categories
  const featuredProducts = useMemo(() => {
    return products
      .filter((p) => p.stock - p.reserved > 0 || p.backorderEligible)
      .slice(0, 4);
  }, [products]);

  // Category tiles specified in Phase 2
  const categoryTiles = [
    {
      id: 'cat-gold',
      name: 'Gold Coins & Bars',
      subtitle: '24K (999.9) Minted Bullion & 22K Jewellery',
      image: '/banners/banner-gold.jpg',
      badge: 'BIS 999.9 & 916',
      tag: 'Certified Bullion Coins & Cast Bars',
      path: '/c/gold',
      gradient: 'from-[#FFFDF7] to-[#FAF1DB]',
      border: 'border-[#E8D4A2]',
      displayOrder: 1,
    },
    {
      id: 'cat-silver',
      name: 'Silver Coins & Bars',
      subtitle: '999 Fine Bullion, Lakshmi Coins & Sacred Idols',
      image: '/banners/banner-silver.jpg',
      badge: '999 Fine Silver',
      tag: 'Commemorative Coins & 250g Bars',
      path: '/c/silver',
      gradient: 'from-[#FFFFFF] to-[#EAECEF]',
      border: 'border-[#D5DCE2]',
      displayOrder: 2,
    },
    {
      id: 'cat-gemstones',
      name: 'Gems and Coloured Stones',
      subtitle: 'Untreated Burmese Rubies, Emeralds & Sapphires',
      image: '/banners/banner-gemstones.jpg',
      badge: 'GIA & IGI Certified',
      tag: 'Natural Precious Gemstones & Pearls',
      path: '/c/gemstones',
      gradient: 'from-[#FCFDFB] to-[#DCE8D5]',
      border: 'border-[#BFD6B5]',
      displayOrder: 3,
    },
    {
      id: 'cat-rudraksha',
      name: 'Rudraksh',
      subtitle: 'Consecrated Nepali 1-14 Mukhi Beads & Malas',
      image: '/banners/banner-rudraksha.jpg',
      badge: 'Vedic Consecration',
      tag: 'Authentic Himalayan Rosaries',
      path: '/c/rudraksha',
      gradient: 'from-[#FEFAF8] to-[#F3D9D2]',
      border: 'border-[#E0B9AE]',
      displayOrder: 4,
    },
    {
      id: 'cat-gifting',
      name: 'Gifts',
      subtitle: 'Curated Festive Hampers & Imperial Coin Chests',
      image: '/banners/banner-gifting.jpg',
      badge: 'Imperial Presentation',
      tag: 'Luxury Velvet & Wooden Gift Keepsakes',
      path: '/c/gifting',
      gradient: 'from-[#FCFAF5] to-[#EEDCC0]',
      border: 'border-[#DDC5A1]',
      displayOrder: 5,
    },
    {
      id: 'cat-corporate',
      name: 'Corporate Gifting',
      subtitle: 'Custom Minting with Corporate Emblem from 25 pcs',
      image: '/hero-bg.jpg',
      badge: 'B2B Institutional',
      tag: 'Volume Tiers, Branding Proof & Split Delivery',
      path: '/corporate-gifting',
      gradient: 'from-[#FDFBF7] to-[#F2E8D3]',
      border: 'border-[#C9A24B]',
      displayOrder: 6,
    },
  ];

  const handleCopyCoupon = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCoupon(code);
    setTimeout(() => setCopiedCoupon(null), 2500);
  };

  return (
    <div className="space-y-16">
      {/* 1. HERO BANNER (G) */}
      {isHeroActive && (
        <section className="relative rounded-2xl border border-[#E8DDC6] bg-[#F7F1E5] p-6 sm:p-12 lg:p-16 overflow-hidden shadow-[0_8px_32px_rgba(90,70,48,0.06)] min-h-[440px] sm:min-h-[480px] lg:min-h-[520px] flex items-center">
          {/* Artwork Image cleanly occupying the Right Side */}
          <div className="absolute top-0 right-0 bottom-0 w-full sm:w-[70%] md:w-[60%] lg:w-[56%] pointer-events-none select-none overflow-hidden opacity-35 sm:opacity-100">
            <img
              src={HERO_BANNER_CONFIG.image}
              alt="Lotus 24K Gold Coin, Emerald and Sacred Rudraksha"
              className="w-full h-full object-cover object-[74%_center]"
              style={{
                maskImage: 'linear-gradient(to right, transparent 0%, black 30%, black 100%)',
                WebkitMaskImage: 'linear-gradient(to right, transparent 0%, black 30%, black 100%)',
              }}
            />
          </div>

          {/* Left Side Content */}
          <div className="relative z-10 max-w-xl lg:max-w-2xl space-y-5 sm:space-y-7">
            <div className="inline-flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 rounded-full bg-white/90 backdrop-blur-md border border-[#E6D9C3] text-[11px] sm:text-xs font-semibold text-[#4A3B2C] shadow-xs">
              <ShieldCheck className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#BA8332] shrink-0" />
              <span className="truncate">BIS Hallmarked • LBMA Benchmark • 100% Insured</span>
            </div>

            <h1 className="font-serif text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-[#3E2F20] leading-[1.18] tracking-tight">
              {HERO_BANNER_CONFIG.headline}
            </h1>

            <p className="text-xs sm:text-base text-[#665543] leading-relaxed max-w-xl font-normal">
              {HERO_BANNER_CONFIG.supportingCopy}
            </p>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4 pt-1 w-full sm:w-auto">
              <Link to={HERO_BANNER_CONFIG.primaryCtaDestination} className="w-full sm:w-auto">
                <button
                  type="button"
                  className="w-full sm:w-auto px-6 sm:px-7 py-3 sm:py-3.5 rounded-lg bg-[#BA8332] hover:bg-[#A37025] text-white font-medium text-sm sm:text-base shadow-sm hover:shadow-md transition-all inline-flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>{HERO_BANNER_CONFIG.primaryCtaLabel}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </Link>
              <Link to={HERO_BANNER_CONFIG.secondaryCtaDestination} className="w-full sm:w-auto">
                <button
                  type="button"
                  className="w-full sm:w-auto px-6 sm:px-7 py-3 sm:py-3.5 rounded-lg bg-white/95 hover:bg-white text-[#3E2F20] border border-[#D5C2A5] font-medium text-sm sm:text-base shadow-xs hover:shadow-sm transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  <Building2 className="w-4 h-4 text-[#BA8332]" />
                  <span>{HERO_BANNER_CONFIG.secondaryCtaLabel}</span>
                </button>
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* 2. PROMOTIONAL OFFERS CAROUSEL / STRIP (A) */}
      {activeOffers.length > 0 && (
        <section aria-label="Active Promotional Offers" className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#C9A24B]" />
              <h2 className="font-serif text-lg sm:text-xl font-bold text-[#5A4630]">
                Exclusive Privileges & Bullion Offers
              </h2>
            </div>
            <span className="text-[11px] text-[#7A6A55]">
              Thin-margin guardrail protected
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {activeOffers.map((off) => (
              <div
                key={off.id}
                className="p-4 bg-gradient-to-br from-[#FFFDF9] via-[#FAF5EB] to-[#F5EAD4] border border-[#EADFC8] rounded-xl flex flex-col justify-between space-y-3 shadow-xs hover:shadow-md transition-all"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <span className="font-mono font-bold text-[#8C6418] text-sm tracking-wider">
                      {off.code}
                    </span>
                    <Badge variant="gold" size="sm">
                      {off.type === 'percent' ? `${off.discountValue}% OFF` : `₹${off.discountValue} OFF`}
                    </Badge>
                  </div>
                  <h3 className="font-serif font-bold text-[#5A4630] text-sm">
                    {off.name}
                  </h3>
                  <p className="text-[11px] text-[#7A6A55] mt-1 leading-relaxed">
                    Min order value: <strong>{formatINR(off.minOrderValue)}</strong> • Valid till {off.endDate}.
                  </p>
                </div>

                <div className="pt-2 border-t border-[#EADFC8]/60 flex items-center justify-between gap-2">
                  <span className="text-[10px] text-[#7A6A55] truncate">
                    Max bullion discount floor: {((off.marginGuardrailPercent || 0.005) * 100).toFixed(1)}%
                  </span>
                  <button
                    type="button"
                    onClick={() => handleCopyCoupon(off.code)}
                    className="px-2.5 py-1 rounded bg-white border border-[#EADFC8] hover:border-[#C9A24B] text-[11px] font-semibold text-[#5A4630] flex items-center gap-1 transition-all shrink-0 cursor-pointer"
                  >
                    {copiedCoupon === off.code ? (
                      <>
                        <Check className="w-3 h-3 text-[#2D5A27]" />
                        <span className="text-[#2D5A27]">Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3 text-[#C9A24B]" />
                        <span>Copy Code</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 3. LIVE SPOT RATE CARDS (24K, 22K, Silver 999) (G) */}
      <section aria-label="Live Bullion Spot Rates">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="font-serif text-2xl font-bold text-[#5A4630] flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-[#C9A24B]" />
              Live Precious Metal Spot Benchmarks
            </h2>
            <p className="text-xs text-[#7A6A55]">
              Real-time prices dynamically linked to international assay benchmarks (MCX Mumbai Delivery).
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant={isFeedStale ? 'amber' : 'sage'} size="sm">
              <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${isFeedStale ? 'bg-[#E8C26E]' : 'bg-[#2D5A27] animate-pulse'}`}></span>
              {isFeedStale ? 'Rate Delayed (>20s)' : 'Live Feed Active'}
            </Badge>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1: Gold 24K */}
          <div className="relative bg-gradient-to-br from-[#FFFDF8] via-[#FAF3E2] to-[#F5E6BD] border-2 border-[#D4AF37]/60 hover:border-[#D4AF37] rounded-2xl p-6 sm:p-7 shadow-[0_8px_30px_rgba(212,175,55,0.16)] hover:shadow-[0_16px_40px_rgba(212,175,55,0.26)] transition-all duration-300 hover:-translate-y-1.5 group overflow-hidden">
            <div className="absolute -right-4 -bottom-4 w-28 h-28 opacity-10 pointer-events-none group-hover:scale-110 transition-transform duration-500">
              <Coins className="w-full h-full text-[#D4AF37]" />
            </div>

            <div className="flex items-center justify-between gap-2 mb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-white/90 border border-[#D4AF37]/50 flex items-center justify-center text-[#8C6418] shadow-xs">
                  <Coins className="w-5 h-5 text-[#BA8332]" />
                </div>
                <div>
                  <span className="text-[11px] font-bold tracking-wider uppercase text-[#8C6418] block font-sans">
                    Gold 24K
                  </span>
                  <span className="text-[10px] text-[#7A6A55] font-medium">999.9 Fine Investment Bullion</span>
                </div>
              </div>
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-white/90 border border-[#D4AF37]/60 text-[#8C6418] text-[10px] font-bold uppercase tracking-wider shadow-xs">
                <Sparkles className="w-3 h-3 text-[#B07E17]" />
                Investment Grade
              </span>
            </div>

            <div className="my-4">
              <div className="text-3xl sm:text-4xl lg:text-[40px] font-serif font-extrabold text-[#744F0D] tabular-nums tracking-tight flex items-baseline gap-1">
                <span>{formatINR(rates.gold24k)}</span>
                <span className="text-sm font-sans font-normal text-[#8C6418]/80"> / gram</span>
              </div>
            </div>

            <div className="flex items-center gap-2 text-[11px] mb-4">
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-white/80 border border-[#2D5A27]/30 text-[#2D5A27] font-semibold text-[10px] shadow-2xs">
                <span className="w-1.5 h-1.5 rounded-full bg-[#2D5A27] animate-pulse"></span>
                MCX Benchmark
              </span>
              <span className="text-[11px] text-[#7A6A55] font-medium">Basis: 1g fine net weight</span>
            </div>

            <div className="pt-3 border-t border-[#D4AF37]/25 flex items-center justify-between text-xs">
              <span className="text-[11px] text-[#7A6A55]/80 font-mono">Updated: {formatDateTime(rates.lastUpdated).slice(11)}</span>
              <Link to="/c/gold" className="font-semibold text-[#8C6418] hover:text-[#5A3F08] flex items-center gap-1 transition-colors">
                <span>View 24K Bullion</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
              </Link>
            </div>
          </div>

          {/* Card 2: Gold 22K */}
          <div className="relative bg-gradient-to-br from-[#FFFDF9] via-[#FAF4EA] to-[#F5E5D1] border-2 border-[#C9A24B]/40 hover:border-[#BA8332] rounded-2xl p-6 sm:p-7 shadow-[0_8px_30px_rgba(201,162,75,0.12)] hover:shadow-[0_16px_40px_rgba(201,162,75,0.22)] transition-all duration-300 hover:-translate-y-1.5 group overflow-hidden">
            <div className="absolute -right-4 -bottom-4 w-28 h-28 opacity-10 pointer-events-none group-hover:scale-110 transition-transform duration-500">
              <Sparkles className="w-full h-full text-[#C9A24B]" />
            </div>

            <div className="flex items-center justify-between gap-2 mb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-white/90 border border-[#C9A24B]/40 flex items-center justify-center text-[#735025] shadow-xs">
                  <Sparkles className="w-5 h-5 text-[#BA8332]" />
                </div>
                <div>
                  <span className="text-[11px] font-bold tracking-wider uppercase text-[#735025] block font-sans">
                    Gold 22K
                  </span>
                  <span className="text-[10px] text-[#7A6A55] font-medium">916 Hallmark Fine Jewellery</span>
                </div>
              </div>
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-white/90 border border-[#C9A24B]/40 text-[#735025] text-[10px] font-bold uppercase tracking-wider shadow-xs">
                Jewellery Grade
              </span>
            </div>

            <div className="my-4">
              <div className="text-3xl sm:text-4xl lg:text-[40px] font-serif font-extrabold text-[#5A3F1E] tabular-nums tracking-tight flex items-baseline gap-1">
                <span>{formatINR(rates.gold22k)}</span>
                <span className="text-sm font-sans font-normal text-[#7A5B35]/80"> / gram</span>
              </div>
            </div>

            <div className="flex items-center gap-2 text-[11px] mb-4">
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-white/80 border border-[#C9A24B]/30 text-[#735025] font-semibold text-[10px] shadow-2xs">
                BIS 916 Standard
              </span>
              <span className="text-[11px] text-[#7A6A55] font-medium">Basis: 24K × 0.9167</span>
            </div>

            <div className="pt-3 border-t border-[#C9A24B]/25 flex items-center justify-between text-xs">
              <span className="text-[11px] text-[#7A6A55]/80 font-mono">Updated: {formatDateTime(rates.lastUpdated).slice(11)}</span>
              <Link to="/c/gold" className="font-semibold text-[#735025] hover:text-[#4A3215] flex items-center gap-1 transition-colors">
                <span>View Jewellery</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
              </Link>
            </div>
          </div>

          {/* Card 3: Silver 999 */}
          <div className="relative bg-gradient-to-br from-[#FFFFFF] via-[#F4F6F9] to-[#E3E8EF] border-2 border-[#B8C5D4]/70 hover:border-[#7A8E9F] rounded-2xl p-6 sm:p-7 shadow-[0_8px_30px_rgba(150,165,185,0.16)] hover:shadow-[0_16px_40px_rgba(150,165,185,0.26)] transition-all duration-300 hover:-translate-y-1.5 group overflow-hidden">
            <div className="absolute -right-4 -bottom-4 w-28 h-28 opacity-10 pointer-events-none group-hover:scale-110 transition-transform duration-500">
              <ShieldCheck className="w-full h-full text-[#7A8E9F]" />
            </div>

            <div className="flex items-center justify-between gap-2 mb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-white/90 border border-[#B8C5D4] flex items-center justify-center text-[#4A5568] shadow-xs">
                  <ShieldCheck className="w-5 h-5 text-[#5A6878]" />
                </div>
                <div>
                  <span className="text-[11px] font-bold tracking-wider uppercase text-[#3E4A5B] block font-sans">
                    Silver 999
                  </span>
                  <span className="text-[10px] text-[#7A6A55] font-medium">999 Fine Pure Bullion</span>
                </div>
              </div>
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-white/90 border border-[#B8C5D4] text-[#3E4A5B] text-[10px] font-bold uppercase tracking-wider shadow-xs">
                Auspicious Bullion
              </span>
            </div>

            <div className="my-4">
              <div className="text-3xl sm:text-4xl lg:text-[40px] font-serif font-extrabold text-[#2D3748] tabular-nums tracking-tight flex items-baseline gap-1">
                <span>{formatINR(rates.silver999)}</span>
                <span className="text-sm font-sans font-normal text-[#5A6878]/80"> / gram</span>
              </div>
            </div>

            <div className="flex items-center gap-2 text-[11px] mb-4">
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-white/80 border border-[#B8C5D4] text-[#3E4A5B] font-semibold text-[10px] shadow-2xs">
                LBMA London Spot
              </span>
              <span className="text-[11px] text-[#7A6A55] font-medium">Basis: 1g pure silver</span>
            </div>

            <div className="pt-3 border-t border-[#B8C5D4]/40 flex items-center justify-between text-xs">
              <span className="text-[11px] text-[#7A6A55]/80 font-mono">Updated: {formatDateTime(rates.lastUpdated).slice(11)}</span>
              <Link to="/c/silver" className="font-semibold text-[#3E4A5B] hover:text-[#1A202C] flex items-center gap-1 transition-colors">
                <span>View Silver Coins</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 4. EXACT 6 CATEGORY TILES (G) */}
      <section aria-label="Curated Categories">
        <div className="text-center max-w-xl mx-auto space-y-2 mb-8">
          <Badge variant="gold" size="sm">Authentic Collections</Badge>
          <h2 className="font-serif text-3xl font-bold text-[#5A4630]">
            Browse by Precious Category
          </h2>
          <p className="text-xs text-[#7A6A55]">
            Every category strictly complies with BIS hallmarking, gemological laboratory certification, and Vedic provenance standards.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {categoryTiles.map((cat) => (
            <Link
              key={cat.id}
              to={cat.path}
              className={`group bg-gradient-to-br ${cat.gradient} border ${cat.border} rounded-2xl overflow-hidden flex flex-col justify-between transition-all duration-300 hover:shadow-[0_12px_32px_rgba(90,70,48,0.14)] hover:-translate-y-1.5`}
            >
              <div className="relative aspect-16/10 overflow-hidden bg-[#FAF6EE]">
                <img
                  src={cat.image}
                  alt={cat.name}
                  loading="lazy"
                  className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-108"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/10 to-transparent pointer-events-none" />

                <div className="absolute top-3 left-3 z-10">
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-white/95 backdrop-blur-xs text-[10px] font-bold text-[#8C6418] border border-[#D4AF37]/50 shadow-xs uppercase tracking-wider">
                    <Sparkles className="w-3 h-3 text-[#B07E17]" />
                    {cat.badge}
                  </span>
                </div>

                <div className="absolute bottom-2.5 left-3 right-3 text-[11px] font-sans text-white/90 drop-shadow-xs font-medium">
                  {cat.tag}
                </div>
              </div>

              <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                <div>
                  <h3 className="font-serif text-xl font-bold text-[#5A4630] group-hover:text-[#C9A24B] transition-colors leading-snug">
                    {cat.name}
                  </h3>
                  <p className="text-xs text-[#7A6A55] mt-1.5 leading-relaxed">
                    {cat.subtitle}
                  </p>
                </div>

                <div className="pt-3 border-t border-[#EADFC8]/60 flex items-center justify-between text-xs font-semibold text-[#8C6418] group-hover:text-[#5A3F08]">
                  <span>Open Category Listing</span>
                  <div className="w-7 h-7 rounded-full bg-white/90 border border-[#D4AF37]/40 flex items-center justify-center shadow-2xs group-hover:bg-[#C9A24B] group-hover:text-white transition-all">
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* 5. FESTIVAL & CURATED COLLECTIONS (A) */}
      {activeFestivalCollections.length > 0 && (
        <section aria-label="Curated Festival Collections" className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <Badge variant="gold" size="sm">Festive Muhurat</Badge>
              <h2 className="font-serif text-3xl font-bold text-[#5A4630] mt-1">
                Curated Occasion Collections
              </h2>
              <p className="text-xs text-[#7A6A55]">
                Specialized celebratory collections mapped strictly to active investment SKUs.
              </p>
            </div>
            <Link to="/occasions">
              <Button variant="secondary" size="sm" rightIcon={<ArrowRight className="w-3.5 h-3.5" />}>
                View All Festive Collections
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {activeFestivalCollections.map((col) => (
              <div
                key={col.id}
                className="bg-white border border-[#EADFC8] rounded-2xl overflow-hidden shadow-xs hover:shadow-lg transition-all flex flex-col justify-between"
              >
                <div className="relative aspect-16/9 overflow-hidden bg-[#FAF7F2]">
                  <img
                    src={col.banner}
                    alt={col.name}
                    className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                  />
                  <div className="absolute top-3 left-3">
                    <span className="px-2.5 py-1 rounded-full bg-white/90 text-[#8C6418] text-[10px] font-bold uppercase tracking-wider border border-[#EADFC8]">
                      {col.occasion}
                    </span>
                  </div>
                </div>

                <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                  <div>
                    <h3 className="font-serif text-lg font-bold text-[#5A4630]">
                      {col.name}
                    </h3>
                    <p className="text-xs text-[#7A6A55] mt-1.5 leading-relaxed">
                      {col.description}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-[#EADFC8]/60 flex items-center justify-between">
                    <span className="text-[11px] text-[#7A6A55] font-mono">
                      {col.mappedSkuList.length} Curated Pieces
                    </span>
                    <Link
                      to="/occasions"
                      className="text-xs font-semibold text-[#C9A24B] hover:text-[#5A4630] flex items-center gap-1"
                    >
                      <span>Explore Collection</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 6. FEATURED & BESTSELLER PRODUCTS (G) */}
      <section aria-label="Featured Precious Items">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <Badge variant="gold" size="sm">Signature Creations</Badge>
            <h2 className="font-serif text-3xl font-bold text-[#5A4630] mt-1">
              Featured & Bestseller Precious Pieces
            </h2>
            <p className="text-xs text-[#7A6A55]">
              Real-time prices computed live from spot bullion rates. Includes Quick View & Direct Cart additions.
            </p>
          </div>
          <Link to="/c/gold">
            <Button variant="secondary" size="sm" rightIcon={<ArrowRight className="w-3.5 h-3.5" />}>
              View All Catalogue
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {featuredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      {/* 7. CORPORATE GIFTING VALUE PROPOSITION (G) */}
      <section className="bg-gradient-to-r from-[#FAF6EE] via-[#F5EDDA] to-[#ECE1C4] border border-[#E0D0AD] rounded-2xl p-6 sm:p-10 lg:p-12 relative overflow-hidden shadow-sm">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-center">
          <div className="lg:col-span-2 space-y-4">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/90 border border-[#D4AF37]/50 text-[11px] font-bold text-[#8C6418] uppercase tracking-wider">
              <Gift className="w-3.5 h-3.5" />
              Institutional Gifting & Custom Minting
            </div>

            <h2 className="font-serif text-2xl sm:text-4xl font-bold text-[#3E2F20] tracking-tight">
              Bespoke Corporate Coins & Presentation Hampers
            </h2>

            <p className="text-xs sm:text-sm text-[#665543] leading-relaxed max-w-2xl">
              Elevate corporate relationships with custom-minted 24K gold coins and 999 fine silver bullion bars carrying your corporate insignia, personalized serial engravings, and tamper-proof blister cards.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 text-xs">
              <div className="p-3 bg-white/90 rounded-xl border border-[#EADFC8]">
                <div className="font-bold text-[#5A4630]">Low Minimums</div>
                <div className="text-[11px] text-[#7A6A55] mt-0.5">Custom minting from 25 units • Starting ₹2,500/kit</div>
              </div>

              <div className="p-3 bg-white/90 rounded-xl border border-[#EADFC8]">
                <div className="font-bold text-[#5A4630]">Split Delivery</div>
                <div className="text-[11px] text-[#7A6A55] mt-0.5">Multi-branch armored dispatch with recipient verification</div>
              </div>

              <div className="p-3 bg-white/90 rounded-xl border border-[#EADFC8]">
                <div className="font-bold text-[#5A4630]">GST Invoicing</div>
                <div className="text-[11px] text-[#7A6A55] mt-0.5">100% compliant B2B tax invoices with full input credit</div>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-3 justify-center items-start lg:items-end">
            <Link to="/corporate-gifting" className="w-full sm:w-auto">
              <button
                type="button"
                className="w-full sm:w-auto px-6 py-3.5 bg-[#BA8332] hover:bg-[#A37025] text-white rounded-lg font-semibold text-sm shadow-sm hover:shadow-md transition-all inline-flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Request Corporate Quote</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </Link>
            <Link to="/c/gifting" className="text-xs font-semibold text-[#8C6418] hover:underline flex items-center gap-1">
              <span>Explore Curated Gift Kits</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </section>

      {/* 8. TRUST & EDUCATION SECTION (G) */}
      <section aria-label="Trust & Assurance" className="space-y-6">
        <div className="text-center max-w-xl mx-auto space-y-2">
          <Badge variant="gold" size="sm">Uncompromising Integrity</Badge>
          <h2 className="font-serif text-3xl font-bold text-[#5A4630]">
            Metallurgical Rigour & Client Assurance
          </h2>
          <p className="text-xs text-[#7A6A55]">
            Every claims made on our platform is backed by statutory compliance records and NABL accredited assaying.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="p-5 bg-white border border-[#EADFC8] rounded-xl space-y-3">
            <div className="w-10 h-10 rounded-lg bg-[#FAF5EB] border border-[#EADFC8] flex items-center justify-center text-[#C9A24B]">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="font-serif font-bold text-[#5A4630] text-sm">BIS Hallmark & HUID</h3>
            <p className="text-[11px] text-[#7A6A55] leading-relaxed">
              Every gold article is laser-embossed with a unique 6-character alphanumeric HUID verifying refinery origin and 999.9 purity.
            </p>
            <Link to="/authenticity" className="text-[11px] font-semibold text-[#C9A24B] hover:underline block pt-1">
              Read BIS Standards →
            </Link>
          </div>

          <div className="p-5 bg-white border border-[#EADFC8] rounded-xl space-y-3">
            <div className="w-10 h-10 rounded-lg bg-[#FAF5EB] border border-[#EADFC8] flex items-center justify-center text-[#C9A24B]">
              <FileCheck className="w-5 h-5" />
            </div>
            <h3 className="font-serif font-bold text-[#5A4630] text-sm">Lab Certicard Verification</h3>
            <p className="text-[11px] text-[#7A6A55] leading-relaxed">
              Gemstones are accompanied by GIA/IGI laboratory credentials. Search any certificate number online for real-time verification.
            </p>
            <Link to="/verify/B24-999-5481" className="text-[11px] font-semibold text-[#C9A24B] hover:underline block pt-1">
              Verify Certificate →
            </Link>
          </div>

          <div className="p-5 bg-white border border-[#EADFC8] rounded-xl space-y-3">
            <div className="w-10 h-10 rounded-lg bg-[#FAF5EB] border border-[#EADFC8] flex items-center justify-center text-[#C9A24B]">
              <Truck className="w-5 h-5" />
            </div>
            <h3 className="font-serif font-bold text-[#5A4630] text-sm">Armoured Courier Transit</h3>
            <p className="text-[11px] text-[#7A6A55] leading-relaxed">
              High-value consignments are insured to 100% invoice declared value and transported exclusively via Sequel & BVC Logistics.
            </p>
            <Link to="/shipping" className="text-[11px] font-semibold text-[#C9A24B] hover:underline block pt-1">
              Shipping Guidelines →
            </Link>
          </div>

          <div className="p-5 bg-white border border-[#EADFC8] rounded-xl space-y-3">
            <div className="w-10 h-10 rounded-lg bg-[#FAF5EB] border border-[#EADFC8] flex items-center justify-center text-[#C9A24B]">
              <HelpCircle className="w-5 h-5" />
            </div>
            <h3 className="font-serif font-bold text-[#5A4630] text-sm">Statutory Buyback Guarantee</h3>
            <p className="text-[11px] text-[#7A6A55] leading-relaxed">
              Transparent liquidation at prevailing spot rates. Full metallurgical assay report provided upon return inspection.
            </p>
            <Link to="/returns" className="text-[11px] font-semibold text-[#C9A24B] hover:underline block pt-1">
              Buyback Policy →
            </Link>
          </div>
        </div>
      </section>

      {/* 9. APPROVED CLIENT TESTIMONIALS (G) */}
      {approvedTestimonials.length > 0 && (
        <section aria-label="Client Testimonials" className="space-y-6">
          <div className="text-center max-w-xl mx-auto space-y-2">
            <Badge variant="gold" size="sm">Client Experiences</Badge>
            <h2 className="font-serif text-3xl font-bold text-[#5A4630]">
              Verified Client Testimonials
            </h2>
            <p className="text-xs text-[#7A6A55]">
              Real feedback from verified investors and institutional corporate partners.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {approvedTestimonials.map((t) => (
              <div
                key={t.id}
                className="p-5 bg-white border border-[#EADFC8] rounded-xl flex flex-col justify-between space-y-4 shadow-xs"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-0.5 text-[#BA8332]">
                      {[...Array(t.rating)].map((_, i) => (
                        <Star key={i} className="w-3.5 h-3.5 fill-[#BA8332]" />
                      ))}
                    </div>
                    <QuoteIcon className="w-5 h-5 text-[#EADFC8]" />
                  </div>

                  <p className="text-xs text-[#5A4630] leading-relaxed italic">
                    "{t.quote}"
                  </p>
                </div>

                <div className="pt-3 border-t border-[#EADFC8]/60 text-xs">
                  <div className="font-bold text-[#5A4630] flex items-center gap-1.5">
                    <span>{t.customerName}</span>
                    <span className="text-[10px] text-[#2D5A27] bg-[#DCE8D5] px-1 rounded">Verified</span>
                  </div>
                  <div className="text-[11px] text-[#7A6A55] mt-0.5">
                    {t.city} • <span className="text-[#C9A24B]">{t.productName}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
};
