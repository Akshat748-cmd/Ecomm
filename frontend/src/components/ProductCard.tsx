import React from 'react';
import { Link } from 'react-router-dom';
import type { Product } from '../data/types';
import { useAppStore } from '../store';
import { calculatePrice, formatINR } from '../lib/pricing';
import { Badge } from './Badge';
import { Heart, ShieldCheck } from 'lucide-react';

export interface ProductCardProps {
  product: Product;
  className?: string;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, className = '' }) => {
  const { rates, pricingConfig, wishlist, toggleWishlist } = useAppStore();
  const isWishlisted = wishlist.includes(product.id);

  const priceCalc = calculatePrice(product, rates, pricingConfig);
  const availableStock = product.stock - product.reserved;

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

  return (
    <div
      className={`group relative bg-[#FFFFFF] border border-[#EADFC8] rounded-[12px] overflow-hidden flex flex-col shadow-[0_4px_20px_rgba(90,70,48,0.06)] hover:shadow-[0_8px_28px_rgba(90,70,48,0.12)] transition-all duration-300 hover:-translate-y-1 ${className}`}
    >
      {/* Top badges & Wishlist */}
      <div className="absolute top-3 left-3 right-3 z-10 flex items-center justify-between pointer-events-none">
        <div className="flex flex-col gap-1 items-start">
          {availableStock <= 0 ? (
            <Badge variant="coral" size="sm">Out of Stock</Badge>
          ) : availableStock <= 3 ? (
            <Badge variant="amber" size="sm">Only {availableStock} left</Badge>
          ) : (
            <Badge variant="sage" size="sm">In Stock</Badge>
          )}
          {product.type === 'rateLinked' && (
            <span className="text-[10px] font-sans font-medium px-2 py-0.5 rounded bg-white/90 text-[#C9A24B] border border-[#EADFC8] shadow-xs backdrop-blur-xs">
              Live Rate
            </span>
          )}
        </div>

        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            toggleWishlist(product.id);
          }}
          className={`pointer-events-auto w-8 h-8 rounded-full flex items-center justify-center transition-colors border shadow-xs ${
            isWishlisted
              ? 'bg-[#C9A24B] text-white border-[#C9A24B]'
              : 'bg-white/90 text-[#7A6A55] border-[#EADFC8] hover:text-[#C9A24B] hover:bg-white'
          }`}
          aria-label={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
        >
          <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-white' : ''}`} />
        </button>
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
          <div className="flex items-center gap-1.5 text-[11px] text-[#7A6A55] font-medium mb-1">
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
            <div className="text-[10px] text-[#7A6A55]">
              {product.type === 'rateLinked' ? 'Live Rate Price' : 'Certified Price'}
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

          <Link
            to={`/p/${product.slug}`}
            className="text-xs font-medium px-2.5 sm:px-3 py-1.5 rounded-md bg-[#FFFBF3] hover:bg-[#F8EFD9] text-[#5A4630] border border-[#EADFC8] hover:border-[#C9A24B] transition-colors shrink-0"
          >
            View Piece
          </Link>
        </div>
      </div>
    </div>
  );
};
