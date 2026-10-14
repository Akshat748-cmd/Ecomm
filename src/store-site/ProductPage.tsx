import React, { useState, useEffect, useMemo } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAppStore } from '../store';
import { useSEO } from '../lib/useSEO';
import { calculatePrice, formatINR, formatDateTime } from '../lib/pricing';
import { Card } from '../components/Card';
import { Badge } from '../components/Badge';
import { Button } from '../components/Button';
import { Toast } from '../components/Toast';
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
    demoMode,
    quoteLockSeconds,
    toggleWishlist,
    addToCart,
    createQuote,
    requote,
  } = useAppStore();

  const product = products.find((p) => p.slug === slug);

  useSEO({
    title: product ? product.name : 'Precious Article',
    description: product
      ? `${product.description} Certified by ${product.certificate.issuer}.`
      : 'Authentic precious bullion and certified jewellery.',
    canonicalPath: `/p/${slug}`,
  });

  const [activeImageIdx, setActiveImageIdx] = useState(0);
  const [galleryTab, setGalleryTab] = useState<'photos' | '360'>('photos');
  const [rotationAngle, setRotationAngle] = useState(45);
  const [faqOpenIdx, setFaqOpenIdx] = useState<number | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [accordionOpen, setAccordionOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Active quote for this product (if user requested one)
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

  const crossSellProducts = useMemo(() => {
    return products.filter((p) => p.id !== product.id).slice(0, 3);
  }, [products, product]);
  const livePriceCalc = calculatePrice(product, rates, pricingConfig);
  const availableStock = product.stock - product.reserved;
  const isQuoteExpired = activeQuote && (activeQuote.status === 'Expired' || remainingSeconds <= 0);

  // Gallery 3 Views
  const galleryViews = [
    { title: 'Primary Proof Presentation', desc: 'Laser assay seal & packaging' },
    { title: 'Hallmark & Serial Micro-Ridge', desc: 'Precision macro authenticity' },
    { title: 'Archival Vault Storage Case', desc: 'Tamper-evident velvet presentation' },
  ];


  const handleGetQuote = () => {
    if (isFeedStale) return;
    const newQuote = createQuote(product.id, quantity);
    if (newQuote) {
      setToastMessage('Quote locked for 10 minutes at live spot rate!');
    }
  };

  const handleRequote = () => {
    if (isFeedStale || !activeQuote) return;
    requote(activeQuote.id);
    setToastMessage('Re-quoted successfully at current spot rate!');
  };

  const handleAddToCart = () => {
    const success = addToCart(product.id, quantity);
    if (success) {
      setToastMessage(`Added ${quantity}x ${product.name} to your cart.`);
      setTimeout(() => navigate('/cart'), 800);
    }
  };

  return (
    <div className="space-y-12 max-w-7xl mx-auto">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50">
          <Toast
            id="product-toast"
            type="success"
            title="Action Confirmed"
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
              <Badge variant="neutral" size="sm">Proposed</Badge>
            </button>
          </div>

          {galleryTab === '360' ? (
            /* 360 & Video Viewer (Proposed) */
            <div className="relative aspect-4/3 rounded-2xl bg-gradient-to-br from-[#FFFDF7] via-[#FAF1DB] to-[#F1E3BD] border border-[#C9A24B] p-6 flex flex-col items-center justify-between text-center shadow-[0_4px_24px_rgba(90,70,48,0.08)] overflow-hidden">
              <div className="w-full flex items-center justify-between">
                <span className="text-[11px] font-mono uppercase tracking-widest font-bold text-[#7A6A55] flex items-center gap-1">
                  <Video className="w-3.5 h-3.5 text-[#C9A24B]" />
                  <span>4K Macro Video & Turntable</span>
                </span>
                <Badge variant="gold" size="sm">Proposed Feature</Badge>
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

          {/* Certificate Block */}
          <div className="p-4 bg-[#FFFFFF] border border-[#EADFC8] rounded-[12px] space-y-2 shadow-xs">
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
            </div>
            <div className="pt-1">
              <Link
                to={`/verify/${product.certificate.number}`}
                className="text-xs text-[#C9A24B] hover:underline font-semibold flex items-center gap-1"
              >
                <span>Verify certificate details & document</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          {/* PROPOSED: Institutional Trust Widgets */}
          <div className="p-4 bg-white border border-[#EADFC8] rounded-[12px] space-y-2.5 shadow-xs">
            <div className="flex items-center justify-between pb-1.5 border-b border-[#EADFC8]">
              <span className="text-xs font-bold text-[#5A4630] uppercase tracking-wider flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-[#C9A24B]" />
                Institutional Trust Badges
              </span>
              <Badge variant="neutral" size="sm">Proposed</Badge>
            </div>
            <div className="grid grid-cols-1 gap-2 text-xs text-[#7A6A55]">
              <div className="flex items-center justify-between p-2 bg-[#FFFBF3] rounded-lg border border-[#EADFC8]/60">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#2D5A27]" />
                  <span className="font-medium text-[#5A4630]">Tamper-Evident CertiCard Hologram Seal</span>
                </div>
                <Badge variant="neutral" size="sm">Proposed</Badge>
              </div>
              <div className="flex items-center justify-between p-2 bg-[#FFFBF3] rounded-lg border border-[#EADFC8]/60">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#2D5A27]" />
                  <span className="font-medium text-[#5A4630]">Assayer Direct Cryptographic Signature</span>
                </div>
                <Badge variant="neutral" size="sm">Proposed</Badge>
              </div>
              <div className="flex items-center justify-between p-2 bg-[#FFFBF3] rounded-lg border border-[#EADFC8]/60">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#2D5A27]" />
                  <span className="font-medium text-[#5A4630]">100% Vault Custody & Transit Guarantee</span>
                </div>
                <Badge variant="neutral" size="sm">Proposed</Badge>
              </div>
            </div>
          </div>

          {/* Insured Delivery & Return Eligibility Text */}
          <div className="p-4 bg-[#F8EFD9] border border-[#EADFC8] rounded-[12px] text-xs text-[#5A4630] space-y-2">
            <div className="flex items-start gap-2">
              <Truck className="w-4 h-4 text-[#C9A24B] shrink-0 mt-0.5" />
              <div>
                <strong>Insured Fulfilment:</strong> Estimated delivery in 2–4 business days via armoured Sequel or BVC courier with OTP delivery.
              </div>
            </div>
            <div className="flex items-start gap-2 pt-1 border-t border-[#EADFC8]/60">
              <RotateCcw className="w-4 h-4 text-[#C9A24B] shrink-0 mt-0.5" />
              <div className="text-[11px] text-[#7A6A55]">
                <strong>Return & Buyback:</strong> 7-day inspection window. Bullion return and buyback terms are being finalised (client note: lifetime buyback: check policies). COD is not applicable.
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
              <button
                type="button"
                onClick={() => toggleWishlist(product.id)}
                className={`p-2.5 rounded-full border transition-colors flex items-center gap-1.5 text-xs font-medium ${
                  isWishlisted
                    ? 'bg-[#F1E3BD] border-[#C9A24B] text-[#5A4630]'
                    : 'bg-white border-[#EADFC8] text-[#7A6A55] hover:text-[#C9A24B]'
                }`}
              >
                <Heart className={`w-4 h-4 ${isWishlisted ? 'text-[#C9A24B] fill-[#C9A24B]' : ''}`} />
                <span>{isWishlisted ? 'Saved' : 'Save'}</span>
              </button>
            </div>

            <h1 className="font-serif text-2xl sm:text-3xl md:text-4xl font-bold text-[#5A4630] leading-tight">
              {product.name}
            </h1>

            <p className="text-xs sm:text-sm text-[#7A6A55] leading-relaxed">
              {product.description}
            </p>
          </div>

          {/* Category-Specific Specifications Table */}
          <Card variant="surface" className="p-0 border-[#EADFC8] overflow-hidden">
            <div className="px-5 py-3 bg-[#F8EFD9] border-b border-[#EADFC8] text-xs font-bold text-[#5A4630] uppercase tracking-wider">
              Item Specifications
            </div>
            <div className="divide-y divide-[#EADFC8] text-xs">
              {/* Bullion Specs */}
              {product.attributes.bullion && (
                <>
                  <div className="grid grid-cols-2 p-3">
                    <span className="text-[#7A6A55]">Metal & Purity:</span>
                    <span className="font-semibold text-[#5A4630]">{product.attributes.bullion.purity}</span>
                  </div>
                  <div className="grid grid-cols-2 p-3 bg-[#FFFBF3]/50">
                    <span className="text-[#7A6A55]">Gross / Net Weight:</span>
                    <span className="font-semibold text-[#5A4630] tabular-nums">{product.grossWeightG}g / {product.netWeightG}g</span>
                  </div>
                  <div className="grid grid-cols-2 p-3">
                    <span className="text-[#7A6A55]">Fine Metal Weight:</span>
                    <span className="font-semibold text-[#5A4630] tabular-nums">{product.attributes.bullion.fineWeightG}g Pure</span>
                  </div>
                  <div className="grid grid-cols-2 p-3 bg-[#FFFBF3]/50">
                    <span className="text-[#7A6A55]">Refinery & Assay:</span>
                    <span className="font-semibold text-[#5A4630]">{product.attributes.bullion.assayManufacturer}</span>
                  </div>
                </>
              )}

              {/* Gemstone Specs */}
              {product.attributes.gemstone && (
                <>
                  <div className="grid grid-cols-2 p-3">
                    <span className="text-[#7A6A55]">Variety & Species:</span>
                    <span className="font-semibold text-[#5A4630]">{product.attributes.gemstone.variety}</span>
                  </div>
                  <div className="grid grid-cols-2 p-3 bg-[#FFFBF3]/50">
                    <span className="text-[#7A6A55]">Carat Weight & Cut:</span>
                    <span className="font-semibold text-[#5A4630] tabular-nums">{product.attributes.gemstone.caratWeight} ct ({product.attributes.gemstone.cut})</span>
                  </div>
                  <div className="grid grid-cols-2 p-3">
                    <span className="text-[#7A6A55]">Color & Clarity:</span>
                    <span className="font-semibold text-[#5A4630]">{product.attributes.gemstone.color} • {product.attributes.gemstone.clarity}</span>
                  </div>
                  <div className="grid grid-cols-2 p-3 bg-[#FFFBF3]/50">
                    <span className="text-[#7A6A55]">Geographical Origin:</span>
                    <span className="font-semibold text-[#5A4630]">{product.attributes.gemstone.origin}</span>
                  </div>
                </>
              )}

              {/* Rudraksha Specs */}
              {product.attributes.rudraksha && (
                <>
                  <div className="grid grid-cols-2 p-3">
                    <span className="text-[#7A6A55]">Mukhi Furrows:</span>
                    <span className="font-semibold text-[#5A4630]">{product.attributes.rudraksha.mukhi} Mukhi</span>
                  </div>
                  <div className="grid grid-cols-2 p-3 bg-[#FFFBF3]/50">
                    <span className="text-[#7A6A55]">Bead Count & Size:</span>
                    <span className="font-semibold text-[#5A4630]">{product.attributes.rudraksha.beadCount || 1} Bead(s) • {product.attributes.rudraksha.sizeMm || 18}mm</span>
                  </div>
                  <div className="grid grid-cols-2 p-3">
                    <span className="text-[#7A6A55]">Thread / Metal:</span>
                    <span className="font-semibold text-[#5A4630]">{product.attributes.rudraksha.thread} ({product.attributes.rudraksha.metalCapping || 'Uncapped'})</span>
                  </div>
                  <div className="grid grid-cols-2 p-3 bg-[#FFFBF3]/50">
                    <span className="text-[#7A6A55]">Sacred Provenance:</span>
                    <span className="font-semibold text-[#5A4630]">{product.attributes.rudraksha.provenance}</span>
                  </div>
                </>
              )}

              {/* General / Gifting Specs */}
              {product.attributes.general && (
                <>
                  <div className="grid grid-cols-2 p-3">
                    <span className="text-[#7A6A55]">Packaging Chest:</span>
                    <span className="font-semibold text-[#5A4630]">{product.attributes.general.boxMaterial}</span>
                  </div>
                  <div className="grid grid-cols-2 p-3 bg-[#FFFBF3]/50">
                    <span className="text-[#7A6A55]">Articles Included:</span>
                    <span className="font-semibold text-[#5A4630]">{product.attributes.general.itemsIncluded}</span>
                  </div>
                </>
              )}
            </div>
          </Card>

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
                    {formatINR(livePriceCalc.ratePerGram)}/g
                  </strong>
                  , updated {formatDateTime(rates.lastUpdated)}
                </div>
              </div>
              <Badge variant="gold" size="sm">Formula {pricingConfig.formulaVersion}</Badge>
            </div>

            {/* Breakdown lines */}
            <div className="space-y-2 text-xs">
              <div className="flex justify-between text-[#7A6A55]">
                <span>Metal Value ({livePriceCalc.fineWeightG > 0 ? `${livePriceCalc.fineWeightG}g pure` : 'Base price'}):</span>
                <span className="tabular-nums font-medium text-[#5A4630]">{formatINR(livePriceCalc.metalValue)}</span>
              </div>
              {livePriceCalc.makingCharges > 0 && (
                <div className="flex justify-between text-[#7A6A55]">
                  <span>Minting & Making Charges ({(product.makingPercent * 100).toFixed(1)}%):</span>
                  <span className="tabular-nums font-medium text-[#5A4630]">{formatINR(livePriceCalc.makingCharges)}</span>
                </div>
              )}
              <div className="flex justify-between text-[#7A6A55]">
                <span>Assay, Security Packaging & Transit Cover:</span>
                <span className="tabular-nums font-medium text-[#5A4630]">
                  {formatINR(livePriceCalc.packagingCharges + livePriceCalc.insuranceCharges)}
                </span>
              </div>
              <div className="flex justify-between text-[#7A6A55]">
                <span>GST (3% on precious articles):</span>
                <span className="tabular-nums font-medium text-[#5A4630]">{formatINR(livePriceCalc.gstAmount)}</span>
              </div>

              {/* Total & MRP */}
              <div className="pt-3 border-t border-[#EADFC8] flex items-baseline justify-between">
                <div>
                  <span className="font-serif text-lg font-bold text-[#5A4630]">Total Price</span>
                  <span className="text-[11px] text-[#7A6A55] ml-1.5">(All taxes included)</span>
                </div>
                <div className="text-right">
                  <div className="font-serif text-3xl font-bold text-[#5A4630] tabular-nums">
                    {formatINR(livePriceCalc.total * quantity)}
                  </div>
                  {product.mrp > livePriceCalc.total && (
                    <div className="text-xs text-[#7A6A55]">
                      MRP <span className="line-through">{formatINR(product.mrp * quantity)}</span>{' '}
                      <span className="text-[#2D5A27] font-semibold">
                        (Save {formatINR((product.mrp - livePriceCalc.total) * quantity)})
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
                        {formatINR(activeQuote.priceBreakdown.total * quantity)}
                      </strong>
                    </div>
                    <div className="text-[11px] text-[#7A6A55]">
                      Live rate now <strong>{formatINR(rates.gold24k)}/g</strong> (your locked rate <strong>{formatINR(activeQuote.ratePerGramSnapshot)}/g</strong>)
                    </div>
                  </div>

                  {/* Actions depending on expiry */}
                  {isQuoteExpired ? (
                    <div className="space-y-3">
                      <div className="text-xs text-[#7A5310] leading-relaxed">
                        The live market spot rate has shifted. Requote to lock in the latest real-time precious rate.
                      </div>
                      <Button
                        variant="primary"
                        className="w-full bg-[#7A5310] hover:bg-[#63430c]"
                        onClick={handleRequote}
                        disabled={isFeedStale}
                        leftIcon={<RotateCcw className="w-4 h-4" />}
                      >
                        {isFeedStale ? 'Rates Delayed. Quotes Paused' : 'Requote at Current Live Rate'}
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

      {/* PROPOSED: Product FAQ Accordion */}
      <section className="pt-8 border-t border-[#EADFC8] space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <HelpCircle className="w-5 h-5 text-[#C9A24B]" />
            <h2 className="font-serif text-xl font-bold text-[#5A4630]">
              Product Sourcing & Assay FAQs
            </h2>
            <Badge variant="neutral" size="sm">Proposed</Badge>
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
              a: 'When you initiate a quote, our engine cryptographically freezes the spot metal price and reserves physical inventory for 10 minutes. Even if global commodities jump during checkout, your locked rate is fully honored.',
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
                <div className="flex items-center gap-2">
                  <span className="font-serif text-xs sm:text-sm font-bold text-[#5A4630]">
                    {faq.q}
                  </span>
                  <Badge variant="neutral" size="sm">Proposed</Badge>
                </div>
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

      {/* PROPOSED: Cross-Sell & Upsell Row */}
      {crossSellProducts.length > 0 && (
        <section className="pt-8 border-t border-[#EADFC8] space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-[#C9A24B]" />
              <h2 className="font-serif text-xl font-bold text-[#5A4630]">
                Frequently Acquired Together
              </h2>
              <Badge variant="neutral" size="sm">Proposed</Badge>
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
    </div>
  );
};
