import type { Offer } from '../data/types';

export interface CartItemForCoupon {
  category: string;
  isRateLinked?: boolean;
  subtotal: number;
  fineWeightG?: number;
  metalValue?: number;
}

export interface CouponEvaluationResult {
  isValid: boolean;
  discountAmount: number;
  reason?: string;
}

/**
 * Coupon Engine with Bullion Margin Guardrail:
 * Bullion items operate on thin margins (1% to 2.5%).
 * If a coupon reduces bullion gross margin below the required guardrail,
 * the coupon is rejected or restricted to non-bullion line items.
 */
export function evaluateCoupon(
  offer: Offer,
  cartTotal: number,
  items: CartItemForCoupon[],
  customerUsageCount: number = 0,
  currentDateIso: string = new Date().toISOString()
): CouponEvaluationResult {
  // 1. Status Check
  if (offer.approvalStatus !== 'Active') {
    return {
      isValid: false,
      discountAmount: 0,
      reason: `Offer "${offer.code}" is currently not active (status: ${offer.approvalStatus}).`,
    };
  }

  // 2. Date Validity Check
  const now = new Date(currentDateIso).getTime();
  const start = new Date(offer.startDate).getTime();
  const end = new Date(offer.endDate).getTime();

  if (now < start) {
    return {
      isValid: false,
      discountAmount: 0,
      reason: `Offer "${offer.code}" has not started yet.`,
    };
  }

  if (now > end) {
    return {
      isValid: false,
      discountAmount: 0,
      reason: `Offer "${offer.code}" has expired on ${offer.endDate}.`,
    };
  }

  // 3. Minimum Order Value Check
  if (cartTotal < offer.minOrderValue) {
    return {
      isValid: false,
      discountAmount: 0,
      reason: `Minimum order value of ₹${offer.minOrderValue.toLocaleString('en-IN')} required for coupon "${offer.code}".`,
    };
  }

  // 4. Global Usage Limit Check
  if (offer.usedCount >= offer.usageLimitTotal) {
    return {
      isValid: false,
      discountAmount: 0,
      reason: `Offer "${offer.code}" has reached its maximum global redemption limit.`,
    };
  }

  // 5. Per-Customer Usage Limit Check
  if (customerUsageCount >= offer.usageLimitPerCustomer) {
    return {
      isValid: false,
      discountAmount: 0,
      reason: `You have reached the maximum allowed uses (${offer.usageLimitPerCustomer}) for coupon "${offer.code}".`,
    };
  }

  // 6. Bullion Margin Guardrail Check:
  // Bullion cannot be discounted past the margin guardrail (e.g. 1% min margin)
  const bullionItems = items.filter(i => i.category === 'gold' || i.category === 'silver' || i.isRateLinked);
  const nonBullionItems = items.filter(i => i.category !== 'gold' && i.category !== 'silver' && !i.isRateLinked);

  const bullionSubtotal = bullionItems.reduce((acc, i) => acc + i.subtotal, 0);
  const nonBullionSubtotal = nonBullionItems.reduce((acc, i) => acc + i.subtotal, 0);

  let rawDiscount = 0;
  if (offer.type === 'percent') {
    rawDiscount = Math.round((cartTotal * offer.discountValue) / 100);
  } else {
    rawDiscount = offer.discountValue;
  }

  // If cart contains bullion, check margin guardrail
  if (bullionSubtotal > 0) {
    const maxBullionDiscount = Math.round(bullionSubtotal * (offer.marginGuardrailPercent || 0.005));
    const maxAllowedDiscount = nonBullionSubtotal + maxBullionDiscount;

    if (rawDiscount > maxAllowedDiscount) {
      // Guardrail blocks or caps discount
      if (nonBullionSubtotal === 0 && rawDiscount > maxBullionDiscount) {
        return {
          isValid: false,
          discountAmount: 0,
          reason: `Margin guardrail protection: Pure bullion cannot be discounted below statutory margin floor (${((offer.marginGuardrailPercent || 0.005) * 100).toFixed(1)}%).`,
        };
      }
      rawDiscount = Math.min(rawDiscount, maxAllowedDiscount);
    }
  }

  return {
    isValid: true,
    discountAmount: rawDiscount,
  };
}
