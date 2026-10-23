import type { Request, Response } from 'express';
import { db } from '../db/database';

export async function listInventory(_req: Request, res: Response): Promise<void> {
  const products = await db.getProducts();
  const summary = {
    totalOnHand: products.reduce((acc, p) => acc + p.stock, 0),
    totalReserved: products.reduce((acc, p) => acc + p.reserved, 0),
    totalAvailable: products.reduce((acc, p) => acc + (p.stock - p.reserved), 0),
    lowStockCount: products.filter((p) => p.stock - p.reserved <= (p.reorderThreshold || 5)).length,
  };

  res.json({ products, summary });
}

export async function stockAction(req: Request, res: Response): Promise<void> {
  const { productId, action, delta, notes } = req.body;
  if (!productId || !action || delta === undefined) {
    res.status(400).json({ error: 'ValidationError', message: 'productId, action, and delta are required' });
    return;
  }

  const actor = req.user ? req.user.name : 'Vault Operator';

  try {
    if (action === 'Reservation Release') {
      await db.releaseStock(productId, Math.abs(delta), actor);
    } else if (action === 'Receipt') {
      const product = await db.getProductById(productId);
      if (product) {
        await db.updateProduct(productId, { stock: product.stock + Math.abs(delta) });
        db.addAuditLog(actor, 'Inventory', `Goods Inward Receipt for ${product.name}: +${delta} units`, '', notes);
      }
    } else if (action === 'Adjustment') {
      const product = await db.getProductById(productId);
      if (product) {
        const newStock = Math.max(0, product.stock + delta);
        await db.updateProduct(productId, { stock: newStock });
        db.addAuditLog(actor, 'Inventory', `Stock Adjustment for ${product.name}: delta ${delta}`, String(product.stock), String(newStock));
      }
    }

    const updated = await db.getProductById(productId);
    res.json({ message: `Inventory action '${action}' applied successfully`, product: updated });
  } catch (err: any) {
    res.status(400).json({ error: 'InventoryActionError', message: err.message });
  }
}
