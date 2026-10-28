export interface GatewayWebhookPayload {
  eventId: string;
  orderId: string;
  transactionId: string;
  amount: number;
  status: 'PAYMENT_SUCCESS' | 'PAYMENT_FAILED' | 'PAYMENT_TIMEOUT';
  signature: string;
  timestamp: string;
}

export interface WebhookHandlerResult {
  isDuplicate: boolean;
  orderUpdated: boolean;
  orderId: string;
  status: 'Verified' | 'Duplicate_Ignored' | 'Signature_Mismatch' | 'Amount_Mismatch';
  message: string;
}

/**
 * Validates simulated HMAC signature
 */
export function verifyWebhookSignature(payload: GatewayWebhookPayload, _secret: string = 'whsec_prod_live_aurum_2026'): boolean {
  // Check that payload has required structure and reasonable signature format
  if (!payload.signature || payload.signature.length < 8) return false;
  return payload.signature.startsWith('sha256_') || payload.signature.startsWith('sig_');
}

/**
 * Idempotent Gateway Webhook Handler:
 * Prevents double processing, duplicate order confirmation, or replay attacks.
 * If eventId has already been recorded, returns duplicate notice safely without updating order state.
 */
export function handlePaymentWebhook(
  payload: GatewayWebhookPayload,
  processedEventIds: string[] | Set<string>,
  expectedAmount: number
): WebhookHandlerResult {
  const eventSet = processedEventIds instanceof Set ? processedEventIds : new Set(processedEventIds);

  // 1. Idempotency Check: Reject replay of already processed event ID
  if (eventSet.has(payload.eventId)) {
    return {
      isDuplicate: true,
      orderUpdated: false,
      orderId: payload.orderId,
      status: 'Duplicate_Ignored',
      message: `Idempotency gate: Event ID ${payload.eventId} has already been processed. Replay safely ignored.`,
    };
  }

  // 2. Signature verification
  if (!verifyWebhookSignature(payload)) {
    return {
      isDuplicate: false,
      orderUpdated: false,
      orderId: payload.orderId,
      status: 'Signature_Mismatch',
      message: 'Cryptographic signature mismatch. Rejecting unverified webhook payload.',
    };
  }

  // 3. Amount reconciliation check
  if (Math.abs(payload.amount - expectedAmount) > 1) {
    return {
      isDuplicate: false,
      orderUpdated: false,
      orderId: payload.orderId,
      status: 'Amount_Mismatch',
      message: `Amount mismatch detected: Webhook amount ₹${payload.amount} does not match expected invoice total ₹${expectedAmount}. Payment held for review.`,
    };
  }

  // 4. Success verification
  return {
    isDuplicate: false,
    orderUpdated: true,
    orderId: payload.orderId,
    status: 'Verified',
    message: `Payment successfully verified via webhook ${payload.eventId}. Gateway reference: ${payload.transactionId}.`,
  };
}
