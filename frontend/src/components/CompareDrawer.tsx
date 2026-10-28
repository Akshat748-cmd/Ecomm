import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAppStore } from '../store';
import { calculatePrice, formatINR } from '../lib/pricing';
import { Modal } from './Modal';
import { Button } from './Button';
import { Badge } from './Badge';
import { X, ShoppingBag, ShieldCheck } from 'lucide-react';

interface CompareDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  productIds: string[];
  onRemove: (id: string) => void;
  onClear: () => void;
}

export const CompareDrawer: React.FC<CompareDrawerProps> = ({
  isOpen,
  onClose,
  productIds,
  onRemove,
  onClear,
}) => {
  const navigate = useNavigate();
  const { products, rates, pricingConfig, addToCart } = useAppStore();

  const selectedProducts = products.filter((p) => productIds.includes(p.id));

  if (!isOpen) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        <div className="flex items-center justify-between w-full pr-6">
          <div className="flex items-center gap-2">
            <Badge variant="gold" size="sm">Specifications Comparison</Badge>
            <span className="text-sm font-bold text-[#5A4630]">
              Comparing {selectedProducts.length} Precious {selectedProducts.length === 1 ? 'Article' : 'Articles'}
            </span>
          </div>
          {selectedProducts.length > 0 && (
            <button
              type="button"
              onClick={onClear}
              className="text-xs text-[#C9A24B] hover:underline font-medium"
            >
              Clear All
            </button>
          )}
        </div>
      }
      maxWidth="xl"
    >
      {selectedProducts.length === 0 ? (
        <div className="p-8 text-center space-y-3">
          <p className="text-xs text-[#7A6A55]">No pieces currently selected for comparison.</p>
          <Button variant="primary" size="sm" onClick={onClose}>
            Browse Collection
          </Button>
        </div>
      ) : (
        <div className="p-4 sm:p-6 overflow-x-auto bg-[#FFFBF3]">
          <div className="min-w-[620px]">
            {/* Grid layout */}
            <div
              className="grid gap-4 items-start"
              style={{
                gridTemplateColumns: `160px repeat(${selectedProducts.length}, minmax(180px, 1fr))`,
              }}
            >
              {/* Product Header Row */}
              <div className="text-xs font-bold text-[#7A6A55] pt-2 uppercase tracking-wider">
                Article Details
              </div>
              {selectedProducts.map((p) => {
                const price = calculatePrice(p, rates, pricingConfig).total;
                const available = p.stock - p.reserved;
                return (
                  <div key={p.id} className="bg-white p-3 rounded-xl border border-[#EADFC8] space-y-2 relative shadow-xs">
                    <button
                      type="button"
                      onClick={() => onRemove(p.id)}
                      className="absolute top-2 right-2 p-1 text-[#7A6A55] hover:text-[#5A4630] rounded-full hover:bg-[#F8EFD9]"
                      title="Remove from comparison"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                    <div className="w-full aspect-4/3 rounded-lg overflow-hidden border border-[#EADFC8] bg-[#FAF6EE]">
                      <img
                        src={p.imageUrl || `/products/${p.id}.jpg`}
                        alt={p.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div>
                      <div className="text-[10px] font-mono text-[#7A6A55] uppercase">
                        SKU: {p.sku}
                      </div>
                      <h4 className="font-serif text-xs font-bold text-[#5A4630] line-clamp-2 mt-0.5">
                        {p.name}
                      </h4>
                    </div>
                    <div className="pt-1 border-t border-[#EADFC8]/60">
                      <div className="text-sm font-serif font-bold text-[#C9A24B] tabular-nums">
                        {formatINR(price)}
                      </div>
                      <div className="text-[10px] text-[#7A6A55]">
                        {available > 0 ? (
                          <span className="text-[#2D5A27] font-medium">{available} in stock</span>
                        ) : (
                          <span className="text-[#BA3232] font-medium">Out of stock</span>
                        )}
                      </div>
                    </div>
                    <div className="pt-2 flex flex-col gap-1.5">
                      <Button
                        variant="primary"
                        size="sm"
                        disabled={available <= 0 && !p.backorderEligible}
                        onClick={() => {
                          addToCart(p.id, 1);
                          onClose();
                          navigate('/cart');
                        }}
                        leftIcon={<ShoppingBag className="w-3.5 h-3.5" />}
                        className="w-full text-xs"
                      >
                        Add to Cart
                      </Button>
                      <Link
                        to={`/p/${p.slug}`}
                        onClick={onClose}
                        className="text-center text-[11px] text-[#5A4630] hover:text-[#C9A24B] font-medium py-1"
                      >
                        View Full Details →
                      </Link>
                    </div>
                  </div>
                );
              })}

              {/* Metal & Purity */}
              <div className="text-xs font-semibold text-[#5A4630] py-2 border-t border-[#EADFC8]">
                Metal & Purity
              </div>
              {selectedProducts.map((p) => (
                <div key={`metal-${p.id}`} className="text-xs text-[#5A4630] py-2 border-t border-[#EADFC8] font-medium">
                  {p.attributes.bullion?.purity || p.metal || (p.purity >= 0.99 ? '24K (999.9)' : '22K (916)')}
                </div>
              ))}

              {/* Weight */}
              <div className="text-xs font-semibold text-[#5A4630] py-2 border-t border-[#EADFC8]">
                Weight (Net / Gross)
              </div>
              {selectedProducts.map((p) => (
                <div key={`wt-${p.id}`} className="text-xs text-[#5A4630] py-2 border-t border-[#EADFC8] font-mono">
                  {p.netWeightG}g / {p.grossWeightG}g
                  {p.attributes.bullion?.fineWeightG ? ` (${p.attributes.bullion.fineWeightG}g fine)` : ''}
                </div>
              ))}

              {/* Stone / Gem / Mukhi */}
              <div className="text-xs font-semibold text-[#5A4630] py-2 border-t border-[#EADFC8]">
                Specifics / Origin
              </div>
              {selectedProducts.map((p) => (
                <div key={`spec-${p.id}`} className="text-xs text-[#5A4630] py-2 border-t border-[#EADFC8]">
                  {p.attributes.gemstone
                    ? `${p.attributes.gemstone.variety} • ${p.attributes.gemstone.origin}`
                    : p.attributes.rudraksha
                    ? `${p.attributes.rudraksha.mukhi} Mukhi • ${p.attributes.rudraksha.provenance}`
                    : p.origin || 'Refined Precious Metal'}
                </div>
              ))}

              {/* Making Charges */}
              <div className="text-xs font-semibold text-[#5A4630] py-2 border-t border-[#EADFC8]">
                Making Charges
              </div>
              {selectedProducts.map((p) => (
                <div key={`mk-${p.id}`} className="text-xs text-[#5A4630] py-2 border-t border-[#EADFC8]">
                  {p.makingPercent > 0 ? `${(p.makingPercent * 100).toFixed(1)}%` : 'Included'}
                </div>
              ))}

              {/* Certification */}
              <div className="text-xs font-semibold text-[#5A4630] py-2 border-t border-[#EADFC8]">
                Assay Certificate
              </div>
              {selectedProducts.map((p) => (
                <div key={`cert-${p.id}`} className="text-xs text-[#5A4630] py-2 border-t border-[#EADFC8] space-y-0.5">
                  <div className="font-medium flex items-center gap-1 text-[#2D5A27]">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>{p.certificate.issuer}</span>
                  </div>
                  <div className="font-mono text-[11px] text-[#7A6A55]">#{p.certificate.number}</div>
                </div>
              ))}

              {/* Hallmark & HUID */}
              <div className="text-xs font-semibold text-[#5A4630] py-2 border-t border-[#EADFC8]">
                Hallmark / HUID
              </div>
              {selectedProducts.map((p) => (
                <div key={`huid-${p.id}`} className="text-xs text-[#5A4630] py-2 border-t border-[#EADFC8]">
                  {p.huid ? (
                    <span className="font-mono font-bold text-[#C9A24B] bg-[#FFFBF3] px-2 py-0.5 rounded border border-[#EADFC8]">
                      {p.huid}
                    </span>
                  ) : p.hallmarkStatus || 'Certified'}
                </div>
              ))}

              {/* Personalization */}
              <div className="text-xs font-semibold text-[#5A4630] py-2 border-t border-[#EADFC8]">
                Laser Engraving
              </div>
              {selectedProducts.map((p) => (
                <div key={`engr-${p.id}`} className="text-xs py-2 border-t border-[#EADFC8]">
                  {p.personalizationEligible ? (
                    <Badge variant="gold" size="sm">Eligible (+₹500)</Badge>
                  ) : (
                    <span className="text-[#7A6A55]">Standard Vault Pack</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </Modal>
  );
};
