import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import type { Product } from '../data/types';
import { useAppStore } from '../store';
import { calculatePrice, formatINR } from '../lib/pricing';
import { Badge } from './Badge';
import { Modal } from './Modal';
import { Button } from './Button';
import { Heart, ShieldCheck, Eye, Star, ShoppingBag, ArrowRight } from 'lucide-react';

export interface ProductCardProps {
  product: Product;
  className?: string;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, className = '' }) => {
  const navigate = useNavigate();
  const { rates, pricingConfig, wishlist, toggleWishlist, addToCart } = useAppStore();
  const isWishlisted = wishlist.includes(product.id);
  const [quickViewOpen, setQuickViewOpen] = useState(false);
  const [addedAnimation, setAddedAnimation] = useState(false);

  const priceCalc = calculatePrice(product, rates, pricingConfig);
  const availableStock = product.stock - product.reserved;
  const ratingValue = product.rating || 4.9;

  // Weight / Spec label
  const getSpecLabel = () => {
    if (product.category === 'gemstones' || product.category === 'coloured-stones') {
      return `${product.attributes.gemstone?.caratWeight || 0} ct • ${product.attributes.gemstone?.origin || 'Natural'}`;
    }
    if (product.category === 'rudraksha') {
      return `${product.attributes.rudraksha?.mukhi || 5} Mukhi • ${product.attributes.rudraksha?.provenance || 'Nepal'}`;
    }
    return `${product.netWeightG}g • ${product.attributes.bullion?.purity || (product.purity >= 0.99 ? '24K (999.9)' : '22K (916)')}`;
  };

  const handleQuickAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (availableStock > 0 || product.backorderEligible) {
      addToCart(product.id, 1);
      setAddedAnimation(true);
      setTimeout(() => setAddedAnimation(false), 1500);
    }
  };

  return (
    <>
      <div
        className={`group relative bg-[#FFFFFF] border border-[#EADFC8] rounded-[12px] overflow-hidden flex flex-col shadow-[0_4px_20px_rgba(90,70,48,0.06)] hover:shadow-[0_8px_28px_rgba(90,70,48,0.12)] transition-all duration-300 hover:-translate-y-1 ${className}`}
      >
        {/* Top badges & Wishlist */}
        <div className="absolute top-3 left-3 right-3 z-10 flex items-center justify-between pointer-events-none">
          <div className="flex flex-col gap-1 items-start">
            {availableStock <= 0 ? (
              product.backorderEligible ? (
                <Badge variant="amber" size="sm">Backorder Eligible</Badge>
              ) : (
                <Badge variant="coral" size="sm">Out of Stock</Badge>
              )
            ) : availableStock <= 3 ? (
              <Badge variant="amber" size="sm">Only {availableStock} left</Badge>
            ) : (
              <Badge variant="sage" size="sm">In Stock</Badge>
            )}
            {product.type === 'rateLinked' ? (
              <span className="text-[10px] font-sans font-medium px-2 py-0.5 rounded bg-white/90 text-[#C9A24B] border border-[#EADFC8] shadow-xs backdrop-blur-xs">
                Live Rate
              </span>
            ) : (
              <span className="text-[10px] font-sans font-medium px-2 py-0.5 rounded bg-white/90 text-[#5A4630] border border-[#EADFC8] shadow-xs backdrop-blur-xs">
                Certified
              </span>
            )}
          </div>

          <div className="flex items-center gap-1.5 pointer-events-auto">
            {/* Quick View Button */}
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setQuickViewOpen(true);
              }}
              className="w-8 h-8 rounded-full bg-white/90 text-[#7A6A55] border border-[#EADFC8] hover:text-[#C9A24B] hover:bg-white flex items-center justify-center shadow-xs transition-colors"
              title="Quick View"
              aria-label="Quick View"
            >
              <Eye className="w-4 h-4" />
            </button>

            {/* Wishlist Button */}
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                toggleWishlist(product.id);
              }}
              className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors border shadow-xs ${
                isWishlisted
                  ? 'bg-[#C9A24B] text-white border-[#C9A24B]'
                  : 'bg-white/90 text-[#7A6A55] border-[#EADFC8] hover:text-[#C9A24B] hover:bg-white'
              }`}
              aria-label={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
            >
              <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-white' : ''}`} />
            </button>
          </div>
        </div>

        {/* Real Product Image Tile */}
        <Link to={`/p/${product.slug}`} className="block relative aspect-4/3 overflow-hidden bg-[#FAF6EE]">
          <img
            src={product.imageUrl || `/products/${product.id}.jpg`}
            alt={product.name}
            loading="lazy"
            className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-108"
          />
          {/* Subtle luxury vignette on hover */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/25 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
        </Link>

        {/* Product Details */}
        <div className="p-3.5 sm:p-4 flex-1 flex flex-col justify-between space-y-3">
          <div>
            <div className="flex items-center justify-between text-[10px] text-[#7A6A55] font-mono mb-1">
              <span>SKU: {product.sku}</span>
              <span className="flex items-center gap-0.5 text-[#BA8332] font-semibold">
                <Star className="w-3 h-3 fill-[#BA8332]" />
                <span>{ratingValue.toFixed(1)}</span>
              </span>
            </div>

            <div className="flex items-center gap-1 text-[11px] text-[#7A6A55] font-medium mb-1 truncate">
              <ShieldCheck className="w-3.5 h-3.5 text-[#C9A24B] shrink-0" />
              <span className="truncate">{getSpecLabel()}</span>
            </div>

            <Link to={`/p/${product.slug}`}>
              <h3 className="font-serif text-sm sm:text-base font-bold text-[#5A4630] line-clamp-2 hover:text-[#C9A24B] transition-colors leading-snug">
                {product.name}
              </h3>
            </Link>
          </div>

          {/* Price & Action Row */}
          <div className="pt-2 border-t border-[#EADFC8]/60 flex flex-wrap items-end justify-between gap-1.5 sm:gap-2">
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] text-[#7A6A55]">
                  {product.type === 'rateLinked' ? 'Live Rate' : 'Certified'}
                </span>
                {product.mrp > priceCalc.total && (
                  <span className="text-[9px] font-bold text-[#2D5A27] bg-[#E8F5E9] px-1 py-0.2 rounded border border-[#C8E6C9]">
                    Save {Math.round(((product.mrp - priceCalc.total) / product.mrp) * 100)}%
                  </span>
                )}
              </div>
              <div className="flex items-baseline gap-1.5 flex-wrap">
                <span className="font-serif text-base sm:text-lg font-bold text-[#5A4630] tabular-nums">
                  {formatINR(priceCalc.total)}
                </span>
                {product.mrp > priceCalc.total && (
                  <span className="text-xs text-[#7A6A55]/60 line-through tabular-nums">
                    {formatINR(product.mrp)}
                  </span>
                )}
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              {(availableStock > 0 || product.backorderEligible) && (
                <button
                  type="button"
                  onClick={handleQuickAddToCart}
                  className={`p-2 rounded-md border transition-all ${
                    addedAnimation
                      ? 'bg-[#2D5A27] text-white border-[#2D5A27]'
                      : 'bg-[#FFFBF3] hover:bg-[#F8EFD9] text-[#5A4630] border-[#EADFC8] hover:border-[#C9A24B]'
                  }`}
                  title="Add to Cart"
                  aria-label="Add to cart"
                >
                  <ShoppingBag className="w-3.5 h-3.5" />
                </button>
              )}

              <Link
                to={`/p/${product.slug}`}
                className="text-xs font-medium px-2.5 sm:px-3 py-1.5 rounded-md bg-[#FFFBF3] hover:bg-[#F8EFD9] text-[#5A4630] border border-[#EADFC8] hover:border-[#C9A24B] transition-colors shrink-0"
              >
                View Piece
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Quick View Modal */}
      <Modal
        isOpen={quickViewOpen}
        onClose={() => setQuickViewOpen(false)}
        title={
          <div className="flex items-center gap-2">
            <Badge variant="gold" size="sm">Quick View</Badge>
            <span className="text-sm font-bold text-[#5A4630] truncate">{product.name}</span>
          </div>
        }
        maxWidth="lg"
      >
        <div className="p-4 sm:p-6 grid grid-cols-1 md:grid-cols-2 gap-6 bg-[#FFFBF3]">
          {/* Image */}
          <div className="rounded-xl overflow-hidden border border-[#EADFC8] bg-white aspect-4/3 flex items-center justify-center p-2">
            <img
              src={product.imageUrl || `/products/${product.id}.jpg`}
              alt={product.name}
              className="w-full h-full object-cover rounded-lg"
            />
          </div>

          {/* Specs & Pricing */}
          <div className="space-y-4 text-xs">
            <div>
              <div className="text-[11px] font-mono text-[#7A6A55] uppercase tracking-wider mb-1">
                SKU: {product.sku}
              </div>
              <h3 className="font-serif text-xl font-bold text-[#5A4630] leading-tight">
                {product.name}
              </h3>
              <div className="flex items-center gap-2 mt-2">
                <span className="flex items-center gap-1 text-[#BA8332] font-semibold">
                  <Star className="w-3.5 h-3.5 fill-[#BA8332]" />
                  <span>{ratingValue.toFixed(1)} / 5.0</span>
                </span>
                <span className="text-[#EADFC8]">•</span>
                <span className="text-[#7A6A55]">{product.brand}</span>
              </div>
            </div>

            <p className="text-[#7A6A55] leading-relaxed line-clamp-3">
              {product.description}
            </p>

            {/* Price breakdown pill */}
            <div className="p-3 bg-white rounded-lg border border-[#EADFC8] space-y-1.5">
              <div className="flex justify-between">
                <span className="text-[#7A6A55]">Metal / Base Value:</span>
                <span className="font-semibold text-[#5A4630]">{formatINR(priceCalc.metalValue)}</span>
              </div>
              {priceCalc.makingCharges > 0 && (
                <div className="flex justify-between">
                  <span className="text-[#7A6A55]">Making Charges:</span>
                  <span className="font-semibold text-[#5A4630]">{formatINR(priceCalc.makingCharges)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-[#7A6A55]">GST (3%):</span>
                <span className="font-semibold text-[#5A4630]">{formatINR(priceCalc.gstAmount)}</span>
              </div>
              <div className="pt-1.5 border-t border-[#EADFC8] flex justify-between items-baseline">
                <span className="font-bold text-[#5A4630]">Total Price:</span>
                <span className="text-lg font-serif font-bold text-[#C9A24B]">
                  {formatINR(priceCalc.total)}
                </span>
              </div>
            </div>

            {/* Stock status */}
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-[#7A6A55]">Availability:</span>
              <Badge variant={availableStock > 0 ? 'sage' : 'coral'} size="sm">
                {availableStock > 0 ? `${availableStock} in stock` : 'Out of stock'}
              </Badge>
            </div>

            {/* Actions */}
            <div className="pt-2 flex gap-3">
              <Button
                variant="primary"
                size="sm"
                className="flex-1"
                disabled={availableStock <= 0 && !product.backorderEligible}
                onClick={() => {
                  addToCart(product.id, 1);
                  setQuickViewOpen(false);
                  navigate('/cart');
                }}
                leftIcon={<ShoppingBag className="w-4 h-4" />}
              >
                {availableStock > 0 ? 'Add to Cart' : 'Backorder'}
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => {
                  setQuickViewOpen(false);
                  navigate(`/p/${product.slug}`);
                }}
                rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
              >
                Full Details
              </Button>
            </div>
          </div>
        </div>
      </Modal>
    </>
  );
};
