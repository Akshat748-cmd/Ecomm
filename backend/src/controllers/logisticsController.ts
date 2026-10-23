import type { Request, Response } from 'express';

export async function checkPincodeServiceability(req: Request, res: Response): Promise<void> {
  const { pincode } = req.body;
  if (!pincode || typeof pincode !== 'string') {
    res.status(400).json({ error: 'ValidationError', message: 'Valid 6-digit Indian PIN code required' });
    return;
  }

  const cleanPin = pincode.trim();
  if (!/^\d{6}$/.test(cleanPin)) {
    res.status(400).json({
      serviceable: false,
      error: 'ValidationError',
      message: 'PIN code must be exactly 6 numeric digits.',
    });
    return;
  }

  // Business rule: PIN codes starting with '9' are non-serviceable for high-security armoured transit
  if (cleanPin.startsWith('9')) {
    res.status(200).json({
      serviceable: false,
      pincode: cleanPin,
      message: 'Pincode not serviceable for armoured transit. High-value bullion logistics perimeter restriction.',
      supportedCouriers: [],
      estimatedTransitDays: null,
    });
    return;
  }

  // Serviceable PIN code
  const isMetro = ['11', '40', '56', '50', '60', '70'].some((prefix) => cleanPin.startsWith(prefix));
  res.status(200).json({
    serviceable: true,
    pincode: cleanPin,
    message: 'PIN code verified. Dedicated armoured vault transit available.',
    supportedCouriers: ['Sequel Secure Precious Logistics', 'BVC Logistics Armoured Vaulting'],
    insuranceCoverage: '100% Comprehensive All-Risk Transit Insurance Included',
    estimatedTransitDays: isMetro ? 2 : 4,
    estimatedDeliveryDate: new Date(Date.now() + (isMetro ? 2 : 4) * 86400000).toISOString().split('T')[0],
  });
}
