import React, { useState, useEffect, useMemo } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAppStore } from '../store';
import { useSEO } from '../lib/useSEO';
import { calculatePrice, formatINR, formatDateTime } from '../lib/pricing';
import { Card } from '../components/Card';
import { Badge } from '../components/Badge';
import { Button } from '../components/Button';
import { Toast } from '../components/Toast';
import { Modal } from '../components/Modal';
import { ProductCard } from '../components/ProductCard';
import {
  Heart,
  Truck,
  RotateCcw,
  Clock,
  Sparkles,
  ChevronDown,
  ChevronUp,
  AlertTriangle,
  Plus,
  Minus,
  Award,
  Lock,
  ArrowRight,
  Info,
  CheckCircle2,
  RotateCw,
  Video,
  ShieldCheck,
  HelpCircle,
  Share2,
  Copy,
  Tag,
  Check,
  Star,
  Download,
  FileText,
  Gift,
} from 'lucide-react';

export const ProductPage: React.FC = () => {
  const { slug = '' } = useParams<{ slug: string }>();
  const navigate = useNavigate();

  const {
    products,
    rates,
    isFeedStale,
    pricingConfig,
    wishlist,
    quotes,
    offers,
    demoMode,
    quoteLockSeconds,
    toggleWishlist,
    addToCart,
    createQuote,
    requote,
    tickRates,
  } = useAppStore();

  const product = products.find((p) => p.slug === slug);

  const fallbackTitle = slug
    ? slug
        .split('-')
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
        .join(' ')
    : 'Certified Precious Metals & Jewellery';

  const productTitle = product
    ? `${product.name} (${product.netWeightG ? `${product.netWeightG}g` : 'Authentic'})`
    : `${fallbackTitle} | Certified Luxury Collection`;

  const productDescription = product
    ? `${product.description} Guaranteed authentic ${product.category} certified by ${product.certificate.issuer} (Cert #${product.certificate.number}). Complimentary insured armoured delivery across serviceable pin codes.`
    : `Explore ${fallbackTitle} with verified laboratory authenticity certification, transparent spot pricing breakdown, and insured armoured transit.`;

  useSEO({
    title: productTitle,
    description: productDescription,
    canonicalPath: `/p/${slug}`,
  });

  const [activeImageIdx, setActiveImageIdx] = useState(0);
  const [galleryTab, setGalleryTab] = useState<'photos' | '360'>('photos');
  const [rotationAngle, setRotationAngle] = useState(45);
  const [faqOpenIdx, setFaqOpenIdx] = useState<number | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [accordionOpen, setAccordionOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Delivery Checker State
  const [deliveryPin, setDeliveryPin] = useState('');
  const [deliveryStatus, setDeliveryStatus] = useState<{
    type: 'idle' | 'success' | 'restricted' | 'invalid';
    message: string;
  }>({ type: 'idle', message: '' });

  // Certificate Modal State
  const [certModalOpen, setCertModalOpen] = useState(false);

  // Personalization Widget State
  const [personalizationActive, setPersonalizationActive] = useState(false);
  const [engravingText, setEngravingText] = useState('');
  const [recipientName, setRecipientName] = useState('');
  const [occasion, setOccasion] = useState('Anniversary');
  const [giftMessage, setGiftMessage] = useState('');
  const [packagingOption, setPackagingOption] = useState<'vault' | 'teak' | 'saffron'>('vault');
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [copiedCoupon, setCopiedCoupon] = useState<string | null>(null);

  // Active quote for this product
  const activeQuote = quotes.find(
    (q) => q.productId === product?.id && (q.status === 'Active' || q.status === 'Expired')
  );

  // Countdown timer state
  const [remainingSeconds, setRemainingSeconds] = useState<number>(0);

  const lockDuration = demoMode ? 60 : quoteLockSeconds;

  useEffect(() => {
    if (!activeQuote) {
      setRemainingSeconds(0);
      return;
    }

    const updateTimer = () => {
      const expiresAtMs = new Date(activeQuote.expiresAt).getTime();
      const diffSecs = Math.max(0, Math.floor((expiresAtMs - Date.now()) / 1000));
      setRemainingSeconds(diffSecs);
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [activeQuote]);

  const crossSellProducts = useMemo(() => {
    if (!product) return [];
    return products.filter((p) => p.id !== product.id).slice(0, 3);
  }, [products, product]);

  if (!product) {
    return (
      <div className="py-16 text-center space-y-4 max-w-md mx-auto">
        <h1 className="font-serif text-3xl font-bold text-[#5A4630]">Piece Not Found</h1>
        <p className="text-xs text-[#7A6A55]">
          The product you are looking for does not exist in our active inventory.
        </p>
        <Link to="/c/gold">
          <Button variant="primary" size="md">Browse Gold Collection</Button>
        </Link>
      </div>
    );
  }

  const isWishlisted = wishlist.includes(product.id);
  const basePriceCalc = calculatePrice(product, rates, pricingConfig);
  const availableStock = product.stock - product.reserved;
  const isQuoteExpired = activeQuote && (activeQuote.status === 'Expired' || remainingSeconds <= 0);

  // Personalization Fee calculation
  const packagingFee = packagingOption === 'teak' ? 350 : packagingOption === 'saffron' ? 150 : 0;
  const personalizationCharge = personalizationActive ? (product.personalizationCharge || 500) + packagingFee : 0;
  const finalUnitPrice = basePriceCalc.total + personalizationCharge;

  // Gallery 3 Views
  const galleryViews = [
    { title: 'Primary Proof Presentation', desc: 'Laser assay seal & packaging' },
    { title: 'Hallmark & Serial Micro-Ridge', desc: 'Precision macro authenticity' },
    { title: 'Archival Vault Storage Case', desc: 'Tamper-evident velvet presentation' },
  ];

  const handleDeliveryCheck = (pinToCheck?: string) => {
    const pin = (pinToCheck || deliveryPin).trim();
    if (!pin || pin.length !== 6 || !/^\d{6}$/.test(pin)) {
      setDeliveryStatus({
        type: 'invalid',
        message: 'Please enter a valid 6-digit Indian Postal PIN code.',
      });
      return;
    }

    if (pin.startsWith('9')) {
      setDeliveryStatus({
        type: 'restricted',
        message: `Armoured logistics is not serviceable for PIN ${pin}. High-value precious consignments cannot be delivered here. Please choose showroom vault pickup or an alternative delivery address.`,
      });
    } else {
      setDeliveryStatus({
        type: 'success',
        message: `PIN ${pin} is fully serviceable via Sequel / BVC Armoured Express. Estimated delivery: 2–4 business days with tamper-evident seal and double-OTP handoff.`,
      });
    }
  };

  const handleGetQuote = () => {
    if (isFeedStale) return;
    if (personalizationActive && !termsAccepted) {
      setToastMessage('Please accept the non-returnable terms for personalized pieces.');
      return;
    }
    const newQuote = createQuote(product.id, quantity);
    if (newQuote) {
      setToastMessage('Quote locked for 10 minutes at live spot rate!');
    }
  };

  const handleRequote = () => {
    if (isFeedStale || !activeQuote) return;
    requote(activeQuote.id);
    setToastMessage('Re-quoted successfully at current live spot rate!');
  };

  const handleAddToCart = () => {
    if (isQuoteExpired) {
      setToastMessage('Price lock has expired. Please requote before adding to cart.');
      return;
    }
    if (personalizationActive && !termsAccepted) {
      setToastMessage('Please accept the non-returnable terms for personalized pieces.');
      return;
    }
    const success = addToCart(product.id, quantity);
    if (success) {
      setToastMessage(`Added ${quantity}x ${product.name} to your cart.`);
      setTimeout(() => navigate('/cart'), 800);
    }
  };

  const handleCopyCoupon = (code: string) => {
    navigator.clipboard?.writeText(code);
    setCopiedCoupon(code);
    setToastMessage(`Coupon code ${code} copied to clipboard!`);
    setTimeout(() => setCopiedCoupon(null), 2500);
  };

  return (
    <div className="space-y-12 max-w-7xl mx-auto">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50">
          <Toast
            id="product-toast"
            type="success"
            title="Notification"
            message={toastMessage}
            onClose={() => setToastMessage(null)}
          />
        </div>
      )}

      {/* Breadcrumb */}
      <nav aria-label="Breadcrumb" className="text-xs text-[#7A6A55] flex items-center gap-1.5 flex-wrap">
        <Link to="/" className="hover:text-[#C9A24B]">Home</Link>
        <span className="text-[#EADFC8]">/</span>
        <Link to={`/c/${product.category}`} className="hover:text-[#C9A24B] capitalize">
          {product.category.replace('-', ' ')}
        </Link>
        <span className="text-[#EADFC8]">/</span>
        <span className="text-[#5A4630] font-medium font-serif line-clamp-1">{product.name}</span>
      </nav>

      {/* Main Product Showcase Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
        {/* Left Column: Gallery with Video/360 Tab (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          {/* Gallery Mode Switcher */}
          <div className="flex items-center gap-3 border-b border-[#EADFC8] pb-2">
            <button
              type="button"
              onClick={() => setGalleryTab('photos')}
              className={`pb-1 text-xs font-bold transition-all border-b-2 flex items-center gap-1.5 ${
                galleryTab === 'photos'
                  ? 'border-[#C9A24B] text-[#5A4630]'
                  : 'border-transparent text-[#7A6A55] hover:text-[#5A4630]'
              }`}
            >
              <span>Still Photos ({galleryViews.length})</span>
            </button>
            <button
              type="button"
              onClick={() => setGalleryTab('360')}
              className={`pb-1 text-xs font-bold transition-all border-b-2 flex items-center gap-1.5 ${
                galleryTab === '360'
                  ? 'border-[#C9A24B] text-[#5A4630]'
                  : 'border-transparent text-[#7A6A55] hover:text-[#5A4630]'
              }`}
            >
              <RotateCw className="w-3.5 h-3.5 text-[#C9A24B]" />
              <span>Video / 360° Inspection</span>
            </button>
          </div>

          {galleryTab === '360' ? (
            /* 360 & Video Viewer */
            <div className="relative aspect-4/3 rounded-2xl bg-gradient-to-br from-[#FFFDF7] via-[#FAF1DB] to-[#F1E3BD] border border-[#C9A24B] p-6 flex flex-col items-center justify-between text-center shadow-[0_4px_24px_rgba(90,70,48,0.08)] overflow-hidden">
              <div className="w-full flex items-center justify-between">
                <span className="text-[11px] font-mono uppercase tracking-widest font-bold text-[#7A6A55] flex items-center gap-1">
                  <Video className="w-3.5 h-3.5 text-[#C9A24B]" />
                  <span>4K Macro Video & Turntable</span>
                </span>
                <Badge variant="gold" size="sm">360° Inspection</Badge>
              </div>

              {/* Turntable Simulation */}
              <div
                className="w-44 h-44 rounded-2xl overflow-hidden border-2 border-[#C9A24B] shadow-lg transition-transform duration-100 bg-[#FAF6EE]"
                style={{ transform: `rotate(${rotationAngle}deg)` }}
              >
                <img
                  src={product.imageUrl || `/products/${product.id}.jpg`}
                  alt={product.name}
                  className="w-full h-full object-cover pointer-events-none select-none"
                />
              </div>

              {/* Turntable Slider Controls */}
              <div className="w-full space-y-2 bg-white/80 p-3 rounded-xl border border-[#EADFC8]">
                <div className="flex items-center justify-between text-[11px] text-[#5A4630] font-medium">
                  <span className="flex items-center gap-1">
                    <RotateCw className="w-3 h-3 text-[#C9A24B]" />
                    <span>Drag to Rotate 360°</span>
                  </span>
                  <span className="font-mono">{rotationAngle}° Angle</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="360"
                  value={rotationAngle}
                  onChange={(e) => setRotationAngle(Number(e.target.value))}
                  className="w-full accent-[#C9A24B] cursor-ew-resize"
                />
              </div>
            </div>
          ) : (
            /* Main Selected Image Tile */
            <div className="relative aspect-4/3 rounded-2xl border border-[#EADFC8] bg-[#FAF6EE] shadow-[0_4px_24px_rgba(90,70,48,0.08)] overflow-hidden group">
              <img
                src={product.imageUrl || `/products/${product.id}.jpg`}
                alt={product.name}
                className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
              />

              {/* View Overlay Description */}
              <div className="absolute bottom-0 inset-x-0 p-4 bg-gradient-to-t from-black/65 via-black/25 to-transparent text-white flex items-end justify-between">
                <div>
                  <div className="text-xs font-serif font-bold text-white drop-shadow-xs">
                    {galleryViews[activeImageIdx].title}
                  </div>
                  <div className="text-[11px] text-white/80 drop-shadow-xs">
                    {galleryViews[activeImageIdx].desc}
                  </div>
                </div>
                <span className="text-[10px] font-mono uppercase tracking-widest px-2.5 py-0.5 rounded-full bg-white/20 backdrop-blur-xs border border-white/30 text-white font-bold">
                  {product.metal || product.attributes.gemstone?.variety || 'Certified'}
                </span>
              </div>

              {/* In stock badge overlay */}
              <div className="absolute top-4 left-4 z-10">
                {availableStock <= 0 ? (
                  <Badge variant="coral" size="sm">Out of Stock</Badge>
                ) : availableStock <= 3 ? (
                  <Badge variant="amber" size="sm">Only {availableStock} left</Badge>
                ) : (
                  <Badge variant="sage" size="sm">In Stock</Badge>
                )}
              </div>
            </div>
          )}

          {/* 3 Thumbnails (Visible in Photo Mode) */}
          {galleryTab === 'photos' && (
            <div className="grid grid-cols-3 gap-2 sm:gap-3">
              {galleryViews.map((view, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setActiveImageIdx(idx)}
                  className={`p-1.5 sm:p-2 rounded-xl border text-left transition-all flex flex-col sm:flex-row items-center sm:items-start gap-1.5 sm:gap-2.5 overflow-hidden cursor-pointer ${
                    activeImageIdx === idx
                      ? 'bg-[#F8EFD9] border-[#C9A24B] shadow-xs ring-1 ring-[#C9A24B]'
                      : 'bg-white border-[#EADFC8] hover:bg-[#FFFBF3]'
                  }`}
                >
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg overflow-hidden shrink-0 border border-[#EADFC8] bg-[#FAF6EE]">
                    <img
                      src={product.imageUrl || `/products/${product.id}.jpg`}
                      alt={view.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="min-w-0 flex-1 text-center sm:text-left">
                    <div className="text-[9px] sm:text-[10px] font-bold text-[#C9A24B] uppercase tracking-wider">
                      View {idx + 1}
                    </div>
                    <div className="text-[11px] sm:text-xs font-serif font-bold text-[#5A4630] truncate">
                      {view.title}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}

          {/* Certificate Block with View Certificate Modal Trigger */}
          <div className="p-4 bg-[#FFFFFF] border border-[#EADFC8] rounded-[12px] space-y-2.5 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#5A4630] flex items-center gap-1.5 uppercase tracking-wider">
                <Award className="w-4 h-4 text-[#C9A24B]" />
                Laboratory Assay Certificate
              </span>
              <Badge variant="sage" size="sm">{product.certificate.status}</Badge>
            </div>
            <div className="text-xs text-[#7A6A55] space-y-0.5">
              <div>Issuer: <strong>{product.certificate.issuer}</strong></div>
              <div className="font-mono">Cert Number: <strong>{product.certificate.number}</strong></div>
              {product.huid && (
                <div className="font-mono text-[#C9A24B]">
                  BIS HUID: <strong>{product.huid}</strong>
                </div>
              )}
            </div>
            <div className="pt-1 flex items-center justify-between gap-3 border-t border-[#EADFC8]/60">
              <button
                type="button"
                onClick={() => setCertModalOpen(true)}
                className="text-xs text-[#C9A24B] hover:underline font-semibold flex items-center gap-1"
              >
                <FileText className="w-3.5 h-3.5" />
                <span>View Full Assay Dossier</span>
              </button>
              <Link
                to={`/verify/${product.certificate.number}`}
                className="text-xs text-[#7A6A55] hover:text-[#5A4630] font-medium flex items-center gap-1"
              >
                <span>Verify Online</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          {/* Interactive Delivery Checker Widget (G) */}
          <div className="p-4 bg-white border border-[#EADFC8] rounded-[12px] space-y-3 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#5A4630] uppercase tracking-wider flex items-center gap-1.5">
                <Truck className="w-4 h-4 text-[#C9A24B]" />
                Armoured Transit PIN Checker
              </span>
              <Badge variant="gold" size="sm">Insured Delivery</Badge>
            </div>
            <p className="text-[11px] text-[#7A6A55]">
              Verify armoured carrier serviceability and estimated delivery timeframe for your destination PIN code.
            </p>

            <div className="flex gap-2">
              <input
                type="text"
                maxLength={6}
                placeholder="Enter 6-digit PIN (e.g. 400001)"
                value={deliveryPin}
                onChange={(e) => {
                  setDeliveryPin(e.target.value.replace(/\D/g, ''));
                  if (deliveryStatus.type !== 'idle') setDeliveryStatus({ type: 'idle', message: '' });
                }}
                className="flex-1 text-xs px-3 py-2 bg-[#FFFBF3] border border-[#EADFC8] rounded-md text-[#5A4630] focus:outline-none focus:ring-1 focus:ring-[#C9A24B]"
              />
              <Button
                variant="primary"
                size="sm"
                onClick={() => handleDeliveryCheck()}
              >
                Check PIN
              </Button>
            </div>

            {/* Quick Test PIN Chips */}
            <div className="flex items-center gap-1.5 flex-wrap text-[10px] text-[#7A6A55]">
              <span>Sample PINs:</span>
              <button
                type="button"
                onClick={() => {
                  setDeliveryPin('400001');
                  handleDeliveryCheck('400001');
                }}
                className="px-2 py-0.5 rounded bg-[#F8EFD9] hover:bg-[#F1E3BD] text-[#5A4630] font-mono"
              >
                400001 (Mumbai)
              </button>
              <button
                type="button"
                onClick={() => {
                  setDeliveryPin('110001');
                  handleDeliveryCheck('110001');
                }}
                className="px-2 py-0.5 rounded bg-[#F8EFD9] hover:bg-[#F1E3BD] text-[#5A4630] font-mono"
              >
                110001 (Delhi)
              </button>
              <button
                type="button"
                onClick={() => {
                  setDeliveryPin('900001');
                  handleDeliveryCheck('900001');
                }}
                className="px-2 py-0.5 rounded bg-[#FFEBEE] hover:bg-[#FFCDD2] text-[#C62828] font-mono"
              >
                900001 (Restricted)
              </button>
            </div>

            {/* Result message */}
            {deliveryStatus.type !== 'idle' && (
              <div
                className={`p-2.5 rounded-lg text-xs leading-relaxed border ${
                  deliveryStatus.type === 'success'
                    ? 'bg-[#E8F5E9] text-[#2D5A27] border-[#C8E6C9]'
                    : deliveryStatus.type === 'restricted'
                    ? 'bg-[#FFEBEE] text-[#C62828] border-[#FFCDD2]'
                    : 'bg-[#FFF8E1] text-[#F57F17] border-[#FFE082]'
                }`}
              >
                <div className="flex items-start gap-2">
                  {deliveryStatus.type === 'success' && <CheckCircle2 className="w-4 h-4 text-[#2D5A27] shrink-0 mt-0.5" />}
                  {deliveryStatus.type === 'restricted' && <AlertTriangle className="w-4 h-4 text-[#C62828] shrink-0 mt-0.5" />}
                  <span>{deliveryStatus.message}</span>
                </div>
              </div>
            )}

            <div className="pt-2 border-t border-[#EADFC8]/60 text-[11px] text-[#7A6A55] space-y-1">
              <div className="flex items-center gap-1.5 font-medium text-[#5A4630]">
                <ShieldCheck className="w-3.5 h-3.5 text-[#2D5A27]" />
                <span>Sequel & BVC Armoured Transit • Fully Insured</span>
              </div>
              <div>
                <strong>Statutory Notice:</strong> Cash on Delivery (COD) is strictly prohibited for bullion and precious jewellery consignments under anti-money laundering and courier transit regulations.
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Title, Specs, Price Breakdown & Quote Lock Box (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Header & Wishlist */}
          <div className="space-y-2">
            <div className="flex items-center justify-between gap-4">
              <span className="text-xs font-mono font-medium text-[#7A6A55]">
                SKU: {product.sku} • Lot: {product.lotBatchSerial}
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard?.writeText(window.location.href);
                    setToastMessage('Link copied to clipboard!');
                  }}
                  className="p-2 rounded-full border border-[#EADFC8] bg-white text-[#7A6A55] hover:text-[#C9A24B] hover:bg-[#FFFBF3]"
                  title="Share this article"
                >
                  <Share2 className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => toggleWishlist(product.id)}
                  className={`p-2 sm:px-3 rounded-full border transition-colors flex items-center gap-1.5 text-xs font-medium ${
                    isWishlisted
                      ? 'bg-[#F1E3BD] border-[#C9A24B] text-[#5A4630]'
                      : 'bg-white border-[#EADFC8] text-[#7A6A55] hover:text-[#C9A24B]'
                  }`}
                >
                  <Heart className={`w-4 h-4 ${isWishlisted ? 'text-[#C9A24B] fill-[#C9A24B]' : ''}`} />
                  <span className="hidden sm:inline">{isWishlisted ? 'Saved' : 'Save'}</span>
                </button>
              </div>
            </div>

            <h1 className="font-serif text-2xl sm:text-3xl md:text-4xl font-bold text-[#5A4630] leading-tight">
              {product.name}
            </h1>

            <div className="flex items-center gap-2 text-xs">
              <span className="flex items-center gap-1 text-[#BA8332] font-semibold">
                <Star className="w-4 h-4 fill-[#BA8332]" />
                <span>{(product.rating || 4.9).toFixed(1)} / 5.0</span>
              </span>
              <span className="text-[#EADFC8]">•</span>
              <span className="text-[#7A6A55]">38 Verified Collector Reviews</span>
              {product.huid && (
                <>
                  <span className="text-[#EADFC8]">•</span>
                  <span className="font-mono text-[#C9A24B] font-semibold">HUID: {product.huid}</span>
                </>
              )}
            </div>

            <p className="text-xs sm:text-sm text-[#7A6A55] leading-relaxed pt-1">
              {product.description}
            </p>
          </div>

          {/* Category-Specific Specifications Table */}
          <Card variant="surface" className="p-0 border-[#EADFC8] overflow-hidden">
            <div className="px-5 py-3 bg-[#F8EFD9] border-b border-[#EADFC8] text-xs font-bold text-[#5A4630] uppercase tracking-wider flex items-center justify-between">
              <span>Item Specifications</span>
              <span className="font-mono text-[10px] text-[#7A6A55]">HSN {product.hsn || '7108'} • GST 3%</span>
            </div>
            <div className="divide-y divide-[#EADFC8] text-xs">
              {/* Bullion Specs */}
              {product.attributes.bullion && (
                <>
                  <div className="grid grid-cols-2 p-3">
                    <span className="text-[#7A6A55]">Metal & Purity Standard:</span>
                    <span className="font-semibold text-[#5A4630]">
                      {product.attributes.bullion.metal} • {product.attributes.bullion.purity} Pure
                    </span>
                  </div>
                  <div className="grid grid-cols-2 p-3 bg-[#FFFBF3]/50">
                    <span className="text-[#7A6A55]">Gross / Net Weight:</span>
                    <span className="font-semibold text-[#5A4630] tabular-nums">{product.grossWeightG}g / {product.netWeightG}g</span>
                  </div>
                  <div className="grid grid-cols-2 p-3">
                    <span className="text-[#7A6A55]">Fine Pure Metal Weight:</span>
                    <span className="font-semibold text-[#5A4630] tabular-nums">{product.attributes.bullion.fineWeightG}g Fine Gold</span>
                  </div>
                  <div className="grid grid-cols-2 p-3 bg-[#FFFBF3]/50">
                    <span className="text-[#7A6A55]">Refinery & Assay Bureau:</span>
                    <span className="font-semibold text-[#5A4630]">{product.attributes.bullion.assayManufacturer}</span>
                  </div>
                </>
              )}

              {/* Gemstone Specs */}
              {product.attributes.gemstone && (
                <>
                  <div className="grid grid-cols-2 p-3">
                    <span className="text-[#7A6A55]">Variety & Mineral Species:</span>
                    <span className="font-semibold text-[#5A4630]">{product.attributes.gemstone.variety}</span>
                  </div>
                  <div className="grid grid-cols-2 p-3 bg-[#FFFBF3]/50">
                    <span className="text-[#7A6A55]">Carat Weight & Cut Style:</span>
                    <span className="font-semibold text-[#5A4630] tabular-nums">{product.attributes.gemstone.caratWeight} ct ({product.attributes.gemstone.cut})</span>
                  </div>
                  <div className="grid grid-cols-2 p-3">
                    <span className="text-[#7A6A55]">Color Tone & Optical Clarity:</span>
                    <span className="font-semibold text-[#5A4630]">{product.attributes.gemstone.color} • {product.attributes.gemstone.clarity}</span>
                  </div>
                  <div className="grid grid-cols-2 p-3 bg-[#FFFBF3]/50">
                    <span className="text-[#7A6A55]">Geographical Origin Provenance:</span>
                    <span className="font-semibold text-[#5A4630]">{product.attributes.gemstone.origin}</span>
                  </div>
                </>
              )}

              {/* Rudraksha Specs */}
              {product.attributes.rudraksha && (
                <>
                  <div className="grid grid-cols-2 p-3">
                    <span className="text-[#7A6A55]">Natural Mukhi Furrows:</span>
                    <span className="font-semibold text-[#5A4630]">{product.attributes.rudraksha.mukhi} Mukhi</span>
                  </div>
                  <div className="grid grid-cols-2 p-3 bg-[#FFFBF3]/50">
                    <span className="text-[#7A6A55]">Bead Count & Diameter:</span>
                    <span className="font-semibold text-[#5A4630]">{product.attributes.rudraksha.beadCount || 1} Bead(s) • {product.attributes.rudraksha.sizeMm || 18}mm</span>
                  </div>
                  <div className="grid grid-cols-2 p-3">
                    <span className="text-[#7A6A55]">Thread / Sacred Capping:</span>
                    <span className="font-semibold text-[#5A4630]">{product.attributes.rudraksha.thread} ({product.attributes.rudraksha.metalCapping || 'Uncapped'})</span>
                  </div>
                  <div className="grid grid-cols-2 p-3 bg-[#FFFBF3]/50">
                    <span className="text-[#7A6A55]">Himalayan Sacred Provenance:</span>
                    <span className="font-semibold text-[#5A4630]">{product.attributes.rudraksha.provenance}</span>
                  </div>
                </>
              )}

              {/* Dimensions and Care */}
              {product.dimensions && (
                <div className="grid grid-cols-2 p-3">
                  <span className="text-[#7A6A55]">Physical Dimensions:</span>
                  <span className="font-medium text-[#5A4630]">{product.dimensions}</span>
                </div>
              )}
              <div className="grid grid-cols-2 p-3 bg-[#FFFBF3]/50">
                <span className="text-[#7A6A55]">Custody & Care Instructions:</span>
                <span className="text-[#5A4630]">Store in airtight assay blister pack. Avoid harsh detergents and ultrasonic cleaners.</span>
              </div>
            </div>
          </Card>

          {/* Personalization Widget (A) */}
          {product.personalizationEligible && (
            <Card variant="surface" className="p-5 border-[#C9A24B] bg-[#FFFDF7] space-y-4 shadow-sm">
              <div className="flex items-center justify-between pb-2 border-b border-[#EADFC8]">
                <div className="flex items-center gap-2">
                  <Gift className="w-4 h-4 text-[#C9A24B]" />
                  <span className="text-xs font-bold text-[#5A4630] uppercase tracking-wider font-serif">
                    Custom Laser Engraving & Presentation (Optional)
                  </span>
                </div>
                <Badge variant={personalizationActive ? 'gold' : 'neutral'} size="sm">
                  {personalizationActive ? 'Active (+₹500)' : 'Available'}
                </Badge>
              </div>

              <label className="flex items-center gap-2.5 text-xs text-[#5A4630] cursor-pointer">
                <input
                  type="checkbox"
                  checked={personalizationActive}
                  onChange={(e) => setPersonalizationActive(e.target.checked)}
                  className="rounded text-[#C9A24B] focus:ring-[#C9A24B] border-[#EADFC8]"
                />
                <span className="font-semibold">
                  Personalize this piece with custom laser engraving & gift packaging (+₹500, +2 days lead time)
                </span>
              </label>

              {personalizationActive && (
                <div className="space-y-4 pt-2 border-t border-[#EADFC8]/60 text-xs">
                  {/* Engraving Text with 30-char limit */}
                  <div className="space-y-1">
                    <div className="flex justify-between items-center text-[11px] text-[#5A4630]">
                      <span className="font-semibold">Laser Engraving Inscription (Back / Rim):</span>
                      <span className={`font-mono ${engravingText.length > 30 ? 'text-[#C62828] font-bold' : 'text-[#7A6A55]'}`}>
                        {engravingText.length}/30 characters
                      </span>
                    </div>
                    <input
                      type="text"
                      maxLength={30}
                      placeholder="e.g. A&V • 26.10.2026 • Forever"
                      value={engravingText}
                      onChange={(e) => setEngravingText(e.target.value)}
                      className="w-full text-xs px-3 py-2 bg-white border border-[#EADFC8] rounded-md text-[#5A4630] focus:ring-1 focus:ring-[#C9A24B] font-serif"
                    />
                  </div>

                  {/* Recipient & Occasion */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <span className="text-[11px] font-semibold text-[#5A4630]">Recipient Name:</span>
                      <input
                        type="text"
                        placeholder="e.g. Vikramaditya Sharma"
                        value={recipientName}
                        onChange={(e) => setRecipientName(e.target.value)}
                        className="w-full text-xs px-3 py-2 bg-white border border-[#EADFC8] rounded-md text-[#5A4630]"
                      />
                    </div>
                    <div className="space-y-1">
                      <span className="text-[11px] font-semibold text-[#5A4630]">Auspicious Occasion:</span>
                      <select
                        value={occasion}
                        onChange={(e) => setOccasion(e.target.value)}
                        className="w-full text-xs px-3 py-2 bg-white border border-[#EADFC8] rounded-md text-[#5A4630]"
                      >
                        <option value="Anniversary">Wedding Anniversary</option>
                        <option value="Wedding">Vivaha & Wedding Milestone</option>
                        <option value="Diwali">Dhanteras & Deepavali Blessing</option>
                        <option value="Corporate">Corporate Honour & Retirement</option>
                        <option value="Housewarming">Griha Pravesh Housewarming</option>
                      </select>
                    </div>
                  </div>

                  {/* Gift Message */}
                  <div className="space-y-1">
                    <div className="flex justify-between items-center text-[11px] text-[#5A4630]">
                      <span className="font-semibold">Calligraphy Gift Message (on Golden Card):</span>
                      <span className="text-[10px] text-[#7A6A55] font-mono">{giftMessage.length}/120</span>
                    </div>
                    <textarea
                      maxLength={120}
                      rows={2}
                      placeholder="Wishing you lifelong abundance, health and celestial joy..."
                      value={giftMessage}
                      onChange={(e) => setGiftMessage(e.target.value)}
                      className="w-full text-xs px-3 py-2 bg-white border border-[#EADFC8] rounded-md text-[#5A4630]"
                    />
                  </div>

                  {/* Packaging selector */}
                  <div className="space-y-1.5">
                    <span className="text-[11px] font-semibold text-[#5A4630]">Luxury Presentation Packaging:</span>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      {[
                        { id: 'vault', label: 'Vault Blister Case', fee: 0 },
                        { id: 'teak', label: 'Handcrafted Teak Chest', fee: 350 },
                        { id: 'saffron', label: 'Sacred Saffron Pouch', fee: 150 },
                      ].map((pkg) => (
                        <button
                          key={pkg.id}
                          type="button"
                          onClick={() => setPackagingOption(pkg.id as any)}
                          className={`p-2.5 rounded-lg border text-left text-xs transition-all ${
                            packagingOption === pkg.id
                              ? 'bg-[#F8EFD9] border-[#C9A24B] shadow-xs'
                              : 'bg-white border-[#EADFC8] hover:bg-[#FFFBF3]'
                          }`}
                        >
                          <div className="font-semibold text-[#5A4630]">{pkg.label}</div>
                          <div className="text-[10px] text-[#7A6A55]">
                            {pkg.fee === 0 ? 'Complimentary' : `+${formatINR(pkg.fee)}`}
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Live Visual Engraving Preview Card */}
                  {engravingText && (
                    <div className="p-4 bg-gradient-to-r from-[#FAF6EE] via-[#F8EFD9] to-[#FAF6EE] rounded-xl border border-[#C9A24B] text-center space-y-1.5 shadow-inner">
                      <div className="text-[10px] uppercase font-bold text-[#7A6A55] tracking-widest">
                        Live Laser Engraving Preview
                      </div>
                      <div className="font-serif italic text-base sm:text-lg font-bold text-[#5A4630] tracking-wide">
                        "{engravingText}"
                      </div>
                      <div className="text-[10px] text-[#7A6A55]">
                        High-precision fiber laser etched into {product.metal || 'precious surface'}
                      </div>
                    </div>
                  )}

                  {/* Mandatory Non-Returnable Acceptance */}
                  <div className="p-3 bg-[#FFF3E0] rounded-lg border border-[#FFE0B2] space-y-1.5">
                    <label className="flex items-start gap-2 cursor-pointer text-[11px] text-[#E65100]">
                      <input
                        type="checkbox"
                        checked={termsAccepted}
                        onChange={(e) => setTermsAccepted(e.target.checked)}
                        className="rounded text-[#E65100] focus:ring-[#E65100] mt-0.5 shrink-0"
                      />
                      <span className="leading-snug">
                        <strong>Mandatory Cancellation & Return Policy:</strong> I acknowledge and accept that personalized and laser-engraved precious articles are custom manufactured and therefore <strong>strictly non-returnable</strong> and cannot be canceled once production commences.
                      </span>
                    </label>
                  </div>
                </div>
              )}
            </Card>
          )}

          {/* 2. PRICE BREAKDOWN CARD */}
          <Card variant="surface" className="p-6 border-[#EADFC8] space-y-4 shadow-[0_4px_20px_rgba(90,70,48,0.06)]">
            <div className="flex items-center justify-between pb-3 border-b border-[#EADFC8]">
              <div>
                <span className="text-xs font-bold text-[#5A4630] uppercase tracking-wider">
                  Transparent Price Breakdown
                </span>
                <div className="text-[11px] text-[#7A6A55] mt-0.5">
                  Calculated at{' '}
                  <strong className="text-[#C9A24B]">
                    {formatINR(basePriceCalc.ratePerGram)}/g
                  </strong>
                  , MCX benchmark updated {formatDateTime(rates.lastUpdated)}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    tickRates();
                    setToastMessage('Live spot rate refreshed from MCX Mumbai feed.');
                  }}
                  className="p-1 text-[#7A6A55] hover:text-[#C9A24B] rounded"
                  title="Refresh Spot Rate"
                >
                  <RotateCw className="w-3.5 h-3.5" />
                </button>
                <Badge variant="gold" size="sm">Formula {pricingConfig.formulaVersion}</Badge>
              </div>
            </div>

            {/* Breakdown lines */}
            <div className="space-y-2 text-xs">
              <div className="flex justify-between text-[#7A6A55]">
                <span>Metal Value ({basePriceCalc.fineWeightG > 0 ? `${basePriceCalc.fineWeightG}g pure` : 'Base price'}):</span>
                <span className="tabular-nums font-medium text-[#5A4630]">{formatINR(basePriceCalc.metalValue)}</span>
              </div>
              {basePriceCalc.makingCharges > 0 && (
                <div className="flex justify-between text-[#7A6A55]">
                  <span>Minting & Making Charges ({(product.makingPercent * 100).toFixed(1)}%):</span>
                  <span className="tabular-nums font-medium text-[#5A4630]">{formatINR(basePriceCalc.makingCharges)}</span>
                </div>
              )}
              <div className="flex justify-between text-[#7A6A55]">
                <span>Assay, Security Packaging & Transit Cover:</span>
                <span className="tabular-nums font-medium text-[#5A4630]">
                  {formatINR(basePriceCalc.packagingCharges + basePriceCalc.insuranceCharges)}
                </span>
              </div>
              {personalizationCharge > 0 && (
                <div className="flex justify-between text-[#2D5A27] font-medium">
                  <span>Custom Laser Engraving & Packaging (+2 days):</span>
                  <span className="tabular-nums">{formatINR(personalizationCharge)}</span>
                </div>
              )}
              <div className="flex justify-between text-[#7A6A55]">
                <span>GST (3% statutory bullion & jewellery tax):</span>
                <span className="tabular-nums font-medium text-[#5A4630]">{formatINR(basePriceCalc.gstAmount)}</span>
              </div>

              {/* Total & MRP */}
              <div className="pt-3 border-t border-[#EADFC8] flex items-baseline justify-between">
                <div>
                  <span className="font-serif text-lg font-bold text-[#5A4630]">Total Price</span>
                  <span className="text-[11px] text-[#7A6A55] ml-1.5">(All statutory taxes included)</span>
                </div>
                <div className="text-right">
                  <div className="font-serif text-3xl font-bold text-[#5A4630] tabular-nums">
                    {formatINR(finalUnitPrice * quantity)}
                  </div>
                  {product.mrp > finalUnitPrice && (
                    <div className="text-xs text-[#7A6A55]">
                      MRP <span className="line-through">{formatINR(product.mrp * quantity)}</span>{' '}
                      <span className="text-[#2D5A27] font-semibold">
                        (Save {formatINR((product.mrp - finalUnitPrice) * quantity)})
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </Card>

          {/* 3. DYNAMIC QUOTE LOCK BOX (for rateLinked) OR CART CONTROLS (for fixed) */}
          {product.type === 'rateLinked' ? (
            <div className="space-y-4">
              {/* Active Quote State */}
              {activeQuote ? (
                <div
                  className={`p-6 rounded-[12px] border transition-all ${
                    isQuoteExpired
                      ? 'bg-[#FBE7B8] border-[#E8C26E] text-[#7A5310]'
                      : 'bg-[#FFFBF3] border-[#C9A24B] shadow-[0_4px_24px_rgba(201,162,75,0.15)]'
                  }`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Lock className="w-5 h-5 text-[#C9A24B]" />
                      <span className="text-xs font-bold uppercase tracking-wider font-serif">
                        {isQuoteExpired ? 'Rate Lock Expired' : '10-Minute Rate Lock Active'}
                      </span>
                    </div>

                    {!isQuoteExpired && (
                      <div className="flex items-center gap-1.5 font-mono text-sm font-bold text-[#C9A24B] bg-white px-3 py-1 rounded-full border border-[#EADFC8]">
                        <Clock className="w-4 h-4 animate-spin text-[#C9A24B]" />
                        <span>
                          {String(Math.floor(remainingSeconds / 60)).padStart(2, '0')}:
                          {String(remainingSeconds % 60).padStart(2, '0')}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Shrinking countdown progress bar */}
                  {!isQuoteExpired && (
                    <div className="w-full bg-[#EADFC8] h-1.5 rounded-full overflow-hidden mb-4">
                      <div
                        className="bg-[#C9A24B] h-full transition-all duration-1000 ease-linear rounded-full"
                        style={{
                          width: `${Math.max(0, Math.min(100, (remainingSeconds / lockDuration) * 100))}%`,
                        }}
                      />
                    </div>
                  )}

                  {/* Rate Comparison Details */}
                  <div className="space-y-1.5 text-xs mb-5">
                    <div className="flex justify-between items-baseline">
                      <span className="text-[#7A6A55]">Your Locked Rate:</span>
                      <strong className="font-serif text-lg text-[#5A4630] tabular-nums">
                        {formatINR((activeQuote.priceBreakdown.total + personalizationCharge) * quantity)}
                      </strong>
                    </div>
                    <div className="text-[11px] text-[#7A6A55]">
                      Live MCX benchmark now <strong>{formatINR(rates.gold24k)}/g</strong> (your locked rate snapshot <strong>{formatINR(activeQuote.ratePerGramSnapshot)}/g</strong>)
                    </div>
                  </div>

                  {/* Actions depending on expiry */}
                  {isQuoteExpired ? (
                    <div className="space-y-3">
                      <div className="p-3 bg-[#FFF3E0] rounded-lg border border-[#FFE0B2] text-xs text-[#E65100] flex items-start gap-2">
                        <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                        <div>
                          <strong>Rate Lock Expired:</strong> Live market precious rates have shifted. Payment and cart checkout are paused until repriced. Please requote to lock in the latest valid market price.
                        </div>
                      </div>
                      <Button
                        variant="primary"
                        className="w-full bg-[#7A5310] hover:bg-[#63430c]"
                        onClick={handleRequote}
                        disabled={isFeedStale}
                        leftIcon={<RotateCcw className="w-4 h-4" />}
                      >
                        {isFeedStale ? 'Rates Delayed. Quotes Paused' : 'Requote at Current Live Spot Rate'}
                      </Button>
                    </div>
                  ) : (
                    <div className="flex flex-col sm:flex-row gap-3">
                      <Button
                        variant="primary"
                        className="flex-1"
                        onClick={handleAddToCart}
                        leftIcon={<CheckCircle2 className="w-4 h-4" />}
                      >
                        Add to Cart with Locked Price
                      </Button>
                    </div>
                  )}
                </div>
              ) : (
                /* No Active Quote: Show Quantity Stepper + "Get Quote" Button */
                <div className="space-y-4 p-5 bg-[#FFFFFF] border border-[#EADFC8] rounded-[12px]">
                  <div className="flex items-center gap-4">
                    <div className="text-xs font-semibold text-[#5A4630]">Select Quantity:</div>
                    <div className="flex items-center border border-[#EADFC8] rounded-md bg-[#FFFBF3]">
                      <button
                        type="button"
                        onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                        disabled={quantity <= 1}
                        className="p-2 text-[#7A6A55] hover:bg-[#F8EFD9] disabled:opacity-30 rounded-l-md"
                        aria-label="Decrease quantity"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="w-10 text-center font-serif font-bold text-sm text-[#5A4630] tabular-nums">
                        {quantity}
                      </span>
                      <button
                        type="button"
                        onClick={() => setQuantity((q) => Math.min(availableStock, q + 1))}
                        disabled={quantity >= availableStock}
                        className="p-2 text-[#7A6A55] hover:bg-[#F8EFD9] disabled:opacity-30 rounded-r-md"
                        aria-label="Increase quantity"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {isFeedStale ? (
                    <div className="p-3 bg-[#FBE7B8] border border-[#E8C26E] rounded-md text-xs text-[#7A5310] flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 shrink-0" />
                      <span>Rates delayed. Quotes are paused until feed connectivity restores.</span>
                    </div>
                  ) : null}

                  <Button
                    variant="primary"
                    size="lg"
                    className="w-full"
                    disabled={isFeedStale || availableStock <= 0}
                    onClick={handleGetQuote}
                    leftIcon={<Lock className="w-4 h-4" />}
                  >
                    {isFeedStale
                      ? 'Rates delayed. Quotes are paused.'
                      : availableStock <= 0
                      ? 'Out of Stock'
                      : 'Get Quote (Lock Price for 10 Mins)'}
                  </Button>
                </div>
              )}
            </div>
          ) : (
            /* Fixed Price Products: Quantity Stepper + Add To Cart */
            <div className="space-y-4 p-5 bg-[#FFFFFF] border border-[#EADFC8] rounded-[12px]">
              <div className="flex items-center gap-4">
                <div className="text-xs font-semibold text-[#5A4630]">Select Quantity:</div>
                <div className="flex items-center border border-[#EADFC8] rounded-md bg-[#FFFBF3]">
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    disabled={quantity <= 1}
                    className="p-2 text-[#7A6A55] hover:bg-[#F8EFD9] disabled:opacity-30 rounded-l-md"
                    aria-label="Decrease quantity"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span className="w-10 text-center font-serif font-bold text-sm text-[#5A4630] tabular-nums">
                    {quantity}
                  </span>
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => Math.min(availableStock, q + 1))}
                    disabled={quantity >= availableStock}
                    className="p-2 text-[#7A6A55] hover:bg-[#F8EFD9] disabled:opacity-30 rounded-r-md"
                    aria-label="Increase quantity"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <Button
                variant="primary"
                size="lg"
                className="w-full"
                disabled={availableStock <= 0}
                onClick={handleAddToCart}
                leftIcon={<Sparkles className="w-4 h-4" />}
              >
                {availableStock <= 0 ? 'Out of Stock' : 'Add to Shopping Cart'}
              </Button>
            </div>
          )}

          {/* Eligible Offers & Coupons Module (A) */}
          {offers && offers.length > 0 && (
            <div className="p-4 bg-white border border-[#EADFC8] rounded-xl space-y-3 shadow-xs">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs font-bold text-[#5A4630] uppercase tracking-wider">
                  <Tag className="w-3.5 h-3.5 text-[#C9A24B]" />
                  <span>Eligible Offers & Promos</span>
                </div>
                <Badge variant="gold" size="sm">Margin Guarded</Badge>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                {offers.slice(0, 2).map((offer) => (
                  <div
                    key={offer.id}
                    className="p-3 bg-[#FFFBF3] border border-[#EADFC8] rounded-lg flex flex-col justify-between space-y-2"
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="font-mono font-bold text-[#C9A24B]">{offer.code}</span>
                        <button
                          type="button"
                          onClick={() => handleCopyCoupon(offer.code)}
                          className="text-[11px] text-[#5A4630] hover:text-[#C9A24B] flex items-center gap-1 font-medium"
                        >
                          {copiedCoupon === offer.code ? (
                            <>
                              <Check className="w-3 h-3 text-[#2D5A27]" />
                              <span>Copied</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3 h-3" />
                              <span>Copy</span>
                            </>
                          )}
                        </button>
                      </div>
                      <p className="text-[11px] text-[#7A6A55] mt-1 line-clamp-2">
                        {offer.name} (Min Order: {formatINR(offer.minOrderValue)})
                      </p>
                    </div>
                    <div className="text-[9px] text-[#7A6A55]/80 border-t border-[#EADFC8]/40 pt-1">
                      Statutory margin floor: {((offer.marginGuardrailPercent || 0.015) * 100).toFixed(1)}% protected.
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 4. Collapsible "How live rates and price lock work" */}
          <div className="border border-[#EADFC8] rounded-[12px] bg-white overflow-hidden">
            <button
              type="button"
              onClick={() => setAccordionOpen(!accordionOpen)}
              className="w-full px-5 py-4 flex items-center justify-between text-left hover:bg-[#FFFBF3] transition-colors focus:outline-none"
            >
              <span className="text-xs font-serif font-bold text-[#5A4630] flex items-center gap-2">
                <Info className="w-4 h-4 text-[#C9A24B]" />
                How live rates and price lock work
              </span>
              {accordionOpen ? (
                <ChevronUp className="w-4 h-4 text-[#7A6A55]" />
              ) : (
                <ChevronDown className="w-4 h-4 text-[#7A6A55]" />
              )}
            </button>

            {accordionOpen && (
              <div className="px-5 pb-5 pt-1 border-t border-[#EADFC8] text-xs text-[#7A6A55] space-y-3 leading-relaxed bg-[#FFFBF3]/40">
                <p>
                  <strong>1. Rate Components:</strong> Our bullion engine computes metal value directly from official spot gold (24K/22K) and silver (999) benchmarks. Making charges and GST (3%) are applied transparently without hidden markups.
                </p>
                <p>
                  <strong>2. Quote Duration & Protection:</strong> Clicking "Get Quote" captures a cryptographic rate snapshot and reserves physical inventory for 10 minutes (60 seconds in demo mode). While active, market volatility will not change your order price.
                </p>
                <p>
                  <strong>3. Requote Rules:</strong> Once the countdown expires, the price lock safely dissolves and uncommitted inventory is released. You can click "Requote" to capture the freshest spot rate instantly.
                </p>
                <p>
                  <strong>4. Stale-Rate Failsafe:</strong> If primary and backup market feeds disconnect for longer than 20 seconds, quote generation is automatically paused to ensure complete pricing integrity.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Verified Reviews Section (A) */}
      <section className="pt-8 border-t border-[#EADFC8] space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h2 className="font-serif text-2xl font-bold text-[#5A4630]">
              Verified Investor Reviews & Ratings
            </h2>
            <div className="flex items-center gap-2 mt-1 text-xs text-[#7A6A55]">
              <div className="flex items-center gap-0.5 text-[#BA8332]">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-[#BA8332]" />
                ))}
              </div>
              <span className="font-bold text-[#5A4630]">4.9 out of 5.0</span>
              <span>• Based on 38 verified deliveries</span>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setToastMessage('Review submission is available to verified buyers after order delivery.')}
          >
            Write a Review
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-white border border-[#EADFC8] rounded-xl space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-0.5 text-[#BA8332]">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-3.5 h-3.5 fill-[#BA8332]" />
                ))}
              </div>
              <Badge variant="sage" size="sm">Verified Investor</Badge>
            </div>
            <h4 className="text-xs font-bold text-[#5A4630]">
              "Exceptional Assay Packaging & Purity"
            </h4>
            <p className="text-xs text-[#7A6A55] leading-relaxed">
              Arrived in an inviolable tamper-proof certicard with NABL serial number. The laser micro-ridges on the gold surface are distinct and flawless.
            </p>
            <div className="text-[10px] text-[#7A6A55] pt-1 border-t border-[#EADFC8]/40">
              Devendra K., New Delhi • Purchased Oct 2026
            </div>
          </div>

          <div className="p-4 bg-white border border-[#EADFC8] rounded-xl space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-0.5 text-[#BA8332]">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-3.5 h-3.5 fill-[#BA8332]" />
                ))}
              </div>
              <Badge variant="sage" size="sm">Verified Buyer</Badge>
            </div>
            <h4 className="text-xs font-bold text-[#5A4630]">
              "Armoured Sequel Delivery with Double OTP"
            </h4>
            <p className="text-xs text-[#7A6A55] leading-relaxed">
              Impressed by the security protocol. Handed over directly by the armoured courier officer with OTP verification. Complete peace of mind for high-value purchases.
            </p>
            <div className="text-[10px] text-[#7A6A55] pt-1 border-t border-[#EADFC8]/40">
              Sunita R., Bengaluru • Purchased Oct 2026
            </div>
          </div>

          <div className="p-4 bg-white border border-[#EADFC8] rounded-xl space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-0.5 text-[#BA8332]">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-3.5 h-3.5 fill-[#BA8332]" />
                ))}
              </div>
              <Badge variant="sage" size="sm">Verified Collector</Badge>
            </div>
            <h4 className="text-xs font-bold text-[#5A4630]">
              "Precision Spot Rate Quote Lock"
            </h4>
            <p className="text-xs text-[#7A6A55] leading-relaxed">
              The 10-minute rate lock allowed me to complete RTGS verification without fear of price surges. Truly transparent and professional.
            </p>
            <div className="text-[10px] text-[#7A6A55] pt-1 border-t border-[#EADFC8]/40">
              Rajeshwar V., Mumbai • Purchased Sep 2026
            </div>
          </div>
        </div>
      </section>

      {/* Product Sourcing & Assay FAQs */}
      <section className="pt-8 border-t border-[#EADFC8] space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <HelpCircle className="w-5 h-5 text-[#C9A24B]" />
            <h2 className="font-serif text-xl font-bold text-[#5A4630]">
              Product Sourcing, Hallmarking & Assay FAQs
            </h2>
          </div>
          <span className="text-xs text-[#7A6A55]">Answers from our gemologists & bullion desk</span>
        </div>

        <div className="space-y-3">
          {[
            {
              q: 'How do I independently verify this piece\'s laboratory certificate?',
              a: `Every piece is issued with an official assay report from ${product.certificate.issuer} (Report #${product.certificate.number}). You can enter this certificate number in our online Verify portal or scan the QR code to review digitized spectroscopic and origin documentation.`,
            },
            {
              q: 'What is the buyback and exchange policy for this bullion / gemstone article?',
              a: 'Our clients enjoy transparent lifetime buyback against published spot benchmark rates (client note: lifetime buyback: check policies). Standard 7-day inspection window applies to physical delivery. Please note that COD is not applicable for high-value precious consignments.',
            },
            {
              q: 'How does the 10-minute quote lock protect me from bullion market volatility?',
              a: 'When you initiate a quote, our engine cryptographically freezes the spot metal price and reserves physical inventory for 10 minutes. Even if global commodities jump during checkout, your locked rate is fully honored. If the timer expires, repricing is required before order commitment.',
            },
            {
              q: 'Can personalized/laser-engraved items be returned or exchanged?',
              a: 'Under statutory e-commerce consumer guidelines, customized and laser-inscribed articles are made to bespoke client specifications and are strictly non-returnable and non-refundable once production commences.',
            },
          ].map((faq, idx) => (
            <div
              key={idx}
              className="bg-white border border-[#EADFC8] rounded-xl overflow-hidden transition-all shadow-xs"
            >
              <button
                type="button"
                onClick={() => setFaqOpenIdx(faqOpenIdx === idx ? null : idx)}
                className="w-full p-4 flex items-center justify-between text-left hover:bg-[#FFFBF3] transition-colors focus:outline-none"
              >
                <span className="font-serif text-xs sm:text-sm font-bold text-[#5A4630]">
                  {faq.q}
                </span>
                {faqOpenIdx === idx ? (
                  <ChevronUp className="w-4 h-4 text-[#7A6A55] shrink-0" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-[#7A6A55] shrink-0" />
                )}
              </button>

              {faqOpenIdx === idx && (
                <div className="px-4 pb-4 pt-1 text-xs text-[#7A6A55] leading-relaxed border-t border-[#EADFC8]/60 bg-[#FFFBF3]/30">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Frequently Acquired Together Cross-Sell Row */}
      {crossSellProducts.length > 0 && (
        <section className="pt-8 border-t border-[#EADFC8] space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-[#C9A24B]" />
              <h2 className="font-serif text-xl font-bold text-[#5A4630]">
                Frequently Acquired Together
              </h2>
            </div>
            <span className="text-xs text-[#7A6A55]">Curated complements for your collection</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {crossSellProducts.map((p) => (
              <ProductCard key={`cross-${p.id}`} product={p} />
            ))}
          </div>
        </section>
      )}

      {/* Full Certificate Modal */}
      <Modal
        isOpen={certModalOpen}
        onClose={() => setCertModalOpen(false)}
        title={
          <div className="flex items-center gap-2">
            <Award className="w-4 h-4 text-[#C9A24B]" />
            <span className="text-sm font-bold text-[#5A4630]">
              Official Laboratory Assay Certificate Dossier
            </span>
          </div>
        }
        maxWidth="lg"
      >
        <div className="p-6 space-y-6 bg-[#FFFBF3]">
          {/* Certificate Header Banner */}
          <div className="p-4 bg-white border border-[#C9A24B] rounded-xl flex items-center justify-between">
            <div>
              <div className="text-[10px] uppercase font-bold text-[#7A6A55] tracking-wider">
                Assaying Authority
              </div>
              <h3 className="font-serif text-base font-bold text-[#5A4630]">
                {product.certificate.issuer}
              </h3>
              <div className="text-xs text-[#7A6A55] mt-0.5">
                Accredited Testing Laboratory • Bureau of Indian Standards License
              </div>
            </div>
            <Badge variant="sage" size="md">Verified Authentic</Badge>
          </div>

          {/* Certificate Specifications Grid */}
          <div className="grid grid-cols-2 gap-4 text-xs bg-white p-4 rounded-xl border border-[#EADFC8]">
            <div>
              <span className="text-[#7A6A55]">Certificate Number:</span>
              <div className="font-mono font-bold text-[#5A4630]">{product.certificate.number}</div>
            </div>
            <div>
              <span className="text-[#7A6A55]">Linked Lot / Batch:</span>
              <div className="font-mono text-[#5A4630]">{product.lotBatchSerial}</div>
            </div>
            <div>
              <span className="text-[#7A6A55]">Product Name:</span>
              <div className="font-serif font-semibold text-[#5A4630]">{product.name}</div>
            </div>
            <div>
              <span className="text-[#7A6A55]">Gross / Net Weight:</span>
              <div className="font-mono font-bold text-[#5A4630]">{product.grossWeightG}g / {product.netWeightG}g</div>
            </div>
            <div>
              <span className="text-[#7A6A55]">Certified Purity:</span>
              <div className="font-bold text-[#C9A24B]">
                {product.attributes.bullion?.purity || `${(product.purity * 100).toFixed(2)}% Fine Metal`}
              </div>
            </div>
            <div>
              <span className="text-[#7A6A55]">BIS Hallmark HUID:</span>
              <div className="font-mono font-bold text-[#5A4630]">
                {product.huid || 'BIS-HM-VERIFIED'}
              </div>
            </div>
            <div>
              <span className="text-[#7A6A55]">Assaying Centre:</span>
              <div className="text-[#5A4630]">{product.certificate.assayingCentre || 'NABL Accredited Facility #401'}</div>
            </div>
            <div>
              <span className="text-[#7A6A55]">Date of Issue:</span>
              <div className="text-[#5A4630]">{product.certificate.issueDate || '2026-09-15'}</div>
            </div>
          </div>

          {/* Legal Metrology & Hallmarking Seal */}
          <div className="p-3 bg-[#FAF6EE] rounded-lg border border-[#EADFC8] text-[11px] text-[#7A6A55] space-y-1">
            <div className="font-semibold text-[#5A4630] flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-[#2D5A27]" />
              <span>Statutory Compliance Declaration</span>
            </div>
            <p>
              This certificate confirms compliance with the Bureau of Indian Standards (Hallmarking) Regulations 2018 and the Legal Metrology (Packaged Commodities) Rules. All precious metal contents are verified by XRF spectrometry and fire assay.
            </p>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <Button
              variant="outline"
              size="sm"
              className="flex-1"
              onClick={() => {
                setToastMessage('Assay Dossier PDF generated and downloaded.');
              }}
              leftIcon={<Download className="w-3.5 h-3.5" />}
            >
              Download PDF Assay Report
            </Button>
            <Button
              variant="primary"
              size="sm"
              className="flex-1"
              onClick={() => setCertModalOpen(false)}
            >
              Close Dossier
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
