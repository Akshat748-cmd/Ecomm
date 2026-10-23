import React from 'react';
import { Link } from 'react-router-dom';
import { useAppStore } from '../store';
import { useSEO } from '../lib/useSEO';
import { calculatePrice, formatINR } from '../lib/pricing';
import { Card } from '../components/Card';
import { Badge } from '../components/Badge';
import { Button } from '../components/Button';
import { EmptyState } from '../components/EmptyState';
import {
  Heart,
  ShoppingBag,
  Trash2,
  ChevronRight,
  ShieldCheck,
  Clock,
} from 'lucide-react';

export const WishlistPage: React.FC = () => {
  useSEO({
    title: 'Saved Pieces & Wishlist',
    description: 'Review your saved gold bullion, fine jewellery, and certified gemstones with live rate tracking.',
    canonicalPath: '/wishlist',
  });

  const {
    wishlist,
    products,
    rates,
    pricingConfig,
    quotes,
    toggleWishlist,
    addToCart,
  } = useAppStore();

  const wishlistedProducts = products.filter((p) => wishlist.includes(p.id));


  const handleMoveToCart = (productId: string) => {
    const success = addToCart(productId, 1);
    if (success) {
      toggleWishlist(productId);
    }
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Breadcrumb */}
      <nav aria-label="Breadcrumb" className="text-xs text-[#7A6A55] flex items-center gap-1.5 flex-wrap">
        <Link to="/" className="hover:text-[#C9A24B]">Home</Link>
        <ChevronRight className="w-3.5 h-3.5 text-[#EADFC8]" />
        <span className="text-[#5A4630] font-medium">Saved Pieces (Wishlist)</span>
      </nav>

      {/* Header */}
      <div className="border-b border-[#EADFC8] pb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl sm:text-4xl font-bold text-[#5A4630] flex items-center gap-2.5">
            <Heart className="w-7 h-7 text-[#C9A24B] fill-[#F1E3BD]" />
            Saved Precious Pieces
          </h1>
          <p className="text-xs sm:text-sm text-[#7A6A55] mt-1">
            Prices update dynamically with live spot market rates. Saved items persist across sessions.
          </p>
        </div>

        {wishlistedProducts.length > 0 && (
          <div className="text-xs font-medium text-[#5A4630]">
            <strong>{wishlistedProducts.length}</strong> items saved
          </div>
        )}
      </div>

      {/* Wishlist Items List or Empty State */}
      {wishlistedProducts.length === 0 ? (
        <EmptyState
          icon={<Heart className="w-8 h-8 text-[#C9A24B]" />}
          title="Your Wishlist is Empty"
          description="You haven't saved any precious coins, bars, jewellery, or gemstones yet. Browse our authenticated catalogue to save pieces for live rate tracking."
          actionLabel="Explore Gold Bullion"
          onAction={() => {
            window.location.href = '/c/gold';
          }}
        />
      ) : (
        <div className="space-y-4">
          {wishlistedProducts.map((product) => {
            const priceCalc = calculatePrice(product, rates, pricingConfig);
            const availableStock = product.stock - product.reserved;
            const activeQuote = quotes.find(
              (q) => q.productId === product.id && q.status === 'Active'
            );

            return (
              <Card
                key={product.id}
                variant="surface"
                className="p-5 border-[#EADFC8] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5"
              >
                {/* Left: Thumbnail & Details */}
                <div className="flex items-start gap-4">
                  {/* Real Product Thumbnail */}
                  <div className="w-20 h-20 rounded-xl overflow-hidden border border-[#EADFC8] bg-[#FAF6EE] shrink-0 shadow-xs">
                    <img
                      src={product.imageUrl || `/products/${product.id}.jpg`}
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-[10px] font-mono text-[#7A6A55]">
                        SKU: {product.sku}
                      </span>
                      {availableStock <= 0 ? (
                        <Badge variant="coral" size="sm">Out of Stock</Badge>
                      ) : availableStock <= 3 ? (
                        <Badge variant="amber" size="sm">Only {availableStock} left</Badge>
                      ) : (
                        <Badge variant="sage" size="sm">In Stock</Badge>
                      )}
                      {activeQuote && (
                        <Badge variant="gold" size="sm" className="flex items-center gap-1">
                          <Clock className="w-3 h-3 text-[#C9A24B]" />
                          <span>Quote Active</span>
                        </Badge>
                      )}
                    </div>

                    <Link to={`/p/${product.slug}`}>
                      <h3 className="font-serif text-base sm:text-lg font-bold text-[#5A4630] hover:text-[#C9A24B] transition-colors">
                        {product.name}
                      </h3>
                    </Link>

                    <div className="text-xs text-[#7A6A55] flex items-center gap-3">
                      <span className="flex items-center gap-1">
                        <ShieldCheck className="w-3.5 h-3.5 text-[#C9A24B]" />
                        {product.category === 'gemstones' || product.category === 'coloured-stones'
                          ? `${product.attributes.gemstone?.caratWeight} ct • ${product.attributes.gemstone?.variety}`
                          : `${product.netWeightG}g • ${product.attributes.bullion?.purity || 'Hallmarked'}`}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Right: Price & Actions */}
                <div className="flex sm:flex-col items-end justify-between w-full sm:w-auto pt-3 sm:pt-0 border-t sm:border-t-0 border-[#EADFC8] gap-3">
                  <div className="text-left sm:text-right">
                    <div className="text-[10px] text-[#7A6A55]">
                      {product.type === 'rateLinked' ? 'Live Price' : 'Certified Price'}
                    </div>
                    <div className="font-serif text-xl font-bold text-[#5A4630] tabular-nums">
                      {formatINR(priceCalc.total)}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      variant="primary"
                      size="sm"
                      disabled={availableStock <= 0}
                      onClick={() => handleMoveToCart(product.id)}
                      leftIcon={<ShoppingBag className="w-3.5 h-3.5" />}
                    >
                      Move to Cart
                    </Button>
                    <button
                      type="button"
                      onClick={() => toggleWishlist(product.id)}
                      className="p-2 text-[#7A6A55] hover:text-[#8C2E24] hover:bg-[#F7D4CF]/40 rounded-lg transition-colors"
                      title="Remove from wishlist"
                      aria-label="Remove item"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};
