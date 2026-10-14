import type { Product, LiveRates, PricingConfig } from '../data/types';

export interface PriceCalculationResult {
  productId: string;
  isRateLinked: boolean;
  fineWeightG: number;
  ratePerGram: number;
  metalValue: number;
  makingCharges: number;
  packagingCharges: number;
  insuranceCharges: number;
  subtotal: number;
  gstPercent: number;
  gstAmount: number;
  total: number;
  mrp: number;
  savingsVsMrp: number;
  formulaVersion: string;
}

/**
 * Single price function `calculatePrice(product, rates, config)`
 * The ONLY place prices are computed across the application.
 */
export function calculatePrice(
  product: Product,
  rates: LiveRates,
  config: PricingConfig
): PriceCalculationResult {
  const gstPercent = config.costComponents.gstPercent || 0.03;

  // 1. Fixed Price Items (Gemstones, Sacred Rudraksha, Curated Hampers)
  if (product.type === 'fixed') {
    const fixedBase = product.fixedPrice || product.mrp;
    const gstAmount = Math.round(fixedBase * gstPercent);
    const total = Math.round(fixedBase + gstAmount);

    return {
      productId: product.id,
      isRateLinked: false,
      fineWeightG: 0,
      ratePerGram: 0,
      metalValue: fixedBase,
      makingCharges: 0,
      packagingCharges: product.packagingCost || 0,
      insuranceCharges: product.insuranceCost || 0,
      subtotal: fixedBase,
      gstPercent,
      gstAmount,
      total,
      mrp: product.mrp,
      savingsVsMrp: Math.max(0, product.mrp - total),
      formulaVersion: config.formulaVersion,
    };
  }

  // 2. Rate-Linked Items (Bullion, 22K Jewellery, Rate-Linked Gift Sets)
  // Determine rate per gram based on metal and purity
  let ratePerGram = rates.gold24k;
  if (product.category === 'silver') {
    ratePerGram = rates.silver999;
  } else if (product.metal === 'Gold 22K' || (product.purity < 0.95 && product.category === 'gold')) {
    ratePerGram = rates.gold22k;
  }

  // fineWeight = netWeightG x purity
  const fineWeightG = Number((product.netWeightG * product.purity).toFixed(4));

  // metalValue = fineWeight x ratePerGram
  const metalValue = Math.round(fineWeightG * ratePerGram);

  // making = metalValue x makingPercent
  const makingCharges = Math.round(metalValue * (product.makingPercent || config.costComponents.makingPercentBullion));

  const packagingCharges = product.packagingCost || config.costComponents.packagingCost || 0;
  const insuranceCharges = product.insuranceCost || config.costComponents.insuranceCost || 0;

  // subtotal = metalValue + making + packaging + insurance
  const subtotal = metalValue + makingCharges + packagingCharges + insuranceCharges;

  // gst = subtotal x gstPercent
  const gstAmount = Math.round(subtotal * gstPercent);

  // total = round(subtotal + gst)
  let total = subtotal + gstAmount;
  if (config.costComponents.roundingRule === 'ceil') {
    total = Math.ceil(total);
  } else if (config.costComponents.roundingRule === 'floor') {
    total = Math.floor(total);
  } else {
    total = Math.round(total);
  }

  return {
    productId: product.id,
    isRateLinked: true,
    fineWeightG,
    ratePerGram,
    metalValue,
    makingCharges,
    packagingCharges,
    insuranceCharges,
    subtotal,
    gstPercent,
    gstAmount,
    total,
    mrp: product.mrp,
    savingsVsMrp: Math.max(0, product.mrp - total),
    formulaVersion: config.formulaVersion,
  };
}

/**
 * Format currency in Indian Rupees (INR) with Indian digit grouping
 * e.g. 13000 -> ₹13,000, 148000 -> ₹1,48,000, 1250000 -> ₹12,50,000
 */
export function formatINR(amount: number): string {
  if (isNaN(amount)) return '₹0';
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Format ISO UTC string to Indian Standard Time (IST) readable format
 */
export function formatDateTime(isoString: string): string {
  try {
    const date = new Date(isoString);
    return date.toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true,
    });
  } catch {
    return isoString;
  }
}

/**
 * Format full date and time in local format
 */
export function formatFullDateTime(isoString: string): string {
  try {
    const date = new Date(isoString);
    return date.toLocaleString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true,
    });
  } catch {
    return isoString;
  }
}
