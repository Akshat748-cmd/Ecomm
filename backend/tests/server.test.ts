import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { createApp } from '../src/app';
import { db } from '../src/database/database';
import { config, validateProductionConfig } from '../src/config';

describe('Precious Commerce Platform — Backend Foundation & Production Business Rules', () => {
  let app: any;
  let adminToken: string;

  beforeEach(() => {
    app = createApp();
    adminToken = jwt.sign(
      {
        id: 'usr-1',
        email: 'vikram.sharma@preciouscommerce.internal',
        name: 'Vikram Sharma',
        role: 'Super Admin',
      },
      config.jwtSecret,
      { expiresIn: '1h' }
    );
  });

  // 1. HEALTH CHECK & PUBLIC ROUTES
  describe('Public API & Health', () => {
    it('returns healthy status from /health', async () => {
      const res = await request(app).get('/health');
      expect(res.status).toBe(200);
      expect(res.body.status).toBe('ok');
    });

    it('returns live spot rates and pricing config from /api/rates', async () => {
      const res = await request(app).get('/api/rates');
      expect(res.status).toBe(200);
      expect(res.body.rates).toHaveProperty('gold24k');
      expect(res.body.rates).toHaveProperty('silver999');
      expect(res.body.pricingConfig.formulaVersion).toBeDefined();
    });

    it('lists catalog products with category filtering', async () => {
      const res = await request(app).get('/api/products?category=gold');
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.products)).toBe(true);
      expect(res.body.products.length).toBeGreaterThan(0);
      res.body.products.forEach((p: any) => {
        expect(p.category).toBe('gold');
      });
    });

    it('returns verified certificate details for valid certificate number', async () => {
      const res = await request(app).get('/api/certificates/B24-999-5481');
      expect(res.status).toBe(200);
      expect(res.body.verified).toBe(true);
      expect(res.body.certificate.issuer).toContain('BIS Hallmark');
    });
  });

  // 2. PINCODE LOGISTICS & ARMOURED TRANSIT SERVICEABILITY
  describe('Armoured Logistics PIN Code Serviceability', () => {
    it('blocks transit and informs user when PIN starts with 9', async () => {
      const res = await request(app)
        .post('/api/logistics/pincode-check')
        .send({ pincode: '992001' });

      expect(res.status).toBe(200);
      expect(res.body.serviceable).toBe(false);
      expect(res.body.message).toContain('not serviceable for armoured transit');
    });

    it('confirms armoured serviceability for valid metro PIN code', async () => {
      const res = await request(app)
        .post('/api/logistics/pincode-check')
        .send({ pincode: '400001' });

      expect(res.status).toBe(200);
      expect(res.body.serviceable).toBe(true);
      expect(res.body.supportedCouriers).toContain('Sequel Secure Precious Logistics');
    });
  });

  // 3. 10-MINUTE QUOTE LOCK & ATOMIC STOCK RESERVATION
  describe('10-Minute Quote Lock & Stock Reservation', () => {
    it('creates a 10-minute rate lock and atomically increments reserved stock', async () => {
      const products = await db.getProducts({ category: 'gold' });
      const targetProduct = products[0];
      const initialReserved = targetProduct.reserved;

      const res = await request(app)
        .post('/api/quotes/lock')
        .send({ productId: targetProduct.id, quantity: 2 });

      expect(res.status).toBe(201);
      expect(res.body.quote).toBeDefined();
      expect(res.body.quote.status).toBe('Active');

      // Check 10-minute expiry window
      const createdAt = new Date(res.body.quote.createdAt).getTime();
      const expiresAt = new Date(res.body.quote.expiresAt).getTime();
      expect(expiresAt - createdAt).toBe(10 * 60 * 1000);

      // Verify stock reservation incremented
      const updatedProduct = await db.getProductById(targetProduct.id);
      expect(updatedProduct?.reserved).toBe(initialReserved + 2);
    });

    it('rejects quote lock when requested quantity exceeds available stock', async () => {
      const products = await db.getProducts();
      const target = products[0];

      const res = await request(app)
        .post('/api/quotes/lock')
        .send({ productId: target.id, quantity: 999999 });

      expect(res.status).toBe(409);
      expect(res.body.error).toBe('StockConflictError');
    });
  });

  // 4. SERVER-AUTHORITATIVE ORDER CREATION & PMLA PAN THRESHOLD
  describe('Server Order Pricing & Statutory PMLA PAN Threshold', () => {
    it('enforces PMLA PAN requirement when order grand total >= ₹200,000', async () => {
      // 100g or multiple bullion coins will exceed 2 Lakhs
      const goldProduct = (await db.getProducts({ category: 'gold' }))[0];

      const res = await request(app)
        .post('/api/orders')
        .send({
          customerName: 'Aditya Birla Group',
          customerEmail: 'aditya@example.com',
          customerPhone: '+91 98200 99887',
          shippingAddress: {
            name: 'Aditya Birla',
            street: 'Nariman Point Tower',
            city: 'Mumbai',
            state: 'Maharashtra',
            pincode: '400021',
            country: 'India',
          },
          items: [{ productId: goldProduct.id, quantity: 5 }], // 5 * ~1.3L = >6.5 Lakhs
          paymentMethod: 'RTGS / Wire',
          // panNumber intentionally omitted!
        });

      expect(res.status).toBe(422);
      expect(res.body.error).toBe('ComplianceValidationError');
      expect(res.body.message).toContain('Statutory PMLA 2002 Requirement');
      expect(res.body.requiredField).toBe('panNumber');
    });

    it('creates order when valid PAN is supplied for >= ₹200,000', async () => {
      const goldProduct = (await db.getProducts({ category: 'gold' }))[0];

      const res = await request(app)
        .post('/api/orders')
        .send({
          customerName: 'Aditya Birla Group',
          customerEmail: 'aditya@example.com',
          customerPhone: '+91 98200 99887',
          shippingAddress: {
            name: 'Aditya Birla',
            street: 'Nariman Point Tower',
            city: 'Mumbai',
            state: 'Maharashtra',
            pincode: '400021',
            country: 'India',
          },
          items: [{ productId: goldProduct.id, quantity: 2 }],
          paymentMethod: 'RTGS / Wire',
          panNumber: 'ABCDE1234F',
        });

      expect(res.status).toBe(201);
      expect(res.body.order).toBeDefined();
      expect(res.body.order.orderNumber).toMatch(/^ORD-2026-/);
      expect(res.body.order.panNumber).toBe('ABCDE1234F');
      expect(res.body.order.status).toBe('Placed');
    });
  });

  // 5. INVOICE-GATED DISPATCH ENFORCEMENT
  describe('Strict Invoice-Gated Dispatch Lockout', () => {
    it('blocks dispatch when ERP tax invoice is NOT attached', async () => {
      const orders = await db.getOrders();
      const unissuedOrder = orders.find((o) => !o.erpInvoiceAttached) || orders[0];

      // Ensure ERP invoice not attached
      unissuedOrder.erpInvoiceAttached = false;

      const res = await request(app)
        .patch(`/api/admin/orders/${unissuedOrder.id}/status`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ status: 'Dispatched', note: 'Attempting dispatch without invoice' });

      expect(res.status).toBe(422);
      expect(res.body.error).toBe('DispatchGatedError');
      expect(res.body.message).toContain('Invoice-Gated Dispatch Violation');
    });

    it('unblocks dispatch once ERP invoice is linked', async () => {
      const orders = await db.getOrders();
      const targetOrder = orders[0];

      // Attach invoice
      const invoiceRes = await request(app)
        .post(`/api/admin/orders/${targetOrder.id}/invoice`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ invoiceNumber: 'INV-2026-GST-9921', invoiceUrl: 'https://erp.internal/inv.pdf' });

      expect(invoiceRes.status).toBe(200);
      expect(invoiceRes.body.order.erpInvoiceAttached).toBe(true);

      // Now dispatch
      const dispatchRes = await request(app)
        .patch(`/api/admin/orders/${targetOrder.id}/status`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ status: 'Dispatched', note: 'Handed to Sequel Armoured Transit' });

      expect(dispatchRes.status).toBe(200);
      expect(dispatchRes.body.order.status).toBe('Dispatched');
    });
  });

  // 6. PAYMENT WEBHOOK IDEMPOTENCY & HMAC VERIFICATION
  describe('Payment Webhook Idempotency & HMAC Verification', () => {
    it('processes initial payment webhook and confirms order payment', async () => {
      const orders = await db.getOrders();
      const targetOrder = orders.find((o) => o.paymentStatus === 'Pending') || orders[0];
      const idempotencyKey = `IDEMP-TEST-${Date.now()}`;

      const payload = {
        event: 'payment.captured',
        transactionId: 'PAY-HDFC-992144',
        payload: {
          orderId: targetOrder.id,
          amount: targetOrder.totalAmount,
        },
      };

      const signature = crypto
        .createHmac('sha256', config.paymentWebhookSecret)
        .update(JSON.stringify(payload))
        .digest('hex');

      const res = await request(app)
        .post('/api/payments/webhook')
        .set('x-razorpay-signature', signature)
        .set('x-idempotency-key', idempotencyKey)
        .send(payload);

      expect(res.status).toBe(200);
      expect(res.body.status).toBe('processed');

      const updated = await db.getOrderById(targetOrder.id);
      expect(updated?.paymentStatus).toBe('Success');
      expect(updated?.status).toBe('Payment confirmed');
    });

    it('safely handles duplicate webhook without double status progression or error', async () => {
      const idempotencyKey = `DUPLICATE-IDEMP-${Date.now()}`;
      const payload = { event: 'payment.captured', transactionId: 'TXN-DUP-1' };

      const signature = crypto
        .createHmac('sha256', config.paymentWebhookSecret)
        .update(JSON.stringify(payload))
        .digest('hex');

      // First call
      await request(app)
        .post('/api/payments/webhook')
        .set('x-razorpay-signature', signature)
        .set('x-idempotency-key', idempotencyKey)
        .send(payload);

      // Second call (replay)
      const res = await request(app)
        .post('/api/payments/webhook')
        .set('x-razorpay-signature', signature)
        .set('x-idempotency-key', idempotencyKey)
        .send(payload);

      expect(res.status).toBe(200);
      expect(res.body.status).toBe('duplicate');
      expect(res.body.message).toContain('Duplicate webhook detected');
    });
  });

  // 7. MAKER-CHECKER SEGREGATION (DUAL AUTHORIZATION)
  describe('Maker-Checker Segregation Enforcement', () => {
    it('prevents the initiator from approving their own spot rate override', async () => {
      // 1. Initiator proposes override
      const proposeRes = await request(app)
        .post('/api/admin/rates/propose')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          gold24k: 13500,
          silver999: 200,
          justification: 'Severe global bullion arbitrage spread adjustment',
        });

      expect(proposeRes.status).toBe(202);
      const requestId = proposeRes.body.request.id;
      const initiatorName = proposeRes.body.request.initiator;

      // 2. Initiator attempts self-approval -> MUST BE REJECTED!
      await expect(
        db.resolveMakerCheckerRequest(requestId, initiatorName, 'Approved')
      ).rejects.toThrow('Maker-Checker Violation: Initiator cannot approve their own proposal.');
    });

    it('allows a secondary authorized officer to approve the rate override', async () => {
      const proposeRes = await request(app)
        .post('/api/admin/rates/propose')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          gold24k: 13250,
          silver999: 195,
          justification: 'MCX London gold fix gap',
        });

      const requestId = proposeRes.body.request.id;

      // Secondary officer (Ananya Deshmukh - Pricing Role) signs token and approves
      const secondaryOfficerToken = jwt.sign(
        {
          id: 'usr-2',
          email: 'ananya.deshmukh@preciouscommerce.internal',
          name: 'Ananya Deshmukh',
          role: 'Pricing',
        },
        config.jwtSecret,
        { expiresIn: '1h' }
      );

      const resolveRes = await request(app)
        .post(`/api/admin/rates/resolve/${requestId}`)
        .set('Authorization', `Bearer ${secondaryOfficerToken}`)
        .send({
          decision: 'Approved',
          password: 'VaultPass@2026',
        });

      expect(resolveRes.status).toBe(200);
      expect(resolveRes.body.item.status).toBe('Approved');
      expect(resolveRes.body.updatedRates.gold24k).toBe(13250);
    });
  });

  // 8. CORPORATE GIFTING WORKFLOW
  describe('Corporate Gifting End-to-End Workflow', () => {
    it('accepts corporate enquiry, generates custom quote, approves proof, and batch imports recipients', async () => {
      // 1. Submit enquiry
      const enqRes = await request(app)
        .post('/api/corporate/enquiries')
        .send({
          companyName: 'Infosys Limited',
          contactName: 'Priya Narayanan',
          email: 'priya.n@infosys.com',
          phone: '+91 99001 22334',
          gstin: '29AAACI1234A1Z1',
          occasion: 'Silver Jubilee Corporate Milestone Mementos',
          budgetPerRecipient: 25000,
          recipientCount: 50,
          productPreferences: 'Custom 20g 999 Silver Coin with 24K Gold Plated Emblem',
          deliverySchedule: '2026-11-15',
        });

      expect(enqRes.status).toBe(201);
      const enqId = enqRes.body.enquiry.id;
      expect(enqRes.body.enquiry.status).toBe('Received');

      // 2. Admin generates institutional quote
      const quoteRes = await request(app)
        .post(`/api/admin/corporate/enquiries/${enqId}/quote`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          unitPrice: 22000,
          customizationFee: 1200,
          packagingFee: 800,
          paymentTerms: '50% advance, balance upon dispatch',
        });

      expect(quoteRes.status).toBe(200);
      expect(quoteRes.body.enquiry.status).toBe('Quote Issued');
      expect(quoteRes.body.enquiry.quoteData.grandTotal).toBeGreaterThan(0);

      // 3. Client approves quote
      const approveRes = await request(app)
        .post(`/api/admin/corporate/enquiries/${enqId}/approve`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ approvedByClient: 'Priya Narayanan', remarks: 'Branding emblem proof approved' });

      expect(approveRes.status).toBe(200);
      expect(approveRes.body.enquiry.status).toBe('Approved');

      // 4. Batch import recipient addresses for split dispatch
      const recipientsRes = await request(app)
        .post(`/api/admin/corporate/enquiries/${enqId}/recipients`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          recipients: [
            { name: 'Kiran Rao', street: 'Electronic City Phase 1', city: 'Bengaluru', pincode: '560100' },
            { name: 'Suresh Menon', street: 'Bandra Kurla Complex', city: 'Mumbai', pincode: '400051' },
          ],
        });

      expect(recipientsRes.status).toBe(200);
      expect(recipientsRes.body.count).toBe(2);
      expect(recipientsRes.body.enquiry.status).toBe('Fulfillment');
    });
  });

  // 9. BACKEND SECURITY HARDENING (ITEMS 1 - 7)
  describe('Backend Security Hardening Verification', () => {
    // Item 1: MFA Temp Token & authenticateJwt Hardening
    it('Item 1: requires tempToken stage mfa_pending with matching email and rejects pre-MFA tokens in authenticateJwt', async () => {
      // Pre-MFA token with stage field rejected by authenticateJwt
      const preMfaToken = jwt.sign(
        { id: 'usr-1', email: 'vikram.sharma@preciouscommerce.internal', name: 'Vikram', role: 'Super Admin', stage: 'mfa_pending' },
        config.jwtSecret,
        { expiresIn: '5m' }
      );
      const authRes = await request(app)
        .get('/api/admin/auth/profile')
        .set('Authorization', `Bearer ${preMfaToken}`);
      expect(authRes.status).toBe(401);
      expect(authRes.body.message).toContain('Pre-MFA token cannot be used');

      // verifyMfa rejects when tempToken has mismatched email
      const mismatchedToken = jwt.sign(
        { email: 'other.officer@preciouscommerce.internal', stage: 'mfa_pending' },
        config.jwtSecret,
        { expiresIn: '5m' }
      );
      const mfaMismatched = await request(app)
        .post('/api/admin/auth/mfa')
        .send({
          email: 'vikram.sharma@preciouscommerce.internal',
          code: '748291',
          tempToken: mismatchedToken,
        });
      expect(mfaMismatched.status).toBe(401);
      expect(mfaMismatched.body.message).toContain('matching email');

      // verifyMfa rejects when tempToken is missing stage mfa_pending
      const invalidStageToken = jwt.sign(
        { email: 'vikram.sharma@preciouscommerce.internal', stage: 'invalid_stage' },
        config.jwtSecret,
        { expiresIn: '5m' }
      );
      const mfaInvalidStage = await request(app)
        .post('/api/admin/auth/mfa')
        .send({
          email: 'vikram.sharma@preciouscommerce.internal',
          code: '748291',
          tempToken: invalidStageToken,
        });
      expect(mfaInvalidStage.status).toBe(401);
    });

    // Item 2: Real TOTP / Configured Demo Code Check
    it('Item 2: enforces real TOTP/configured demo code and rejects arbitrary 6-digit codes', async () => {
      const validTempToken = jwt.sign(
        { email: 'vikram.sharma@preciouscommerce.internal', stage: 'mfa_pending' },
        config.jwtSecret,
        { expiresIn: '5m' }
      );

      // Random 6 digits must fail
      const randomCodeRes = await request(app)
        .post('/api/admin/auth/mfa')
        .send({
          email: 'vikram.sharma@preciouscommerce.internal',
          code: '123456',
          tempToken: validTempToken,
        });
      expect(randomCodeRes.status).toBe(401);
      expect(randomCodeRes.body.message).toContain('Invalid TOTP code');

      // Configured demo code (748291) succeeds
      const validCodeRes = await request(app)
        .post('/api/admin/auth/mfa')
        .send({
          email: 'vikram.sharma@preciouscommerce.internal',
          code: config.mfaDemoCode,
          tempToken: validTempToken,
        });
      expect(validCodeRes.status).toBe(200);
      expect(validCodeRes.body.token).toBeDefined();
    });

    // Item 3: requireRole on Data-Changing Admin Routes & Read-Only Auditor
    it('Item 3: enforces requireRole on data-changing routes and ensures Auditor is read-only', async () => {
      const auditorToken = jwt.sign(
        {
          id: 'usr-4',
          email: 'sunita.rao@preciouscommerce.internal',
          name: 'Sunita Rao',
          role: 'Auditor',
        },
        config.jwtSecret,
        { expiresIn: '1h' }
      );

      // 1. Auditor can view compliance checklist (read-only allowed)
      const viewRes = await request(app)
        .get('/api/admin/compliance')
        .set('Authorization', `Bearer ${auditorToken}`);
      expect(viewRes.status).toBe(200);

      // 2. Auditor CANNOT toggle compliance (data modification forbidden)
      const checklist = await db.getComplianceChecklist();
      const patchCompliance = await request(app)
        .patch(`/api/admin/compliance/${checklist[0].id}`)
        .set('Authorization', `Bearer ${auditorToken}`)
        .send({ isCompliant: true });
      expect(patchCompliance.status).toBe(403);
      expect(patchCompliance.body.error).toBe('Forbidden');

      // 3. Auditor CANNOT update order status
      const orders = await db.getOrders();
      const patchOrder = await request(app)
        .patch(`/api/admin/orders/${orders[0].id}/status`)
        .set('Authorization', `Bearer ${auditorToken}`)
        .send({ status: 'Processing' });
      expect(patchOrder.status).toBe(403);

      // 4. Auditor CANNOT attach invoice
      const invoiceRes = await request(app)
        .post(`/api/admin/orders/${orders[0].id}/invoice`)
        .set('Authorization', `Bearer ${auditorToken}`)
        .send({ invoiceNumber: 'INV-AUDIT-TEST' });
      expect(invoiceRes.status).toBe(403);
    });

    // Item 4: Login Rate Limiting & Account Lockout
    it('Item 4: enforces account lockout after 5 failed login attempts and applies login rate limiting', async () => {
      const targetEmail = 'ananya.deshmukh@preciouscommerce.internal';
      db.unlockUser(targetEmail);

      // Fail 4 times (returns 401)
      for (let i = 0; i < 4; i++) {
        const res = await request(app)
          .post('/api/admin/auth/login')
          .send({ email: targetEmail, password: 'WrongPassword!' });
        expect(res.status).toBe(401);
      }

      // 5th failed attempt triggers account lockout (returns 423)
      const fifthRes = await request(app)
        .post('/api/admin/auth/login')
        .send({ email: targetEmail, password: 'WrongPassword!' });
      expect(fifthRes.status).toBe(423);
      expect(fifthRes.body.error).toBe('AccountLocked');

      // Subsequent attempt even with correct password is locked
      const sixthRes = await request(app)
        .post('/api/admin/auth/login')
        .send({ email: targetEmail, password: 'VaultPass@2026' });
      expect(sixthRes.status).toBe(423);
      expect(sixthRes.body.error).toBe('AccountLocked');

      // Unlock user for other tests
      db.unlockUser(targetEmail);
    });

    // Item 5: Webhook Signature Mandatory & Production Secret Check
    it('Item 5: mandates webhook signature (rejects unsigned) and refuses startup in production if secret is placeholder', async () => {
      // 1. Unsigned webhook request is rejected with 401
      const unsignedRes = await request(app)
        .post('/api/payments/webhook')
        .send({ event: 'payment.captured' });
      expect(unsignedRes.status).toBe(401);
      expect(unsignedRes.body.message).toContain('Webhook signature is mandatory');

      // 2. Invalid signature is rejected with 401
      const invalidSigRes = await request(app)
        .post('/api/payments/webhook')
        .set('x-razorpay-signature', 'deadbeef00112233')
        .send({ event: 'payment.captured' });
      expect(invalidSigRes.status).toBe(401);
      expect(invalidSigRes.body.error).toBe('InvalidSignature');

      // 3. Startup check refuses production with placeholder secret
      expect(() => {
        validateProductionConfig(
          {
            NODE_ENV: 'production',
            PAYMENT_WEBHOOK_SECRET: 'whsec_test_hmac_secret_placeholder',
            JWT_SECRET: 'super_secret_for_production_32_chars_min!!',
          } as any,
          {
            nodeEnv: 'production',
            paymentWebhookSecret: 'whsec_test_hmac_secret_placeholder',
            jwtSecret: 'super_secret_for_production_32_chars_min!!',
          } as any
        );
      }).toThrow(/Refusing to start in production: PAYMENT_WEBHOOK_SECRET/);
    });

    // Item 6: JWT Secret Fallback Removal & Seed Passwords from Env
    it('Item 6: refuses to start outside development if JWT_SECRET is missing, and seeds user password from env', async () => {
      // 1. Outside development, missing JWT_SECRET throws fatal error
      expect(() => {
        validateProductionConfig(
          { NODE_ENV: 'production', JWT_SECRET: '' } as any,
          { nodeEnv: 'production', jwtSecret: '' } as any
        );
      }).toThrow(/Fatal: JWT_SECRET environment variable is missing outside development/);

      // 2. Seed password matches configured env password
      const isSeedPwValid = await db.verifyPassword('vikram.sharma@preciouscommerce.internal', config.seedUserPassword);
      expect(isSeedPwValid).toBe(true);
    });

    // Item 7: Helmet Security Headers & CORS Allowlist
    it('Item 7: verifies helmet security headers and CORS allowlist enforcement', async () => {
      // 1. Helmet security headers
      const healthRes = await request(app).get('/health');
      expect(healthRes.headers['x-content-type-options']).toBe('nosniff');
      expect(healthRes.headers['x-frame-options']).toBe('SAMEORIGIN');

      // 2. Allowed CORS origin
      const allowedRes = await request(app)
        .get('/health')
        .set('Origin', 'http://localhost:5173');
      expect(allowedRes.headers['access-control-allow-origin']).toBe('http://localhost:5173');

      // 3. Blocked CORS origin
      const blockedRes = await request(app)
        .get('/health')
        .set('Origin', 'http://malicious-phishing-site.com');
      expect(blockedRes.status).toBe(403);
      expect(blockedRes.body.error).toBe('CorsForbidden');
    });
  });
});
