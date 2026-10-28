export const DEFAULT_KYC_THRESHOLD_INR = 200000; // Statutory requirement: Rs 2,00,000

export interface KycCheckResult {
  required: boolean;
  compliant: boolean;
  holdReason?: string;
}

/**
 * Validates Indian PAN format (5 letters, 4 digits, 1 letter)
 */
export function isValidPan(pan?: string): boolean {
  if (!pan) return false;
  const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
  return panRegex.test(pan.trim().toUpperCase());
}

/**
 * KYC Enforcement Rule:
 * If an order total is above Rs 2,00,000 (or configured threshold),
 * PAN and verified KYC status are required before payment.
 * Missing PAN or unverified KYC causes the order to be held.
 */
export function evaluateOrderKyc(
  orderTotal: number,
  customerPan?: string,
  customerKycStatus?: 'Pending' | 'Verified' | 'Exempt' | 'Rejected',
  threshold: number = DEFAULT_KYC_THRESHOLD_INR
): KycCheckResult {
  const requiresKyc = orderTotal > threshold;

  if (!requiresKyc) {
    return {
      required: false,
      compliant: true,
    };
  }

  // Above threshold: Must provide a valid PAN and have KYC Verified or Exempt
  if (!customerPan || !isValidPan(customerPan)) {
    return {
      required: true,
      compliant: false,
      holdReason: 'Missing or invalid PAN for transaction exceeding ₹2,00,000 threshold. Statutory PMLA compliance required.',
    };
  }

  if (customerKycStatus !== 'Verified' && customerKycStatus !== 'Exempt') {
    return {
      required: true,
      compliant: false,
      holdReason: 'Investor KYC verification pending for transaction exceeding ₹2,00,000. Statutory documentation required.',
    };
  }

  return {
    required: true,
    compliant: true,
  };
}
