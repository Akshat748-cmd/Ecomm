import React, { useState, useEffect, useRef } from 'react';
import { Link, Outlet, useNavigate } from 'react-router-dom';
import { BRAND_NAME, BRAND_TAGLINE } from '../lib/constants';
import {
  ShieldCheck,
  Search,
  Heart,
  ShoppingBag,
  User,
  Menu,
  X,
  Bug,
  Lock,
  ChevronRight,
  TrendingUp,
  Globe,
  CheckCircle2,
  PhoneCall,
  Headphones,
} from 'lucide-react';
import { useAppStore } from '../store';
import { formatINR, formatDateTime, calculatePrice } from '../lib/pricing';
import { Modal } from '../components/Modal';
import { Button } from '../components/Button';

export const StoreLayout: React.FC = () => {
  const navigate = useNavigate();
  const { rates, isFeedStale, cart, wishlist, products, pricingConfig } = useAppStore();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [langMenuOpen, setLangMenuOpen] = useState(false);
  const [rateModalOpen, setRateModalOpen] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState<'en' | 'hi' | 'gu' | 'ta'>('en');

  const profileMenuRef = useRef<HTMLDivElement>(null);
  const langMenuRef = useRef<HTMLDivElement>(null);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  // Search state with autocomplete & recent searches
  const [searchQuery, setSearchQuery] = useState('');
  const [searchFocused, setSearchFocused] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([
    '10g 24K Gold Coin',
    'Burmese Ruby',
    'Lakshmi Ganesh 50g',
    '7 Mukhi Rudraksha',
  ]);

  // Newsletter state with explicit separate consent
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [newsletterConsent, setNewsletterConsent] = useState(false);
  const [newsletterSuccess, setNewsletterSuccess] = useState(false);

  // Close menus on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(e.target as Node)) {
        setProfileMenuOpen(false);
      }
      if (langMenuRef.current && !langMenuRef.current.contains(e.target as Node)) {
        setLangMenuOpen(false);
      }
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target as Node)) {
        setSearchFocused(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Rate flash on change
  const [hasFlashed, setHasFlashed] = useState(false);
  const prevRatesRef = useRef(rates);

  useEffect(() => {
    if (
      prevRatesRef.current.gold24k !== rates.gold24k ||
      prevRatesRef.current.silver999 !== rates.silver999
    ) {
      setHasFlashed(true);
      const timer = setTimeout(() => setHasFlashed(false), 900);
      prevRatesRef.current = rates;
      return () => clearTimeout(timer);
    }
  }, [rates]);

  const totalCartItems = cart.reduce((acc, item) => acc + item.quantity, 0);
  const totalWishlistItems = wishlist.length;

  const handleSearchSubmit = (e?: React.FormEvent, customQuery?: string) => {
    if (e) e.preventDefault();
    const queryToUse = customQuery || searchQuery;
    if (queryToUse.trim()) {
      if (!recentSearches.includes(queryToUse.trim())) {
        setRecentSearches((prev) => [queryToUse.trim(), ...prev.slice(0, 4)]);
      }
      navigate(`/search?q=${encodeURIComponent(queryToUse.trim())}`);
      setSearchFocused(false);
      setMobileMenuOpen(false);
    }
  };

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newsletterConsent && newsletterEmail.trim()) {
      setNewsletterSuccess(true);
      setNewsletterEmail('');
      setNewsletterConsent(false);
      setTimeout(() => setNewsletterSuccess(false), 5000);
    }
  };

  // Nav menu items specified in Phase 2
  const navCategories = [
    { name: 'Bullion', path: '/c/bullion' },
    { name: 'Gold Coins/Bars', path: '/c/gold' },
    { name: 'Silver Coins/Bars', path: '/c/silver' },
    { name: 'Gems and Coloured Stones', path: '/c/gemstones' },
    { name: 'Rudraksh', path: '/c/rudraksha' },
    { name: 'Gifts', path: '/c/gifting' },
    { name: 'Corporate Gifting', path: '/corporate-gifting' },
  ];

  // Autocomplete matching items
  const autocompleteSuggestions = searchQuery.trim().length > 0
    ? products
        .filter((p) =>
          p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.category.toLowerCase().includes(searchQuery.toLowerCase())
        )
        .slice(0, 4)
    : [];

  return (
    <div className="min-h-screen bg-[#FFFBF3] text-[#7A6A55] flex flex-col font-sans selection:bg-[#F1E3BD] selection:text-[#5A4630]">
      {/* 1. Live Metal-Rate Strip (Top, surface-alt) */}
      <aside
        aria-label="Live Market Rates"
        className={`border-b border-[#EADFC8] px-4 py-2 text-xs transition-all duration-300 ${
          isFeedStale
            ? 'bg-[#FBE7B8] text-[#7A5310]'
            : hasFlashed
            ? 'bg-[#F1E3BD] text-[#5A4630]'
            : 'bg-[#F8EFD9] text-[#5A4630]'
        }`}
      >
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
          {/* Left: Rates & Market Benchmark */}
          <div className="flex items-center gap-3 sm:gap-4 flex-wrap">
            <span className="flex items-center gap-1.5 font-medium">
              <span
                className={`w-2 h-2 rounded-full ${
                  isFeedStale ? 'bg-[#E8C26E]' : 'bg-[#2D5A27] animate-pulse'
                }`}
              ></span>
              <span className="font-semibold">
                {isFeedStale ? 'Rate delayed, spot quotes paused' : 'Live Spot Rates (MCX Mumbai):'}
              </span>
            </span>

            <span className="tabular-nums">
              Gold 24K (999.9):{' '}
              <strong className="text-[#C9A24B] font-bold">
                {formatINR(rates.gold24k)}/g
              </strong>
            </span>

            <span className="tabular-nums hidden sm:inline">
              Gold 22K (916):{' '}
              <strong className="text-[#C9A24B] font-bold">
                {formatINR(rates.gold22k)}/g
              </strong>
            </span>

            <span className="tabular-nums">
              Silver 999:{' '}
              <strong className="text-[#5A4630] font-bold">
                {formatINR(rates.silver999)}/g
              </strong>
            </span>

            <span className="text-[#7A6A55]/80 text-[11px] hidden lg:inline">
              (INR • Updated {formatDateTime(rates.lastUpdated).slice(11)})
            </span>
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-2 sm:gap-3 text-xs">
            <button
              onClick={() => setRateModalOpen(true)}
              className="text-[#5A4630] hover:text-[#C9A24B] font-medium underline flex items-center gap-1"
            >
              <TrendingUp className="w-3.5 h-3.5 text-[#C9A24B]" />
              <span>Rate Details</span>
            </button>
            <span className="text-[#EADFC8]">•</span>
            <Link
              to="/c/gold"
              className="text-[#C9A24B] hover:text-[#5A4630] font-semibold flex items-center gap-1"
            >
              <span>Browse Bullion</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </aside>

      {/* 2. Main Header */}
      <header className="bg-[#FFFFFF] border-b border-[#EADFC8] sticky top-0 z-40 shadow-[0_2px_12px_rgba(90,70,48,0.04)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3.5 flex items-center justify-between gap-4">
          {/* Mobile Hamburger Button */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 rounded-lg text-[#5A4630] hover:bg-[#F8EFD9] focus:outline-none focus:ring-2 focus:ring-[#C9A24B]"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>

          {/* Brand Wordmark */}
          <Link
            to="/"
            className="flex flex-col focus:outline-none focus:ring-2 focus:ring-[#C9A24B] rounded-sm shrink-0"
          >
            <span className="font-serif text-2xl sm:text-3xl tracking-widest font-bold text-[#5A4630]">
              {BRAND_NAME}
            </span>
            <span className="text-[10px] tracking-widest uppercase text-[#C9A24B] -mt-1 font-semibold">
              {BRAND_TAGLINE}
            </span>
          </Link>

          {/* Desktop Categories Menu */}
          <nav
            aria-label="Primary Navigation"
            className="hidden xl:flex items-center gap-4 2xl:gap-6 text-xs font-semibold text-[#5A4630]"
          >
            {navCategories.map((cat) => (
              <Link
                key={cat.path}
                to={cat.path}
                className="hover:text-[#C9A24B] transition-colors focus:outline-none focus:ring-2 focus:ring-[#C9A24B] rounded px-1 whitespace-nowrap"
              >
                {cat.name}
              </Link>
            ))}
          </nav>

          {/* Search Box with Autocomplete & Recent Searches */}
          <div className="hidden md:flex items-center relative w-60 lg:w-72" ref={searchContainerRef}>
            <form onSubmit={(e) => handleSearchSubmit(e)} className="w-full relative">
              <input
                type="text"
                value={searchQuery}
                onFocus={() => setSearchFocused(true)}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search gold, gems, coins..."
                aria-label="Search store products"
                className="w-full text-xs pl-8 pr-3 py-2 bg-[#FFFBF3] border border-[#EADFC8] rounded-full text-[#5A4630] placeholder:text-[#7A6A55]/60 focus:outline-none focus:ring-2 focus:ring-[#C9A24B] focus:border-transparent"
              />
              <Search className="w-3.5 h-3.5 text-[#7A6A55] absolute left-2.5 top-2.5 pointer-events-none" />
            </form>

            {/* Dropdown: Autocomplete Suggestions OR Recent Searches */}
            {searchFocused && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-[#EADFC8] rounded-xl shadow-xl p-3 z-50 text-xs animate-in fade-in duration-150">
                {searchQuery.trim().length > 0 ? (
                  <div>
                    <div className="text-[10px] uppercase font-bold tracking-wider text-[#7A6A55] mb-2">
                      Matching Products
                    </div>
                    {autocompleteSuggestions.length > 0 ? (
                      <div className="space-y-2">
                        {autocompleteSuggestions.map((prod) => {
                          const pCalc = calculatePrice(prod, rates, pricingConfig);
                          return (
                            <Link
                              key={prod.id}
                              to={`/p/${prod.slug}`}
                              onClick={() => setSearchFocused(false)}
                              className="flex items-center gap-2.5 p-1.5 rounded-lg hover:bg-[#F8EFD9] transition-colors"
                            >
                              <img
                                src={prod.imageUrl || `/products/${prod.id}.jpg`}
                                alt={prod.name}
                                className="w-8 h-8 rounded object-cover border border-[#EADFC8]"
                              />
                              <div className="flex-1 min-w-0">
                                <div className="font-semibold text-[#5A4630] truncate">{prod.name}</div>
                                <div className="text-[10px] text-[#7A6A55]">{prod.category} • {prod.sku}</div>
                              </div>
                              <span className="font-serif font-bold text-[#C9A24B] tabular-nums">
                                {formatINR(pCalc.total)}
                              </span>
                            </Link>
                          );
                        })}
                        <button
                          type="button"
                          onClick={() => handleSearchSubmit()}
                          className="w-full text-center text-[11px] font-semibold text-[#C9A24B] hover:underline pt-1 border-t border-[#EADFC8]"
                        >
                          View all results for "{searchQuery}" →
                        </button>
                      </div>
                    ) : (
                      <div className="text-[#7A6A55] py-2 text-center">No matching products found.</div>
                    )}
                  </div>
                ) : (
                  <div>
                    <div className="text-[10px] uppercase font-bold tracking-wider text-[#7A6A55] mb-1.5">
                      Recent Searches
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {recentSearches.map((term) => (
                        <button
                          key={term}
                          type="button"
                          onClick={() => {
                            setSearchQuery(term);
                            handleSearchSubmit(undefined, term);
                          }}
                          className="px-2 py-1 bg-[#F8EFD9] hover:bg-[#EADFC8] text-[#5A4630] rounded-md text-[11px] font-medium transition-colors"
                        >
                          {term}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Customer Controls: Language, Wishlist, Cart, Profile, Support */}
          <div className="flex items-center gap-1 sm:gap-2 text-[#5A4630]">
            {/* Language Selector Dropdown */}
            <div className="relative" ref={langMenuRef}>
              <button
                type="button"
                onClick={() => setLangMenuOpen(!langMenuOpen)}
                className="flex items-center gap-1 p-1.5 sm:px-2.5 sm:py-1.5 rounded-lg border border-[#EADFC8] bg-[#FFFBF3] hover:bg-[#F8EFD9] text-xs font-semibold text-[#5A4630] transition-colors"
                title="Select Preferred Language"
                aria-label="Language Selector"
              >
                <Globe className="w-3.5 h-3.5 text-[#C9A24B]" />
                <span className="uppercase">{selectedLanguage}</span>
              </button>

              {langMenuOpen && (
                <div className="absolute right-0 mt-1.5 w-48 bg-white border border-[#EADFC8] rounded-xl shadow-xl py-2 z-50 text-xs animate-in fade-in duration-150">
                  <div className="px-3 py-1 text-[10px] uppercase font-bold text-[#7A6A55] border-b border-[#EADFC8]/60">
                    Storefront Language
                  </div>
                  <button
                    onClick={() => {
                      setSelectedLanguage('en');
                      setLangMenuOpen(false);
                    }}
                    className={`w-full text-left px-3 py-2 flex items-center justify-between hover:bg-[#F8EFD9] ${
                      selectedLanguage === 'en' ? 'font-bold text-[#C9A24B]' : 'text-[#5A4630]'
                    }`}
                  >
                    <span>English (Active)</span>
                    {selectedLanguage === 'en' && <CheckCircle2 className="w-3.5 h-3.5 text-[#C9A24B]" />}
                  </button>
                  <div className="px-3 py-1.5 text-[11px] text-[#7A6A55] bg-[#FFFBF3] border-t border-[#EADFC8]/60 space-y-1">
                    <div className="flex justify-between items-center text-[#7A6A55]/60">
                      <span>हिन्दी (Hindi)</span>
                      <span className="text-[9px] bg-[#EADFC8] px-1 rounded">Coming soon</span>
                    </div>
                    <div className="flex justify-between items-center text-[#7A6A55]/60">
                      <span>ગુજરાતી (Gujarati)</span>
                      <span className="text-[9px] bg-[#EADFC8] px-1 rounded">Coming soon</span>
                    </div>
                    <div className="flex justify-between items-center text-[#7A6A55]/60">
                      <span>தமிழ் (Tamil)</span>
                      <span className="text-[9px] bg-[#EADFC8] px-1 rounded">Coming soon</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Mobile Search Link */}
            <Link
              to="/search"
              className="md:hidden p-2 hover:bg-[#F8EFD9] rounded-full transition-colors"
              title="Search"
              aria-label="Search"
            >
              <Search className="w-5 h-5" />
            </Link>

            {/* Support Concierge Link */}
            <Link
              to="/policies"
              className="p-2 hover:bg-[#F8EFD9] rounded-full transition-colors hidden sm:flex"
              title="Customer Support & Assistance"
              aria-label="Customer Support"
            >
              <Headphones className="w-5 h-5" />
            </Link>

            {/* Wishlist Icon */}
            <Link
              to="/wishlist"
              className="p-2 hover:bg-[#F8EFD9] rounded-full transition-colors relative"
              title="Wishlist"
              aria-label={`Wishlist with ${totalWishlistItems} saved items`}
            >
              <Heart className="w-5 h-5" />
              {totalWishlistItems > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-[#C9A24B] text-white text-[10px] flex items-center justify-center font-bold">
                  {totalWishlistItems}
                </span>
              )}
            </Link>

            {/* Cart Icon */}
            <Link
              to="/cart"
              className="p-2 hover:bg-[#F8EFD9] rounded-full transition-colors relative"
              title="Shopping Cart"
              aria-label={`Cart with ${totalCartItems} items`}
            >
              <ShoppingBag className="w-5 h-5" />
              {totalCartItems > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-[#C9A24B] text-white text-[10px] flex items-center justify-center font-bold">
                  {totalCartItems}
                </span>
              )}
            </Link>

            {/* User Profile & Account Console */}
            <div className="relative" ref={profileMenuRef}>
              <button
                type="button"
                onClick={() => setProfileMenuOpen(!profileMenuOpen)}
                className="p-2 hover:bg-[#F8EFD9] rounded-full transition-colors flex items-center justify-center cursor-pointer"
                title="Customer Profile & Console"
                aria-label="Customer Profile & Console"
              >
                <User className="w-5 h-5" />
              </button>

              {profileMenuOpen && (
                <div className="absolute right-0 mt-2 w-64 max-w-[calc(100vw-2rem)] bg-[#FFFDF9] border border-[#EADFC8] rounded-xl shadow-xl py-2 z-50 animate-in fade-in slide-in-from-top-1 duration-150">
                  <div className="px-4 py-2 border-b border-[#EADFC8]/60">
                    <div className="text-xs font-bold text-[#5A4630]">Aditya Singhania</div>
                    <div className="text-[11px] text-[#7A6A55]">KYC: Verified • PAN Registered</div>
                  </div>

                  <div className="py-1">
                    <Link
                      to="/account"
                      onClick={() => setProfileMenuOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2 text-xs text-[#5A4630] hover:bg-[#F8EFD9]/60 hover:text-[#C9A24B] transition-colors"
                    >
                      <User className="w-3.5 h-3.5 text-[#C9A24B]" />
                      <span>My Profile, Orders & Invoices</span>
                    </Link>
                    <Link
                      to="/wishlist"
                      onClick={() => setProfileMenuOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2 text-xs text-[#5A4630] hover:bg-[#F8EFD9]/60 hover:text-[#C9A24B] transition-colors"
                    >
                      <Heart className="w-3.5 h-3.5 text-[#C9A24B]" />
                      <span>Saved Wishlist ({totalWishlistItems})</span>
                    </Link>
                  </div>

                  <div className="border-t border-[#EADFC8] my-1" />

                  {/* Staff & Admin Console Section */}
                  <div className="p-2 pt-1">
                    <div className="px-2 py-1 text-[10px] uppercase font-bold tracking-wider text-[#7A6A55]">
                      Staff & Internal Console
                    </div>
                    <Link
                      to="/admin"
                      target="_blank"
                      onClick={() => setProfileMenuOpen(false)}
                      className="flex items-center justify-between p-2 rounded-lg bg-[#FAF7F2] border border-[#EADFC8] text-xs font-semibold text-[#5A4630] hover:border-[#C9A24B] hover:text-[#C9A24B] transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        <ShieldCheck className="w-4 h-4 text-[#C9A24B]" />
                        <span>Admin Console</span>
                      </div>
                      <span className="text-[10px] bg-[#F1E3BD] px-1.5 py-0.5 rounded text-[#5A4630] font-bold">
                        OPS →
                      </span>
                    </Link>

                    <Link
                      to="/debug"
                      target="_blank"
                      onClick={() => setProfileMenuOpen(false)}
                      className="flex items-center gap-2 px-2.5 py-1.5 mt-1 text-[11px] text-[#7A6A55] hover:text-[#C9A24B] transition-colors"
                    >
                      <Bug className="w-3 h-3 text-[#C9A24B]" />
                      <span>Data Model Diagnostic (/debug)</span>
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="lg:hidden bg-[#FFFFFF] border-t border-[#EADFC8] px-4 py-4 space-y-4 max-h-[85vh] overflow-y-auto animate-in fade-in duration-150">
            {/* Search Input */}
            <form onSubmit={(e) => handleSearchSubmit(e)} className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search jewellery, bullion, coins..."
                aria-label="Search mobile"
                className="w-full text-xs pl-8 pr-3 py-2.5 bg-[#FFFBF3] border border-[#EADFC8] rounded-lg text-[#5A4630]"
              />
              <Search className="w-4 h-4 text-[#7A6A55] absolute left-2.5 top-3" />
            </form>

            {/* Primary Categories */}
            <div>
              <div className="text-[10px] uppercase font-bold tracking-wider text-[#7A6A55] mb-2">
                Precious Collections & Categories
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-medium">
                {navCategories.map((cat) => (
                  <Link
                    key={cat.path}
                    to={cat.path}
                    onClick={() => setMobileMenuOpen(false)}
                    className="p-2.5 rounded-lg bg-[#FFFBF3] border border-[#EADFC8] hover:bg-[#F8EFD9] text-[#5A4630] transition-all flex items-center justify-between"
                  >
                    <span>{cat.name}</span>
                    <ChevronRight className="w-3.5 h-3.5 text-[#C9A24B]" />
                  </Link>
                ))}
              </div>
            </div>

            {/* Quick Links */}
            <div className="pt-2 border-t border-[#EADFC8]/60">
              <div className="text-[10px] uppercase font-bold tracking-wider text-[#7A6A55] mb-2">
                Quick Verification
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs font-medium">
                <Link
                  to="/verify/B24-999-5481"
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-2.5 rounded-lg bg-white border border-[#EADFC8] text-[#5A4630] hover:bg-[#F8EFD9]"
                >
                  Verify Assay Card
                </Link>
                <Link
                  to="/occasions"
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-2.5 rounded-lg bg-white border border-[#EADFC8] text-[#5A4630] hover:bg-[#F8EFD9]"
                >
                  Festival Treasury
                </Link>
              </div>
            </div>
          </div>
        )}
      </header>

      {/* Main Page Slot */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8">
        <Outlet />
      </main>

      {/* 3. TRUST & CLIENT COMMITMENT ROW */}
      <section className="bg-[#F8EFD9] border-t border-b border-[#EADFC8] py-8 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6 text-xs">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-full bg-white border border-[#EADFC8] flex items-center justify-center shrink-0 text-[#C9A24B]">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-serif font-bold text-[#5A4630] text-sm">BIS Hallmarked & Assay Certified</h4>
              <p className="text-[#7A6A55] mt-1 leading-relaxed">
                Every gold coin carries BIS laser hallmarking and tamper-evident assay blister packaging. Gemstones independently certified by GIA / IGI.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-full bg-white border border-[#EADFC8] flex items-center justify-center shrink-0 text-[#C9A24B]">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-serif font-bold text-[#5A4630] text-sm">100% Insured Armoured Transit</h4>
              <p className="text-[#7A6A55] mt-1 leading-relaxed">
                Dispatched via specialized precious couriers (Sequel & BVC) with OTP delivery verification, real-time GPS tracking, and full transit cover.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-full bg-white border border-[#EADFC8] flex items-center justify-center shrink-0 text-[#C9A24B]">
              <PhoneCall className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-serif font-bold text-[#5A4630] text-sm">Client Concierge & Guaranteed Buyback</h4>
              <p className="text-[#7A6A55] mt-1 leading-relaxed">
                Statutory transparent buyback at current market spot rates. Dedicated institutional gifting desk and lifetime metallurgical authenticity support.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. FOOTER */}
      <footer className="bg-[#FAF7F2] border-t border-[#EADFC8] text-xs pt-12 pb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 pb-10 border-b border-[#EADFC8]">
            {/* Brand Intro */}
            <div className="lg:col-span-2 space-y-3">
              <span className="font-serif text-2xl font-bold tracking-widest text-[#5A4630] block">
                {BRAND_NAME}
              </span>
              <p className="text-[#7A6A55] max-w-sm leading-relaxed">
                Premier bullion sovereign mint and Vedic gemological treasury. Dedicated to uncompromising metallurgical purity, dynamic spot transparency, and certified heritage craftsmanship.
              </p>
              <div className="text-[11px] text-[#7A6A55] pt-2 space-y-1">
                <div>Assay Registry: BIS License Ref. CM/L-710014892</div>
                <div>Statutory Corporate ID: U36911MH2024PTC491028</div>
                <div>Grievance Officer: Vikram Sharma (grievance@aurumco.internal)</div>
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <div className="font-serif font-bold text-[#5A4630] text-sm mb-3">Precious Collections</div>
              <ul className="space-y-2 text-[#7A6A55]">
                <li><Link to="/c/gold" className="hover:text-[#C9A24B]">24K Minted Gold Coins</Link></li>
                <li><Link to="/c/silver" className="hover:text-[#C9A24B]">999 Fine Silver Bars</Link></li>
                <li><Link to="/c/gemstones" className="hover:text-[#C9A24B]">Natural Burmese Rubies</Link></li>
                <li><Link to="/c/rudraksha" className="hover:text-[#C9A24B]">Nepali Sacred Malas</Link></li>
                <li><Link to="/corporate-gifting" className="hover:text-[#C9A24B]">Corporate Bespoke Gifting</Link></li>
              </ul>
            </div>

            {/* Statutory & Legal */}
            <div>
              <div className="font-serif font-bold text-[#5A4630] text-sm mb-3">Statutory & Governance</div>
              <ul className="space-y-2 text-[#7A6A55]">
                <li><Link to="/terms" className="hover:text-[#C9A24B]">Terms of Service</Link></li>
                <li><Link to="/privacy" className="hover:text-[#C9A24B]">Privacy Charter (DPDP 2023)</Link></li>
                <li><Link to="/returns" className="hover:text-[#C9A24B]">Buyback & Returns Policy</Link></li>
                <li><Link to="/shipping" className="hover:text-[#C9A24B]">Insured Shipping Standards</Link></li>
                <li><Link to="/authenticity" className="hover:text-[#C9A24B]">Hallmark & Assay Disclosures</Link></li>
                <li><Link to="/grievance" className="hover:text-[#C9A24B]">Consumer Grievance Redressal</Link></li>
              </ul>
            </div>

            {/* Newsletter Subscription with Separate Consent */}
            <div>
              <div className="font-serif font-bold text-[#5A4630] text-sm mb-2">Market & Rate Intelligence</div>
              <p className="text-[11px] text-[#7A6A55] mb-3 leading-relaxed">
                Receive weekly MCX bullion market commentary and rare gemstone auction previews.
              </p>

              {newsletterSuccess ? (
                <div className="p-3 bg-[#DCE8D5] text-[#2D5A27] rounded-lg text-[11px] font-medium flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>Subscribed. You can withdraw consent anytime.</span>
                </div>
              ) : (
                <form onSubmit={handleNewsletterSubmit} className="space-y-2.5">
                  <input
                    type="email"
                    value={newsletterEmail}
                    onChange={(e) => setNewsletterEmail(e.target.value)}
                    placeholder="Enter business email"
                    required
                    className="w-full text-xs px-3 py-2 bg-white border border-[#EADFC8] rounded-md text-[#5A4630] placeholder:text-[#7A6A55]/60 focus:outline-[#C9A24B]"
                  />

                  {/* Separate Consent Checkbox */}
                  <label className="flex items-start gap-2 text-[10px] text-[#7A6A55] cursor-pointer">
                    <input
                      type="checkbox"
                      checked={newsletterConsent}
                      onChange={(e) => setNewsletterConsent(e.target.checked)}
                      required
                      className="mt-0.5 rounded border-[#EADFC8] text-[#C9A24B] focus:ring-[#C9A24B]"
                    />
                    <span>
                      I give explicit separate consent to receive promotional newsletters, recorded separately from transactional order alerts.
                    </span>
                  </label>

                  <button
                    type="submit"
                    disabled={!newsletterConsent}
                    className="w-full py-2 px-3 bg-[#C9A24B] hover:bg-[#BA8332] disabled:opacity-50 text-white rounded-md font-semibold text-xs transition-colors"
                  >
                    Subscribe with Consent
                  </button>
                </form>
              )}
            </div>
          </div>

          {/* Bottom Copyright & Disclaimer */}
          <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-[#7A6A55]">
            <p>© 2026 {BRAND_NAME}. All rights reserved. Registered under Indian Companies Act 2013.</p>
            <p>
              Precious bullion prices are subject to live market fluctuations. Spot rates refreshed every 5 seconds.
            </p>
          </div>
        </div>
      </footer>

      {/* Spot Rate Details Modal */}
      <Modal
        isOpen={rateModalOpen}
        onClose={() => setRateModalOpen(false)}
        title={
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-[#C9A24B]" />
            <span>Precious Metals Benchmark & Spot Rate Breakdown</span>
          </div>
        }
        maxWidth="lg"
      >
        <div className="p-4 sm:p-6 space-y-4 text-xs bg-[#FFFBF3]">
          <div className="p-3 bg-[#FAF7F2] border border-[#EADFC8] rounded-lg">
            <div className="text-[11px] text-[#7A6A55] uppercase font-bold tracking-wider mb-1">
              Active Benchmark Source
            </div>
            <div className="text-sm font-semibold text-[#5A4630]">
              MCX India Multi Commodity Exchange (Mumbai Spot Delivery)
            </div>
            <div className="text-[11px] text-[#7A6A55] mt-1">
              Rates updated every 5 seconds • Last verified: {formatDateTime(rates.lastUpdated)}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-3 bg-white border border-[#EADFC8] rounded-lg">
              <div className="text-[#7A6A55] text-[11px]">Gold 24K (999.9)</div>
              <div className="text-xl font-serif font-bold text-[#C9A24B]">{formatINR(rates.gold24k)}/g</div>
              <div className="text-[10px] text-[#7A6A55] mt-1">Fine Investment Pure Bullion</div>
            </div>

            <div className="p-3 bg-white border border-[#EADFC8] rounded-lg">
              <div className="text-[#7A6A55] text-[11px]">Gold 22K (916)</div>
              <div className="text-xl font-serif font-bold text-[#C9A24B]">{formatINR(rates.gold22k)}/g</div>
              <div className="text-[10px] text-[#7A6A55] mt-1">BIS Hallmarked Fine Jewellery</div>
            </div>

            <div className="p-3 bg-white border border-[#EADFC8] rounded-lg">
              <div className="text-[#7A6A55] text-[11px]">Silver 999</div>
              <div className="text-xl font-serif font-bold text-[#5A4630]">{formatINR(rates.silver999)}/g</div>
              <div className="text-[10px] text-[#7A6A55] mt-1">999 Fine Bullion & Sacred Idols</div>
            </div>
          </div>

          <div className="p-3 bg-[#F8EFD9] border border-[#EADFC8] rounded-lg space-y-1 text-[11px] text-[#5A4630]">
            <div className="font-bold">Transparent Statutory Pricing Formula:</div>
            <div>• Metal Value = Fine Weight (g) × Live Spot Rate</div>
            <div>• Subtotal = Metal Value + Making Charges + Packaging (₹250) + Armoured Insurance (₹450)</div>
            <div>• Total Payable = Subtotal + 3.0% Statutory Indian GST</div>
          </div>

          <div className="flex justify-end pt-2">
            <Button variant="primary" size="sm" onClick={() => setRateModalOpen(false)}>
              Close Breakdown
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
