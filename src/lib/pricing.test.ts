import { describe, it, expect } from 'vitest';
import { calculatePrice, formatINR } from './pricing';
import type { Product, LiveRates, PricingConfig } from '../data/types';

describe('calculatePrice Engine & Formatting', () => {
  const dummyRates: LiveRates = {
    gold24k: 13000,
    gold22k: 11917,
    silver999: 190,
    lastUpdated: new Date().toISOString(),
  };

  const dummyConfig: PricingConfig = {
    formulaVersion: 'v2.4.1',
    costComponents: {
      makingPercentBullion: 0.04,
      makingPercentJewellery: 0.12,
      assayCertificateCost: 350,
      packagingCost: 250,
      insuranceCost: 450,
      gstPercent: 0.03,
      roundingRule: 'round',
      marginPercentBullion: 0.015,
      marginPercentJewellery: 0.05,
    },
    pricingModelPerCategory: {
      gold: 'Dynamic',
      silver: 'Dynamic',
      gemstones: 'Fixed',
      'coloured-stones': 'Fixed',
      rudraksha: 'Fixed',
      gifting: 'Hybrid',
    },
  };

  it('accurately computes rate-linked bullion price with metal value, making, packaging, insurance and 3% GST', () => {
    const goldCoin: Product = {
      id: 'test-gold-10g',
      slug: 'test-gold-10g',
      name: '24K Pure Gold Investment Coin 10g',
      category: 'gold',
      type: 'rateLinked',
      sku: 'AU-TEST-10G',
      brand: 'AURUM & CO',
      description: 'Test bullion item',
      netWeightG: 10.0,
      grossWeightG: 10.0,
      purity: 0.9999,
      metal: 'Gold 24K',
      stock: 10,
      reserved: 0,
      lotBatchSerial: 'LOT-TEST-1',
      certificate: {
        issuer: 'NABL',
        number: 'CERT-001',
        status: 'Verified',
      },
      mrp: 150000,
      makingPercent: 0.04,
      packagingCost: 250,
      insuranceCost: 450,
      attributes: {},
    };

    const result = calculatePrice(goldCoin, dummyRates, dummyConfig);

    // fineWeight = 10 * 0.9999 = 9.999
    expect(result.fineWeightG).toBeCloseTo(9.999, 3);
    // metalValue = round(9.999 * 13000) = 129987
    expect(result.metalValue).toBe(129987);
    // making = round(129987 * 0.04) = 5199
    expect(result.makingCharges).toBe(5199);
    // packaging = 250, insurance = 450
    // subtotal = 129987 + 5199 + 250 + 450 = 135886
    expect(result.subtotal).toBe(135886);
    // gst = round(135886 * 0.03) = 4077
    expect(result.gstAmount).toBe(4077);
    // total = 135886 + 4077 = 139963
    expect(result.total).toBe(139963);
    expect(result.isRateLinked).toBe(true);
  });

  it('accurately computes fixed price items with 3% GST and without metal rates', () => {
    const ruby: Product = {
      id: 'test-ruby',
      slug: 'test-ruby',
      name: 'Natural Unheated Burmese Ruby 3.15 ct',
      category: 'gemstones',
      type: 'fixed',
      sku: 'GEM-RUBY-TEST',
      brand: 'AURUM & CO',
      description: 'Certified natural ruby',
      netWeightG: 0.63,
      grossWeightG: 0.63,
      purity: 1.0,
      stock: 2,
      reserved: 0,
      lotBatchSerial: 'LOT-GEM-01',
      certificate: {
        issuer: 'GIA',
        number: 'GIA-TEST',
        status: 'Verified',
      },
      mrp: 420000,
      makingPercent: 0,
      fixedPrice: 385000,
      attributes: {},
    };

    const result = calculatePrice(ruby, dummyRates, dummyConfig);

    expect(result.isRateLinked).toBe(false);
    expect(result.subtotal).toBe(385000);
    // gst = round(385000 * 0.03) = 11550
    expect(result.gstAmount).toBe(11550);
    // total = 385000 + 11550 = 396550
    expect(result.total).toBe(396550);
    expect(result.savingsVsMrp).toBe(420000 - 396550);
  });

  it('formats Indian Rupee amounts with currency symbol and grouping', () => {
    const formatted13k = formatINR(13000);
    expect(formatted13k).toContain('13,000');

    const formattedLakh = formatINR(148000);
    expect(formattedLakh).toContain('1,48,000');
  });
});
