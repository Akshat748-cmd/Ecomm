import type { Request, Response } from 'express';
import { db } from '../db/database';

export async function lockQuote(req: Request, res: Response): Promise<void> {
  const { productId, quantity, customerId } = req.body;
  if (!productId || !quantity || quantity <= 0) {
    res.status(400).json({ error: 'ValidationError', message: 'productId and positive quantity are required' });
    return;
  }

  const { providerState } = await db.getRates();
  if (providerState === 'bothDown') {
    res.status(503).json({
      error: 'FeedUnavailableError',
      message: 'Market bullion rate feeds are currently offline. Quotes are paused until feed connectivity is restored.',
    });
    return;
  }

  try {
    const quote = await db.createQuote(productId, Number(quantity), customerId);
    res.status(201).json({
      message: 'Rate locked for 10 minutes. Stock allocated.',
      quote,
    });
  } catch (err: any) {
    res.status(409).json({ error: 'StockConflictError', message: err.message });
  }
}

export async function getQuote(req: Request, res: Response): Promise<void> {
  const { id } = req.params;
  const quote = await db.getQuote(id);
  if (!quote) {
    res.status(404).json({ error: 'NotFound', message: `Quote '${id}' not found` });
    return;
  }

  const isExpired = quote.status === 'Expired' || new Date(quote.expiresAt).getTime() <= Date.now();
  res.json({
    quote,
    isExpired,
    remainingSeconds: Math.max(0, Math.floor((new Date(quote.expiresAt).getTime() - Date.now()) / 1000)),
  });
}

export async function requote(req: Request, res: Response): Promise<void> {
  const { id } = req.params;
  const oldQuote = await db.getQuote(id);
  if (!oldQuote) {
    res.status(404).json({ error: 'NotFound', message: `Quote '${id}' not found` });
    return;
  }

  try {
    const newQuote = await db.createQuote(oldQuote.productId, oldQuote.quantity, oldQuote.customerId);
    res.status(201).json({
      message: 'Re-quoted successfully at current spot market benchmark.',
      oldQuoteId: id,
      quote: newQuote,
    });
  } catch (err: any) {
    res.status(409).json({ error: 'StockConflictError', message: err.message });
  }
}
