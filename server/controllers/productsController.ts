import type { Request, Response } from 'express';
import { db } from '../db/database';

export async function listProducts(req: Request, res: Response): Promise<void> {
  const { category, q } = req.query;
  const products = await db.getProducts({
    category: category ? String(category) : undefined,
    query: q ? String(q) : undefined,
  });
  res.json({ products, total: products.length });
}

export async function getProductBySlug(req: Request, res: Response): Promise<void> {
  const { slug } = req.params;
  const product = await db.getProductBySlug(slug);
  if (!product) {
    res.status(404).json({ error: 'NotFound', message: `Product with slug '${slug}' not found` });
    return;
  }
  res.json({ product });
}

export async function getProductById(req: Request, res: Response): Promise<void> {
  const { id } = req.params;
  const product = await db.getProductById(id);
  if (!product) {
    res.status(404).json({ error: 'NotFound', message: `Product with id '${id}' not found` });
    return;
  }
  res.json({ product });
}

export async function createProduct(req: Request, res: Response): Promise<void> {
  const data = req.body;
  if (!data.name || !data.sku || !data.category) {
    res.status(400).json({ error: 'ValidationError', message: 'name, sku, and category are required' });
    return;
  }

  const existing = await db.getProducts({ query: data.sku });
  if (existing.some((p) => p.sku.toLowerCase() === data.sku.toLowerCase())) {
    res.status(409).json({ error: 'ConflictError', message: `SKU '${data.sku}' already exists in catalog` });
    return;
  }

  const id = `prod-${Date.now()}`;
  const slug = data.slug || data.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

  const product = await db.createProduct({
    ...data,
    id,
    slug,
    stock: Number(data.stock || 0),
    reserved: 0,
    mrp: Number(data.mrp || 0),
    netWeightG: Number(data.netWeightG || 0),
    grossWeightG: Number(data.grossWeightG || data.netWeightG || 0),
    purity: Number(data.purity || 0.999),
    makingPercent: Number(data.makingPercent || 0.08),
    status: data.status || 'Active',
    attributes: data.attributes || {},
  });

  const actor = req.user ? req.user.name : 'Catalogue Officer';
  db.addAuditLog(actor, 'Catalogue', `Created product: ${product.name} (${product.sku})`, '', JSON.stringify(product));

  res.status(201).json({ product });
}

export async function updateProduct(req: Request, res: Response): Promise<void> {
  const { id } = req.params;
  const existing = await db.getProductById(id);
  if (!existing) {
    res.status(404).json({ error: 'NotFound', message: `Product '${id}' not found` });
    return;
  }

  const updated = await db.updateProduct(id, req.body);
  const actor = req.user ? req.user.name : 'Catalogue Officer';
  db.addAuditLog(actor, 'Catalogue', `Updated product: ${existing.name} (${existing.sku})`, JSON.stringify(existing), JSON.stringify(updated));

  res.json({ product: updated });
}

export async function verifyCertificate(req: Request, res: Response): Promise<void> {
  const { certNo } = req.params;
  const cert = await db.getCertificate(certNo);
  if (!cert) {
    res.status(404).json({
      verified: false,
      message: 'Certificate number not found in official BIS Hallmark or laboratory registry.',
    });
    return;
  }
  res.json({ verified: true, certificate: cert });
}
