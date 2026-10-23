import type { Request, Response } from 'express';
import crypto from 'crypto';
import { db } from '../db/database';
import { config } from '../config';

export async function createPaymentSession(req: Request, res: Response): Promise<void> {
  const { orderId, amount, paymentMethod } = req.body;
  if (!orderId || !amount) {
    res.status(400).json({ error: 'ValidationError', message: 'orderId and amount are required' });
    return;
  }

  const order = await db.getOrderById(orderId);
  if (!order) {
    res.status(404).json({ error: 'NotFound', message: `Order ${orderId} not found` });
    return;
  }

  const transactionRef = `TXN-${Date.now()}-${Math.floor(Math.random() * 9000 + 1000)}`;

  res.json({
    message: 'Sandbox payment session initialized.',
    gateway: config.paymentGatewayProvider,
    keyId: config.paymentGatewayKeyId,
    orderId: order.id,
    orderNumber: order.orderNumber,
    amount: order.totalAmount,
    currency: 'INR',
    transactionRef,
    supportedMethods: ['UPI', 'NetBanking', 'Credit Card', 'RTGS / NEFT Wire'],
  });
}

export async function handlePaymentWebhook(req: Request, res: Response): Promise<void> {
  const signature = req.headers['x-razorpay-signature'] || req.headers['x-webhook-signature'];
  const idempotencyKey = (req.headers['x-idempotency-key'] as string) || req.body.idempotencyKey || req.body.event_id || `IDEMP-${req.body.transactionId || Date.now()}`;

  const { event, payload, transactionId } = req.body;

  if (!event) {
    res.status(400).json({ error: 'ValidationError', message: 'Webhook event is required' });
    return;
  }

  // HMAC verification if signature provided
  if (signature && config.paymentWebhookSecret !== 'whsec_test_hmac_secret_placeholder') {
    const expectedSignature = crypto
      .createHmac('sha256', config.paymentWebhookSecret)
      .update(JSON.stringify(req.body))
      .digest('hex');

    if (signature !== expectedSignature) {
      res.status(401).json({ error: 'InvalidSignature', message: 'HMAC webhook signature mismatch' });
      return;
    }
  }

  const txnId = transactionId || payload?.payment?.id || `BANK-${Date.now()}`;
  const gateway = config.paymentGatewayProvider;

  const result = await db.processPaymentWebhook(idempotencyKey, gateway, txnId, event, payload || req.body);

  if (result.status === 'duplicate') {
    res.status(200).json({
      message: 'Duplicate webhook detected. Ignored safely under idempotency protection.',
      idempotencyKey,
      status: 'duplicate',
    });
    return;
  }

  res.status(200).json({
    message: 'Webhook processed successfully. Order payment status confirmed.',
    idempotencyKey,
    status: 'processed',
    transactionId: txnId,
  });
}
