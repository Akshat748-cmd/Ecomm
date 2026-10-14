import React, { useState, useMemo } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useAppStore } from '../store';
import { useSEO } from '../lib/useSEO';
import { calculatePrice } from '../lib/pricing';
import { ProductCard } from '../components/ProductCard';
import { Button } from '../components/Button';
import { Badge } from '../components/Badge';
import { Chip } from '../components/Chip';
import { EmptyState } from '../components/EmptyState';
import { Search, ChevronRight, Sparkles, TrendingUp } from 'lucide-react';

export const SearchPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  const { products, rates, pricingConfig } = useAppStore();

  useSEO({
    title: query ? `Search: "${query}"` : 'Search Luxury Catalogue',
    description: `Discover certified precious bullion, natural gemstones and consecrated Rudraksha matching "${query}".`,
    canonicalPath: `/search?q=${encodeURIComponent(query)}`,
  });

  const [inputVal, setInputVal] = useState(query);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [sortBy, setSortBy] = useState<'popularity' | 'price-asc' | 'price-desc'>('popularity');
  const [inStockOnly, setInStockOnly] = useState(false);
  const [priceRange, setPriceRange] = useState<string | null>(null);

  const staticSuggestions = [
    { query: '24K Gold Coin 10g', category: 'gold', count: '3 articles' },
    { query: '999 Fine Silver Bar 50g', category: 'silver', count: '2 articles' },
    { query: 'Burmese Ruby Natural', category: 'gemstones', count: '1 article' },
    { query: 'Muzo Emerald Collector', category: 'gemstones', count: '1 article' },
    { query: '5 Mukhi Nepali Rudraksha', category: 'rudraksha', count: '2 articles' },
    { query: 'Sovereign 22K Gold Chain', category: 'gold', count: '1 article' },
  ];

  // Search logic
  const searchResults = useMemo(() => {
    const qLower = query.toLowerCase().trim();
    if (!qLower) return products;

    return products.filter((p) => {
      const matchName = p.name.toLowerCase().includes(qLower);
      const matchDesc = p.description.toLowerCase().includes(qLower);
      const matchSku = p.sku.toLowerCase().includes(qLower);
      const matchCategory = p.category.toLowerCase().includes(qLower);
      const matchMetal = p.metal?.toLowerCase().includes(qLower);
      const matchOrigin = p.attributes.gemstone?.origin.toLowerCase().includes(qLower);
      const matchMukhi = String(p.attributes.rudraksha?.mukhi || '').toLowerCase().includes(qLower);

      return (
        matchName ||
        matchDesc ||
        matchSku ||
        matchCategory ||
        matchMetal ||
        matchOrigin ||
        matchMukhi
      );
    });
  }, [products, query]);

  // Apply filters and sort
  const filteredResults = useMemo(() => {
    let list = searchResults;

    if (inStockOnly) {
      list = list.filter((p) => p.stock - p.reserved > 0);
    }

    if (priceRange) {
      list = list.filter((p) => {
        const total = calculatePrice(p, rates, pricingConfig).total;
        if (priceRange === 'under-25k') return total < 25000;
        if (priceRange === '25k-100k') return total >= 25000 && total <= 100000;
        if (priceRange === 'above-100k') return total > 100000;
        return true;
      });
    }

    return [...list].sort((a, b) => {
      const priceA = calculatePrice(a, rates, pricingConfig).total;
      const priceB = calculatePrice(b, rates, pricingConfig).total;

      if (sortBy === 'price-asc') return priceA - priceB;
      if (sortBy === 'price-desc') return priceB - priceA;
      return b.stock - a.stock;
    });
  }, [searchResults, inStockOnly, priceRange, sortBy, rates, pricingConfig]);

  // Matched Categories
  const matchedCategories = useMemo(() => {
    const set = new Set<string>();
    searchResults.forEach((p) => set.add(p.category));
    return Array.from(set);
  }, [searchResults]);

  // "Did you mean..." fuzzy suggestions when empty or low results
  const fuzzySuggestions = useMemo(() => {
    if (searchResults.length > 0) return [];
    const vocabulary = [
      'Gold Coin',
      'Gold Bar',
      'Silver Bar',
      'Burmese Ruby',
      'Colombian Emerald',
      'Blue Sapphire',
      'Rudraksha Mala',
      'Ganesha Idol',
      'Puja Gift Hamper',
    ];
    const qLower = query.toLowerCase();
    return vocabulary.filter((term) =>
      term.toLowerCase().split(' ').some((word) => word.startsWith(qLower.slice(0, 3)))
    );
  }, [searchResults, query]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputVal.trim()) {
      setSearchParams({ q: inputVal.trim() });
    }
  };

  return (
    <div className="space-y-8">
      {/* Breadcrumb */}
      <nav aria-label="Breadcrumb" className="text-xs text-[#7A6A55] flex items-center gap-1.5 flex-wrap">
        <Link to="/" className="hover:text-[#C9A24B]">Home</Link>
        <ChevronRight className="w-3.5 h-3.5 text-[#EADFC8]" />
        <span>Search</span>
        {query && (
          <>
            <ChevronRight className="w-3.5 h-3.5 text-[#EADFC8]" />
            <span className="text-[#5A4630] font-medium font-mono">"{query}"</span>
          </>
        )}
      </nav>

      {/* Search Bar & Echoed Heading */}
      <div className="border-b border-[#EADFC8] pb-6 space-y-4">
        <div className="max-w-2xl">
          <h1 className="font-serif text-3xl sm:text-4xl font-bold text-[#5A4630]">
            {query ? `Search Results for "${query}"` : 'Search Precious Collections'}
          </h1>
          <p className="text-xs text-[#7A6A55] mt-1">
            Real-time bullion price calculations, laboratory certs, and authenticated specifications.
          </p>
        </div>

        {/* Input Bar with Proposed Autocomplete Dropdown */}
        <div className="relative max-w-xl">
          <form onSubmit={handleSearchSubmit} className="flex gap-2">
            <div className="relative flex-1">
              <input
                type="text"
                value={inputVal}
                onFocus={() => setShowSuggestions(true)}
                onChange={(e) => {
                  setInputVal(e.target.value);
                  setShowSuggestions(true);
                }}
                placeholder="Search by metal, purity, gemstone, or SKU..."
                aria-label="Search catalogue"
                className="w-full text-xs sm:text-sm pl-9 pr-4 py-2.5 bg-white border border-[#EADFC8] rounded-lg text-[#5A4630] focus:outline-none focus:ring-2 focus:ring-[#C9A24B]"
              />
              <Search className="w-4 h-4 text-[#7A6A55] absolute left-3 top-3.5" />
            </div>
            <Button type="submit" variant="primary" size="md">
              Search
            </Button>
          </form>

          {/* Autocomplete Dropdown (Proposed) */}
          {showSuggestions && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-[#EADFC8] rounded-xl shadow-lg z-30 p-3 space-y-2 animate-in fade-in duration-150">
              <div className="flex items-center justify-between pb-2 border-b border-[#EADFC8]">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-[#5A4630]">
                  <TrendingUp className="w-3.5 h-3.5 text-[#C9A24B]" />
                  <span>Popular Investor Searches</span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="neutral" size="sm">Proposed Feature</Badge>
                  <button
                    type="button"
                    onClick={() => setShowSuggestions(false)}
                    className="text-[11px] text-[#7A6A55] hover:text-[#5A4630]"
                  >
                    Close
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 pt-1">
                {staticSuggestions.map((item) => (
                  <button
                    key={item.query}
                    type="button"
                    onClick={() => {
                      setInputVal(item.query);
                      setSearchParams({ q: item.query });
                      setShowSuggestions(false);
                    }}
                    className="flex items-center justify-between p-2 rounded-lg hover:bg-[#F8EFD9] text-left transition-colors text-xs text-[#5A4630] group"
                  >
                    <div className="flex items-center gap-2">
                      <Search className="w-3.5 h-3.5 text-[#7A6A55] group-hover:text-[#C9A24B]" />
                      <span className="font-medium">{item.query}</span>
                    </div>
                    <span className="text-[10px] text-[#7A6A55]">{item.count}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Matched Category Quick Chips */}
        {matchedCategories.length > 0 && query && (
          <div className="flex items-center gap-2 pt-2 flex-wrap">
            <span className="text-xs text-[#7A6A55] font-medium">Matched Categories:</span>
            {matchedCategories.map((cat) => (
              <Link key={cat} to={`/c/${cat}`}>
                <Chip label={cat.replace('-', ' ').toUpperCase()} clickable />
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Results Controls Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="text-xs text-[#7A6A55]">
          Found <strong>{filteredResults.length}</strong> matching articles
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <label className="flex items-center gap-1.5 text-xs text-[#5A4630] cursor-pointer">
            <input
              type="checkbox"
              checked={inStockOnly}
              onChange={(e) => setInStockOnly(e.target.checked)}
              className="rounded text-[#C9A24B]"
            />
            <span>In Stock Only</span>
          </label>

          <select
            value={priceRange || ''}
            onChange={(e) => setPriceRange(e.target.value || null)}
            aria-label="Filter by price"
            className="bg-white border border-[#EADFC8] rounded-md px-2.5 py-1.5 text-xs text-[#5A4630]"
          >
            <option value="">All Prices</option>
            <option value="under-25k">Under ₹25,000</option>
            <option value="25k-100k">₹25,000 - ₹1,00,000</option>
            <option value="above-100k">Above ₹1,00,000</option>
          </select>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            aria-label="Sort by"
            className="bg-white border border-[#EADFC8] rounded-md px-2.5 py-1.5 text-xs text-[#5A4630]"
          >
            <option value="popularity">Sort: Popularity</option>
            <option value="price-asc">Sort: Price Low to High</option>
            <option value="price-desc">Sort: Price High to Low</option>
          </select>
        </div>
      </div>

      {/* Grid or Empty State with "Did you mean..." */}
      {filteredResults.length === 0 ? (
        <div className="space-y-6">
          <EmptyState
            title={`No results found for "${query}"`}
            description="We could not find any precious pieces matching your search query. Please verify the spelling or try broader keywords like 'gold', 'ruby', or 'silver'."
            actionLabel="Browse Gold Bullion"
            onAction={() => setSearchParams({ q: 'gold' })}
          />

          {fuzzySuggestions.length > 0 && (
            <div className="p-6 bg-[#FFFFFF] border border-[#EADFC8] rounded-[12px] text-center max-w-lg mx-auto space-y-3">
              <div className="flex items-center justify-center gap-1.5 text-xs font-semibold text-[#5A4630]">
                <Sparkles className="w-4 h-4 text-[#C9A24B]" />
                <span>Did you mean?</span>
              </div>
              <div className="flex flex-wrap items-center justify-center gap-2">
                {fuzzySuggestions.map((term) => (
                  <button
                    key={term}
                    onClick={() => {
                      setInputVal(term);
                      setSearchParams({ q: term });
                    }}
                    className="px-3 py-1 rounded-full text-xs font-medium bg-[#F8EFD9] hover:bg-[#F1E3BD] text-[#5A4630] border border-[#EADFC8] transition-colors cursor-pointer"
                  >
                    {term}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {filteredResults.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
};
