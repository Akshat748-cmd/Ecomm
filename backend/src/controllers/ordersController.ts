import type { Request, Response } from 'express';
import { db } from '../database/database';
import { config } from '../config';
import type { OrderStatus, OrderItem } from '../types';

export async function createOrder(req: Request, res: Response): Promise<void> {
  const {
    customerName,
    customerEmail,
    customerPhone,
    shippingAddress,
    items,
    paymentMethod,
    panNumber,
  } = req.body;

  if (!customerName || !customerEmail || !customerPhone || !shippingAddress || !items || !items.length) {
    res.status(400).json({ error: 'ValidationError', message: 'Missing required customer, shipping, or item details' });
    return;
  }

  // 1. Validate items and compute totals authoritatively on server
  const { rates } = await db.getRates();
  let calculatedSubtotal = 0;
  let calculatedGst = 0;
  const verifiedItems: OrderItem[] = [];

  for (const item of items) {
    const product = await db.getProductById(item.productId);
    if (!product) {
      res.status(404).json({ error: 'NotFound', message: `Product ${item.productId} not found in catalog` });
      return;
    }

    const availableStock = product.stock - product.reserved;
    if (availableStock < item.quantity) {
      res.status(409).json({
        error: 'StockUnavailableError',
        message: `Insufficient stock for ${product.name}. Available: ${availableStock}, Requested: ${item.quantity}`,
      });
      return;
    }

    const spotRate = product.category === 'silver' ? rates.silver999 : rates.gold24k;
    let unitPrice = 0;
    if (product.type === 'rateLinked') {
      const fineWeight = product.netWeightG * product.purity;
      const metalVal = Math.round(fineWeight * spotRate);
      const making = Math.round(metalVal * (product.makingPercent || 0.08));
      const packaging = product.packagingCost || 250;
      const insurance = product.insuranceCost || 450;
      unitPrice = metalVal + making + packaging + insurance;
    } else {
      unitPrice = product.fixedPrice || product.mrp;
    }

    const lineTotal = unitPrice * item.quantity;
    const lineGst = Math.round(lineTotal * 0.03);

    calculatedSubtotal += lineTotal;
    calculatedGst += lineGst;

    verifiedItems.push({
      productId: product.id,
      sku: product.sku,
      name: product.name,
      category: product.category,
      quantity: item.quantity,
      unitPrice,
      totalPrice: lineTotal + lineGst,
      ratePerGramSnapshot: spotRate,
      gstAmount: lineGst,
      personalization: item.personalization,
    });
  }

  const grandTotal = calculatedSubtotal + calculatedGst;

  // 2. Statutory PMLA PAN Threshold Check
  if (grandTotal >= config.pmlaPanThresholdInr) {
    if (!panNumber || !/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(panNumber.toUpperCase())) {
      res.status(422).json({
        error: 'ComplianceValidationError',
        message: `Statutory PMLA 2002 Requirement: High-value bullion orders exceeding ₹${config.pmlaPanThresholdInr.toLocaleString('en-IN')} mandate a valid 10-character Permanent Account Number (PAN).`,
        requiredField: 'panNumber',
        threshold: config.pmlaPanThresholdInr,
        orderTotal: grandTotal,
      });
      return;
    }
  }

  // 3. Create Order
  try {
    const order = await db.createOrder({
      customerName,
      customerEmail,
      customerPhone,
      shippingAddress,
      items: verifiedItems,
      subtotal: calculatedSubtotal,
      gstTotal: calculatedGst,
      totalAmount: grandTotal,
      panNumber: panNumber ? panNumber.toUpperCase() : undefined,
      paymentStatus: 'Pending',
      paymentMethod: paymentMethod || 'UPI / NetBanking',
      status: 'Placed',
      erpInvoiceAttached: false,
    });

    res.status(201).json({
      message: 'Order created and registered with vault custody.',
      order,
    });
  } catch (err: any) {
    res.status(500).json({ error: 'OrderCreationError', message: err.message });
  }
}

export async function getOrder(req: Request, res: Response): Promise<void> {
  const id = req.params.id as string;
  const order = await db.getOrderById(id);
  if (!order) {
    res.status(404).json({ error: 'NotFound', message: `Order '${id}' not found` });
    return;
  }
  res.json({ order });
}

export async function listOrders(_req: Request, res: Response): Promise<void> {
  const orders = await db.getOrders();
  res.json({ orders, total: orders.length });
}

export async function updateOrderStatus(req: Request, res: Response): Promise<void> {
  const id = req.params.id as string;
  const { status, note } = req.body;

  if (!status) {
    res.status(400).json({ error: 'ValidationError', message: 'status is required' });
    return;
  }

  const actor = req.user ? req.user.name : 'Vault Operator';

  try {
    const updated = await db.updateOrderStatus(id, status as OrderStatus, actor, note);
    res.json({ message: `Order status advanced to ${status}`, order: updated });
  } catch (err: any) {
    // Catch Invoice-Gated Dispatch lockout
    res.status(422).json({ error: 'DispatchGatedError', message: err.message });
  }
}

export async function attachInvoice(req: Request, res: Response): Promise<void> {
  const id = req.params.id as string;
  const { invoiceNumber, invoiceUrl } = req.body;

  if (!invoiceNumber) {
    res.status(400).json({ error: 'ValidationError', message: 'invoiceNumber is required' });
    return;
  }

  const actor = req.user ? req.user.name : 'Finance Officer';
  const updated = await db.attachErpInvoice(id, invoiceNumber, invoiceUrl || 'https://internal.erp/invoices/latest.pdf', actor);

  res.json({
    message: 'ERP Tax Invoice linked successfully. Dispatch is now legally unblocked.',
    order: updated,
  });
}
