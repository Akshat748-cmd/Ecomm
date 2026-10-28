import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAppStore } from '../store';
import { useSEO } from '../lib/useSEO';
import { calculatePrice, formatINR } from '../lib/pricing';
import { Card } from '../components/Card';
import { Badge } from '../components/Badge';
import { Button } from '../components/Button';
import { EmptyState } from '../components/EmptyState';
import { Modal } from '../components/Modal';
import {
  ShoppingBag,
  Trash2,
  Plus,
  Minus,
  ChevronRight,
  ShieldCheck,
  AlertTriangle,
  ArrowRight,
  Check,
  Bookmark,
  Tag,
  X,
  Lock,
  Gift,
} from 'lucide-react';

export const CartPage: React.FC = () => {
  const navigate = useNavigate();
  const {
    cart,
    savedForLater,
    products,
    rates,
    pricingConfig,
    activeCoupon,
    updateCartQuantity,
    removeFromCart,
    acceptCartPriceUpdate,
    clearCart,
    saveForLater,
    moveSavedToCart,
    removeSavedForLater,
    applyCoupon,
    removeCoupon,
  } = useAppStore();

  useSEO({
    title: 'Shopping Cart & Rate Reservations',
    description: 'Review your selected gold, silver, gemstones, and sacred pieces. Real-time rate calculation and insured transit protection.',
    canonicalPath: '/cart',
  });

  const [couponInput, setCouponInput] = useState('');
  const [couponMessage, setCouponMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [termsModalOpen, setTermsModalOpen] = useState(false);

  // Cart Calculations
  let subtotal = 0;
  let totalPackagingAndInsurance = 0;
  let totalGst = 0;
  let totalBeforeDiscount = 0;

  const cartItemsWithDetails = cart.map((cartItem) => {
    const product = products.find((p) => p.id === cartItem.productId);
    if (!product) return null;

    const calc = calculatePrice(product, rates, pricingConfig);
    const lineSubtotal = calc.subtotal * cartItem.quantity;
    const lineGst = calc.gstAmount * cartItem.quantity;
    const lineTotal = calc.total * cartItem.quantity;
    const linePkgIns = (calc.packagingCharges + calc.insuranceCharges) * cartItem.quantity;

    subtotal += lineSubtotal;
    totalPackagingAndInsurance += linePkgIns;
    totalGst += lineGst;
    totalBeforeDiscount += lineTotal;

    const availableStock = product.stock - product.reserved + cartItem.quantity;

    return {
      cartItem,
      product,
      calc,
      lineSubtotal,
      lineTotal,
      availableStock,
    };
  }).filter(Boolean);

  // Evaluate coupon discount if active
  let discountAmount = 0;
  if (activeCoupon && totalBeforeDiscount > 0) {
    if (activeCoupon.type === 'flat') {
      discountAmount = Math.min(totalBeforeDiscount, activeCoupon.discountValue);
    } else {
      discountAmount = Math.round(totalBeforeDiscount * (activeCoupon.discountValue / 100));
    }
  }

  const grandTotal = Math.max(0, totalBeforeDiscount - discountAmount);

  // Check if any cart item requires price reacceptance
  const hasPriceChanges = cart.some((item) => item.requiresReacceptance);

  const handleAcceptAllPriceUpdates = () => {
    cart.forEach((item) => {
      if (item.requiresReacceptance) {
        acceptCartPriceUpdate(item.productId);
      }
    });
  };

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponInput.trim()) return;
    const res = applyCoupon(couponInput.trim());
    if (res.success) {
      setCouponMessage({ type: 'success', text: res.message });
      setCouponInput('');
    } else {
      setCouponMessage({ type: 'error', text: res.message });
    }
    setTimeout(() => setCouponMessage(null), 5000);
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Breadcrumb */}
      <nav aria-label="Breadcrumb" className="text-xs text-[#7A6A55] flex items-center gap-1.5 flex-wrap">
        <Link to="/" className="hover:text-[#C9A24B]">Home</Link>
        <ChevronRight className="w-3.5 h-3.5 text-[#EADFC8]" />
        <span className="text-[#5A4630] font-medium">Shopping Cart</span>
      </nav>

      {/* Header */}
      <div className="border-b border-[#EADFC8] pb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl sm:text-4xl font-bold text-[#5A4630] flex items-center gap-2.5">
            <ShoppingBag className="w-7 h-7 text-[#C9A24B]" />
            Your Shopping Cart
          </h1>
          <p className="text-xs sm:text-sm text-[#7A6A55] mt-1">
            Prices are linked to real-time bullion benchmarks. Items reserve physical stock while in cart.
          </p>
        </div>

        {cart.length > 0 && (
          <button
            onClick={() => clearCart()}
            className="text-xs text-[#7A6A55] hover:text-[#8C2E24] hover:underline self-start sm:self-auto font-medium"
          >
            Clear Entire Cart
          </button>
        )}
      </div>

      {/* Amber Rate Update Banner when price changed */}
      {hasPriceChanges && (
        <div className="p-4 bg-[#FBE7B8] border border-[#E8C26E] rounded-xl text-[#7A5310] flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs animate-in fade-in duration-200">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-[#7A5310] shrink-0 mt-0.5" />
            <div className="text-xs space-y-0.5">
              <strong className="font-semibold">Price updated since you added this item:</strong>
              <p>Live precious metal spot rates moved. Please review the updated rates before proceeding to checkout.</p>
            </div>
          </div>
          <Button
            variant="primary"
            size="sm"
            className="bg-[#7A5310] hover:bg-[#63430c] shrink-0"
            onClick={handleAcceptAllPriceUpdates}
            leftIcon={<Check className="w-3.5 h-3.5" />}
          >
            Accept New Price
          </Button>
        </div>
      )}

      {/* Empty State */}
      {cart.length === 0 ? (
        <EmptyState
          icon={<ShoppingBag className="w-8 h-8 text-[#C9A24B]" />}
          title="Your Shopping Cart is Empty"
          description="You have not added any gold bullion coins, fine jewellery, certified gemstones, or sacred Rudraksha yet."
          actionLabel="Explore 24K Gold Bullion"
          onAction={() => navigate('/c/gold')}
        />
      ) : (
        /* Cart Layout: Left Line Items (7 cols) + Right Summary Card (5 cols) */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Line Items */}
          <div className="lg:col-span-7 space-y-4">
            {cartItemsWithDetails.map((entry) => {
              if (!entry) return null;
              const { cartItem, product, calc, lineTotal, availableStock } = entry;

              return (
                <Card
                  key={product.id}
                  variant="surface"
                  className={`p-5 border-[#EADFC8] relative shadow-xs ${
                    cartItem.requiresReacceptance ? 'border-[#E8C26E] bg-[#FFFDF5]' : ''
                  }`}
                >
                  {/* Amber badge on changed item */}
                  {cartItem.requiresReacceptance && (
                    <div className="mb-3 p-2 bg-[#FBE7B8] rounded-md text-[11px] text-[#7A5310] flex items-center justify-between">
                      <span className="flex items-center gap-1.5 font-medium">
                        <AlertTriangle className="w-3.5 h-3.5" />
                        Price updated to live spot rate
                      </span>
                      <button
                        onClick={() => acceptCartPriceUpdate(product.id)}
                        className="font-bold underline hover:opacity-80"
                      >
                        Accept
                      </button>
                    </div>
                  )}

                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    {/* Thumbnail & Title */}
                    <div className="flex items-start gap-4">
                      <div className="w-16 h-16 rounded-xl overflow-hidden border border-[#EADFC8] bg-[#FAF6EE] shrink-0 shadow-xs">
                        <img
                          src={product.imageUrl || `/products/${product.id}.jpg`}
                          alt={product.name}
                          className="w-full h-full object-cover"
                        />
                      </div>

                      <div className="space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-[10px] font-mono text-[#7A6A55]">
                            {product.sku}
                          </span>
                          <Badge variant="gold" size="sm">
                            {product.type === 'rateLinked' ? 'Live Rate' : 'Certified'}
                          </Badge>
                          {product.personalizationEligible && (
                            <span className="text-[10px] text-[#C9A24B] flex items-center gap-1 font-medium bg-[#F8EFD9] px-1.5 py-0.5 rounded">
                              <Gift className="w-3 h-3" />
                              <span>Personalization Eligible</span>
                            </span>
                          )}
                        </div>

                        <Link to={`/p/${product.slug}`}>
                          <h3 className="font-serif text-base font-bold text-[#5A4630] hover:text-[#C9A24B] transition-colors leading-snug">
                            {product.name}
                          </h3>
                        </Link>

                        <div className="text-xs text-[#7A6A55] flex items-center gap-2">
                          <span>{product.netWeightG}g</span>
                          <span>•</span>
                          <span>{product.attributes.bullion?.purity || 'Hallmark'}</span>
                          <span>•</span>
                          <span className="text-[#2D5A27]">{availableStock} in vault stock</span>
                        </div>
                      </div>
                    </div>

                    {/* Price and Stepper */}
                    <div className="flex sm:flex-col items-end justify-between w-full sm:w-auto pt-3 sm:pt-0 border-t sm:border-t-0 border-[#EADFC8] gap-3">
                      <div className="text-left sm:text-right">
                        <div className="font-serif text-lg font-bold text-[#5A4630] tabular-nums">
                          {formatINR(lineTotal)}
                        </div>
                        <div className="text-[10px] text-[#7A6A55]">
                          {formatINR(calc.total)} each (incl. 3% GST)
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        {/* Quantity Stepper */}
                        <div className="flex items-center border border-[#EADFC8] rounded-md bg-[#FFFBF3]">
                          <button
                            type="button"
                            onClick={() => updateCartQuantity(product.id, Math.max(1, cartItem.quantity - 1))}
                            disabled={cartItem.quantity <= 1}
                            className="p-1.5 text-[#7A6A55] hover:bg-[#F8EFD9] disabled:opacity-30 rounded-l-md"
                            aria-label="Decrease quantity"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="w-8 text-center text-xs font-bold text-[#5A4630] tabular-nums">
                            {cartItem.quantity}
                          </span>
                          <button
                            type="button"
                            onClick={() => updateCartQuantity(product.id, Math.min(availableStock, cartItem.quantity + 1))}
                            disabled={cartItem.quantity >= availableStock}
                            className="p-1.5 text-[#7A6A55] hover:bg-[#F8EFD9] disabled:opacity-30 rounded-r-md"
                            aria-label="Increase quantity"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>

                        {/* Save for Later Button */}
                        <button
                          type="button"
                          onClick={() => saveForLater(product.id)}
                          className="p-1.5 text-[#7A6A55] hover:text-[#C9A24B] rounded-md hover:bg-[#F8EFD9]"
                          title="Save for Later"
                        >
                          <Bookmark className="w-4 h-4" />
                        </button>

                        {/* Remove Button */}
                        <button
                          type="button"
                          onClick={() => removeFromCart(product.id)}
                          className="p-1.5 text-[#7A6A55] hover:text-[#8C2E24] rounded-md hover:bg-[#FFEBEE]"
                          title="Remove from Cart"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>

          {/* Right Summary Card (5 cols) */}
          <div className="lg:col-span-5 space-y-4">
            <Card variant="surface" className="p-6 border-[#EADFC8] space-y-5 shadow-[0_4px_24px_rgba(90,70,48,0.06)]">
              <div className="flex items-center justify-between pb-3 border-b border-[#EADFC8]">
                <h2 className="font-serif text-lg font-bold text-[#5A4630]">Order Summary</h2>
                <Badge variant="gold" size="sm">Precious Invoicing</Badge>
              </div>

              {/* Cost Lines */}
              <div className="space-y-2.5 text-xs">
                <div className="flex justify-between text-[#7A6A55]">
                  <span>Items Subtotal (excl. tax):</span>
                  <span className="tabular-nums font-medium text-[#5A4630]">{formatINR(subtotal)}</span>
                </div>

                <div className="flex justify-between text-[#7A6A55]">
                  <span>Armoured Transit Packaging & Insurance:</span>
                  <span className="tabular-nums font-medium text-[#2D5A27]">
                    {totalPackagingAndInsurance > 0 ? (
                      <span>Complimentary (Insured)</span>
                    ) : (
                      'Free'
                    )}
                  </span>
                </div>

                <div className="flex justify-between text-[#7A6A55]">
                  <span>Statutory GST (3% Bullion / Jewellery):</span>
                  <span className="tabular-nums font-medium text-[#5A4630]">{formatINR(totalGst)}</span>
                </div>

                {discountAmount > 0 && (
                  <div className="flex justify-between text-[#2D5A27] font-semibold pt-1 border-t border-[#EADFC8]/40">
                    <span className="flex items-center gap-1">
                      <Tag className="w-3.5 h-3.5" />
                      <span>Coupon Discount ({activeCoupon?.code}):</span>
                    </span>
                    <span className="tabular-nums">- {formatINR(discountAmount)}</span>
                  </div>
                )}

                {/* Grand Total */}
                <div className="pt-3 border-t border-[#EADFC8] flex items-baseline justify-between">
                  <div>
                    <span className="font-serif text-lg font-bold text-[#5A4630]">Total Payable</span>
                    <span className="text-[10px] text-[#7A6A55] ml-1">(All statutory taxes incl.)</span>
                  </div>
                  <div className="font-serif text-2xl font-bold text-[#5A4630] tabular-nums">
                    {formatINR(grandTotal)}
                  </div>
                </div>
              </div>

              {/* Coupon Form */}
              <div className="pt-3 border-t border-[#EADFC8] space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-[#5A4630] flex items-center gap-1.5">
                    <Tag className="w-3.5 h-3.5 text-[#C9A24B]" />
                    Promotional Coupon
                  </span>
                  <button
                    type="button"
                    onClick={() => setTermsModalOpen(true)}
                    className="text-[11px] text-[#C9A24B] hover:underline"
                  >
                    View Terms
                  </button>
                </div>

                {activeCoupon ? (
                  <div className="p-2.5 bg-[#E8F5E9] border border-[#C8E6C9] rounded-lg text-xs flex items-center justify-between">
                    <div>
                      <span className="font-mono font-bold text-[#2D5A27]">{activeCoupon.code}</span>
                      <p className="text-[10px] text-[#2D5A27]">
                        {activeCoupon.name} • Saved {formatINR(discountAmount)}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeCoupon()}
                      className="p-1 text-[#C62828] hover:bg-[#FFEBEE] rounded"
                      title="Remove coupon"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleApplyCoupon} className="flex gap-2">
                    <input
                      type="text"
                      placeholder="e.g. DIWALI2026"
                      value={couponInput}
                      onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                      className="flex-1 text-xs px-3 py-2 bg-white border border-[#EADFC8] rounded-md text-[#5A4630] uppercase font-mono"
                    />
                    <Button variant="secondary" size="sm" type="submit">
                      Apply
                    </Button>
                  </form>
                )}

                {couponMessage && (
                  <div
                    className={`text-[11px] p-2 rounded-md ${
                      couponMessage.type === 'success'
                        ? 'bg-[#E8F5E9] text-[#2D5A27]'
                        : 'bg-[#FFEBEE] text-[#C62828]'
                    }`}
                  >
                    {couponMessage.text}
                  </div>
                )}
              </div>

              {/* Checkout Button */}
              <Button
                variant="primary"
                size="lg"
                className="w-full"
                disabled={hasPriceChanges}
                onClick={() => navigate('/checkout')}
                rightIcon={<ArrowRight className="w-4 h-4" />}
              >
                {hasPriceChanges ? 'Please Accept New Prices' : 'Proceed to Secure Checkout'}
              </Button>

              {/* Trust Badges */}
              <div className="pt-2 text-[11px] text-[#7A6A55] space-y-1.5 border-t border-[#EADFC8]/60">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#C9A24B] shrink-0" />
                  <span>100% Insured Armoured Transit via Sequel & BVC</span>
                </div>
                <div className="flex items-center gap-2">
                  <Lock className="w-3.5 h-3.5 text-[#C9A24B] shrink-0" />
                  <span>Statutory GST Invoice & BIS Hallmark Verification Included</span>
                </div>
              </div>
            </Card>
          </div>
        </div>
      )}

      {/* Saved for Later Section */}
      {savedForLater && savedForLater.length > 0 && (
        <section className="pt-8 border-t border-[#EADFC8] space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-serif text-xl font-bold text-[#5A4630] flex items-center gap-2">
              <Bookmark className="w-5 h-5 text-[#C9A24B]" />
              <span>Saved for Later ({savedForLater.length})</span>
            </h2>
            <span className="text-xs text-[#7A6A55]">Reserved pieces moved to your private list</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {savedForLater.map((savedItem) => {
              const prod = products.find((p) => p.id === savedItem.productId);
              if (!prod) return null;
              const calc = calculatePrice(prod, rates, pricingConfig);

              return (
                <div
                  key={prod.id}
                  className="p-4 bg-white border border-[#EADFC8] rounded-xl flex items-center justify-between gap-4 shadow-xs"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-14 h-14 rounded-lg overflow-hidden border border-[#EADFC8] bg-[#FAF6EE] shrink-0">
                      <img
                        src={prod.imageUrl || `/products/${prod.id}.jpg`}
                        alt={prod.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div>
                      <h4 className="font-serif text-xs font-bold text-[#5A4630] line-clamp-1">
                        {prod.name}
                      </h4>
                      <div className="text-[11px] text-[#7A6A55] font-mono mt-0.5">
                        {prod.netWeightG}g • {formatINR(calc.total)}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => moveSavedToCart(prod.id)}
                    >
                      Move to Cart
                    </Button>
                    <button
                      type="button"
                      onClick={() => removeSavedForLater(prod.id)}
                      className="p-1.5 text-[#7A6A55] hover:text-[#8C2E24] rounded"
                      title="Remove"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Coupon Terms Modal */}
      <Modal
        isOpen={termsModalOpen}
        onClose={() => setTermsModalOpen(false)}
        title="Promotional Coupon Terms & Statutory Guardrails"
        maxWidth="md"
      >
        <div className="p-6 space-y-4 text-xs text-[#5A4630] bg-[#FFFBF3]">
          <p className="leading-relaxed">
            All coupons and promotional discounts are governed by legal bullion margin safeguard policies. In accordance with Precious Commerce Regulations:
          </p>
          <ul className="list-disc pl-5 space-y-2 text-[#7A6A55]">
            <li>Coupons may not reduce bullion selling prices below statutory refinery acquisition cost basis.</li>
            <li>Discounts apply only to eligible categories and orders meeting minimum cart values.</li>
            <li>Coupons are non-transferable and single-use per verified investor profile.</li>
          </ul>
          <div className="pt-2 flex justify-end">
            <Button variant="primary" size="sm" onClick={() => setTermsModalOpen(false)}>
              Understood
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
