import type { AdminRole } from '../data/types';

/**
 * Identifies if a role is subject to PII masking (Support, Warehouse, Auditor, Pricing, Catalogue).
 * Only Super Admin and Finance are authorized to view full customer PII.
 */
export function isMaskedRole(role: AdminRole): boolean {
  return role !== 'Super Admin' && role !== 'Finance';
}

/**
 * Checks whether the active role has permission to reveal masked customer PII.
 * Strictly limited to Super Admin and Finance.
 */
export function canRevealPII(role: AdminRole): boolean {
  return role === 'Super Admin' || role === 'Finance';
}

/**
 * Mask Customer PAN: shows only the last 4 characters (e.g. ABCDE1234F -> XXXXXX234F)
 * for roles Support, Warehouse and Auditor.
 * Super Admin and Finance see full values (or when isRevealed is true).
 * Non-privileged roles CANNOT reveal even if isRevealed is passed as true.
 */
export function maskPan(
  pan: string | undefined | null,
  role: AdminRole,
  isRevealed?: boolean
): string {
  if (!pan) return '—';
  const cleanPan = pan.trim();
  if (!cleanPan) return '—';

  // Helper to compute masked PAN (shows only the last 4 characters)
  const computeMasked = () => {
    if (cleanPan.length <= 4) {
      return 'X'.repeat(cleanPan.length);
    }
    const last4 = cleanPan.slice(-4);
    const prefixLength = cleanPan.length - 4;
    return 'X'.repeat(prefixLength) + last4;
  };

  // If role is masked, always mask regardless of isRevealed flag
  if (isMaskedRole(role)) {
    return computeMasked();
  }

  // Privileged roles (Super Admin, Finance):
  // If isRevealed is explicitly false, return masked value
  if (isRevealed === false) {
    return computeMasked();
  }

  return cleanPan;
}

/**
 * Mask Customer Phone: shows only the last 3 digits (e.g. +91 98200 11223 -> +91 XXXXXXX223)
 * for roles Support, Warehouse and Auditor.
 * Super Admin and Finance see full values (or when isRevealed is true).
 * Non-privileged roles CANNOT reveal even if isRevealed is passed as true.
 */
export function maskPhone(
  phone: string | undefined | null,
  role: AdminRole,
  isRevealed?: boolean
): string {
  if (!phone) return '—';
  const cleanPhone = phone.trim();
  if (!cleanPhone) return '—';

  // Helper to format masked phone
  const computeMasked = () => {
    const digits = cleanPhone.replace(/\D/g, '');
    if (digits.length <= 3) {
      return 'X'.repeat(digits.length);
    }
    const last3 = digits.slice(-3);
    const hasCountryCode = cleanPhone.startsWith('+91') || cleanPhone.startsWith('+');
    if (hasCountryCode) {
      return `+91 XXXXXXX${last3}`;
    }
    const prefixMask = 'X'.repeat(Math.max(0, digits.length - 3));
    return `${prefixMask}${last3}`;
  };

  // If role is masked, always mask regardless of isRevealed flag
  if (isMaskedRole(role)) {
    return computeMasked();
  }

  // Privileged roles (Super Admin, Finance):
  // If isRevealed is explicitly false, return masked value
  if (isRevealed === false) {
    return computeMasked();
  }

  return cleanPhone;
}

/**
 * Masks free-text strings that contain PAN numbers or Phone numbers for masked roles.
 */
export function maskTextPII(text: string | undefined | null, role: AdminRole): string {
  if (!text) return '';
  if (!isMaskedRole(role)) return text;

  // Mask PAN pattern: 5 uppercase letters, 4 digits, 1 uppercase letter (e.g. ABCDE1234F -> XXXXXX234F)
  let result = text.replace(/\b([A-Z]{5}[0-9]{4}[A-Z]{1})\b/g, (match) => {
    return 'X'.repeat(match.length - 4) + match.slice(-4);
  });

  // Mask Indian phone with +91 or raw 10 digits (allowing spaces/dashes):
  // e.g. +91 98200 11223, +91-98200-11223, 9820011223
  result = result.replace(/(\+91\s*)?([6-9][\d\s-]{8,12}\d)/g, (fullMatch, prefix) => {
    const digits = fullMatch.replace(/\D/g, '');
    if (digits.length >= 10 && digits.length <= 12) {
      const last3 = digits.slice(-3);
      return prefix || fullMatch.includes('+91') ? `+91 XXXXXXX${last3}` : `XXXXXXX${last3}`;
    }
    return fullMatch;
  });

  return result;
}

/**
 * Deeply masks customer PII (pan, phone) within arbitrary objects or JSON structures
 * for masked roles (Support, Warehouse, Auditor).
 */
export function maskDataPayload<T>(data: T, role: AdminRole): T {
  if (!isMaskedRole(role) || !data) return data;
  if (typeof data === 'string') {
    return maskTextPII(data, role) as unknown as T;
  }
  if (typeof data !== 'object') return data;
  if (Array.isArray(data)) {
    return data.map((item) => maskDataPayload(item, role)) as unknown as T;
  }
  const copy: Record<string, any> = { ...data };
  for (const key of Object.keys(copy)) {
    const lowerKey = key.toLowerCase();
    if (lowerKey === 'phone' || lowerKey === 'customerphone') {
      copy[key] = maskPhone(copy[key], role);
    } else if (lowerKey === 'pan' || lowerKey === 'customerpan' || lowerKey === 'pannumber') {
      copy[key] = maskPan(copy[key], role);
    } else if (typeof copy[key] === 'string') {
      copy[key] = maskTextPII(copy[key], role);
    } else if (typeof copy[key] === 'object' && copy[key] !== null) {
      copy[key] = maskDataPayload(copy[key], role);
    }
  }
  return copy as T;
}

/**
 * Creates standardized audit payload for when a privileged user reveals masked PII.
 * Writes (actor, customer, field, time).
 */
export function formatRevealAuditEntry(
  actor: string,
  customer: string,
  field: 'PAN' | 'Phone'
): {
  actor: string;
  action: string;
  module: string;
  before: string;
  after: string;
  timestamp: string;
} {
  const timestamp = new Date().toISOString();
  return {
    actor,
    action: 'PII_REVEALED',
    module: 'Data Privacy & Protection',
    before: `Masked ${field}`,
    after: `Revealed ${field} for customer ${customer} at ${timestamp}`,
    timestamp,
  };
}
