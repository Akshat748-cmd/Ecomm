import React, { useState, useEffect, useCallback } from 'react';
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
  Lock,
  Truck,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

interface FestiveSlide {
  id: string;
  category: string;
  tag: string;
  title: string;
  description: string;
  image: string;
  ctaText: string;
  link: string;
  accentColor: string;
  bgGradient: string;
}

const FESTIVE_SLIDES: FestiveSlide[] = [
  {
    id: 'gold',
    category: 'gold',
    tag: 'FESTIVE COLLECTION',
    title: 'Celebrate Tradition in Gold',
    description: 'Exclusive festive jewellery & 24K bullion collection • Crafted for your special moments',
    image: '/banners/banner-gold.jpg',
    ctaText: 'EXPLORE NOW',
    link: '/c/gold',
    accentColor: '#BA8332',
    bgGradient: 'from-[#FFF7EC] via-[#FAF0DF] to-[#FCEFDE]',
  },
  {
    id: 'silver',
    category: 'silver',
    tag: 'SACRED TREASURY',
    title: 'Divine Silver for Auspicious Beginnings',
    description: '999 Fine Silver Lakshmi Ganesh coins, consecrated idols & heirloom dining sets',
    image: '/banners/banner-silver.jpg',
    ctaText: 'EXPLORE SILVER',
    link: '/c/silver',
    accentColor: '#8C7A65',
    bgGradient: 'from-[#F8F9FA] via-[#F2F4F7] to-[#E9ECEF]',
  },
  {
    id: 'gemstones',
    category: 'gemstones',
    tag: 'ROYAL ADORNMENT',
    title: 'Natural Certified Gemstones of Kings',
    description: 'Untreated Burmese Rubies, Colombian Emeralds & vivid certified Ceylon Sapphires',
    image: '/banners/banner-gemstones.jpg',
    ctaText: 'EXPLORE GEMS',
    link: '/c/gemstones',
    accentColor: '#2D5A27',
    bgGradient: 'from-[#F6FAF5] via-[#EBF3EA] to-[#E2EFE0]',
  },
  {
    id: 'rudraksha',
    category: 'rudraksha',
    tag: 'VEDIC DEVOTION',
    title: 'Sacred Himalayan Rudraksha & Silver Malas',
    description: 'Lab-certified Nepali 1 to 14 Mukhi beads & energized sterling silver sadhana malas',
    image: '/banners/banner-rudraksha.jpg',
    ctaText: 'EXPLORE RUDRAKSHA',
    link: '/c/rudraksha',
    accentColor: '#8C3A2D',
    bgGradient: 'from-[#FDF7F5] via-[#F9EBE7] to-[#F5DED8]',
  },
  {
    id: 'gifting',
    category: 'gifting',
    tag: 'CELEBRATORY GIFTS',
    title: 'Curated Treasury & Corporate Gifting',
    description: 'Custom-minted 24K gold keepsakes, auspicious coins & sterling silver hamper sets',
    image: '/banners/banner-gifting.jpg',
    ctaText: 'EXPLORE GIFTING',
    link: '/c/gifting',
    accentColor: '#966D24',
    bgGradient: 'from-[#FCF9F2] via-[#F8F1E1] to-[#F2E7CD]',
  },
];

export const HomePage: React.FC = () => {
  useSEO({
    title: 'Precious Gold, Silver, Natural Gemstones & Rudraksha',
    description:
      'Buy certified 24K gold coins and bars, 999 pure silver bullion, natural untreated Burmese rubies, Colombian emeralds, and authentic Nepali Rudraksha with live rates.',
    canonicalPath: '/',
  });

  const { rates, isFeedStale, products } = useAppStore();

  // Festive Banner Carousel State
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [isSliderPaused, setIsSliderPaused] = useState(false);

  const nextSlide = useCallback(() => {
    setCurrentSlideIndex((prev) => (prev + 1) % FESTIVE_SLIDES.length);
  }, []);

  const prevSlide = useCallback(() => {
    setCurrentSlideIndex((prev) => (prev - 1 + FESTIVE_SLIDES.length) % FESTIVE_SLIDES.length);
  }, []);

  // Autoplay timer (5 seconds)
  useEffect(() => {
    if (isSliderPaused) return;
    const timer = setInterval(() => {
      nextSlide();
    }, 5000);
    return () => clearInterval(timer);
  }, [isSliderPaused, nextSlide]);

  // Featured 4 items across categories
  const featuredProducts = products.filter((p) =>
    ['prod-gold-01', 'prod-silver-02', 'prod-gem-01', 'prod-rud-01'].includes(p.id)
  );

  const categoryModules = [
    {
      id: 'gold',
      title: '24K & 22K Gold Bullion',
      subtitle: '999.9 Minted Coins, Cast Bars & Heritage Chains',
      image: '/banners/banner-gold.jpg',
      badge: 'BIS 999.9 & 916',
      tag: '3 Investment Bullion & Jewellery Pieces',
      path: '/c/gold',
      gradient: 'from-[#FFFDF7] to-[#FAF1DB]',
      border: 'border-[#E8D4A2]',
    },
    {
      id: 'silver',
      title: '999 Fine Silver',
      subtitle: 'Auspicious Lakshmi Coins, 250g Bars & Sacred Idols',
      image: '/banners/banner-silver.jpg',
      badge: '999 Fine Silver',
      tag: '3 Coins, Bars & Consecrated Idols',
      path: '/c/silver',
      gradient: 'from-[#FFFFFF] to-[#EAECEF]',
      border: 'border-[#D5DCE2]',
    },
    {
      id: 'gemstones',
      title: 'Certified Gemstones',
      subtitle: 'Burmese Rubies, Colombian Emeralds & Basra Pearls',
      image: '/banners/banner-gemstones.jpg',
      badge: 'GIA & IGI Certified',
      tag: '3 Natural Unheated Rubies, Emeralds & Pearls',
      path: '/c/gemstones',
      gradient: 'from-[#FCFDFB] to-[#DCE8D5]',
      border: 'border-[#BFD6B5]',
    },
    {
      id: 'coloured-stones',
      title: 'Coloured Sapphires',
      subtitle: 'Ceylon Cornflower Blue & Golden Yellow Pukhraj',
      image: '/banners/banner-cstone.jpg',
      badge: 'Ceylon Provenance',
      tag: '2 Natural Royal Blue & Yellow Sapphires',
      path: '/c/coloured-stones',
      gradient: 'from-[#FAFBFE] to-[#DDE7F6]',
      border: 'border-[#C1D2EC]',
    },
    {
      id: 'rudraksha',
      title: 'Sacred Rudraksha',
      subtitle: 'Consecrated 5 Mukhi Malas & Rare 7 Mukhi Beads',
      image: '/banners/banner-rudraksha.jpg',
      badge: 'Vedic Consecration',
      tag: '3 Authentic Himalayan Malas & Beads',
      path: '/c/rudraksha',
      gradient: 'from-[#FEFAF8] to-[#F3D9D2]',
      border: 'border-[#E0B9AE]',
    },
    {
      id: 'gifting',
      title: 'Curated Treasury Gifting',
      subtitle: 'Imperial Silver Puja Sets & Gold Coin Keepsakes',
      image: '/banners/banner-gifting.jpg',
      badge: 'Imperial Presentation',
      tag: '2 Curated Silver & Gold Keepsake Hampers',
      path: '/c/gifting',
      gradient: 'from-[#FCFAF5] to-[#EEDCC0]',
      border: 'border-[#DDC5A1]',
    },
  ];

  return (
    <div className="space-y-16">
      {/* 1. HERO SECTION */}
      <section className="relative rounded-2xl border border-[#E8DDC6] bg-[#F7F1E5] p-8 sm:p-12 lg:p-16 overflow-hidden shadow-[0_8px_32px_rgba(90,70,48,0.06)] min-h-[480px] lg:min-h-[520px] flex items-center">
        {/* Artwork Image cleanly occupying the Right Side with soft fade to the left */}
        <div className="absolute top-0 right-0 bottom-0 w-full sm:w-[70%] md:w-[60%] lg:w-[56%] pointer-events-none select-none overflow-hidden">
          <img
            src="/hero-bg.jpg"
            alt="Lotus 24K Gold Coin, Emerald and Sacred Rudraksha"
            className="w-full h-full object-cover object-[74%_center]"
            style={{
              maskImage: 'linear-gradient(to right, transparent 0%, black 30%, black 100%)',
              WebkitMaskImage: 'linear-gradient(to right, transparent 0%, black 30%, black 100%)',
            }}
          />
        </div>

        {/* Left Side Content */}
        <div className="relative z-10 max-w-xl lg:max-w-2xl space-y-6 sm:space-y-7">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/80 backdrop-blur-md border border-[#E6D9C3] text-xs font-semibold text-[#4A3B2C] shadow-xs">
            <ShieldCheck className="w-4 h-4 text-[#BA8332]" />
            <span>BIS Hallmarked • LBMA Refinery Standard • 100% Insured</span>
          </div>

          <h1 className="font-serif text-3xl sm:text-5xl lg:text-6xl font-bold text-[#3E2F20] leading-[1.14] tracking-tight">
            Timeless Purity in Precious<br className="hidden sm:inline" />
            Metals & Sacred Artefacts
          </h1>

          <p className="text-sm sm:text-base text-[#665543] leading-relaxed max-w-xl font-normal">
            India’s premium destination for physical gold & silver bullion, natural certified gemstones, and authentic consecrated Rudraksha. Guaranteed transparent live rates and 10-minute price quote protection.
          </p>

          <div className="flex flex-wrap items-center gap-4 pt-1">
            <Link to="/c/gold">
              <button
                type="button"
                className="px-6 sm:px-7 py-3 sm:py-3.5 rounded-lg bg-[#BA8332] hover:bg-[#A37025] text-white font-medium text-sm sm:text-base shadow-sm hover:shadow-md transition-all inline-flex items-center gap-2 cursor-pointer"
              >
                <span>Explore 24K Bullion & Jewellery</span>
                <span className="text-lg leading-none">→</span>
              </button>
            </Link>
            <Link to="/verify/B24-999-5481">
              <button
                type="button"
                className="px-6 sm:px-7 py-3 sm:py-3.5 rounded-lg bg-white/95 hover:bg-white text-[#3E2F20] border border-[#D5C2A5] font-medium text-sm sm:text-base shadow-xs hover:shadow-sm transition-all cursor-pointer"
              >
                Verify Assay Certificate
              </button>
            </Link>
          </div>
        </div>
      </section>

      {/* FESTIVE & PRODUCT OFFER SLIDING CAROUSEL BANNER (Replaces static banner) */}
      <section
        className={`relative rounded-2xl border border-[#E8D9C0] overflow-hidden shadow-[0_4px_24px_rgba(90,70,48,0.06)] transition-all duration-700 select-none bg-gradient-to-r ${FESTIVE_SLIDES[currentSlideIndex].bgGradient}`}
        onMouseEnter={() => setIsSliderPaused(true)}
        onMouseLeave={() => setIsSliderPaused(false)}
        aria-label="Festive Offers and Collections Carousel"
      >
        {/* Subtle decorative background watermarks */}
        <div className="absolute left-[-20px] top-[-20px] w-48 h-48 opacity-10 pointer-events-none">
          <Sparkles className="w-full h-full text-[#C9A24B]" />
        </div>
        <div className="absolute right-[-20px] bottom-[-20px] w-48 h-48 opacity-10 pointer-events-none">
          <Coins className="w-full h-full text-[#C9A24B]" />
        </div>

        {/* Previous Slide Button */}
        <button
          type="button"
          onClick={prevSlide}
          aria-label="Previous festive slide"
          className="absolute left-2.5 sm:left-4 top-1/2 -translate-y-1/2 z-20 w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-white/95 hover:bg-white text-[#5A4630] border border-[#EADFC8] shadow-md flex items-center justify-center transition-all hover:scale-105 active:scale-95 cursor-pointer"
        >
          <ChevronLeft className="w-5 h-5 text-[#5A4630]" />
        </button>

        {/* Next Slide Button */}
        <button
          type="button"
          onClick={nextSlide}
          aria-label="Next festive slide"
          className="absolute right-2.5 sm:right-4 top-1/2 -translate-y-1/2 z-20 w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-white/95 hover:bg-white text-[#5A4630] border border-[#EADFC8] shadow-md flex items-center justify-center transition-all hover:scale-105 active:scale-95 cursor-pointer"
        >
          <ChevronRight className="w-5 h-5 text-[#5A4630]" />
        </button>

        {/* Slide Content Track */}
        <div className="px-12 sm:px-16 md:px-20 py-5 sm:py-6 md:py-7 flex flex-col md:flex-row items-center justify-between gap-4 md:gap-8 min-h-[140px] sm:min-h-[155px]">
          {/* Left: Product Thumbnail in exact ratio */}
          <div className="w-28 sm:w-36 md:w-44 lg:w-48 h-20 sm:h-24 md:h-26 lg:h-28 shrink-0 rounded-xl overflow-hidden shadow-xs border border-[#EADFC8] bg-white/80 p-1 flex items-center justify-center transition-transform duration-500 hover:scale-105">
            <img
              src={FESTIVE_SLIDES[currentSlideIndex].image}
              alt={FESTIVE_SLIDES[currentSlideIndex].title}
              className="w-full h-full object-cover rounded-lg"
            />
          </div>

          {/* Center: Slide Typography */}
          <div className="text-center md:text-left space-y-1 sm:space-y-1.5 flex-1">
            <span className="text-[10px] sm:text-xs font-bold tracking-widest uppercase text-[#BA8332] block font-sans">
              {FESTIVE_SLIDES[currentSlideIndex].tag}
            </span>
            <h2 className="font-serif text-lg sm:text-2xl md:text-3xl font-bold text-[#3E2F20] tracking-tight leading-tight">
              {FESTIVE_SLIDES[currentSlideIndex].title}
            </h2>
            <p className="text-xs sm:text-sm text-[#7A6A55] leading-relaxed max-w-xl">
              {FESTIVE_SLIDES[currentSlideIndex].description}
            </p>
          </div>

          {/* Right: Slide Action Button */}
          <Link to={FESTIVE_SLIDES[currentSlideIndex].link} className="shrink-0 mt-1 md:mt-0">
            <button
              type="button"
              className="px-5 sm:px-6 py-2.5 sm:py-3 rounded-lg bg-[#BA8332] hover:bg-[#A37025] text-white text-xs sm:text-sm font-semibold tracking-wider uppercase shadow-sm hover:shadow-md transition-all inline-flex items-center gap-2 cursor-pointer"
            >
              <span>{FESTIVE_SLIDES[currentSlideIndex].ctaText}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </Link>
        </div>

        {/* Carousel Navigation Indicators (Dots) */}
        <div className="absolute bottom-1.5 sm:bottom-2 left-1/2 -translate-x-1/2 flex items-center gap-1.5 z-20">
          {FESTIVE_SLIDES.map((slide, idx) => (
            <button
              key={slide.id}
              type="button"
              onClick={() => setCurrentSlideIndex(idx)}
              aria-label={`Go to slide ${idx + 1}`}
              className={`h-1.5 rounded-full transition-all duration-300 cursor-pointer ${
                idx === currentSlideIndex
                  ? 'w-6 bg-[#BA8332]'
                  : 'w-1.5 bg-[#BA8332]/35 hover:bg-[#BA8332]/70'
              }`}
            />
          ))}
        </div>
      </section>

      {/* PROPOSED: Personalization Strip */}
      <section className="p-4 bg-[#FFFFFF] border border-[#EADFC8] rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 text-[#5A4630]">
          <Badge variant="neutral" size="sm">Proposed</Badge>
          <span className="font-medium">
            <strong>Recommended for you:</strong> Investors who viewed 10g 24K Bullion Coins also shortlisted 50g Investment Cast Bars.
          </span>
        </div>
        <Link to="/c/gold" className="text-[#C9A24B] hover:underline font-semibold flex items-center gap-1 shrink-0">
          <span>View Recommendations</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </section>

      {/* 2. LIVE RATE CARDS (24K, 22K, Silver 999) */}
      <section aria-label="Live Bullion Rates">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="font-serif text-2xl font-bold text-[#5A4630] flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-[#C9A24B]" />
              Live Precious Metal Rates
            </h2>
            <p className="text-xs text-[#7A6A55]">
              Real-time spot prices dynamically linked to international assay benchmarks.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant={isFeedStale ? 'amber' : 'sage'} size="sm">
              <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${isFeedStale ? 'bg-[#E8C26E]' : 'bg-[#2D5A27] animate-pulse'}`}></span>
              {isFeedStale ? 'Rate Delayed' : 'Live Ingestion'}
            </Badge>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1: Gold 24K (999.9 Purity) - Sovereign Bullion */}
          <div className="relative bg-gradient-to-br from-[#FFFDF8] via-[#FAF3E2] to-[#F5E6BD] border-2 border-[#D4AF37]/60 hover:border-[#D4AF37] rounded-2xl p-6 sm:p-7 shadow-[0_8px_30px_rgba(212,175,55,0.16)] hover:shadow-[0_16px_40px_rgba(212,175,55,0.26)] transition-all duration-300 hover:-translate-y-1.5 group overflow-hidden">
            {/* Watermark Bullion Icon */}
            <div className="absolute -right-4 -bottom-4 w-28 h-28 opacity-10 pointer-events-none group-hover:scale-110 transition-transform duration-500">
              <Coins className="w-full h-full text-[#D4AF37]" />
            </div>

            {/* Header: Emblem + Badge */}
            <div className="flex items-center justify-between gap-2 mb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-white/90 border border-[#D4AF37]/50 flex items-center justify-center text-[#8C6418] shadow-xs">
                  <Coins className="w-5 h-5 text-[#BA8332]" />
                </div>
                <div>
                  <span className="text-[11px] font-bold tracking-wider uppercase text-[#8C6418] block font-sans">
                    Gold 24K
                  </span>
                  <span className="text-[10px] text-[#7A6A55] font-medium">999.9 Fine Bullion</span>
                </div>
              </div>
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-white/90 border border-[#D4AF37]/60 text-[#8C6418] text-[10px] font-bold uppercase tracking-wider shadow-xs">
                <Sparkles className="w-3 h-3 text-[#B07E17]" />
                Investment Grade
              </span>
            </div>

            {/* Price Row */}
            <div className="my-4">
              <div className="text-3xl sm:text-4xl lg:text-[40px] font-serif font-extrabold text-[#744F0D] tabular-nums tracking-tight flex items-baseline gap-1">
                <span>{formatINR(rates.gold24k)}</span>
                <span className="text-sm font-sans font-normal text-[#8C6418]/80"> / gram</span>
              </div>
            </div>

            {/* Benchmark Indicator */}
            <div className="flex items-center gap-2 text-[11px] mb-4">
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-white/80 border border-[#2D5A27]/30 text-[#2D5A27] font-semibold text-[10px] shadow-2xs">
                <span className="w-1.5 h-1.5 rounded-full bg-[#2D5A27] animate-pulse"></span>
                MCX Benchmark
              </span>
              <span className="text-[11px] text-[#7A6A55] font-medium">Basis: 1g fine net weight</span>
            </div>

            {/* Footer Row with Quick Navigation */}
            <div className="pt-3 border-t border-[#D4AF37]/25 flex items-center justify-between text-xs">
              <span className="text-[11px] text-[#7A6A55]/80 font-mono">Updated: {formatDateTime(rates.lastUpdated)}</span>
              <Link to="/c/gold" className="font-semibold text-[#8C6418] hover:text-[#5A3F08] flex items-center gap-1 transition-colors">
                <span>View 24K Bullion</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
              </Link>
            </div>
          </div>

          {/* Card 2: Gold 22K (916 Hallmark) - Heritage Jewellery */}
          <div className="relative bg-gradient-to-br from-[#FFFDF9] via-[#FAF4EA] to-[#F5E5D1] border-2 border-[#C9A24B]/40 hover:border-[#BA8332] rounded-2xl p-6 sm:p-7 shadow-[0_8px_30px_rgba(201,162,75,0.12)] hover:shadow-[0_16px_40px_rgba(201,162,75,0.22)] transition-all duration-300 hover:-translate-y-1.5 group overflow-hidden">
            {/* Watermark Sparkles Icon */}
            <div className="absolute -right-4 -bottom-4 w-28 h-28 opacity-10 pointer-events-none group-hover:scale-110 transition-transform duration-500">
              <Sparkles className="w-full h-full text-[#C9A24B]" />
            </div>

            {/* Header: Emblem + Badge */}
            <div className="flex items-center justify-between gap-2 mb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-white/90 border border-[#C9A24B]/40 flex items-center justify-center text-[#735025] shadow-xs">
                  <Sparkles className="w-5 h-5 text-[#BA8332]" />
                </div>
                <div>
                  <span className="text-[11px] font-bold tracking-wider uppercase text-[#735025] block font-sans">
                    Gold 22K
                  </span>
                  <span className="text-[10px] text-[#7A6A55] font-medium">916 Hallmark Jewellery</span>
                </div>
              </div>
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-white/90 border border-[#C9A24B]/40 text-[#735025] text-[10px] font-bold uppercase tracking-wider shadow-xs">
                Jewellery Grade
              </span>
            </div>

            {/* Price Row */}
            <div className="my-4">
              <div className="text-3xl sm:text-4xl lg:text-[40px] font-serif font-extrabold text-[#5A3F1E] tabular-nums tracking-tight flex items-baseline gap-1">
                <span>{formatINR(rates.gold22k)}</span>
                <span className="text-sm font-sans font-normal text-[#7A5B35]/80"> / gram</span>
              </div>
            </div>

            {/* Benchmark Indicator */}
            <div className="flex items-center gap-2 text-[11px] mb-4">
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-white/80 border border-[#C9A24B]/30 text-[#735025] font-semibold text-[10px] shadow-2xs">
                BIS 916 Standard
              </span>
              <span className="text-[11px] text-[#7A6A55] font-medium">Basis: 24K × 0.9167</span>
            </div>

            {/* Footer Row with Quick Navigation */}
            <div className="pt-3 border-t border-[#C9A24B]/25 flex items-center justify-between text-xs">
              <span className="text-[11px] text-[#7A6A55]/80 font-mono">Updated: {formatDateTime(rates.lastUpdated)}</span>
              <Link to="/c/gold" className="font-semibold text-[#735025] hover:text-[#4A3215] flex items-center gap-1 transition-colors">
                <span>View Jewellery</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
              </Link>
            </div>
          </div>

          {/* Card 3: Silver 999 - Auspicious Pure Bullion */}
          <div className="relative bg-gradient-to-br from-[#FFFFFF] via-[#F4F6F9] to-[#E3E8EF] border-2 border-[#B8C5D4]/70 hover:border-[#7A8E9F] rounded-2xl p-6 sm:p-7 shadow-[0_8px_30px_rgba(150,165,185,0.16)] hover:shadow-[0_16px_40px_rgba(150,165,185,0.26)] transition-all duration-300 hover:-translate-y-1.5 group overflow-hidden">
            {/* Watermark Shield Icon */}
            <div className="absolute -right-4 -bottom-4 w-28 h-28 opacity-10 pointer-events-none group-hover:scale-110 transition-transform duration-500">
              <ShieldCheck className="w-full h-full text-[#7A8E9F]" />
            </div>

            {/* Header: Emblem + Badge */}
            <div className="flex items-center justify-between gap-2 mb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-white/90 border border-[#B8C5D4] flex items-center justify-center text-[#4A5568] shadow-xs">
                  <ShieldCheck className="w-5 h-5 text-[#5A6878]" />
                </div>
                <div>
                  <span className="text-[11px] font-bold tracking-wider uppercase text-[#3E4A5B] block font-sans">
                    Silver 999
                  </span>
                  <span className="text-[10px] text-[#7A6A55] font-medium">999 Fine Bullion</span>
                </div>
              </div>
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-white/90 border border-[#B8C5D4] text-[#3E4A5B] text-[10px] font-bold uppercase tracking-wider shadow-xs">
                Auspicious Bullion
              </span>
            </div>

            {/* Price Row */}
            <div className="my-4">
              <div className="text-3xl sm:text-4xl lg:text-[40px] font-serif font-extrabold text-[#2D3748] tabular-nums tracking-tight flex items-baseline gap-1">
                <span>{formatINR(rates.silver999)}</span>
                <span className="text-sm font-sans font-normal text-[#5A6878]/80"> / gram</span>
              </div>
            </div>

            {/* Benchmark Indicator */}
            <div className="flex items-center gap-2 text-[11px] mb-4">
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-white/80 border border-[#B8C5D4] text-[#3E4A5B] font-semibold text-[10px] shadow-2xs">
                LBMA Spot Silver
              </span>
              <span className="text-[11px] text-[#7A6A55] font-medium">Basis: 1g pure silver</span>
            </div>

            {/* Footer Row with Quick Navigation */}
            <div className="pt-3 border-t border-[#B8C5D4]/40 flex items-center justify-between text-xs">
              <span className="text-[11px] text-[#7A6A55]/80 font-mono">Updated: {formatDateTime(rates.lastUpdated)}</span>
              <Link to="/c/silver" className="font-semibold text-[#3E4A5B] hover:text-[#1A202C] flex items-center gap-1 transition-colors">
                <span>View Silver Coins</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 3. CATEGORY MODULES */}
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
          {categoryModules.map((cat) => (
            <Link
              key={cat.id}
              to={cat.path}
              className={`group bg-gradient-to-br ${cat.gradient} border ${cat.border} rounded-2xl overflow-hidden flex flex-col justify-between transition-all duration-300 hover:shadow-[0_12px_32px_rgba(90,70,48,0.14)] hover:-translate-y-1.5`}
            >
              {/* Luxury Real Category Image Showcase */}
              <div className="relative aspect-16/10 overflow-hidden bg-[#FAF6EE]">
                <img
                  src={cat.image}
                  alt={cat.title}
                  loading="lazy"
                  className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-108"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/10 to-transparent pointer-events-none" />

                {/* Hallmark / Lab Badge */}
                <div className="absolute top-3 left-3 z-10">
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-white/95 backdrop-blur-xs text-[10px] font-bold text-[#8C6418] border border-[#D4AF37]/50 shadow-xs uppercase tracking-wider">
                    <Sparkles className="w-3 h-3 text-[#B07E17]" />
                    {cat.badge}
                  </span>
                </div>

                {/* Subtitle tag overlay */}
                <div className="absolute bottom-2.5 left-3 right-3 text-[11px] font-sans text-white/90 drop-shadow-xs font-medium">
                  {cat.tag}
                </div>
              </div>

              {/* Card Body */}
              <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                <div>
                  <h3 className="font-serif text-xl font-bold text-[#5A4630] group-hover:text-[#C9A24B] transition-colors leading-snug">
                    {cat.title}
                  </h3>
                  <p className="text-xs text-[#7A6A55] mt-1.5 leading-relaxed">
                    {cat.subtitle}
                  </p>
                </div>

                <div className="pt-3 border-t border-[#EADFC8]/60 flex items-center justify-between text-xs font-semibold text-[#8C6418] group-hover:text-[#5A3F08]">
                  <span>Explore Collection</span>
                  <div className="w-7 h-7 rounded-full bg-white/90 border border-[#D4AF37]/40 flex items-center justify-center shadow-2xs group-hover:bg-[#C9A24B] group-hover:text-white transition-all">
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* 4. FEATURED PRODUCTS WITH LIVE PRICES */}
      <section aria-label="Featured Precious Items">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <Badge variant="gold" size="sm">Signature Creations</Badge>
            <h2 className="font-serif text-3xl font-bold text-[#5A4630] mt-1">
              Featured Precious Pieces
            </h2>
            <p className="text-xs text-[#7A6A55]">
              Real-time prices computed live from spot bullion rates and gemstone certifications.
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

      {/* 5. TRUST PILLARS & CLIENT COMMITMENT (BENEFITS STRIP) */}
      <section className="bg-[#FAF7F2] border border-[#EAE2D5] rounded-xl py-10 px-6 sm:px-8 lg:px-12 my-6">
        <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-[#EAE2D5]">
          {/* Benefit 01 */}
          <div className="flex items-start gap-4 sm:gap-5 py-6 md:py-2 md:pr-8 first:pt-0 last:pb-0">
            <div className="w-12 h-12 rounded-full bg-[#F5ECE0] flex items-center justify-center shrink-0 text-[#9E7736] shadow-2xs">
              <Lock className="w-5 h-5 stroke-[1.5]" />
            </div>
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-sans font-medium text-[#B88E3E] tracking-wider">01</span>
                <span className="w-8 h-[1px] bg-[#B88E3E]/60" />
              </div>
              <h3 className="font-serif text-lg font-medium text-[#2C2016] tracking-tight">
                10-Minute Quote Lock
              </h3>
              <p className="text-xs text-[#7A6A55] leading-relaxed max-w-[280px]">
                Protect your gold and silver price from market fluctuations while completing payment. Stock is reserved exclusively for you.
              </p>
            </div>
          </div>

          {/* Benefit 02 */}
          <div className="flex items-start gap-4 sm:gap-5 py-6 md:py-2 md:px-8 first:pt-0 last:pb-0">
            <div className="w-12 h-12 rounded-full bg-[#F5ECE0] flex items-center justify-center shrink-0 text-[#9E7736] shadow-2xs">
              <ShieldCheck className="w-5 h-5 stroke-[1.5]" />
            </div>
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-sans font-medium text-[#B88E3E] tracking-wider">02</span>
                <span className="w-8 h-[1px] bg-[#B88E3E]/60" />
              </div>
              <h3 className="font-serif text-lg font-medium text-[#2C2016] tracking-tight">
                100% Laboratory Assay
              </h3>
              <p className="text-xs text-[#7A6A55] leading-relaxed max-w-[280px]">
                Every gold coin carries BIS hallmarking and refinery assay cards. Gemstones are independently certified by GIA and IGI.
              </p>
            </div>
          </div>

          {/* Benefit 03 */}
          <div className="flex items-start gap-4 sm:gap-5 py-6 md:py-2 md:pl-8 first:pt-0 last:pb-0">
            <div className="w-12 h-12 rounded-full bg-[#F5ECE0] flex items-center justify-center shrink-0 text-[#9E7736] shadow-2xs">
              <Truck className="w-5 h-5 stroke-[1.5]" />
            </div>
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-sans font-medium text-[#B88E3E] tracking-wider">03</span>
                <span className="w-8 h-[1px] bg-[#B88E3E]/60" />
              </div>
              <h3 className="font-serif text-lg font-medium text-[#2C2016] tracking-tight">
                Armoured Insured Transit
              </h3>
              <p className="text-xs text-[#7A6A55] leading-relaxed max-w-[280px]">
                Dispatched via specialized precious couriers (Sequel & BVC) with OTP delivery verification and 100% transit insurance cover.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
