import type { PriceLockConfig } from '../data/types';

export const DEFAULT_PRICE_LOCK_CONFIG: PriceLockConfig = {
  durationSeconds: 600, // 10 minutes
  eligibleProductTypes: ['rateLinked', 'gold', 'silver'],
  expiryBehaviour: 'block_payment_force_reprice',
};

export interface LockValidationResult {
  isValid: boolean;
  isExpired: boolean;
  remainingSeconds: number;
  message?: string;
}

/**
 * Validates price lock duration configuration. Must be > 0.
 */
export function validatePriceLockConfig(config: PriceLockConfig): { valid: boolean; error?: string } {
  if (!config.durationSeconds || config.durationSeconds <= 0) {
    return {
      valid: false,
      error: 'Price lock duration must be greater than zero seconds.',
    };
  }
  return { valid: true };
}

/**
 * Checks whether a price lock is currently valid or expired.
 */
export function evaluatePriceLock(
  lockTimestampIso: string,
  durationSeconds: number = DEFAULT_PRICE_LOCK_CONFIG.durationSeconds
): LockValidationResult {
  const lockTime = new Date(lockTimestampIso).getTime();
  const now = Date.now();
  const elapsedSeconds = Math.floor((now - lockTime) / 1000);
  const remainingSeconds = Math.max(0, durationSeconds - elapsedSeconds);

  if (isNaN(lockTime) || elapsedSeconds < 0) {
    return {
      isValid: false,
      isExpired: true,
      remainingSeconds: 0,
      message: 'Invalid price lock timestamp.',
    };
  }

  if (remainingSeconds <= 0) {
    return {
      isValid: false,
      isExpired: true,
      remainingSeconds: 0,
      message: 'Spot price lock has expired. Re-pricing and renewed customer confirmation are required.',
    };
  }

  return {
    isValid: true,
    isExpired: false,
    remainingSeconds,
  };
}

/**
 * Guard that strictly blocks checkout payment if a price lock has expired.
 */
export function canProceedToPaymentWithLock(
  lockTimestampIso: string | undefined,
  durationSeconds: number = DEFAULT_PRICE_LOCK_CONFIG.durationSeconds
): { allowed: boolean; blockingReason?: string } {
  if (!lockTimestampIso) {
    return {
      allowed: false,
      blockingReason: 'No active spot price lock found. You must lock current spot rates before checkout.',
    };
  }

  const result = evaluatePriceLock(lockTimestampIso, durationSeconds);
  if (result.isExpired) {
    return {
      allowed: false,
      blockingReason: 'Price lock expired. Market spot rate has shifted. Please refresh quote and reconfirm price before payment.',
    };
  }

  return { allowed: true };
}
