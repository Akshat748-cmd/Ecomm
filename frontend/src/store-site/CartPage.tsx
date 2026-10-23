import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAppStore } from '../store';
import { useSEO } from '../lib/useSEO';
import { calculatePrice, formatINR } from '../lib/pricing';
import { Card } from '../components/Card';
import { Badge } from '../components/Badge';
import { Button } from '../components/Button';
import { EmptyState } from '../components/EmptyState';
import {
  ShoppingBag,
  Trash2,
  Plus,
  Minus,
  ChevronRight,
  ShieldCheck,
  Truck,
  AlertTriangle,
  ArrowRight,
  Check,
} from 'lucide-react';

export const CartPage: React.FC = () => {
  const navigate = useNavigate();
  const {
    cart,
    products,
    rates,
    pricingConfig,
    updateCartQuantity,
    removeFromCart,
    acceptCartPriceUpdate,
    clearCart,
  } = useAppStore();

  useSEO({
    title: 'Shopping Cart & Rate Reservations',
    description: 'Review your selected gold, silver, gemstones, and sacred pieces. Real-time rate calculation and insured transit protection.',
    canonicalPath: '/cart',
  });


  // Cart Calculations
  let subtotal = 0;
  let totalPackagingAndInsurance = 0;
  let totalGst = 0;
  let grandTotal = 0;

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
    grandTotal += lineTotal;

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

  // Check if any cart item requires price reacceptance
  const hasPriceChanges = cart.some((item) => item.requiresReacceptance);

  const handleAcceptAllPriceUpdates = () => {
    cart.forEach((item) => {
      if (item.requiresReacceptance) {
        acceptCartPriceUpdate(item.productId);
      }
    });
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
            className="text-xs text-[#7A6A55] hover:text-[#8C2E24] hover:underline self-start sm:self-auto"
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
                  className={`p-5 border-[#EADFC8] relative ${
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

                        {/* Remove */}
                        <button
                          type="button"
                          onClick={() => removeFromCart(product.id)}
                          className="p-2 text-[#7A6A55] hover:text-[#8C2E24] hover:bg-[#F7D4CF]/40 rounded-lg transition-colors"
                          title="Remove item"
                          aria-label="Remove item"
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

          {/* Right Column: Order Summary Card */}
          <div className="lg:col-span-5 space-y-4">
            <Card variant="surface" className="p-6 border-[#EADFC8] space-y-5 shadow-[0_4px_24px_rgba(90,70,48,0.08)] sticky top-24">
              <h2 className="font-serif text-xl font-bold text-[#5A4630] pb-3 border-b border-[#EADFC8]">
                Order Summary
              </h2>

              <div className="space-y-3 text-xs">
                <div className="flex justify-between text-[#7A6A55]">
                  <span>Subtotal (Net Metal & Crafting):</span>
                  <span className="tabular-nums font-medium text-[#5A4630]">{formatINR(subtotal)}</span>
                </div>

                <div className="flex justify-between text-[#7A6A55]">
                  <span>Armoured Shipping & Transit Insurance:</span>
                  <span className="tabular-nums font-semibold text-[#2D5A27]">
                    Complimentary / Insured
                  </span>
                </div>

                <div className="flex justify-between text-[#7A6A55]">
                  <span>Applicable GST (3% on precious articles):</span>
                  <span className="tabular-nums font-medium text-[#5A4630]">{formatINR(totalGst)}</span>
                </div>

                <div className="pt-4 border-t border-[#EADFC8] flex items-baseline justify-between">
                  <div>
                    <span className="font-serif text-xl font-bold text-[#5A4630]">Grand Total</span>
                    <span className="text-[11px] text-[#7A6A55] ml-1.5">(INR)</span>
                  </div>
                  <div className="font-serif text-3xl font-bold text-[#5A4630] tabular-nums">
                    {formatINR(grandTotal)}
                  </div>
                </div>
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
                {hasPriceChanges ? 'Accept New Prices to Checkout' : 'Proceed to Secure Checkout'}
              </Button>

              {/* Security & Transit Assurance */}
              <div className="pt-2 border-t border-[#EADFC8]/60 space-y-2 text-[11px] text-[#7A6A55]">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-[#C9A24B] shrink-0" />
                  <span>100% Insured Armoured Transit (Sequel & BVC)</span>
                </div>
                <div className="flex items-center gap-2">
                  <Truck className="w-4 h-4 text-[#C9A24B] shrink-0" />
                  <span>Tamper-evident packaging with OTP delivery</span>
                </div>
                <div className="text-[#5A4630] font-medium pt-1">
                  Note: COD is not applicable for bullion & jewellery.
                </div>
              </div>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
};
