import React, { useState, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAppStore } from '../store';
import { useSEO } from '../lib/useSEO';
import { calculatePrice } from '../lib/pricing';
import { ProductCard } from '../components/ProductCard';
import { CompareDrawer } from '../components/CompareDrawer';
import { Button } from '../components/Button';
import { Badge } from '../components/Badge';
import { Chip } from '../components/Chip';
import { EmptyState } from '../components/EmptyState';
import {
  ChevronRight,
  SlidersHorizontal,
  X,
  Filter,
  Star,
  MessageSquare,
  Clock,
  Truck,
  CheckCircle2,
  AlertTriangle,
  Scale,
} from 'lucide-react';

interface FilterState {
  priceRange: string | null;
  weightRange: string | null;
  metal: string | null;
  purity: string | null;
  stoneType: string | null;
  mukhi: string | null;
  origin: string | null;
  occasion: string | null;
  inStockOnly: boolean;
  minRating4: boolean;
  personalizationOnly: boolean;
  hasOfferOnly: boolean;
  pincode: string;
}

const CATEGORY_META: Record<
  string,
  { title: string; intro: string; purityOptions: string[] }
> = {
  gold: {
    title: 'Sovereign Gold Bullion & Fine Jewellery',
    intro:
      'Certified 999.9 pure investment coins, precision cast bars, and handcrafted 22K hallmark jewellery.\nEvery piece carries government-approved hallmarking and tamper-evident assay certification.',
    purityOptions: ['24K (999.9)', '22K (916)'],
  },
  silver: {
    title: '999 Fine Silver Bullion & Sacred Artefacts',
    intro:
      'High-relief commemorative festive coins, solid investment cast bars, and artisan idols.\nRefined to 999 purity with laser-verified assay certificates and protective capsules.',
    purityOptions: ['999 Fine Silver'],
  },
  gemstones: {
    title: 'Certified Natural Untreated Gemstones',
    intro:
      'Collector-grade unheated Burmese rubies, Colombian Muzo emeralds, and natural saltwater Basra pearls.\nAccompanied by premier GIA and IGI international gemological laboratory reports.',
    purityOptions: ['Natural Unheated'],
  },
  'coloured-stones': {
    title: 'Ceylon Sapphires & Coloured Gemstones',
    intro:
      'Rare royal cornflower blue sapphires and canary yellow sapphires with high optical clarity.\nNatural, untreated stones suitable for fine jewellery settings and astrological vitality.',
    purityOptions: ['Natural Sapphire'],
  },
  rudraksha: {
    title: 'Consecrated Nepali Rudraksha & Sacred Malas',
    intro:
      'Authentic Himalayan 5 Mukhi rosaries, rare collector 7 Mukhi beads, and silver-capped pendants.\nIndependently verified for botanical authenticity, natural mukhi furrows, and sacred provenance.',
    purityOptions: ['1 Mukhi', '5 Mukhi', '7 Mukhi'],
  },
  bullion: {
    title: 'Investment Grade Gold & Silver Bullion',
    intro:
      'Certified 999.9 pure gold coins and 999 fine silver bullion bars.\nTamper-evident assay blister packs with guaranteed transparent live MCX rates.',
    purityOptions: ['24K (999.9)', '999 Fine Silver'],
  },
  gifting: {
    title: 'Precious Corporate & Festive Treasury Hampers',
    intro:
      'Curated presentation chests combining certified bullion with consecrated artefacts.\nDesigned for prestigious corporate gifting, auspicious weddings, and celebratory milestones.',
    purityOptions: ['Gold & Silver Sets', 'Silver Keepsakes'],
  },
};

const CATEGORY_BANNERS: Record<string, string> = {
  bullion: '/banners/banner-gold.jpg',
  gold: '/banners/banner-gold.jpg',
  silver: '/banners/banner-silver.jpg',
  gemstones: '/banners/banner-gemstones.jpg',
  'coloured-stones': '/banners/banner-cstone.jpg',
  rudraksha: '/banners/banner-rudraksha.jpg',
  gifting: '/banners/banner-gifting.jpg',
};

export const CategoryPage: React.FC = () => {
  const { category = 'gold' } = useParams<{ category: string }>();
  const { products, rates, pricingConfig } = useAppStore();

  const meta = CATEGORY_META[category] || {
    title: `${category.charAt(0).toUpperCase() + category.slice(1)} Collection`,
    intro: 'Explore certified precious metals, fine jewellery, and authentic artefacts.\nFull assay documentation and insured courier fulfillment included.',
    purityOptions: [],
  };

  useSEO({
    title: meta.title,
    description: meta.intro.replace('\n', ' '),
    canonicalPath: `/c/${category}`,
  });

  // Comprehensive Filter State
  const [filters, setFilters] = useState<FilterState>({
    priceRange: null,
    weightRange: null,
    metal: null,
    purity: null,
    stoneType: null,
    mukhi: null,
    origin: null,
    occasion: null,
    inStockOnly: false,
    minRating4: false,
    personalizationOnly: false,
    hasOfferOnly: false,
    pincode: '',
  });

  // Sort State
  const [sortBy, setSortBy] = useState<'popularity' | 'price-asc' | 'price-desc' | 'newest' | 'rating'>('popularity');

  // Mobile Bottom Sheet Filter State
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Compare State
  const [compareList, setCompareList] = useState<string[]>([]);
  const [compareModalOpen, setCompareModalOpen] = useState(false);
  const [collectorTab, setCollectorTab] = useState<'reviews' | 'qa'>('reviews');

  // PIN delivery verification
  const pincodeResult = useMemo(() => {
    const pin = filters.pincode.trim();
    if (!pin) return null;
    if (pin.length !== 6 || !/^\d{6}$/.test(pin)) {
      return { status: 'invalid', message: 'Enter a valid 6-digit Indian PIN code.' };
    }
    if (pin.startsWith('9')) {
      return {
        status: 'unsupported',
        message: `Armoured logistics not serviceable for PIN ${pin}. Please choose showroom pickup or an alternative address.`,
      };
    }
    return {
      status: 'serviceable',
      message: `PIN ${pin} is serviceable via Sequel/BVC Armoured Logistics. Estimated delivery: 2–4 business days.`,
    };
  }, [filters.pincode]);

  // Filter logic
  const filteredProducts = useMemo(() => {
    // 1. Filter by category
    let list = products.filter((p) =>
      category === 'bullion'
        ? p.category === 'gold' || p.category === 'silver' || p.type === 'rateLinked'
        : p.category === category
    );

    // 2. Filter by in stock
    if (filters.inStockOnly) {
      list = list.filter((p) => p.stock - p.reserved > 0);
    }

    // 3. Filter by price range
    if (filters.priceRange) {
      list = list.filter((p) => {
        const total = calculatePrice(p, rates, pricingConfig).total;
        if (filters.priceRange === 'under-25k') return total < 25000;
        if (filters.priceRange === '25k-100k') return total >= 25000 && total <= 100000;
        if (filters.priceRange === '100k-300k') return total > 100000 && total <= 300000;
        if (filters.priceRange === 'above-300k') return total > 300000;
        return true;
      });
    }

    // 4. Filter by weight range
    if (filters.weightRange) {
      list = list.filter((p) => {
        const wt = p.netWeightG;
        if (filters.weightRange === 'under-10g') return wt < 10;
        if (filters.weightRange === '10g-50g') return wt >= 10 && wt <= 50;
        if (filters.weightRange === 'above-50g') return wt > 50;
        return true;
      });
    }

    // 5. Filter by metal
    if (filters.metal) {
      list = list.filter((p) =>
        p.metal?.toLowerCase().includes(filters.metal!.toLowerCase()) ||
        p.category === filters.metal!.toLowerCase()
      );
    }

    // 6. Filter by purity
    if (filters.purity) {
      list = list.filter((p) => {
        if (filters.purity === '24k') return p.purity >= 0.999;
        if (filters.purity === '22k') return p.purity >= 0.916 && p.purity < 0.999;
        if (filters.purity === '999') return p.purity >= 0.99;
        return true;
      });
    }

    // 7. Filter by stone type
    if (filters.stoneType) {
      list = list.filter((p) =>
        p.attributes.gemstone?.variety.toLowerCase().includes(filters.stoneType!.toLowerCase()) ||
        p.name.toLowerCase().includes(filters.stoneType!.toLowerCase())
      );
    }

    // 8. Filter by rudraksh mukhi
    if (filters.mukhi) {
      list = list.filter((p) =>
        String(p.attributes.rudraksha?.mukhi || '') === filters.mukhi ||
        p.name.includes(`${filters.mukhi} Mukhi`)
      );
    }

    // 9. Filter by origin
    if (filters.origin) {
      list = list.filter((p) =>
        (p.origin && p.origin.toLowerCase().includes(filters.origin!.toLowerCase())) ||
        (p.attributes.gemstone?.origin && p.attributes.gemstone.origin.toLowerCase().includes(filters.origin!.toLowerCase())) ||
        (p.attributes.rudraksha?.provenance && p.attributes.rudraksha.provenance.toLowerCase().includes(filters.origin!.toLowerCase()))
      );
    }

    // 10. Filter by occasion
    if (filters.occasion) {
      const occLower = filters.occasion.toLowerCase();
      list = list.filter((p) =>
        p.tags?.some((t) => t.toLowerCase().includes(occLower)) ||
        p.name.toLowerCase().includes(occLower) ||
        p.description.toLowerCase().includes(occLower)
      );
    }

    // 11. Filter by rating (4+ stars)
    if (filters.minRating4) {
      list = list.filter((p) => (p.rating || 4.9) >= 4.0);
    }

    // 12. Filter by personalization eligibility
    if (filters.personalizationOnly) {
      list = list.filter((p) => p.personalizationEligible === true);
    }

    // 13. Filter by offer / discount
    if (filters.hasOfferOnly) {
      list = list.filter((p) => {
        const total = calculatePrice(p, rates, pricingConfig).total;
        return p.mrp > total;
      });
    }

    // Sort
    return [...list].sort((a, b) => {
      const priceA = calculatePrice(a, rates, pricingConfig).total;
      const priceB = calculatePrice(b, rates, pricingConfig).total;

      if (sortBy === 'price-asc') return priceA - priceB;
      if (sortBy === 'price-desc') return priceB - priceA;
      if (sortBy === 'newest') return b.id.localeCompare(a.id);
      if (sortBy === 'rating') return (b.rating || 4.9) - (a.rating || 4.9);
      // Popularity (higher stock or default)
      return b.stock - a.stock;
    });
  }, [products, category, filters, sortBy, rates, pricingConfig]);

  // Pagination calculation
  const totalItems = filteredProducts.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage) || 1;
  const paginatedProducts = filteredProducts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Clear all filters
  const handleClearFilters = () => {
    setFilters({
      priceRange: null,
      weightRange: null,
      metal: null,
      purity: null,
      stoneType: null,
      mukhi: null,
      origin: null,
      occasion: null,
      inStockOnly: false,
      minRating4: false,
      personalizationOnly: false,
      hasOfferOnly: false,
      pincode: '',
    });
    setCurrentPage(1);
  };

  const hasActiveFilters =
    filters.priceRange !== null ||
    filters.weightRange !== null ||
    filters.metal !== null ||
    filters.purity !== null ||
    filters.stoneType !== null ||
    filters.mukhi !== null ||
    filters.origin !== null ||
    filters.occasion !== null ||
    filters.inStockOnly ||
    filters.minRating4 ||
    filters.personalizationOnly ||
    filters.hasOfferOnly ||
    filters.pincode !== '';

  const recentlyViewedProducts = useMemo(
    () => products.slice(0, 3),
    [products]
  );

  return (
    <div className="space-y-8">
      {/* Breadcrumbs */}
      <nav aria-label="Breadcrumb" className="text-xs text-[#7A6A55] flex items-center gap-1.5 flex-wrap">
        <Link to="/" className="hover:text-[#C9A24B]">Home</Link>
        <ChevronRight className="w-3.5 h-3.5 text-[#EADFC8]" />
        <span>Collections</span>
        <ChevronRight className="w-3.5 h-3.5 text-[#EADFC8]" />
        <span className="text-[#5A4630] font-medium capitalize">{category.replace('-', ' ')}</span>
      </nav>

      {/* Category Hero Visual Banner */}
      <div className="relative rounded-2xl border border-[#EADFC8] overflow-hidden bg-[#FAF6EE] shadow-[0_4px_20px_rgba(90,70,48,0.06)] min-h-[190px] sm:min-h-[220px] flex items-center">
        {/* Right side category photo */}
        <div className="absolute top-0 right-0 bottom-0 w-full sm:w-[50%] md:w-[45%] pointer-events-none select-none overflow-hidden">
          <img
            src={CATEGORY_BANNERS[category] || '/banners/banner-gold.jpg'}
            alt={meta.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#FAF6EE] via-[#FAF6EE]/85 sm:via-[#FAF6EE]/60 to-transparent" />
        </div>

        {/* Left side text content */}
        <div className="relative z-10 p-6 sm:p-8 md:p-10 max-w-xl space-y-2.5">
          <Badge variant="gold" size="sm">Authentic Certified Collection</Badge>
          <h1 className="font-serif text-2xl sm:text-3xl md:text-4xl font-bold text-[#5A4630] leading-tight">
            {meta.title}
          </h1>
          <p className="text-xs sm:text-sm text-[#7A6A55] whitespace-pre-line leading-relaxed">
            {meta.intro}
          </p>
        </div>
      </div>

      {/* Active Filter Chips & Controls Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Results Count & Filter Chips */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs text-[#7A6A55] font-medium">
            Showing <strong>{filteredProducts.length}</strong> {filteredProducts.length === 1 ? 'piece' : 'pieces'}
          </span>

          {hasActiveFilters && (
            <>
              <span className="text-[#EADFC8]">|</span>
              {filters.inStockOnly && (
                <Chip
                  label="In Stock Only"
                  active
                  onRemove={() => setFilters({ ...filters, inStockOnly: false })}
                />
              )}
              {filters.priceRange && (
                <Chip
                  label={`Price: ${
                    filters.priceRange === 'under-25k'
                      ? 'Under ₹25k'
                      : filters.priceRange === '25k-100k'
                      ? '₹25k - ₹100k'
                      : filters.priceRange === '100k-300k'
                      ? '₹100k - ₹300k'
                      : 'Above ₹300k'
                  }`}
                  active
                  onRemove={() => setFilters({ ...filters, priceRange: null })}
                />
              )}
              {filters.weightRange && (
                <Chip
                  label={`Weight: ${
                    filters.weightRange === 'under-10g'
                      ? 'Under 10g'
                      : filters.weightRange === '10g-50g'
                      ? '10g - 50g'
                      : 'Above 50g'
                  }`}
                  active
                  onRemove={() => setFilters({ ...filters, weightRange: null })}
                />
              )}
              {filters.metal && (
                <Chip
                  label={`Metal: ${filters.metal}`}
                  active
                  onRemove={() => setFilters({ ...filters, metal: null })}
                />
              )}
              {filters.purity && (
                <Chip
                  label={`Purity: ${filters.purity.toUpperCase()}`}
                  active
                  onRemove={() => setFilters({ ...filters, purity: null })}
                />
              )}
              {filters.stoneType && (
                <Chip
                  label={`Stone: ${filters.stoneType}`}
                  active
                  onRemove={() => setFilters({ ...filters, stoneType: null })}
                />
              )}
              {filters.mukhi && (
                <Chip
                  label={`${filters.mukhi} Mukhi`}
                  active
                  onRemove={() => setFilters({ ...filters, mukhi: null })}
                />
              )}
              {filters.origin && (
                <Chip
                  label={`Origin: ${filters.origin}`}
                  active
                  onRemove={() => setFilters({ ...filters, origin: null })}
                />
              )}
              {filters.occasion && (
                <Chip
                  label={`Occasion: ${filters.occasion}`}
                  active
                  onRemove={() => setFilters({ ...filters, occasion: null })}
                />
              )}
              {filters.minRating4 && (
                <Chip
                  label="Rating: 4.0+"
                  active
                  onRemove={() => setFilters({ ...filters, minRating4: false })}
                />
              )}
              {filters.personalizationOnly && (
                <Chip
                  label="Laser Engravable"
                  active
                  onRemove={() => setFilters({ ...filters, personalizationOnly: false })}
                />
              )}
              {filters.hasOfferOnly && (
                <Chip
                  label="Special Offers"
                  active
                  onRemove={() => setFilters({ ...filters, hasOfferOnly: false })}
                />
              )}
              {filters.pincode && (
                <Chip
                  label={`PIN: ${filters.pincode}`}
                  active
                  onRemove={() => setFilters({ ...filters, pincode: '' })}
                />
              )}
              <button
                type="button"
                onClick={handleClearFilters}
                className="text-xs text-[#C9A24B] hover:underline font-medium ml-1"
              >
                Clear all
              </button>
            </>
          )}
        </div>

        {/* Filter Toggle (Mobile) & Sort Selector */}
        <div className="flex items-center gap-3">
          <Button
            variant="secondary"
            size="sm"
            className="md:hidden"
            onClick={() => setMobileFilterOpen(true)}
            leftIcon={<SlidersHorizontal className="w-3.5 h-3.5" />}
          >
            Filters {hasActiveFilters && '•'}
          </Button>

          <div className="flex items-center gap-2 text-xs">
            <span className="text-[#7A6A55] hidden sm:inline">Sort by:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              aria-label="Sort products"
              className="bg-white border border-[#EADFC8] rounded-md px-2.5 py-1.5 text-xs text-[#5A4630] font-medium focus:outline-none focus:ring-1 focus:ring-[#C9A24B]"
            >
              <option value="popularity">Relevance & Popularity</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="newest">Newest Arrivals</option>
              <option value="rating">Customer Rating</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Layout: Desktop Sidebar Filters + Product Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* Desktop Sidebar Filters */}
        <aside className="hidden md:block space-y-6">
          <div className="p-5 bg-white border border-[#EADFC8] rounded-[12px] space-y-5 shadow-xs">
            <div className="flex items-center justify-between pb-3 border-b border-[#EADFC8]">
              <span className="text-xs font-bold text-[#5A4630] uppercase tracking-wider flex items-center gap-1.5">
                <Filter className="w-3.5 h-3.5 text-[#C9A24B]" />
                Filter Facets
              </span>
              {hasActiveFilters && (
                <button
                  onClick={handleClearFilters}
                  className="text-xs text-[#C9A24B] hover:underline"
                >
                  Reset all
                </button>
              )}
            </div>

            {/* In Stock & Toggles */}
            <div className="space-y-2">
              <label className="flex items-center gap-2.5 text-xs text-[#5A4630] cursor-pointer">
                <input
                  type="checkbox"
                  checked={filters.inStockOnly}
                  onChange={(e) => {
                    setFilters({ ...filters, inStockOnly: e.target.checked });
                    setCurrentPage(1);
                  }}
                  className="rounded text-[#C9A24B] focus:ring-[#C9A24B] border-[#EADFC8]"
                />
                <span className="font-medium">In Stock Only</span>
              </label>

              <label className="flex items-center gap-2.5 text-xs text-[#5A4630] cursor-pointer">
                <input
                  type="checkbox"
                  checked={filters.minRating4}
                  onChange={(e) => {
                    setFilters({ ...filters, minRating4: e.target.checked });
                    setCurrentPage(1);
                  }}
                  className="rounded text-[#C9A24B] focus:ring-[#C9A24B] border-[#EADFC8]"
                />
                <span className="font-medium">4.0+ Stars Rated</span>
              </label>

              <label className="flex items-center gap-2.5 text-xs text-[#5A4630] cursor-pointer">
                <input
                  type="checkbox"
                  checked={filters.personalizationOnly}
                  onChange={(e) => {
                    setFilters({ ...filters, personalizationOnly: e.target.checked });
                    setCurrentPage(1);
                  }}
                  className="rounded text-[#C9A24B] focus:ring-[#C9A24B] border-[#EADFC8]"
                />
                <span className="font-medium">Laser Engravable</span>
              </label>

              <label className="flex items-center gap-2.5 text-xs text-[#5A4630] cursor-pointer">
                <input
                  type="checkbox"
                  checked={filters.hasOfferOnly}
                  onChange={(e) => {
                    setFilters({ ...filters, hasOfferOnly: e.target.checked });
                    setCurrentPage(1);
                  }}
                  className="rounded text-[#C9A24B] focus:ring-[#C9A24B] border-[#EADFC8]"
                />
                <span className="font-medium">Special Offers / Discounted</span>
              </label>
            </div>

            {/* Delivery PIN Code Checker Filter */}
            <div className="space-y-2 pt-3 border-t border-[#EADFC8]">
              <span className="text-xs font-semibold text-[#5A4630] flex items-center gap-1.5">
                <Truck className="w-3.5 h-3.5 text-[#C9A24B]" />
                Delivery PIN Code
              </span>
              <div className="flex gap-1.5">
                <input
                  type="text"
                  maxLength={6}
                  placeholder="e.g. 400001"
                  value={filters.pincode}
                  onChange={(e) => setFilters({ ...filters, pincode: e.target.value.replace(/\D/g, '') })}
                  className="w-full text-xs px-2.5 py-1.5 bg-[#FFFBF3] border border-[#EADFC8] rounded-md text-[#5A4630] focus:outline-none focus:ring-1 focus:ring-[#C9A24B]"
                />
                {filters.pincode && (
                  <button
                    type="button"
                    onClick={() => setFilters({ ...filters, pincode: '' })}
                    className="p-1 text-[#7A6A55] hover:text-[#5A4630]"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
              {pincodeResult && (
                <div
                  className={`text-[11px] p-2 rounded-md leading-snug border ${
                    pincodeResult.status === 'serviceable'
                      ? 'bg-[#E8F5E9] text-[#2D5A27] border-[#C8E6C9]'
                      : pincodeResult.status === 'unsupported'
                      ? 'bg-[#FFEBEE] text-[#C62828] border-[#FFCDD2]'
                      : 'bg-[#FFF8E1] text-[#F57F17] border-[#FFE082]'
                  }`}
                >
                  {pincodeResult.status === 'serviceable' && <CheckCircle2 className="w-3 h-3 inline mr-1" />}
                  {pincodeResult.status === 'unsupported' && <AlertTriangle className="w-3 h-3 inline mr-1" />}
                  <span>{pincodeResult.message}</span>
                </div>
              )}
            </div>

            {/* Price Range Filter */}
            <div className="space-y-2 pt-3 border-t border-[#EADFC8]">
              <span className="text-xs font-semibold text-[#5A4630]">Price Range</span>
              <div className="space-y-1.5 text-xs">
                {[
                  { id: null, label: 'All Prices' },
                  { id: 'under-25k', label: 'Under ₹25,000' },
                  { id: '25k-100k', label: '₹25,000 – ₹1,00,000' },
                  { id: '100k-300k', label: '₹1,00,000 – ₹3,00,000' },
                  { id: 'above-300k', label: 'Above ₹3,00,000' },
                ].map((opt) => (
                  <label key={String(opt.id)} className="flex items-center gap-2 text-[#7A6A55] cursor-pointer">
                    <input
                      type="radio"
                      name="desktopPrice"
                      checked={filters.priceRange === opt.id}
                      onChange={() => {
                        setFilters({ ...filters, priceRange: opt.id });
                        setCurrentPage(1);
                      }}
                      className="text-[#C9A24B] focus:ring-[#C9A24B]"
                    />
                    <span>{opt.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Metal Filter */}
            <div className="space-y-2 pt-3 border-t border-[#EADFC8]">
              <span className="text-xs font-semibold text-[#5A4630]">Precious Metal</span>
              <div className="space-y-1.5 text-xs">
                {[
                  { id: null, label: 'All Metals' },
                  { id: 'Gold', label: 'Sovereign Gold' },
                  { id: 'Silver', label: '999 Fine Silver' },
                ].map((opt) => (
                  <label key={String(opt.id)} className="flex items-center gap-2 text-[#7A6A55] cursor-pointer">
                    <input
                      type="radio"
                      name="desktopMetal"
                      checked={filters.metal === opt.id}
                      onChange={() => {
                        setFilters({ ...filters, metal: opt.id });
                        setCurrentPage(1);
                      }}
                      className="text-[#C9A24B] focus:ring-[#C9A24B]"
                    />
                    <span>{opt.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Purity Filter */}
            <div className="space-y-2 pt-3 border-t border-[#EADFC8]">
              <span className="text-xs font-semibold text-[#5A4630]">Purity / Fineness</span>
              <div className="space-y-1.5 text-xs">
                {[
                  { id: null, label: 'All Purities' },
                  { id: '24k', label: '24K (999.9 Pure)' },
                  { id: '22k', label: '22K (916 Hallmark)' },
                  { id: '999', label: '999 Fine Silver' },
                ].map((opt) => (
                  <label key={String(opt.id)} className="flex items-center gap-2 text-[#7A6A55] cursor-pointer">
                    <input
                      type="radio"
                      name="desktopPurity"
                      checked={filters.purity === opt.id}
                      onChange={() => {
                        setFilters({ ...filters, purity: opt.id });
                        setCurrentPage(1);
                      }}
                      className="text-[#C9A24B] focus:ring-[#C9A24B]"
                    />
                    <span>{opt.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Weight Range Filter */}
            <div className="space-y-2 pt-3 border-t border-[#EADFC8]">
              <span className="text-xs font-semibold text-[#5A4630]">Weight Range</span>
              <div className="space-y-1.5 text-xs">
                {[
                  { id: null, label: 'All Weights' },
                  { id: 'under-10g', label: 'Under 10 grams' },
                  { id: '10g-50g', label: '10g – 50 grams' },
                  { id: 'above-50g', label: 'Above 50 grams' },
                ].map((opt) => (
                  <label key={String(opt.id)} className="flex items-center gap-2 text-[#7A6A55] cursor-pointer">
                    <input
                      type="radio"
                      name="desktopWeight"
                      checked={filters.weightRange === opt.id}
                      onChange={() => {
                        setFilters({ ...filters, weightRange: opt.id });
                        setCurrentPage(1);
                      }}
                      className="text-[#C9A24B] focus:ring-[#C9A24B]"
                    />
                    <span>{opt.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Gemstone Stone Type Filter */}
            {(category === 'gemstones' || category === 'coloured-stones') && (
              <div className="space-y-2 pt-3 border-t border-[#EADFC8]">
                <span className="text-xs font-semibold text-[#5A4630]">Gemstone Variety</span>
                <div className="space-y-1.5 text-xs">
                  {[
                    { id: null, label: 'All Varieties' },
                    { id: 'Ruby', label: 'Burmese Ruby' },
                    { id: 'Emerald', label: 'Colombian Emerald' },
                    { id: 'Sapphire', label: 'Ceylon Sapphire' },
                    { id: 'Pearl', label: 'Saltwater Pearl' },
                  ].map((opt) => (
                    <label key={String(opt.id)} className="flex items-center gap-2 text-[#7A6A55] cursor-pointer">
                      <input
                        type="radio"
                        name="desktopStone"
                        checked={filters.stoneType === opt.id}
                        onChange={() => {
                          setFilters({ ...filters, stoneType: opt.id });
                          setCurrentPage(1);
                        }}
                        className="text-[#C9A24B] focus:ring-[#C9A24B]"
                      />
                      <span>{opt.label}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {/* Rudraksh Mukhi Filter */}
            {category === 'rudraksha' && (
              <div className="space-y-2 pt-3 border-t border-[#EADFC8]">
                <span className="text-xs font-semibold text-[#5A4630]">Mukhi Count</span>
                <div className="space-y-1.5 text-xs">
                  {[
                    { id: null, label: 'All Mukhi Furrows' },
                    { id: '1', label: '1 Mukhi (Eka Mukhi)' },
                    { id: '5', label: '5 Mukhi (Pancha Mukhi)' },
                    { id: '7', label: '7 Mukhi (Sapta Mukhi)' },
                  ].map((opt) => (
                    <label key={String(opt.id)} className="flex items-center gap-2 text-[#7A6A55] cursor-pointer">
                      <input
                        type="radio"
                        name="desktopMukhi"
                        checked={filters.mukhi === opt.id}
                        onChange={() => {
                          setFilters({ ...filters, mukhi: opt.id });
                          setCurrentPage(1);
                        }}
                        className="text-[#C9A24B] focus:ring-[#C9A24B]"
                      />
                      <span>{opt.label}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {/* Origin Facet */}
            <div className="space-y-2 pt-3 border-t border-[#EADFC8]">
              <span className="text-xs font-semibold text-[#5A4630]">Geographic Origin</span>
              <div className="space-y-1.5 text-xs">
                {[
                  { id: null, label: 'All Provenances' },
                  { id: 'India', label: 'India (MMTC-PAMP / Refineries)' },
                  { id: 'Burma', label: 'Mogok Burma' },
                  { id: 'Colombia', label: 'Muzo Colombia' },
                  { id: 'Ceylon', label: 'Ceylon Sri Lanka' },
                  { id: 'Nepal', label: 'Himalayan Nepal' },
                ].map((opt) => (
                  <label key={String(opt.id)} className="flex items-center gap-2 text-[#7A6A55] cursor-pointer">
                    <input
                      type="radio"
                      name="desktopOrigin"
                      checked={filters.origin === opt.id}
                      onChange={() => {
                        setFilters({ ...filters, origin: opt.id });
                        setCurrentPage(1);
                      }}
                      className="text-[#C9A24B] focus:ring-[#C9A24B]"
                    />
                    <span>{opt.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Occasion Facet */}
            <div className="space-y-2 pt-3 border-t border-[#EADFC8]">
              <span className="text-xs font-semibold text-[#5A4630]">Gifting & Auspicious Occasion</span>
              <div className="space-y-1.5 text-xs">
                {[
                  { id: null, label: 'All Occasions' },
                  { id: 'Wedding', label: 'Shaadi & Vivaha' },
                  { id: 'Diwali', label: 'Dhanteras & Diwali' },
                  { id: 'Akshaya', label: 'Akshaya Tritiya' },
                  { id: 'Corporate', label: 'Corporate Milestone' },
                  { id: 'Devotional', label: 'Temple & Devotional' },
                ].map((opt) => (
                  <label key={String(opt.id)} className="flex items-center gap-2 text-[#7A6A55] cursor-pointer">
                    <input
                      type="radio"
                      name="desktopOccasion"
                      checked={filters.occasion === opt.id}
                      onChange={() => {
                        setFilters({ ...filters, occasion: opt.id });
                        setCurrentPage(1);
                      }}
                      className="text-[#C9A24B] focus:ring-[#C9A24B]"
                    />
                    <span>{opt.label}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        </aside>

        {/* Product Grid Area */}
        <div className="md:col-span-3 space-y-8">
          {filteredProducts.length === 0 ? (
            <EmptyState
              title="No Precious Pieces Found"
              description="No articles match your selected purity, weight, metal or price filter criteria. Try adjusting or clearing your filters."
              actionLabel="Clear All Filters"
              onAction={handleClearFilters}
            />
          ) : (
            <>
              {/* Compare Bar if any selected */}
              {compareList.length > 0 && (
                <div className="p-3 bg-[#F8EFD9] border border-[#C9A24B] rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-[#5A4630] shadow-sm animate-in fade-in duration-200">
                  <div className="flex items-center gap-2">
                    <Badge variant="gold" size="sm">Compare</Badge>
                    <span className="font-semibold">{compareList.length} of 3 articles selected</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="secondary" size="sm" onClick={() => setCompareList([])}>
                      Clear
                    </Button>
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => setCompareModalOpen(true)}
                      leftIcon={<Scale className="w-3.5 h-3.5" />}
                    >
                      Compare Specifications
                    </Button>
                  </div>
                </div>
              )}

              {/* Product Grid with Compare Checkbox */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {paginatedProducts.map((product) => (
                  <div key={product.id} className="flex flex-col space-y-2">
                    <ProductCard product={product} />
                    <div className="flex items-center justify-between px-1 text-[11px] text-[#7A6A55]">
                      <label htmlFor={`comp-${product.id}`} className="flex items-center gap-1.5 cursor-pointer select-none hover:text-[#5A4630] font-medium">
                        <input
                          type="checkbox"
                          id={`comp-${product.id}`}
                          checked={compareList.includes(product.id)}
                          disabled={!compareList.includes(product.id) && compareList.length >= 3}
                          onChange={() => {
                            setCompareList((prev) =>
                              prev.includes(product.id)
                                ? prev.filter((id) => id !== product.id)
                                : prev.length < 3
                                ? [...prev, product.id]
                                : prev
                            );
                          }}
                          className="rounded text-[#C9A24B] focus:ring-[#C9A24B] w-3.5 h-3.5 cursor-pointer disabled:opacity-40"
                        />
                        <span>Compare Specs</span>
                      </label>
                      <span className="text-[10px] text-[#7A6A55] font-mono">
                        {product.purity >= 0.99 ? '999.9 Pure' : `${(product.purity * 100).toFixed(0)}% Hallmark`}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 pt-6 border-t border-[#EADFC8]">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  >
                    Previous
                  </Button>

                  <div className="flex items-center gap-1 text-xs">
                    {Array.from({ length: totalPages }).map((_, idx) => {
                      const pNum = idx + 1;
                      return (
                        <button
                          key={pNum}
                          onClick={() => setCurrentPage(pNum)}
                          className={`w-8 h-8 rounded-md font-medium text-xs transition-colors ${
                            currentPage === pNum
                              ? 'bg-[#C9A24B] text-white'
                              : 'bg-white border border-[#EADFC8] text-[#5A4630] hover:bg-[#F8EFD9]'
                          }`}
                        >
                          {pNum}
                        </button>
                      );
                    })}
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  >
                    Next
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Compare Modal Drawer */}
      <CompareDrawer
        isOpen={compareModalOpen}
        onClose={() => setCompareModalOpen(false)}
        productIds={compareList}
        onRemove={(id) => setCompareList((prev) => prev.filter((x) => x !== id))}
        onClear={() => {
          setCompareList([]);
          setCompareModalOpen(false);
        }}
      />

      {/* Recently Viewed Row */}
      {recentlyViewedProducts.length > 0 && (
        <section className="pt-8 border-t border-[#EADFC8] space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-[#C9A24B]" />
              <h2 className="font-serif text-xl font-bold text-[#5A4630]">
                Recently Viewed Articles
              </h2>
            </div>
            <span className="text-xs text-[#7A6A55]">Session browsing history</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {recentlyViewedProducts.map((p) => (
              <ProductCard key={`recent-${p.id}`} product={p} />
            ))}
          </div>
        </section>
      )}

      {/* Reviews and Q&A Section */}
      <section className="pt-8 border-t border-[#EADFC8] space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setCollectorTab('reviews')}
              className={`pb-2 text-sm font-bold transition-all border-b-2 flex items-center gap-2 ${
                collectorTab === 'reviews'
                  ? 'border-[#C9A24B] text-[#5A4630]'
                  : 'border-transparent text-[#7A6A55] hover:text-[#5A4630]'
              }`}
            >
              <Star className="w-4 h-4 text-[#C9A24B]" />
              <span>Verified Investor Reviews (4.9 / 5.0)</span>
            </button>
            <button
              type="button"
              onClick={() => setCollectorTab('qa')}
              className={`pb-2 text-sm font-bold transition-all border-b-2 flex items-center gap-2 ${
                collectorTab === 'qa'
                  ? 'border-[#C9A24B] text-[#5A4630]'
                  : 'border-transparent text-[#7A6A55] hover:text-[#5A4630]'
              }`}
            >
              <MessageSquare className="w-4 h-4 text-[#C9A24B]" />
              <span>Astrological & Bullion Q&A</span>
            </button>
          </div>
          <span className="text-xs text-[#7A6A55]">Updated daily with client feedback</span>
        </div>

        {collectorTab === 'reviews' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-white border border-[#EADFC8] rounded-xl space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1 text-[#BA8332]">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-3.5 h-3.5 fill-[#BA8332]" />
                  ))}
                </div>
                <Badge variant="sage" size="sm">Verified Buyer</Badge>
              </div>
              <p className="text-xs text-[#5A4630] font-semibold">
                "Flawless assay packaging and certified exact grammage"
              </p>
              <p className="text-xs text-[#7A6A55] leading-relaxed">
                Received the bullion coin in tamper-evident sealed assay certicard. Courier transit was fully insured via Sequel logistics with double OTP confirmation.
              </p>
              <div className="text-[11px] text-[#7A6A55] pt-1 border-t border-[#EADFC8]/60 flex items-center justify-between">
                <span>Raghavendra S., Mumbai</span>
                <span>Verified High-Value Investor</span>
              </div>
            </div>

            <div className="p-4 bg-white border border-[#EADFC8] rounded-xl space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1 text-[#BA8332]">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-3.5 h-3.5 fill-[#BA8332]" />
                  ))}
                </div>
                <Badge variant="sage" size="sm">Verified Buyer</Badge>
              </div>
              <p className="text-xs text-[#5A4630] font-semibold">
                "Unheated gemstone with valid GIA certifiable barcode"
              </p>
              <p className="text-xs text-[#7A6A55] leading-relaxed">
                The optical dispersion and vivid pigeon blood tone matched the lab certificate specifications accurately. Appreciate the transparency in pricing.
              </p>
              <div className="text-[11px] text-[#7A6A55] pt-1 border-t border-[#EADFC8]/60 flex items-center justify-between">
                <span>Dr. Ananya P., Bengaluru</span>
                <span>Gemstone Collector</span>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="p-4 bg-white border border-[#EADFC8] rounded-xl space-y-1">
              <h4 className="text-xs font-bold text-[#5A4630]">
                Q: How is purity verified for 999.9 sovereign bullion?
              </h4>
              <p className="text-xs text-[#7A6A55] leading-relaxed">
                A: Every coin and cast bar undergoes XRF spectrometry testing and is sealed in an individually serialised CertiCard with tamper-evident holograms and NABL-accredited assay credentials.
              </p>
            </div>

            <div className="p-4 bg-white border border-[#EADFC8] rounded-xl space-y-1">
              <h4 className="text-xs font-bold text-[#5A4630]">
                Q: Are the Nepali Rudraksha energized before dispatch?
              </h4>
              <p className="text-xs text-[#7A6A55] leading-relaxed">
                A: Yes. All sacred beads are botanically authenticated for natural Mukhi furrows and undergo traditional Vedic consecration at sacred Himalayan shrines.
              </p>
            </div>
          </div>
        )}
      </section>

      {/* Mobile Filters Bottom Sheet */}
      {mobileFilterOpen && (
        <div className="fixed inset-0 z-50 flex flex-col justify-end bg-[#5A4630]/30 backdrop-blur-xs md:hidden animate-in fade-in duration-200">
          <div className="fixed inset-0" onClick={() => setMobileFilterOpen(false)} />
          <div className="relative bg-[#FFFFFF] rounded-t-2xl p-6 border-t border-[#EADFC8] max-h-[85vh] overflow-y-auto space-y-6 shadow-2xl z-10">
            <div className="flex items-center justify-between pb-3 border-b border-[#EADFC8]">
              <h3 className="font-serif text-lg font-bold text-[#5A4630] flex items-center gap-2">
                <SlidersHorizontal className="w-4 h-4 text-[#C9A24B]" />
                Filter Pieces
              </h3>
              <button
                onClick={() => setMobileFilterOpen(false)}
                className="p-1 rounded-md text-[#7A6A55] hover:bg-[#F8EFD9]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* In stock and flags */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-xs font-medium text-[#5A4630]">
                <input
                  type="checkbox"
                  checked={filters.inStockOnly}
                  onChange={(e) => setFilters({ ...filters, inStockOnly: e.target.checked })}
                  className="rounded text-[#C9A24B]"
                />
                <span>In Stock Only</span>
              </label>

              <label className="flex items-center gap-2 text-xs font-medium text-[#5A4630]">
                <input
                  type="checkbox"
                  checked={filters.minRating4}
                  onChange={(e) => setFilters({ ...filters, minRating4: e.target.checked })}
                  className="rounded text-[#C9A24B]"
                />
                <span>4.0+ Stars Rated</span>
              </label>

              <label className="flex items-center gap-2 text-xs font-medium text-[#5A4630]">
                <input
                  type="checkbox"
                  checked={filters.personalizationOnly}
                  onChange={(e) => setFilters({ ...filters, personalizationOnly: e.target.checked })}
                  className="rounded text-[#C9A24B]"
                />
                <span>Laser Engravable</span>
              </label>
            </div>

            {/* Delivery PIN Code Mobile */}
            <div className="space-y-2">
              <span className="text-xs font-bold text-[#5A4630] uppercase">Delivery PIN Code</span>
              <input
                type="text"
                maxLength={6}
                placeholder="Enter 6-digit PIN"
                value={filters.pincode}
                onChange={(e) => setFilters({ ...filters, pincode: e.target.value.replace(/\D/g, '') })}
                className="w-full text-xs px-3 py-2 bg-[#FFFBF3] border border-[#EADFC8] rounded-md text-[#5A4630]"
              />
              {pincodeResult && (
                <div
                  className={`text-[11px] p-2 rounded-md ${
                    pincodeResult.status === 'serviceable'
                      ? 'bg-[#E8F5E9] text-[#2D5A27]'
                      : pincodeResult.status === 'unsupported'
                      ? 'bg-[#FFEBEE] text-[#C62828]'
                      : 'bg-[#FFF8E1] text-[#F57F17]'
                  }`}
                >
                  {pincodeResult.message}
                </div>
              )}
            </div>

            {/* Price Range Mobile */}
            <div className="space-y-2">
              <span className="text-xs font-bold text-[#5A4630] uppercase">Price Range</span>
              <div className="grid grid-cols-2 gap-2 text-xs">
                {[
                  { id: null, label: 'All Prices' },
                  { id: 'under-25k', label: 'Under ₹25k' },
                  { id: '25k-100k', label: '₹25k - ₹100k' },
                  { id: '100k-300k', label: '₹100k - ₹300k' },
                  { id: 'above-300k', label: 'Above ₹300k' },
                ].map((opt) => (
                  <button
                    key={String(opt.id)}
                    type="button"
                    onClick={() => setFilters({ ...filters, priceRange: opt.id })}
                    className={`p-2.5 rounded-lg border text-left text-xs font-medium ${
                      filters.priceRange === opt.id
                        ? 'bg-[#C9A24B] text-white border-[#C9A24B]'
                        : 'bg-[#FFFBF3] border-[#EADFC8] text-[#5A4630]'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-4 border-t border-[#EADFC8]">
              <Button
                variant="outline"
                className="flex-1"
                onClick={handleClearFilters}
              >
                Reset
              </Button>
              <Button
                variant="primary"
                className="flex-1"
                onClick={() => setMobileFilterOpen(false)}
              >
                Apply Filters
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
