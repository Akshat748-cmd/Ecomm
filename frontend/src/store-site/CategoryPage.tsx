import React, { useState, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAppStore } from '../store';
import { useSEO } from '../lib/useSEO';
import { calculatePrice } from '../lib/pricing';
import { ProductCard } from '../components/ProductCard';
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
  Sparkles,
} from 'lucide-react';

interface FilterState {
  purity: string[];
  priceRange: string | null;
  weightRange: string | null;
  inStockOnly: boolean;
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
  gifting: {
    title: 'Precious Corporate & Festive Treasury Hampers',
    intro:
      'Curated presentation chests combining certified bullion with consecrated artefacts.\nDesigned for prestigious corporate gifting, auspicious weddings, and celebratory milestones.',
    purityOptions: ['Gold & Silver Sets', 'Silver Keepsakes'],
  },
};

const CATEGORY_BANNERS: Record<string, string> = {
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

  // Filter States
  const [filters, setFilters] = useState<FilterState>({
    purity: [],
    priceRange: null,
    weightRange: null,
    inStockOnly: false,
  });

  // Sort State
  const [sortBy, setSortBy] = useState<'popularity' | 'price-asc' | 'price-desc' | 'newest'>('popularity');

  // Mobile Bottom Sheet Filter State
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Proposed Features State
  const [compareList, setCompareList] = useState<string[]>([]);
  const [collectorTab, setCollectorTab] = useState<'reviews' | 'qa'>('reviews');

  // Filter logic
  const filteredProducts = useMemo(() => {
    // 1. Filter by category
    let list = products.filter((p) => p.category === category);

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

    // 5. Sort
    return [...list].sort((a, b) => {
      const priceA = calculatePrice(a, rates, pricingConfig).total;
      const priceB = calculatePrice(b, rates, pricingConfig).total;

      if (sortBy === 'price-asc') return priceA - priceB;
      if (sortBy === 'price-desc') return priceB - priceA;
      if (sortBy === 'newest') return b.id.localeCompare(a.id);
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
      purity: [],
      priceRange: null,
      weightRange: null,
      inStockOnly: false,
    });
    setCurrentPage(1);
  };

  const hasActiveFilters =
    filters.purity.length > 0 ||
    filters.priceRange !== null ||
    filters.weightRange !== null ||
    filters.inStockOnly;

  const recommendedProducts = useMemo(
    () => products.filter((p) => p.category !== category).slice(0, 3),
    [products, category]
  );

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
              <option value="popularity">Popularity / Availability</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="newest">Newest Arrivals</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Layout: Desktop Sidebar Filters + Product Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* Desktop Sidebar Filters */}
        <aside className="hidden md:block space-y-6">
          <div className="p-5 bg-white border border-[#EADFC8] rounded-[12px] space-y-6 shadow-xs">
            <div className="flex items-center justify-between pb-3 border-b border-[#EADFC8]">
              <span className="text-xs font-bold text-[#5A4630] uppercase tracking-wider flex items-center gap-1.5">
                <Filter className="w-3.5 h-3.5 text-[#C9A24B]" />
                Filters
              </span>
              {hasActiveFilters && (
                <button
                  onClick={handleClearFilters}
                  className="text-xs text-[#C9A24B] hover:underline"
                >
                  Reset
                </button>
              )}
            </div>

            {/* In Stock Toggle */}
            <div>
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
            </div>

            {/* Price Range Filter */}
            <div className="space-y-2">
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

            {/* Weight Range Filter */}
            <div className="space-y-2 pt-2 border-t border-[#EADFC8]">
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
          </div>
        </aside>

        {/* Product Grid Area */}
        <div className="md:col-span-3 space-y-8">
          {filteredProducts.length === 0 ? (
            <EmptyState
              title="No Precious Pieces Found"
              description="No articles match your selected purity, weight or price filter criteria. Try adjusting or clearing your filters."
              actionLabel="Clear All Filters"
              onAction={handleClearFilters}
            />
          ) : (
            <>
              {/* Compare Bar if any selected */}
              {compareList.length > 0 && (
                <div className="p-3 bg-[#F8EFD9] border border-[#C9A24B] rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-[#5A4630] shadow-sm animate-in fade-in duration-200">
                  <div className="flex items-center gap-2">
                    <Badge variant="gold" size="sm">Proposed Feature</Badge>
                    <span className="font-semibold">{compareList.length} items selected for side-by-side comparison</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="secondary" size="sm" onClick={() => setCompareList([])}>
                      Clear
                    </Button>
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => alert('Comparison Matrix is a Proposed Capability for Phase 2+.')}
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
                          onChange={() => {
                            setCompareList((prev) =>
                              prev.includes(product.id) ? prev.filter((id) => id !== product.id) : [...prev, product.id]
                            );
                          }}
                          className="rounded text-[#C9A24B] focus:ring-[#C9A24B] w-3.5 h-3.5 cursor-pointer"
                        />
                        <span>Compare Specs</span>
                      </label>
                      <Badge variant="neutral" size="sm">Proposed</Badge>
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

      {/* PROPOSED: Curated Recommendations Row */}
      {recommendedProducts.length > 0 && (
        <section className="pt-8 border-t border-[#EADFC8] space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#C9A24B]" />
              <h2 className="font-serif text-xl font-bold text-[#5A4630]">
                Curated Recommendations
              </h2>
              <Badge variant="neutral" size="sm">Proposed</Badge>
            </div>
            <span className="text-xs text-[#7A6A55]">Complements this collection</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {recommendedProducts.map((p) => (
              <ProductCard key={`rec-${p.id}`} product={p} />
            ))}
          </div>
        </section>
      )}

      {/* PROPOSED: Recently Viewed Row */}
      {recentlyViewedProducts.length > 0 && (
        <section className="pt-8 border-t border-[#EADFC8] space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-[#C9A24B]" />
              <h2 className="font-serif text-xl font-bold text-[#5A4630]">
                Recently Viewed Articles
              </h2>
              <Badge variant="neutral" size="sm">Proposed</Badge>
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

      {/* PROPOSED: Reviews and Q&A Tab */}
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
              <span>Verified Collector Reviews (4.9 / 5.0)</span>
              <Badge variant="neutral" size="sm">Proposed</Badge>
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
              <Badge variant="neutral" size="sm">Proposed</Badge>
            </button>
          </div>
          <span className="text-xs text-[#7A6A55]">Updated daily with client feedback</span>
        </div>

        {collectorTab === 'reviews' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-white border border-[#EADFC8] rounded-xl space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1 text-[#C9A24B]">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-3.5 h-3.5 fill-[#C9A24B]" />
                  ))}
                </div>
                <Badge variant="neutral" size="sm">Proposed</Badge>
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
                <div className="flex items-center gap-1 text-[#C9A24B]">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-3.5 h-3.5 fill-[#C9A24B]" />
                  ))}
                </div>
                <Badge variant="neutral" size="sm">Proposed</Badge>
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
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-[#5A4630]">
                  Q: How is purity verified for 999.9 sovereign bullion?
                </h4>
                <Badge variant="neutral" size="sm">Proposed</Badge>
              </div>
              <p className="text-xs text-[#7A6A55] leading-relaxed">
                A: Every coin and cast bar undergoes XRF spectrometry testing and is sealed in an individually serialised CertiCard with tamper-evident holograms and NABL-accredited assay credentials.
              </p>
            </div>

            <div className="p-4 bg-white border border-[#EADFC8] rounded-xl space-y-1">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-[#5A4630]">
                  Q: Are the Nepali Rudraksha energized before dispatch?
                </h4>
                <Badge variant="neutral" size="sm">Proposed</Badge>
              </div>
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

            {/* In stock */}
            <label className="flex items-center gap-2 text-xs font-medium text-[#5A4630]">
              <input
                type="checkbox"
                checked={filters.inStockOnly}
                onChange={(e) => setFilters({ ...filters, inStockOnly: e.target.checked })}
                className="rounded text-[#C9A24B]"
              />
              <span>In Stock Only</span>
            </label>

            {/* Price Range */}
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

            {/* Weight Range */}
            <div className="space-y-2">
              <span className="text-xs font-bold text-[#5A4630] uppercase">Weight Range</span>
              <div className="grid grid-cols-2 gap-2 text-xs">
                {[
                  { id: null, label: 'All Weights' },
                  { id: 'under-10g', label: 'Under 10g' },
                  { id: '10g-50g', label: '10g - 50g' },
                  { id: 'above-50g', label: 'Above 50g' },
                ].map((opt) => (
                  <button
                    key={String(opt.id)}
                    type="button"
                    onClick={() => setFilters({ ...filters, weightRange: opt.id })}
                    className={`p-2.5 rounded-lg border text-left text-xs font-medium ${
                      filters.weightRange === opt.id
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
