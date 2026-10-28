import { describe, it, expect } from 'vitest';
import { evaluateOrderKyc, isValidPan } from './kyc';
import {
  validatePriceLockConfig,
  evaluatePriceLock,
  canProceedToPaymentWithLock,
  DEFAULT_PRICE_LOCK_CONFIG,
} from './priceLock';
import { handlePaymentWebhook, verifyWebhookSignature } from './webhook';
import { evaluateCoupon } from './couponEngine';
import type { Offer } from '../data/types';
import { useAppStore } from '../store';
import {
  isMaskedRole,
  canRevealPII,
  maskPan,
  maskPhone,
  maskTextPII,
  maskDataPayload,
  formatRevealAuditEntry,
} from './masking';

describe('Phase 1: Statutory KYC, Price Lock, and Webhook Idempotency Rules', () => {
  describe('KYC & PAN Statutory Compliance Rule', () => {
    it('validates standard Indian PAN format correctly', () => {
      expect(isValidPan('ABCDE1234F')).toBe(true);
      expect(isValidPan('AAAPA1234K')).toBe(true);
      expect(isValidPan('abcde1234f')).toBe(true); // case-insensitive trimmed
      expect(isValidPan('INVALID12')).toBe(false);
      expect(isValidPan('1234567890')).toBe(false);
      expect(isValidPan('')).toBe(false);
      expect(isValidPan(undefined)).toBe(false);
    });

    it('requires PAN & Verified status when order total strictly exceeds ₹2,00,000 threshold', () => {
      // Order <= 2,00,000 does not require KYC
      const lowResult = evaluateOrderKyc(150000);
      expect(lowResult.required).toBe(false);
      expect(lowResult.compliant).toBe(true);

      // Order = 2,00,000 (boundary condition)
      const exactResult = evaluateOrderKyc(200000);
      expect(exactResult.required).toBe(false);
      expect(exactResult.compliant).toBe(true);

      // Order > 2,00,000 without PAN triggers hold
      const noPanResult = evaluateOrderKyc(250000, undefined, 'Pending');
      expect(noPanResult.required).toBe(true);
      expect(noPanResult.compliant).toBe(false);
      expect(noPanResult.holdReason).toContain('Missing or invalid PAN');

      // Order > 2,00,000 with invalid PAN triggers hold
      const badPanResult = evaluateOrderKyc(250000, 'BADPAN', 'Pending');
      expect(badPanResult.required).toBe(true);
      expect(badPanResult.compliant).toBe(false);
      expect(badPanResult.holdReason).toContain('Missing or invalid PAN');

      // Order > 2,00,000 with valid PAN but unverified status triggers hold
      const unverifiedResult = evaluateOrderKyc(250000, 'ABCDE1234F', 'Pending');
      expect(unverifiedResult.required).toBe(true);
      expect(unverifiedResult.compliant).toBe(false);
      expect(unverifiedResult.holdReason).toContain('Investor KYC verification pending');

      // Order > 2,00,000 with valid PAN and verified KYC passes cleanly
      const verifiedResult = evaluateOrderKyc(250000, 'ABCDE1234F', 'Verified');
      expect(verifiedResult.required).toBe(true);
      expect(verifiedResult.compliant).toBe(true);
      expect(verifiedResult.holdReason).toBeUndefined();

      // Order > 2,00,000 with Exempt status passes
      const exemptResult = evaluateOrderKyc(350000, 'ABCDE1234F', 'Exempt');
      expect(exemptResult.required).toBe(true);
      expect(exemptResult.compliant).toBe(true);
    });
  });

  describe('Bullion Price Lock Duration & Expiry Rule', () => {
    it('validates price lock duration must be strictly greater than 0', () => {
      expect(validatePriceLockConfig({ durationSeconds: 600, eligibleProductTypes: ['gold'], expiryBehaviour: 'block_payment_force_reprice' }).valid).toBe(true);
      expect(validatePriceLockConfig({ durationSeconds: 0, eligibleProductTypes: ['gold'], expiryBehaviour: 'block_payment_force_reprice' }).valid).toBe(false);
      expect(validatePriceLockConfig({ durationSeconds: -10, eligibleProductTypes: ['gold'], expiryBehaviour: 'block_payment_force_reprice' }).valid).toBe(false);
    });

    it('correctly evaluates active vs expired price locks', () => {
      const now = Date.now();
      const freshLockIso = new Date(now - 30 * 1000).toISOString(); // 30 seconds ago
      const activeEval = evaluatePriceLock(freshLockIso, 600);
      expect(activeEval.isValid).toBe(true);
      expect(activeEval.isExpired).toBe(false);
      expect(activeEval.remainingSeconds).toBeGreaterThan(500);

      const expiredLockIso = new Date(now - 700 * 1000).toISOString(); // 700s ago (lock is 600s)
      const expiredEval = evaluatePriceLock(expiredLockIso, 600);
      expect(expiredEval.isValid).toBe(false);
      expect(expiredEval.isExpired).toBe(true);
      expect(expiredEval.remainingSeconds).toBe(0);
      expect(expiredEval.message).toContain('Spot price lock has expired');
    });

    it('strictly blocks checkout payment if price lock is missing or expired', () => {
      // Missing lock
      const missingCheck = canProceedToPaymentWithLock(undefined);
      expect(missingCheck.allowed).toBe(false);
      expect(missingCheck.blockingReason).toContain('No active spot price lock found');

      // Fresh lock allows payment
      const freshIso = new Date(Date.now() - 60 * 1000).toISOString();
      const freshCheck = canProceedToPaymentWithLock(freshIso, DEFAULT_PRICE_LOCK_CONFIG.durationSeconds);
      expect(freshCheck.allowed).toBe(true);

      // Expired lock blocks payment
      const oldIso = new Date(Date.now() - 1200 * 1000).toISOString();
      const oldCheck = canProceedToPaymentWithLock(oldIso, DEFAULT_PRICE_LOCK_CONFIG.durationSeconds);
      expect(oldCheck.allowed).toBe(false);
      expect(oldCheck.blockingReason).toContain('Price lock expired');
    });
  });

  describe('Payment Webhook Idempotency & Reconciliation', () => {
    it('verifies valid HMAC signature headers', () => {
      expect(verifyWebhookSignature({
        eventId: 'evt_001',
        orderId: 'ORD-001',
        transactionId: 'TXN-001',
        amount: 50000,
        status: 'PAYMENT_SUCCESS',
        signature: 'sha256_mock_valid_signature_123',
        timestamp: new Date().toISOString(),
      })).toBe(true);

      expect(verifyWebhookSignature({
        eventId: 'evt_002',
        orderId: 'ORD-002',
        transactionId: 'TXN-002',
        amount: 50000,
        status: 'PAYMENT_SUCCESS',
        signature: 'invalid_sig',
        timestamp: new Date().toISOString(),
      })).toBe(false);
    });

    it('processes a new webhook event and rejects replay attacks idempotently', () => {
      const processedEventIds = new Set<string>(['evt_historical_001']);

      const newPayload = {
        eventId: 'evt_new_002',
        orderId: 'ORD-2026-001',
        transactionId: 'TXN-RAZORPAY-992',
        amount: 140000,
        status: 'PAYMENT_SUCCESS' as const,
        signature: 'sha256_valid_payload_sig',
        timestamp: new Date().toISOString(),
      };

      // 1st delivery: verified and updates order
      const firstResult = handlePaymentWebhook(newPayload, processedEventIds, 140000);
      expect(firstResult.status).toBe('Verified');
      expect(firstResult.orderUpdated).toBe(true);
      expect(firstResult.isDuplicate).toBe(false);

      // Add to processed event set
      processedEventIds.add('evt_new_002');

      // 2nd delivery (duplicate/replay): Idempotency guard blocks mutation
      const duplicateResult = handlePaymentWebhook(newPayload, processedEventIds, 140000);
      expect(duplicateResult.status).toBe('Duplicate_Ignored');
      expect(duplicateResult.orderUpdated).toBe(false);
      expect(duplicateResult.isDuplicate).toBe(true);
      expect(duplicateResult.message).toContain('Idempotency gate');
    });

    it('rejects webhooks with amount discrepancy', () => {
      const payload = {
        eventId: 'evt_tampered_003',
        orderId: 'ORD-2026-002',
        transactionId: 'TXN-RAZORPAY-993',
        amount: 50000, // Expected was 140000
        status: 'PAYMENT_SUCCESS' as const,
        signature: 'sha256_valid_payload_sig',
        timestamp: new Date().toISOString(),
      };

      const result = handlePaymentWebhook(payload, new Set(), 140000);
      expect(result.status).toBe('Amount_Mismatch');
      expect(result.orderUpdated).toBe(false);
      expect(result.message).toContain('Amount mismatch detected');
    });
  });

  describe('Bullion Margin Guardrail on Promotions', () => {
    const activeOffer: Offer = {
      id: 'OFF-TEST',
      code: 'GOLDTEST',
      name: 'Test Bullion Offer',
      categoryOrSku: 'gold',
      discountValue: 10, // 10%
      type: 'percent',
      minOrderValue: 50000,
      startDate: '2026-01-01',
      endDate: '2026-12-31',
      approvalStatus: 'Active',
      usageLimitTotal: 100,
      usageLimitPerCustomer: 1,
      usedCount: 0,
      combinable: false,
      marginGuardrailPercent: 0.005, // Max 0.5% discount on bullion
    };

    it('enforces margin guardrail protection preventing deep bullion erosion', () => {
      // Cart with 100% pure bullion
      const result = evaluateCoupon(
        activeOffer,
        100000,
        [{ category: 'gold', isRateLinked: true, subtotal: 100000 }],
        0,
        '2026-06-01'
      );

      // 10% discount on ₹1,00,000 bullion is ₹10,000, but margin guardrail allows only 0.5% (₹500)
      // Pure bullion without non-bullion buffer is rejected or strictly capped
      expect(result.isValid).toBe(false);
      expect(result.reason).toContain('Margin guardrail protection');
    });

    it('rejects expired or unapproved coupon codes', () => {
      const draftOffer: Offer = { ...activeOffer, approvalStatus: 'Draft' };
      const draftResult = evaluateCoupon(draftOffer, 60000, [], 0, '2026-06-01');
      expect(draftResult.isValid).toBe(false);
      expect(draftResult.reason).toContain('not active');

      const expiredOffer: Offer = { ...activeOffer, endDate: '2025-12-31' };
      const expiredResult = evaluateCoupon(expiredOffer, 60000, [], 0, '2026-06-01');
      expect(expiredResult.isValid).toBe(false);
      expect(expiredResult.reason).toContain('expired');
    });
  });

  describe('Maker-Checker Dual Approval Guardrail', () => {
    it('strictly forbids the initiator/requester from approving their own request in store', () => {
      const store = useAppStore.getState();
      store.setAdminUserStatus('Active');

      // 1. Create a request where Vikram Sharma is requester
      const req = store.createApprovalRequest({
        type: 'price_override',
        title: 'Rate Override 24K Gold',
        entityId: 'gold24k',
        requester: 'Vikram Sharma',
        amount: 13200,
        reason: 'MCX Morning Spike Alignment',
      });

      // 2. Requester tries to self-approve -> MUST fail
      const selfApproveResult = useAppStore.getState().approveApprovalRequest(req.id, 'Vikram Sharma');
      expect(selfApproveResult.success).toBe(false);
      expect(selfApproveResult.error).toContain('Maker-Checker Violation: Initiator');

      // 3. Different checker approves -> MUST succeed
      const checkerApproveResult = useAppStore.getState().approveApprovalRequest(req.id, 'Deepak Verma');
      expect(checkerApproveResult.success).toBe(true);

      const approvedReq = useAppStore.getState().approvals.find((a) => a.id === req.id);
      expect(approvedReq?.status).toBe('Approved');
      expect(approvedReq?.approver).toBe('Deepak Verma');
    });

    it('routes stock adjustments exceeding Rs 1,00,000 into pending approval queue and does NOT mutate stock until approved', () => {
      const store = useAppStore.getState();
      store.setAdminUserStatus('Active');

      // Find an active product with stock
      const product = store.products.find((p) => p.stock > 5) || store.products[0];
      const initialStock = product.stock;
      const unitCost = 55000; // Rs 55,000 per unit
      const delta = -3; // 3 units write-off => Rs 1,65,000 > Rs 1,00,000 threshold
      const totalDeltaValue = Math.abs(delta) * unitCost;

      expect(totalDeltaValue).toBeGreaterThan(100000);

      // 1. Initiate high-value stock adjustment via dual-custody queue
      const req = store.createApprovalRequest({
        type: 'stock_adjustment',
        title: `High-Value Stock Adjustment: ${delta} units of ${product.name}`,
        entityId: product.id,
        requester: 'Warehouse Manager',
        amount: totalDeltaValue,
        reason: 'Quarantine seal defect write-off exceeding ₹1,00,000 threshold',
        beforeState: {
          productId: product.id,
          stock: initialStock,
          adjType: 'onHand',
          unitCost,
        },
        afterState: {
          productId: product.id,
          adjustmentType: 'onHand',
          delta,
          reason: 'Quarantine write-off',
          unitCost,
        },
        approvalLimit: 100000,
      });

      // Stock must NOT have changed yet
      const unchangedProduct = useAppStore.getState().products.find((p) => p.id === product.id);
      expect(unchangedProduct?.stock).toBe(initialStock);

      // Self-approval must be blocked
      const selfResult = useAppStore.getState().approveApprovalRequest(req.id, 'Warehouse Manager');
      expect(selfResult.success).toBe(false);
      expect(selfResult.error).toContain('Maker-Checker Violation');

      // Independent admin approves
      const approvalResult = useAppStore.getState().approveApprovalRequest(req.id, 'Independent Vault Auditor');
      expect(approvalResult.success).toBe(true);

      // Now stock must have updated
      const updatedProduct = useAppStore.getState().products.find((p) => p.id === product.id);
      expect(updatedProduct?.stock).toBe(initialStock + delta);

      // Audit log must have been created
      const auditEntry = useAppStore.getState().auditLogs.find(
        (l) => l.action === 'APPROVAL_APPROVED' && l.module.includes('stock_adjustment')
      );
      expect(auditEntry).toBeDefined();
    });

    it('blocks inactive administrators from approving dual-custody requests', () => {
      const store = useAppStore.getState();

      const req = store.createApprovalRequest({
        type: 'compliance_edit',
        title: 'Checklist Sign-off for Hallmarking SOP',
        entityId: 'comp-01',
        requester: 'Compliance Clerk',
        reason: 'Annual audit pass',
      });

      // Mark admin account as Inactive
      store.setAdminUserStatus('Inactive');

      const inactiveResult = useAppStore.getState().approveApprovalRequest(req.id, 'Anjali Mehta');
      expect(inactiveResult.success).toBe(false);
      expect(inactiveResult.error).toContain('Inactive administrator accounts are blocked');

      // Restore Active status
      store.setAdminUserStatus('Active');
      const activeResult = useAppStore.getState().approveApprovalRequest(req.id, 'Anjali Mehta');
      expect(activeResult.success).toBe(true);
    });

    it('gates low-margin corporate quotes until dual-custody approval is granted', () => {
      const store = useAppStore.getState();
      store.setAdminUserStatus('Active');

      // quo-corp-03 is 7.5% margin (below 10% floor) with isMarginApproved: false
      const unapprovedQuote = store.corporateQuotes.find((q) => !q.isMarginApproved) || {
        ...store.corporateQuotes[0],
        id: 'test-low-margin-quote',
        quoteNumber: 'QUO-TEST-001',
        isMarginApproved: false,
        marginPercent: 0.08,
      };

      // Client attempts to accept unapproved low-margin quote -> MUST fail
      const acceptFail = useAppStore.getState().acceptCorporateQuote(unapprovedQuote.id);
      expect(acceptFail.success).toBe(false);
      expect(acceptFail.message).toContain('Dual-Custody Gate');

      // Create and approve low-margin quote request
      const req = store.createApprovalRequest({
        type: 'low_margin_quote',
        title: `Low Margin Approval for ${unapprovedQuote.quoteNumber}`,
        entityId: unapprovedQuote.id,
        requester: 'Sales Executive',
        amount: unapprovedQuote.total,
        reason: 'Strategic enterprise bulk deal',
      });

      const approveRes = useAppStore.getState().approveApprovalRequest(req.id, 'Finance Director');
      expect(approveRes.success).toBe(true);

      // Quote should now be margin approved in store
      const approvedQuote = useAppStore.getState().corporateQuotes.find((q) => q.id === unapprovedQuote.id);
      expect(approvedQuote?.isMarginApproved).toBe(true);

      // Client can now accept
      const acceptSuccess = useAppStore.getState().acceptCorporateQuote(unapprovedQuote.id);
      expect(acceptSuccess.success).toBe(true);
    });
  });

  describe('Role-Based Customer PII Masking & Privileged Reveal System', () => {
    it('correctly classifies privileged vs masked roles', () => {
      // Masked roles: Support, Warehouse, Auditor
      expect(isMaskedRole('Support')).toBe(true);
      expect(isMaskedRole('Warehouse')).toBe(true);
      expect(isMaskedRole('Auditor')).toBe(true);
      expect(isMaskedRole('Pricing')).toBe(true);
      expect(isMaskedRole('Catalogue')).toBe(true);

      // Privileged roles: Super Admin, Finance
      expect(isMaskedRole('Super Admin')).toBe(false);
      expect(isMaskedRole('Finance')).toBe(false);

      // Reveal permissions strictly limited to Super Admin and Finance
      expect(canRevealPII('Super Admin')).toBe(true);
      expect(canRevealPII('Finance')).toBe(true);
      expect(canRevealPII('Support')).toBe(false);
      expect(canRevealPII('Warehouse')).toBe(false);
      expect(canRevealPII('Auditor')).toBe(false);
    });

    it('masks Customer PAN showing only the last 4 characters for Support, Warehouse, and Auditor', () => {
      const samplePan = 'ABCDE1234F';

      // Support, Warehouse, Auditor only see last 4 characters in XXXXXX234F style
      expect(maskPan(samplePan, 'Support')).toBe('XXXXXX234F');
      expect(maskPan(samplePan, 'Warehouse')).toBe('XXXXXX234F');
      expect(maskPan(samplePan, 'Auditor')).toBe('XXXXXX234F');

      // Super Admin and Finance see full PAN
      expect(maskPan(samplePan, 'Super Admin')).toBe('ABCDE1234F');
      expect(maskPan(samplePan, 'Finance')).toBe('ABCDE1234F');

      // Support cannot reveal even if isRevealed is passed as true
      expect(maskPan(samplePan, 'Support', true)).toBe('XXXXXX234F');
      expect(maskPan(samplePan, 'Warehouse', true)).toBe('XXXXXX234F');
      expect(maskPan(samplePan, 'Auditor', true)).toBe('XXXXXX234F');

      // Super Admin and Finance can see masked when explicitly toggled to false
      expect(maskPan(samplePan, 'Super Admin', false)).toBe('XXXXXX234F');
      expect(maskPan(samplePan, 'Finance', false)).toBe('XXXXXX234F');

      // Empty / missing inputs
      expect(maskPan('', 'Support')).toBe('—');
      expect(maskPan(undefined, 'Support')).toBe('—');
      expect(maskPan(null, 'Super Admin')).toBe('—');
    });

    it('masks Customer Phone showing only the last 3 digits for Support, Warehouse, and Auditor', () => {
      const phoneWithCountry = '+91 98200 11223';
      const cleanPhone10 = '9820011223';

      // Support, Warehouse, Auditor only see last 3 digits in +91 XXXXXXX123 style
      expect(maskPhone(phoneWithCountry, 'Support')).toBe('+91 XXXXXXX223');
      expect(maskPhone(phoneWithCountry, 'Warehouse')).toBe('+91 XXXXXXX223');
      expect(maskPhone(phoneWithCountry, 'Auditor')).toBe('+91 XXXXXXX223');

      // Super Admin and Finance see full values
      expect(maskPhone(phoneWithCountry, 'Super Admin')).toBe('+91 98200 11223');
      expect(maskPhone(phoneWithCountry, 'Finance')).toBe('+91 98200 11223');

      // Non-country code format
      expect(maskPhone(cleanPhone10, 'Support')).toBe('XXXXXXX223');
      expect(maskPhone(cleanPhone10, 'Super Admin')).toBe('9820011223');

      // Support cannot reveal even if isRevealed is passed as true
      expect(maskPhone(phoneWithCountry, 'Support', true)).toBe('+91 XXXXXXX223');

      // Super Admin and Finance can see masked when explicitly toggled to false
      expect(maskPhone(phoneWithCountry, 'Super Admin', false)).toBe('+91 XXXXXXX223');

      // Empty / missing inputs
      expect(maskPhone('', 'Support')).toBe('—');
      expect(maskPhone(undefined, 'Super Admin')).toBe('—');
    });

    it('creates immutable audit entry with actor, customer, field, and timestamp upon reveal', () => {
      const entry = formatRevealAuditEntry('Vikram Sharma', 'Aarav Mehta', 'PAN');
      expect(entry.actor).toBe('Vikram Sharma');
      expect(entry.action).toBe('PII_REVEALED');
      expect(entry.module).toBe('Data Privacy & Protection');
      expect(entry.before).toBe('Masked PAN');
      expect(entry.after).toContain('Revealed PAN for customer Aarav Mehta');
      expect(entry.timestamp).toBeDefined();
      expect(new Date(entry.timestamp).getTime()).not.toBeNaN();
    });

    it('deeply masks customer PII across payload structures and free-text strings', () => {
      const samplePayload = {
        orderId: 'ORD-2026-001',
        customerPhone: '+91 98200 11223',
        customerPan: 'ABCDE1234F',
        meta: {
          phone: '+91 98200 11223',
          nestedPan: 'AAAPA1234K',
        },
      };

      const maskedForSupport = maskDataPayload(samplePayload, 'Support');
      expect(maskedForSupport.customerPhone).toBe('+91 XXXXXXX223');
      expect(maskedForSupport.customerPan).toBe('XXXXXX234F');
      expect(maskedForSupport.meta.phone).toBe('+91 XXXXXXX223');
      expect(maskedForSupport.meta.nestedPan).toBe('XXXXXX234K');

      // Full values preserved for Super Admin
      const unmaskedForAdmin = maskDataPayload(samplePayload, 'Super Admin');
      expect(unmaskedForAdmin.customerPhone).toBe('+91 98200 11223');
      expect(unmaskedForAdmin.customerPan).toBe('ABCDE1234F');

      // Free-text string containing PAN or phone
      const text = 'Customer PAN is ABCDE1234F and phone is +91 98200 11223';
      const maskedText = maskTextPII(text, 'Auditor');
      expect(maskedText).toContain('XXXXXX234F');
      expect(maskedText).toContain('+91 XXXXXXX223');
    });
  });
});
