import React, { useState, useEffect, useRef } from 'react';
import { Link, Outlet, useNavigate } from 'react-router-dom';
import { BRAND_NAME, BRAND_TAGLINE } from '../lib/constants';
import {
  ShieldCheck,
  Truck,
  Headphones,
  Search,
  Heart,
  ShoppingBag,
  User,
  Menu,
  X,
  Bug,
  CheckCircle2,
  Lock,
  ChevronRight,
  ArrowRight,
  Gem,
  CreditCard,
} from 'lucide-react';
import { useAppStore } from '../store';
import { formatINR, formatDateTime } from '../lib/pricing';

export const StoreLayout: React.FC = () => {
  const navigate = useNavigate();
  const { rates, isFeedStale, cart, wishlist } = useAppStore();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const profileMenuRef = useRef<HTMLDivElement>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [newsletterConsent, setNewsletterConsent] = useState(false);
  const [newsletterSuccess, setNewsletterSuccess] = useState(false);

  // Close profile menu on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(e.target as Node)) {
        setProfileMenuOpen(false);
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

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setMobileMenuOpen(false);
    }
  };

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newsletterConsent && newsletterEmail.trim()) {
      setNewsletterSuccess(true);
      setNewsletterEmail('');
      setTimeout(() => setNewsletterSuccess(false), 5000);
    }
  };

  const navCategories = [
    { name: 'Gold', path: '/c/gold' },
    { name: 'Silver', path: '/c/silver' },
    { name: 'Gemstones', path: '/c/gemstones' },
    { name: 'Coloured Stones', path: '/c/coloured-stones' },
    { name: 'Rudraksha', path: '/c/rudraksha' },
    { name: 'Gifting', path: '/c/gifting' },
  ];

  return (
    <div className="min-h-screen bg-[#FFFBF3] text-[#7A6A55] flex flex-col font-sans selection:bg-[#F1E3BD] selection:text-[#5A4630]">
      {/* 1. Rate Strip (Top, surface-alt) with light flash on change */}
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
          <div className="flex items-center gap-3 sm:gap-4 flex-wrap">
            <span className="flex items-center gap-1.5 font-medium">
              <span
                className={`w-2 h-2 rounded-full ${
                  isFeedStale ? 'bg-[#E8C26E]' : 'bg-[#2D5A27] animate-pulse'
                }`}
              ></span>
              <span>{isFeedStale ? 'Rate delayed, prices paused' : 'Live Rates:'}</span>
            </span>
            <span className="tabular-nums">
              Gold 24K:{' '}
              <strong className="text-[#C9A24B] font-bold">
                {formatINR(rates.gold24k)}/g
              </strong>
            </span>
            <span className="tabular-nums hidden xs:inline">
              Gold 22K:{' '}
              <strong className="text-[#C9A24B] font-bold">
                {formatINR(rates.gold22k)}/g
              </strong>
            </span>
            <span className="tabular-nums">
              Silver 999:{' '}
              <strong className="text-[#7A6A55] font-bold">
                {formatINR(rates.silver999)}/g
              </strong>
            </span>
            <span className="text-[#7A6A55]/80 text-[11px] hidden md:inline">
              (per gram, 24K / 999 basis • Updated {formatDateTime(rates.lastUpdated)})
            </span>
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
            className="md:hidden p-2 rounded-lg text-[#5A4630] hover:bg-[#F8EFD9] focus:outline-none focus:ring-2 focus:ring-[#C9A24B]"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>

          {/* Brand Wordmark */}
          <Link
            to="/"
            className="flex flex-col focus:outline-none focus:ring-2 focus:ring-[#C9A24B] rounded-sm"
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
            className="hidden md:flex items-center gap-5 lg:gap-7 text-sm font-medium text-[#5A4630]"
          >
            {navCategories.map((cat) => (
              <Link
                key={cat.path}
                to={cat.path}
                className="hover:text-[#C9A24B] transition-colors focus:outline-none focus:ring-2 focus:ring-[#C9A24B] rounded px-1"
              >
                {cat.name}
              </Link>
            ))}
          </nav>

          {/* Desktop Search Box */}
          <form
            onSubmit={handleSearchSubmit}
            className="hidden lg:flex items-center relative w-56 xl:w-64"
          >
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search gold, gems, coins..."
              aria-label="Search store products"
              className="w-full text-xs pl-8 pr-3 py-2 bg-[#FFFBF3] border border-[#EADFC8] rounded-full text-[#5A4630] placeholder:text-[#7A6A55]/60 focus:outline-none focus:ring-2 focus:ring-[#C9A24B] focus:border-transparent"
            />
            <Search className="w-3.5 h-3.5 text-[#7A6A55] absolute left-2.5 pointer-events-none" />
          </form>

          {/* Actions: Search icon (mobile/tablet), Wishlist, Cart, Account */}
          <div className="flex items-center gap-1 sm:gap-2 text-[#5A4630]">
            <Link
              to="/search"
              className="lg:hidden p-2 hover:bg-[#F8EFD9] rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-[#C9A24B]"
              title="Search"
              aria-label="Search"
            >
              <Search className="w-5 h-5" />
            </Link>

            <Link
              to="/wishlist"
              className="p-2 hover:bg-[#F8EFD9] rounded-full transition-colors relative focus:outline-none focus:ring-2 focus:ring-[#C9A24B]"
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

            <Link
              to="/cart"
              className="p-2 hover:bg-[#F8EFD9] rounded-full transition-colors relative focus:outline-none focus:ring-2 focus:ring-[#C9A24B]"
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

            {/* User Profile & Management Dropdown */}
            <div className="relative" ref={profileMenuRef}>
              <button
                type="button"
                onClick={() => setProfileMenuOpen(!profileMenuOpen)}
                className="p-2 hover:bg-[#F8EFD9] rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-[#C9A24B] flex items-center justify-center cursor-pointer"
                title="Customer Profile & Console"
                aria-label="Customer Profile & Console"
              >
                <User className="w-5 h-5" />
              </button>

              {profileMenuOpen && (
                <div className="absolute right-0 mt-2 w-64 max-w-[calc(100vw-2rem)] bg-[#FFFDF9] border border-[#EADFC8] rounded-xl shadow-xl py-2 z-50 animate-in fade-in slide-in-from-top-1 duration-150">
                  <div className="px-4 py-2 border-b border-[#EADFC8]/60">
                    <div className="text-xs font-bold text-[#5A4630]">Vikramaditya Singhania</div>
                    <div className="text-[11px] text-[#7A6A55]">Customer Account</div>
                  </div>

                  <div className="py-1">
                    <Link
                      to="/account"
                      onClick={() => setProfileMenuOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2 text-xs text-[#5A4630] hover:bg-[#F8EFD9]/60 hover:text-[#C9A24B] transition-colors"
                    >
                      <User className="w-3.5 h-3.5 text-[#C9A24B]" />
                      <span>My Profile & Orders</span>
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
                      Staff & Management
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
                      <span>Debug Logic Center</span>
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-[#FFFFFF] border-t border-[#EADFC8] px-4 py-4 space-y-4 max-h-[85vh] overflow-y-auto animate-in fade-in duration-150">
            {/* Search Input */}
            <form onSubmit={handleSearchSubmit} className="relative">
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
                Precious Collections
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs font-medium">
                {navCategories.map((cat) => (
                  <Link
                    key={cat.path}
                    to={cat.path}
                    onClick={() => setMobileMenuOpen(false)}
                    className="p-2.5 rounded-lg bg-[#FFFBF3] border border-[#EADFC8] hover:bg-[#F8EFD9] text-[#5A4630] active:scale-98 transition-all flex items-center justify-between"
                  >
                    <span>{cat.name}</span>
                    <ChevronRight className="w-3.5 h-3.5 text-[#C9A24B]" />
                  </Link>
                ))}
              </div>
            </div>

            {/* Additional Storefront Sections */}
            <div className="pt-2 border-t border-[#EADFC8]/60">
              <div className="text-[10px] uppercase font-bold tracking-wider text-[#7A6A55] mb-2">
                Explore & Verify
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs font-medium">
                <Link
                  to="/occasions"
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-2.5 rounded-lg bg-white border border-[#EADFC8] hover:bg-[#F8EFD9] text-[#5A4630] transition-colors"
                >
                  Festivals & Occasions
                </Link>
                <Link
                  to="/gifting-enquiry"
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-2.5 rounded-lg bg-white border border-[#EADFC8] hover:bg-[#F8EFD9] text-[#5A4630] transition-colors"
                >
                  Corporate Gifting
                </Link>
                <Link
                  to="/verify/B24-999-5481"
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-2.5 rounded-lg bg-white border border-[#EADFC8] hover:bg-[#F8EFD9] text-[#5A4630] transition-colors"
                >
                  Assay Verification
                </Link>
                <Link
                  to="/vault"
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-2.5 rounded-lg bg-white border border-[#EADFC8] hover:bg-[#F8EFD9] text-[#5A4630] transition-colors"
                >
                  Digital Gold Vault
                </Link>
              </div>
            </div>

            {/* Customer Account & Admin Entry Point */}
            <div className="pt-2 border-t border-[#EADFC8]/60 space-y-2">
              <Link
                to="/account"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-between p-2.5 rounded-lg bg-[#FAF7F2] border border-[#EADFC8] text-xs font-semibold text-[#5A4630]"
              >
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-[#C9A24B]" />
                  <span>My Profile & Order History</span>
                </div>
                <ChevronRight className="w-4 h-4 text-[#C9A24B]" />
              </Link>
              <Link
                to="/admin"
                target="_blank"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-between p-2.5 rounded-lg bg-[#F8EFD9] border border-[#C9A24B]/50 text-xs font-bold text-[#5A4630]"
              >
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-[#C9A24B]" />
                  <span>Admin Operations Console</span>
                </div>
                <span className="text-[10px] bg-[#C9A24B] text-white px-2 py-0.5 rounded font-bold">
                  OPS →
                </span>
              </Link>
            </div>
          </div>
        )}
      </header>

      {/* Main Outlet */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-3.5 sm:px-6 py-5 sm:py-8">
        <Outlet />
      </main>

      {/* 4. Modern Minimal Luxury Footer */}
      <footer className="bg-[#FAF7F2] border-t border-[#EAE2D5] mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 sm:py-16">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-12 mb-12">
            {/* Column 1: Brand & Feature Trust Row */}
            <div className="space-y-4">
              <div>
                <h3 className="font-serif text-2xl font-bold tracking-[0.16em] text-[#2C2016] uppercase">
                  {BRAND_NAME}
                </h3>
                <p className="text-[10px] tracking-[0.2em] font-bold text-[#C9A24B] uppercase mt-1">
                  PRECIOUS COMMERCE PLATFORM
                </p>
              </div>

              <p className="text-xs text-[#7A6A55] leading-relaxed max-w-sm">
                Modern Indian luxury jewellery, LBMA-equivalent certified bullion coins and bars, natural certified gemstones, and sacred Himalayan Rudraksha.
              </p>

              {/* 4 Trust Micro-Badges with thin vertical dividers */}
              <div className="pt-2">
                <div className="grid grid-cols-4 border border-[#EAE2D5] bg-[#FCFAF7] rounded-lg py-2.5 px-1 divide-x divide-[#EAE2D5]">
                  <div className="flex flex-col items-center text-center px-1">
                    <div className="w-8 h-8 rounded-full bg-[#F3EBE1] flex items-center justify-center text-[#9E7736] mb-1">
                      <Gem className="w-4 h-4 stroke-[1.5]" />
                    </div>
                    <span className="text-[10px] text-[#5A4630] font-medium leading-tight">Certified<br />Products</span>
                  </div>
                  <div className="flex flex-col items-center text-center px-1">
                    <div className="w-8 h-8 rounded-full bg-[#F3EBE1] flex items-center justify-center text-[#9E7736] mb-1">
                      <CreditCard className="w-4 h-4 stroke-[1.5]" />
                    </div>
                    <span className="text-[10px] text-[#5A4630] font-medium leading-tight">Secure<br />Payments</span>
                  </div>
                  <div className="flex flex-col items-center text-center px-1">
                    <div className="w-8 h-8 rounded-full bg-[#F3EBE1] flex items-center justify-center text-[#9E7736] mb-1">
                      <Truck className="w-4 h-4 stroke-[1.5]" />
                    </div>
                    <span className="text-[10px] text-[#5A4630] font-medium leading-tight">Insured<br />Delivery</span>
                  </div>
                  <div className="flex flex-col items-center text-center px-1">
                    <div className="w-8 h-8 rounded-full bg-[#F3EBE1] flex items-center justify-center text-[#9E7736] mb-1">
                      <Headphones className="w-4 h-4 stroke-[1.5]" />
                    </div>
                    <span className="text-[10px] text-[#5A4630] font-medium leading-tight">Dedicated<br />Support</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Column 2: Customer Care */}
            <div>
              <h4 className="text-xs font-bold text-[#2C2016] uppercase tracking-wider">
                Customer Care
              </h4>
              <div className="w-8 h-[2px] bg-[#C9A24B] mt-1.5 mb-5" />
              <ul className="space-y-2.5 text-xs">
                {[
                  { label: 'Contact Us', path: '/contact' },
                  { label: 'Customer Support', path: '/support' },
                  { label: 'Grievance Nodal Officer', path: '/grievance' },
                  { label: 'Frequently Asked Questions', path: '/faq' },
                  { label: 'Auspicious Occasions Guide', path: '/occasions' },
                  { label: 'Corporate Gifting Enquiry', path: '/gifting-enquiry' },
                ].map((item) => (
                  <li key={item.path}>
                    <Link
                      to={item.path}
                      className="group flex items-center justify-between text-[#5A4630] hover:text-[#C9A24B] transition-colors py-0.5"
                    >
                      <span>{item.label}</span>
                      <ChevronRight className="w-3.5 h-3.5 text-[#B88E3E]/60 group-hover:text-[#C9A24B] group-hover:translate-x-0.5 transition-all" />
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Column 3: Policies & Trust */}
            <div>
              <h4 className="text-xs font-bold text-[#2C2016] uppercase tracking-wider">
                Policies & Trust
              </h4>
              <div className="w-8 h-[2px] bg-[#C9A24B] mt-1.5 mb-5" />
              <ul className="space-y-2.5 text-xs">
                {[
                  { label: 'Authenticity & BIS Hallmark', path: '/authenticity' },
                  { label: 'Shipping & 100% Transit Insurance', path: '/shipping' },
                  { label: 'Returns, Refunds & Buyback', path: '/returns' },
                  { label: 'Terms of Service', path: '/terms' },
                  { label: 'Privacy & Data Protection', path: '/privacy' },
                  { label: 'Consumer Disclosures (Legal Metrology)', path: '/consumer-disclosures' },
                ].map((item) => (
                  <li key={item.path}>
                    <Link
                      to={item.path}
                      className="group flex items-center justify-between text-[#5A4630] hover:text-[#C9A24B] transition-colors py-0.5"
                    >
                      <span>{item.label}</span>
                      <ChevronRight className="w-3.5 h-3.5 text-[#B88E3E]/60 group-hover:text-[#C9A24B] group-hover:translate-x-0.5 transition-all" />
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Column 4: Precious Market Updates */}
            <div>
              <h4 className="text-xs font-bold text-[#2C2016] uppercase tracking-wider">
                Precious Market Updates
              </h4>
              <div className="w-8 h-[2px] bg-[#C9A24B] mt-1.5 mb-4" />
              <p className="text-xs text-[#7A6A55] mb-4 leading-relaxed">
                Receive live bullion alerts, weekly gold trend reports, and private festive collections.
              </p>

              {newsletterSuccess ? (
                <div className="p-3 bg-[#FCFAF7] border border-[#C9A24B]/40 rounded-xl text-xs text-[#5A4630] flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#C9A24B] shrink-0" />
                  <span className="font-medium">Thank you. You are subscribed to market alerts.</span>
                </div>
              ) : (
                <form onSubmit={handleNewsletterSubmit} className="space-y-3">
                  <div className="relative flex items-center bg-white border border-[#EAE2D5] rounded-full p-1 pl-4 shadow-2xs focus-within:border-[#C9A24B] focus-within:ring-1 focus-within:ring-[#C9A24B] transition-all">
                    <label htmlFor="newsletter-email" className="sr-only">Email address</label>
                    <input
                      id="newsletter-email"
                      type="email"
                      value={newsletterEmail}
                      onChange={(e) => setNewsletterEmail(e.target.value)}
                      placeholder="Enter your email address"
                      required
                      className="w-full text-xs bg-transparent text-[#5A4630] placeholder-[#A49786] focus:outline-none pr-2"
                    />
                    <button
                      type="submit"
                      disabled={!newsletterConsent || !newsletterEmail.trim()}
                      aria-label="Subscribe"
                      className="w-8 h-8 rounded-full bg-gradient-to-br from-[#D8B15D] to-[#B38728] text-white flex items-center justify-center shrink-0 shadow-xs hover:opacity-95 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer"
                    >
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>

                  <label className="flex items-start gap-2 text-[11px] text-[#7A6A55] cursor-pointer select-none">
                    <input
                      type="checkbox"
                      id="newsletter-consent"
                      checked={newsletterConsent}
                      onChange={(e) => setNewsletterConsent(e.target.checked)}
                      className="mt-0.5 rounded text-[#C9A24B] focus:ring-[#C9A24B] border-[#EAE2D5]"
                    />
                    <span>
                      I agree to receive communications as per the <Link to="/privacy" className="underline text-[#5A4630] hover:text-[#C9A24B]">Privacy Policy</Link>.
                    </span>
                  </label>
                </form>
              )}

              {/* Social Icons Row */}
              <div className="flex items-center gap-2.5 pt-4">
                <a
                  href="https://instagram.com"
                  target="_blank"
                  rel="noreferrer"
                  aria-label="Instagram"
                  className="w-8 h-8 rounded-full border border-[#EAE2D5] bg-[#FCFAF7] text-[#8C6D3B] flex items-center justify-center hover:border-[#C9A24B] hover:text-[#C9A24B] hover:bg-white transition-all shadow-2xs"
                >
                  <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
                    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
                    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
                  </svg>
                </a>
                <a
                  href="https://facebook.com"
                  target="_blank"
                  rel="noreferrer"
                  aria-label="Facebook"
                  className="w-8 h-8 rounded-full border border-[#EAE2D5] bg-[#FCFAF7] text-[#8C6D3B] flex items-center justify-center hover:border-[#C9A24B] hover:text-[#C9A24B] hover:bg-white transition-all shadow-2xs"
                >
                  <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>
                  </svg>
                </a>
                <a
                  href="https://youtube.com"
                  target="_blank"
                  rel="noreferrer"
                  aria-label="YouTube"
                  className="w-8 h-8 rounded-full border border-[#EAE2D5] bg-[#FCFAF7] text-[#8C6D3B] flex items-center justify-center hover:border-[#C9A24B] hover:text-[#C9A24B] hover:bg-white transition-all shadow-2xs"
                >
                  <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33zM9.75 15.02l-.03-6.55 5.76 3.28-5.73 3.27z"/>
                  </svg>
                </a>
                <a
                  href="https://linkedin.com"
                  target="_blank"
                  rel="noreferrer"
                  aria-label="LinkedIn"
                  className="w-8 h-8 rounded-full border border-[#EAE2D5] bg-[#FCFAF7] text-[#8C6D3B] flex items-center justify-center hover:border-[#C9A24B] hover:text-[#C9A24B] hover:bg-white transition-all shadow-2xs"
                >
                  <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6zM2 9h4v12H2zM4 2a2 2 0 1 1-2 2 2 2 0 0 1 2-2z"/>
                  </svg>
                </a>
                <a
                  href="https://whatsapp.com"
                  target="_blank"
                  rel="noreferrer"
                  aria-label="WhatsApp"
                  className="w-8 h-8 rounded-full border border-[#EAE2D5] bg-[#FCFAF7] text-[#8C6D3B] flex items-center justify-center hover:border-[#C9A24B] hover:text-[#C9A24B] hover:bg-white transition-all shadow-2xs"
                >
                  <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.301-.15-1.78-.879-2.056-.98-.276-.1-.477-.15-.678.15-.2.302-.779.98-.955 1.18-.175.2-.351.226-.652.075-.302-.151-1.272-.469-2.423-1.496-.895-.799-1.5-1.786-1.676-2.087-.175-.301-.019-.464.132-.614.136-.135.302-.351.452-.527.151-.176.201-.302.302-.503.101-.2.05-.377-.025-.527-.075-.151-.678-1.633-.93-2.235-.245-.588-.495-.508-.679-.517l-.578-.01c-.201 0-.527.075-.804.377-.276.302-1.055 1.03-1.055 2.512 0 1.482 1.08 2.913 1.23 3.114.151.2 2.126 3.246 5.15 4.553.719.311 1.281.497 1.719.636.723.23 1.381.197 1.901.12.579-.086 1.78-.728 2.03-1.431.251-.703.251-1.306.176-1.431-.075-.126-.276-.201-.577-.352z"/>
                    <path d="M12 2C6.477 2 2 6.477 2 12c0 1.89.525 3.66 1.438 5.168L2.05 21.95l4.908-1.353A9.957 9.957 0 0012 22c5.523 0 10-4.477 10-10S17.523 2 12 2zm0 18.2c-1.61 0-3.11-.48-4.37-1.3l-.31-.2-2.92.81.82-2.84-.21-.33A8.163 8.163 0 013.8 12c0-4.52 3.68-8.2 8.2-8.2s8.2 3.68 8.2 8.2-3.68 8.2-8.2 8.2z"/>
                  </svg>
                </a>
              </div>
            </div>
          </div>

          {/* Bottom Sub-Footer Bar */}
          <div className="pt-6 border-t border-[#EAE2D5] flex flex-col lg:flex-row items-center justify-between text-xs text-[#7A6A55] gap-4">
            <div className="flex items-center flex-wrap gap-2 text-center sm:text-left justify-center sm:justify-start">
              <span>© 2026 {BRAND_NAME}. All rights reserved.</span>
              <span className="hidden sm:inline text-[#EAE2D5]">|</span>
              <span>India's Trusted Destination for Precious Metals, Gemstones & Rudraksha.</span>
            </div>

            <div className="flex items-center gap-3 sm:gap-4 flex-wrap justify-center">
              {/* Payment Marks */}
              <span className="font-bold tracking-widest text-[#1A1F71] text-xs italic px-2 py-0.5 border border-[#EAE2D5] rounded bg-white">
                VISA
              </span>
              <div className="flex items-center px-1.5 py-1 border border-[#EAE2D5] rounded bg-white">
                <div className="w-3.5 h-3.5 rounded-full bg-[#EB001B] opacity-90" />
                <div className="w-3.5 h-3.5 rounded-full bg-[#F79E1B] -ml-1.5 opacity-90" />
              </div>
              <span className="font-bold text-[11px] tracking-tight px-1.5 py-0.5 border border-[#EAE2D5] rounded bg-white flex items-center gap-0.5">
                <span className="text-[#E76C24]">U</span>P<span className="text-[#097939]">I</span>
              </span>

              {/* Security Marks */}
              <div className="flex items-center gap-1.5 pl-3 border-l border-[#EAE2D5]">
                <Lock className="w-3.5 h-3.5 text-[#8C6D3B]" />
                <div className="text-[10px] leading-tight text-[#7A6A55]">
                  <span className="font-semibold text-[#5A4630] block">PCI DSS</span> Compliant
                </div>
              </div>

              <div className="flex items-center gap-1.5 pl-3 border-l border-[#EAE2D5]">
                <ShieldCheck className="w-4 h-4 text-[#8C6D3B]" />
                <div className="text-[10px] leading-tight text-[#7A6A55]">
                  <span className="font-semibold text-[#5A4630] block">256-bit</span> SSL Encryption
                </div>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};
